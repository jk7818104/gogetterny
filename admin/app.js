// GO GETTER admin. Plain JavaScript, no build step.
(function () {
  'use strict';
  const LOGO = `<svg class="logo" viewBox="0 -3 358.43 91.06" aria-hidden="true" focusable="false"><path transform="translate(-4.36 85.06)" d="M37.34 1.49Q21.32 1.49 12.84 -9.47Q4.36 -20.42 4.36 -42.66Q4.36 -57.7 8.55 -67.45Q12.74 -77.21 20.83 -82Q28.92 -86.8 40.66 -86.8Q48.36 -86.8 54.52 -84.79Q60.68 -82.79 65.07 -78.76Q69.45 -74.73 71.78 -68.65Q74.11 -62.58 74.11 -54.44H50.8Q50.8 -57.08 50.23 -59.36Q49.66 -61.63 48.41 -63.34Q47.16 -65.05 45.26 -66.02Q43.37 -66.99 40.63 -66.99Q37.35 -66.99 35.1 -65.89Q32.84 -64.8 31.53 -62.64Q30.21 -60.49 29.66 -57.3Q29.12 -54.11 29.12 -49.89V-35.42Q29.12 -29.71 30.19 -25.92Q31.25 -22.13 33.82 -20.23Q36.39 -18.32 40.8 -18.32Q44.24 -18.32 46.51 -19.87Q48.78 -21.41 49.95 -24.02Q51.12 -26.62 51.12 -29.68V-30.26H39.04V-47.62H74.11V0H61.6L59.85 -8.11Q57.56 -5.29 54.44 -3.14Q51.32 -0.99 47.13 0.25Q42.94 1.49 37.34 1.49Z" fill="currentColor"/><circle cx="118.09" cy="42.53" r="43.38" fill="#F2B705"/><path d="M110.28 23.44 L139.78 42.53 L110.28 61.62 Z" class="tri"/><path transform="translate(177.48 85.06)" d="M16.25 0.65Q9.23 0.65 5.63 -4.08Q2.03 -8.8 2.03 -18.55Q2.03 -25.11 3.79 -29.35Q5.54 -33.6 8.98 -35.68Q12.41 -37.77 17.42 -37.77Q20.62 -37.77 23.2 -36.91Q25.78 -36.05 27.63 -34.32Q29.47 -32.6 30.45 -30Q31.43 -27.39 31.43 -23.91H22.97Q22.97 -25.4 22.63 -26.62Q22.29 -27.83 21.59 -28.71Q20.9 -29.59 19.84 -30.06Q18.79 -30.53 17.35 -30.53Q15.64 -30.53 14.4 -29.94Q13.17 -29.36 12.4 -28.17Q11.63 -26.98 11.28 -25.2Q10.93 -23.42 10.93 -21V-16.07Q10.93 -12.83 11.58 -10.73Q12.22 -8.62 13.62 -7.6Q15.03 -6.59 17.28 -6.59Q19.28 -6.59 20.56 -7.42Q21.83 -8.26 22.47 -9.77Q23.11 -11.29 23.11 -13.29V-13.77H16.51V-20.28H31.4V0H26.63L25.98 -3.68Q24.96 -2.35 23.57 -1.38Q22.19 -0.41 20.39 0.12Q18.59 0.65 16.25 0.65Z M37 0V-37.12H60.96V-29.85H45.73V-22.47H58.82V-15.26H45.73V-7.27H61.25V0H37Z M72.97 0V-29.72H63.91V-37.12H90.71V-29.72H81.7V0H72.97Z M101.7 0V-29.72H92.63V-37.12H119.44V-29.72H110.43V0H101.7Z M123.45 0V-37.12H147.42V-29.85H132.18V-22.47H145.27V-15.26H132.18V-7.27H147.7V0H123.45Z M152.42 0V-37.12H167.97Q172.09 -37.12 174.52 -35.62Q176.96 -34.12 178.03 -31.56Q179.11 -29.01 179.11 -25.84Q179.11 -22.49 178.03 -19.8Q176.96 -17.11 174.65 -15.52L180.34 0H171.04L166.59 -13.13H161.15V0H152.42ZM161.15 -20.01H166.59Q168.55 -20.01 169.43 -21.46Q170.31 -22.91 170.31 -25.23Q170.31 -26.76 169.92 -27.84Q169.53 -28.91 168.71 -29.5Q167.89 -30.09 166.5 -30.09H161.15V-20.01Z" fill="currentColor"/></svg>`;

  // ---------------------------------------------------------------- icons
  const I = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
  const ICON = {
    home: I('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    clients: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.6c2.8-.3 4.9 1.4 5.5 4.4"/>'),
    invoice: I('<path d="M6 2.5h9l4 4v15H6z"/><path d="M15 2.5v4h4M9 11h7M9 15h7M9 7h3"/>'),
    card: I('<rect x="2.5" y="5" width="19" height="14" rx="2.5"/><path d="M2.5 10h19M6 15h4"/>'),
    plan: I('<rect x="3" y="4.5" width="18" height="16" rx="2.5"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4M7.5 14h3M13.5 14h3M7.5 17h3"/>'),
    books: I('<path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H20v15H5.5A1.5 1.5 0 0 0 4 19.5z"/><path d="M4 19.5A1.5 1.5 0 0 0 5.5 21H20M8 7.5h8M8 11h6"/>'),
    report: I('<path d="M5 20V11M11 20V5M17 20v-6M2.5 20.5h19"/>'),
    plus: I('<path d="M12 5v14M5 12h14"/>'),
    user: I('<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.6 3.3-5.5 6.5-5.5s5.9 1.9 6.5 5.5M19 8v6M16 11h6"/>'),
    dollar: I('<path d="M12 3v18M16.5 7.5c0-1.7-2-2.8-4.5-2.8s-4.5 1.1-4.5 2.9c0 1.9 2 2.6 4.5 3.1s4.5 1.3 4.5 3.3-2 3.2-4.5 3.2-4.5-1.1-4.5-2.9"/>'),
    search: I('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
    sun: I('<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.2M12 19.8V22M2 12h2.2M19.8 12H22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"/>'),
    moon: I('<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/>'),
    out: I('<path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l4-4-4-4M14 12H4"/>'),
    down: I('<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>'),
    ok: I('<path d="M5 12.5l4.5 4.5L19 7.5"/>'),
    bell: I('<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>'),
    gear: I('<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l2-1.6-2-3.4-2.4.9a7.6 7.6 0 0 0-2.6-1.5L14 2.5h-4l-.4 2.4A7.6 7.6 0 0 0 7 6.4l-2.4-.9-2 3.4 2 1.6a7.6 7.6 0 0 0 0 3l-2 1.6 2 3.4 2.4-.9a7.6 7.6 0 0 0 2.6 1.5l.4 2.4h4l.4-2.4a7.6 7.6 0 0 0 2.6-1.5l2.4.9 2-3.4z"/>'),
    mail: I('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.8 6.8L12 13l8.2-6.2"/>'),
    alert: I('<path d="M12 3.5L2.5 20h19z"/><path d="M12 10v4.5M12 17.2v.3"/>'),
    no: I('<path d="M6 6l12 12M18 6L6 18"/>')
  };

  // ---------------------------------------------------------------- html helpers (everything is escaped unless wrapped in raw)
  class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
  const raw = (s) => new Raw(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const part = (v) => v instanceof Raw ? v.s : Array.isArray(v) ? v.map(part).join('') : (v === false || v == null) ? '' : esc(v);
  function html(strings, ...vals) {
    let out = '';
    strings.forEach((s, i) => { out += s; if (i < vals.length) out += part(vals[i]); });
    return raw(out);
  }
  const safeUrl = (u) => (typeof u === 'string' && (/^https:\/\//.test(u) || /^\/api\/invoice-pdf\?id=in_[A-Za-z0-9%_]+$/.test(u))) ? u : '#';
  const $ = (sel, el = document) => el.querySelector(sel);
  const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

  const fmtMoney = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const money = (c) => fmtMoney.format((c || 0) / 100);
  const plain = (c) => ((c || 0) / 100).toFixed(2);
  function parseMoney(s) {
    const t = String(s || '').replace(/[$,\s]/g, '');
    if (!/^\d+(\.\d{0,2})?$/.test(t)) return NaN;
    return Math.round(parseFloat(t) * 100);
  }
  const toDate = (v) => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? new Date(v + 'T12:00:00') : new Date(v);
  const fmtDate = (v) => v ? toDate(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
  const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  const today = () => ymd(new Date());
  const pill = (s, label) => html`<span class="pill p-${s}">${label || String(s).replace(/_/g, ' ')}</span>`;

  let toastTimer = 0;
  function toast(msg, bad) {
    const t = $('#toast');
    t.textContent = msg; t.className = 'toast on' + (bad ? ' bad' : '');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.className = 'toast' + (bad ? ' bad' : ''); }, bad ? 5200 : 3000);
  }

  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied'); }
    catch (e) { window.prompt('Copy this:', text); }
  }

  function download(name, text, type = 'text/csv') {
    const blob = new Blob([type === 'text/csv' ? '﻿' + text : text], { type: type + ';charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  }
  function csv(rows, cols) {
    const cell = (v) => {
      if (typeof v === 'number') return String(v);
      let s = String(v == null ? '' : v);
      if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; // keep spreadsheets from running it as a formula
      return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    return [cols.map((c) => cell(c[0])).join(','), ...rows.map((r) => cols.map((c) => cell(c[1](r))).join(','))].join('\r\n');
  }

  // ---------------------------------------------------------------- server
  const state = { status: null, clients: null, inv: {}, ch: {}, plans: {}, entries: {} };
  async function api(op, args = {}) {
    let r, d;
    try {
      r = await fetch('/api/admin', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-GG': '1' }, body: JSON.stringify({ op, ...args }) });
    } catch (e) { throw new Error('No connection. Check your internet and try again.'); }
    try { d = await r.json(); } catch (e) { d = { error: 'Server error (' + r.status + ')' }; }
    if (r.status === 401 && op !== 'login') { gate(); throw new Error(d.error || 'Please sign in'); }
    if (!r.ok) throw new Error(d.error || 'Something went wrong');
    return d;
  }
  async function clientsCache(force) {
    if (!state.clients || force) state.clients = (await api('clients.list', {})).clients;
    return state.clients;
  }

  // ---------------------------------------------------------------- theme
  const root = document.documentElement;
  const isLight = () => root.getAttribute('data-theme') === 'light';
  function toggleTheme() {
    if (isLight()) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', 'light');
    try { localStorage.setItem('gg-theme', isLight() ? 'light' : 'dark'); } catch (e) {}
    $$('[data-act="theme"]').forEach((b) => { b.innerHTML = (isLight() ? ICON.moon : ICON.sun) + (b.dataset.label ? `<span>${isLight() ? 'Night mode' : 'Day mode'}</span>` : ''); });
  }

  // ---------------------------------------------------------------- sign in
  function gate() {
    const s = state.status || { setup: {} };
    const setup = s.setup || {};
    const ready = setup.database && setup.password;
    const item = (ok, title, how) => html`<li>${raw(ok ? `<span class="ok">${ICON.ok}</span>` : `<span class="no">${ICON.no}</span>`)}<div><b>${title}</b><span>${how}</span></div></li>`;
    $('#root').innerHTML = html`<div class="gate"><div class="box">
      ${raw(LOGO)}
      ${ready ? html`
        <h1>Admin sign in</h1><p>Only for you. Enter your admin password.</p>
        <form id="login"><div><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required autofocus></div>
        <p class="err" id="lerr"></p><button class="btn wide" type="submit">Sign in</button></form>` : html`
        <h1>Almost ready</h1><p>Add these in Vercel, under Settings → Environment Variables, then redeploy.</p>
        <ul class="setup">
          ${item(setup.database, 'Database', 'Vercel → Storage → Create database → Neon (Postgres). It connects itself.')}
          ${item(setup.password, 'ADMIN_PASSWORD', 'Your admin password, at least 8 characters.')}
          ${item(setup.stripe, 'STRIPE_SECRET_KEY', 'From Stripe → Developers → API keys. Start with the test key (sk_test_…).')}
        </ul>`}
    </div></div>`.s;
    const f = $('#login');
    if (f) f.addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = f.querySelector('button'); btn.disabled = true; $('#lerr').textContent = '';
      try { await api('login', { password: $('#pw').value }); await boot(); }
      catch (err) { $('#lerr').textContent = err.message; btn.disabled = false; $('#pw').select(); }
    });
  }

  // ---------------------------------------------------------------- shell + router
  const NAV_ALL = [
    ['home', 'Home', ICON.home], ['clients', 'Clients', ICON.clients], ['invoices', 'Invoices', ICON.invoice],
    ['payments', 'Payments', ICON.card, 'f_payments'], ['plans', 'Plans', ICON.plan, 'f_plans'], ['books', 'Books', ICON.books, 'f_books'], ['reports', 'Reports', ICON.report, 'f_reports']
  ];
  // a feature is on unless it was switched off in Settings
  const on = (f) => !(state.cfg && state.cfg.settings && state.cfg.settings[f] === false);
  const mailOn = () => !!(state.cfg && state.cfg.email && state.cfg.email.ready);
  const navItems = () => NAV_ALL.filter((n) => !n[3] || on(n[3]));
  function shell() {
    const mode = state.status.testMode ? html`<span class="mode">Test mode</span>` : '';
    const nav = navItems();
    const bell = on('f_notifications');
    $('#root').innerHTML = html`<div class="shell">
      <aside class="side">${raw(LOGO)}${mode}
        <nav class="nav">${nav.map(([k, l, i]) => html`<a href="#/${k}" data-nav="${k}">${raw(i)}<span>${l}</span></a>`)}</nav>
        <div class="foot">
          ${bell ? html`<button type="button" data-act="notifs">${raw(ICON.bell)}<span>Notifications</span><b class="badge hide" data-badge></b></button>` : ''}
          <a href="#/settings" data-nav="settings">${raw(ICON.gear)}<span>Settings</span></a>
          <button type="button" data-act="theme" data-label="1">${raw(isLight() ? ICON.moon : ICON.sun)}<span>${isLight() ? 'Night mode' : 'Day mode'}</span></button>
          <button type="button" data-act="logout">${raw(ICON.out)}<span>Sign out</span></button>
        </div>
      </aside>
      <div>
        <div class="topbar">${raw(LOGO)}<div class="r">${mode}
          ${bell ? html`<button class="btn ghost sm ib" type="button" data-act="notifs" aria-label="Notifications">${raw(ICON.bell)}<b class="badge dot hide" data-badge></b></button>` : ''}
          <a class="btn ghost sm" href="#/settings" aria-label="Settings">${raw(ICON.gear)}</a></div></div>
        <main class="view" id="view"></main>
      </div>
      <nav class="tabs" style="grid-template-columns:repeat(${nav.length},1fr)">${nav.map(([k, l, i]) => html`<a href="#/${k}" data-nav="${k}">${raw(i)}<span>${l}</span></a>`)}</nav>
    </div>`.s;
    setBadge(state.unread || 0);
  }
  function setBadge(n) {
    state.unread = n;
    $$('[data-badge]').forEach((b) => { b.textContent = n > 9 ? '9+' : String(n); b.classList.toggle('hide', !n); });
  }

  const VIEWS = {};
  let routeId = 0;
  async function route() {
    const id = ++routeId;
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [name, arg] = h.split('/');
    const hiddenNav = NAV_ALL.find((n) => n[0] === name && n[3] && !on(n[3]));
    const key = VIEWS[name] && !hiddenNav ? name : 'home';
    $$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === key));
    const v = $('#view');
    if (!v) return;
    v.innerHTML = '<div class="loading"><div class="spin"></div>Loading…</div>';
    window.scrollTo(0, 0);
    try {
      const out = await VIEWS[key](arg);
      if (id !== routeId) return;
      v.innerHTML = out.s;
      v.dispatchEvent(new CustomEvent('rendered'));
    } catch (e) {
      if (id !== routeId) return;
      v.innerHTML = html`<div class="panel pad"><b>Could not load this page.</b><p class="muted">${e.message}</p><p><button class="btn sm" data-act="reload">Try again</button></p></div>`.s;
    }
  }
  const refresh = () => route();

  // ---------------------------------------------------------------- shared rows
  function invoiceRow(i, opts = {}) {
    state.inv[i.id] = i;
    const st = i.overdue ? 'overdue' : i.status;
    const sub = [i.number || 'Draft', fmtDate(i.created), i.due_date && i.status === 'open' ? 'due ' + fmtDate(i.due_date) : '', i.plan ? 'payment plan' : '',
      i.extras, i.bank && i.status === 'open' ? 'card or bank' : '', i.remind && i.status === 'open' && on('f_reminders') && mailOn() ? 'reminders on' : ''].filter(Boolean).join(' · ');
    const acts = [];
    if (opts.acts) {
      if (i.status === 'draft') {
        acts.push(html`<button class="btn sm" data-act="inv" data-a="finalize" data-id="${i.id}">Get pay link</button>`);
        acts.push(html`<button class="btn ghost sm" data-act="inv" data-a="send" data-id="${i.id}">Email it</button>`);
        acts.push(html`<button class="btn danger sm" data-act="inv" data-a="delete" data-id="${i.id}">Delete</button>`);
      }
      if (i.status === 'open') {
        acts.push(html`<button class="btn sm" data-act="inv" data-a="copy" data-id="${i.id}">Copy pay link</button>`);
        acts.push(html`<button class="btn ghost sm" data-act="inv" data-a="paid" data-id="${i.id}">Mark paid</button>`);
        if (on('f_cards')) acts.push(html`<button class="btn ghost sm" data-act="inv" data-a="charge" data-id="${i.id}">Charge card</button>`);
        acts.push(html`<button class="btn ghost sm" data-act="inv" data-a="send" data-id="${i.id}">Email again</button>`);
      }
      if (i.url && i.status !== 'draft') acts.push(html`<a class="btn ghost sm" href="${safeUrl(i.url)}" target="_blank" rel="noopener">Open</a>`);
      if (i.pdf) acts.push(html`<a class="btn ghost sm" href="${safeUrl(i.pdf)}" target="_blank" rel="noopener">PDF</a>`);
      if (i.status === 'open') acts.push(html`<button class="btn danger sm" data-act="inv" data-a="void" data-id="${i.id}">Void</button>`);
    }
    const tag = opts.link && i.client_id ? 'a' : 'div';
    return html`${raw(tag === 'a' ? `<a class="row" href="#/clients/${Number(i.client_id)}">` : '<div class="row">')}
      <div class="main"><b>${i.name}</b><span>${sub}</span></div>
      ${pill(st)}
      <div class="amt">${money(i.total)}${i.status === 'open' && i.paid ? html`<small>${money(i.due)} left</small>` : ''}</div>
      ${acts.length ? html`<div class="acts">${acts}</div>` : ''}
    ${raw(tag === 'a' ? '</a>' : '</div>')}`;
  }
  function chargeRow(c, opts = {}) {
    state.ch[c.id] = c;
    const st = c.refunded && c.refunded >= c.amount ? 'refunded' : c.status;
    const acts = [];
    if (opts.acts) {
      if (c.receipt) acts.push(html`<a class="btn ghost sm" href="${safeUrl(c.receipt)}" target="_blank" rel="noopener">Receipt</a>`);
      if (c.status === 'succeeded' && c.refunded < c.amount) acts.push(html`<button class="btn ghost sm" data-act="refund" data-id="${c.id}">Refund</button>`);
    }
    const sub = [fmtDate(c.created), c.card, c.description, c.failure].filter(Boolean).join(' · ');
    const tag = opts.link && c.client_id;
    return html`${raw(tag ? `<a class="row" href="#/clients/${Number(c.client_id)}">` : '<div class="row">')}
      <div class="main"><b>${c.name}</b><span>${sub}</span></div>
      ${pill(st)}
      <div class="amt">${money(c.amount)}${c.refunded ? html`<small>−${money(c.refunded)} refunded</small>` : ''}</div>
      ${acts.length ? html`<div class="acts">${acts}</div>` : ''}
    ${raw(tag ? '</a>' : '</div>')}`;
  }
  function planRow(p, opts = {}) {
    state.plans[p.id] = p;
    const pct = Math.min(100, Math.round(((p.paid || 0) / p.count) * 100));
    const who = p.client_name ? (p.client_company ? `${p.client_name} (${p.client_company})` : p.client_name) : '';
    const every = p.every === 'week' ? 'weekly' : 'monthly';
    const sub = [who, `${p.count} ${every} payments of ${money(p.per_cents)}`, p.autopay ? 'card charged automatically' : 'invoice emailed', p.next_date ? 'next ' + fmtDate(p.next_date) : ''].filter(Boolean).join(' · ');
    const live = p.status === 'active' || p.status === 'not_started';
    return html`<div class="row">
      <div class="main"><b>${p.title}</b><span>${sub}</span></div>
      ${pill(p.failed ? 'failed' : p.status, p.failed ? 'payment failed' : p.status === 'not_started' ? 'starts ' + fmtDate(p.start_date) : null)}
      <div class="amt">${money(p.total_cents)}<small>${p.paid || 0} of ${p.count} paid</small></div>
      <div class="acts" style="align-items:center"><div class="progress grow"><i data-w="${pct}"></i></div>
        ${opts.acts && live ? html`<button class="btn danger sm" data-act="plan-cancel" data-id="${p.id}">Stop plan</button>` : ''}
        ${opts.client && p.client_id ? html`<a class="btn ghost sm" href="#/clients/${p.client_id}">Client</a>` : ''}</div>
    </div>`;
  }
  function paintBars(el) { $$('.progress i[data-w]', el).forEach((i) => { i.style.width = i.dataset.w + '%'; }); }

  const empty = (t) => html`<div class="empty">${t}</div>`;
  const NICON = { paid: ICON.ok, failed: ICON.alert, dispute: ICON.alert, card: ICON.card, lead: ICON.mail };
  function ago(ts) {
    const s = (Date.now() - new Date(ts).getTime()) / 1000;
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago'; if (s < 7 * 86400) return Math.floor(s / 86400) + ' d ago';
    return fmtDate(ts);
  }
  function notifRow(n) {
    const href = n.client_id ? '#/clients/' + Number(n.client_id) : '#/home';
    return html`<a class="row nrow ${n.read_at ? '' : 'unread'}" href="${raw(href)}" data-close>
      <span class="nk nk-${n.kind}">${raw(NICON[n.kind] || ICON.bell)}</span>
      <div class="main"><b>${n.title}</b><span>${n.body || ''}</span></div>
      <div class="amt"><small>${ago(n.created_at)}</small></div></a>`;
  }
  async function openNotifs() {
    const r = await api('notifications.list');
    const m = modal('Notifications', html`<div class="panel rows flat">${r.notifications.length ? r.notifications.map(notifRow) : empty('Nothing yet. Payments, failed payments, saved cards and website messages show up here.')}</div>`,
      html`<button type="button" class="btn" data-close>Done</button>`);
    if (r.unread) { try { await api('notifications.read'); } catch (e) {} setBadge(0); }
    return m;
  }
  const kpi = (label, val, sub, cls) => html`<div class="kpi ${cls || ''}"><small>${label}</small><b class="num">${val}</b>${sub ? html`<span>${sub}</span>` : ''}</div>`;
  const noStripe = () => state.status.setup.stripe ? '' : html`<div class="banner"><b>Stripe is not connected yet.</b> Add STRIPE_SECRET_KEY in Vercel to send invoices and charge cards. Clients and books work already.</div>`;

  // ---------------------------------------------------------------- views
  VIEWS.home = async () => {
    const d = await api('dashboard');
    setBadge(d.unread || 0);
    const fresh = (d.notifications || []).filter((n) => !n.read_at).slice(0, 6);
    const h = new Date().getHours();
    const hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const month = new Date().toLocaleDateString('en-US', { month: 'long' });
    return html`
      <div class="head"><div><h1>${hello}</h1><div class="sub">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div></div></div>
      ${noStripe()}
      ${fresh.length && on('f_notifications') ? html`<div class="news"><div class="news-h"><b>${raw(ICON.bell)} What's new</b><button class="linkbtn" data-act="notifs-read">Mark all read</button></div>
        <div class="panel rows">${fresh.map(notifRow)}</div></div>` : ''}
      <div class="kpis">
        ${kpi('Income in ' + month, money(d.month.income), d.month.stripe_fees ? money(d.month.stripe_fees) + ' card fees already taken off' : 'card payments and recorded income')}
        ${kpi('Expenses in ' + month, money(d.month.expenses), 'from your books')}
        ${kpi('Profit in ' + month, money(d.month.profit), '', d.month.profit >= 0 ? 'pos' : 'neg')}
        ${kpi('Waiting to be paid', money(d.open.total), `${d.open.count} open invoice${d.open.count === 1 ? '' : 's'}${d.open.overdue ? ` · ${d.open.overdue} late` : ''}`, d.open.overdue ? 'neg' : '')}
      </div>
      ${(() => {
        const q = [html`<button type="button" data-act="new-invoice">${raw(ICON.invoice)}New invoice</button>`];
        if (on('f_cards')) q.push(html`<button type="button" data-act="new-charge">${raw(ICON.card)}Charge a card</button>`);
        if (on('f_plans')) q.push(html`<button type="button" data-act="new-plan">${raw(ICON.plan)}Payment plan</button>`);
        if (on('f_books')) q.push(html`<button type="button" data-act="new-entry" data-kind="expense">${raw(ICON.dollar)}Add expense</button>`);
        q.push(html`<button type="button" data-act="new-client">${raw(ICON.user)}Add client</button>`);
        return html`<div class="quick" style="--n:${q.length}">${q}</div>`;
      })()}
      <div class="cols">
        <div><h2 class="sec">Waiting to be paid <a class="muted" href="#/invoices">See all</a></h2>
          <div class="panel rows">${d.open.list.length ? d.open.list.map((i) => invoiceRow(i, { link: true })) : empty('Nothing waiting. Every invoice is paid.')}</div></div>
        <div><h2 class="sec">Latest payments <a class="muted" href="#/payments">See all</a></h2>
          <div class="panel rows">${d.recent.length ? d.recent.map((c) => chargeRow(c, { link: true })) : empty('No card payments yet.')}</div></div>
      </div>
      ${d.recentLeads.length ? html`<h2 class="sec">New leads <span class="muted">${d.counts.leads} total</span></h2>
        <div class="panel rows">${d.recentLeads.map((c) => html`<a class="row" href="#/clients/${c.id}"><div class="main"><b>${c.name}</b><span>${[c.company, c.email, c.phone].filter(Boolean).join(' · ')}</span></div>${pill('lead')}<div class="amt"><small>${fmtDate(c.created_at)}</small></div></a>`)}</div>` : ''}
    `;
  };

  let clientFilter = { q: '', status: '' };
  VIEWS.clients = async () => {
    const list = await clientsCache(true);
    return html`
      <div class="head"><div><h1>Clients</h1><div class="sub">${list.length} total · ${list.filter((c) => c.status === 'lead').length} leads</div></div>
        <div class="acts"><button class="btn ghost" data-act="export-clients">${raw(ICON.down)}Excel</button><button class="btn" data-act="new-client">${raw(ICON.plus)}New client</button></div></div>
      <div class="bar"><div class="search grow">${raw(ICON.search)}<input id="cq" type="search" placeholder="Search name, company, email, phone" value="${clientFilter.q}"></div></div>
      <div class="chips" id="cchips">${[['', 'All'], ['lead', 'Leads'], ['active', 'Active'], ['past', 'Past']].map(([v, l]) => html`<button type="button" data-cf="${v}" class="${clientFilter.status === v ? 'on' : ''}">${l}</button>`)}</div>
      <div class="panel rows" id="clist"></div>`;
  };
  function drawClients() {
    const box = $('#clist'); if (!box) return;
    const t = clientFilter.q.toLowerCase();
    const list = (state.clients || []).filter((c) => (!clientFilter.status || c.status === clientFilter.status) &&
      (!t || [c.name, c.company, c.email, c.phone].some((x) => (x || '').toLowerCase().includes(t))));
    box.innerHTML = (list.length ? html`${list.map((c) => html`<a class="row" href="#/clients/${c.id}">
      <div class="main"><b>${c.name}${c.company ? ' · ' + c.company : ''}</b><span>${[c.email, c.phone].filter(Boolean).join(' · ') || 'No contact info'}</span></div>
      ${pill(c.status)}<div class="amt"><small>${c.source === 'website' ? 'from website' : 'added'} ${fmtDate(c.created_at)}</small></div></a>`)}` : empty(state.clients.length ? 'No match.' : 'No clients yet. Add your first one.')).s;
  }

  VIEWS.client = async (id) => {
    const d = await api('clients.get', { id: Number(id) });
    const c = d.client;
    const hasStripe = state.status.setup.stripe;
    const entries = d.entries || [];
    return html`
      <div class="head"><div>
          <div class="muted"><a href="#/clients" class="muted">← Clients</a></div>
          <h1>${c.name} ${pill(c.status)}</h1>
          ${c.company ? html`<div class="sub">${c.company}</div>` : ''}
          <div class="who">${c.email ? html`<a href="mailto:${c.email}">${c.email}</a>` : ''}${c.phone ? html`<a href="tel:${c.phone.replace(/[^\d+]/g, '')}">${c.phone}</a>` : ''}${c.address ? html`<span>${c.address}</span>` : ''}</div>
        </div>
        <div class="acts">
          <button class="btn" data-act="new-invoice" data-client="${c.id}">${raw(ICON.invoice)}Invoice</button>
          ${on('f_cards') ? html`<button class="btn ghost" data-act="new-charge" data-client="${c.id}">${raw(ICON.card)}Charge card</button>` : ''}
          ${on('f_plans') ? html`<button class="btn ghost" data-act="new-plan" data-client="${c.id}">${raw(ICON.plan)}Payment plan</button>` : ''}
          <button class="btn ghost" data-act="edit-client" data-id="${c.id}">Edit</button>
        </div></div>
      ${noStripe()}
      <div class="cols">
        <div>
          ${on('f_cards') ? html`<h2 class="sec">Cards on file</h2>
          <div class="panel">${d.cards.length ? html`<div class="cards">${d.cards.map((k) => html`<div class="ccard">${raw(ICON.card)}<div><b>${k.brand} •••• ${k.last4}</b><br><small>expires ${k.exp}</small></div><button class="linkbtn" data-act="card-remove" data-client="${c.id}" data-id="${k.id}" aria-label="Remove card">Remove</button></div>`)}</div>` : empty('No card saved yet.')}
            ${hasStripe ? html`<div class="addnote"><button class="btn ghost sm" data-act="card-link" data-client="${c.id}">Send "save card" link</button><span class="muted">They type the card on Stripe's secure page.</span></div>` : ''}</div>` : ''}
          <h2 class="sec">Invoices</h2>
          <div class="panel rows">${d.invoices.length ? d.invoices.map((i) => invoiceRow(i, { acts: true })) : empty('No invoices yet.')}</div>
          <h2 class="sec">Payments</h2>
          <div class="panel rows">${d.charges.length ? d.charges.map((x) => chargeRow(x, { acts: true })) : empty('No card payments yet.')}</div>
          ${d.plans.length && on('f_plans') ? html`<h2 class="sec">Payment plans</h2><div class="panel rows">${d.plans.map((p) => planRow(p, { acts: true }))}</div>` : ''}
        </div>
        <div>
          ${c.notes ? html`<h2 class="sec">Notes</h2><div class="panel pad notes">${c.notes}</div>` : ''}
          <h2 class="sec">Activity</h2>
          <div class="panel feed">
            <form class="addnote" id="noteform" data-client="${c.id}"><input id="note" placeholder="Add a note, a call, a promise…" maxlength="2000"><button class="btn sm" type="submit">Add</button></form>
            <div class="rows">${d.activity.length ? d.activity.map((a) => html`<div class="row"><div class="main"><b>${a.body}</b><span>${a.kind}</span></div><div class="amt"><small>${fmtDate(a.created_at)}</small></div></div>`) : empty('Nothing yet.')}</div>
          </div>
          ${entries.length && on('f_books') ? html`<h2 class="sec">In your books</h2><div class="panel rows">${entries.map(entryRow)}</div>` : ''}
          <p style="margin-top:28px"><button class="btn danger sm" data-act="delete-client" data-id="${c.id}">Delete client</button></p>
        </div>
      </div>`;
  };

  let invFilter = '';
  VIEWS.invoices = async () => {
    const d = await api('invoices.list', {});
    state.invList = d.invoices;
    const open = d.invoices.filter((i) => i.status === 'open');
    return html`
      <div class="head"><div><h1>Invoices</h1><div class="sub">${money(open.reduce((s, i) => s + i.due, 0))} waiting · ${open.filter((i) => i.overdue).length} late</div></div>
        <div class="acts"><button class="btn ghost" data-act="export-invoices">${raw(ICON.down)}Excel</button><button class="btn" data-act="new-invoice">${raw(ICON.plus)}New invoice</button></div></div>
      <div class="chips" id="ichips">${[['', 'All'], ['open', 'Waiting'], ['overdue', 'Late'], ['paid', 'Paid'], ['draft', 'Drafts'], ['void', 'Void']].map(([v, l]) => html`<button type="button" data-if="${v}" class="${invFilter === v ? 'on' : ''}">${l}</button>`)}</div>
      <div class="panel rows" id="ilist"></div>`;
  };
  function drawInvoices() {
    const box = $('#ilist'); if (!box) return;
    const list = (state.invList || []).filter((i) => !invFilter || (invFilter === 'overdue' ? i.overdue : i.status === invFilter));
    box.innerHTML = (list.length ? html`${list.map((i) => invoiceRow(i, { acts: true }))}` : empty('No invoices here.')).s;
  }

  VIEWS.payments = async () => {
    const d = await api('charges.list');
    state.chList = d.charges;
    const ok = d.charges.filter((c) => c.status === 'succeeded');
    return html`
      <div class="head"><div><h1>Payments</h1><div class="sub">Last ${d.charges.length} card payments · ${money(ok.reduce((s, c) => s + c.amount - c.refunded, 0))} received</div></div>
        <div class="acts"><button class="btn ghost" data-act="export-payments">${raw(ICON.down)}Excel</button><button class="btn" data-act="new-charge">${raw(ICON.card)}Charge a card</button></div></div>
      <div class="panel rows">${d.charges.length ? d.charges.map((c) => chargeRow(c, { acts: true, link: false })) : empty('No card payments yet.')}</div>`;
  };

  VIEWS.plans = async () => {
    const d = await api('plans.list');
    return html`
      <div class="head"><div><h1>Payment plans</h1><div class="sub">Split a total into weekly or monthly payments. Stripe collects each one on time.</div></div>
        <div class="acts"><button class="btn" data-act="new-plan">${raw(ICON.plus)}New payment plan</button></div></div>
      <div class="panel rows">${d.plans.length ? d.plans.map((p) => planRow(p, { acts: true, client: true })) : empty('No payment plans yet.')}</div>`;
  };

  // periods
  function period(key) {
    const n = new Date(), y = n.getFullYear(), m = n.getMonth();
    const D = (yy, mm, dd) => ymd(new Date(yy, mm, dd));
    switch (key) {
      case 'last-month': return { from: D(y, m - 1, 1), to: D(y, m, 0) };
      case 'quarter': { const q0 = Math.floor(m / 3) * 3; return { from: D(y, q0, 1), to: today() }; }
      case 'year': return { from: D(y, 0, 1), to: today() };
      case 'last-year': return { from: D(y - 1, 0, 1), to: D(y - 1, 11, 31) };
      default: return { from: D(y, m, 1), to: today() };
    }
  }
  const PERIODS = [['month', 'This month'], ['last-month', 'Last month'], ['quarter', 'This quarter'], ['year', 'This year'], ['last-year', 'Last year'], ['custom', 'Pick dates']];
  let books = { period: 'month', from: '', to: '', kind: '' };
  let rep = { period: 'month', from: '', to: '' };
  function periodBar(st, id) {
    return html`<div class="bar noprint" id="${id}">
      <select data-period="${id}" style="max-width:200px">${PERIODS.map(([v, l]) => html`<option value="${v}" ${raw(st.period === v ? 'selected' : '')}>${l}</option>`)}</select>
      <span class="${st.period === 'custom' ? '' : 'hide'}" data-custom="${id}" style="display:flex;gap:8px;align-items:center">
        <input type="date" data-from="${id}" value="${st.from}" style="max-width:170px"> to <input type="date" data-to="${id}" value="${st.to}" style="max-width:170px">
        <button class="btn sm" data-act="period-go" data-id="${id}">Show</button></span>
    </div>`;
  }
  function range(st) { return st.period === 'custom' && st.from && st.to ? { from: st.from, to: st.to } : period(st.period); }

  function entryRow(e) {
    state.entries[e.id] = e;
    const inc = e.kind === 'income';
    return html`<div class="row click ${inc ? 'posi' : 'neg'}" data-act="edit-entry" data-id="${e.id}" tabindex="0">
      <div class="main"><b>${e.party || e.client_name || e.category}</b><span>${[fmtDate(e.date), e.category, e.method, e.note].filter(Boolean).join(' · ')}</span></div>
      ${pill(inc ? 'paid' : 'overdue', inc ? 'income' : 'expense')}
      <div class="amt">${inc ? '' : '−'}${money(e.amount_cents)}</div></div>`;
  }
  VIEWS.books = async () => {
    const r = range(books);
    const d = await api('entries.list', { from: r.from, to: r.to });
    state.entryList = d.entries;
    const inc = d.entries.filter((e) => e.kind === 'income').reduce((s, e) => s + e.amount_cents, 0);
    const exp = d.entries.filter((e) => e.kind === 'expense').reduce((s, e) => s + e.amount_cents, 0);
    return html`
      <div class="head"><div><h1>Books</h1><div class="sub">Cash, checks, Zelle and every expense. Card payments through Stripe are counted automatically in Reports.</div></div>
        <div class="acts"><button class="btn ghost" data-act="export-books">${raw(ICON.down)}Excel</button>
          <button class="btn ghost" data-act="new-entry" data-kind="income">${raw(ICON.plus)}Income</button>
          <button class="btn" data-act="new-entry" data-kind="expense">${raw(ICON.plus)}Expense</button></div></div>
      ${periodBar(books, 'bk')}
      <div class="kpis three">
        ${kpi('Recorded income', money(inc), fmtDate(r.from) + ' – ' + fmtDate(r.to), 'pos')}
        ${kpi('Expenses', money(exp), d.entries.filter((e) => e.kind === 'expense').length + ' entries', 'neg')}
        ${kpi('Difference', money(inc - exp), 'without card payments')}
      </div>
      <div class="chips" style="margin-top:16px" id="kchips">${[['', 'All'], ['income', 'Income'], ['expense', 'Expenses']].map(([v, l]) => html`<button type="button" data-kf="${v}" class="${books.kind === v ? 'on' : ''}">${l}</button>`)}</div>
      <div class="panel rows" id="klist"></div>`;
  };
  function drawBooks() {
    const box = $('#klist'); if (!box) return;
    const list = (state.entryList || []).filter((e) => !books.kind || e.kind === books.kind);
    box.innerHTML = (list.length ? html`${list.map(entryRow)}` : empty('Nothing recorded for these dates.')).s;
  }

  VIEWS.reports = async () => {
    const r = range(rep);
    const d = await api('report', r);
    state.report = d;
    const line = (l, v, cls) => html`<div class="l ${cls || ''}"><span>${l}</span><span class="num">${v}</span></div>`;
    return html`
      <div class="head"><div><h1>Reports</h1><div class="sub">Profit and loss, ${fmtDate(d.from)} – ${fmtDate(d.to)}</div></div>
        <div class="acts downloads">
          <button class="btn ghost" data-act="export-pl">${raw(ICON.down)}Profit &amp; loss</button>
          <button class="btn ghost" data-act="export-tx">${raw(ICON.down)}All transactions</button>
          <button class="btn" data-act="print">${raw(ICON.down)}PDF</button></div></div>
      ${periodBar(rep, 'rp')}
      <div class="kpis">
        ${kpi('Income', money(d.totals.income), 'after card fees and refunds', 'pos')}
        ${kpi('Expenses', money(d.totals.expenses), d.expenses.byCategory.length + ' categories', 'neg')}
        ${kpi('Profit', money(d.totals.profit), '', d.totals.profit >= 0 ? 'pos' : 'neg')}
        ${kpi('Card payments', String(d.stripe.count), money(d.stripe.gross) + ' before fees')}
      </div>
      <div class="cols" style="margin-top:20px">
        <div class="panel pl">
          ${line('Income', '', 'h')}
          ${line('Card payments (Stripe)', money(d.stripe.gross), 'sub')}
          ${d.stripe.refunds ? line('Refunds', money(d.stripe.refunds), 'sub') : ''}
          ${line('Card fees', '−' + money(d.stripe.fees), 'sub')}
          ${d.stripe.other ? line('Other Stripe items', money(d.stripe.other), 'sub') : ''}
          ${d.income.byCategory.map((x) => line(x.category, money(x.cents), 'sub'))}
          ${line('Total income', money(d.totals.income), 't')}
          ${line('Expenses', '', 'h')}
          ${d.expenses.byCategory.length ? d.expenses.byCategory.map((x) => line(x.category, money(x.cents), 'sub')) : line('No expenses recorded', '', 'sub')}
          ${line('Total expenses', money(d.totals.expenses), 't')}
          ${line('Profit', money(d.totals.profit), 'h t')}
        </div>
        <div class="panel tablewrap"><table class="t"><thead><tr><th>Month</th><th class="n">Card (net)</th><th class="n">Other income</th><th class="n">Expenses</th><th class="n">Profit</th></tr></thead>
          <tbody>${d.months.length ? d.months.map((m) => html`<tr><td>${new Date(m.month + '-15T12:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</td><td class="n">${money(m.stripe)}</td><td class="n">${money(m.income)}</td><td class="n">${money(m.expenses)}</td><td class="n">${money(m.profit)}</td></tr>`) : html`<tr><td colspan="5" class="muted">No activity in these dates.</td></tr>`}</tbody></table></div>
      </div>
      <p class="hint" style="margin-top:14px">For your accountant: card income is shown after Stripe fees. This is a simple summary, not tax advice.</p>`;
  };

  VIEWS.settings = async () => {
    const d = await api('settings.get');
    state.cfg = d;
    const s = d.settings, em = d.email.ready;
    const sw = (key, title, sub, needMail) => html`<label class="setrow ${needMail && !em ? 'off' : ''}"><div><b>${title}</b>${sub ? html`<span>${sub}</span>` : ''}</div>
      <span class="switch"><input type="checkbox" data-set="${key}" ${raw(s[key] ? 'checked' : '')} ${raw(needMail && !em ? 'disabled' : '')}><i></i></span></label>`;
    const field = (key, title, type = 'text') => html`<label class="setrow"><div><b>${title}</b></div><input data-set="${key}" type="${type}" value="${s[key]}" maxlength="200"></label>`;
    return html`
      <div class="head"><div><h1>Settings</h1><div class="sub">Switch features on or off, automatic emails, alerts and how invoices look.</div></div>
        <div class="acts"><button class="btn" data-act="settings-save">Save settings</button></div></div>

      <h2 class="sec">Features <span class="muted">Off = hidden from the admin</span></h2>
      <div class="panel">
        ${sw('f_payments', 'Payments page', 'List of card payments, refunds')}
        ${sw('f_cards', 'Cards on file', '"Save card" links and charging a saved card')}
        ${sw('f_plans', 'Payment plans', 'Weekly or monthly payments')}
        ${sw('f_books', 'Books', 'Cash, checks, Zelle and expenses')}
        ${sw('f_reports', 'Reports', 'Profit and loss, Excel downloads')}
        ${sw('f_discounts', 'Discounts on invoices', '% or $ off')}
        ${sw('f_fields', 'Project and PO number on invoices', '')}
        ${sw('f_cc', 'CC on invoice emails', '')}
        ${sw('f_ach', 'Bank payments (ACH)', 'Turn on ACH Direct Debit in Stripe → Settings → Payment methods first')}
        ${sw('f_reminders', 'Invoice reminders', 'Daily check; emails go out 3 days before, on the due date, and 7 days late')}
        ${sw('f_leads', 'Website messages become leads', 'The contact form on gogetterinc.com adds the person here')}
        ${sw('f_notifications', 'Notifications bell', '')}
      </div>

      <h2 class="sec">Payment alerts</h2>
      <div class="panel pad">${!d.stripe ? html`<p class="muted">Connect Stripe first.</p>` : d.alerts.connected
        ? html`<div class="status"><span class="ok">${raw(ICON.ok)}</span><div><b>On.</b> Stripe tells the admin right away when a client pays, a payment fails, a card is saved or a dispute opens.</div></div>`
        : html`<div class="status"><div><b>Off.</b> Turn this on so payments show up by themselves, receipts go out, and you get notified.</div><button class="btn" data-act="alerts-connect">Turn on</button></div>`}</div>

      <h2 class="sec">Email</h2>
      <div class="panel pad">${em
        ? html`<div class="status"><span class="ok">${raw(ICON.ok)}</span><div><b>Connected.</b> Emails go out from ${d.email.from}.</div><button class="btn ghost" data-act="email-test">Send me a test</button></div>`
        : html`<b>Not connected yet.</b> Until then, Stripe sends the invoice emails. To send your own branded emails with the PDF:
          <ol class="steps">
            <li>Make a free account at <b>resend.com</b> (up to 3,000 emails a month free).</li>
            <li><b>Domains → Add domain → gogetterinc.com</b>. Add the DNS records it shows where your domain's DNS is (if it's on Vercel: Vercel → Domains → gogetterinc.com). Wait until it says Verified.</li>
            <li><b>API Keys → Create API key</b>, copy it.</li>
            <li>Vercel → gogetterny → <b>Settings → Environment Variables</b> → add <code>RESEND_API_KEY</code> → Save → Redeploy.</li>
          </ol>`}</div>

      <h2 class="sec">Emails to clients</h2>
      <div class="panel">
        ${sw('invoices_from_us', 'Send invoices from GO GETTER', 'Your own design with a Pay button and the PDF attached, instead of Stripe\'s email', true)}
        ${sw('paid_thankyou', 'Receipt after they pay', 'Thank-you email with the PAID receipt PDF. Turn off Stripe\'s own receipts so they don\'t get two.', true)}
        ${sw('lead_autoreply', 'Auto-reply to website messages', '"We got your message, we reply within 24 hours."', true)}
      </div>

      <h2 class="sec">Alerts to you</h2>
      <div class="panel">
        ${field('alert_email', 'Send alerts to', 'email')}
        ${sw('alert_paid', 'A client paid online', '', true)}
        ${sw('alert_failed', 'A payment failed or a dispute opened', '', true)}
        ${sw('alert_card', 'A client saved a card', '', true)}
        ${sw('alert_lead', 'New website message', 'Off by default: the website form already emails you', true)}
      </div>
      <p class="hint">The bell in the admin always shows these, even without email.</p>

      <h2 class="sec">New invoices start with</h2>
      <div class="panel">
        ${sw('ach_default', 'Bank payment (ACH) turned on', '')}
        ${sw('remind_default', 'Reminders turned on', '', true)}
      </div>

      <h2 class="sec">On your invoices and emails</h2>
      <div class="panel">
        ${field('biz_name', 'Business name')}
        ${field('biz_address', 'Address')}
        ${field('biz_phone', 'Phone', 'tel')}
        ${field('biz_email', 'Email (clients reply here)', 'email')}
        ${field('invoice_thanks', 'Thank-you line')}
        <label class="setrow col"><div><b>Terms printed on invoices</b><span>Shown at the bottom of every invoice PDF.</span></div><textarea data-set="invoice_terms" maxlength="1000">${s.invoice_terms}</textarea></label>
      </div>
      <p class="hint">Your full <a href="/terms" target="_blank" rel="noopener">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a> are on the website and linked from every email.</p>

      <div class="saverow"><button class="btn" data-act="settings-save">Save settings</button>
        <button class="btn ghost" type="button" data-act="theme" data-label="1">${raw(isLight() ? ICON.moon : ICON.sun)}<span>${isLight() ? 'Night mode' : 'Day mode'}</span></button>
        <button class="btn ghost" type="button" data-act="logout">${raw(ICON.out)}<span>Sign out</span></button></div>`;
  };

  async function saveSettings(btn) {
    const out = {};
    $$('#view [data-set]').forEach((el) => { out[el.dataset.set] = el.type === 'checkbox' ? el.checked : el.value; });
    await busy(btn, async () => {
      try {
        state.cfg = await api('settings.save', { settings: out });
        toast('Settings saved');
        shell(); route();
      } catch (err) { toast(err.message, true); }
    });
  }

  // ---------------------------------------------------------------- dialogs
  function modal(title, body, foot) {
    const d = document.createElement('dialog');
    d.innerHTML = html`<form method="dialog" class="dh"><h3>${title}</h3><button value="x" aria-label="Close">×</button></form>
      <form class="mform" novalidate><div class="db">${body}<p class="err" data-err></p></div><div class="df">${foot}</div></form>`.s;
    document.body.appendChild(d);
    d.addEventListener('close', () => d.remove());
    d.addEventListener('click', (e) => { if (e.target === d) d.close(); });
    d.showModal();
    const form = d.querySelector('.mform');
    const err = (m) => { d.querySelector('[data-err]').textContent = m || ''; };
    return { d, form, err, close: () => d.close() };
  }
  async function busy(btn, fn) {
    const t = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Working…'; }
    try { return await fn(); } finally { if (btn && btn.isConnected) { btn.disabled = false; btn.innerHTML = t; } }
  }
  async function clientOptions(selected) {
    const list = await clientsCache();
    return html`<option value="">Choose a client…</option>${list.map((c) => html`<option value="${c.id}" ${raw(String(c.id) === String(selected) ? 'selected' : '')}>${c.name}${c.company ? ' · ' + c.company : ''}</option>`)}`;
  }
  const clientField = async (sel, id = 'f-client') => html`<div><label for="${id}">Client</label><select id="${id}" required>${await clientOptions(sel)}</select>
    <div class="hint">Not in the list? <button type="button" class="linkbtn" data-act="new-client" data-return="1">Add a new client</button></div></div>`;

  async function clientForm(id) {
    let c = { status: 'active' };
    if (id) c = (await api('clients.get', { id: Number(id) })).client;
    const m = modal(id ? 'Edit client' : 'New client', html`<div class="fields">
      <div class="grid2"><div><label for="c-name">Name</label><input id="c-name" value="${c.name || ''}" required maxlength="120"></div>
        <div><label for="c-company">Company</label><input id="c-company" value="${c.company || ''}" maxlength="120"></div></div>
      <div class="grid2"><div><label for="c-email">Email</label><input id="c-email" type="email" value="${c.email || ''}" maxlength="200"></div>
        <div><label for="c-phone">Phone</label><input id="c-phone" type="tel" value="${c.phone || ''}" maxlength="40"></div></div>
      <div><label for="c-address">Address</label><input id="c-address" value="${c.address || ''}" maxlength="300"></div>
      <div><label for="c-status">Status</label><select id="c-status">${[['lead', 'Lead (not a client yet)'], ['active', 'Active client'], ['past', 'Past client']].map(([v, l]) => html`<option value="${v}" ${raw(c.status === v ? 'selected' : '')}>${l}</option>`)}</select></div>
      <div><label for="c-notes">Notes</label><textarea id="c-notes" maxlength="4000">${c.notes || ''}</textarea></div>
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    return new Promise((resolve) => {
      m.d.addEventListener('close', () => resolve(null));
      m.form.addEventListener('submit', async (e) => {
        e.preventDefault(); m.err('');
        await busy(m.form.querySelector('[type=submit]'), async () => {
          try {
            const r = await api('clients.save', { id: id ? Number(id) : undefined, name: $('#c-name', m.d).value, company: $('#c-company', m.d).value,
              email: $('#c-email', m.d).value, phone: $('#c-phone', m.d).value, address: $('#c-address', m.d).value, status: $('#c-status', m.d).value, notes: $('#c-notes', m.d).value });
            await clientsCache(true);
            toast(id ? 'Saved' : 'Client added');
            resolve(r.id); m.close();
          } catch (err) { m.err(err.message); }
        });
      });
    });
  }

  function cardOptions(cards, name = 'f-card') {
    return html`<select id="${name}">${cards.map((k) => html`<option value="${k.id}">${k.brand} •••• ${k.last4} (exp ${k.exp})</option>`)}</select>`;
  }

  async function invoiceForm(clientId) {
    const m = modal('New invoice', html`<div class="fields">
      ${await clientField(clientId)}
      <div><label>What is it for?</label><div class="lines" id="lines"></div>
        <button type="button" class="linkbtn" data-add-line style="margin-top:8px">+ Add a line</button></div>
      <div class="grid2"><div><label for="f-due">Due</label><select id="f-due"><option value="0">On receipt</option><option value="7" selected>In 7 days</option><option value="14">In 14 days</option><option value="30">In 30 days</option></select></div>
        <div><label for="f-memo">Note on invoice (optional)</label><input id="f-memo" maxlength="500" placeholder="Thank you!"></div></div>
      <div class="totals">
        ${on('f_discounts') ? html`<div class="tl"><span>Subtotal</span><span class="num" id="f-sub">$0.00</span></div>
        <div class="tl"><span class="disc"><select id="f-dtype" aria-label="Discount"><option value="">No discount</option><option value="percent">Discount %</option><option value="amount">Discount $</option></select>
          <input id="f-dval" inputmode="decimal" placeholder="0" aria-label="Discount amount" class="hide"></span><span class="num" id="f-disc"></span></div>` : ''}
        <div class="total"><span>Total</span><b class="num" id="f-total">$0.00</b></div>
      </div>
      ${(() => {
        const c = [];
        const cfg = (state.cfg && state.cfg.settings) || {};
        if (on('f_ach')) c.push(html`<label class="check" id="c-bank"><input type="checkbox" id="f-bank" ${raw(cfg.ach_default ? 'checked' : '')}><div><b>Let them pay by bank (ACH)</b><span>Fee 0.8%, max $5, instead of about 3% by card.</span></div></label>`);
        if (on('f_reminders')) c.push(html`<label class="check ${mailOn() ? '' : 'off'}" id="c-remind"><input type="checkbox" id="f-remind" ${raw(mailOn() && cfg.remind_default !== false ? 'checked' : '')} ${raw(mailOn() ? '' : 'disabled')}><div><b>Send reminders until paid</b><span>${mailOn() ? '3 days before, on the due date, and 7 days late. The PDF is attached.' : 'Connect email in Settings first.'}</span></div></label>`);
        return c.length ? html`<div class="checks">${c}</div>` : '';
      })()}
      ${on('f_fields') || on('f_cc') ? html`<details class="more"><summary>More options</summary><div class="fields">
        ${on('f_fields') ? html`<div class="grid2"><div><label for="f-project">Project</label><input id="f-project" maxlength="140" placeholder="Shows on the invoice"></div>
          <div><label for="f-po">PO number</label><input id="f-po" maxlength="140"></div></div>` : ''}
        ${on('f_cc') ? html`<div><label for="f-cc">Also email to (CC)</label><input id="f-cc" placeholder="accounts@client.com" ${raw(mailOn() ? '' : 'disabled')}>
          <div class="hint">${mailOn() ? 'Up to 3 emails, with commas. They get the invoice, reminders and receipt too.' : 'Works when email is connected in Settings.'}</div></div>` : ''}
      </div></details>` : ''}
      <div><label>How do you want to send it?</label><div class="choices" id="f-mode">
        <label class="choice"><input type="radio" name="mode" value="link" checked><div><b>Get a pay link</b><span>Copy it and send by WhatsApp, text or email. They pay by card on Stripe.</span></div></label>
        <label class="choice" data-need="email"><input type="radio" name="mode" value="email"><div><b>Email the invoice</b><span data-email-note>Stripe emails it with a Pay button.</span></div></label>
        <label class="choice ${on('f_cards') ? '' : 'hide'}" data-need="card"><input type="radio" name="mode" value="charge"><div><b>Charge the saved card now</b><span data-card-note>No card saved for this client.</span></div></label>
        <label class="choice"><input type="radio" name="mode" value="draft"><div><b>Save as draft</b><span>Send it later.</span></div></label>
      </div><div id="f-cardpick" class="hide" style="margin-top:8px"></div></div>
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit" id="f-go">Create invoice</button>`);
    const linesBox = $('#lines', m.d);
    const addLine = (desc = '', qty = 1, price = '') => {
      const row = document.createElement('div'); row.className = 'line';
      row.innerHTML = html`<input placeholder="Description" maxlength="300" value="${desc}" aria-label="Description"><input inputmode="numeric" value="${qty}" aria-label="Quantity" title="Quantity"><input inputmode="decimal" placeholder="Price" value="${price}" aria-label="Price"><button type="button" class="x" aria-label="Remove line">×</button>`.s;
      row.querySelector('.x').addEventListener('click', () => { if (linesBox.children.length > 1) { row.remove(); sum(); } });
      linesBox.appendChild(row);
    };
    const read = () => Array.from(linesBox.children).map((r) => { const [a, b, c] = r.querySelectorAll('input'); return { description: a.value.trim(), qty: Math.max(1, parseInt(b.value, 10) || 1), unit_cents: parseMoney(c.value) }; });
    const discount = (sub) => {
      const t = $('#f-dtype', m.d); if (!t || !t.value) return { cents: 0, send: null };
      const raw = $('#f-dval', m.d).value;
      if (t.value === 'percent') { const p = parseFloat(String(raw).replace(/[%\s]/g, '')); return { cents: p > 0 && p <= 100 ? Math.round(sub * p / 100) : NaN, send: { type: 'percent', value: p } }; }
      const c = parseMoney(raw); return { cents: c > 0 ? c : NaN, send: { type: 'amount', value: c } };
    };
    const sum = () => {
      const sub = read().reduce((s, l) => s + (isNaN(l.unit_cents) ? 0 : l.unit_cents * l.qty), 0);
      const d = discount(sub);
      if ($('#f-sub', m.d)) { $('#f-sub', m.d).textContent = money(sub); $('#f-disc', m.d).textContent = d.cents ? (isNaN(d.cents) ? '' : '−' + money(d.cents)) : ''; }
      const t = sub - (d.cents || 0);
      $('#f-total', m.d).textContent = money(Math.max(0, t)); return t;
    };
    addLine();
    linesBox.addEventListener('input', sum);
    if ($('#f-dtype', m.d)) {
      $('#f-dtype', m.d).addEventListener('change', (e) => { const v = $('#f-dval', m.d); v.classList.toggle('hide', !e.target.value); v.placeholder = e.target.value === 'percent' ? '10' : '0.00'; if (e.target.value) v.focus(); sum(); });
      $('#f-dval', m.d).addEventListener('input', sum);
    }
    $('[data-add-line]', m.d).addEventListener('click', () => { addLine(); linesBox.lastElementChild.querySelector('input').focus(); });
    let cards = [];
    const sel = $('#f-client', m.d);
    const setMode = () => {
      const mode = (m.form.querySelector('input[name=mode]:checked') || {}).value;
      $('#f-cardpick', m.d).classList.toggle('hide', mode !== 'charge' || cards.length < 2);
      ['#c-bank', '#c-remind'].forEach((k) => { const el = $(k, m.d); if (el) el.classList.toggle('hide', mode === 'charge'); });
      $('#f-go', m.d).textContent = { link: 'Create and get link', email: 'Create and email', charge: 'Create and charge card', draft: 'Save draft' }[mode] || 'Create invoice';
    };
    const loadCards = async () => {
      cards = []; let mail = '';
      if (sel.value) { try { const r = await api('cards.list', { client_id: Number(sel.value) }); cards = r.cards; mail = r.email; } catch (e) {} }
      const ec = $('[data-need=email]', m.d), cc = $('[data-need=card]', m.d);
      const own = mailOn() && state.cfg.settings.invoices_from_us !== false;
      ec.classList.toggle('off', !mail); ec.querySelector('[data-email-note]').textContent = !mail ? 'This client has no email yet.'
        : own ? `GO GETTER emails it to ${mail}, with a Pay button and the PDF attached.` : `Stripe emails it to ${mail} with a Pay button.`;
      cc.classList.toggle('off', !cards.length); cc.querySelector('[data-card-note]').textContent = cards.length ? `${cards[0].brand} •••• ${cards[0].last4}` : 'No card saved for this client.';
      $('#f-cardpick', m.d).innerHTML = cards.length ? cardOptions(cards).s : '';
      const cur = m.form.querySelector('input[name=mode]:checked');
      if (cur && cur.closest('.choice').classList.contains('off')) m.form.querySelector('input[value=link]').checked = true;
      setMode();
    };
    sel.addEventListener('change', loadCards);
    $('#f-mode', m.d).addEventListener('change', setMode);
    loadCards();
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault(); m.err('');
      const items = read().filter((l) => l.description || !isNaN(l.unit_cents));
      if (!sel.value) return m.err('Choose a client');
      if (!items.length || items.some((l) => !l.description)) return m.err('Each line needs a description');
      if (items.some((l) => isNaN(l.unit_cents) || l.unit_cents <= 0)) return m.err('Each line needs a price, like 250 or 99.50');
      const mode = m.form.querySelector('input[name=mode]:checked').value;
      const sub = read().reduce((s, l) => s + l.unit_cents * l.qty, 0);
      const disc = discount(sub);
      if (isNaN(disc.cents)) return m.err('Enter the discount, like 10 for 10% or 50 for $50');
      if (disc.cents >= sub) return m.err('The discount is as big as the invoice');
      const total = sum();
      if (mode === 'charge' && !confirm(`Charge ${money(total)} to the saved card now?`)) return;
      const val = (k) => { const el = $(k, m.d); return el ? el.value : ''; };
      const chk = (k) => { const el = $(k, m.d); return !!(el && el.checked && !el.disabled); };
      await busy($('#f-go', m.d), async () => {
        try {
          const pm = $('#f-card', m.d);
          const r = await api('invoices.create', { client_id: Number(sel.value), items, due_days: Number($('#f-due', m.d).value), memo: $('#f-memo', m.d).value, mode, pm_id: pm ? pm.value : '',
            discount: disc.send, bank: chk('#f-bank'), remind: chk('#f-remind'), project: val('#f-project'), po: val('#f-po'), cc: val('#f-cc') });
          m.close();
          if (mode === 'link' && r.invoice.url) shareLink('Pay link ready', r.invoice.url, r.invoice, 'invoice');
          else toast(mode === 'email' ? 'Invoice emailed' : mode === 'charge' ? 'Card charged, invoice paid' : 'Draft saved');
          refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  function shareLink(title, url, inv, kind) {
    const name = inv && inv.name ? inv.name.split(' (')[0] : '';
    const text = kind === 'card'
      ? `Hi${name ? ' ' + name : ''}, please add your card for GO GETTER here (secure Stripe page): ${url}`
      : `Hi${name ? ' ' + name : ''}, here is your GO GETTER invoice${inv && inv.number ? ' ' + inv.number : ''} for ${money(inv.due || inv.total)}. You can pay securely here: ${url}`;
    const email = inv && inv.email ? inv.email : '';
    const m = modal(title, html`<div class="fields">
      <p class="soft">${kind === 'card' ? "They type their card on Stripe's secure page. You never see the card number. The link works for 24 hours." : 'Send this link. They can pay by card on Stripe.'}</p>
      <div class="linkbox"><input id="sl" readonly value="${url}"><button type="button" class="btn sm" data-copy>Copy</button></div>
      <div class="downloads">
        <a class="btn ghost sm" href="${safeUrl(url)}" target="_blank" rel="noopener">Open</a>
        <a class="btn ghost sm" href="${raw('sms:?&body=' + encodeURIComponent(text))}">Text it</a>
        <a class="btn ghost sm" href="${raw('https://wa.me/?text=' + encodeURIComponent(text))}" target="_blank" rel="noopener">WhatsApp</a>
        <a class="btn ghost sm" href="${raw('mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent(kind === 'card' ? 'Add your card' : 'Your invoice from GO GETTER') + '&body=' + encodeURIComponent(text))}">Email it</a>
      </div></div>`, html`<button type="button" class="btn" data-close>Done</button>`);
    $('[data-copy]', m.d).addEventListener('click', () => copy(url));
  }

  async function chargeForm(clientId) {
    const m = modal('Charge a card', html`<div class="fields">
      ${await clientField(clientId)}
      <div id="ch-card"></div>
      <div class="grid2"><div><label for="ch-amt">Amount</label><input id="ch-amt" inputmode="decimal" placeholder="0.00"></div>
        <div><label for="ch-desc">For</label><input id="ch-desc" maxlength="300" placeholder="What is it for?"></div></div>
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit" id="ch-go">Charge</button>`);
    const sel = $('#f-client', m.d);
    let cards = [];
    const load = async () => {
      cards = [];
      const box = $('#ch-card', m.d);
      box.innerHTML = '';
      if (!sel.value) return;
      try { cards = (await api('cards.list', { client_id: Number(sel.value) })).cards; } catch (e) {}
      box.innerHTML = (cards.length ? html`<label for="f-card">Card</label>${cardOptions(cards)}`
        : html`<div class="preview">No card saved for this client. <button type="button" class="linkbtn" data-act="card-link" data-client="${sel.value}">Send them a "save card" link</button>, or send an invoice instead.</div>`).s;
    };
    sel.addEventListener('change', load); load();
    const amt = $('#ch-amt', m.d);
    amt.addEventListener('input', () => { const c = parseMoney(amt.value); $('#ch-go', m.d).textContent = isNaN(c) || !c ? 'Charge' : 'Charge ' + money(c); });
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault(); m.err('');
      const c = parseMoney(amt.value);
      if (!sel.value) return m.err('Choose a client');
      if (!cards.length) return m.err('This client has no saved card');
      if (isNaN(c) || c <= 0) return m.err('Enter an amount, like 250 or 99.50');
      if (!$('#ch-desc', m.d).value.trim()) return m.err('Say what the charge is for');
      if (!confirm(`Charge ${money(c)} to ${$('#f-card', m.d).selectedOptions[0].textContent}?`)) return;
      await busy($('#ch-go', m.d), async () => {
        try {
          const r = await api('charges.create', { client_id: Number(sel.value), pm_id: $('#f-card', m.d).value, amount_cents: c, description: $('#ch-desc', m.d).value });
          m.close(); toast(r.ok ? 'Charged ' + money(c) : 'Charge is processing'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  async function planForm(clientId) {
    const m = modal('New payment plan', html`<div class="fields">
      ${await clientField(clientId)}
      <div><label for="p-title">Name of the plan</label><input id="p-title" maxlength="120" placeholder="e.g. Website project"></div>
      <div class="grid2"><div><label for="p-total">Total amount</label><input id="p-total" inputmode="decimal" placeholder="0.00"></div>
        <div><label for="p-count">Number of payments</label><input id="p-count" inputmode="numeric" value="6"></div></div>
      <div class="grid2"><div><label>How often</label><div class="seg" id="p-every"><button type="button" data-v="month" class="on">Monthly</button><button type="button" data-v="week">Weekly</button></div></div>
        <div><label for="p-start">First payment</label><input id="p-start" type="date" value="${today()}" min="${today()}"></div></div>
      <div><label>How to collect</label><div class="choices" id="p-how">
        <label class="choice" data-need="card"><input type="radio" name="how" value="auto"><div><b>Charge the card automatically</b><span data-card-note>No card saved for this client.</span></div></label>
        <label class="choice" data-need="email"><input type="radio" name="how" value="email"><div><b>Email an invoice each time</b><span data-email-note>They pay each one by card.</span></div></label>
      </div><div id="p-cardpick" class="hide" style="margin-top:8px"></div></div>
      <div class="preview" id="p-prev">Fill in the total and number of payments.</div>
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit" id="p-go">Start plan</button>`);
    let every = 'month', cards = [], mail = '';
    const sel = $('#f-client', m.d);
    const preview = () => {
      const t = parseMoney($('#p-total', m.d).value), n = parseInt($('#p-count', m.d).value, 10), s = $('#p-start', m.d).value;
      const box = $('#p-prev', m.d);
      if (isNaN(t) || !t || !(n >= 2 && n <= 60) || !s) { box.textContent = 'Fill in the total and a number of payments from 2 to 60.'; return; }
      const per = Math.floor(t / n), first = t - per * (n - 1);
      const last = new Date(s + 'T12:00:00'); if (every === 'week') last.setDate(last.getDate() + 7 * (n - 1)); else last.setMonth(last.getMonth() + n - 1);
      box.textContent = `${n} ${every === 'week' ? 'weekly' : 'monthly'} payments of ${money(per)}${first !== per ? ` (the first one ${money(first)})` : ''}, from ${fmtDate(s)} to ${fmtDate(ymd(last))}. Total ${money(t)}.`;
    };
    const setHow = () => {
      const how = (m.form.querySelector('input[name=how]:checked') || {}).value;
      $('#p-cardpick', m.d).classList.toggle('hide', how !== 'auto' || cards.length < 2);
    };
    const load = async () => {
      cards = []; mail = '';
      if (sel.value) { try { const r = await api('cards.list', { client_id: Number(sel.value) }); cards = r.cards; mail = r.email; } catch (e) {} }
      const cc = $('[data-need=card]', m.d), ec = $('[data-need=email]', m.d);
      cc.classList.toggle('off', !cards.length); cc.querySelector('[data-card-note]').textContent = cards.length ? `${cards[0].brand} •••• ${cards[0].last4}, on each due date` : 'No card saved for this client.';
      ec.classList.toggle('off', !mail); ec.querySelector('[data-email-note]').textContent = mail ? `Sent to ${mail}; they pay each one by card.` : 'This client has no email yet.';
      $('#p-cardpick', m.d).innerHTML = cards.length ? cardOptions(cards).s : '';
      m.form.querySelectorAll('input[name=how]').forEach((r) => { r.checked = false; });
      const pick = cards.length ? 'auto' : mail ? 'email' : '';
      if (pick) m.form.querySelector(`input[value=${pick}]`).checked = true;
      setHow();
    };
    sel.addEventListener('change', load); load();
    $('#p-every', m.d).addEventListener('click', (e) => { const b = e.target.closest('button'); if (!b) return; every = b.dataset.v; $$('#p-every button', m.d).forEach((x) => x.classList.toggle('on', x === b)); preview(); });
    $('#p-how', m.d).addEventListener('change', setHow);
    m.form.addEventListener('input', preview);
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault(); m.err('');
      const t = parseMoney($('#p-total', m.d).value), n = parseInt($('#p-count', m.d).value, 10);
      const how = (m.form.querySelector('input[name=how]:checked') || {}).value;
      if (!sel.value) return m.err('Choose a client');
      if (isNaN(t) || !t) return m.err('Enter the total, like 3000');
      if (!(n >= 2 && n <= 60)) return m.err('Number of payments must be 2 to 60');
      if (!how) return m.err('Save a card for this client or add their email first');
      preview();
      if (!confirm($('#p-prev', m.d).textContent + (how === 'auto' ? '\n\nThe card will be charged on each date.' : '\n\nAn invoice will be emailed on each date.') + '\n\nStart this plan?')) return;
      await busy($('#p-go', m.d), async () => {
        try {
          const pm = $('#f-card', m.d);
          await api('plans.create', { client_id: Number(sel.value), title: $('#p-title', m.d).value, total_cents: t, count: n, every, start_date: $('#p-start', m.d).value, autopay: how === 'auto', pm_id: pm ? pm.value : '' });
          m.close(); toast('Payment plan started'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  const CATS = {
    income: ['Projects', 'Consulting', 'Hardware sales', 'Invoices', 'Other income'],
    expense: ['Hardware & inventory', 'Shipping & freight', 'Contractors & developers', 'Software & subscriptions', 'Phone & internet', 'Travel', 'Office & supplies', 'Marketing', 'Bank & card fees', 'Taxes & licenses', 'Other']
  };
  const METHODS = ['Cash', 'Check', 'Zelle', 'Bank transfer', 'Card', 'Other'];
  async function entryForm(kind, id) {
    const e0 = id ? state.entries[id] : { kind, date: today(), method: kind === 'expense' ? 'Card' : 'Zelle' };
    let k = e0.kind || kind || 'expense';
    const m = modal(id ? 'Edit entry' : (k === 'income' ? 'Add income' : 'Add expense'), html`<div class="fields">
      <div class="seg inc" id="e-kind"><button type="button" data-v="income" class="${k === 'income' ? 'on' : ''}">Income</button><button type="button" data-v="expense" class="${k === 'expense' ? 'on' : ''}">Expense</button></div>
      <div class="grid2"><div><label for="e-amt">Amount</label><input id="e-amt" inputmode="decimal" placeholder="0.00" value="${e0.amount_cents ? plain(e0.amount_cents) : ''}"></div>
        <div><label for="e-date">Date</label><input id="e-date" type="date" value="${e0.date}"></div></div>
      <div class="grid2"><div><label for="e-cat">Category</label><select id="e-cat"></select></div>
        <div><label for="e-method">Paid by</label><select id="e-method">${METHODS.map((x) => html`<option ${raw(e0.method === x ? 'selected' : '')}>${x}</option>`)}</select></div></div>
      <div><label for="e-party" id="e-party-l">${k === 'income' ? 'Received from' : 'Paid to'}</label><input id="e-party" maxlength="120" value="${e0.party || ''}"></div>
      <div><label for="e-client">Client (optional)</label><select id="e-client"><option value="">None</option>${(await clientsCache()).map((c) => html`<option value="${c.id}" ${raw(String(c.id) === String(e0.client_id) ? 'selected' : '')}>${c.name}${c.company ? ' · ' + c.company : ''}</option>`)}</select></div>
      <div><label for="e-note">Note</label><input id="e-note" maxlength="1000" value="${e0.note || ''}" placeholder="e.g. receipt #, what it was for"></div>
    </div>`, html`${id ? html`<button type="button" class="btn danger" id="e-del" style="margin-right:auto">Delete</button>` : ''}<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    const fillCats = () => {
      const s = $('#e-cat', m.d);
      s.innerHTML = html`${CATS[k].map((x) => html`<option ${raw(e0.category === x ? 'selected' : '')}>${x}</option>`)}${e0.category && !CATS[k].includes(e0.category) && e0.kind === k ? html`<option selected>${e0.category}</option>` : ''}`.s;
      $('#e-party-l', m.d).textContent = k === 'income' ? 'Received from' : 'Paid to';
    };
    fillCats();
    $('#e-kind', m.d).addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; k = b.dataset.v; $$('#e-kind button', m.d).forEach((x) => x.classList.toggle('on', x === b)); fillCats(); });
    if (id) $('#e-del', m.d).addEventListener('click', async () => {
      if (!confirm('Delete this entry?')) return;
      try { await api('entries.delete', { id: Number(id) }); m.close(); toast('Deleted'); refresh(); } catch (err) { m.err(err.message); }
    });
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const c = parseMoney($('#e-amt', m.d).value);
      if (isNaN(c) || c <= 0) return m.err('Enter an amount, like 49.99');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          await api('entries.save', { id: id ? Number(id) : undefined, kind: k, date: $('#e-date', m.d).value, amount_cents: c, category: $('#e-cat', m.d).value,
            party: $('#e-party', m.d).value, method: $('#e-method', m.d).value, client_id: $('#e-client', m.d).value ? Number($('#e-client', m.d).value) : null, note: $('#e-note', m.d).value });
          m.close(); toast('Saved'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  function markPaidForm(inv) {
    const m = modal('Mark as paid', html`<div class="fields"><p class="soft">${inv.number} · ${inv.name} · ${money(inv.due)}</p>
      <div><label for="mp-m">How did they pay?</label><select id="mp-m">${['Cash', 'Check', 'Zelle', 'Bank transfer', 'Other'].map((x) => html`<option>${x}</option>`)}</select></div>
      <p class="hint">The invoice is closed and the money is added to your books.</p></div>`,
    html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Mark paid</button>`);
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try { await api('invoices.action', { id: inv.id, action: 'mark_paid', method: $('#mp-m', m.d).value }); m.close(); toast('Marked paid'); refresh(); }
        catch (err) { m.err(err.message); }
      });
    });
  }

  function refundForm(ch) {
    const left = ch.amount - ch.refunded;
    const m = modal('Refund', html`<div class="fields"><p class="soft">${ch.name} · ${ch.description || ''} · ${money(ch.amount)}</p>
      <div><label for="rf-a">Amount to refund</label><input id="rf-a" inputmode="decimal" value="${plain(left)}"></div>
      <p class="hint">The money goes back to their card in 5 to 10 days. Stripe keeps its fee.</p></div>`,
    html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn danger" type="submit">Refund</button>`);
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const c = parseMoney($('#rf-a', m.d).value);
      if (isNaN(c) || c <= 0 || c > left) return m.err('Enter an amount up to ' + money(left));
      if (!confirm(`Refund ${money(c)} to ${ch.name}?`)) return;
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try { await api('charges.refund', { charge_id: ch.id, amount_cents: c }); m.close(); toast('Refunded ' + money(c)); refresh(); }
        catch (err) { m.err(err.message); }
      });
    });
  }

  async function invAction(a, id, btn) {
    const i = state.inv[id];
    if (!i) return;
    if (a === 'copy') return i.url ? shareLink('Pay link', i.url, i, 'invoice') : null;
    if (a === 'paid') return markPaidForm(i);
    if (a === 'void' && !confirm(`Void invoice ${i.number}? It can no longer be paid.`)) return;
    if (a === 'delete' && !confirm('Delete this draft?')) return;
    if (a === 'send' && !confirm(`Email this invoice to ${i.email || 'the client'}?`)) return;
    let pm = '';
    if (a === 'charge') {
      if (!i.client_id) return toast('This invoice is not linked to a client', true);
      const r = await api('cards.list', { client_id: i.client_id });
      if (!r.cards.length) return toast('No card saved for this client. Send them a "save card" link first.', true);
      if (!confirm(`Charge ${money(i.due)} to ${r.cards[0].brand} •••• ${r.cards[0].last4}?`)) return;
      pm = r.cards[0].id;
    }
    await busy(btn, async () => {
      try {
        const r = await api('invoices.action', { id, action: a, pm_id: pm });
        if (a === 'finalize' && r.invoice && r.invoice.url) shareLink('Pay link ready', r.invoice.url, r.invoice, 'invoice');
        else toast({ send: 'Invoice emailed', void: 'Invoice voided', delete: 'Draft deleted', charge: 'Card charged, invoice paid', finalize: 'Invoice ready' }[a] || 'Done');
        refresh();
      } catch (err) { toast(err.message, true); }
    });
  }

  // ---------------------------------------------------------------- exports
  const stamp = () => today();
  const EXPORTS = {
    'export-clients': () => download(`clients-${stamp()}.csv`, csv(state.clients || [], [
      ['Name', (c) => c.name], ['Company', (c) => c.company], ['Email', (c) => c.email], ['Phone', (c) => c.phone], ['Status', (c) => c.status], ['Source', (c) => c.source], ['Added', (c) => fmtDate(c.created_at)]])),
    'export-invoices': () => download(`invoices-${stamp()}.csv`, csv(state.invList || [], [
      ['Number', (i) => i.number || 'Draft'], ['Client', (i) => i.name], ['Email', (i) => i.email], ['Status', (i) => i.overdue ? 'late' : i.status],
      ['Total', (i) => Number(plain(i.total))], ['Paid', (i) => Number(plain(i.paid))], ['Left to pay', (i) => Number(plain(i.due))],
      ['Created', (i) => fmtDate(i.created)], ['Due', (i) => fmtDate(i.due_date)], ['Link', (i) => i.url]])),
    'export-payments': () => download(`payments-${stamp()}.csv`, csv(state.chList || [], [
      ['Date', (c) => fmtDate(c.created)], ['Client', (c) => c.name], ['For', (c) => c.description], ['Card', (c) => c.card],
      ['Amount', (c) => Number(plain(c.amount))], ['Refunded', (c) => Number(plain(c.refunded))], ['Status', (c) => c.status]])),
    'export-books': () => download(`books-${stamp()}.csv`, csv(state.entryList || [], [
      ['Date', (e) => e.date], ['Type', (e) => e.kind], ['Category', (e) => e.category], ['Paid to / from', (e) => e.party], ['Method', (e) => e.method],
      ['Client', (e) => e.client_name], ['Amount', (e) => Number(plain(e.kind === 'income' ? e.amount_cents : -e.amount_cents))], ['Note', (e) => e.note]])),
    'export-pl': () => {
      const d = state.report; if (!d) return;
      const L = [['Profit and loss', `${d.from} to ${d.to}`], ['', ''], ['INCOME', ''], ['Card payments (Stripe), before fees', plain(d.stripe.gross)], ['Refunds', plain(d.stripe.refunds)], ['Card fees', plain(-d.stripe.fees)]];
      if (d.stripe.other) L.push(['Other Stripe items', plain(d.stripe.other)]);
      d.income.byCategory.forEach((x) => L.push([x.category, plain(x.cents)]));
      L.push(['Total income', plain(d.totals.income)], ['', ''], ['EXPENSES', '']);
      d.expenses.byCategory.forEach((x) => L.push([x.category, plain(x.cents)]));
      L.push(['Total expenses', plain(d.totals.expenses)], ['', ''], ['PROFIT', plain(d.totals.profit)], ['', ''], ['Month', 'Card (net)', 'Other income', 'Expenses', 'Profit']);
      d.months.forEach((mo) => L.push([mo.month, plain(mo.stripe), plain(mo.income), plain(mo.expenses), plain(mo.profit)]));
      const width = 5;
      download(`profit-and-loss-${d.from}-to-${d.to}.csv`, csv(L.map((r) => r.concat(Array(width).fill('')).slice(0, width)), Array.from({ length: width }, (_, k) => ['', (r) => { const v = r[k]; return /^-?\d+\.\d{2}$/.test(v) ? Number(v) : v; }])).replace(/^,+\r\n/, ''));
    },
    'export-tx': () => {
      const d = state.report; if (!d) return;
      download(`transactions-${d.from}-to-${d.to}.csv`, csv(d.rows, [
        ['Date', (r) => r.date], ['Type', (r) => r.type], ['Category', (r) => r.category], ['Paid to / from', (r) => r.party], ['Description', (r) => r.description],
        ['Method', (r) => r.method], ['Amount', (r) => Number(plain(r.amount))], ['Fee', (r) => Number(plain(r.fee))], ['Net', (r) => Number(plain(r.net))]]));
    }
  };

  // ---------------------------------------------------------------- events
  document.addEventListener('click', async (e) => {
    const close = e.target.closest('[data-close]');
    if (close) { const d = close.closest('dialog'); if (d) d.close(); return; }
    const t = e.target.closest('[data-act],[data-cf],[data-if],[data-kf]');
    if (!t) return;
    if (t.dataset.cf !== undefined) { clientFilter.status = t.dataset.cf; $$('#cchips button').forEach((b) => b.classList.toggle('on', b === t)); return drawClients(); }
    if (t.dataset.if !== undefined) { invFilter = t.dataset.if; $$('#ichips button').forEach((b) => b.classList.toggle('on', b === t)); return drawInvoices(); }
    if (t.dataset.kf !== undefined) { books.kind = t.dataset.kf; $$('#kchips button').forEach((b) => b.classList.toggle('on', b === t)); return drawBooks(); }
    const a = t.dataset.act;
    try {
      if (EXPORTS[a]) return EXPORTS[a]();
      switch (a) {
        case 'theme': return toggleTheme();
        case 'logout': await api('logout'); state.clients = null; state.cfg = null; clearInterval(state.poll); return gate();
        case 'reload': return refresh();
        case 'notifs': return openNotifs();
        case 'notifs-read': await api('notifications.read'); setBadge(0); return refresh();
        case 'settings-save': return saveSettings(t);
        case 'alerts-connect': await busy(t, async () => { state.cfg = await api('alerts.connect'); }); toast('Payment alerts are on'); return refresh();
        case 'email-test': { const r = await busy(t, () => api('email.test')); return toast('Test sent to ' + r.to); }
        case 'print': return window.print();
        case 'new-client': {
          const back = t.dataset.return && t.closest('dialog');
          const id = await clientForm();
          if (id && back) {
            const sel = back.querySelector('#f-client');
            if (sel) { sel.innerHTML = (await clientOptions(id)).s; sel.dispatchEvent(new Event('change')); }
          } else if (id && !back) location.hash = '#/clients/' + id;
          return;
        }
        case 'edit-client': { const id = await clientForm(t.dataset.id); if (id) refresh(); return; }
        case 'delete-client': {
          if (!confirm('Delete this client from the CRM? Their invoices and payments stay in Stripe.')) return;
          await api('clients.delete', { id: Number(t.dataset.id) }); await clientsCache(true); toast('Client deleted'); location.hash = '#/clients'; return;
        }
        case 'new-invoice': return invoiceForm(t.dataset.client);
        case 'new-charge': return chargeForm(t.dataset.client);
        case 'new-plan': return planForm(t.dataset.client);
        case 'new-entry': return entryForm(t.dataset.kind);
        case 'edit-entry': return entryForm(null, t.dataset.id);
        case 'inv': return invAction(t.dataset.a, t.dataset.id, t);
        case 'refund': return refundForm(state.ch[t.dataset.id]);
        case 'card-link': {
          const r = await busy(t, () => api('cards.link', { client_id: Number(t.dataset.client) }));
          const c = (state.clients || []).find((x) => String(x.id) === String(t.dataset.client)) || {};
          return shareLink('Save-card link', r.url, { name: c.name, email: c.email }, 'card');
        }
        case 'card-remove': {
          if (!confirm('Remove this card from the client?')) return;
          await api('cards.remove', { client_id: Number(t.dataset.client), pm_id: t.dataset.id }); toast('Card removed'); return refresh();
        }
        case 'plan-cancel': {
          const p = state.plans[t.dataset.id];
          if (!confirm(`Stop the plan "${p ? p.title : ''}"? No more payments will be collected.`)) return;
          await api('plans.cancel', { id: Number(t.dataset.id) }); toast('Plan stopped'); return refresh();
        }
        case 'period-go': {
          const id = t.dataset.id, st = id === 'bk' ? books : rep;
          st.from = $(`[data-from="${id}"]`).value; st.to = $(`[data-to="${id}"]`).value;
          if (!st.from || !st.to) return toast('Pick both dates', true);
          return refresh();
        }
      }
    } catch (err) { toast(err.message, true); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches && e.target.matches('.row.click')) e.target.click();
  });
  document.addEventListener('change', (e) => {
    const p = e.target.closest && e.target.closest('[data-period]');
    if (!p) return;
    const id = p.dataset.period, st = id === 'bk' ? books : rep;
    st.period = p.value;
    if (p.value === 'custom') {
      const r = range({ period: 'month' });
      st.from = st.from || r.from; st.to = st.to || r.to;
      const box = $(`[data-custom="${id}"]`); box.classList.remove('hide');
      $(`[data-from="${id}"]`).value = st.from; $(`[data-to="${id}"]`).value = st.to;
      return;
    }
    refresh();
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'cq') { clientFilter.q = e.target.value; drawClients(); }
  });
  document.addEventListener('submit', async (e) => {
    if (e.target.id !== 'noteform') return;
    e.preventDefault();
    const inp = $('#note'); if (!inp.value.trim()) return;
    try { await api('activity.add', { client_id: Number(e.target.dataset.client), body: inp.value }); toast('Note added'); refresh(); }
    catch (err) { toast(err.message, true); }
  });

  // after each render, fill in lists that filter on the client side
  const view = () => $('#view');
  const afterRender = () => { drawClients(); drawInvoices(); drawBooks(); paintBars(view()); };
  document.addEventListener('rendered', afterRender, true);

  // client page lives under #/clients/ID
  VIEWS.clients_ = VIEWS.clients;
  VIEWS.clients = async (arg) => arg ? VIEWS.client(arg) : VIEWS.clients_();

  // ---------------------------------------------------------------- start
  async function boot() {
    try { state.status = await api('status'); }
    catch (e) { $('#root').innerHTML = html`<div class="gate"><div class="box">${raw(LOGO)}<h1>Can't reach the server</h1><p>${e.message}</p><button class="btn" data-act="reload-page">Try again</button></div></div>`.s; return; }
    if (!state.status.authed) return gate();
    try { state.cfg = await api('settings.get'); } catch (e) { state.cfg = null; }
    shell();
    clearInterval(state.poll);
    state.poll = setInterval(async () => {
      if (document.hidden || !on('f_notifications')) return;
      try { const r = await api('notifications.list'); if (r.unread !== state.unread) setBadge(r.unread); } catch (e) {}
    }, 60000);
    window.removeEventListener('hashchange', route);
    window.addEventListener('hashchange', route);
    route();
  }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-act="reload-page"]')) location.reload(); });
  boot();
})();
