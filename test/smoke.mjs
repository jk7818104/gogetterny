// Check of the Taxes, QuickBooks and linked-sheet parts of the admin against a real Postgres, with a stand-in for Stripe and email.
//   TEST_DATABASE_URL=postgres://user:pass@localhost:5432/gg_test npm test
// The test database is WIPED first. Never point this at the real one.
import assert from 'node:assert/strict';
import pg from 'pg';

const url = process.env.TEST_DATABASE_URL;
if (!url) { console.error('Set TEST_DATABASE_URL to an empty Postgres database (it gets wiped).'); process.exit(1); }
const wipe = new pg.Client({ connectionString: url });
await wipe.connect();
await wipe.query('drop schema public cascade; create schema public');
await wipe.end();

process.env.DATABASE_URL = url;
process.env.ADMIN_PASSWORD = 'owner-pass-123';
delete process.env.STRIPE_SECRET_KEY; delete process.env.RESEND_API_KEY; delete process.env.CRON_SECRET; delete process.env.SITE_URL;

const { default: admin } = await import('../api/admin.js');
const { default: exportApi } = await import('../api/export.js');

let passed = 0;
async function test(name, fn) {
  try { await fn(); passed++; console.log('  ok  ' + name); }
  catch (e) { console.log('  FAIL ' + name); console.error(e); process.exitCode = 1; }
}
function request(method, path, { body, cookie } = {}) {
  return { method, url: path, body, headers: { host: 'localhost', 'x-gg': '1', ...(cookie ? { cookie } : {}) }, socket: { remoteAddress: '127.0.0.1' } };
}
async function hit(handler, rq) {
  const rs = { statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; }, end(b) { this.body = b; } };
  await handler(rq, rs);
  return rs;
}
async function raw(name, args = {}, cookie = owner) {
  const rs = await hit(admin, request('POST', '/api/admin', { body: { op: name, ...args }, cookie }));
  return { status: rs.statusCode, data: JSON.parse(rs.body), headers: rs.headers };
}
async function op(name, args = {}, cookie = owner) {
  const r = await raw(name, args, cookie);
  assert.equal(r.status, 200, `${name}: ${r.status} ${JSON.stringify(r.data)}`);
  return r.data;
}
async function fails(name, args, cookie = owner) {
  const r = await raw(name, args, cookie);
  assert.notEqual(r.status, 200, `${name} should fail`);
  return r;
}
const today = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/New_York' }).format(new Date());
let owner = '';
console.log('GO GETTER admin: taxes, QuickBooks, linked sheets');
const ok = await raw('login', { password: 'owner-pass-123' }, '');
owner = String(ok.headers['set-cookie']).split(';')[0];

