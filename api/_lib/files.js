// @ts-check
// Files attached to Books entries, bills and projects, and importing a bank statement into the Books.
import crypto from 'node:crypto';
import { q, one, tx } from './db.js';
import { HttpError, intId, str, cents, day } from './http.js';
import { sniffType, textOf, rowsOf, guessFromText, findColumns, toDate, toCents } from './docread.js';
import { hasSection } from './team.js';
import { whoKey } from './session.js';

export const MAX_BYTES = 4 * 1024 * 1024;

/** May this person add or remove files? @param {any} ctx */
export const canFiles = (ctx) => ctx.owner || hasSection(ctx.perms, 'books', 'edit') || hasSection(ctx.perms, 'bills', 'edit');

/** Save an upload and read what can be read from it. @param {Buffer} buf @param {string} name @param {string} claimed @param {any} ctx */
export async function saveUpload(buf, name, claimed, ctx) {
  if (!buf.length) throw new HttpError(400, 'The file is empty');
  if (buf.length > MAX_BYTES) throw new HttpError(413, 'The file is over 4 MB. Make it smaller (for a photo, take it again at lower size) and try again.');
  const type = sniffType(buf, name, claimed);
  const clean = String(name || 'file').replace(/[\\/:*?"<>|\x00-\x1f]/g, '_').slice(0, 150) || 'file';
  const sha = crypto.createHash('sha256').update(buf).digest('hex');
  const dup = await one(`select f.id, e.id as entry_id, e.date, e.amount_cents, b.id as bill_id, b.vendor from files f
    left join entries e on e.id=f.entry_id left join bills b on b.id=f.bill_id where f.sha256=$1 and (f.entry_id is not null or f.bill_id is not null) limit 1`, [sha]);
  const r = await one(`insert into files(name, type, size, sha256, data, uploaded_by) values ($1,$2,$3,$4,$5,$6) returning id`, [clean, type, buf.length, sha, buf, whoKey(ctx)]);
  const out = /** @type {any} */ ({ file: { id: r.id, name: clean, type, size: buf.length }, guess: {}, table: null });
  if (dup) out.duplicate = dup.entry_id ? `This file is already in Books (${dup.date}, $${(dup.amount_cents / 100).toFixed(2)})` : `This file is already on the bill from ${dup.vendor}`;
  const rows = await rowsOf(buf, type).catch((e) => { if (e instanceof HttpError) throw e; return null; });
  if (rows && rows.length) {
    const t = findColumns(rows);
    if (t.ok && t.body.length >= 2) out.table = { header: t.header, count: t.body.length, sample: t.body.slice(0, 6), map: t.map };
  }
  const text = out.table ? '' : await textOf(buf, type);
  if (text) {
    out.guess = guessFromText(text, ctx.settings);
    if (out.guess.party) {
      const h = await one(`select category, count(*) as n from entries where party ilike $1 group by category order by n desc limit 1`, [out.guess.party.slice(0, 40) + '%']);
      if (h) out.guess.category = h.category;
    }
    out.read = true;
  }
  return out;
}

/** Link a saved upload to a Books entry, a bill or a project. @param {number|null|undefined} fileId @param {{entry_id?: number, bill_id?: number, project_id?: number}} to */
export async function linkFile(fileId, to) {
  if (!fileId) return;
  const id = intId(fileId);
  if (to.entry_id) await q(`update files set entry_id=$1 where id=$2`, [to.entry_id, id]);
  if (to.bill_id) await q(`update files set bill_id=$1 where id=$2`, [to.bill_id, id]);
  if (to.project_id) await q(`update files set project_id=$1 where id=$2`, [to.project_id, id]);
}

async function filesList(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  if (!ctx.owner && !(b.entry_id ? hasSection(ctx.perms, 'books', 'view') : b.bill_id ? hasSection(ctx.perms, 'bills', 'view') : ctx.perms.money)) throw new HttpError(403, 'You don\'t have access to this');
  const col = b.entry_id ? 'entry_id' : b.bill_id ? 'bill_id' : b.project_id ? 'project_id' : null;
  if (!col) throw new HttpError(400, 'Nothing to list');
  return { files: await q(`select id, name, type, size, created_at from files where ${col}=$1 order by id`, [intId(b[col])]) };
}
async function filesAttach(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  if (ctx.settings && ctx.settings.f_uploads === false) throw new HttpError(403, 'Uploads are switched off in Settings');
  if (!canFiles(ctx)) throw new HttpError(403, 'You don\'t have access to this');
  await linkFile(b.file_id, { entry_id: b.entry_id ? intId(b.entry_id) : undefined, bill_id: b.bill_id ? intId(b.bill_id) : undefined, project_id: b.project_id ? intId(b.project_id) : undefined });
  return { ok: true };
}
async function filesDelete(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  if (!canFiles(ctx)) throw new HttpError(403, 'You don\'t have access to this');
  await q(`delete from files where id=$1`, [intId(b.id)]);
  return { ok: true };
}

// ---------- bank statement import ----------
const KEEP_OUT = /\b(stripe)\b/i;
const TRANSFER = /transfer|xfer|to sav|from sav|from chk|to chk|credit card payment|payment thank you|cardmember serv|(chase|amex|american express|citi|discover|capital one|barclay|synchrony).*(payment|autopay|epay|pmt)/i;
const RULES = [
  [/amazon|staples|office ?depot|walmart|target|costco|b&h|bhphoto/i, 'Office & supplies'],
  [/verizon|t-?mobile|at&t|optimum|spectrum|comcast|xfinity|fios|mint mobile/i, 'Phone & internet'],
  [/fedex|ups\b|usps|dhl|stamps\.com|shippo|freight|forwarder/i, 'Shipping & freight'],
  [/google|microsoft|adobe|vercel|github|godaddy|resend|anthropic|claude|openai|zoom|dropbox|apple\.com|icloud|notion|canva|slack|neon|alibaba/i, 'Software & subscriptions'],
  [/\bfee\b|service charge|monthly maintenance|wire fee|overdraft|interest charge/i, 'Bank & card fees'],
  [/uber|lyft|airline|delta|united|jetblue|american air|hotel|marriott|hilton|airbnb|shell|exxon|mobil|sunoco|bp\b|toll|ezpass|e-zpass|parking/i, 'Travel'],
  [/\birs\b|tax|nys dtf|dept of taxation|license|registration/i, 'Taxes & licenses'],
  [/facebook|meta ads|google ads|instagram|linkedin|marketing|print/i, 'Marketing']
];
/** A readable name from a bank line ("POS DEBIT 10/12 STAPLES #1234 NEW YORK NY" → "Staples") @param {string} d */
function cleanParty(d) {
  let s = String(d || '')
    .replace(/\b(pos|debit|credit|card|purchase|recurring|payment|online|ach|ppd|ccd|web|checkcard|visa|mastercard|withdrawal|deposit|from|to|id|ref|des|indn|co|txn|trace)\b:?/gi, ' ')
    .replace(/\b\d{1,2}\/\d{1,2}(\/\d{2,4})?\b/g, ' ').replace(/[#*]\s*\w*\d\w*/g, ' ').replace(/\b[xX*]{2,}\d+\b/g, ' ').replace(/\b\d{4,}\b/g, ' ')
    .replace(/\b[A-Z]{2}\s*$/, ' ').replace(/[^A-Za-z0-9&'.\- ]/g, ' ').replace(/\s+/g, ' ').trim();
  s = s.split(' ').slice(0, 4).join(' ');
  return s.toLowerCase().replace(/\b[a-z]/g, (c) => c.toUpperCase()).slice(0, 60);
}
const days = (/** @type {string} */ a, /** @type {string} */ b) => Math.abs(Date.parse(a + 'T12:00:00Z') - Date.parse(b + 'T12:00:00Z')) / 864e5;

/** @param {any} ctx */
const needImport = (ctx) => { if (ctx && ctx.settings && ctx.settings.f_import === false) throw new HttpError(403, 'Bank import is switched off in Settings'); };

async function importPreview(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  needImport(ctx);
  const f = await one(`select id, name, type, data from files where id=$1`, [intId(b.file_id)]);
  if (!f) throw new HttpError(404, 'File not found');
  const rows = await rowsOf(f.data, f.type);
  if (!rows || !rows.length) throw new HttpError(400, 'No rows found in this file');
  const t = findColumns(rows);
  const map = { ...t.map, ...(b.map && typeof b.map === 'object' ? Object.fromEntries(Object.entries(b.map).map(([k, v]) => [k, Number(v)])) : {}) };
  const flip = !!b.flip;
  /** @type {any[]} */ const out = [];
  t.body.forEach((r, i) => {
    const date = toDate(r[map.date]);
    let amt = null;
    if (map.amount >= 0 && r[map.amount] !== undefined && r[map.amount] !== '') amt = toCents(r[map.amount]);
    else {
      const dr = map.debit >= 0 ? toCents(r[map.debit]) : null, cr = map.credit >= 0 ? toCents(r[map.credit]) : null;
      if (dr) amt = -Math.abs(dr); else if (cr) amt = Math.abs(cr);
    }
    if (!date || !amt) return;
    if (flip) amt = -amt;
    out.push({ i, date, desc: String(r[map.desc] || '').slice(0, 200), amount_cents: amt });
  });
  if (!out.length) throw new HttpError(400, 'Could not find dates and amounts. Pick the right columns below.');
  const dates = out.map((x) => x.date).sort();
  const from = new Date(Date.parse(dates[0]) - 6 * 864e5).toISOString().slice(0, 10);
  const to = new Date(Date.parse(dates[dates.length - 1]) + 6 * 864e5).toISOString().slice(0, 10);
  const [existing, bills, workers, history, already, clients] = await Promise.all([
    q(`select id, kind, date, amount_cents, party from entries where date between $1 and $2`, [from, to]),
    q(`select b.id, b.vendor, b.number, b.amount_cents - coalesce((select sum(e.amount_cents) from entries e where e.bill_id=b.id and e.kind='expense'),0) as left from bills b`),
    q(`select id, name from workers where active`),
    q(`select party, category, kind, count(*)::int as n from entries where party is not null and party<>'' group by party, category, kind order by n desc limit 2000`),
    one(`select count(*)::int as n from entries where import_file_id=$1`, [f.id]),
    q(`select id, name, company from clients`)
  ]);
  const used = new Set();
  for (const x of out) {
    const kind = x.amount_cents > 0 ? 'income' : 'expense';
    const abs = Math.abs(x.amount_cents);
    x.kind = kind;
    x.party = cleanParty(x.desc);
    const hit = existing.find((e) => !used.has(e.id) && e.kind === kind && e.amount_cents === abs && days(e.date, x.date) <= 5);
    if (hit) { used.add(hit.id); x.status = 'in_books'; x.note = `Already in Books: ${hit.party || ''} ${hit.date}`; continue; }
    if (kind === 'income' && KEEP_OUT.test(x.desc)) { x.status = 'stripe'; x.note = 'Stripe payout: card payments are already counted from Stripe'; continue; }
    if (TRANSFER.test(x.desc)) { x.status = 'transfer'; x.note = 'Looks like a transfer or a card payment, not income or an expense'; continue; }
    x.status = 'new';
    if (kind === 'expense') {
      const bill = bills.find((bl) => Number(bl.left) === abs && (x.desc.toLowerCase().includes(String(bl.vendor).toLowerCase().split(' ')[0]) || bills.filter((o) => Number(o.left) === abs).length === 1));
      if (bill) { x.status = 'bill'; x.bill_id = bill.id; x.note = `Pays the bill from ${bill.vendor}${bill.number ? ' #' + bill.number : ''}`; continue; }
      const w = workers.find((wk) => { const parts = String(wk.name).toLowerCase().split(/\s+/).filter((p) => p.length > 2); return parts.length && parts.every((p) => x.desc.toLowerCase().includes(p)); });
      if (w) { x.status = 'worker'; x.worker_id = w.id; x.note = `Pay to ${w.name}`; x.category = 'Contractors & developers'; x.party = w.name; continue; }
    }
    if (kind === 'income') {
      const d = x.desc.toLowerCase();
      const c = clients.find((cl) => [cl.company, cl.name].some((n) => n && n.length > 2 && d.includes(String(n).toLowerCase())));
      if (c) { x.client_id = c.id; x.party = c.company ? `${c.name} (${c.company})` : c.name; }
    }
    const key = x.party.toLowerCase().split(' ').slice(0, 2).join(' ');
    const h = key ? history.find((hh) => hh.kind === kind && String(hh.party).toLowerCase().startsWith(key)) : null;
    if (h) { x.category = h.category; x.party = h.party; }
    else x.category = kind === 'income' ? 'Other income' : (RULES.find(([re]) => /** @type {RegExp} */ (re).test(x.desc)) || [null, 'Other'])[1];
  }
  return { file: { id: f.id, name: f.name }, header: t.header, map, rows: out.slice(0, 3000), already: already?.n || 0 };
}

async function importCommit(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  needImport(ctx);
  const f = await one(`select id, name from files where id=$1`, [intId(b.file_id)]);
  if (!f) throw new HttpError(404, 'File not found');
  const rows = (Array.isArray(b.rows) ? b.rows : []).slice(0, 3000);
  if (!rows.length) throw new HttpError(400, 'Pick at least one row');
  let count = 0;
  await tx(async (tq) => {
    for (const r of rows) {
      const amt = cents(Math.abs(Number(r.amount_cents)), 'Amount');
      const kind = r.kind === 'income' ? 'income' : 'expense';
      const date = day(r.date);
      const note = str(r.desc, 300);
      let billId = null, workerId = null, party = str(r.party, 120), category = str(r.category, 60) || 'Other';
      if (r.bill_id && kind === 'expense') {
        const [bl] = await tq(`select id, vendor, category, client_id, project_id from bills where id=$1`, [intId(r.bill_id)]);
        if (bl) { billId = bl.id; party = bl.vendor; category = bl.category; }
      }
      if (r.worker_id && kind === 'expense') {
        const [w] = await tq(`select id, name from workers where id=$1`, [intId(r.worker_id)]);
        if (w) { workerId = w.id; party = w.name; category = 'Contractors & developers'; }
      }
      await tq(`insert into entries(kind, date, amount_cents, category, party, method, note, bill_id, worker_id, project_id, import_file_id, client_id)
        values ($1,$2,$3,$4,$5,'Bank',$6,$7,$8,$9,$10,$11)`, [kind, date, amt, category, party, note, billId, workerId, r.project_id ? intId(r.project_id) : null, f.id, r.client_id ? intId(r.client_id) : null]);
      count++;
    }
  });
  return { ok: true, count };
}

async function importUndo(/** @type {any} */ b) {
  const rows = await q(`delete from entries where import_file_id=$1 returning id`, [intId(b.file_id)]);
  return { ok: true, count: rows.length };
}

async function importsList() {
  return { imports: await q(`select f.id, f.name, f.created_at, count(e.id)::int as rows, min(e.date) as first, max(e.date) as last
    from files f join entries e on e.import_file_id=f.id group by f.id order by f.created_at desc limit 50`) };
}

export const FILE_OPS = {
  'files.list': filesList, 'files.attach': filesAttach, 'files.delete': filesDelete,
  'import.preview': importPreview, 'import.commit': importCommit, 'import.undo': importUndo, 'import.list': importsList
};
