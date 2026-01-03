import { ISchema } from '@nocobase/client';
import { uid } from '@formily/shared';
import { enumRequestLimit } from './collections';
import { apiProxyApisCollection } from './collections';

// 新規追加フォーム
var addNewFormDrawer = {
  drawer: {
    type: 'void',
    'x-component': 'Action.Drawer',
    title: '{{t("新規追加")}}',
    properties: {
      form: {
        type: 'void',
        'x-component': 'FormV2',
        properties: {
          activeTab: {
            type: 'string',
            'x-decorator': 'FormItem',
            'x-component': 'Input',
            'x-display': 'none',
            default: 'tab1',
          },
          tabs: {
            type: 'void',
            'x-component': 'Tabs',
            'x-component-props': {
              onChange: '{{(key) => $form.setValues({activeTab: key})}}',
            },
            properties: {
              tab1: {
                type: 'void',
                title: '{{t("基本設定")}}',
                'x-component': 'Tabs.TabPane',
                properties: {
                  name: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                  },
                  preset: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                  },
                  method: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    default: 'GET',
                  },
                  url: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                  },
                  headers: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                  },
                },
              },
              tabDescription: {
                type: 'void',
                title: '{{t("説明")}}',
                'x-component': 'Tabs.TabPane',
                properties: {
                  description: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-component-props': {
                      autoSize: {
                        minRows: 10,
                      },
                    },
                  },
                },
              },
              tabMapping: {
                type: 'void',
                title: '{{t("マッピング設定")}}',
                'x-component': 'Tabs.TabPane',
                properties: {
                  mappingEnabled: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    default: false,
                  },
                  requestMapping: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['mappingEnabled'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === true}}',
                        },
                      },
                    },
                  },
                  mappingMode: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    default: 'json',
                    'x-reactions': {
                      dependencies: ['mappingEnabled'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === true}}',
                        },
                      },
                    },
                  },
                  isList: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['mappingEnabled', 'mappingMode'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] && $deps[1] === "json"}}',
                        },
                      },
                    },
                  },
                  listPath: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['mappingEnabled', 'mappingMode', 'isList'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] && $deps[1] === "json" && $deps[2]}}',
                        },
                      },
                    },
                  },
                  csvHasHeader: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['mappingEnabled', 'mappingMode'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] && $deps[1] === "csv"}}',
                        },
                      },
                    },
                  },
                  responseMapping: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['mappingEnabled'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === true}}',
                        },
                      },
                    },
                  },
                },
              },
              tab2: {
                type: 'void',
                title: '{{t("利用制限設定")}}',
                'x-component': 'Tabs.TabPane',
                properties: {
                  limit: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    default: 'none',
                  },
                  maxRequests: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['limit'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] !== "none"}}',
                        },
                      },
                    },
                  },
                  limitStartWeekday: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['limit'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === "weekly"}}',
                        },
                      },
                    },
                  },
                  limitStartMonth: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['limit'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === "yearly"}}',
                        },
                      },
                    },
                  },
                  limitStartDay: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['limit'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] === "monthly" || $deps[0] === "yearly"}}',
                        },
                      },
                    },
                  },
                  limitStartTime: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['limit'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] !== "none"}}',
                        },
                      },
                    },
                  },
                  currentAccessCount: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    'x-reactions': {
                      dependencies: ['limit'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] !== "none"}}',
                        },
                      },
                    },
                  },
                  timezone: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                    default: 'UTC',
                    'x-reactions': {
                      dependencies: ['limit'],
                      fulfill: {
                        state: {
                          visible: '{{$deps[0] !== "none"}}',
                        },
                      },
                    },
                  },
                },
              },
              tabRunTest: {
                type: 'void',
                title: '{{t("テスト")}}',
                'x-component': 'Tabs.TabPane',
                properties: {
                  testUrlDisplay: {
                    type: 'string',
                    title: '{{t("URL")}}',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      readOnly: true,
                    },
                    'x-use-component-props': 'useTestUrlProps',
                  },
                  testParamsInput: {
                    type: 'string',
                    title: '{{t("リクエストデータ")}}',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input.TextArea',
                    'x-reactions': [
                      {
                        dependencies: ['testParams'],
                        fulfill: {
                          state: {
                            value: '{{$deps[0]}}',
                          },
                        },
                      },
                    ],
                  },
                  requestActions: {
                    type: 'void',
                    'x-component': 'ActionBar',
                    'x-component-props': {
                      style: { marginBottom: 16 },
                    },
                    properties: {
                      runButton: {
                        type: 'void',
                        'x-component': 'Action',
                        title: '{{t("リクエストの送信")}}',
                        'x-align': 'left',
                        'x-component-props': {
                          type: 'primary',
                        },
                        'x-use-component-props': 'useRunTestActionProps',
                      },
                      saveTestParamsButton: {
                        type: 'void',
                        'x-component': 'Action',
                        title: '{{t("リクエストデータの保存")}}',
                        'x-align': 'right',
                        'x-use-component-props': 'useSaveTestParamsActionProps',
                      },
                    },
                  },
                  testResult: {
                    type: 'string',
                    title: '{{t("テスト結果")}}',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      readOnly: true,
                    },
                    'x-reactions': [
                      {
                        dependencies: ['expectedResponseDisplay', 'testMappedResponseDisplay'],
                        fulfill: {
                          state: {
                            visible: '{{!!$deps[0]}}',
                            value: '{{$deps[0] === $deps[1] ? "OK" : "NG"}}',
                          },
                        },
                      },
                    ],
                  },
                  apiRequestMappingResult: {
                    type: 'string',
                    title: '{{t("APIへのリクエストデータ")}}',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input.TextArea',
                    'x-component-props': {
                      readOnly: true,
                    },
                  },
                  testStatusDisplay: {
                    type: 'number',
                    title: '{{t("ステータス")}}',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input',
                    'x-component-props': {
                      readOnly: true,
                    },
                  },
                  apiRawResponseDisplay: {
                    type: 'string',
                    title: '{{t("APIからのレスポンスデータ")}}',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input.TextArea',
                    'x-component-props': {
                      readOnly: true,
                    },
                  },
                  testMappedResponseDisplay: {
                    type: 'string',
                    title: '{{t("レスポンスデータ")}}',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input.TextArea',
                    'x-component-props': {
                      readOnly: true,
                    },
                  },
                  expectedResponseDisplay: {
                    type: 'string',
                    title: '{{t("期待されるレスポンス")}}',
                    'x-decorator': 'FormItem',
                    'x-component': 'Input.TextArea',
                    'x-component-props': {
                    },
                    'x-reactions': [
                      {
                        dependencies: ['testParamsInput', 'testParams', 'expectedResponse'],
                        fulfill: {
                          state: {
                            value: '{{$deps[0] === $deps[1] ? $deps[2] : ""}}',
                          },
                        },
                      },
                    ],
                  },
                  saveExpectedResponseActions: {
                    type: 'void',
                    'x-component': 'ActionBar',
                    'x-component-props': {
                      style: { marginBottom: 800 },
                    },
                    properties: {
                      saveExpectedResponseButton: {
                        type: 'void',
                        'x-component': 'Action',
                        title: '{{t("期待されるレスポンスの保存")}}',
                        'x-align': 'right',
                        'x-use-component-props': 'useSaveExpectedResponseActionProps',
                      },
                    },
                  },
                },
              },
            },
          },
          footer: {
            type: 'void',
            'x-component': 'Action.Drawer.Footer',
            'x-reactions': {
              dependencies: ['activeTab'],
              fulfill: {
                state: {
                  visible: '{{$deps[0] !== "tabRunTest"}}',
                },
              },
            },
            properties: {
              submit: {
                title: '{{t("送信")}}',
                'x-component': 'Action',
                'x-use-component-props': 'useSubmitActionProps',
              },
            },
          },
        },
      },
    },
  },
};

