import { defineCollection } from '@nocobase/database';

/**
 * APIプロキシの、各APIの設定のコレクション
 * @todo 誤動作防止のために、デフォルト値を設置する。
 * 
 * ここの設定を変更した場合は、以下のファイルも修正が必要です。
 * src/client/collections.ts
 * src/client/schema.ts
 */
export default defineCollection({
  name: 'api_proxy_apis',
  fields: [
    // 名前。「{{proxyPath}}/{{name}}」のようなパスになる
    { type: 'string', name: 'name', allowNull: false },
    // APIのURL
    { type: 'string', name: 'url', allowNull: false },
    // HTTPメソッド
    { type: 'string', name: 'method', defaultValue: 'GET' },
    // APIの説明
    { type: 'text', name: 'description' },
    // APIの利用制限。なし、日次、週次、月次、年次より選択
    {
      type: 'json',
      name: 'headers',
    },
    // APIの利用制限。なし、日次、週次、月次、年次より選択
    {
      type: 'string',
      name: 'limit',
      allowNull: false,
      defaultValue: 'none', // none, daily, weekly, monthly, yearly
    },
    // APIの利用制限回数
    { type: 'integer', name: 'maxRequests', defaultValue: 0 },
    // 利用制限のカウント開始時刻
    { type: 'integer', name: 'limitStartWeekday', defaultValue: 0 }, // 週次
    { type: 'integer', name: 'limitStartMonth', defaultValue: 0 },   // 年次
    { type: 'integer', name: 'limitStartDay', defaultValue: 1 },     // 月次/年次
    { type: 'time', name: 'limitStartTime' },       // 共通
    // 現在の利用回数
    { type: 'integer', name: 'currentAccessCount', defaultValue: 0 },
    // 最終アクセス時刻
    { type: 'date', name: 'lastAccessAt' },
    // 次のカウントリセット時刻
    { type: 'date', name: 'nextResetAt' },
    // タイムゾーン
    { type: 'string', name: 'timezone', defaultValue: 'UTC' },
    // プリセット
    { type: 'string', name: 'preset' },
    // マッピングモード
    {
      type: 'string',
      name: 'mappingMode',
      allowNull: false,
      defaultValue: 'json', // json, csv, text
    },
    // マッピングの有効化
    { type: 'boolean', name: 'mappingEnabled', defaultValue: false },
    // リストか単一データか
    { type: 'boolean', name: 'isList', defaultValue: false },
    // JSONのリスト要素パス
    { type: 'string', name: 'listPath' },
    // CSVの一列目が列名か
    { type: 'boolean', name: 'csvHasHeader', defaultValue: true },
    // リクエストマッピング
    { type: 'text', name: 'requestMapping' },
    // レスポンスマッピング
    { type: 'json', name: 'responseMapping' },
    // テストパラメータ
    { type: 'text', name: 'testParams' },
    // 期待されるレスポンス
    { type: 'text', name: 'expectedResponse' },
    // 次回繰越用カウンタ（内部用）
    { type: 'integer', name: 'reserveCount', defaultValue: 0 },
  ],
});

// インタフェイス
export interface ApiProxyRecord {
  id: number;
  name: string;
  url: string;
  method: string;
  headers?: any;
  description?: string;
  limit: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  maxRequests: number;
  limitStartWeekday?: number;
  limitStartMonth?: number;
  limitStartDay?: number;
  limitStartTime?: Date;
  currentAccessCount: number;
  lastAccessAt?: Date;
  nextResetAt?: Date;
  timezone?: string;
  preset?: string;
  mappingEnabled: boolean;
  mappingMode: 'none' | 'json' | 'csv' | 'text';
  isList: boolean;
  listPath?: string;
  csvHasHeader: boolean;
  requestMapping?: any;
  responseMapping?: any;
  testParams?: string;
  expectedResponse?: string;
  reserveCount?: number;
};