await test('taxes: owner money stays out of profit, tax lines, inventory, 1099 check, missing receipts', async () => {
  const y = Number(today().slice(0, 4)) - 1;
  const d = (md) => `${y}-${md}`;
  await op('entries.save', { kind: 'expense', date: d('02-01'), amount_cents: 300000, category: 'Hardware & inventory', party: 'Wintouch', method: 'Bank transfer', ref: 'PI-77' });
  await op('entries.save', { kind: 'expense', date: d('03-01'), amount_cents: 70000, category: 'Contractors & developers', party: 'Yakov Greenbaum', method: 'Zelle' });
  await op('entries.save', { kind: 'expense', date: d('03-02'), amount_cents: 90000, category: 'Contractors & developers', party: 'Upwork', method: 'Card' });
  await op('entries.save', { kind: 'expense', date: d('04-01'), amount_cents: 4500, category: 'Other', party: 'Misc' });
  await op('entries.save', { kind: 'income', date: d('05-01'), amount_cents: 500000, category: 'Hardware sales', party: 'Client', method: 'Check' });
  await op('tax.owner.save', { kind: 'contribution', date: d('01-05'), amount_cents: 1000000, person: 'Owner', method: 'Bank transfer' });
  await op('tax.owner.save', { kind: 'draw', date: d('06-05'), amount_cents: 200000, person: 'Owner' });
  let t = await op('tax.summary', { year: y });
  assert.equal(t.income, 500000);
  assert.equal(t.owner.totals.contribution, 1000000);
  assert.equal(t.cogs.purchases, 300000);
  assert.equal(t.cogs.entered, false);
  const yg = t.vendors.find((v) => v.name === 'Yakov Greenbaum');
  assert.equal(yg.needs_1099, true);
  assert.equal(t.vendors.find((v) => v.name === 'Upwork').needs_1099, false, 'card payments are left out');
  assert.ok(t.checks.find((c) => c.key === 'receipts').count >= 3);
  assert.equal(t.checks.find((c) => c.key === 'other').count, 1);
  // owner money is not in the profit and loss
  const rep = await op('report', { from: d('01-01'), to: d('12-31') });
  assert.equal(rep.totals.income, 500000);
  await op('tax.year.save', { year: y, inv_begin_cents: 0, inv_end_cents: 100000 });
  await op('tax.vendor.save', { name: 'yakov greenbaum', type: 'individual', w9: true });
  await op('tax.vendor.save', { name: 'Wintouch', type: 'foreign' });
  await op('tax.map.save', { map: { 'Other': 'Not deductible' } });
  t = await op('tax.summary', { year: y });
  assert.equal(t.cogs.total, 200000);
  assert.equal(t.vendors.find((v) => v.name === 'Yakov Greenbaum').w9, true);
  assert.ok(t.checks.find((c) => c.key === 'w9').ok && t.checks.find((c) => c.key === 'inventory').ok);
  assert.equal((await op('tax.summary', { year: y + 1 })).cogs.begin, 100000, "Dec 31 becomes next year's Jan 1");
  assert.ok(t.expenses.byLine.find((l) => l.line === 'Not deductible'));
  // the accountant decides: one entry as equipment, a whole category for later
  const eq = await op('entries.save', { kind: 'expense', date: d('07-01'), amount_cents: 150000, category: 'Hardware & inventory', party: 'Dell', method: 'Card', tax_line: 'Equipment (fixed asset)' });
  const loan = await op('entries.save', { kind: 'income', date: d('07-02'), amount_cents: 250000, category: 'Other income', party: 'Bank loan', method: 'Bank transfer' });
  await fails('entries.save', { kind: 'income', date: d('07-02'), amount_cents: 1, category: 'Other income', party: 'x', tax_line: 'Advertising' });
  let t2 = await op('tax.summary', { year: y });
  assert.equal(t2.cogs.purchases, 300000, 'equipment is not cost of goods');
  assert.equal(t2.balance.find((l) => l.line === 'Equipment (fixed asset)').out, 150000);
  await op('entries.bulk', { ids: [loan.id], tax_line: 'Loan received (liability)' });
  await op('tax.map.save', { map: { 'Travel': 'Accountant to decide' } });
  await op('entries.save', { kind: 'expense', date: d('07-03'), amount_cents: 9900, category: 'Travel', party: 'Airline', method: 'Card' });
  t2 = await op('tax.summary', { year: y });
  assert.equal(t2.income, 500000, 'a loan is not income');
  assert.equal(t2.balance.find((l) => l.line === 'Loan received (liability)').in, 250000);
  assert.equal(t2.checks.find((c) => c.key === 'review').count, 1);
  assert.equal(t2.missing.review[0].party, 'Airline');
  await fails('tax.map.save', { map: { 'in:Other income': 'Advertising' } });
  await op('tax.map.save', { map: { 'Travel': 'Travel' } });
  const light = await op('tax.summary', { year: y, light: true });
  assert.ok(light.ready && !light.vendors);
  await fails('tax.owner.save', { kind: 'gift', date: d('01-01'), amount_cents: 1 });
  // switched off = gone
  await op('settings.save', { settings: { f_tax: false } });
  const pack = await hit(exportApi, request('GET', '/api/export?year=' + y, { cookie: owner }));
  assert.equal(pack.statusCode, 200);
  await op('settings.save', { settings: { f_tax: true, h_bills: false } });
  assert.equal((await op('settings.get')).settings.h_bills, false);
  const pack2 = await hit(exportApi, request('GET', '/api/export?year=' + y, { cookie: owner }));
  assert.equal(pack2.statusCode, 200, String(pack2.body));
  const ExcelJS = (await import('exceljs')).default;
  const wb = new ExcelJS.Workbook(); await wb.xlsx.load(pack2.body);
  for (const n of ['Tax summary', 'Owner money', '1099 check', 'Missing receipts']) assert.ok(wb.getWorksheet(n), n);
});

await test('QuickBooks files: balanced IIF for Desktop and journal CSV for Online', async () => {
  const y = Number(today().slice(0, 4)) - 1;
  const iif = await hit(exportApi, request('GET', `/api/export?year=${y}&format=iif`, { cookie: owner }));
  assert.equal(iif.statusCode, 200, String(iif.body));
  const text = String(iif.body);
  assert.ok(text.startsWith('!ACCNT'));
  assert.ok(text.includes('Owner contributions\tEQUITY') && text.includes('Cost of goods sold\tCOGS') && text.includes('Equipment\tFIXASSET') && text.includes('Loans payable\tLTLIAB'));
  // every transaction adds up to zero
  let sum = 0, n = 0;
  for (const line of text.split('\r\n')) {
    const c = line.split('\t');
    if (c[0] === 'TRNS' || c[0] === 'SPL') sum += Math.round(Number(c[7]) * 100);
    if (c[0] === 'ENDTRNS') { assert.equal(sum, 0, 'unbalanced'); sum = 0; n++; }
  }
  assert.ok(n >= 7, 'transactions: ' + n);
  const qbo = await hit(exportApi, request('GET', `/api/export?year=${y}&format=qbo`, { cookie: owner }));
  assert.equal(qbo.statusCode, 200);
  assert.ok(String(qbo.body).startsWith('Journal No,Journal Date,Account Name,Debits,Credits'));
  const acc = await hit(exportApi, request('GET', `/api/export?year=${y}&format=qbo-accounts`, { cookie: owner }));
  assert.ok(String(acc.body).includes('Owner draws,Equity'));
  await op('settings.save', { settings: { f_qb: false } });
  assert.equal((await hit(exportApi, request('GET', `/api/export?year=${y}&format=iif`, { cookie: owner }))).statusCode, 403);
  await op('settings.save', { settings: { f_qb: true } });
  // and a QuickBooks .iif file can be read back in, like a bank statement
  const { saveUpload } = await import('../api/_lib/files.js');
  const up = await saveUpload(Buffer.from(text), 'books.iif', '', { owner: true, settings: (await op('settings.get')).settings });
  assert.ok(up.table && up.table.count >= 5);
  const pv = await op('import.preview', { file_id: up.file.id });
  assert.ok(pv.rows.some((r) => r.status === 'in_books'), 'rows already in Books are found');
});

