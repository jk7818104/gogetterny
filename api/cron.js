// @ts-check
// Runs once a day (see vercel.json): invoice reminders, supplier bills that are due, the Monday summary, and emptying old Trash.
import { send } from './_lib/http.js';
import { dbUrl } from './_lib/db.js';
import { stripeKey } from './_lib/stripe.js';
import { emailReady } from './_lib/email.js';
import { runReminders, runBillAlerts } from './_lib/reminders.js';
import { purgeOldTrash } from './_lib/trash.js';
import { sendSummary } from './_lib/summary.js';

/** @param {import('http').IncomingMessage} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  // Vercel sends this header when CRON_SECRET is set. Without it, running early is harmless:
  // each reminder goes out once, and only when it is due.
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.authorization !== 'Bearer ' + secret) return send(res, 401, { error: 'unauthorized' });
  if (!dbUrl()) return send(res, 200, { skipped: true });
  try {
    const bills = await runBillAlerts();   // works without Stripe or email (the bell still shows it)
    await purgeOldTrash();
    const weekly = await sendSummary().catch((e) => ({ failed: e.message }));
    if (!stripeKey() || !emailReady()) return send(res, 200, { bills, weekly, invoices: { skipped: true } });
    return send(res, 200, { bills, weekly, invoices: await runReminders() });
  } catch (e) {
    console.error('cron failed', /** @type {any} */ (e).message);
    return send(res, 500, { error: 'failed' });
  }
}
