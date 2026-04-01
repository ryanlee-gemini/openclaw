<<<<<<< HEAD
/**
 * 已知用户存储
 * 记录与机器人交互过的所有用户
 * 支持主动消息和批量通知功能
 */

import fs from "node:fs";
import path from "node:path";

// 已知用户信息接口
export interface KnownUser {
  /** 用户 openid（唯一标识） */
  openid: string;
  /** 消息类型：私聊用户 / 群组 */
  type: "c2c" | "group";
  /** 用户昵称（如有） */
  nickname?: string;
  /** 群组 openid（如果是群消息） */
  groupOpenid?: string;
  /** 关联的机器人账户 ID */
  accountId: string;
  /** 首次交互时间戳 */
  firstSeenAt: number;
  /** 最后交互时间戳 */
  lastSeenAt: number;
  /** 交互次数 */
=======
import fs from "node:fs";
import path from "node:path";
import { debugLog, debugError } from "./utils/debug-log.js";

/** Persisted record for a user who has interacted with the bot. */
export interface KnownUser {
  openid: string;
  type: "c2c" | "group";
  nickname?: string;
  groupOpenid?: string;
  accountId: string;
  firstSeenAt: number;
  lastSeenAt: number;
>>>>>>> upstream/main
  interactionCount: number;
}

import { getQQBotDataDir } from "./utils/platform.js";

<<<<<<< HEAD
// 存储文件路径
const KNOWN_USERS_DIR = getQQBotDataDir("data");
const KNOWN_USERS_FILE = path.join(KNOWN_USERS_DIR, "known-users.json");

// 内存缓存
let usersCache: Map<string, KnownUser> | null = null;

// 写入节流配置
const SAVE_THROTTLE_MS = 5000; // 5秒写入一次
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let isDirty = false;

/**
 * 确保目录存在
 */
=======
const KNOWN_USERS_DIR = getQQBotDataDir("data");
const KNOWN_USERS_FILE = path.join(KNOWN_USERS_DIR, "known-users.json");

let usersCache: Map<string, KnownUser> | null = null;

const SAVE_THROTTLE_MS = 5000;
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let isDirty = false;

/** Ensure the data directory exists. */
>>>>>>> upstream/main
function ensureDir(): void {
  if (!fs.existsSync(KNOWN_USERS_DIR)) {
    fs.mkdirSync(KNOWN_USERS_DIR, { recursive: true });
  }
}

<<<<<<< HEAD
/**
 * 从文件加载用户数据到缓存
 */
=======
/** Load persisted users into the in-memory cache. */
>>>>>>> upstream/main
function loadUsersFromFile(): Map<string, KnownUser> {
  if (usersCache !== null) {
    return usersCache;
  }

  usersCache = new Map();

  try {
    if (fs.existsSync(KNOWN_USERS_FILE)) {
      const data = fs.readFileSync(KNOWN_USERS_FILE, "utf-8");
      const users = JSON.parse(data) as KnownUser[];

      for (const user of users) {
<<<<<<< HEAD
        // 使用复合键：accountId + type + openid（群组还要加 groupOpenid）
=======
>>>>>>> upstream/main
        const key = makeUserKey(user);
        usersCache.set(key, user);
      }

<<<<<<< HEAD
      console.log(`[known-users] Loaded ${usersCache.size} users`);
    }
  } catch (err) {
    console.error(`[known-users] Failed to load users: ${err}`);
=======
      debugLog(`[known-users] Loaded ${usersCache.size} users`);
    }
  } catch (err) {
    debugError(`[known-users] Failed to load users: ${err}`);
>>>>>>> upstream/main
    usersCache = new Map();
  }

  return usersCache;
}

<<<<<<< HEAD
/**
 * 保存用户数据到文件（节流版本）
 */
=======
/** Schedule a throttled write to disk. */
>>>>>>> upstream/main
function saveUsersToFile(): void {
  if (!isDirty) return;

  if (saveTimer) {
<<<<<<< HEAD
    return; // 已有定时器在等待
=======
    return;
>>>>>>> upstream/main
  }

  saveTimer = setTimeout(() => {
    saveTimer = null;
    doSaveUsersToFile();
  }, SAVE_THROTTLE_MS);
}

<<<<<<< HEAD
/**
 * 实际执行保存
 */
=======
/** Perform the actual write to disk. */
>>>>>>> upstream/main
function doSaveUsersToFile(): void {
  if (!usersCache || !isDirty) return;

  try {
    ensureDir();
    const users = Array.from(usersCache.values());
    fs.writeFileSync(KNOWN_USERS_FILE, JSON.stringify(users, null, 2), "utf-8");
    isDirty = false;
  } catch (err) {
<<<<<<< HEAD
    console.error(`[known-users] Failed to save users: ${err}`);
  }
}

