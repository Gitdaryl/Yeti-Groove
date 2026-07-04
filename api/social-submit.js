export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    businessName,
    contactName,
    email,
    phone,
    website,
    instagram,
    facebook,
    postType,
    message,
    deliveryWeek,
    mediaNotes,
    scriptNotes,
    notes,
    couponCode,
    finalPrice,
  } = req.body;

  if (!businessName || !contactName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // ── PERSIST BEFORE NOTIFY ──
  // Log the full order as structured JSON the moment it arrives, before any
  // email/SMS attempt. This guarantees the order is recoverable from Vercel
  // logs even if every integration below is unconfigured or fails. An order
  // must never vanish silently again. Search Vercel runtime logs for "[ORDER]".
  console.log('[ORDER]', JSON.stringify({
    at: new Date().toISOString(),
    source: req.body.source || 'Social',
    businessName, contactName, email, phone, website, instagram, facebook,
    postType, deliveryWeek, finalPrice, couponCode,
    message, mediaNotes, scriptNotes, notes,
  }));

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#7AB8D0;font-size:14px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;color:#E6F4FB;font-size:14px;">${value}</td></tr>`
      : '';

  const priceRow = couponCode
    ? `<tr>
        <td style="padding:6px 12px 6px 0;color:#7AB8D0;font-size:14px;vertical-align:top;white-space:nowrap;">Price</td>
        <td style="padding:6px 0;font-size:14px;">
          <span style="color:#A5D6A7;font-weight:700;">${finalPrice}</span>
          <span style="color:#7AB8D0;font-size:12px;margin-left:8px;">(code: ${couponCode})</span>
        </td>
      </tr>`
    : `<tr>
        <td style="padding:6px 12px 6px 0;color:#7AB8D0;font-size:14px;vertical-align:top;white-space:nowrap;">Price</td>
        <td style="padding:6px 0;color:#E6F4FB;font-size:14px;font-weight:700;">${finalPrice || '$150'}</td>
      </tr>`;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="background:#061828;font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:24px;">
  <div style="max-width:540px;margin:0 auto;background:#0A2038;border:1px solid rgba(26,191,224,0.22);border-radius:12px;overflow:hidden;">
    <div style="background:#061828;padding:20px 28px;border-bottom:1px solid rgba(26,191,224,0.15);">
      <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1ABFE0;opacity:0.8;">Yeti Groove Media</p>
      <h1 style="margin:6px 0 0;font-size:20px;color:#E6F4FB;">New Social Post Request</h1>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Business', businessName)}
        ${row('Contact', contactName)}
        ${row('Email', `<a href="mailto:${email}" style="color:#1ABFE0;">${email}</a>`)}
        ${row('Phone', phone)}
        ${row('Website', website ? `<a href="${website}" style="color:#1ABFE0;">${website}</a>` : '')}
        ${row('Instagram', instagram ? `<a href="https://instagram.com/${instagram.replace('@','')}" style="color:#1ABFE0;">${instagram}</a>` : '')}
        ${row('Facebook', facebook ? `<a href="https://${facebook.startsWith('http') ? '' : ''}${facebook}" style="color:#1ABFE0;">${facebook}</a>` : '')}
        ${row('Post Type', postType)}
        ${row('Delivery Week', deliveryWeek)}
        ${priceRow}
        ${req.body.source ? row('Source', req.body.source) : ''}
      </table>

      <div style="margin-top:20px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1ABFE0;opacity:0.7;">Key Message</p>
        <p style="margin:0;font-size:14px;color:#E6F4FB;line-height:1.6;">${message.replace(/\n/g, '<br />')}</p>
      </div>

      ${mediaNotes ? `
      <div style="margin-top:14px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1ABFE0;opacity:0.7;">Media Notes</p>
        <p style="margin:0;font-size:14px;color:#E6F4FB;line-height:1.6;">${mediaNotes.replace(/\n/g, '<br />')}</p>
      </div>` : ''}

      ${scriptNotes ? `
      <div style="margin-top:14px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1ABFE0;opacity:0.7;">Script Key Points</p>
        <p style="margin:0;font-size:14px;color:#E6F4FB;line-height:1.6;">${scriptNotes.replace(/\n/g, '<br />')}</p>
      </div>` : ''}

      ${notes ? `
      <div style="margin-top:14px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#1ABFE0;opacity:0.7;">Additional Notes</p>
        <p style="margin:0;font-size:14px;color:#E6F4FB;line-height:1.6;">${notes.replace(/\n/g, '<br />')}</p>
      </div>` : ''}

    </div>
    <div style="padding:16px 28px;border-top:1px solid rgba(26,191,224,0.12);font-size:12px;color:rgba(122,184,208,0.5);">
      Submitted via social.yetigroove.com
    </div>
  </div>
</body>
</html>`;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Yeti Groove Orders <orders@yetigroove.com>',
        to: 'daryl@yetigroove.com',
        reply_to: email,
        subject: `New Order [${req.body.source || 'Social'}] - ${businessName}`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email delivery failed' });
    }

    // Customer confirmation email
    const confirmHtml = `<!DOCTYPE html>
<html><head><meta charset="UTF-8" /></head>
<body style="background:#061828;font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:24px;">
  <div style="max-width:540px;margin:0 auto;background:#0A2038;border:1px solid rgba(26,191,224,0.22);border-radius:12px;overflow:hidden;">
    <div style="background:#061828;padding:20px 28px;border-bottom:1px solid rgba(26,191,224,0.15);">
      <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#1ABFE0;opacity:0.8;">Yeti Groove Media</p>
      <h1 style="margin:6px 0 0;font-size:20px;color:#E6F4FB;">Got your request, ${contactName.split(' ')[0]}!</h1>
    </div>
    <div style="padding:24px 28px;">
      <p style="font-size:15px;color:#E6F4FB;line-height:1.7;margin:0 0 16px;">We've received your social post request for <strong>${businessName}</strong> and we're on it.</p>
      <p style="font-size:14px;color:#7AB8D0;line-height:1.7;margin:0 0 16px;">Expect a link to your finished post within <strong style="color:#E6F4FB;">3-5 business days</strong>. We'll follow up by email if we need anything from you first.</p>
      <p style="font-size:14px;color:#7AB8D0;line-height:1.7;margin:0 0 8px;">Style ordered: <strong style="color:#E6F4FB;">${postType}</strong></p>
      <p style="font-size:14px;color:#7AB8D0;margin:0 0 24px;">Invoice will be sent along with your delivery.</p>
      <p style="font-size:13px;color:rgba(122,184,208,0.6);margin:0;">Questions? Reply to this email or reach us at <a href="mailto:daryl@yetigroove.com" style="color:#1ABFE0;">daryl@yetigroove.com</a></p>
    </div>
  </div>
</body></html>`;

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Yeti Groove Media <orders@yetigroove.com>',
        to: email,
        reply_to: 'daryl@yetigroove.com',
        subject: `Your post request is in - ${businessName}`,
        html: confirmHtml,
      }),
    }).catch(e => console.error('Customer confirm email failed:', e));

    // SMS alert
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from  = process.env.TWILIO_PHONE;
    if (sid && token && from) {
      const source = req.body.source === 'Lake Access Media' ? 'Lake Access' : 'Social';
      const smsBody = `New Yeti Groove order (${source}): ${businessName} - ${postType || 'social post'}, ${finalPrice || '$150'}. Details in your email.`;
      await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: from, To: '+15172605907', Body: smsBody }),
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
