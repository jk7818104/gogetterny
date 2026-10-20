// @ts-check
// Projects, tasks, hours, updates, and the team (workers and what they are paid).
// Every op gets ctx: {owner: true, settings} or {worker, perms, settings} for a signed-in team member.
import { q, one } from './db.js';
import { HttpError, str, cents, intId, day, email } from './http.js';
import { hashPassword } from './auth.js';
import { normPerms, hasSection } from './team.js';
import { stripe, stripeKey } from './stripe.js';

const TZ = 'America/New_York';
const nyDay = (/** @type {number} */ ms) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
const addDays = (/** @type {string} */ ymd, /** @type {number} */ n) => { const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
const STATUSES = ['planned', 'active', 'on_hold', 'done'];
const TASK_STATUSES = ['todo', 'doing', 'done'];

/** whole cents, zero allowed @param {any} v @param {string} label */
function centsOrZero(v, label) {
  if (v === '' || v === null || v === undefined || Number(v) === 0) return 0;
  return cents(v, label);
}
const optId = (/** @type {any} */ v) => (v ? intId(v) : null);

// ---------- who may do what ----------
/** @param {any} ctx */
const me = (ctx) => (ctx.owner ? null : ctx.worker.id);
/** @param {any} ctx */
const seesMoney = (ctx) => ctx.owner || ctx.perms.money;
/** @param {any} ctx */
const seesClient = (ctx) => ctx.owner || ctx.perms.client_info;
/** @param {any} ctx */
const taskLevel = (ctx) => (ctx.owner ? 'all' : ctx.perms.tasks);
/** @param {any} ctx */
function need(ok, msg = 'You don\'t have access to this') { if (!ok) throw new HttpError(403, msg); }

/** Ids of projects this member may open, or null for all. @param {any} ctx @returns {Promise<Set<number>|null>} */
async function visibleIds(ctx) {
  if (ctx.owner || ctx.perms.projects === 'all') return null;
  if (ctx.perms.projects === 'none') return new Set();
  const rows = await q(`select project_id from project_workers where worker_id=$1`, [ctx.worker.id]);
  return new Set(rows.map((r) => r.project_id));
}
/** @param {any} ctx @param {number} projectId */
async function mustSee(ctx, projectId) {
  const p = await one(`select * from projects where id=$1`, [projectId]);
  if (!p) throw new HttpError(404, 'Project not found');
  const ids = await visibleIds(ctx);
  if (ids && !ids.has(p.id)) throw new HttpError(404, 'Project not found');
  return p;
}

// ---------- pay: hours × rate, plus fixed project prices, minus what was paid ----------
// The rate for a project comes from the worker's place on that project; without one, their default rate.
const RATE = `(case when pw.worker_id is not null then (case when pw.pay_type='hourly' then pw.rate_cents else 0 end)
  when w.pay_type='hourly' then w.rate_cents else 0 end)`;

/**
 * Earned, paid and owed per worker. Filter by worker and/or project.
 * @param {{worker?: number|null, project?: number|null}} f
 * @returns {Promise<Record<number, {minutes:number, hourly:number, fixed:number, earned:number, paid:number, owed:number}>>}
 */
async function labor(f = {}) {
  const args = [f.worker ?? null, f.project ?? null];
  const [hrs, fixed, paid] = await Promise.all([
    q(`select t.worker_id, sum(t.minutes)::bigint as minutes, sum(round(t.minutes * ${RATE} / 60.0))::bigint as hourly
       from time_logs t join workers w on w.id=t.worker_id
       left join project_workers pw on pw.project_id=t.project_id and pw.worker_id=t.worker_id
       where ($1::int is null or t.worker_id=$1) and ($2::int is null or t.project_id=$2) group by t.worker_id`, args),
    q(`select worker_id, sum(rate_cents)::bigint as fixed from project_workers
       where pay_type='project' and ($1::int is null or worker_id=$1) and ($2::int is null or project_id=$2) group by worker_id`, args),
    q(`select worker_id, sum(amount_cents)::bigint as paid from entries
       where kind='expense' and worker_id is not null and ($1::int is null or worker_id=$1) and ($2::int is null or project_id=$2) group by worker_id`, args)
  ]);
  /** @type {Record<number, any>} */
  const by = {};
  const row = (/** @type {number} */ id) => (by[id] ||= { minutes: 0, hourly: 0, fixed: 0, earned: 0, paid: 0, owed: 0 });
  for (const r of hrs) { row(r.worker_id).minutes = r.minutes; row(r.worker_id).hourly = r.hourly; }
  for (const r of fixed) row(r.worker_id).fixed = r.fixed;
  for (const r of paid) row(r.worker_id).paid = r.paid;
  for (const r of Object.values(by)) { r.earned = r.hourly + r.fixed; r.owed = Math.max(0, r.earned - r.paid); }
  return by;
}
const sumLabor = (/** @type {Record<number, any>} */ by) => Object.values(by).reduce((s, r) => ({
  minutes: s.minutes + r.minutes, earned: s.earned + r.earned, paid: s.paid + r.paid, owed: s.owed + r.owed }), { minutes: 0, earned: 0, paid: 0, owed: 0 });

// ---------- money in and out of one project, worked out by itself ----------
const idOf = (/** @type {any} */ x) => (x && typeof x === 'object' ? x.id : x) || null;
const sec = (/** @type {number|null|undefined} */ s) => (s ? nyDay(s * 1000) : null);

/**
 * Where the project's money came from and where it still has to come from, and the same for money going out.
 * Nothing here is entered by hand on the project: it comes from invoices, card charges and payment plans made
 * for the project, money tagged with the project in Books, bills for the project, and the team's hours and pay.
 * @param {any} p
 */
async function projectMoney(p) {
  const today = nyDay(Date.now());
  /** @type {any[]} */ const received = [];
  /** @type {any[]} */ const coming = [];
  /** @type {any[]} */ const paid = [];
  /** @type {any[]} */ const toPay = [];
  const [links, plans, entries, bills, lab, team] = await Promise.all([
    q(`select stripe_id, kind from project_links where project_id=$1 order by created_at`, [p.id]),
    q(`select * from plans where project_id=$1 order by created_at`, [p.id]),
    q(`select e.*, w.name as worker_name from entries e left join workers w on w.id=e.worker_id where e.project_id=$1 order by e.date, e.id`, [p.id]),
    q(`select b.*, coalesce((select sum(e.amount_cents) from entries e where e.bill_id=b.id and e.kind='expense'),0)::bigint as paid_cents from bills b where b.project_id=$1 order by b.due_date nulls last`, [p.id]),
    labor({ project: p.id }),
    q(`select w.id, w.name from project_workers pw join workers w on w.id=pw.worker_id where pw.project_id=$1`, [p.id])
  ]);
  let stripeOk = true;
  if (stripeKey() && (links.length || plans.length)) {
    const st = stripe();
    try {
      const got = await Promise.all(links.slice(0, 150).map((l) => (l.kind === 'invoice'
        ? st.invoices.retrieve(l.stripe_id)
        : st.paymentIntents.retrieve(l.stripe_id, { expand: ['latest_charge'] })).then((x) => ({ l, x })).catch(() => ({ l, x: null }))));
      for (const { l, x } of got) {
        if (!x) continue;
        const i = /** @type {any} */ (x);
        if (l.kind === 'invoice') {
          const label = 'Invoice ' + (i.number || '(draft)');
          if (i.status === 'paid' && !i.paid_out_of_band) received.push({ date: sec(i.status_transitions?.paid_at || i.created), from: label, how: 'Paid online', amount: i.amount_paid, invoice: i.id });
          else if (i.status === 'open') {
            if (i.amount_paid) received.push({ date: sec(i.created), from: label + ' (part)', how: 'Paid online', amount: i.amount_paid, invoice: i.id });
            const due = sec(i.due_date);
            coming.push({ from: label, due, late: !!(due && due < today), amount: i.amount_remaining, invoice: i.id, url: i.hosted_invoice_url || null, what: 'Sent, waiting for payment' });
          } else if (i.status === 'draft') coming.push({ from: label, amount: i.total, invoice: i.id, what: 'Draft, not sent yet', draft: true });
          // paid by hand (cash, check, Zelle): counted from Books below. Void: nothing.
        } else if (i.status === 'succeeded') {
          const ch = i.latest_charge && typeof i.latest_charge === 'object' ? i.latest_charge : null;
          const net = i.amount_received - (ch ? ch.amount_refunded : 0);
          if (net > 0) received.push({ date: sec(i.created), from: 'Card charge' + (i.description ? ': ' + i.description : ''), how: 'Card', amount: net });
        }
      }
      for (const pl of plans.slice(0, 20)) {
        let paidCents = 0, paidN = 0, next = null;
        try {
          const s = await st.subscriptionSchedules.retrieve(pl.schedule_id);
          const sub = idOf(s.subscription);
          if (sub) {
            const inv = await st.invoices.list({ subscription: sub, limit: 100 });
            for (const i of inv.data) if (i.status === 'paid') {
              paidCents += i.amount_paid; paidN++;
              received.push({ date: sec(i.status_transitions?.paid_at || i.created), from: `Payment plan "${pl.title}" (${paidN} of ${pl.count})`, how: pl.autopay ? 'Card, automatic' : 'Paid online', amount: i.amount_paid });
            }
          }
          if (s.status === 'canceled' || s.status === 'released') continue;   // stopped: nothing more will come
          next = addMonthsOrWeeks(pl.start_date, pl.every, paidN);
        } catch (e) { stripeOk = false; continue; }
        const left = Math.max(0, pl.total_cents - paidCents);
        if (left) coming.push({ from: `Payment plan "${pl.title}"`, amount: left, due: next, what: `${paidN} of ${pl.count} paid, ${pl.autopay ? 'card charged automatically' : 'invoice emailed each time'}` });
      }
    } catch (e) { stripeOk = false; }
  }
  for (const e of entries) {
    if (e.kind === 'income') {
      // an invoice marked paid by hand (cash, check, Zelle) shows as that invoice
      const m = e.category === 'Invoices' && /^Invoice (\S+) paid by/.exec(e.note || '');
      received.push(m ? { date: e.date, from: 'Invoice ' + m[1], how: (e.method || 'Paid') + ', marked paid', amount: e.amount_cents, entry: e.id }
        : { date: e.date, from: e.party || e.category, how: e.method || '', amount: e.amount_cents, note: e.note, entry: e.id });
    }
    else paid.push({ date: e.date, to: e.worker_name || e.party || e.category, what: e.worker_id ? 'Team pay' : e.bill_id ? 'Bill' : e.category, how: e.method || '', amount: e.amount_cents, worker: e.worker_id, bill: e.bill_id, entry: e.id });
  }
  for (const b of bills) {
    const left = b.amount_cents - b.paid_cents;
    if (left > 0) toPay.push({ to: b.vendor + (b.number ? ' #' + b.number : ''), what: b.paid_cents ? 'Bill, part paid' : 'Bill', due: b.due_date, late: !!(b.due_date && b.due_date < today), amount: left, bill: b.id });
  }
  const names = Object.fromEntries(team.map((w) => [w.id, w.name]));
  for (const [wid, r] of Object.entries(lab)) {
    if (r.owed <= 0) continue;
    const parts = [r.fixed ? `fixed ${centsStr(r.fixed)}` : '', r.minutes ? `${Math.round(r.minutes / 60 * 100) / 100} h logged` : ''].filter(Boolean).join(' + ');
    toPay.push({ to: names[/** @type {any} */ (wid)] || (await one(`select name from workers where id=$1`, [wid]))?.name || 'Team member', what: `Team pay (${parts}, ${centsStr(r.paid)} paid)`, amount: r.owed, worker: Number(wid) });
  }
  const sum = (/** @type {any[]} */ l) => l.reduce((s, x) => s + x.amount, 0);
  const t = { received: sum(received), coming: sum(coming), paid: sum(paid), toPay: sum(toPay) };
  // the agreed price that has no invoice yet
  if (p.price_cents) {
    const notYet = p.price_cents - t.received - t.coming;
    if (notYet > 0) { coming.push({ from: 'Not invoiced yet', amount: notYet, what: `Price ${centsStr(p.price_cents)}, invoiced so far ${centsStr(t.received + t.coming)}`, notInvoiced: true }); t.coming += notYet; }
  }
  const byDate = (/** @type {any} */ a, /** @type {any} */ b) => ((a.date || a.due || '9999') < (b.date || b.due || '9999') ? -1 : 1);
  received.sort(byDate); paid.sort(byDate); coming.sort(byDate); toPay.sort(byDate);
  return {
    price: p.price_cents || null, budget: p.budget_cents || null, stripeOk,
    in: { received, coming, ...{ total: t.received, expected: t.coming } },
    out: { paid, toPay, total: t.paid, expected: t.toPay },
    profitNow: t.received - t.paid,
    profitEnd: t.received + t.coming - t.paid - t.toPay,
    cost: t.paid + t.toPay,
    labor: sumLabor(lab), byWorker: lab
  };
}
/** @param {string} ymd @param {string} every @param {number} n */
function addMonthsOrWeeks(ymd, every, n) {
  if (every === 'week') return addDays(ymd, 7 * n);
  const d = new Date(ymd + 'T12:00:00Z');
  const want = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(want, last));
  return d.toISOString().slice(0, 10);
}
const centsStr = (/** @type {number} */ c) => '$' + (c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- projects ----------
async function projectsList(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const ids = await visibleIds(ctx);
  const rows = await q(`select p.*, c.name as client_name,
      (select count(*) from tasks t where t.project_id=p.id)::int as tasks_total,
      (select count(*) from tasks t where t.project_id=p.id and t.status='done')::int as tasks_done,
      (select coalesce(sum(minutes),0) from time_logs l where l.project_id=p.id)::bigint as minutes,
      (select coalesce(sum(amount_cents),0) from entries e where e.project_id=p.id and e.kind='expense')::bigint as spent,
      (select coalesce(sum(amount_cents),0) from entries e where e.project_id=p.id and e.kind='income')::bigint as income,
      (select string_agg(w.name, ', ' order by w.name) from project_workers pw join workers w on w.id=pw.worker_id where pw.project_id=p.id) as team
    from projects p left join clients c on c.id=p.client_id
    order by (p.status='done'), p.due_date nulls last, p.id desc limit 1000`);
  const out = rows.filter((p) => !ids || ids.has(p.id)).map((p) => {
    if (!seesMoney(ctx)) { delete p.budget_cents; delete p.price_cents; delete p.spent; delete p.income; }
    if (!seesMoney(ctx) && !ctx.owner && !ctx.perms.project_edit) delete p.minutes;
    if (!seesClient(ctx)) { delete p.client_id; delete p.client_name; }
    return p;
  });
  return { projects: out, today: nyDay(Date.now()) };
}

async function projectsGet(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const p = await mustSee(ctx, intId(b.id));
  const mine = me(ctx);
  const allLogs = ctx.owner || ctx.perms.money || ctx.perms.project_edit;
  const [client, team, tasks, logs, notes] = await Promise.all([
    p.client_id && seesClient(ctx) ? one(`select id, name, company, email, phone from clients where id=$1`, [p.client_id]) : null,
    q(`select pw.worker_id, pw.pay_type, pw.rate_cents, w.name, w.title, w.active from project_workers pw join workers w on w.id=pw.worker_id where pw.project_id=$1 order by w.name`, [p.id]),
    taskLevel(ctx) === 'none' ? [] : q(`select t.*, w.name as worker_name from tasks t left join workers w on w.id=t.worker_id where t.project_id=$1
      order by (t.status='done'), t.due_date nulls last, t.id`, [p.id]),
    allLogs ? q(`select l.*, w.name as worker_name from time_logs l join workers w on w.id=l.worker_id where l.project_id=$1 order by l.date desc, l.id desc limit 500`, [p.id])
      : ctx.perms.time ? q(`select l.*, w.name as worker_name from time_logs l join workers w on w.id=l.worker_id where l.project_id=$1 and l.worker_id=$2 order by l.date desc, l.id desc limit 500`, [p.id, mine]) : [],
    q(`select id, author, body, created_at, worker_id from project_notes where project_id=$1 order by created_at desc limit 100`, [p.id])
  ]);
  for (const t of team) if (!seesMoney(ctx) && !(t.worker_id === mine && ctx.perms.pay)) { delete t.pay_type; delete t.rate_cents; }
  if (!seesClient(ctx)) delete p.client_id;
  /** @type {any} */
  let money = null;
  if (seesMoney(ctx)) money = await projectMoney(p);
  else { delete p.budget_cents; delete p.price_cents; }
  /** @type {any} */
  let myPay = null;
  if (mine && ctx.perms.pay) myPay = (await labor({ worker: mine, project: p.id }))[mine] || { minutes: 0, earned: 0, paid: 0, owed: 0 };
  return {
    project: p, client, team, tasks, logs, notes, money, myPay,
    can: {
      edit: !!(ctx.owner || ctx.perms.project_edit), team: !!ctx.owner, tasks: taskLevel(ctx),
      time: !!(ctx.owner || (ctx.perms.time && ctx.settings.f_time)), notes: !!(ctx.owner || ctx.perms.notes),
      money: !!seesMoney(ctx), pay: !!(ctx.owner || hasSection(ctx.perms, 'books', 'edit'))
    }
  };
}

async function projectsSave(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner || ctx.perms.project_edit);
  const old = b.id ? await mustSee(ctx, intId(b.id)) : null;
  need(old || ctx.owner, 'Only the owner can start a new project');
  const name = str(b.name, 120);
  if (!name) throw new HttpError(400, 'Give the project a name');
  const status = STATUSES.includes(b.status) ? b.status : 'active';
  const start = b.start_date ? day(b.start_date, 'Start date') : null;
  const due = b.due_date ? day(b.due_date, 'Due date') : null;
  if (start && due && due < start) throw new HttpError(400, 'Due date is before the start date');
  const client = seesClient(ctx) ? optId(b.client_id) : old ? old.client_id : null;
  const budget = seesMoney(ctx) ? (b.budget_cents ? cents(b.budget_cents, 'Budget') : null) : old ? old.budget_cents : null;
  const price = seesMoney(ctx) ? (b.price_cents ? cents(b.price_cents, 'Price') : null) : old ? old.price_cents : null;
  const f = [name, client, status, start, due, budget, str(b.description, 4000), price];
  let id;
  if (old) {
    await q(`update projects set name=$1, client_id=$2, status=$3, start_date=$4, due_date=$5, budget_cents=$6, description=$7, price_cents=$8, updated_at=now() where id=$9`, [...f, old.id]);
    id = old.id;
  } else {
    id = (await one(`insert into projects(name, client_id, status, start_date, due_date, budget_cents, description, price_cents) values ($1,$2,$3,$4,$5,$6,$7,$8) returning id`, f)).id;
  }
  if (ctx.owner && Array.isArray(b.team)) {
    const seen = new Set();
    const rows = [];
    for (const t of b.team.slice(0, 100)) {
      const wid = intId(t.worker_id);
      if (seen.has(wid)) continue;
      seen.add(wid);
      rows.push([wid, t.pay_type === 'project' ? 'project' : 'hourly', centsOrZero(t.rate_cents, 'Rate')]);
    }
    await q(`delete from project_workers where project_id=$1`, [id]);
    for (const r of rows) await q(`insert into project_workers(project_id, worker_id, pay_type, rate_cents) values ($1,$2,$3,$4)`, [id, ...r]);
  }
  return { id };
}

