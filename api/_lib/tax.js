// @ts-check
// Tax-ready books: owner money (kept out of profit), 1099 vendors with their W-9, year-end inventory,
// expense categories mapped to tax lines, and a check of what is missing before the accountant gets the year.
// Switched on and off with f_tax. This is bookkeeping help, not tax advice.
import { q, one } from './db.js';
import { HttpError, str, cents, intId, day } from './http.js';
import { getKV, setKV } from './settings.js';
import { PART_NAMES, partsFor, partsAsked, pickPart, mustPart } from './parts.js';
import { trashDelete } from './trash.js';

/**
 * How a transaction counts. Each category gets one (changeable on the Taxes page), and one entry can be set on its own.
 * Simple entries go in as money in / money out; the accountant decides here what each one is.
 * group: expense and cogs are in profit; asset, equity and liability are not (balance sheet); review = the accountant decides.
 */
export const LINE_GROUPS = /** @type {Record<string, string>} */ ({
  // money out
  'Cost of goods sold': 'cogs', 'Contract labor': 'expense', 'Advertising': 'expense', 'Office expense': 'expense', 'Supplies': 'expense',
  'Utilities (phone and internet)': 'expense', 'Travel': 'expense', 'Taxes and licenses': 'expense', 'Legal and professional services': 'expense',
  'Software and subscriptions': 'expense', 'Bank and card fees': 'expense', 'Other expenses': 'expense', 'Not deductible': 'nondeduct',
  'Equipment (fixed asset)': 'asset', 'Inventory on hand (asset)': 'asset', 'Deposit or prepaid (asset)': 'asset',
  'Owner draw (equity)': 'equity', 'Loan paid back (liability)': 'liability',
  // money in
  'Sales and income': 'income', 'Owner capital (equity)': 'equity', 'Loan received (liability)': 'liability', 'Not income (transfer or refund)': 'none',
  // either way
  'Accountant to decide': 'review'
});
export const TAX_LINES = Object.keys(LINE_GROUPS);
const OUT_GROUPS = ['cogs', 'expense', 'nondeduct', 'asset', 'equity', 'liability', 'review'];
const IN_GROUPS = ['income', 'equity', 'liability', 'none', 'review'];
/** Lines that fit money out, and money in. */
export const LINES_FOR = {
  expense: TAX_LINES.filter((l) => OUT_GROUPS.includes(LINE_GROUPS[l]) && !['Owner capital (equity)', 'Loan received (liability)'].includes(l)),
  income: TAX_LINES.filter((l) => IN_GROUPS.includes(LINE_GROUPS[l]) && !['Owner draw (equity)', 'Loan paid back (liability)'].includes(l))
};
export const DEFAULT_MAP = /** @type {Record<string, string>} */ ({
  'Hardware & inventory': 'Cost of goods sold',
  'Shipping & freight': 'Cost of goods sold',
  'Contractors & developers': 'Contract labor',
  'Software & subscriptions': 'Software and subscriptions',
  'Phone & internet': 'Utilities (phone and internet)',
  'Travel': 'Travel',
  'Office & supplies': 'Office expense',
  'Marketing': 'Advertising',
  'Bank & card fees': 'Bank and card fees',
  'Taxes & licenses': 'Taxes and licenses',
  'Professional fees': 'Legal and professional services',
  'Other': 'Other expenses',
  // money in: the key starts with "in:"
  'in:Projects': 'Sales and income', 'in:Consulting': 'Sales and income', 'in:Hardware sales': 'Sales and income', 'in:Invoices': 'Sales and income', 'in:Other income': 'Sales and income'
});
export const OWNER_KINDS = /** @type {Record<string, string>} */ ({
  contribution: 'Owner put money in', draw: 'Owner took money out', loan_in: 'Loan received', loan_repay: 'Loan paid back'
});
const VENDOR_TYPES = ['unknown', 'individual', 'llc', 'partnership', 'corporation', 'foreign'];
// paid by card or through a payment app: the payment company reports it (1099-K), not us
const NOT_1099_METHODS = ['card'];
const LIMIT_1099 = 60000;

