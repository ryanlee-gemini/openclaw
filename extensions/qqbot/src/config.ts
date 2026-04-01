<<<<<<< HEAD
import type { OpenClawConfig } from "openclaw/plugin-sdk";
=======
import fs from "node:fs";
import type { OpenClawConfig } from "openclaw/plugin-sdk/config-runtime";
import {
  hasConfiguredSecretInput,
  normalizeResolvedSecretInputString,
  normalizeSecretInputString,
} from "openclaw/plugin-sdk/secret-input";
>>>>>>> upstream/main
import type { ResolvedQQBotAccount, QQBotAccountConfig } from "./types.js";

export const DEFAULT_ACCOUNT_ID = "default";

interface QQBotChannelConfig extends QQBotAccountConfig {
  accounts?: Record<string, QQBotAccountConfig>;
}

<<<<<<< HEAD
/**
 * 列出所有 QQBot 账户 ID
 */
=======
function normalizeQQBotAccountConfig(account: QQBotAccountConfig | undefined): QQBotAccountConfig {
  if (!account) {
    return {};
  }
  return {
    ...account,
    ...(account.audioFormatPolicy ? { audioFormatPolicy: { ...account.audioFormatPolicy } } : {}),
  };
}

function normalizeAppId(raw: unknown): string {
  if (raw === null || raw === undefined) return "";
  return String(raw).trim();
}

