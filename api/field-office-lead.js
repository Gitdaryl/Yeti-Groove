import { put } from '@vercel/blob';
import {
  sendEmail, sendSMS, emailShell, esc, ADMIN_EMAIL,
} from './_lib.js';

// The exact words beside the texting checkbox on /field-office. When the
// wording on the page changes, change it here too and bump the version, so
// every stored consent record points at the words the person actually saw.
export const SMS_DISCLOSURE_VERSION = 'fo-sms-2026-10-12';
export const SMS_DISCLOSURE =
  'YetiGroove can text me about this request. Optional. Consent is not a condition of purchase. ' +
  'Msg & data rates may apply. Message frequency varies. Reply STOP to opt out, HELP for help. ' +
  'Privacy Policy: yetigroove.com/privacy. Terms: yetigroove.com/terms.';

const TRADES = new Set([
  'Roofing', 'Siding', 'Gutters', 'Windows', 'Decks', 'Fencing', 'Plumbing', 'HVAC', 'Electrical', 'Landscaping',
  'Auto repair', 'Snow and ice', 'Roofing and snow', 'Several trades', 'Something else',
]);
const CREW_SIZES = new Set(['Just me', '2 to 5', '6 to 15', '16 to 40', 'More than 40']);

function newLeadId() {
  const ymd = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `YGF-${ymd}-${rand}`;
}

const clip = (v, n = 200) => (v == null ? '' : String(v).trim().slice(0, n));

// US numbers only. Anything else is stored as typed but never texted.
function toE164(raw) {
  const d = String(raw || '').replace(/\D/g, '');
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith('1')) return `+${d}`;
  return null;
}

