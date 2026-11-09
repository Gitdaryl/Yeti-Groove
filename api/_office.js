// Hands a lead to YetiGroove Office (its capture_lead function), where it lands on Today as "They wrote".
// Called AFTER the lead is saved here (persist before notify), so the Office being down never loses a lead:
// this never throws, waits at most 4 seconds, and logs the outcome. The key is never logged.
// Settings (Vercel env, never in this public repo): OFFICE_SUPABASE_URL, OFFICE_SUPABASE_ANON_KEY, OFFICE_LEAD_KEY.
// Unset: the lead is skipped for the Office and everything else carries on as before.

export function detailLines(pairs) {
  return pairs
    .filter(([, v]) => v != null && String(v).trim() !== '')
    .map(([k, v]) => `${k}: ${String(v).trim()}`)
    .join('\n');
}

export async function sendToOffice(lead) {
  const url = process.env.OFFICE_SUPABASE_URL;
  const anon = process.env.OFFICE_SUPABASE_ANON_KEY;
  const key = process.env.OFFICE_LEAD_KEY;
  if (!url || !anon || !key) {
    console.log('[OFFICE-SKIP] not configured', lead.external_id);
    return { sent: false, reason: 'not_configured' };
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 4000);
  try {
    const r = await fetch(`${url.replace(/\/$/, '')}/rest/v1/rpc/capture_lead`, {
      method: 'POST',
      headers: { apikey: anon, authorization: `Bearer ${anon}`, 'content-type': 'application/json' },
      body: JSON.stringify({ p_key: key, p_lead: lead }),
      signal: ctrl.signal,
    });
    const body = await r.json().catch(() => null);
    if (!r.ok) {
      console.error('[OFFICE-FAILED]', lead.external_id, r.status, JSON.stringify(body).slice(0, 300));
      return { sent: false, status: r.status };
    }
    console.log('[OFFICE-OK]', lead.external_id, JSON.stringify(body));
    return { sent: true, ...body };
  } catch (e) {
    console.error('[OFFICE-FAILED]', lead.external_id, String(e).slice(0, 200));
    return { sent: false };
  } finally {
    clearTimeout(timer);
  }
}
