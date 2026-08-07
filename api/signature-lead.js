import { put } from '@vercel/blob';
import {
  sendEmail, sendSMS, emailShell, esc, ADMIN_EMAIL, logPitchEvent,
} from './_lib.js';
import { getPitch } from './_pitches.js';

function newLeadId() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `YGS-${ymd}-${rand}`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const {
    name, email, phone, company, project, location,
    stage, size, timeline, tier, message, slug, source,
  } = req.body || {};

  if (!name || !email || !project) {
    return res.status(400).json({ ok: false, error: 'Name, email and project are required.' });
  }

  const pitch = getPitch(slug);
  const leadId = newLeadId();
  const lead = {
    leadId,
    receivedAt: new Date().toISOString(),
    name, email, phone, company, project, location,
    stage, size, timeline, tier, message,
    pitchSlug: pitch ? pitch.slug : null,
    source: source || 'Signature page',
  };

  // Persist before notify. The lead must survive even if Resend, Twilio and
  // everything else is down; the log line is the last-resort backstop.
  console.log('[SIGNATURE-LEAD]', JSON.stringify(lead));
  let persisted = false;
  try {
    await put(`leads/${leadId}/lead.json`, JSON.stringify(lead, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'application/json',
    });
    persisted = true;
  } catch (e) {
    console.error('[LEAD-PERSIST-FAILED]', leadId, String(e).slice(0, 300));
  }

  if (pitch) {
    try { await logPitchEvent(pitch.slug, 'lead', 0); } catch { /* logged above */ }
  }

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#7AB8D0;font-size:14px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;color:#E6F4FB;font-size:14px;">${value}</td></tr>`
      : '';

  const adminHtml = emailShell(`Signature inquiry ${leadId}`, `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Lead', `<strong>${leadId}</strong>`)}
      ${row('Name', esc(name))}
      ${row('Company', esc(company))}
      ${row('Email', `<a href="mailto:${esc(email)}" style="color:#1ABFE0;">${esc(email)}</a>`)}
      ${row('Phone', esc(phone))}
      ${row('Project', esc(project))}
      ${row('Location', esc(location))}
      ${row('Stage', esc(stage))}
      ${row('Size', esc(size))}
      ${row('Timeline', esc(timeline))}
      ${row('Tier', esc(tier))}
      ${row('Pitch link', pitch ? `/signature/${esc(pitch.slug)}` : '')}
      ${row('Source', esc(lead.source))}
    </table>
    ${message ? `<div style="margin-top:14px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1ABFE0;opacity:0.7;">Message</p>
        <p style="margin:0;font-size:14px;color:#E6F4FB;line-height:1.6;">${esc(message).replace(/\n/g, '<br />')}</p>
      </div>` : ''}`);

  const clientHtml = emailShell('We have your project', `
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">${esc(name.split(' ')[0])},</p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      Thank you for the note about ${esc(project)}. Daryl reads every inquiry personally and will come back to you, usually the same day, with a few questions about the site and what you are trying to sell.
    </p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      If it helps in the meantime, the Devils Lake Cove film is the closest thing to a sample of what a commission looks like:
      <a href="https://www.yetigroove.com/signature#film" style="color:#1ABFE0;">yetigroove.com/signature</a>.
    </p>
    <p style="margin:0;font-size:15px;color:#E6F4FB;line-height:1.7;">Yeti Groove Media</p>`);

  const [adminMail, clientMail, sms] = await Promise.allSettled([
    sendEmail({ to: ADMIN_EMAIL, subject: `Signature inquiry: ${project}`, html: adminHtml, replyTo: email }),
    sendEmail({ to: email, subject: 'Yeti Groove: we have your project', html: clientHtml, replyTo: ADMIN_EMAIL }),
    sendSMS(`YG SIGNATURE LEAD: ${name}${company ? ` (${company})` : ''} - ${project}${tier ? ` - ${tier}` : ''}. ${email}`),
  ]);

  const settled = (r) => (r.status === 'fulfilled' ? Boolean(r.value?.ok) : false);

  return res.status(200).json({
    ok: true,
    leadId,
    persisted,
    notified: { admin: settled(adminMail), client: settled(clientMail), sms: settled(sms) },
  });
}
