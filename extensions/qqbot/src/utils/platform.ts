/**
<<<<<<< HEAD
 * 跨平台兼容工具
 *
 * 统一 Mac / Linux / Windows 三大系统的：
 * - 用户主目录获取
 * - 临时目录获取
 * - 本地路径判断
 * - ffmpeg / ffprobe 可执行文件路径
 * - silk-wasm 原生模块兼容性检测
 * - 启动诊断报告
=======
 * Cross-platform compatibility helpers.
 *
 * This module centralizes home/temp directory discovery, local-path checks,
 * ffmpeg/ffprobe lookup, native-module compatibility checks, and startup diagnostics.
>>>>>>> upstream/main
 */

import { execFile } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
<<<<<<< HEAD

// ============ 基础平台信息 ============
=======
import { debugLog, debugWarn } from "./debug-log.js";

// Basic platform information.
>>>>>>> upstream/main

export type PlatformType = "darwin" | "linux" | "win32" | "other";

export function getPlatform(): PlatformType {
  const p = process.platform;
  if (p === "darwin" || p === "linux" || p === "win32") return p;
  return "other";
}

export function isWindows(): boolean {
  return process.platform === "win32";
}

<<<<<<< HEAD
// ============ 用户主目录 ============

/**
 * 安全获取用户主目录
 *
 * 优先级:
 * 1. os.homedir()（Node 原生，所有平台）
 * 2. $HOME（Mac/Linux）或 %USERPROFILE%（Windows）
 * 3. 降级到 /tmp（Linux/Mac）或 os.tmpdir()（Windows）
 *
 * 与之前 `process.env.HOME || "/home/ubuntu"` 的硬编码相比，
 * 现在能正确处理 Windows 和非 ubuntu 用户。
=======
// Home directory helpers.

/**
 * Resolve the current user's home directory safely across platforms.
 *
 * Priority:
 * 1. `os.homedir()`
 * 2. `$HOME` or `%USERPROFILE%`
 * 3. `os.tmpdir()` as a last resort
>>>>>>> upstream/main
 */
export function getHomeDir(): string {
  try {
    const home = os.homedir();
    if (home && fs.existsSync(home)) return home;
  } catch {}

<<<<<<< HEAD
  // fallback 环境变量
  const envHome = process.env.HOME || process.env.USERPROFILE;
  if (envHome && fs.existsSync(envHome)) return envHome;

  // 最后降级
=======
  // Fall back to environment variables.
  const envHome = process.env.HOME || process.env.USERPROFILE;
  if (envHome && fs.existsSync(envHome)) return envHome;

  // Final fallback.
>>>>>>> upstream/main
  return os.tmpdir();
}

/**
<<<<<<< HEAD
 * 获取 .openclaw/qqbot 下的子目录路径，并自动创建
 * 替代各文件中分散的 path.join(HOME, ".openclaw", "qqbot", ...)
=======
 * Return a path under `~/.openclaw/qqbot`, creating it on demand.
>>>>>>> upstream/main
 */
