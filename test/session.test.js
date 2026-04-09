import test from 'node:test';
import assert from 'node:assert/strict';
import { isSessionExpired } from '../auth/session.js';

test('isSessionExpired returns true for empty session', () => {
  assert.equal(isSessionExpired(null), true);
  assert.equal(isSessionExpired({ cookies: [] }), true);
});

test('isSessionExpired accepts session cookies with expires -1', () => {
  const session = { cookies: [{ name: 'dbcl2', value: 'x', expires: -1 }] };
  assert.equal(isSessionExpired(session), false);
});

test('isSessionExpired checks unix expiry', () => {
  const future = Math.floor(Date.now() / 1000) + 3600;
  const past = Math.floor(Date.now() / 1000) - 10;
  assert.equal(isSessionExpired({ cookies: [{ name: 'a', value: 'b', expires: future }] }), false);
  assert.equal(isSessionExpired({ cookies: [{ name: 'a', value: 'b', expires: past }] }), true);
});
