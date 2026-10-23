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
    no: I('<path d="M6 6l12 12M18 6L6 18"/>'),
    bill: I('<path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2z"/><path d="M9 7.5h6M9 11h6M9 14.5h4"/>'),
    project: I('<path d="M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18.5z"/><path d="M8 14l2.5 2.5L16 11"/>'),
    team: I('<circle cx="12" cy="7.5" r="3.2"/><path d="M5.5 20c.5-3.6 3.2-5.6 6.5-5.6s6 2 6.5 5.6"/><circle cx="4.8" cy="10" r="2.2"/><circle cx="19.2" cy="10" r="2.2"/>'),
    clock: I('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    more: I('<circle cx="5.5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="18.5" cy="12" r="1.4"/>'),
    task: I('<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 12.5l3 3 5-6"/>'),
    trash: I('<path d="M4 7h16M9 7V4.5h6V7M6.5 7l1 13h9l1-13M10 11v6M14 11v6"/>'),
    history: I('<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3 4v4h4M12 8v4.5l3 2"/>'),
    spark: I('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/><path d="M19 16l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z"/>'),
    upload: I('<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>'),
    clip: I('<path d="M20 11.5l-8.2 8.2a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4L15 7"/>'),
    bank: I('<path d="M3 9l9-5 9 5M5 9v9M9.5 9v9M14.5 9v9M19 9v9M3 20h18"/>'),
    tax: I('<path d="M6 2.5h12v19l-3-2-3 2-3-2-3 2z"/><path d="M9 15.5l6-7"/><circle cx="9.5" cy="9" r="1.2"/><circle cx="14.5" cy="15" r="1.2"/>'),
    link: I('<path d="M10 14a4.5 4.5 0 0 0 6.4 0l3-3a4.5 4.5 0 0 0-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 0 0-6.4 0l-3 3a4.5 4.5 0 0 0 6.4 6.4l1-1"/>'),
    sliders: I('<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>')
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
  // when the Trash is off, deleting is final: ask first
  const sure = (msg) => on('f_trash') || confirm(msg + ' This can\'t be undone.');
  const undoNote = () => (on('f_trash') ? ' You can undo it.' : ' This can\'t be undone.');
  // a short note at the bottom; after a delete it carries an Undo button
  function toast(msg, bad, undo) {
    const t = $('#toast');
    t.textContent = msg;
    const ids = [].concat(undo || []).filter(Boolean);
    if (ids.length) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'undo'; b.textContent = 'Undo'; b.dataset.act = 'undo'; b.dataset.ids = JSON.stringify(ids);
      t.appendChild(b);
    }
    t.className = 'toast on' + (bad ? ' bad' : '');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.className = 'toast' + (bad ? ' bad' : ''); }, ids.length ? 9000 : bad ? 5200 : 3000);
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
  const state = { pick: { kind: null, ids: new Set() }, status: null, me: null, clients: null, projects: null, team: null, inv: {}, ch: {}, plans: {}, entries: {}, bills: {}, tasks: {}, logs: {}, workers: {} };
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
        <h1>Sign in</h1><p>Owner: just your admin password. Team members: your email and password.</p>
        <form id="login"><div><label for="em">Email <span class="muted">(team members only)</span></label><input id="em" type="email" autocomplete="username" maxlength="200"></div>
        <div style="margin-top:12px"><label for="pw">Password</label><input id="pw" type="password" autocomplete="current-password" required autofocus></div>
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
      try { await api('login', { email: $('#em').value.trim(), password: $('#pw').value }); await boot(); }
      catch (err) { $('#lerr').textContent = err.message; btn.disabled = false; $('#pw').select(); }
    });
  }

  // ---------------------------------------------------------------- shell + router
  const NAV_ALL = [
    ['home', 'Home', ICON.home], ['clients', 'Clients', ICON.clients], ['invoices', 'Invoices', ICON.invoice],
    ['payments', 'Payments', ICON.card, 'f_payments'], ['plans', 'Plans', ICON.plan, 'f_plans'], ['books', 'Books', ICON.books, 'f_books'],
    ['bills', 'Bills', ICON.bill, 'f_bills'], ['reports', 'Reports', ICON.report, 'f_reports'], ['tax', 'Taxes', ICON.tax, 'f_tax'],
    ['projects', 'Projects', ICON.project, 'f_projects'], ['team', 'Team', ICON.team, 'f_team']
  ];
  // signed in as a team member (not the owner)?
  const member = () => !!(state.me && state.me.role === 'member');
  const perms = () => (member() ? state.me.perms : null);
  // a feature is on unless it was switched off in Settings
  const on = (f) => member() ? state.me.features[f] !== false : !(state.cfg && state.cfg.settings && state.cfg.settings[f] === false);
  // may the signed-in person see (or change) this part of the admin? The owner can do everything.
  const can = (section, lvl = 'view') => {
    if (!member()) return true;
    const v = perms().sections[section];
    return lvl === 'view' ? !!v : v === 'edit';
  };
  const mailOn = () => !!(state.cfg && state.cfg.email && state.cfg.email.ready);
  const memberNav = (k) => k === 'home' || (k === 'projects' ? perms().projects !== 'none' : k === 'team' ? false : k === 'tax' ? can('reports') : can(k));
  const navItems = () => NAV_ALL.filter((n) => (!n[3] || on(n[3])) && (!member() || memberNav(n[0])));
  function shell() {
    const mode = state.status.testMode ? html`<span class="mode">Test mode</span>` : '';
    const nav = navItems();
    const bell = !member() && on('f_notifications');
    // phones: up to 5 tabs, the rest under "More"
    const tabs = nav.length > 5 ? nav.slice(0, 4).concat([['more', 'More', ICON.more]]) : nav;
    $('#root').innerHTML = html`<div class="shell">
      <aside class="side">${raw(LOGO)}${mode}
        <nav class="nav">${nav.map(([k, l, i]) => html`<a href="#/${k}" data-nav="${k}">${raw(i)}<span>${l}</span></a>`)}</nav>
        <div class="foot">
          ${bell ? html`<button type="button" data-act="notifs">${raw(ICON.bell)}<span>Notifications</span><b class="badge hide" data-badge></b></button>` : ''}
          ${member() ? html`<div class="whoami"><b>${state.me.name}</b><span>${state.me.biz_name}</span></div>` : html`<a href="#/settings" data-nav="settings">${raw(ICON.gear)}<span>Settings</span></a>`}
          <button type="button" data-act="theme" data-label="1">${raw(isLight() ? ICON.moon : ICON.sun)}<span>${isLight() ? 'Night mode' : 'Day mode'}</span></button>
          <button type="button" data-act="logout">${raw(ICON.out)}<span>Sign out</span></button>
        </div>
      </aside>
      <div>
        <div class="topbar">${raw(LOGO)}<div class="r">${mode}
          ${bell ? html`<button class="btn ghost sm ib" type="button" data-act="notifs" aria-label="Notifications">${raw(ICON.bell)}<b class="badge dot hide" data-badge></b></button>` : ''}
          ${member() ? html`<button class="btn ghost sm" type="button" data-act="logout">Sign out</button>` : html`<a class="btn ghost sm" href="#/settings" aria-label="Settings">${raw(ICON.gear)}</a>`}</div></div>
        <main class="view" id="view"></main>
      </div>
      <nav class="tabs" style="grid-template-columns:repeat(${tabs.length},1fr)">${tabs.map(([k, l, i]) => k === 'more'
        ? html`<a href="#" data-act="more" data-nav="more">${raw(i)}<span>${l}</span></a>`
        : html`<a href="#/${k}" data-nav="${k}">${raw(i)}<span>${l}</span></a>`)}</nav>
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
    if (state.pick && state.pick.kind) { state.pick = { kind: null, ids: new Set() }; const bb = $('.bulkbar'); if (bb) bb.remove(); }
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const [name, arg] = h.split('/');
    const shown = navItems().map((n) => n[0]);
    const blocked = (NAV_ALL.some((n) => n[0] === name) && !shown.includes(name)) || (['settings', 'trash', 'log'].includes(name) && member()) || (name === 'trash' && !on('f_trash')) || (name === 'log' && !on('f_log'));
    const key = VIEWS[name] && !blocked ? name : 'home';
    $$('[data-nav]').forEach((a) => a.classList.toggle('on', a.dataset.nav === key));
    const inMore = !$$('.tabs [data-nav]').some((a) => a.dataset.nav === key);
    $$('.tabs [data-nav="more"]').forEach((a) => a.classList.toggle('on', inMore && key !== 'home'));
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
    if (!can('invoices', 'edit')) opts = { ...opts, acts: false };
    state.inv[i.id] = i;
    const st = i.overdue ? 'overdue' : i.status;
    const sub = [i.number || 'Draft', i.project_name, fmtDate(i.created), i.due_date && i.status === 'open' ? 'due ' + fmtDate(i.due_date) : '', i.plan ? 'payment plan' : '',
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
    if (!can('payments', 'edit')) opts = { ...opts, acts: false };
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
    if (!can('plans', 'edit')) opts = { ...opts, acts: false };
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
  const NICON = { paid: ICON.ok, failed: ICON.alert, dispute: ICON.alert, card: ICON.card, lead: ICON.mail, bill: ICON.bill };
  function ago(ts) {
    const s = (Date.now() - new Date(ts).getTime()) / 1000;
    if (s < 60) return 'just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago'; if (s < 7 * 86400) return Math.floor(s / 86400) + ' d ago';
    return fmtDate(ts);
  }
  function notifRow(n) {
    const href = n.client_id ? '#/clients/' + Number(n.client_id) : n.kind === 'bill' ? '#/bills' : '#/home';
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
    if (member()) return memberHome();
    const d = await api('dashboard');
    setBadge(d.unread || 0);
    const fresh = (d.notifications || []).filter((n) => !n.read_at).slice(0, 6);
    const h = new Date().getHours();
    const hello = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
    const month = new Date().toLocaleDateString('en-US', { month: 'long' });
    // the boxes the owner picked (Customize); all on at the start
    const hs = (state.cfg && state.cfg.settings) || {};
    const box = (k) => hs[k] !== false;
    const tax = on('f_tax') && box('h_tax') ? await api('tax.summary', { year: new Date().getMonth() < 4 ? new Date().getFullYear() - 1 : new Date().getFullYear(), light: true }).catch(() => null) : null;
    return html`
      <div class="head"><div><h1>${hello}</h1><div class="sub">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
        <div class="acts"><button class="btn ghost sm" data-tx="customize">${raw(ICON.sliders)}Customize</button></div></div>
      ${noStripe()}
      ${fresh.length && on('f_notifications') && box('h_news') ? html`<div class="news"><div class="news-h"><b>${raw(ICON.bell)} What's new</b><span class="r" style="display:flex;gap:8px;align-items:center"><button class="linkbtn" data-act="notifs-read">Mark all read</button>${hideBox('h_news')}</span></div>
        <div class="panel rows">${fresh.map(notifRow)}</div></div>` : ''}
      ${!box('h_kpis') ? '' : html`<div class="boxhead">${hideBox('h_kpis')}</div><div class="kpis">
        ${kpi('Income in ' + month, money(d.month.income), d.month.stripe_fees ? money(d.month.stripe_fees) + ' card fees already taken off' : 'card payments and recorded income')}
        ${kpi('Expenses in ' + month, money(d.month.expenses), 'from your books')}
        ${kpi('Profit in ' + month, money(d.month.profit), '', d.month.profit >= 0 ? 'pos' : 'neg')}
        ${kpi('Waiting to be paid', money(d.open.total), `${d.open.count} open invoice${d.open.count === 1 ? '' : 's'}${d.open.overdue ? ` · ${d.open.overdue} late` : ''}`, d.open.overdue ? 'neg' : '')}
      </div>`}
      ${tax ? html`<h2 class="sec">Ready for the accountant (${tax.year}) <span class="r"><a class="muted" href="#/tax">Taxes</a>${hideBox('h_tax')}</span></h2>
        <a class="panel pad readybox click" href="#/tax" style="display:block;text-decoration:none"><div class="readyhead"><b>${tax.ready.pct}% ready</b>
          <span class="muted">${tax.checks.filter((c) => !c.ok).map((c) => `${c.count} ${c.title.toLowerCase()}`).join(' · ') || 'Everything is done'}</span></div>
          <div class="progress"><i data-w="${tax.ready.pct}"></i></div></a>` : ''}
      ${!on('f_todo') || !box('h_todo') ? '' : d.todo && d.todo.length ? html`<h2 class="sec">To do <span class="r"><span class="muted">${d.todo.length} thing${d.todo.length === 1 ? '' : 's'}</span>${hideBox('h_todo')}</span></h2><div class="panel rows todo">${d.todo.map(todoRow)}</div>`
        : html`<div class="panel pad allclear" style="margin-top:14px">${raw(ICON.ok)}<span>Nothing waiting on you. No late invoices, no bills due, nobody owed.</span></div>`}
      ${!box('h_quick') ? '' : (() => {
        const q = [html`<button type="button" data-act="new-invoice">${raw(ICON.invoice)}New invoice</button>`];
        if (on('f_cards')) q.push(html`<button type="button" data-act="new-charge">${raw(ICON.card)}Charge a card</button>`);
        if (on('f_plans')) q.push(html`<button type="button" data-act="new-plan">${raw(ICON.plan)}Payment plan</button>`);
        if (on('f_books')) q.push(html`<button type="button" data-act="new-entry" data-kind="expense">${raw(ICON.dollar)}Add expense</button>`);
        if (on('f_bills')) q.push(html`<button type="button" data-act="new-bill">${raw(ICON.bill)}Add bill</button>`);
        q.push(html`<button type="button" data-act="new-client">${raw(ICON.user)}Add client</button>`);
        return html`<div class="boxhead">${hideBox('h_quick')}</div><div class="quick" style="--n:${q.length}">${q}</div>`;
      })()}
      ${!box('h_money') ? '' : html`<div class="cols">
        <div><h2 class="sec">Waiting to be paid <span class="r"><a class="muted" href="#/invoices">See all</a>${hideBox('h_money')}</span></h2>
          <div class="panel rows">${d.open.list.length ? d.open.list.map((i) => invoiceRow(i, { link: true })) : empty('Nothing waiting. Every invoice is paid.')}</div></div>
        <div><h2 class="sec">Latest payments <a class="muted" href="#/payments">See all</a></h2>
          <div class="panel rows">${d.recent.length ? d.recent.map((c) => chargeRow(c, { link: true })) : empty('No card payments yet.')}</div></div>
      </div>`}
      ${on('f_bills') && box('h_bills') && d.bills && d.bills.list.length ? html`<h2 class="sec">Bills to pay <span class="r"><a class="muted" href="#/bills">${money(d.bills.owed)} owed${d.bills.late ? ` · ${d.bills.late} late` : ''}</a>${hideBox('h_bills')}</span></h2>
        <div class="panel rows">${d.bills.list.map((b) => billRow(b))}</div>` : ''}
      ${d.recentLeads.length && box('h_leads') ? html`<h2 class="sec">New leads <span class="r"><span class="muted">${d.counts.leads} total</span>${hideBox('h_leads')}</span></h2>
        <div class="panel rows">${d.recentLeads.map((c) => html`<a class="row" href="#/clients/${c.id}"><div class="main"><b>${c.name}</b><span>${[c.company, c.email, c.phone].filter(Boolean).join(' · ')}</span></div>${pill('lead')}<div class="amt"><small>${fmtDate(c.created_at)}</small></div></a>`)}</div>` : ''}
    `;
  };

  let clientFilter = { q: '', status: '' };
  VIEWS.clients = async () => {
    const list = await clientsCache(true);
    return html`
      <div class="head"><div><h1>Clients</h1><div class="sub">${list.length} total · ${list.filter((c) => c.status === 'lead').length} leads</div></div>
        <div class="acts"><button class="btn ghost" data-act="export-clients">${raw(ICON.down)}Excel</button>${can('clients', 'edit') ? html`<button class="btn" data-act="new-client">${raw(ICON.plus)}New client</button>` : ''}</div></div>
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
          ${can('invoices', 'edit') ? html`<button class="btn" data-act="new-invoice" data-client="${c.id}">${raw(ICON.invoice)}Invoice</button>` : ''}
          ${on('f_cards') && can('payments', 'edit') ? html`<button class="btn ghost" data-act="new-charge" data-client="${c.id}">${raw(ICON.card)}Charge card</button>` : ''}
          ${on('f_plans') && can('plans', 'edit') ? html`<button class="btn ghost" data-act="new-plan" data-client="${c.id}">${raw(ICON.plan)}Payment plan</button>` : ''}
          ${can('clients', 'edit') ? html`<button class="btn ghost" data-act="edit-client" data-id="${c.id}">Edit</button>` : ''}
        </div></div>
      ${noStripe()}
      <div class="cols">
        <div>
          ${on('f_cards') ? html`<h2 class="sec">Cards on file</h2>
          <div class="panel">${d.cards.length ? html`<div class="cards">${d.cards.map((k) => html`<div class="ccard">${raw(ICON.card)}<div><b>${k.brand} •••• ${k.last4}</b><br><small>expires ${k.exp}</small></div><button class="linkbtn" data-act="card-remove" data-client="${c.id}" data-id="${k.id}" aria-label="Remove card">Remove</button></div>`)}</div>` : empty('No card saved yet.')}
            ${hasStripe ? html`<div class="addnote"><button class="btn ghost sm" data-act="card-link" data-client="${c.id}">Send "save card" link</button><span class="muted">They type the card on Stripe's secure page.</span>
              ${state.status.testMode ? html`<button class="btn ghost sm" data-act="card-test" data-client="${c.id}">Add test card</button>` : ''}</div>` : ''}</div>` : ''}
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
          ${can('clients', 'edit') ? html`<p style="margin-top:28px"><button class="btn danger sm" data-act="delete-client" data-id="${c.id}">Delete client</button></p>` : ''}
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
        <div class="acts">${on('f_bulk') ? html`<button class="btn ghost" data-act="pick-start" data-kind="invoices">Select</button>` : ''}<button class="btn ghost" data-act="export-invoices">${raw(ICON.down)}Excel</button>${can('invoices', 'edit') ? html`<button class="btn" data-act="new-invoice">${raw(ICON.plus)}New invoice</button>` : ''}</div></div>
      <div class="chips" id="ichips">${[['', 'All'], ['open', 'Waiting'], ['overdue', 'Late'], ['paid', 'Paid'], ['draft', 'Drafts'], ['void', 'Void']].map(([v, l]) => html`<button type="button" data-if="${v}" class="${invFilter === v ? 'on' : ''}">${l}</button>`)}</div>
      <div class="panel rows" id="ilist"></div>`;
  };
  const invShown = () => (state.invList || []).filter((i) => !invFilter || (invFilter === 'overdue' ? i.overdue : i.status === invFilter));
  function drawInvoices() {
    const box = $('#ilist'); if (!box) return;
    const list = invShown();
    const picking = state.pick.kind === 'invoices';
    box.innerHTML = (list.length ? html`${list.map((i) => pickWrap('invoices', i.id, invoiceRow(i, { acts: !picking })))}` : empty('No invoices here.')).s;
  }

  VIEWS.payments = async () => {
    const d = await api('charges.list');
    state.chList = d.charges;
    const ok = d.charges.filter((c) => c.status === 'succeeded');
    return html`
      <div class="head"><div><h1>Payments</h1><div class="sub">Last ${d.charges.length} card payments · ${money(ok.reduce((s, c) => s + c.amount - c.refunded, 0))} received</div></div>
        <div class="acts"><button class="btn ghost" data-act="export-payments">${raw(ICON.down)}Excel</button>${can('payments', 'edit') ? html`<button class="btn" data-act="new-charge">${raw(ICON.card)}Charge a card</button>` : ''}</div></div>
      <div class="panel rows">${d.charges.length ? d.charges.map((c) => chargeRow(c, { acts: true, link: false })) : empty('No card payments yet.')}</div>`;
  };

  VIEWS.plans = async () => {
    const d = await api('plans.list');
    return html`
      <div class="head"><div><h1>Payment plans</h1><div class="sub">Split a total into weekly or monthly payments. Stripe collects each one on time.</div></div>
        <div class="acts">${can('plans', 'edit') ? html`<button class="btn" data-act="new-plan">${raw(ICON.plus)}New payment plan</button>` : ''}</div></div>
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
      <div class="main"><b>${e.party || e.client_name || e.category}${e.files ? raw(`<i class="clip">${ICON.clip}</i>`) : ''}${e.tax_line && on('f_tax') ? html`<span class="tag ${e.tax_line === 'Accountant to decide' ? 't-review' : ''}">${e.tax_line}</span>` : ''}</b><span>${[fmtDate(e.date), e.category, e.project_name, e.method, e.note].filter(Boolean).join(' · ')}</span></div>
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
        <div class="acts">${on('f_bulk') ? html`<button class="btn ghost" data-act="pick-start" data-kind="books">Select</button>` : ''}<button class="btn ghost" data-act="export-books">${raw(ICON.down)}Excel</button>
          ${can('books', 'edit') ? html`${on('f_uploads') ? html`<button class="btn ghost" data-act="upload" data-hint="">${raw(ICON.upload)}Upload</button>` : ''}${on('f_import') ? html`<button class="btn ghost" data-act="import-bank">${raw(ICON.bank)}Bank statement</button>` : ''}${on('f_links') && on('f_import') ? html`<button class="btn ghost" data-tx="links">${raw(ICON.link)}Linked sheets</button>` : ''}<button class="btn ghost" data-act="new-entry" data-kind="income">${raw(ICON.plus)}Income</button>
          <button class="btn" data-act="new-entry" data-kind="expense">${raw(ICON.plus)}Expense</button>` : ''}</div></div>
      ${periodBar(books, 'bk')}
      <div class="kpis three">
        ${kpi('Recorded income', money(inc), fmtDate(r.from) + ' – ' + fmtDate(r.to), 'pos')}
        ${kpi('Expenses', money(exp), d.entries.filter((e) => e.kind === 'expense').length + ' entries', 'neg')}
        ${kpi('Difference', money(inc - exp), 'without card payments')}
      </div>
      ${can('books', 'edit') && (on('f_uploads') || on('f_import')) ? html`<div class="dropzone" data-drop="">${raw(ICON.upload)}<span>${on('f_uploads') ? 'Drop receipts, bills or a bank statement here: any file (PDF, Word, Excel, CSV, photos, QuickBooks .iif or bank .qbo).' : 'Drop a bank statement here (CSV, Excel, QuickBooks .iif or bank .qbo).'} ${on('f_import') ? html`<button type="button" class="linkbtn" data-act="imports-list">Past imports</button>` : ''}</span></div>` : ''}
      <div class="chips" style="margin-top:16px" id="kchips">${[['', 'All'], ['income', 'Income'], ['expense', 'Expenses']].map(([v, l]) => html`<button type="button" data-kf="${v}" class="${books.kind === v ? 'on' : ''}">${l}</button>`)}</div>
      <div class="panel rows" id="klist"></div>`;
  };
  const booksShown = () => (state.entryList || []).filter((e) => !books.kind || e.kind === books.kind);
  function drawBooks() {
    const box = $('#klist'); if (!box) return;
    const list = booksShown();
    box.innerHTML = (list.length ? html`${list.map((e) => pickWrap('books', e.id, entryRow(e)))}` : empty('Nothing recorded for these dates.')).s;
  }

  VIEWS.reports = async () => {
    const r = range(rep);
    const d = await api('report', r);
    state.report = d;
    const line = (l, v, cls) => html`<div class="l ${cls || ''}"><span>${l}</span><span class="num">${v}</span></div>`;
    return html`
      <div class="head"><div><h1>Reports</h1><div class="sub">Profit and loss, ${fmtDate(d.from)} – ${fmtDate(d.to)}</div></div>
        <div class="acts downloads">
          ${on('f_pack') ? html`<button class="btn ghost" data-act="accountant-pack">${raw(ICON.books)}Accountant pack</button>` : ''}
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
      ${on('f_bills') && d.bills && d.bills.owed ? html`<p class="hint" style="margin-top:14px">Not in this report yet: <b>${money(d.bills.owed)}</b> in supplier bills still to pay (they count as expenses when you pay them). <a href="#/bills">See bills</a></p>` : ''}
      <p class="hint" style="margin-top:14px">For your accountant: card income is shown after Stripe fees. This is a simple summary, not tax advice.</p>`;
  };

  // ---------------------------------------------------------------- settings: search, topics, saves by itself
  const SET_TOPICS = () => [
    ['features', 'Features', 'Turn parts of the admin on or off', ICON.gear],
    ['clients', 'Emails to clients', 'Invoices, receipts, auto-reply', ICON.mail],
    ['alerts', 'Alerts to you', 'Payments, bills, weekly summary', ICON.bell],
    ['invoices', 'New invoices', 'What a new invoice starts with', ICON.invoice],
    ['business', 'Business details', 'Name, address and terms on invoices', ICON.books],
    ['team', 'Team sign-in', 'Let team members sign in', ICON.team],
    ['connections', 'Stripe and email', 'Payment alerts, sending your own emails', ICON.card],
    ...(on('f_links') || on('f_qb') ? [['sync', 'Google Sheets, Excel and QuickBooks', 'Linked sheets, live link, QuickBooks files', ICON.link]] : []),
    ['home', 'Home page', 'Choose the boxes on the home page', ICON.home],
    ['claude', 'Claude connector', 'Use your own Claude app with this admin', ICON.spark],
    ...(on('f_trash') ? [['trash', 'Trash', 'Bring back things you deleted', ICON.trash, '#/trash']] : []),
    ...(on('f_log') ? [['log', 'Activity log', 'Who changed what, and when', ICON.history, '#/log']] : []),
    ['look', 'Look and sign out', 'Day or night mode', ICON.sun]
  ];
  VIEWS.settings = async (arg) => {
    const d = await api('settings.get');
    state.cfg = d;
    const s = d.settings, em = d.email.ready;
    const q = (...t) => t.filter(Boolean).join(' ').toLowerCase();
    const sw = (key, title, sub, needMail) => html`<label class="setrow ${needMail && !em ? 'off' : ''}" data-q="${q(title, sub, key)}"><div><b>${title}</b>${sub ? html`<span>${sub}</span>` : ''}</div>
      <span class="switch"><input type="checkbox" data-set="${key}" ${raw(s[key] ? 'checked' : '')} ${raw(needMail && !em ? 'disabled' : '')}><i></i></span></label>`;
    const field = (key, title, type = 'text') => html`<label class="setrow" data-q="${q(title, key)}"><div><b>${title}</b></div><input data-set="${key}" type="${type}" value="${s[key]}" maxlength="200"></label>`;
    const block = (words, body) => html`<div class="setrow col" data-q="${q(words)}">${body}</div>`;
    const sec = (k, title, rows, after) => html`<section class="setsec hide" data-topic="${k}" data-q="${q(title)}"><h2 class="sec">${title}</h2><div class="panel">${rows}</div>${after || ''}</section>`;
    const mb = (n) => n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(n / 1024)) + ' KB';
    const sections = [
      sec('features', 'Features', [
        sw('f_payments', 'Payments page', 'List of card payments, refunds'),
        sw('f_cards', 'Cards on file', '"Save card" links and charging a saved card'),
        sw('f_plans', 'Payment plans', 'Weekly or monthly payments'),
        sw('f_books', 'Books', 'Cash, checks, Zelle and expenses, uploads and bank import'),
        sw('f_bills', 'Bills', 'What you owe suppliers, due dates, paying in parts'),
        sw('f_projects', 'Projects', 'Projects with tasks, status, updates and money in and out'),
        sw('f_time', 'Hours', 'Log hours on projects; hourly workers are paid by them'),
        sw('f_team', 'Team', 'Workers, their pay, and what they may see'),
        sw('f_reports', 'Reports', 'Profit and loss, Excel downloads'),
        sw('f_todo', 'To do on the home page', 'Late invoices, bills due, team pay owed, late tasks, new leads'),
        sw('f_trash', 'Trash and Undo', 'Off = deleting is final (you are asked first)'),
        sw('f_log', 'Activity log', 'Off = changes are no longer recorded and the log is hidden'),
        sw('f_bulk', 'Select several at once', 'The "Select" button on Invoices, Bills and Books'),
        sw('f_uploads', 'Upload files', 'PDF, Word, Excel and photos as expenses, income or bills, and files attached to them'),
        sw('f_import', 'Bank statement import', 'Read a CSV or Excel statement into Books'),
        sw('f_pack', 'Accountant pack', 'Year-end Excel file under Reports'),
        sw('f_tax', 'Taxes', 'Ready-for-the-accountant checks, owner money and loans, 1099 vendors, inventory count, tax lines'),
        sw('f_qb', 'QuickBooks files', 'Download the year for QuickBooks Desktop (.iif) or QuickBooks Online (.csv)'),
        sw('f_links', 'Linked sheets and live link', 'Read rows from Google Sheets, Excel online or a CSV link; a live link for Google Sheets and Excel'),
        sw('f_discounts', 'Discounts on invoices', '% or $ off'),
        sw('f_fields', 'Project and PO number on invoices', 'Printed on the invoice'),
        sw('f_cc', 'CC on invoice emails', ''),
        sw('f_ach', 'Bank payments (ACH)', 'Turn on ACH Direct Debit in Stripe → Settings → Payment methods first'),
        sw('f_reminders', 'Invoice reminders', 'Daily check; emails go out 3 days before, on the due date, and 7 days late'),
        sw('f_leads', 'Website messages become leads', 'The contact form on gogetterinc.com adds the person here'),
        sw('f_notifications', 'Notifications bell', '')
      ], html`<p class="hint">Files stored: ${d.files.count} (${mb(d.files.bytes)}). They are kept in your database.</p>`),
      sec('clients', 'Emails to clients', [
        sw('invoices_from_us', 'Send invoices from GO GETTER', 'Your own design with a Pay button and the PDF attached, instead of Stripe\'s email', true),
        sw('paid_thankyou', 'Receipt after they pay', 'Thank-you email with the PAID receipt PDF. Turn off Stripe\'s own receipts so they don\'t get two.', true),
        sw('lead_autoreply', 'Auto-reply to website messages', '"We got your message, we reply within 24 hours."', true)
      ]),
      sec('alerts', 'Alerts to you', [
        field('alert_email', 'Send alerts to', 'email'),
        sw('weekly_summary', 'Weekly summary', 'Every Monday morning: last week\'s money, what is late, what to pay this week', true),
        sw('alert_paid', 'A client paid online', '', true),
        sw('alert_failed', 'A payment failed or a dispute opened', '', true),
        sw('alert_card', 'A client saved a card', '', true),
        sw('alert_lead', 'New website message', 'Off by default: the website form already emails you', true),
        sw('alert_bills', 'A supplier bill is due soon or late', '3 days before the due date, and once when it is late', true)
      ], html`<div class="saverow" style="margin-top:12px">${em ? html`<button class="btn ghost sm" data-act="summary-send">Send me this week's summary now</button>` : ''}</div><p class="hint">The bell in the admin always shows alerts, even without email.</p>`),
      sec('invoices', 'New invoices start with', [
        sw('ach_default', 'Bank payment (ACH) turned on', ''),
        sw('remind_default', 'Reminders turned on', '', true)
      ]),
      sec('business', 'Business details on invoices and emails', [
        field('biz_name', 'Business name'), field('biz_address', 'Address'), field('biz_phone', 'Phone', 'tel'),
        field('biz_email', 'Email (clients reply here)', 'email'), field('invoice_thanks', 'Thank-you line'),
        html`<label class="setrow col" data-q="terms printed on invoices"><div><b>Terms printed on invoices</b><span>Shown at the bottom of every invoice PDF.</span></div><textarea data-set="invoice_terms" maxlength="1000">${s.invoice_terms}</textarea></label>`
      ], html`<p class="hint">Your full <a href="/terms" target="_blank" rel="noopener">Terms of Service</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy Policy</a> are on the website and linked from every email.</p>`),
      sec('team', 'Team sign-in', [
        sw('team_login', 'Let team members sign in', 'Each person signs in with their own email and password and sees only what you allow. Set it per person under Team.')
      ], html`<p class="hint">Off = only you can sign in. Turning it off signs everyone else out.</p>`),
      sec('connections', 'Stripe and email', [
        block('stripe payment alerts webhook', !d.stripe ? html`<p class="muted">Stripe is not connected. Add STRIPE_SECRET_KEY in Vercel.</p>` : d.alerts.connected
          ? html`<div class="status"><span class="ok">${raw(ICON.ok)}</span><div><b>Payment alerts are on.</b> Stripe tells the admin right away when a client pays, a payment fails, a card is saved or a dispute opens.</div></div>`
          : html`<div class="status"><div><b>Payment alerts are off.</b> Turn this on so payments show up by themselves, receipts go out, and you get notified.</div><button class="btn" data-act="alerts-connect">Turn on</button></div>`),
        block('email resend sending connection test', em
          ? html`<div class="status"><span class="ok">${raw(ICON.ok)}</span><div><b>Email is connected.</b> Emails go out from ${d.email.from}.</div><button class="btn ghost sm" data-act="email-test">Send me a test</button></div>`
          : html`<div><b>Email is not connected.</b> <span>Add RESEND_API_KEY in Vercel (from resend.com, with gogetterinc.com verified there). Until then Stripe sends the invoice emails.</span></div>`)
      ]),
      sec('claude', 'Claude connector', [
        sw('f_ai', 'Allow the Claude connector', 'Off = the connector stops working, even with a key'),
        block('claude connector key mcp ai assistant', d.connector.on
          ? html`<div class="status"><span class="ok">${raw(ICON.ok)}</span><div><b>Key made ${fmtDate(d.connector.created)}</b> <span>ending in …${d.connector.last4}</span></div>
            <button class="btn ghost sm" data-act="connector-key">Make a new key</button><button class="btn danger sm" data-act="connector-off">Turn off</button></div>`
          : html`<div class="status"><div><b>Not set up.</b> <span>Make a key, then add the connector in your Claude app.</span></div><button class="btn" data-act="connector-key">Make a key</button></div>`)
      ], html`<p class="hint">With the connector, your own Claude app (your plan, no extra cost) can look things up here and, after you approve, add bills, expenses, invoices, tasks and hours. Give it a PDF of a bill and say "add this". Everything it does is in the Activity log.</p>`),
      sec('home', 'Home page', HOME_BOXES.filter(([k]) => k !== 'h_tax' || on('f_tax')).map(([k, l]) => sw(k, l, '')),
        html`<p class="hint">Or use Customize on the home page, or the × next to a box.</p>`),
      ...(on('f_links') || on('f_qb') ? [sec('sync', 'Google Sheets, Excel and QuickBooks', [
        ...(on('f_links') ? [block('linked sheets google sheets excel onedrive dropbox csv import', html`<div class="status"><div><b>Linked sheets</b> <span>Keep a list in Google Sheets or Excel online and read its new rows into Books.</span></div><button class="btn ghost sm" data-tx="links">${raw(ICON.link)}Linked sheets</button></div>`),
          block('live link feed importdata google sheets excel from web', d.feed && d.feed.on
            ? html`<div class="status"><span class="ok">${raw(ICON.ok)}</span><div><b>Live link is on</b> <span>made ${fmtDate(d.feed.created)}, ending in …${d.feed.last4}. Google Sheets and Excel read Books from it.</span></div><button class="btn ghost sm" data-tx="feed-key">New link</button><button class="btn danger sm" data-tx="feed-off">Turn off</button></div>`
            : html`<div class="status"><div><b>Live link for Google Sheets and Excel</b> <span>Books and the tax summary, always up to date, in your own sheet.</span></div><button class="btn sm" data-tx="feed-key">Make the link</button></div>`)] : []),
        ...(on('f_qb') ? [block('quickbooks iif qbo desktop online accountant', html`<div class="status"><div><b>QuickBooks files</b> <span>The year for QuickBooks Desktop (.iif) or Online (.csv). Bring QuickBooks in: upload its Excel/CSV export, an .iif file or a bank .qbo file under Books.</span></div><button class="btn ghost sm" data-tx="qb">${raw(ICON.down)}Download</button></div>`)] : [])
      ])] : []),
      sec('look', 'Look and sign out', [
        block('day night mode theme sign out logout', html`<div class="saverow" style="margin:0"><button class="btn ghost" type="button" data-act="theme" data-label="1">${raw(isLight() ? ICON.moon : ICON.sun)}<span>${isLight() ? 'Night mode' : 'Day mode'}</span></button>
          <button class="btn ghost" type="button" data-act="logout">${raw(ICON.out)}<span>Sign out</span></button></div>`)
      ])
    ];
    const topic = SET_TOPICS().find((x) => x[0] === arg && !x[4]);
    return html`
      <div class="head"><div>${topic ? html`<div class="muted"><a href="#/settings" class="muted">← All settings</a></div>` : ''}<h1>${topic ? topic[1] : 'Settings'}</h1>
        <div class="sub">${topic ? topic[2] : 'Everything saves by itself as you change it.'}</div></div></div>
      <div class="search setsearch"><span>${raw(ICON.search)}</span><input id="setq" type="search" placeholder="Search settings, like &quot;reminder&quot; or &quot;email&quot;" autocomplete="off"></div>
      <div id="setwrap" data-topic="${topic ? topic[0] : ''}">
        <div class="tiles ${topic ? 'hide' : ''}" id="settiles">${SET_TOPICS().map(([k, t, sub, i, href]) => html`<a class="tile" href="${raw(href || '#/settings/' + k)}">${raw(i)}<div><b>${t}</b><span>${sub}</span></div></a>`)}</div>
        ${sections}
        <p class="empty hide" id="setnone">No setting matches. Try another word.</p>
      </div>`;
  };
  // show the chosen topic, or the tiles, or what matches the search
  function drawSettings() {
    const wrap = $('#setwrap'); if (!wrap) return;
    const term = ($('#setq') ? $('#setq').value : '').trim().toLowerCase();
    const topic = wrap.dataset.topic;
    let any = false;
    $('#settiles').classList.toggle('hide', !!term || !!topic);
    $$('.setsec', wrap).forEach((sec) => {
      if (!term) { sec.classList.toggle('hide', sec.dataset.topic !== topic); $$('[data-q]', sec).forEach((r) => r.classList.remove('hide')); return; }
      const titleHit = sec.dataset.q.includes(term);
      let hits = 0;
      $$('.panel > [data-q]', sec).forEach((r) => { const hit = titleHit || r.dataset.q.includes(term); r.classList.toggle('hide', !hit); if (hit) hits++; });
      sec.classList.toggle('hide', !hits);
      if (hits) any = true;
    });
    $('#setnone').classList.toggle('hide', !term || any);
  }
  // every switch and field saves on its own
  async function saveOne(el) {
    const key = el.dataset.set;
    const val = el.type === 'checkbox' ? el.checked : el.value;
    try {
      state.cfg = await api('settings.save', { settings: { [key]: val } });
      toast('Saved');
      if (/^f_|^h_|^team_login$/.test(key)) { const q0 = $('#setq') ? $('#setq').value : ''; shell(); await route(); if (q0 && $('#setq')) { $('#setq').value = q0; drawSettings(); } }
    } catch (err) {
      toast(err.message, true);
      if (el.type === 'checkbox') el.checked = !val;
    }
  }

  function connectorKeyShow(key) {
    const url = location.origin + '/api/mcp';
    const m = modal('Claude connector key', html`<div class="fields">
      <p class="soft">Copy the key now. It is shown only this once. Making a new key later stops the old one.</p>
      <div><label>Server URL</label><div class="linkbox"><input readonly value="${url}"><button type="button" class="btn ghost sm" data-copy="${url}">Copy</button></div></div>
      <div><label>Key</label><div class="linkbox"><input readonly value="${key}"><button type="button" class="btn ghost sm" data-copy="${key}">Copy</button></div></div>
      <ol class="steps">
        <li>In your Claude app (claude.ai or the desktop app), open <b>Settings → Connectors</b> and add a <b>custom connector</b>.</li>
        <li>Name it <b>GO GETTER</b> and paste the Server URL.</li>
        <li>Add a request header: name <code>Authorization</code>, value <code>Bearer</code> + a space + the key.</li>
        <li>Save. In a chat, turn the connector on and ask, for example: "What is due this week?"</li>
      </ol></div>`, html`<button type="button" class="btn" data-close>Done</button>`);
    m.d.addEventListener('click', (e) => { const b = e.target.closest('[data-copy]'); if (b) copy(b.dataset.copy); });
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

  async function invoiceForm(clientId, projectId) {
    const m = modal('New invoice', html`<div class="fields">
      ${await clientField(clientId)}${projPick()}
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
    wireProject(m, projectId);
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
            discount: disc.send, bank: chk('#f-bank'), remind: chk('#f-remind'), project: val('#f-project'), po: val('#f-po'), cc: val('#f-cc'), project_id: projVal(m) });
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

  async function chargeForm(clientId, projectId) {
    const m = modal('Charge a card', html`<div class="fields">
      ${await clientField(clientId)}${projPick()}
      <div id="ch-card"></div>
      <div class="grid2"><div><label for="ch-amt">Amount</label><input id="ch-amt" inputmode="decimal" placeholder="0.00"></div>
        <div><label for="ch-desc">For</label><input id="ch-desc" maxlength="300" placeholder="What is it for?"></div></div>
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit" id="ch-go">Charge</button>`);
    const sel = $('#f-client', m.d);
    wireProject(m, projectId);
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
          const r = await api('charges.create', { client_id: Number(sel.value), pm_id: $('#f-card', m.d).value, amount_cents: c, description: $('#ch-desc', m.d).value, project_id: projVal(m) });
          m.close(); toast(r.ok ? 'Charged ' + money(c) : 'Charge is processing'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  async function planForm(clientId, projectId) {
    const m = modal('New payment plan', html`<div class="fields">
      ${await clientField(clientId)}${projPick()}
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
    wireProject(m, projectId);
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
          await api('plans.create', { client_id: Number(sel.value), title: $('#p-title', m.d).value, total_cents: t, count: n, every, start_date: $('#p-start', m.d).value, autopay: how === 'auto', pm_id: pm ? pm.value : '', project_id: projVal(m) });
          m.close(); toast('Payment plan started'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  const CATS = {
    income: ['Projects', 'Consulting', 'Hardware sales', 'Invoices', 'Other income'],
    expense: ['Hardware & inventory', 'Shipping & freight', 'Contractors & developers', 'Software & subscriptions', 'Phone & internet', 'Travel', 'Office & supplies', 'Marketing', 'Bank & card fees', 'Professional fees', 'Taxes & licenses', 'Other']
  };
  const METHODS = ['Cash', 'Check', 'Zelle', 'Bank transfer', 'Card', 'Other'];
  // how money in or out counts for taxes (same list as api/_lib/tax.js). Grouped for the pickers.
  const COUNTS_AS = {
    expense: [['In profit', ['Cost of goods sold', 'Contract labor', 'Advertising', 'Office expense', 'Supplies', 'Utilities (phone and internet)', 'Travel', 'Taxes and licenses',
      'Legal and professional services', 'Software and subscriptions', 'Bank and card fees', 'Other expenses', 'Not deductible']],
      ['Not in profit', ['Equipment (fixed asset)', 'Inventory on hand (asset)', 'Deposit or prepaid (asset)', 'Owner draw (equity)', 'Loan paid back (liability)']],
      ['Not sure', ['Accountant to decide']]],
    income: [['In profit', ['Sales and income']], ['Not in profit', ['Owner capital (equity)', 'Loan received (liability)', 'Not income (transfer or refund)']], ['Not sure', ['Accountant to decide']]]
  };
  const countsOptions = (kind, sel, blank) => html`${blank ? html`<option value="">${blank}</option>` : ''}${COUNTS_AS[kind === 'income' ? 'income' : 'expense'].map(([g, ls]) => html`<optgroup label="${g}">${ls.map((l) => html`<option ${raw(l === sel ? 'selected' : '')}>${l}</option>`)}</optgroup>`)}`;
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
      ${await projectField(e0.project_id, 'e-project')}
      ${on('f_tax') ? html`<div><label for="e-tl">Counts as (for taxes)</label><select id="e-tl"></select></div>` : ''}
      <div class="grid2"><div><label for="e-ref">Receipt / invoice #</label><input id="e-ref" maxlength="60" value="${e0.ref || ''}"></div>
        <div><label for="e-note">Note</label><input id="e-note" maxlength="1000" value="${e0.note || ''}" placeholder="what it was for"></div></div>
      ${id ? html`<div><label>Files</label><div id="f-files" class="filesbox"></div></div>` : ''}
    </div>`, html`${id ? html`<button type="button" class="btn danger" id="e-del" style="margin-right:auto">Delete</button>` : ''}<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    const fillCats = () => {
      const s = $('#e-cat', m.d);
      s.innerHTML = html`${CATS[k].map((x) => html`<option ${raw(e0.category === x ? 'selected' : '')}>${x}</option>`)}${e0.category && !CATS[k].includes(e0.category) && e0.kind === k ? html`<option selected>${e0.category}</option>` : ''}`.s;
      $('#e-party-l', m.d).textContent = k === 'income' ? 'Received from' : 'Paid to';
      const tl = $('#e-tl', m.d);
      if (tl) tl.innerHTML = countsOptions(k, e0.kind === k ? e0.tax_line : '', 'As its category says').s;
    };
    fillCats();
    if (id) filesBox(m, 'entry_id', id);
    $('#e-kind', m.d).addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (!b) return; k = b.dataset.v; $$('#e-kind button', m.d).forEach((x) => x.classList.toggle('on', x === b)); fillCats(); });
    if (id) $('#e-del', m.d).addEventListener('click', async () => {
      if (!sure('Delete this entry?')) return;
      try { const r = await api('entries.delete', { id: Number(id) }); m.close(); toast('Deleted', false, r.trash_id); refresh(); } catch (err) { m.err(err.message); }
    });
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const c = parseMoney($('#e-amt', m.d).value);
      if (isNaN(c) || c <= 0) return m.err('Enter an amount, like 49.99');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          await api('entries.save', { id: id ? Number(id) : undefined, kind: k, date: $('#e-date', m.d).value, amount_cents: c, category: $('#e-cat', m.d).value,
            party: $('#e-party', m.d).value, method: $('#e-method', m.d).value, client_id: $('#e-client', m.d).value ? Number($('#e-client', m.d).value) : null, note: $('#e-note', m.d).value, ref: $('#e-ref', m.d).value, tax_line: $('#e-tl', m.d) ? $('#e-tl', m.d).value : undefined,
            project_id: $('#e-project', m.d) && $('#e-project', m.d).value ? Number($('#e-project', m.d).value) : null });
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

  // ---------------------------------------------------------------- shared pickers
  async function projectsCache(force) {
    if (!on('f_projects') || (member() && perms().projects === 'none')) return [];
    if (!state.projects || force) state.projects = (await api('projects.list')).projects;
    return state.projects;
  }
  async function teamCache(force) {
    if (!state.team || force) state.team = (await api('team.names')).workers;
    return state.team;
  }
  async function projectField(sel, id = 'f-project') {
    const list = await projectsCache();
    if (!list.length) return '';
    return html`<div><label for="${id}">Project (optional)</label><select id="${id}"><option value="">None</option>${list.map((p) => html`<option value="${p.id}" ${raw(String(p.id) === String(sel) ? 'selected' : '')}>${p.name}</option>`)}</select></div>`;
  }
  // project picker on invoice, card charge and payment plan forms: follows the client, picks their only open project by itself
  const projPick = () => on('f_projects') && !(member() && perms().projects === 'none')
    ? html`<div id="f-projbox" class="hide"><label for="f-proj">Project</label><select id="f-proj"></select><div class="hint">The money shows up on the project by itself.</div></div>` : '';
  async function wireProject(m, presetId) {
    const box = $('#f-projbox', m.d); if (!box) return;
    let list = [];
    try { list = await projectsCache(); } catch (e) { return; }
    const sel = $('#f-client', m.d);
    const fill = () => {
      const cid = Number(sel.value);
      const mine = list.filter((p) => (cid && p.client_id === cid) || String(p.id) === String(presetId));
      const open = mine.filter((p) => p.status !== 'done');
      if (!mine.length) { box.classList.add('hide'); $('#f-proj', m.d).innerHTML = ''; return; }
      const pick = presetId || (open.length === 1 ? open[0].id : '');
      $('#f-proj', m.d).innerHTML = html`<option value="">No project</option>${mine.map((p) => html`<option value="${p.id}" ${raw(String(p.id) === String(pick) ? 'selected' : '')}>${p.name}${p.status === 'done' ? ' (done)' : ''}</option>`)}`.s;
      box.classList.remove('hide');
    };
    sel.addEventListener('change', () => { presetId = null; fill(); });
    fill();
  }
  const projVal = (m) => { const el = $('#f-proj', m.d); return el && el.value ? Number(el.value) : null; };
  const hrs = (min) => { const h = (min || 0) / 60; return (Math.round(h * 100) / 100).toLocaleString('en-US') + ' h'; };
  // "1.5", "1:30", "90m" → minutes
  function parseHours(s) {
    const t = String(s || '').trim().toLowerCase();
    let m = t.match(/^(\d{1,2}):([0-5]\d)$/);
    if (m) return Number(m[1]) * 60 + Number(m[2]);
    m = t.match(/^(\d{1,4})\s*m(in)?$/);
    if (m) return Number(m[1]);
    m = t.match(/^(\d{1,2}(\.\d{1,2})?|\.\d{1,2})\s*h?$/);
    if (m) return Math.round(parseFloat(m[1]) * 60);
    return NaN;
  }
  const payLabel = (type, rate) => type === 'project' ? (rate ? money(rate) + ' for the project' : 'per project') : (rate ? money(rate) + '/hr' : 'hourly');
  const METHODS_PAY = ['Zelle', 'Bank transfer', 'Check', 'Cash', 'Card', 'Other'];

  // ---------------------------------------------------------------- uploads: PDF, Word, Excel, CSV, photos
  // a photo from the phone is made smaller first, so it stays under 4 MB
  async function shrinkImage(file) {
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size < 1.2e6) return file;
    try {
      const img = await createImageBitmap(file);
      const k = Math.min(1, 2000 / Math.max(img.width, img.height));
      const c = document.createElement('canvas'); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      const blob = await new Promise((res) => c.toBlob(res, 'image/jpeg', 0.82));
      return blob && blob.size < file.size ? new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' }) : file;
    } catch (e) { return file; }
  }
  async function sendFile(file) {
    const f = await shrinkImage(file);
    if (f.size > 4 * 1024 * 1024) throw new Error(`"${file.name}" is over 4 MB. Make it smaller and try again.`);
    let r, d;
    try {
      r = await fetch('/api/upload', { method: 'POST', credentials: 'same-origin', body: f,
        headers: { 'X-GG': '1', 'Content-Type': 'application/octet-stream', 'X-File-Name': encodeURIComponent(f.name), 'X-File-Type': f.type || '' } });
    } catch (e) { throw new Error('No connection. Check your internet and try again.'); }
    try { d = await r.json(); } catch (e) { d = { error: 'Server error (' + r.status + ')' }; }
    if (r.status === 401) { gate(); throw new Error('Please sign in'); }
    if (!r.ok) throw new Error(d.error || 'Upload failed');
    return d;
  }
  function pickFiles(multiple, accept = '') {
    return new Promise((resolve) => {
      const i = document.createElement('input'); i.type = 'file'; i.multiple = multiple; i.accept = accept;
      i.addEventListener('change', () => resolve(Array.from(i.files || [])));
      i.click();
    });
  }
  // upload one or more files, then for each: a bank statement goes to import, anything else to "Save document"
  async function uploadFiles(files, hint) {
    for (const file of files) {
      toast(`Reading ${file.name}…`);
      let r;
      try { r = await sendFile(file); } catch (e) { toast(e.message, true); continue; }
      $('#toast').className = 'toast';
      if (r.table && hint !== 'doc' && on('f_import')) await importFlow(r);
      else if (!on('f_uploads')) toast('This is not a bank statement. Uploading documents is switched off in Settings.', true);
      else await docForm(r, hint);
    }
  }
  const fileLink = (f) => html`<a class="filechip" href="/api/file?id=${f.id}" target="_blank" rel="noopener">${raw(ICON.clip)}<span>${f.name}</span></a>`;

  // the form after an upload: what was read from the file, ready to check and save as an expense, income or a bill
  function docForm(r, hint) {
    return new Promise((resolve) => {
      const g = r.guess || {};
      let k = hint === 'bill' ? 'bill' : g.kind || (hint === 'income' ? 'income' : 'expense');
      if (!on('f_bills') && k === 'bill') k = 'expense';
      const m = modal('Save document', html`<div class="fields">
        <div class="docfile">${fileLink(r.file)}<span class="muted">${r.read ? 'Filled in from the file. Check it before you save.' : 'Nothing could be read from this file. Fill it in.'}</span></div>
        ${r.duplicate ? html`<div class="banner" style="margin:0">${r.duplicate}</div>` : ''}
        <div class="seg inc" id="d-kind"><button type="button" data-v="expense">Expense (paid)</button>${on('f_bills') ? html`<button type="button" data-v="bill">Bill to pay</button>` : ''}<button type="button" data-v="income">Income</button></div>
        <div class="grid2"><div><label for="d-amt">Amount</label><input id="d-amt" inputmode="decimal" placeholder="0.00" value="${g.amount_cents ? plain(g.amount_cents) : ''}"></div>
          <div><label for="d-date" id="d-date-l">Date</label><input id="d-date" type="date" value="${g.date || today()}"></div></div>
        <div class="grid2"><div><label for="d-party" id="d-party-l">Paid to</label><input id="d-party" maxlength="120" value="${g.party || ''}"></div>
          <div><label for="d-cat">Category</label><select id="d-cat"></select></div></div>
        <div class="grid2"><div><label for="d-num">Receipt / bill / invoice #</label><input id="d-num" maxlength="60" value="${g.number || ''}"></div>
          <div><label for="d-due">Due date</label><input id="d-due" type="date" value="${g.due_date || ''}"></div></div>
        <div class="not-bill"><label for="d-method">Paid by</label><select id="d-method">${METHODS.map((x) => html`<option>${x}</option>`)}</select></div>
        <div id="d-proj"></div>
        <div><label for="d-note">Note</label><input id="d-note" maxlength="1000" value=""></div>
      </div>`, html`<button type="button" class="btn ghost" data-close>Skip</button><button class="btn" type="submit">Save</button>`);
      m.d.addEventListener('close', () => resolve(null));
      projectField('', 'd-project').then((h) => { const b = $('#d-proj', m.d); if (b) b.innerHTML = h ? h.s : ''; });
      const setKind = (v) => {
        k = v;
        $$('#d-kind button', m.d).forEach((x) => x.classList.toggle('on', x.dataset.v === v));
        $$('.bill-only', m.d).forEach((x) => x.classList.toggle('hide', v !== 'bill'));
        $$('.not-bill', m.d).forEach((x) => x.classList.toggle('hide', v === 'bill'));
        $('#d-party-l', m.d).textContent = v === 'income' ? 'Received from' : v === 'bill' ? 'Supplier' : 'Paid to';
        $('#d-date-l', m.d).textContent = v === 'bill' ? 'Bill date' : 'Date';
        const cats = v === 'income' ? CATS.income : CATS.expense;
        const want = g.category && cats.includes(g.category) ? g.category : v === 'bill' ? 'Hardware & inventory' : cats[cats.length - 1];
        $('#d-cat', m.d).innerHTML = html`${cats.map((x) => html`<option ${raw(x === want ? 'selected' : '')}>${x}</option>`)}`.s;
        $('#d-method', m.d).value = v === 'income' ? 'Zelle' : 'Card';
      };
      setKind(k);
      $('#d-kind', m.d).addEventListener('click', (ev) => { const b = ev.target.closest('button'); if (b) setKind(b.dataset.v); });
      m.form.addEventListener('submit', async (ev) => {
        ev.preventDefault(); m.err('');
        const c = parseMoney($('#d-amt', m.d).value);
        if (isNaN(c) || c <= 0) return m.err('Enter the amount, like 1250.00');
        const proj = $('#d-project', m.d) && $('#d-project', m.d).value ? Number($('#d-project', m.d).value) : null;
        await busy(m.form.querySelector('[type=submit]'), async () => {
          try {
            if (k === 'bill') await api('bills.save', { vendor: $('#d-party', m.d).value || 'Supplier', number: $('#d-num', m.d).value, amount_cents: c, category: $('#d-cat', m.d).value,
              bill_date: $('#d-date', m.d).value, due_date: $('#d-due', m.d).value, project_id: proj, note: $('#d-note', m.d).value, file_id: r.file.id });
            else await api('entries.save', { kind: k, date: $('#d-date', m.d).value, amount_cents: c, category: $('#d-cat', m.d).value, party: $('#d-party', m.d).value,
              method: $('#d-method', m.d).value, note: $('#d-note', m.d).value, ref: $('#d-num', m.d).value, project_id: proj, file_id: r.file.id });
            m.close(); toast(k === 'bill' ? 'Bill saved with the file' : 'Saved with the file'); refresh(); resolve(true);
          } catch (err) { m.err(err.message); }
        });
      });
    });
  }

  // files on an entry or a bill: open, remove, attach another
  async function filesBox(m, where, id) {
    const box = $('#f-files', m.d); if (!box) return;
    const draw = async () => {
      const r = await api('files.list', { [where]: Number(id) });
      const canEdit = (can('books', 'edit') || can('bills', 'edit')) && on('f_uploads');
      box.innerHTML = html`${r.files.map((f) => html`<div class="filerow">${fileLink(f)}<span class="muted">${Math.max(1, Math.round(f.size / 1024))} KB</span>${canEdit ? html`<button type="button" class="linkbtn" data-file-del="${f.id}">Remove</button>` : ''}</div>`)}
        ${canEdit ? html`<button type="button" class="linkbtn" data-file-add="1">+ Attach a file</button>` : ''}`.s;
    };
    box.addEventListener('click', async (e) => {
      const del = e.target.closest('[data-file-del]');
      if (del) { if (!confirm('Remove this file?')) return; await api('files.delete', { id: Number(del.dataset.fileDel) }); return draw(); }
      if (e.target.closest('[data-file-add]')) {
        const files = await pickFiles(true);
        for (const f of files) { try { const r = await sendFile(f); await api('files.attach', { file_id: r.file.id, [where]: Number(id) }); } catch (err) { toast(err.message, true); } }
        draw();
      }
    });
    try { await draw(); } catch (e) { box.innerHTML = ''; }
  }

  // ---------------------------------------------------------------- bank statement import
  const IMPORT_STATUS = { new: ['New', 'open'], bill: ['Pays a bill', 'open'], worker: ['Team pay', 'open'], in_books: ['Already in Books', 'paid'], stripe: ['Stripe payout', 'void'], transfer: ['Transfer', 'void'] };
  async function importFlow(up, map, flip) {
    let d;
    try { d = await api('import.preview', { file_id: up.file.id, map, flip }); } catch (e) { toast(e.message, true); return; }
    const rows = d.rows;
    const picked = new Set(rows.filter((x) => ['new', 'bill', 'worker'].includes(x.status)).map((x) => x.i));
    const col = (key, label) => html`<div><label>${label}</label><select data-map="${key}"><option value="-1">—</option>${d.header.map((h, j) => html`<option value="${j}" ${raw(d.map[key] === j ? 'selected' : '')}>${h || 'Column ' + (j + 1)}</option>`)}</select></div>`;
    const counts = rows.reduce((o, x) => { o[x.status] = (o[x.status] || 0) + 1; return o; }, {});
    const m = modal('Import bank statement', html`<div class="fields">
      <div class="docfile">${fileLink(up.file)}<span class="muted">${rows.length} rows · ${Object.entries(counts).map(([s, n]) => `${n} ${IMPORT_STATUS[s][0].toLowerCase()}`).join(' · ')}</span></div>
      ${d.already ? html`<div class="banner" style="margin:0">${d.already} rows from this file are already in Books. Importing again adds them twice.</div>` : ''}
      <details class="more"><summary>Columns</summary><div class="grid3 cols4">${col('date', 'Date')}${col('desc', 'Description')}${col('amount', 'Amount')}${col('debit', 'Money out')}${col('credit', 'Money in')}</div>
        <label class="ck" style="margin-top:8px"><input type="checkbox" id="im-flip" ${raw(flip ? 'checked' : '')}><span>Money in and out are the wrong way round</span></label>
        <button type="button" class="btn ghost sm" id="im-re" style="margin-top:8px">Read again</button></details>
      <div class="imtable">${rows.map((x) => html`<label class="imrow ${picked.has(x.i) ? 'on' : ''}" data-i="${x.i}">
        <input type="checkbox" ${raw(picked.has(x.i) ? 'checked' : '')}>
        <div class="main"><b>${x.party || x.desc}</b><span>${x.date} · ${x.desc}</span>${x.note ? html`<span class="imnote">${x.note}</span>` : ''}</div>
        ${['new'].includes(x.status) ? html`<select data-cat="${x.i}">${(x.kind === 'income' ? CATS.income : CATS.expense).map((c) => html`<option ${raw(c === x.category ? 'selected' : '')}>${c}</option>`)}</select>` : pill(IMPORT_STATUS[x.status][1], IMPORT_STATUS[x.status][0])}
        <div class="amt num ${x.amount_cents > 0 ? 'pos' : 'neg'}">${x.amount_cents > 0 ? '+' : '−'}${money(Math.abs(x.amount_cents))}</div></label>`)}</div>
    </div>`, html`<span class="muted grow" id="im-sum"></span><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit" id="im-go">Add to Books</button>`);
    m.d.classList.add('wide');
    const sum = () => { $('#im-sum', m.d).textContent = `${picked.size} picked`; $('#im-go', m.d).textContent = `Add ${picked.size} to Books`; $('#im-go', m.d).disabled = !picked.size; };
    sum();
    m.d.addEventListener('change', (e) => {
      const row = e.target.closest('.imrow');
      if (row && e.target.type === 'checkbox') { const i = Number(row.dataset.i); if (e.target.checked) picked.add(i); else picked.delete(i); row.classList.toggle('on', e.target.checked); sum(); }
    });
    $('#im-re', m.d).addEventListener('click', () => {
      const mp = {}; $$('[data-map]', m.d).forEach((s) => { mp[s.dataset.map] = Number(s.value); });
      m.close(); importFlow(up, mp, $('#im-flip', m.d).checked);
    });
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault(); m.err('');
      const out = rows.filter((x) => picked.has(x.i)).map((x) => ({ date: x.date, amount_cents: x.amount_cents, kind: x.kind, desc: x.desc, party: x.party,
        category: ($(`[data-cat="${x.i}"]`, m.d) || {}).value || x.category, bill_id: x.bill_id, worker_id: x.worker_id, client_id: x.client_id }));
      await busy($('#im-go', m.d), async () => {
        try { const r = await api('import.commit', { file_id: up.file.id, rows: out }); m.close(); toast(`${r.count} added to Books`); refresh(); }
        catch (err) { m.err(err.message); }
      });
    });
  }
  async function importsList() {
    const d = await api('import.list');
    const m = modal('Bank imports', html`<div class="panel rows flat">${d.imports.length ? d.imports.map((x) => html`<div class="row"><div class="main"><b>${x.name}</b><span>${x.rows} rows · ${fmtDate(x.first)} – ${fmtDate(x.last)} · imported ${fmtDate(x.created_at)}</span></div><span></span>
      <div class="acts" style="grid-column:auto"><button type="button" class="btn danger sm" data-undo-import="${x.id}">Undo import</button></div></div>`) : empty('No imports yet.')}</div>`,
      html`<button type="button" class="btn" data-close>Done</button>`);
    m.d.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-undo-import]'); if (!b) return;
      if (!confirm('Take every row of this import out of Books?')) return;
      const r = await api('import.undo', { file_id: Number(b.dataset.undoImport) }); m.close(); toast(`${r.count} rows taken out`); refresh();
    });
  }

  // ---------------------------------------------------------------- accountant pack
  function accountantPack() {
    const y = new Date().getFullYear();
    const m = modal('Year-end pack for the accountant', html`<div class="fields">
      <p class="soft">One Excel file: profit and loss, every transaction, income and expenses, bills, team pay with the 1099 check, and the year's invoices${on('f_tax') ? ', plus the tax summary, owner money, the 1099 check of everyone paid, and missing receipts' : ''}.</p>
      ${on('f_qb') ? html`<p class="hint">For QuickBooks: <button type="button" class="linkbtn" data-close data-tx="qb">QuickBooks files</button></p>` : ''}
      <div><label for="ap-y">Year</label><select id="ap-y">${[y, y - 1, y - 2, y - 3].map((v) => html`<option ${raw(v === (new Date().getMonth() < 3 ? y - 1 : y) ? 'selected' : '')}>${v}</option>`)}</select></div></div>`,
      html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">${raw(ICON.down)}Download</button>`);
    m.form.addEventListener('submit', (e) => { e.preventDefault(); location.href = '/api/export?year=' + encodeURIComponent($('#ap-y', m.d).value); m.close(); toast('Making the file… it downloads in a moment'); });
  }

  // ---------------------------------------------------------------- bills
  let billFilter = 'unpaid';
  const BILL_LABEL = { open: 'unpaid', partial: 'part paid', overdue: 'late', paid: 'paid' };
  function billRow(b) {
    state.bills[b.id] = b;
    const sub = [b.number ? '#' + b.number : '', b.due_date ? (b.status === 'paid' ? 'was due ' : 'due ') + fmtDate(b.due_date) : 'no due date', b.category, b.project_name, b.client_name].filter(Boolean).join(' · ');
    return html`<div class="row click" data-act="edit-bill" data-id="${b.id}" tabindex="0">
      <div class="main"><b>${b.vendor}${b.files ? raw(`<i class="clip">${ICON.clip}</i>`) : ''}</b><span>${sub}</span></div>
      ${pill(b.status === 'partial' ? 'partial' : b.status, BILL_LABEL[b.status])}
      <div class="amt">${money(b.left_cents || b.amount_cents)}<small>${b.status === 'paid' ? 'paid' : b.paid_cents ? 'left of ' + money(b.amount_cents) : fmtDate(b.bill_date)}</small></div>
      ${b.left_cents && can('bills', 'edit') ? html`<div class="acts"><button class="btn sm" data-act="pay-bill" data-id="${b.id}">Pay</button></div>` : ''}
    </div>`;
  }
  VIEWS.bills = async () => {
    const d = await api('bills.list');
    state.billList = d.bills;
    const t = d.totals;
    return html`
      <div class="head"><div><h1>Bills</h1><div class="sub">What you owe suppliers. Paying a bill puts the expense in your books.</div></div>
        <div class="acts">${on('f_bulk') ? html`<button class="btn ghost" data-act="pick-start" data-kind="bills">Select</button>` : ''}<button class="btn ghost" data-act="export-bills">${raw(ICON.down)}Excel</button>
          ${can('bills', 'edit') ? html`${on('f_uploads') ? html`<button class="btn ghost" data-act="upload" data-hint="bill">${raw(ICON.upload)}Upload bill</button>` : ''}<button class="btn" data-act="new-bill">${raw(ICON.plus)}New bill</button>` : ''}</div></div>
      <div class="kpis three">
        ${kpi('Owed now', money(t.owed), t.open + ' unpaid bill' + (t.open === 1 ? '' : 's'))}
        ${kpi('Late', money(t.late), t.lateCount + ' past the due date', t.lateCount ? 'neg' : '')}
        ${kpi('Due in 7 days', money(t.week), t.weekCount + ' bill' + (t.weekCount === 1 ? '' : 's'))}
      </div>
      <div class="chips" style="margin-top:16px" id="bchips">${[['unpaid', 'Unpaid'], ['overdue', 'Late'], ['paid', 'Paid'], ['', 'All']].map(([v, l]) => html`<button type="button" data-bf="${v}" class="${billFilter === v ? 'on' : ''}">${l}</button>`)}</div>
      <div class="panel rows" id="blist"></div>`;
  };
  const billsShown = () => (state.billList || []).filter((b) => !billFilter || (billFilter === 'unpaid' ? b.left_cents > 0 : b.status === billFilter));
  function drawBills() {
    const box = $('#blist'); if (!box) return;
    const list = billsShown();
    box.innerHTML = (list.length ? html`${list.map((b) => pickWrap('bills', b.id, billRow(b)))}` : empty(billFilter === 'unpaid' ? 'Nothing to pay. Every bill is paid.' : 'No bills here.')).s;
  }

  // ---------------------------------------------------------------- picking several rows at once
  const SHOWN = { invoices: () => invShown().map((i) => i.id), bills: () => billsShown().map((b) => String(b.id)), books: () => booksShown().map((e) => String(e.id)) };
  function pickWrap(kind, id, row) {
    if (state.pick.kind !== kind) return row;
    const on = state.pick.ids.has(String(id));
    return html`<div class="pick ${on ? 'on' : ''}" data-pick="${id}"><span class="pbox">${raw(on ? ICON.ok : '')}</span>${row}</div>`;
  }
  const PICK_ACTS = {
    invoices: () => [['bulk-remind', 'Email reminder', 'invoices'], ['bulk-paid', 'Mark paid', 'invoices'], ['bulk-void', 'Void', 'invoices'], ['bulk-export', 'Excel', '']],
    bills: () => [['bulk-pay', 'Pay in full', 'bills'], ['bulk-delete', 'Delete', 'bills'], ['bulk-export', 'Excel', '']],
    books: () => [['bulk-category', 'Change category', 'books'], ...(on('f_tax') ? [['bulk-taxline', 'Counts as', 'books']] : []), ['bulk-project', 'Set project', 'books'], ['bulk-delete', 'Delete', 'books'], ['bulk-export', 'Excel', '']]
  };
  function pickStart(kind) {
    state.pick = { kind, ids: new Set() };
    pickBar(); redrawPicked();
  }
  function pickEnd() {
    state.pick = { kind: null, ids: new Set() };
    const b = $('.bulkbar'); if (b) b.remove();
    redrawPicked();
  }
  function redrawPicked() { drawInvoices(); drawBills(); drawBooks(); $$('[data-act="pick-start"]').forEach((x) => x.classList.toggle('on', !!state.pick.kind)); }
  function pickBar() {
    let bar = $('.bulkbar');
    if (!state.pick.kind) { if (bar) bar.remove(); return; }
    if (!bar) { bar = document.createElement('div'); bar.className = 'bulkbar'; document.body.appendChild(bar); }
    const n = state.pick.ids.size, kind = state.pick.kind;
    bar.innerHTML = html`<b>${n} selected</b><button type="button" class="linkbtn" data-act="pick-all">${n && n === SHOWN[kind]().length ? 'Clear' : 'Select all'}</button>
      <span class="grow"></span>${PICK_ACTS[kind]().filter(([, , sec]) => !sec || can(sec, 'edit')).map(([a, l]) => html`<button type="button" class="btn ${a === 'bulk-delete' || a === 'bulk-void' ? 'danger' : 'ghost'} sm" data-act="${a}" ${raw(n ? '' : 'disabled')}>${l}</button>`)}
      <button type="button" class="btn ghost sm" data-act="pick-end">Done</button>`.s;
  }
  // run one action on every picked row, one after another, and say how it went
  async function bulkRun(label, ids, fn) {
    let ok = 0, bad = 0, last = '';
    const out = [];
    for (const id of ids) {
      toast(`${label}… ${ok + bad + 1} of ${ids.length}`);
      try { out.push(await fn(id)); ok++; } catch (e) { bad++; last = e.message; }
    }
    pickEnd();
    return { ok, bad, last, out };
  }
  async function bulkAct(a, btn) {
    const kind = state.pick.kind, ids = Array.from(state.pick.ids);
    if (!ids.length) return;
    if (a === 'bulk-export') {
      if (kind === 'invoices') { const keep = state.invList; state.invList = keep.filter((i) => ids.includes(i.id)); EXPORTS['export-invoices'](); state.invList = keep; }
      if (kind === 'bills') { const keep = state.billList; state.billList = keep.filter((b) => ids.includes(String(b.id))); EXPORTS['export-bills'](); state.billList = keep; }
      if (kind === 'books') { const keep = state.entryList; state.entryList = keep.filter((e) => ids.includes(String(e.id))); EXPORTS['export-books'](); state.entryList = keep; }
      return;
    }
    if (kind === 'invoices') {
      const inv = ids.map((id) => state.inv[id]).filter(Boolean);
      if (a === 'bulk-remind') {
        const open = inv.filter((i) => i.status === 'open' && i.email);
        if (!open.length) return toast('None of these are open invoices with an email', true);
        if (!confirm(`Email ${open.length} invoice${open.length === 1 ? '' : 's'} again, with the PDF?`)) return;
        const r = await bulkRun('Sending', open.map((i) => i.id), (id) => api('invoices.action', { id, action: 'send' }));
        toast(r.bad ? `${r.ok} sent, ${r.bad} failed: ${r.last}` : `${r.ok} sent`, !!r.bad); return refresh();
      }
      if (a === 'bulk-void') {
        const open = inv.filter((i) => i.status === 'open');
        if (!open.length) return toast('Only open invoices can be voided', true);
        if (!confirm(`Void ${open.length} invoice${open.length === 1 ? '' : 's'}? They can no longer be paid. This can't be undone.`)) return;
        const r = await bulkRun('Voiding', open.map((i) => i.id), (id) => api('invoices.action', { id, action: 'void' }));
        toast(r.bad ? `${r.ok} voided, ${r.bad} failed: ${r.last}` : `${r.ok} voided`, !!r.bad); return refresh();
      }
      if (a === 'bulk-paid') {
        const open = inv.filter((i) => i.status === 'open' || i.status === 'draft');
        if (!open.length) return toast('None of these are waiting for payment', true);
        const m = modal('Mark paid', html`<div class="fields"><p class="soft">${open.length} invoice${open.length === 1 ? '' : 's'} · ${money(open.reduce((x, i) => x + (i.due || i.total), 0))}</p>
          <div><label for="bp-m">How did they pay?</label><select id="bp-m">${['Cash', 'Check', 'Zelle', 'Bank transfer', 'Other'].map((x) => html`<option>${x}</option>`)}</select></div>
          <p class="hint">Each invoice is closed and the money goes into your books.</p></div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Mark paid</button>`);
        m.form.addEventListener('submit', async (e) => {
          e.preventDefault(); const method = $('#bp-m', m.d).value; m.close();
          const r = await bulkRun('Marking paid', open.map((i) => i.id), (id) => api('invoices.action', { id, action: 'mark_paid', method }));
          toast(r.bad ? `${r.ok} marked paid, ${r.bad} failed: ${r.last}` : `${r.ok} marked paid`, !!r.bad); refresh();
        });
        return;
      }
    }
    if (kind === 'bills') {
      if (a === 'bulk-delete') {
        if (!confirm(`Delete ${ids.length} bill${ids.length === 1 ? '' : 's'}? Payments already made stay in your books.${undoNote()}`)) return;
        const r = await bulkRun('Deleting', ids, (id) => api('bills.delete', { id: Number(id) }));
        toast(`${r.ok} deleted`, !!r.bad, r.out.map((x) => x.trash_id)); return refresh();
      }
      if (a === 'bulk-pay') {
        const bl = ids.map((id) => state.bills[id]).filter((b) => b && b.left_cents > 0);
        if (!bl.length) return toast('These bills are already paid', true);
        const m = modal('Pay bills in full', html`<div class="fields"><p class="soft">${bl.length} bill${bl.length === 1 ? '' : 's'} · ${money(bl.reduce((x, b) => x + b.left_cents, 0))}</p>
          <div class="grid2"><div><label for="bb-d">Date paid</label><input id="bb-d" type="date" value="${today()}"></div>
          <div><label for="bb-m">Paid by</label><select id="bb-m">${METHODS_PAY.map((x) => html`<option ${raw(x === 'Bank transfer' ? 'selected' : '')}>${x}</option>`)}</select></div></div></div>`,
          html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Pay ${bl.length}</button>`);
        m.form.addEventListener('submit', async (e) => {
          e.preventDefault(); const date = $('#bb-d', m.d).value, method = $('#bb-m', m.d).value; m.close();
          const r = await bulkRun('Paying', bl.map((b) => b.id), (id) => api('bills.pay', { id, amount_cents: state.bills[id].left_cents, date, method }));
          toast(r.bad ? `${r.ok} paid, ${r.bad} failed: ${r.last}` : `${r.ok} paid`, !!r.bad); refresh();
        });
        return;
      }
    }
    if (kind === 'books') {
      if (a === 'bulk-delete') {
        if (!confirm(`Delete ${ids.length} entr${ids.length === 1 ? 'y' : 'ies'}?${undoNote()}`)) return;
        const r = await bulkRun('Deleting', ids, (id) => api('entries.delete', { id: Number(id) }));
        toast(`${r.ok} deleted`, !!r.bad, r.out.map((x) => x.trash_id)); return refresh();
      }
      if (a === 'bulk-taxline') {
        const kinds = new Set(ids.map((id) => (state.entries[id] || {}).kind));
        const kind = kinds.size === 1 ? [...kinds][0] : 'both';
        const opts = kind === 'both' ? html`<option value="">As its category says</option><option>Accountant to decide</option>` : countsOptions(kind, '', 'As its category says');
        const m = modal('How they count for taxes', html`<div class="fields"><p class="soft">${ids.length} entr${ids.length === 1 ? 'y' : 'ies'}${kind === 'both' ? ' (money in and out together: pick only money in or only money out for more choices)' : ''}</p>
          <div><label for="bk-t">Counts as</label><select id="bk-t">${opts}</select></div></div>`,
          html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Change</button>`);
        m.form.addEventListener('submit', async (e) => {
          e.preventDefault();
          try { const r = await api('entries.bulk', { ids: ids.map(Number), tax_line: $('#bk-t', m.d).value }); m.close(); pickEnd(); toast(`${r.count} changed`); refresh(); } catch (err) { m.err(err.message); }
        });
        return;
      }
      if (a === 'bulk-category' || a === 'bulk-project') {
        const proj = a === 'bulk-project';
        const kinds = new Set(ids.map((id) => (state.entries[id] || {}).kind));
        const cats = kinds.size === 1 ? CATS[[...kinds][0]] : CATS.expense.concat(CATS.income);
        const m = modal(proj ? 'Set project' : 'Change category', html`<div class="fields"><p class="soft">${ids.length} entr${ids.length === 1 ? 'y' : 'ies'}</p>
          ${proj ? await projectField('', 'bk-p') || html`<p class="muted">No projects yet.</p>` : html`<div><label for="bk-c">Category</label><select id="bk-c">${cats.map((x) => html`<option>${x}</option>`)}</select></div>`}</div>`,
          html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Change</button>`);
        m.form.addEventListener('submit', async (e) => {
          e.preventDefault();
          const args = proj ? { project_id: $('#bk-p', m.d) && $('#bk-p', m.d).value ? Number($('#bk-p', m.d).value) : null } : { category: $('#bk-c', m.d).value };
          try { const r = await api('entries.bulk', { ids: ids.map(Number), ...args }); m.close(); pickEnd(); toast(`${r.count} changed`); refresh(); } catch (err) { m.err(err.message); }
        });
      }
    }
  }

  async function billForm(id) {
    let b = { bill_date: today(), category: 'Hardware & inventory' }, payments = [];
    if (id) { const r = await api('bills.get', { id: Number(id) }); b = r.bill; payments = r.payments; }
    const edit = can('bills', 'edit');
    const cats = CATS.expense.includes(b.category) ? CATS.expense : CATS.expense.concat([b.category]);
    const m = modal(id ? 'Bill from ' + b.vendor : 'New bill', html`<div class="fields">
      <div class="grid2"><div><label for="b-vendor">Supplier</label><input id="b-vendor" value="${b.vendor || ''}" maxlength="120" required placeholder="Who sent the bill"></div>
        <div><label for="b-num">Their bill / invoice #</label><input id="b-num" value="${b.number || ''}" maxlength="60"></div></div>
      <div class="grid2"><div><label for="b-amt">Amount</label><input id="b-amt" inputmode="decimal" placeholder="0.00" value="${b.amount_cents ? plain(b.amount_cents) : ''}"></div>
        <div><label for="b-cat">Category</label><select id="b-cat">${cats.map((x) => html`<option ${raw(b.category === x ? 'selected' : '')}>${x}</option>`)}</select></div></div>
      <div class="grid2"><div><label for="b-date">Bill date</label><input id="b-date" type="date" value="${b.bill_date}"></div>
        <div><label for="b-due">Due date</label><input id="b-due" type="date" value="${b.due_date || ''}"></div></div>
      ${await projectField(b.project_id, 'b-project')}
      ${can('clients') ? html`<div><label for="b-client">For a client (optional)</label><select id="b-client"><option value="">None</option>${(await clientsCache()).map((c) => html`<option value="${c.id}" ${raw(String(c.id) === String(b.client_id) ? 'selected' : '')}>${c.name}${c.company ? ' · ' + c.company : ''}</option>`)}</select></div>` : ''}
      <div><label for="b-note">Note</label><input id="b-note" maxlength="1000" value="${b.note || ''}" placeholder="e.g. 30% deposit now, rest on shipping"></div>
      ${id ? html`<div><label>Files</label><div id="f-files" class="filesbox"></div></div>` : ''}
      ${id ? html`<div><label>Payments</label><div class="panel rows flat">${payments.length ? payments.map((p) => html`<div class="row"><div class="main"><b>${money(p.amount_cents)}</b><span>${[fmtDate(p.date), p.method, p.note].filter(Boolean).join(' · ')}</span></div><span></span>
          ${edit ? html`<button type="button" class="linkbtn" data-act="bill-unpay" data-id="${p.id}">Remove</button>` : html`<span></span>`}</div>`) : empty('Nothing paid yet.')}</div>
        <div class="hint">${money(b.paid_cents)} paid · ${money(b.left_cents)} left</div></div>` : ''}
    </div>`, html`${id && edit ? html`<button type="button" class="btn danger" id="b-del" style="margin-right:auto">Delete</button>` : ''}
      ${id && edit && b.left_cents ? html`<button type="button" class="btn ghost" id="b-pay">Pay</button>` : ''}
      <button type="button" class="btn ghost" data-close>${edit ? 'Cancel' : 'Close'}</button>${edit ? html`<button class="btn" type="submit">Save</button>` : ''}`);
    if (!edit) $$('input,select', m.d).forEach((x) => { x.disabled = true; });
    if (id) filesBox(m, 'bill_id', id);
    if (id && edit) {
      $('#b-del', m.d).addEventListener('click', async () => {
        if (!confirm('Delete this bill? Payments you already made stay in your books.' + undoNote())) return;
        try { const r = await api('bills.delete', { id: Number(id) }); m.close(); toast('Bill deleted', false, r.trash_id); refresh(); } catch (err) { m.err(err.message); }
      });
      const pb = $('#b-pay', m.d); if (pb) pb.addEventListener('click', () => { m.close(); payBillForm(b); });
      m.d.addEventListener('click', async (ev) => {
        const x = ev.target.closest('[data-act="bill-unpay"]'); if (!x) return;
        ev.stopPropagation();
        if (!sure('Remove this payment from the bill and from your books?')) return;
        try { const r = await api('entries.delete', { id: Number(x.dataset.id) }); m.close(); toast('Payment removed', false, r.trash_id); refresh(); } catch (err) { m.err(err.message); }
      });
    }
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const c = parseMoney($('#b-amt', m.d).value);
      if (isNaN(c) || c <= 0) return m.err('Enter the amount, like 1250.00');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          const r = await api('bills.save', { id: id ? Number(id) : undefined, vendor: $('#b-vendor', m.d).value, number: $('#b-num', m.d).value, amount_cents: c,
            category: $('#b-cat', m.d).value, bill_date: $('#b-date', m.d).value, due_date: $('#b-due', m.d).value,
            project_id: $('#b-project', m.d) && $('#b-project', m.d).value ? Number($('#b-project', m.d).value) : null,
            client_id: $('#b-client', m.d) && $('#b-client', m.d).value ? Number($('#b-client', m.d).value) : null, note: $('#b-note', m.d).value });
          m.close(); toast(id ? 'Saved' : 'Bill added'); refresh();
          return r;
        } catch (err) { m.err(err.message); }
      });
    });
  }

  function payBillForm(b) {
    const m = modal('Pay bill', html`<div class="fields"><p class="soft">${b.vendor}${b.number ? ' · #' + b.number : ''} · ${money(b.left_cents)} left to pay</p>
      <div class="grid2"><div><label for="pb-a">Amount</label><input id="pb-a" inputmode="decimal" value="${plain(b.left_cents)}"></div>
        <div><label for="pb-d">Date paid</label><input id="pb-d" type="date" value="${today()}"></div></div>
      <div><label for="pb-m">Paid by</label><select id="pb-m">${METHODS_PAY.map((x) => html`<option ${raw(x === 'Bank transfer' ? 'selected' : '')}>${x}</option>`)}</select></div>
      <div><label for="pb-n">Note</label><input id="pb-n" maxlength="1000" placeholder="e.g. wire confirmation #"></div>
      <p class="hint">Paying less than the full amount is fine: the rest stays open on the bill.</p></div>`,
    html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Record payment</button>`);
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault(); m.err('');
      const c = parseMoney($('#pb-a', m.d).value);
      if (isNaN(c) || c <= 0 || c > b.left_cents) return m.err('Enter an amount up to ' + money(b.left_cents));
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try { await api('bills.pay', { id: b.id, amount_cents: c, date: $('#pb-d', m.d).value, method: $('#pb-m', m.d).value, note: $('#pb-n', m.d).value }); m.close(); toast('Payment recorded'); refresh(); }
        catch (err) { m.err(err.message); }
      });
    });
  }

  // ---------------------------------------------------------------- projects
  const PSTATUS = [['planned', 'Planned'], ['active', 'Active'], ['on_hold', 'On hold'], ['done', 'Done']];
  const PLABEL = Object.fromEntries(PSTATUS);
  const TSTATUS = { todo: 'To do', doing: 'Doing', done: 'Done' };
  let projFilter = 'open';
  function projectRow(p) {
    const pct = p.tasks_total ? Math.round((p.tasks_done / p.tasks_total) * 100) : 0;
    const late = p.due_date && p.status !== 'done' && p.due_date < today();
    const sub = [p.client_name, p.team, p.due_date ? (late ? 'was due ' : 'due ') + fmtDate(p.due_date) : ''].filter(Boolean).join(' · ');
    const amt = p.budget_cents != null && p.budget_cents ? html`${money(p.spent)}<small>spent of ${money(p.budget_cents)}</small>`
      : p.spent != null ? html`${money(p.spent)}<small>spent</small>` : p.minutes != null ? html`${hrs(p.minutes)}<small>logged</small>` : '';
    return html`<a class="row" href="#/projects/${p.id}">
      <div class="main"><b>${p.name}</b><span>${sub || 'No team yet'}</span></div>
      ${pill(late ? 'overdue' : p.status, late ? 'late' : PLABEL[p.status])}
      <div class="amt">${amt}</div>
      <div class="acts" style="align-items:center"><div class="progress grow"><i data-w="${pct}"></i></div><small class="muted">${p.tasks_done} of ${p.tasks_total} tasks</small></div>
    </a>`;
  }
  VIEWS.projects = async (arg) => {
    if (arg) return projectPage(arg);
    const list = await projectsCache(true);
    const open = list.filter((p) => p.status !== 'done');
    return html`
      <div class="head"><div><h1>Projects</h1><div class="sub">${open.length} open · ${list.filter((p) => p.status === 'active').length} active</div></div>
        <div class="acts">${!member() ? html`<button class="btn" data-act="new-project">${raw(ICON.plus)}New project</button>` : ''}</div></div>
      <div class="chips" id="pchips">${[['open', 'Open'], ['active', 'Active'], ['planned', 'Planned'], ['on_hold', 'On hold'], ['done', 'Done'], ['', 'All']].map(([v, l]) => html`<button type="button" data-pf="${v}" class="${projFilter === v ? 'on' : ''}">${l}</button>`)}</div>
      <div class="panel rows" id="plist"></div>`;
  };
  function drawProjects() {
    const box = $('#plist'); if (!box) return;
    const list = (state.projects || []).filter((p) => !projFilter || (projFilter === 'open' ? p.status !== 'done' : p.status === projFilter));
    box.innerHTML = (list.length ? html`${list.map(projectRow)}` : empty(member() ? 'No projects here.' : 'No projects here. Start one with "New project".')).s;
    paintBars(box);
  }

  function taskRow(t, c) {
    state.tasks[t.id] = t;
    const mine = member() && t.worker_id === state.me.id;
    const canMove = c.tasks === 'all' || (c.tasks === 'own' && mine);
    const late = t.due_date && t.status !== 'done' && t.due_date < today();
    return html`<div class="row task ${t.status === 'done' ? 'done' : ''}">
      ${canMove ? html`<button type="button" class="tick" data-act="task-next" data-id="${t.id}" aria-label="Move to next step" title="${t.status === 'todo' ? 'Start' : t.status === 'doing' ? 'Mark done' : 'Open again'}">${raw(t.status === 'done' ? ICON.ok : t.status === 'doing' ? ICON.clock : '')}</button>` : html`<span class="tick ro">${raw(t.status === 'done' ? ICON.ok : '')}</span>`}
      <div class="main ${c.tasks === 'all' ? 'click' : ''}" ${raw(c.tasks === 'all' ? `data-act="edit-task" data-id="${t.id}"` : '')}><b>${t.title}</b><span>${[t.worker_name || 'Not assigned', t.due_date ? (late ? 'late, was due ' : 'due ') + fmtDate(t.due_date) : '', t.note].filter(Boolean).join(' · ')}</span></div>
      ${pill(late ? 'overdue' : 't-' + t.status, late ? 'late' : TSTATUS[t.status])}
    </div>`;
  }
  async function projectPage(id) {
    const d = await api('projects.get', { id: Number(id) });
    state.proj = d;
    const p = d.project, c = d.can, mny = d.money;
    const late = p.due_date && p.status !== 'done' && p.due_date < today();
    const done = d.tasks.filter((t) => t.status === 'done').length;
    const pct = d.tasks.length ? Math.round((done / d.tasks.length) * 100) : 0;
    const line = (l, v, cls) => html`<div class="l ${cls || ''}"><span>${l}</span><span class="num">${v}</span></div>`;
    const myLogs = d.logs;
    const totalMin = myLogs.reduce((s, l) => s + l.minutes, 0);
    return html`
      <div class="head"><div>
          <div class="muted"><a href="#/projects" class="muted">← Projects</a></div>
          <h1>${p.name} ${pill(late ? 'overdue' : p.status, late ? 'late' : PLABEL[p.status])}</h1>
          <div class="sub">${[d.client ? d.client.name + (d.client.company ? ' · ' + d.client.company : '') : '', p.start_date ? 'started ' + fmtDate(p.start_date) : '', p.due_date ? 'due ' + fmtDate(p.due_date) : ''].filter(Boolean).join(' · ')}</div>
        </div>
        <div class="acts">
          ${c.time ? html`<button class="btn" data-act="log-time" data-project="${p.id}">${raw(ICON.clock)}Log hours</button>` : ''}
          ${c.edit ? html`<button class="btn ghost" data-act="edit-project" data-id="${p.id}">Edit</button>` : ''}
        </div></div>
      <div class="kpis ${mny ? '' : 'three'}">
        ${kpi('Progress', pct + '%', `${done} of ${d.tasks.length} tasks done`)}
        ${mny ? kpi('Money in', money(mny.in.total), mny.in.expected ? money(mny.in.expected) + ' still to come' : 'nothing waiting', 'pos')
          : kpi(member() ? 'Your hours' : 'Hours', hrs(totalMin))}
        ${mny ? kpi('Money out', money(mny.out.total), mny.out.expected ? money(mny.out.expected) + ' still to pay' : 'nothing left to pay', 'neg') : ''}
        ${mny ? kpi('Profit so far', money(mny.profitNow), 'when all is paid: ' + money(mny.profitEnd), mny.profitEnd >= 0 ? 'pos' : 'neg')
          : d.myPay ? kpi('Your pay', money(d.myPay.owed), money(d.myPay.paid) + ' paid of ' + money(d.myPay.earned) + ' earned') : ''}
      </div>
      ${mny ? moneyPanels(d) : ''}
      <div class="cols" style="margin-top:8px">
        <div>
          <h2 class="sec">Tasks ${d.tasks.length ? html`<span class="muted">${done}/${d.tasks.length}</span>` : ''}</h2>
          <div class="panel">
            ${c.tasks === 'all' || c.tasks === 'own' ? html`<form class="addnote" id="taskform" data-project="${p.id}"><input id="tasknew" placeholder="${c.tasks === 'all' ? 'Add a task…' : 'Add a task for yourself…'}" maxlength="200"><button class="btn sm" type="submit">Add</button></form>` : ''}
            <div class="rows">${c.tasks === 'none' ? empty('Tasks are hidden for you.') : d.tasks.length ? d.tasks.map((t) => taskRow(t, c)) : empty('No tasks yet.')}</div>
          </div>
          ${myLogs.length || c.time ? html`<h2 class="sec">Hours <span class="muted">${hrs(totalMin)}</span></h2>
          <div class="panel rows">${myLogs.length ? myLogs.map((l) => { state.logs[l.id] = l; const own = !member() || l.worker_id === state.me.id;
            return html`<div class="row ${own ? 'click' : ''}" ${raw(own ? `data-act="edit-time" data-id="${l.id}" tabindex="0"` : '')}><div class="main"><b>${l.worker_name}</b><span>${[fmtDate(l.date), l.note].filter(Boolean).join(' · ')}</span></div><span></span><div class="amt">${hrs(l.minutes)}</div></div>`; }) : empty('No hours logged yet.')}</div>` : ''}
        </div>
        <div>
          ${p.description ? html`<h2 class="sec">About</h2><div class="panel pad notes">${p.description}</div>` : ''}
          <h2 class="sec">Team</h2>
          <div class="panel rows">${d.team.length ? d.team.map((w) => {
            const pay = mny && mny.byWorker[w.worker_id];
            return html`<div class="row"><div class="main"><b>${w.name}${w.active ? '' : ' (not active)'}</b><span>${[w.title, w.pay_type ? payLabel(w.pay_type, w.rate_cents) : '', pay ? hrs(pay.minutes) : ''].filter(Boolean).join(' · ')}</span></div>
              <span></span><div class="amt">${pay ? html`${money(pay.owed)}<small>owed · ${money(pay.paid)} paid</small>` : ''}</div>
              ${c.pay && (!member() || mny) ? html`<div class="acts"><button class="btn ghost sm" data-act="pay-worker" data-worker="${w.worker_id}" data-project="${p.id}">Pay ${w.name.split(' ')[0]}</button></div>` : ''}</div>`;
          }) : empty(c.team ? 'Nobody on this project yet. Add people with Edit.' : 'No team yet.')}</div>
          <h2 class="sec">Updates</h2>
          <div class="panel feed">
            ${c.notes ? html`<form class="addnote" id="pnoteform" data-project="${p.id}"><input id="pnote" placeholder="Where things stand, a problem, what's next…" maxlength="2000"><button class="btn sm" type="submit">Post</button></form>` : ''}
            <div class="rows">${d.notes.length ? d.notes.map((n) => html`<div class="row"><div class="main"><b>${n.body}</b><span>${n.author}</span></div><div class="amt"><small>${ago(n.created_at)}</small></div></div>`) : empty('No updates yet.')}</div>
          </div>
          ${!member() ? html`<p style="margin-top:28px"><button class="btn danger sm" data-act="delete-project" data-id="${p.id}">Delete project</button></p>` : ''}
        </div>
      </div>`;
  }

  // where the project's money came from, what is still to come, what went out and what is still to pay. All automatic.
  function moneyPanels(d) {
    const mny = d.money, p = d.project, c = d.can;
    const canInv = can('invoices', 'edit');
    const due = (x) => x.due ? (x.late ? 'late, was due ' : 'due ') + fmtDate(x.due) : '';
    const r = (main, sub, amt, cls, act) => html`<div class="row ${cls || ''}"><div class="main"><b>${main}</b><span>${sub}</span></div><span></span><div class="amt">${amt}</div>${act ? html`<div class="acts">${act}</div>` : ''}</div>`;
    const grp = (title, total) => html`<div class="mgrp"><span>${title}</span><b class="num">${money(total)}</b></div>`;
    const inRec = mny.in.received.map((x) => r(x.from, [fmtDate(x.date), x.how, x.note].filter(Boolean).join(' · '), money(x.amount), 'posi'));
    const inCome = mny.in.coming.map((x) => r(x.from, [x.what, due(x)].filter(Boolean).join(' · '), money(x.amount), x.late ? 'neg' : '',
      x.notInvoiced && canInv && d.client ? html`<button class="btn sm" data-act="new-invoice" data-client="${d.client.id}" data-project="${p.id}">Invoice it</button>`
        : x.url ? html`<a class="btn ghost sm" href="${safeUrl(x.url)}" target="_blank" rel="noopener">Pay link</a>` : ''));
    const outPaid = mny.out.paid.map((x) => r(x.to, [fmtDate(x.date), x.what, x.how].filter(Boolean).join(' · '), money(x.amount), 'neg'));
    const outTo = mny.out.toPay.map((x) => r(x.to, [x.what, due(x)].filter(Boolean).join(' · '), money(x.amount), x.late ? 'neg' : '',
      x.bill && can('bills', 'edit') ? html`<button class="btn sm" data-act="pay-bill-id" data-id="${x.bill}">Pay</button>`
        : x.worker && c.pay ? html`<button class="btn sm" data-act="pay-worker" data-worker="${x.worker}" data-project="${p.id}">Pay</button>` : ''));
    const used = p.budget_cents ? Math.round((mny.cost / p.budget_cents) * 100) : 0;
    return html`
      ${mny.stripeOk ? '' : html`<div class="banner" style="margin-top:14px">Could not reach Stripe just now, so online payments may be missing below. Refresh in a minute.</div>`}
      <div class="cols money" style="margin-top:8px">
        <div><h2 class="sec">Money in</h2>
          <div class="panel rows">
            ${grp('Came in', mny.in.total)}${inRec.length ? inRec : empty('Nothing yet.')}
            ${grp('Still to come', mny.in.expected)}${inCome.length ? inCome : empty(mny.price ? 'Nothing left. All paid.' : 'Nothing waiting.')}
          </div>
          ${canInv && d.client ? html`<div class="addacts"><button class="btn ghost sm" data-act="new-invoice" data-client="${d.client.id}" data-project="${p.id}">${raw(ICON.invoice)}New invoice</button>
            <button class="btn ghost sm" data-act="link-invoices" data-id="${p.id}" data-client="${d.client.id}">Add an invoice made before</button></div>` : ''}
          <p class="hint">${mny.price ? `Price to the client: ${money(mny.price)}. ` : 'Set the price on the project (Edit) to see what is not invoiced yet. '}Invoices, card charges and payment plans for this project, and income tagged with it in Books, show here by themselves.</p>
        </div>
        <div><h2 class="sec">Money out</h2>
          <div class="panel rows">
            ${grp('Paid', mny.out.total)}${outPaid.length ? outPaid : empty('Nothing yet.')}
            ${grp('Still to pay', mny.out.expected)}${outTo.length ? outTo : empty('Nothing to pay.')}
          </div>
          ${p.budget_cents ? html`<div class="panel pad" style="margin-top:10px"><div class="progress"><i data-w="${Math.min(100, used)}"></i></div>
            <div class="hint">${used}% of the ${money(p.budget_cents)} budget (paid and still to pay)</div></div>` : ''}
          <p class="hint">Bills for this project, team pay from logged hours, and expenses tagged with it in Books show here by themselves.</p>
        </div>
      </div>`;
  }

  async function linkInvoicesForm(projectId, clientId) {
    const all = (await api('invoices.list', {})).invoices.filter((i) => String(i.client_id) === String(clientId) && !i.project_id && i.status !== 'void');
    if (!all.length) return toast('No other invoices for this client');
    const m = modal('Add invoices to this project', html`<div class="fields"><div class="choices">${all.map((i) => html`<label class="choice"><input type="checkbox" value="${i.id}"><div><b>${i.number || 'Draft'} · ${money(i.total)}</b><span>${[fmtDate(i.created), i.status === 'open' ? (i.overdue ? 'late' : 'waiting') : i.status, i.lines.map((l) => l.description).join(', ')].filter(Boolean).join(' · ')}</span></div></label>`)}</div></div>`,
      html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Add</button>`);
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault(); m.err('');
      const ids = $$('input:checked', m.d).map((x) => x.value);
      if (!ids.length) return m.err('Pick at least one');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try { for (const id of ids) await api('invoices.link', { id, project_id: Number(projectId) }); m.close(); toast('Added'); refresh(); }
        catch (err) { m.err(err.message); }
      });
    });
  }

  async function projectForm(id) {
    let p = { status: 'active', start_date: today() }, team = [];
    if (id) { const d = state.proj && String(state.proj.project.id) === String(id) ? state.proj : await api('projects.get', { id: Number(id) }); p = d.project; team = d.team; }
    const owner = !member();
    const showClient = owner || (perms().client_info && can('clients'));
    const showBudget = owner || perms().money;
    const workers = owner ? (await api('workers.list')).workers.filter((w) => w.active || team.some((t) => t.worker_id === w.id)) : [];
    const onTeam = Object.fromEntries(team.map((t) => [t.worker_id, t]));
    const m = modal(id ? 'Edit project' : 'New project', html`<div class="fields">
      <div><label for="p-name">Project name</label><input id="p-name" value="${p.name || ''}" maxlength="120" required></div>
      ${showClient ? await clientField(p.client_id, 'p-client') : ''}
      <div><label for="p-status">Status</label><select id="p-status">${PSTATUS.map(([v, l]) => html`<option value="${v}" ${raw(p.status === v ? 'selected' : '')}>${l}</option>`)}</select></div>
      ${showBudget ? html`<div class="grid2"><div><label for="p-price">Price to the client (optional)</label><input id="p-price" inputmode="decimal" placeholder="0.00" value="${p.price_cents ? plain(p.price_cents) : ''}"><div class="hint">Shows what is not invoiced yet</div></div>
        <div><label for="p-budget">Budget for costs (optional)</label><input id="p-budget" inputmode="decimal" placeholder="0.00" value="${p.budget_cents ? plain(p.budget_cents) : ''}"><div class="hint">Warns when costs go over</div></div></div>` : ''}
      <div class="grid2"><div><label for="p-start">Start</label><input id="p-start" type="date" value="${p.start_date || ''}"></div>
        <div><label for="p-due">Due</label><input id="p-due" type="date" value="${p.due_date || ''}"></div></div>
      <div><label for="p-desc">About the project</label><textarea id="p-desc" maxlength="4000" placeholder="What, for whom, what done looks like">${p.description || ''}</textarea></div>
      ${owner ? html`<div><label>Team and pay on this project</label>
        ${workers.length ? html`<div class="teampick">${workers.map((w) => { const t = onTeam[w.id]; const type = t ? t.pay_type : w.pay_type; const rate = t ? t.rate_cents : w.rate_cents;
          return html`<div class="tp" data-w="${w.id}"><label class="ck"><input type="checkbox" ${raw(t ? 'checked' : '')}><span>${w.name}${w.title ? html` <small class="muted">${w.title}</small>` : ''}</span></label>
            <select data-k="type"><option value="hourly" ${raw(type === 'hourly' ? 'selected' : '')}>Per hour</option><option value="project" ${raw(type === 'project' ? 'selected' : '')}>Fixed for project</option></select>
            <input data-k="rate" inputmode="decimal" placeholder="0.00" value="${rate ? plain(rate) : ''}"></div>`; })}</div>
          <div class="hint">Per hour: paid for the hours they log. Fixed: one agreed price for this project.</div>`
        : html`<div class="hint">No team yet. Add people under <a href="#/team" data-close>Team</a> first.</div>`}</div>` : ''}
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      let budget = null, price = null;
      if (showBudget && $('#p-budget', m.d).value.trim()) { budget = parseMoney($('#p-budget', m.d).value); if (isNaN(budget)) return m.err('Budget should be a number, like 5000'); }
      if (showBudget && $('#p-price', m.d).value.trim()) { price = parseMoney($('#p-price', m.d).value); if (isNaN(price)) return m.err('Price should be a number, like 12000'); }
      let teamOut;
      if (owner) {
        teamOut = [];
        for (const row of $$('.tp', m.d)) {
          if (!row.querySelector('input[type=checkbox]').checked) continue;
          const r = row.querySelector('[data-k=rate]').value.trim();
          const rc = r ? parseMoney(r) : 0;
          if (isNaN(rc)) return m.err('Check the pay amounts');
          teamOut.push({ worker_id: Number(row.dataset.w), pay_type: row.querySelector('[data-k=type]').value, rate_cents: rc });
        }
      }
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          const args = { id: id ? Number(id) : undefined, name: $('#p-name', m.d).value, status: $('#p-status', m.d).value, start_date: $('#p-start', m.d).value, due_date: $('#p-due', m.d).value, description: $('#p-desc', m.d).value };
          if (showClient) args.client_id = $('#p-client', m.d).value ? Number($('#p-client', m.d).value) : null;
          if (showBudget) { args.budget_cents = budget; args.price_cents = price; }
          if (owner) args.team = teamOut;
          const r = await api('projects.save', args);
          state.projects = null;
          m.close(); toast(id ? 'Saved' : 'Project started');
          if (!id) location.hash = '#/projects/' + r.id; else refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  async function taskForm(id) {
    const t = state.tasks[id]; if (!t) return;
    const team = await teamCache();
    const m = modal('Task', html`<div class="fields">
      <div><label for="t-title">Task</label><input id="t-title" value="${t.title}" maxlength="200"></div>
      <div class="grid2"><div><label for="t-who">Who does it</label><select id="t-who"><option value="">Not assigned</option>${team.map((w) => html`<option value="${w.id}" ${raw(w.id === t.worker_id ? 'selected' : '')}>${w.name}</option>`)}</select></div>
        <div><label for="t-status">Status</label><select id="t-status">${Object.entries(TSTATUS).map(([v, l]) => html`<option value="${v}" ${raw(t.status === v ? 'selected' : '')}>${l}</option>`)}</select></div></div>
      <div><label for="t-due">Due</label><input id="t-due" type="date" value="${t.due_date || ''}"></div>
      <div><label for="t-note">Note</label><input id="t-note" value="${t.note || ''}" maxlength="2000"></div>
    </div>`, html`<button type="button" class="btn danger" id="t-del" style="margin-right:auto">Delete</button><button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    $('#t-del', m.d).addEventListener('click', async () => {
      if (!sure('Delete this task?')) return;
      try { const r = await api('tasks.delete', { id: t.id }); m.close(); toast('Task deleted', false, r.trash_id); refresh(); } catch (err) { m.err(err.message); }
    });
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          await api('tasks.save', { id: t.id, title: $('#t-title', m.d).value, worker_id: $('#t-who', m.d).value ? Number($('#t-who', m.d).value) : null,
            status: $('#t-status', m.d).value, due_date: $('#t-due', m.d).value, note: $('#t-note', m.d).value });
          m.close(); toast('Saved'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  async function timeForm(projectId, logId) {
    const l = logId ? state.logs[logId] : { date: today(), project_id: projectId };
    const owner = !member();
    const projects = projectId || logId ? [] : (await projectsCache()).filter((p) => p.status !== 'done');
    if (!projectId && !logId && !projects.length) return toast('No open projects to log hours on', true);
    const people = owner && !logId ? (state.proj && state.proj.project.id === Number(projectId) && state.proj.team.length ? state.proj.team.map((w) => ({ id: w.worker_id, name: w.name })) : await teamCache()) : [];
    if (owner && !logId && !people.length) return toast('Add people under Team first', true);
    const m = modal(logId ? 'Hours' : 'Log hours', html`<div class="fields">
      ${projects.length ? html`<div><label for="h-proj">Project</label><select id="h-proj">${projects.map((p) => html`<option value="${p.id}">${p.name}</option>`)}</select></div>` : ''}
      ${people.length ? html`<div><label for="h-who">Who worked</label><select id="h-who">${people.map((w) => html`<option value="${w.id}">${w.name}</option>`)}</select></div>` : ''}
      <div class="grid2"><div><label for="h-h">Hours</label><input id="h-h" inputmode="decimal" placeholder="e.g. 2.5 or 2:30" value="${l.minutes ? String(Math.round((l.minutes / 60) * 100) / 100) : ''}"></div>
        <div><label for="h-d">Date</label><input id="h-d" type="date" value="${l.date}"></div></div>
      <div><label for="h-n">What was done</label><input id="h-n" maxlength="500" value="${l.note || ''}"></div>
    </div>`, html`${logId ? html`<button type="button" class="btn danger" id="h-del" style="margin-right:auto">Delete</button>` : ''}<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    if (logId) $('#h-del', m.d).addEventListener('click', async () => {
      if (!sure('Delete these hours?')) return;
      try { const r = await api('time.delete', { id: Number(logId) }); m.close(); toast('Hours deleted', false, r.trash_id); refresh(); } catch (err) { m.err(err.message); }
    });
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const min = parseHours($('#h-h', m.d).value);
      if (isNaN(min) || min < 1 || min > 1440) return m.err('Enter hours, like 2.5 or 2:30');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          await api('time.save', { id: logId ? Number(logId) : undefined, project_id: projectId ? Number(projectId) : $('#h-proj', m.d) ? Number($('#h-proj', m.d).value) : undefined,
            worker_id: $('#h-who', m.d) ? Number($('#h-who', m.d).value) : undefined, minutes: min, date: $('#h-d', m.d).value, note: $('#h-n', m.d).value });
          m.close(); toast('Hours saved'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  function timeFormFor(workerId, projects) {
    const m = modal('Log hours', html`<div class="fields">
      <div><label for="hf-proj">Project</label><select id="hf-proj">${projects.map((p) => html`<option value="${p.id}">${p.name}</option>`)}</select></div>
      <div class="grid2"><div><label for="hf-h">Hours</label><input id="hf-h" inputmode="decimal" placeholder="e.g. 2.5 or 2:30"></div>
        <div><label for="hf-d">Date</label><input id="hf-d" type="date" value="${today()}"></div></div>
      <div><label for="hf-n">What was done</label><input id="hf-n" maxlength="500"></div></div>`,
    html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const min = parseHours($('#hf-h', m.d).value);
      if (isNaN(min) || min < 1 || min > 1440) return m.err('Enter hours, like 2.5 or 2:30');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try { await api('time.save', { project_id: Number($('#hf-proj', m.d).value), worker_id: workerId, minutes: min, date: $('#hf-d', m.d).value, note: $('#hf-n', m.d).value });
          delete state.workers[workerId]; m.close(); toast('Hours saved'); refresh(); }
        catch (err) { m.err(err.message); }
      });
    });
  }

  // ---------------------------------------------------------------- team
  const ACCESS_LABEL = (w) => !w.login ? 'no sign-in' : 'can sign in';
  VIEWS.team = async (arg) => {
    if (arg) return workerPage(arg);
    const d = await api('workers.list');
    state.workerList = d.workers;
    const loginOff = state.cfg && state.cfg.settings && !state.cfg.settings.team_login;
    return html`
      <div class="head"><div><h1>Team</h1><div class="sub">${d.workers.filter((w) => w.active).length} active · ${money(d.owed)} owed in pay</div></div>
        <div class="acts"><button class="btn" data-act="new-worker">${raw(ICON.plus)}Add person</button></div></div>
      ${loginOff && d.workers.some((w) => w.login) ? html`<div class="banner"><b>Team sign-in is off.</b> People with sign-in can't get in until you turn on "Let team members sign in" in <a href="#/settings">Settings</a>.</div>` : ''}
      <div class="panel rows">${d.workers.length ? d.workers.map((w) => html`<a class="row" href="#/team/${w.id}">
        <div class="main"><b>${w.name}${w.active ? '' : ' (not active)'}</b><span>${[w.title, payLabel(w.pay_type, w.rate_cents), w.projects ? w.projects + ' open project' + (w.projects === 1 ? '' : 's') : ''].filter(Boolean).join(' · ')}</span></div>
        ${pill(w.login ? 'active' : 'draft', ACCESS_LABEL(w))}
        <div class="amt">${money(w.pay.owed)}<small>owed · ${hrs(w.pay.minutes)}</small></div></a>`) : empty('Nobody yet. Add the people who work on your projects: workers, freelancers, a project manager, a bookkeeper.')}</div>
      <p class="hint">Each person can get their own sign-in, and you choose exactly what they see and change.</p>`;
  };

  async function workerPage(id) {
    const [d, act] = await Promise.all([api('workers.get', { id: Number(id) }), on('f_log') ? api('audit.list', { worker_id: Number(id) }).catch(() => ({ items: [] })) : { items: [] }]);
    const w = d.worker;
    state.workers[w.id] = d;
    return html`
      <div class="head"><div>
          <div class="muted"><a href="#/team" class="muted">← Team</a></div>
          <h1>${w.name} ${pill(w.login ? 'active' : 'draft', ACCESS_LABEL(w))}</h1>
          <div class="sub">${[w.title, payLabel(w.pay_type, w.rate_cents) + ' by default'].filter(Boolean).join(' · ')}</div>
          <div class="who">${w.email ? html`<a href="mailto:${w.email}">${w.email}</a>` : ''}${w.phone ? html`<a href="tel:${w.phone.replace(/[^\d+]/g, '')}">${w.phone}</a>` : ''}</div>
        </div>
        <div class="acts"><button class="btn" data-act="pay-worker" data-worker="${w.id}">${raw(ICON.dollar)}Pay</button>
          <button class="btn ghost" data-act="log-time-for" data-worker="${w.id}">${raw(ICON.clock)}Log hours</button>
          <button class="btn ghost" data-act="edit-worker" data-id="${w.id}">Edit and access</button></div></div>
      <div class="kpis">
        ${kpi('Hours', hrs(d.pay.minutes), 'all projects')}
        ${kpi('Earned', money(d.pay.earned), 'hours × rate, plus fixed prices')}
        ${kpi('Paid', money(d.pay.paid), d.payments.length + ' payment' + (d.payments.length === 1 ? '' : 's'))}
        ${kpi('Owed', money(d.pay.owed), '', d.pay.owed ? 'neg' : 'pos')}
      </div>
      <div class="cols" style="margin-top:8px">
        <div>
          <h2 class="sec">Projects</h2>
          <div class="panel rows">${d.projects.length ? d.projects.map((p) => html`<a class="row" href="#/projects/${p.id}"><div class="main"><b>${p.name}</b><span>${payLabel(p.pay_type, p.rate_cents)}</span></div>${pill(p.status, PLABEL[p.status])}<span></span></a>`) : empty('Not on any project yet.')}</div>
          <h2 class="sec">Hours</h2>
          <div class="panel rows">${d.logs.length ? d.logs.map((l) => { state.logs[l.id] = l; return html`<div class="row click" data-act="edit-time" data-id="${l.id}" tabindex="0"><div class="main"><b>${l.project_name}</b><span>${[fmtDate(l.date), l.note].filter(Boolean).join(' · ')}</span></div><span></span><div class="amt">${hrs(l.minutes)}</div></div>`; }) : empty('No hours logged.')}</div>
        </div>
        <div>
          <h2 class="sec">Payments</h2>
          <div class="panel rows">${d.payments.length ? d.payments.map((p) => html`<div class="row"><div class="main"><b>${money(p.amount_cents)}</b><span>${[fmtDate(p.date), p.method, p.project_name, p.note].filter(Boolean).join(' · ')}</span></div><span></span><div class="amt"></div></div>`) : empty('Nothing paid yet.')}</div>
          <p class="hint">Payments are expenses in Books (category Contractors &amp; developers). Delete one there to undo it.</p>
          ${w.notes ? html`<h2 class="sec">Notes</h2><div class="panel pad notes">${w.notes}</div>` : ''}
          ${act.items.length && on('f_log') ? html`<h2 class="sec">Recent activity <a class="muted" href="#/log">All</a></h2><div class="panel rows">${act.items.slice(0, 10).map(logRow)}</div>` : ''}
          <h2 class="sec">What ${w.name.split(' ')[0]} can see</h2>
          <div class="panel pad">${w.login ? accessSummary(w.perms) : html`<p class="muted">No sign-in. Only you see their records.</p>`}</div>
          <p style="margin-top:28px"><button class="btn danger sm" data-act="delete-worker" data-id="${w.id}">Delete</button></p>
        </div>
      </div>`;
  }
  const SECTION_NAMES = { clients: 'Clients', invoices: 'Invoices', payments: 'Payments and cards', plans: 'Payment plans', books: 'Books', bills: 'Bills', reports: 'Reports' };
  function accessSummary(p) {
    const lines = [
      p.projects === 'none' ? 'No projects' : p.projects === 'all' ? 'All projects' : 'Only projects they are on',
      { none: 'Tasks hidden', view: 'Sees tasks', own: 'Adds and updates their own tasks', all: 'Adds, assigns and changes all tasks' }[p.tasks],
      p.project_edit ? 'Can edit project details' : '', p.time ? 'Logs their hours' : '', p.notes ? 'Posts updates' : '',
      p.money ? 'Sees project money and everyone\'s hours' : '', p.pay ? 'Sees their own pay' : '', p.client_info ? 'Sees which client' : ''
    ].filter(Boolean);
    const secs = Object.entries(p.sections).map(([k, v]) => `${SECTION_NAMES[k]}: ${v === 'edit' ? 'view and change' : 'view only'}`);
    return html`<ul class="plain">${lines.concat(secs).map((x) => html`<li>${x}</li>`)}</ul>`;
  }

  async function workerForm(id) {
    const d = id ? state.workers[id] || await api('workers.get', { id: Number(id) }) : null;
    const w = d ? d.worker : { pay_type: 'hourly', active: true, login: false, perms: { projects: 'assigned', tasks: 'own', time: true, notes: true, pay: true, sections: {} } };
    const p = w.perms;
    const loginOff = state.cfg && state.cfg.settings && !state.cfg.settings.team_login;
    const ck = (key, title, sub) => html`<label class="setrow"><div><b>${title}</b>${sub ? html`<span>${sub}</span>` : ''}</div><span class="switch"><input type="checkbox" data-p="${key}" ${raw(p[key] ? 'checked' : '')}><i></i></span></label>`;
    const sel = (key, title, opts) => html`<label class="setrow"><div><b>${title}</b></div><select data-p="${key}" style="max-width:240px">${opts.map(([v, l]) => html`<option value="${v}" ${raw(p[key] === v ? 'selected' : '')}>${l}</option>`)}</select></label>`;
    const m = modal(id ? 'Edit ' + w.name : 'Add person', html`<div class="fields">
      <div class="grid2"><div><label for="w-name">Name</label><input id="w-name" value="${w.name || ''}" maxlength="120" required></div>
        <div><label for="w-title">Role</label><input id="w-title" value="${w.title || ''}" maxlength="80" placeholder="e.g. Developer, Installer, Bookkeeper"></div></div>
      <div class="grid2"><div><label for="w-email">Email</label><input id="w-email" type="email" value="${w.email || ''}" maxlength="200"></div>
        <div><label for="w-phone">Phone</label><input id="w-phone" type="tel" value="${w.phone || ''}" maxlength="40"></div></div>
      <div class="grid2"><div><label for="w-type">Usually paid</label><select id="w-type"><option value="hourly" ${raw(w.pay_type === 'hourly' ? 'selected' : '')}>Per hour</option><option value="project" ${raw(w.pay_type === 'project' ? 'selected' : '')}>Per project (fixed price)</option></select></div>
        <div><label for="w-rate">Default rate</label><input id="w-rate" inputmode="decimal" placeholder="0.00" value="${w.rate_cents ? plain(w.rate_cents) : ''}"></div></div>
      <div class="hint" style="margin-top:-6px">You can set a different rate on each project.</div>
      <label class="setrow"><div><b>Active</b><span>Off = kept for history, hidden from new projects, can't sign in</span></div><span class="switch"><input type="checkbox" id="w-active" ${raw(w.active ? 'checked' : '')}><i></i></span></label>
      <div><label for="w-notes">Notes</label><textarea id="w-notes" maxlength="2000" style="min-height:60px">${w.notes || ''}</textarea></div>

      <h3 class="formsec">Sign-in and access</h3>
      ${loginOff ? html`<div class="banner" style="margin:0">Team sign-in is off in Settings. You can set this up now; it works once you turn it on.</div>` : ''}
      <label class="setrow"><div><b>Can sign in</b><span>With their email and their own password, at gogetterinc.com/admin</span></div><span class="switch"><input type="checkbox" id="w-login" ${raw(w.login ? 'checked' : '')}><i></i></span></label>
      <div id="w-acc" class="${w.login ? '' : 'hide'}">
        <div><label for="w-pw">${w.has_password ? 'New password (leave empty to keep)' : 'Password for them'}</label><input id="w-pw" type="text" autocomplete="off" minlength="8" maxlength="200" placeholder="At least 8 characters"></div>
        <div class="hint">Changing it signs them out. Send it to them yourself.</div>
        <div style="margin-top:14px"><label>Start from</label><div class="chips" id="w-presets"><button type="button" data-preset="worker">Worker</button><button type="button" data-preset="manager">Project manager</button><button type="button" data-preset="bookkeeper">Bookkeeper</button></div></div>
        <div class="panel" id="w-perms">
          ${sel('projects', 'Projects they see', [['assigned', 'Only projects they are on'], ['all', 'All projects'], ['none', 'None']])}
          ${sel('tasks', 'Tasks', [['own', 'Add and update their own'], ['all', 'Add, assign and change all'], ['view', 'See only'], ['none', 'Hidden']])}
          ${ck('time', 'Log their hours', '')}
          ${ck('notes', 'Post project updates', '')}
          ${ck('project_edit', 'Edit project details', 'Name, status, dates, description')}
          ${ck('pay', 'See their own pay', 'Rate, earned, paid, owed')}
          ${ck('money', 'See project money', 'Budget, costs, profit, everyone\'s hours and pay')}
          ${ck('client_info', 'See which client', 'Client name on projects')}
        </div>
        <label style="margin-top:14px">Other parts of the admin</label>
        <div class="panel" id="w-secs">${Object.entries(SECTION_NAMES).map(([k, l]) => html`<label class="setrow"><div><b>${l}</b></div><select data-s="${k}" style="max-width:200px">
          ${[['none', 'Hidden'], ['view', 'View only'], ['edit', 'View and change']].map(([v, t]) => html`<option value="${v}" ${raw((p.sections[k] || 'none') === v ? 'selected' : '')}>${t}</option>`)}</select></label>`)}</div>
        <div class="hint">Settings, Team and the owner home page are always only yours.</div>
      </div>
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    $('#w-login', m.d).addEventListener('change', (e) => $('#w-acc', m.d).classList.toggle('hide', !e.target.checked));
    const PRESETS = {
      worker: { projects: 'assigned', tasks: 'own', time: true, notes: true, project_edit: false, pay: true, money: false, client_info: false, sections: {} },
      manager: { projects: 'all', tasks: 'all', time: true, notes: true, project_edit: true, pay: true, money: true, client_info: true, sections: { clients: 'view', invoices: 'view', bills: 'view' } },
      bookkeeper: { projects: 'all', tasks: 'view', time: false, notes: false, project_edit: false, pay: true, money: true, client_info: true, sections: { clients: 'view', invoices: 'view', payments: 'view', plans: 'view', books: 'edit', bills: 'edit', reports: 'view' } }
    };
    $('#w-presets', m.d).addEventListener('click', (e) => {
      const b = e.target.closest('[data-preset]'); if (!b) return;
      const pr = PRESETS[b.dataset.preset];
      $$('[data-p]', m.d).forEach((x) => { if (x.type === 'checkbox') x.checked = !!pr[x.dataset.p]; else x.value = pr[x.dataset.p]; });
      $$('[data-s]', m.d).forEach((x) => { x.value = pr.sections[x.dataset.s] || 'none'; });
      $$('#w-presets button', m.d).forEach((x) => x.classList.toggle('on', x === b));
    });
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const r = $('#w-rate', m.d).value.trim();
      const rate = r ? parseMoney(r) : 0;
      if (isNaN(rate)) return m.err('Rate should be a number, like 35');
      const pOut = { sections: {} };
      $$('[data-p]', m.d).forEach((x) => { pOut[x.dataset.p] = x.type === 'checkbox' ? x.checked : x.value; });
      $$('[data-s]', m.d).forEach((x) => { if (x.value !== 'none') pOut.sections[x.dataset.s] = x.value; });
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          const res = await api('workers.save', { id: id ? Number(id) : undefined, name: $('#w-name', m.d).value, title: $('#w-title', m.d).value, email: $('#w-email', m.d).value,
            phone: $('#w-phone', m.d).value, pay_type: $('#w-type', m.d).value, rate_cents: rate, active: $('#w-active', m.d).checked, notes: $('#w-notes', m.d).value,
            login: $('#w-login', m.d).checked, password: $('#w-pw', m.d).value, perms: pOut });
          state.team = null; delete state.workers[id];
          m.close(); toast(id ? 'Saved' : 'Added');
          if (!id) location.hash = '#/team/' + res.id; else refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  async function payWorkerForm(workerId, projectId) {
    let name = '', owed = 0;
    if (!member()) {
      const d = state.workers[workerId] || await api('workers.get', { id: Number(workerId) });
      name = d.worker.name;
      owed = projectId && state.proj && state.proj.money ? (state.proj.money.byWorker[workerId] || {}).owed || 0 : d.pay.owed;
    } else if (state.proj) {
      const t = state.proj.team.find((x) => x.worker_id === Number(workerId)); name = t ? t.name : '';
      owed = state.proj.money ? (state.proj.money.byWorker[workerId] || {}).owed || 0 : 0;
    }
    const m = modal('Pay ' + name, html`<div class="fields">
      ${owed ? html`<p class="soft">${money(owed)} owed${projectId ? ' on this project' : ''}</p>` : ''}
      <div class="grid2"><div><label for="wp-a">Amount</label><input id="wp-a" inputmode="decimal" value="${owed ? plain(owed) : ''}" placeholder="0.00"></div>
        <div><label for="wp-d">Date paid</label><input id="wp-d" type="date" value="${today()}"></div></div>
      <div><label for="wp-m">Paid by</label><select id="wp-m">${METHODS_PAY.map((x) => html`<option>${x}</option>`)}</select></div>
      ${projectId ? html`<input type="hidden" id="wp-p" value="${projectId}">` : await projectField('', 'wp-p')}
      <div><label for="wp-n">Note</label><input id="wp-n" maxlength="1000" placeholder="e.g. week of Oct 12"></div>
      <p class="hint">Saved as an expense in Books, and taken off what you owe them.</p></div>`,
    html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Record payment</button>`);
    m.form.addEventListener('submit', async (e) => {
      e.preventDefault(); m.err('');
      const c = parseMoney($('#wp-a', m.d).value);
      if (isNaN(c) || c <= 0) return m.err('Enter the amount you paid');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          const pj = $('#wp-p', m.d) && $('#wp-p', m.d).value ? Number($('#wp-p', m.d).value) : null;
          await api('workers.pay', { worker_id: Number(workerId), amount_cents: c, date: $('#wp-d', m.d).value, method: $('#wp-m', m.d).value, project_id: pj, note: $('#wp-n', m.d).value });
          delete state.workers[workerId];
          m.close(); toast('Payment recorded'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }

  // ---------------------------------------------------------------- a team member's home
  async function memberHome() {
    const d = await api('me.home');
    const p = perms();
    const h = new Date().getHours();
    const hello = (h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening') + ', ' + state.me.name.split(' ')[0];
    const k = [];
    if (d.hours) { k.push(kpi('Hours this week', hrs(d.hours.week))); k.push(kpi('Hours this month', hrs(d.hours.month))); }
    if (d.pay) { k.push(kpi('Owed to you', money(d.pay.owed), money(d.pay.paid) + ' paid so far')); }
    if (on('f_projects')) k.push(kpi('Open tasks', String(d.tasks.length), d.projects.length + ' project' + (d.projects.length === 1 ? '' : 's')));
    const canTime = p.time && on('f_time') && on('f_projects');
    const fakeCan = { tasks: p.tasks };
    return html`
      <div class="head"><div><h1>${hello}</h1><div class="sub">${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div></div>
        <div class="acts">${canTime ? html`<button class="btn" data-act="log-time">${raw(ICON.clock)}Log hours</button>` : ''}</div></div>
      ${k.length ? html`<div class="kpis ${k.length === 3 ? 'three' : ''}">${k}</div>` : ''}
      <div class="cols" style="margin-top:8px">
        <div>
          ${on('f_projects') && p.tasks !== 'none' ? html`<h2 class="sec">My tasks</h2><div class="panel rows">${d.tasks.length ? d.tasks.map((t) => taskRow({ ...t, worker_name: t.project_name }, fakeCan)) : empty('No open tasks. Nice.')}</div>` : ''}
          ${on('f_projects') && p.projects !== 'none' ? html`<h2 class="sec">My projects <a class="muted" href="#/projects">See all</a></h2><div class="panel rows">${d.projects.length ? d.projects.map(projectRow) : empty('No open projects.')}</div>` : ''}
        </div>
        <div>
          ${d.pay ? html`<h2 class="sec">My pay</h2><div class="panel pad"><p class="soft">${payLabel(d.pay.pay_type, d.pay.rate_cents)} by default. Some projects may have their own rate.</p>
            <p style="margin-top:8px">${hrs(d.pay.minutes)} logged · ${money(d.pay.earned)} earned · ${money(d.pay.paid)} paid · <b>${money(d.pay.owed)} owed</b></p></div>
            <h2 class="sec">Payments</h2><div class="panel rows">${d.pay.payments.length ? d.pay.payments.map((x) => html`<div class="row"><div class="main"><b>${money(x.amount_cents)}</b><span>${[fmtDate(x.date), x.method, x.project_name].filter(Boolean).join(' · ')}</span></div><span></span><div class="amt"></div></div>`) : empty('No payments yet.')}</div>` : ''}
        </div>
      </div>`;
  }

  // ---------------------------------------------------------------- trash
  VIEWS.trash = async () => {
    const d = await api('trash.list');
    state.trashList = d.items;
    return html`
      <div class="head"><div><div class="muted"><a href="#/settings" class="muted">← Settings</a></div><h1>Trash</h1>
        <div class="sub">Deleted items stay here for 30 days. Bringing one back puts back everything that belonged to it.</div></div>
        <div class="acts">${d.items.length ? html`<button class="btn danger" data-act="trash-empty">Empty Trash</button>` : ''}</div></div>
      <div class="panel rows">${d.items.length ? d.items.map((x) => html`<div class="row">
        <div class="main"><b>${x.label}</b><span>${x.kind_name} · deleted ${ago(x.deleted_at)} by ${x.by}</span></div><span></span>
        <div class="acts" style="grid-column:auto"><button class="btn sm" data-act="trash-restore" data-id="${x.id}">Bring back</button>
          <button class="btn ghost sm" data-act="trash-purge" data-id="${x.id}">Delete for good</button></div></div>`) : empty('The Trash is empty.')}</div>
      <p class="hint">Invoices, payments and refunds in Stripe can't be deleted here, so they never land in the Trash.</p>`;
  };

  // ---------------------------------------------------------------- activity log
  let logFilter = { who: '', q: '' };
  const logRow = (x) => html`<div class="row logrow">${x.link ? raw(`<a class="main" href="${esc(x.link)}" style="text-decoration:none">`) : raw('<div class="main">')}<b>${x.summary}</b><span>${x.who} · ${new Date(x.at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>${raw(x.link ? '</a>' : '</div>')}<span></span><div class="amt"><small>${ago(x.at)}</small></div></div>`;
  VIEWS.log = async () => {
    const [d, team] = await Promise.all([api('audit.list', { worker_id: logFilter.who, q: logFilter.q }), on('f_team') ? teamCache() : []]);
    state.logList = d.items; state.logMore = d.more;
    return html`
      <div class="head"><div><div class="muted"><a href="#/settings" class="muted">← Settings</a></div><h1>Activity log</h1>
        <div class="sub">Every change in the admin, who made it and when. Kept for 2 years.</div></div></div>
      <div class="filters" id="logform"><select id="logwho"><option value="">Everyone</option><option value="owner" ${raw(logFilter.who === 'owner' ? 'selected' : '')}>You (and Claude for you)</option>
        ${team.map((w) => html`<option value="${w.id}" ${raw(String(w.id) === logFilter.who ? 'selected' : '')}>${w.name}</option>`)}</select>
        <div class="search"><span>${raw(ICON.search)}</span><input id="logq" type="search" placeholder="Search, like &quot;invoice&quot; or a name" value="${logFilter.q}"></div></div>
      <div class="panel rows" id="loglist">${d.items.length ? d.items.map(logRow) : empty('Nothing here yet.')}</div>
      ${d.more ? html`<p style="margin-top:12px"><button class="btn ghost" data-act="log-more">Show older</button></p>` : ''}`;
  };

  // ---------------------------------------------------------------- to do (home)
  const TODO_IC = { invoice: [ICON.invoice, 'r'], bill: [ICON.bill, 'a'], worker: [ICON.team, ''], task: [ICON.task, 'r'], project: [ICON.project, 'a'], failed: [ICON.alert, 'r'], lead: [ICON.mail, ''] };
  function todoRow(t) {
    const [ic, tone] = TODO_IC[t.kind] || [ICON.bell, ''];
    const a = t.act || {};
    const btn = a.act === 'open' ? html`<a class="btn ghost sm" href="${raw(esc(a.href))}">${a.label}</a>`
      : a.act === 'inv' ? html`<button class="btn sm" data-act="inv-direct" data-a="${a.a}" data-id="${a.id}">${a.label}</button>`
      : a.act === 'pay-bill' ? html`<button class="btn sm" data-act="pay-bill-id" data-id="${a.id}">${a.label}</button>`
      : a.act === 'pay-worker' ? html`<button class="btn sm" data-act="pay-worker" data-worker="${a.worker}">${a.label}</button>` : '';
    return html`<div class="row"><span class="ic ${tone || (t.late ? 'r' : '')}">${raw(ic)}</span>
      <a class="main" href="${raw(esc(t.link || '#/home'))}" style="text-decoration:none"><b>${t.title}</b><span>${t.sub}</span></a>
      <div class="amt">${t.amount ? money(t.amount) : ''}</div><div class="acts">${btn}</div></div>`;
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
    'export-bills': () => download(`bills-${stamp()}.csv`, csv(state.billList || [], [
      ['Supplier', (b) => b.vendor], ['Bill #', (b) => b.number], ['Bill date', (b) => b.bill_date], ['Due', (b) => b.due_date], ['Status', (b) => BILL_LABEL[b.status]],
      ['Category', (b) => b.category], ['Project', (b) => b.project_name], ['Amount', (b) => Number(plain(b.amount_cents))], ['Paid', (b) => Number(plain(b.paid_cents))],
      ['Left to pay', (b) => Number(plain(b.left_cents))], ['Note', (b) => b.note]])),
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
    if (state.pick.kind && !e.target.closest('.bulkbar,dialog')) {
      const p = e.target.closest('[data-pick]');
      if (p) {
        e.preventDefault();
        const id = p.dataset.pick;
        if (state.pick.ids.has(id)) state.pick.ids.delete(id); else state.pick.ids.add(id);
        p.classList.toggle('on'); p.querySelector('.pbox').innerHTML = state.pick.ids.has(id) ? ICON.ok : '';
        return pickBar();
      }
    }
    const t = e.target.closest('[data-act],[data-cf],[data-if],[data-kf],[data-bf],[data-pf]');
    if (!t) return;
    if (t.dataset.cf !== undefined) { clientFilter.status = t.dataset.cf; $$('#cchips button').forEach((b) => b.classList.toggle('on', b === t)); return drawClients(); }
    if (t.dataset.if !== undefined) { invFilter = t.dataset.if; $$('#ichips button').forEach((b) => b.classList.toggle('on', b === t)); return drawInvoices(); }
    if (t.dataset.kf !== undefined) { books.kind = t.dataset.kf; $$('#kchips button').forEach((b) => b.classList.toggle('on', b === t)); return drawBooks(); }
    if (t.dataset.bf !== undefined) { billFilter = t.dataset.bf; $$('#bchips button').forEach((b) => b.classList.toggle('on', b === t)); return drawBills(); }
    if (t.dataset.pf !== undefined) { projFilter = t.dataset.pf; $$('#pchips button').forEach((b) => b.classList.toggle('on', b === t)); return drawProjects(); }
    const a = t.dataset.act;
    try {
      if (EXPORTS[a]) return EXPORTS[a]();
      switch (a) {
        case 'theme': return toggleTheme();
        case 'pick-start': return state.pick.kind ? pickEnd() : pickStart(t.dataset.kind);
        case 'pick-end': return pickEnd();
        case 'upload': { const files = await pickFiles(true); if (files.length) await uploadFiles(files, t.dataset.hint || ''); return; }
        case 'import-bank': { const files = await pickFiles(false, '.csv,.tsv,.xlsx,.xls,.txt,.iif,.qbo,.ofx,.qfx'); if (files.length) await uploadFiles(files, 'import'); return; }
        case 'imports-list': return importsList();
        case 'accountant-pack': return accountantPack();
        case 'pick-all': {
          const all = SHOWN[state.pick.kind]();
          state.pick.ids = state.pick.ids.size === all.length ? new Set() : new Set(all.map(String));
          redrawPicked(); return pickBar();
        }
        case 'bulk-remind': case 'bulk-paid': case 'bulk-void': case 'bulk-export': case 'bulk-pay': case 'bulk-delete': case 'bulk-category': case 'bulk-project': case 'bulk-taxline':
          return bulkAct(a, t);
        case 'undo': {
          $('#toast').className = 'toast';
          const r = await api('trash.restore', { ids: JSON.parse(t.dataset.ids || '[]') });
          state.clients = null; state.projects = null; state.team = null;
          toast('Brought back: ' + r.label); return refresh();
        }
        case 'logout': $$('dialog').forEach((x) => x.close()); await api('logout'); state.clients = null; state.cfg = null; state.me = null; state.projects = null; state.team = null; clearInterval(state.poll); return gate();
        case 'reload': return refresh();
        case 'notifs': return openNotifs();
        case 'notifs-read': await api('notifications.read'); setBadge(0); return refresh();
        case 'summary-send': { const r = await busy(t, () => api('summary.send')); return toast(r.sent ? 'Sent to ' + r.sent : 'Email is not connected'); }
        case 'connector-key': {
          if (state.cfg && state.cfg.connector && state.cfg.connector.on && !confirm('Make a new key? The old key stops working right away.')) return;
          const r = await busy(t, () => api('connector.key')); state.cfg = r; connectorKeyShow(r.key); return refresh();
        }
        case 'connector-off': { if (!confirm('Turn off the Claude connector? Your Claude app will no longer reach the admin.')) return; state.cfg = await api('connector.off'); toast('Connector turned off'); return refresh(); }
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
          if (!confirm('Delete this client? Their invoices and payments stay in Stripe.' + undoNote())) return;
          const r = await api('clients.delete', { id: Number(t.dataset.id) }); await clientsCache(true); toast('Client deleted', false, r.trash_id); location.hash = '#/clients'; return;
        }
        case 'new-invoice': return invoiceForm(t.dataset.client, t.dataset.project);
        case 'new-charge': return chargeForm(t.dataset.client, t.dataset.project);
        case 'new-plan': return planForm(t.dataset.client, t.dataset.project);
        case 'new-entry': return entryForm(t.dataset.kind);
        case 'edit-entry': return entryForm(null, t.dataset.id);
        case 'inv': return invAction(t.dataset.a, t.dataset.id, t);
        case 'refund': return refundForm(state.ch[t.dataset.id]);
        case 'card-link': {
          const r = await busy(t, () => api('cards.link', { client_id: Number(t.dataset.client) }));
          const c = (state.clients || []).find((x) => String(x.id) === String(t.dataset.client)) || {};
          return shareLink('Save-card link', r.url, { name: c.name, email: c.email }, 'card');
        }
        case 'card-test': await busy(t, () => api('cards.test', { client_id: Number(t.dataset.client) })); toast('Test card added'); return refresh();
        case 'card-remove': {
          if (!confirm('Remove this card from the client?')) return;
          await api('cards.remove', { client_id: Number(t.dataset.client), pm_id: t.dataset.id }); toast('Card removed'); return refresh();
        }
        case 'plan-cancel': {
          const p = state.plans[t.dataset.id];
          if (!confirm(`Stop the plan "${p ? p.title : ''}"? No more payments will be collected.`)) return;
          await api('plans.cancel', { id: Number(t.dataset.id) }); toast('Plan stopped'); return refresh();
        }
        case 'more': {
          e.preventDefault();
          const rest = navItems().slice(4);
          const m = modal('More', html`<div class="panel rows flat">${rest.map(([k, l, i]) => html`<a class="row morerow" href="#/${k}" data-close>${raw(i)}<div class="main"><b>${l}</b></div></a>`)}
            ${!member() ? html`<a class="row morerow" href="#/settings" data-close>${raw(ICON.gear)}<div class="main"><b>Settings</b></div></a>` : ''}
            <button type="button" class="row morerow" data-act="logout">${raw(ICON.out)}<div class="main"><b>Sign out</b></div></button></div>`, html`<button type="button" class="btn ghost" data-close>Close</button>`);
          return m;
        }
        case 'new-bill': return billForm();
        case 'edit-bill': return billForm(t.dataset.id);
        case 'pay-bill': return payBillForm(state.bills[t.dataset.id]);
        case 'new-project': return projectForm();
        case 'edit-project': return projectForm(t.dataset.id);
        case 'delete-project': {
          if (!confirm('Delete this project with its tasks, hours and updates?' + undoNote())) return;
          const r = await api('projects.delete', { id: Number(t.dataset.id) }); state.projects = null; toast('Project deleted', false, r.trash_id); location.hash = '#/projects'; return;
        }
        case 'edit-task': return taskForm(Number(t.dataset.id));
        case 'task-next': {
          const tk = state.tasks[t.dataset.id]; if (!tk) return;
          const next = { todo: 'doing', doing: 'done', done: 'todo' }[tk.status];
          await busy(t, () => api('tasks.save', { id: tk.id, status: next, note: tk.note, title: tk.title, worker_id: tk.worker_id, due_date: tk.due_date }));
          toast(next === 'done' ? 'Done' : next === 'doing' ? 'Started' : 'Opened again'); return refresh();
        }
        case 'log-time': return timeForm(t.dataset.project);
        case 'log-time-for': {
          const d = state.workers[t.dataset.worker];
          const open = (d ? d.projects : []).filter((p) => p.status !== 'done');
          if (!open.length) return toast('Put them on a project first (Projects → Edit → Team)', true);
          state.proj = null;
          return timeFormFor(Number(t.dataset.worker), open);
        }
        case 'edit-time': return timeForm(null, t.dataset.id);
        case 'new-worker': return workerForm();
        case 'edit-worker': return workerForm(t.dataset.id);
        case 'delete-worker': {
          if (!confirm('Delete this person?' + undoNote())) return;
          const r = await api('workers.delete', { id: Number(t.dataset.id) }); state.team = null; toast('Deleted', false, r.trash_id); location.hash = '#/team'; return;
        }
        case 'pay-worker': return payWorkerForm(t.dataset.worker, t.dataset.project);
        case 'trash-restore': { const r = await busy(t, () => api('trash.restore', { id: Number(t.dataset.id) })); state.clients = null; state.projects = null; toast('Brought back: ' + r.label); return refresh(); }
        case 'trash-purge': { if (!confirm('Delete this for good? It can\'t be brought back.')) return; await api('trash.purge', { id: Number(t.dataset.id) }); toast('Deleted for good'); return refresh(); }
        case 'trash-empty': { if (!confirm('Empty the Trash? Nothing in it can be brought back after this.')) return; await api('trash.purge', { all: true }); toast('Trash emptied'); return refresh(); }
        case 'log-more': {
          const last = (state.logList || []).slice(-1)[0]; if (!last) return;
          const r = await busy(t, () => api('audit.list', { before: last.id, worker_id: logFilter.who, q: logFilter.q }));
          state.logList = state.logList.concat(r.items);
          $('#loglist').insertAdjacentHTML('beforeend', html`${r.items.map(logRow)}`.s);
          if (!r.more) t.remove();
          return;
        }
        case 'inv-direct': {
          if (t.dataset.a === 'send' && !confirm('Email this invoice to the client again, with the PDF?')) return;
          await busy(t, () => api('invoices.action', { id: t.dataset.id, action: t.dataset.a }));
          toast('Reminder sent'); return refresh();
        }
        case 'pay-bill-id': { const r = await api('bills.get', { id: Number(t.dataset.id) }); return payBillForm(r.bill); }
        case 'link-invoices': return linkInvoicesForm(t.dataset.id, t.dataset.client);
        case 'period-go': {
          const id = t.dataset.id, st = id === 'bk' ? books : rep;
          st.from = $(`[data-from="${id}"]`).value; st.to = $(`[data-to="${id}"]`).value;
          if (!st.from || !st.to) return toast('Pick both dates', true);
          return refresh();
        }
      }
    } catch (err) { toast(err.message, true); }
  });
  // drop files anywhere on Books or Bills
  document.addEventListener('dragover', (e) => {
    if (!$('#klist') && !$('#blist')) return;
    if (!(can('books', 'edit') || can('bills', 'edit')) || !(on('f_uploads') || on('f_import'))) return;
    e.preventDefault(); document.body.classList.add('dragging');
  });
  document.addEventListener('dragleave', (e) => { if (!e.relatedTarget) document.body.classList.remove('dragging'); });
  document.addEventListener('drop', (e) => {
    if (!$('#klist') && !$('#blist')) return;
    e.preventDefault(); document.body.classList.remove('dragging');
    if (!(on('f_uploads') || on('f_import'))) return;
    const files = Array.from((e.dataTransfer && e.dataTransfer.files) || []);
    if (files.length) uploadFiles(files, $('#blist') ? 'bill' : on('f_uploads') ? '' : 'import');
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
  document.addEventListener('change', (e) => {
    const el = e.target.closest && e.target.closest('#setwrap [data-set]');
    if (el) saveOne(el);
    if (e.target.id === 'logwho') { logFilter.who = e.target.value; refresh(); }
  });
  document.addEventListener('input', (e) => {
    if (e.target.id === 'setq') return drawSettings();
    if (e.target.id === 'logq') { clearTimeout(state.logT); state.logT = setTimeout(() => { logFilter.q = e.target.value; refresh(); }, 450); return; }
    if (e.target.id === 'cq') { clientFilter.q = e.target.value; drawClients(); }
  });
  document.addEventListener('submit', async (e) => {
    if (e.target.id === 'taskform' || e.target.id === 'pnoteform') {
      e.preventDefault();
      const isTask = e.target.id === 'taskform';
      const inp = $(isTask ? '#tasknew' : '#pnote'); if (!inp.value.trim()) return;
      try {
        if (isTask) await api('tasks.save', { project_id: Number(e.target.dataset.project), title: inp.value, worker_id: member() ? state.me.id : null });
        else await api('notes.add', { project_id: Number(e.target.dataset.project), body: inp.value });
        toast(isTask ? 'Task added' : 'Posted'); refresh();
      } catch (err) { toast(err.message, true); }
      return;
    }
    if (e.target.id !== 'noteform') return;
    e.preventDefault();
    const inp = $('#note'); if (!inp.value.trim()) return;
    try { await api('activity.add', { client_id: Number(e.target.dataset.client), body: inp.value }); toast('Note added'); refresh(); }
    catch (err) { toast(err.message, true); }
  });

  // after each render, fill in lists that filter on the client side
  const view = () => $('#view');
  const afterRender = () => { drawClients(); drawInvoices(); drawBooks(); drawBills(); drawProjects(); drawSettings(); paintBars(view()); };
  document.addEventListener('rendered', afterRender, true);

  // one set of books here (the tax code is shared with the Bizmo admin, which has parts)
  const PART = { devices: 'GO GETTER' };
  const partTag = () => '';
  // ---------------------------------------------------------------- taxes: ready for the accountant (f_tax)
  const OWNER_LABEL = { contribution: 'Owner put money in', draw: 'Owner took money out', loan_in: 'Loan received', loan_repay: 'Loan paid back' };
  const VTYPES = [['unknown', 'Not known yet'], ['individual', 'Individual / sole proprietor'], ['llc', 'LLC'], ['partnership', 'Partnership'], ['corporation', 'Corporation'], ['foreign', 'Outside the US (W-8, no 1099)']];
  const taxSt = { year: new Date().getMonth() < 4 ? new Date().getFullYear() - 1 : new Date().getFullYear(), part: 'all', open: '' };
  const yearsList = () => { const y = new Date().getFullYear(); return [y, y - 1, y - 2, y - 3, y - 4]; };
  function checkRow(c, withShow) {
    return html`<div class="row"><span class="ic ${c.ok ? 'g' : c.key === 'inventory' || c.key === 'w9' ? 'r' : 'a'}">${raw(c.ok ? ICON.ok : ICON.alert)}</span>
      <div class="main"><b>${c.title}</b><span>${c.ok ? 'Done' : `${c.count} to fix${c.cents ? ' · ' + money(c.cents) : ''}${c.hint ? ' · ' + c.hint : ''}`}</span></div>
      <div class="amt"></div><div class="acts">${!c.ok && withShow ? html`<button type="button" class="btn ghost sm" data-tx="fix" data-k="${c.key}">${['receipts', 'other', 'method', 'review'].includes(c.key) ? (taxSt.open === c.key ? 'Hide' : 'Show') : 'Fix'}</button>` : ''}</div></div>`;
  }
  VIEWS.tax = async () => {
    const d = await api('tax.summary', { year: taxSt.year, part: taxSt.part });
    state.tax = d;
    const miss = d.missing[taxSt.open] || [];
    miss.forEach((e) => { state.entries[e.id] = e; });
    const ownerNet = d.owner.totals.contribution + d.owner.totals.loan_in - d.owner.totals.draw - d.owner.totals.loan_repay;
    const editTax = can('books', 'edit');
    return html`
      <div class="head"><div><h1>Taxes</h1><div class="sub">Get ${d.year} ready for the accountant. This is bookkeeping help, not tax advice.</div></div>
        <div class="acts downloads">
          <select data-tx-year style="max-width:120px">${yearsList().map((y) => html`<option ${raw(y === d.year ? 'selected' : '')}>${y}</option>`)}</select>
          ${on('f_pack') && on('f_reports') ? html`<button class="btn ghost" data-act="accountant-pack">${raw(ICON.books)}Accountant pack</button>` : ''}
          ${on('f_qb') ? html`<button class="btn ghost" data-tx="qb">${raw(ICON.down)}QuickBooks</button>` : ''}</div></div>
      ${false && d.parts.length > 1 ? html`<div class="chips">${[['all', 'Both parts'], ...d.parts.map((p) => [p, PART[p]])].map(([v, l]) => html`<button type="button" data-tx="part" data-v="${v}" class="${taxSt.part === v ? 'on' : ''}">${l}</button>`)}</div>` : ''}
      <div class="panel pad readybox">
        <div class="readyhead"><b>Ready for the accountant: ${d.ready.pct}%</b><span class="muted">${d.ready.done} of ${d.ready.total} checks done</span></div>
        <div class="progress"><i data-w="${d.ready.pct}"></i></div></div>
      <div class="panel rows todo" style="margin-top:12px">${d.checks.map((c) => checkRow(c, editTax))}</div>
      ${miss.length ? html`<h2 class="sec">${d.checks.find((c) => c.key === taxSt.open).title} <span class="muted">click one to fix it${miss.length >= 300 ? ' · first 300' : ''}</span></h2>
        <div class="panel rows">${miss.map(entryRow)}</div>` : ''}
      <div class="kpis" style="margin-top:20px">
        ${kpi('Income', money(d.income), 'recorded in Books', 'pos')}
        ${kpi('Cost of goods sold', money(d.cogs.total), d.cogs.entered || !d.cogs.purchases ? 'inventory counted' : 'inventory not counted yet', d.cogs.entered || !d.cogs.purchases ? '' : 'neg')}
        ${kpi('Other expenses', money(d.expenses.deductible), d.expenses.byLine.length + ' tax lines')}
        ${kpi('Owner money (not in profit)', money(ownerNet), 'in minus out, with loans')}
      </div>
      <div class="cols" style="margin-top:4px">
        <div><h2 class="sec">Expenses by tax line ${editTax ? html`<button class="linkbtn" data-tx="map">How each category counts</button>` : ''}</h2>
          <div class="panel tablewrap"><table class="t"><thead><tr><th>Tax line</th><th>From</th><th class="n">Amount</th></tr></thead><tbody>
            ${d.expenses.byLine.length ? d.expenses.byLine.map((l) => html`<tr><td><b>${l.line}</b></td><td class="muted wrap">${l.categories.map((x) => x.category).join(', ')}</td><td class="n">${money(l.cents)}</td></tr>`) : html`<tr><td colspan="3" class="muted">No expenses in ${d.year}.</td></tr>`}
          </tbody></table></div></div>
        <div><h2 class="sec">Inventory and cost of goods sold ${editTax ? html`<button class="linkbtn" data-tx="inv">Enter the count</button>` : ''}</h2>
          <div class="panel pl">
            <div class="l sub"><span>Inventory on January 1</span><span class="num">${money(d.cogs.begin)}</span></div>
            <div class="l sub"><span>Bought this year (cost of goods lines)</span><span class="num">${money(d.cogs.purchases)}</span></div>
            <div class="l sub"><span>Inventory on December 31</span><span class="num">${d.cogs.entered ? '−' + money(d.cogs.end) : 'not counted'}</span></div>
            <div class="l t"><span>Cost of goods sold</span><span class="num">${money(d.cogs.total)}</span></div></div>
          <p class="hint">Count what is still in stock on December 31 (hardware for clients) at what you paid for it.</p></div>
      </div>
      <h2 class="sec">Not in profit <span class="muted">equipment, stock, owner money, loans, transfers</span></h2>
      <div class="panel tablewrap"><table class="t"><thead><tr><th>Counts as</th><th>From</th><th class="n">Money out</th><th class="n">Money in</th></tr></thead><tbody>
        ${d.balance.length ? d.balance.map((l) => html`<tr><td><b>${l.line}</b></td><td class="muted wrap">${l.categories.map((x) => x.category).join(', ')}</td><td class="n">${l.out ? money(l.out) : ''}</td><td class="n">${l.in ? money(l.in) : ''}</td></tr>`)
          : html`<tr><td colspan="4" class="muted">Nothing. Everything in Books counts in profit. To change that, set it on an entry ("Counts as"), on several at once (Select in Books), or for a whole category.</td></tr>`}
      </tbody></table></div>
      <p class="hint">Enter everything simply as money in or out. Here you, or your accountant with a sign-in of their own, decide what each one is: "Accountant to decide" keeps it apart until then.</p>
      <h2 class="sec">Owner money and loans ${editTax ? html`<button class="btn ghost sm" data-tx="owner">${raw(ICON.plus)}Add</button>` : ''}</h2>
      <div class="panel rows">${d.owner.list.length ? d.owner.list.map((o) => html`<div class="row ${editTax ? 'click' : ''}" ${raw(editTax ? `data-tx="owner" data-id="${o.id}" tabindex="0"` : '')}>
          <div class="main"><b>${OWNER_LABEL[o.kind]}${partTag(o.part)}</b><span>${[fmtDate(o.date), o.person, o.method, o.note].filter(Boolean).join(' · ')}</span></div>
          ${pill(o.kind === 'contribution' || o.kind === 'loan_in' ? 'paid' : 'open', o.kind === 'contribution' || o.kind === 'loan_in' ? 'in' : 'out')}
          <div class="amt">${money(o.amount_cents)}</div></div>`) : empty('Money the owner puts in or takes out, and loans, go here, not in Books. They are not income or expenses.')}</div>
      <h2 class="sec">People and companies paid (1099 check) <span class="muted">${money(d.limit_1099).replace(".00", "")} or more, not by card</span></h2>
      <div class="panel tablewrap"><table class="t"><thead><tr><th>Paid to</th><th>Type</th><th class="n">Paid</th><th class="n">By card</th><th>1099</th><th>W-9</th></tr></thead><tbody>
        ${d.vendors.length ? d.vendors.map((v) => html`<tr class="${editTax ? 'click' : ''}" ${raw(editTax ? `data-tx="vendor" data-name="${esc(v.name)}"` : '')}><td><b>${v.name}</b>${v.worker ? html`<span class="tag">team</span>` : ''}</td>
          <td>${(VTYPES.find((x) => x[0] === v.type) || VTYPES[0])[1]}</td><td class="n">${money(v.paid)}</td><td class="n muted">${v.card ? money(v.card) : ''}</td>
          <td>${v.needs_1099 ? pill('open', 'needed') : html`<span class="muted">no</span>`}</td><td>${v.w9 ? pill('paid', 'on file') : v.needs_1099 ? pill('overdue', 'missing') : ''}</td></tr>`) : html`<tr><td colspan="6" class="muted">Nobody was paid in ${d.year}.</td></tr>`}
      </tbody></table></div>
      ${d.bills_unpaid ? html`<p class="hint">Supplier bills still unpaid on Dec 31: <b>${money(d.bills_unpaid)}</b>. They count as expenses when they are paid.</p>` : ''}
      <p class="hint">Owner money is kept out of profit. Payments by card are left out of the 1099 check because the card company reports them. Check everything with your accountant.</p>`;
  };

  function ownerForm(id) {
    const o = id ? state.tax.owner.list.find((x) => String(x.id) === String(id)) : { kind: 'contribution', date: today(), method: 'Bank transfer', part: taxSt.part === 'all' ? 'devices' : taxSt.part };
    const m = modal(id ? 'Edit owner money' : 'Owner money or a loan', html`<div class="fields">
      <div><label for="o-kind">What is it</label><select id="o-kind">${Object.entries(OWNER_LABEL).map(([k, l]) => html`<option value="${k}" ${raw(o.kind === k ? 'selected' : '')}>${l}</option>`)}</select></div>
      <div class="grid2"><div><label for="o-amt">Amount</label><input id="o-amt" inputmode="decimal" placeholder="0.00" value="${o.amount_cents ? plain(o.amount_cents) : ''}"></div>
        <div><label for="o-date">Date</label><input id="o-date" type="date" value="${o.date}"></div></div>
      <div class="grid2"><div><label for="o-person">Who (owner or lender)</label><input id="o-person" maxlength="120" value="${o.person || ''}"></div>
        <div><label for="o-method">How</label><select id="o-method">${METHODS.map((x) => html`<option ${raw(o.method === x ? 'selected' : '')}>${x}</option>`)}</select></div></div>
      ${false ? html`<div><label for="o-part">Part</label><select id="o-part">${Object.entries(PART).map(([k, l]) => html`<option value="${k}" ${raw(o.part === k ? 'selected' : '')}>${l}</option>`)}</select></div>` : ''}
      <div><label for="o-note">Note</label><input id="o-note" maxlength="1000" value="${o.note || ''}"></div>
      <p class="hint">Not income and not an expense, so it stays out of profit. The accountant needs it for the balance sheet.</p>
    </div>`, html`${id ? html`<button type="button" class="btn danger" id="o-del" style="margin-right:auto">Delete</button>` : ''}<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    if (id) $('#o-del', m.d).addEventListener('click', async () => {
      if (!sure('Delete this?')) return;
      try { const r = await api('tax.owner.delete', { id: Number(id) }); m.close(); toast('Deleted', false, r.trash_id); refresh(); } catch (err) { m.err(err.message); }
    });
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const c = parseMoney($('#o-amt', m.d).value);
      if (isNaN(c) || c <= 0) return m.err('Enter an amount, like 5000.00');
      await busy(m.form.querySelector('[type=submit]'), async () => {
        try {
          await api('tax.owner.save', { id: id ? Number(id) : undefined, kind: $('#o-kind', m.d).value, amount_cents: c, date: $('#o-date', m.d).value, person: $('#o-person', m.d).value,
            method: $('#o-method', m.d).value, note: $('#o-note', m.d).value, part: $('#o-part', m.d) ? $('#o-part', m.d).value : undefined });
          m.close(); toast('Saved'); refresh();
        } catch (err) { m.err(err.message); }
      });
    });
  }
  function vendorForm(name) {
    const v = state.tax.vendors.find((x) => x.name === name) || { name, type: 'unknown', w9: false, decided: false };
    const m = modal('1099 details', html`<div class="fields">
      <p class="soft"><b>${v.name}</b> · paid ${money(v.paid || 0)} in ${state.tax.year}${v.card ? ` (plus ${money(v.card)} by card)` : ''}</p>
      <div><label for="v-type">Type (from their W-9)</label><select id="v-type">${VTYPES.map(([k, l]) => html`<option value="${k}" ${raw(v.type === k ? 'selected' : '')}>${l}</option>`)}</select></div>
      <label class="ck"><input type="checkbox" id="v-w9" ${raw(v.w9 ? 'checked' : '')}><span>W-9 on file</span></label>
      <div><label for="v-1099">Needs a 1099-NEC</label><select id="v-1099"><option value="">Decide by itself (${money(state.tax.limit_1099).replace(".00", "")} or more, not a corporation, not abroad)</option>
        <option value="yes" ${raw(v.decided && v.needs_1099 ? 'selected' : '')}>Yes</option><option value="no" ${raw(v.decided && !v.needs_1099 ? 'selected' : '')}>No</option></select></div>
      <div><label for="v-note">Note</label><input id="v-note" maxlength="500" value="${v.note || ''}" placeholder="e.g. W-9 in the email of Jan 5"></div>
      <p class="hint">Keep the W-9 itself as a file (attach it to one of their payments). The tax ID is not stored here.</p>
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const n = $('#v-1099', m.d).value;
      try { await api('tax.vendor.save', { name: v.name, type: $('#v-type', m.d).value, w9: $('#v-w9', m.d).checked, needs_1099: n === 'yes' ? true : n === 'no' ? false : null, note: $('#v-note', m.d).value }); m.close(); toast('Saved'); refresh(); }
      catch (err) { m.err(err.message); }
    });
  }
  function invForm() {
    const d = state.tax;
    const parts = false ? (taxSt.part === 'all' ? d.parts : [taxSt.part]) : ['devices'];
    const val = (p, k) => { const r = d.cogs.years.find((x) => x.part === p); return r && r[k] !== null && r[k] !== undefined ? plain(r[k]) : ''; };
    const m = modal(`Inventory count ${d.year}`, html`<div class="fields">
      <p class="soft">What was in stock, at what you paid for it. December 31 also becomes next year's January 1.</p>
      ${parts.map((p) => html`${parts.length > 1 ? html`<b>${PART[p]}</b>` : ''}<div class="grid2"><div><label>On January 1, ${d.year}</label><input data-inv-b="${p}" inputmode="decimal" placeholder="0.00" value="${val(p, 'inv_begin_cents')}"></div>
        <div><label>On December 31, ${d.year}</label><input data-inv-e="${p}" inputmode="decimal" placeholder="0.00" value="${val(p, 'inv_end_cents')}"></div></div>`)}
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const num = (s) => { s = String(s || '').trim(); if (!s) return null; const c = parseMoney(s); if (isNaN(c) || c < 0) throw new Error('Enter amounts like 12500.00 (or leave empty)'); return c; };
      try {
        for (const p of parts) await api('tax.year.save', { year: d.year, part: p, inv_begin_cents: num($(`[data-inv-b="${p}"]`, m.d).value), inv_end_cents: num($(`[data-inv-e="${p}"]`, m.d).value) });
        m.close(); toast('Saved'); refresh();
      } catch (err) { m.err(err.message); }
    });
  }
  function mapForm() {
    const d = state.tax;
    const row = (key, label, kind) => html`<div class="grid2"><div style="align-self:center"><b>${label}</b></div><div><select data-map-cat="${key}">${countsOptions(kind, d.map[key] || (kind === 'income' ? 'Sales and income' : 'Other expenses'))}</select></div></div>`;
    const outCats = Array.from(new Set([...CATS.expense, ...Object.keys(d.map).filter((k) => !k.startsWith('in:'))]));
    const inCats = Array.from(new Set([...CATS.income, ...Object.keys(d.map).filter((k) => k.startsWith('in:')).map((k) => k.slice(3))]));
    const m = modal('How each category counts', html`<div class="fields">
      <p class="soft">Each entry counts the way its category says, unless "Counts as" is set on the entry itself.</p>
      <b>Money out</b>${outCats.map((c) => row(c, c, 'expense'))}
      <b style="margin-top:8px">Money in</b>${inCats.map((c) => row('in:' + c, c, 'income'))}
      <p class="hint">Not sure? Pick "Accountant to decide": those entries are listed apart until the accountant sets them. "Not deductible" stays in the books but out of the expense total.</p>
    </div>`, html`<button type="button" class="btn ghost" data-close>Cancel</button><button class="btn" type="submit">Save</button>`);
    m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      const map = {}; $$('[data-map-cat]', m.d).forEach((x) => { map[x.dataset.mapCat] = x.value; });
      try { await api('tax.map.save', { map }); m.close(); toast('Saved'); refresh(); } catch (err) { m.err(err.message); }
    });
  }
  function qbForm() {
    const m = modal('QuickBooks files for the accountant', html`<div class="fields">
      <div><label for="qb-y">Year</label><select id="qb-y">${yearsList().map((v) => html`<option ${raw(v === taxSt.year ? 'selected' : '')}>${v}</option>`)}</select></div>
      <div class="panel rows flat">
        <div class="row"><div class="main"><b>QuickBooks Desktop (.iif)</b><span>In QuickBooks: File → Utilities → Import → IIF Files. Accounts and classes are made by themselves.</span></div><span></span><div class="acts"><button type="button" class="btn sm" data-qb="iif">${raw(ICON.down)}Download</button></div></div>
        <div class="row"><div class="main"><b>QuickBooks Online (.csv)</b><span>Settings → Import data → Journal entries. Make the accounts first (list below).</span></div><span></span><div class="acts"><button type="button" class="btn sm" data-qb="qbo">${raw(ICON.down)}Download</button></div></div>
        <div class="row"><div class="main"><b>Accounts list (.csv)</b><span>The accounts the files use, for QuickBooks Online: Settings → Import data → Accounts.</span></div><span></span><div class="acts"><button type="button" class="btn ghost sm" data-qb="qbo-accounts">${raw(ICON.down)}Download</button></div></div>
      </div>
      <p class="hint">Every Books entry, owner money and loans, and Stripe payments if used. Expenses go to the tax lines set on the Taxes page${false ? '; Devices and Cellular become QuickBooks classes' : ''}. Import into a test company first if you are not sure.</p>
    </div>`, html`<button type="button" class="btn ghost" data-close>Close</button>`);
    m.d.addEventListener('click', (e) => { const b = e.target.closest('[data-qb]'); if (!b) return; location.href = `/api/export?year=${encodeURIComponent($('#qb-y', m.d).value)}&format=${b.dataset.qb}`; toast('Making the file… it downloads in a moment'); });
  }

  // ---------------------------------------------------------------- linked sheets (Google Sheets, Excel online, any CSV link) and the live feed
  async function linksForm() {
    const d = await api('links.list');
    const edit = can('books', 'edit');
    const m = modal('Linked sheets', html`<div class="fields">
      <p class="soft">Keep your list in Google Sheets or Excel, and read the new rows into Books whenever you want. Rows already in Books are found and left out.</p>
      <div class="panel rows flat">${d.links.length ? d.links.map((l) => html`<div class="row"><div class="main"><b>${l.name}</b><span>${l.last_sync ? 'Last read ' + fmtDate(l.last_sync) : 'Not read yet'} · ${l.rows_in_books} rows in Books</span></div><span></span>
        <div class="acts">${edit ? html`<button type="button" class="btn sm" data-lk="sync" data-id="${l.id}">Get new rows</button><button type="button" class="btn ghost sm" data-lk="del" data-id="${l.id}">Remove</button>` : ''}</div></div>`) : empty('No linked sheets yet.')}</div>
      ${edit ? html`<b style="margin-top:6px">Link a sheet</b>
        <div><label for="lk-name">Name</label><input id="lk-name" maxlength="80" placeholder="e.g. Office expenses 2026"></div>
        <div><label for="lk-url">Link</label><input id="lk-url" maxlength="1000" placeholder="https://docs.google.com/spreadsheets/d/…"></div>
        <p class="hint">Google Sheets: Share → "Anyone with the link can view", copy the link (on the tab you want). Excel online, OneDrive, Dropbox or any CSV link work too. The sheet needs a Date column and an Amount (or Debit / Credit) column.</p>` : ''}
    </div>`, html`<button type="button" class="btn ghost" data-close>Close</button>${edit ? html`<button class="btn" type="submit">Add link</button>` : ''}`);
    m.d.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-lk]'); if (!b) return;
      if (b.dataset.lk === 'del') { if (!confirm('Remove this link? What was already read into Books stays.')) return; await api('links.delete', { id: Number(b.dataset.id) }); m.close(); return linksForm(); }
      let up;
      try { up = await busy(b, () => api('links.sync', { id: Number(b.dataset.id) })); } catch (err) { return m.err(err.message); }
      m.close(); await importFlow(up);
    });
    if (edit) m.form.addEventListener('submit', async (ev) => {
      ev.preventDefault(); m.err('');
      try {
        const r = await api('links.save', { name: $('#lk-name', m.d).value, url: $('#lk-url', m.d).value });
        m.close(); toast('Linked. Reading it now…');
        try { await importFlow(await api('links.sync', { id: r.id })); } catch (err) { toast(err.message, true); }
      } catch (err) { m.err(err.message); }
    });
  }
  function feedShow(token) {
    const base = location.origin + '/api/export?feed=' + token;
    const y = new Date().getFullYear();
    const m = modal('Live link for Google Sheets and Excel', html`<div class="fields">
      <p class="soft">Copy these now: the secret part is shown only once. Anyone with the link can see the numbers, so keep it to yourself and your accountant.</p>
      <div><label>Google Sheets: paste in cell A1 (Books ${y})</label><div class="copyrow"><input readonly value="${`=IMPORTDATA("${base}&what=books&year=${y}")`}"><button type="button" class="btn sm" data-copy>Copy</button></div></div>
      <div><label>Tax summary ${y}</label><div class="copyrow"><input readonly value="${`=IMPORTDATA("${base}&what=tax&year=${y}")`}"><button type="button" class="btn sm" data-copy>Copy</button></div></div>
      <div><label>Excel: Data → From Web, paste this</label><div class="copyrow"><input readonly value="${base}&what=books&year=${y}"><button type="button" class="btn sm" data-copy>Copy</button></div></div>
      <p class="hint">Change the year in the link for another year, or use year=all. Google Sheets refreshes it by itself about every hour; in Excel press Refresh.</p>
    </div>`, html`<button type="button" class="btn" data-close>Done</button>`);
    m.d.addEventListener('click', (e) => { const b = e.target.closest('[data-copy]'); if (b) { copy(b.previousElementSibling.value); toast('Copied'); } });
  }

  // ---------------------------------------------------------------- home page: choose the boxes
  const HOME_BOXES = [['h_kpis', 'Money this month'], ['h_tax', 'Ready for the accountant (Taxes)'], ['h_news', "What's new"], ['h_todo', 'To do'], ['h_quick', 'Quick buttons'],
    ['h_money', 'Waiting to be paid and latest payments'], ['h_bills', 'Bills to pay'], ['h_leads', 'New leads']];
  async function customizeHome() {
    if (!state.cfg) state.cfg = await api('settings.get');
    const s = state.cfg.settings;
    const m = modal('Customize the home page', html`<div class="fields">
      <p class="soft">Pick the boxes you want to see. Nothing is deleted; you can add a box back any time.</p>
      <div class="panel">${HOME_BOXES.filter(([k]) => k !== 'h_tax' || on('f_tax')).map(([k, l]) => html`<label class="setrow"><div><b>${l}</b></div><span class="switch"><input type="checkbox" data-hb="${k}" ${raw(s[k] !== false ? 'checked' : '')}><i></i></span></label>`)}</div>
    </div>`, html`<button type="button" class="btn" data-close>Done</button>`);
    m.d.addEventListener('change', async (e) => {
      const el = e.target.closest('[data-hb]'); if (!el) return;
      try { state.cfg = await api('settings.save', { settings: { [el.dataset.hb]: el.checked } }); refresh(); } catch (err) { toast(err.message, true); el.checked = !el.checked; }
    });
  }
  // a box on the home page can be taken off right there
  const hideBox = (k) => html`<button type="button" class="linkbtn hidebox" data-hide-box="${k}" title="Take this off the home page" aria-label="Take this off the home page">${raw(ICON.no)}</button>`;

  document.addEventListener('change', (e) => {
    if (e.target.matches && e.target.matches('[data-tx-year]')) { taxSt.year = Number(e.target.value); taxSt.open = ''; refresh(); }
  });
  document.addEventListener('click', async (e) => {
    const hb = e.target.closest && e.target.closest('[data-hide-box]');
    if (hb) {
      try { state.cfg = await api('settings.save', { settings: { [hb.dataset.hideBox]: false } }); toast('Taken off. Customize brings it back.'); refresh(); } catch (err) { toast(err.message, true); }
      return;
    }
    const t = e.target.closest && e.target.closest('[data-tx]');
    if (!t) return;
    e.preventDefault();
    try {
      switch (t.dataset.tx) {
        case 'part': taxSt.part = t.dataset.v; taxSt.open = ''; return refresh();
        case 'fix': {
          const k = t.dataset.k;
          if (['receipts', 'other', 'method', 'review'].includes(k)) { taxSt.open = taxSt.open === k ? '' : k; return refresh(); }
          if (k === 'inventory') return invForm();
          if (k === 'w9' || k === 'unknown') { const v = state.tax.vendors.find((x) => x.needs_1099 && (k === 'w9' ? !x.w9 : x.type === 'unknown')); if (v) return vendorForm(v.name); }
          return;
        }
        case 'owner': return ownerForm(t.dataset.id);
        case 'vendor': return vendorForm(t.dataset.name);
        case 'inv': return invForm();
        case 'map': return mapForm();
        case 'qb': return qbForm();
        case 'links': return linksForm();
        case 'customize': return customizeHome();
        case 'tax-home': location.hash = '#/tax'; return;
        case 'feed-key': {
          if (state.cfg && state.cfg.feed && state.cfg.feed.on && !confirm('Make a new link? The old link stops working right away.')) return;
          const r = await busy(t, () => api('feed.key')); feedShow(r.token); state.cfg = await api('settings.get'); return;
        }
        case 'feed-off': { if (!confirm('Turn off the live link? Sheets that use it stop updating.')) return; await api('feed.off'); toast('Live link turned off'); return refresh(); }
      }
    } catch (err) { toast(err.message, true); }
  });

  // client page lives under #/clients/ID
  VIEWS.clients_ = VIEWS.clients;
  VIEWS.clients = async (arg) => arg ? VIEWS.client(arg) : VIEWS.clients_();

  // ---------------------------------------------------------------- start
  async function boot() {
    try { state.status = await api('status'); }
    catch (e) { $('#root').innerHTML = html`<div class="gate"><div class="box">${raw(LOGO)}<h1>Can't reach the server</h1><p>${e.message}</p><button class="btn" data-act="reload-page">Try again</button></div></div>`.s; return; }
    if (!state.status.authed) return gate();
    state.me = state.status.me || { role: 'owner' };
    state.clients = null; state.projects = null; state.team = null;
    if (!member()) { try { state.cfg = await api('settings.get'); } catch (e) { state.cfg = null; } } else state.cfg = null;
    shell();
    clearInterval(state.poll);
    state.poll = setInterval(async () => {
      if (document.hidden || member() || !on('f_notifications')) return;
      try { const r = await api('notifications.list'); if (r.unread !== state.unread) setBadge(r.unread); } catch (e) {}
    }, 60000);
    window.removeEventListener('hashchange', route);
    window.addEventListener('hashchange', route);
    route();
  }
  document.addEventListener('click', (e) => { if (e.target.closest('[data-act="reload-page"]')) location.reload(); });
  boot();
})();