export function getQQBotDataDir(...subPaths: string[]): string {
  const dir = path.join(getHomeDir(), ".openclaw", "qqbot", ...subPaths);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

<<<<<<< HEAD
// ============ 临时目录 ============

/**
 * 获取系统临时目录（跨平台安全）
 * Mac: /var/folders/... 或 /tmp
 * Linux: /tmp
 * Windows: %TEMP% 或 C:\Users\xxx\AppData\Local\Temp
 */
=======
/**
 * Return a path under `~/.openclaw/media/qqbot`, creating it on demand.
 *
 * Unlike `getQQBotDataDir`, this lives under OpenClaw's core media allowlist so
 * downloaded images and audio can be accessed by framework media tooling.
 */
export function getQQBotMediaDir(...subPaths: string[]): string {
  const dir = path.join(getHomeDir(), ".openclaw", "media", "qqbot", ...subPaths);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

// Temporary directory helpers.

/** Return the OS temp directory. */
>>>>>>> upstream/main
export function getTempDir(): string {
  return os.tmpdir();
}

<<<<<<< HEAD
// ============ 波浪线路径展开 ============

/**
 * 展开路径中的波浪线（~）为用户主目录
 *
 * Mac/Linux 用户经常使用 `~/Desktop/file.png` 这样的路径，
 * 但 Node.js 的 fs 模块不会像 shell 一样自动展开 `~`。
 *
 * 支持:
 * - `~/xxx`  → `/Users/you/xxx`（Mac）或 `/home/you/xxx`（Linux）
 * - `~`      → `/Users/you`
 * - 非 `~` 开头的路径原样返回
 *
 * 注意: 不支持 `~otheruser/xxx` 语法（极少使用，且需要系统调用获取其他用户信息）
=======
// Tilde expansion.

/**
 * Expand `~` to the current user's home directory.
 *
 * Supports `~` and `~/...`. Other forms are returned unchanged.
>>>>>>> upstream/main
 */
export function expandTilde(p: string): string {
  if (!p) return p;
  if (p === "~") return getHomeDir();
  if (p.startsWith("~/") || p.startsWith("~\\")) {
    return path.join(getHomeDir(), p.slice(2));
  }
  return p;
}

/**
<<<<<<< HEAD
 * 对路径进行完整的规范化处理：展开波浪线 + 去除首尾空白
 * 所有文件操作前应通过此函数处理用户输入的路径
 */
export function normalizePath(p: string): string {
  return expandTilde(p.trim());
}

// ============ 文件名 UTF-8 规范化 ============

/**
 * 规范化文件名为 QQ Bot API 要求的 UTF-8 编码格式
 *
 * 问题场景:
 * - macOS HFS+/APFS 文件系统使用 NFD（Unicode 分解形式）存储文件名，
 *   例如「中文.txt」被分解为多个码点，QQ Bot API 可能拒绝
 * - 文件名可能包含 API 不接受的特殊控制字符
 * - URL 路径中可能包含 percent-encoded 的文件名需要解码
 *
 * 处理:
 * 1. Unicode NFC 规范化（将 NFD 分解形式合并为 NFC 组合形式）
 * 2. 去除 ASCII 控制字符（0x00-0x1F, 0x7F）
 * 3. 去除首尾空白
 * 4. 对 percent-encoded 的文件名尝试 URI 解码
=======
 * Normalize a user-provided path by trimming, stripping `file://`, and expanding `~`.
 */
export function normalizePath(p: string): string {
  let result = p.trim();
  // Strip the local file URI scheme.
  if (result.startsWith("file://")) {
    result = result.slice("file://".length);
    // Decode URL-escaped paths when possible.
    try {
      result = decodeURIComponent(result);
    } catch {
      // Keep the raw string if decoding fails.
    }
  }
  return expandTilde(result);
}

function isPathWithinRoot(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

/**
 * Remap legacy or hallucinated QQ Bot local media paths to real files when possible.
 */
export function resolveQQBotLocalMediaPath(p: string): string {
  const normalized = normalizePath(p);
  if (!isLocalPath(normalized) || fs.existsSync(normalized)) {
    return normalized;
  }

  const homeDir = getHomeDir();
  const mediaRoot = getQQBotMediaDir();
  const dataRoot = getQQBotDataDir();
  const workspaceRoot = path.join(homeDir, ".openclaw", "workspace", "qqbot");
  const candidateRoots = [
    { from: workspaceRoot, to: mediaRoot },
    { from: dataRoot, to: mediaRoot },
    { from: mediaRoot, to: dataRoot },
  ];

  for (const { from, to } of candidateRoots) {
    if (!isPathWithinRoot(normalized, from)) {
      continue;
    }
    const relative = path.relative(from, normalized);
    const candidate = path.join(to, relative);
    if (fs.existsSync(candidate)) {
      debugWarn(`[platform] Remapped missing QQBot media path ${normalized} -> ${candidate}`);
      return candidate;
    }
  }

  return normalized;
}

// Filename normalization.

/**
 * Normalize filenames into a UTF-8 form that the QQ Bot API accepts reliably.
 *
 * This decodes percent-escaped names, converts Unicode to NFC, and strips ASCII
 * control characters.
>>>>>>> upstream/main
 */
export function sanitizeFileName(name: string): string {
  if (!name) return name;

  let result = name.trim();

<<<<<<< HEAD
  // 尝试 URI 解码（处理 URL 中 percent-encoded 的中文文件名）
  // 例如 %E4%B8%AD%E6%96%87.txt → 中文.txt
=======
  // Decode percent-escaped names when they came from URLs.
>>>>>>> upstream/main
  if (result.includes("%")) {
    try {
      result = decodeURIComponent(result);
    } catch {
<<<<<<< HEAD
      // 解码失败（非合法 percent-encoding），保留原始值
    }
  }

  // Unicode NFC 规范化：将 macOS NFD 分解形式合并为标准 NFC 组合形式
  result = result.normalize("NFC");

  // 去除 ASCII 控制字符（保留所有可打印字符和非 ASCII Unicode 字符）
=======
      // Keep the raw value if it is not valid percent-encoding.
    }
  }

  // Convert macOS-style NFD names into standard NFC form.
  result = result.normalize("NFC");

  // Drop ASCII control characters while keeping printable Unicode content.
>>>>>>> upstream/main
  result = result.replace(/[\x00-\x1F\x7F]/g, "");

  return result;
}

<<<<<<< HEAD
// ============ 本地路径判断 ============

/**
 * 判断字符串是否为本地文件路径（非 URL）
 *
 * 覆盖:
 * - Unix 绝对路径: /Users/..., /home/..., /tmp/...
 * - Windows 绝对路径: C:\..., D:/..., \\server\share
 * - 相对路径: ./file, ../file
 * - 波浪线路径: ~/Desktop/file.png
 *
 * 不匹配:
 * - http:// / https:// URL
 * - data: URL
 */
export function isLocalPath(p: string): boolean {
  if (!p) return false;
  // 波浪线路径（Mac/Linux 用户常用）
  if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) return true;
  // Unix 绝对路径
  if (p.startsWith("/")) return true;
  // Windows 盘符: C:\ 或 C:/
  if (/^[a-zA-Z]:[\\/]/.test(p)) return true;
  // Windows UNC: \\server\share
  if (p.startsWith("\\\\")) return true;
  // 相对路径
  if (p.startsWith("./") || p.startsWith("../")) return true;
  // Windows 相对路径
=======
// Local path detection.

/**
 * Return true when the string looks like a local filesystem path rather than a URL.
 */
export function isLocalPath(p: string): boolean {
  if (!p) return false;
  // Local file URI.
  if (p.startsWith("file://")) return true;
  // Tilde-based Unix path.
  if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) return true;
  // Unix absolute path.
  if (p.startsWith("/")) return true;
  // Windows drive-letter path.
  if (/^[a-zA-Z]:[\\/]/.test(p)) return true;
  // Windows UNC path.
  if (p.startsWith("\\\\")) return true;
  // POSIX relative path.
  if (p.startsWith("./") || p.startsWith("../")) return true;
  // Windows relative path.
>>>>>>> upstream/main
  if (p.startsWith(".\\") || p.startsWith("..\\")) return true;
  return false;
}

