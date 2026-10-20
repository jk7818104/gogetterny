// @ts-check
// GET /api/file?id=123 — open an attached file. Only for people who may see what it is attached to.
import { send, HttpError } from './_lib/http.js';
import { one, dbUrl } from './_lib/db.js';
import { contextFor, whoKey } from './_lib/session.js';
import { hasSection } from './_lib/team.js';

/** @param {any} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') throw new HttpError(405, 'GET only');
    if (!dbUrl()) throw new HttpError(404, 'Not found');
    const ctx = await contextFor(req);
    if (!ctx) throw new HttpError(404, 'Not found');
    const id = Number(new URL(req.url || '/', 'http://x').searchParams.get('id'));
    if (!Number.isInteger(id) || id <= 0) throw new HttpError(404, 'Not found');
    const f = await one(`select id, name, type, data, entry_id, bill_id, project_id, uploaded_by from files where id=$1`, [id]);
    if (!f) throw new HttpError(404, 'Not found');
    if (!ctx.owner) {
      const p = /** @type {any} */ (ctx).perms;
      const ok = f.uploaded_by === whoKey(ctx) || (f.entry_id && hasSection(p, 'books', 'view')) || (f.bill_id && hasSection(p, 'bills', 'view')) || (f.project_id && p.money);
      if (!ok) throw new HttpError(404, 'Not found');
    }
    const inline = /^(application\/pdf|image\/(jpeg|png|webp|gif))$/.test(f.type);
    const safe = String(f.name).replace(/[^\w.\- ()]/g, '_');
    res.statusCode = 200;
    res.setHeader('Content-Type', f.type);
    res.setHeader('Content-Disposition', `${inline ? 'inline' : 'attachment'}; filename="${safe}"; filename*=UTF-8''${encodeURIComponent(f.name)}`);
    res.setHeader('X-Content-Type-Options', 'nosniff');
    // PDFs and photos open in the browser (their type was checked from the file's own bytes); everything else downloads
    if (!inline) res.setHeader('Content-Security-Policy', "sandbox; default-src 'none'");
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.end(f.data);
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error('file error', err);
    return send(res, 500, { error: 'Could not open the file' });
  }
}
