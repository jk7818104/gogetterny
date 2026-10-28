// @ts-check
// Linked sheets: a Google Sheet, an Excel file online or any CSV link is saved here once.
// "Get new rows" reads it again and opens the same import as a bank statement (rows already in Books are marked).
// The other way: a secret feed link that Google Sheets (=IMPORTDATA) or Excel (Data → From Web) reads live.
import crypto from 'node:crypto';
import { q, one } from './db.js';
import { HttpError, str, intId } from './http.js';
import { getKV, setKV } from './settings.js';
import { saveUpload, MAX_BYTES } from './files.js';

/** The link that gives the file itself, for the sites people use. @param {string} url */
export function directUrl(url) {
  let u;
  try { u = new URL(String(url || '').trim()); } catch (e) { throw new HttpError(400, 'Paste the full link, starting with https://'); }
  if (u.protocol !== 'https:') throw new HttpError(400, 'The link must start with https://');
  const host = u.hostname.toLowerCase();
  if (u.username || u.password || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.test') ||
      /^[\d.]+$/.test(host) || host.includes(':') || host.endsWith('.local') || host.endsWith('.internal')) {
    throw new HttpError(400, 'This link can\'t be used');
  }
  // Google Sheets: the sheet as CSV (the tab that was open when the link was copied)
  const g = /^\/spreadsheets\/d\/([\w-]{20,})/.exec(u.pathname);
  if (host === 'docs.google.com' && g && g[1] !== 'e') {
    const gid = /gid=(\d+)/.exec(u.hash + '&' + u.search);
    return `https://docs.google.com/spreadsheets/d/${g[1]}/export?format=csv${gid ? '&gid=' + gid[1] : ''}`;
  }
  // Google Sheets "Publish to the web"
  if (host === 'docs.google.com' && /^\/spreadsheets\/d\/e\//.test(u.pathname)) {
    u.pathname = u.pathname.replace(/\/pub(html)?$/, '/pub');
    u.searchParams.set('output', 'csv');
    return u.toString();
  }
  // Dropbox: the file, not the preview page
  if (/(^|\.)dropbox\.com$/.test(host)) { u.searchParams.set('dl', '1'); return u.toString(); }
  // OneDrive / SharePoint (Excel online): ask for the download
  if (/(^|\.)(1drv\.ms|onedrive\.live\.com|sharepoint\.com)$/.test(host) && !u.searchParams.has('download')) { u.searchParams.set('download', '1'); return u.toString(); }
  return u.toString();
}

/** Read the linked file (at most 4 MB, 20 seconds). @param {string} url */
export async function fetchLinked(url) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), 20_000);
  try {
    // Do not follow redirects automatically: validate every redirect target first.
    let target = directUrl(url);
    let r;
    for (let hop = 0; hop <= 5; hop++) {
      r = await fetch(target, {
        redirect: 'manual',
        signal: ctl.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (admin linked sheet)' }
      });
      if (![301, 302, 303, 307, 308].includes(r.status)) break;
      const location = r.headers.get('location');
      if (r.body) await r.body.cancel().catch(() => {});
      if (!location) throw new HttpError(400, 'The linked file returned an invalid redirect');
      if (hop === 5) throw new HttpError(400, 'The linked file redirected too many times');
      let next;
      try { next = new URL(location, target).toString(); }
      catch { throw new HttpError(400, 'The linked file returned an invalid redirect'); }
      target = directUrl(next);
    }
    if (!r) throw new HttpError(400, 'The linked file could not be reached');
    if (r.status === 401 || r.status === 403 || r.status === 404) throw new HttpError(400, 'The sheet could not be opened. Share it as "Anyone with the link can view" and try again.');
    if (!r.ok) throw new HttpError(400, `The link answered with an error (${r.status}). Check it and try again.`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length > MAX_BYTES) throw new HttpError(413, 'The sheet is over 4 MB. Link a smaller tab, or one year at a time.');
    const head = buf.subarray(0, 300).toString('utf8').toLowerCase();
    if (/<!doctype html|<html/.test(head)) throw new HttpError(400, 'The link opens a web page, not the sheet. Share it as "Anyone with the link can view", or use File → Download / Publish to the web → CSV.');
    return { buf, type: r.headers.get('content-type') || '' };
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(400, /** @type {any} */ (e).name === 'AbortError' ? 'The link took too long to answer' : 'The link could not be reached');
  } finally { clearTimeout(t); }
}

async function linksList() {
  return { links: await q(`select l.*, (select count(*) from entries e where e.import_file_id in (select f.id from files f where f.link_id=l.id))::int as rows_in_books from links l order by l.name`) };
}

async function linksSave(/** @type {any} */ b) {
  const name = str(b.name, 80);
  const url = str(b.url, 1000);
  if (!name) throw new HttpError(400, 'Give the link a name, like "Bizmo expenses sheet"');
  directUrl(url);
  if (b.id) {
    const r = await one(`update links set name=$1, url=$2 where id=$3 returning id`, [name, url, intId(b.id)]);
    if (!r) throw new HttpError(404, 'Link not found');
    return { id: r.id };
  }
  const r = await one(`insert into links(name, url) values ($1,$2) returning id`, [name, url]);
  return { id: r.id };
}

async function linksDelete(/** @type {any} */ b) {
  await q(`delete from links where id=$1`, [intId(b.id)]);
  return { ok: true };
}

/** Read the link now and get it ready to import. @param {any} b @param {any} req @param {any} ctx */
async function linksSync(b, req, ctx) {
  const l = await one(`select * from links where id=$1`, [intId(b.id)]);
  if (!l) throw new HttpError(404, 'Link not found');
  const { buf, type } = await fetchLinked(l.url);
  const ext = /spreadsheetml/.test(type) ? 'xlsx' : /ms-excel/.test(type) ? 'xls' : 'csv';
  const up = await saveUpload(buf, `${l.name} ${new Date().toISOString().slice(0, 10)}.${ext}`, type, ctx);
  await q(`update files set link_id=$1 where id=$2`, [l.id, up.file.id]);
  await q(`update links set last_sync=now(), last_file_id=$1 where id=$2`, [up.file.id, l.id]);
  if (!up.table) throw new HttpError(400, 'The sheet was read, but no dates and amounts were found in it. It needs a Date column and an Amount (or Debit / Credit) column.');
  return up;
}

// ---------- the live feed for Google Sheets and Excel ----------
async function feedKey() {
  const token = crypto.randomBytes(24).toString('base64url');
  await setKV('sys:feed', { hash: crypto.createHash('sha256').update(token).digest('hex'), created: new Date().toISOString(), last4: token.slice(-4) });
  return { token };
}
async function feedOff() {
  await q(`delete from settings where key='sys:feed'`);
  return { ok: true };
}
export async function feedInfo() {
  const f = await getKV('sys:feed');
  return f ? { on: true, created: f.created, last4: f.last4 } : { on: false };
}
/** Is this the feed's secret? @param {string} token */
export async function feedOk(token) {
  const f = await getKV('sys:feed');
  if (!f || !token) return false;
  const a = Buffer.from(crypto.createHash('sha256').update(String(token)).digest('hex'));
  const b2 = Buffer.from(String(f.hash));
  return a.length === b2.length && crypto.timingSafeEqual(a, b2);
}

export const LINK_OPS = {
  'links.list': linksList, 'links.save': linksSave, 'links.delete': linksDelete, 'links.sync': linksSync,
  'feed.key': feedKey, 'feed.off': feedOff
};