<<<<<<< HEAD
/**
 * 判断 markdown 中提取的路径是否像本地路径
 * 比 isLocalPath 更宽松，用于从 markdown ![](path) 中检测误用
 */
export function looksLikeLocalPath(p: string): boolean {
  if (isLocalPath(p)) return true;
  // 常见系统目录前缀（不以 / 开头时也匹配）
  return /^(?:Users|home|tmp|var|private|[A-Z]:)/i.test(p);
}

// ============ ffmpeg 跨平台检测 ============

let _ffmpegPath: string | null | undefined; // undefined = 未检测, null = 不可用
let _ffmpegCheckPromise: Promise<string | null> | null = null;

/**
 * 检测 ffmpeg 是否可用，返回可执行路径
 *
 * Windows 上检测 ffmpeg.exe，Mac/Linux 检测 ffmpeg
 * 支持通过环境变量 FFMPEG_PATH 指定自定义路径
 *
 * @returns ffmpeg 可执行文件路径，不可用返回 null
 */
=======
/** Looser local-path heuristic used for markdown-extracted paths. */
export function looksLikeLocalPath(p: string): boolean {
  if (isLocalPath(p)) return true;
  return /^(?:Users|home|tmp|var|private|[A-Z]:)/i.test(p);
}

let _ffmpegPath: string | null | undefined;
let _ffmpegCheckPromise: Promise<string | null> | null = null;

