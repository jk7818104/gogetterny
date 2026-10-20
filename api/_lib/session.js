// @ts-check
// Who is signed in: the owner (ADMIN_PASSWORD) or a team member. Shared by every endpoint that needs a sign-in.
import { checkPassword, session, newSessionCookie, verifyPassword } from './auth.js';
import { one } from './db.js';
import { getSettings } from './settings.js';
import { memberFor } from './team.js';

/** Owner: password only. Team member: email + password. Returns the cookie, or null. @param {any} body */
export async function signIn(body) {
  const em = String(body.email || '').trim().toLowerCase();
  if (!em) {
    if (!checkPassword(body.password)) return null;
    return { cookie: newSessionCookie(), who: 'owner', worker: null };
  }
  const settings = await getSettings();
  if (!settings.team_login) return null;
  const w = await one(`select id, name, pass_hash, pass_ver, active, login from workers where lower(email)=$1`, [em.slice(0, 200)]);
  if (!w || !w.active || !w.login || !verifyPassword(String(body.password || ''), w.pass_hash)) return null;
  return { cookie: newSessionCookie({ w: w.id, v: w.pass_ver }), who: w.name, worker: w.id };
}

/** The signed-in person for this request, with the settings, or null. @param {any} req */
export async function contextFor(req) {
  const s = session(req);
  if (!s) return null;
  const settings = await getSettings();
  if (s.owner) return { owner: true, settings };
  try {
    return { ...(await memberFor(/** @type {any} */ (s), settings)), settings };
  } catch (e) { return null; }
}

/** Name used in the activity log and the trash. @param {any} ctx */
export const whoOf = (ctx) => (ctx && !ctx.owner ? ctx.worker.name : 'You');
/** @param {any} ctx */
export const whoKey = (ctx) => (ctx && !ctx.owner ? 'member:' + ctx.worker.id : 'owner');
