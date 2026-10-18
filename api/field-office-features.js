import { merge, validManifest } from '../media/field-office/catalog.js';
import snapshot from '../media/field-office/snapshot.js';

// Live feature list for /field-office. Each client app serves its own
// /field-office.json; FIELD_OFFICE_SOURCES lists those URLs (space or comma
// separated). The URLs live in the env, not the repo, because this repo is
// public and a client who has not agreed to be named would be named by its
// app's address. Any client that cannot be reached falls back to the last
// snapshot (media/field-office/snapshot.js, refreshed by
// tools/field-office-sync.mjs), so the page never goes empty.

const TIMEOUT_MS = 4000;

async function fetchManifest(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { accept: 'application/json' } });
  if (!r.ok) throw new Error(`${r.status}`);
  if (!(r.headers.get('content-type') || '').includes('json')) throw new Error('not json');
  const m = await r.json();
  if (!validManifest(m)) throw new Error('bad manifest');
  return m;
}

// Matches snapshot entries to live ones without storing names in the repo.
async function keyOf(m) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(m.client?.name || '')));
  return [...new Uint8Array(buf)].slice(0, 6).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default async function handler(req, res) {
  const sources = (process.env.FIELD_OFFICE_SOURCES || '').split(/[\s,]+/).filter(Boolean);
  const live = [];
  const failed = [];
  await Promise.all(sources.map(async (url) => {
    try { live.push(await fetchManifest(url)); } catch (e) { failed.push(String(e.message || e)); }
  }));

  const liveKeys = new Set(await Promise.all(live.map(keyOf)));
  const kept = (snapshot.manifests || []).filter((m) => !liveKeys.has(m.key));
  if (failed.length) console.warn('field-office-features: fell back to snapshot for', failed.length, 'source(s):', failed.join('; '));

  const data = merge([...live, ...kept]);
  // Never a 5xx: the site sits behind a CDN that swaps 5xx bodies for its own page.
  res.setHeader('Cache-Control', 'public, s-maxage=900, stale-while-revalidate=86400');
  res.status(200).json({ ok: true, live: live.length, fromSnapshot: kept.length, data });
}