async function projectsDelete(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner, 'Only the owner can delete a project');
  // hours and tasks go with it; money in the books stays (it just loses the project tag)
  await q(`delete from projects where id=$1`, [intId(b.id)]);
  return { ok: true };
}

// ---------- tasks ----------
async function tasksSave(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const lvl = taskLevel(ctx);
  const mine = me(ctx);
  const status = TASK_STATUSES.includes(b.status) ? b.status : 'todo';
  if (b.id) {
    const t = await one(`select * from tasks where id=$1`, [intId(b.id)]);
    if (!t) throw new HttpError(404, 'Task not found');
    await mustSee(ctx, t.project_id);
    const doneAt = status === 'done' ? (t.status === 'done' ? t.done_at : new Date()) : null;
    if (lvl === 'all') {
      const title = str(b.title, 200) || t.title;
      await q(`update tasks set title=$1, status=$2, worker_id=$3, due_date=$4, note=$5, done_at=$6 where id=$7`,
        [title, status, optId(b.worker_id), b.due_date ? day(b.due_date, 'Due date') : null, str(b.note, 2000), doneAt, t.id]);
    } else {
      need(lvl === 'own' && t.worker_id === mine, 'You can only update your own tasks');
      await q(`update tasks set status=$1, note=$2, done_at=$3 where id=$4`, [status, b.note === undefined ? t.note : str(b.note, 2000), doneAt, t.id]);
    }
    return { id: t.id };
  }
  need(lvl === 'all' || lvl === 'own', 'You can\'t add tasks');
  const p = await mustSee(ctx, intId(b.project_id));
  const title = str(b.title, 200);
  if (!title) throw new HttpError(400, 'What is the task?');
  const worker = lvl === 'all' ? optId(b.worker_id) : mine;
  const r = await one(`insert into tasks(project_id, title, status, worker_id, due_date, note, done_at) values ($1,$2,$3,$4,$5,$6,$7) returning id`,
    [p.id, title, status, worker, b.due_date ? day(b.due_date, 'Due date') : null, str(b.note, 2000), status === 'done' ? new Date() : null]);
  return { id: r.id };
}

