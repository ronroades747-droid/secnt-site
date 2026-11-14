// The two reader feeds (Release D, Ask §7, measure 6; the Editor's ruling 25
// of 12 Nov 2026, and of 14 Nov 2026: RSS 2.0 at /feed.xml and
// /articles/feed.xml). They are feeds for feed readers and aggregators, not
// podcast feeds: the lecture site's podcast feed (podcast/pages/feed.xml.ts)
// is a different thing and is unchanged.
//
//   New on SECNT  /feed.xml           every published commentary page and
//                                     every published article
//   SECNT Articles /articles/feed.xml  the articles only
//
// Each entry carries its title, its passage (commentary) or provenance
// (article), its date and its description. Entries run newest first by their
// publication `date`, as the home page's Latest strip does; commentary pages
// of the same day run latest in reading order first.
//
// Generated at build from the collections and gated by isVisible, so a draft
// never appears. The `versions` collection is never read, so no version page
// can enter a feed; nor can a redirect, which is not a page at all.
import { getCollection } from 'astro:content';
import { SITE, canonical, articleUrl, commentaryUrl, isVisible } from './site';
import { readingOrder, verseLedTitle } from './onward';

// Feed titles and descriptions. The descriptions are the home page's and
// the Articles page's own meta descriptions.
export const FEEDS = {
  all: {
    path: '/feed.xml',
    title: `New on ${SITE.wordmark}`,
    description:
      'Verse-by-verse commentary on the New Testament at the systematic-theological register, and scholarly articles in the field. Freely available under CC BY 4.0.',
    home: '/',
  },
  articles: {
    path: '/articles/feed.xml',
    title: `${SITE.wordmark} Articles`,
    description: 'Scholarly articles published in the Systematic Evangelical Commentaries on the New Testament.',
    home: '/articles/',
  },
} as const;

export type FeedItem = {
  title: string;
  url: string; // site-absolute path
  date: Date;
  description: string;
  /** The passage ("John 1:14–18") or the provenance of an article. */
  label?: string;
  /** Lead the description with the label (an article's provenance; a
   *  commentary entry's passage already leads its title). */
  labelInDescription?: boolean;
  order: number; // tie-break, larger first
};

export async function commentaryItems(): Promise<FeedItem[]> {
  return (await readingOrder()).map(({ entry, volume }, i) => ({
    title: verseLedTitle(volume.bookDisplay, entry.data),
    url: commentaryUrl(entry.id),
    date: entry.data.date,
    description: entry.data.description,
    label: `${volume.bookDisplay} ${entry.data.passageRef}`,
    order: i,
  }));
}

export async function articleItems(): Promise<FeedItem[]> {
  return (await getCollection('articles'))
    .filter((a) => !a.id.includes('/') && isVisible(a))
    .map((a) => ({
      title: a.data.title,
      url: articleUrl(a.id),
      date: a.data.date,
      description: a.data.description,
      label: a.data.provenance,
      labelInDescription: true,
      order: 0,
    }));
}

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export function rss(feed: (typeof FEEDS)[keyof typeof FEEDS], items: FeedItem[]) {
  const sorted = [...items].sort((a, b) => b.date.valueOf() - a.date.valueOf() || b.order - a.order);
  const latest = sorted[0]?.date;
  const year = new Date().getFullYear();
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    // A readable page when the feed is opened in a browser; feed readers
    // ignore it (public/feed.xsl, on the lecture feed's precedent).
    '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    '  <channel>',
    `    <title>${esc(feed.title)}</title>`,
    `    <link>${esc(canonical(feed.home))}</link>`,
    `    <atom:link href="${esc(canonical(feed.path))}" rel="self" type="application/rss+xml"/>`,
    `    <description>${esc(feed.description)}</description>`,
    '    <language>en</language>',
    `    <copyright>${esc(`© ${year} ${SITE.author}. Licensed under ${SITE.licenseName}: ${SITE.licenseUrl}`)}</copyright>`,
    latest ? `    <lastBuildDate>${latest.toUTCString()}</lastBuildDate>` : null,
    ...sorted.map((it) => {
      const url = canonical(it.url);
      return [
        '    <item>',
        `      <title>${esc(it.title)}</title>`,
        `      <link>${esc(url)}</link>`,
        `      <guid isPermaLink="true">${esc(url)}</guid>`,
        `      <pubDate>${it.date.toUTCString()}</pubDate>`,
        `      <dc:creator>${esc(SITE.author)}</dc:creator>`,
        it.label ? `      <category>${esc(it.label)}</category>` : null,
        `      <description>${esc(it.label && it.labelInDescription ? `${it.label} — ${it.description}` : it.description)}</description>`,
        '    </item>',
      ]
        .filter((x) => x !== null)
        .join('\n');
    }),
    '  </channel>',
    '</rss>',
    '',
  ];
  return new Response(lines.filter((x) => x !== null).join('\n'), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
