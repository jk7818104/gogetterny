// @ts-check
import { q, one } from './db.js';
import { HttpError } from './http.js';

/** Everything the owner can switch on or off, with the starting values. */
export const DEFAULTS = {
  alert_email: 'office@gogetterinc.com',
  // emails to clients
  lead_autoreply: true,
  invoices_from_us: true,
  paid_thankyou: true,
  // emails to the owner
  alert_paid: true,
  alert_failed: true,
  alert_card: true,
  alert_lead: false,
  alert_bills: true,
  // new invoice defaults
  ach_default: false,
  remind_default: true,
  // business details printed on invoices and emails
  biz_name: 'GO GETTER',
  biz_address: 'Monroe, NY',
  biz_phone: '845-395-5431',
  biz_email: 'office@gogetterinc.com',
  invoice_terms: 'Payment is due by the due date shown. Pay online by card or bank on our secure payment page (processed by Stripe). Questions about this invoice must be sent in writing within 30 days of the invoice date. Paid work and hour packages are not refundable unless agreed in writing. Terms of service: gogetterinc.com/terms',
  invoice_thanks: 'Thank you for your business!',
  // features: switch parts of the admin on or off (off = hidden)
  f_payments: true,
  f_cards: true,
  f_plans: true,
  f_books: true,
  f_bills: true,
  f_projects: true,
  f_team: true,
  f_time: true,
  team_login: false,
  f_reports: true,
  f_discounts: true,
  f_fields: true,
  f_cc: true,
  f_ach: true,
  f_reminders: true,
  f_leads: true,
  f_notifications: true
};

const LONG = new Set(['invoice_terms']);
const EMAILS = new Set(['alert_email', 'biz_email']);

/** @returns {Promise<typeof DEFAULTS>} */
export async function getSettings() {
  const rows = await q(`select key, value from settings where key not like 'sys:%'`);
  const s = { ...DEFAULTS };
  for (const r of rows) if (r.key in DEFAULTS && typeof r.value === typeof /** @type {any} */ (DEFAULTS)[r.key]) /** @type {any} */ (s)[r.key] = r.value;
  return s;
}

/** @param {any} input */
export async function saveSettings(input) {
  if (!input || typeof input !== 'object') throw new HttpError(400, 'Nothing to save');
  /** @type {[string, any][]} */
  const out = [];
  for (const [k, def] of Object.entries(DEFAULTS)) {
    if (!(k in input)) continue;
    let v = input[k];
    if (typeof def === 'boolean') v = !!v;
    else {
      v = String(v || '').trim().slice(0, LONG.has(k) ? 1000 : 200);
      if (EMAILS.has(k) && !/^[^\s@,]+@[^\s@,]+\.[^\s@,]+$/.test(v)) throw new HttpError(400, `"${v.slice(0, 60)}" is not a valid email`);
      if (k === 'biz_name' && !v) throw new HttpError(400, 'Business name is required');
    }
    out.push([k, v]);
  }
  for (const [k, v] of out) await setKV(k, v);   // save only when everything is valid
  return getSettings();
}

/** @param {string} key */
export async function getKV(key) {
  const r = await one(`select value from settings where key=$1`, [key]);
  return r ? r.value : null;
}
/** @param {string} key @param {any} value */
export async function setKV(key, value) {
  await q(`insert into settings(key, value) values ($1, $2::jsonb)
           on conflict (key) do update set value=excluded.value, updated_at=now()`, [key, JSON.stringify(value)]);
}
