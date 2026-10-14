// Contact form endpoint: POST /api/contact
// Sends the visitor's message to the office inbox through Resend (https://resend.com).
//
// Vercel environment variables:
//   RESEND_API_KEY  (required) API key from resend.com
//   CONTACT_TO      (optional) inbox that receives messages, default office@gogetterinc.com
//   CONTACT_FROM    (optional) sender, default "GO GETTER NY Website <website@gogetterinc.com>"
//                   (the domain must be verified in Resend)

const ALLOWED_ORIGINS = [
  /^https:\/\/(www\.)?gogetterinc\.com$/,
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/,
];

const LIMITS = { name: 200, email: 320, phone: 50, message: 5000 };

function clean(value, max) {
  return String(value == null ? '' : value).trim().slice(0, max);
}

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'Use POST.' });
  }

  const origin = req.headers.origin;
  if (origin && !ALLOWED_ORIGINS.some((re) => re.test(origin))) {
    return res.status(403).json({ ok: false, error: 'Origin not allowed.' });
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { body = {}; }
  }
  body = body || {};

  // Honeypot: bots fill hidden fields. Pretend success and drop it.
  if (body._honey) return res.status(200).json({ ok: true });

  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email);
  const phone = clean(body.phone, LIMITS.phone);
  const message = clean(body.message, LIMITS.message);

  if (!name || !email || !message) {
    return res.status(400).json({ ok: false, error: 'Name, email and project are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ ok: false, error: 'Email address is not valid.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ ok: false, error: 'Email sending is not configured.' });
  }

  const to = process.env.CONTACT_TO || 'office@gogetterinc.com';
  const from = process.env.CONTACT_FROM || 'GO GETTER NY Website <website@gogetterinc.com>';

  const rows = [['Name', name], ['Email', email], ['Phone', phone || '(not given)'], ['Project', message]];
  const html =
    '<h2 style="font-family:Arial,sans-serif;margin:0 0 12px">New project request from gogetterinc.com</h2>' +
    '<table cellpadding="8" style="font-family:Arial,sans-serif;font-size:14px;border-collapse:collapse">' +
    rows.map(([k, v]) =>
      '<tr><td style="border:1px solid #ddd;background:#f6f7f9;font-weight:bold;vertical-align:top">' + k +
      '</td><td style="border:1px solid #ddd;white-space:pre-wrap">' + escapeHtml(v) + '</td></tr>'
    ).join('') +
    '</table><p style="font-family:Arial,sans-serif;font-size:13px;color:#666">Reply to this email to answer ' + escapeHtml(name) + ' directly.</p>';
  const text = rows.map(([k, v]) => k + ': ' + v).join('\n\n');

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: 'Bearer ' + apiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: 'New project from ' + name + ' (gogetterinc.com)',
        html,
        text,
      }),
    });
    if (!r.ok) {
      const detail = await r.text().catch(() => '');
      console.error('Resend error', r.status, detail);
      return res.status(502).json({ ok: false, error: 'Email service error.' });
    }
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend request failed', err);
    return res.status(502).json({ ok: false, error: 'Email service unreachable.' });
  }
};
