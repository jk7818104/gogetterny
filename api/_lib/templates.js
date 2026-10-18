// @ts-check
// The emails GO GETTER sends: invoice, reminder, receipt, auto-reply, alerts. One look for all of them.

const SITE = process.env.SITE_URL || 'https://www.gogetterinc.com';
const LOGO = SITE + '/brand/gogetter-logo-on-light.png';
const TZ = 'America/New_York';
const FONT = "Archivo,'Segoe UI',Helvetica,Arial,sans-serif";

/** @param {any} s */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => /** @type {any} */ ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
/** @param {number} c */
export const money = (c) => (c < 0 ? '-' : '') + '$' + (Math.abs(c || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** @param {number} ms */
export const longDate = (ms) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'long', day: 'numeric', year: 'numeric' }).format(new Date(ms));
/** @param {number} ms */
const shortDate = (ms) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ms));

/** A first name that is safe to put in an email greeting, or '' @param {any} name */
export function firstName(name) {
  const f = String(name || '').trim().split(/\s+/)[0] || '';
  return /^[\p{L}][\p{L}'.-]{0,29}$/u.test(f) ? f : '';
}

const DEFAULT_BIZ = { biz_name: 'GO GETTER', biz_address: 'New York, NY', biz_phone: '845-395-5431', biz_email: 'office@gogetterinc.com', invoice_thanks: 'Thank you for your business!' };

/**
 * The frame every email shares.
 * @param {{biz?: any, preheader: string, hero?: string, body: string, textLines: string[]}} o  hero/body are already-built HTML
 */
function frame(o) {
  const b = { ...DEFAULT_BIZ, ...(o.biz || {}) };
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(b.biz_name)}</title></head>
<body style="margin:0;padding:0;background:#EEF0F3;font-family:${FONT};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EEF0F3"><tr><td align="center" style="padding:28px 12px 36px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px">
<tr><td style="padding:0 6px 16px"><a href="${SITE}" style="text-decoration:none"><img src="${LOGO}" width="168" alt="${esc(b.biz_name)}" style="display:block;border:0;width:168px;height:auto"></a></td></tr>
<tr><td style="background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 1px 2px rgba(16,18,22,.06)">
${o.hero || ''}
<div style="padding:28px 32px 30px;color:#3A414D;font-size:15px;line-height:1.6">${o.body}</div>
</td></tr>
<tr><td style="padding:22px 10px 0;text-align:center;font-size:12.5px;line-height:1.6;color:#7A828F">
<b style="color:#3A414D">${esc(b.biz_name)}</b> &nbsp;·&nbsp; ${esc(b.biz_address)} &nbsp;·&nbsp; ${esc(b.biz_phone)}<br>
<a href="mailto:${esc(b.biz_email)}" style="color:#7A828F">${esc(b.biz_email)}</a> &nbsp;·&nbsp; <a href="${SITE}" style="color:#7A828F">gogetterinc.com</a><br>
<a href="${SITE}/terms" style="color:#7A828F">Terms</a> &nbsp;·&nbsp; <a href="${SITE}/privacy" style="color:#7A828F">Privacy</a>
</td></tr></table></td></tr></table></body></html>`;
  const text = [...o.textLines, '', `${b.biz_name} · ${b.biz_address} · ${b.biz_phone} · ${b.biz_email}`, `${SITE}  ·  Terms: ${SITE}/terms`].join('\n');
  return { html, text };
}

/** amber button @param {string} label @param {string} url */
const button = (label, url) => /^https:\/\//.test(url) ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto 4px"><tr><td style="background:#F2B705;border-radius:999px"><a href="${esc(url)}" style="display:inline-block;padding:15px 34px;font-family:${FONT};font-size:16px;font-weight:700;color:#14110A;text-decoration:none">${esc(label)}</a></td></tr></table>` : '';
/** @param {string} t */
const p = (t) => `<p style="margin:0 0 14px">${esc(t)}</p>`;
/** label/value rows @param {[string,string][]} rows @param {boolean} [lastBold] */
const table = (rows, lastBold) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;font-size:14px">${rows.map(([l, v], i) => {
  const strong = lastBold && i === rows.length - 1;
  return `<tr><td style="padding:10px 0;border-top:1px solid #E6E8EC;color:${strong ? '#12151B' : '#646C7A'};${strong ? 'font-weight:700;' : ''}">${esc(l)}</td><td style="padding:10px 0;border-top:1px solid #E6E8EC;text-align:right;color:#12151B;font-weight:${strong ? 700 : 600}">${esc(v)}</td></tr>`;
}).join('')}</table>`;
/** small caps label @param {string} t */
const label = (t) => `<div style="font-size:11.5px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#7A828F;margin:0 0 6px">${esc(t)}</div>`;

/** @param {any} inv */
function lineRows(inv) {
  /** @type {[string, string][]} */
  const rows = [];
  for (const l of (inv.lines?.data || []).slice(0, 15)) {
    const q = Number(l.metadata?.gg_qty) || 1;
    const d = l.metadata?.gg_desc || l.description || 'Item';
    rows.push([q > 1 ? `${d} (${q} × ${money(Number(l.metadata?.gg_unit) || Math.round(l.amount / q))})` : d, money(l.amount)]);
  }
  return rows;
}
/** @param {any} inv */
const bankOk = (inv) => (inv.payment_settings?.payment_method_types || []).includes('us_bank_account');

/** Big amount box at the top of invoice emails @param {string} kicker @param {string} amount @param {string} sub @param {string} btnLabel @param {string} url @param {string} small @param {string} [bg] */
function hero(kicker, amount, sub, btnLabel, url, small, bg = '#FFF7E0') {
  return `<div style="background:${bg};padding:30px 32px 26px;text-align:center;border-bottom:1px solid #F1E3B5">