/** List all configured QQBot account IDs. */
>>>>>>> upstream/main
export function listQQBotAccountIds(cfg: OpenClawConfig): string[] {
  const ids = new Set<string>();
  const qqbot = cfg.channels?.qqbot as QQBotChannelConfig | undefined;

<<<<<<< HEAD
  if (qqbot?.appId) {
=======
  if (qqbot?.appId || process.env.QQBOT_APP_ID) {
>>>>>>> upstream/main
    ids.add(DEFAULT_ACCOUNT_ID);
  }

  if (qqbot?.accounts) {
    for (const accountId of Object.keys(qqbot.accounts)) {
      if (qqbot.accounts[accountId]?.appId) {
        ids.add(accountId);
      }
    }
  }

  return Array.from(ids);
}

<<<<<<< HEAD
/**
 * 获取默认账户 ID
 */
export function resolveDefaultQQBotAccountId(cfg: OpenClawConfig): string {
  const qqbot = cfg.channels?.qqbot as QQBotChannelConfig | undefined;
  // 如果有默认账户配置，返回 default
  if (qqbot?.appId) {
    return DEFAULT_ACCOUNT_ID;
  }
  // 否则返回第一个配置的账户
=======
/** Resolve the default QQBot account ID. */
export function resolveDefaultQQBotAccountId(cfg: OpenClawConfig): string {
  const qqbot = cfg.channels?.qqbot as QQBotChannelConfig | undefined;
  if (qqbot?.appId || process.env.QQBOT_APP_ID) {
    return DEFAULT_ACCOUNT_ID;
  }
>>>>>>> upstream/main
  if (qqbot?.accounts) {
    const ids = Object.keys(qqbot.accounts);
    if (ids.length > 0) {
      return ids[0];
    }
  }
  return DEFAULT_ACCOUNT_ID;
}

<<<<<<< HEAD
/**
 * 解析 QQBot 账户配置
 */
export function resolveQQBotAccount(
  cfg: OpenClawConfig,
  accountId?: string | null,
=======
/** Resolve QQBot account config for runtime or setup flows. */
export function resolveQQBotAccount(
  cfg: OpenClawConfig,
  accountId?: string | null,
  opts?: { allowUnresolvedSecretRef?: boolean },
>>>>>>> upstream/main
): ResolvedQQBotAccount {
  const resolvedAccountId = accountId ?? DEFAULT_ACCOUNT_ID;
  const qqbot = cfg.channels?.qqbot as QQBotChannelConfig | undefined;

<<<<<<< HEAD
  // 基础配置
=======
>>>>>>> upstream/main
  let accountConfig: QQBotAccountConfig = {};
  let appId = "";
  let clientSecret = "";
  let secretSource: "config" | "file" | "env" | "none" = "none";

  if (resolvedAccountId === DEFAULT_ACCOUNT_ID) {
<<<<<<< HEAD
    // 默认账户从顶层读取
    accountConfig = {
      enabled: qqbot?.enabled,
      name: qqbot?.name,
      appId: qqbot?.appId,
      clientSecret: qqbot?.clientSecret,
      clientSecretFile: qqbot?.clientSecretFile,
      dmPolicy: qqbot?.dmPolicy,
      allowFrom: qqbot?.allowFrom,
      systemPrompt: qqbot?.systemPrompt,
      imageServerBaseUrl: qqbot?.imageServerBaseUrl,
      markdownSupport: qqbot?.markdownSupport ?? true,
    };
    appId = qqbot?.appId ?? "";
  } else {
    // 命名账户从 accounts 读取
    const account = qqbot?.accounts?.[resolvedAccountId];
    accountConfig = account ?? {};
    appId = account?.appId ?? "";
  }

  // 解析 clientSecret
  if (accountConfig.clientSecret) {
    clientSecret = accountConfig.clientSecret;
    secretSource = "config";
  } else if (accountConfig.clientSecretFile) {
    // 从文件读取（运行时处理）
    secretSource = "file";
=======
    // Default account reads from top-level config and keeps the full field surface.
    accountConfig = normalizeQQBotAccountConfig(qqbot);
    appId = normalizeAppId(qqbot?.appId);
  } else {
    // Named accounts read from channels.qqbot.accounts.
    const account = qqbot?.accounts?.[resolvedAccountId];
    accountConfig = normalizeQQBotAccountConfig(account);
    appId = normalizeAppId(account?.appId);
  }

  const clientSecretPath =
    resolvedAccountId === DEFAULT_ACCOUNT_ID
      ? "channels.qqbot.clientSecret"
      : `channels.qqbot.accounts.${resolvedAccountId}.clientSecret`;

  // Resolve clientSecret from config, file, or environment.
  if (hasConfiguredSecretInput(accountConfig.clientSecret)) {
    clientSecret = opts?.allowUnresolvedSecretRef
      ? (normalizeSecretInputString(accountConfig.clientSecret) ?? "")
      : (normalizeResolvedSecretInputString({
          value: accountConfig.clientSecret,
          path: clientSecretPath,
        }) ?? "");
    secretSource = "config";
  } else if (accountConfig.clientSecretFile) {
    try {
      clientSecret = fs.readFileSync(accountConfig.clientSecretFile, "utf8").trim();
      secretSource = "file";
    } catch {
      secretSource = "none";
    }
>>>>>>> upstream/main
  } else if (process.env.QQBOT_CLIENT_SECRET && resolvedAccountId === DEFAULT_ACCOUNT_ID) {
    clientSecret = process.env.QQBOT_CLIENT_SECRET;
    secretSource = "env";
  }

<<<<<<< HEAD
  // AppId 也可以从环境变量读取
  if (!appId && process.env.QQBOT_APP_ID && resolvedAccountId === DEFAULT_ACCOUNT_ID) {
    appId = process.env.QQBOT_APP_ID;
=======
  // AppId can also fall back to an environment variable.
  if (!appId && process.env.QQBOT_APP_ID && resolvedAccountId === DEFAULT_ACCOUNT_ID) {
    appId = normalizeAppId(process.env.QQBOT_APP_ID);
>>>>>>> upstream/main
  }

  return {
    accountId: resolvedAccountId,
    name: accountConfig.name,
    enabled: accountConfig.enabled !== false,
    appId,
    clientSecret,
    secretSource,
    systemPrompt: accountConfig.systemPrompt,
<<<<<<< HEAD
    imageServerBaseUrl: accountConfig.imageServerBaseUrl || process.env.QQBOT_IMAGE_SERVER_BASE_URL,
=======
>>>>>>> upstream/main
    markdownSupport: accountConfig.markdownSupport !== false,
    config: accountConfig,
  };
}

<<<<<<< HEAD
/**
 * 应用账户配置
 */
=======
/** Apply account config updates back into the OpenClaw config object. */
>>>>>>> upstream/main
export function applyQQBotAccountConfig(
  cfg: OpenClawConfig,
  accountId: string,
  input: {
    appId?: string;
    clientSecret?: string;
    clientSecretFile?: string;
    name?: string;
<<<<<<< HEAD
    imageServerBaseUrl?: string;
=======
>>>>>>> upstream/main
  },
): OpenClawConfig {
  const next = { ...cfg };

  if (accountId === DEFAULT_ACCOUNT_ID) {
<<<<<<< HEAD
    // 如果没有设置过 allowFrom，默认设置为 ["*"]
=======
    // Default allowFrom to ["*"] when not yet configured.
>>>>>>> upstream/main
    const existingConfig = (next.channels?.qqbot as QQBotChannelConfig) || {};
    const allowFrom = existingConfig.allowFrom ?? ["*"];

    next.channels = {
      ...next.channels,
      qqbot: {
        ...((next.channels?.qqbot as Record<string, unknown>) || {}),
        enabled: true,
        allowFrom,
        ...(input.appId ? { appId: input.appId } : {}),
        ...(input.clientSecret
<<<<<<< HEAD
          ? { clientSecret: input.clientSecret }
          : input.clientSecretFile
            ? { clientSecretFile: input.clientSecretFile }
            : {}),
        ...(input.name ? { name: input.name } : {}),
        ...(input.imageServerBaseUrl ? { imageServerBaseUrl: input.imageServerBaseUrl } : {}),
      },
    };
  } else {
    // 如果没有设置过 allowFrom，默认设置为 ["*"]
=======
          ? { clientSecret: input.clientSecret, clientSecretFile: undefined }
          : input.clientSecretFile
            ? { clientSecretFile: input.clientSecretFile, clientSecret: undefined }
            : {}),
        ...(input.name ? { name: input.name } : {}),
      },
    };
  } else {
    // Default allowFrom to ["*"] when not yet configured.
>>>>>>> upstream/main
    const existingAccountConfig =
      (next.channels?.qqbot as QQBotChannelConfig)?.accounts?.[accountId] || {};
    const allowFrom = existingAccountConfig.allowFrom ?? ["*"];

    next.channels = {
      ...next.channels,
      qqbot: {
        ...((next.channels?.qqbot as Record<string, unknown>) || {}),
        enabled: true,
        accounts: {
          ...((next.channels?.qqbot as QQBotChannelConfig)?.accounts || {}),
          [accountId]: {
            ...((next.channels?.qqbot as QQBotChannelConfig)?.accounts?.[accountId] || {}),
            enabled: true,
            allowFrom,
            ...(input.appId ? { appId: input.appId } : {}),
            ...(input.clientSecret
<<<<<<< HEAD
              ? { clientSecret: input.clientSecret }
              : input.clientSecretFile
                ? { clientSecretFile: input.clientSecretFile }
                : {}),
            ...(input.name ? { name: input.name } : {}),
            ...(input.imageServerBaseUrl ? { imageServerBaseUrl: input.imageServerBaseUrl } : {}),
=======
              ? { clientSecret: input.clientSecret, clientSecretFile: undefined }
              : input.clientSecretFile
                ? { clientSecretFile: input.clientSecretFile, clientSecret: undefined }
                : {}),
            ...(input.name ? { name: input.name } : {}),
>>>>>>> upstream/main
          },
        },
      },
    };
  }

  return next;
}
