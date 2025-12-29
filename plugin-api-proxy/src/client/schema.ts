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
          tabs: {
            type: 'void',
            'x-component': 'Tabs',
            'x-component-props': {},
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
                  url: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                  },
                  headers: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
                  },
                  description: {
                    'x-decorator': 'FormItem',
                    'x-component': 'CollectionField',
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
            },
          },
          footer: {
            type: 'void',
            'x-component': 'Action.Drawer.Footer',
            properties: {
              submit: {
                title: '{{t("送信")}}',
                'x-component': 'Action',
                'x-use-component-props': 'useSubmitActionProps',
              }
            }
          }
        }
      }
    },
  }
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
                  title: '{{("編集")}}',
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
