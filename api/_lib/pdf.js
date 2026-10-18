// @ts-check
// GO GETTER invoice / receipt as a PDF, in the company's own style.
import crypto from 'node:crypto';
import { PDFDocument, StandardFonts, rgb, degrees, PDFName, PDFString } from 'pdf-lib';
import { LOGO_PNG_B64 } from './logo.js';
import { one } from './db.js';
import { stripe } from './stripe.js';
import { getKV, setKV } from './settings.js';

const TZ = 'America/New_York';
const INK = rgb(0.07, 0.08, 0.11), SOFT = rgb(0.23, 0.25, 0.30), MUTED = rgb(0.40, 0.42, 0.48);
const LINE = rgb(0.87, 0.88, 0.90), TINT = rgb(0.965, 0.97, 0.975), AMBER = rgb(0.949, 0.718, 0.02), AMBER_TINT = rgb(1, 0.97, 0.88);
const GREEN = rgb(0.05, 0.54, 0.34), GRAY = rgb(0.55, 0.57, 0.62);

/** @param {number} c */
const money = (c) => (c < 0 ? '-' : '') + '$' + (Math.abs(c || 0) / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** @param {number} ms */
const fmt = (ms) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(ms));
/** @param {any} x */
const idOf = (x) => (x && typeof x === 'object' ? x.id : x) || null;

// ---------- links to the PDF that work without signing in ----------
async function pdfKey() {
  let k = await getKV('sys:pdfkey');
  if (!k) { k = crypto.randomBytes(32).toString('hex'); await setKV('sys:pdfkey', k); }
  return String(k);
}
/** @param {string} invoiceId */
export async function pdfToken(invoiceId) {
  return crypto.createHmac('sha256', await pdfKey()).update(invoiceId).digest('base64url').slice(0, 24);
}
/** @param {string} invoiceId @param {string} token */
export async function pdfTokenOk(invoiceId, token) {
  const want = await pdfToken(invoiceId);
  return typeof token === 'string' && token.length === want.length && crypto.timingSafeEqual(Buffer.from(token), Buffer.from(want));
}
/** @param {string} invoiceId */
export async function pdfUrl(invoiceId) {
  const base = process.env.SITE_URL || 'https://gogetterinc.com';
  return `${base}/api/invoice-pdf?id=${encodeURIComponent(invoiceId)}&t=${await pdfToken(invoiceId)}`;
}

/** Everything the PDF needs about one invoice. @param {string} invoiceId */
export async function loadInvoice(invoiceId) {
  const st = stripe();
  const inv = await st.invoices.retrieve(invoiceId);
  const lines = await st.invoices.listLineItems(invoiceId, { limit: 100 });
  const client = await one(`select name, company, email, phone, address from clients where stripe_customer_id=$1`, [idOf(inv.customer)]);
  return { inv, lines: lines.data, client };
}

/**
 * @param {{inv: any, lines: any[], client: any}} data
 * @param {any} biz settings (biz_name, biz_address, biz_phone, biz_email, invoice_terms, invoice_thanks)
 * @returns {Promise<Uint8Array>}
 */
