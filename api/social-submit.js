export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    businessName,
    contactName,
    email,
    phone,
    postType,
    message,
    deliveryWeek,
    mediaNotes,
    notes,
  } = req.body;

  if (!businessName || !contactName || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:6px 12px 6px 0;color:#B0A390;font-size:14px;vertical-align:top;white-space:nowrap;">${label}</td><td style="padding:6px 0;color:#F0EDE6;font-size:14px;">${value}</td></tr>`
      : '';

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8" /></head>
<body style="background:#0F0E0C;font-family:'Helvetica Neue',Arial,sans-serif;margin:0;padding:24px;">
  <div style="max-width:540px;margin:0 auto;background:#161410;border:1px solid rgba(201,165,90,0.18);border-radius:12px;overflow:hidden;">
    <div style="background:#080807;padding:20px 28px;border-bottom:1px solid rgba(201,165,90,0.15);">
      <p style="margin:0;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#C9A55A;opacity:0.8;">Yeti Groove Media</p>
      <h1 style="margin:6px 0 0;font-size:20px;color:#F0EDE6;">New Social Post Request</h1>
    </div>
    <div style="padding:24px 28px;">
      <table style="width:100%;border-collapse:collapse;">
        ${row('Business', businessName)}
        ${row('Contact', contactName)}
        ${row('Email', `<a href="mailto:${email}" style="color:#C9A55A;">${email}</a>`)}
        ${row('Phone', phone)}
        ${row('Post Type', postType)}
        ${row('Delivery Week', deliveryWeek)}
      </table>

      <div style="margin-top:20px;padding:16px;background:#0F0E0C;border-radius:8px;border:1px solid rgba(201,165,90,0.12);">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A55A;opacity:0.7;">Key Message</p>
        <p style="margin:0;font-size:14px;color:#F0EDE6;line-height:1.6;">${message.replace(/\n/g, '<br />')}</p>
      </div>

      ${mediaNotes ? `
      <div style="margin-top:14px;padding:16px;background:#0F0E0C;border-radius:8px;border:1px solid rgba(201,165,90,0.12);">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A55A;opacity:0.7;">Media Notes</p>
        <p style="margin:0;font-size:14px;color:#F0EDE6;line-height:1.6;">${mediaNotes.replace(/\n/g, '<br />')}</p>
      </div>` : ''}

      ${notes ? `
      <div style="margin-top:14px;padding:16px;background:#0F0E0C;border-radius:8px;border:1px solid rgba(201,165,90,0.12);">
        <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#C9A55A;opacity:0.7;">Additional Notes</p>
        <p style="margin:0;font-size:14px;color:#F0EDE6;line-height:1.6;">${notes.replace(/\n/g, '<br />')}</p>
      </div>` : ''}

    </div>
    <div style="padding:16px 28px;border-top:1px solid rgba(201,165,90,0.12);font-size:12px;color:rgba(176,163,144,0.5);">
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
        from: 'Lake Access Orders <orders@yetigroove.com>',
        to: 'daryl@yetigroove.com',
        reply_to: email,
        subject: `New Social Post Request - ${businessName}`,
        html,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Resend error:', err);
      return res.status(500).json({ error: 'Email delivery failed' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Submit error:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
