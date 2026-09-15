/*
 * Demo request endpoint for ejr1216.github.io/portfolio.
 * A visitor submits name + email (+ Turnstile token); the worker verifies the
 * token, rate-limits by IP and address, then emails the three demos from
 * er@mavericklabs.dev through iCloud SMTP (STARTTLS on smtp.mail.me.com:587)
 * with the two demo PDFs attached, and BCCs the owner so every request is a lead.
 *
 * Bindings (wrangler.toml): KV LEADS. Vars: FROM_ADDRESS, FROM_NAME, BCC_ADDRESS,
 * ALLOWED_ORIGIN, SITE_BASE. Secrets: SMTP_USER, SMTP_PASS, TURNSTILE_SECRET.
 */
import { connect } from 'cloudflare:sockets';

const DAILY_GLOBAL_CAP = 100;   // total sends per UTC day
const DAILY_IP_CAP = 3;         // per visitor IP
const DAILY_EMAIL_CAP = 2;      // per recipient address

const DEMOS = [
  { title: 'Daily CX Huddle', path: 'demos/cx-huddle.html', pdf: 'demos/cx-huddle.pdf',
    blurb: 'The morning email every team leader opens first: passing rates, a combined CX power rank, the day\'s win, three priorities, rescore opportunities, and a store-by-store scorecard.' },
  { title: 'Daily Social Review Summary', path: 'demos/social-review.html', pdf: 'demos/social-review.pdf',
    blurb: 'The corporate review digest: yesterday\'s reviews classified by operation, negatives flagged, escalations called out, with the report dashboard rendered straight from the workbook the pipeline built.' },
  { title: 'Rooftop IQ', url: 'https://ejr1216.github.io/rooftop-iq-demo/',
    blurb: 'A product concept for an automotive intelligence platform: review inbox, routing queue, OEM disposition, OEM CSI, KPI reports, and grade cards in one shell. Interactive, so it comes as a link.' },
];

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(env, request);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (url.pathname === '/health') return json({ ok: true }, 200, cors);
    if (url.pathname !== '/request' || request.method !== 'POST') return json({ error: 'Not found' }, 404, cors);

    if (!originAllowed(env, request)) return json({ error: 'Origin not allowed' }, 403, cors);

    let body;
    try { body = await request.json(); } catch { return json({ error: 'Send JSON' }, 400, cors); }
    const name = String(body.name || '').trim().slice(0, 80);
    const email = String(body.email || '').trim().toLowerCase().slice(0, 254);
    const token = String(body.turnstileToken || '');
    if (body.website) return json({ ok: true }, 200, cors);            // honeypot filled: pretend success
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json({ error: 'That email address does not look right.' }, 400, cors);
    if (!name) return json({ error: 'Please add your name.' }, 400, cors);

    const ip = request.headers.get('CF-Connecting-IP') || '0.0.0.0';
    if (env.TURNSTILE_SECRET) {
      const ok = await verifyTurnstile(env.TURNSTILE_SECRET, token, ip);
      if (!ok) return json({ error: 'The human check did not pass. Try again.' }, 400, cors);
    }

    const day = new Date().toISOString().slice(0, 10);
    const [ipHash, emailHash] = await Promise.all([sha256(ip), sha256(email)]);
    const keys = { global: `cap:${day}`, ip: `cap:${day}:ip:${ipHash}`, email: `cap:${day}:email:${emailHash}` };
    const [g, i, e] = await Promise.all([count(env.LEADS, keys.global), count(env.LEADS, keys.ip), count(env.LEADS, keys.email)]);
    if (g >= DAILY_GLOBAL_CAP) return json({ error: 'The demo mailbox is resting for today. Please try tomorrow.' }, 429, cors);
    if (i >= DAILY_IP_CAP || e >= DAILY_EMAIL_CAP) return json({ error: 'Those demos are already on their way to you.' }, 429, cors);

    // Attach the two PDFs straight from the live site so the worker never goes stale.
    const attachments = [];
    for (const d of DEMOS) {
      if (!d.pdf) continue;
      const r = await fetch(`${env.SITE_BASE}${d.pdf}`, { cf: { cacheTtl: 3600, cacheEverything: true } });
      if (r.ok) attachments.push({ filename: d.pdf.split('/').pop(), mimeType: 'application/pdf', data: new Uint8Array(await r.arrayBuffer()) });
    }

    const message = buildMessage(env, { name, email, attachments });
    try {
      await sendSmtp(env, { from: env.FROM_ADDRESS, to: [email, env.BCC_ADDRESS].filter(Boolean), raw: message });
    } catch (err) {
      console.error('SMTP failed', err && err.message);
      const msg = /535|AUTH/.test(String(err && err.message)) ? 'The mailbox refused the login. The owner has been notified.' : 'The mailbox did not answer. Please try again in a minute.';
      return json({ error: msg }, 502, cors);
    }

    ctx.waitUntil(Promise.all([
      bump(env.LEADS, keys.global), bump(env.LEADS, keys.ip), bump(env.LEADS, keys.email),
      env.LEADS.put(`lead:${Date.now()}:${emailHash.slice(0, 12)}`, JSON.stringify({ name, email, at: new Date().toISOString(), ua: request.headers.get('User-Agent') || '' }), { expirationTtl: 60 * 60 * 24 * 90 }),
    ]));
    return json({ ok: true }, 200, cors);
  },
};

