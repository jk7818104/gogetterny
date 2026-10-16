// @ts-check
// Sending email from GO GETTER through Resend (resend.com). Needs RESEND_API_KEY in Vercel.
import { HttpError } from './http.js';

export function emailReady() {
  return !!process.env.RESEND_API_KEY || !!(/** @type {any} */ (globalThis).__ggEmail);
}
export function fromAddress() {
  return process.env.EMAIL_FROM || 'GO GETTER <office@gogetterinc.com>';
}
export function replyTo() {
  return process.env.EMAIL_REPLY_TO || 'office@gogetterinc.com';
}

/**
 * @param {{to: string|string[], cc?: string[], subject: string, html: string, text: string, attachments?: {filename: string, content: Uint8Array|Buffer}[], replyTo?: string}} m
 */
export async function sendEmail(m) {
  const msg = {
    from: fromAddress(),
    to: [].concat(/** @type {any} */ (m.to)).filter(Boolean),
    cc: m.cc && m.cc.length ? m.cc : undefined,
    reply_to: m.replyTo || replyTo(),
    subject: m.subject.slice(0, 250),
    html: m.html,
    text: m.text,
    attachments: m.attachments && m.attachments.length
      ? m.attachments.map((a) => ({ filename: a.filename, content: Buffer.from(a.content).toString('base64') }))
      : undefined
  };
  if (!msg.to.length) throw new HttpError(400, 'No email address to send to');
  const fake = /** @type {any} */ (globalThis).__ggEmail;
  if (fake) return fake(msg);
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new HttpError(503, 'Email is not connected yet. See Settings.');
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify(msg),
      signal: ctrl.signal
    });
    const d = await r.json().catch(() => ({}));
    if (!r.ok) throw new HttpError(502, 'The email was not sent: ' + (d.message || d.name || r.status));
    return d;
  } catch (e) {
    if (e instanceof HttpError) throw e;
    throw new HttpError(502, 'The email was not sent. Try again.');
  } finally {
    clearTimeout(t);
  }
}
