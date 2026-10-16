// @ts-check
// Runs once a day (see vercel.json): sends invoice reminders.
import { send } from './_lib/http.js';
import { dbUrl } from './_lib/db.js';
import { stripeKey } from './_lib/stripe.js';
import { emailReady } from './_lib/email.js';
import { runReminders } from './_lib/reminders.js';

/** @param {import('http').IncomingMessage} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  // Vercel sends this header when CRON_SECRET is set. Without it, running early is harmless:
  // each reminder goes out once, and only when it is due.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== 'Bearer ' + secret) return send(res, 401, { error: 'unauthorized' });
  if (!dbUrl() || !stripeKey() || !emailReady()) return send(res, 200, { skipped: true });
  try {
    return send(res, 200, await runReminders());
  } catch (e) {
    console.error('cron failed', /** @type {any} */ (e).message);
    return send(res, 500, { error: 'failed' });
  }
}
