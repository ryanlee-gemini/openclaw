<<<<<<< HEAD
/**
 * QQ Bot API 鉴权和请求封装
 */

=======
import { createRequire } from "node:module";
import os from "node:os";
import { debugLog, debugError } from "./utils/debug-log.js";
>>>>>>> upstream/main
import { sanitizeFileName } from "./utils/platform.js";
import { computeFileHash, getCachedFileInfo, setCachedFileInfo } from "./utils/upload-cache.js";

const API_BASE = "https://api.sgroup.qq.com";
const TOKEN_URL = "https://bots.qq.com/app/getAppAccessToken";

<<<<<<< HEAD
// 运行时配置
let currentMarkdownSupport = false;

/**
 * 初始化 API 配置
 * @param options.markdownSupport - 是否支持 markdown 消息（默认 false，需要机器人具备该权限才能启用）
 */
export function initApiConfig(options: { markdownSupport?: boolean }): void {
  currentMarkdownSupport = options.markdownSupport === true; // 默认为 false，需要机器人具备 markdown 消息权限才能启用
}

/**
 * 获取当前是否支持 markdown
 */
export function isMarkdownSupport(): boolean {
  return currentMarkdownSupport;
}

let cachedToken: { token: string; expiresAt: number; appId: string } | null = null;
// Singleflight: 防止并发获取 Token 的 Promise 缓存
let tokenFetchPromise: Promise<string> | null = null;

/**
 * 获取 AccessToken（带缓存 + singleflight 并发安全）
 *
 * 使用 singleflight 模式：当多个请求同时发现 Token 过期时，
 * 只有第一个请求会真正去获取新 Token，其他请求复用同一个 Promise。
 *
 * 当 appId 发生变化时，自动使旧缓存失效并获取新 Token。
 */
export async function getAccessToken(appId: string, clientSecret: string): Promise<string> {
  // 检查缓存：未过期 且 appId 未变化 时复用
  if (
    cachedToken &&
    Date.now() < cachedToken.expiresAt - 5 * 60 * 1000 &&
    cachedToken.appId === appId
  ) {
    return cachedToken.token;
  }

  // appId 变化时，主动清除旧缓存
  if (cachedToken && cachedToken.appId !== appId) {
    console.log(
      `[qqbot-api] appId changed (${cachedToken.appId} → ${appId}), clearing token cache`,
    );
    cachedToken = null;
    tokenFetchPromise = null; // 旧 appId 的 inflight 请求也作废
  }

  // Singleflight: 如果已有进行中的 Token 获取请求，复用它
  if (tokenFetchPromise) {
    console.log(`[qqbot-api] Token fetch in progress, waiting for existing request...`);
    return tokenFetchPromise;
  }

  // 创建新的 Token 获取 Promise（singleflight 入口）
  tokenFetchPromise = (async () => {
    try {
      return await doFetchToken(appId, clientSecret);
    } finally {
      // 无论成功失败，都清除 Promise 缓存
      tokenFetchPromise = null;
    }
  })();

  return tokenFetchPromise;
}

/**
 * 实际执行 Token 获取的内部函数
 */
