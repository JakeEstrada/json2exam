import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkToken, runLogin, runProgressGet, runProgressPost } from '../../api/owner-core.js';
import { runAsk } from '../../api/ask-core.js';

test('login rejects a wrong password and accepts the configured owner', () => {
  const prevUser = process.env.OWNER_USERNAME;
  const prevPass = process.env.OWNER_PASSWORD;
  process.env.OWNER_USERNAME = 'Jake';
  process.env.OWNER_PASSWORD = 'test-owner-pass';
  try {
    const denied = runLogin({ username: 'Jake', password: 'nope' });
    assert.equal(denied.status, 401);
    const other = runLogin({ username: 'Pat', password: 'test-owner-pass' });
    assert.equal(other.status, 401);
    const ok = runLogin({ username: 'Jake', password: 'test-owner-pass' });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.name, 'Jake');
    assert.equal(checkToken(ok.json.token), true);
    assert.equal(checkToken('deadbeef'), false);
  } finally {
    if (prevUser == null) delete process.env.OWNER_USERNAME;
    else process.env.OWNER_USERNAME = prevUser;
    if (prevPass == null) delete process.env.OWNER_PASSWORD;
    else process.env.OWNER_PASSWORD = prevPass;
  }
});

test('login works with the built-in owner hash when env password is unset', () => {
  const prevPass = process.env.OWNER_PASSWORD;
  delete process.env.OWNER_PASSWORD;
  try {
    const denied = runLogin({ username: 'Jake', password: 'nope' });
    assert.equal(denied.status, 401);
    const ok = runLogin({ username: 'Jake', password: 'Json2Exam*2026*' });
    assert.equal(ok.status, 200);
    assert.equal(ok.json.name, 'Jake');
  } finally {
    if (prevPass == null) delete process.env.OWNER_PASSWORD;
    else process.env.OWNER_PASSWORD = prevPass;
  }
});

test('progress posts require the owner token', () => {
  const prevPass = process.env.OWNER_PASSWORD;
  process.env.OWNER_PASSWORD = 'test-owner-pass';
  try {
    const denied = runProgressPost({ workingOn: { deckLabel: 'Loops' } }, '');
    assert.equal(denied.status, 401);
  } finally {
    if (prevPass == null) delete process.env.OWNER_PASSWORD;
    else process.env.OWNER_PASSWORD = prevPass;
  }
});

test('progress reads require the owner token', () => {
  const prevPass = process.env.OWNER_PASSWORD;
  process.env.OWNER_PASSWORD = 'test-owner-pass';
  try {
    const denied = runProgressGet('');
    assert.equal(denied.status, 401);
    const ok = runLogin({ username: 'Jake', password: 'test-owner-pass' });
    const read = runProgressGet(ok.json.token);
    assert.equal(read.status, 200);
    assert.equal(read.json.owner, 'Jake');
  } finally {
    if (prevPass == null) delete process.env.OWNER_PASSWORD;
    else process.env.OWNER_PASSWORD = prevPass;
  }
});

test('AskGPT rejects callers who are not signed in', async () => {
  const denied = await runAsk({ message: 'hello' }, '');
  assert.equal(denied.status, 401);
  const prevPass = process.env.OWNER_PASSWORD;
  process.env.OWNER_PASSWORD = 'test-owner-pass';
  try {
    const ok = runLogin({ username: 'Jake', password: 'test-owner-pass' });
    const gated = await runAsk({ message: 'hello' }, ok.json.token);
    assert.notEqual(gated.status, 401);
    if (!process.env.OPENAI_API_KEY) assert.equal(gated.status, 501);
  } finally {
    if (prevPass == null) delete process.env.OWNER_PASSWORD;
    else process.env.OWNER_PASSWORD = prevPass;
  }
});
