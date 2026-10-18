// Field Office page behaviour: live catalog refresh, filter chips, looping
// card scenes and the scroll-driven storm-day story.

import { renderGrid, renderCustom, renderChips, renderFeed, renderStats } from './catalog.js';

const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

// ---------- card scenes: loop while on screen ----------
const LOOP_MS = 7000;
const looping = new Map(); // element -> start time
const io = new IntersectionObserver((entries) => {
  for (const e of entries) {
    if (e.isIntersecting) { if (!looping.has(e.target)) looping.set(e.target, performance.now()); }
    else looping.delete(e.target);
  }
  if (looping.size) tick();
}, { threshold: 0.35 });

let ticking = false;
function tick() {
  if (ticking || reduce.matches) return;
  ticking = true;
  requestAnimationFrame(function frame(now) {
    for (const [el, t0] of looping) {
      const t = (now - t0) % LOOP_MS;
      const p = Math.min(1, t / (LOOP_MS * 0.8));
      const o = t > LOOP_MS * 0.93 ? 1 - (t - LOOP_MS * 0.93) / (LOOP_MS * 0.07) : Math.min(1, t / (LOOP_MS * 0.03));
      el.style.setProperty('--p', p.toFixed(3));
      el.style.setProperty('--o', o.toFixed(3));
    }
    if (looping.size) requestAnimationFrame(frame); else ticking = false;
  });
}
function watchCards(root = document) {
  $$('.fcard .fo-anim, .fo-anim.loop', root).forEach((el) => io.observe(el));
}

// ---------- filter chips ----------
function applyFilter(key) {
  $$('#chips .chip').forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.filter === key)));
  $$('#grid .fcard').forEach((card) => { card.hidden = key !== 'all' && card.dataset.stage !== key; });
  const n = $$('#grid .fcard:not([hidden])').length;
  const live = $('#gridCount');
  if (live) live.textContent = `${n} showing`;
}
document.addEventListener('click', (e) => {
  const chip = e.target.closest('#chips .chip');
  if (chip) { applyFilter(chip.dataset.filter); return; }
  const jump = e.target.closest('[data-jump]');
  if (jump) {
    const card = document.getElementById(`f-${jump.dataset.jump}`);
    if (!card) return;
    e.preventDefault();
    if (card.hidden) applyFilter('all');
    card.scrollIntoView({ behavior: reduce.matches ? 'auto' : 'smooth', block: 'center' });
    card.classList.add('flash');
    setTimeout(() => card.classList.remove('flash'), 1600);
  }
});

// ---------- live data ----------
function signature(data) {
  return data.features.map((f) => `${f.id}:${f.since}:${f.clients.length}:${f.title}`).join('|');
}
async function refresh() {
  let j;
  try {
    const r = await fetch('/api/field-office-features', { headers: { accept: 'application/json' } });
    if (!r.ok || !(r.headers.get('content-type') || '').includes('json')) return;
    j = await r.json();
  } catch { return; }
  if (!j || !j.ok || !j.data || !j.data.features?.length) return;
  const data = j.data;
  const grid = $('#grid');
  if (grid && grid.dataset.sig !== signature(data)) {
    const current = $('#chips .chip[aria-pressed="true"]')?.dataset.filter || 'all';
    grid.innerHTML = renderGrid(data);
    $('#custom').innerHTML = renderCustom(data);
    $('#chips').innerHTML = renderChips(data);
    $('#feed').innerHTML = renderFeed(data);
    $('#customBand').hidden = !$('#custom').children.length;
    grid.dataset.sig = signature(data);
    applyFilter($(`#chips .chip[data-filter="${current}"]`) ? current : 'all');
    watchCards();
  }
  const stats = renderStats(data);
  for (const [k, v] of Object.entries(stats)) $$(`[data-stat="${k}"]`).forEach((el) => { el.textContent = v; });
  renderClients(data.clients);
}

function renderClients(clients) {
  const ul = $('#clientList');
  if (!ul || !clients?.length) return;
  ul.innerHTML = clients.map((c) => {
    const li = document.createElement('li');
    li.innerHTML = '<span class="who"></span><span class="where"></span><span class="n"></span>';
    li.querySelector('.who').textContent = c.label;
    li.querySelector('.where').textContent = [c.trades.join(', '), c.region].filter(Boolean).join(' · ');
    li.querySelector('.n').textContent = `${c.count} features running`;
    return li.outerHTML;
  }).join('');
}

// ---------- storm-day story: the scroll drives the scene ----------
function story() {
  const beats = $$('.beat');
  const scenes = $$('.story-stage .scene');
  const clock = $('#storyClock');
  const rail = $('#storyRail');
  if (!beats.length || !scenes.length) return;
  let active = -1;
  let queued = false;

  function update() {
    queued = false;
    // Side by side, the scene changes at mid-screen. Stacked on a phone, it
    // changes as a card comes out from under the pinned stage.
    const wrap = $('.stage-wrap');
    const line = innerWidth >= 900 || !wrap ? innerHeight * 0.55 : wrap.getBoundingClientRect().bottom + 24;
    let idx = 0, p = 0;
    beats.forEach((b, i) => {
      const r = b.getBoundingClientRect();
      if (r.top <= line) { idx = i; p = Math.min(1, Math.max(0, (line - r.top) / (r.height * 0.8))); }
    });
    if (idx !== active) {
      active = idx;
      scenes.forEach((s, i) => s.classList.toggle('on', i === idx));
      beats.forEach((b, i) => b.classList.toggle('on', i === idx));
      if (clock) clock.textContent = beats[idx].dataset.time || '';
    }
    if (!reduce.matches) scenes[idx].style.setProperty('--p', p.toFixed(3));
    if (rail) rail.style.setProperty('--r', ((idx + p) / beats.length).toFixed(3));
  }
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}

// ---------- nav goes light over the demo panel ----------
function navTone() {
  const nav = $('#topnav'), light = $('#demo');
  if (!nav || !light) return;
  const sync = () => {
    const r = light.getBoundingClientRect();
    nav.classList.toggle('on-light', r.top <= 60 && r.bottom > 60);
  };
  addEventListener('scroll', sync, { passive: true });
  addEventListener('resize', sync);
  sync();
}

document.documentElement.classList.add('js');
watchCards();
story();
navTone();
refresh();
reduce.addEventListener?.('change', () => { if (!reduce.matches && looping.size) tick(); });
