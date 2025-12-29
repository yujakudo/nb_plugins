import { Context } from 'koa';
import { ApiProxyRecord } from './collections/api_proxy_apis';
/**
 * APIの設定値
 */
export interface ApiSettings {
    status: number;
    message: string;
    baseUrl: string;
    requestConfig: any;
    repoData: ApiProxyRecord | null;
}
/**
 * API設定を取得する
 * @param ctx {Context} Koa context (NocoBase拡張)
 * @param apiName {string} リクエストされたAPI名
 */
export declare function getApiSettings(ctx: Context, apiName: string): Promise<ApiSettings>;
/**
 * コレクションからデータを取得する
 * @param ctx
 * @param apiName
 * @returns {ApiProxyRecord} コレクションのAPIデータ
 */
export declare function getRepositoryData(ctx: Context, apiName: string): Promise<ApiProxyRecord>;
/**
 * リクエスト回数制限をチェックし、カウンタ等を更新する。
 * @param data {ApiProxyRecord} 取得したレコードのデータ
 */
export declare function checkRequestLimit(data: ApiProxyRecord): void;
