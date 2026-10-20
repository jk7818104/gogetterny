// @ts-check
// Reads uploaded documents without AI: text from PDF and Word, tables from Excel and CSV,
// then makes a best guess at amount, date, who it is from, number and due date.
// The guess only fills the form; the person always checks it before saving.
import { HttpError } from './http.js';

export const TYPES = {
  'application/pdf': 'pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
  'application/vnd.ms-excel': 'xls',
  'text/csv': 'csv',
  'text/plain': 'txt',
  'image/jpeg': 'image', 'image/png': 'image', 'image/webp': 'image', 'image/heic': 'image', 'image/heif': 'image', 'image/gif': 'image'
};
const BY_EXT = { pdf: 'application/pdf', docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  xls: 'application/vnd.ms-excel', csv: 'text/csv', txt: 'text/plain', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', heic: 'image/heic', heif: 'image/heif', gif: 'image/gif' };

/** The real type from the file's first bytes and name (never trust the browser alone). @param {Buffer} buf @param {string} name @param {string} claimed */
export function sniffType(buf, name, claimed) {
  const ext = String(name).toLowerCase().split('.').pop() || '';
  const head = buf.subarray(0, 8).toString('latin1');
  if (head.startsWith('%PDF')) return 'application/pdf';
  if (buf[0] === 0xff && buf[1] === 0xd8) return 'image/jpeg';
  if (head.startsWith('\x89PNG')) return 'image/png';
  if (head.startsWith('GIF8')) return 'image/gif';
  if (head.startsWith('RIFF') && buf.subarray(8, 12).toString('latin1') === 'WEBP') return 'image/webp';
  if (buf.subarray(4, 12).toString('latin1').startsWith('ftyphei') || buf.subarray(4, 12).toString('latin1').startsWith('ftypmif')) return 'image/heic';
  if (head.startsWith('PK')) {
    if (ext === 'docx') return BY_EXT.docx;
    if (ext === 'xlsx') return BY_EXT.xlsx;
    throw new HttpError(400, 'This file type is not supported. Use PDF, Word (.docx), Excel (.xlsx), CSV or a photo.');
  }
  if (buf[0] === 0xd0 && buf[1] === 0xcf) return 'application/vnd.ms-excel';   // old .xls / .doc
  if (ext === 'csv' || ext === 'txt') {
    if (buf.subarray(0, 4000).includes(0)) throw new HttpError(400, 'This does not look like a text file');
    return ext === 'csv' ? 'text/csv' : 'text/plain';
  }
  throw new HttpError(400, 'This file type is not supported. Use PDF, Word (.docx), Excel (.xlsx), CSV or a photo.');
}

// ---------- text ----------
/** @param {Buffer} buf @param {string} type @returns {Promise<string>} */
export async function textOf(buf, type) {
  try {
    if (type === 'application/pdf') {
      const { extractText, getDocumentProxy } = await import('unpdf');
      const pdf = await getDocumentProxy(new Uint8Array(buf));
      const { text } = await extractText(pdf, { mergePages: true });
      return String(text || '').slice(0, 60000);
    }
    if (type === BY_EXT.docx) {
      const mammoth = (await import('mammoth')).default;
      const r = await mammoth.extractRawText({ buffer: buf });
      return String(r.value || '').slice(0, 60000);
    }
    if (type === 'text/plain' || type === 'text/csv') return buf.toString('utf8').slice(0, 60000);
  } catch (e) { console.error('read text failed', /** @type {any} */ (e).message); }
  return '';
}

// ---------- tables (bank statements, lists) ----------
/** @param {string} s */
function parseCsv(s) {
  s = s.replace(/^﻿/, '');
  const firstLine = s.split(/\r?\n/, 1)[0] || '';
  const sep = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ';' : (firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length ? '\t' : ',';
  /** @type {string[][]} */ const rows = [];
  /** @type {string[]} */ let row = [];
  let cell = '', inQ = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inQ) {
      if (ch === '"') { if (s[i + 1] === '"') { cell += '"'; i++; } else inQ = false; }
      else cell += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && s[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.some((c) => c.trim() !== '')) rows.push(row);
      row = [];
      if (rows.length > 20000) break;
    } else cell += ch;
  }
  row.push(cell);
  if (row.some((c) => c.trim() !== '')) rows.push(row);
  return rows.map((r) => r.map((c) => c.trim()));
}

/** Excel cell value → plain text (dates as YYYY-MM-DD) @param {any} v */
function cellText(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return isNaN(v.getTime()) ? '' : v.toISOString().slice(0, 10);
  if (typeof v === 'object') {
    if (v.result !== undefined) return cellText(v.result);
    if (v.richText) return v.richText.map((/** @type {any} */ t) => t.text).join('');
    if (v.text) return String(v.text);
    return '';
  }
  return String(v).trim();
}

