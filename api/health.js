import { runHealthChecks } from './_lib.js';

export default async function handler(req, res) {
  const { ok, checks } = await runHealthChecks();
  res.status(ok ? 200 : 503).json({ ok, checks, checkedAt: new Date().toISOString() });
}
