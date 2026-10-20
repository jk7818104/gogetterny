// @ts-check
// Daily reminder emails for unpaid invoices that have reminders turned on.
import { one, q } from './db.js';
import { stripe } from './stripe.js';
import { money } from './templates.js';
import { logActivity, notify, alertOwner } from './notify.js';
import { getSettings } from './settings.js';
import { emailInvoiceDoc } from './docs.js';

const TZ = 'America/New_York';
/** @param {number} ms */
const nyDay = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
/** whole days from a to b ('YYYY-MM-DD') @param {string} a @param {string} b */
const daysBetween = (a, b) => Math.round((Date.parse(b + 'T12:00:00Z') - Date.parse(a + 'T12:00:00Z')) / 864e5);
/** @param {any} x */
const idOf = (x) => (x && typeof x === 'object' ? x.id : x) || null;

/**
 * soon: 1-3 days before it is due (if it was sent at least 2 days ago)
 * due:  on the due date or up to 2 days after
 * late: 7 to 30 days after the due date
 * @param {any} inv @param {string} today
 * @returns {'soon'|'due'|'late'|null}
 */
export function stageFor(inv, today) {
  if (!inv.due_date) return null;
  const left = daysBetween(today, nyDay(inv.due_date * 1000));
  const sentAt = inv.status_transitions?.finalized_at || inv.created;
  const age = daysBetween(nyDay(sentAt * 1000), today);
  if (left >= 1 && left <= 3 && age >= 2) return 'soon';
  if (left <= 0 && left >= -2 && age >= 1) return 'due';
  if (left <= -7 && left >= -30) return 'late';
  return null;
}

export async function runReminders() {
  const st = stripe();
  const settings = await getSettings();
  if (!settings.f_reminders) return { skipped: 'reminders are switched off' };
  const today = nyDay(Date.now());
  const sent = [], failed = [];
  /** @type {string|undefined} */
  let after;
  for (let page = 0; page < 5; page++) {
    const list = await st.invoices.list({ status: 'open', limit: 100, ...(after ? { starting_after: after } : {}) });
    for (const inv of list.data) {
      if (inv.metadata?.gg_remind !== '1' || inv.collection_method !== 'send_invoice' || !inv.customer_email || !inv.hosted_invoice_url) continue;
      const stage = stageFor(inv, today);
      if (!stage) continue;
      const fresh = await one(`insert into reminders(invoice_id, stage) values ($1,$2) on conflict do nothing returning stage`, [inv.id, stage]);
      if (!fresh) continue;
      try {
        await emailInvoiceDoc(inv.id, settings, 'reminder', { stage });
        const c = await one(`select id from clients where stripe_customer_id=$1`, [idOf(inv.customer)]);
        await logActivity(c?.id || null, 'email', `Reminder sent for invoice ${inv.number} (${money(inv.amount_remaining)}, ${stage === 'soon' ? 'due soon' : stage === 'due' ? 'due now' : 'past due'})`);
        sent.push(inv.number);
      } catch (e) {
        await q(`delete from reminders where invoice_id=$1 and stage=$2`, [inv.id, stage]);
        failed.push(inv.number);
      }
    }
    if (!list.has_more || !list.data.length) break;
    after = list.data[list.data.length - 1].id;
  }
  return { today, sent, failed };
}

/**
 * Daily: put supplier bills that are due soon or late on the bell, and email the owner if that alert is on.
 * Each bill alerts once when due within 3 days, and once when it becomes late.
 */
export async function runBillAlerts() {
  const settings = await getSettings();
  if (!settings.f_bills) return { skipped: 'bills are switched off' };
  const today = nyDay(Date.now());
  const rows = await q(`select b.id, b.vendor, b.number, b.due_date, b.amount_cents - coalesce((select sum(e.amount_cents) from entries e where e.bill_id=b.id and e.kind='expense'),0) as left_cents
    from bills b where b.due_date is not null and b.due_date <= ($1::date + 3)`, [today]);
  const alerted = [];
  for (const b of rows) {
    const left = Number(b.left_cents);
    if (left <= 0) continue;
    const days = daysBetween(today, b.due_date);
    const stage = days < 0 ? 'late' : 'soon';
    const fresh = await one(`insert into reminders(invoice_id, stage) values ($1,$2) on conflict do nothing returning stage`, ['bill:' + b.id, stage]);
    if (!fresh) continue;
    const when = days < 0 ? `was due ${-days} day${days === -1 ? '' : 's'} ago` : days === 0 ? 'is due today' : `is due in ${days} day${days === 1 ? '' : 's'}`;
    const title = `Bill from ${b.vendor} ${when}`;
    await notify({ kind: 'bill', title, body: `${money(left)} to pay${b.number ? ' · bill #' + b.number : ''}` });
    await alertOwner(settings, 'alert_bills', title, [['Supplier', b.vendor], ['Bill #', b.number || ''], ['Left to pay', money(left)], ['Due', b.due_date]], '#/bills');
    alerted.push(b.id);
  }
  return { today, alerted };
}
