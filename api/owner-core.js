import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { emptyLog, mergeLog } from '../src/lib/learningLog.js';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOG_FILE = path.join(ROOT, 'data/jake-progress.json');
const BUNDLED_LOG = path.join(ROOT, 'src/data/learningLog.json');

const OWNER_PASS_SHA256 = '3873705e9b06a9cb92dd12fd76bd2482c8678ec73287f4e1569cb8e730cb272c';

function sha256(value) {
  return crypto.createHash('sha256').update(String(value), 'utf8').digest('hex');
}

function safeEqualHex(left, right) {
  const a = Buffer.from(String(left || ''), 'hex');
  const b = Buffer.from(String(right || ''), 'hex');
  if (!a.length || a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function ownerName() {
  return String(process.env.OWNER_USERNAME || 'Jake').trim() || 'Jake';
}

function configuredPassword() {
  return String(process.env.OWNER_PASSWORD || '').trim();
}

function passwordHash() {
  const pass = configuredPassword();
  return pass ? sha256(pass) : OWNER_PASS_SHA256;
}

function tokenSecret() {
  return passwordHash();
}

export function makeToken() {
  return crypto.createHmac('sha256', tokenSecret()).update('json2exam-owner').digest('hex');
}

export function checkToken(token) {
  return safeEqualHex(String(token || ''), makeToken());
}

export function runLogin(body) {
  const username = String((body && body.username) || '').trim();
  const given = String((body && body.password) || '');
  const userOk = username.toLowerCase() === ownerName().toLowerCase();
  const passOk = !!given && safeEqualHex(sha256(given), passwordHash());
  if (!userOk || !passOk) {
    return { status: 401, json: { error: 'denied', detail: 'That sign-in does not match.' } };
  }
  return { status: 200, json: { name: ownerName(), token: makeToken() } };
}

export function readProgressFile() {
  const files = [LOG_FILE, BUNDLED_LOG];
  for (const file of files) {
    try {
      const raw = fs.readFileSync(file, 'utf8');
      return mergeLog(emptyLog(), JSON.parse(raw));
    } catch (e) { /* try the next copy */ }
  }
  return emptyLog();
}

export function runProgressGet() {
  return { status: 200, json: readProgressFile() };
}

export function runProgressPost(body, token) {
  if (!checkToken(token)) {
    return { status: 401, json: { error: 'denied', detail: 'Sign in as the owner to update the log.' } };
  }
  const next = mergeLog(readProgressFile(), body);
  next.updatedAt = new Date().toISOString();
  try {
    fs.mkdirSync(path.dirname(LOG_FILE), { recursive: true });
    const tmp = LOG_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(next, null, 2) + '\n');
    fs.renameSync(tmp, LOG_FILE);
  } catch (e) {
    return { status: 200, json: next };
  }
  return { status: 200, json: next };
}

export function bearerToken(req) {
  const header = (req && req.headers && (req.headers.authorization || req.headers.Authorization)) || '';
  const match = /^Bearer\s+(\S+)/i.exec(String(header));
  return match ? match[1] : '';
}
