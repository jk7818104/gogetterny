// @ts-check
// Everything the admin screen can do. Each op takes the request body (and the request) and returns JSON.
import { q, one } from './db.js';
import { stripe, stripeKey, testMode } from './stripe.js';
import { HttpError, str, cents, intId, day, email, origin } from './http.js';
import { getSettings, saveSettings, getKV, setKV } from './settings.js';
import { emailReady, fromAddress, sendEmail } from './email.js';
import { testEmail } from './templates.js';
import { emailInvoiceDoc } from './docs.js';
import { PROJECT_OPS } from './projects.js';

const TZ = 'America/New_York';

// ---------- small helpers ----------
function needStripe() {
  if (!stripeKey()) throw new HttpError(503, 'Stripe is not connected yet. Add STRIPE_SECRET_KEY in Vercel.');
  return stripe();
}

/** 'YYYY-MM-DD' for a timestamp, in New York time @param {number} ms */
export function nyDay(ms) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(ms));
}
/** UTC ms of midnight New York time on a day @param {string} ymd */
function nyMidnight(ymd) {
  const base = Date.parse(ymd + 'T00:00:00Z');
  for (const off of [4, 5]) {
    const t = base + off * 3600e3;
    const h = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: '2-digit', hourCycle: 'h23' }).format(new Date(t));
    if (h === '00') return t;
  }
  return base + 5 * 3600e3;
}
/** @param {string} ymd @param {number} n */
function addDays(ymd, n) {
  const d = new Date(ymd + 'T12:00:00Z'); d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
/** @param {string} ymd @param {string} every @param {number} n */
function addInterval(ymd, every, n) {
  if (every === 'week') return addDays(ymd, 7 * n);
  const d = new Date(ymd + 'T12:00:00Z');
  const want = d.getUTCDate();
  d.setUTCDate(1); d.setUTCMonth(d.getUTCMonth() + n);
  const last = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(want, last));
  return d.toISOString().slice(0, 10);
}
/** @param {any} x */
const idOf = (x) => (x && typeof x === 'object' ? x.id : x) || null;

async function customerNames() {
  const rows = await q(`select id, name, company, stripe_customer_id from clients where stripe_customer_id is not null`);
  /** @type {Record<string, {id:number, name:string}>} */
  const m = {};
  for (const r of rows) m[r.stripe_customer_id] = { id: r.id, name: r.company ? `${r.name} (${r.company})` : r.name };
  return m;
}

/** @param {number} id */
async function getClient(id) {
  const c = await one(`select * from clients where id=$1`, [id]);
  if (!c) throw new HttpError(404, 'Client not found');
  return c;
}

/** Create the Stripe customer the first time we bill a client. @param {any} c */
async function ensureCustomer(c) {
  if (c.stripe_customer_id) return c.stripe_customer_id;
  const cu = await needStripe().customers.create({
    name: c.company ? `${c.name} (${c.company})` : c.name,
    email: c.email || undefined,
    phone: c.phone || undefined,
    metadata: { gg_client_id: String(c.id) }
  });
  await q(`update clients set stripe_customer_id=$1, updated_at=now() where id=$2`, [cu.id, c.id]);
  c.stripe_customer_id = cu.id;
  return cu.id;
}

/** @param {number|null} clientId @param {string} kind @param {string} body */
async function log(clientId, kind, body) {
  if (clientId) await q(`insert into activity(client_id, kind, body) values ($1,$2,$3)`, [clientId, kind, body.slice(0, 2000)]);
}

