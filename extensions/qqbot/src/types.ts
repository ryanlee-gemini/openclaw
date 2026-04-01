<<<<<<< HEAD
/**
 * QQ Bot 配置类型
 */
export interface QQBotConfig {
  appId: string;
  clientSecret?: string;
  clientSecretFile?: string;
}

/**
 * 解析后的 QQ Bot 账户
 */
=======
import type { SecretInput } from "openclaw/plugin-sdk/secret-input";

/** QQ Bot base config. */
export interface QQBotConfig {
  appId: string;
  clientSecret?: SecretInput;
  clientSecretFile?: string;
}

/** Resolved QQ Bot account config used at runtime. */
>>>>>>> upstream/main
export interface ResolvedQQBotAccount {
  accountId: string;
  name?: string;
  enabled: boolean;
  appId: string;
  clientSecret: string;
  secretSource: "config" | "file" | "env" | "none";
<<<<<<< HEAD
  /** 系统提示词 */
  systemPrompt?: string;
  /** 图床服务器公网地址 */
  imageServerBaseUrl?: string;
  /** 是否支持 markdown 消息（默认 true） */
=======
  /** Additional system prompt text. */
  systemPrompt?: string;
  /** Whether markdown output is enabled. Defaults to true. */
>>>>>>> upstream/main
  markdownSupport: boolean;
  config: QQBotAccountConfig;
}

<<<<<<< HEAD
/**
 * QQ Bot 账户配置
 */
=======
/** QQ Bot account config from user settings. */
>>>>>>> upstream/main
export interface QQBotAccountConfig {
  enabled?: boolean;
  name?: string;
  appId?: string;
<<<<<<< HEAD
  clientSecret?: string;
  clientSecretFile?: string;
  dmPolicy?: "open" | "pairing" | "allowlist";
  allowFrom?: string[];
  /** 系统提示词，会添加在用户消息前面 */
  systemPrompt?: string;
  /** 图床服务器公网地址，用于发送图片，例如 http://your-ip:18765 */
  imageServerBaseUrl?: string;
  /** 是否支持 markdown 消息（默认 true，设为 false 可禁用） */
  markdownSupport?: boolean;
  /**
   * @deprecated 请使用 audioFormatPolicy.uploadDirectFormats
   * 可直接上传的音频格式（不转换为 SILK），向后兼容
   */
  voiceDirectUploadFormats?: string[];
  /**
   * 音频格式策略配置
   * 统一管理入站（STT）和出站（上传）的音频格式转换行为
   */
  audioFormatPolicy?: AudioFormatPolicy;
}

/**
 * 音频格式策略：控制哪些格式可跳过转换
 */
export interface AudioFormatPolicy {
  /**
   * STT 模型直接支持的音频格式（入站：跳过 SILK→WAV 转换）
   * 如果 STT 服务支持直接处理某些格式（如 silk/amr），可将其加入此列表
   * 例如: [".silk", ".amr", ".wav", ".mp3", ".ogg"]
   * 默认为空（所有语音都先转换为 WAV 再送 STT）
   */
  sttDirectFormats?: string[];
  /**
   * QQ 平台支持直传的音频格式（出站：跳过→SILK 转换）
   * 默认为 [".wav", ".mp3", ".silk"]（QQ Bot API 原生支持的三种格式）
   * 仅当需要覆盖默认值时才配置此项
   */
  uploadDirectFormats?: string[];
}

/**
 * 富媒体附件
 */
export interface MessageAttachment {
  content_type: string; // 如 "image/png"
=======
  clientSecret?: SecretInput;
  clientSecretFile?: string;
  allowFrom?: string[];
  /** Optional system prompt prepended to user messages. */
  systemPrompt?: string;
  /** Whether markdown output is enabled. Defaults to true. */
  markdownSupport?: boolean;
  /**
   * @deprecated Use audioFormatPolicy.uploadDirectFormats instead.
   * Legacy list of formats that can upload directly without SILK conversion.
   */
  voiceDirectUploadFormats?: string[];
  /**
   * Audio format policy covering inbound STT and outbound upload behavior.
   */
  audioFormatPolicy?: AudioFormatPolicy;
  /**
   * Whether public URLs should be uploaded to QQ directly. Defaults to true.
   */
  urlDirectUpload?: boolean;
  /**
   * Upgrade guide URL returned by `/bot-upgrade`.
   */
  upgradeUrl?: string;
  /**
   * Upgrade command mode.
   * - "doc": show an upgrade guide link
   * - "hot-reload": run an in-place npm update flow
   */
  upgradeMode?: "doc" | "hot-reload";
}

/** Audio format policy controlling which formats can skip transcoding. */
export interface AudioFormatPolicy {
  /**
   * Formats supported directly by the STT provider.
   */
  sttDirectFormats?: string[];
  /**
   * Formats QQ accepts directly for outbound uploads.
   */
  uploadDirectFormats?: string[];
  /**
   * Whether outbound audio transcoding is enabled. Defaults to true.
   */
  transcodeEnabled?: boolean;
}

/** Rich-media attachment metadata. */
export interface MessageAttachment {
  content_type: string;
>>>>>>> upstream/main
  filename?: string;
  height?: number;
  width?: number;
  size?: number;
  url: string;
<<<<<<< HEAD
  voice_wav_url?: string; // QQ 提供的 WAV 格式语音直链，有值时优先使用以避免 SILK→WAV 转换
}

/**
 * C2C 消息事件
 */
=======
  voice_wav_url?: string;
  asr_refer_text?: string;
}

/** C2C message event payload. */
>>>>>>> upstream/main
export interface C2CMessageEvent {
  author: {
    id: string;
    union_openid: string;
    user_openid: string;
  };
  content: string;
  id: string;
  timestamp: string;
  message_scene?: {
    source: string;
<<<<<<< HEAD
=======
    /** ext can contain ref_msg_idx and msg_idx values. */
    ext?: string[];
>>>>>>> upstream/main
  };
  attachments?: MessageAttachment[];
}

<<<<<<< HEAD
/**
 * 频道 AT 消息事件
 */
=======
/** Guild @-message event payload. */
>>>>>>> upstream/main
export interface GuildMessageEvent {
  id: string;
  channel_id: string;
  guild_id: string;
  content: string;
  timestamp: string;
  author: {
    id: string;
    username?: string;
    bot?: boolean;
  };
  member?: {
    nick?: string;
    joined_at?: string;
  };
  attachments?: MessageAttachment[];
}

<<<<<<< HEAD
/**
 * 群聊 AT 消息事件
 */
=======
/** Group @-message event payload. */
>>>>>>> upstream/main
export interface GroupMessageEvent {
  author: {
    id: string;
    member_openid: string;
  };
  content: string;
  id: string;
  timestamp: string;
  group_id: string;
  group_openid: string;
<<<<<<< HEAD
  attachments?: MessageAttachment[];
}

/**
 * WebSocket 事件负载
 */
=======
  message_scene?: {
    source: string;
    ext?: string[];
  };
  attachments?: MessageAttachment[];
}

/** WebSocket event payload. */
>>>>>>> upstream/main
export interface WSPayload {
  op: number;
  d?: unknown;
  s?: number;
  t?: string;
}
