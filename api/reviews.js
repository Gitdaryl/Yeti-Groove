// GET /api/reviews
// Live Google rating, review count and any complete review texts for the homepage.
// Source is the studio's own Manitou Beach lookup, which already holds a Places key
// and uses Places API (New). The older API cannot read a service-area profile like ours.
// The homepage ships its reviews in the HTML, so a failure here only hides the live count.
// Failures answer 200 with success:false because Cloudflare masks 502/504.

export const PLACE_ID = 'ChIJPdrU740dPYgRsKp9Q5_0-oU';
export const SOURCE = `https://manitoubeachmichigan.com/api/google-places?placeId=${PLACE_ID}`;
const CUT_AT = 300; // the source slices texts here, so anything this long may be cut mid-sentence

export function shape(d) {
  const rating = Number(d?.rating);
  const count = Number(d?.reviewCount);
  if (!(rating > 0) || !(count > 0)) return null;
  // The source sends no per-review stars. Only a perfect average proves each one is five stars.
  const reviews = rating === 5
    ? (d.reviews || [])
        .filter((r) => r?.text && r?.author && r.text.length < CUT_AT)
        .map((r) => ({ author: r.author, text: r.text }))
    : [];
  return { rating, count, reviews };
}

export default async function handler(req, res) {
  try {
    const r = await fetch(SOURCE, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error(`source answered ${r.status}`);
    const data = shape(await r.json());
    if (!data) throw new Error('source sent no rating');
    res.setHeader('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=86400');
    return res.status(200).json({ success: true, ...data });
  } catch (e) {
    console.error('reviews:', e.message);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ success: false });
  }
}
