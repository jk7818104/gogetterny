// @ts-check
// Stripe webhooks must have a valid Stripe-Signature before any event is processed.
// Configure STRIPE_WEBHOOK_SECRET from the Stripe webhook endpoint's signing secret.
import { send } from './_lib/http.js';
import { dbUrl, q, one } from './_lib/db.js';
import { stripe, stripeKey } from './_lib/stripe.js';
import { handleEvent } from './_lib/events.js';

// Vercel must leave the body untouched so Stripe can verify the exact signed bytes.
export const config = { api: { bodyParser: false } };

/** @param {import('http').IncomingMessage} req */
async function rawBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    const b = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += b.length;
    if (size > 200_000) throw Object.assign(new Error('body too large'), { status: 413 });
    chunks.push(b);
  }
  return Buffer.concat(chunks);
}

/** @param {import('http').IncomingMessage} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  if (req.method !== 'POST') return send(res, 405, { error: 'POST only' });
  if (!stripeKey() || !dbUrl()) return send(res, 200, { ok: true, skipped: true });

  const secret = process.env.STRIPE_WEBHOOK_SECRET || '';
  if (!secret) {
    console.error('webhook: STRIPE_WEBHOOK_SECRET is not configured');
    return send(res, 503, { error: 'webhook is not configured' });
  }
  const signature = String(req.headers['stripe-signature'] || '');
  if (!signature) return send(res, 400, { error: 'missing Stripe signature' });

  let ev;
  try {
    const raw = await rawBody(req);
    ev = stripe().webhooks.constructEvent(raw, signature, secret);
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err?.status === 413) return send(res, 413, { error: 'request too large' });
    console.warn('webhook: signature verification failed');
    return send(res, 400, { error: 'invalid webhook signature or payload' });
  }

  const id = String(ev?.id || '');
  if (!/^evt_[A-Za-z0-9]{8,80}$/.test(id)) return send(res, 400, { error: 'bad event' });

  // Deduplicate verified events so Stripe retries do not repeat side effects.
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
