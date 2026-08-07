import { listPitchEvents, requireAdmin } from './_lib.js';
import { PITCHES, getPitch } from './_pitches.js';

const SESSION_GAP_MS = 30 * 60 * 1000;

// Everything below is derived from blob KEY names only. No content reads, so
// no chance of a CDN-cached stale answer.
function summarize(events) {
  const views = events.filter((e) => e.type === 'view');
  let visits = 0;
  views.forEach((e, i) => {
    if (i === 0 || Date.parse(e.at) - Date.parse(views[i - 1].at) > SESSION_GAP_MS) visits++;
  });
  const pings = events.filter((e) => e.type === 'ping');
  return {
    visits,
    views: views.length,
    // Heartbeats carry cumulative visible seconds, so the largest one is the
    // longest single sitting this prospect gave the page.
    longestSessionSeconds: pings.reduce((max, e) => Math.max(max, e.seconds), 0),
    playedFilm: events.some((e) => e.type === 'play'),
    wentHot: events.some((e) => e.type === 'hot'),
    clickedInquire: events.filter((e) => e.type === 'cta').length,
    submittedLead: events.some((e) => e.type === 'lead'),
    firstSeen: events.length ? events[0].at : null,
    lastSeen: events.length ? events[events.length - 1].at : null,
  };
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (!requireAdmin(req)) return res.status(401).json({ ok: false, error: 'Unauthorized' });

  const slug = (req.query || {}).slug;

  if (slug) {
    const pitch = getPitch(slug);
    if (!pitch) return res.status(404).json({ ok: false, error: 'Unknown slug' });
    const events = await listPitchEvents(pitch.slug);
    return res.status(200).json({
      ok: true,
      slug: pitch.slug,
      project: pitch.project,
      note: pitch.note || '',
      ...summarize(events),
      events,
    });
  }

  const all = await listPitchEvents(null);
  const bySlug = new Map();
  for (const e of all) {
    if (!bySlug.has(e.slug)) bySlug.set(e.slug, []);
    bySlug.get(e.slug).push(e);
  }

  const rows = Object.keys(PITCHES).map((key) => {
    const events = bySlug.get(key) || [];
    return {
      slug: key,
      project: PITCHES[key].project || '',
      contact: PITCHES[key].contact || '',
      note: PITCHES[key].note || '',
      url: `https://www.yetigroove.com/signature/${key}`,
      ...summarize(events),
    };
  });

  // Never opened sorts last; otherwise most recent activity first.
  rows.sort((a, b) => (b.lastSeen || '').localeCompare(a.lastSeen || ''));

  return res.status(200).json({ ok: true, count: rows.length, pitches: rows });
}