await test('linked sheets and the live feed link', async () => {
  const { directUrl } = await import('../api/_lib/links.js');
  assert.equal(directUrl('https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/edit#gid=77'), 'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/export?format=csv&gid=77');
  assert.ok(directUrl('https://www.dropbox.com/s/x/a.csv?dl=0').endsWith('dl=1'));
  await fails('links.save', { name: 'x', url: 'http://example.com/a.csv' });
  await fails('links.save', { name: 'x', url: 'https://127.0.0.1/a.csv' });
  const realFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response('Date,Description,Amount\n2025-03-03,Staples,-12.50\n2025-03-04,Client check,400\n', { status: 200, headers: { 'content-type': 'text/csv' } });
  try {
    const l = await op('links.save', { name: 'Office sheet', url: 'https://docs.google.com/spreadsheets/d/1AbCdEfGhIjKlMnOpQrStUvWxYz012345/edit' });
    const up = await op('links.sync', { id: l.id });
    assert.equal(up.table.count, 2);
    const pv = await op('import.preview', { file_id: up.file.id });
    await op('import.commit', { file_id: up.file.id, rows: pv.rows.filter((r) => r.status === 'new') });
    const list = await op('links.list');
    assert.equal(list.links[0].rows_in_books, 2);
    globalThis.fetch = async () => new Response('<!doctype html><html>Sign in</html>', { status: 200 });
    await fails('links.sync', { id: l.id });
  } finally { globalThis.fetch = realFetch; }
  // live feed: only with the secret
  assert.equal((await hit(exportApi, request('GET', '/api/export?feed=nope&what=books'))).statusCode, 404);
  const { token } = await op('feed.key');
  const f = await hit(exportApi, request('GET', `/api/export?feed=${token}&what=books&year=2025`));
  assert.equal(f.statusCode, 200, String(f.body));
  assert.ok(String(f.body).startsWith('Date,Type,Category,Tax line') && String(f.body).includes('Staples'));
  const ft = await hit(exportApi, request('GET', `/api/export?feed=${token}&what=tax&year=2025`));
  assert.ok(String(ft.body).includes('Cost of goods sold'));
  await op('feed.off');
  assert.equal((await hit(exportApi, request('GET', `/api/export?feed=${token}&what=books`))).statusCode, 404);
});

await test('CC processing: charge a saved card off-session and refuse a charge without a card', async () => {
  process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
  const paymentCalls = [];
  let hasCard = true;
  globalThis.__ggStripe = {
    customers: {
      create: async () => ({ id: 'cus_mock_123' }),
      listPaymentMethods: async () => ({ data: hasCard ? [{ id: 'pm_mock_123', customer: 'cus_mock_123', card: { brand: 'visa', last4: '4242', exp_month: 12, exp_year: 2030 } }] : [] })
    },
    paymentIntents: {
      create: async (params) => { paymentCalls.push(params); return { id: 'pi_mock_123', status: 'succeeded' }; }
    }
  };
  try {
    const client = await op('clients.save', { name: 'CC regression test', email: 'cc-regression@example.com' });
    const result = await op('charges.create', { client_id: client.id, amount_cents: 1250, description: 'Automated regression test' });
    assert.equal(result.ok, true);
    assert.equal(result.status, 'succeeded');
    assert.equal(paymentCalls.length, 1);
    assert.equal(paymentCalls[0].amount, 1250);
    assert.equal(paymentCalls[0].currency, 'usd');
    assert.equal(paymentCalls[0].customer, 'cus_mock_123');
    assert.equal(paymentCalls[0].payment_method, 'pm_mock_123');
    assert.equal(paymentCalls[0].off_session, true);
    assert.equal(paymentCalls[0].confirm, true);

    hasCard = false;
    await fails('charges.create', { client_id: client.id, amount_cents: 1250, description: 'Must not be charged' });
    assert.equal(paymentCalls.length, 1, 'a missing saved card must not call Stripe to charge');
  } finally {
    delete globalThis.__ggStripe;
    delete process.env.STRIPE_SECRET_KEY;
  }
});

console.log(passed + ' passed' + (process.exitCode ? ', some FAILED' : ''));
process.exit();