const money = (/** @type {number} */ c) => '$' + (c / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ---------- mappers (only what the screen needs) ----------
/** @param {any} i @param {Record<string,{id:number,name:string}>} names */
function mapInvoice(i, names) {
  const cust = idOf(i.customer);
  return {
    id: i.id, number: i.number, status: i.status,
    total: i.total, paid: i.amount_paid, due: i.amount_remaining,
    created: i.created * 1000, due_date: i.due_date ? i.due_date * 1000 : null,
    customer: cust, client_id: names[cust]?.id || null,
    name: names[cust]?.name || i.customer_name || i.customer_email || 'Customer',
    email: i.customer_email, url: i.hosted_invoice_url || null, pdf: '/api/invoice-pdf?id=' + encodeURIComponent(i.id),
    memo: i.description || '',
    lines: (i.lines?.data || []).map((/** @type {any} */ l) => ({ description: l.description, amount: l.amount })),
    plan: !!(i.parent && i.parent.subscription_details),
    bank: (i.payment_settings?.payment_method_types || []).includes('us_bank_account'),
    remind: i.metadata?.gg_remind === '1',
    extras: (i.custom_fields || []).map((/** @type {any} */ f) => `${f.name}: ${f.value}`).join(' · '),
    overdue: i.status === 'open' && !!i.due_date && i.due_date * 1000 < Date.now()
  };
}
/** @param {any} c @param {Record<string,{id:number,name:string}>} names */
function mapCharge(c, names) {
  const cust = idOf(c.customer);
  const card = c.payment_method_details?.card;
  const bank = c.payment_method_details?.us_bank_account;
  return {
    id: c.id, amount: c.amount, refunded: c.amount_refunded, status: c.status,
    created: c.created * 1000, description: c.description || '',
    customer: cust, client_id: names[cust]?.id || null,
    name: names[cust]?.name || c.billing_details?.name || c.billing_details?.email || 'Customer',
    card: card ? `${(card.brand || 'card').toUpperCase()} •••• ${card.last4}`
      : bank ? `${bank.bank_name || 'Bank'} •••• ${bank.last4 || ''}`.trim() : (c.payment_method_details?.type || ''),
    receipt: c.receipt_url || null, failure: c.failure_message || null
  };
}
/** @param {any} pm */
function mapCard(pm) {
  const k = pm.card || {};
  return { id: pm.id, brand: (k.brand || 'card').toUpperCase(), last4: k.last4, exp: `${k.exp_month}/${String(k.exp_year).slice(-2)}` };
}

// ---------- clients ----------
const STATUSES = ['lead', 'active', 'past'];

async function clientsList(/** @type {any} */ b) {
  const status = STATUSES.includes(b.status) ? b.status : null;
  const term = str(b.q, 100);
  const rows = await q(
    `select id, name, company, email, phone, status, source, created_at from clients
     where ($1::text is null or status=$1)
       and ($2 = '' or name ilike '%'||$2||'%' or coalesce(company,'') ilike '%'||$2||'%' or coalesce(email,'') ilike '%'||$2||'%' or coalesce(phone,'') ilike '%'||$2||'%')
     order by case status when 'lead' then 0 when 'active' then 1 else 2 end, created_at desc limit 500`,
    [status, term]);
  return { clients: rows };
}

async function clientsGet(/** @type {any} */ b) {
  const c = await getClient(intId(b.id));
  const [activity, entries, plans] = await Promise.all([
    q(`select id, kind, body, created_at from activity where client_id=$1 order by created_at desc limit 60`, [c.id]),
    q(`select * from entries where client_id=$1 order by date desc, id desc limit 100`, [c.id]),
    q(`select * from plans where client_id=$1 order by created_at desc`, [c.id])
  ]);
  /** @type {any} */
  const out = { client: c, activity, entries, invoices: [], charges: [], cards: [], plans: [] };
  if (stripeKey() && c.stripe_customer_id) {
    const st = stripe();
    const names = { [c.stripe_customer_id]: { id: c.id, name: c.company ? `${c.name} (${c.company})` : c.name } };
    const [inv, ch, pms, pl] = await Promise.all([
      st.invoices.list({ customer: c.stripe_customer_id, limit: 50 }),
      st.charges.list({ customer: c.stripe_customer_id, limit: 50 }),
      st.customers.listPaymentMethods(c.stripe_customer_id, { type: 'card', limit: 20 }),
      Promise.all(plans.map(planStatus))
    ]);
    out.invoices = inv.data.map((i) => mapInvoice(i, names));
    out.charges = ch.data.map((x) => mapCharge(x, names));
    out.cards = pms.data.map(mapCard);
    out.plans = pl;
  } else {
    out.plans = plans;
  }
  return out;
}

async function clientsSave(/** @type {any} */ b) {
  const f = {
    name: str(b.name, 120), company: str(b.company, 120), email: email(b.email), phone: str(b.phone, 40),
    address: str(b.address, 300), status: STATUSES.includes(b.status) ? b.status : 'active', notes: str(b.notes, 4000)
  };
  if (!f.name) throw new HttpError(400, 'Name is required');
  if (b.id) {
    const c = await getClient(intId(b.id));
    await q(`update clients set name=$1, company=$2, email=$3, phone=$4, address=$5, status=$6, notes=$7, updated_at=now() where id=$8`,
      [f.name, f.company, f.email, f.phone, f.address, f.status, f.notes, c.id]);
    if (c.stripe_customer_id && stripeKey()) {
      await stripe().customers.update(c.stripe_customer_id, {
        name: f.company ? `${f.name} (${f.company})` : f.name, email: f.email || '', phone: f.phone || ''
      });
    }
    if (c.status !== f.status) await log(c.id, 'status', `Status changed to ${f.status}`);
    return { id: c.id };
  }
  const r = await one(`insert into clients(name, company, email, phone, address, status, notes, source) values ($1,$2,$3,$4,$5,$6,$7,'admin') returning id`,
    [f.name, f.company, f.email, f.phone, f.address, f.status, f.notes]);
  await log(r.id, 'created', 'Client added');
  return { id: r.id };
}

async function clientsDelete(/** @type {any} */ b) {
  const c = await getClient(intId(b.id));
  await q(`delete from clients where id=$1`, [c.id]);
  return { ok: true };
}

async function activityAdd(/** @type {any} */ b) {
  const c = await getClient(intId(b.client_id));
  const body = str(b.body, 2000);
  if (!body) throw new HttpError(400, 'Write a note first');
  await log(c.id, 'note', body);
  return { ok: true };
}

// ---------- project links (money in that belongs to a project) ----------
/** The project picked on a form, checked. @param {any} v */
async function pickProject(v) {
  if (!v) return null;
  const p = await one(`select id, name from projects where id=$1`, [intId(v)]);
  if (!p) throw new HttpError(400, 'Project not found');
  return p;
}
/** @param {string} stripeId @param {string} kind @param {number|null} projectId */
async function linkProject(stripeId, kind, projectId) {
  if (!projectId) { await q(`delete from project_links where stripe_id=$1`, [stripeId]); return; }
  await q(`insert into project_links(stripe_id, kind, project_id) values ($1,$2,$3) on conflict (stripe_id) do update set project_id=excluded.project_id`, [stripeId, kind, projectId]);
}

// ---------- invoices ----------
async function invoicesList(/** @type {any} */ b) {
  const st = needStripe();
  const status = ['draft', 'open', 'paid', 'void', 'uncollectible'].includes(b.status) ? b.status : undefined;
  const [inv, names, links] = await Promise.all([st.invoices.list({ limit: 100, status }), customerNames(),
    q(`select l.stripe_id, l.project_id, p.name from project_links l join projects p on p.id=l.project_id where l.kind='invoice'`)]);
  /** @type {Record<string, any>} */
  const lk = Object.fromEntries(links.map((l) => [l.stripe_id, l]));
  return { invoices: inv.data.map((i) => ({ ...mapInvoice(i, names), project_id: lk[i.id]?.project_id || null, project_name: lk[i.id]?.name || '' })) };
}

/** Email a finalized invoice: from GO GETTER when email is connected, otherwise through Stripe. @param {any} inv @param {any} settings */
async function emailInvoice(inv, settings) {
  if (emailReady() && settings.invoices_from_us) {
    return { inv: await emailInvoiceDoc(inv.id, settings, 'invoice'), via: 'from GO GETTER (PDF attached)' };
  }
  return { inv: await stripe().invoices.sendInvoice(inv.id), via: 'by Stripe' };
}

async function invoicesCreate(/** @type {any} */ b) {
  const st = needStripe();
  const c = await getClient(intId(b.client_id));
  const mode = ['draft', 'link', 'email', 'charge'].includes(b.mode) ? b.mode : 'link';
  const items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];
  const lines = items.map((/** @type {any} */ it) => {
    const qty = Math.max(1, Math.min(10000, Math.floor(Number(it.qty) || 1)));
    const unit = cents(it.unit_cents, 'Price');
    const desc = str(it.description, 300);
    if (!desc) throw new HttpError(400, 'Each line needs a description');
    return { amount: qty * unit, qty, unit, desc, description: qty > 1 ? `${desc} (${qty} × ${money(unit)})` : desc };
  });
  if (!lines.length) throw new HttpError(400, 'Add at least one line');
  if (mode === 'email' && !c.email) throw new HttpError(400, 'This client has no email. Add one, or use "Get pay link" and send the link yourself.');
  const days = Math.max(0, Math.min(120, Math.floor(Number(b.due_days) || 7)));

  // extras: discount, project / PO number, CC, bank payment, reminders
  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  let disc = 0, discLabel = '';
  const dt = b.discount && b.discount.type;
  if (dt === 'percent') {
    const pct = Number(b.discount.value);
    if (!(pct > 0 && pct <= 100)) throw new HttpError(400, 'Discount must be between 1% and 100%');
    disc = Math.round(subtotal * pct / 100);
    discLabel = `Discount (${+pct.toFixed(2)}%)`;
  } else if (dt === 'amount') {
    disc = cents(b.discount.value, 'Discount');
    discLabel = 'Discount';
  }
  if (disc >= subtotal) throw new HttpError(400, 'The discount is as big as the invoice. Lower it.');
  const fields = [];
  const project = str(b.project, 140), po = str(b.po, 140);
  if (project) fields.push({ name: 'Project', value: project });
  if (po) fields.push({ name: 'PO number', value: po });
  const cc = str(b.cc, 300).split(/[\s,;]+/).filter(Boolean);
  if (cc.length > 3) throw new HttpError(400, 'Up to 3 CC emails');
  for (const e of cc) if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) throw new HttpError(400, `"${e.slice(0, 60)}" is not a valid email`);
  const bank = !!b.bank && mode !== 'charge';
  const remind = !!b.remind && mode !== 'charge';
  const settings = await getSettings();
  const proj = await pickProject(b.project_id);

  let pm = '';
  if (mode === 'charge') pm = await pickCard(c, b.pm_id);
  const customer = await ensureCustomer(c);

  /** @type {Record<string,string>} */
  const meta = { gg_client_id: String(c.id) };
  if (remind) meta.gg_remind = '1';
  if (cc.length) meta.gg_cc = cc.join(',');
  if (mode === 'charge') meta.gg_by = 'admin';
  if (proj) meta.gg_project = String(proj.id);
  let inv = await st.invoices.create({
    customer,
    collection_method: mode === 'charge' ? 'charge_automatically' : 'send_invoice',
    ...(mode === 'charge' ? {} : { days_until_due: days }),
    auto_advance: false,
    pending_invoice_items_behavior: 'exclude',
    description: str(b.memo, 500) || undefined,
    ...(fields.length ? { custom_fields: fields } : {}),
    ...(bank ? { payment_settings: { payment_method_types: ['card', 'us_bank_account'] } } : {}),
    metadata: meta
  });
  for (const l of lines) {
    await st.invoiceItems.create({ customer, invoice: inv.id, amount: l.amount, currency: 'usd', description: l.description,
      metadata: { gg_qty: String(l.qty), gg_unit: String(l.unit), gg_desc: l.desc.slice(0, 450) } });
  }
  if (disc) await st.invoiceItems.create({ customer, invoice: inv.id, amount: -disc, currency: 'usd', description: discLabel });
  if (proj) await linkProject(inv.id, 'invoice', proj.id);
  const total = subtotal - disc;
  let via = '';
  if (mode !== 'draft') inv = await st.invoices.finalizeInvoice(inv.id, { auto_advance: false });
  if (mode === 'email') ({ inv, via } = await emailInvoice(inv, settings));
  if (mode === 'charge') inv = await st.invoices.pay(inv.id, { payment_method: pm, off_session: true });
  const what = { draft: `Draft invoice for ${money(total)}`, link: `Invoice ${inv.number} for ${money(total)}, pay link created`,
    email: `Invoice ${inv.number} for ${money(total)} emailed ${via}`, charge: `Invoice ${inv.number} for ${money(total)} charged to card` }[mode];
  await log(c.id, 'invoice', what);
  if (mode !== 'draft') await q(`update clients set status='active', updated_at=now() where id=$1 and status='lead'`, [c.id]);
  return { invoice: mapInvoice(inv, { [customer]: { id: c.id, name: c.name } }) };
}

