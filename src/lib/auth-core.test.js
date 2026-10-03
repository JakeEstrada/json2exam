import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkToken } from '../../api/owner-core.js';
import {
  makeUserToken,
  memoryUsers,
  readUserToken,
  runAnyLogin,
  runSignup,
  runUserLogin,
} from '../../api/auth-core.js';

test('signup creates a user and returns a token that is not the owner token', async () => {
  const users = memoryUsers();
  const created = await runSignup({
    name: 'Pat',
    email: 'Pat@Example.com',
    password: 'longenough',
  }, users);
  assert.equal(created.status, 201);
  assert.equal(created.json.name, 'Pat');
  assert.equal(created.json.email, 'pat@example.com');
  assert.equal(created.json.kind, 'user');
  assert.ok(created.json.token);
  assert.equal(checkToken(created.json.token), false);
  assert.equal(readUserToken(created.json.token).kind, 'user');
  assert.equal(readUserToken(created.json.token).id, '1');
});

test('signup rejects a duplicate email', async () => {
  const users = memoryUsers();
  const first = await runSignup({
    name: 'Pat',
    email: 'pat@example.com',
    password: 'longenough',
  }, users);
  assert.equal(first.status, 201);
  const again = await runSignup({
    name: 'Pat Two',
    email: 'PAT@example.com',
    password: 'different1',
  }, users);
  assert.equal(again.status, 409);
});

test('signup rejects a short password and a bad email', async () => {
  const users = memoryUsers();
  const short = await runSignup({ name: 'Pat', email: 'pat@example.com', password: 'short' }, users);
  assert.equal(short.status, 400);
  const email = await runSignup({ name: 'Pat', email: 'not-an-email', password: 'longenough' }, users);
  assert.equal(email.status, 400);
});

test('user login accepts the registered email and rejects a wrong password', async () => {
  const users = memoryUsers();
  await runSignup({ name: 'Pat', email: 'pat@example.com', password: 'longenough' }, users);
  const denied = await runUserLogin({ username: 'pat@example.com', password: 'nope!!!!' }, users);
  assert.equal(denied.status, 401);
  const ok = await runUserLogin({ email: 'Pat@Example.com', password: 'longenough' }, users);
  assert.equal(ok.status, 200);
  assert.equal(ok.json.name, 'Pat');
  assert.equal(checkToken(ok.json.token), false);
  assert.ok(readUserToken(ok.json.token));
});

test('runAnyLogin still accepts the owner before trying Mongo users', async () => {
  const prevUser = process.env.OWNER_USERNAME;
  const prevPass = process.env.OWNER_PASSWORD;
  process.env.OWNER_USERNAME = 'Jake';
  process.env.OWNER_PASSWORD = 'test-owner-pass';
  try {
    const users = memoryUsers();
    const owner = await runAnyLogin({ username: 'Jake', password: 'test-owner-pass' }, users);
    assert.equal(owner.status, 200);
    assert.equal(owner.json.kind, 'owner');
    assert.equal(checkToken(owner.json.token), true);
    const missing = await runAnyLogin({ username: 'nobody@example.com', password: 'longenough' }, users);
    assert.equal(missing.status, 401);
  } finally {
    if (prevUser == null) delete process.env.OWNER_USERNAME;
    else process.env.OWNER_USERNAME = prevUser;
    if (prevPass == null) delete process.env.OWNER_PASSWORD;
    else process.env.OWNER_PASSWORD = prevPass;
  }
});

test('a forged user token does not verify', () => {
  const token = makeUserToken('9');
  const parts = token.split('.');
  parts[1] = Buffer.from(JSON.stringify({ kind: 'user', id: '1' })).toString('base64url');
  assert.equal(readUserToken(parts.join('.')), null);
  assert.equal(readUserToken(token).id, '9');
});
