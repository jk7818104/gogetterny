// @ts-check
/** Small helpers for plain Node (req, res) handlers, as Vercel runs them. */

/** @param {import('http').IncomingMessage & {body?: any}} req */
export async function readJson(req) {
  if (req.body !== undefined && req.body !== null && req.body !== '') {
    if (typeof req.body === 'string') return safeParse(req.body);
    if (Buffer.isBuffer(req.body)) return safeParse(req.body.toString('utf8'));
    return req.body;
  }
  const chunks = [];
  let size = 0;
  for await (const c of req) {
    size += c.length;
    if (size > 200_000) throw new HttpError(413, 'Request too large');
    chunks.push(c);
  }
  return safeParse(Buffer.concat(chunks).toString('utf8'));
}

function safeParse(s) {
  if (!s) return {};
  try { return JSON.parse(s); } catch { throw new HttpError(400, 'Bad JSON'); }
}

export class HttpError extends Error {
  /** @param {number} status @param {string} message */
  constructor(status, message) { super(message); this.status = status; }
}

/** @param {import('http').ServerResponse} res @param {number} status @param {any} data @param {Record<string,string|string[]>} [headers] */
export function send(res, status, data, headers = {}) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Robots-Tag', 'noindex');
  for (const [k, v] of Object.entries(headers)) res.setHeader(k, v);
  res.end(JSON.stringify(data));
}

/** @param {import('http').IncomingMessage} req */
export function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  const first = (Array.isArray(xf) ? xf[0] : xf || '').split(',')[0].trim();
  return first || req.socket?.remoteAddress || 'unknown';
}

/** Public origin of this request, e.g. https://gogetterinc.com @param {import('http').IncomingMessage} req */
export function origin(req) {
  const h = req.headers;
  const host = String(h['x-forwarded-host'] || h.host || 'gogetterinc.com').split(',')[0].trim();
  const proto = String(h['x-forwarded-proto'] || (/^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host) ? 'http' : 'https')).split(',')[0].trim();
  return proto + '://' + host;
}

/** @param {import('http').IncomingMessage} req @param {string} name */
export function cookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const i = part.indexOf('=');
    if (i > 0 && part.slice(0, i).trim() === name) return decodeURIComponent(part.slice(i + 1).trim());
  }
  return '';
}

// ---- input checks ----
/** @param {any} v @param {number} [max] */
export function str(v, max = 500) {
  if (v === undefined || v === null) return '';
  return String(v).trim().slice(0, max);
}
/** Whole cents, positive. @param {any} v @param {string} label */
export function cents(v, label = 'Amount') {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0 || n > 100_000_000_00) throw new HttpError(400, label + ' must be more than $0');
  return n;
}
/** @param {any} v */
export function intId(v) {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, 'Bad id');
  return n;
}
/** YYYY-MM-DD @param {any} v @param {string} label */
export function day(v, label = 'Date') {
  const s = str(v, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || isNaN(Date.parse(s + 'T00:00:00Z'))) throw new HttpError(400, label + ' is not a valid date');
  return s;
}
/** @param {any} v */
export function email(v) {
  const s = str(v, 200);
  if (s && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) throw new HttpError(400, 'Email is not valid');
  return s;
}
