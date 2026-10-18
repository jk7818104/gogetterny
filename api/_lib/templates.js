// @ts-check
// The emails GO GETTER sends: invoice, reminder, receipt, auto-reply, alerts.
// Same letterhead as the PDF: dark band with the logo, amber rule, plain tables, one solid button.

const SITE = process.env.SITE_URL || 'https://gogetterinc.com';
const LOGO = SITE + '/brand/gogetter-logo-on-dark.png';
const TZ = 'America/New_York';
const FONT = "Archivo,'Helvetica Neue',Helvetica,Arial,sans-serif";
const C = { band: '#101216', ink: '#12151B', body: '#333842', mute: '#6B7280', rule: '#DADDE2', zebra: '#F6F7F9', amber: '#F2B705', green: '#177D4F', link: '#8A6400', page: '#ECEEF1' };

/** Stripe's default memo repeats the thank-you line; don't print it twice @param {string} d @param {any} biz */
export const sameAsThanks = (d, biz) => { const n = (/** @type {string} */ x) => String(x || '').toLowerCase().replace(/[^a-z]/g, ''); return n(d) === n(biz.invoice_thanks || 'Thank you for your business!') || n(d) === 'thankyouforyourbusiness'; };

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

const DEFAULT_BIZ = { biz_name: 'GO GETTER', biz_address: 'Monroe, NY', biz_phone: '845-395-5431', biz_email: 'office@gogetterinc.com', invoice_thanks: 'Thank you for your business!' };

/**
 * Letterhead frame shared by every email.
 * @param {{biz?: any, preheader: string, tag?: string, body: string, textLines: string[]}} o  body is built HTML; tag is the small text on the right of the band
 */
function frame(o) {
  const b = { ...DEFAULT_BIZ, ...(o.biz || {}) };
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(b.biz_name)}</title></head>
<body style="margin:0;padding:0;background:${C.page};font-family:${FONT};-webkit-font-smoothing:antialiased">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.page}"><tr><td align="center" style="padding:24px 10px 32px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FFFFFF">
<tr><td style="background:${C.band};padding:22px 28px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td><a href="${SITE}" style="text-decoration:none"><img src="${LOGO}" width="150" alt="${esc(b.biz_name)}" style="display:block;border:0;width:150px;height:auto"></a></td>
    <td align="right" style="font-size:13px;color:#C7CBD2;line-height:1.4">${esc(o.tag || '')}</td>
  </tr></table>
</td></tr>
<tr><td style="background:${C.amber};height:4px;line-height:4px;font-size:0">&nbsp;</td></tr>
<tr><td style="padding:30px 28px 28px;color:${C.body};font-size:15px;line-height:1.6">${o.body}</td></tr>
<tr><td style="background:${C.band};padding:18px 28px;font-size:12.5px;line-height:1.7;color:#AEB3BC">
  <b style="color:#FFFFFF">${esc(b.biz_name)}</b><br>
  ${esc(b.biz_address)}&nbsp;&nbsp;&nbsp;${esc(b.biz_phone)}&nbsp;&nbsp;&nbsp;<a href="mailto:${esc(b.biz_email)}" style="color:#AEB3BC">${esc(b.biz_email)}</a><br>
  <a href="${SITE}" style="color:#AEB3BC">gogetterinc.com</a>&nbsp;&nbsp;&nbsp;<a href="${SITE}/terms" style="color:#AEB3BC">Terms</a>&nbsp;&nbsp;&nbsp;<a href="${SITE}/privacy" style="color:#AEB3BC">Privacy</a>
</td></tr>
</table></td></tr></table></body></html>`;
  const text = [...o.textLines, '', `${b.biz_name}, ${b.biz_address}, ${b.biz_phone}, ${b.biz_email}`, `${SITE}   Terms: ${SITE}/terms`].join('\n');
  return { html, text };
}

/** @param {string} t */
const h1 = (t) => `<h1 style="margin:0 0 18px;font-size:26px;line-height:1.2;font-weight:800;color:${C.ink};letter-spacing:-.01em">${esc(t)}</h1>`;
/** @param {string} t */
const p = (t) => `<p style="margin:0 0 14px">${esc(t)}</p>`;
/** @param {string} t */
const h2 = (t) => `<p style="margin:22px 0 8px;font-size:13px;font-weight:700;color:${C.mute}">${esc(t)}</p>`;
/** solid button @param {string} label @param {string} url @param {string} [bg] @param {string} [fg] */
const button = (label, url, bg = C.amber, fg = C.ink) => /^https:\/\//.test(url)
  ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 6px"><tr><td style="background:${bg};border-radius:3px"><a href="${esc(url)}" style="display:inline-block;padding:14px 30px;font-family:${FONT};font-size:15px;font-weight:700;color:${fg};text-decoration:none">${esc(label)}</a></td></tr></table>`
  : '';
