// @ts-check
// What happens when Stripe tells us something: a payment came in, a payment failed, a card was saved, a dispute.
import { one, q } from './db.js';
import { stripe } from './stripe.js';
import { getSettings } from './settings.js';
import { emailReady } from './email.js';
import { money } from './templates.js';
import { emailInvoiceDoc } from './docs.js';
import { notify, alertOwner, logActivity } from './notify.js';

/** @param {any} x */
const idOf = (x) => (x && typeof x === 'object' ? x.id : x) || null;

/** @param {string|null} customerId */
async function clientFor(customerId) {
  if (!customerId) return null;
  return one(`select id, name, company, email, status from clients where stripe_customer_id=$1`, [customerId]);
}
/** @param {any} c @param {string} fallback */
const nameOf = (c, fallback) => c ? (c.company ? `${c.name} (${c.company})` : c.name) : (fallback || 'A client');

/** @param {any} ev a Stripe event, fetched from Stripe (never trusted from the request body) */
export async function handleEvent(ev) {
  const objId = idOf(ev.data && ev.data.object);
  switch (ev.type) {
    case 'invoice.paid': return invoicePaid(objId);
    case 'invoice.payment_failed': return invoiceFailed(objId);
    case 'checkout.session.completed': return cardSaved(objId);
    case 'charge.dispute.created': return disputeOpened(objId);
    default: return null;
  }
}

/** If the money belongs to a project, say so on the project's updates. Never throws. @param {any} inv @param {number} amount @param {boolean} plan */
async function projectNote(inv, amount, plan) {
  try {
    let pid = Number(inv.metadata?.gg_project) || null;
    if (!pid) pid = (await one(`select project_id from project_links where stripe_id=$1`, [inv.id]))?.project_id || null;
    if (!pid && plan) {
      const subId = idOf(inv.parent.subscription_details.subscription);
      const sub = subId ? await stripe().subscriptions.retrieve(subId) : null;
      const sched = sub ? idOf(sub.schedule) : null;
      if (sched) pid = (await one(`select project_id from plans where schedule_id=$1`, [sched]))?.project_id || null;
    }
    if (!pid || !(await one(`select id from projects where id=$1`, [pid]))) return;
    const how = inv.paid_out_of_band ? 'marked paid' : 'paid online';
    await q(`insert into project_notes(project_id, author, body) values ($1,'Payments',$2)`,
      [pid, `${plan ? 'Payment plan payment' : 'Invoice ' + inv.number} ${how}: ${money(amount)} came in`]);
  } catch (e) { console.error('project note failed', /** @type {any} */ (e).message); }
}

/** @param {string} id */
async function invoicePaid(id) {
  const st = stripe();
  const inv = await st.invoices.retrieve(id);
  if (inv.status !== 'paid') return;
  const s = await getSettings();
  const c = await clientFor(idOf(inv.customer));
  const name = nameOf(c, inv.customer_name || inv.customer_email || '');
  const amount = inv.amount_paid || inv.total;
  const plan = !!(inv.parent && inv.parent.subscription_details);
  const byAdmin = inv.metadata?.gg_by === 'admin';
  // payments you made yourself (charge saved card, mark paid) are already in the log
  if (!byAdmin) {
    const what = plan ? `Payment plan payment ${money(amount)} received (invoice ${inv.number})` : `Invoice ${inv.number} paid online, ${money(amount)}`;
    await logActivity(c?.id || null, 'payment', what);
    if (c) await q(`update clients set status='active', updated_at=now() where id=$1 and status='lead'`, [c.id]);
    await notify({ kind: 'paid', title: `${name} paid ${money(amount)}`, body: plan ? `Payment plan, invoice ${inv.number}` : `Invoice ${inv.number}`, clientId: c?.id });
    await alertOwner(s, 'alert_paid', `${name} paid ${money(amount)}`, [['Invoice', inv.number || ''], ['Amount', money(amount)], ['Type', plan ? 'Payment plan' : 'Invoice']], c ? `#/clients/${c.id}` : '#/invoices');
  }
  await projectNote(inv, amount, plan);
  if (s.paid_thankyou && emailReady() && inv.customer_email && amount > 0) {
    try {
      await emailInvoiceDoc(inv.id, s, 'receipt', { amount });
      await logActivity(c?.id || null, 'email', `Receipt emailed for invoice ${inv.number} (PDF attached)`);
    } catch (e) { console.error('thank-you email failed', /** @type {any} */ (e).message); }
  }
}

/** @param {string} id */
async function invoiceFailed(id) {
  const inv = await stripe().invoices.retrieve(id);
  const s = await getSettings();
  const c = await clientFor(idOf(inv.customer));
  const name = nameOf(c, inv.customer_name || inv.customer_email || '');
  const plan = !!(inv.parent && inv.parent.subscription_details);
  const next = inv.next_payment_attempt ? new Date(inv.next_payment_attempt * 1000).toLocaleDateString('en-US', { timeZone: 'America/New_York', month: 'short', day: 'numeric' }) : '';
  await logActivity(c?.id || null, 'payment', `Payment failed for invoice ${inv.number}, ${money(inv.amount_remaining)}${next ? `. Stripe tries again ${next}` : ''}`);
  await notify({ kind: 'failed', title: `Payment failed: ${name}, ${money(inv.amount_remaining)}`, body: `${plan ? 'Payment plan, ' : ''}invoice ${inv.number}${next ? `. Stripe tries again ${next}` : ''}`, clientId: c?.id });
  await alertOwner(s, 'alert_failed', `Payment failed: ${name}`, [['Invoice', inv.number || ''], ['Amount', money(inv.amount_remaining)], ['Next try', next || 'none']], c ? `#/clients/${c.id}` : '#/invoices');
}

/** @param {string} id */
async function cardSaved(id) {
  const ses = await stripe().checkout.sessions.retrieve(id);
  if (ses.mode !== 'setup') return;
  const s = await getSettings();
  const c = await clientFor(idOf(ses.customer));
  const name = nameOf(c, '');
  await logActivity(c?.id || null, 'card', 'Client saved a card on Stripe');
  await notify({ kind: 'card', title: `${name} saved a card`, body: 'You can charge it now from the client page.', clientId: c?.id });
  await alertOwner(s, 'alert_card', `${name} saved a card`, [['Client', name]], c ? `#/clients/${c.id}` : '#/clients');
}

/** @param {string} id */
async function disputeOpened(id) {
  const st = stripe();
  const d = await st.disputes.retrieve(id);
  const ch = await st.charges.retrieve(String(idOf(d.charge)));
  const s = await getSettings();
  const c = await clientFor(idOf(ch.customer));
  const name = nameOf(c, ch.billing_details?.name || '');
  await logActivity(c?.id || null, 'dispute', `Dispute opened on ${money(d.amount)} (${d.reason})`);
  await notify({ kind: 'dispute', title: `Dispute: ${name}, ${money(d.amount)}`, body: `Reason: ${String(d.reason).replace(/_/g, ' ')}. Answer it in Stripe → Disputes.`, clientId: c?.id });
  await alertOwner(s, 'alert_failed', `Dispute opened: ${name}, ${money(d.amount)}`, [['Reason', String(d.reason).replace(/_/g, ' ')], ['Amount', money(d.amount)]], c ? `#/clients/${c.id}` : '');
}