/** All rows of the first sheet (or the CSV), as text. @param {Buffer} buf @param {string} type @returns {Promise<string[][] | null>} */
export async function rowsOf(buf, type) {
  if (type === 'text/csv' || type === 'text/plain') return parseCsv(buf.toString('utf8'));
  if (type === BY_EXT.xlsx) {
    const ExcelJS = (await import('exceljs')).default;
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(/** @type {any} */ (buf));
    const ws = wb.worksheets.find((w) => w.actualRowCount > 1) || wb.worksheets[0];
    if (!ws) return [];
    /** @type {string[][]} */ const out = [];
    ws.eachRow({ includeEmpty: false }, (r) => {
      if (out.length > 20000) return;
      const vals = /** @type {any[]} */ (r.values).slice(1).map(cellText);
      if (vals.some((x) => x)) out.push(vals);
    });
    return out;
  }
  if (type === 'application/vnd.ms-excel') throw new HttpError(400, 'Old Excel files (.xls) can\'t be read. In Excel, choose File → Save As → .xlsx or .csv, and upload that.');
  return null;
}

// ---------- understanding numbers and dates ----------
const MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, sept: 9, oct: 10, nov: 11, dec: 12 };
/** Any common date → YYYY-MM-DD, or '' @param {any} v */
export function toDate(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (m) return ymd(+m[1], +m[2], +m[3]);
  m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})\b/);
  if (m) { let y = +m[3]; if (y < 100) y += 2000; return ymd(y, +m[1], +m[2]); }   // US order: month/day
  m = s.match(/^([A-Za-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})/);
  if (m) { const mo = /** @type {any} */ (MONTHS)[m[1].slice(0, 4).toLowerCase()] || /** @type {any} */ (MONTHS)[m[1].slice(0, 3).toLowerCase()]; if (mo) return ymd(+m[3], mo, +m[2]); }
  m = s.match(/^(\d{1,2})[\s-]([A-Za-z]{3,9})[\s-,]+(\d{2,4})/);
  if (m) { const mo = /** @type {any} */ (MONTHS)[m[2].slice(0, 3).toLowerCase()]; let y = +m[3]; if (y < 100) y += 2000; if (mo) return ymd(y, mo, +m[1]); }
  if (/^\d{5}(\.\d+)?$/.test(s)) { const d = new Date(Date.UTC(1899, 11, 30) + Math.round(Number(s)) * 864e5); return d.toISOString().slice(0, 10); }   // Excel serial
  return '';
}
/** @param {number} y @param {number} m @param {number} d */
function ymd(y, m, d) {
  if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1990 || y > 2100) return '';
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCMonth() !== m - 1) return '';
  return dt.toISOString().slice(0, 10);
}
/** "$1,234.56", "(1,234.56)", "-1234.56", "1234.56 CR" → cents (signed), or null @param {any} v */
export function toCents(v) {
  let s = String(v ?? '').trim();
  if (!s) return null;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  if (/\s*(DR|CR)$/i.test(s)) { neg = /DR$/i.test(s); s = s.replace(/\s*(DR|CR)$/i, ''); }
  s = s.replace(/[$€£\s]/g, '').replace(/USD/i, '');
  if (s.startsWith('-')) { neg = !neg; s = s.slice(1); }
  if (s.endsWith('-')) { neg = !neg; s = s.slice(0, -1); }
  if (!/^\d{1,3}(,\d{3})*(\.\d{1,2})?$|^\d+(\.\d{1,2})?$/.test(s)) return null;
  const c = Math.round(parseFloat(s.replace(/,/g, '')) * 100);
  return neg ? -c : c;
}