async function invoicesAction(/** @type {any} */ b) {
  const st = needStripe();
  const id = str(b.id, 80);
  if (!/^in_/.test(id)) throw new HttpError(400, 'Bad invoice id');
  const names = await customerNames();
  let inv = await st.invoices.retrieve(id);
  const cust = idOf(inv.customer);
  const clientId = names[cust]?.id || null;
  switch (b.action) {
    case 'finalize': inv = await st.invoices.finalizeInvoice(id, { auto_advance: false }); break;
    case 'send': {
      if (!inv.customer_email) throw new HttpError(400, 'This client has no email. Add one on the client page first.');
      if (inv.status === 'draft') inv = await st.invoices.finalizeInvoice(id, { auto_advance: false });
      let via = '';
      ({ inv, via } = await emailInvoice(inv, await getSettings()));
      await log(clientId, 'invoice', `Invoice ${inv.number} emailed ${via}`);
      break;
    }
    case 'void':
      inv = await st.invoices.voidInvoice(id);
      await log(clientId, 'invoice', `Invoice ${inv.number} voided`);
      break;
    case 'delete':
      if (inv.status !== 'draft') throw new HttpError(400, 'Only drafts can be deleted. Void it instead.');
      await st.invoices.del(id);
      return { deleted: true };
    case 'mark_paid': {
      const method = str(b.method, 40) || 'Other';
      if (inv.status === 'draft') inv = await st.invoices.finalizeInvoice(id, { auto_advance: false });
      await st.invoices.update(id, { metadata: { gg_by: 'admin' } });
      const amount = inv.amount_remaining;
      inv = await st.invoices.pay(id, { paid_out_of_band: true });
      // money that did not go through Stripe goes into the books by hand
      if (amount > 0) {
        const link = await one(`select project_id from project_links where stripe_id=$1`, [id]);
        await q(`insert into entries(kind, date, amount_cents, category, party, method, client_id, note, project_id) values ('income',$1,$2,'Invoices',$3,$4,$5,$6,$7)`,
          [nyDay(Date.now()), amount, names[cust]?.name || inv.customer_name || '', method, clientId, `Invoice ${inv.number} paid by ${method}`, link?.project_id || null]);
      }
      await log(clientId, 'payment', `Invoice ${inv.number} marked paid (${method}) ${money(amount)}`);
      break;
    }
    case 'charge': {
      if (!clientId) throw new HttpError(400, 'This invoice is not linked to a client');
      const c = await getClient(clientId);
      const pm = await pickCard(c, b.pm_id);
      if (inv.status === 'draft') inv = await st.invoices.finalizeInvoice(id, { auto_advance: false });
      await st.invoices.update(id, { metadata: { gg_by: 'admin' } });
      inv = await st.invoices.pay(id, { payment_method: pm, off_session: true });
      await log(clientId, 'payment', `Invoice ${inv.number} charged to card ${money(inv.amount_paid)}`);
      break;
    }
    default: throw new HttpError(400, 'Unknown action');
  }
  return { invoice: mapInvoice(inv, names) };
}

