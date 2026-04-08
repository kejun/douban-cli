import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const CONFIG_DIR = process.env.DOUBAN_CONFIG_DIR || path.join(os.homedir(), '.douban');
const CACHE_FILE = path.join(CONFIG_DIR, 'cache.json');

async function loadRawCache() {
  try {
    const raw = await fs.readFile(CACHE_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveRawCache(data) {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
  await fs.writeFile(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8');
}

export async function getCached(key) {
  const cache = await loadRawCache();
  const item = cache[key];
  if (!item) {
    return null;
  }
  if (Date.now() > item.expiresAt) {
    delete cache[key];
    await saveRawCache(cache);
    return null;
  }
  return item.value;
}

export async function setCached(key, value, ttlMs = 24 * 60 * 60 * 1000) {
  const cache = await loadRawCache();
  cache[key] = {
    value,
    expiresAt: Date.now() + ttlMs,
  };
  await saveRawCache(cache);
}
