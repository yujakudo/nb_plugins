export declare const enumRequestLimit: {
    label: string;
    value: string;
}[];
/**
 * APIのコレクション
 * @ref ../server/collection/api_proxy_apis
 * @todo 表に、アクセス時刻、次回カウントリセット時刻を表示する
 * @todo リセット時刻設定フィールドの表示／非表示
 *
 */
export declare const apiProxyApisCollection: {
    name: string;
    filterTargetKey: string;
    fields: ({
        type: string;
        name: string;
        interface: string;
        uiSchema: {
            title: string;
            required: boolean;
            'x-component': string;
            enum?: undefined;
            default?: undefined;
            minimum?: undefined;
            maximum?: undefined;
            readOnly?: undefined;
            type?: undefined;
            'x-decorator'?: undefined;
            'x-component-props'?: undefined;
        };
    } | {
        type: string;
        name: string;
        interface: string;
        uiSchema: {
            title: string;
            'x-component': string;
            required?: undefined;
            enum?: undefined;
            default?: undefined;
            minimum?: undefined;
            maximum?: undefined;
            readOnly?: undefined;
            type?: undefined;
            'x-decorator'?: undefined;
            'x-component-props'?: undefined;
        };
    } | {
        type: string;
        name: string;
        interface: string;
        uiSchema: {
            title: string;
            enum: {
                label: string;
                value: string;
            }[];
            default: string;
            'x-component': string;
            required?: undefined;
            minimum?: undefined;
            maximum?: undefined;
            readOnly?: undefined;
            type?: undefined;
            'x-decorator'?: undefined;
            'x-component-props'?: undefined;
        };
    } | {
        type: string;
        name: string;
        interface: string;
        uiSchema: {
            title: string;
            'x-component': string;
            default: number;
            required?: undefined;
            enum?: undefined;
            minimum?: undefined;
            maximum?: undefined;
            readOnly?: undefined;
            type?: undefined;
            'x-decorator'?: undefined;
            'x-component-props'?: undefined;
        };
    } | {
        type: string;
        name: string;
        interface: string;
        uiSchema: {
            title: string;
            enum: {
                label: string;
                value: number;
            }[];
            default: number;
            'x-component': string;
            required?: undefined;
            minimum?: undefined;
            maximum?: undefined;
            readOnly?: undefined;
            type?: undefined;
            'x-decorator'?: undefined;
            'x-component-props'?: undefined;
        };
    } | {
        type: string;
        name: string;
        interface: string;
        uiSchema: {
            title: string;
            'x-component': string;
            minimum: number;
            maximum: number;
            required?: undefined;
            enum?: undefined;
            default?: undefined;
            readOnly?: undefined;
            type?: undefined;
            'x-decorator'?: undefined;
            'x-component-props'?: undefined;
        };
    } | {
        type: string;
        name: string;
        interface: string;
        uiSchema: {
            title: string;
            'x-component': string;
            default: number;
            readOnly: boolean;
            required?: undefined;
            enum?: undefined;
            minimum?: undefined;
            maximum?: undefined;
            type?: undefined;
            'x-decorator'?: undefined;
            'x-component-props'?: undefined;
        };
    } | {
        name: string;
        interface: string;
        uiSchema: {
            type: string;
            title: string;
            'x-component': string;
            'x-decorator': string;
            enum: {
                label: string;
                value: string;
            }[];
            default: string;
            required?: undefined;
            minimum?: undefined;
            maximum?: undefined;
            readOnly?: undefined;
            'x-component-props'?: undefined;
        };
        type?: undefined;
    } | {
        type: string;
        name: string;
        interface: string;
        uiSchema: {
            title: string;
            'x-component': string;
            'x-component-props': {
                showTime: boolean;
            };
            readOnly: boolean;
            required?: undefined;
            enum?: undefined;
            default?: undefined;
            minimum?: undefined;
            maximum?: undefined;
            type?: undefined;
            'x-decorator'?: undefined;
        };
    })[];
};