/* ------------------------------------------------------------------ helpers */
function corsHeaders(env, request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
  const h = { 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Vary': 'Origin' };
  if (allowed.includes(origin)) h['Access-Control-Allow-Origin'] = origin;
  return h;
}
function originAllowed(env, request) {
  const origin = request.headers.get('Origin') || '';
  const allowed = (env.ALLOWED_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean);
  return allowed.length === 0 || allowed.includes(origin);
}
function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json', ...headers } });
}
async function sha256(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}
async function count(kv, key) { return Number(await kv.get(key)) || 0; }
async function bump(kv, key) { const n = (await count(kv, key)) + 1; await kv.put(key, String(n), { expirationTtl: 60 * 60 * 26 }); }
async function verifyTurnstile(secret, token, ip) {
  if (!token) return false;
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret, response: token, remoteip: ip }),
  });
  const d = await r.json().catch(() => ({}));
  return !!d.success;
}

/* ------------------------------------------------------------------ email */
function escapeHtml(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function buildMessage(env, { name, email, attachments }) {
  const first = escapeHtml(name.split(/\s+/)[0]);
  const site = env.SITE_BASE;
  const rows = DEMOS.map(d => {
    const href = d.url || `${site}${d.path}`;
    return `<tr><td style="padding:16px 0;border-top:1px solid #e6e2da;">
      <div style="font:600 16px/1.3 'Segoe UI',Helvetica,Arial,sans-serif;color:#15181d;">${d.title}</div>
      <div style="font:14px/1.55 'Segoe UI',Helvetica,Arial,sans-serif;color:#5c6470;margin:6px 0 10px;">${escapeHtml(d.blurb)}</div>
      <a href="${href}" style="font:600 13px/1 'Segoe UI',Helvetica,Arial,sans-serif;color:#0b0d10;background:#d4b483;text-decoration:none;padding:10px 14px;border-radius:3px;display:inline-block;">Open ${d.url ? 'the teaser' : 'the demo'}</a>
      ${d.pdf ? `<span style="font:12px 'Segoe UI',Helvetica,Arial,sans-serif;color:#8a8f98;margin-left:10px;">PDF attached</span>` : ''}
    </td></tr>`;
  }).join('');
  const html = `<!DOCTYPE html><html><body style="margin:0;background:#f4f2ed;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ed;padding:28px 12px;"><tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e6e2da;">
  <tr><td style="background:#0b0d10;padding:26px 28px;">
    <div style="font:11px/1 'Consolas','Courier New',monospace;letter-spacing:2.5px;color:#d4b483;">AUTOMOTIVE RETAIL. AI AND AUTOMATION.</div>
    <div style="font:800 24px/1.2 'Segoe UI',Helvetica,Arial,sans-serif;color:#f0ede6;margin-top:10px;">The demos you asked for</div>
  </td></tr>
  <tr><td style="padding:26px 28px 8px;">
    <p style="font:15px/1.6 'Segoe UI',Helvetica,Arial,sans-serif;color:#15181d;margin:0 0 14px;">${first}, thanks for asking. Here are the three demos from my portfolio. Every store, team, and customer in them is fictional; the renderers are the ones that run in production.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${rows}</table>
  </td></tr>
  <tr><td style="padding:8px 28px 26px;">
    <p style="font:14px/1.6 'Segoe UI',Helvetica,Arial,sans-serif;color:#5c6470;margin:0 0 14px;">Questions about how any of it works, or what it would take in your group: reply to this email.</p>
    <p style="font:14px/1.6 'Segoe UI',Helvetica,Arial,sans-serif;color:#15181d;margin:0;">Eduardo J. Rodriguez<br><span style="color:#5c6470;">National CX Director, Growth &amp; Digital Transformation</span><br><a href="${site}" style="color:#8a6d3b;">ejr1216.github.io/portfolio</a> &nbsp;|&nbsp; <a href="https://www.linkedin.com/in/ejr1216" style="color:#8a6d3b;">LinkedIn</a> &nbsp;|&nbsp; <a href="https://github.com/ejr1216" style="color:#8a6d3b;">GitHub</a></p>
  </td></tr>
  <tr><td style="padding:14px 28px;border-top:1px solid #e6e2da;">
    <p style="font:11px/1.5 'Segoe UI',Helvetica,Arial,sans-serif;color:#8a8f98;margin:0;">You received this because ${escapeHtml(email)} was entered on the portfolio's demo request form. The report formats in the attachments are the proprietary work of Eduardo Rodriguez; reproduction or derivative re-creation, including by AI-assisted tools, requires written permission from ejr1216@icloud.com.</p>
  </td></tr>
</table></td></tr></table></body></html>`;
  const text = `${name.split(/\s+/)[0]}, thanks for asking. Here are the three demos from my portfolio (fictional data, production renderers):\n\n` +
    DEMOS.map(d => `${d.title}\n${d.url || site + d.path}${d.pdf ? ' (PDF attached)' : ''}\n`).join('\n') +
    `\nQuestions: reply to this email.\n\nEduardo J. Rodriguez\nNational CX Director, Growth & Digital Transformation\n${site}\n`;

  const boundaryMixed = 'mixed_' + crypto.randomUUID().replace(/-/g, '');
  const boundaryAlt = 'alt_' + crypto.randomUUID().replace(/-/g, '');
  const headers = [
    `From: ${encodeHeader(env.FROM_NAME || 'Eduardo J. Rodriguez')} <${env.FROM_ADDRESS}>`,
    `To: ${encodeHeader(name)} <${email}>`,
    `Reply-To: ${env.FROM_ADDRESS}`,
    `Subject: ${encodeHeader('Your demos: Daily CX Huddle, Social Review Summary, Rooftop IQ')}`,
    `Date: ${new Date().toUTCString()}`,
    `Message-ID: <${crypto.randomUUID()}@mavericklabs.dev>`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundaryMixed}"`,
  ].join('\r\n');
  let parts = `--${boundaryMixed}\r\nContent-Type: multipart/alternative; boundary="${boundaryAlt}"\r\n\r\n` +
    `--${boundaryAlt}\r\nContent-Type: text/plain; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64wrap(new TextEncoder().encode(text))}\r\n` +
    `--${boundaryAlt}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64wrap(new TextEncoder().encode(html))}\r\n--${boundaryAlt}--\r\n`;
  for (const a of attachments) {
    parts += `--${boundaryMixed}\r\nContent-Type: ${a.mimeType}; name="${a.filename}"\r\nContent-Disposition: attachment; filename="${a.filename}"\r\nContent-Transfer-Encoding: base64\r\n\r\n${b64wrap(a.data)}\r\n`;
  }
  parts += `--${boundaryMixed}--\r\n`;
  return headers + '\r\n\r\n' + parts;
}
function encodeHeader(s) { return /^[\x20-\x7e]*$/.test(s) ? s.replace(/[\r\n]/g, ' ') : `=?utf-8?B?${btoa(unescape(encodeURIComponent(s)))}?=`; }
function b64wrap(bytes) {
  let bin = ''; for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return btoa(bin).replace(/(.{76})/g, '$1\r\n');
}

