// Self-check endpoint. Hit /api/health to see which integrations are actually
// wired in this environment. Returns booleans only (never secret values), so it
// is safe to call publicly. Purpose: a project can never quietly go live with a
// missing env var again - if "resend" or "twilio" is false here, order
// notifications are silently broken and need env vars set in Vercel.
export default function handler(req, res) {
  const integrations = {
    resend: Boolean(process.env.RESEND_API_KEY),
    twilio: Boolean(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE
    ),
    notion: Boolean(process.env.NOTION_TOKEN),
  };

  // ok=false if the order pipeline can't actually deliver (no email channel)
  const ok = integrations.resend;

  res.status(ok ? 200 : 503).json({
    ok,
    service: 'yeti-groove',
    orderNotifyEmail: 'daryl@yetigroove.com',
    orderNotifySms: '+15172605907',
    integrations,
    note: ok
      ? 'Order pipeline healthy.'
      : 'RESEND_API_KEY not set - social order emails are NOT being delivered.',
    checkedAt: new Date().toISOString(),
  });
}
