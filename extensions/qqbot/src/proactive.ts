/**
<<<<<<< HEAD
 * QQ Bot 主动发送消息模块
 *
 * 该模块提供以下能力：
 * 1. 记录已知用户（曾与机器人交互过的用户）
 * 2. 主动发送消息给用户或群组
 * 3. 查询已知用户列表
 */

import * as fs from "node:fs";
import * as path from "node:path";
import type { ResolvedQQBotAccount } from "./types.js";

// ============ 类型定义（本地） ============

/**
 * 已知用户信息
 */
export interface KnownUser {
  type: "c2c" | "group" | "channel";
  openid: string;
  accountId: string;
  nickname?: string;
  firstInteractionAt: number;
  lastInteractionAt: number;
}

/**
 * 主动发送消息选项
 */
=======
 * QQ Bot proactive messaging helpers.
 *
 * This module sends proactive messages and manages known-user queries.
 * Known-user storage is delegated to `./known-users.ts`.
 */

import type { ResolvedQQBotAccount } from "./types.js";
import { debugLog, debugError } from "./utils/debug-log.js";

// Re-export known-user types and functions from the canonical module.
export type { KnownUser } from "./known-users.js";
export {
  recordKnownUser,
  listKnownUsers as listKnownUsersFromStore,
  getKnownUser as getKnownUserFromStore,
  removeKnownUser as removeKnownUserFromStore,
  clearKnownUsers as clearKnownUsersFromStore,
  flushKnownUsers,
} from "./known-users.js";
import {
  listKnownUsers as listKnownUsersImpl,
  removeKnownUser as removeKnownUserImpl,
  clearKnownUsers as clearKnownUsersImpl,
  getKnownUser as getKnownUserImpl,
} from "./known-users.js";

/** Options for proactive message sending. */
>>>>>>> upstream/main
export interface ProactiveSendOptions {
  to: string;
  text: string;
  type?: "c2c" | "group" | "channel";
  imageUrl?: string;
  accountId?: string;
}

<<<<<<< HEAD
/**
 * 主动发送消息结果
 */
=======
/** Result returned from proactive sends. */
>>>>>>> upstream/main
export interface ProactiveSendResult {
  success: boolean;
  messageId?: string;
  timestamp?: number | string;
  error?: string;
}

<<<<<<< HEAD
/**
 * 列出已知用户选项
 */
=======
/** Filters for listing known users. */
>>>>>>> upstream/main
export interface ListKnownUsersOptions {
  type?: "c2c" | "group" | "channel";
  accountId?: string;
  sortByLastInteraction?: boolean;
  limit?: number;
}
<<<<<<< HEAD
import type { OpenClawConfig } from "openclaw/plugin-sdk";
=======
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
>>>>>>> upstream/main
import {
  getAccessToken,
  sendProactiveC2CMessage,
  sendProactiveGroupMessage,
  sendChannelMessage,
  sendC2CImageMessage,
  sendGroupImageMessage,
} from "./api.js";
import { resolveQQBotAccount } from "./config.js";
<<<<<<< HEAD
// ============ 用户存储管理 ============
/**
 * 已知用户存储
 * 使用简单的 JSON 文件存储，保存在 .openclaw/qqbot 目录下
 */
import { getQQBotDataDir } from "./utils/platform.js";

const STORAGE_DIR = getQQBotDataDir("data");
const KNOWN_USERS_FILE = path.join(STORAGE_DIR, "known-users.json");

// 内存缓存
let knownUsersCache: Map<string, KnownUser> | null = null;
let cacheLastModified = 0;

/**
 * 确保存储目录存在
 */
