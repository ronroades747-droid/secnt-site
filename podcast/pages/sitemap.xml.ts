// The lecture site's sitemap (Release D; see src/lib/sitemap.ts). The show
// page and every episode page, from the same episode list the pages are
// built from (lib/episodes.ts), so a lecture enters exactly when its page
// does. `lastmod` is the lecture's `revised`, else its `date`.
import type { APIRoute } from 'astro';
import { getEpisodes, podcastUrl } from '../lib/episodes';
import { sitemapResponse, lastmod, type SitemapUrl } from '../../src/lib/sitemap';

export const GET: APIRoute = async () => {
  const { episodes } = await getEpisodes();
  const urls: SitemapUrl[] = [
    { loc: podcastUrl('/') },
    ...episodes.map((e) => ({ loc: podcastUrl(e.path), lastmod: lastmod(e.lecture.data) })),
  ];
  return sitemapResponse(urls);
};
