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
