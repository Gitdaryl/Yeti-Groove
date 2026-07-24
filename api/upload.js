import { handleUpload } from '@vercel/blob/client';

// Issues short-lived client-upload tokens so browsers upload media straight to
// Blob storage (no 4.5MB function body limit). Two lanes:
//   orders/{id}/media/*    — customer uploads, tied to a just-created order
//   orders/{id}/delivery/* — finished work, admin key required
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload = {};
        try { payload = JSON.parse(clientPayload || '{}'); } catch {}

        const mediaMatch = /^orders\/(YG-[A-Z0-9-]+)\/media\/[^/]+$/.test(pathname);
        const deliveryMatch = /^orders\/(YG-[A-Z0-9-]+)\/delivery\/[^/]+$/.test(pathname);

        if (!mediaMatch && !deliveryMatch) {
          throw new Error('Invalid upload path');
        }
        if (deliveryMatch && payload.adminKey !== process.env.ORDERS_ADMIN_KEY) {
          throw new Error('Unauthorized');
        }

        return {
          allowedContentTypes: [
            'image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp', 'image/gif',
            'video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo',
            'application/octet-stream',
          ],
          maximumSizeInBytes: 1024 * 1024 * 1024, // 1GB, covers phone video
          addRandomSuffix: true,
        };
      },
      // Media is discovered by listing the order's folder, so no state to
      // record here; the hook exists to log for the runtime trail.
      onUploadCompleted: async ({ blob }) => {
        console.log('[UPLOAD-COMPLETE]', blob.pathname);
      },
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    console.error('[UPLOAD-TOKEN-FAILED]', String(e).slice(0, 300));
    return res.status(400).json({ error: String(e?.message || e).slice(0, 200) });
  }
}