/** Detect ffmpeg and return an executable path when available. */
>>>>>>> upstream/main
export function detectFfmpeg(): Promise<string | null> {
  if (_ffmpegPath !== undefined) return Promise.resolve(_ffmpegPath);
  if (_ffmpegCheckPromise) return _ffmpegCheckPromise;

  _ffmpegCheckPromise = (async () => {
<<<<<<< HEAD
    // 1. 环境变量自定义路径
=======
>>>>>>> upstream/main
    const envPath = process.env.FFMPEG_PATH;
    if (envPath) {
      const ok = await testExecutable(envPath, ["-version"]);
      if (ok) {
        _ffmpegPath = envPath;
<<<<<<< HEAD
        console.log(`[platform] ffmpeg found via FFMPEG_PATH: ${envPath}`);
        return _ffmpegPath;
      }
      console.warn(`[platform] FFMPEG_PATH set but not working: ${envPath}`);
    }

    // 2. 系统 PATH 中检测
=======
        debugLog(`[platform] ffmpeg found via FFMPEG_PATH: ${envPath}`);
        return _ffmpegPath;
      }
      debugWarn(`[platform] FFMPEG_PATH set but not working: ${envPath}`);
    }

>>>>>>> upstream/main
    const cmd = isWindows() ? "ffmpeg.exe" : "ffmpeg";
    const ok = await testExecutable(cmd, ["-version"]);
    if (ok) {
      _ffmpegPath = cmd;
<<<<<<< HEAD
      console.log(`[platform] ffmpeg detected in PATH`);
      return _ffmpegPath;
    }

    // 3. 常见安装位置（Mac brew、Windows choco/scoop）
=======
      debugLog(`[platform] ffmpeg detected in PATH`);
      return _ffmpegPath;
    }

>>>>>>> upstream/main
    const commonPaths = isWindows()
      ? [
          "C:\\ffmpeg\\bin\\ffmpeg.exe",
          path.join(process.env.LOCALAPPDATA || "", "Programs", "ffmpeg", "bin", "ffmpeg.exe"),
          path.join(process.env.ProgramFiles || "", "ffmpeg", "bin", "ffmpeg.exe"),
        ]
      : [
<<<<<<< HEAD
          "/usr/local/bin/ffmpeg", // Mac brew
          "/opt/homebrew/bin/ffmpeg", // Mac ARM brew
          "/usr/bin/ffmpeg", // Linux apt
          "/snap/bin/ffmpeg", // Linux snap
=======
          "/usr/local/bin/ffmpeg",
          "/opt/homebrew/bin/ffmpeg",
          "/usr/bin/ffmpeg",
          "/snap/bin/ffmpeg",
>>>>>>> upstream/main
        ];

    for (const p of commonPaths) {
      if (p && fs.existsSync(p)) {
        const works = await testExecutable(p, ["-version"]);
        if (works) {
          _ffmpegPath = p;
<<<<<<< HEAD
          console.log(`[platform] ffmpeg found at: ${p}`);
=======
          debugLog(`[platform] ffmpeg found at: ${p}`);
>>>>>>> upstream/main
          return _ffmpegPath;
        }
      }
    }

    _ffmpegPath = null;
    return null;
  })().finally(() => {
    _ffmpegCheckPromise = null;
  });

  return _ffmpegCheckPromise;
}

