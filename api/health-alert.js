import { list, put } from '@vercel/blob';
import { runHealthChecks, sendSMS } from './_lib.js';

// Daily cron target. If the order pipeline is unhealthy, text Yeti.
// Rate-limited via a marker blob so a public hit can't SMS-bomb: at most one
// alert per 20 hours regardless of who calls this.
export default async function handler(req, res) {
  const { ok, checks } = await runHealthChecks();

  let alerted = false;
  if (!ok && checks.twilio === 'ok') {
    try {
      const { blobs } = await list({ prefix: 'system/last-health-alert' });
      const last = blobs[0]?.uploadedAt ? new Date(blobs[0].uploadedAt).getTime() : 0;
      if (Date.now() - last > 20 * 60 * 60 * 1000) {
        const bad = Object.entries(checks).filter(([, v]) => v !== 'ok').map(([k, v]) => `${k}: ${v}`).join(', ');
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

  res.status(ok ? 200 : 503).json({ ok, checks, alerted, checkedAt: new Date().toISOString() });
}