/** label / value rows with hairlines @param {[string,string][]} rows */
const details = (rows) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:0 0 6px">${rows.map(([l, v]) =>
  `<tr><td style="padding:8px 0;border-bottom:1px solid ${C.rule};color:${C.mute}">${esc(l)}</td><td style="padding:8px 0;border-bottom:1px solid ${C.rule};text-align:right;color:${C.ink};font-weight:600">${esc(v)}</td></tr>`).join('')}</table>`;

/** The amount box: one line of label, the big number, and the due line. @param {string} label @param {string} amount @param {string} sub @param {string} [bar] */
const amountBox = (label, amount, sub, bar = C.amber) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;border:1px solid ${C.rule}">
<tr><td style="width:6px;background:${bar}"></td><td style="padding:16px 18px">
  <div style="font-size:13px;color:${C.mute}">${esc(label)}</div>
  <div style="font-size:34px;line-height:1.15;font-weight:800;color:${C.ink};letter-spacing:-.01em">${esc(amount)}</div>
  ${sub ? `<div style="font-size:14px;color:${C.body};margin-top:2px">${esc(sub)}</div>` : ''}
</td></tr></table>`;

/** Line items as a small table with a dark header, like the PDF @param {any} inv @param {boolean} [paid] */
function items(inv, paid) {
  const rows = [];
  for (const l of (inv.lines?.data || []).slice(0, 20)) {
    const q = Number(l.metadata?.gg_qty) || 1;
    const d = l.metadata?.gg_desc || l.description || 'Item';
    rows.push([q > 1 ? `${d} (${q} × ${money(Number(l.metadata?.gg_unit) || Math.round(l.amount / q))})` : d, money(l.amount)]);
  }
  const body = rows.map(([d, a], i) => `<tr style="background:${i % 2 ? C.zebra : '#FFFFFF'}"><td style="padding:9px 12px;color:${C.ink}">${esc(d)}</td><td style="padding:9px 12px;text-align:right;color:${C.ink};white-space:nowrap">${esc(a)}</td></tr>`).join('');
  const due = paid ? ['Paid', money(inv.amount_paid || inv.total)] : ['Balance due', money(inv.amount_remaining || inv.total)];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;margin:0 0 6px;border-collapse:collapse">
<tr style="background:${C.ink}"><td style="padding:9px 12px;color:#FFFFFF;font-weight:700;font-size:13px">Description</td><td style="padding:9px 12px;color:#FFFFFF;font-weight:700;font-size:13px;text-align:right">Amount</td></tr>
${body}
<tr><td style="padding:10px 12px;border-top:1px solid ${C.rule};color:${C.mute}">Total</td><td style="padding:10px 12px;border-top:1px solid ${C.rule};text-align:right;color:${C.ink}">${esc(money(inv.total))}</td></tr>
<tr><td style="padding:10px 12px;background:${paid ? C.green : C.amber};color:${paid ? '#FFFFFF' : C.ink};font-weight:700">${esc(due[0])}</td><td style="padding:10px 12px;background:${paid ? C.green : C.amber};color:${paid ? '#FFFFFF' : C.ink};font-weight:800;text-align:right;white-space:nowrap">${esc(due[1])}</td></tr>
</table>`;
}
/** @param {any} inv */
const bankOk = (inv) => (inv.payment_settings?.payment_method_types || []).includes('us_bank_account');
/** @param {string|undefined} url @param {boolean} attached @param {string} what */
const pdfLine = (url, attached, what) => url
  ? `<p style="margin:16px 0 0;font-size:14px">${attached ? `The ${esc(what)} is attached as a PDF. ` : ''}<a href="${esc(url)}" style="color:${C.link};font-weight:600">Download the PDF</a></p>` : '';
/** @param {any} b @param {string} [line] */
const signoff = (b, line) => `<p style="margin:22px 0 0">${esc(line || b.invoice_thanks)}<br><b style="color:${C.ink}">${esc(b.biz_name)}</b></p>`;

// ---------------------------------------------------------------- invoice
/** @param {any} inv @param {{biz?: any, pdfUrl?: string, attached?: boolean}} o */
export function invoiceEmail(inv, o = {}) {
  const b = { ...DEFAULT_BIZ, ...(o.biz || {}) };
  const n = firstName(inv.customer_name);
  const amount = money(inv.amount_remaining || inv.total);
  const due = inv.due_date ? longDate(inv.due_date * 1000) : '';
  const fields = (inv.custom_fields || []).map((/** @type {any} */ f) => /** @type {[string,string]} */ ([f.name, f.value]));
  /** @type {[string,string][]} */
  const info = [['Invoice number', inv.number || ''], ['Invoice date', shortDate((inv.status_transitions?.finalized_at || inv.created) * 1000)], ...(due ? /** @type {[string,string][]} */ ([['Due date', shortDate(inv.due_date * 1000)]]) : []), ...fields];
  const body = `${h1(`Invoice ${inv.number}`)}
${p(n ? `Dear ${n},` : 'Hello,')}
${p(`Please find your invoice from ${b.biz_name} below. We appreciate your prompt payment.`)}
${amountBox('Balance due', amount, due ? `Due ${due}` : 'Due on receipt')}
${button('Review and pay', inv.hosted_invoice_url)}
<p style="margin:6px 0 0;font-size:13px;color:${C.mute}">${bankOk(inv) ? 'Pay by card or bank account' : 'Pay by card'} on our secure payment page, run by Stripe.</p>
${inv.description && !sameAsThanks(inv.description, b) ? `${h2('Note')}${p(inv.description)}` : ''}
${h2('Invoice details')}${details(info)}
${h2('Summary')}${items(inv)}
${pdfLine(o.pdfUrl, !!o.attached, 'invoice')}
<p style="margin:14px 0 0;font-size:14px">Questions about this invoice? Reply to this email or call ${esc(b.biz_phone)}.</p>
${signoff(b)}`;
  return {
    subject: `Invoice ${inv.number} from ${b.biz_name}${due ? `, due ${shortDate(inv.due_date * 1000)}` : ''}`,
    ...frame({ biz: b, tag: `Invoice ${inv.number}`, preheader: `${amount}${due ? ` due ${due}` : ''}. Review and pay online.`, body,
      textLines: [n ? `Dear ${n},` : 'Hello,', '', `Please find invoice ${inv.number} from ${b.biz_name}.`, `Balance due: ${amount}${due ? `, due ${due}` : ''}`, '', `Review and pay: ${inv.hosted_invoice_url}`, ...(o.pdfUrl ? [`PDF: ${o.pdfUrl}`] : []), '', b.invoice_thanks] })
  };
}

// ---------------------------------------------------------------- reminder
/** @param {any} inv @param {'soon'|'due'|'late'} stage @param {{biz?: any, pdfUrl?: string, attached?: boolean}} o */
export function reminderEmail(inv, stage, o = {}) {
  const b = { ...DEFAULT_BIZ, ...(o.biz || {}) };
  const n = firstName(inv.customer_name);
  const due = inv.due_date ? longDate(inv.due_date * 1000) : '';
  const amount = money(inv.amount_remaining);
  const head = { soon: `Invoice ${inv.number} is due ${shortDate(inv.due_date * 1000)}`, due: `Invoice ${inv.number} is due`, late: `Invoice ${inv.number} is past due` }[stage];
  const line = {
    soon: `A friendly reminder that invoice ${inv.number} is due on ${due}.`,
    due: `Invoice ${inv.number} was due on ${due}. If you have already paid, thank you, and please disregard this email.`,
    late: `Invoice ${inv.number} was due on ${due} and is now past due. Please arrange payment at your earliest convenience, or reply if anything is unclear.`
  }[stage];
  const body = `${h1(head)}${p(n ? `Dear ${n},` : 'Hello,')}${p(line)}
${amountBox('Balance due', amount, due ? `Due ${due}` : '', stage === 'late' ? '#C8371F' : C.amber)}
${button('Pay now', inv.hosted_invoice_url)}
${h2('Summary')}${items(inv)}
${pdfLine(o.pdfUrl, !!o.attached, 'invoice')}
${signoff(b, 'Thank you,')}`;
  return {
    subject: `${head} | ${b.biz_name}`,
    ...frame({ biz: b, tag: `Invoice ${inv.number}`, preheader: line, body,
      textLines: [n ? `Dear ${n},` : 'Hello,', '', line, `Balance due: ${amount}`, '', `Pay now: ${inv.hosted_invoice_url}`, ...(o.pdfUrl ? [`PDF: ${o.pdfUrl}`] : [])] })
  };
}

// ---------------------------------------------------------------- receipt
/** @param {any} inv @param {number} amount @param {{biz?: any, pdfUrl?: string, attached?: boolean}} o */
export function thankYouEmail(inv, amount, o = {}) {
  const b = { ...DEFAULT_BIZ, ...(o.biz || {}) };
  const n = firstName(inv.customer_name);
  const paidAt = (inv.status_transitions?.paid_at || Math.floor(Date.now() / 1000)) * 1000;
  const body = `${h1('Payment received')}
${p(n ? `Dear ${n},` : 'Hello,')}
${p(`Thank you. We received your payment for invoice ${inv.number}. This email is your receipt.`)}
${amountBox('Amount paid', money(amount), `Paid ${longDate(paidAt)}`, C.green)}
${h2('Receipt')}${details([['Invoice number', inv.number || ''], ['Date paid', shortDate(paidAt)], ['Amount paid', money(amount)], ['Balance', money(inv.amount_remaining || 0)]])}
${pdfLine(o.pdfUrl, !!o.attached, 'receipt')}
${signoff(b)}`;
  return {
    subject: `Receipt for invoice ${inv.number} | ${b.biz_name}`,
    ...frame({ biz: b, tag: `Receipt ${inv.number}`, preheader: `We received ${money(amount)} for invoice ${inv.number}. Thank you.`, body,
      textLines: [n ? `Dear ${n},` : 'Hello,', '', `We received your payment of ${money(amount)} for invoice ${inv.number} on ${longDate(paidAt)}. Thank you.`, ...(o.pdfUrl ? [`Receipt PDF: ${o.pdfUrl}`] : []), '', b.invoice_thanks] })
  };
}

// ---------------------------------------------------------------- website auto-reply
/** @param {{name: string}} o @param {any} [biz] */
export function leadAutoreply(o, biz) {
  const b = { ...DEFAULT_BIZ, ...(biz || {}) };
  const n = firstName(o.name);
  return {
    subject: `We received your message | ${b.biz_name}`,
    ...frame({ biz: b, preheader: 'Thank you for reaching out. We reply within 24 hours.',
      body: `${h1('Thank you for reaching out')}${p(n ? `Dear ${n},` : 'Hello,')}${p('We received your message. A member of our team will get back to you within 24 hours.')}${p(`If it is urgent, please call us at ${b.biz_phone}.`)}${signoff(b, 'Best regards,')}`,
      textLines: [n ? `Dear ${n},` : 'Hello,', '', 'We received your message. A member of our team will get back to you within 24 hours.', `If it is urgent, please call us at ${b.biz_phone}.`] })
  };
}

// ---------------------------------------------------------------- alerts to the owner, test
/** @param {string} title @param {[string, string][]} rows @param {string} adminUrl */
export function alertEmail(title, rows, adminUrl) {
  return {
    subject: title,
    ...frame({ tag: 'Admin alert', preheader: title,
      body: `${h1(title)}${details(rows)}<div style="height:14px"></div>${button('Open the admin', adminUrl)}<p style="margin:14px 0 0;font-size:13px;color:${C.mute}">You can change these alerts in the admin, under Settings.</p>`,
      textLines: [title, '', ...rows.map(([a, v]) => `${a}: ${v}`), '', adminUrl] })
  };
}

/** @param {any} [biz] */
export function testEmail(biz) {
  return {
    subject: 'Test email from your admin',
    ...frame({ biz, tag: 'Test', preheader: 'Email is working.',
      body: `${h1('Email is working')}${p('This is a test from your admin. Invoices, reminders and receipts will be sent from this address and look like this.')}${amountBox('Balance due', '$0.00', 'Sample only')}<p style="margin:6px 0 0;font-size:13px;color:${C.mute}">In a real invoice the client gets a Review and pay button here that opens their own Stripe payment page.</p>`,
      textLines: ['Email is working.'] })
  };
}
