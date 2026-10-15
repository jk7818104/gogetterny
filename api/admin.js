// @ts-check
// One endpoint for the admin screen: POST /api/admin { op, ...args }
import { readJson, send, clientIp, HttpError } from './_lib/http.js';
import { checkPassword, isAuthed, newSessionCookie, clearSessionCookie } from './_lib/auth.js';
import { dbUrl, recentHits, addHit, clearHits } from './_lib/db.js';
import { stripeKey, testMode, stripeMessage } from './_lib/stripe.js';
import { OPS } from './_lib/ops.js';

/** @param {import('http').IncomingMessage & {body?: any}} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'POST only');
    // only our own page can call this: it sends this header, which other sites cannot without a CORS preflight we never allow
    if (req.headers['x-gg'] !== '1') throw new HttpError(403, 'Forbidden');
    const body = await readJson(req);
    const op = String(body.op || '');

    const setup = {
      database: !!dbUrl(),
      stripe: !!stripeKey(),
      password: (process.env.ADMIN_PASSWORD || '').length >= 8
    };

    if (op === 'status') {
      return send(res, 200, { setup, authed: isAuthed(req), testMode: testMode() });
    }
    if (op === 'login') {
      if (!setup.password) throw new HttpError(503, 'Set ADMIN_PASSWORD (at least 8 characters) in Vercel first.');
      if (!setup.database) throw new HttpError(503, 'Connect a database in Vercel first.');
      const ip = clientIp(req);
      if (await recentHits('login', ip, 15) >= 8) throw new HttpError(429, 'Too many tries. Wait 15 minutes.');
      if (!checkPassword(body.password)) {
        await addHit('login', ip);
        throw new HttpError(401, 'Wrong password');
      }
      await clearHits('login', ip);
      return send(res, 200, { ok: true }, { 'Set-Cookie': newSessionCookie() });
    }
    if (op === 'logout') {
      return send(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
    }

    if (!isAuthed(req)) throw new HttpError(401, 'Please sign in');
    if (!setup.database) throw new HttpError(503, 'Connect a database in Vercel first.');
    const fn = /** @type {Record<string, Function>} */ (OPS)[op];
    if (!fn) throw new HttpError(404, 'Unknown action');
    const data = await fn(body, req);
    return send(res, 200, data);
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    const sm = stripeMessage(err);
    if (sm) return send(res, 400, { error: sm });
    console.error('admin error', err);
    return send(res, 500, { error: 'Something went wrong. Try again.' });
  }
}