/** @returns {Promise<Record<string, string>>} */
export async function taxMap() {
  const saved = (await getKV('sys:taxmap')) || {};
  /** @type {Record<string, string>} */
  const m = { ...DEFAULT_MAP };
  for (const [k, v] of Object.entries(saved)) if (TAX_LINES.includes(String(v))) m[k] = String(v);
  return m;
}
/** How one entry counts: its own setting, or its category's. @param {Record<string,string>} map @param {{kind: string, category: string, tax_line?: string|null}} e */
export function lineOf(map, e) {
  const fits = LINES_FOR[e.kind === 'income' ? 'income' : 'expense'];
  if (e.tax_line && fits.includes(e.tax_line)) return e.tax_line;
  const m = e.kind === 'income' ? map['in:' + e.category] : map[e.category];
  return m && fits.includes(m) ? m : e.kind === 'income' ? 'Sales and income' : 'Other expenses';
}

/** @param {any} v */
function year(v) {
  const y = Number(v);
  if (!Number.isInteger(y) || y < 2000 || y > 2100) throw new HttpError(400, 'Pick a year');
  return y;
}
const norm = (/** @type {any} */ s) => String(s || '').trim().replace(/\s+/g, ' ').toLowerCase();

/** Who was paid how much in the year, for the 1099 check. Card payments are left out. @param {string} from @param {string} to @param {string[]} parts */
async function payees(from, to, parts) {
  const rows = await q(`select coalesce(w.name, nullif(trim(e.party),''), b.vendor) as name, e.method, e.amount_cents, e.worker_id
    from entries e left join workers w on w.id=e.worker_id left join bills b on b.id=e.bill_id
    where e.kind='expense' and e.date between $1 and $2 and e.part = any($3::text[])`, [from, to, parts]);
  /** @type {Map<string, {name: string, paid: number, card: number, payments: number, worker: boolean}>} */
  const m = new Map();
  for (const r of rows) {
    if (!r.name) continue;
    const k = norm(r.name);
    const x = m.get(k) || { name: String(r.name).trim(), paid: 0, card: 0, payments: 0, worker: false };
    if (NOT_1099_METHODS.includes(norm(r.method))) x.card += r.amount_cents; else x.paid += r.amount_cents;
    x.payments++;
    if (r.worker_id) x.worker = true;
    m.set(k, x);
  }
  const vendors = await q(`select * from vendors`);
  const vb = new Map(vendors.map((v) => [norm(v.name), v]));
  return [...m.values()].map((x) => {
    const v = vb.get(norm(x.name));
    const type = v ? v.type : 'unknown';
    // corporations and suppliers abroad (they give a W-8, not a W-9) usually don't get a 1099; the owner can say yes or no per vendor
    const needs = v && v.needs_1099 !== null ? v.needs_1099 : x.paid >= LIMIT_1099 && type !== 'corporation' && type !== 'foreign';
    return { ...x, vendor_id: v ? v.id : null, type, w9: v ? v.w9 : false, needs_1099: needs, decided: !!(v && v.needs_1099 !== null), note: v ? v.note || '' : '' };
  }).sort((a, b) => b.paid - a.paid);
}

