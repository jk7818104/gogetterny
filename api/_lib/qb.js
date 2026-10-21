// @ts-check
// QuickBooks files for the accountant, made from the year's Books, owner money and (if used) Stripe:
//   IIF  - QuickBooks Desktop: File → Utilities → Import → IIF Files
//   CSV  - QuickBooks Online: Settings → Import data → Journal entries
// Expenses go to the tax-line accounts set on the Taxes page; Devices / Cellular become QuickBooks classes.
import { q } from './db.js';
import { taxMap, OWNER_KINDS } from './tax.js';
import { PART_NAMES } from './parts.js';

const BANK = 'Checking', CARD = 'Credit card', STRIPE = 'Stripe', CASH = 'Cash on hand';
const EQ_IN = 'Owner contributions', EQ_OUT = 'Owner draws', LOANS = 'Loans payable';

/** Which money account paid or received it. @param {any} method */
function moneyAccount(method) {
  const m = String(method || '').toLowerCase();
  if (m === 'card') return CARD;
  if (m === 'cash') return CASH;
  if (m === 'stripe') return STRIPE;
  return BANK;
}

/**
 * Every transaction of the year as a balanced journal: lines with + for debit and − for credit.
 * @param {{from: string, to: string, parts: string[], withClass: boolean, stripeRows?: any[]}} o
 */
export async function qbJournal({ from, to, parts, withClass, stripeRows = [] }) {
  const map = await taxMap();
  const [entries, owner] = await Promise.all([
    q(`select e.*, w.name as worker_name, b.vendor as bill_vendor, b.number as bill_number, null as invoice_number, c.name as client_name
       from entries e left join workers w on w.id=e.worker_id left join bills b on b.id=e.bill_id left join clients c on c.id=e.client_id
       where e.date between $1 and $2 and e.part = any($3::text[]) order by e.date, e.id`, [from, to, parts]),
    q(`select * from owner_money where date between $1 and $2 and part = any($3::text[]) order by date, id`, [from, to, parts])
  ]);
  /** @type {Map<string, string>} account name -> IIF type */
  const accounts = new Map();
  const acct = (/** @type {string} */ name, /** @type {string} */ type) => { if (!accounts.has(name)) accounts.set(name, type); return name; };
  /** @type {{no: string, date: string, kind: string, name: string, memo: string, ref: string, cls: string, lines: {account: string, amount: number}[]}[]} */
  const tx = [];
  const cls = (/** @type {string} */ p) => (withClass ? PART_NAMES[p] || '' : '');
  const bankType = (/** @type {string} */ a) => (a === CARD ? 'CCARD' : 'BANK');

  for (const e of entries) {
    const money = acct(moneyAccount(e.method), bankType(moneyAccount(e.method)));
    const name = e.worker_name || e.party || e.bill_vendor || e.client_name || '';
    const ref = e.ref || e.bill_number || e.invoice_number || '';
    const memo = [e.category, e.note].filter(Boolean).join(' - ');
    if (e.kind === 'income') {
      const inc = acct(e.category === 'Invoices' ? 'Sales' : 'Sales - ' + e.category, 'INC');
      tx.push({ no: 'BK' + e.id, date: e.date, kind: 'DEPOSIT', name, memo, ref, cls: cls(e.part), lines: [{ account: money, amount: e.amount_cents }, { account: inc, amount: -e.amount_cents }] });
    } else {
      const line = map[e.category] || 'Other expenses';
      const exp = acct(line, line === 'Cost of goods sold' ? 'COGS' : 'EXP');
      tx.push({ no: 'BK' + e.id, date: e.date, kind: money === CARD ? 'CREDIT CARD' : 'CHECK', name, memo, ref, cls: cls(e.part), lines: [{ account: exp, amount: e.amount_cents }, { account: money, amount: -e.amount_cents }] });
    }
  }
  for (const o of owner) {
    const money = acct(moneyAccount(o.method), bankType(moneyAccount(o.method)));
    const other = o.kind === 'contribution' ? acct(EQ_IN, 'EQUITY') : o.kind === 'draw' ? acct(EQ_OUT, 'EQUITY') : acct(LOANS, 'LTLIAB');
    const into = o.kind === 'contribution' || o.kind === 'loan_in';
    tx.push({ no: 'OM' + o.id, date: o.date, kind: into ? 'DEPOSIT' : 'CHECK', name: o.person || '', memo: [OWNER_KINDS[o.kind], o.note].filter(Boolean).join(' - '), ref: '', cls: cls(o.part),
      lines: into ? [{ account: money, amount: o.amount_cents }, { account: other, amount: -o.amount_cents }] : [{ account: other, amount: o.amount_cents }, { account: money, amount: -o.amount_cents }] });
  }
  let sn = 0;
  for (const r of stripeRows) {
    if (r.part && !parts.includes(r.part)) continue;
    const st = acct(STRIPE, 'BANK');
    /** @type {{account: string, amount: number}[]} */
    const lines = [{ account: st, amount: r.net }];
    if (r.type === 'Stripe payment' || r.type === 'Refund') lines.push({ account: acct('Sales', 'INC'), amount: -r.amount });
    else lines.push({ account: acct('Bank and card fees', 'EXP'), amount: -r.amount });
    if (r.fee) lines.push({ account: acct('Bank and card fees', 'EXP'), amount: r.fee });
    tx.push({ no: 'ST' + (++sn), date: r.date, kind: 'GENERAL JOURNAL', name: r.party || '', memo: [r.type, r.description].filter(Boolean).join(' - '), ref: '', cls: cls(r.part), lines: lines.filter((l) => l.amount) });
  }
  tx.sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
  return { tx: tx.filter((t) => t.lines.length >= 2), accounts, classes: withClass ? parts.map((p) => PART_NAMES[p]) : [] };
}

