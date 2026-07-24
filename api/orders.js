import { list } from '@vercel/blob';
import { requireAdmin } from './_lib.js';

// Admin: list orders newest-first with media, delivery files, and event trail.
export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  if (!requireAdmin(req)) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const { blobs } = await list({ prefix: 'orders/', limit: 1000 });

    const byOrder = new Map();
    for (const b of blobs) {
      const m = b.pathname.match(/^orders\/([^/]+)\/(.+)$/);
      if (!m) continue;
      const [, id, rest] = m;
      if (!byOrder.has(id)) byOrder.set(id, { orderId: id, media: [], delivery: [], events: [] });
      const o = byOrder.get(id);
      if (rest === 'order.json') o.orderUrl = b.url;
      else if (rest.startsWith('media/')) o.media.push({ url: b.url, name: rest.slice(6), size: b.size, uploadedAt: b.uploadedAt });
      else if (rest.startsWith('delivery/')) o.delivery.push({ url: b.url, name: rest.slice(9), size: b.size, uploadedAt: b.uploadedAt });
      else if (rest.startsWith('events/')) o.events.push({ url: b.url, name: rest.slice(7) });
    }

    // Hydrate order.json + events. Bounded fan-out: 50 newest orders.
    const orders = [...byOrder.values()].slice(-200);
    await Promise.all(orders.map(async (o) => {
      try {
        if (o.orderUrl) o.order = await (await fetch(o.orderUrl, { cache: 'no-store' })).json();
      } catch { o.order = null; }
      o.events = o.events.sort((a, b) => a.name.localeCompare(b.name)).slice(-20);
      await Promise.all(o.events.map(async (ev) => {
        try { ev.data = await (await fetch(ev.url, { cache: 'no-store' })).json(); } catch {}
      }));
      const last = [...o.events].reverse().find(ev => ev.data?.type && ev.data.type !== 'created');
      o.status = last?.data?.type === 'delivered' ? 'delivered'
        : last?.data?.type === 'question' ? 'waiting-on-customer'
        : 'new';
    }));

    orders.sort((a, b) => (b.order?.receivedAt || '').localeCompare(a.order?.receivedAt || ''));
    return res.status(200).json({ orders: orders.slice(0, 50) });
  } catch (e) {
    console.error('[ORDERS-LIST-FAILED]', String(e).slice(0, 300));
    return res.status(500).json({ error: 'Failed to list orders' });
  }
}
