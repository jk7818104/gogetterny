// @ts-check
// Team members: who they are, what they may see and change. The owner (ADMIN_PASSWORD) can do everything.
import { one } from './db.js';
import { HttpError } from './http.js';

/** Admin sections a team member can get: none, view, or edit. */
export const SECTIONS = ['clients', 'invoices', 'payments', 'plans', 'books', 'bills', 'reports'];
const LEVELS = ['none', 'view', 'edit'];

/**
 * projects:     none | assigned (only projects they are on) | all
 * project_edit: change project name, status, dates, description
 * tasks:        none | view | own (add tasks for themselves, update their own) | all (add, assign, change, delete any)
 * time:         log their own hours
 * notes:        post updates on a project
 * money:        see project budget, costs, profit and everyone's hours
 * pay:          see their own rate, earnings and payments
 * client_info:  see which client a project is for
 */
export const PRESETS = {
  worker: { projects: 'assigned', project_edit: false, tasks: 'own', time: true, notes: true, money: false, pay: true, client_info: false, sections: {} },
  manager: { projects: 'all', project_edit: true, tasks: 'all', time: true, notes: true, money: true, pay: true, client_info: true,
    sections: { clients: 'view', invoices: 'view', bills: 'view' } },
  bookkeeper: { projects: 'all', project_edit: false, tasks: 'view', time: false, notes: false, money: true, pay: true, client_info: true,
    sections: { clients: 'view', invoices: 'view', payments: 'view', plans: 'view', books: 'edit', bills: 'edit', reports: 'view' } }
};

/** Clean whatever the screen sent into a valid permission set. @param {any} p */
export function normPerms(p) {
  p = p && typeof p === 'object' ? p : {};
  const pick = (/** @type {any} */ v, /** @type {string[]} */ ok, /** @type {string} */ d) => ok.includes(v) ? v : d;
  /** @type {Record<string, string>} */
  const sections = {};
  for (const s of SECTIONS) {
    const v = pick(p.sections && p.sections[s], LEVELS, 'none');
    if (v !== 'none') sections[s] = v;
  }
  return {
    projects: pick(p.projects, ['none', 'assigned', 'all'], 'assigned'),
    project_edit: !!p.project_edit,
    tasks: pick(p.tasks, ['none', 'view', 'own', 'all'], 'own'),
    time: !!p.time,
    notes: !!p.notes,
    money: !!p.money,
    pay: !!p.pay,
    client_info: !!p.client_info,
    sections
  };
}

/** Ops tied to an admin section, and the level they need. */
const SECTION_OPS = {
  'clients.list': ['clients', 'view'], 'clients.get': ['clients', 'view'], 'clients.save': ['clients', 'edit'], 'clients.delete': ['clients', 'edit'], 'activity.add': ['clients', 'edit'],
  'invoices.list': ['invoices', 'view'], 'invoices.create': ['invoices', 'edit'], 'invoices.action': ['invoices', 'edit'], 'invoices.link': ['invoices', 'edit'],
  'charges.list': ['payments', 'view'], 'charges.create': ['payments', 'edit'], 'charges.refund': ['payments', 'edit'],
  'cards.list': ['payments', 'view'], 'cards.link': ['payments', 'edit'], 'cards.test': ['payments', 'edit'], 'cards.remove': ['payments', 'edit'],
  'plans.list': ['plans', 'view'], 'plans.create': ['plans', 'edit'], 'plans.cancel': ['plans', 'edit'],
  'entries.list': ['books', 'view'], 'entries.save': ['books', 'edit'], 'entries.delete': ['books', 'edit'], 'entries.bulk': ['books', 'edit'],
  'bills.list': ['bills', 'view'], 'bills.get': ['bills', 'view'], 'bills.save': ['bills', 'edit'], 'bills.delete': ['bills', 'edit'], 'bills.pay': ['bills', 'edit'],
  'report': ['reports', 'view'],
  'import.preview': ['books', 'edit'], 'import.commit': ['books', 'edit'], 'import.undo': ['books', 'edit'], 'import.list': ['books', 'view'],
  'workers.pay': ['books', 'edit'],
  'tax.summary': ['reports', 'view'], 'tax.owner.save': ['books', 'edit'], 'tax.owner.delete': ['books', 'edit'], 'tax.vendor.save': ['books', 'edit'],
  'tax.year.save': ['books', 'edit'], 'tax.map.save': ['books', 'edit'],
  'links.list': ['books', 'view'], 'links.save': ['books', 'edit'], 'links.delete': ['books', 'edit'], 'links.sync': ['books', 'edit']
};
/** Ops that check the member's project rights themselves. */
/** Ops that check rights themselves, whatever is switched on. */
const SELF_OPS = new Set(['files.list', 'files.attach', 'files.delete', 'trash.restore']);
const PROJECT_OPS = new Set(['me.home', 'projects.list', 'projects.get', 'projects.save', 'tasks.save', 'tasks.delete', 'time.save', 'time.delete', 'notes.add', 'team.names']);

/** @param {any} perms @param {string} section @param {'view'|'edit'} need */
export function hasSection(perms, section, need) {
  const lv = perms.sections[section] || 'none';
  return need === 'view' ? lv !== 'none' : lv === 'edit';
}

/**
 * May this member run this op? Feature switches apply too.
 * @param {any} ctx @param {string} op @param {any} settings
 */
export function allowed(ctx, op, settings) {
  if (ctx.owner) return true;
  const p = ctx.perms;
  if (SELF_OPS.has(op)) return true;
  if (PROJECT_OPS.has(op)) return !!settings.f_projects || op === 'me.home';
  const need = /** @type {any} */ (SECTION_OPS)[op];
  if (!need) return false;   // settings, team, alerts, dashboard: owner only
  const feature = { payments: 'f_payments', plans: 'f_plans', books: 'f_books', bills: 'f_bills', reports: 'f_reports' }[/** @type {string} */ (need[0])];
  if (op.startsWith('import.') && settings.f_import === false) return false;
  if (op.startsWith('tax.') && settings.f_tax === false) return false;
  if (op.startsWith('links.') && settings.f_links === false) return false;
  if (feature && settings[feature] === false) return false;
  return hasSection(p, need[0], need[1]);
}

/** Load the signed-in member, or throw 401 if they were switched off or their password changed. @param {{w: number, v: number}} s @param {any} settings */
export async function memberFor(s, settings) {
  if (!settings.team_login) throw new HttpError(401, 'Team sign-in is switched off');
  const w = await one(`select id, name, email, title, pay_type, rate_cents, active, login, pass_ver, perms from workers where id=$1`, [s.w]);
  if (!w || !w.active || !w.login || w.pass_ver !== s.v) throw new HttpError(401, 'Please sign in');
  return { owner: false, worker: w, perms: normPerms(w.perms) };
}

/** What the screen needs to know about who is signed in. @param {any} ctx @param {any} settings */
export function meFor(ctx, settings) {
  if (ctx.owner) return { role: 'owner' };
  const f = {};
  for (const k of ['f_bulk', 'f_uploads', 'f_import', 'f_pack', 'f_trash', 'f_projects', 'f_time', 'f_payments', 'f_plans', 'f_books', 'f_bills', 'f_reports', 'f_cards', 'f_discounts', 'f_fields', 'f_cc', 'f_ach', 'f_reminders', 'f_tax', 'f_qb', 'f_links'])
    /** @type {any} */ (f)[k] = settings[k];
  return { role: 'member', id: ctx.worker.id, name: ctx.worker.name, title: ctx.worker.title || '', perms: ctx.perms, features: f, biz_name: settings.biz_name };
}
