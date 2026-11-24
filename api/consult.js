// Vercel serverless function: POST /api/consult
// Emails each Free Consultation request straight to the Digimetric Gmail inbox through
// Gmail's own SMTP server (smtp.gmail.com) — no other service in between.
//
// Setup (once, in Vercel → Project → Settings → Environment Variables):
//   GMAIL_APP_PASSWORD = the 16-letter App Password of digimetric1710@gmail.com
//   (optional) GMAIL_USER = sending Gmail address, CONSULT_TO = inbox to receive requests
const tls = require('node:tls');

const USER = process.env.GMAIL_USER || 'digimetric1710@gmail.com';
const TO = process.env.CONSULT_TO || USER;
const HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const PORT = Number(process.env.SMTP_PORT || 465);
const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;
const FIELDS = ['Name', 'Business / page', 'Social media', 'Business type', 'Phone', 'Email', 'Preferred contact',
  'Services', 'Package', 'Best time', 'Goals'];

// small per-instance limit against repeated submissions: 6 per 10 minutes per IP
const hits = new Map();
const limited = ip => {
  const now = Date.now(), list = (hits.get(ip) || []).filter(t => now - t < 600000);
  list.push(now); hits.set(ip, list);
  return list.length > 6;
};

const clean = (v, max = 2000) => String(v ?? '').replace(/\r/g, '').trim().slice(0, max);
const oneLine = (v, max = 200) => clean(v, max).replace(/\n+/g, ' ');
const b64 = s => Buffer.from(s, 'utf8').toString('base64');
const wrap = s => s.replace(/.{1,76}/g, '$&\r\n');
const encWord = s => `=?UTF-8?B?${b64(s)}?=`;

function smtpSend({ pass, replyTo, subject, text }) {
  return new Promise((resolve, reject) => {
    const sock = tls.connect(PORT, HOST, { servername: HOST });
    sock.setEncoding('utf8');
    sock.setTimeout(15000, () => { sock.destroy(); reject(new Error('SMTP timeout')); });
    sock.on('error', reject);

    const now = new Date();
    const msg = [
      `From: ${encWord('Digimetric Website')} <${USER}>`,
      `To: <${TO}>`,
      replyTo ? `Reply-To: <${replyTo}>` : null,
      `Subject: ${encWord(subject)}`,
      `Date: ${now.toUTCString().replace('GMT', '+0000')}`,
      `Message-ID: <${now.getTime()}.${Math.random().toString(36).slice(2)}@digimetric.digital>`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      wrap(b64(text)),
    ].filter(l => l !== null).join('\r\n');

    // each step: [line to send (null = just wait), reply code expected]
    const steps = [
      [null, 220],
      ['EHLO digimetric.digital', 250],
      ['AUTH LOGIN', 334],
      [b64(USER), 334],
      [b64(pass), 235],
      [`MAIL FROM:<${USER}>`, 250],
      [`RCPT TO:<${TO}>`, 250],
      ['DATA', 354],
      [msg + '\r\n.', 250],
      ['QUIT', 221],
    ];
    let i = 0, buf = '';
    const next = () => {
      if (i >= steps.length) { sock.end(); return resolve(); }
      const [line] = steps[i];
      if (line !== null) sock.write(line + '\r\n');
    };
    sock.on('data', chunk => {
      buf += chunk;
      // a full reply ends with a line like "250 ..." (code + space)
      const lines = buf.split('\r\n'); const last = lines[lines.length - 2];
      if (!last || !/^\d{3} /.test(last)) return;
      buf = '';
      const code = Number(last.slice(0, 3)), want = steps[i][1];
      if (code !== want) {
        sock.destroy();
        const hint = i === 4 ? ' (check GMAIL_APP_PASSWORD)' : '';
        return reject(new Error(`SMTP step ${i} got ${code}${hint}`));
      }
      i++; next();
    });
  });
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return res.status(405).json({ success: 'false', message: 'POST only' }); }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  body = body && typeof body === 'object' ? body : {};

  if (body._honey) return res.status(200).json({ success: 'true' }); // bots: pretend it worked

  const name = oneLine(body.Name, 120), phone = oneLine(body.Phone, 60);
  if (!name || phone.replace(/\D/g, '').length < 6) return res.status(400).json({ success: 'false', message: 'Name and phone are required' });

  const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || 'unknown';
  if (limited(ip)) return res.status(429).json({ success: 'false', message: 'Too many requests, please try again later' });

  const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');
  if (!pass) return res.status(500).json({ success: 'false', message: 'Email sending is not set up yet' });

  const email = oneLine(body.Email || body._replyto, 200);
  const replyTo = EMAIL_RE.test(email) ? email : '';
  const subject = oneLine(body._subject || `Free consultation request — ${name}`, 150);

  const fieldLines = FIELDS.map(k => [k, clean(body[k], k === 'Goals' ? 3000 : 400)])
    .filter(([, v]) => v && v !== '-').map(([k, v]) => `${k}: ${v}`);
  const when = new Date().toLocaleString('en-GB', { timeZone: 'Asia/Bangkok', dateStyle: 'medium', timeStyle: 'short' });
  const text = [
    'New free consultation request — Digimetric website', '',
    ...fieldLines, '',
    `Sent from ${clean(req.headers.origin || 'digimetric.digital', 100)} on ${when} (Bangkok time).`,
    replyTo ? 'Reply to this email to answer the customer directly.' : 'The customer did not leave an email — please contact them by phone or chat.',
  ].join('\n');

  try {
    await smtpSend({ pass, replyTo, subject, text });
    return res.status(200).json({ success: 'true', message: 'Sent' });
  } catch (err) {
    console.error('consult mail failed:', err.message);
    return res.status(502).json({ success: 'false', message: 'Could not send the email right now' });
  }
};