${label(kicker)}
<div style="font-size:40px;line-height:1.1;font-weight:800;color:#12151B;letter-spacing:-.02em">${esc(amount)}</div>
${sub ? `<div style="font-size:14.5px;color:#3A414D;margin-top:6px">${esc(sub)}</div>` : ''}
${btnLabel ? button(btnLabel, url) : ''}
${small ? `<div style="font-size:12.5px;color:#7A828F;margin-top:8px">${esc(small)}</div>` : ''}
</div>`;
}

// ---------------------------------------------------------------- invoice
/** @param {any} inv @param {{biz?: any, pdfUrl?: string, attached?: boolean}} o */
export function invoiceEmail(inv, o = {}) {
  const b = { ...DEFAULT_BIZ, ...(o.biz || {}) };
  const n = firstName(inv.customer_name);
  const amount = money(inv.amount_remaining || inv.total);
  const due = inv.due_date ? longDate(inv.due_date * 1000) : '';
  const fields = (inv.custom_fields || []).map((/** @type {any} */ f) => /** @type {[string,string]} */ ([f.name, f.value]));
  /** @type {[string,string][]} */
  const details = [['Invoice no.', inv.number || ''], ['Invoice date', shortDate((inv.status_transitions?.finalized_at || inv.created) * 1000)], ...(due ? /** @type {[string,string][]} */ ([['Due date', shortDate(inv.due_date * 1000)]]) : []), ...fields];
  const body = `
