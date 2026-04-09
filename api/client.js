import { fetch } from 'undici';
import { isSessionExpired, loadSession } from '../auth/session.js';

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.6367.208 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
];

function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

async function randomDelay() {
  const enabled = process.env.DOUBAN_DELAY !== 'off';
  if (!enabled) {
    return;
  }
  const min = 500;
  const max = 2000;
  const wait = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise((resolve) => setTimeout(resolve, wait));
}

function toCookieHeader(cookies = []) {
  return cookies
    .filter((cookie) => cookie?.name && cookie?.value)
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join('; ');
}

function detectRiskResponse(status, text) {
  if (status === 403 || status === 401) {
    return 'Request blocked by authorization or anti-bot policy (401/403).';
  }

  if (text && /(captcha|验证码|异常请求|安全验证)/i.test(text)) {
    return 'Request hit captcha/risk control. Please handle manually in browser and retry.';
  }

  return null;
}

export class DoubanClient {
  constructor({ baseUrl = 'https://www.douban.com' } = {}) {
    this.baseUrl = baseUrl;
  }

  async request(path, { method = 'GET', query, form, json, headers = {}, retries = 1 } = {}) {
    const session = await loadSession();
    if (!session || isSessionExpired(session)) {
      throw new Error('Session missing or expired. Run: douban login');
    }

    const url = new URL(path, this.baseUrl);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }

    const mergedHeaders = {
      'user-agent': randomUserAgent(),
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
      'referer': 'https://www.douban.com/',
      'cookie': toCookieHeader(session.cookies),
      ...headers,
    };

    let body;
    if (form) {
      body = new URLSearchParams(
        Object.fromEntries(Object.entries(form).map(([k, v]) => [k, String(v)]))
      ).toString();
      mergedHeaders['content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
    } else if (json) {
      body = JSON.stringify(json);
      mergedHeaders['content-type'] = 'application/json';
    }

    await randomDelay();

    for (let attempt = 0; attempt <= retries; attempt += 1) {
      try {
        const response = await fetch(url, { method, headers: mergedHeaders, body });
        const text = await response.text();

        const risk = detectRiskResponse(response.status, text);
        if (risk) {
          throw new Error(risk);
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${text.slice(0, 300)}`);
        }

        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return text ? JSON.parse(text) : {};
        }

        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      } catch (error) {
        if (attempt >= retries) {
          throw error;
        }
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }

    throw new Error('Unexpected request failure.');
  }
}
