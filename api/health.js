export default async function handler(req, res) {
  const twilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE
  );

  // A present-but-revoked key still breaks every order, so validate the key
  // against Resend instead of only checking it is set. A send-only scoped key
  // gets a "restricted" 401 from this read endpoint, which still proves the
  // key itself is alive.
  let resend = 'missing';
  if (process.env.RESEND_API_KEY) {
    try {
      const r = await fetch('https://api.resend.com/domains', {
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      });
      if (r.ok) {
        resend = 'ok';
      } else {
        const body = await r.text();
        resend = /restricted/i.test(body) ? 'ok' : 'invalid-key';
      }
    } catch {
      resend = 'unreachable';
    }
  }

  const ok = resend === 'ok';

  res.status(ok ? 200 : 503).json({
    ok,
    checks: { resend, twilio },
    checkedAt: new Date().toISOString(),
  });
}