/** Put an existing invoice on a project (or take it off). */
async function invoicesLink(/** @type {any} */ b) {
  const st = needStripe();
  const id = str(b.id, 80);
  if (!/^in_/.test(id)) throw new HttpError(400, 'Bad invoice id');
  const proj = await pickProject(b.project_id);
  const inv = await st.invoices.retrieve(id);
  await st.invoices.update(id, { metadata: { gg_project: proj ? String(proj.id) : '' } });
  await linkProject(id, 'invoice', proj ? proj.id : null);
  // money already marked paid by hand follows the invoice
  if (inv.number) await q(`update entries set project_id=$1 where kind='income' and category='Invoices' and note like $2`, [proj ? proj.id : null, `Invoice ${inv.number} paid by %`]);
  return { ok: true };
}

// ---------- cards & charges ----------
/** @param {any} c @param {any} wanted */
async function pickCard(c, wanted) {
  if (!c.stripe_customer_id) throw new HttpError(400, 'No card on file for this client. Send them the "Save card" link first.');
  const pms = await needStripe().customers.listPaymentMethods(c.stripe_customer_id, { type: 'card', limit: 20 });
  if (!pms.data.length) throw new HttpError(400, 'No card on file for this client. Send them the "Save card" link first.');
  const w = str(wanted, 80);
  const pm = w ? pms.data.find((p) => p.id === w) : pms.data[0];
  if (!pm) throw new HttpError(400, 'That card is not on file');
  return pm.id;
}

async function cardLink(/** @type {any} */ b, /** @type {any} */ req) {
  const st = needStripe();
  const c = await getClient(intId(b.client_id));
  const customer = await ensureCustomer(c);
  const base = origin(req);
  const s = await st.checkout.sessions.create({
    mode: 'setup', customer, currency: 'usd',
    success_url: base + '/pay/card-saved.html', cancel_url: base + '/'
  });
  await log(c.id, 'card', 'Save-card link created');
  return { url: s.url, expires: s.expires_at * 1000 };
}

async function cardsList(/** @type {any} */ b) {
  const c = await getClient(intId(b.client_id));
  if (!stripeKey() || !c.stripe_customer_id) return { cards: [], email: c.email || '' };
  const pms = await stripe().customers.listPaymentMethods(c.stripe_customer_id, { type: 'card', limit: 20 });
  return { cards: pms.data.map(mapCard), email: c.email || '' };
}

/** Test mode only: put Stripe's test Visa on a client, so charges can be tried without typing a card. */
async function cardTest(/** @type {any} */ b) {
  if (!testMode()) throw new HttpError(400, 'Only in test mode');
  const st = needStripe();
  const c = await getClient(intId(b.client_id));
  const customer = await ensureCustomer(c);
  const pm = await st.paymentMethods.attach('pm_card_visa', { customer });
  await log(c.id, 'card', `Test card added (VISA •••• ${pm.card?.last4 || '4242'}, test mode)`);
  return { ok: true };
}

async function cardRemove(/** @type {any} */ b) {
  const st = needStripe();
  const c = await getClient(intId(b.client_id));
  const id = str(b.pm_id, 80);
  const pm = await st.paymentMethods.retrieve(id);
  if (idOf(pm.customer) !== c.stripe_customer_id) throw new HttpError(400, 'That card is not on file for this client');
  await st.paymentMethods.detach(id);
  await log(c.id, 'card', `Card ${mapCard(pm).brand} •••• ${mapCard(pm).last4} removed`);
  return { ok: true };
}

async function chargesCreate(/** @type {any} */ b) {
  const st = needStripe();
  const c = await getClient(intId(b.client_id));
  const amount = cents(b.amount_cents);
  const description = str(b.description, 300);
  if (!description) throw new HttpError(400, 'Say what the charge is for');
  const pm = await pickCard(c, b.pm_id);
  const proj = await pickProject(b.project_id);
  const pi = await st.paymentIntents.create({
    amount, currency: 'usd', customer: c.stripe_customer_id, payment_method: pm,
    off_session: true, confirm: true, description,
    metadata: { gg_client_id: String(c.id), ...(proj ? { gg_project: String(proj.id) } : {}) }
  });
  if (proj) await linkProject(pi.id, 'charge', proj.id);
  await log(c.id, 'payment', `Card charged ${money(amount)}: ${description}`);
  await q(`update clients set status='active', updated_at=now() where id=$1 and status='lead'`, [c.id]);
  return { ok: pi.status === 'succeeded', status: pi.status };
}