/** Everything the Taxes page shows for one year. @param {any} b @param {any} req @param {any} ctx */
async function taxSummary(b, req, ctx) {
  const y = year(b.year);
  const from = `${y}-01-01`, to = `${y}-12-31`;
  const mine = partsFor(ctx);
  const parts = partsAsked(b.part, ctx);
  const map = await taxMap();
  const [all, owner, inv, pay, missing, other, nomethod, bills, review] = await Promise.all([
    q(`select kind, category, tax_line, sum(amount_cents)::bigint as cents, count(*)::int as n from entries where date between $1 and $2 and part = any($3::text[]) group by kind, category, tax_line`, [from, to, parts]),
    q(`select * from owner_money where date between $1 and $2 and part = any($3::text[]) order by date, id`, [from, to, parts]),
    q(`select * from tax_years where year=$1 and part = any($2::text[])`, [y, parts]),
    payees(from, to, parts),
    q(`select e.id, e.date, e.amount_cents, e.category, e.party, e.method, e.note, e.ref, e.part, e.kind, e.client_id, e.project_id from entries e
       where e.kind='expense' and e.date between $1 and $2 and e.part = any($3::text[]) and e.worker_id is null
         and not exists (select 1 from files f where f.entry_id=e.id) and not exists (select 1 from files f where e.bill_id is not null and f.bill_id=e.bill_id)
       order by e.amount_cents desc limit 300`, [from, to, parts]),
    q(`select e.id, e.date, e.amount_cents, e.category, e.party, e.method, e.note, e.ref, e.part, e.kind, e.client_id, e.project_id from entries e
       where e.kind='expense' and e.date between $1 and $2 and e.part = any($3::text[]) and e.category in ('Other','') order by e.date limit 300`, [from, to, parts]),
    q(`select e.id, e.date, e.amount_cents, e.category, e.party, e.method, e.note, e.ref, e.part, e.kind, e.client_id, e.project_id from entries e
       where e.date between $1 and $2 and e.part = any($3::text[]) and coalesce(trim(e.method),'') = '' order by e.date limit 300`, [from, to, parts]),
    one(`select coalesce(sum(greatest(b.amount_cents - coalesce((select sum(e.amount_cents) from entries e where e.bill_id=b.id and e.kind='expense' and e.date <= $1),0),0)),0)::bigint as n
       from bills b where b.bill_date <= $1 and b.part = any($2::text[])`, [to, parts]),
    q(`select e.id, e.date, e.amount_cents, e.category, e.party, e.method, e.note, e.ref, e.part, e.kind, e.tax_line, e.client_id, e.project_id from entries e
       where e.date between $1 and $2 and e.part = any($3::text[])
         and (e.tax_line = 'Accountant to decide' or (e.tax_line is null and ((e.kind='expense' and e.category = any($4::text[])) or (e.kind='income' and e.category = any($5::text[])))))
       order by e.date, e.id limit 1000`, [from, to, parts,
      Object.keys(map).filter((k) => !k.startsWith('in:') && map[k] === 'Accountant to decide'),
      Object.keys(map).filter((k) => k.startsWith('in:') && map[k] === 'Accountant to decide').map((k) => k.slice(3))])
  ]);
  // entries waiting for the accountant: set one by one, or their whole category
  const toDecide = review.filter((e) => lineOf(map, e) === 'Accountant to decide').slice(0, 300);

  /** @type {Record<string, {line: string, group: string, cents: number, out: number, in: number, categories: {category: string, cents: number}[]}>} */
  const lines = {};
  let expTotal = 0, purchases = 0, incTotal = 0;
  for (const r of all) {
    const line = lineOf(map, r);
    const l = (lines[line] ||= { line, group: LINE_GROUPS[line], cents: 0, out: 0, in: 0, categories: [] });
    l.cents += r.cents; l[r.kind === 'income' ? 'in' : 'out'] += r.cents;
    const label = (r.kind === 'income' ? 'In: ' : '') + r.category + (r.tax_line ? ' (set one by one)' : '');
    const c = l.categories.find((x) => x.category === label);
    if (c) c.cents += r.cents; else l.categories.push({ category: label, cents: r.cents });
    if (r.kind === 'income' && l.group === 'income') incTotal += r.cents;
    if (r.kind === 'expense' && ['cogs', 'expense', 'nondeduct'].includes(l.group)) expTotal += r.cents;
    if (r.kind === 'expense' && line === 'Cost of goods sold') purchases += r.cents;
  }
  // in profit: costs and expenses. Not in profit: assets, owner capital and draws, loans, transfers, and what the accountant still has to decide
  const byLine = TAX_LINES.map((l) => lines[l]).filter((l) => l && ['cogs', 'expense', 'nondeduct'].includes(l.group));
  const balance = TAX_LINES.map((l) => lines[l]).filter((l) => l && ['asset', 'equity', 'liability', 'none', 'review'].includes(l.group));

  // inventory: what was on hand on Jan 1 and Dec 31. Without it, everything bought counts as sold.
  const invBegin = inv.reduce((x, r) => x + (r.inv_begin_cents || 0), 0);
  const invEnd = inv.reduce((x, r) => x + (r.inv_end_cents || 0), 0);
  const invEntered = parts.every((p) => inv.some((r) => r.part === p && r.inv_end_cents !== null));
  const cogs = invBegin + purchases - invEnd;
  const deductible = expTotal - purchases - (lines['Not deductible'] ? lines['Not deductible'].cents : 0);

  /** @type {Record<string, number>} */
  const ownerTotals = Object.fromEntries(Object.keys(OWNER_KINDS).map((k) => [k, 0]));
  for (const o of owner) ownerTotals[o.kind] += o.amount_cents;

  const need1099 = pay.filter((p) => p.needs_1099);
  const sumOf = (/** @type {any[]} */ r) => r.reduce((x, e) => x + e.amount_cents, 0);
  const checks = [
    { key: 'receipts', title: 'Expenses without a receipt', ok: !missing.length, count: missing.length, cents: sumOf(missing),
      hint: 'Attach the receipt or bill (PDF or photo) to each expense. Team pay is left out.' },
    { key: 'other', title: 'Expenses in "Other"', ok: !other.length, count: other.length, cents: sumOf(other),
      hint: 'Give them a real category so they land on the right tax line.' },
    { key: 'method', title: 'No payment method', ok: !nomethod.length, count: nomethod.length, cents: sumOf(nomethod),
      hint: 'Card, check, Zelle, bank or cash. It decides who reports the payment for 1099.' },
    { key: 'w9', title: '1099 vendors without a W-9', ok: !need1099.some((p) => !p.w9), count: need1099.filter((p) => !p.w9).length, cents: need1099.filter((p) => !p.w9).reduce((x, p) => x + p.paid, 0),
      hint: 'Get a W-9 from everyone paid $600 or more (not by card), before January 31.' },
    { key: 'inventory', title: 'Inventory on Dec 31', ok: !purchases || invEntered, count: !purchases || invEntered ? 0 : 1, cents: 0,
      hint: 'Count what is still in stock on December 31 and enter its cost. Needed to work out the cost of goods sold.' },
    { key: 'review', title: 'Waiting for the accountant to decide', ok: !toDecide.length, count: toDecide.length, cents: sumOf(toDecide),
      hint: 'Expense, equipment, owner money or a loan? Set it on the entry, or for its whole category.' },
    { key: 'unknown', title: 'Vendors with unknown type', ok: !need1099.some((p) => p.type === 'unknown'), count: need1099.filter((p) => p.type === 'unknown').length, cents: 0,
      hint: 'Individual, LLC or corporation, from their W-9.' }
  ];
  const done = checks.filter((c) => c.ok).length;
  const out = {
    year: y, from, to, part: parts.length === 1 && mine.length > 1 ? parts[0] : 'all', parts: mine,
    ready: { done, total: checks.length, pct: Math.round((done / checks.length) * 100) },
    checks,
    income: incTotal,
    expenses: { total: expTotal, deductible, byLine },
    balance,
    cogs: { begin: invBegin, purchases, end: invEnd, total: cogs, entered: invEntered, years: inv },
    owner: { totals: ownerTotals, list: owner },
    vendors: pay,
    bills_unpaid: bills ? bills.n : 0,
    map, lines: TAX_LINES, groups: LINE_GROUPS, lines_for: LINES_FOR, owner_kinds: OWNER_KINDS
  };
  if (b.light) return { year: y, ready: out.ready, checks: out.checks.map(({ key, title, ok, count, cents: c }) => ({ key, title, ok, count, cents: c })) };
  return { ...out, missing: { receipts: missing, other, method: nomethod, review: toDecide } };
}

