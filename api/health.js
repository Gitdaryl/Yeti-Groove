export default function handler(req, res) {
  const checks = {
    resend: Boolean(process.env.RESEND_API_KEY),
    twilio: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE
    ),
  };

  // Email is the only delivery channel for orders; without it the site
  // must not report healthy.
  const ok = checks.resend;

  res.status(ok ? 200 : 503).json({
    ok,
    checks,
    checkedAt: new Date().toISOString(),
  });
}
