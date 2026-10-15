// @ts-check
// The website contact form also drops the message here, so new leads show up in the admin.
import { readJson, send, clientIp, str, HttpError } from './_lib/http.js';
import { dbUrl, q, one, recentHits, addHit } from './_lib/db.js';

/** @param {import('http').IncomingMessage & {body?: any}} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'POST only');
    if (!dbUrl()) return send(res, 202, { ok: true });
    const b = await readJson(req);
    if (b.website || b._honey) return send(res, 202, { ok: true }); // bots fill hidden fields
    const name = str(b.name, 120), email = str(b.email, 200), phone = str(b.phone, 40), message = str(b.message, 4000);
    if (!name || !email || !message || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new HttpError(400, 'Missing fields');
    const ip = clientIp(req);
    if (await recentHits('lead', ip, 60) >= 5) return send(res, 202, { ok: true });
    await addHit('lead', ip);
    // same email again: add the message to that client instead of a duplicate
    const existing = await one(`select id from clients where lower(email)=lower($1) order by id limit 1`, [email]);
    let id = existing?.id;
    if (!id) {
      const r = await one(`insert into clients(name, email, phone, status, source, notes) values ($1,$2,$3,'lead','website',$4) returning id`, [name, email, phone, message]);
      id = r.id;
    }
    await q(`insert into activity(client_id, kind, body) values ($1,'lead',$2)`, [id, 'Website form: ' + message]);
    return send(res, 200, { ok: true });
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error('lead error', err);
    return send(res, 500, { error: 'error' });
  }
}
