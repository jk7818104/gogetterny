// @ts-check
// Deleting puts things in the Trash first, so they can be brought back (Undo).
// The item, everything that belongs only to it, and every link to it are saved; restore puts it all back.
import { q, one, tx } from './db.js';
import { HttpError, intId } from './http.js';
import { whoKey } from './session.js';

/** table, rows that belong to it (deleted with it), and rows that only point to it (link cleared) */
const KINDS = {
  entry: { table: 'entries', children: [], refs: [['files', 'entry_id']] },
  bill: { table: 'bills', children: [], refs: [['entries', 'bill_id'], ['files', 'bill_id']] },
  client: { table: 'clients', children: [['activity', 'client_id']],
    refs: [['entries', 'client_id'], ['plans', 'client_id'], ['projects', 'client_id'], ['bills', 'client_id'], ['notifications', 'client_id']] },
  project: { table: 'projects', children: [['tasks', 'project_id'], ['time_logs', 'project_id'], ['project_notes', 'project_id'], ['project_workers', 'project_id'], ['project_links', 'project_id']],
    refs: [['entries', 'project_id'], ['bills', 'project_id'], ['plans', 'project_id'], ['files', 'project_id']] },
  task: { table: 'tasks', children: [], refs: [] },
  time: { table: 'time_logs', children: [], refs: [] },
  worker: { table: 'workers', children: [['project_workers', 'worker_id'], ['time_logs', 'worker_id']],
    refs: [['tasks', 'worker_id'], ['project_notes', 'worker_id'], ['entries', 'worker_id']] }
};
const NAMES = { entry: 'Books entry', bill: 'Bill', client: 'Client', project: 'Project', task: 'Task', time: 'Hours', worker: 'Team member' };

/**
 * Move one item to the Trash. Returns the trash id, or null if it was already gone.
 * @param {keyof typeof KINDS} kind @param {number} id @param {string} label @param {any} ctx
 */
export async function trashDelete(kind, id, label, ctx) {
  const k = KINDS[kind];
  return tx(async (tq) => {
    const [row] = await tq(`select * from ${k.table} where id=$1 for update`, [id]);
    if (!row) return null;
    /** @type {Record<string, any[]>} */ const children = {};
    for (const [t, c] of k.children) children[t + '.' + c] = await tq(`select * from ${t} where ${c}=$1`, [id]);
    /** @type {Record<string, number[]>} */ const refs = {};
    for (const [t, c] of k.refs) refs[t + '.' + c] = (await tq(`select id from ${t} where ${c}=$1`, [id])).map((r) => r.id);
    const [t] = await tq(`insert into trash(kind, item_id, label, data, deleted_by) values ($1,$2,$3,$4::jsonb,$5) returning id`,
      [kind, id, label.slice(0, 200), JSON.stringify({ row, children, refs }), whoKey(ctx)]);
    await tq(`delete from ${k.table} where id=$1`, [id]);
    return t.id;
  });
}

/** Bring one item back. Team members can only undo their own deletes. @param {number} trashId @param {any} ctx */
async function restoreOne(trashId, ctx) {
  const t = await one(`select * from trash where id=$1`, [trashId]);
  if (!t) throw new HttpError(404, 'Already restored or gone for good');
  if (!ctx.owner && t.deleted_by !== whoKey(ctx)) throw new HttpError(403, 'Only the owner can restore this');
  const k = KINDS[/** @type {keyof typeof KINDS} */ (t.kind)];
  if (!k) throw new HttpError(400, 'Unknown item');
  const { row, children, refs } = t.data;
  try {
    await tx(async (tq) => {
      await tq(`insert into ${k.table} select * from jsonb_populate_record(null::${k.table}, $1::jsonb)`, [JSON.stringify(row)]);
      for (const [key, rows] of Object.entries(children || {})) {
        const table = key.split('.')[0];
        for (const r of /** @type {any[]} */ (rows)) await tq(`insert into ${table} select * from jsonb_populate_record(null::${table}, $1::jsonb) on conflict do nothing`, [JSON.stringify(r)]);
      }
      for (const [key, ids] of Object.entries(refs || {})) {
        const [table, col] = key.split('.');
        if (/** @type {any[]} */ (ids).length) await tq(`update ${table} set ${col}=$1 where id = any($2::int[]) and ${col} is null`, [t.item_id, ids]);
      }
      await tq(`delete from trash where id=$1`, [t.id]);
    });
  } catch (e) {
    if (/** @type {any} */ (e).code === '23505') throw new HttpError(400, `Can't restore "${t.label}": something with the same id or email exists now`);
    if (/** @type {any} */ (e).code === '23503') throw new HttpError(400, `Can't restore "${t.label}": what it belonged to is gone (restore that first)`);
    throw e;
  }
  return t;
}

async function trashRestore(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const ids = (Array.isArray(b.ids) ? b.ids : [b.id]).slice(0, 200).map(intId);
  const labels = [];
  // newest first, so a project comes back before the hours that were deleted before it
  for (const id of ids.sort((x, y) => y - x)) labels.push((await restoreOne(id, ctx)).label);
  return { ok: true, label: labels.length === 1 ? labels[0] : `${labels.length} items` };
}

async function trashList(/** @type {any} */ b, /** @type {any} */ req, /** @type {any} */ ctx) {
  const rows = await q(`select t.id, t.kind, t.item_id, t.label, t.deleted_by, t.deleted_at, w.name as member_name
    from trash t left join workers w on t.deleted_by = 'member:' || w.id order by t.deleted_at desc limit 500`);
  return { items: rows.map((r) => ({ ...r, kind_name: NAMES[/** @type {keyof typeof NAMES} */ (r.kind)] || r.kind, by: r.deleted_by === 'owner' ? 'You' : r.member_name || 'Team member' })) };
}

async function trashPurge(/** @type {any} */ b) {
  if (b.all) await q(`delete from trash`);
  else await q(`delete from trash where id = any($1::int[])`, [(Array.isArray(b.ids) ? b.ids : [b.id]).map(intId)]);
  await purgeOrphanFiles();
  return { ok: true };
}

/** Daily: things in the Trash for more than 30 days are deleted for good. */
export async function purgeOldTrash() {
  await q(`delete from trash where deleted_at < now() - interval '30 days'`);
  await purgeOrphanFiles();
}
/** Files whose entry or bill is gone for good (not in the Trash) */
async function purgeOrphanFiles() {
  await q(`delete from files f where f.entry_id is null and f.bill_id is null and f.project_id is null and f.created_at < now() - interval '2 days'
    and not exists (select 1 from trash t where t.data->'refs'->'files.entry_id' @> to_jsonb(f.id) or t.data->'refs'->'files.bill_id' @> to_jsonb(f.id) or t.data->'refs'->'files.project_id' @> to_jsonb(f.id))`);
}

export const TRASH_OPS = { 'trash.list': trashList, 'trash.restore': trashRestore, 'trash.purge': trashPurge };
