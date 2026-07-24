import {
  newOrderId, saveOrder, logEvent, sendEmail, sendSMS,
  emailShell, esc, ADMIN_EMAIL,
} from './_lib.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    businessName, contactName, email, phone, website, instagram, facebook,
    postType, message, deliveryWeek, mediaNotes, scriptNotes, notes,
    couponCode, finalPrice, source,
  } = req.body || {};

  if (!businessName || !contactName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const orderId = newOrderId();
  const order = {
    orderId,
    receivedAt: new Date().toISOString(),
    businessName, contactName, email, phone, website, instagram, facebook,
    postType, message, deliveryWeek, mediaNotes, scriptNotes, notes,
    couponCode, finalPrice, source: source || 'Social',
  };

  // Persist before notify: the order must survive even if every integration
  // below is down. Blob is the durable record; the log line is the backstop.
  console.log('[ORDER]', JSON.stringify(order));
  let persisted = false;
  try {
    await saveOrder(orderId, order);
    persisted = true;
  } catch (e) {
    console.error('[ORDER-PERSIST-FAILED]', orderId, String(e).slice(0, 300));
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

  const adminHtml = emailShell(`New Order ${orderId}`, `
      <table style="width:100%;border-collapse:collapse;">
        ${row('Order', `<strong>${orderId}</strong>`)}
        ${row('Business', esc(businessName))}
        ${row('Contact', esc(contactName))}
        ${row('Email', `<a href="mailto:${esc(email)}" style="color:#1ABFE0;">${esc(email)}</a>`)}
        ${row('Phone', esc(phone))}
        ${row('Website', website ? `<a href="${esc(website)}" style="color:#1ABFE0;">${esc(website)}</a>` : '')}
        ${row('Instagram', esc(instagram))}
        ${row('Facebook', esc(facebook))}
        ${row('Post Type', esc(postType))}
        ${row('Delivery Week', esc(deliveryWeek))}
        ${row('Price', `<strong style="color:#A5D6A7;">${esc(finalPrice || '$150')}</strong>${couponCode ? ` <span style="color:#7AB8D0;font-size:12px;">(code: ${esc(couponCode)})</span>` : ''}`)}
        ${row('Source', esc(source || 'Social'))}
      </table>
      ${block('Key Message', message)}
      ${block('Media Notes', mediaNotes)}
      ${block('Script Key Points', scriptNotes)}
      ${block('Additional Notes', notes)}
      <p style="margin:20px 0 0;font-size:13px;color:#7AB8D0;">
        Uploaded media + actions: <a href="https://www.yetigroove.com/admin" style="color:#1ABFE0;">yetigroove.com/admin</a>
      </p>`);

  const customerHtml = emailShell(`Got your request, ${esc(contactName.split(' ')[0])}!`, `
      <p style="font-size:15px;color:#E6F4FB;line-height:1.7;margin:0 0 16px;">Your order <strong>${orderId}</strong> for <strong>${esc(businessName)}</strong> is confirmed and in our queue.</p>
      <p style="font-size:14px;color:#7AB8D0;line-height:1.7;margin:0 0 16px;">Expect a link to your finished post within <strong style="color:#E6F4FB;">3-5 business days</strong>. If we need anything first, we'll email you from this address.</p>
      ${postType ? `<p style="font-size:14px;color:#7AB8D0;line-height:1.7;margin:0 0 8px;">Style ordered: <strong style="color:#E6F4FB;">${esc(postType)}</strong></p>` : ''}
      <p style="font-size:14px;color:#7AB8D0;margin:0 0 24px;">Invoice will be sent along with your delivery.</p>
      <p style="font-size:13px;color:rgba(122,184,208,0.6);margin:0;">Questions? Reply to this email or reach us at <a href="mailto:${ADMIN_EMAIL}" style="color:#1ABFE0;">${ADMIN_EMAIL}</a> — include your order number ${orderId}.</p>`);

  const smsSource = order.source === 'Lake Access Media' ? 'Lake Access page' : 'social page';
  const smsBody = `NEW ORDER ${orderId} — ${businessName} (${postType || 'style TBD'}, ${finalPrice || '$150'}) via ${smsSource}. Details: yetigroove.com/admin + email.`;

  // Every notification is independent: one failing must never block the others.
  const [adminEmail, customerEmail, adminSms] = await Promise.all([
    sendEmail({ to: ADMIN_EMAIL, subject: `New Order ${orderId} [${order.source}] - ${businessName}`, html: adminHtml, replyTo: email }),
    sendEmail({ to: email, subject: `Order ${orderId} confirmed - ${businessName}`, html: customerHtml, replyTo: ADMIN_EMAIL }),
    sendSMS(smsBody),
  ]);

  const notified = { adminEmail, customerEmail, adminSms };
  console.log('[ORDER-NOTIFY]', orderId, JSON.stringify(notified));

  if (persisted) {
    logEvent(orderId, 'created', { notified }).catch(e =>
      console.error('[ORDER-EVENT-FAILED]', orderId, String(e).slice(0, 200)));
  }

  // The order is safe if it is durably stored OR reached Yeti's inbox/phone.
  if (persisted || adminEmail.ok || adminSms.ok) {
    return res.status(200).json({ success: true, orderId });
  }
  console.error('[ORDER-DELIVERY-FAILED]', orderId, 'no channel succeeded');
  return res.status(500).json({ error: 'Order could not be recorded. Please email ' + ADMIN_EMAIL, orderId });
}
