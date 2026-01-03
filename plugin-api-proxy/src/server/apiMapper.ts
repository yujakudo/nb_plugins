import { ApiProxyRecord } from './collections/api_proxy_apis';
import { get, set, isArray, isObject, filter } from 'lodash';
import { ApiSettings } from './apiService';

export class ApiMapper {
    /**
     * 外部APIへのリクエスト内容を変換する
     * @param config axiosのリクエスト設定
     * @param record API定義
     */
    static applyRequestMapping(apiSettings: ApiSettings): void {
        //  コレクションから取得したデータ
        const record: ApiProxyRecord = apiSettings.repoData;
        if (!record.requestMapping) return;
        //  axiosへ渡すAPIリクエストの設定
        const config: any = apiSettings.requestConfig;

        let template = record.requestMapping;
        //  フィルタ
        const filter = apiSettings.filter || {};

        // {{key}} を filter[key] で置換
        // 外部APIが、POSTでJSONでないデータを渡す場合も考えられるので
        // テンプレートのキーワードをフィルタの値で置換するだけ
        const replaced = template.replace(/\{\{(.+?)\}\}/g, (match, key) => {
            const val = get(filter, key);
            // オブジェクトの場合はそのまま文字列化すると [object Object] になるので、
            // プリミティブ値のみ期待するが、一応 String() で囲む
            return val !== undefined ? ((typeof val === 'object') ? JSON.stringify(val) : String(val)) : match;
        });

        config.data = replaced;
    }

    /**
     * 外部APIからのレスポンス内容を変換する
     * @param data 外部APIのレスポンスボディ
     * @param apiSettings API設定
     * @returns {Object|null} 変換後のレスポンスデータ
     */
    static async applyResponseMapping(responseData: any, apiSettings: ApiSettings): Promise<any> {
        //  コレクションから取得したデータ
        let record = apiSettings.repoData;

        // 1. レスポンスの種類に応じたパース
        if (record.mappingMode === 'csv') {
            responseData = await this.parseCsv(responseData, record.csvHasHeader);
            record.isList = true;
            record.listPath = '';
        } else if (record.mappingMode === 'text') {
            responseData = { text: responseData };
        }

        // 2. 配列への統一とパス解決
        let list: any[] = [];
        if (record.isList && record.listPath) {
            const resolved = get(responseData, record.listPath);
            list = isArray(resolved) ? resolved : (resolved ? [resolved] : []);
        } else {
            list = isArray(responseData) ? responseData : [responseData];
        }

        // 3. フィールドマッピング
        if (record.responseMapping && isObject(record.responseMapping)) {
            list = list.map(item => this.mapFields(item, record.responseMapping));
        }

        // 4. フィルタリング (NocoBase Operator の一部をサポート)
        if (apiSettings.filter) {
            list = this.applyFilter(list, apiSettings.filter);
        }

        // 5. レスポンス整形 (get/list)
        if (apiSettings.action === 'get') {
            return { data: list[0] || null };
        } else {
            return { data: list };
        }
    }

    /**
     * フィールド名の変換を行う
     */
    private static mapFields(item: any, mapping: any): any {
        const result: any = {};
        for (const [targetKey, sourcePath] of Object.entries(mapping)) {
            if (typeof sourcePath === 'string') {
                set(result, targetKey, get(item, sourcePath));
            }
        }
        return result;
    }

    /**
     * CSVをパースしてオブジェクトの配列にする
     */
    private static parseCsv(csvText: string, hasHeader: boolean): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const results: any[] = [];
            const { parseString } = require('fast-csv');
            parseString(csvText, { headers: hasHeader })
                .on('error', error => reject(error))
                .on('data', row => results.push(row))
                .on('end', () => resolve(results));
        });
    }

    /**
     * 簡易フィルタリングの実装 ($includes 等、文字列型フィールド演算子をカバー)
     */
    private static applyFilter(list: any[], filterObj: any): any[] {
        return filter(list, (item) => {
            for (const [key, condition] of Object.entries(filterObj)) {
                if (isObject(condition)) {
                    for (const [op, val] of Object.entries(condition)) {
                        const itemVal = get(item, key);
                        if (!this.compare(itemVal, op, val)) return false;
                    }
                } else {
                    if (get(item, key) != condition) return false;
                }
            }
            return true;
        });
    }

    /**
     * 演算子から正規表現パターンへのマップ
     */
    private static operatorToPattern: Record<string, string> = {
        '$eq': '^{{}}$',
        '$startsWith': '^{{}}',
        '$endsWith': '{{}}$',
        '$includes': '{{}}',
        '$like': '{{}}',
    };

    /**
     * 演算子に基づいた比較処理
     */
    private static compare(itemVal: any, operator: string, val: any): boolean {
        let op = operator;
        let isNot = false;
        let isInsensitive = false;

        // 1. $not系を判定
        if (op.startsWith('$not')) {
            isNot = true;
            op = '$' + op.slice(4).charAt(0).toLowerCase() + op.slice(5);
        }

        // 2. $ne (not equal) は $not + $eq として扱う
        if (op === '$ne') {
            isNot = !isNot;
            op = '$eq';
        }

        // 3. $i系 (大文字小文字を区別しない) を判定
        if (op.startsWith('$i') && op !== '$includes') { // $includes はそのまま
            isInsensitive = true;
            op = '$' + op.slice(2).charAt(0).toLowerCase() + op.slice(3);
        }
        // $iIncludes/$iLike などのエイリアス対応
        if (op === '$includes' && operator.toLowerCase().includes('i')) {
            isInsensitive = true;
        }

        const strItemVal = (itemVal !== undefined && itemVal !== null) ? String(itemVal) : '';
        const strVal = (val !== undefined && val !== null) ? String(val) : '';

        let result = false;

        // 4. 特殊：正規表現演算子
        if (op === '$regexp') {
            try {
                result = new RegExp(strVal, isInsensitive ? 'i' : '').test(strItemVal);
            } catch (e) { result = false; }
        }
        // 5. マップに基づいた正規表現判定
        else if (this.operatorToPattern[op]) {
            try {
                const escapedVal = strVal.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                const pattern = this.operatorToPattern[op].replace('{{}}', escapedVal);
                result = new RegExp(pattern, isInsensitive ? 'i' : '').test(strItemVal);
            } catch (e) { result = false; }
        }
        // 6. デフォルト（直接比較）
        else {
            result = (itemVal == val);
        }

        return isNot ? !result : result;
    }
}
