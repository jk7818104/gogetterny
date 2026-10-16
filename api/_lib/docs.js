// @ts-check
// Invoice, reminder and receipt emails from GO GETTER, with the PDF attached.
import { loadInvoice, invoicePdf, pdfUrl, pdfName } from './pdf.js';
import { sendEmail } from './email.js';
import { invoiceEmail, reminderEmail, thankYouEmail } from './templates.js';
import { HttpError } from './http.js';

/**
 * @param {string} invoiceId
 * @param {any} settings
 * @param {'invoice'|'reminder'|'receipt'} kind
 * @param {{stage?: 'soon'|'due'|'late', amount?: number}} [x]
 */
export async function emailInvoiceDoc(invoiceId, settings, kind, x = {}) {
  const data = await loadInvoice(invoiceId);
  const inv = { ...data.inv, lines: { data: data.lines } };
  if (!inv.customer_email) throw new HttpError(400, 'This client has no email. Add one on the client page first.');
  const pdf = await invoicePdf(data, settings);
  const o = { biz: settings, pdfUrl: await pdfUrl(inv.id), attached: true };
  const tpl = kind === 'invoice' ? invoiceEmail(inv, o)
    : kind === 'reminder' ? reminderEmail(inv, x.stage || 'due', o)
    : thankYouEmail(inv, x.amount ?? (inv.amount_paid || inv.total), o);
  const cc = String(inv.metadata?.gg_cc || '').split(',').filter(Boolean);
  await sendEmail({ to: inv.customer_email, cc, ...tpl, replyTo: settings.biz_email, attachments: [{ filename: pdfName(inv), content: pdf }] });
  return data.inv;
}
