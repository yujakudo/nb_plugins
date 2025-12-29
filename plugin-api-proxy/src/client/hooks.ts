
import { ActionProps, useActionContext, useCollection, useCollectionRecordData, useDataBlockRequest, useDataBlockResource } from '@nocobase/client';
import { App as AntdApp } from 'antd';
import { createForm } from '@formily/core';
import { useForm } from '@formily/react';
import React, { useMemo } from 'react';

// Submitされたときの処理
export const useSubmitActionProps = () => {
  const { setVisible } = useActionContext();
  const { message } = AntdApp.useApp();
  const form = useForm();
  const resource = useDataBlockResource();
  const { runAsync } = useDataBlockRequest();
  const collection = useCollection();
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
      message.success('{{t("保存しました")}}');
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
  return {
    confirm: {
      title: '{{t("削除")}}',
      content: '{{t("本当に削除してもよろしいですか？")}}',
    },
    async onClick() {
      await resource.destroy({
        filterByTk: record[collection.filterTargetKey]
      });
      await runAsync();
      // await globalSettingsTableRequest.runAsync();
      message.success('{{t("削除しました")}}');
    },
  };
}
