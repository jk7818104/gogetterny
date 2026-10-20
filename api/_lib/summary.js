// @ts-check
// The Monday email: last week's money, what is waiting to come in, what has to be paid, and what is late.
import { q, one } from './db.js';
import { OPS } from './ops.js';
import { owedByWorker } from './projects.js';
import { stripe, stripeKey } from './stripe.js';
import { getSettings } from './settings.js';
import { emailReady, sendEmail } from './email.js';
import { summaryEmail, money } from './templates.js';

const TZ = 'America/New_York';
const nyDay = (/** @type {number} */ ms) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
const addDays = (/** @type {string} */ ymd, /** @type {number} */ n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const short = (/** @type {string} */ ymd) => new Date(ymd + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** @param {any} s settings */
export async function buildSummary(s) {
  const today = nyDay(Date.now());
  const dow = (new Date(today + 'T12:00:00Z').getUTCDay() + 6) % 7;   // Monday = 0
  const thisMon = addDays(today, -dow);
  const from = addDays(thisMon, -7), to = addDays(thisMon, -1), weekEnd = addDays(thisMon, 6);
  const rep = await /** @type {any} */ (OPS).report({ from, to });
  const sections = [];
  sections.push({ title: `Last week (${short(from)} – ${short(to)})`, rows: [
    ['Money in', money(rep.totals.income)], ['Money out', money(rep.totals.expenses)], ['Profit', money(rep.totals.profit)]] });
  let open = { n: 0, total: 0, late: 0, lateTotal: 0 };
  if (stripeKey()) {
    try {
      const inv = await stripe().invoices.list({ status: 'open', limit: 100 });
      for (const i of inv.data) { open.n++; open.total += i.amount_remaining; if (i.due_date && i.due_date * 1000 < Date.now()) { open.late++; open.lateTotal += i.amount_remaining; } }
    } catch (e) { /* skip */ }
    sections.push({ title: 'Waiting to be paid', rows: [['Open invoices', `${open.n} · ${money(open.total)}`], ['Late', `${open.late} · ${money(open.lateTotal)}`]] });
  }
  const pay = [];
  if (s.f_bills) {
    const bl = await /** @type {any} */ (OPS)['bills.list']();
    const due = bl.bills.filter((/** @type {any} */ b) => b.left_cents > 0 && b.due_date && b.due_date >= today && b.due_date <= weekEnd);
    const late = bl.bills.filter((/** @type {any} */ b) => b.status === 'overdue');
    pay.push(['Bills due this week', `${due.length} · ${money(due.reduce((/** @type {number} */ x, /** @type {any} */ b) => x + b.left_cents, 0))}`]);
    if (late.length) pay.push(['Late bills', `${late.length} · ${money(late.reduce((/** @type {number} */ x, /** @type {any} */ b) => x + b.left_cents, 0))}`]);
    pay.push(['All unpaid bills', money(bl.totals.owed)]);
  }
  if (s.f_team) {
    const w = await owedByWorker();
    if (w.length) pay.push(['Team pay owed', `${w.length} ${w.length === 1 ? 'person' : 'people'} · ${money(w.reduce((x, y) => x + y.owed, 0))}`]);
  }
  if (pay.length) sections.push({ title: 'To pay', rows: /** @type {[string,string][]} */ (pay) });
  if (s.f_projects) {
    const lateTasks = await one(`select count(*)::int as n from tasks t join projects p on p.id=t.project_id where t.status<>'done' and t.due_date < $1 and p.status<>'done'`, [today]);
    const dueP = await q(`select name, due_date from projects where status in ('active','planned') and due_date between $1 and $2 order by due_date limit 5`, [today, weekEnd]);
    const active = await one(`select count(*)::int as n from projects where status='active'`);
    const rows = [['Active projects', String(active?.n || 0)], ['Late tasks', String(lateTasks?.n || 0)]];
    for (const p of dueP) rows.push([`Due ${short(p.due_date)}`, p.name]);
    sections.push({ title: 'Projects', rows });
  }
  const leads = await one(`select count(*)::int as n from clients where status='lead' and created_at >= $1::date`, [from]);
  if (leads?.n) sections.push({ title: 'New leads', rows: [['From the website last week', String(leads.n)]] });
  const headline = `Last week: ${money(rep.totals.income)} in, ${money(rep.totals.expenses)} out.` + (open.late ? ` ${open.late} invoice${open.late === 1 ? ' is' : 's are'} late.` : '');
  return { range: `${short(from)} – ${short(to)}`, headline, sections };
}

/** Send it now (from Settings), or on Monday from the daily run. @param {{force?: boolean}} [o] */
export async function sendSummary(o = {}) {
  const s = await getSettings();
  if (!emailReady() || !s.alert_email) return { skipped: 'email not connected' };
  if (!o.force) {
    if (!s.weekly_summary) return { skipped: 'off' };
    const today = nyDay(Date.now());
    if (new Date(today + 'T12:00:00Z').getUTCDay() !== 1) return { skipped: 'not Monday' };
    const fresh = await one(`insert into reminders(invoice_id, stage) values ($1,'weekly') on conflict do nothing returning stage`, ['weekly:' + today]);
    if (!fresh) return { skipped: 'already sent' };
  }
  const d = await buildSummary(s);
  await sendEmail({ to: s.alert_email, ...summaryEmail(d, s, (process.env.SITE_URL || 'https://gogetterinc.com') + '/admin/'), replyTo: s.biz_email });
  return { sent: s.alert_email };
}

export const SUMMARY_OPS = { 'summary.send': async () => sendSummary({ force: true }) };