/**
 * 强制立即保存（用于进程退出前）
 */
=======
    debugError(`[known-users] Failed to save users: ${err}`);
  }
}

/** Flush pending writes immediately, typically during shutdown. */
>>>>>>> upstream/main
export function flushKnownUsers(): void {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  doSaveUsersToFile();
}

<<<<<<< HEAD
/**
 * 生成用户唯一键
 */
=======
/** Build a stable composite key for one user record. */
>>>>>>> upstream/main
function makeUserKey(user: Partial<KnownUser>): string {
  const base = `${user.accountId}:${user.type}:${user.openid}`;
  if (user.type === "group" && user.groupOpenid) {
    return `${base}:${user.groupOpenid}`;
  }
  return base;
}

<<<<<<< HEAD
/**
 * 记录已知用户（收到消息时调用）
 * @param user 用户信息（部分字段）
 */
=======
/** Record a known user whenever a message is received. */
>>>>>>> upstream/main
export function recordKnownUser(user: {
  openid: string;
  type: "c2c" | "group";
  nickname?: string;
  groupOpenid?: string;
  accountId: string;
}): void {
  const cache = loadUsersFromFile();
  const key = makeUserKey(user);
  const now = Date.now();

  const existing = cache.get(key);

  if (existing) {
<<<<<<< HEAD
    // 更新已存在的用户
=======
>>>>>>> upstream/main
    existing.lastSeenAt = now;
    existing.interactionCount++;
    if (user.nickname && user.nickname !== existing.nickname) {
      existing.nickname = user.nickname;
    }
  } else {
<<<<<<< HEAD
    // 新用户
=======
>>>>>>> upstream/main
    const newUser: KnownUser = {
      openid: user.openid,
      type: user.type,
      nickname: user.nickname,
      groupOpenid: user.groupOpenid,
      accountId: user.accountId,
      firstSeenAt: now,
      lastSeenAt: now,
      interactionCount: 1,
    };
    cache.set(key, newUser);
<<<<<<< HEAD
    console.log(`[known-users] New user: ${user.openid} (${user.type})`);
=======
    debugLog(`[known-users] New user: ${user.openid} (${user.type})`);
>>>>>>> upstream/main
  }

  isDirty = true;
  saveUsersToFile();
}

<<<<<<< HEAD
/**
 * 获取单个用户信息
 * @param accountId 机器人账户 ID
 * @param openid 用户 openid
 * @param type 消息类型
 * @param groupOpenid 群组 openid（可选）
 */
=======
/** Look up one known user. */
>>>>>>> upstream/main
export function getKnownUser(
  accountId: string,
  openid: string,
  type: "c2c" | "group" = "c2c",
  groupOpenid?: string,
): KnownUser | undefined {
  const cache = loadUsersFromFile();
  const key = makeUserKey({ accountId, openid, type, groupOpenid });
  return cache.get(key);
}

<<<<<<< HEAD
/**
 * 列出所有已知用户
 * @param options 筛选选项
 */
