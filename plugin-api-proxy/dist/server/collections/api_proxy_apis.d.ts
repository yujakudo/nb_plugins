/**
 * APIプロキシの、各APIの設定のコレクション
 * @todo 誤動作防止のために、デフォルト値を設置する。
 *
 * ここの設定を変更した場合は、以下のファイルも修正が必要です。
 * src/client/collections.ts
 * src/client/schema.ts
 */
declare const _default: import("../../../../../../core/database/lib").CollectionOptions;
export default _default;
export interface ApiProxyRecord {
    id: number;
    name: string;
    url: string;
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
    reserveCount?: number;
}
