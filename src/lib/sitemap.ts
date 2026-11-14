// The sitemaps (Release D, Ask §6, measure 1; the Editor's rulings of
// 14 Nov 2026). One for each site: secnt.org's at /sitemap.xml
// (src/pages/sitemap.xml.ts) and the lecture site's at its own /sitemap.xml
// (podcast/pages/sitemap.xml.ts), each named by a `Sitemap:` line in that
// site's robots.txt.
//
// GENERATED AT BUILD FROM THE COLLECTIONS, not by a plugin's crawl of the
// built output, so that what enters is exactly the set of published pages
// the routes build from the same gates (isVisible, isCardVisible). Left out
// by construction:
//   - the dated version pages, <page URL>v/<YYYY-MM-DD>/, which are noindex
//     (Release C, ruling 3 of 13 Nov 2026): the `versions` collection is
//     never read here;
//   - drafts;
//   - the redirects of src/pages/[redirects].ts, which are not pages;
//   - the 404 page, the feeds, the PDFs and the share image.
// `lastmod` is a page's `revised`, else its `date`. A listing page with no
// date of its own (the home page, the Commentaries and Articles contents)
// carries none.
export type SitemapUrl = { loc: string; lastmod?: Date };

const iso = (d: Date) => d.toISOString().slice(0, 10);
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** lastmod: `revised`, else `date`. */
export const lastmod = (d: { revised?: Date; date?: Date }) => d.revised ?? d.date;

export function sitemapResponse(urls: SitemapUrl[]) {
  const seen = new Set<string>();
  const body = urls
    .filter((u) => (seen.has(u.loc) ? false : (seen.add(u.loc), true)))
    .map((u) =>
      u.lastmod
        ? `  <url><loc>${esc(u.loc)}</loc><lastmod>${iso(u.lastmod)}</lastmod></url>`
        : `  <url><loc>${esc(u.loc)}</loc></url>`
    );
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...body,
    '</urlset>',
    '',
  ].join('\n');
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
