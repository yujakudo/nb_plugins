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
var apiService_exports = {};
__export(apiService_exports, {
  checkRequestLimit: () => checkRequestLimit,
  getApiSettings: () => getApiSettings,
  getRepositoryData: () => getRepositoryData
});
module.exports = __toCommonJS(apiService_exports);
var import_dayjs = __toESM(require("dayjs"));
var import_utc = __toESM(require("dayjs/plugin/utc"));
var import_timezone = __toESM(require("dayjs/plugin/timezone"));
import_dayjs.default.extend(import_utc.default);
import_dayjs.default.extend(import_timezone.default);
async function getApiSettings_old(ctx, apiName) {
  const db = ctx.db;
  const repo = db.getRepository("api_proxy_apis");
  var res = {
    status: 404,
    message: `"${apiName}" is not found.`,
    baseUrl: "",
    requestConfig: {},
    repoData: null
  };
  const record = await repo.findOne({ filter: { name: apiName } });
  if (!record) {
    return res;
  }
  res.repoData = typeof record.toJSON === "function" ? record.toJSON() : record;
  res.baseUrl = res.repoData.url;
  res.status = 200;
  res.message = "ok";
  return res;
}
async function getApiSettings(ctx, apiName) {
  const db = ctx.db;
  const repo = db.getRepository("api_proxy_apis");
  var res = {
    status: 404,
    message: `"${apiName}" is not found.`,
    baseUrl: "",
    requestConfig: {},
    repoData: null
  };
  try {
    res.repoData = await getRepositoryData(ctx, apiName);
    res.baseUrl = res.repoData.url;
    res.status = 200;
    res.message = "ok";
  } catch (error) {
    res.status = typeof error.cause === "number" ? error.cause : 500;
    res.message = error.message || "internal error";
  }
  return res;
}
async function getRepositoryData(ctx, apiName) {
  const db = ctx.db;
  const repo = db.getRepository("api_proxy_apis");
  const record = await repo.findOne({
    filter: { name: apiName }
  });
  if (!record) {
    throw new Error(`API "${apiName}" is not found.`, { cause: 404 });
  }
  const data = typeof record.toJSON === "function" ? record.toJSON() : record;
  if (data.limit === "none") {
    await repo.update({
      filter: { id: data.id },
      values: {
        lastAccessAt: /* @__PURE__ */ new Date()
      }
    });
    return data;
  }
  return await db.sequelize.transaction(async (t) => {
    const lockedRecord = await repo.findOne({
      filter: { name: apiName },
      transaction: t,
      lock: t.LOCK.UPDATE
    });
    if (!lockedRecord) {
      throw new Error(`API "${apiName}" is not found.`, { cause: 404 });
    }
    const lockedData = typeof lockedRecord.toJSON === "function" ? lockedRecord.toJSON() : lockedRecord;
    lockedData.lastAccessAt = /* @__PURE__ */ new Date();
    checkRequestLimit(lockedData);
    await repo.update({
      filter: { id: lockedData.id },
      values: {
        currentAccessCount: lockedData.currentAccessCount,
        lastAccessAt: lockedData.lastAccessAt,
        nextResetAt: lockedData.nextResetAt,
        reserveCount: lockedData.reserveCount
      },
      transaction: t
    });
    return lockedData;
  });
}
function checkRequestLimit(data) {
  const now = /* @__PURE__ */ new Date();
  const envDelay = parseInt(process.env.API_PROXY_RESET_DELAY || "30", 10);
  const resetDelay = (isNaN(envDelay) ? 30 : envDelay) * 1e3;
  const effectiveResetTime = data.nextResetAt ? new Date(data.nextResetAt.getTime() + resetDelay) : null;
  if (!effectiveResetTime || effectiveResetTime <= now) {
    resetRequestCount(data);
  }
  if (data.currentAccessCount >= data.maxRequests) {
    throw new Error("Request limit has been reached", { cause: 429 });
  }
  data.currentAccessCount++;
  if (data.nextResetAt && resetDelay > 0) {
    const dangerZoneStart = new Date(data.nextResetAt.getTime() - resetDelay);
    if (now >= dangerZoneStart) {
      data.reserveCount = (data.reserveCount || 0) + 1;
    }
  }
}
function resetRequestCount(data) {
  data.currentAccessCount = data.reserveCount || 0;
  data.reserveCount = 0;
  const tz = data.timezone || "UTC";
  const now = (0, import_dayjs.default)(data.lastAccessAt ?? /* @__PURE__ */ new Date()).tz(tz);
  let next = now.clone();
  let h = 0;
  let m = 0;
  if (data.limitStartTime) {
    const d = new Date(data.limitStartTime);
    h = d.getUTCHours();
    m = d.getUTCMinutes();
  }
  switch (data.limit) {
    case "daily": {
      next = now.hour(h).minute(m).second(0).millisecond(0);
      if (next.isBefore(now) || next.isSame(now)) {
        next = next.add(1, "day");
      }
      break;
    }
    case "weekly": {
      next = now.hour(h).minute(m).second(0).millisecond(0);
      const targetDay = data.limitStartWeekday ?? 0;
      next = next.day(targetDay);
      if (next.isBefore(now) || next.isSame(now)) {
        next = next.add(1, "week");
      }
      break;
    }
    case "monthly": {
      const targetDay = data.limitStartDay ?? 1;
      const safeDay = clampDay(now, targetDay);
      next = now.date(safeDay).hour(h).minute(m).second(0).millisecond(0);
      if (!next.isAfter(now)) {
        const nextMonth = now.add(1, "month");
        const safeNextDay = clampDay(nextMonth, targetDay);
        next = nextMonth.date(safeNextDay).hour(h).minute(m).second(0).millisecond(0);
      }
      break;
    }
    case "yearly": {
      const month = (data.limitStartMonth ?? 1) - 1;
      const day = data.limitStartDay ?? 1;
      const base = now.month(month);
      const safeDay = clampDay(base, day);
      next = base.date(safeDay).hour(h).minute(m).second(0).millisecond(0);
      if (!next.isAfter(now)) {
        const nextYear = now.add(1, "year").month(month);
        const safeNextDay = clampDay(nextYear, day);
        next = nextYear.date(safeNextDay).hour(h).minute(m).second(0).millisecond(0);
      }
      break;
    }
    default:
      data.nextResetAt = null;
      return;
  }
  data.nextResetAt = next.toDate();
}
function clampDay(d, day) {
  const lastDay = d.endOf("month").date();
  return Math.min(day, lastDay);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  checkRequestLimit,
  getApiSettings,
  getRepositoryData
});
