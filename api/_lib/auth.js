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

/** Owner session, or a team member's session ({w: worker id, v: their password version}). @param {{w?: number, v?: number}} [who] */
export function newSessionCookie(who = {}) {
  const exp = Date.now() + DAYS * 864e5;
  const payload = Buffer.from(JSON.stringify(who.w ? { exp, w: who.w, v: who.v || 0 } : { exp })).toString('base64url');
  const token = payload + '.' + sign(payload);
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${DAYS * 86400}`;
}

export function clearSessionCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

/**
 * The signed-in session: {owner: true}, {w, v} for a team member, or null.
 * @param {import('http').IncomingMessage} req
 * @returns {{owner?: true, w?: number, v?: number} | null}
 */
export function session(req) {
  if (password().length < 8) return null;
  const t = cookie(req, COOKIE);
  const i = t.lastIndexOf('.');
  if (i < 1) return null;
  const payload = t.slice(0, i), sig = t.slice(i + 1);
  if (!same(sig, sign(payload))) return null;
  try {
    const p = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (typeof p.exp !== 'number' || p.exp <= Date.now()) return null;
    if (p.w) return Number.isInteger(p.w) ? { w: p.w, v: Number(p.v) || 0 } : null;
    return { owner: true };
  } catch { return null; }
}

/** True only for the owner (team members have their own session). @param {import('http').IncomingMessage} req */
export function isAuthed(req) {
  const s = session(req);
  return !!(s && s.owner);
}

/** Password hashing for team members. @param {string} pw */
export function hashPassword(pw) {
  const salt = crypto.randomBytes(16);
  const h = crypto.scryptSync(pw, salt, 32);
  return 's1$' + salt.toString('base64url') + '$' + h.toString('base64url');
}
/** @param {string} pw @param {string} stored */
export function verifyPassword(pw, stored) {
  const [v, salt, h] = String(stored || '').split('$');
  if (v !== 's1' || !salt || !h || typeof pw !== 'string') return false;
  const got = crypto.scryptSync(pw, Buffer.from(salt, 'base64url'), 32);
  const want = Buffer.from(h, 'base64url');
  return got.length === want.length && crypto.timingSafeEqual(got, want);
}
