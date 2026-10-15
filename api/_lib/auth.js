// @ts-check
import crypto from 'node:crypto';
import { cookie } from './http.js';

export const COOKIE = 'gg_admin';
const DAYS = 14;

function password() { return process.env.ADMIN_PASSWORD || ''; }

// Sessions are signed with a key derived from the admin password,
// so changing the password signs everyone out.
function key() {
  return crypto.createHmac('sha256', password()).update('gg-admin-session-v1').digest();
}

/** @param {string} payload */
function sign(payload) {
  return crypto.createHmac('sha256', key()).update(payload).digest('base64url');
}

/** @param {string} a @param {string} b */
function same(a, b) {
  const x = crypto.createHash('sha256').update(a).digest();
  const y = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(x, y);
}

/** @param {string} attempt */
export function checkPassword(attempt) {
  const p = password();
  return p.length >= 8 && typeof attempt === 'string' && same(attempt, p);
}

export function newSessionCookie() {
  const exp = Date.now() + DAYS * 864e5;
  const payload = Buffer.from(JSON.stringify({ exp })).toString('base64url');
  const token = payload + '.' + sign(payload);
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DAYS * 86400}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

/** @param {import('http').IncomingMessage} req */
export function isAuthed(req) {
  if (password().length < 8) return false;
  const t = cookie(req, COOKIE);
  const i = t.lastIndexOf('.');
  if (i < 1) return false;
  const payload = t.slice(0, i), sig = t.slice(i + 1);
  if (!same(sig, sign(payload))) return false;
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return typeof exp === 'number' && exp > Date.now();
  } catch { return false; }
}
