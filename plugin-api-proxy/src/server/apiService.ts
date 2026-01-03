import { Context } from 'koa';
import { ApiProxyRecord } from './collections/api_proxy_apis';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * APIの設定値
 */
export interface ApiSettings {
  status: number;       // ステータス（200, 404, 510など）
  message: string;      // エラーメッセージ
  baseUrl: string;      // APIの基準URL
  requestConfig: any;   // axios のリクエスト設定
  repoData: ApiProxyRecord | null;        // レポジトリのデータ。
  action?: string;      // アクション (get, list)
  filter?: any;         // フィルタ
}

/**
 * API設定を取得する
 * @param ctx {Context} Koa context (NocoBase拡張)
 * @param apiName {string} リクエストされたAPI名
 */
async function getApiSettings_old(ctx: Context, apiName: string,): Promise<ApiSettings> {
  const db = ctx.db; // nocobase の db インスタンス
  const repo = db.getRepository('api_proxy_apis');

  // 初期値は404エラー
  var res: ApiSettings = {
    status: 404,
    message: `"${apiName}" is not found.`,
    baseUrl: '',
    requestConfig: {},
    repoData: null
  };

  // DBからAPI定義を検索
  const record = await repo.findOne({ filter: { name: apiName } });
  if (!record) {
    return res; // 見つからなかった場合は404のまま返す
  }

  // API定義を反映
  res.repoData = (typeof record.toJSON === 'function') ? record.toJSON() : record;
  res.baseUrl = res.repoData.url;
  res.status = 200;
  res.message = 'ok';

  return res;
}

/**
 * API設定を取得する
 * @param ctx {Context} Koa context (NocoBase拡張)
 * @param apiName {string} リクエストされたAPI名
 */
export async function getApiSettings(ctx: Context, apiName: string,): Promise<ApiSettings> {
  const db = ctx.db; // nocobase の db インスタンス
  const repo = db.getRepository('api_proxy_apis');

  // 初期値は404エラー
  var res: ApiSettings = {
    status: 404,
    message: `"${apiName}" is not found.`,
    baseUrl: '',
    requestConfig: {},
    repoData: null
  };

  try {
    res.repoData = await getRepositoryData(ctx, apiName);
    res.baseUrl = res.repoData.url;
    res.status = 200;
    res.message = 'ok';
  } catch (error) {
    res.status = (typeof error.cause === 'number') ? error.cause : 500;
    res.message = error.message || 'internal error';
  }

  return res;
}

/**
 * コレクションからデータを取得する
 * @param ctx 
 * @param apiName 
 * @returns {ApiProxyRecord} コレクションのAPIデータ
 */
