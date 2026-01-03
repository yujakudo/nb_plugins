// 利用制限の選択肢の配列
export const enumRequestLimit = [
  { label: '{{t("なし")}}', value: 'none' },
  { label: '{{t("日ごと")}}', value: 'daily' },
  { label: '{{t("週ごと")}}', value: 'weekly' },
  { label: '{{t("月ごと")}}', value: 'monthly' },
  { label: '{{t("年ごと")}}', value: 'yearly' },
];

export const enumMappingMode = [
  { label: 'JSON', value: 'json' },
  { label: 'CSV', value: 'csv' },
  { label: '{{t("テキスト")}}', value: 'text' },
];

/**
 * APIのコレクション
 * @ref ../server/collection/api_proxy_apis
 * @todo 表に、アクセス時刻、次回カウントリセット時刻を表示する
 * @todo リセット時刻設定フィールドの表示／非表示
 * 
 */
export const apiProxyApisCollection = {
  name: 'api_proxy_apis',
  filterTargetKey: 'id',
  fields: [
    {
      type: 'string',
      name: 'name',
      interface: 'input',
      uiSchema: {
        title: '{{t("名前")}}',
        required: true,
        'x-component': 'Input',
        'x-decorator-props': {
          tooltip: '{{t("名前Tooltip")}}',
        },
      },
    },
    {
      type: 'string',
      name: 'method',
      interface: 'select',
      uiSchema: {
        title: '{{t("メソッド")}}',
        'x-component': 'Select',
        'x-component-props': {
          allowClear: false,
        },
        enum: [
          { label: 'GET', value: 'GET' },
          { label: 'POST', value: 'POST' },
          { label: 'PUSH', value: 'PUSH' },
        ],
        default: 'GET',
        'x-decorator-props': {
          tooltip: '{{t("メソッドTooltip")}}',
        },
      },
    },
    {
      type: 'string',
      name: 'url',
      interface: 'input',
      uiSchema: {
        title: '{{t("URL")}}',
        required: true,
        'x-component': 'Input.URL',
        'x-decorator-props': {
          tooltip: '{{t("URLTooltip")}}',
        },
      },
    },
    {
      type: 'text',
      name: 'description',
      interface: 'textarea',
      uiSchema: {
        title: '{{t("説明")}}',
        'x-component': 'Markdown',
        'x-decorator-props': {
          tooltip: '{{t("説明Tooltip")}}',
        },
      },
    },
    {
      type: 'json',
      name: 'headers',
      interface: 'json',
      uiSchema: {
        title: '{{t("ヘッダ")}}',
        'x-component': 'Input.JSON',
        'x-decorator-props': {
          tooltip: '{{t("ヘッダTooltip")}}',
        },
      },
    },
    {
      type: 'string',
      name: 'limit',
      interface: 'select',
      uiSchema: {
        title: '{{t("利用制限")}}',
        enum: enumRequestLimit, // none, daily, weekly, monthly, yearly 
        default: 'none',
        'x-component': 'Select',
        'x-component-props': {
          allowClear: false,
        },
        'x-decorator-props': {
          tooltip: '{{t("利用制限Tooltip")}}',
        },
      },
    },
    {
      type: 'integer',
      name: 'maxRequests',
      interface: 'number',
      uiSchema: {
        title: '{{t("最大利用回数")}}',
        'x-component': 'Input',
        default: 0,
        'x-decorator-props': {
          tooltip: '{{t("最大利用回数Tooltip")}}',
        },
      },
    },
    {
      type: 'integer',
      name: 'limitStartWeekday',
      interface: 'select',
      uiSchema: {
        title: '{{t("開始曜日")}}',
        enum: [
          { label: '{{t("日")}}', value: 0 },
          { label: '{{t("月")}}', value: 1 },
          { label: '{{t("火")}}', value: 2 },
          { label: '{{t("水")}}', value: 3 },
          { label: '{{t("木")}}', value: 4 },
          { label: '{{t("金")}}', value: 5 },
          { label: '{{t("土")}}', value: 6 },
        ],
        default: 0,
        'x-component': 'Select',
        'x-decorator-props': {
          tooltip: '{{t("開始曜日Tooltip")}}',
        },
      },
    },
    {
      type: 'integer',
      name: 'limitStartMonth',
      interface: 'number',
      uiSchema: {
        title: '{{t("開始月")}}',
        'x-component': 'Input',
        minimum: 1,
        maximum: 12,
        'x-decorator-props': {
          tooltip: '{{t("開始月Tooltip")}}',
        },
      },
    },
    {
      type: 'integer',
      name: 'limitStartDay',
      interface: 'number',
      uiSchema: {
        title: '{{t("開始日")}}',
        'x-component': 'Input',
        minimum: 1,
        maximum: 31,
        'x-decorator-props': {
          tooltip: '{{t("開始日Tooltip")}}',
        },
      },
    },
    {
      type: 'time',
      name: 'limitStartTime',
      interface: 'time',
      uiSchema: {
        title: '{{t("開始時刻")}}',
        'x-component': 'TimePicker',
        'x-decorator-props': {
          tooltip: '{{t("開始時刻Tooltip")}}',
        },
      },
    },
    {
      type: 'integer',
      name: 'currentAccessCount',
      interface: 'number',
      uiSchema: {
        title: '{{t("現在の利用回数")}}',
        'x-component': 'Input',
        default: 0,
        readOnly: true,
      },
    },
    {
      name: 'timezone',
      interface: 'select',
      uiSchema: {
        type: 'string',
        title: '{{t("タイムゾーン")}}',
        'x-component': 'Select',
        'x-decorator': 'FormItem',
        enum: [
          { label: 'UTC', value: 'UTC' },
          { label: 'America/Los_Angeles', value: 'America/Los_Angeles' },
          { label: 'America/New_York', value: 'America/New_York' },
          { label: 'Asia/Dubai', value: 'Asia/Dubai' },
          { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
          { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
          { label: 'Asia/Singapore', value: 'Asia/Singapore' },
          { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
          { label: 'Europe/Berlin', value: 'Europe/Berlin' },
          { label: 'Europe/London', value: 'Europe/London' },
          { label: 'Europe/Moscow', value: 'Europe/Moscow' },
        ],
        default: 'UTC',
        'x-decorator-props': {
          tooltip: '{{t("タイムゾーンTooltip")}}',
        },
      },
    },
    {
      type: 'date',
      name: 'lastAccessAt',
      interface: 'datetime',
      uiSchema: {
        title: '{{t("最終アクセス時刻")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        readOnly: true,
      },
    },
    {
      type: 'date',
      name: 'nextResetAt',
      interface: 'datetime',
      uiSchema: {
        title: '{{t("次のカウントリセット時刻")}}',
        'x-component': 'DatePicker',
        'x-component-props': {
          showTime: true,
        },
        readOnly: true,
      },
    },
    {
      type: 'string',
      name: 'preset',
      interface: 'select',
      uiSchema: {
        title: '{{t("プリセット")}}',
        'x-component': 'Select',
        'x-decorator-props': {
          tooltip: '{{t("プリセットTooltip")}}',
        },
      },
    },
    {
      type: 'boolean',
      name: 'mappingEnabled',
      interface: 'checkbox',
      uiSchema: {
        title: '{{t("マッピングの有効化")}}',
        'x-component': 'Checkbox',
        'x-content': '{{t("マッピングを有効にする")}}',
        default: false,
        'x-decorator-props': {
          tooltip: '{{t("マッピングの有効化Tooltip")}}',
        },
      },
    },
    {
      type: 'string',
      name: 'mappingMode',
      interface: 'select',
      uiSchema: {
        title: '{{t("レスポンスの種類")}}',
        enum: enumMappingMode,
        default: 'json',
        'x-component': 'Select',
        'x-component-props': {
          allowClear: false,
        },
        'x-decorator-props': {
          tooltip: '{{t("レスポンスの種類Tooltip")}}',
        },
      },
    },
    {
      type: 'boolean',
      name: 'isList',
      interface: 'checkbox',
      uiSchema: {
        title: '{{t("リスト")}}',
        'x-component': 'Checkbox',
        'x-content': '{{t("APIのレスポンスは配列")}}',
        default: false,
        'x-decorator-props': {
          tooltip: '{{t("リストTooltip")}}',
        },
      },
    },
    {
      type: 'string',
      name: 'listPath',
      interface: 'input',
      uiSchema: {
        title: '{{t("リスト要素")}}',
        'x-component': 'Input',
        'x-decorator-props': {
          tooltip: '{{t("リスト要素Tooltip")}}',
        },
      },
    },
    {
      type: 'boolean',
      name: 'csvHasHeader',
      interface: 'checkbox',
      uiSchema: {
        title: '{{t("一列目が列名")}}',
        'x-component': 'Checkbox',
        'x-content': '{{t("一列目が列名のラベルであることを示す")}}',
        default: true,
        'x-decorator-props': {
          tooltip: '{{t("一列目が列名Tooltip")}}',
        },
      },
    },
    {
      type: 'text',
      name: 'requestMapping',
      interface: 'textarea',
      uiSchema: {
        title: '{{t("リクエストマッピング")}}',
        'x-component': 'Input.TextArea',
        'x-decorator-props': {
          tooltip: '{{t("リクエストマッピングTooltip")}}',
        },
      },
    },
    {
      type: 'json',
      name: 'responseMapping',
      interface: 'json',
      uiSchema: {
        title: '{{t("レスポンスマッピング")}}',
        'x-component': 'Input.JSON',
        'x-decorator-props': {
          tooltip: '{{t("レスポンスマッピングTooltipJSON")}}',
        },
        'x-reactions': [
          {
            dependencies: ['mappingMode'],
            fulfill: {
              state: {
                decoratorProps: {
                  tooltip: '{{$deps[0] === "csv" ? t("レスポンスマッピングTooltipCSV") : ($deps[0] === "text" ? t("レスポンスマッピングTooltipText") : t("レスポンスマッピングTooltipJSON"))}}',
                },
              },
            },
          },
        ],
      },
    },
    {
      type: 'text',
      name: 'testParams',
      interface: 'textarea',
      uiSchema: {
        title: '{{t("テストパラメータ")}}',
        'x-component': 'Input.TextArea',
        'x-decorator-props': {
          tooltip: '{{t("テストパラメータTooltip")}}',
        },
      },
    },
    {
      type: 'text',
      name: 'expectedResponse',
      interface: 'textarea',
      uiSchema: {
        title: '{{t("期待されるレスポンス")}}',
        'x-component': 'Input.TextArea',
        'x-decorator-props': {
          tooltip: '{{t("期待されるレスポンスTooltip")}}',
        },
      },
    },
  ],
};
