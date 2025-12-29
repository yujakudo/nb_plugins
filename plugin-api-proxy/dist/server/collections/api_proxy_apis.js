/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var api_proxy_apis_exports = {};
__export(api_proxy_apis_exports, {
  default: () => api_proxy_apis_default
});
module.exports = __toCommonJS(api_proxy_apis_exports);
var import_database = require("@nocobase/database");
var api_proxy_apis_default = (0, import_database.defineCollection)({
  name: "api_proxy_apis",
  fields: [
    // 名前。「{{proxyPath}}/{{name}}」のようなパスになる
    { type: "string", name: "name", allowNull: false },
    // APIのURL
    { type: "string", name: "url", allowNull: false },
    // APIの説明
    { type: "text", name: "description" },
    // APIの利用制限。なし、日次、週次、月次、年次より選択
    {
      type: "json",
      name: "headers"
    },
    // APIの利用制限。なし、日次、週次、月次、年次より選択
    {
      type: "string",
      name: "limit",
      allowNull: false,
      defaultValue: "none"
      // none, daily, weekly, monthly, yearly
    },
    // APIの利用制限回数
    { type: "integer", name: "maxRequests", defaultValue: 0 },
    // 利用制限のカウント開始時刻
    { type: "integer", name: "limitStartWeekday", defaultValue: 0 },
    // 週次
    { type: "integer", name: "limitStartMonth", defaultValue: 0 },
    // 年次
    { type: "integer", name: "limitStartDay", defaultValue: 1 },
    // 月次/年次
    { type: "time", name: "limitStartTime" },
    // 共通
    // 現在の利用回数
    { type: "integer", name: "currentAccessCount", defaultValue: 0 },
    // 最終アクセス時刻
    { type: "date", name: "lastAccessAt" },
    // 次のカウントリセット時刻
    { type: "date", name: "nextResetAt" },
    // タイムゾーン
    { type: "string", name: "timezone", defaultValue: "UTC" },
    // 次回繰越用カウンタ（内部用）
    { type: "integer", name: "reserveCount", defaultValue: 0 }
  ]
});
;
