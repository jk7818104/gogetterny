// @ts-check
// Runs once a day (see vercel.json): sends invoice reminders and flags supplier bills that are due.
import { send } from './_lib/http.js';
import { dbUrl } from './_lib/db.js';
import { stripeKey } from './_lib/stripe.js';
import { emailReady } from './_lib/email.js';
import { runReminders, runBillAlerts } from './_lib/reminders.js';

/** @param {import('http').IncomingMessage} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  // Vercel sends this header when CRON_SECRET is set. Without it, running early is harmless:
  // each reminder goes out once, and only when it is due.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== 'Bearer ' + secret) return send(res, 401, { error: 'unauthorized' });
  if (!dbUrl()) return send(res, 200, { skipped: true });
  try {
    const bills = await runBillAlerts();   // works without Stripe or email (the bell still shows it)
    if (!stripeKey() || !emailReady()) return send(res, 200, { bills, invoices: { skipped: true } });
    return send(res, 200, { bills, invoices: await runReminders() });
  } catch (e) {
    console.error('cron failed', /** @type {any} */ (e).message);
    return send(res, 500, { error: 'failed' });
  }
}