export async function getRepositoryData(ctx: Context, apiName: string): Promise<ApiProxyRecord> {
  const db = ctx.db; // nocobase の db インスタンス
  const repo = db.getRepository('api_proxy_apis');

  // 1. まずはロックなしで検索
  // Note: トランザクション外で読む
  const record = await repo.findOne({
    filter: { name: apiName },
  });

  if (!record) {
    throw new Error(`API "${apiName}" is not found.`, { cause: 404 });
  }

  const data: ApiProxyRecord = (typeof record.toJSON === 'function') ? record.toJSON() : record;

  // 2. 利用制限がない場合は、最終アクセス日時のみ更新して終了
  if (data.limit === 'none') {
    // 統計のために最終アクセス時刻は更新する
    // ロックは不要だが、書き込み負荷は発生する
    await repo.update({
      filter: { id: data.id },
      values: {
        lastAccessAt: new Date(),
      }
    });
    return data;
  }

  // 3. 利用制限がある場合のみ、トランザクション＆ロックで再取得して更新
  return await db.sequelize.transaction(async (t) => {
    // DBからAPI定義をロックして再検索
    const lockedRecord = await repo.findOne({
      filter: { name: apiName },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!lockedRecord) {
      throw new Error(`API "${apiName}" is not found.`, { cause: 404 });
    }

    const lockedData: ApiProxyRecord = (typeof lockedRecord.toJSON === 'function') ? lockedRecord.toJSON() : lockedRecord;

    lockedData.lastAccessAt = new Date();   // 現在時刻の取得

    // 利用制限チェック
    checkRequestLimit(lockedData);

    // レコードを更新
    await repo.update({
      filter: { id: lockedData.id },
      values: {
        currentAccessCount: lockedData.currentAccessCount,
        lastAccessAt: lockedData.lastAccessAt,
        nextResetAt: lockedData.nextResetAt,
        reserveCount: lockedData.reserveCount,
      },
      transaction: t,
    });

    return lockedData;
  });
}

/**
 * リクエスト回数制限をチェックし、カウンタ等を更新する。
 * @param data {ApiProxyRecord} 取得したレコードのデータ
 */
export function checkRequestLimit(data: ApiProxyRecord): void {
  const now = new Date();
  // 環境変数からリセット遅延時間を取得（デフォルト30秒）
  const envDelay = parseInt(process.env.API_PROXY_RESET_DELAY || '30', 10);
  const resetDelay = (isNaN(envDelay) ? 30 : envDelay) * 1000;

  // 次回リセット時刻が未設定か、次回リセット時刻(遅延込み)を過ぎていたらカウントリセット
  // 安全係数(resetDelay)を加味し、相手のリセット時刻より確実に後にリセットを実行する
  const effectiveResetTime = data.nextResetAt ? new Date(data.nextResetAt.getTime() + resetDelay) : null;

  if (!effectiveResetTime || effectiveResetTime <= now) {
    resetRequestCount(data);
  }

  // カウンタが制限に達していたら例外を投げる
  if (data.currentAccessCount >= data.maxRequests) {
    throw new Error('Request limit has been reached', { cause: 429 });
  }

  // カウンタ更新
  data.currentAccessCount++;


  // --- 二重計上（先行消費）ロジック ---
  // 次回リセット時刻の resetDelay 秒前から、リセット時刻までの間のアクセスは、
  // 「次回分」としてもカウントしておく（reserveCountを加算）
  if (data.nextResetAt && resetDelay > 0) {
    const dangerZoneStart = new Date(data.nextResetAt.getTime() - resetDelay);
    if (now >= dangerZoneStart) {
      data.reserveCount = (data.reserveCount || 0) + 1;
    }
  }
}

/**
 * リクエストカウンタをリセットし、次回リセット時刻を設定する
 * @param data {ApiProxyRecord} 取得したレコードのデータ
 */
function resetRequestCount(data: ApiProxyRecord): void {
  // 繰越分があればそこからスタート、なければ0
  data.currentAccessCount = data.reserveCount || 0;
  data.reserveCount = 0;

  // タイムゾーン設定。デフォルトはUTC
  const tz = data.timezone || 'UTC';
  const now = dayjs(data.lastAccessAt ?? new Date()).tz(tz);

  let next = now.clone(); // カウントリセット指定日の初期値

  // カウントリセット指定時刻
  // Note: time型はUTCで保存されている前提で、そのまま時間・分を使用する
  // もし "10:00" と入力されたら、タイムゾーン側の "10:00" とみなす必要があるが
  // 現状のNocobaseのTimePickerはUTC文字列を返すため、
  // ここでは「入力された時刻」＝「指定タイムゾーンでの時刻」と解釈するように設定する。

  // NocobaseのTime fieldは "HH:mm:ss" 形式の文字列ではなく、Dateオブジェクト(あるいはISO文字列)として扱われる場合が多いが、
  // UIスキーマで 'time' type を使っている場合、文字列 "HH:mm:ss" が返ってくることもある。
  // ここでは data.limitStartTime が Dateオブジェクト(UTC) であると仮定し、その UTCの時・分 を使う。

  // しかし、ユーザーが "JST 09:00" を意図して入力した場合、DBにはどう保存されているか？
  // NocobaseのTimePickerは通常 UTC相当の日付の時刻部分を持つ。
  // ここでは「指定された時・分」を「指定タイムゾーン」に適用する。

  let h = 0;
  let m = 0;
  if (data.limitStartTime) {
    const d = new Date(data.limitStartTime);
    h = d.getUTCHours();
    m = d.getUTCMinutes();
  }

  switch (data.limit) {
    case 'daily': {
      // 指定タイムゾーンでの今日の指定時刻
      next = now.hour(h).minute(m).second(0).millisecond(0);
      if (next.isBefore(now) || next.isSame(now)) {
        next = next.add(1, 'day');
      }
      break;
    }

    case 'weekly': {
      // 指定タイムゾーンでの時刻設定
      next = now.hour(h).minute(m).second(0).millisecond(0);

      // 今週の指定曜日に移動
      // dayjs: 0=Sunday, 6=Saturday
      const targetDay = data.limitStartWeekday ?? 0;
      next = next.day(targetDay);

      if (next.isBefore(now) || next.isSame(now)) {
        // 過去なら来週
        next = next.add(1, 'week');
      }
      break;
    }

    case 'monthly': {
      // 今月の指定日
      const targetDay = data.limitStartDay ?? 1;
      const safeDay = clampDay(now, targetDay);
      next = now.date(safeDay).hour(h).minute(m).second(0).millisecond(0);

      if (!next.isAfter(now)) {
        const nextMonth = now.add(1, 'month');
        const safeNextDay = clampDay(nextMonth, targetDay);
        next = nextMonth.date(safeNextDay).hour(h).minute(m).second(0).millisecond(0);
      }
      break;
    }

    case 'yearly': {
      const month = (data.limitStartMonth ?? 1) - 1; // 0-based
      const day = data.limitStartDay ?? 1;

      const base = now.month(month);
      const safeDay = clampDay(base, day);
      next = base.date(safeDay).hour(h).minute(m).second(0).millisecond(0);

      if (!next.isAfter(now)) {
        const nextYear = now.add(1, 'year').month(month);
        const safeNextDay = clampDay(nextYear, day);
        next = nextYear.date(safeNextDay).hour(h).minute(m).second(0).millisecond(0);
      }
      break;
    }

    default:
      data.nextResetAt = null;
      return;
  }

  data.nextResetAt = next.toDate();
}

/**
 * 指定された日付の月の最終日を考慮して、日付を制限する。
 * @param d {dayjs.Dayjs} 日付オブジェクト
 * @param day {number} 日
 * @returns {number} 制限後の日
 */
function clampDay(d: dayjs.Dayjs, day: number) {
  const lastDay = d.endOf('month').date();
  return Math.min(day, lastDay);
}