async function chargesList() {
  const st = needStripe();
  const [ch, names] = await Promise.all([st.charges.list({ limit: 100 }), customerNames()]);
  return { charges: ch.data.map((c) => mapCharge(c, names)) };
}

async function chargesRefund(/** @type {any} */ b) {
  const st = needStripe();
  const id = str(b.charge_id, 80);
  if (!/^(ch|py)_/.test(id)) throw new HttpError(400, 'Bad payment id');
  const ch = await st.charges.retrieve(id);
  const left = ch.amount - ch.amount_refunded;
  const amount = b.amount_cents ? cents(b.amount_cents) : left;
  if (amount > left) throw new HttpError(400, `You can refund up to ${money(left)}`);
  await st.refunds.create({ charge: id, amount });
  const names = await customerNames();
  await log(names[idOf(ch.customer)]?.id || null, 'refund', `Refunded ${money(amount)}${ch.description ? ': ' + ch.description : ''}`);
  return { ok: true };
}

// ---------- payment plans ----------
/** @param {any} p */
async function planStatus(p) {
  const st = stripe();
  const per = Math.floor(p.total_cents / p.count);
  const first = p.total_cents - per * (p.count - 1);
  const dates = Array.from({ length: p.count }, (_, k) => addInterval(p.start_date, p.every, k));
  const base = { ...p, per_cents: per, first_cents: first, dates };
  try {
    const s = await st.subscriptionSchedules.retrieve(p.schedule_id);
    const sub = idOf(s.subscription);
    let paid = 0, paidCents = 0, open = 0, failed = 0;
    if (sub) {
      const inv = await st.invoices.list({ subscription: sub, limit: 100 });
      for (const i of inv.data) {
        if (i.status === 'paid') { paid++; paidCents += i.amount_paid; }
        else if (i.status === 'open') { open++; if (i.attempt_count > 0) failed++; }
      }
    }
    const done = s.status === 'completed' || s.status === 'canceled' || s.status === 'released' || paid >= p.count;
    return { ...base, status: paid >= p.count ? 'completed' : s.status, paid, paid_cents: paidCents, open, failed,
      next_date: done ? null : dates[Math.min(paid + open, p.count - 1)] };
  } catch (e) {
    return { ...base, status: 'unknown', paid: 0, paid_cents: 0, open: 0, failed: 0, next_date: null };
  }
}

async function plansList() {
  needStripe();
  const rows = await q(`select p.*, c.name as client_name, c.company as client_company from plans p left join clients c on c.id=p.client_id order by p.created_at desc limit 60`);
  return { plans: await Promise.all(rows.map(planStatus)) };
}

async function plansCreate(/** @type {any} */ b) {
  const st = needStripe();
  const c = await getClient(intId(b.client_id));
  const title = str(b.title, 120) || 'Payment plan';
  const total = cents(b.total_cents, 'Total');
  const count = Math.floor(Number(b.count));
  if (!(count >= 2 && count <= 60)) throw new HttpError(400, 'Number of payments must be 2 to 60');
  const every = b.every === 'week' ? 'week' : 'month';
  const today = nyDay(Date.now());
  const start = b.start_date ? day(b.start_date, 'Start date') : today;
  if (start < today) throw new HttpError(400, 'Start date cannot be in the past');
  const autopay = !!b.autopay;
  const proj = await pickProject(b.project_id);
  if (!autopay && !c.email) throw new HttpError(400, 'This client has no email for the monthly invoices. Add one, or choose "Charge card automatically".');
  const pm = autopay ? await pickCard(c, b.pm_id) : '';
  const customer = await ensureCustomer(c);
  const per = Math.floor(total / count);
  const first = total - per * (count - 1);
  const product = await st.products.create({ name: title, metadata: { gg_client_id: String(c.id), gg: 'plan' } });
  const item = (/** @type {number} */ amt) => ({ price_data: { currency: 'usd', product: product.id, unit_amount: amt, recurring: { interval: /** @type {'month'|'week'} */ (every) } }, quantity: 1 });
  const phases = first === per
    ? [{ items: [item(per)], duration: { interval: /** @type {'month'|'week'} */ (every), interval_count: count } }]
    : [
        { items: [item(first)], duration: { interval: /** @type {'month'|'week'} */ (every), interval_count: 1 } },
        { items: [item(per)], duration: { interval: /** @type {'month'|'week'} */ (every), interval_count: count - 1 } }
      ];
  const sched = await st.subscriptionSchedules.create({
    customer,
    start_date: start === today ? 'now' : Math.floor((nyMidnight(start) + 10 * 3600e3) / 1000),
    end_behavior: 'cancel',
    default_settings: autopay
      ? { collection_method: 'charge_automatically', default_payment_method: pm }
      : { collection_method: 'send_invoice', invoice_settings: { days_until_due: 7 } },
    phases,
    metadata: { gg_client_id: String(c.id), gg_title: title, ...(proj ? { gg_project: String(proj.id) } : {}) }
  });
  const r = await one(`insert into plans(client_id, schedule_id, title, total_cents, count, every, start_date, autopay, project_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning *`,
    [c.id, sched.id, title, total, count, every, start, autopay, proj ? proj.id : null]);
  await log(c.id, 'plan', `Payment plan "${title}": ${money(total)} in ${count} ${every === 'week' ? 'weekly' : 'monthly'} payments${autopay ? ', card charged automatically' : ', invoice emailed each time'}`);
  await q(`update clients set status='active', updated_at=now() where id=$1 and status='lead'`, [c.id]);
  return { plan: await planStatus(r) };
}

