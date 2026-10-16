// @ts-check
// Stripe calls this when something happens (a payment came in, a card was saved...).
// We only read the event id from the request and fetch the real event from Stripe with our key,
// so a fake request cannot pretend to be a payment.
import { readJson, send } from './_lib/http.js';
import { dbUrl, q, one } from './_lib/db.js';
import { stripe, stripeKey } from './_lib/stripe.js';
import { handleEvent } from './_lib/events.js';

/** @param {import('http').IncomingMessage & {body?: any}} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  if (!stripeKey() || !dbUrl()) return send(res, 200, { ok: true, skipped: true });
  let id = '';
  try {
    const body = await readJson(req);
    id = String((body && body.id) || '');
  } catch (e) {
    return send(res, 400, { error: 'bad body' });
  }
  if (!/^evt_[A-Za-z0-9]{8,80}$/.test(id)) return send(res, 400, { error: 'bad event' });

  let ev;
  try {
    ev = await stripe().events.retrieve(id);
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err && err.type === 'StripeInvalidRequestError') return send(res, 400, { error: 'unknown event' });
    console.error('webhook: cannot load event', err && err.message);
    return send(res, 500, { error: 'try again' });
  }

  // each event is handled once, even when Stripe sends it again
  const fresh = await one(`insert into events(id) values ($1) on conflict do nothing returning id`, [id]);
  if (!fresh) return send(res, 200, { ok: true, duplicate: true });
  try {
    await handleEvent(ev);
  } catch (e) {
    await q(`delete from events where id=$1`, [id]);
    console.error('webhook: failed', ev.type, /** @type {any} */ (e).message);
    return send(res, 500, { error: 'try again' });
  }
  await q(`delete from events where created_at < now() - interval '60 days'`);
  return send(res, 200, { ok: true });
}
