<<<<<<< HEAD
/**
 * 文件操作工具 — 异步读取 + 大小校验 + 进度提示
 */

import * as fs from "node:fs";
import * as path from "node:path";

/** QQ Bot API 最大上传文件大小：20MB */
export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

/** 大文件阈值（超过此值发送进度提示）：5MB */
export const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;

/**
 * 文件大小校验结果
 */
=======
import crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

/** Maximum file size accepted by the QQ Bot API. */
export const MAX_UPLOAD_SIZE = 20 * 1024 * 1024;

/** Threshold used to treat an upload as a large file. */
export const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;

/** Result of local file-size validation. */
>>>>>>> upstream/main
export interface FileSizeCheckResult {
  ok: boolean;
  size: number;
  error?: string;
}

<<<<<<< HEAD
/**
 * 校验文件大小是否在上传限制内
 * @param filePath 文件路径
 * @param maxSize 最大允许大小（字节），默认 20MB
 */
=======
/** Validate that a file is within the allowed upload size. */
>>>>>>> upstream/main
export function checkFileSize(filePath: string, maxSize = MAX_UPLOAD_SIZE): FileSizeCheckResult {
  try {
    const stat = fs.statSync(filePath);
    if (stat.size > maxSize) {
      const sizeMB = (stat.size / (1024 * 1024)).toFixed(1);
      const limitMB = (maxSize / (1024 * 1024)).toFixed(0);
      return {
        ok: false,
        size: stat.size,
<<<<<<< HEAD
        error: `文件过大 (${sizeMB}MB)，QQ Bot API 上传限制为 ${limitMB}MB`,
=======
        error: `File is too large (${sizeMB}MB); QQ Bot API limit is ${limitMB}MB`,
>>>>>>> upstream/main
      };
    }
    return { ok: true, size: stat.size };
  } catch (err) {
    return {
      ok: false,
      size: 0,
<<<<<<< HEAD
      error: `无法读取文件信息: ${err instanceof Error ? err.message : String(err)}`,
=======
      error: `Failed to read file metadata: ${err instanceof Error ? err.message : String(err)}`,
>>>>>>> upstream/main
    };
  }
}

<<<<<<< HEAD
/**
 * 异步读取文件内容
 * 替代 fs.readFileSync，避免阻塞事件循环
 */
=======
/** Read file contents asynchronously. */
>>>>>>> upstream/main
export async function readFileAsync(filePath: string): Promise<Buffer> {
  return fs.promises.readFile(filePath);
}

<<<<<<< HEAD
/**
 * 异步检查文件是否存在
 */
=======
/** Check file readability asynchronously. */
>>>>>>> upstream/main
export async function fileExistsAsync(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

<<<<<<< HEAD
/**
 * 异步获取文件大小
 */
=======
/** Get file size asynchronously. */
>>>>>>> upstream/main
export async function getFileSizeAsync(filePath: string): Promise<number> {
  const stat = await fs.promises.stat(filePath);
  return stat.size;
}

<<<<<<< HEAD
/**
 * 判断文件是否为"大文件"（需要进度提示）
 */
=======
/** Return true when a file should be treated as large. */
>>>>>>> upstream/main
export function isLargeFile(sizeBytes: number): boolean {
  return sizeBytes >= LARGE_FILE_THRESHOLD;
}

<<<<<<< HEAD
/**
 * 格式化文件大小为人类可读的字符串
 */
=======
/** Format a byte count into a human-readable size string. */
>>>>>>> upstream/main
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

<<<<<<< HEAD
/**
 * 根据文件扩展名获取 MIME 类型
 */
=======
/** Infer a MIME type from the file extension. */
>>>>>>> upstream/main
export function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".webp": "image/webp",
    ".bmp": "image/bmp",
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
    ".webm": "video/webm",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".zip": "application/zip",
    ".tar": "application/x-tar",
    ".gz": "application/gzip",
    ".txt": "text/plain",
  };
  return mimeTypes[ext] ?? "application/octet-stream";
}
<<<<<<< HEAD
=======

/** Download a remote file into a local directory. */
export async function downloadFile(
  url: string,
  destDir: string,
  originalFilename?: string,
): Promise<string | null> {
  try {
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const resp = await fetch(url, { redirect: "follow" });
    if (!resp.ok || !resp.body) return null;

    let filename = originalFilename?.trim() || "";
    if (!filename) {
      try {
        const urlPath = new URL(url).pathname;
        filename = path.basename(urlPath) || "download";
      } catch {
        filename = "download";
      }
    }

    const ts = Date.now();
    const ext = path.extname(filename);
    const base = path.basename(filename, ext) || "file";
    const rand = crypto.randomBytes(3).toString("hex");
    const safeFilename = `${base}_${ts}_${rand}${ext}`;

    const destPath = path.join(destDir, safeFilename);
    const buffer = Buffer.from(await resp.arrayBuffer());
    await fs.promises.writeFile(destPath, buffer);
    return destPath;
  } catch {
    return null;
  }
}
>>>>>>> upstream/main
