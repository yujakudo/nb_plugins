
import { ActionProps, useActionContext, useCollection, useCollectionRecordData, useDataBlockRequest, useDataBlockResource, useAPIClient } from '@nocobase/client';
import { App as AntdApp } from 'antd';
import { createForm } from '@formily/core';
import { useForm } from '@formily/react';
import React, { useMemo } from 'react';
import { useT } from './locale';
import axios from 'axios';

/**
 * レスポンスデータの比較関数（JSON等価性チェックを含む）
 * @param expected 期待される値
 * @param actual 実際の値
 * @returns 'OK' | 'NG' | '-'
 */
export const compareResponses = (expected: any, actual: any): 'OK' | 'NG' | '-' => {
  // 期待されるレスポンスが未設定の場合は、'-'を返す
  if (expected === undefined || expected === null || expected === '') {
    return '-';
  }

  const strExpected = String(expected).trim();
  const strActual = String(actual).trim();
  // まずは文字列で比較
  if (strExpected === strActual) return 'OK';

  try {
    // JSONで比較
    const objE = JSON.parse(strExpected);
    const objA = JSON.parse(strActual);

    //  JSONデータの等価性比較関数
    const isEqual = (a: any, b: any): boolean => {
      if (a === b) return true;
      if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) return false;
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;
      for (const key of keysA) {
        if (!keysB.includes(key) || !isEqual(a[key], b[key])) return false;
      }
      return true;
    };

    return isEqual(objE, objA) ? 'OK' : 'NG';
  } catch (e) {
    return 'NG';
  }
};

/**
 * Submitされたときの処理を行うフック
 */
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

/**
 * 編集フォームを開く処理を行うフック
 */
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

/**
 * 削除処理を行うフック
 */
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

/**
 * テスト実行アクション
 * @param params 必要なコンテキスト (form, t, message, apiClient)
 */
const executeTestAction = async ({ form, t, message, apiClient }) => {
  const name = form.values.name;
  if (!name) {
    message.error(t('API名が設定されていません'));
    return;
  }

  const testToken = `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const method = form.values.method || 'GET';
  const testParams = form.values.testParamsInput;

  let proxyBasePath = '/api/proxy';
  try {
    const configRes = await apiClient.resource('api_proxy_apis').getProxyConfig();
    proxyBasePath = configRes?.data?.data?.proxyBasePath || '/api/proxy';
  } catch (e) {
    console.error('Failed to fetch proxy config', e);
  }

  let url = `${window.location.origin}${proxyBasePath}/${name}`;
  let config: any = {
    method,
    url,
    headers: {
      'X-Api-Proxy-Test': testToken,
    }
  };

  try {
    if (testParams) {
      const params = JSON.parse(testParams);
      if (method === 'GET') {
        config.params = params;
      } else {
        config.data = params;
      }
    }
  } catch (e) {
    // JSONでない場合はそのまま扱う（必要に応じて）
  }

  try {
    // 1. プロキシリクエスト実行
    const response = await axios(config);

    // 2. 詳細ログの取得
    const logResponse = await axios.get(`${window.location.origin}/api/api_proxy_apis:getTestLog`, {
      params: { token: testToken }
    });

    const logData = logResponse.data?.data || {};

    // 3. フォームへの反映
    form.setValues({
      testStatusDisplay: response.status,
      apiRawResponseDisplay: JSON.stringify(logData.apiRawResponse, null, 2) || '',
      testMappedResponseDisplay: JSON.stringify(response.data, null, 2) || '',
      apiRequestMappingResult: JSON.stringify(logData.apiRequestMappingResult, null, 2) || '',
    }, 'merge');

    message.success(t('テストを実行しました'));
  } catch (error) {
    console.error('Test Execution Error:', error);
    if (axios.isAxiosError(error) && error.response) {
      form.setValues({
        testStatusDisplay: error.response.status,
        testMappedResponseDisplay: JSON.stringify(error.response.data, null, 2),
      }, 'merge');
    }
    message.error(t('テスト実行中にエラーが発生しました'));
  }
};

/**
 * テスト実行ボタンのプロパティフック
 */
export const useRunTestActionProps = () => {
  const form = useForm();
  const t = useT();
  const { message } = AntdApp.useApp();
  const apiClient = useAPIClient();

  return {
    async onClick() {
      await executeTestAction({ form, t, message, apiClient });
    },
  };
}

/**
 * テスト用URLを表示するためのフック
 */
export const useTestUrlProps = () => {
  const form = useForm();
  const name = form.values.name || '';
  const testParams = form.values.testParamsInput || '';
  const method = form.values.method;
  const mappingEnabled = form.values.mappingEnabled;
  const apiClient = useAPIClient();
  const [proxyBasePath, setProxyBasePath] = React.useState('/api/proxy');

  React.useEffect(() => {
    apiClient.resource('api_proxy_apis').getProxyConfig().then(res => {
      const path = res?.data?.data?.proxyBasePath;
      if (path) setProxyBasePath(path);
    }).catch(e => console.error(e));
  }, [apiClient]);

  const url = useMemo(() => {
    let baseUrl = `${window.location.origin}${proxyBasePath}/${name}`;
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

/**
 * テストリクエストデータを保存するアクションフック
 */
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

/**
 * 期待されるレスポンスを保存するアクションフック
 */
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
