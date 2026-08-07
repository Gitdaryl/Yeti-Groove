import { put, list } from '@vercel/blob';

export const ADMIN_PHONE = '+15172605907';
export const ADMIN_EMAIL = 'daryl@yetigroove.com';
export const FROM_ORDERS = 'Yeti Groove Orders <orders@yetigroove.com>';
export const FROM_MEDIA = 'Yeti Groove Media <orders@yetigroove.com>';

export function newOrderId() {
  const d = new Date();
  const ymd = d.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `YG-${ymd}-${rand}`;
}

// Orders are append-only in Blob: order.json is written once, every later
// state change is its own event blob. Never read-modify-write a blob — content
// reads are CDN-cached and a stale read would silently drop history.
export async function saveOrder(orderId, order) {
  return put(`orders/${orderId}/order.json`, JSON.stringify(order, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

export async function logEvent(orderId, type, data = {}) {
  const at = new Date().toISOString();
  const key = `orders/${orderId}/events/${at.replace(/[:.]/g, '-')}-${type}.json`;
  return put(key, JSON.stringify({ type, at, ...data }), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
}

export async function listOrderBlobs(orderId) {
  const { blobs } = await list({ prefix: `orders/${orderId}/` });
  return blobs;
}

// --- Pitch-link engagement -------------------------------------------------
// One blob per event, never read-modify-write: content reads are CDN-cached
// and a stale read would drop history. Everything the report needs is encoded
// in the KEY, so reporting is a pure list() with zero content fetches.
//   pitches/<slug>/events/<iso>__<type>__<seconds>.json

export async function logPitchEvent(slug, type, seconds = 0) {
  const at = new Date().toISOString();
  const stamp = at.replace(/[:.]/g, '-');
  const secs = Math.max(0, Math.min(99999, Math.round(Number(seconds) || 0)));
  const key = `pitches/${slug}/events/${stamp}__${type}__${secs}.json`;
  await put(key, JSON.stringify({ slug, type, seconds: secs, at }), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
  });
  return { at, key };
}

export function parsePitchKey(pathname) {
  const m = /^pitches\/([^/]+)\/events\/(.+)__([a-z-]+)__(\d+)\.json$/.exec(pathname);
  if (!m) return null;
  const [, slug, stamp, type, secs] = m;
  // Undo the ISO mangling: 2026-08-06T12-34-56-789Z -> 2026-08-06T12:34:56.789Z
  const at = stamp.replace(
    /T(\d{2})-(\d{2})-(\d{2})-(\d{3})Z$/,
    (_, h, mi, s, ms) => `T${h}:${mi}:${s}.${ms}Z`
  );
  return { slug, type, seconds: Number(secs), at };
}

export async function listPitchEvents(slug) {
  const prefix = slug ? `pitches/${slug}/events/` : 'pitches/';
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    for (const b of page.blobs) {
      const ev = parsePitchKey(b.pathname);
      if (ev) out.push(ev);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  out.sort((a, b) => a.at.localeCompare(b.at));
  return out;
}

export async function sendEmail({ to, subject, html, replyTo }) {
  if (!process.env.RESEND_API_KEY) return { ok: false, error: 'RESEND_API_KEY not set' };
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from: FROM_ORDERS, to, reply_to: replyTo, subject, html }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return { ok: false, error: (await r.text()).slice(0, 300) };
    const j = await r.json();
    return { ok: true, id: j.id };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 300) };
  }
}

export async function sendSMS(body, to = ADMIN_PHONE) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE;
  if (!sid || !token || !from) return { ok: false, error: 'Twilio env not set' };
  try {
    const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({ From: from, To: to, Body: body }),
      signal: AbortSignal.timeout(10000),
    });
    if (!r.ok) return { ok: false, error: (await r.text()).slice(0, 300) };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e).slice(0, 300) };
  }
}

export function requireAdmin(req) {
  const key = process.env.ORDERS_ADMIN_KEY;
  const got = (req.headers['authorization'] || '').replace(/^Bearer\s+/i, '');
  return Boolean(key) && got === key;
}

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Shared brand email shell so every customer touchpoint looks the same.
export function emailShell(title, innerHtml) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8" /></head>
<body style="background:#061828;font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:24px;">
  <div style="max-width:540px;margin:0 auto;background:#0A2038;border:1px solid rgba(26,191,224,0.22);border-radius:12px;overflow:hidden;">
    <div style="background:#061828;padding:20px 28px;border-bottom:1px solid rgba(26,191,224,0.15);">
      <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1ABFE0;opacity:0.8;">Yeti Groove Media</p>
      <h1 style="margin:6px 0 0;font-size:20px;color:#E6F4FB;">${title}</h1>
    </div>
    <div style="padding:24px 28px;">${innerHtml}</div>
    <div style="padding:16px 28px;border-top:1px solid rgba(26,191,224,0.12);font-size:12px;color:rgba(122,184,208,0.5);">
      Yeti Groove Media &middot; Devils Lake, Michigan &middot; yetigroove.com
    </div>
  </div>
</body></html>`;
}

export async function runHealthChecks() {
  const checks = {};

  if (process.env.RESEND_API_KEY) {
    try {
      const r = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      if (r.ok) checks.resend = 'ok';
      else checks.resend = /restricted/i.test(await r.text()) ? 'ok' : 'invalid-key';
    } catch {
      checks.resend = 'unreachable';
    }
  } else checks.resend = 'missing';

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const tok = process.env.TWILIO_AUTH_TOKEN;
  if (sid && tok && process.env.TWILIO_PHONE) {
    try {
      const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}.json`, {
        headers: { Authorization: `Basic ${Buffer.from(`${sid}:${tok}`).toString('base64')}` },
        signal: AbortSignal.timeout(5000),
      });
      checks.twilio = r.ok ? 'ok' : 'invalid-creds';
    } catch {
      checks.twilio = 'unreachable';
    }
  } else checks.twilio = 'missing';

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      await list({ limit: 1 });
      checks.blob = 'ok';
    } catch {
      checks.blob = 'error';
    }
  } else checks.blob = 'missing';

  checks.adminKey = process.env.ORDERS_ADMIN_KEY ? 'ok' : 'missing';

  const ok = checks.resend === 'ok' && checks.twilio === 'ok' && checks.blob === 'ok' && checks.adminKey === 'ok';
  return { ok, checks };
}
