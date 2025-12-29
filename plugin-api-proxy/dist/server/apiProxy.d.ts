import { Context } from 'koa';
/**
 * APIプロキシの実装
 * @param ctx {Context} コンテキスト
 * @param basePath {string} プロキシ指定のためのパスの先頭部（例：/api/proxy/）
 */
export declare function apiProxy(ctx: Context, basePath: string): Promise<void>;
