import {
  ExtendCollectionsProvider,
  SchemaComponent,
  Icon,
  Plugin,
  Markdown,
} from '@nocobase/client';
import { name } from '../../package.json';
import React from 'react';
import { apiProxyApisCollection } from './collections';
import { useSubmitActionProps, useEditFormProps, useDeleteActionProps } from './hooks';
import { settingPageSchema } from './schema';
import { useT } from './locale';

class ApiProxyPluginClient extends Plugin {
  async load() {
    // 設定ページの登録
    this.app.pluginSettingsManager.add(name, {
      title: '{{t("APIプロキシ")}}',
      icon: 'ApiOutlined',
      Component: () => {
        const t = useT();
        return (
          <ExtendCollectionsProvider collections={[apiProxyApisCollection]}>
            <SchemaComponent
              schema={settingPageSchema}
              components={{ Markdown }}
              scope={{ useSubmitActionProps, useEditFormProps, useDeleteActionProps, Icon, t }}
            />
          </ExtendCollectionsProvider>
        );
      },
    });
  }
};

export default ApiProxyPluginClient;
