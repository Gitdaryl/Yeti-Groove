// ============================================================
// POST /api/role-view
// ------------------------------------------------------------
// Tracking for the role-tailored pages on work.yetigroove.com, the same idea
// as the Signature pitch links: the point is not the personalisation, it is
// knowing that a hiring manager read the whole thing on a Sunday night,
// because that is a follow-up you can actually time.
//
// Lives in this project rather than the positioning one so it can reuse
// _lib.js: Blob logging, Twilio and Resend are already wired here, and
// ADMIN_PHONE is already set. Duplicating four secrets into a second project
// to save one cross-origin request would be the worse trade.
//
// Events are namespaced `role-<slug>` so they never mix into the Signature
// pitch reports.
//
// Records event type and dwell seconds only. No IP, no fingerprint, no
// identity. Enough to know the page landed, not who the reader was.
// ============================================================

import { logPitchEvent, listPitchEvents, sendEmail, sendSMS, emailShell, esc, ADMIN_EMAIL } from './_lib.js';

// One reader refreshing should not fire three texts.
const SESSION_GAP_MS = 30 * 60 * 1000;

// Which events are worth a phone buzzing.
const ALERTS = {
  view: true,   // opened it, gated by SESSION_GAP_MS
  deep: true,   // scrolled past the requirement map, so they read the evidence
  hot: true,    // 90 seconds of attention. On a job page that is a real read
  cta: true,    // clicked through to the main site or the email link
  ping: false,  // dwell heartbeat, logged only
};

// Only pages we actually publish. Stops the endpoint being a general purpose
// "text Daryl" button for anyone who finds it.
const KNOWN = new Set(['wongdoody']);

const ORIGINS = new Set([
  'https://work.yetigroove.com',
  'https://yeti-positioning.vercel.app',
]);

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default async function handler(req, res) {
  const origin = req.headers?.origin;
  if (origin && ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(204).end();
  }
  if (req.method !== 'POST') return res.status(405).json({ ok: false });

  const body = req.body || {};
  const slug = String(body.slug || '').toLowerCase().trim();
  const type = String(body.type || 'ping');
  const seconds = Number(body.seconds) || 0;

  if (!KNOWN.has(slug)) return res.status(200).json({ ok: true, tracked: false });
  if (!Object.prototype.hasOwnProperty.call(ALERTS, type)) {
    return res.status(400).json({ ok: false, error: 'unknown event type' });
  }

  // Checking your own link should not text you.
  if (body.preview === true) return res.status(200).json({ ok: true, preview: true });

  const ns = `role-${slug}`;
  let priorViews = 0;
  let lastAt = 0;

  try {
    const events = await listPitchEvents(ns);
    const views = events.filter((e) => e.type === 'view');
    priorViews = views.length;
    lastAt = events.reduce((max, e) => Math.max(max, Date.parse(e.at) || 0), 0);
  } catch {
    // A read failure must not stop us recording the event. Worst case the
    // alert gating is wrong once.
  }

  try {
    await logPitchEvent(ns, type, seconds);
  } catch (err) {
    console.error('[role-view] log failed:', err.message);
  }

  const isNewSession = Date.now() - lastAt > SESSION_GAP_MS;
  const shouldAlert = ALERTS[type] && (type !== 'view' || isNewSession);

  if (shouldAlert) {
    const label = slug.toUpperCase();
    const nth = type === 'view' ? ` (${ordinal(priorViews + 1)} visit)` : '';
    const detail = seconds ? ` after ${Math.round(seconds)}s` : '';
    const line = `${label}: ${type}${nth}${detail}`;

    // Fire independently. One channel failing must not suppress the other.
    // Same rule as the order pipeline.
    await Promise.allSettled([
      sendSMS(`Role page ${line}`),
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Role page: ${label} ${type}`,
        html: emailShell('Role page activity', `<p>${esc(line)}</p><p>${esc(new Date().toISOString())}</p>`),
      }),
    ]);
  }

  return res.status(200).json({ ok: true, tracked: true, alerted: shouldAlert });
}