async function ownerSave(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const old = b.id ? await one(`select * from owner_money where id=$1`, [intId(b.id)]) : null;
  if (b.id && !old) throw new HttpError(404, 'Not found');
  if (old) mustPart(ctx, old.part);
  if (!(b.kind in OWNER_KINDS)) throw new HttpError(400, 'Pick what kind of money this is');
  const f = [b.kind, day(b.date), cents(b.amount_cents), str(b.person, 120), str(b.method, 40), str(b.note, 1000), pickPart(b.part, ctx, old ? old.part : 'devices')];
  if (old) {
    await q(`update owner_money set kind=$1, date=$2, amount_cents=$3, person=$4, method=$5, note=$6, part=$7 where id=$8`, [...f, old.id]);
    return { id: old.id };
  }
  const r = await one(`insert into owner_money(kind, date, amount_cents, person, method, note, part) values ($1,$2,$3,$4,$5,$6,$7) returning id`, f);
  return { id: r.id };
}

async function ownerDelete(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const o = await one(`select * from owner_money where id=$1`, [intId(b.id)]);
  if (!o) return { ok: true };
  mustPart(ctx, o.part);
  const label = `${OWNER_KINDS[o.kind]} $${(o.amount_cents / 100).toFixed(2)} (${o.date})`;
  return { ok: true, label, trash_id: await trashDelete('owner_money', o.id, label, ctx) };
}

