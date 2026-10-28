// @ts-check
// POST /api/mcp — the Claude connector. Your own Claude app (with your plan) talks to the admin through this:
// it can look things up and, after you approve in Claude, add expenses, bills, invoices, tasks and hours.
// Protected by a secret key made in Settings (sent as "Authorization: Bearer <key>").
import crypto from 'node:crypto';
import { readJson, send, clientIp, HttpError } from './_lib/http.js';
import { q, one, dbUrl, recentHits, addHit } from './_lib/db.js';
import { getSettings, getKV } from './_lib/settings.js';
import { OPS } from './_lib/ops.js';
import { audit } from './_lib/audit.js';

const VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
const TZ = 'America/New_York';
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
const usd = (/** @type {any} */ c) => c == null ? null : Math.round(Number(c)) / 100;
const toCents = (/** @type {any} */ d, /** @type {string} */ label) => {
  const n = Math.round(Number(String(d).replace(/[$,\s]/g, '')) * 100);
  if (!Number.isFinite(n) || n <= 0) throw new HttpError(400, `${label} must be a dollar amount above 0`);
  return n;
};
const call = (/** @type {string} */ op, /** @type {any} */ body, /** @type {any} */ ctx) => /** @type {any} */ (OPS)[op](body, null, ctx);

// ---------- finding things by name ----------
/** @param {string} table @param {string} what @param {any} v @param {string} cols */
async function find(table, what, v, cols) {
  if (v === undefined || v === null || v === '') return null;
  if (/^\d+$/.test(String(v))) { const r = await one(`select * from ${table} where id=$1`, [Number(v)]); if (r) return r; }
  const rows = await q(`select * from ${table} where ${cols.split(',').map((c) => `${c} ilike $1`).join(' or ')} order by id desc limit 6`, ['%' + String(v).trim() + '%']);
  if (!rows.length) throw new HttpError(400, `No ${what} matches "${v}"`);
  const exact = rows.filter((r) => cols.split(',').some((c) => String(r[c.trim()] || '').toLowerCase() === String(v).trim().toLowerCase()));
  if (exact.length === 1) return exact[0];
  if (rows.length > 1) throw new HttpError(400, `More than one ${what} matches "${v}": ${rows.map((r) => `#${r.id} ${r.name || r.vendor}${r.company ? ' (' + r.company + ')' : ''}`).join(', ')}. Use the number.`);
  return rows[0];
}
const client = (/** @type {any} */ v) => find('clients', 'client', v, 'name,company,email');
const project = (/** @type {any} */ v) => find('projects', 'project', v, 'name');
const worker = (/** @type {any} */ v) => find('workers', 'team member', v, 'name,email');

// ---------- the tools ----------
const S = (/** @type {Record<string, any>} */ props, /** @type {string[]} */ required = []) => ({ type: 'object', properties: props, required, additionalProperties: false });
const str = { type: 'string' }, num = { type: 'number' }, date = { type: 'string', description: 'YYYY-MM-DD' };
const CATS_OUT = ['Hardware & inventory', 'Shipping & freight', 'Contractors & developers', 'Software & subscriptions', 'Phone & internet', 'Travel', 'Office & supplies', 'Marketing', 'Bank & card fees', 'Professional fees', 'Taxes & licenses', 'Other'];
const CATS_IN = ['Projects', 'Consulting', 'Hardware sales', 'Invoices', 'Other income'];

/** @type {{name: string, description: string, inputSchema: any, read?: boolean, run: (a: any, ctx: any) => Promise<any>}[]} */
const TOOLS = [
  { name: 'overview', read: true, description: 'Today at a glance: this month\'s money in/out/profit, invoices waiting, and the To-do list (late invoices, bills due, team pay owed, late tasks, new leads).',
    inputSchema: S({}), run: async (a, ctx) => {
      const d = await call('dashboard', {}, ctx);
      return { today: d.today, month: { income: usd(d.month.income), expenses: usd(d.month.expenses), profit: usd(d.month.profit) },
        waiting: { invoices: d.open.count, total: usd(d.open.total), late: d.open.overdue }, bills_owed: usd(d.bills?.owed),
        todo: (d.todo || []).map((/** @type {any} */ t) => ({ what: t.title, details: t.sub, amount: usd(t.amount) })) };
    } },
  { name: 'search', read: true, description: 'Find clients, projects, bills, team members and invoices by a word, name, email or invoice number.',
    inputSchema: S({ query: str }, ['query']), run: async (a) => {
      const like = '%' + String(a.query).trim() + '%';
      const [cl, pr, bl, wk] = await Promise.all([
        q(`select id, name, company, email, phone, status from clients where name ilike $1 or company ilike $1 or email ilike $1 or phone ilike $1 limit 10`, [like]),
        q(`select id, name, status, due_date from projects where name ilike $1 or description ilike $1 limit 10`, [like]),
        q(`select id, vendor, number, amount_cents, due_date from bills where vendor ilike $1 or number ilike $1 or note ilike $1 limit 10`, [like]),
        q(`select id, name, title, email from workers where name ilike $1 or email ilike $1 or title ilike $1 limit 10`, [like])
      ]);
      let invoices = [];
      try { invoices = (await call('invoices.list', {}, { owner: true })).invoices.filter((/** @type {any} */ i) => `${i.number} ${i.name} ${i.email} ${i.project_name}`.toLowerCase().includes(String(a.query).toLowerCase()))
        .slice(0, 10).map((/** @type {any} */ i) => ({ id: i.id, number: i.number, client: i.name, status: i.overdue ? 'late' : i.status, total: usd(i.total), left: usd(i.due), project: i.project_name || null })); } catch (e) {}
      return { clients: cl, projects: pr, bills: bl.map((b) => ({ ...b, amount: usd(b.amount_cents), amount_cents: undefined })), team: wk, invoices };
    } },
  { name: 'list_invoices', read: true, description: 'Invoices (from Stripe). Optional status: draft, open, paid, void. Optional client name.',
    inputSchema: S({ status: { type: 'string', enum: ['draft', 'open', 'paid', 'void'] }, client: str }), run: async (a, ctx) => {
      const c = a.client ? await client(a.client) : null;
      const r = await call('invoices.list', { status: a.status }, ctx);
      return r.invoices.filter((/** @type {any} */ i) => !c || i.client_id === c.id).slice(0, 60).map((/** @type {any} */ i) => ({ id: i.id, number: i.number, client: i.name, status: i.overdue ? 'late' : i.status,
        total: usd(i.total), paid: usd(i.paid), left: usd(i.due), created: new Date(i.created).toISOString().slice(0, 10), due: i.due_date ? new Date(i.due_date).toISOString().slice(0, 10) : null, project: i.project_name || null, pay_link: i.url }));
    } },
  { name: 'list_bills', read: true, description: 'Supplier bills. show: unpaid (default), late, paid or all.',
    inputSchema: S({ show: { type: 'string', enum: ['unpaid', 'late', 'paid', 'all'] } }), run: async (a, ctx) => {
      const r = await call('bills.list', {}, ctx);
      const f = a.show || 'unpaid';
      return { owed_total: usd(r.totals.owed), bills: r.bills.filter((/** @type {any} */ b) => f === 'all' || (f === 'unpaid' ? b.left_cents > 0 : f === 'late' ? b.status === 'overdue' : b.status === 'paid')).slice(0, 80)
        .map((/** @type {any} */ b) => ({ id: b.id, supplier: b.vendor, number: b.number, bill_date: b.bill_date, due: b.due_date, amount: usd(b.amount_cents), paid: usd(b.paid_cents), left: usd(b.left_cents), status: b.status === 'overdue' ? 'late' : b.status, project: b.project_name })) };
    } },
  { name: 'list_books', read: true, description: 'Income and expenses recorded in the Books between two dates (card payments through Stripe are not here; see profit_and_loss).',
    inputSchema: S({ from: date, to: date, kind: { type: 'string', enum: ['income', 'expense'] } }, ['from', 'to']), run: async (a, ctx) => {
      const r = await call('entries.list', { from: a.from, to: a.to, kind: a.kind }, ctx);
      return r.entries.slice(0, 300).map((/** @type {any} */ e) => ({ id: e.id, date: e.date, kind: e.kind, amount: usd(e.amount_cents), category: e.category, who: e.party, method: e.method, client: e.client_name, project: e.project_name, note: e.note }));
    } },
  { name: 'profit_and_loss', read: true, description: 'Profit and loss between two dates: income (Stripe after fees + Books), expenses by category, profit, and by month.',
    inputSchema: S({ from: date, to: date }, ['from', 'to']), run: async (a, ctx) => {
      const r = await call('report', { from: a.from, to: a.to }, ctx);
      return { from: r.from, to: r.to, income: usd(r.totals.income), expenses: usd(r.totals.expenses), profit: usd(r.totals.profit),
        stripe: { gross: usd(r.stripe.gross), fees: usd(r.stripe.fees), refunds: usd(r.stripe.refunds) },
        income_by_category: r.income.byCategory.map((/** @type {any} */ x) => ({ category: x.category, amount: usd(x.cents) })),
        expenses_by_category: r.expenses.byCategory.map((/** @type {any} */ x) => ({ category: x.category, amount: usd(x.cents) })),
        months: r.months.map((/** @type {any} */ m) => ({ month: m.month, profit: usd(m.profit) })) };
    } },
  { name: 'list_projects', read: true, description: 'Projects with status, due date, task progress and team.',
    inputSchema: S({ status: { type: 'string', enum: ['planned', 'active', 'on_hold', 'done', 'open'] } }), run: async (a, ctx) => {
      const r = await call('projects.list', {}, ctx);
      return r.projects.filter((/** @type {any} */ p) => !a.status || (a.status === 'open' ? p.status !== 'done' : p.status === a.status))
        .map((/** @type {any} */ p) => ({ id: p.id, name: p.name, client: p.client_name, status: p.status, due: p.due_date, tasks: `${p.tasks_done}/${p.tasks_total} done`, team: p.team, budget: usd(p.budget_cents), spent: usd(p.spent) }));
    } },
  { name: 'get_project', read: true, description: 'One project in full: tasks, hours, team, updates, and money in and out (what came in from where, what is still to come, what was paid, what is still to pay).',
    inputSchema: S({ project: { type: 'string', description: 'Project name or number' } }, ['project']), run: async (a, ctx) => {
      const p = await project(a.project);
      const d = await call('projects.get', { id: p.id }, ctx);
      const m = d.money;
      const conv = (/** @type {any[]} */ l) => l.map((x) => ({ ...x, amount: usd(x.amount) }));
      return { project: { id: d.project.id, name: d.project.name, status: d.project.status, start: d.project.start_date, due: d.project.due_date, price: usd(d.project.price_cents), budget: usd(d.project.budget_cents), about: d.project.description },
        client: d.client, tasks: d.tasks.map((/** @type {any} */ t) => ({ id: t.id, title: t.title, status: t.status, who: t.worker_name, due: t.due_date })),
        team: d.team.map((/** @type {any} */ w) => ({ id: w.worker_id, name: w.name, pay: w.pay_type, rate: usd(w.rate_cents) })),
        updates: d.notes.slice(0, 15).map((/** @type {any} */ n) => ({ by: n.author, text: n.body, at: n.created_at })),
        money: m && { came_in: conv(m.in.received), still_to_come: conv(m.in.coming), paid_out: conv(m.out.paid), still_to_pay: conv(m.out.toPay),
          totals: { in: usd(m.in.total), to_come: usd(m.in.expected), out: usd(m.out.total), to_pay: usd(m.out.expected), profit_now: usd(m.profitNow), profit_when_all_paid: usd(m.profitEnd) } } };
    } },
  { name: 'get_client', read: true, description: 'One client: contact details, notes, invoices, payments, plans and activity.',
    inputSchema: S({ client: { type: 'string', description: 'Name, company, email or number' } }, ['client']), run: async (a, ctx) => {
      const c = await client(a.client);
      const d = await call('clients.get', { id: c.id }, ctx);
      return { client: d.client, invoices: d.invoices.map((/** @type {any} */ i) => ({ number: i.number, status: i.overdue ? 'late' : i.status, total: usd(i.total), left: usd(i.due) })),
        activity: d.activity.slice(0, 20).map((/** @type {any} */ x) => ({ at: x.created_at, what: x.body })) };
    } },
  { name: 'list_team', read: true, description: 'Team members with their pay (per hour or per project), hours, earned, paid and owed.',
    inputSchema: S({}), run: async (a, ctx) => {
      const r = await call('workers.list', {}, ctx);
      return r.workers.map((/** @type {any} */ w) => ({ id: w.id, name: w.name, role: w.title, active: w.active, pay: w.pay_type, rate: usd(w.rate_cents), hours: Math.round(w.pay.minutes / 6) / 10, earned: usd(w.pay.earned), paid: usd(w.pay.paid), owed: usd(w.pay.owed) }));
    } },

  // ----- changes (Claude asks you before each one) -----
  { name: 'add_expense', description: `Record money that went out (a receipt, a payment made). Category one of: ${CATS_OUT.join(', ')}.`,
    inputSchema: S({ amount: num, date, paid_to: str, category: { type: 'string', enum: CATS_OUT }, method: { type: 'string', enum: ['Cash', 'Check', 'Zelle', 'Bank transfer', 'Card', 'Other'] }, note: str, client: str, project: str }, ['amount', 'paid_to']),
    run: async (a, ctx) => entry('expense', a, ctx) },
  { name: 'add_income', description: `Record money that came in outside Stripe (cash, check, Zelle, wire). Category one of: ${CATS_IN.join(', ')}.`,
    inputSchema: S({ amount: num, date, received_from: str, category: { type: 'string', enum: CATS_IN }, method: { type: 'string', enum: ['Cash', 'Check', 'Zelle', 'Bank transfer', 'Card', 'Other'] }, note: str, client: str, project: str }, ['amount', 'received_from']),
    run: async (a, ctx) => entry('income', { ...a, paid_to: a.received_from }, ctx) },
  { name: 'tax_summary', read: true, description: 'Taxes for one year: how ready the books are for the accountant (missing receipts, W-9s, inventory count), expenses by tax line, cost of goods sold, owner money and loans, and who was paid enough to need a 1099 ($600 through 2025, $2,000 from 2026).',
    inputSchema: S({ year: num }, ['year']), run: async (a, ctx) => {
      if (ctx.settings && ctx.settings.f_tax === false) throw new HttpError(400, 'Taxes are switched off in Settings');
      const t = await call('tax.summary', { year: a.year }, ctx);
      return { year: t.year, ready_percent: t.ready.pct, to_fix: t.checks.filter((/** @type {any} */ c) => !c.ok).map((/** @type {any} */ c) => ({ what: c.title, count: c.count, amount: usd(c.cents), how: c.hint })),
        income: usd(t.income), cost_of_goods_sold: { inventory_jan_1: usd(t.cogs.begin), purchases: usd(t.cogs.purchases), inventory_dec_31: t.cogs.entered ? usd(t.cogs.end) : 'not counted yet', total: usd(t.cogs.total) },
        expenses_by_tax_line: t.expenses.byLine.map((/** @type {any} */ l) => ({ line: l.line, amount: usd(l.cents) })),
        owner_money: Object.fromEntries(Object.entries(t.owner.totals).map(([k, v]) => [k, usd(v)])),
        needs_1099_threshold: usd(t.limit_1099), needs_1099: t.vendors.filter((/** @type {any} */ v) => v.needs_1099).map((/** @type {any} */ v) => ({ name: v.name, paid: usd(v.paid), type: v.type, w9_on_file: v.w9 })) };
    } },
  { name: 'add_owner_money', description: 'Record money the owner put into the business or took out, or a loan received or paid back. It is kept out of profit (not income, not an expense).',
    inputSchema: S({ kind: { type: 'string', enum: ['contribution', 'draw', 'loan_in', 'loan_repay'] }, amount: num, date, person: str, method: { type: 'string', enum: ['Cash', 'Check', 'Zelle', 'Bank transfer', 'Card', 'Other'] }, note: str }, ['kind', 'amount']),
    run: async (a, ctx) => {
      if (ctx.settings && ctx.settings.f_tax === false) throw new HttpError(400, 'Taxes are switched off in Settings');
      const body = { kind: a.kind, amount_cents: toCents(a.amount, 'Amount'), date: a.date || today(), person: a.person || '', method: a.method || 'Bank transfer', note: a.note || '' };
      const r = await call('tax.owner.save', body, ctx);
      await audit(ctx, 'tax.owner.save', body, r);
      return { ok: true, id: r.id };
    } },
  { name: 'add_bill', description: 'Add a supplier bill to pay later (with its due date). Use this for a bill or invoice someone sent us.',
    inputSchema: S({ supplier: str, amount: num, bill_date: date, due_date: date, bill_number: str, category: { type: 'string', enum: CATS_OUT }, project: str, note: str }, ['supplier', 'amount']),
    run: async (a, ctx) => {
      const p = a.project ? await project(a.project) : null;
      const r = await call('bills.save', { vendor: a.supplier, amount_cents: toCents(a.amount, 'Amount'), bill_date: a.bill_date || today(), due_date: a.due_date || '', number: a.bill_number || '', category: a.category || 'Other', project_id: p?.id || null, note: a.note || '' }, ctx);
      await audit(ctx, 'bills.save', { vendor: a.supplier, amount_cents: toCents(a.amount, 'Amount') }, r);
      return { ok: true, bill_id: r.id, open: 'https://gogetterinc.com/admin/#/bills' };
    } },
  { name: 'pay_bill', description: 'Record a payment on a supplier bill (all of what is left, or part of it).',
    inputSchema: S({ bill_id: num, amount: num, date, method: { type: 'string', enum: ['Bank transfer', 'Zelle', 'Check', 'Cash', 'Card', 'Other'] } }, ['bill_id']),
    run: async (a, ctx) => {
      const b = await call('bills.get', { id: a.bill_id }, ctx);
      const amt = a.amount ? toCents(a.amount, 'Amount') : b.bill.left_cents;
      const r = await call('bills.pay', { id: a.bill_id, amount_cents: amt, date: a.date || today(), method: a.method || 'Bank transfer' }, ctx);
      await audit(ctx, 'bills.pay', { amount_cents: amt }, r);
      return { ok: true, supplier: r.bill.vendor, paid: usd(amt), still_left: usd(r.bill.left_cents) };
    } },
  { name: 'create_invoice', description: 'Make an invoice for a client in Stripe. send: "link" (returns a pay link to share), "email" (emails it to the client) or "draft". Prices in dollars.',
    inputSchema: S({ client: str, lines: { type: 'array', items: S({ description: str, quantity: num, price: num }, ['description', 'price']) }, send: { type: 'string', enum: ['link', 'email', 'draft'] }, due_in_days: { type: 'number', enum: [0, 7, 14, 30] }, project: str, note: str }, ['client', 'lines']),
    run: async (a, ctx) => {
      const c = await client(a.client);
      const p = a.project ? await project(a.project) : null;
      const items = a.lines.map((/** @type {any} */ l) => ({ description: l.description, qty: Math.max(1, Math.round(l.quantity || 1)), unit_cents: toCents(l.price, 'Price') }));
      const r = await call('invoices.create', { client_id: c.id, items, mode: a.send || 'link', due_days: a.due_in_days ?? 7, memo: a.note || '', project_id: p?.id || null, remind: !!ctx.settings.remind_default, bank: !!ctx.settings.ach_default }, ctx);
      await audit(ctx, 'invoices.create', {}, r);
      return { ok: true, number: r.invoice.number, total: usd(r.invoice.total), status: r.invoice.status, pay_link: r.invoice.url };
    } },
  { name: 'add_client', description: 'Add a client or lead.',
    inputSchema: S({ name: str, company: str, email: str, phone: str, address: str, status: { type: 'string', enum: ['lead', 'active', 'past'] }, notes: str }, ['name']),
    run: async (a, ctx) => {
      const r = await call('clients.save', { name: a.name, company: a.company || '', email: a.email || '', phone: a.phone || '', address: a.address || '', status: a.status || 'active', notes: a.notes || '' }, ctx);
      await audit(ctx, 'clients.save', { name: a.name }, r);
      return { ok: true, client_id: r.id };
    } },
  { name: 'create_project', description: 'Start a project. Price = what the client pays in total; budget = what it may cost.',
    inputSchema: S({ name: str, client: str, status: { type: 'string', enum: ['planned', 'active', 'on_hold'] }, start: date, due: date, price: num, budget: num, about: str }, ['name']),
    run: async (a, ctx) => {
      const c = a.client ? await client(a.client) : null;
      const r = await call('projects.save', { name: a.name, client_id: c?.id || null, status: a.status || 'active', start_date: a.start || today(), due_date: a.due || '', price_cents: a.price ? toCents(a.price, 'Price') : null, budget_cents: a.budget ? toCents(a.budget, 'Budget') : null, description: a.about || '' }, ctx);
      await audit(ctx, 'projects.save', { name: a.name }, r);
      return { ok: true, project_id: r.id, open: `https://gogetterinc.com/admin/#/projects/${r.id}` };
    } },
  { name: 'add_task', description: 'Add a task to a project, optionally for a team member and with a due date.',
    inputSchema: S({ project: str, title: str, assignee: str, due: date }, ['project', 'title']),
    run: async (a, ctx) => {
      const p = await project(a.project);
      const w = a.assignee ? await worker(a.assignee) : null;
      const r = await call('tasks.save', { project_id: p.id, title: a.title, worker_id: w?.id || null, due_date: a.due || '' }, ctx);
      await audit(ctx, 'tasks.save', { title: a.title }, r);
      return { ok: true, task_id: r.id };
    } },
  { name: 'update_task', description: 'Change a task\'s status (todo, doing, done).',
    inputSchema: S({ task_id: num, status: { type: 'string', enum: ['todo', 'doing', 'done'] } }, ['task_id', 'status']),
    run: async (a, ctx) => {
      const t = await one(`select * from tasks where id=$1`, [a.task_id]);
      if (!t) throw new HttpError(404, 'Task not found');
      const r = await call('tasks.save', { id: t.id, status: a.status, title: t.title, worker_id: t.worker_id, due_date: t.due_date, note: t.note }, ctx);
      await audit(ctx, 'tasks.save', { id: t.id, status: a.status }, r);
      return { ok: true };
    } },
  { name: 'log_hours', description: 'Log hours a team member worked on a project.',
    inputSchema: S({ project: str, team_member: str, hours: num, date, note: str }, ['project', 'team_member', 'hours']),
    run: async (a, ctx) => {
      const p = await project(a.project), w = await worker(a.team_member);
      const r = await call('time.save', { project_id: p.id, worker_id: w.id, minutes: Math.round(Number(a.hours) * 60), date: a.date || today(), note: a.note || '' }, ctx);
      await audit(ctx, 'time.save', { minutes: Math.round(Number(a.hours) * 60), project_id: p.id }, r);
      return { ok: true };
    } },
  { name: 'post_project_update', description: 'Post an update on a project (where things stand).',
    inputSchema: S({ project: str, text: str }, ['project', 'text']),
    run: async (a, ctx) => {
      const p = await project(a.project);
      await call('notes.add', { project_id: p.id, body: a.text }, ctx);
      await audit(ctx, 'notes.add', { project_id: p.id }, {});
      return { ok: true };
    } },
  { name: 'pay_team_member', description: 'Record a payment to a team member (goes into the Books as team pay).',
    inputSchema: S({ team_member: str, amount: num, date, method: { type: 'string', enum: ['Zelle', 'Bank transfer', 'Check', 'Cash', 'Card', 'Other'] }, project: str, note: str }, ['team_member', 'amount']),
    run: async (a, ctx) => {
      const w = await worker(a.team_member);
      const p = a.project ? await project(a.project) : null;
      const body = { worker_id: w.id, amount_cents: toCents(a.amount, 'Amount'), date: a.date || today(), method: a.method || 'Zelle', project_id: p?.id || null, note: a.note || '' };
      await call('workers.pay', body, ctx);
      await audit(ctx, 'workers.pay', body, {});
      return { ok: true };
    } }
];

/** @param {'income'|'expense'} kind @param {any} a @param {any} ctx */
async function entry(kind, a, ctx) {
  const c = a.client ? await client(a.client) : null;
  const p = a.project ? await project(a.project) : null;
  const body = { kind, amount_cents: toCents(a.amount, 'Amount'), date: a.date || today(), party: a.paid_to || '', category: a.category || (kind === 'income' ? 'Other income' : 'Other'),
    method: a.method || (kind === 'income' ? 'Zelle' : 'Card'), note: a.note || '', client_id: c?.id || null, project_id: p?.id || null };
  const r = await call('entries.save', body, ctx);
  await audit(ctx, 'entries.save', body, r);
  return { ok: true, entry_id: r.id };
}

const INSTRUCTIONS = `This is the GO GETTER business admin (gogetterinc.com/admin). Money amounts are in US dollars. Dates are YYYY-MM-DD, New York time.
When the user gives you a bill, receipt or invoice (PDF or photo): read it, then use add_bill if it must still be paid (it has a due date or says "due"), or add_expense if it was already paid. If it is an invoice WE sent (from GO GETTER), it is income.
Before creating anything, say in one line what you will add. Use search to find the right client, project or team member when a name is unclear.`;

// ---------- the connection ----------
/** @param {any} req */
// API keys must be sent in a header, never in a URL where they can be logged or copied.
// Spaces, quotes and a missing "Bearer" are forgiven for compatibility with existing clients.
const KEY_HEADERS = ['authorization', 'x-api-key', 'x-account-key', 'x-gogetter-key'];
/** @param {any} req */
export function keysFrom(req) {
  /** @type {string[]} */ const out = [];
  for (const h of KEY_HEADERS) {
    const v = req.headers[h];
    for (const one of [].concat(v || [])) {
      for (const part of String(one).split(',')) {
        const k = part.trim().replace(/^bearer[\s:+=]*/i, '').trim().replace(/^["']|["']$/g, '');
        if (k) out.push(k);
        // keys look like gg_ + 32 characters: pick it out even when glued to "Bearer" or other text
        const found = String(part).match(/gg_[A-Za-z0-9_-]{32}/);
        if (found && found[0] !== k) out.push(found[0]);
      }
    }
  }
  return out;
}
/** @param {any} req */
async function authorized(req) {
  const keys = keysFrom(req);
  if (!keys.length) return false;
  const saved = await getKV('sys:mcp');
  if (!saved || !saved.hash) return false;
  const want = Buffer.from(saved.hash, 'hex');
  return keys.some((k) => {
    const got = crypto.createHash('sha256').update(k).digest();
    return got.length === want.length && crypto.timingSafeEqual(got, want);
  });
}
/** What arrived, without the secret: helps find why a connector is refused (shows in Vercel logs). @param {any} req */
function authHint(req) {
  return KEY_HEADERS.map((h) => {
    const v = req.headers[h];
    if (!v) return `${h}: none`;
    const s = String(v);
    return `${h}: present (${s.length} chars${/^bearer\s/i.test(s.trim()) ? ', starts with "Bearer "' : /^bearer/i.test(s.trim()) ? ', starts with "Bearer" but no space' : ''})`;
  }).join('; ') + '; URL query keys are not accepted';
}

/** @param {any} msg @param {any} ctx */
async function handle(msg, ctx) {
  const { id, method, params } = msg || {};
  const ok = (/** @type {any} */ result) => ({ jsonrpc: '2.0', id, result });
  const fail = (/** @type {number} */ code, /** @type {string} */ message) => ({ jsonrpc: '2.0', id, error: { code, message } });
  if (id === undefined || id === null) return null;   // a notification: nothing to answer
  switch (method) {
    case 'initialize': {
      const v = VERSIONS.includes(params?.protocolVersion) ? params.protocolVersion : VERSIONS[0];
      return ok({ protocolVersion: v, capabilities: { tools: { listChanged: false } }, serverInfo: { name: 'GO GETTER admin', version: '1.0.0' }, instructions: INSTRUCTIONS });
    }
    case 'ping': return ok({});
    case 'tools/list':
      return ok({ tools: TOOLS.filter((t) => featureOn(t.name, ctx.settings)).map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema,
        annotations: { readOnlyHint: !!t.read, destructiveHint: false, openWorldHint: false } })) });
    case 'tools/call': {
      const t = TOOLS.find((x) => x.name === params?.name);
      if (!t || !featureOn(t.name, ctx.settings)) return fail(-32602, 'Unknown tool');
      try {
        const out = await t.run(params.arguments || {}, ctx);
        return ok({ content: [{ type: 'text', text: JSON.stringify(out) }] });
      } catch (e) {
        const err = /** @type {any} */ (e);
        const text = err instanceof HttpError ? err.message : err?.type?.startsWith?.('Stripe') ? 'Stripe: ' + err.message : 'Something went wrong';
        if (!(err instanceof HttpError)) console.error('mcp tool error', t.name, err);
        return ok({ content: [{ type: 'text', text }], isError: true });
      }
    }
    default: return fail(-32601, 'Method not found');
  }
}
/** Tools for parts that are switched off are hidden. @param {string} name @param {any} s */
function featureOn(name, s) {
  if (/bill/.test(name)) return s.f_bills !== false;
  if (/project|task|hours/.test(name)) return s.f_projects !== false;
  if (/team/.test(name)) return s.f_team !== false;
  if (/books|expense|income/.test(name)) return s.f_books !== false;
  return true;
}