async function tasksDelete(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const t = await one(`select * from tasks where id=$1`, [intId(b.id)]);
  if (!t) return { ok: true };
  await mustSee(ctx, t.project_id);
  const lvl = taskLevel(ctx);
  need(lvl === 'all' || (lvl === 'own' && t.worker_id === me(ctx)), 'You can\'t delete this task');
  await q(`delete from tasks where id=$1`, [t.id]);
  return { ok: true };
}

// ---------- hours ----------
async function timeSave(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner || (ctx.perms.time && ctx.settings.f_time), 'You can\'t log hours');
  const minutes = Math.round(Number(b.minutes));
  if (!Number.isFinite(minutes) || minutes < 1 || minutes > 1440) throw new HttpError(400, 'Hours must be between 0 and 24');
  const date = day(b.date);
  const note = str(b.note, 500);
  if (b.id) {
    const l = await one(`select * from time_logs where id=$1`, [intId(b.id)]);
    if (!l) throw new HttpError(404, 'Not found');
    need(ctx.owner || l.worker_id === me(ctx), 'You can only change your own hours');
    await q(`update time_logs set date=$1, minutes=$2, note=$3 where id=$4`, [date, minutes, note, l.id]);
    return { id: l.id };
  }
  const p = await mustSee(ctx, intId(b.project_id));
  const worker = ctx.owner ? intId(b.worker_id) : me(ctx);
  const r = await one(`insert into time_logs(project_id, worker_id, date, minutes, note) values ($1,$2,$3,$4,$5) returning id`, [p.id, worker, date, minutes, note]);
  return { id: r.id };
}