async function vendorSave(/** @type {any} */ b) {
  const name = str(b.name, 120);
  if (!name) throw new HttpError(400, 'Vendor name is required');
  const type = VENDOR_TYPES.includes(b.type) ? b.type : 'unknown';
  const needs = b.needs_1099 === true || b.needs_1099 === false ? b.needs_1099 : null;
  const r = await one(`insert into vendors(name, type, needs_1099, w9, note) values ($1,$2,$3,$4,$5)
    on conflict (lower(name)) do update set type=excluded.type, needs_1099=excluded.needs_1099, w9=excluded.w9, note=excluded.note, updated_at=now() returning id`,
    [name, type, needs, !!b.w9, str(b.note, 500)]);
  return { id: r.id };
}

async function yearSave(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const y = year(b.year);
  const part = pickPart(b.part, ctx);
  const c = (/** @type {any} */ v, /** @type {string} */ l) => (v === null || v === undefined || v === '' ? null : (() => { const n = Number(v); if (!Number.isInteger(n) || n < 0) throw new HttpError(400, `${l} must be 0 or more`); return n; })());
  await q(`insert into tax_years(year, part, inv_begin_cents, inv_end_cents, note) values ($1,$2,$3,$4,$5)
    on conflict (year, part) do update set inv_begin_cents=excluded.inv_begin_cents, inv_end_cents=excluded.inv_end_cents, note=excluded.note, updated_at=now()`,
    [y, part, c(b.inv_begin_cents, 'Inventory on Jan 1'), c(b.inv_end_cents, 'Inventory on Dec 31'), str(b.note, 500)]);
  // what was left on Dec 31 is what the next year starts with
  if (b.inv_end_cents !== null && b.inv_end_cents !== undefined && b.inv_end_cents !== '')
    await q(`insert into tax_years(year, part, inv_begin_cents) values ($1,$2,$3) on conflict (year, part) do update set inv_begin_cents=excluded.inv_begin_cents, updated_at=now()`,
      [y + 1, part, c(b.inv_end_cents, 'Inventory on Dec 31')]);
  return { ok: true };
}

async function mapSave(/** @type {any} */ b) {
  const m = b.map && typeof b.map === 'object' ? b.map : {};
  /** @type {Record<string, string>} */
  const out = {};
  for (const [k, v] of Object.entries(m)) {
    const key = str(k, 64);
    if (!LINES_FOR[key.startsWith('in:') ? 'income' : 'expense'].includes(String(v))) throw new HttpError(400, `"${String(v).slice(0, 40)}" does not fit "${key.replace(/^in:/, '')}"`);
    out[key] = String(v);
  }
  await setKV('sys:taxmap', { ...((await getKV('sys:taxmap')) || {}), ...out });
  return { map: await taxMap() };
}

export const TAX_OPS = {
  'tax.summary': taxSummary,
  'tax.owner.save': ownerSave,
  'tax.owner.delete': ownerDelete,
  'tax.vendor.save': vendorSave,
  'tax.year.save': yearSave,
  'tax.map.save': mapSave
};

export { payees, PART_NAMES };