async function plansCancel(/** @type {any} */ b) {
  const st = needStripe();
  const p = await one(`select * from plans where id=$1`, [intId(b.id)]);
  if (!p) throw new HttpError(404, 'Plan not found');
  const s = await st.subscriptionSchedules.retrieve(p.schedule_id);
  if (s.status === 'not_started' || s.status === 'active') await st.subscriptionSchedules.cancel(p.schedule_id);
  await log(p.client_id, 'plan', `Payment plan "${p.title}" stopped`);
  return { ok: true };
}

// ---------- books ----------
async function entriesList(/** @type {any} */ b) {
  const from = b.from ? day(b.from) : '1900-01-01';
  const to = b.to ? day(b.to) : '2999-12-31';
  const kind = b.kind === 'income' || b.kind === 'expense' ? b.kind : null;
  const rows = await q(`select e.*, c.name as client_name, p.name as project_name from entries e left join clients c on c.id=e.client_id
    left join projects p on p.id=e.project_id
    where e.date between $1 and $2 and ($3::text is null or e.kind=$3) order by e.date desc, e.id desc limit 2000`, [from, to, kind]);
  return { entries: rows };
}

async function entriesSave(/** @type {any} */ b) {
  const kind = b.kind === 'income' ? 'income' : 'expense';
  const f = [kind, day(b.date), cents(b.amount_cents), str(b.category, 60) || 'Other', str(b.party, 120), str(b.method, 40),
    b.client_id ? intId(b.client_id) : null, str(b.note, 1000), b.project_id ? intId(b.project_id) : null];
  if (b.id) {
    await q(`update entries set kind=$1, date=$2, amount_cents=$3, category=$4, party=$5, method=$6, client_id=$7, note=$8, project_id=$9 where id=$10`, [...f, intId(b.id)]);
    return { id: Number(b.id) };
  }
  const r = await one(`insert into entries(kind, date, amount_cents, category, party, method, client_id, note, project_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`, f);
  return { id: r.id };
}

async function entriesDelete(/** @type {any} */ b) {
  await q(`delete from entries where id=$1`, [intId(b.id)]);
  return { ok: true };
}

// ---------- bills (money we owe suppliers) ----------
// A bill is what a supplier asked us to pay. Each payment is an expense in the books with bill_id set,
// so the books and the bill can never disagree. Deleting a payment in Books makes the bill unpaid again.
const BILL_SELECT = `select b.*, c.name as client_name, p.name as project_name,
    coalesce((select sum(e.amount_cents) from entries e where e.bill_id=b.id and e.kind='expense'), 0)::bigint as paid_cents
  from bills b left join clients c on c.id=b.client_id left join projects p on p.id=b.project_id`;

/** @param {any} b @param {string} today */
function mapBill(b, today) {
  const left = Math.max(0, b.amount_cents - b.paid_cents);
  const status = left === 0 ? 'paid' : b.due_date && b.due_date < today ? 'overdue' : b.paid_cents > 0 ? 'partial' : 'open';
  return { ...b, left_cents: left, status };
}

async function billsList() {
  const today = nyDay(Date.now());
  const week = addDays(today, 7);
  const bills = (await q(BILL_SELECT + ` order by b.bill_date desc, b.id desc limit 2000`)).map((b) => mapBill(b, today));
  const unpaid = bills.filter((b) => b.left_cents > 0)
    .sort((a, b) => (a.due_date || '9999') < (b.due_date || '9999') ? -1 : (a.due_date || '9999') > (b.due_date || '9999') ? 1 : 0);
  const sum = (/** @type {any[]} */ l) => l.reduce((s, b) => s + b.left_cents, 0);
  const late = unpaid.filter((b) => b.status === 'overdue');
  const soon = unpaid.filter((b) => b.status !== 'overdue' && b.due_date && b.due_date <= week);
  return {
    today,
    bills: [...unpaid, ...bills.filter((b) => b.left_cents === 0)],
    totals: { owed: sum(unpaid), open: unpaid.length, late: sum(late), lateCount: late.length, week: sum(soon), weekCount: soon.length }
  };
}

/** @param {number} id */
async function getBill(id) {
  const b = await one(BILL_SELECT + ` where b.id=$1`, [id]);
  if (!b) throw new HttpError(404, 'Bill not found');
  return mapBill(b, nyDay(Date.now()));
}

async function billsGet(/** @type {any} */ b) {
  const bill = await getBill(intId(b.id));
  const payments = await q(`select id, date, amount_cents, method, note, kind from entries where bill_id=$1 order by date, id`, [bill.id]);
  return { bill, payments };
}

async function billsSave(/** @type {any} */ b) {
  const vendor = str(b.vendor, 120);
  if (!vendor) throw new HttpError(400, 'Who is the bill from?');
  const billDate = day(b.bill_date, 'Bill date');
  const due = b.due_date ? day(b.due_date, 'Due date') : null;
  if (due && due < billDate) throw new HttpError(400, 'Due date is before the bill date');
  const f = [vendor, str(b.number, 60) || null, billDate, due, cents(b.amount_cents), str(b.category, 60) || 'Other',
    b.client_id ? intId(b.client_id) : null, str(b.note, 1000), b.project_id ? intId(b.project_id) : null];
  if (b.id) {
    const old = await getBill(intId(b.id));
    if (f[4] < old.paid_cents) throw new HttpError(400, `You already paid ${money(old.paid_cents)} on this bill. The amount can't be less than that.`);
    await q(`update bills set vendor=$1, number=$2, bill_date=$3, due_date=$4, amount_cents=$5, category=$6, client_id=$7, note=$8, project_id=$9, updated_at=now() where id=$10`, [...f, old.id]);
    return { id: old.id };
  }
  const r = await one(`insert into bills(vendor, number, bill_date, due_date, amount_cents, category, client_id, note, project_id) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) returning id`, f);
  return { id: r.id };
}

async function billsDelete(/** @type {any} */ b) {
  // payments already made stay in the books as expenses (the money really went out)
  await q(`delete from bills where id=$1`, [intId(b.id)]);
  return { ok: true };
}

