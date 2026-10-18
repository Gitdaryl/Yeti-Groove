// Field Office catalog: merges every client's feature list and renders it.
//
// Each client app publishes /field-office.json (schema 1). This file merges
// them so a feature shared by several clients shows once, with everyone who
// runs it, and a feature only one client has is marked as built for them.
// Runs in the browser (live refresh), in Node (prerender) and in the API.

import { sceneFor } from './anims.js';

export const STAGES = [
  ['leads', 'Get the lead'],
  ['sell', 'Sell it'],
  ['build', 'Build it'],
  ['crew', 'The crew'],
  ['money', 'Money'],
  ['keep', 'Keep them'],
  ['snow', 'Off-season'],
  ['office', 'The office'],
  ['grow', 'Get found'],
  ['care', 'Looked after'],
];
const STAGE_LABEL = Object.fromEntries(STAGES);
const NEW_DAYS = 30;

const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const isDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const clip = (s, n) => String(s ?? '').trim().slice(0, n);

// How a client is named on the page. A client who has not agreed to be named
// shows as their trade and region only, and their name never leaves the server.
export function clientLabel(c = {}) {
  if (c.showName && c.name) return clip(c.name, 60);
  const trade = (Array.isArray(c.trades) && c.trades[0]) || 'trade';
  return `A ${String(trade).toLowerCase()} company${c.region ? ` in ${clip(c.region, 40)}` : ''}`;
}

export function validManifest(m) {
  return !!m && m.schema === 1 && m.client && Array.isArray(m.features);
}

export function merge(manifests) {
  const clients = [];
  const byId = new Map();
  let updated = '';
  for (const m of manifests) {
    if (!validManifest(m)) continue;
    const label = clientLabel(m.client);
    const trades = (m.client.trades || []).map((t) => clip(t, 30)).slice(0, 6);
    let count = 0;
    for (const f of m.features) {
      if (!f || typeof f.id !== 'string' || !f.title || !f.line) continue;
      const id = clip(f.id, 60);
      const since = isDate(f.since) ? f.since : (isDate(m.updated) ? m.updated : '');
      const prev = byId.get(id);
      count++;
      if (prev) {
        if (!prev.clients.includes(label)) prev.clients.push(label);
        if (f.scope !== 'custom') prev.scope = 'core';
        if (since && (!prev.since || since < prev.since)) prev.since = since;
        continue;
      }
      byId.set(id, {
        id,
        stage: STAGE_LABEL[f.stage] ? f.stage : 'office',
        title: clip(f.title, 90),
        line: clip(f.line, 240),
        anim: clip(f.anim, 40),
        icon: clip(f.icon, 20),
        since,
        scope: f.scope === 'custom' ? 'custom' : 'core',
        launch: isDate(m.client.since) ? m.client.since : '',
        origin: label,
        clients: [label],
      });
    }
    if (isDate(m.updated) && m.updated > updated) updated = m.updated;
    clients.push({ label, trades, region: clip(m.client.region, 40), since: isDate(m.client.since) ? m.client.since : '', count });
  }
  const order = Object.fromEntries(STAGES.map(([k], i) => [k, i]));
  const features = [...byId.values()].sort((a, b) => order[a.stage] - order[b.stage]);
  return { updated, clients, features, count: features.length };
}

const daysAgo = (d, now) => (isDate(d) ? (now - Date.parse(`${d}T12:00:00Z`)) / 864e5 : Infinity);
// New means added after the client went live, not part of what they started on.
export const isNew = (f, now = Date.now()) => daysAgo(f.since, now) <= NEW_DAYS && (!f.launch || f.since > f.launch);

export function fmtDate(d) {
  if (!isDate(d)) return '';
  const [y, m, day] = d.split('-').map(Number);
  const mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m - 1];
  return `${mon} ${day}, ${y}`;
}

function whoLine(f) {
  if (f.clients.length > 1) return `Started at ${esc(f.origin)}, now at ${f.clients.length} companies`;
  return f.scope === 'custom' ? `Built for ${esc(f.origin)}` : `Running at ${esc(f.origin)}`;
}

export function renderCard(f, now = Date.now()) {
  const sc = sceneFor(f.anim, f.icon);
  const fresh = isNew(f, now);
  return `<article id="f-${esc(f.id)}" class="fcard${f.scope === 'custom' ? ' custom' : ''}" data-stage="${esc(f.stage)}" data-id="${esc(f.id)}">` +
    `<div class="fo-anim" style="--p:${sc.still}">${sc.svg}</div>` +
    `<div class="fbody"><p class="fstage">${esc(STAGE_LABEL[f.stage])}${fresh ? '<span class="fnew">New</span>' : ''}</p>` +
    `<h3>${esc(f.title)}</h3><p>${esc(f.line)}</p>` +
    `<p class="fwho">${whoLine(f)}</p></div></article>`;
}

export function renderChips(data) {
  const counts = {};
  for (const f of data.features) counts[f.stage] = (counts[f.stage] || 0) + 1;
  let h = `<button type="button" class="chip" aria-pressed="true" data-filter="all">All <span>${data.count}</span></button>`;
  for (const [k, label] of STAGES) {
    if (counts[k]) h += `<button type="button" class="chip" aria-pressed="false" data-filter="${k}">${label} <span>${counts[k]}</span></button>`;
  }
  return h;
}

export function renderGrid(data, now = Date.now()) {
  return data.features.filter((f) => f.scope === 'core' || f.clients.length > 1).map((f) => renderCard(f, now)).join('');
}

export function renderCustom(data, now = Date.now()) {
  return data.features.filter((f) => f.scope === 'custom' && f.clients.length === 1).map((f) => renderCard(f, now)).join('');
}

// The hero's "latest" list: the newest additions across every client.
export function renderFeed(data, n = 4) {
  const latest = [...data.features].filter((f) => f.since).sort((a, b) => (a.since < b.since ? 1 : -1)).slice(0, n);
  return latest.map((f) =>
    `<li><a href="#f-${esc(f.id)}" data-jump="${esc(f.id)}"><span class="ftitle">${esc(f.title)}</span>` +
    `<span class="fmeta">${esc(fmtDate(f.since))} &middot; ${esc(f.clients[0])}</span></a></li>`).join('');
}

export function renderStats(data, now = Date.now()) {
  const fresh = data.features.filter((f) => isNew(f, now)).length;
  return {
    count: String(data.count),
    updated: fmtDate(data.updated),
    fresh: String(fresh),
    clients: String(data.clients.length),
  };
}
