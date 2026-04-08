import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs/promises';

const tempDir = path.join(os.tmpdir(), `douban-cli-cache-test-${Date.now()}`);
process.env.DOUBAN_CONFIG_DIR = tempDir;

const { getCached, setCached } = await import('../utils/cache.js');

test('cache set and get', async () => {
  await setCached('a', { x: 1 }, 10000);
  const value = await getCached('a');
  assert.deepEqual(value, { x: 1 });
});

test('cache expiration', async () => {
  await setCached('b', 123, 1);
  await new Promise((resolve) => setTimeout(resolve, 5));
  const value = await getCached('b');
  assert.equal(value, null);
});

test('cleanup temp cache dir', async () => {
  await fs.rm(tempDir, { recursive: true, force: true });
  assert.equal(true, true);
});
