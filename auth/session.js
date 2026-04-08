import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

const CONFIG_DIR = process.env.DOUBAN_CONFIG_DIR || path.join(os.homedir(), '.douban');
const SESSION_FILE = path.join(CONFIG_DIR, 'session.json');

function nowInSeconds() {
  return Math.floor(Date.now() / 1000);
}

export function getSessionFilePath() {
  return SESSION_FILE;
}

export async function ensureConfigDir() {
  await fs.mkdir(CONFIG_DIR, { recursive: true });
}

export async function loadSession() {
  try {
    const raw = await fs.readFile(SESSION_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.cookies) ? parsed : null;
  } catch {
    return null;
  }
}

export async function saveSession(cookies) {
  await ensureConfigDir();
  const payload = {
    cookies,
    savedAt: new Date().toISOString(),
  };
  await fs.writeFile(SESSION_FILE, JSON.stringify(payload, null, 2), 'utf8');
}

export async function clearSession() {
  try {
    await fs.unlink(SESSION_FILE);
  } catch {
    // ignore missing file
  }
}

export function isSessionExpired(session) {
  if (!session || !Array.isArray(session.cookies) || session.cookies.length === 0) {
    return true;
  }

  const now = nowInSeconds();
  let hasValidCookie = false;

  for (const cookie of session.cookies) {
    if (!cookie || typeof cookie !== 'object') {
      continue;
    }

    if (cookie.expires === -1 || cookie.expires == null) {
      hasValidCookie = true;
      continue;
    }

    if (Number(cookie.expires) > now) {
      hasValidCookie = true;
    }
  }

  return !hasValidCookie;
}

export async function importCookiesFromFile(sourceFilePath) {
  const raw = await fs.readFile(sourceFilePath, 'utf8');
  const parsed = JSON.parse(raw);
  const cookies = Array.isArray(parsed) ? parsed : parsed.cookies;
  if (!Array.isArray(cookies) || cookies.length === 0) {
    throw new Error('Invalid cookie file format.');
  }
  await saveSession(cookies);
}