export async function invoicePdf({ inv, lines, client }, biz) {
  const doc = await PDFDocument.create();
  const title = inv.status === 'paid' ? 'Receipt' : 'Invoice';
  doc.setTitle(`${title} ${inv.number || 'draft'} from ${biz.biz_name}`);
  doc.setAuthor(biz.biz_name);
  doc.setCreator(biz.biz_name);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await doc.embedPng(Buffer.from(LOGO_PNG_B64, 'base64'));

  // only characters the built-in font can print
  /** @type {Map<string, boolean>} */
  const okChar = new Map();
  /** @param {any} s */
  const clean = (s) => Array.from(String(s == null ? '' : s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/−/g, '-'))
    .map((ch) => {
      if (!okChar.has(ch)) { try { font.encodeText(ch); okChar.set(ch, true); } catch { okChar.set(ch, false); } }
      return okChar.get(ch) ? ch : (ch.charCodeAt(0) < 32 ? ' ' : '?');
    }).join('');

  const W = 612, H = 792, M = 48;
  let page = doc.addPage([W, H]);
  /** @param {string} t @param {number} x @param {number} y @param {{size?: number, f?: any, color?: any}} [o] */
  const text = (t, x, y, o = {}) => page.drawText(clean(t), { x, y, size: o.size || 10, font: o.f || font, color: o.color || INK });
  /** @param {string} t @param {number} xr right edge @param {number} y @param {{size?: number, f?: any, color?: any}} [o] */
  const textR = (t, xr, y, o = {}) => { const s = clean(t), f = o.f || font, z = o.size || 10; page.drawText(s, { x: xr - f.widthOfTextAtSize(s, z), y, size: z, font: f, color: o.color || INK }); };
  /** @param {string} t @param {number} width @param {any} f @param {number} size */
  const wrap = (t, width, f = font, size = 10) => {
    const out = [];
    for (const para of clean(t).split(/\n/)) {
      let line = '';
      for (const word of para.split(/\s+/)) {
        const tryL = line ? line + ' ' + word : word;
        if (f.widthOfTextAtSize(tryL, size) <= width) { line = tryL; continue; }
        if (line) out.push(line);
        line = word;
        while (f.widthOfTextAtSize(line, size) > width && line.length > 1) {   // a very long word
          let cut = line.length - 1;
          while (cut > 1 && f.widthOfTextAtSize(line.slice(0, cut), size) > width) cut--;
          out.push(line.slice(0, cut)); line = line.slice(cut);
        }
      }
      out.push(line);
    }
    return out;
  };
  /** @param {number} x @param {number} y @param {number} w @param {number} h @param {string} url */
  const link = (x, y, w, h, url) => {
    if (!/^https:\/\//.test(url)) return;
    const ctx = doc.context;
    const annot = ctx.register(ctx.obj({ Type: 'Annot', Subtype: 'Link', Rect: [x, y, x + w, y + h], Border: [0, 0, 0],
      A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) } }));
    const existing = page.node.lookup(PDFName.of('Annots'));
    if (existing) /** @type {any} */ (existing).push(annot); else page.node.set(PDFName.of('Annots'), ctx.obj([annot]));
  };

  // ---------- header ----------
  const lw = 168, lh = lw * logo.height / logo.width;
  page.drawImage(logo, { x: M, y: H - M - lh, width: lw, height: lh });
  textR(title.toUpperCase(), W - M, H - M - 22, { size: 24, f: bold });
  let ry = H - M - 44;
  /** @type {[string, string][]} */
  const meta = [[`${title} no.`, inv.number || 'Draft'], ['Date', fmt((inv.status_transitions?.finalized_at || inv.created) * 1000)]];
  if (inv.due_date && inv.status !== 'paid') meta.push(['Due date', fmt(inv.due_date * 1000)]);
  if (inv.status === 'paid' && inv.status_transitions?.paid_at) meta.push(['Paid on', fmt(inv.status_transitions.paid_at * 1000)]);
  for (const [l, v] of meta) { textR(v, W - M, ry, { f: bold }); textR(l, W - M - 92, ry, { color: MUTED }); ry -= 15; }

  // from
  let y = H - M - lh - 22;
  text(biz.biz_name, M, y, { f: bold, size: 11 }); y -= 14;
  for (const l of [biz.biz_address, biz.biz_phone, biz.biz_email, 'gogetterinc.com'].filter(Boolean)) { text(l, M, y, { color: SOFT, size: 9.5 }); y -= 13; }
  y = Math.min(y, ry) - 14;
  page.drawLine({ start: { x: M, y }, end: { x: W - M, y }, thickness: 1, color: LINE });
  y -= 22;

  // bill to + balance box
  const top = y;
  text('BILL TO', M, y, { size: 8.5, f: bold, color: MUTED }); y -= 15;
  const billName = client?.name || inv.customer_name || inv.customer_email || 'Customer';
  text(billName, M, y, { f: bold, size: 11 }); y -= 14;
  for (const l of [client?.company, ...(client?.address ? wrap(client.address, 230, font, 9.5) : []), client?.email || inv.customer_email, client?.phone].filter(Boolean)) { text(l, M, y, { color: SOFT, size: 9.5 }); y -= 13; }
  const due = inv.status === 'paid' ? 0 : inv.amount_remaining;
  const bx = W - M - 168, bw = 168, bh = 58, by = top - bh + 10;
  page.drawRectangle({ x: bx, y: by, width: bw, height: bh, color: inv.status === 'paid' ? rgb(0.9, 0.97, 0.93) : AMBER_TINT, borderColor: inv.status === 'paid' ? GREEN : AMBER, borderWidth: 1 });
  text(inv.status === 'paid' ? 'PAID IN FULL' : 'BALANCE DUE', bx + 14, by + bh - 20, { size: 8.5, f: bold, color: inv.status === 'paid' ? GREEN : SOFT });
  text(money(inv.status === 'paid' ? inv.amount_paid || inv.total : due), bx + 14, by + 12, { size: 20, f: bold });
  y = Math.min(y, by) - 8;
  // project / PO number, side by side under the client
  const fields = inv.custom_fields || [];
  if (fields.length) {
    y -= 8;
    let h = 0;
    fields.slice(0, 4).forEach((/** @type {any} */ f, i) => {
      const fx = M + (i % 3) * 180;
      if (i && i % 3 === 0) { y -= h + 8; h = 0; }
      text(String(f.name).toUpperCase(), fx, y, { size: 8.5, f: bold, color: MUTED });
      const rows = wrap(f.value, 168, font, 10).slice(0, 3);
      rows.forEach((r, k) => text(r, fx, y - 14 - k * 12));
      h = Math.max(h, 14 + rows.length * 12);
    });
    y -= h + 4;
  }
  y -= 14;

  // ---------- items table ----------
  const cx = { desc: M + 10, qty: W - M - 190, rate: W - M - 90, amt: W - M - 10 };
  const header = () => {
    page.drawRectangle({ x: M, y: y - 8, width: W - 2 * M, height: 24, color: TINT });
    text('DESCRIPTION', cx.desc, y, { size: 8.5, f: bold, color: MUTED });
    textR('QTY', cx.qty, y, { size: 8.5, f: bold, color: MUTED });
    textR('RATE', cx.rate, y, { size: 8.5, f: bold, color: MUTED });
    textR('AMOUNT', cx.amt, y, { size: 8.5, f: bold, color: MUTED });
    y -= 28;
  };
  header();
  let subtotal = 0, discounts = 0;
  for (const l of lines) {
    if (l.amount < 0) { discounts += l.amount; continue; }
    subtotal += l.amount;
    const qty = Number(l.metadata?.gg_qty) || l.quantity || 1;
    const unit = Number(l.metadata?.gg_unit) || Math.round(l.amount / qty);
    const desc = l.metadata?.gg_desc || l.description || 'Item';
    const rows = wrap(desc, cx.qty - cx.desc - 60, font, 10);
    if (y - rows.length * 13 < M + 150) { page = doc.addPage([W, H]); y = H - M - 10; header(); }
    rows.forEach((r, i) => text(r, cx.desc, y - i * 13));
    textR(String(qty), cx.qty, y); textR(money(unit), cx.rate, y); textR(money(l.amount), cx.amt, y);
    y -= rows.length * 13 + 9;
    page.drawLine({ start: { x: M, y: y + 3 }, end: { x: W - M, y: y + 3 }, thickness: 0.6, color: LINE });
    y -= 8;
  }

  // ---------- totals ----------
  y -= 6;
  const stampAt = { page, y: y - 30 };
  /** @param {string} l @param {number} v @param {boolean} [strong] */
  const tot = (l, v, strong) => { textR(l, W - M - 110, y, { color: strong ? INK : SOFT, f: strong ? bold : font, size: strong ? 11 : 10 }); textR(money(v), W - M - 10, y, { f: strong ? bold : font, size: strong ? 11 : 10 }); y -= strong ? 20 : 16; };
  if (discounts) { tot('Subtotal', subtotal); tot('Discount', discounts); }
  tot('Total', inv.total, !inv.amount_paid);
  if (inv.amount_paid) {
    tot('Paid', -inv.amount_paid);
    page.drawLine({ start: { x: W - M - 200, y: y + 8 }, end: { x: W - M, y: y + 8 }, thickness: 1, color: INK });
    y -= 4;
    tot('Balance due', inv.amount_remaining, true);
  }

  // ---------- notes, pay online, terms ----------
  y -= 8;
  if (inv.description) {
    text('NOTES', M, y, { size: 8.5, f: bold, color: MUTED }); y -= 14;
    for (const r of wrap(inv.description, W - 2 * M, font, 10)) { text(r, M, y, { color: SOFT }); y -= 13; }
    y -= 10;
  }
  if (inv.status === 'open' && inv.hosted_invoice_url) {
    if (y < M + 120) { page = doc.addPage([W, H]); y = H - M - 10; }
    const boxH = 50;
    page.drawRectangle({ x: M, y: y - boxH + 12, width: W - 2 * M, height: boxH, color: AMBER_TINT, borderColor: AMBER, borderWidth: 1 });
    text('Pay online', M + 14, y - 6, { f: bold, size: 11 });
    const bank = (inv.payment_settings?.payment_method_types || []).includes('us_bank_account');
    text(`Click here to pay by card${bank ? ' or bank' : ''} on our secure payment page.`, M + 14, y - 22, { color: SOFT, size: 9.5 });
    const btnW = 120;
    page.drawRectangle({ x: W - M - btnW - 14, y: y - 28, width: btnW, height: 28, color: AMBER });
    const label = 'Pay ' + money(inv.amount_remaining);
    page.drawText(clean(label), { x: W - M - 14 - btnW / 2 - bold.widthOfTextAtSize(label, 10.5) / 2, y: y - 18, size: 10.5, font: bold, color: INK });
    link(M, y - boxH + 12, W - 2 * M, boxH, inv.hosted_invoice_url);
    y -= boxH + 16;
  }
  if (biz.invoice_terms) {
    text('TERMS', M, y, { size: 8.5, f: bold, color: MUTED }); y -= 13;
    for (const r of wrap(biz.invoice_terms, W - 2 * M, font, 8.5)) { if (y < M + 30) break; text(r, M, y, { color: MUTED, size: 8.5 }); y -= 11; }
  }

  // stamp and footer on every page
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    page = p;
    if (biz.invoice_thanks && i === pages.length - 1) {
      const t = clean(biz.invoice_thanks);
      p.drawText(t, { x: W / 2 - bold.widthOfTextAtSize(t, 11) / 2, y: M + 14, size: 11, font: bold, color: INK });
    }
    const foot = clean(`${biz.biz_name} · gogetterinc.com · ${biz.biz_email}${pages.length > 1 ? ` · Page ${i + 1} of ${pages.length}` : ''}`);
    p.drawText(foot, { x: W / 2 - font.widthOfTextAtSize(foot, 8) / 2, y: M - 12, size: 8, font, color: GRAY });
    const stamp = inv.status === 'paid' ? ['PAID', GREEN] : inv.status === 'void' ? ['VOID', GRAY] : inv.status === 'draft' ? ['DRAFT', GRAY] : null;
    if (stamp && p === stampAt.page) {
      const [word, color] = /** @type {[string, any]} */ (stamp);
      const sz = 40, tw = bold.widthOfTextAtSize(word, sz), sx = M + 40, sy = Math.max(M + 40, stampAt.y - 20);
      p.drawRectangle({ x: sx, y: sy, width: tw + 26, height: sz + 8, borderColor: color, borderWidth: 3, rotate: degrees(12), opacity: 0, borderOpacity: 0.4 });
      p.drawText(word, { x: sx + 13 - 2, y: sy + 10, size: sz, font: bold, color, opacity: 0.4, rotate: degrees(12) });
    }
  });
  return doc.save();
}

/** File name like Invoice-GG-0003.pdf @param {any} inv */
export function pdfName(inv) {
  return `${inv.status === 'paid' ? 'Receipt' : 'Invoice'}-${String(inv.number || 'draft').replace(/[^A-Za-z0-9-]/g, '')}.pdf`;
}