function ensureStorageDir(): void {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * 生成用户唯一键
 */
function getUserKey(type: string, openid: string, accountId: string): string {
  return `${accountId}:${type}:${openid}`;
}

/**
 * 从文件加载已知用户
 */
function loadKnownUsers(): Map<string, KnownUser> {
  if (knownUsersCache !== null) {
    // 检查文件是否被修改
    try {
      const stat = fs.statSync(KNOWN_USERS_FILE);
      if (stat.mtimeMs <= cacheLastModified) {
        return knownUsersCache;
      }
    } catch {
      // 文件不存在，使用缓存
      return knownUsersCache;
    }
  }

  const users = new Map<string, KnownUser>();

  try {
    if (fs.existsSync(KNOWN_USERS_FILE)) {
      const data = fs.readFileSync(KNOWN_USERS_FILE, "utf-8");
      const parsed = JSON.parse(data) as KnownUser[];
      for (const user of parsed) {
        const key = getUserKey(user.type, user.openid, user.accountId);
        users.set(key, user);
      }
      cacheLastModified = fs.statSync(KNOWN_USERS_FILE).mtimeMs;
    }
  } catch (err) {
    console.error(`[qqbot:proactive] Failed to load known users: ${err}`);
  }

  knownUsersCache = users;
  return users;
}

/**
 * 保存已知用户到文件
 */
function saveKnownUsers(users: Map<string, KnownUser>): void {
  try {
    ensureStorageDir();
    const data = Array.from(users.values());
    fs.writeFileSync(KNOWN_USERS_FILE, JSON.stringify(data, null, 2), "utf-8");
    cacheLastModified = Date.now();
    knownUsersCache = users;
  } catch (err) {
    console.error(`[qqbot:proactive] Failed to save known users: ${err}`);
  }
}

/**
 * 记录一个已知用户（当收到用户消息时调用）
 *
 * @param user - 用户信息
 */
export function recordKnownUser(user: Omit<KnownUser, "firstInteractionAt">): void {
  const users = loadKnownUsers();
  const key = getUserKey(user.type, user.openid, user.accountId);

  const existing = users.get(key);
  const now = user.lastInteractionAt || Date.now();

  users.set(key, {
    ...user,
    lastInteractionAt: now,
    firstInteractionAt: existing?.firstInteractionAt ?? now,
    // 更新昵称（如果有新的）
    nickname: user.nickname || existing?.nickname,
  });

  saveKnownUsers(users);
  console.log(`[qqbot:proactive] Recorded user: ${key}`);
}

/**
 * 获取一个已知用户
 *
 * @param type - 用户类型
 * @param openid - 用户 openid
 * @param accountId - 账户 ID
 */
=======

/** Look up a known user entry (adapter for the old proactive API shape). */
>>>>>>> upstream/main
export function getKnownUser(
  type: string,
  openid: string,
  accountId: string,
<<<<<<< HEAD
): KnownUser | undefined {
  const users = loadKnownUsers();
  const key = getUserKey(type, openid, accountId);
  return users.get(key);
}

/**
 * 列出已知用户
 *
 * @param options - 过滤选项
 */
export function listKnownUsers(options?: ListKnownUsersOptions): KnownUser[] {
  const users = loadKnownUsers();
  let result = Array.from(users.values());

  // 过滤类型
  if (options?.type) {
    result = result.filter((u) => u.type === options.type);
  }

  // 过滤账户
  if (options?.accountId) {
    result = result.filter((u) => u.accountId === options.accountId);
  }

  // 排序
  if (options?.sortByLastInteraction !== false) {
    result.sort((a, b) => b.lastInteractionAt - a.lastInteractionAt);
  }

  // 限制数量
  if (options?.limit && options.limit > 0) {
    result = result.slice(0, options.limit);
  }

  return result;
}

/**
 * 删除一个已知用户
 *
 * @param type - 用户类型
 * @param openid - 用户 openid
 * @param accountId - 账户 ID
 */
export function removeKnownUser(type: string, openid: string, accountId: string): boolean {
  const users = loadKnownUsers();
  const key = getUserKey(type, openid, accountId);
  const deleted = users.delete(key);
  if (deleted) {
    saveKnownUsers(users);
  }
  return deleted;
}

/**
 * 清除所有已知用户
 *
 * @param accountId - 可选，只清除指定账户的用户
 */
export function clearKnownUsers(accountId?: string): number {
  const users = loadKnownUsers();
  let count = 0;

  if (accountId) {
    for (const [key, user] of users) {
      if (user.accountId === accountId) {
        users.delete(key);
        count++;
      }
    }
  } else {
    count = users.size;
    users.clear();
  }

  if (count > 0) {
    saveKnownUsers(users);
  }
  return count;
}

// ============ 主动发送消息 ============

/**
 * 主动发送消息（带配置解析）
 * 注意：与 outbound.ts 中的 sendProactiveMessage 不同，这个函数接受 OpenClawConfig 并自动解析账户
 *
 * @param options - 发送选项
 * @param cfg - OpenClaw 配置
 * @returns 发送结果
 *
 * @example
 * ```typescript
 * // 发送私聊消息
 * const result = await sendProactive({
 *   to: "E7A8F3B2C1D4E5F6A7B8C9D0E1F2A3B4",  // 用户 openid
 *   text: "你好！这是一条主动消息",
 *   type: "c2c",
 * }, cfg);
 *
 * // 发送群聊消息
 * const result = await sendProactive({
 *   to: "A1B2C3D4E5F6A7B8",  // 群组 openid
 *   text: "群公告：今天有活动",
 *   type: "group",
 * }, cfg);
 *
 * // 发送带图片的消息
 * const result = await sendProactive({
 *   to: "E7A8F3B2C1D4E5F6A7B8C9D0E1F2A3B4",
 *   text: "看看这张图片",
 *   imageUrl: "https://example.com/image.png",
 *   type: "c2c",
 * }, cfg);
 * ```
 */
=======
): ReturnType<typeof getKnownUserImpl> {
  return getKnownUserImpl(accountId, openid, type as "c2c" | "group");
}