const mdy = (/** @type {string} */ d) => `${d.slice(5, 7)}/${d.slice(8, 10)}/${d.slice(0, 4)}`;
const amt = (/** @type {number} */ c) => (c / 100).toFixed(2);
/** IIF fields are tab separated: no tabs, line breaks or quotes inside. @param {any} v */
const f = (v) => String(v == null ? '' : v).replace(/[\t\r\n"]+/g, ' ').trim().slice(0, 4000);

/** QuickBooks Desktop .iif @param {Awaited<ReturnType<typeof qbJournal>>} j */
export function toIIF(j) {
  const L = ['!ACCNT\tNAME\tACCNTTYPE'];
  for (const [name, type] of j.accounts) L.push(['ACCNT', f(name), type].join('\t'));
  if (j.classes.length) { L.push('!CLASS\tNAME'); for (const c of j.classes) L.push(['CLASS', f(c)].join('\t')); }
  L.push('!TRNS\tTRNSID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
  L.push('!SPL\tSPLID\tTRNSTYPE\tDATE\tACCNT\tNAME\tCLASS\tAMOUNT\tDOCNUM\tMEMO');
  L.push('!ENDTRNS');
  for (const t of j.tx) {
    // the first line is the money account for checks and deposits
    const lines = t.kind === 'GENERAL JOURNAL' ? t.lines : [...t.lines].sort((a, b) => (isMoney(a.account) ? -1 : 0) - (isMoney(b.account) ? -1 : 0));
    lines.forEach((l, i) => L.push([i ? 'SPL' : 'TRNS', '', t.kind, mdy(t.date), f(l.account), f(t.name), f(t.cls), amt(l.amount), f(t.ref), f(t.memo)].join('\t')));
    L.push('ENDTRNS');
  }
  return L.join('\r\n') + '\r\n';
}
const isMoney = (/** @type {string} */ a) => [BANK, CARD, STRIPE, CASH].includes(a);

/** @param {any} v */
const c = (v) => { const s = String(v == null ? '' : v); return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
/** QuickBooks Online journal entry import (.csv) @param {Awaited<ReturnType<typeof qbJournal>>} j */
export function toQBOcsv(j) {
  const head = ['Journal No', 'Journal Date', 'Account Name', 'Debits', 'Credits', 'Description', 'Name', ...(j.classes.length ? ['Class'] : [])];
  const L = [head.join(',')];
  for (const t of j.tx) for (const l of t.lines)
    L.push([t.no, mdy(t.date), l.account, l.amount > 0 ? amt(l.amount) : '', l.amount < 0 ? amt(-l.amount) : '', [t.ref ? '#' + t.ref : '', t.memo].filter(Boolean).join(' '), t.name, ...(j.classes.length ? [t.cls] : [])].map(c).join(','));
  return L.join('\r\n') + '\r\n';
}

/** The accounts to make in QuickBooks Online first (it does not create them from the import). @param {Awaited<ReturnType<typeof qbJournal>>} j */
export function accountsCsv(j) {
  const T = /** @type {Record<string,string>} */ ({ BANK: 'Bank', CCARD: 'Credit Card', INC: 'Income', EXP: 'Expenses', COGS: 'Cost of Goods Sold', EQUITY: 'Equity', LTLIAB: 'Long Term Liabilities' });
  return ['Account Name,Type', ...[...j.accounts].map(([n, t]) => [n, T[t] || t].map(c).join(','))].join('\r\n') + '\r\n';
}
