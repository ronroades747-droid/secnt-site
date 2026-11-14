// The share image (Release D, Ask §6, measure 3, as amended by the Editor on
// 14 Nov 2026: "1-2 as recommended"). Every page on secnt.org and on the
// lecture site names the site banner as its share image, through ONE
// 1200 × 630 crop of it, so the picture a link preview shows is chosen here
// rather than guessed by Facebook or any other app.
//
// The crop is generated at every build from public/banner.jpg and never
// committed, on the PDFs' precedent, so a change to the banner carries
// through to every link preview by itself. The crop the Editor approved: the
// banner's full height, cut evenly from both sides to 1200:630 (2560 of its
// 3168 pixels for the present banner), then scaled to 1200 × 630. It keeps
// the scholars at their desks, the lamps and shelves, and the lit doorway.
//
// Served at /share.jpg on both hosts (src/pages/share.jpg.ts,
// podcast/pages/share.jpg.ts). Its alt text is the banner's own (SITE.banner).
import path from 'node:path';
import sharp from 'sharp';

export const SHARE_IMAGE = { path: '/share.jpg', width: 1200, height: 630, type: 'image/jpeg' };

export async function shareImage() {
  const src = path.join(process.cwd(), 'public', 'banner.jpg');
  const { width: W, height: H } = await sharp(src).metadata();
  const ratio = SHARE_IMAGE.width / SHARE_IMAGE.height;
  // Full height, centred; were a future banner taller than 1200:630, full
  // width, centred, instead.
  const cw = Math.min(W, Math.round(H * ratio));
  const ch = Math.min(H, Math.round(cw / ratio));
  const region = { left: Math.round((W - cw) / 2), top: Math.round((H - ch) / 2), width: cw, height: ch };
  return sharp(src)
    .extract(region)
    .resize(SHARE_IMAGE.width, SHARE_IMAGE.height)
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();
}
