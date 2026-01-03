
import { ActionProps, useActionContext, useCollection, useCollectionRecordData, useDataBlockRequest, useDataBlockResource } from '@nocobase/client';
import { App as AntdApp } from 'antd';
import { createForm } from '@formily/core';
import { useForm } from '@formily/react';
import React, { useMemo } from 'react';
import { useT } from './locale';

// Submitされたときの処理
export const useSubmitActionProps = () => {
  const { setVisible } = useActionContext();
  const { message } = AntdApp.useApp();
  const form = useForm();
  const resource = useDataBlockResource();
  const { runAsync } = useDataBlockRequest();
  const collection = useCollection();
  const t = useT();
  return {
    type: 'primary',
    async onClick() {
      await form.submit();
      const values = form.values;
      if (values[collection.filterTargetKey]) {
        await resource.update({
          values,
          filterByTk: values[collection.filterTargetKey],
        });
      } else {
        await resource.create({
          values,
        });
      }
      await runAsync();
      message.success(t('保存しました'));
      setVisible(false);
    },
  };
};

// 編集フォームを開く処理
export const useEditFormProps = () => {
  const recordData = useCollectionRecordData();
  const form = useMemo(
    () =>
      createForm({
        initialValues: recordData,
      }),
    [],
  );

  return {
    form,
  };
}

// 削除処理
export const useDeleteActionProps = () => {
  const { message } = AntdApp.useApp();
  const record = useCollectionRecordData();
  const resource = useDataBlockResource();
  const { runAsync } = useDataBlockRequest();
  // const globalSettingsTableRequest = usePluginSettingsTableRequest();
  const collection = useCollection();
  const t = useT();
  return {
    confirm: {
      title: t('削除'),
      content: t('本当に削除してもよろしいですか？'),
    },
    async onClick() {
      await resource.destroy({
        filterByTk: record[collection.filterTargetKey]
      });
      await runAsync();
      // await globalSettingsTableRequest.runAsync();
      message.success(t('削除しました'));
    },
  };
}

// テスト実行ボタンの処理
export const useRunTestActionProps = () => {
  const form = useForm();
  const t = useT();

  return {
    async onClick() {
      // 実際の実装は後ほど。UIの実装のみ先行。
      // リクエストマッピングのシミュレート（仮）
      const testParams = form.values.testParamsInput;
      form.setFieldState('apiRequestMappingResult', (state) => {
        state.value = testParams; // とりあえずそのまま表示
      });

      // レスポンスのシミュレート（仮）
      form.setFieldState('testStatusDisplay', (state) => {
        state.value = 200;
      });
      form.setFieldState('apiRawResponseDisplay', (state) => {
        state.value = '{"message": "success", "data": {"id": 1, "name": "Test"}}';
      });
      form.setFieldState('testMappedResponseDisplay', (state) => {
        state.value = '{"id": 1, "name": "Test"}';
      });
    },
  };
}

// テスト用URLの表示
export const useTestUrlProps = () => {
  const form = useForm();
  const name = form.values.name || '';
  const testParams = form.values.testParamsInput || '';
  const method = form.values.method;
  const mappingEnabled = form.values.mappingEnabled;

  const url = useMemo(() => {
    let baseUrl = `${window.location.origin}/api/proxy/${name}`;
    if (method === 'GET' && mappingEnabled && testParams) {
      try {
        const params = JSON.parse(testParams);
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          searchParams.append(key, String(val));
        });
        const qs = searchParams.toString();
        if (qs) baseUrl += `?${qs}`;
      } catch (e) {
        // JSONでない場合は無視
      }
    }
    return baseUrl;
  }, [name, testParams, method, mappingEnabled]);

  return {
    value: url,
    readOnly: true,
  };
};

// リクエストデータの保存
export const useSaveTestParamsActionProps = () => {
  const { message } = AntdApp.useApp();
  const form = useForm();
  const resource = useDataBlockResource();
  const record = useCollectionRecordData();
  const collection = useCollection();
  const t = useT();

  return {
    async onClick() {
      const testParams = form.values.testParamsInput;
      await resource.update({
        filterByTk: record[collection.filterTargetKey],
        values: {
          testParams: testParams,
        },
      });
      // フォームのオリジナルの値も同期（expectedResponse判定用）
      form.setValues({ testParams: testParams }, 'merge');
      message.success(t('リクエストデータを保存しました'));
    },
  };
};

// 期待されるレスポンスの保存
export const useSaveExpectedResponseActionProps = () => {
  const { message } = AntdApp.useApp();
  const form = useForm();
  const resource = useDataBlockResource();
  const record = useCollectionRecordData();
  const collection = useCollection();
  const t = useT();

  return {
    async onClick() {
      const expectedResponse = form.values.expectedResponseDisplay;
      await resource.update({
        filterByTk: record[collection.filterTargetKey],
        values: {
          expectedResponse: expectedResponse,
        },
      });
      // フォームのオリジナルの値も同期（expectedResponse判定用）
      form.setValues({ expectedResponse: expectedResponse }, 'merge');
      message.success(t('期待されるレスポンスを保存しました'));
    },
  };
};