// ---------- a best guess from the text of a bill, receipt or invoice ----------
const MONEY_RE = /\$?\s?(\d{1,3}(?:,\d{3})+|\d+)\.(\d{2})\b/g;
const HAS_MONEY = /\$?\s?(\d{1,3}(?:,\d{3})+|\d+)\.(\d{2})\b/;
/** @param {string} text @param {any} biz settings, to tell our own invoices apart */
export function guessFromText(text, biz) {
  const t = String(text || '').replace(/ /g, ' ');
  const lines = t.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  /** @type {any} */ const g = {};
  // total: the last amount on a line that says total / amount due / balance due
  const totalLines = lines.filter((l) => /(grand\s+total|total\s+due|amount\s+due|balance\s+due|total\s+amount|invoice\s+total|^total\b|\btotal\b)/i.test(l) && !/sub\s*-?total/i.test(l));
  /** @param {string} l */
  const amountsIn = (l) => Array.from(l.matchAll(MONEY_RE)).map((m) => Math.round(parseFloat(m[1].replace(/,/g, '') + '.' + m[2]) * 100));
  for (const l of totalLines) { const a = amountsIn(l); if (a.length) g.amount_cents = a[a.length - 1]; }
  if (!g.amount_cents) {
    // a total on the next line ("Total" / "$1,234.00")
    for (let i = 0; i < lines.length - 1; i++) if (/^(grand\s+)?total|amount\s+due|balance\s+due/i.test(lines[i]) && !amountsIn(lines[i]).length) { const a = amountsIn(lines[i + 1]); if (a.length) g.amount_cents = a[0]; }
  }
  if (!g.amount_cents) { const all = amountsIn(t); if (all.length) g.amount_cents = Math.max(...all); }
  // number
  for (const n of t.matchAll(/\b(?:invoice|inv|receipt|order|bill|statement|PI)[ \t]*(?:no\.?|number|num|#)?[ \t]*[:#]?[ \t]*([A-Z0-9][A-Z0-9\-\/]{2,30})/gi)) {
    if (/\d/.test(n[1])) { g.number = n[1]; break; }
  }
  // dates: the one next to "date" first, then the first one in the text
  const DATE_RE = /\b(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|[A-Za-z]{3,9}\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}[\s-][A-Za-z]{3,9}[\s-,]+\d{4})\b/;
  for (const l of lines) {
    const m = l.match(DATE_RE);
    if (!m) continue;
    const d = toDate(m[1]);
    if (!d) continue;
    if (/due/i.test(l)) { g.due_date ||= d; continue; }
    if (/date|dated|issued/i.test(l) && !g.date) g.date = d;
  }
  if (!g.date) for (const l of lines) { const m = l.match(DATE_RE); const d = m && toDate(m[1]); if (d) { g.date = d; break; } }
  // who: the first line that looks like a name, not a heading or a number
  const skip = /^(invoice|tax invoice|receipt|bill|statement|proforma|quotation|quote|page|date|to:|bill to|ship to|from:|order|payment|thank)/i;
  // is it one of our own invoices (money in) or someone else's (money out)? Ours has our name at the top, not after "Bill to".
  const ours = biz && biz.biz_name && new RegExp('\\b' + String(biz.biz_name).replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
  const who = lines.find((l) => l.length >= 3 && l.length <= 60 && !skip.test(l) && !DATE_RE.test(l) && !HAS_MONEY.test(l) && /[A-Za-z]{3}/.test(l) && !/@|www\.|https?:/i.test(l) && !(ours && ours.test(l)));
  if (who) g.party = who.replace(/[,:;]+$/, '');
  if (ours && lines.slice(0, 3).some((l) => ours.test(l) && !/^(bill|billed|sold|ship)?\s*to\b/i.test(l))) {
    g.kind = 'income';
    const billTo = lines.findIndex((l) => /^(bill\s*to|billed\s*to|to)\b/i.test(l));
    g.party = billTo >= 0 ? (lines[billTo].replace(/^(bill\s*to|billed\s*to|to)\s*:?\s*/i, '') || lines[billTo + 1] || '') : '';
  } else g.kind = g.due_date || /invoice|bill|statement|proforma|\bPI\b/i.test(t.slice(0, 400)) ? 'bill' : 'expense';
  return g;
}

/** Does this table look like a bank statement or a list of money rows? Finds the header and the columns. @param {string[][]} rows */
export function findColumns(rows) {
  const looksDate = (/** @type {string} */ v) => !!toDate(v);
  const looksMoney = (/** @type {string} */ v) => toCents(v) !== null;
  let hi = -1;
  for (let i = 0; i < Math.min(rows.length, 25); i++) {
    const r = rows[i].map((c) => c.toLowerCase());
    if (r.some((c) => /date/.test(c)) && r.some((c) => /amount|debit|credit|withdraw|deposit|payment|charge/.test(c))) { hi = i; break; }
  }
  const header = hi >= 0 ? rows[hi] : rows[0].map((_, j) => 'Column ' + (j + 1));
  const body = rows.slice(hi >= 0 ? hi + 1 : 0);
  const sample = body.slice(0, 40);
  const score = (/** @type {number} */ j, /** @type {(v: string) => boolean} */ f) => sample.filter((r) => f(r[j] || '')).length;
  const find = (/** @type {RegExp} */ re, /** @type {(v: string) => boolean} */ f) => {
    let j = header.findIndex((h) => re.test(String(h).toLowerCase()) && score(header.indexOf(h), f) > 0);
    return j;
  };
  const map = {
    date: find(/posting date|trans\w* date|^date|date$/, looksDate),
    desc: header.findIndex((h) => /desc|memo|payee|details|name|narrative|transaction$|merchant/.test(String(h).toLowerCase())),
    amount: find(/^amount|amount$|amount \(|net amount/, looksMoney),
    debit: find(/debit|withdraw|money out|paid out|charge/, looksMoney),
    credit: find(/credit|deposit|money in|paid in/, looksMoney)
  };
  if (map.date < 0) map.date = header.findIndex((_, j) => score(j, looksDate) > sample.length * 0.6);
  if (map.amount < 0 && map.debit < 0 && map.credit < 0) map.amount = header.findIndex((_, j) => j !== map.date && score(j, looksMoney) > sample.length * 0.6);
  if (map.desc < 0) {
    let best = -1, len = 0;
    header.forEach((_, j) => { if (j === map.date || j === map.amount) return; const l = sample.reduce((s, r) => s + (r[j] || '').length, 0); if (l > len) { len = l; best = j; } });
    map.desc = best;
  }
  const ok = map.date >= 0 && (map.amount >= 0 || map.debit >= 0 || map.credit >= 0) && body.length >= 1;
  return { ok, header, body, map };
}
