// @ts-check
// Notifications inside the admin, and alert emails to the owner.
import { q } from './db.js';
import { emailReady, sendEmail } from './email.js';
import { alertEmail } from './templates.js';

/** @param {{kind: string, title: string, body?: string, clientId?: number|null}} n */
export async function notify(n) {
  await q(`insert into notifications(kind, title, body, client_id) values ($1,$2,$3,$4)`,
    [n.kind, n.title.slice(0, 200), (n.body || '').slice(0, 1000), n.clientId || null]);
  await q(`delete from notifications where created_at < now() - interval '180 days'`);
}

/**
 * Email the owner if that alert is switched on. Never throws.
 * @param {any} settings @param {string} key @param {string} title @param {[string, string][]} rows @param {string} [path]
 */
export async function alertOwner(settings, key, title, rows, path = '') {
  if (!settings[key] || !emailReady() || !settings.alert_email) return;
  try {
    await sendEmail({ to: settings.alert_email, ...alertEmail(title, rows, 'https://gogetterinc.com/admin/' + path) });
  } catch (e) {
    console.error('alert email failed', /** @type {any} */ (e).message);
  }
}

/** @param {number|null} clientId @param {string} kind @param {string} body */
export async function logActivity(clientId, kind, body) {
  if (clientId) await q(`insert into activity(client_id, kind, body) values ($1,$2,$3)`, [clientId, kind, body.slice(0, 2000)]);
}