async function billsPay(/** @type {any} */ b) {
  const bill = await getBill(intId(b.id));
  if (!bill.left_cents) throw new HttpError(400, 'This bill is already paid');
  const amt = cents(b.amount_cents);
  if (amt > bill.left_cents) throw new HttpError(400, `Only ${money(bill.left_cents)} is left to pay on this bill`);
  const note = str(b.note, 1000) || ('Bill' + (bill.number ? ' #' + bill.number : '') + (amt < bill.left_cents ? ' (part payment)' : ''));
  await q(`insert into entries(kind, date, amount_cents, category, party, method, client_id, note, bill_id, project_id) values ('expense',$1,$2,$3,$4,$5,$6,$7,$8,$9)`,
    [day(b.date), amt, bill.category, bill.vendor, str(b.method, 40), bill.client_id, note, bill.id, bill.project_id]);
  return { bill: await getBill(bill.id) };
}

// ---------- reports ----------
const SKIP_BT = new Set(['payout', 'payout_cancel', 'payout_failure', 'payout_minimum_balance_hold', 'payout_minimum_balance_release',
  'topup', 'topup_reversal', 'transfer', 'transfer_cancel', 'transfer_failure', 'transfer_refund', 'reserve_transaction', 'reserved_funds']);
const REFUND_BT = new Set(['refund', 'payment_refund', 'payment_failure_refund', 'refund_failure', 'payment_reversal']);

/** @param {string} from @param {string} to */
async function stripeMoney(from, to) {
  const out = { gross: 0, fees: 0, refunds: 0, other: 0, net: 0, count: 0, /** @type {any[]} */ rows: [] };
  if (!stripeKey()) return out;
  const st = stripe();
  const names = await customerNames();
  const gte = Math.floor(nyMidnight(from) / 1000), lt = Math.floor(nyMidnight(addDays(to, 1)) / 1000);
  let n = 0;
  for await (const bt of st.balanceTransactions.list({ created: { gte, lt }, limit: 100, expand: ['data.source'] })) {
    if (++n > 5000) break;
    if (SKIP_BT.has(bt.type)) continue;
    /** @type {any} */
    const src = bt.source && typeof bt.source === 'object' ? bt.source : {};
    const cust = idOf(src.customer);
    const isSale = bt.type === 'charge' || bt.type === 'payment';
    if (isSale) { out.gross += bt.amount; out.count++; }
    else if (REFUND_BT.has(bt.type)) out.refunds += bt.amount;
    else if (bt.type === 'stripe_fee' || bt.type === 'stripe_fx_fee' || bt.type === 'tax_fee') out.fees += -bt.amount;
    else out.other += bt.amount;
    out.fees += bt.fee;
    out.net += bt.net;
    out.rows.push({
      date: nyDay(bt.created * 1000),
      type: isSale ? 'Stripe payment' : REFUND_BT.has(bt.type) ? 'Refund' : bt.type.includes('fee') ? 'Stripe fee' : 'Stripe ' + bt.type.replace(/_/g, ' '),
      party: names[cust]?.name || src.billing_details?.name || '',
      description: bt.description || src.description || '',
      category: isSale ? 'Card payments' : '', method: 'Stripe',
      amount: bt.amount, fee: bt.fee, net: bt.net
    });
  }
  return out;
}

async function report(/** @type {any} */ b) {
  const from = day(b.from, 'From'), to = day(b.to, 'To');
  if (to < from) throw new HttpError(400, '"To" is before "From"');
  const [sm, ent] = await Promise.all([
    stripeMoney(from, to),
    q(`select e.*, c.name as client_name from entries e left join clients c on c.id=e.client_id where e.date between $1 and $2 order by e.date, e.id`, [from, to])
  ]);
  /** @type {Record<string, number>} */ const incCat = {};
  /** @type {Record<string, number>} */ const expCat = {};
  /** @type {Record<string, {month:string, stripe:number, income:number, expenses:number}>} */ const months = {};
  const mo = (/** @type {string} */ d) => (months[d.slice(0, 7)] ||= { month: d.slice(0, 7), stripe: 0, income: 0, expenses: 0 });
  let inc = 0, exp = 0;
  const rows = sm.rows.slice();
  for (const r of sm.rows) mo(r.date).stripe += r.net;
  for (const e of ent) {
    if (e.kind === 'income') { inc += e.amount_cents; incCat[e.category] = (incCat[e.category] || 0) + e.amount_cents; mo(e.date).income += e.amount_cents; }
    else { exp += e.amount_cents; expCat[e.category] = (expCat[e.category] || 0) + e.amount_cents; mo(e.date).expenses += e.amount_cents; }
    const amt = e.kind === 'income' ? e.amount_cents : -e.amount_cents;
    rows.push({ date: e.date, type: e.kind === 'income' ? 'Income' : 'Expense', party: e.party || e.client_name || '', description: e.note || '',
      category: e.category, method: e.method || '', amount: amt, fee: 0, net: amt });
  }
  rows.sort((a, b2) => (a.date < b2.date ? -1 : a.date > b2.date ? 1 : 0));
  const list = (/** @type {Record<string,number>} */ o) => Object.entries(o).map(([category, c]) => ({ category, cents: c })).sort((a, b2) => b2.cents - a.cents);
  const incomeTotal = sm.net + inc;
  const owed = await one(`select coalesce(sum(greatest(b.amount_cents - coalesce((select sum(e.amount_cents) from entries e where e.bill_id=b.id and e.kind='expense'),0),0)),0)::bigint as n, count(*)::int as c from bills b`);
  return {
    from, to,
    bills: { owed: owed?.n || 0 },
    stripe: { gross: sm.gross, fees: sm.fees, refunds: sm.refunds, other: sm.other, net: sm.net, count: sm.count },
    income: { total: inc, byCategory: list(incCat) },
    expenses: { total: exp, byCategory: list(expCat) },
    totals: { income: incomeTotal, expenses: exp, profit: incomeTotal - exp },
    months: Object.values(months).sort((a, b2) => (a.month < b2.month ? -1 : 1)).map((m) => ({ ...m, profit: m.stripe + m.income - m.expenses })),
    rows
  };
}