${p(n ? `Dear ${n},` : 'Hello,')}
${p(`Here is your invoice from ${b.biz_name}. We appreciate your prompt payment.`)}
${inv.description ? `<div style="margin:0 0 16px;padding:12px 14px;background:#F6F7F9;border-radius:10px;color:#3A414D">${esc(inv.description)}</div>` : ''}
${label('Invoice details')}${table(details)}
${label('Summary')}${table([...lineRows(inv), ['Total', money(inv.total)], ...(inv.amount_paid ? /** @type {[string,string][]} */ ([['Already paid', money(-inv.amount_paid)], ['Balance due', amount]]) : [])], true)}
${o.pdfUrl ? `<p style="margin:0 0 14px">📎 ${o.attached ? 'The invoice is attached as a PDF. ' : ''}<a href="${esc(o.pdfUrl)}" style="color:#8A6400;font-weight:600">Download PDF</a></p>` : ''}
${p('Questions about this invoice? Just reply to this email.')}
<p style="margin:18px 0 0">${esc(b.invoice_thanks)}<br><b style="color:#12151B">${esc(b.biz_name)}</b></p>`;
  return {
    subject: `Invoice ${inv.number} from ${b.biz_name}${due ? `, due ${shortDate(inv.due_date * 1000)}` : ''}`,
    ...frame({
      biz: b,
      preheader: `${amount}${due ? ` due ${due}` : ''}. Review and pay online.`,
      hero: hero(due ? `Due ${due}` : 'Amount due', amount, `Invoice ${inv.number}`, 'Review and pay', inv.hosted_invoice_url, bankOk(inv) ? 'Pay by card or bank account. Secure payment by Stripe.' : 'Pay by card. Secure payment by Stripe.'),
      body,
      textLines: [n ? `Dear ${n},` : 'Hello,', '', `Here is your invoice ${inv.number} from ${b.biz_name}.`, `Amount due: ${amount}${due ? `, due ${due}` : ''}`, '', `Review and pay: ${inv.hosted_invoice_url}`, ...(o.pdfUrl ? [`Download PDF: ${o.pdfUrl}`] : []), '', ...lineRows(inv).map(([a, v]) => `${a}: ${v}`), `Total: ${money(inv.total)}`, '', b.invoice_thanks]
    })
  };
}

// ---------------------------------------------------------------- reminder
/** @param {any} inv @param {'soon'|'due'|'late'} stage @param {{biz?: any, pdfUrl?: string, attached?: boolean}} o */
export function reminderEmail(inv, stage, o = {}) {
  const b = { ...DEFAULT_BIZ, ...(o.biz || {}) };
  const n = firstName(inv.customer_name);
  const due = inv.due_date ? longDate(inv.due_date * 1000) : '';
  const amount = money(inv.amount_remaining);
  const kicker = { soon: `Due ${due}`, due: 'Due now', late: 'Past due' }[stage];
  const line = {
    soon: `This is a friendly reminder that invoice ${inv.number} for ${amount} is due on ${due}.`,
    due: `Invoice ${inv.number} for ${amount} was due on ${due}. If you already paid, thank you, and please ignore this email.`,
    late: `Invoice ${inv.number} for ${amount} is past due. It was due on ${due}. Please take care of it at your earliest convenience, or reply if anything is unclear.`
  }[stage];
  const subject = { soon: `Reminder: invoice ${inv.number} is due ${shortDate(inv.due_date * 1000)}`, due: `Invoice ${inv.number} is due`, late: `Past due: invoice ${inv.number}` }[stage];
  return {
    subject: `${subject} | ${b.biz_name}`,
    ...frame({
      biz: b,
      preheader: line,
      hero: hero(kicker, amount, `Invoice ${inv.number}`, 'Pay now', inv.hosted_invoice_url, 'Secure payment by Stripe.', stage === 'late' ? '#FDECEA' : '#FFF7E0'),
      body: `${p(n ? `Dear ${n},` : 'Hello,')}${p(line)}${label('Summary')}${table([...lineRows(inv), ['Balance due', amount]], true)}
${o.pdfUrl ? `<p style="margin:0 0 14px">📎 ${o.attached ? 'The invoice is attached. ' : ''}<a href="${esc(o.pdfUrl)}" style="color:#8A6400;font-weight:600">Download PDF</a></p>` : ''}
<p style="margin:18px 0 0">Thank you,<br><b style="color:#12151B">${esc(b.biz_name)}</b></p>`,
      textLines: [n ? `Dear ${n},` : 'Hello,', '', line, '', `Pay now: ${inv.hosted_invoice_url}`, ...(o.pdfUrl ? [`Download PDF: ${o.pdfUrl}`] : [])]
    })
  };
}

// ---------------------------------------------------------------- receipt
/** @param {any} inv @param {number} amount @param {{biz?: any, pdfUrl?: string, attached?: boolean}} o */
export function thankYouEmail(inv, amount, o = {}) {
  const b = { ...DEFAULT_BIZ, ...(o.biz || {}) };
  const n = firstName(inv.customer_name);
  const paidAt = (inv.status_transitions?.paid_at || Math.floor(Date.now() / 1000)) * 1000;
  return {
    subject: `Payment received, thank you | ${b.biz_name}`,
    ...frame({
      biz: b,
      preheader: `We received your payment of ${money(amount)} for invoice ${inv.number}.`,
      hero: `<div style="background:#E8F6EF;padding:30px 32px 26px;text-align:center;border-bottom:1px solid #CBEBDB">
