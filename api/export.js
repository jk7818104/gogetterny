// @ts-check
// GET /api/export?year=2026 — the year-end pack for the accountant, as one Excel workbook.
import ExcelJS from 'exceljs';
import { send, HttpError } from './_lib/http.js';
import { q, dbUrl } from './_lib/db.js';
import { contextFor } from './_lib/session.js';
import { hasSection } from './_lib/team.js';
import { OPS } from './_lib/ops.js';
import { stripe, stripeKey } from './_lib/stripe.js';

const NAVY = 'FF101216', AMBER = 'FFF2B705', ZEBRA = 'FFF6F7F9';
const USD = '"$"#,##0.00;[Red]-"$"#,##0.00';
const c2d = (/** @type {number} */ c) => Math.round(c) / 100;

/** A sheet with a dark header row, frozen, with filters. @param {ExcelJS.Workbook} wb @param {string} name @param {[string, number, string?][]} cols  [header, width, numFmt] @param {any[][]} rows */
function sheet(wb, name, cols, rows) {
  const ws = wb.addWorksheet(name, { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = cols.map(([h, w, f]) => ({ header: h, width: w, style: f ? { numFmt: f } : {} }));
  for (const r of rows) ws.addRow(r);
  const head = ws.getRow(1);
  head.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  head.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
  head.height = 20;
  if (rows.length) ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: cols.length } };
  return ws;
}

