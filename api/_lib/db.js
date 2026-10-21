// @ts-check
import pg from 'pg';

// bigint -> number (cents fit easily), date -> 'YYYY-MM-DD' string (no timezone shifts)
pg.types.setTypeParser(20, (v) => parseInt(v, 10));
pg.types.setTypeParser(1082, (v) => v);

/** @type {pg.Pool | null} */
let pool = null;
/** @type {Promise<void> | null} */
let ready = null;

export function dbUrl() {
  return process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
}

function getPool() {
  if (!pool) {
    pool = new pg.Pool({ connectionString: dbUrl(), max: 3, idleTimeoutMillis: 10_000, connectionTimeoutMillis: 8_000 });
    pool.on('error', () => {});
  }
  return pool;
}

const SCHEMA = `
create table if not exists clients (
  id serial primary key,
  name text not null,
  company text,
  email text,
  phone text,
  address text,
  status text not null default 'active',
  source text,
  notes text,
  stripe_customer_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists activity (
  id serial primary key,
  client_id int references clients(id) on delete cascade,
  kind text not null default 'note',
  body text not null,
  created_at timestamptz not null default now()
);
create table if not exists entries (
  id serial primary key,
  kind text not null check (kind in ('income','expense')),
  date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  category text not null,
  party text,
  method text,
  client_id int references clients(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);
create table if not exists plans (
  id serial primary key,
  client_id int references clients(id) on delete set null,
  schedule_id text unique not null,
  title text not null,
  total_cents bigint not null,
  count int not null,
  every text not null,
  start_date date not null,
  autopay boolean not null,
  created_at timestamptz not null default now()
);
create table if not exists hits (
  kind text not null,
  ip text not null,
  at timestamptz not null default now()
);
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create table if not exists notifications (
  id serial primary key,
  kind text not null,
  title text not null,
  body text,
  client_id int references clients(id) on delete set null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);
create table if not exists events (
  id text primary key,
  created_at timestamptz not null default now()
);
create table if not exists reminders (
  invoice_id text not null,
  stage text not null,
  sent_at timestamptz not null default now(),
  primary key (invoice_id, stage)
);
create table if not exists bills (
  id serial primary key,
  vendor text not null,
  number text,
  bill_date date not null,
  due_date date,
  amount_cents bigint not null check (amount_cents > 0),
  category text not null default 'Other',
  client_id int references clients(id) on delete set null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table entries add column if not exists bill_id int references bills(id) on delete set null;
create index if not exists bills_due on bills(due_date);
create table if not exists workers (
  id serial primary key,
  name text not null,
  email text,
  phone text,
  title text,
  pay_type text not null default 'hourly',
  rate_cents bigint not null default 0,
  active boolean not null default true,
  login boolean not null default false,
  pass_hash text,
  pass_ver int not null default 0,
  perms jsonb not null default '{}'::jsonb,
  notes text,
  created_at timestamptz not null default now()
);
create unique index if not exists workers_email on workers(lower(email)) where email is not null and email <> '';
create table if not exists projects (
  id serial primary key,
  name text not null,
  client_id int references clients(id) on delete set null,
  status text not null default 'active',
  start_date date,
  due_date date,
  budget_cents bigint,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists project_workers (
  project_id int not null references projects(id) on delete cascade,
  worker_id int not null references workers(id) on delete cascade,
  pay_type text not null default 'hourly',
  rate_cents bigint not null default 0,
  primary key (project_id, worker_id)
);
create table if not exists tasks (
  id serial primary key,
  project_id int not null references projects(id) on delete cascade,
  title text not null,
  status text not null default 'todo',
  worker_id int references workers(id) on delete set null,
  due_date date,
  note text,
  created_at timestamptz not null default now(),
  done_at timestamptz
);
create table if not exists time_logs (
  id serial primary key,
  project_id int not null references projects(id) on delete cascade,
  worker_id int not null references workers(id) on delete cascade,
  date date not null,
  minutes int not null check (minutes > 0 and minutes <= 1440),
  note text,
  created_at timestamptz not null default now()
);
create table if not exists project_notes (
  id serial primary key,
  project_id int not null references projects(id) on delete cascade,
  worker_id int references workers(id) on delete set null,
  author text not null,
  body text not null,
  created_at timestamptz not null default now()
);
alter table entries add column if not exists project_id int references projects(id) on delete set null;
alter table entries add column if not exists worker_id int references workers(id) on delete set null;
alter table bills add column if not exists project_id int references projects(id) on delete set null;
alter table plans add column if not exists project_id int references projects(id) on delete set null;
alter table projects add column if not exists price_cents bigint;
create table if not exists project_links (
  stripe_id text primary key,
  kind text not null,
  project_id int not null references projects(id) on delete cascade,
  created_at timestamptz not null default now()
);
create index if not exists project_links_project on project_links(project_id);
create table if not exists trash (
  id serial primary key,
  kind text not null,
  item_id int not null,
  label text not null,
  data jsonb not null,
  deleted_by text not null default 'owner',
  deleted_at timestamptz not null default now()
);
create table if not exists audit_log (
  id serial primary key,
  at timestamptz not null default now(),
  who text not null,
  worker_id int,
  op text not null,
  summary text not null,
  link text
);
create index if not exists audit_at on audit_log(at desc);
create index if not exists audit_worker on audit_log(worker_id, at desc);
create table if not exists files (
  id serial primary key,
  name text not null,
  type text not null,
  size int not null,
  sha256 text not null,
  data bytea not null,
  entry_id int references entries(id) on delete set null,
  bill_id int references bills(id) on delete set null,
  project_id int references projects(id) on delete set null,
  uploaded_by text not null default 'owner',
  created_at timestamptz not null default now()
);
create index if not exists files_entry on files(entry_id);
create index if not exists files_bill on files(bill_id);
create index if not exists files_project on files(project_id);
alter table entries add column if not exists import_file_id int;
-- tax-ready books (f_tax): receipt or invoice number on an entry, owner money kept out of profit, 1099 vendors, year-end inventory
alter table entries add column if not exists ref text;
-- the shared tax code filters by part; GO GETTER has one part
alter table entries add column if not exists part text not null default 'devices';
alter table bills add column if not exists part text not null default 'devices';
create table if not exists owner_money (
  id serial primary key,
  kind text not null check (kind in ('contribution','draw','loan_in','loan_repay')),
  date date not null,
  amount_cents bigint not null check (amount_cents > 0),
  person text,
  method text,
  note text,
  part text not null default 'devices',
  created_at timestamptz not null default now()
);
create index if not exists owner_money_date on owner_money(date);
create table if not exists vendors (
  id serial primary key,
  name text not null,
  type text not null default 'unknown',
  needs_1099 boolean,
  w9 boolean not null default false,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists vendors_name on vendors(lower(name));
create table if not exists links (
  id serial primary key,
  name text not null,
  url text not null,
  last_sync timestamptz,
  last_file_id int,
  created_at timestamptz not null default now()
);
alter table files add column if not exists link_id int references links(id) on delete set null;
create table if not exists tax_years (
  year int not null,
  part text not null default 'devices',
  inv_begin_cents bigint,
  inv_end_cents bigint,
  note text,
  updated_at timestamptz not null default now(),
  primary key (year, part)
);
create index if not exists tasks_project on tasks(project_id);
create index if not exists time_project on time_logs(project_id, worker_id);
create index if not exists notes_project on project_notes(project_id, created_at);
create index if not exists entries_bill on entries(bill_id);
create index if not exists notifications_unread on notifications(read_at, created_at);
create index if not exists entries_date on entries(date);
create index if not exists hits_at on hits(kind, ip, at);
create index if not exists activity_client on activity(client_id, created_at);
`;

