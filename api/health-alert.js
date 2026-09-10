import { list, put } from '@vercel/blob';
import { runHealthChecks, sendSMS } from './_lib.js';

// Daily cron target. If the order pipeline is unhealthy, text Yeti.
// Rate-limited via a marker blob so a public hit can't SMS-bomb: at most one
// alert per 20 hours regardless of who calls this.
export default async function handler(req, res) {
  const first = await runHealthChecks();

  if (first.ok) {
    res.status(200).json({ ok: true, checks: first.checks, alerted: false, checkedAt: new Date().toISOString() });
    return;
  }

  // A single bad reading is not an outage: each upstream check has only a
  // 5s budget, so one slow response reads the same as a real failure. Wait,
  // then only alert on whatever is bad on BOTH passes.
  await new Promise((r) => setTimeout(r, 3000));
  const second = await runHealthChecks();

  const firstBad = new Set(Object.entries(first.checks).filter(([, v]) => v !== 'ok').map(([k]) => k));
  const stillBad = Object.entries(second.checks).filter(([k, v]) => v !== 'ok' && firstBad.has(k));

  let alerted = false;
  if (stillBad.length && second.checks.twilio === 'ok') {
    try {
      const { blobs } = await list({ prefix: 'system/last-health-alert' });
      const last = blobs[0]?.uploadedAt ? new Date(blobs[0].uploadedAt).getTime() : 0;
      if (Date.now() - last > 20 * 60 * 60 * 1000) {
        const bad = stillBad.map(([k, v]) => `${k}: ${v}`).join(', ');
        const r = await sendSMS(`YETIGROOVE ALERT: order pipeline unhealthy (${bad}). New orders may be failing silently. Check yetigroove.com/api/health`);
        if (r.ok) {
          await put('system/last-health-alert', new Date().toISOString(), {
            access: 'public', addRandomSuffix: false, contentType: 'text/plain', allowOverwrite: true,
          });
          alerted = true;
        }
      }
    } catch (e) {
      console.error('[HEALTH-ALERT-FAILED]', String(e).slice(0, 200));
    }
  }

  res.status(second.ok ? 200 : 503).json({
    ok: second.ok,
    checks: second.checks,
    confirmedBad: stillBad.map(([k]) => k),
    alerted,
    checkedAt: new Date().toISOString(),
  });
}
