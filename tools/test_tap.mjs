// Tests for the studio's tap links (api/tap.js). Run: node --test tools/test_tap.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import handler, { TAPS, tapRoute, tally } from '../api/tap.js';

test('review and card links route, and count by how they were opened', () => {
  assert.deepEqual(tapRoute('review', 'tap'), { key: 'review', via: 'tap', to: TAPS.review });
  assert.deepEqual(tapRoute('REVIEW', 'qr'), { key: 'review', via: 'qr', to: TAPS.review });
  assert.deepEqual(tapRoute('review', undefined), { key: 'review', via: 'link', to: TAPS.review }, 'bare /review is the emailed link');
  assert.deepEqual(tapRoute('card', 'nfc'), { key: 'card', via: 'link', to: '/card' }, 'an unknown way in is never invented as a tap');
  assert.equal(tapRoute('nope', 'tap'), null);
  assert.match(TAPS.review, /^https:\/\/g\.page\/r\/[\w-]+\/review$/);
});

test('counts come from blob names only, split by way in, 30 days and all time', () => {
  const now = Date.parse('2026-10-09T16:00:00Z');
  const b = (pathname, iso) => ({ pathname, uploadedAt: iso });
  const c = tally([
    b('taps/review/tap/a', '2026-10-09T15:00:00Z'),
    b('taps/review/tap/b', '2026-07-01T15:00:00Z'),
    b('taps/review/link/c', '2026-10-01T15:00:00Z'),
    b('taps/card/qr/d', '2026-10-08T15:00:00Z'),
    b('taps/other/tap/e', '2026-10-08T15:00:00Z'),
    b('orders/x/order.json', '2026-10-08T15:00:00Z'),
  ], 30, now);
  assert.deepEqual(c.review.tap, { all: 2, recent: 1 });
  assert.deepEqual(c.review.link, { all: 1, recent: 1 });
  assert.deepEqual(c.review.qr, { all: 0, recent: 0 });
  assert.deepEqual(c.card.qr, { all: 1, recent: 1 });
  assert.equal(c.review.last, Date.parse('2026-10-09T15:00:00Z'));
  assert.deepEqual(Object.keys(c), ['review', 'card'], 'stray keys are ignored');
});

function call(query, headers = {}) {
  return new Promise((resolve) => {
    const res = {
      statusCode: 200, headers: {}, setHeader(k, v) { this.headers[k.toLowerCase()] = v; },
      status(s) { this.statusCode = s; return this; }, send(x) { this.body = x; resolve(this); },
      json(x) { this.body = x; resolve(this); }, end() { resolve(this); },
    };
    handler({ method: 'GET', query, headers: { 'user-agent': 'curl/8', ...headers } }, res);
  });
}

test('the handler redirects, 404s unknown keys and guards the report', async () => {
  let r = await call({ k: 'review', v: 'tap' });
  assert.equal(r.statusCode, 302); assert.equal(r.headers.location, TAPS.review);
  r = await call({ k: 'card', v: 'qr' });
  assert.equal(r.statusCode, 302); assert.equal(r.headers.location, '/card');
  r = await call({ k: 'nope' });
  assert.equal(r.statusCode, 404);
  r = await call({ report: '1' });
  assert.equal(r.statusCode, 401, 'no admin key, no counts');
});

test('vercel.json sends the tap paths to the handler before the homepage catch-all', () => {
  const rw = JSON.parse(fs.readFileSync(new URL('../vercel.json', import.meta.url))).rewrites.map((r) => r.source);
  const catchAll = rw.indexOf('/(.*)');
  for (const s of ['/card', '/card/:via', '/review', '/review/:via']) {
    assert.ok(rw.includes(s), s);
    assert.ok(rw.indexOf(s) < catchAll, `${s} must come before the catch-all`);
  }
});
