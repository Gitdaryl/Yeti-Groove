import { put } from '@vercel/blob';
import {
  sendEmail, sendSMS, emailShell, esc, ADMIN_EMAIL,
} from './_lib.js';

function newLeadId() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `YGO-${ymd}-${rand}`;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const {
    name, email, phone, company, trade, headcount,
    twice, waiting, inhead, software, message, source,
  } = req.body || {};

  if (!name || !email || !company) {
    return res.status(400).json({ ok: false, error: 'Name, email and business name are required.' });
  }

  const leadId = newLeadId();
  const lead = {
    leadId,
    receivedAt: new Date().toISOString(),
    name, email, phone, company, trade, headcount,
    twice, waiting, inhead, software, message,
    source: source || 'Streamline page',
  };

  // Persist before notify. The lead must survive even if Resend, Twilio and
  // everything else is down; the log line is the last-resort backstop.
  console.log('[STREAMLINE-LEAD]', JSON.stringify(lead));
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

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#7AB8D0;font-size:14px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;color:#E6F4FB;font-size:14px;">${value}</td></tr>`
      : '';

  const block = (label, value) =>
    value
      ? `<div style="margin-top:14px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
          <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1ABFE0;opacity:0.7;">${label}</p>
          <p style="margin:0;font-size:14px;color:#E6F4FB;line-height:1.6;">${esc(value).replace(/\n/g, '<br />')}</p>
        </div>`
      : '';

  const adminHtml = emailShell(`Operations audit inquiry ${leadId}`, `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Lead', `<strong>${leadId}</strong>`)}
      ${row('Name', esc(name))}
      ${row('Business', esc(company))}
      ${row('Trade', esc(trade))}
      ${row('Headcount', esc(headcount))}
      ${row('Email', `<a href="mailto:${esc(email)}" style="color:#1ABFE0;">${esc(email)}</a>`)}
      ${row('Phone', esc(phone))}
      ${row('Software', esc(software))}
      ${row('Source', esc(lead.source))}
    </table>
    ${block('Done twice', twice)}
    ${block('Sitting and waiting', waiting)}
    ${block('Only in someone’s head', inhead)}
    ${block('Anything else', message)}`);

  const clientHtml = emailShell('We have your note', `
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">${esc(String(name).split(' ')[0])},</p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      Thank you for the note about ${esc(company)}. Daryl reads every one of these personally and will come back to you, usually the same day, with a couple of questions about how the work actually moves through your shop.
    </p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      Nothing is automated on our side of this conversation. That part comes later, and only where it earns its place.
    </p>
    <p style="margin:0;font-size:15px;color:#E6F4FB;line-height:1.7;">Yeti Groove Studio</p>`);

  const [adminMail, clientMail, sms] = await Promise.allSettled([
    sendEmail({ to: ADMIN_EMAIL, subject: `Operations audit: ${company}`, html: adminHtml, replyTo: email }),
    sendEmail({ to: email, subject: 'Yeti Groove: we have your note', html: clientHtml, replyTo: ADMIN_EMAIL }),
    sendSMS(`YG AUDIT LEAD: ${name} (${company})${trade ? ` - ${trade}` : ''}. ${email}`),
  ]);

  const settled = (r) => (r.status === 'fulfilled' ? Boolean(r.value?.ok) : false);

  return res.status(200).json({
    ok: true,
    leadId,
    persisted,
    notified: { admin: settled(adminMail), client: settled(clientMail), sms: settled(sms) },
  });
}
