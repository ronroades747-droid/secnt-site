// secnt.org's sitemap (Release D; see src/lib/sitemap.ts for what enters and
// what is left out, and why).
import type { APIRoute } from 'astro';
import { getCollection, getEntry } from 'astro:content';
import { canonical, commentaryUrl, volumeUrl, articleUrl, frontmatterUrl, cardUrl, isVisible, isCardVisible } from '../lib/site';
import { readingOrder } from '../lib/onward';
import { sitemapResponse, lastmod, type SitemapUrl } from '../lib/sitemap';

export const GET: APIRoute = async () => {
  const urls: SitemapUrl[] = [
    { loc: canonical('/') },
    { loc: canonical('/commentary/') },
    { loc: canonical('/articles/') },
  ];

  // The series pages: About, Methodology, Architecture Principles, Citing.
  for (const p of (await getCollection('frontmatter')).filter(isVisible)) {
    urls.push({ loc: canonical(frontmatterUrl(p.id)), lastmod: lastmod(p.data as any) });
  }

  // Each volume, then its commentary pages in reading order.
  for (const v of (await getCollection('volumes')).filter(isVisible)) {
    urls.push({ loc: canonical(volumeUrl(v.data.book)), lastmod: lastmod(v.data) });
  }
  for (const { entry } of await readingOrder()) {
    urls.push({ loc: canonical(commentaryUrl(entry.id)), lastmod: lastmod(entry.data) });
  }

  // The articles, and the chapters of a chaptered article (built only when
  // the chapter and its article are both published).
  const articles = await getCollection('articles');
  for (const a of articles.filter(isVisible)) {
    if (a.id.includes('/')) {
      const parent = articles.find((p) => p.id === a.id.split('/')[0]);
      if (!parent || !isVisible(parent)) continue;
    }
    urls.push({ loc: canonical(articleUrl(a.id)), lastmod: lastmod(a.data) });
  }

  // The quotation-card pages, live exactly when their section is.
  for (const c of await getCollection('cards')) {
    if (!isCardVisible(await getEntry(c.data.section))) continue;
    urls.push({ loc: canonical(cardUrl(c.id)), lastmod: lastmod(c.data) });
  }

  return sitemapResponse(urls);
};
