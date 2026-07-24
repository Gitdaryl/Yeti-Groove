import { list } from '@vercel/blob';
import {
  requireAdmin, logEvent, sendEmail, sendSMS, emailShell, esc, ADMIN_EMAIL,
} from './_lib.js';

// Admin actions on an order. Every action is logged as an event blob first,
// then notifications go out; a failed email never loses the action itself.
//   { action: 'question', orderId, text }         -> emails customer the question
//   { action: 'deliver',  orderId, note?, link? } -> emails customer delivery links, texts Yeti confirmation
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  const { action, orderId, text, note, link } = req.body || {};
  if (!action || !orderId || !/^YG-[A-Z0-9-]+$/.test(orderId)) {
    return res.status(400).json({ error: 'Missing or invalid action/orderId' });
  }

  let order;
  try {
    const { blobs } = await list({ prefix: `orders/${orderId}/` });
    const orderBlob = blobs.find(b => b.pathname.endsWith('/order.json'));
    if (!orderBlob) return res.status(404).json({ error: 'Order not found' });
    order = await (await fetch(orderBlob.url, { cache: 'no-store' })).json();

    if (action === 'question') {
      if (!text) return res.status(400).json({ error: 'Missing question text' });
      await logEvent(orderId, 'question', { text });

      const html = emailShell(`Quick question about your order`, `
        <p style="font-size:15px;color:#E6F4FB;line-height:1.7;margin:0 0 16px;">Hi ${esc(order.contactName.split(' ')[0])}, before we finish your post for <strong>${esc(order.businessName)}</strong> (order ${orderId}), we need one thing from you:</p>
        <div style="margin:0 0 16px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
          <p style="margin:0;font-size:14px;color:#E6F4FB;line-height:1.7;">${esc(text).replace(/\n/g, '<br />')}</p>
        </div>
        <p style="font-size:14px;color:#7AB8D0;line-height:1.7;margin:0;">Just hit reply — your answer goes straight to us and production continues.</p>`);

      const emailResult = await sendEmail({
        to: order.email,
        subject: `Quick question - order ${orderId} (${order.businessName})`,
        html,
        replyTo: ADMIN_EMAIL,
      });
      await logEvent(orderId, 'question-notify', { emailResult });
      // Always 200: Cloudflare fronts this domain and replaces 5xx bodies
      // with its own error page, hiding the JSON. success carries the outcome.
      return res.status(200).json({ success: emailResult.ok, emailResult });
    }

    if (action === 'deliver') {
      const { blobs: all } = await list({ prefix: `orders/${orderId}/delivery/` });
      const files = all.map(b => ({ url: b.url, name: b.pathname.split('/').pop() }));
      if (!files.length && !link) {
        return res.status(400).json({ error: 'No delivery files uploaded and no link provided' });
      }
      await logEvent(orderId, 'delivered', { files, link: link || null, note: note || null });

      const fileRows = files.map(f =>
        `<p style="margin:0 0 8px;"><a href="${f.url}" style="color:#1ABFE0;font-size:14px;">⬇ ${esc(f.name)}</a></p>`).join('');

      const html = emailShell(`Your post is ready! 🎉`, `
        <p style="font-size:15px;color:#E6F4FB;line-height:1.7;margin:0 0 16px;">Hi ${esc(order.contactName.split(' ')[0])}, your post for <strong>${esc(order.businessName)}</strong> (order ${orderId}) is finished. Download below — ready to share straight from your phone.</p>
        <div style="margin:0 0 16px;padding:16px;background:#061828;border-radius:8px;border:1px solid rgba(26,191,224,0.12);">
          ${fileRows}
          ${link ? `<p style="margin:0;"><a href="${esc(link)}" style="color:#1ABFE0;font-size:14px;">▶ View your post</a></p>` : ''}
        </div>
        ${note ? `<p style="font-size:14px;color:#7AB8D0;line-height:1.7;margin:0 0 16px;">${esc(note).replace(/\n/g, '<br />')}</p>` : ''}
        <p style="font-size:14px;color:#7AB8D0;line-height:1.7;margin:0 0 8px;"><strong style="color:#E6F4FB;">One round of revisions is included</strong> — reply to this email with any tweaks.</p>
        <p style="font-size:13px;color:rgba(122,184,208,0.6);margin:0;">Your invoice follows separately. Thanks for working with Yeti Groove!</p>`);

      const emailResult = await sendEmail({
        to: order.email,
        subject: `Your post is ready - order ${orderId} (${order.businessName})`,
        html,
        replyTo: ADMIN_EMAIL,
      });

      // Confirm to Yeti that the delivery actually went out (or failed).
      const confirmSms = emailResult.ok
        ? `DELIVERED ${orderId} — ${order.businessName}: delivery email sent to ${order.email} (${files.length} file${files.length === 1 ? '' : 's'}${link ? ' + link' : ''}).`
        : `DELIVERY FAILED ${orderId} — ${order.businessName}: email to ${order.email} did not send. Check yetigroove.com/admin.`;
      const sms = await sendSMS(confirmSms);

      await logEvent(orderId, 'deliver-notify', { emailResult, sms });
      return res.status(200).json({ success: emailResult.ok, emailResult, sms });
    }

    return res.status(400).json({ error: 'Unknown action' });
  } catch (e) {
    console.error('[ORDER-ACTION-FAILED]', orderId, String(e).slice(0, 300));
    return res.status(500).json({ error: 'Action failed' });
  }
}