export function listKnownUsers(options?: {
  /** 筛选特定机器人账户的用户 */
  accountId?: string;
  /** 筛选消息类型 */
  type?: "c2c" | "group";
  /** 最近活跃时间（毫秒，如 86400000 表示最近 24 小时） */
  activeWithin?: number;
  /** 返回数量限制 */
  limit?: number;
  /** 排序方式 */
  sortBy?: "lastSeenAt" | "firstSeenAt" | "interactionCount";
  /** 排序方向 */
=======
/** List known users with optional filtering and sorting. */
export function listKnownUsers(options?: {
  accountId?: string;
  type?: "c2c" | "group";
  activeWithin?: number;
  limit?: number;
  sortBy?: "lastSeenAt" | "firstSeenAt" | "interactionCount";
>>>>>>> upstream/main
  sortOrder?: "asc" | "desc";
}): KnownUser[] {
  const cache = loadUsersFromFile();
  let users = Array.from(cache.values());

<<<<<<< HEAD
  // 筛选
=======
>>>>>>> upstream/main
  if (options?.accountId) {
    users = users.filter((u) => u.accountId === options.accountId);
  }
  if (options?.type) {
    users = users.filter((u) => u.type === options.type);
  }
  if (options?.activeWithin) {
    const cutoff = Date.now() - options.activeWithin;
    users = users.filter((u) => u.lastSeenAt >= cutoff);
  }

<<<<<<< HEAD
  // 排序
=======
>>>>>>> upstream/main
  const sortBy = options?.sortBy ?? "lastSeenAt";
  const sortOrder = options?.sortOrder ?? "desc";
  users.sort((a, b) => {
    const aVal = a[sortBy] ?? 0;
    const bVal = b[sortBy] ?? 0;
    return sortOrder === "asc" ? aVal - bVal : bVal - aVal;
  });

<<<<<<< HEAD
  // 限制数量
=======
>>>>>>> upstream/main
  if (options?.limit && options.limit > 0) {
    users = users.slice(0, options.limit);
  }

  return users;
}

<<<<<<< HEAD
/**
 * 获取用户统计信息
 * @param accountId 机器人账户 ID（可选，不传则返回所有账户的统计）
 */
=======
/** Return summary stats for known users. */
>>>>>>> upstream/main
export function getKnownUsersStats(accountId?: string): {
  totalUsers: number;
  c2cUsers: number;
  groupUsers: number;
  activeIn24h: number;
  activeIn7d: number;
} {
  let users = listKnownUsers({ accountId });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  return {
    totalUsers: users.length,
    c2cUsers: users.filter((u) => u.type === "c2c").length,
    groupUsers: users.filter((u) => u.type === "group").length,
    activeIn24h: users.filter((u) => now - u.lastSeenAt < day).length,
    activeIn7d: users.filter((u) => now - u.lastSeenAt < 7 * day).length,
  };
}

<<<<<<< HEAD
/**
 * 删除用户记录
 * @param accountId 机器人账户 ID
 * @param openid 用户 openid
 * @param type 消息类型
 * @param groupOpenid 群组 openid（可选）
 */
=======
/** Remove one user record. */
>>>>>>> upstream/main
export function removeKnownUser(
  accountId: string,
  openid: string,
  type: "c2c" | "group" = "c2c",
  groupOpenid?: string,
): boolean {
  const cache = loadUsersFromFile();
  const key = makeUserKey({ accountId, openid, type, groupOpenid });

  if (cache.has(key)) {
    cache.delete(key);
    isDirty = true;
    saveUsersToFile();
<<<<<<< HEAD
    console.log(`[known-users] Removed user ${openid}`);
=======
    debugLog(`[known-users] Removed user ${openid}`);
>>>>>>> upstream/main
    return true;
  }

  return false;
}

<<<<<<< HEAD
/**
 * 清除所有用户记录
 * @param accountId 机器人账户 ID（可选，不传则清除所有）
 */
=======
/** Clear all user records, optionally scoped to one account. */
>>>>>>> upstream/main
export function clearKnownUsers(accountId?: string): number {
  const cache = loadUsersFromFile();
  let count = 0;

  if (accountId) {
<<<<<<< HEAD
    // 只清除指定账户的用户
=======
>>>>>>> upstream/main
    for (const [key, user] of cache.entries()) {
      if (user.accountId === accountId) {
        cache.delete(key);
        count++;
      }
    }
  } else {
<<<<<<< HEAD
    // 清除所有
=======
>>>>>>> upstream/main
    count = cache.size;
    cache.clear();
  }

  if (count > 0) {
    isDirty = true;
<<<<<<< HEAD
    doSaveUsersToFile(); // 立即保存
    console.log(`[known-users] Cleared ${count} users`);
=======
    doSaveUsersToFile();
    debugLog(`[known-users] Cleared ${count} users`);
>>>>>>> upstream/main
  }

  return count;
}

<<<<<<< HEAD
/**
 * 获取用户的所有群组（某用户在哪些群里交互过）
 * @param accountId 机器人账户 ID
 * @param openid 用户 openid
 */
=======
/** Return all groups in which a user has interacted. */
>>>>>>> upstream/main
export function getUserGroups(accountId: string, openid: string): string[] {
  const users = listKnownUsers({ accountId, type: "group" });
  return users.filter((u) => u.openid === openid && u.groupOpenid).map((u) => u.groupOpenid!);
}

<<<<<<< HEAD
/**
 * 获取群组的所有成员
 * @param accountId 机器人账户 ID
 * @param groupOpenid 群组 openid
 */
=======
/** Return all recorded members for one group. */
>>>>>>> upstream/main
export function getGroupMembers(accountId: string, groupOpenid: string): KnownUser[] {
  return listKnownUsers({ accountId, type: "group" }).filter((u) => u.groupOpenid === groupOpenid);
}
