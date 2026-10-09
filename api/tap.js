// Tap and scan links for the studio's own NFC pieces (print/README.md):
//   /review/tap  phone-case sticker   -> Google review form
//   /review/qr   review QR (saved on the phone)
//   /review      the link in a delivery email or text (counts as "link")
//   /card/tap    contact card chip    -> /card, the save-contact page
//   /card/qr     QR on the back of the contact card
// vercel.json rewrites each one here. One tiny Blob per follow, counted from list() pathnames
// (taps/<key>/<via>/<uuid>), so the report never reads blob content and never sees a stale CDN copy.
// GET ?report=1 with the admin key returns the counts for /admin.
import { put, list } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { requireAdmin } from './_lib.js';

export const TAPS = {
  review: 'https://g.page/r/CbCqfUOf9PqFEAI/review',
  card: '/card',
};
export const VIA = ['tap', 'qr', 'link'];

// Link previews and crawlers follow links too; they are not taps.
const BOT = /bot|crawl|spider|slurp|facebookexternalhit|facebot|whatsapp|telegram|discord|slack|skype|preview|embed|curl|wget|python|headless|lighthouse|pingdom|uptime/i;
export const isBot = (ua) => !ua || BOT.test(ua);

export function tapRoute(k, v) {
  const key = String(k || '').toLowerCase();
  if (!TAPS[key]) return null;
  return { key, via: VIA.includes(v) ? v : 'link', to: TAPS[key] };
}

// { review: { tap: { all, recent }, qr: {...}, link: {...}, last }, card: {...} }
export function tally(blobs, days = 30, now = Date.now()) {
  const since = now - days * 864e5;
  const out = {};
  for (const key of Object.keys(TAPS)) {
    out[key] = { last: null };
    for (const v of VIA) out[key][v] = { all: 0, recent: 0 };
  }
  for (const b of blobs) {
    const [root, key, via] = b.pathname.split('/');
    if (root !== 'taps' || !out[key] || !VIA.includes(via)) continue;
    const t = new Date(b.uploadedAt).getTime();
    out[key][via].all++;
    if (t >= since) out[key][via].recent++;
    if (!out[key].last || t > out[key].last) out[key].last = t;
  }
  return out;
}

async function listAll(prefix, maxPages = 20) {
  const out = [];
  let cursor;
  for (let p = 0; p < maxPages; p++) {
    const r = await list({ prefix, limit: 1000, cursor });
    out.push(...r.blobs);
    if (!r.hasMore) break;
    cursor = r.cursor;
  }
  return out;
}

async function record(key, via) {
  await put(`taps/${key}/${via}/${randomUUID()}`, '1', { access: 'public', addRandomSuffix: false, contentType: 'text/plain' });
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.query?.report) {
    if (!requireAdmin(req)) return res.status(401).json({ success: false, error: 'unauthorized' });
    try {
      return res.status(200).json({ success: true, counts: tally(await listAll('taps/')) });
    } catch (e) {
      console.error('tap report:', e.message);
      return res.status(200).json({ success: false, error: 'could not read taps' }); // 200: Cloudflare masks 502/504
    }
  }

  const r = tapRoute(req.query?.k, req.query?.v);
  if (!r) return res.status(404).send('Not found');
  // Count without making the person wait on storage: whichever finishes first wins.
  if (req.method === 'GET' && !isBot(req.headers['user-agent'])) {
    await Promise.race([
      record(r.key, r.via).catch((e) => console.error('tap:', r.key, e.message)),
      new Promise((ok) => setTimeout(ok, 900)),
    ]);
  }
  res.statusCode = 302;
  res.setHeader('Location', r.to);
  res.end();
}