async function doFetchToken(appId: string, clientSecret: string): Promise<string> {
  const requestBody = { appId, clientSecret };
  const requestHeaders = { "Content-Type": "application/json" };

  // 打印请求信息（隐藏敏感信息）
  console.log(`[qqbot-api] >>> POST ${TOKEN_URL}`);
  console.log(`[qqbot-api] >>> Headers:`, JSON.stringify(requestHeaders, null, 2));
  console.log(`[qqbot-api] >>> Body:`, JSON.stringify({ appId, clientSecret: "***" }, null, 2));
=======
// Plugin User-Agent format: QQBotPlugin/{version} (Node/{nodeVersion}; {os})
const _require = createRequire(import.meta.url);
let _pluginVersion = "unknown";
try {
  _pluginVersion = _require("../package.json").version ?? "unknown";
} catch {
  /* fallback */
}
export const PLUGIN_USER_AGENT = `QQBotPlugin/${_pluginVersion} (Node/${process.versions.node}; ${os.platform()})`;

// =========================================================================
// Per-appId runtime config (avoids multi-account global state conflicts)
// =========================================================================
const markdownSupportMap = new Map<string, boolean>();

/** Structured metadata recorded for outbound messages. */
export interface OutboundMeta {
  text?: string;
  mediaType?: "image" | "voice" | "video" | "file";
  mediaUrl?: string;
  mediaLocalPath?: string;
  ttsText?: string;
}

type OnMessageSentCallback = (refIdx: string, meta: OutboundMeta) => void;
const onMessageSentHookMap = new Map<string, OnMessageSentCallback>();

/** Register an outbound-message hook scoped to one appId. */
export function onMessageSent(appId: string, callback: OnMessageSentCallback): void {
  onMessageSentHookMap.set(String(appId).trim(), callback);
}

/** Initialize per-app API behavior such as markdown support. */
export function initApiConfig(appId: string, options: { markdownSupport?: boolean }): void {
  markdownSupportMap.set(String(appId).trim(), options.markdownSupport === true);
}

/** Return whether markdown is enabled for the given appId. */
export function isMarkdownSupport(appId: string): boolean {
  return markdownSupportMap.get(String(appId).trim()) ?? false;
}

// Keep token state per appId to avoid multi-account cross-talk.
const tokenCacheMap = new Map<string, { token: string; expiresAt: number; appId: string }>();
const tokenFetchPromises = new Map<string, Promise<string>>();

/**
 * Resolve an access token with caching and singleflight semantics.
 */
export async function getAccessToken(appId: string, clientSecret: string): Promise<string> {
  const normalizedAppId = String(appId).trim();
  const cachedToken = tokenCacheMap.get(normalizedAppId);

  // Refresh slightly ahead of expiry without making short-lived tokens unusable.
  const REFRESH_AHEAD_MS = cachedToken
    ? Math.min(5 * 60 * 1000, (cachedToken.expiresAt - Date.now()) / 3)
    : 0;
  if (cachedToken && Date.now() < cachedToken.expiresAt - REFRESH_AHEAD_MS) {
    return cachedToken.token;
  }

  let fetchPromise = tokenFetchPromises.get(normalizedAppId);
  if (fetchPromise) {
    debugLog(
      `[qqbot-api:${normalizedAppId}] Token fetch in progress, waiting for existing request...`,
    );
    return fetchPromise;
  }

  fetchPromise = (async () => {
    try {
      return await doFetchToken(normalizedAppId, clientSecret);
    } finally {
      tokenFetchPromises.delete(normalizedAppId);
    }
  })();

  tokenFetchPromises.set(normalizedAppId, fetchPromise);
  return fetchPromise;
}

/** Perform the token fetch request. */
async function doFetchToken(appId: string, clientSecret: string): Promise<string> {
  const requestBody = { appId, clientSecret };
  const requestHeaders = { "Content-Type": "application/json", "User-Agent": PLUGIN_USER_AGENT };

  debugLog(`[qqbot-api:${appId}] >>> POST ${TOKEN_URL}`);
>>>>>>> upstream/main

  let response: Response;
  try {
    response = await fetch(TOKEN_URL, {
      method: "POST",
      headers: requestHeaders,
      body: JSON.stringify(requestBody),
    });
  } catch (err) {
<<<<<<< HEAD
    console.error(`[qqbot-api] <<< Network error:`, err);
=======
    debugError(`[qqbot-api:${appId}] <<< Network error:`, err);
>>>>>>> upstream/main
    throw new Error(
      `Network error getting access_token: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

<<<<<<< HEAD
  // 打印响应头
=======
>>>>>>> upstream/main
  const responseHeaders: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });
<<<<<<< HEAD
  console.log(`[qqbot-api] <<< Status: ${response.status} ${response.statusText}`);
  console.log(`[qqbot-api] <<< Headers:`, JSON.stringify(responseHeaders, null, 2));
=======
  const tokenTraceId = response.headers.get("x-tps-trace-id") ?? "";
  debugLog(
    `[qqbot-api:${appId}] <<< Status: ${response.status} ${response.statusText}${tokenTraceId ? ` | TraceId: ${tokenTraceId}` : ""}`,
  );
>>>>>>> upstream/main

  let data: { access_token?: string; expires_in?: number };
  let rawBody: string;
  try {
    rawBody = await response.text();
<<<<<<< HEAD
    // 隐藏 token 值
    const logBody = rawBody.replace(/"access_token"\s*:\s*"[^"]+"/g, '"access_token": "***"');
    console.log(`[qqbot-api] <<< Body:`, logBody);
    data = JSON.parse(rawBody) as { access_token?: string; expires_in?: number };
  } catch (err) {
    console.error(`[qqbot-api] <<< Parse error:`, err);
=======
    // Redact the token before logging the raw response body.
    const logBody = rawBody.replace(/"access_token"\s*:\s*"[^"]+"/g, '"access_token": "***"');
    debugLog(`[qqbot-api:${appId}] <<< Body:`, logBody);
    data = JSON.parse(rawBody) as { access_token?: string; expires_in?: number };
  } catch (err) {
    debugError(`[qqbot-api:${appId}] <<< Parse error:`, err);
>>>>>>> upstream/main
    throw new Error(
      `Failed to parse access_token response: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  if (!data.access_token) {
    throw new Error(`Failed to get access_token: ${JSON.stringify(data)}`);
  }

<<<<<<< HEAD
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + (data.expires_in ?? 7200) * 1000,
    appId,
  };

  console.log(
    `[qqbot-api] Token cached for appId=${appId}, expires at: ${new Date(cachedToken.expiresAt).toISOString()}`,
  );
  return cachedToken.token;
}

/**
 * 清除 Token 缓存
 */
export function clearTokenCache(): void {
  cachedToken = null;
  // 注意：不清除 tokenFetchPromise，让进行中的请求完成
  // 下次调用 getAccessToken 时会自动获取新 Token
}

/**
 * 获取 Token 缓存状态（用于监控）
 */
export function getTokenStatus(): {
  status: "valid" | "expired" | "refreshing" | "none";
  expiresAt: number | null;
} {
  if (tokenFetchPromise) {
    return { status: "refreshing", expiresAt: cachedToken?.expiresAt ?? null };
  }
  if (!cachedToken) {
    return { status: "none", expiresAt: null };
  }
  const isValid = Date.now() < cachedToken.expiresAt - 5 * 60 * 1000;
  return { status: isValid ? "valid" : "expired", expiresAt: cachedToken.expiresAt };
}

/**
 * 获取全局唯一的消息序号（范围 0 ~ 65535）
 * 使用毫秒级时间戳低位 + 随机数异或混合，无状态，避免碰撞
 * @param _msgId - 保留参数，不再用于分桶计数
 */
export function getNextMsgSeq(_msgId: string): number {
  const timePart = Date.now() % 100000000; // 毫秒时间戳后8位
  const random = Math.floor(Math.random() * 65536); // 0~65535
  return (timePart ^ random) % 65536; // 异或混合后限制在 0~65535
}

// API 请求超时配置（毫秒）
const DEFAULT_API_TIMEOUT = 30000; // 默认 30 秒
const FILE_UPLOAD_TIMEOUT = 120000; // 文件上传 120 秒

/**
 * API 请求封装
 * @param accessToken 访问令牌
 * @param method 请求方法
 * @param path 请求路径
 * @param body 请求体
 * @param timeoutMs 超时时间（毫秒），不传则根据请求类型自动选择
 */
=======
  const expiresAt = Date.now() + (data.expires_in ?? 7200) * 1000;

  tokenCacheMap.set(appId, {
    token: data.access_token,
    expiresAt,
    appId,
  });

  debugLog(`[qqbot-api:${appId}] Token cached, expires at: ${new Date(expiresAt).toISOString()}`);
  return data.access_token;
}

/** Clear one token cache or all token caches. */
export function clearTokenCache(appId?: string): void {
  if (appId) {
    const normalizedAppId = String(appId).trim();
    tokenCacheMap.delete(normalizedAppId);
    debugLog(`[qqbot-api:${normalizedAppId}] Token cache cleared manually.`);
  } else {
    tokenCacheMap.clear();
    debugLog(`[qqbot-api] All token caches cleared.`);
  }
}

/** Return token-cache status for diagnostics. */
export function getTokenStatus(appId: string): {
  status: "valid" | "expired" | "refreshing" | "none";
  expiresAt: number | null;
} {
  if (tokenFetchPromises.has(appId)) {
    return { status: "refreshing", expiresAt: tokenCacheMap.get(appId)?.expiresAt ?? null };
  }
  const cached = tokenCacheMap.get(appId);
  if (!cached) {
    return { status: "none", expiresAt: null };
  }
  const remaining = cached.expiresAt - Date.now();
  const isValid = remaining > Math.min(5 * 60 * 1000, remaining / 3);
  return { status: isValid ? "valid" : "expired", expiresAt: cached.expiresAt };
}

/** Generate a message sequence in the 0..65535 range. */
export function getNextMsgSeq(_msgId: string): number {
  const timePart = Date.now() % 100000000;
  const random = Math.floor(Math.random() * 65536);
  return (timePart ^ random) % 65536;
}

const DEFAULT_API_TIMEOUT = 30000;
const FILE_UPLOAD_TIMEOUT = 120000;

/** Shared API request wrapper. */
>>>>>>> upstream/main
export async function apiRequest<T = unknown>(
  accessToken: string,
  method: string,
  path: string,
  body?: unknown,
  timeoutMs?: number,
): Promise<T> {
  const url = `${API_BASE}${path}`;
  const headers: Record<string, string> = {
    Authorization: `QQBot ${accessToken}`,
    "Content-Type": "application/json",
<<<<<<< HEAD
  };

  // 根据请求类型自动选择超时时间
  // 文件上传接口 (/files) 使用更长的超时时间
  const isFileUpload = path.includes("/files");
  const timeout = timeoutMs ?? (isFileUpload ? FILE_UPLOAD_TIMEOUT : DEFAULT_API_TIMEOUT);

  // 创建 AbortController 用于超时控制
=======
    "User-Agent": PLUGIN_USER_AGENT,
  };

  const isFileUpload = path.includes("/files");
  const timeout = timeoutMs ?? (isFileUpload ? FILE_UPLOAD_TIMEOUT : DEFAULT_API_TIMEOUT);

>>>>>>> upstream/main
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeout);

  const options: RequestInit = {
    method,
    headers,
    signal: controller.signal,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

<<<<<<< HEAD
  // 打印请求信息
  console.log(`[qqbot-api] >>> ${method} ${url} (timeout: ${timeout}ms)`);
  console.log(`[qqbot-api] >>> Headers:`, JSON.stringify(headers, null, 2));
  if (body) {
    // 过滤 file_data 等大二进制字段，避免刷屏
=======
  debugLog(`[qqbot-api] >>> ${method} ${url} (timeout: ${timeout}ms)`);
  if (body) {
>>>>>>> upstream/main
    const logBody = { ...body } as Record<string, unknown>;
    if (typeof logBody.file_data === "string") {
      logBody.file_data = `<base64 ${(logBody.file_data as string).length} chars>`;
    }
<<<<<<< HEAD
    console.log(`[qqbot-api] >>> Body:`, JSON.stringify(logBody, null, 2));
=======
    debugLog(`[qqbot-api] >>> Body:`, JSON.stringify(logBody));
>>>>>>> upstream/main
  }

  let res: Response;
  try {
    res = await fetch(url, options);
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
<<<<<<< HEAD
      console.error(`[qqbot-api] <<< Request timeout after ${timeout}ms`);
      throw new Error(`Request timeout [${path}]: exceeded ${timeout}ms`);
    }
    console.error(`[qqbot-api] <<< Network error:`, err);
=======
      debugError(`[qqbot-api] <<< Request timeout after ${timeout}ms`);
      throw new Error(`Request timeout[${path}]: exceeded ${timeout}ms`);
    }
    debugError(`[qqbot-api] <<< Network error:`, err);
>>>>>>> upstream/main
    throw new Error(`Network error [${path}]: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timeoutId);
  }

<<<<<<< HEAD
  // 打印响应头
=======
>>>>>>> upstream/main
  const responseHeaders: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    responseHeaders[key] = value;
  });
<<<<<<< HEAD
  console.log(`[qqbot-api] <<< Status: ${res.status} ${res.statusText}`);
  console.log(`[qqbot-api] <<< Headers:`, JSON.stringify(responseHeaders, null, 2));
=======
  const traceId = res.headers.get("x-tps-trace-id") ?? "";
  debugLog(
    `[qqbot-api] <<< Status: ${res.status} ${res.statusText}${traceId ? ` | TraceId: ${traceId}` : ""}`,
  );
>>>>>>> upstream/main

  let data: T;
  let rawBody: string;
  try {
    rawBody = await res.text();
<<<<<<< HEAD
    console.log(`[qqbot-api] <<< Body:`, rawBody);
    data = JSON.parse(rawBody) as T;
  } catch (err) {
    console.error(`[qqbot-api] <<< Parse error:`, err);
    throw new Error(
      `Failed to parse response [${path}]: ${err instanceof Error ? err.message : String(err)}`,
=======
    debugLog(`[qqbot-api] <<< Body:`, rawBody);
    data = JSON.parse(rawBody) as T;
  } catch (err) {
    throw new Error(
      `Failed to parse response[${path}]: ${err instanceof Error ? err.message : String(err)}`,
>>>>>>> upstream/main
    );
  }

  if (!res.ok) {
    const error = data as { message?: string; code?: number };
    throw new Error(`API Error [${path}]: ${error.message ?? JSON.stringify(data)}`);
  }

  return data;
}

<<<<<<< HEAD
// ============ 上传重试（指数退避） ============

/** 上传重试配置 */
const UPLOAD_MAX_RETRIES = 2;
const UPLOAD_BASE_DELAY_MS = 1000; // 首次重试等待 1 秒

/**
 * 带指数退避重试的 API 请求
 * 仅用于上传类请求（/files），普通请求不重试
 */
=======
// Upload retry with exponential backoff.

const UPLOAD_MAX_RETRIES = 2;
const UPLOAD_BASE_DELAY_MS = 1000;

>>>>>>> upstream/main
async function apiRequestWithRetry<T = unknown>(
  accessToken: string,
  method: string,
  path: string,
  body?: unknown,
  maxRetries = UPLOAD_MAX_RETRIES,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await apiRequest<T>(accessToken, method, path, body);
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

<<<<<<< HEAD
      // 不对以下错误重试，直接快速失败：
      // - 参数错误(400)、鉴权错误(401)、格式错误
      // - 服务端返回"上传超时"（QQ 平台侧拉取资源超时，重试也没用）
      // - 本地请求超时（已等够 120s）
=======
>>>>>>> upstream/main
      const errMsg = lastError.message;
      if (
        errMsg.includes("400") ||
        errMsg.includes("401") ||
        errMsg.includes("Invalid") ||
<<<<<<< HEAD
        errMsg.includes("上传超时") ||
=======
        errMsg.includes("upload timeout") ||
>>>>>>> upstream/main
        errMsg.includes("timeout") ||
        errMsg.includes("Timeout")
      ) {
        throw lastError;
      }

      if (attempt < maxRetries) {
<<<<<<< HEAD
        const delay = UPLOAD_BASE_DELAY_MS * Math.pow(2, attempt); // 1s, 2s
        console.log(
=======
        const delay = UPLOAD_BASE_DELAY_MS * Math.pow(2, attempt);
        debugLog(
>>>>>>> upstream/main
          `[qqbot-api] Upload attempt ${attempt + 1} failed, retrying in ${delay}ms: ${errMsg.slice(0, 100)}`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

<<<<<<< HEAD
/**
 * 获取 WebSocket Gateway URL
 */
=======
>>>>>>> upstream/main
export async function getGatewayUrl(accessToken: string): Promise<string> {
  const data = await apiRequest<{ url: string }>(accessToken, "GET", "/gateway");
  return data.url;
}

<<<<<<< HEAD
// ============ 消息发送接口 ============

/**
 * 消息响应
 */
export interface MessageResponse {
  id: string;
  timestamp: number | string;
}

/**
 * 构建消息体
 * 根据 markdownSupport 配置决定消息格式：
 * - markdown 模式: { markdown: { content }, msg_type: 2 }
 * - 纯文本模式: { content, msg_type: 0 }
 */
function buildMessageBody(
  content: string,
  msgId: string | undefined,
  msgSeq: number,
): Record<string, unknown> {
  const body: Record<string, unknown> = currentMarkdownSupport
=======
// Message sending.

export interface MessageResponse {
  id: string;
  timestamp: number | string;
  ext_info?: {
    ref_idx?: string;
  };
}

/**
 * Send a message and invoke the refIdx hook when QQ returns one.
 */
async function sendAndNotify(
  appId: string,
  accessToken: string,
  method: string,
  path: string,
  body: unknown,
  meta: OutboundMeta,
): Promise<MessageResponse> {
  const result = await apiRequest<MessageResponse>(accessToken, method, path, body);
  const hook = onMessageSentHookMap.get(String(appId).trim());
  if (result.ext_info?.ref_idx && hook) {
    try {
      hook(result.ext_info.ref_idx, meta);
    } catch (err) {
      debugError(`[qqbot-api:${appId}] onMessageSent hook error: ${err}`);
    }
  }
  return result;
}

function buildMessageBody(
  appId: string,
  content: string,
  msgId: string | undefined,
  msgSeq: number,
  messageReference?: string,
): Record<string, unknown> {
  const md = isMarkdownSupport(appId);
  const body: Record<string, unknown> = md
>>>>>>> upstream/main
    ? {
        markdown: { content },
        msg_type: 2,
        msg_seq: msgSeq,
      }
    : {
        content,
        msg_type: 0,
        msg_seq: msgSeq,
      };

  if (msgId) {
    body.msg_id = msgId;
  }
<<<<<<< HEAD

  return body;
}

/**
 * 发送 C2C 单聊消息
 */
export async function sendC2CMessage(
=======
  if (messageReference && !md) {
    body.message_reference = { message_id: messageReference };
  }
  return body;
}

export async function sendC2CMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  openid: string,
  content: string,
  msgId?: string,
<<<<<<< HEAD
): Promise<MessageResponse> {
  const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
  const body = buildMessageBody(content, msgId, msgSeq);

  return apiRequest(accessToken, "POST", `/v2/users/${openid}/messages`, body);
}

/**
 * 发送 C2C 输入状态提示（告知用户机器人正在输入）
 */
=======
  messageReference?: string,
): Promise<MessageResponse> {
  const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
  const body = buildMessageBody(appId, content, msgId, msgSeq, messageReference);
  return sendAndNotify(appId, accessToken, "POST", `/v2/users/${openid}/messages`, body, {
    text: content,
  });
}

>>>>>>> upstream/main
export async function sendC2CInputNotify(
  accessToken: string,
  openid: string,
  msgId?: string,
  inputSecond: number = 60,
<<<<<<< HEAD
): Promise<void> {
=======
): Promise<{ refIdx?: string }> {
>>>>>>> upstream/main
  const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
  const body = {
    msg_type: 6,
    input_notify: {
      input_type: 1,
      input_second: inputSecond,
    },
    msg_seq: msgSeq,
    ...(msgId ? { msg_id: msgId } : {}),
  };
<<<<<<< HEAD

  await apiRequest(accessToken, "POST", `/v2/users/${openid}/messages`, body);
}

/**
 * 发送频道消息（不支持流式）
 */
=======
  const response = await apiRequest<{ ext_info?: { ref_idx?: string } }>(
    accessToken,
    "POST",
    `/v2/users/${openid}/messages`,
    body,
  );
  return { refIdx: response.ext_info?.ref_idx };
}

>>>>>>> upstream/main
export async function sendChannelMessage(
  accessToken: string,
  channelId: string,
  content: string,
  msgId?: string,
): Promise<{ id: string; timestamp: string }> {
  return apiRequest(accessToken, "POST", `/channels/${channelId}/messages`, {
    content,
    ...(msgId ? { msg_id: msgId } : {}),
  });
}

<<<<<<< HEAD
/**
 * 发送群聊消息
 */
export async function sendGroupMessage(
=======
/** Send a direct-message payload inside a guild DM session. */
export async function sendDmMessage(
  accessToken: string,
  guildId: string,
  content: string,
  msgId?: string,
): Promise<{ id: string; timestamp: string }> {
  return apiRequest(accessToken, "POST", `/dms/${guildId}/messages`, {
    content,
    ...(msgId ? { msg_id: msgId } : {}),
  });
}

export async function sendGroupMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  groupOpenid: string,
  content: string,
  msgId?: string,
): Promise<MessageResponse> {
  const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
<<<<<<< HEAD
  const body = buildMessageBody(content, msgId, msgSeq);

  return apiRequest(accessToken, "POST", `/v2/groups/${groupOpenid}/messages`, body);
}

/**
 * 构建主动消息请求体
 * 根据 markdownSupport 配置决定消息格式：
 * - markdown 模式: { markdown: { content }, msg_type: 2 }
 * - 纯文本模式: { content, msg_type: 0 }
 *
 * 注意：主动消息不支持流式发送
 */
function buildProactiveMessageBody(content: string): Record<string, unknown> {
  // 主动消息内容校验（参考 Telegram 机制）
  if (!content || content.trim().length === 0) {
    throw new Error("主动消息内容不能为空 (markdown.content is empty)");
  }

  if (currentMarkdownSupport) {
    return {
      markdown: { content },
      msg_type: 2,
    };
  } else {
    return {
      content,
      msg_type: 0,
    };
  }
}

/**
 * 主动发送 C2C 单聊消息（不需要 msg_id，每月限 4 条/用户）
 *
 * 注意：
 * 1. 内容不能为空（对应 markdown.content 字段）
 * 2. 不支持流式发送
 */
export async function sendProactiveC2CMessage(
  accessToken: string,
  openid: string,
  content: string,
): Promise<{ id: string; timestamp: number }> {
  const body = buildProactiveMessageBody(content);
  console.log(
    `[qqbot-api] sendProactiveC2CMessage: openid=${openid}, msg_type=${body.msg_type}, content_len=${content.length}`,
  );
  return apiRequest(accessToken, "POST", `/v2/users/${openid}/messages`, body);
}

/**
 * 主动发送群聊消息（不需要 msg_id，每月限 4 条/群）
 *
 * 注意：
 * 1. 内容不能为空（对应 markdown.content 字段）
 * 2. 不支持流式发送
 */
export async function sendProactiveGroupMessage(
=======
  const body = buildMessageBody(appId, content, msgId, msgSeq);
  return sendAndNotify(appId, accessToken, "POST", `/v2/groups/${groupOpenid}/messages`, body, {
    text: content,
  });
}

function buildProactiveMessageBody(appId: string, content: string): Record<string, unknown> {
  if (!content || content.trim().length === 0) {
    throw new Error("Proactive message content must not be empty (markdown.content is empty)");
  }
  if (isMarkdownSupport(appId)) {
    return { markdown: { content }, msg_type: 2 };
  } else {
    return { content, msg_type: 0 };
  }
}

export async function sendProactiveC2CMessage(
  appId: string,
  accessToken: string,
  openid: string,
  content: string,
): Promise<MessageResponse> {
  const body = buildProactiveMessageBody(appId, content);
  return sendAndNotify(appId, accessToken, "POST", `/v2/users/${openid}/messages`, body, {
    text: content,
  });
}

export async function sendProactiveGroupMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  groupOpenid: string,
  content: string,
): Promise<{ id: string; timestamp: string }> {
<<<<<<< HEAD
  const body = buildProactiveMessageBody(content);
  console.log(
    `[qqbot-api] sendProactiveGroupMessage: group=${groupOpenid}, msg_type=${body.msg_type}, content_len=${content.length}`,
  );
  return apiRequest(accessToken, "POST", `/v2/groups/${groupOpenid}/messages`, body);
}

// ============ 富媒体消息支持 ============

/**
 * 媒体文件类型
 */
=======
  const body = buildProactiveMessageBody(appId, content);
  return apiRequest(accessToken, "POST", `/v2/groups/${groupOpenid}/messages`, body);
}

// Rich media message support.

>>>>>>> upstream/main
export enum MediaFileType {
  IMAGE = 1,
  VIDEO = 2,
  VOICE = 3,
<<<<<<< HEAD
  FILE = 4, // 暂未开放
}

/**
 * 上传富媒体文件的响应
 */
=======
  FILE = 4,
}

>>>>>>> upstream/main
export interface UploadMediaResponse {
  file_uuid: string;
  file_info: string;
  ttl: number;
<<<<<<< HEAD
  id?: string; // 仅当 srv_send_msg=true 时返回
}

/**
 * 上传富媒体文件到 C2C 单聊
 *
 * 改进：
 * 1. file_info 缓存 — 相同文件不重复上传（借鉴 Telegram file_id）
 * 2. 指数退避重试 — 网络波动时自动重试最多 2 次
 *
 * @param url - 公网可访问的图片 URL（与 fileData 二选一）
 * @param fileData - Base64 编码的文件内容（与 url 二选一）
 * @param fileName - 文件名（file_type=FILE 时必传，例如 "readme.md"）
 */
=======
  id?: string;
}

>>>>>>> upstream/main
export async function uploadC2CMedia(
  accessToken: string,
  openid: string,
  fileType: MediaFileType,
  url?: string,
  fileData?: string,
  srvSendMsg = false,
  fileName?: string,
): Promise<UploadMediaResponse> {
<<<<<<< HEAD
  if (!url && !fileData) {
    throw new Error("uploadC2CMedia: url or fileData is required");
  }

  // 缓存查询：如果有 fileData，用内容 hash 查缓存
=======
  if (!url && !fileData) throw new Error("uploadC2CMedia: url or fileData is required");

>>>>>>> upstream/main
  if (fileData) {
    const contentHash = computeFileHash(fileData);
    const cachedInfo = getCachedFileInfo(contentHash, "c2c", openid, fileType);
    if (cachedInfo) {
<<<<<<< HEAD
      console.log(`[qqbot-api] uploadC2CMedia: using cached file_info (skip upload)`);
=======
>>>>>>> upstream/main
      return { file_uuid: "", file_info: cachedInfo, ttl: 0 };
    }
  }

<<<<<<< HEAD
  const body: Record<string, unknown> = {
    file_type: fileType,
    srv_send_msg: srvSendMsg,
  };

  if (url) {
    body.url = url;
  } else if (fileData) {
    body.file_data = fileData;
  }

  if (fileType === MediaFileType.FILE && fileName) {
    body.file_name = sanitizeFileName(fileName);
  }

  // 使用带重试的请求
=======
  const body: Record<string, unknown> = { file_type: fileType, srv_send_msg: srvSendMsg };
  if (url) body.url = url;
  else if (fileData) body.file_data = fileData;
  if (fileType === MediaFileType.FILE && fileName) body.file_name = sanitizeFileName(fileName);

>>>>>>> upstream/main
  const result = await apiRequestWithRetry<UploadMediaResponse>(
    accessToken,
    "POST",
    `/v2/users/${openid}/files`,
    body,
  );

<<<<<<< HEAD
  // 写入缓存
=======
>>>>>>> upstream/main
  if (fileData && result.file_info && result.ttl > 0) {
    const contentHash = computeFileHash(fileData);
    setCachedFileInfo(
      contentHash,
      "c2c",
      openid,
      fileType,
      result.file_info,
      result.file_uuid,
      result.ttl,
    );
  }
<<<<<<< HEAD

  return result;
}

/**
 * 上传富媒体文件到群聊
 *
 * 改进：同 uploadC2CMedia
 *
 * @param url - 公网可访问的图片 URL（与 fileData 二选一）
 * @param fileData - Base64 编码的文件内容（与 url 二选一）
 * @param fileName - 文件名（file_type=FILE 时必传，例如 "readme.md"）
 */
=======
  return result;
}

>>>>>>> upstream/main
export async function uploadGroupMedia(
  accessToken: string,
  groupOpenid: string,
  fileType: MediaFileType,
  url?: string,
  fileData?: string,
  srvSendMsg = false,
  fileName?: string,
): Promise<UploadMediaResponse> {
<<<<<<< HEAD
  if (!url && !fileData) {
    throw new Error("uploadGroupMedia: url or fileData is required");
  }

  // 缓存查询
=======
  if (!url && !fileData) throw new Error("uploadGroupMedia: url or fileData is required");

>>>>>>> upstream/main
  if (fileData) {
    const contentHash = computeFileHash(fileData);
    const cachedInfo = getCachedFileInfo(contentHash, "group", groupOpenid, fileType);
    if (cachedInfo) {
<<<<<<< HEAD
      console.log(`[qqbot-api] uploadGroupMedia: using cached file_info (skip upload)`);
=======
>>>>>>> upstream/main
      return { file_uuid: "", file_info: cachedInfo, ttl: 0 };
    }
  }

<<<<<<< HEAD
  const body: Record<string, unknown> = {
    file_type: fileType,
    srv_send_msg: srvSendMsg,
  };

  if (url) {
    body.url = url;
  } else if (fileData) {
    body.file_data = fileData;
  }

  if (fileType === MediaFileType.FILE && fileName) {
    body.file_name = sanitizeFileName(fileName);
  }

  // 使用带重试的请求
=======
  const body: Record<string, unknown> = { file_type: fileType, srv_send_msg: srvSendMsg };
  if (url) body.url = url;
  else if (fileData) body.file_data = fileData;
  if (fileType === MediaFileType.FILE && fileName) body.file_name = sanitizeFileName(fileName);

>>>>>>> upstream/main
  const result = await apiRequestWithRetry<UploadMediaResponse>(
    accessToken,
    "POST",
    `/v2/groups/${groupOpenid}/files`,
    body,
  );

<<<<<<< HEAD
  // 写入缓存
=======
>>>>>>> upstream/main
  if (fileData && result.file_info && result.ttl > 0) {
    const contentHash = computeFileHash(fileData);
    setCachedFileInfo(
      contentHash,
      "group",
      groupOpenid,
      fileType,
      result.file_info,
      result.file_uuid,
      result.ttl,
    );
  }
<<<<<<< HEAD

  return result;
}

/**
 * 发送 C2C 单聊富媒体消息
 */
export async function sendC2CMediaMessage(
=======
  return result;
}

export async function sendC2CMediaMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  openid: string,
  fileInfo: string,
  msgId?: string,
  content?: string,
<<<<<<< HEAD
): Promise<{ id: string; timestamp: number }> {
  const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
  return apiRequest(accessToken, "POST", `/v2/users/${openid}/messages`, {
    msg_type: 7, // 富媒体消息类型
    media: { file_info: fileInfo },
    msg_seq: msgSeq,
    ...(content ? { content } : {}),
    ...(msgId ? { msg_id: msgId } : {}),
  });
}

/**
 * 发送群聊富媒体消息
 */
=======
  meta?: OutboundMeta,
): Promise<MessageResponse> {
  const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
  return sendAndNotify(
    appId,
    accessToken,
    "POST",
    `/v2/users/${openid}/messages`,
    {
      msg_type: 7,
      media: { file_info: fileInfo },
      msg_seq: msgSeq,
      ...(content ? { content } : {}),
      ...(msgId ? { msg_id: msgId } : {}),
    },
    meta ?? { text: content },
  );
}

>>>>>>> upstream/main
export async function sendGroupMediaMessage(
  accessToken: string,
  groupOpenid: string,
  fileInfo: string,
  msgId?: string,
  content?: string,
): Promise<{ id: string; timestamp: string }> {
  const msgSeq = msgId ? getNextMsgSeq(msgId) : 1;
  return apiRequest(accessToken, "POST", `/v2/groups/${groupOpenid}/messages`, {
<<<<<<< HEAD
    msg_type: 7, // 富媒体消息类型
=======
    msg_type: 7,
>>>>>>> upstream/main
    media: { file_info: fileInfo },
    msg_seq: msgSeq,
    ...(content ? { content } : {}),
    ...(msgId ? { msg_id: msgId } : {}),
  });
}

<<<<<<< HEAD
/**
 * 发送带图片的 C2C 单聊消息（封装上传+发送）
 * @param imageUrl - 图片来源，支持：
 *   - 公网 URL: https://example.com/image.png
 *   - Base64 Data URL: data:image/png;base64,xxxxx
 */
export async function sendC2CImageMessage(
=======
export async function sendC2CImageMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  openid: string,
  imageUrl: string,
  msgId?: string,
  content?: string,
<<<<<<< HEAD
): Promise<{ id: string; timestamp: number }> {
  let uploadResult: UploadMediaResponse;

  // 检查是否是 Base64 Data URL
  if (imageUrl.startsWith("data:")) {
    // 解析 Base64 Data URL: data:image/png;base64,xxxxx
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid Base64 Data URL format");
    }
    const base64Data = matches[2];
    // 使用 file_data 上传
=======
  localPath?: string,
): Promise<MessageResponse> {
  let uploadResult: UploadMediaResponse;
  const isBase64 = imageUrl.startsWith("data:");
  if (isBase64) {
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid Base64 Data URL format");
>>>>>>> upstream/main
    uploadResult = await uploadC2CMedia(
      accessToken,
      openid,
      MediaFileType.IMAGE,
      undefined,
<<<<<<< HEAD
      base64Data,
      false,
    );
  } else {
    // 公网 URL，使用 url 参数上传
=======
      matches[2],
      false,
    );
  } else {
>>>>>>> upstream/main
    uploadResult = await uploadC2CMedia(
      accessToken,
      openid,
      MediaFileType.IMAGE,
      imageUrl,
      undefined,
      false,
    );
  }
<<<<<<< HEAD

  // 发送富媒体消息
  return sendC2CMediaMessage(accessToken, openid, uploadResult.file_info, msgId, content);
}

/**
 * 发送带图片的群聊消息（封装上传+发送）
 * @param imageUrl - 图片来源，支持：
 *   - 公网 URL: https://example.com/image.png
 *   - Base64 Data URL: data:image/png;base64,xxxxx
 */
export async function sendGroupImageMessage(
=======
  const meta: OutboundMeta = {
    text: content,
    mediaType: "image",
    ...(!isBase64 ? { mediaUrl: imageUrl } : {}),
    ...(localPath ? { mediaLocalPath: localPath } : {}),
  };
  return sendC2CMediaMessage(
    appId,
    accessToken,
    openid,
    uploadResult.file_info,
    msgId,
    content,
    meta,
  );
}

export async function sendGroupImageMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  groupOpenid: string,
  imageUrl: string,
  msgId?: string,
  content?: string,
): Promise<{ id: string; timestamp: string }> {
  let uploadResult: UploadMediaResponse;
<<<<<<< HEAD

  // 检查是否是 Base64 Data URL
  if (imageUrl.startsWith("data:")) {
    // 解析 Base64 Data URL: data:image/png;base64,xxxxx
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) {
      throw new Error("Invalid Base64 Data URL format");
    }
    const base64Data = matches[2];
    // 使用 file_data 上传
=======
  const isBase64 = imageUrl.startsWith("data:");
  if (isBase64) {
    const matches = imageUrl.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error("Invalid Base64 Data URL format");
>>>>>>> upstream/main
    uploadResult = await uploadGroupMedia(
      accessToken,
      groupOpenid,
      MediaFileType.IMAGE,
      undefined,
<<<<<<< HEAD
      base64Data,
      false,
    );
  } else {
    // 公网 URL，使用 url 参数上传
=======
      matches[2],
      false,
    );
  } else {
>>>>>>> upstream/main
    uploadResult = await uploadGroupMedia(
      accessToken,
      groupOpenid,
      MediaFileType.IMAGE,
      imageUrl,
      undefined,
      false,
    );
  }
<<<<<<< HEAD

  // 发送富媒体消息
  return sendGroupMediaMessage(accessToken, groupOpenid, uploadResult.file_info, msgId, content);
}

/**
 * 发送 C2C 单聊语音消息（封装上传+发送）
 * @param voiceBase64 - SILK 格式语音的 Base64 编码
 */
export async function sendC2CVoiceMessage(
  accessToken: string,
  openid: string,
  voiceBase64: string,
  msgId?: string,
): Promise<{ id: string; timestamp: number }> {
=======
  return sendGroupMediaMessage(accessToken, groupOpenid, uploadResult.file_info, msgId, content);
}

export async function sendC2CVoiceMessage(
  appId: string,
  accessToken: string,
  openid: string,
  voiceBase64?: string,
  voiceUrl?: string,
  msgId?: string,
  ttsText?: string,
  filePath?: string,
): Promise<MessageResponse> {
>>>>>>> upstream/main
  const uploadResult = await uploadC2CMedia(
    accessToken,
    openid,
    MediaFileType.VOICE,
<<<<<<< HEAD
    undefined,
    voiceBase64,
    false,
  );
  return sendC2CMediaMessage(accessToken, openid, uploadResult.file_info, msgId);
}

/**
 * 发送群聊语音消息（封装上传+发送）
 * @param voiceBase64 - SILK 格式语音的 Base64 编码
 */
export async function sendGroupVoiceMessage(
  accessToken: string,
  groupOpenid: string,
  voiceBase64: string,
=======
    voiceUrl,
    voiceBase64,
    false,
  );
  return sendC2CMediaMessage(appId, accessToken, openid, uploadResult.file_info, msgId, undefined, {
    mediaType: "voice",
    ...(ttsText ? { ttsText } : {}),
    ...(filePath ? { mediaLocalPath: filePath } : {}),
  });
}

export async function sendGroupVoiceMessage(
  appId: string,
  accessToken: string,
  groupOpenid: string,
  voiceBase64?: string,
  voiceUrl?: string,
>>>>>>> upstream/main
  msgId?: string,
): Promise<{ id: string; timestamp: string }> {
  const uploadResult = await uploadGroupMedia(
    accessToken,
    groupOpenid,
    MediaFileType.VOICE,
<<<<<<< HEAD
    undefined,
=======
    voiceUrl,
>>>>>>> upstream/main
    voiceBase64,
    false,
  );
  return sendGroupMediaMessage(accessToken, groupOpenid, uploadResult.file_info, msgId);
}

<<<<<<< HEAD
/**
 * 发送 C2C 单聊文件消息（封装上传+发送）
 * @param fileBase64 - Base64 编码的文件内容
 * @param fileUrl - 公网可访问的文件 URL（与 fileBase64 二选一）
 * @param fileName - 文件名（例如 "readme.md"），从本地路径自动提取
 */
export async function sendC2CFileMessage(
=======
export async function sendC2CFileMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  openid: string,
  fileBase64?: string,
  fileUrl?: string,
  msgId?: string,
  fileName?: string,
<<<<<<< HEAD
): Promise<{ id: string; timestamp: number }> {
=======
  localFilePath?: string,
): Promise<MessageResponse> {
>>>>>>> upstream/main
  const uploadResult = await uploadC2CMedia(
    accessToken,
    openid,
    MediaFileType.FILE,
    fileUrl,
    fileBase64,
    false,
    fileName,
  );
<<<<<<< HEAD
  return sendC2CMediaMessage(accessToken, openid, uploadResult.file_info, msgId);
}

/**
 * 发送群聊文件消息（封装上传+发送）
 * @param fileBase64 - Base64 编码的文件内容
 * @param fileUrl - 公网可访问的文件 URL（与 fileBase64 二选一）
 * @param fileName - 文件名（例如 "readme.md"），从本地路径自动提取
 */
export async function sendGroupFileMessage(
=======
  return sendC2CMediaMessage(appId, accessToken, openid, uploadResult.file_info, msgId, undefined, {
    mediaType: "file",
    mediaUrl: fileUrl,
    mediaLocalPath: localFilePath ?? fileName,
  });
}

export async function sendGroupFileMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  groupOpenid: string,
  fileBase64?: string,
  fileUrl?: string,
  msgId?: string,
  fileName?: string,
): Promise<{ id: string; timestamp: string }> {
  const uploadResult = await uploadGroupMedia(
    accessToken,
    groupOpenid,
    MediaFileType.FILE,
    fileUrl,
    fileBase64,
    false,
    fileName,
  );
  return sendGroupMediaMessage(accessToken, groupOpenid, uploadResult.file_info, msgId);
}

<<<<<<< HEAD
/**
 * 发送 C2C 单聊视频消息（封装上传+发送）
 * @param videoUrl - 公网可访问的视频 URL（与 videoBase64 二选一）
 * @param videoBase64 - Base64 编码的视频内容（与 videoUrl 二选一）
 */
export async function sendC2CVideoMessage(
=======
export async function sendC2CVideoMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  openid: string,
  videoUrl?: string,
  videoBase64?: string,
  msgId?: string,
  content?: string,
<<<<<<< HEAD
): Promise<{ id: string; timestamp: number }> {
=======
  localPath?: string,
): Promise<MessageResponse> {
>>>>>>> upstream/main
  const uploadResult = await uploadC2CMedia(
    accessToken,
    openid,
    MediaFileType.VIDEO,
    videoUrl,
    videoBase64,
    false,
  );
<<<<<<< HEAD
  return sendC2CMediaMessage(accessToken, openid, uploadResult.file_info, msgId, content);
}

/**
 * 发送群聊视频消息（封装上传+发送）
 * @param videoUrl - 公网可访问的视频 URL（与 videoBase64 二选一）
 * @param videoBase64 - Base64 编码的视频内容（与 videoUrl 二选一）
 */
export async function sendGroupVideoMessage(
=======
  return sendC2CMediaMessage(appId, accessToken, openid, uploadResult.file_info, msgId, content, {
    text: content,
    mediaType: "video",
    ...(videoUrl ? { mediaUrl: videoUrl } : {}),
    ...(localPath ? { mediaLocalPath: localPath } : {}),
  });
}

export async function sendGroupVideoMessage(
  appId: string,
>>>>>>> upstream/main
  accessToken: string,
  groupOpenid: string,
  videoUrl?: string,
  videoBase64?: string,
  msgId?: string,
  content?: string,
): Promise<{ id: string; timestamp: string }> {
  const uploadResult = await uploadGroupMedia(
    accessToken,
    groupOpenid,
    MediaFileType.VIDEO,
    videoUrl,
    videoBase64,
    false,
  );
  return sendGroupMediaMessage(accessToken, groupOpenid, uploadResult.file_info, msgId, content);
}

<<<<<<< HEAD
// ============ 后台 Token 刷新 (P1-1) ============

/**
 * 后台 Token 刷新配置
 */
interface BackgroundTokenRefreshOptions {
  /** 提前刷新时间（毫秒，默认 5 分钟） */
  refreshAheadMs?: number;
  /** 随机偏移范围（毫秒，默认 0-30 秒） */
  randomOffsetMs?: number;
  /** 最小刷新间隔（毫秒，默认 1 分钟） */
  minRefreshIntervalMs?: number;
  /** 失败后重试间隔（毫秒，默认 5 秒） */
  retryDelayMs?: number;
  /** 日志函数 */
=======
// Background token refresh, isolated per appId.

interface BackgroundTokenRefreshOptions {
  refreshAheadMs?: number;
  randomOffsetMs?: number;
  minRefreshIntervalMs?: number;
  retryDelayMs?: number;
>>>>>>> upstream/main
  log?: {
    info: (msg: string) => void;
    error: (msg: string) => void;
    debug?: (msg: string) => void;
  };
}

<<<<<<< HEAD
// 后台刷新状态
let backgroundRefreshRunning = false;
let backgroundRefreshAbortController: AbortController | null = null;

/**
 * 启动后台 Token 刷新
 * 在后台定时刷新 Token，避免请求时才发现过期
 *
 * @param appId 应用 ID
 * @param clientSecret 应用密钥
 * @param options 配置选项
 */
=======
const backgroundRefreshControllers = new Map<string, AbortController>();

>>>>>>> upstream/main
export function startBackgroundTokenRefresh(
  appId: string,
  clientSecret: string,
  options?: BackgroundTokenRefreshOptions,
): void {
<<<<<<< HEAD
  if (backgroundRefreshRunning) {
    console.log("[qqbot-api] Background token refresh already running");
=======
  if (backgroundRefreshControllers.has(appId)) {
    debugLog(`[qqbot-api:${appId}] Background token refresh already running`);
>>>>>>> upstream/main
    return;
  }

  const {
<<<<<<< HEAD
    refreshAheadMs = 5 * 60 * 1000, // 提前 5 分钟刷新
    randomOffsetMs = 30 * 1000, // 0-30 秒随机偏移
    minRefreshIntervalMs = 60 * 1000, // 最少 1 分钟后刷新
    retryDelayMs = 5 * 1000, // 失败后 5 秒重试
    log,
  } = options ?? {};

  backgroundRefreshRunning = true;
  backgroundRefreshAbortController = new AbortController();
  const signal = backgroundRefreshAbortController.signal;

  const refreshLoop = async () => {
    log?.info?.("[qqbot-api] Background token refresh started");

    while (!signal.aborted) {
      try {
        // 先确保有一个有效 Token
        await getAccessToken(appId, clientSecret);

        // 计算下次刷新时间
        if (cachedToken) {
          const expiresIn = cachedToken.expiresAt - Date.now();
          // 提前刷新时间 + 随机偏移（避免集群同时刷新）
=======
    refreshAheadMs = 5 * 60 * 1000,
    randomOffsetMs = 30 * 1000,
    minRefreshIntervalMs = 60 * 1000,
    retryDelayMs = 5 * 1000,
    log,
  } = options ?? {};

  const controller = new AbortController();
  backgroundRefreshControllers.set(appId, controller);
  const signal = controller.signal;

  const refreshLoop = async () => {
    log?.info?.(`[qqbot-api:${appId}] Background token refresh started`);

    while (!signal.aborted) {
      try {
        await getAccessToken(appId, clientSecret);
        const cached = tokenCacheMap.get(appId);

        if (cached) {
          const expiresIn = cached.expiresAt - Date.now();
>>>>>>> upstream/main
          const randomOffset = Math.random() * randomOffsetMs;
          const refreshIn = Math.max(
            expiresIn - refreshAheadMs - randomOffset,
            minRefreshIntervalMs,
          );

<<<<<<< HEAD
          log?.debug?.(`[qqbot-api] Token valid, next refresh in ${Math.round(refreshIn / 1000)}s`);

          // 等待到刷新时间
          await sleep(refreshIn, signal);
        } else {
          // 没有缓存的 Token，等待一段时间后重试
          log?.debug?.("[qqbot-api] No cached token, retrying soon");
=======
          log?.debug?.(
            `[qqbot-api:${appId}] Token valid, next refresh in ${Math.round(refreshIn / 1000)}s`,
          );
          await sleep(refreshIn, signal);
        } else {
          log?.debug?.(`[qqbot-api:${appId}] No cached token, retrying soon`);
>>>>>>> upstream/main
          await sleep(minRefreshIntervalMs, signal);
        }
      } catch (err) {
        if (signal.aborted) break;
<<<<<<< HEAD

        // 刷新失败，等待后重试
        log?.error?.(`[qqbot-api] Background token refresh failed: ${err}`);
=======
        log?.error?.(`[qqbot-api:${appId}] Background token refresh failed: ${err}`);
>>>>>>> upstream/main
        await sleep(retryDelayMs, signal);
      }
    }

<<<<<<< HEAD
    backgroundRefreshRunning = false;
    log?.info?.("[qqbot-api] Background token refresh stopped");
  };

  // 异步启动，不阻塞调用者
  refreshLoop().catch((err) => {
    backgroundRefreshRunning = false;
    log?.error?.(`[qqbot-api] Background token refresh crashed: ${err}`);
=======
    backgroundRefreshControllers.delete(appId);
    log?.info?.(`[qqbot-api:${appId}] Background token refresh stopped`);
  };

  refreshLoop().catch((err) => {
    backgroundRefreshControllers.delete(appId);
    log?.error?.(`[qqbot-api:${appId}] Background token refresh crashed: ${err}`);
>>>>>>> upstream/main
  });
}

/**
<<<<<<< HEAD
 * 停止后台 Token 刷新
 */
export function stopBackgroundTokenRefresh(): void {
  if (backgroundRefreshAbortController) {
    backgroundRefreshAbortController.abort();
    backgroundRefreshAbortController = null;
  }
  backgroundRefreshRunning = false;
}

/**
 * 检查后台 Token 刷新是否正在运行
 */
export function isBackgroundTokenRefreshRunning(): boolean {
  return backgroundRefreshRunning;
}

/**
 * 可中断的 sleep 函数
 */
async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);

=======
 * Stop background token refresh.
 * @param appId Optional appId to stop a single account instead of all refresh loops.
 */
export function stopBackgroundTokenRefresh(appId?: string): void {
  if (appId) {
    const controller = backgroundRefreshControllers.get(appId);
    if (controller) {
      controller.abort();
      backgroundRefreshControllers.delete(appId);
    }
  } else {
    for (const controller of backgroundRefreshControllers.values()) {
      controller.abort();
    }
    backgroundRefreshControllers.clear();
  }
}

export function isBackgroundTokenRefreshRunning(appId?: string): boolean {
  if (appId) return backgroundRefreshControllers.has(appId);
  return backgroundRefreshControllers.size > 0;
}

async function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
>>>>>>> upstream/main
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        reject(new Error("Aborted"));
        return;
      }
<<<<<<< HEAD

=======
>>>>>>> upstream/main
      const onAbort = () => {
        clearTimeout(timer);
        reject(new Error("Aborted"));
      };
<<<<<<< HEAD

=======
>>>>>>> upstream/main
      signal.addEventListener("abort", onAbort, { once: true });
    }
  });
}
