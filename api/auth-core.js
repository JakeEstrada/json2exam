import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { mongoConfigured, usersCollection } from './db.js';
import { checkToken, runLogin as runOwnerLogin } from './owner-core.js';

const scrypt = promisify(crypto.scrypt);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  if (!a.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function normalizeEmail(value) {
  return String(value || '').trim().toLowerCase();
}

export function memoryUsers() {
  const rows = [];
  return {
    async findOne(query) {
      const email = query && query.email;
      if (!email) return null;
      return rows.find((row) => row.email === email) || null;
    },
    async insertOne(doc) {
      if (rows.some((row) => row.email === doc.email)) {
        const err = new Error('E11000 duplicate key');
        err.code = 11000;
        throw err;
      }
      const _id = String(rows.length + 1);
      rows.push({ ...doc, _id });
      return { insertedId: _id };
    },
  };
}

function sessionSecret() {
  return String(process.env.SESSION_SECRET || process.env.OWNER_PASSWORD || 'json2exam-dev-session').trim();
}

export async function hashPassword(password, salt = crypto.randomBytes(16)) {
  const hash = await scrypt(String(password), salt, 32);
  return { salt: salt.toString('hex'), hash: hash.toString('hex') };
}

export async function verifyPassword(password, saltHex, hashHex) {
  const salt = Buffer.from(String(saltHex || ''), 'hex');
  if (!salt.length) return false;
  const { hash } = await hashPassword(password, salt);
  return safeEqual(hash, hashHex);
}

export function makeUserToken(userId) {
  const payload = Buffer.from(JSON.stringify({ kind: 'user', id: String(userId) })).toString('base64url');
  const sig = crypto.createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
  return 'u.' + payload + '.' + sig;
}

export function readUserToken(token) {
  const parts = String(token || '').split('.');
  if (parts[0] !== 'u' || parts.length !== 3) return null;
  const expect = crypto.createHmac('sha256', sessionSecret()).update(parts[1]).digest('base64url');
  if (!safeEqual(expect, parts[2])) return null;
  try {
    const data = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
    if (!data || data.kind !== 'user' || !data.id) return null;
    return data;
  } catch (_) {
    return null;
  }
}

async function resolveUsers(users) {
  if (users) return users;
  if (!mongoConfigured()) {
    const err = new Error('MONGODB_URI is not set');
    err.code = 'NO_MONGO';
    throw err;
  }
  return usersCollection();
}

function unavailable(action) {
  return {
    status: 503,
    json: { error: 'no_mongo', detail: 'Account ' + action + ' is not configured. Add MONGODB_URI and restart.' },
  };
}

export async function runSignup(body, users) {
  const email = normalizeEmail((body && body.email) || '');
  const name = String((body && body.name) || '').trim();
  const password = String((body && body.password) || '');
  if (!EMAIL_RE.test(email)) {
    return { status: 400, json: { error: 'email', detail: 'Enter a valid email address.' } };
  }
  if (name.length < 1 || name.length > 80) {
    return { status: 400, json: { error: 'name', detail: 'Enter a name to show on the site.' } };
  }
  if (password.length < MIN_PASSWORD) {
    return { status: 400, json: { error: 'password', detail: 'Use a password of at least 8 characters.' } };
  }

  let col;
  try {
    col = await resolveUsers(users);
  } catch (err) {
    if (err && err.code === 'NO_MONGO') return unavailable('signup');
    return { status: 500, json: { error: 'server', detail: err.message || 'Could not reach the account store.' } };
  }

  const hashed = await hashPassword(password);
  try {
    const inserted = await col.insertOne({
      email,
      name,
      passwordHash: hashed.hash,
      passwordSalt: hashed.salt,
      createdAt: new Date(),
    });
    const id = inserted.insertedId;
    return {
      status: 201,
      json: { name, email, token: makeUserToken(id), kind: 'user' },
    };
  } catch (err) {
    if (err && err.code === 11000) {
      return { status: 409, json: { error: 'exists', detail: 'An account with that email already exists.' } };
    }
    return { status: 500, json: { error: 'server', detail: err.message || 'Could not create the account.' } };
  }
}

export async function runUserLogin(body, users) {
  const login = normalizeEmail((body && (body.email || body.username)) || '');
  const password = String((body && body.password) || '');
  if (!login || !password) {
    return { status: 401, json: { error: 'denied', detail: 'That sign-in does not match.' } };
  }

  let col;
  try {
    col = await resolveUsers(users);
  } catch (err) {
    if (err && err.code === 'NO_MONGO') {
      return { status: 401, json: { error: 'denied', detail: 'That sign-in does not match.' } };
    }
    return { status: 500, json: { error: 'server', detail: err.message || 'Could not reach the account store.' } };
  }

  const row = await col.findOne({ email: login });
  if (!row) {
    return { status: 401, json: { error: 'denied', detail: 'That sign-in does not match.' } };
  }
  const ok = await verifyPassword(password, row.passwordSalt, row.passwordHash);
  if (!ok) {
    return { status: 401, json: { error: 'denied', detail: 'That sign-in does not match.' } };
  }
  return {
    status: 200,
    json: {
      name: row.name,
      email: row.email,
      token: makeUserToken(row._id),
      kind: 'user',
    },
  };
}

/** Owner first, then a registered Mongo user. */
export async function runAnyLogin(body, users) {
  const owner = runOwnerLogin(body);
  if (owner.status === 200) {
    return { status: 200, json: Object.assign({ kind: 'owner' }, owner.json) };
  }
  return runUserLogin(body, users);
}

export function isOwnerToken(token) {
  return checkToken(token);
}
