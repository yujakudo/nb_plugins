
// 利用制限の選択肢の配列
export const enumRequestLimit = [
  { label: '{{t("なし")}}', value: 'none' },
  { label: '{{t("日ごと")}}', value: 'daily' },
  { label: '{{t("週ごと")}}', value: 'weekly' },
  { label: '{{t("月ごと")}}', value: 'monthly' },
  { label: '{{t("年ごと")}}', value: 'yearly' },
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
      },
    },
    {
      type: 'text',
      name: 'description',
      interface: 'textarea',
      uiSchema: {
        title: '{{t("説明")}}',
        'x-component': 'Input.TextArea',
      },
    },
    {
      type: 'json',
      name: 'headers',
      interface: 'json',
      uiSchema: {
        title: '{{t("ヘッダ")}}',
        'x-component': 'Input.JSON',
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
      },
    },
    {
      type: 'time',
      name: 'limitStartTime',
      interface: 'time',
      uiSchema: {
        title: '{{t("開始時刻")}}',
        'x-component': 'TimePicker',
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
          { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
          { label: 'America/New_York', value: 'America/New_York' },
          { label: 'Europe/London', value: 'Europe/London' },
        ],
        default: 'UTC',
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
  ],
};
