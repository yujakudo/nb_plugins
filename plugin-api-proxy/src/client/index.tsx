import {
  ExtendCollectionsProvider,
  SchemaComponent,
  Icon,
  Plugin,
} from '@nocobase/client';
import { name } from '../../package.json';
import React from 'react';
import { apiProxyApisCollection } from './collections';
import { useSubmitActionProps, useEditFormProps, useDeleteActionProps } from './hooks';
import { settingPageSchema } from './schema';

const ApiProxyPluginClient = class extends Plugin {
  async load() {
    // 設定ページの登録
    this.app.pluginSettingsManager.add(name, {
      title: '{{t("APIプロキシ")}}',
      icon: 'ApiOutlined',
      Component: () => {
        return (
          <ExtendCollectionsProvider collections={[apiProxyApisCollection]}>
            <SchemaComponent
              schema={settingPageSchema}
              scope={{ useSubmitActionProps, useEditFormProps, useDeleteActionProps, Icon }}
            />
          </ExtendCollectionsProvider>
        );
      },
    });
  }
};

export default ApiProxyPluginClient;
