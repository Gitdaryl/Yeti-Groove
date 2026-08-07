import {
  logPitchEvent, listPitchEvents, sendEmail, sendSMS,
  emailShell, esc, ADMIN_EMAIL,
} from './_lib.js';
import { getPitch, publicPitch } from './_pitches.js';

// A view inside this window counts as the same visit, so one prospect
// refreshing does not fire three text messages.
const SESSION_GAP_MS = 30 * 60 * 1000;

const ALERTS = {
  view: true,   // gated by SESSION_GAP_MS below
  play: true,   // started the Cove film. Strong signal, always alert.
  hot: true,    // 2+ minutes of attention on the page
  cta: true,    // clicked an Inquire button
  ping: false,  // dwell heartbeat, logged only
};

function ordinal(n) {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  const q = req.query || {};
  const body = req.method === 'POST' ? (req.body || {}) : {};
  const pitch = getPitch(body.slug || q.slug);

  if (!pitch) return res.status(200).json({ ok: true, found: false });

  const type = req.method === 'POST' ? String(body.type || 'ping') : 'view';
  if (!Object.prototype.hasOwnProperty.call(ALERTS, type)) {
    return res.status(400).json({ ok: false, error: 'unknown event type' });
  }

  const info = publicPitch(pitch);

  // Yeti checking his own link should not text Yeti.
  if (q.preview === '1' || body.preview === true) {
    return res.status(200).json({ ok: true, found: true, preview: true, ...info });
  }

  // History first: we need it to decide whether this view is a new visit,
  // and the answer is far more useful in the alert than the raw event.
  let history = [];
  try {
    history = await listPitchEvents(pitch.slug);
  } catch (e) {
    console.error('[PITCH-HISTORY-FAILED]', pitch.slug, String(e).slice(0, 200));
  }

  const now = Date.now();
  const views = history.filter((e) => e.type === 'view');
  const lastView = views.length ? Date.parse(views[views.length - 1].at) : 0;
  const newVisit = !lastView || now - lastView > SESSION_GAP_MS;
  const visitNumber = views.filter((e, i) => {
    if (i === 0) return true;
    return Date.parse(e.at) - Date.parse(views[i - 1].at) > SESSION_GAP_MS;
  }).length + (type === 'view' && newVisit ? 1 : 0);

  console.log('[PITCH]', JSON.stringify({ slug: pitch.slug, type, seconds: body.seconds || 0 }));
  try {
    await logPitchEvent(pitch.slug, type, body.seconds);
  } catch (e) {
    console.error('[PITCH-LOG-FAILED]', pitch.slug, String(e).slice(0, 200));
  }

  const shouldAlert = ALERTS[type] && (type !== 'view' || newVisit);
  if (shouldAlert) {
    const who = pitch.project || pitch.company || pitch.slug;
    const lines = {
      view: `${who} just opened the Signature page. ${ordinal(visitNumber)} visit.`,
      play: `${who} started playing the Cove film.`,
      hot: `${who} has been on the Signature page over 2 minutes.`,
      cta: `${who} clicked Inquire${body.tier ? ` on ${body.tier}` : ''}.`,
    };
    const msg = `YG PITCH: ${lines[type]}`;

    // Fire and forget, in parallel, and never let a dead integration 500 the
    // beacon. The blob write above is the record of truth.
    await Promise.allSettled([
      sendSMS(msg),
      sendEmail({
        to: ADMIN_EMAIL,
        subject: `Pitch activity: ${who}`,
        html: emailShell('Pitch activity', `
          <p style="margin:0 0 12px;font-size:15px;color:#E6F4FB;line-height:1.6;">${esc(lines[type])}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tr><td style="padding:4px 12px 4px 0;color:#7AB8D0;">Link</td><td style="padding:4px 0;color:#E6F4FB;">/signature/${esc(pitch.slug)}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#7AB8D0;">Contact</td><td style="padding:4px 0;color:#E6F4FB;">${esc(pitch.contact || '-')}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#7AB8D0;">Events so far</td><td style="padding:4px 0;color:#E6F4FB;">${history.length + 1}</td></tr>
            <tr><td style="padding:4px 12px 4px 0;color:#7AB8D0;">Note</td><td style="padding:4px 0;color:#E6F4FB;">${esc(pitch.note || '-')}</td></tr>
          </table>`),
      }),
    ]);
  }

  return res.status(200).json({ ok: true, found: true, ...info });
}