<div style="width:52px;height:52px;line-height:52px;border-radius:50%;background:#0E8A57;color:#fff;font-size:28px;font-weight:700;margin:0 auto 12px">✓</div>
${label('Payment received')}
<div style="font-size:40px;line-height:1.1;font-weight:800;color:#12151B;letter-spacing:-.02em">${esc(money(amount))}</div>
<div style="font-size:14.5px;color:#3A414D;margin-top:6px">Paid ${esc(longDate(paidAt))}</div></div>`,
      body: `${p(n ? `Thank you, ${n}!` : 'Thank you!')}${p(`We received your payment for invoice ${inv.number}. This email is your receipt.`)}
${label('Receipt')}${table([['Invoice no.', inv.number || ''], ['Date paid', shortDate(paidAt)], ['Amount paid', money(amount)], ['Balance', money(inv.amount_remaining || 0)]], true)}
${o.pdfUrl ? `<p style="margin:0 0 14px">📎 ${o.attached ? 'Your receipt is attached as a PDF. ' : ''}<a href="${esc(o.pdfUrl)}" style="color:#8A6400;font-weight:600">Download receipt</a></p>` : ''}
<p style="margin:18px 0 0">${esc(b.invoice_thanks)}<br><b style="color:#12151B">${esc(b.biz_name)}</b></p>`,
      textLines: [n ? `Thank you, ${n}!` : 'Thank you!', '', `We received your payment of ${money(amount)} for invoice ${inv.number} on ${longDate(paidAt)}.`, ...(o.pdfUrl ? [`Receipt: ${o.pdfUrl}`] : []), '', b.invoice_thanks]
    })
  };
}

// ---------------------------------------------------------------- website auto-reply
/** @param {{name: string}} o @param {any} [biz] */
export function leadAutoreply(o, biz) {
  const b = { ...DEFAULT_BIZ, ...(biz || {}) };
  const n = firstName(o.name);
  return {
    subject: `We got your message | ${b.biz_name}`,
    ...frame({
      biz: b,
      preheader: 'Thank you for reaching out. We reply within 24 hours.',
      body: `<h1 style="margin:0 0 16px;font-size:22px;color:#12151B">${esc(n ? `Thank you, ${n}` : 'Thank you for reaching out')}</h1>
${p('We received your message, and a member of our team will get back to you within 24 hours.')}
${p(`If it is urgent, call us at ${b.biz_phone}.`)}
<p style="margin:18px 0 0">${esc(b.biz_name)}</p>`,
      textLines: [n ? `Thank you, ${n}` : 'Thank you for reaching out', '', 'We received your message, and a member of our team will get back to you within 24 hours.', `If it is urgent, call us at ${b.biz_phone}.`]
    })
  };
}

// ---------------------------------------------------------------- alerts to the owner, test
/** @param {string} title @param {[string, string][]} rows @param {string} adminUrl */
export function alertEmail(title, rows, adminUrl) {
  return {
    subject: title,
    ...frame({
      preheader: title,
      body: `<h1 style="margin:0 0 14px;font-size:20px;color:#12151B">${esc(title)}</h1>${table(rows)}${button('Open the admin', adminUrl)}
<p style="margin:16px 0 0;font-size:12.5px;color:#7A828F;text-align:center">Alert from your admin. Change alerts in Settings.</p>`,
      textLines: [title, '', ...rows.map(([a, v]) => `${a}: ${v}`), '', adminUrl]
    })
  };
}

/** @param {any} [biz] */
export function testEmail(biz) {
  return {
    subject: 'Test email from your admin',
    ...frame({
      biz,
      preheader: 'Email is working.',
      hero: hero('Test', '$0.00', 'This is how your invoice emails look', 'Review and pay', SITE + '/admin/', 'Secure payment by Stripe.'),
      body: `${p('Email is working. Invoices, reminders and receipts will be sent from this address and look like this.')}`,
      textLines: ['Email is working.']
    })
  };
}
