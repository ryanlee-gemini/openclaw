/**
<<<<<<< HEAD
 * file_info 缓存 — 借鉴 Telegram file_id 机制
 *
 * QQ Bot API 上传文件后返回 file_info + ttl，在 TTL 内相同文件可直接复用 file_info
 * 避免重复上传同一文件，节省带宽和时间。
 *
 * 缓存 key = md5(fileContent) + targetType(c2c/group) + targetId + fileType
=======
 * Cache `file_info` values returned by the QQ Bot API so identical uploads can be reused
 * before the server-side TTL expires.
>>>>>>> upstream/main
 */

import * as crypto from "node:crypto";
import * as fs from "node:fs";
<<<<<<< HEAD
=======
import { debugLog } from "./debug-log.js";
>>>>>>> upstream/main

interface CacheEntry {
  fileInfo: string;
  fileUuid: string;
<<<<<<< HEAD
  /** 过期时间戳（ms），比 API 返回的 TTL 提前 60 秒失效 */
  expiresAt: number;
}

// 内存缓存，key 格式：`${contentHash}:${scope}:${targetId}:${fileType}`
const cache = new Map<string, CacheEntry>();

// 最大缓存条目数，防止内存泄漏
const MAX_CACHE_SIZE = 500;

/**
 * 计算文件内容的 MD5 hash（用于缓存 key）
 * 对于 Base64 数据直接 hash，对于文件路径读取后 hash
 */
=======
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();
const MAX_CACHE_SIZE = 500;

/** Compute an MD5 hash used as part of the cache key. */
>>>>>>> upstream/main
export function computeFileHash(data: string | Buffer): string {
  const content = typeof data === "string" ? data : data;
  return crypto.createHash("md5").update(content).digest("hex");
}

<<<<<<< HEAD
/**
 * 构建缓存 key
 * @param contentHash - 文件内容 hash
 * @param scope - "c2c" | "group"
 * @param targetId - 用户 openid 或群 openid
 * @param fileType - 1=IMAGE, 2=VIDEO, 3=VOICE, 4=FILE
 */
=======
/** Build the in-memory cache key. */
>>>>>>> upstream/main
function buildCacheKey(
  contentHash: string,
  scope: string,
  targetId: string,
  fileType: number,
): string {
  return `${contentHash}:${scope}:${targetId}:${fileType}`;
}

<<<<<<< HEAD
/**
 * 从缓存获取 file_info
 * @returns file_info 字符串，未命中或已过期返回 null
 */
=======
/** Look up a cached `file_info` value. */
>>>>>>> upstream/main
export function getCachedFileInfo(
  contentHash: string,
  scope: "c2c" | "group",
  targetId: string,
  fileType: number,
): string | null {
  const key = buildCacheKey(contentHash, scope, targetId, fileType);
  const entry = cache.get(key);

  if (!entry) return null;

<<<<<<< HEAD
  // 检查是否过期
=======
>>>>>>> upstream/main
  if (Date.now() >= entry.expiresAt) {
    cache.delete(key);
    return null;
  }

<<<<<<< HEAD
  console.log(`[upload-cache] Cache HIT: key=${key.slice(0, 40)}..., fileUuid=${entry.fileUuid}`);
  return entry.fileInfo;
}

/**
 * 将上传结果写入缓存
 * @param ttl - API 返回的 TTL（秒），缓存会提前 60 秒失效
 */
=======
  debugLog(`[upload-cache] Cache HIT: key=${key.slice(0, 40)}..., fileUuid=${entry.fileUuid}`);
  return entry.fileInfo;
}

/** Store an upload result in the cache. */
>>>>>>> upstream/main
export function setCachedFileInfo(
  contentHash: string,
  scope: "c2c" | "group",
  targetId: string,
  fileType: number,
  fileInfo: string,
  fileUuid: string,
  ttl: number,
): void {
<<<<<<< HEAD
  // 清理过期条目（惰性清理）
=======
>>>>>>> upstream/main
  if (cache.size >= MAX_CACHE_SIZE) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now >= v.expiresAt) {
        cache.delete(k);
      }
    }
<<<<<<< HEAD
    // 如果清理后仍然超限，删除最早的一半
=======
>>>>>>> upstream/main
    if (cache.size >= MAX_CACHE_SIZE) {
      const keys = Array.from(cache.keys());
      for (let i = 0; i < keys.length / 2; i++) {
        cache.delete(keys[i]!);
      }
    }
  }

  const key = buildCacheKey(contentHash, scope, targetId, fileType);
<<<<<<< HEAD
  // 提前 60 秒失效，避免临界点过期
=======
>>>>>>> upstream/main
  const safetyMargin = 60;
  const effectiveTtl = Math.max(ttl - safetyMargin, 10);

  cache.set(key, {
    fileInfo,
    fileUuid,
    expiresAt: Date.now() + effectiveTtl * 1000,
  });

<<<<<<< HEAD
  console.log(
=======
  debugLog(
>>>>>>> upstream/main
    `[upload-cache] Cache SET: key=${key.slice(0, 40)}..., ttl=${effectiveTtl}s, uuid=${fileUuid}`,
  );
}

<<<<<<< HEAD
/**
 * 获取缓存统计
 */
=======
/** Return cache stats for diagnostics. */
>>>>>>> upstream/main
export function getUploadCacheStats(): { size: number; maxSize: number } {
  return { size: cache.size, maxSize: MAX_CACHE_SIZE };
}

<<<<<<< HEAD
/**
 * 清除所有缓存
 */
export function clearUploadCache(): void {
  cache.clear();
  console.log(`[upload-cache] Cache cleared`);
=======
/** Clear the upload cache. */
export function clearUploadCache(): void {
  cache.clear();
  debugLog(`[upload-cache] Cache cleared`);
>>>>>>> upstream/main
}
