/**
 * This file is part of the NocoBase (R) project.
 * Copyright (c) 2020-2024 NocoBase Co., Ltd.
 * Authors: NocoBase Team.
 *
 * This project is dual-licensed under AGPL-3.0 and NocoBase Commercial License.
 * For more information, please refer to: https://www.nocobase.com/agreement.
 */

var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
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
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var apiProxy_exports = {};
__export(apiProxy_exports, {
  apiProxy: () => apiProxy
});
module.exports = __toCommonJS(apiProxy_exports);
var import_axios = __toESM(require("axios"));
var import_lodash = require("lodash");
var import_apiService = require("./apiService");
async function apiProxy(ctx, basePath) {
  const api = await getApi(ctx, basePath);
  if (200 != api.status) {
    buildErrorResponse(ctx, api.status, api.message);
    return;
  }
  console.log(`[ProxyApiPlugin] Proxying ${ctx.method} request to: ${api.requestConfig.url}`);
  try {
    const response = await import_axios.default.request(api.requestConfig);
    buildResponse(ctx, response);
  } catch (error) {
    console.error("[ProxyApiPlugin] Proxy Error:", error.message);
    if (import_axios.default.isAxiosError(error) && error.response) {
      buildErrorResponse(ctx, error.response.status, error.response.data);
    } else {
      buildErrorResponse(ctx, 500, "Internal Server Error during proxy request.");
    }
  }
}
function buildResponse(ctx, response) {
  ctx.status = response.status;
  ctx.body = response.data;
  for (const header in response.headers) {
    if (!["content-encoding", "transfer-encoding", "connection"].includes(header.toLowerCase())) {
      const headerValue = response.headers[header];
      if ((0, import_lodash.isString)(headerValue)) {
        ctx.set(header, headerValue);
      } else if (Array.isArray(headerValue)) {
        headerValue.forEach((val) => ctx.append(header, val));
      }
    }
  }
}
function buildErrorResponse(ctx, status, msg) {
  ctx.status = status;
  if (typeof msg === "string") {
    ctx.body = { message: msg };
  } else {
    ctx.body = msg;
  }
}
function getApi(ctx, basePath) {
  const request = ctx.request;
  const urls = new URL(request.href);
  const proxyPath = urls.pathname.replace(basePath + "/", "");
  const pathParts = proxyPath.split("/");
  const apiName = pathParts.shift() || "";
  const extPath = pathParts.join("/");
  return (0, import_apiService.getApiSettings)(ctx, apiName).then((res) => {
    if (res.status !== 200) {
      return res;
    }
    res.requestConfig.method = request.method;
    res.requestConfig.url = res.baseUrl + (extPath ? "/" + extPath : "");
    res.requestConfig.params = Object.fromEntries(urls.searchParams.entries());
    res.requestConfig.headers = {};
    for (const header of ["Content-Type", "Accept", "Authorization"]) {
      const headerKey = header.toLowerCase();
      if (headerKey in request.headers) {
        res.requestConfig.headers[header] = request.headers[headerKey];
      }
    }
    if (res.repoData.headers) {
      Object.assign(res.requestConfig.headers, res.repoData.headers);
    }
    if (["POST", "PUT", "PATCH"].includes(request.method) && request.body) {
      res.requestConfig.data = request.body;
    }
    return res;
  });
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  apiProxy
});