/** List known users with optional filtering and sorting (adapter). */
export function listKnownUsers(
  options?: ListKnownUsersOptions,
): ReturnType<typeof listKnownUsersImpl> {
  const type = options?.type;
  return listKnownUsersImpl({
    type: type === "channel" ? undefined : (type as "c2c" | "group" | undefined),
    accountId: options?.accountId,
    limit: options?.limit,
    sortBy: options?.sortByLastInteraction !== false ? "lastSeenAt" : undefined,
    sortOrder: "desc",
  });
}

/** Remove one known user entry (adapter). */
export function removeKnownUser(type: string, openid: string, accountId: string): boolean {
  return removeKnownUserImpl(accountId, openid, type as "c2c" | "group");
}

/** Clear all known users, optionally scoped to a single account (adapter). */
export function clearKnownUsers(accountId?: string): number {
  return clearKnownUsersImpl(accountId);
}

/** Resolve account config and send a proactive message. */
>>>>>>> upstream/main
export async function sendProactive(
  options: ProactiveSendOptions,
  cfg: OpenClawConfig,
): Promise<ProactiveSendResult> {
  const { to, text, type = "c2c", imageUrl, accountId = "default" } = options;

<<<<<<< HEAD
  // 解析账户配置
=======
>>>>>>> upstream/main
  const account = resolveQQBotAccount(cfg, accountId);

  if (!account.appId || !account.clientSecret) {
    return {
      success: false,
      error: "QQBot not configured (missing appId or clientSecret)",
    };
  }

  try {
    const accessToken = await getAccessToken(account.appId, account.clientSecret);

<<<<<<< HEAD
    // 如果有图片，先发送图片
    if (imageUrl) {
      try {
        if (type === "c2c") {
          await sendC2CImageMessage(accessToken, to, imageUrl, undefined, undefined);
        } else if (type === "group") {
          await sendGroupImageMessage(accessToken, to, imageUrl, undefined, undefined);
        }
        console.log(`[qqbot:proactive] Sent image to ${type}:${to}`);
      } catch (err) {
        console.error(`[qqbot:proactive] Failed to send image: ${err}`);
        // 图片发送失败不影响文本发送
      }
    }

    // 发送文本消息
    let result: { id: string; timestamp: number | string };

    if (type === "c2c") {
      result = await sendProactiveC2CMessage(accessToken, to, text);
    } else if (type === "group") {
      result = await sendProactiveGroupMessage(accessToken, to, text);
    } else if (type === "channel") {
      // 频道消息需要 channel_id，这里暂时不支持主动发送
=======
    if (imageUrl) {
      try {
        if (type === "c2c") {
          await sendC2CImageMessage(account.appId, accessToken, to, imageUrl, undefined, undefined);
        } else if (type === "group") {
          await sendGroupImageMessage(
            account.appId,
            accessToken,
            to,
            imageUrl,
            undefined,
            undefined,
          );
        }
        debugLog(`[qqbot:proactive] Sent image to ${type}:${to}`);
      } catch (err) {
        debugError(`[qqbot:proactive] Failed to send image: ${err}`);
      }
    }

    let result: { id: string; timestamp: number | string };

    if (type === "c2c") {
      result = await sendProactiveC2CMessage(account.appId, accessToken, to, text);
    } else if (type === "group") {
      result = await sendProactiveGroupMessage(account.appId, accessToken, to, text);
    } else if (type === "channel") {
>>>>>>> upstream/main
      return {
        success: false,
        error: "Channel proactive messages are not supported. Please use group or c2c.",
      };
    } else {
      return {
        success: false,
        error: `Unknown message type: ${type}`,
      };
    }

<<<<<<< HEAD
    console.log(`[qqbot:proactive] Sent message to ${type}:${to}, id: ${result.id}`);
=======
    debugLog(`[qqbot:proactive] Sent message to ${type}:${to}, id: ${result.id}`);
>>>>>>> upstream/main

    return {
      success: true,
      messageId: result.id,
      timestamp: result.timestamp,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
<<<<<<< HEAD
    console.error(`[qqbot:proactive] Failed to send message: ${message}`);
=======
    debugError(`[qqbot:proactive] Failed to send message: ${message}`);
>>>>>>> upstream/main

    return {
      success: false,
      error: message,
    };
  }
}

<<<<<<< HEAD
/**
 * 批量发送主动消息
 *
 * @param recipients - 接收者列表（openid 数组）
 * @param text - 消息内容
 * @param type - 消息类型
 * @param cfg - OpenClaw 配置
 * @param accountId - 账户 ID
 * @returns 发送结果列表
 */
=======
/** Send one proactive message to each recipient. */
>>>>>>> upstream/main
export async function sendBulkProactiveMessage(
  recipients: string[],
  text: string,
  type: "c2c" | "group",
  cfg: OpenClawConfig,
  accountId = "default",
): Promise<Array<{ to: string; result: ProactiveSendResult }>> {
  const results: Array<{ to: string; result: ProactiveSendResult }> = [];

  for (const to of recipients) {
    const result = await sendProactive({ to, text, type, accountId }, cfg);
    results.push({ to, result });

<<<<<<< HEAD
    // 添加延迟，避免频率限制
=======
    // Add a small delay to reduce rate-limit pressure.
>>>>>>> upstream/main
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return results;
}

/**
<<<<<<< HEAD
 * 发送消息给所有已知用户
 *
 * @param text - 消息内容
 * @param cfg - OpenClaw 配置
 * @param options - 过滤选项
 * @returns 发送结果统计
=======
 * Send a message to all known users.
 *
 * @param text Message content.
 * @param cfg OpenClaw config.
 * @param options Optional filters.
 * @returns Aggregate send statistics.
>>>>>>> upstream/main
 */
export async function broadcastMessage(
  text: string,
  cfg: OpenClawConfig,
  options?: {
    type?: "c2c" | "group";
    accountId?: string;
    limit?: number;
  },
): Promise<{
  total: number;
  success: number;
  failed: number;
  results: Array<{ to: string; result: ProactiveSendResult }>;
}> {
  const users = listKnownUsers({
    type: options?.type,
    accountId: options?.accountId,
    limit: options?.limit,
    sortByLastInteraction: true,
  });

<<<<<<< HEAD
  // 过滤掉频道用户（不支持主动发送）
=======
  // Channel recipients do not support proactive sends.
>>>>>>> upstream/main
  const validUsers = users.filter((u) => u.type === "c2c" || u.type === "group");

  const results: Array<{ to: string; result: ProactiveSendResult }> = [];
  let success = 0;
  let failed = 0;

  for (const user of validUsers) {
<<<<<<< HEAD
    const result = await sendProactive(
      {
        to: user.openid,
=======
    const targetId = user.type === "group" ? (user.groupOpenid ?? user.openid) : user.openid;
    const result = await sendProactive(
      {
        to: targetId,
>>>>>>> upstream/main
        text,
        type: user.type as "c2c" | "group",
        accountId: user.accountId,
      },
      cfg,
    );

<<<<<<< HEAD
    results.push({ to: user.openid, result });
=======
    results.push({ to: targetId, result });
>>>>>>> upstream/main

    if (result.success) {
      success++;
    } else {
      failed++;
    }

<<<<<<< HEAD
    // 添加延迟，避免频率限制
=======
    // Add a small delay to reduce rate-limit pressure.
>>>>>>> upstream/main
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return {
    total: validUsers.length,
    success,
    failed,
    results,
  };
}

<<<<<<< HEAD
// ============ 辅助函数 ============

/**
 * 根据账户配置直接发送主动消息（不需要 cfg）
 *
 * @param account - 已解析的账户配置
 * @param to - 目标 openid
 * @param text - 消息内容
 * @param type - 消息类型
=======
// Helpers.

/**
 * Send a proactive message using a resolved account without a full config object.
 *
 * @param account Resolved account configuration.
 * @param to Target openid.
 * @param text Message content.
 * @param type Message type.
>>>>>>> upstream/main
 */
export async function sendProactiveMessageDirect(
  account: ResolvedQQBotAccount,
  to: string,
  text: string,
  type: "c2c" | "group" = "c2c",
): Promise<ProactiveSendResult> {
  if (!account.appId || !account.clientSecret) {
    return {
      success: false,
      error: "QQBot not configured (missing appId or clientSecret)",
    };
  }

  try {
    const accessToken = await getAccessToken(account.appId, account.clientSecret);

    let result: { id: string; timestamp: number | string };

    if (type === "c2c") {
<<<<<<< HEAD
      result = await sendProactiveC2CMessage(accessToken, to, text);
    } else {
      result = await sendProactiveGroupMessage(accessToken, to, text);
=======
      result = await sendProactiveC2CMessage(account.appId, accessToken, to, text);
    } else {
      result = await sendProactiveGroupMessage(account.appId, accessToken, to, text);
>>>>>>> upstream/main
    }

    return {
      success: true,
      messageId: result.id,
      timestamp: result.timestamp,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
<<<<<<< HEAD
 * 获取已知用户统计
=======
 * Return known-user counts for the selected account.
>>>>>>> upstream/main
 */
export function getKnownUsersStats(accountId?: string): {
  total: number;
  c2c: number;
  group: number;
  channel: number;
} {
  const users = listKnownUsers({ accountId });

  return {
    total: users.length,
    c2c: users.filter((u) => u.type === "c2c").length,
    group: users.filter((u) => u.type === "group").length,
<<<<<<< HEAD
    channel: users.filter((u) => u.type === "channel").length,
=======
    channel: 0, // Channel users are not tracked in known-users storage.
>>>>>>> upstream/main
  };
}