async function timeDelete(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const l = await one(`select * from time_logs where id=$1`, [intId(b.id)]);
  if (!l) return { ok: true };
  need(ctx.owner || l.worker_id === me(ctx), 'You can only delete your own hours');
  await q(`delete from time_logs where id=$1`, [l.id]);
  return { ok: true };
}

// ---------- updates ----------
async function notesAdd(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner || ctx.perms.notes, 'You can\'t post updates');
  const p = await mustSee(ctx, intId(b.project_id));
  const body = str(b.body, 2000);
  if (!body) throw new HttpError(400, 'Write something first');
  await q(`insert into project_notes(project_id, worker_id, author, body) values ($1,$2,$3,$4)`, [p.id, me(ctx), ctx.owner ? ctx.settings.biz_name : ctx.worker.name, body]);
  return { ok: true };
}

// ---------- team ----------
async function teamNames(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const rows = await q(`select id, name, title from workers where active order by name`);
  return { workers: rows };
}

const WORKER_COLS = `id, name, email, phone, title, pay_type, rate_cents, active, login, (pass_hash is not null) as has_password, perms, notes, created_at`;

async function workersList(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner);
  const [rows, lab] = await Promise.all([
    q(`select ${WORKER_COLS}, (select count(*) from project_workers pw join projects p on p.id=pw.project_id where pw.worker_id=workers.id and p.status<>'done')::int as projects
       from workers order by active desc, name`),
    labor()
  ]);
  const zero = { minutes: 0, earned: 0, paid: 0, owed: 0 };
  const workers = rows.map((w) => ({ ...w, perms: normPerms(w.perms), pay: lab[w.id] || zero }));
  return { workers, owed: workers.reduce((s, w) => s + w.pay.owed, 0) };
}

