// @ts-check
// Who changed what, and when. Every change made in the admin is written here in plain words.
import { q, one } from './db.js';
import { intId } from './http.js';
import { getSettings } from './settings.js';

const money = (/** @type {any} */ c) => '$' + (Number(c || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nm = (/** @type {any} */ s) => (s ? `"${String(s).slice(0, 80)}"` : '');
const ACTIONS = { finalize: 'Got pay link for', send: 'Emailed', void: 'Voided', delete: 'Deleted draft', mark_paid: 'Marked paid', charge: 'Charged card for' };

/** Ops that only read: not logged. */
const READS = new Set(['dashboard', 'notifications.list', 'notifications.read', 'settings.get', 'clients.list', 'clients.get', 'invoices.list', 'cards.list',
  'charges.list', 'plans.list', 'entries.list', 'bills.list', 'bills.get', 'report', 'me.home', 'projects.list', 'projects.get', 'team.names',
  'workers.list', 'workers.get', 'trash.list', 'audit.list', 'files.list', 'import.preview', 'import.list', 'tax.summary', 'links.list', 'ai.read', 'ai.chat', 'search', 'todo']);

/** @type {Record<string, (b: any, d: any) => [string, string?] | string | Promise<[string, string?] | string>>} */
const SAY = {
  'clients.save': (b, d) => [`${b.id ? 'Edited' : 'Added'} client ${nm(b.name)}`, `#/clients/${b.id || d.id}`],
  'clients.delete': (b, d) => `Deleted client ${nm(d.label)}`,
  'activity.add': (b) => [`Added a note on a client`, `#/clients/${b.client_id}`],
  'invoices.create': (b, d) => [`Created invoice ${d.invoice?.number || '(draft)'} for ${money(d.invoice?.total)}, ${d.invoice?.name || ''}`, '#/invoices'],
  'invoices.action': (b, d) => [`${/** @type {any} */ (ACTIONS)[b.action] || b.action} invoice ${d.invoice?.number || ''}`, '#/invoices'],
  'invoices.link': (b) => [b.project_id ? 'Put an invoice on a project' : 'Took an invoice off a project', b.project_id ? `#/projects/${b.project_id}` : '#/invoices'],
  'charges.create': (b) => [`Charged a card ${money(b.amount_cents)}: ${b.description || ''}`, '#/payments'],
  'charges.refund': (b) => [`Refunded ${money(b.amount_cents)}`, '#/payments'],
  'cards.link': () => 'Made a save-card link',
  'cards.test': () => 'Added a test card',
  'cards.remove': () => 'Removed a saved card',
  'plans.create': (b) => [`Started payment plan ${nm(b.title)}, ${money(b.total_cents)}`, '#/plans'],
  'plans.cancel': () => ['Stopped a payment plan', '#/plans'],
  'entries.save': (b) => [`${b.id ? 'Edited' : 'Added'} ${b.kind === 'income' ? 'income' : 'expense'} ${money(b.amount_cents)} ${b.party || b.category || ''}`, '#/books'],
  'entries.delete': (b, d) => [`Deleted ${d.label || 'a Books entry'}`, '#/books'],
  'entries.bulk': (b, d) => [`Changed ${d.count} Books entries`, '#/books'],
  'bills.save': (b) => [`${b.id ? 'Edited' : 'Added'} bill from ${b.vendor}, ${money(b.amount_cents)}`, '#/bills'],
  'bills.pay': (b, d) => [`Paid ${money(b.amount_cents)} on the bill from ${d.bill?.vendor || ''}`, '#/bills'],
  'bills.delete': (b, d) => [`Deleted ${d.label || 'a bill'}`, '#/bills'],
  'projects.save': (b, d) => [`${b.id ? 'Edited' : 'Started'} project ${nm(b.name)}`, `#/projects/${b.id || d.id}`],
  'projects.delete': (b, d) => `Deleted project ${nm(d.label)}`,
  'tasks.save': async (b, d) => {
    const t = await one(`select t.title, t.project_id from tasks t where t.id=$1`, [b.id || d.id]);
    const st = { todo: 'to do', doing: 'doing', done: 'done' }[/** @type {'todo'} */ (b.status)];
    return [b.id ? `Task ${nm(t?.title)} ${st ? '→ ' + st : 'changed'}` : `Added task ${nm(b.title)}`, t ? `#/projects/${t.project_id}` : ''];
  },
  'tasks.delete': (b, d) => `Deleted task ${nm(d.label)}`,
  'time.save': (b) => [`${b.id ? 'Changed' : 'Logged'} ${Math.round((Number(b.minutes) / 60) * 100) / 100} h`, b.project_id ? `#/projects/${b.project_id}` : ''],
  'time.delete': (b, d) => `Deleted hours (${d.label || ''})`,
  'notes.add': (b) => ['Posted a project update', `#/projects/${b.project_id}`],
  'workers.save': (b, d) => [`${b.id ? 'Edited' : 'Added'} team member ${nm(b.name)}${typeof b.password === 'string' && b.password ? ', set a new password' : ''}`, `#/team/${b.id || d.id}`],
  'workers.delete': (b, d) => `Deleted team member ${nm(d.label)}`,
  'workers.pay': async (b) => {
    const w = await one(`select name from workers where id=$1`, [Number(b.worker_id) || 0]);
    return [`Paid ${money(b.amount_cents)} to ${w?.name || 'a team member'}`, `#/team/${b.worker_id}`];
  },
  'settings.save': (b) => ['Changed settings: ' + Object.keys(b.settings || {}).join(', '), '#/settings'],
  'alerts.connect': () => 'Turned on payment alerts',
  'email.test': () => 'Sent a test email',
  'trash.restore': (b, d) => `Restored ${d.label || 'items'} from the Trash`,
  'trash.purge': (b) => (b.all ? 'Emptied the Trash' : 'Deleted from the Trash for good'),
  'files.attach': (b) => 'Attached a file',
  'files.delete': () => 'Removed a file',
  'import.commit': (b, d) => [`Imported ${d.count} rows from a bank statement`, '#/books'],
  'import.undo': (b, d) => [`Undid an import (${d.count} rows)`, '#/books'],
  'summary.send': () => 'Sent the weekly summary now',
  'connector.key': () => 'Made a new key for the Claude connector',
  'connector.off': () => 'Turned off the Claude connector',
  'tax.owner.save': (b) => [`${b.id ? 'Edited' : 'Added'} owner money ${money(b.amount_cents)}`, '#/tax'],
  'tax.owner.delete': (b, d) => [`Deleted ${d.label || 'owner money'}`, '#/tax'],
  'tax.vendor.save': (b) => [`Updated 1099 details for ${nm(b.name)}`, '#/tax'],
  'tax.year.save': (b) => [`Saved the inventory count for ${b.year}`, '#/tax'],
  'tax.map.save': () => ['Changed which tax line the categories go to', '#/tax'],
  'links.save': (b) => [`${b.id ? 'Edited' : 'Added'} the linked sheet ${nm(b.name)}`, '#/books'],
  'links.delete': () => ['Removed a linked sheet', '#/books'],
  'links.sync': () => ['Read a linked sheet', '#/books'],
  'feed.key': () => 'Made a new live feed link for Google Sheets / Excel',
  'feed.off': () => 'Turned off the live feed link'
};

/** Write one line for a change that worked. Never throws. @param {any} ctx @param {string} op @param {any} body @param {any} data */
export async function audit(ctx, op, body, data) {
  if (READS.has(op) || (ctx.settings && ctx.settings.f_log === false)) return;
  try {
    const f = SAY[op];
    const r = f ? await f(body || {}, data || {}) : op;
    const [summary, link] = Array.isArray(r) ? r : [r, ''];
    await q(`insert into audit_log(who, worker_id, op, summary, link) values ($1,$2,$3,$4,$5)`,
      [ctx.owner ? (ctx.via === 'claude' ? 'Claude (for you)' : 'You') : ctx.worker.name, ctx.owner ? null : ctx.worker.id, op, String(summary).slice(0, 500), link || null]);
  } catch (e) { console.error('audit failed', /** @type {any} */ (e).message); }
}

/** Sign-ins are logged too. @param {string} who @param {number|null} workerId */
export async function auditLogin(who, workerId) {
  try {
    if ((await getSettings()).f_log === false) return;
    await q(`insert into audit_log(who, worker_id, op, summary) values ($1,$2,'login','Signed in')`, [workerId ? who : 'You', workerId]);
    await q(`delete from audit_log where at < now() - interval '2 years'`);
  } catch (e) {}
}

async function auditList(/** @type {any} */ b) {
  const before = b.before ? intId(b.before) : 2147483647;
  const who = b.worker_id === 'owner' ? 'owner' : b.worker_id ? intId(b.worker_id) : null;
  const term = String(b.q || '').trim().slice(0, 100);
  const rows = await q(`select id, at, who, worker_id, op, summary, link from audit_log
    where id < $1 and ($2::text is null or ($2 = 'owner' and worker_id is null) or worker_id::text = $2)
      and ($3 = '' or summary ilike '%' || $3 || '%')
    order by id desc limit 100`, [before, who === null ? null : String(who), term]);
  return { items: rows, more: rows.length === 100 };
}

export const AUDIT_OPS = { 'audit.list': auditList };
