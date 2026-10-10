// Both local storage and public cloud buckets use keys: images/... or audio/...
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { dbRoot } from './database.js';
export const storageRoot = path.join(dbRoot,'storage');
export function validateStorageKey(key) {
  if (!/^(images|audio)\/[A-Za-z0-9/_-]+\.(jpg|jpeg|png|webp|mp3|m4a|ogg|wav)$/.test(key) || key.includes('..')) {
    throw new Error('Use a key like audio/ben-thanh-market/vi.mp3 (ASCII names)');
  }
  return key;
}
export async function mediaUrl(key) {
  validateStorageKey(key);
  const mode = process.env.STORAGE_MODE ?? 'local';
  if (!['local','cloud'].includes(mode)) throw new Error('STORAGE_MODE must be local or cloud');
  if (mode === 'local') {
    const info = await stat(path.join(storageRoot,...key.split('/')));
    if (!info.isFile()) throw new Error('Storage key must refer to a file');
  }
  const base = process.env.STORAGE_PUBLIC_BASE_URL?.replace(/\/+$/, '');
  if (!base || !/^https?:\/\//.test(base)) throw new Error('Set STORAGE_PUBLIC_BASE_URL in db/.env');
  return `${base}/${key}`;
}
