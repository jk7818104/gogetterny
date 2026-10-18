// @ts-check
// GO GETTER invoice / receipt as a PDF, in the company's own style.
import crypto from 'node:crypto';
import { PDFDocument, rgb, degrees, PDFName, PDFString } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { LOGO_DARK_PNG_B64 } from './logo.js';
import { ARCHIVO_400, ARCHIVO_600, ARCHIVO_800 } from './fonts.js';
import { one } from './db.js';
import { stripe } from './stripe.js';
import { getKV, setKV } from './settings.js';

const TZ = 'America/New_York';

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
 * The invoice / receipt, laid out like a printed letterhead invoice:
 * dark letterhead band with the logo, clear title and numbers, a solid table header,
 * one amber bar for the balance, and a quiet footer band.
 * @param {{inv: any, lines: any[], client: any}} data
 * @param {any} biz settings (biz_name, biz_address, biz_phone, biz_email, invoice_terms, invoice_thanks)
 * @returns {Promise<Uint8Array>}
 */
export async function invoicePdf({ inv, lines, client }, biz) {
  const doc = await PDFDocument.create();
  doc.registerFontkit(fontkit);
  const paid = inv.status === 'paid';
  const title = paid ? 'Receipt' : 'Invoice';
  doc.setTitle(`${title} ${inv.number || 'draft'} from ${biz.biz_name}`);
  doc.setAuthor(biz.biz_name);
  doc.setCreator(biz.biz_name);
  const font = await doc.embedFont(Buffer.from(ARCHIVO_400, 'base64'), { subset: true });
  const semi = await doc.embedFont(Buffer.from(ARCHIVO_600, 'base64'), { subset: true });
  const heavy = await doc.embedFont(Buffer.from(ARCHIVO_800, 'base64'), { subset: true });
  const logo = await doc.embedPng(Buffer.from(LOGO_DARK_PNG_B64, 'base64'));

  // keep only characters the font can draw
  const chars = new Set(font.getCharacterSet());
  /** @param {any} s */
  const clean = (s) => Array.from(String(s == null ? '' : s).replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/−/g, '-'))
    .map((ch) => (chars.has(ch.codePointAt(0) || 0) ? ch : ch.charCodeAt(0) < 32 ? ' ' : '?')).join('');

  // tokens
  const INK = rgb(0.071, 0.082, 0.106), BAND = rgb(0.063, 0.071, 0.086), BODY = rgb(0.2, 0.22, 0.26);
  const MUTE = rgb(0.42, 0.45, 0.5), RULE = rgb(0.85, 0.86, 0.88), ZEBRA = rgb(0.965, 0.969, 0.976);
  const AMBER = rgb(0.949, 0.718, 0.02), GREEN = rgb(0.09, 0.49, 0.31), WHITE = rgb(1, 1, 1), BAND_TEXT = rgb(0.78, 0.8, 0.84);
  const W = 612, H = 792, M = 46, R = W - M;

  let page = doc.addPage([W, H]);
  /** @param {any} t @param {number} x @param {number} y @param {{size?: number, f?: any, color?: any}} [o] */
  const text = (t, x, y, o = {}) => page.drawText(clean(t), { x, y, size: o.size || 9.5, font: o.f || font, color: o.color || BODY });
  /** @param {any} t @param {number} xr @param {number} y @param {{size?: number, f?: any, color?: any}} [o] */
  const textR = (t, xr, y, o = {}) => { const s = clean(t), f = o.f || font, z = o.size || 9.5; page.drawText(s, { x: xr - f.widthOfTextAtSize(s, z), y, size: z, font: f, color: o.color || BODY }); };
  /** @param {any} t @param {number} width @param {any} [f] @param {number} [size] */
  const wrap = (t, width, f = font, size = 9.5) => {
    const out = [];
    for (const para of clean(t).split(/\n/)) {
      let line = '';
      for (const word of para.split(/\s+/)) {
        const tryL = line ? line + ' ' + word : word;
        if (f.widthOfTextAtSize(tryL, size) <= width) { line = tryL; continue; }
        if (line) out.push(line);
        line = word;
        while (f.widthOfTextAtSize(line, size) > width && line.length > 1) {
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
    const annot = ctx.register(ctx.obj({ Type: 'Annot', Subtype: 'Link', Rect: [x, y, x + w, y + h], Border: [0, 0, 0], A: { Type: 'Action', S: 'URI', URI: PDFString.of(url) } }));
    const existing = page.node.lookup(PDFName.of('Annots'));
    if (existing) /** @type {any} */ (existing).push(annot); else page.node.set(PDFName.of('Annots'), ctx.obj([annot]));
  };
  const date = (/** @type {number} */ sec) => fmt(sec * 1000);

  // ---------- letterhead band ----------
  const bandH = 104;
  page.drawRectangle({ x: 0, y: H - bandH, width: W, height: bandH, color: BAND });
  page.drawRectangle({ x: 0, y: H - bandH - 4, width: W, height: 4, color: AMBER });
  const lw = 176, lh = lw * logo.height / logo.width;
  page.drawImage(logo, { x: M, y: H - bandH / 2 - lh / 2, width: lw, height: lh });
  const contact = [biz.biz_address, biz.biz_phone, biz.biz_email, 'gogetterinc.com'].filter(Boolean);
  let cy = H - bandH / 2 + (contact.length * 12.5) / 2 - 9;
  textR(biz.biz_name, R, cy + 14, { f: semi, size: 10.5, color: WHITE });
  for (const l of contact) { textR(l, R, cy, { size: 9, color: BAND_TEXT }); cy -= 12.5; }

  // ---------- title and invoice numbers ----------
  let y = H - bandH - 50;
  text(title, M, y, { f: heavy, size: 34, color: INK });
  /** @type {[string, string][]} */
  const meta = [[`${title} number`, inv.number || 'Draft'], ['Date', date(inv.status_transitions?.finalized_at || inv.created)]];
  if (paid && inv.status_transitions?.paid_at) meta.push(['Paid on', date(inv.status_transitions.paid_at)]);
  else if (inv.due_date) meta.push(['Due date', date(inv.due_date)]);
  const mx = R - 200;
  let my = y + 22;
  for (const [l, v] of meta) {
    text(l, mx, my, { color: MUTE });
    textR(v, R, my, { f: semi, color: INK });
    my -= 17;
  }
  page.drawLine({ start: { x: mx, y: my + 9 }, end: { x: R, y: my + 9 }, thickness: 0.75, color: RULE });
  my -= 8;
  text(paid ? 'Amount paid' : 'Balance due', mx, my, { f: semi, color: INK, size: 10.5 });
  textR(money(paid ? (inv.amount_paid || inv.total) : inv.amount_remaining), R, my, { f: heavy, color: INK, size: 13 });

  // ---------- bill to, project ----------
  y = Math.min(y - 40, my - 30);
  const top = y;
  text('Bill to', M, y, { f: semi, color: MUTE, size: 9 });
  y -= 16;
  text(client?.name || inv.customer_name || inv.customer_email || 'Customer', M, y, { f: semi, size: 11.5, color: INK });
  y -= 14;
  for (const l of [client?.company, ...(client?.address ? wrap(client.address, 200) : []), client?.email || inv.customer_email, client?.phone].filter(Boolean)) {
    text(l, M, y); y -= 13;
  }
  let fy = top;
  for (const f of (inv.custom_fields || []).slice(0, 4)) {
    text(f.name, M + 250, fy, { f: semi, color: MUTE, size: 9 });
    const rows = wrap(f.value, R - (M + 250) - 10).slice(0, 2);
    rows.forEach((r, k) => text(r, M + 250, fy - 16 - k * 13, { color: INK }));
    fy -= 22 + rows.length * 13;
  }
  y = Math.min(y, fy) - 22;

  // ---------- items ----------
  const col = { desc: M + 12, qty: R - 200, rate: R - 100, amt: R - 12 };
  const header = () => {
    page.drawRectangle({ x: M, y: y - 9, width: R - M, height: 26, color: INK });
    text('Description', col.desc, y, { f: semi, color: WHITE, size: 9 });
    textR('Qty', col.qty, y, { f: semi, color: WHITE, size: 9 });
    textR('Rate', col.rate, y, { f: semi, color: WHITE, size: 9 });
    textR('Amount', col.amt, y, { f: semi, color: WHITE, size: 9 });
    y -= 30;
  };
  header();
  let subtotal = 0, discounts = 0, row = 0;
  for (const l of lines) {
    if (l.amount < 0) { discounts += l.amount; continue; }
    subtotal += l.amount;
    const qty = Number(l.metadata?.gg_qty) || l.quantity || 1;
    const unit = Number(l.metadata?.gg_unit) || Math.round(l.amount / qty);
    const rows = wrap(l.metadata?.gg_desc || l.description || 'Item', col.qty - col.desc - 50, font, 9.5);
    const h = rows.length * 13 + 12;
    if (y - h < M + 170) { page = doc.addPage([W, H]); y = H - M - 20; header(); row = 0; }
    if (row % 2 === 1) page.drawRectangle({ x: M, y: y - h + 13, width: R - M, height: h, color: ZEBRA });
    rows.forEach((r, i) => text(r, col.desc, y - i * 13, { color: INK }));
    textR(String(qty), col.qty, y); textR(money(unit), col.rate, y); textR(money(l.amount), col.amt, y, { color: INK });
    y -= h;
    row++;
  }
  page.drawLine({ start: { x: M, y: y + 10 }, end: { x: R, y: y + 10 }, thickness: 0.75, color: RULE });

  // ---------- totals (right) and payment notes (left) ----------
  y -= 12;
  const tx = R - 230;
  let ty = y;
  /** @param {string} l @param {number} v */
  const tot = (l, v) => { text(l, tx + 12, ty, { color: MUTE }); textR(money(v), col.amt, ty, { color: INK }); ty -= 17; };
  if (discounts) { tot('Subtotal', subtotal); tot('Discount', discounts); }
  tot('Total', inv.total);
  if (inv.amount_paid && !paid) tot('Paid', -inv.amount_paid);
  ty -= 12;
  page.drawRectangle({ x: tx, y: ty - 11, width: R - tx, height: 30, color: paid ? GREEN : AMBER });
  text(paid ? 'Paid in full' : 'Balance due', tx + 12, ty, { f: semi, size: 11, color: paid ? WHITE : INK });
  textR(money(paid ? (inv.amount_paid || inv.total) : inv.amount_remaining), col.amt, ty - 1, { f: heavy, size: 14, color: paid ? WHITE : INK });
  ty -= 30;

  let ly = y;
  const lwid = tx - M - 30;
  if (inv.status === 'open' && inv.hosted_invoice_url) {
    text('Pay online', M, ly, { f: semi, color: INK, size: 10.5 });
    ly -= 15;
    const bank = (inv.payment_settings?.payment_method_types || []).includes('us_bank_account');
    for (const r of wrap(`Pay by card${bank ? ' or bank account' : ''} on our secure payment page, run by Stripe.`, lwid)) { text(r, M, ly); ly -= 13; }
    const label = 'Open the payment page', lwText = semi.widthOfTextAtSize(label, 9.5);
    text(label, M, ly, { f: semi, color: rgb(0.54, 0.39, 0) });
    page.drawLine({ start: { x: M, y: ly - 2 }, end: { x: M + lwText, y: ly - 2 }, thickness: 0.6, color: rgb(0.54, 0.39, 0) });
    link(M, ly - 4, lwText, 14, inv.hosted_invoice_url);
    ly -= 24;
  }
  if (paid) {
    for (const r of wrap(`We received your payment of ${money(inv.amount_paid || inv.total)}. Keep this receipt for your records.`, lwid)) { text(r, M, ly); ly -= 13; }
    ly -= 10;
  }
  if (inv.description) {
    text('Notes', M, ly, { f: semi, color: INK, size: 10.5 });
    ly -= 15;
    for (const r of wrap(inv.description, lwid).slice(0, 8)) { text(r, M, ly); ly -= 13; }
    ly -= 10;
  }
  y = Math.min(ly, ty) - 10;

  // ---------- terms ----------
  if (biz.invoice_terms) {
    if (y < M + 90) { page = doc.addPage([W, H]); y = H - M - 20; }
    page.drawLine({ start: { x: M, y: y + 6 }, end: { x: R, y: y + 6 }, thickness: 0.75, color: RULE });
    y -= 12;
    text('Terms', M, y, { f: semi, color: MUTE, size: 8.5 });
    y -= 12;
    for (const r of wrap(biz.invoice_terms, R - M, font, 8.5)) { if (y < M + 34) break; text(r, M, y, { color: MUTE, size: 8.5 }); y -= 11; }
  }

  // ---------- on every page: thank-you line, footer band, watermark ----------
  const pages = doc.getPages();
  pages.forEach((p, i) => {
    page = p;
    if (i === pages.length - 1 && biz.invoice_thanks) text(biz.invoice_thanks, M, M + 6, { f: semi, size: 11, color: INK });
    p.drawRectangle({ x: 0, y: 0, width: W, height: 26, color: BAND });
    const foot = [biz.biz_name, 'gogetterinc.com', biz.biz_email, biz.biz_phone].filter(Boolean).map(clean).join('      ');
    p.drawText(foot, { x: M, y: 9.5, size: 8, font, color: BAND_TEXT });
    if (pages.length > 1) { const pg = `Page ${i + 1} of ${pages.length}`; p.drawText(pg, { x: R - font.widthOfTextAtSize(pg, 8), y: 9.5, size: 8, font, color: BAND_TEXT }); }
    const mark = inv.status === 'void' ? 'VOID' : inv.status === 'draft' ? 'DRAFT' : '';
    if (mark) {
      const sz = 110, tw = heavy.widthOfTextAtSize(mark, sz);
      p.drawText(mark, { x: W / 2 - tw * 0.38, y: H / 2 - 160, size: sz, font: heavy, color: rgb(0.6, 0.62, 0.66), opacity: 0.12, rotate: degrees(32) });
    }
  });
  return doc.save();
}

/** File name like Invoice-GG-0003.pdf @param {any} inv */
export function pdfName(inv) {
  return `${inv.status === 'paid' ? 'Receipt' : 'Invoice'}-${String(inv.number || 'draft').replace(/[^A-Za-z0-9-]/g, '')}.pdf`;
}