<<<<<<< HEAD
/** 测试可执行文件是否能正常运行 */
=======
/** Return true when an executable responds successfully to the given args. */
>>>>>>> upstream/main
function testExecutable(cmd: string, args: string[]): Promise<boolean> {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: 5000 }, (err) => {
      resolve(!err);
    });
  });
}

<<<<<<< HEAD
/** 重置 ffmpeg 缓存（用于测试） */
=======
/** Reset ffmpeg detection state, mainly for tests. */
>>>>>>> upstream/main
export function resetFfmpegCache(): void {
  _ffmpegPath = undefined;
  _ffmpegCheckPromise = null;
}

<<<<<<< HEAD
// ============ silk-wasm 兼容性 ============

let _silkWasmAvailable: boolean | null = null;

/**
 * 检测 silk-wasm 是否可用
 *
 * silk-wasm 依赖 WASM 运行时，在某些环境（如老版本 Node、某些容器）可能不可用。
 * 提前检测避免运行时崩溃。
 */
=======
let _silkWasmAvailable: boolean | null = null;

/** Check whether silk-wasm can run in the current environment. */
>>>>>>> upstream/main
export async function checkSilkWasmAvailable(): Promise<boolean> {
  if (_silkWasmAvailable !== null) return _silkWasmAvailable;

  try {
    const { isSilk } = await import("silk-wasm");
<<<<<<< HEAD
    // 用一个空 buffer 快速测试 WASM 是否能加载
    isSilk(new Uint8Array(0));
    _silkWasmAvailable = true;
    console.log("[platform] silk-wasm: available");
  } catch (err) {
    _silkWasmAvailable = false;
    console.warn(
=======
    // Use an empty buffer as a cheap smoke test for WASM loading.
    isSilk(new Uint8Array(0));
    _silkWasmAvailable = true;
    debugLog("[platform] silk-wasm: available");
  } catch (err) {
    _silkWasmAvailable = false;
    debugWarn(
>>>>>>> upstream/main
      `[platform] silk-wasm: NOT available (${err instanceof Error ? err.message : String(err)})`,
    );
  }
  return _silkWasmAvailable;
}

<<<<<<< HEAD
// ============ 启动环境诊断 ============
=======
// Startup environment diagnostics.
>>>>>>> upstream/main

export interface DiagnosticReport {
  platform: string;
  arch: string;
  nodeVersion: string;
  homeDir: string;
  tempDir: string;
  dataDir: string;
  ffmpeg: string | null;
  silkWasm: boolean;
  warnings: string[];
}

/**
<<<<<<< HEAD
 * 运行启动诊断，返回环境报告
 * 在 gateway 启动时调用，打印环境信息并给出警告
=======
 * Run startup diagnostics and return an environment report.
 * Called during gateway startup to log environment details and warnings.
>>>>>>> upstream/main
 */
export async function runDiagnostics(): Promise<DiagnosticReport> {
  const warnings: string[] = [];

  const platform = `${process.platform} (${os.release()})`;
  const arch = process.arch;
  const nodeVersion = process.version;
  const homeDir = getHomeDir();
  const tempDir = getTempDir();
  const dataDir = getQQBotDataDir();

<<<<<<< HEAD
  // 检测 ffmpeg
=======
  // Check ffmpeg availability.
>>>>>>> upstream/main
  const ffmpegPath = await detectFfmpeg();
  if (!ffmpegPath) {
    warnings.push(
      isWindows()
<<<<<<< HEAD
        ? "⚠️ ffmpeg 未安装。语音/视频格式转换将受限。安装方式: choco install ffmpeg 或 scoop install ffmpeg 或从 https://ffmpeg.org 下载"
        : getPlatform() === "darwin"
          ? "⚠️ ffmpeg 未安装。语音/视频格式转换将受限。安装方式: brew install ffmpeg"
          : "⚠️ ffmpeg 未安装。语音/视频格式转换将受限。安装方式: sudo apt install ffmpeg 或 sudo yum install ffmpeg",
    );
  }

  // 检测 silk-wasm
  const silkWasm = await checkSilkWasmAvailable();
  if (!silkWasm) {
    warnings.push(
      "⚠️ silk-wasm 不可用。QQ 语音消息的收发将无法工作。请确认 Node.js 版本 >= 16 且 WASM 支持正常",
    );
  }

  // 检查数据目录可写性
=======
        ? "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with choco install ffmpeg, scoop install ffmpeg, or from https://ffmpeg.org."
        : getPlatform() === "darwin"
          ? "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with brew install ffmpeg."
          : "⚠️ ffmpeg is not installed. Audio/video conversion will be limited. Install it with sudo apt install ffmpeg or sudo yum install ffmpeg.",
    );
  }

  // Check silk-wasm availability.
  const silkWasm = await checkSilkWasmAvailable();
  if (!silkWasm) {
    warnings.push(
      "⚠️ silk-wasm is unavailable. QQ voice send/receive will not work. Ensure Node.js >= 16 and WASM support are available.",
    );
  }

  // Check whether the data directory is writable.