/** @param {any} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return send(res, 405, { error: 'POST only' }); }
    if (!dbUrl()) throw new HttpError(503, 'Not set up');
    const ip = clientIp(req);
    if (await recentHits('mcp', ip, 15) >= 20) throw new HttpError(429, 'Too many tries');
    if (!(await authorized(req))) {
      await addHit('mcp', ip);
      const saved = await getKV('sys:mcp');
      console.warn('mcp 401 —', authHint(req), `; saved key ends …${saved?.last4 || 'none'}`);
      return send(res, 401, { jsonrpc: '2.0', id: null, error: { code: -32001, message: 'Missing or wrong key. Make a new key in Settings → Claude connector.' } });
    }
    const settings = await getSettings();
    if (settings.f_ai === false) throw new HttpError(403, 'The Claude connector is switched off in Settings');
    const ctx = { owner: true, via: 'claude', settings };
    const body = await readJson(req);
    if (Array.isArray(body)) {
      const out = (await Promise.all(body.map((m) => handle(m, ctx)))).filter(Boolean);
      if (!out.length) { res.statusCode = 202; return res.end(); }
      return send(res, 200, out);
    }
    const out = await handle(body, ctx);
    if (!out) { res.statusCode = 202; return res.end(); }
    return send(res, 200, out);
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err instanceof HttpError) return send(res, err.status, { jsonrpc: '2.0', id: null, error: { code: -32000, message: err.message } });
    console.error('mcp error', err);
    return send(res, 500, { jsonrpc: '2.0', id: null, error: { code: -32603, message: 'Server error' } });
  }
}
