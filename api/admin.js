// @ts-check
// One endpoint for the admin screen: POST /api/admin { op, ...args }
import { readJson, send, clientIp, HttpError } from './_lib/http.js';
import { dbUrl, recentHits, addHit, clearHits } from './_lib/db.js';
import { stripeKey, testMode, stripeMessage } from './_lib/stripe.js';
import { allowed, meFor, hasSection } from './_lib/team.js';
import { signIn, contextFor } from './_lib/session.js';
import { clearSessionCookie } from './_lib/auth.js';
import { audit, auditLogin } from './_lib/audit.js';
import { OPS as BASE_OPS } from './_lib/ops.js';
import { SUMMARY_OPS } from './_lib/summary.js';

const OPS = { ...BASE_OPS, ...SUMMARY_OPS };

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
      const ctx = setup.database && setup.password ? await contextFor(req) : null;
      return send(res, 200, { setup, authed: !!ctx, me: ctx ? meFor(ctx, ctx.settings) : null, testMode: testMode() });
    }
    if (op === 'login') {
      if (!setup.password) throw new HttpError(503, 'Set ADMIN_PASSWORD (at least 8 characters) in Vercel first.');
      if (!setup.database) throw new HttpError(503, 'Connect a database in Vercel first.');
      const ip = clientIp(req);
      if (await recentHits('login', ip, 15) >= 8) throw new HttpError(429, 'Too many tries. Wait 15 minutes.');
      const who = await signIn(body);
      if (!who) {
        await addHit('login', ip);
        throw new HttpError(401, body.email ? 'Wrong email or password' : 'Wrong password');
      }
      await clearHits('login', ip);
      await auditLogin(who.who, who.worker);
      return send(res, 200, { ok: true }, { 'Set-Cookie': who.cookie });
    }
    if (op === 'logout') {
      return send(res, 200, { ok: true }, { 'Set-Cookie': clearSessionCookie() });
    }

    if (!setup.database) throw new HttpError(503, 'Connect a database in Vercel first.');
    const ctx = await contextFor(req);
    if (!ctx) throw new HttpError(401, 'Please sign in');
    const fn = /** @type {Record<string, Function>} */ (OPS)[op];
    if (!fn) throw new HttpError(404, 'Unknown action');
    if (!allowed(ctx, op, ctx.settings)) throw new HttpError(403, 'You don\'t have access to this');
    const data = await fn(body, req, ctx);
    await audit(ctx, op, body, data);
    if (op === 'clients.get' && !ctx.owner) {
      // a team member sees a client's money only for the parts they have access to
      const p = /** @type {any} */ (ctx).perms;
      if (!hasSection(p, 'invoices', 'view')) data.invoices = [];
      if (!hasSection(p, 'payments', 'view')) { data.charges = []; data.cards = []; }
      if (!hasSection(p, 'plans', 'view')) data.plans = [];
      if (!hasSection(p, 'books', 'view')) data.entries = [];
    }
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