>>>>>>> upstream/main
  try {
    const testFile = path.join(dataDir, ".write-test");
    fs.writeFileSync(testFile, "test");
    fs.unlinkSync(testFile);
  } catch {
<<<<<<< HEAD
    warnings.push(`⚠️ 数据目录不可写: ${dataDir}。请检查权限`);
  }

  // Windows 特殊提醒
  if (isWindows()) {
    // 检查路径中是否有中文或空格（可能导致某些工具异常）
    if (/[\u4e00-\u9fa5]/.test(homeDir) || homeDir.includes(" ")) {
      warnings.push(
        `⚠️ 用户目录包含中文或空格: ${homeDir}。某些工具可能无法正常工作，建议设置 QQBOT_DATA_DIR 环境变量指定纯英文路径`,
=======
    warnings.push(`⚠️ Data directory is not writable: ${dataDir}. Check filesystem permissions.`);
  }

  // Windows-specific reminder.
  if (isWindows()) {
    // Chinese characters or spaces in the home path can break external tools.
    if (/[\u4e00-\u9fa5]/.test(homeDir) || homeDir.includes(" ")) {
      warnings.push(
        `⚠️ Home directory contains Chinese characters or spaces: ${homeDir}. Some tools may fail. Consider setting QQBOT_DATA_DIR to an ASCII-only path.`,
>>>>>>> upstream/main
      );
    }
  }

  const report: DiagnosticReport = {
    platform,
    arch,
    nodeVersion,
    homeDir,
    tempDir,
    dataDir,
    ffmpeg: ffmpegPath,
    silkWasm,
    warnings,
  };

<<<<<<< HEAD
  // 打印诊断报告
  console.log("=== QQBot 环境诊断 ===");
  console.log(`  平台: ${platform} (${arch})`);
  console.log(`  Node: ${nodeVersion}`);
  console.log(`  主目录: ${homeDir}`);
  console.log(`  数据目录: ${dataDir}`);
  console.log(`  ffmpeg: ${ffmpegPath ?? "未安装"}`);
  console.log(`  silk-wasm: ${silkWasm ? "可用" : "不可用"}`);
  if (warnings.length > 0) {
    console.log("  --- 警告 ---");
    for (const w of warnings) {
      console.log(`  ${w}`);
    }
  }
  console.log("======================");
=======
  // Print the report once for startup visibility.
  debugLog("=== QQBot Environment Diagnostics ===");
  debugLog(`  Platform: ${platform} (${arch})`);
  debugLog(`  Node: ${nodeVersion}`);
  debugLog(`  Home: ${homeDir}`);
  debugLog(`  Data dir: ${dataDir}`);
  debugLog(`  ffmpeg: ${ffmpegPath ?? "not installed"}`);
  debugLog(`  silk-wasm: ${silkWasm ? "available" : "unavailable"}`);
  if (warnings.length > 0) {
    debugLog("  --- Warnings ---");
    for (const w of warnings) {
      debugLog(`  ${w}`);
    }
  }
  debugLog("======================");
>>>>>>> upstream/main

  return report;
}
