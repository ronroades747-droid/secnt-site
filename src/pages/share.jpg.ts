// The share image every page names in its og:image (Release D; see
// src/lib/share-image.mjs). Generated at build from public/banner.jpg.
import type { APIRoute } from 'astro';
import { shareImage, SHARE_IMAGE } from '../lib/share-image.mjs';

export const GET: APIRoute = async () =>
  new Response(new Uint8Array(await shareImage()), { headers: { 'Content-Type': SHARE_IMAGE.type } });
