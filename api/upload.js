// @ts-check
// POST /api/upload — one file (PDF, Word, Excel, CSV, photo) as the raw body. Saves it and reads what it can.
import { send, HttpError } from './_lib/http.js';
import { dbUrl } from './_lib/db.js';
import { contextFor } from './_lib/session.js';
import { saveUpload, canFiles, MAX_BYTES } from './_lib/files.js';

/** @param {any} req */
async function rawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > MAX_BYTES + 1024) throw new HttpError(413, 'The file is over 4 MB');
    chunks.push(c);
  }
  return Buffer.concat(chunks);
}

/** @param {any} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') throw new HttpError(405, 'POST only');
    if (req.headers['x-gg'] !== '1') throw new HttpError(403, 'Forbidden');
    if (!dbUrl()) throw new HttpError(503, 'Connect a database first');
    const ctx = await contextFor(req);
    if (!ctx) throw new HttpError(401, 'Please sign in');
    if (!canFiles(ctx)) throw new HttpError(403, 'You don\'t have access to this');
    const name = decodeURIComponent(String(req.headers['x-file-name'] || 'file')).slice(0, 200);
    const buf = await rawBody(req);
    return send(res, 200, await saveUpload(buf, name, String(req.headers['x-file-type'] || ''), ctx));
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err instanceof HttpError) return send(res, err.status, { error: err.message });
    console.error('upload error', err);
    return send(res, 500, { error: 'Could not save the file. Try again.' });
  }
}

export const config = { api: { bodyParser: false } };