/* ------------------------------------------------------------------ minimal SMTP client (STARTTLS + AUTH PLAIN) */
async function sendSmtp(env, { from, to, raw }) {
  const host = env.SMTP_HOST || 'smtp.mail.me.com';
  const port = Number(env.SMTP_PORT || 587);
  let socket = connect({ hostname: host, port }, { secureTransport: 'starttls', allowHalfOpen: false });
  let reader = socket.readable.getReader();
  let writer = socket.writable.getWriter();
  const enc = new TextEncoder(), dec = new TextDecoder();
  let buffer = '';
  async function readReply() {
    // Returns the final line of an SMTP reply ("250 ok"); skips continuation lines ("250-...").
    for (;;) {
      let nl;
      while ((nl = buffer.indexOf('\r\n')) >= 0) {
        const line = buffer.slice(0, nl); buffer = buffer.slice(nl + 2);
        if (/^\d{3}-/.test(line)) continue;
        return line;
      }
      const { value, done } = await reader.read();
      if (done) throw new Error('SMTP connection closed');
      buffer += dec.decode(value, { stream: true });
    }
  }
  async function cmd(line, expect) {
    if (line !== null) await writer.write(enc.encode(line + '\r\n'));
    const reply = await readReply();
    if (!expect.includes(Number(reply.slice(0, 3)))) throw new Error(`SMTP ${line ? line.split(' ')[0] : 'greeting'} -> ${reply}`);
    return reply;
  }
  await cmd(null, [220]);
  await cmd(`EHLO mavericklabs.dev`, [250]);
  await cmd('STARTTLS', [220]);
  reader.releaseLock(); writer.releaseLock();
  socket = socket.startTls();
  reader = socket.readable.getReader(); writer = socket.writable.getWriter(); buffer = '';
  await cmd(`EHLO mavericklabs.dev`, [250]);
  const plain = btoa(` ${env.SMTP_USER} ${env.SMTP_PASS}`);
  await cmd(`AUTH PLAIN ${plain}`, [235]);
  await cmd(`MAIL FROM:<${from}>`, [250]);
  for (const rcpt of to) await cmd(`RCPT TO:<${rcpt}>`, [250, 251]);
  await cmd('DATA', [354]);
  const dotStuffed = raw.replace(/\r\n\./g, '\r\n..');
  await writer.write(enc.encode(dotStuffed + '\r\n.\r\n'));
  const dataReply = await readReply();
  if (!dataReply.startsWith('250')) throw new Error(`SMTP DATA -> ${dataReply}`);
  await cmd('QUIT', [221]);
  try { await socket.close(); } catch {}
}
