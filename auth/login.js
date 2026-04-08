import process from 'node:process';
import readline from 'node:readline/promises';
import { chromium } from 'playwright';
import { saveSession } from './session.js';

function hasAuthCookies(cookies) {
  return cookies.some((cookie) => ['dbcl2', 'ck', 'bid'].includes(cookie.name));
}

export async function loginAndSaveSession() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.douban.com/', { waitUntil: 'domcontentloaded' });

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  await rl.question('Please complete login in the browser, then press Enter here to continue... ');
  rl.close();

  const cookies = await context.cookies();
  await browser.close();

  if (!hasAuthCookies(cookies)) {
    throw new Error('Login seems incomplete. No expected auth cookies found.');
  }

  await saveSession(cookies);
  return cookies.length;
}
