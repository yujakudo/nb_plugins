import axios from 'axios';
import { isString } from 'lodash';
import { Context } from 'koa'; // KoaのContext型をインポート
import { getApiSettings, ApiSettings } from './apiService';
import { ApiMapper } from './apiMapper';

// テストログ保持用キャッシュ (トークン -> ログデータ)
export const testLogCache = new Map<string, any>();

// TTL (5分) で自動削除する仕組み（簡易版）
const setWithTtl = (token: string, data: any) => {
    testLogCache.set(token, data);
    setTimeout(() => {
        testLogCache.delete(token);
    }, 5 * 60 * 1000);
};

/**
 * APIプロキシの実装
 * @param ctx {Context} コンテキスト
 * @param basePath {string} プロキシ指定のためのパスの先頭部（例：/api/proxy/）
 */
export async function apiProxy(ctx: Context, basePath: string) {
    // APIの名前よりAPIの情報を取得
    const api: ApiSettings = await getApi(ctx, basePath);
    if (200 != api.status) {
        // 200 成功でなかったら、エラーを返す
        buildErrorResponse(ctx, api.status, api.message);
        return;
    }

    const testToken = ctx.get('X-Api-Proxy-Test');
    const isTestMode = !!testToken;
    const testLog: any = isTestMode ? {
        apiRequestMappingResult: null,
        apiRawResponse: null,
    } : null;

    console.log(`[ProxyApiPlugin] Proxying ${ctx.method} request to: ${api.requestConfig.url}${isTestMode ? ' (TEST MODE)' : ''}`);

    try {
        // リクエストマッピングの適用
        if (api.repoData.mappingEnabled) {
            ApiMapper.applyRequestMapping(api);
            if (isTestMode) {
                testLog.apiRequestMappingResult = api.requestConfig.data || api.requestConfig.params;
            }
        }

        // axiosでリクエスト
        const response = await axios.request(api.requestConfig);

        if (isTestMode) {
            testLog.apiRawResponse = response.data;
        }

        // レスポンスマッピングの適用
        if (api.repoData.mappingEnabled) {
            response.data = await ApiMapper.applyResponseMapping(response.data, api);
        }

        if (isTestMode) {
            setWithTtl(testToken, testLog);
        }

        buildResponse(ctx, response);

    } catch (error) {
        console.error('[ProxyApiPlugin] Proxy Error:', error.message);
        if (axios.isAxiosError(error) && error.response) {
            if (isTestMode) {
                testLog.apiRawResponse = error.response.data;
                setWithTtl(testToken, testLog);
            }
            buildErrorResponse(ctx, error.response.status, error.response.data);
        } else {
            buildErrorResponse(ctx, 500, 'Internal Server Error during proxy request.');
        }
    }
}

/**
 * レスポンスより、クライアントへのレスポンスを作成する
 * @param ctx {Context} コンテキスト
 * @param response {AxiosResponse} レスポンス
 */
function buildResponse(ctx: Context, response: any): void {
    // 外部APIからのレスポンスをクライアントに返す
    ctx.status = response.status;
    ctx.body = response.data;

    // 外部APIのヘッダーを一部転送
    for (const header in response.headers) {
        if (!['content-encoding', 'transfer-encoding', 'connection'].includes(header.toLowerCase())) {
            const headerValue = response.headers[header];
            if (isString(headerValue)) {
                ctx.set(header, headerValue);
            } else if (Array.isArray(headerValue)) {
                headerValue.forEach(val => ctx.append(header, val));
            }
        }
    }
}

/**
 * エラーのときの、クライアントへのレスポンスを作成する
 * @param ctx {Context} コンテキスト
 * @param status {number} ステータスコード。404, 500, 510等。
 * @param response {AxiosResponse} レスポンス
 */
function buildErrorResponse(ctx: Context, status: number, msg: string | any): void {
    ctx.status = status;
    if (typeof msg === "string") {
        ctx.body = { message: msg };
    } else {
        ctx.body = msg;
    }
}

/**
 * APIのURL等リクエストパラメータの取得
 * @param ctx {Context} コンテキスト
 * @param basePath {string} プロキシ指定のためのパスの先頭部（例：/api/proxy/）
 * @returns 
 */
function getApi(ctx: Context, basePath: string): Promise<ApiSettings> {
    const request = ctx.request;
    const urls = new URL(request.href);
    const proxyPath = urls.pathname.replace(basePath + '/', '');
    const pathParts = proxyPath.split('/');
    const apiNames = pathParts.shift() || '';
    const apiNameParts = apiNames.split(':');
    const apiName = apiNameParts.shift() || '';
    const apiAction = apiNameParts.shift() || '';
    // const extPath = pathParts.join('/');

    return getApiSettings(ctx, apiName).then((res) => {
        if (res.status !== 200) {
            return res;
        }

        res.requestConfig.method = request.method;
        // URL作成
        // res.requestConfig.url = res.baseUrl + (extPath ? '/' + extPath : '');
        res.requestConfig.url = res.baseUrl;
        res.requestConfig.params = Object.fromEntries(urls.searchParams.entries());

        // ヘッダコピー
        res.requestConfig.headers = {};
        for (const header of ['Content-Type', 'Accept', 'Authorization']) {
            const headerKey = header.toLowerCase();
            if (headerKey in request.headers) {
                res.requestConfig.headers[header] = request.headers[headerKey];
            }
        }
        // レポジトリのヘッダをコピー
        if (res.repoData.headers) {
            Object.assign(res.requestConfig.headers, res.repoData.headers);
        }
        // リクエストボディコピー
        if (['POST', 'PUT', 'PATCH', 'PUSH'].includes(request.method) && request.body) {
            res.requestConfig.data = request.body;
        }

        // マッピング用オプション
        res.action = apiAction || (ctx.query.action as string) || 'list';
        res.filter = ctx.query.filter ? ((typeof ctx.query.filter === 'string') ? JSON.parse(ctx.query.filter) : ctx.query.filter) : undefined;

        return res;
    });
}