// ---------- dashboard ----------
async function dashboard() {
  const today = nyDay(Date.now());
  const monthStart = today.slice(0, 8) + '01';
  const counts = await one(`select
      count(*) filter (where status='lead')::int as leads,
      count(*) filter (where status='active')::int as active,
      count(*)::int as total from clients`);
  const recentLeads = await q(`select id, name, company, email, phone, created_at from clients where status='lead' order by created_at desc limit 5`);
  const plansCount = await one(`select count(*)::int as n from plans`);
  /** @type {any} */
  const out = { today, counts, recentLeads, plans: plansCount?.n || 0, stripe: !!stripeKey() };
  const [month, extra] = await Promise.all([
    report({ from: monthStart, to: today }),
    stripeKey() ? (async () => {
      const st = stripe();
      const [open, ch, names] = await Promise.all([st.invoices.list({ status: 'open', limit: 100 }), st.charges.list({ limit: 8 }), customerNames()]);
      const inv = open.data.map((i) => mapInvoice(i, names));
      return {
        open: { count: inv.length, total: inv.reduce((s, i) => s + i.due, 0), overdue: inv.filter((i) => i.overdue).length,
          list: inv.sort((a, b) => (a.due_date || 0) - (b.due_date || 0)).slice(0, 6) },
        recent: ch.data.map((c) => mapCharge(c, names))
      };
    })() : Promise.resolve({ open: { count: 0, total: 0, overdue: 0, list: [] }, recent: [] })
  ]);
  const bl = await billsList();
  out.bills = { owed: bl.totals.owed, late: bl.totals.lateCount, list: bl.bills.filter((x) => x.left_cents > 0).slice(0, 5) };
  out.month = { income: month.totals.income, expenses: month.totals.expenses, profit: month.totals.profit, stripe_fees: month.stripe.fees };
  Object.assign(out, extra, await notificationsList());
  return out;
}

// ---------- notifications ----------
async function notificationsList() {
  const [list, n] = await Promise.all([
    q(`select n.id, n.kind, n.title, n.body, n.client_id, n.created_at, n.read_at from notifications n order by n.created_at desc limit 30`),
    one(`select count(*)::int as n from notifications where read_at is null`)
  ]);
  return { notifications: list, unread: n?.n || 0 };
}
async function notificationsRead() {
  await q(`update notifications set read_at=now() where read_at is null`);
  return { ok: true };
}

// ---------- settings, email, payment alerts ----------
const HOOK_EVENTS = /** @type {const} */ (['invoice.paid', 'invoice.payment_failed', 'checkout.session.completed', 'charge.dispute.created']);
const hookKey = () => 'sys:webhook:' + (testMode() ? 'test' : 'live');

async function alertsStatus() {
  if (!stripeKey()) return { connected: false, url: '' };
  const id = await getKV(hookKey());
  if (!id) return { connected: false, url: '' };
  try {
    const w = await stripe().webhookEndpoints.retrieve(id);
    return { connected: w.status === 'enabled', url: w.url };
  } catch (e) {
    return { connected: false, url: '' };
  }
}

async function settingsGet() {
  const [settings, alerts] = await Promise.all([getSettings(), alertsStatus()]);
  return { settings, alerts, email: { ready: emailReady(), from: fromAddress() }, stripe: !!stripeKey(), testMode: testMode() };
}

async function settingsSave(/** @type {any} */ b) {
  await saveSettings(b.settings);
  return settingsGet();
}

async function alertsConnect(/** @type {any} */ b, /** @type {any} */ req) {
  const st = needStripe();
  const base = origin(req);
  if (!/^https:\/\//.test(base) && !/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(base)) throw new HttpError(400, 'Open the admin at https://gogetterinc.com/admin to turn this on.');
  const url = base + '/api/stripe-webhook';
  const old = await getKV(hookKey());
  if (old) {
    try {
      const w = await st.webhookEndpoints.retrieve(old);
      if (w.url === url) {
        await st.webhookEndpoints.update(old, { disabled: false, enabled_events: [...HOOK_EVENTS] });
        return settingsGet();
      }
      await st.webhookEndpoints.del(old);
    } catch (e) { /* gone: make a new one */ }
  }
  const w = await st.webhookEndpoints.create({ url, enabled_events: [...HOOK_EVENTS], description: 'GO GETTER admin: payment alerts' });
  await setKV(hookKey(), w.id);
  return settingsGet();
}

async function emailTest() {
  const s = await getSettings();
  await sendEmail({ to: s.alert_email, ...testEmail(s), replyTo: s.biz_email });
  return { ok: true, to: s.alert_email };
}

export const OPS = {
  'dashboard': dashboard,
  'notifications.list': notificationsList,
  'notifications.read': notificationsRead,
  'settings.get': settingsGet,
  'settings.save': settingsSave,
  'alerts.connect': alertsConnect,
  'email.test': emailTest,
  'clients.list': clientsList,
  'clients.get': clientsGet,
  'clients.save': clientsSave,
  'clients.delete': clientsDelete,
  'activity.add': activityAdd,
  'invoices.list': invoicesList,
  'invoices.create': invoicesCreate,
  'invoices.action': invoicesAction,
  'invoices.link': invoicesLink,
  'cards.list': cardsList,
  'cards.link': cardLink,
  'cards.test': cardTest,
  'cards.remove': cardRemove,
  'charges.create': chargesCreate,
  'charges.list': chargesList,
  'charges.refund': chargesRefund,
  'plans.list': plansList,
  'plans.create': plansCreate,
  'plans.cancel': plansCancel,
  'entries.list': entriesList,
  'entries.save': entriesSave,
  'entries.delete': entriesDelete,
  'bills.list': billsList,
  'bills.get': billsGet,
  'bills.save': billsSave,
  'bills.delete': billsDelete,
  'bills.pay': billsPay,
  'report': report,
  ...PROJECT_OPS
};