async function workersGet(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner);
  const id = intId(b.id);
  const w = await one(`select ${WORKER_COLS} from workers where id=$1`, [id]);
  if (!w) throw new HttpError(404, 'Not found');
  const [projects, logs, payments, lab] = await Promise.all([
    q(`select p.id, p.name, p.status, pw.pay_type, pw.rate_cents from project_workers pw join projects p on p.id=pw.project_id where pw.worker_id=$1 order by (p.status='done'), p.name`, [id]),
    q(`select l.*, p.name as project_name from time_logs l join projects p on p.id=l.project_id where l.worker_id=$1 order by l.date desc, l.id desc limit 200`, [id]),
    q(`select e.id, e.date, e.amount_cents, e.method, e.note, p.name as project_name from entries e left join projects p on p.id=e.project_id
       where e.worker_id=$1 and e.kind='expense' order by e.date desc, e.id desc limit 200`, [id]),
    labor({ worker: id })
  ]);
  return { worker: { ...w, perms: normPerms(w.perms) }, projects, logs, payments, pay: lab[id] || { minutes: 0, earned: 0, paid: 0, owed: 0 } };
}

async function workersSave(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner);
  const name = str(b.name, 120);
  if (!name) throw new HttpError(400, 'Name is required');
  const em = email(b.email) || null;
  const login = !!b.login;
  const pw = typeof b.password === 'string' ? b.password : '';
  if (pw && pw.length < 8) throw new HttpError(400, 'The password must be at least 8 characters');
  if (login && !em) throw new HttpError(400, 'To let them sign in, add their email');
  const old = b.id ? await one(`select id, login, pass_hash, pass_ver from workers where id=$1`, [intId(b.id)]) : null;
  if (b.id && !old) throw new HttpError(404, 'Not found');
  if (login && !pw && !(old && old.pass_hash)) throw new HttpError(400, 'Set a password so they can sign in');
  const f = [name, em, str(b.phone, 40), str(b.title, 80), b.pay_type === 'project' ? 'project' : 'hourly', centsOrZero(b.rate_cents, 'Rate'),
    b.active !== false, login, JSON.stringify(normPerms(b.perms)), str(b.notes, 2000)];
  try {
    if (old) {
      // a new password, or switching sign-in off, signs them out everywhere
      const bump = pw || (old.login && !login) ? 1 : 0;
      await q(`update workers set name=$1, email=$2, phone=$3, title=$4, pay_type=$5, rate_cents=$6, active=$7, login=$8, perms=$9::jsonb, notes=$10,
        pass_hash=coalesce($11, pass_hash), pass_ver=pass_ver+$12 where id=$13`, [...f, pw ? hashPassword(pw) : null, bump, old.id]);
      return { id: old.id };
    }
    const r = await one(`insert into workers(name, email, phone, title, pay_type, rate_cents, active, login, perms, notes, pass_hash)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11) returning id`, [...f, pw ? hashPassword(pw) : null]);
    return { id: r.id };
  } catch (e) {
    if (/** @type {any} */ (e).code === '23505') throw new HttpError(400, 'Someone on the team already uses this email');
    throw e;
  }
}