// 編集フォーム
// 新規追加フォームの差分で定義する
var editFormDrawer = JSON.parse(JSON.stringify(addNewFormDrawer));
editFormDrawer.drawer.title = '{{t("編集")}}';
editFormDrawer.drawer.properties.form['x-use-component-props'] = 'useEditFormProps';

// 設定UIスキーマ
// 設定一覧表示テーブルと新規追加・編集・削除アクション
export const settingPageSchema: ISchema = {
  type: 'void',
  name: uid(),
  'x-decorator': 'TableBlockProvider',
  'x-decorator-props': {
    collection: apiProxyApisCollection.name,
    action: 'list',
    showIndex: true,
    dragSort: false,
  },
  properties: {
    actions: {
      type: 'void',
      'x-component': 'ActionBar',
      'x-component-props': {
        style: {
          marginBottom: 20,
        },
      },
      properties: {
        add: {
          type: 'void',
          'x-component': 'Action',
          title: '{{t("新規追加")}}',
          'x-align': 'right',
          'x-component-props': {
            type: 'primary',
          },
          properties: addNewFormDrawer,
        },
      },
    },

    table: {
      type: 'array',
      'x-component': 'TableV2',
      'x-use-component-props': 'useTableBlockProps',
      'x-component-props': {
        rowKey: 'id',
      },
      properties: {
        column1: {
          type: 'void',
          title: '{{t("名前")}}',
          'x-component': 'TableV2.Column',
          properties: {
            name: {
              type: 'string',
              'x-component': 'CollectionField',
              'x-pattern': 'readPretty',
            },
          },
        },
        column2: {
          type: 'void',
          title: '{{t("URL")}}',
          'x-component': 'TableV2.Column',
          properties: {
            url: {
              type: 'string',
              'x-component': 'CollectionField',
              'x-pattern': 'readPretty',
            },
          },
        },
        column3: {
          type: 'void',
          title: '{{t("説明")}}',
          'x-component': 'TableV2.Column',
          'x-component-props': {
            width: 200,
            ellipsis: true,
          },
          properties: {
            description: {
              type: 'string',
              'x-component': 'CollectionField',
              'x-pattern': 'readPretty',
              'x-component-props': {
                ellipsis: true,
              },
            },
          },
        },
        column4: {
          type: 'void',
          title: '{{t("利用制限")}}',
          'x-component': 'TableV2.Column',
          properties: {
            limit: {
              type: 'string',
              'x-component': 'CollectionField',
              'x-pattern': 'readPretty',
              'x-component-props': {
                enum: enumRequestLimit, // none, daily, weekly, monthly, yearly 
              },
            },
          },
        },
        column5: {
          type: 'void',
          title: '{{t("最大利用回数")}}',
          'x-component': 'TableV2.Column',
          properties: {
            maxRequests: {
              type: 'number',
              'x-component': 'CollectionField',
              'x-pattern': 'readPretty',
            },
          },
        },
        column6: {
          type: 'void',
          title: '{{t("現在の利用回数")}}',
          'x-component': 'TableV2.Column',
          properties: {
            currentAccessCount: {
              type: 'number',
              'x-component': 'CollectionField',
              'x-pattern': 'readPretty',
            },
          },
        },
        column7: {
          type: 'void',
          title: '{{t("最終アクセス時刻")}}',
          'x-component': 'TableV2.Column',
          properties: {
            lastAccessAt: {
              type: 'string',
              'x-component': 'CollectionField',
              'x-pattern': 'readPretty',
            },
          },
        },
        actions: {
          type: 'void',
          title: 'Actions',
          'x-component': 'TableV2.Column',
          properties: {
            actions: {
              type: 'void',
              'x-component': 'Space',
              'x-component-props': {
                split: '|',
              },
              properties: {
                edit: {
                  type: 'void',
                  title: '{{t("編集")}}',
                  'x-component': 'Action.Link',
                  'x-component-props': {
                    openMode: 'drawer',
                    icon: 'EditOutlined',
                  },
                  properties: editFormDrawer,
                },
                delete: {
                  type: 'void',
                  title: '{{t("削除")}}',
                  'x-component': 'Action.Link',
                  'x-use-component-props': 'useDeleteActionProps',
                },
              },
            },
          },
        },
      },
    },
  },
};
