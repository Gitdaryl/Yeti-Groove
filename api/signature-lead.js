import { put } from '@vercel/blob';
import {
  sendEmail, sendSMS, emailShell, esc, ADMIN_EMAIL, logPitchEvent,
} from './_lib.js';
import { getPitch } from './_pitches.js';

function newLeadId(prefix = 'YGS') {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${ymd}-${rand}`;
}

// Public annual limit on the Legacy line. Stated on /signature#legacy and in
// the rate card; the waitlist email repeats it so the number never drifts.
const LEGACY_SLOTS = { 'Legacy Site': 4, 'Legacy Commission': 2 };

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const {
    name, email, phone, company, project, location,
    stage, size, timeline, tier, message, slug, source, mode,
  } = req.body || {};

  const legacy = mode === 'legacy';

  if (!name || !email || !project) {
    return res.status(400).json({
      ok: false,
      error: legacy ? 'Name, email and whose story this is are required.' : 'Name, email and project are required.',
    });
  }

  const pitch = legacy ? null : getPitch(slug);
  const leadId = newLeadId(legacy ? 'YGL' : 'YGS');
  const lead = {
    leadId,
    receivedAt: new Date().toISOString(),
    kind: legacy ? 'legacy-waitlist' : 'signature-inquiry',
    name, email, phone, company, project, location,
    stage, size, timeline, tier, message,
    pitchSlug: pitch ? pitch.slug : null,
    source: source || (legacy ? 'Legacy waitlist' : 'Signature page'),
  };

  // Persist before notify. The lead must survive even if Resend, Twilio and
  // everything else is down; the log line is the last-resort backstop.
  console.log(legacy ? '[LEGACY-WAITLIST]' : '[SIGNATURE-LEAD]', JSON.stringify(lead));
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

  const adminHtml = emailShell(legacy ? `Legacy waitlist ${leadId}` : `Signature inquiry ${leadId}`, `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Lead', `<strong>${leadId}</strong>`)}
      ${row('Name', esc(name))}
      ${row(legacy ? 'Family / org' : 'Company', esc(company))}
      ${row('Email', `<a href="mailto:${esc(email)}" style="color:#1ABFE0;">${esc(email)}</a>`)}
      ${row('Phone', esc(phone))}
      ${row(legacy ? 'Whose story' : 'Project', esc(project))}
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

  const slotLine = legacy
    ? (LEGACY_SLOTS[tier]
        ? `The studio takes ${LEGACY_SLOTS[tier] === 4 ? 'four' : 'two'} ${esc(tier)} commissions a year, each directed personally by Daryl.`
        : 'The studio takes four Legacy Sites and two Legacy Commissions a year, each directed personally by Daryl.')
    : '';

  const clientHtml = legacy ? emailShell('You are on the Legacy waitlist', `
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">${esc(name.split(' ')[0])},</p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      Thank you for the note about ${esc(project)}. You are on the list. Daryl reads every one of these personally and will reply with the next opening and a few questions about the story and what you already hold.
    </p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      ${slotLine} The waitlist holds your place for the next opening; nothing is booked or billed until you and Daryl have spoken.
    </p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      The studio's pilot commission, Dr. Joe Profit's Never Broken, is the closest thing to a sample of the series:
      <a href="https://www.joeprofitneverbroken.com/" style="color:#1ABFE0;">joeprofitneverbroken.com</a>.
    </p>
    <p style="margin:0;font-size:15px;color:#E6F4FB;line-height:1.7;">Yeti Groove Studio</p>`)
  : emailShell('We have your project', `
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
    sendEmail({
      to: ADMIN_EMAIL,
      subject: legacy ? `Legacy waitlist: ${project}${tier ? ` (${tier})` : ''}` : `Signature inquiry: ${project}`,
      html: adminHtml, replyTo: email,
    }),
    sendEmail({
      to: email,
      subject: legacy ? 'Yeti Groove: you are on the Legacy waitlist' : 'Yeti Groove: we have your project',
      html: clientHtml, replyTo: ADMIN_EMAIL,
    }),
    sendSMS(`${legacy ? 'YG LEGACY WAITLIST' : 'YG SIGNATURE LEAD'}: ${name}${company ? ` (${company})` : ''} - ${project}${tier ? ` - ${tier}` : ''}. ${email}`),
  ]);

  const settled = (r) => (r.status === 'fulfilled' ? Boolean(r.value?.ok) : false);

  return res.status(200).json({
    ok: true,
    leadId,
    persisted,
    notified: { admin: settled(adminMail), client: settled(clientMail), sms: settled(sms) },
  });
}
