// Local file storage system
// Files are stored in the local filesystem under /uploads directory

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { ENV } from "./_core/env";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

// Ensure upload directory exists
async function ensureUploadDir() {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function generatePublicUrl(key: string): string {
  const frontendUrl = ENV.frontendUrl || "http://localhost:3000";
  return `${frontendUrl}/uploads/${key}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await ensureUploadDir();
  
  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOAD_DIR, key);
  
  // Ensure subdirectories exist
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  
  // Write file
  const buffer = typeof data === "string" ? Buffer.from(data) : Buffer.from(data);
  await fs.writeFile(filePath, buffer);
  
  const url = generatePublicUrl(key);
  return { key, url };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  const url = generatePublicUrl(key);
  return { key, url };
}

export async function storageDelete(relKey: string): Promise<void> {
  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOAD_DIR, key);
  
  try {
    await fs.unlink(filePath);
  } catch (error) {
    // File doesn't exist, ignore
  }
}

export async function storageExists(relKey: string): Promise<boolean> {
  const key = normalizeKey(relKey);
  const filePath = path.join(UPLOAD_DIR, key);
  
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}