async function workersDelete(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner);
  const id = intId(b.id);
  const used = await one(`select (select count(*) from time_logs where worker_id=$1)::int + (select count(*) from entries where worker_id=$1)::int as n`, [id]);
  if (used && used.n) throw new HttpError(400, 'They have hours or payments on record. Switch them to "not active" instead, so the history stays.');
  await q(`delete from workers where id=$1`, [id]);
  return { ok: true };
}

async function workersPay(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(ctx.owner || hasSection(ctx.perms, 'books', 'edit'), 'You can\'t record payments');
  const w = await one(`select id, name from workers where id=$1`, [intId(b.worker_id)]);
  if (!w) throw new HttpError(404, 'Not found');
  const project = optId(b.project_id);
  if (project && !(await one(`select id from projects where id=$1`, [project]))) throw new HttpError(400, 'Project not found');
  await q(`insert into entries(kind, date, amount_cents, category, party, method, note, worker_id, project_id) values ('expense',$1,$2,'Contractors & developers',$3,$4,$5,$6,$7)`,
    [day(b.date), cents(b.amount_cents), w.name, str(b.method, 40), str(b.note, 1000) || 'Pay', w.id, project]);
  return { ok: true };
}

// ---------- a team member's own home page ----------
async function meHome(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  need(!ctx.owner);
  const id = ctx.worker.id;
  const today = nyDay(Date.now());
  const weekStart = addDays(today, -((new Date(today + 'T12:00:00Z').getUTCDay() + 6) % 7));
  const monthStart = today.slice(0, 8) + '01';
  const on = !!ctx.settings.f_projects;
  const ids = await visibleIds(ctx);
  const [tasks, hours, payments, lab] = await Promise.all([
    on && ctx.perms.tasks !== 'none' ? q(`select t.*, p.name as project_name from tasks t join projects p on p.id=t.project_id
      where t.worker_id=$1 and t.status<>'done' order by t.due_date nulls last, t.id limit 100`, [id]) : [],
    on && ctx.perms.time ? one(`select coalesce(sum(minutes) filter (where date >= $2),0)::int as week, coalesce(sum(minutes) filter (where date >= $3),0)::int as month
      from time_logs where worker_id=$1`, [id, weekStart, monthStart]) : null,
    ctx.perms.pay ? q(`select e.date, e.amount_cents, e.method, e.note, p.name as project_name from entries e left join projects p on p.id=e.project_id
      where e.worker_id=$1 and e.kind='expense' order by e.date desc, e.id desc limit 10`, [id]) : [],
    ctx.perms.pay ? labor({ worker: id }) : {}
  ]);
  const projects = on ? (await projectsList({}, req, ctx)).projects.filter((p) => p.status !== 'done') : [];
  return {
    today,
    tasks: tasks.filter((t) => !ids || ids.has(t.project_id)),
    projects,
    hours,
    pay: ctx.perms.pay ? { ...(lab[id] || { minutes: 0, earned: 0, paid: 0, owed: 0 }), rate_cents: ctx.worker.rate_cents, pay_type: ctx.worker.pay_type, payments } : null
  };
}

export const PROJECT_OPS = {
  'me.home': meHome,
  'projects.list': projectsList,
  'projects.get': projectsGet,
  'projects.save': projectsSave,
  'projects.delete': projectsDelete,
  'tasks.save': tasksSave,
  'tasks.delete': tasksDelete,
  'time.save': timeSave,
  'time.delete': timeDelete,
  'notes.add': notesAdd,
  'team.names': teamNames,
  'workers.list': workersList,
  'workers.get': workersGet,
  'workers.save': workersSave,
  'workers.delete': workersDelete,
  'workers.pay': workersPay
};