/** Run a query. Tables are created on first use. @param {string} text @param {any[]} [params] */
export async function q(text, params = []) {
  const p = getPool();
  if (!ready) ready = p.query(SCHEMA).then(() => undefined).catch((e) => { ready = null; throw e; });
  await ready;
  const r = await p.query(text, params);
  return r.rows;
}

/**
 * Run several queries as one: all of them happen, or none. fn gets a query function like q.
 * @template T @param {(tq: (text: string, params?: any[]) => Promise<any[]>) => Promise<T>} fn @returns {Promise<T>}
 */
export async function tx(fn) {
  await q('select 1');
  const c = await getPool().connect();
  try {
    await c.query('begin');
    const out = await fn(async (text, params = []) => (await c.query(text, params)).rows);
    await c.query('commit');
    return out;
  } catch (e) {
    try { await c.query('rollback'); } catch (e2) {}
    throw e;
  } finally { c.release(); }
}

/** @param {string} text @param {any[]} [params] */
export async function one(text, params = []) {
  const rows = await q(text, params);
  return rows[0] || null;
}

/** Count recent hits (login attempts, form posts) for rate limiting. @param {string} kind @param {string} ip @param {number} minutes */
export async function recentHits(kind, ip, minutes) {
  const r = await one(`select count(*)::int as n from hits where kind=$1 and ip=$2 and at > now() - ($3 || ' minutes')::interval`, [kind, ip, String(minutes)]);
  return r ? r.n : 0;
}
/** @param {string} kind @param {string} ip */
export async function addHit(kind, ip) {
  await q(`insert into hits(kind, ip) values ($1, $2)`, [kind, ip]);
  await q(`delete from hits where at < now() - interval '2 days'`);
}
/** @param {string} kind @param {string} ip */
export async function clearHits(kind, ip) {
  await q(`delete from hits where kind=$1 and ip=$2`, [kind, ip]);
}