const fail = (res, status, error, extra = {}) =>
  // Never a 5xx: the site sits behind a CDN that replaces 5xx bodies with its
  // own page, and the form needs our message. Failures are 200 + success:false.
  res.status(status).json({ success: false, ok: false, error, ...extra });

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const dryRun = process.env.LEAD_DRY_RUN === '1';

  const lead = {
    leadId: newLeadId(),
    receivedAt: new Date().toISOString(),
    product: 'Field Office',
    name: clip(body.name, 120),
    company: clip(body.company, 160),
    trade: clip(body.trade, 60),
    crew: clip(body.crew, 60),
    phone: clip(body.phone, 40),
    email: clip(body.email, 200),
    headache: clip(body.headache, 4000),
    page: clip(body.page, 200) || '/field-office',
    source: 'Field Office page',
    userAgent: clip(req.headers['user-agent'], 300),
    ip: clip(String(req.headers['x-forwarded-for'] || '').split(',')[0], 64),
  };

  const textMe = body.smsConsent === true || body.smsConsent === 'yes' || body.smsConsent === 'on';
  const phoneE164 = toE164(lead.phone);
  lead.consent = {
    sms: Boolean(textMe && phoneE164),
    boxChecked: textMe,
    phone: textMe ? phoneE164 : null,
    at: lead.receivedAt,
    page: lead.page,
    disclosureVersion: SMS_DISCLOSURE_VERSION,
    disclosureVersionShown: clip(body.consentVersion, 60) || null,
    disclosureText: SMS_DISCLOSURE,
  };

  // Honeypot: people never see this field. Log it so a real person caught by
  // it can still be found, then answer the bot quietly.
  const trap = clip(body.website, 200);
  if (trap) {
    console.log('[FIELD-OFFICE-LEAD-SPAM]', JSON.stringify({ ...lead, website: trap }));
    return res.status(200).json({ success: true, ok: true });
  }

  // Persist before notify: this log line is the backstop if every provider
  // below is down. It goes out before any validation can reject the request.
  console.log('[FIELD-OFFICE-LEAD]', JSON.stringify(lead));

  const missing = [];
  if (!lead.name) missing.push('name');
  if (!lead.company) missing.push('company');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) missing.push('email');
  if (!TRADES.has(lead.trade)) missing.push('trade');
  if (!CREW_SIZES.has(lead.crew)) missing.push('crew');
  if (missing.length) {
    return fail(res, 200, 'A few details are missing. Check the highlighted fields.', { fields: missing });
  }

  if (dryRun) {
    console.log('[FIELD-OFFICE-LEAD-DRY-RUN] skipped storage, email and text', lead.leadId);
    return res.status(200).json({
      success: true, ok: true, dryRun: true, leadId: lead.leadId, texted: false, smsConsent: lead.consent.sms,
    });
  }

  let persisted = false;
  try {
    await put(`leads/${lead.leadId}/lead.json`, JSON.stringify(lead, null, 2), {
      access: 'public',
      addRandomSuffix: true,
      contentType: 'application/json',
    });
    persisted = true;
  } catch (e) {
    console.error('[LEAD-PERSIST-FAILED]', lead.leadId, String(e).slice(0, 300));
  }

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#7AB8D0;font-size:14px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;color:#E6F4FB;font-size:14px;">${value}</td></tr>`
      : '';

  const adminHtml = emailShell(`Field Office demo request ${lead.leadId}`, `
    <table style="width:100%;border-collapse:collapse;">
      ${row('Lead', `<strong>${lead.leadId}</strong>`)}
      ${row('Name', esc(lead.name))}
      ${row('Company', esc(lead.company))}
      ${row('Trade', esc(lead.trade))}
      ${row('Crew size', esc(lead.crew))}
      ${row('Email', `<a href="mailto:${esc(lead.email)}" style="color:#1ABFE0;">${esc(lead.email)}</a>`)}
      ${row('Phone', esc(lead.phone))}
      ${row('Texting OK', lead.consent.sms ? 'Yes (box checked)' : 'No. Email or call only.')}
      ${row('Saved', persisted ? 'Yes' : 'NO: copy this email, storage failed')}
    </table>
    ${lead.headache ? `<div style="margin-top:14px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
      <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1ABFE0;opacity:0.7;">Biggest headache</p>
      <p style="margin:0;font-size:14px;color:#E6F4FB;line-height:1.6;">${esc(lead.headache).replace(/\n/g, '<br />')}</p>
    </div>` : ''}`);

  const first = esc(lead.name.split(/\s+/)[0]);
  const clientHtml = emailShell('We have your demo request', `
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">${first},</p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      Thanks for asking to see Field Office. We will be in touch within one business day to set a time, and we will walk you through one job from the first call to paid in full, on a phone and an iPad.
    </p>
    <p style="margin:0 0 14px;font-size:15px;color:#E6F4FB;line-height:1.7;">
      If something about ${esc(lead.company)} would help us show you the right parts, just reply to this email.
    </p>
    <p style="margin:0;font-size:15px;color:#E6F4FB;line-height:1.7;">The YetiGroove studio</p>`);

  const tasks = [
    sendEmail({ to: ADMIN_EMAIL, subject: `Field Office demo: ${lead.company} (${lead.trade}, ${lead.crew})`, html: adminHtml, replyTo: lead.email }),
    sendSMS(`YG FIELD OFFICE LEAD: ${lead.name} (${lead.company}), ${lead.trade}, crew ${lead.crew}. ${lead.email}${lead.consent.sms ? ' TEXT OK' : ''}`),
    sendEmail({ to: lead.email, subject: 'YetiGroove: your Field Office demo', html: clientHtml, replyTo: ADMIN_EMAIL }),
  ];
  // Text the visitor only when they ticked the box and gave a US mobile number.
  if (lead.consent.sms) {
    tasks.push(sendSMS(
      `YetiGroove: thanks, ${lead.name.split(/\s+/)[0]}. We got your Field Office demo request and will be in touch within 1 business day to set a time. Reply STOP to opt out, HELP for help.`,
      phoneE164,
    ));
  }

  const results = await Promise.allSettled(tasks);
  const ok = (r) => r && r.status === 'fulfilled' && Boolean(r.value?.ok);
  const why = (r) => (r && r.status === 'fulfilled' ? r.value?.error : String(r?.reason)) || null;
  const [adminMail, adminSms, clientMail, clientSms] = results;

  const delivered = {
    adminEmail: ok(adminMail),
    adminText: ok(adminSms),
    clientEmail: ok(clientMail),
    clientText: lead.consent.sms ? ok(clientSms) : null,
  };
  console.log('[FIELD-OFFICE-LEAD-DELIVERY]', JSON.stringify({
    leadId: lead.leadId,
    persisted,
    delivered,
    errors: {
      adminEmail: delivered.adminEmail ? null : why(adminMail),
      adminText: delivered.adminText ? null : why(adminSms),
      clientEmail: delivered.clientEmail ? null : why(clientMail),
      clientText: lead.consent.sms && !delivered.clientText ? why(clientSms) : null,
    },
  }));

  // Success means a person at the studio was told. A stored lead nobody was
  // notified about is not success: the visitor gets the direct address instead.
  if (!delivered.adminEmail && !delivered.adminText) {
    return fail(res, 200, 'That did not reach us. Please email daryl@yetigroove.com and we will set up your demo.', {
      leadId: lead.leadId, persisted,
    });
  }

  return res.status(200).json({
    success: true,
    ok: true,
    leadId: lead.leadId,
    persisted,
    texted: delivered.clientText === true,
    smsConsent: lead.consent.sms,
  });
}
