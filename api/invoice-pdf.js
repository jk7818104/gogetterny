// @ts-check
// The invoice / receipt PDF. Opens for you in the admin, or for the client through the link in their email.
import { send } from './_lib/http.js';
import { isAuthed } from './_lib/auth.js';
import { dbUrl } from './_lib/db.js';
import { stripeKey } from './_lib/stripe.js';
import { getSettings } from './_lib/settings.js';
import { loadInvoice, invoicePdf, pdfName, pdfTokenOk } from './_lib/pdf.js';

/** @param {import('http').IncomingMessage} req @param {import('http').ServerResponse} res */
export default async function handler(req, res) {
  try {
    if (req.method !== 'GET') return send(res, 405, { error: 'GET only' });
    if (!dbUrl() || !stripeKey()) return send(res, 404, { error: 'Not found' });
    const u = new URL(req.url || '/', 'http://x');
    const id = u.searchParams.get('id') || '';
    const t = u.searchParams.get('t') || '';
    if (!/^in_[A-Za-z0-9]{6,80}$/.test(id)) return send(res, 404, { error: 'Not found' });
    if (!isAuthed(req) && !(await pdfTokenOk(id, t))) return send(res, 404, { error: 'Not found' });
    const data = await loadInvoice(id);
    const bytes = await invoicePdf(data, await getSettings());
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${pdfName(data.inv)}"`);
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex');
    res.end(Buffer.from(bytes));
  } catch (e) {
    const err = /** @type {any} */ (e);
    if (err && err.type === 'StripeInvalidRequestError') return send(res, 404, { error: 'Not found' });
    console.error('pdf error', err && err.message);
    return send(res, 500, { error: 'Could not make the PDF. Try again.' });
  }
}