/** @param {any} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw new HttpError(405, 'GET only');
    if (!dbUrl()) throw new HttpError(404, 'Not found');
    const ctx = await contextFor(req);
    if (!ctx) throw new HttpError(401, 'Please sign in');
    if (!ctx.owner && !hasSection(/** @type {any} */ (ctx).perms, 'reports', 'view')) throw new HttpError(403, 'You don\'t have access to this');
    const year = Number(new URL(req.url || '/', 'http://x').searchParams.get('year'));
    if (!Number.isInteger(year) || year < 2000 || year > 2100) throw new HttpError(400, 'Pick a year');
    const from = `${year}-01-01`, to = `${year}-12-31`;
    const s = ctx.settings;

    const [rep, entries, bills, team] = await Promise.all([
      /** @type {any} */ (OPS).report({ from, to }),
      q(`select e.*, c.name as client_name, p.name as project_name, w.name as worker_name, b.vendor as bill_vendor, b.number as bill_number,
           (select count(*) from files f where f.entry_id=e.id)::int as files
         from entries e left join clients c on c.id=e.client_id left join projects p on p.id=e.project_id
         left join workers w on w.id=e.worker_id left join bills b on b.id=e.bill_id where e.date between $1 and $2 order by e.date, e.id`, [from, to]),
      q(`select b.*, p.name as project_name,
           coalesce((select sum(e.amount_cents) from entries e where e.bill_id=b.id and e.kind='expense' and e.date between $1 and $2),0)::bigint as paid_in_year,
           coalesce((select sum(e.amount_cents) from entries e where e.bill_id=b.id and e.kind='expense' and e.date <= $2),0)::bigint as paid_by_end
         from bills b left join projects p on p.id=b.project_id where b.bill_date <= $2 order by b.bill_date`, [from, to]),
      q(`select w.id, w.name, w.email, w.phone, w.title,
           coalesce(sum(e.amount_cents),0)::bigint as paid, count(e.id)::int as payments,
           coalesce((select sum(minutes) from time_logs t where t.worker_id=w.id and t.date between $1 and $2),0)::bigint as minutes
         from workers w left join entries e on e.worker_id=w.id and e.kind='expense' and e.date between $1 and $2
         group by w.id order by paid desc`, [from, to])
    ]);

    const wb = new ExcelJS.Workbook();
    wb.creator = s.biz_name || 'GO GETTER';
    wb.created = new Date();

    // 1. Summary: profit and loss
    const sum = wb.addWorksheet('Summary', { views: [{ showGridLines: false }] });
    sum.columns = [{ width: 44 }, { width: 18, style: { numFmt: USD } }];
    const t = sum.addRow([`${s.biz_name || 'GO GETTER'} — Profit and loss ${year}`]);
    t.font = { bold: true, size: 16 };
    sum.addRow([`${from} to ${to} · cash basis · made ${new Date().toISOString().slice(0, 10)}`]).font = { color: { argb: 'FF6B7280' } };
    sum.addRow([]);
    const sec = (/** @type {string} */ label) => { const r = sum.addRow([label]); r.font = { bold: true, color: { argb: 'FFFFFFFF' } }; r.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } }; };
    const line = (/** @type {string} */ l, /** @type {number} */ v, bold = false) => { const r = sum.addRow([l, c2d(v)]); if (bold) r.font = { bold: true }; return r; };
    sec('INCOME');
    line('Card and bank payments (Stripe), before fees', rep.stripe.gross);
    if (rep.stripe.refunds) line('Refunds', rep.stripe.refunds);
    line('Stripe fees', -rep.stripe.fees);
    if (rep.stripe.other) line('Other Stripe items', rep.stripe.other);
    for (const x of rep.income.byCategory) line(x.category, x.cents);
    line('Total income', rep.totals.income, true).border = { top: { style: 'thin' } };
    sum.addRow([]);
    sec('EXPENSES');
    for (const x of rep.expenses.byCategory) line(x.category, x.cents);
    line('Total expenses', rep.totals.expenses, true).border = { top: { style: 'thin' } };
    sum.addRow([]);
    const pr = line('PROFIT', rep.totals.profit, true);
    pr.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: AMBER } };
    sum.addRow([]);
    const owedEnd = bills.reduce((x, b) => x + Math.max(0, b.amount_cents - b.paid_by_end), 0);
    sum.addRow(['Supplier bills still unpaid on Dec 31 (not in expenses yet)', c2d(owedEnd)]);
    sum.addRow([]);
    sum.addRow(['By month']).font = { bold: true };
    const mh = sum.addRow(['Month', 'Stripe (net)', 'Other income', 'Expenses', 'Profit']);
    mh.font = { bold: true };
    sum.getColumn(3).width = 16; sum.getColumn(4).width = 16; sum.getColumn(5).width = 16;
    for (const m of rep.months) { const r = sum.addRow([m.month, c2d(m.stripe), c2d(m.income), c2d(m.expenses), c2d(m.profit)]); [2, 3, 4, 5].forEach((i) => { r.getCell(i).numFmt = USD; }); }

    // 2. Every transaction (Stripe and Books)
    sheet(wb, 'All transactions', [['Date', 12], ['Type', 16], ['Category', 24], ['Paid to / from', 28], ['Description', 40], ['Method', 14], ['Amount', 14, USD], ['Fee', 12, USD], ['Net', 14, USD]],
      rep.rows.map((/** @type {any} */ r) => [r.date, r.type, r.category, r.party, r.description, r.method, c2d(r.amount), c2d(r.fee), c2d(r.net)]));

    // 3. Books: income and expenses entered or imported
    const ent = (/** @type {string} */ kind) => entries.filter((e) => e.kind === kind).map((e) => [e.date, e.category, e.worker_name || e.party || e.bill_vendor || '', e.client_name || '', e.project_name || '',
      e.method || '', e.bill_vendor ? `Bill${e.bill_number ? ' #' + e.bill_number : ''}` : e.worker_id ? 'Team pay' : e.import_file_id ? 'Bank import' : '', e.note || '', c2d(e.amount_cents), e.files ? 'Yes' : '']);
    const entCols = /** @type {[string, number, string?][]} */ ([['Date', 12], ['Category', 24], ['Paid to / from', 28], ['Client', 22], ['Project', 22], ['Method', 14], ['Source', 14], ['Note', 40], ['Amount', 14, USD], ['Receipt on file', 10]]);
    sheet(wb, 'Income (Books)', entCols, ent('income'));
    sheet(wb, 'Expenses (Books)', entCols, ent('expense'));

    // 4. Bills
    sheet(wb, 'Bills', [['Supplier', 26], ['Bill #', 14], ['Bill date', 12], ['Due', 12], ['Category', 22], ['Project', 20], ['Amount', 14, USD], ['Paid in ' + year, 14, USD], ['Unpaid on Dec 31', 16, USD]],
      bills.filter((b) => b.bill_date >= from || b.amount_cents - b.paid_by_end > 0 || b.paid_in_year > 0)
        .map((b) => [b.vendor, b.number || '', b.bill_date, b.due_date || '', b.category, b.project_name || '', c2d(b.amount_cents), c2d(b.paid_in_year), c2d(Math.max(0, b.amount_cents - b.paid_by_end))]));

    // 5. Team pay, with the 1099 check
    sheet(wb, 'Team pay', [['Name', 24], ['Role', 18], ['Email', 28], ['Phone', 16], ['Hours logged', 12, '0.00'], ['Payments', 10], ['Paid in ' + year, 16, USD], ['$600 or more (1099 check)', 20]],
      team.filter((w) => w.paid > 0 || w.minutes > 0).map((w) => [w.name, w.title || '', w.email || '', w.phone || '', Math.round((w.minutes / 60) * 100) / 100, w.payments, c2d(w.paid), w.paid >= 60000 ? 'Yes' : '']));

    // 6. Invoices from Stripe
    if (stripeKey()) {
      const gte = Math.floor(Date.parse(from + 'T05:00:00Z') / 1000), lt = Math.floor(Date.parse(`${year + 1}-01-01T05:00:00Z`) / 1000);
      const rows = [];
      const names = Object.fromEntries((await q(`select stripe_customer_id, name, company from clients where stripe_customer_id is not null`)).map((c) => [c.stripe_customer_id, c.company ? `${c.name} (${c.company})` : c.name]));
      let n = 0;
      for await (const i of stripe().invoices.list({ created: { gte, lt }, limit: 100 })) {
        if (++n > 3000) break;
        if (i.status === 'draft') continue;
        const cust = typeof i.customer === 'string' ? i.customer : i.customer?.id || '';
        const paidAt = i.status_transitions?.paid_at ? new Date(i.status_transitions.paid_at * 1000).toISOString().slice(0, 10) : '';
        rows.push([i.number || '', new Date(i.created * 1000).toISOString().slice(0, 10), names[cust] || i.customer_name || i.customer_email || '', i.status, c2d(i.total), c2d(i.amount_paid), c2d(i.amount_remaining), paidAt, i.paid_out_of_band ? 'Marked paid (cash, check, Zelle)' : i.status === 'paid' ? 'Online' : '']);
      }
      sheet(wb, 'Invoices', [['Invoice #', 18], ['Date', 12], ['Client', 28], ['Status', 12], ['Total', 14, USD], ['Paid', 14, USD], ['Still open', 14, USD], ['Paid on', 12], ['How', 26]], rows);
    }

    // 7. Notes for the accountant
    const rd = wb.addWorksheet('Read me', { views: [{ showGridLines: false }] });
    rd.getColumn(1).width = 110;
    for (const l of [
      `${s.biz_name || 'GO GETTER'} — year-end pack ${year}`, '',
      'Cash basis: income counts when it is received, expenses when they are paid.',
      'Stripe card and bank payments are taken from Stripe itself (after refunds; fees shown separately), not entered by hand.',
      'Invoices marked paid by cash, check or Zelle are in "Income (Books)" with category Invoices.',
      'Bank statement rows that were imported say "Bank import" in the Source column.',
      'Supplier bills count as expenses on the day they were paid. "Bills" shows what was still unpaid on December 31.',
      'Team pay: "$600 or more" marks people who may need a 1099-NEC. Check this with your accountant (people paid by card or through a payment app may be reported by the payment company instead).',
      'Receipts and bills that have a file attached can be opened from the admin.'
    ]) rd.addRow([l]);
    rd.getRow(1).font = { bold: true, size: 14 };

    const buf = Buffer.from(await wb.xlsx.writeBuffer());
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${(s.biz_name || 'GO GETTER').replace(/[^\w ]/g, '')} ${year} accountant pack.xlsx"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.end(buf);
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error('export error', err);
    return send(res, 500, { error: 'Could not make the file. Try again.' });
  }
}
