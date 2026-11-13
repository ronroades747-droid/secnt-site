// The video podcast feed (Ask §3.2; ruling 8): one feed, every published
// lecture, each episode's enclosure its Bunny MP4 at 720p, generated at build
// from the same episode list as the pages. There is no audio-only feed.
//
// Apple's requirements this answers: RSS 2.0 with the itunes namespace; show
// title, description, author, language, category, explicit flag and square
// artwork; per episode a unique guid, title, pubDate, enclosure with its
// url, byte length and type, and duration. Serial show type, with each unit
// a season and each lecture numbered within it, so apps play the lectures in
// canonical order rather than newest first.
//
// The show's artwork and owner email are held in PODCAST (lib/episodes.ts);
// see the notes there on the placeholder cover.
import type { APIRoute } from 'astro';
import { SITE } from '../../src/lib/site';
import {
  PODCAST,
  getEpisodes,
  podcastUrl,
  commentaryHref,
  mp4Url,
  durationSeconds,
} from '../lib/episodes';
import { mp4Length } from '../lib/mp4';

const esc = (s: string) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

export const GET: APIRoute = async () => {
  if (PODCAST.coverIsPlaceholder) {
    console.warn(
      '[podcast] feed carries the PLACEHOLDER cover — for the phone test only; ' +
        'replace it before submitting to Apple Podcasts or Pocket Casts (Gate 5, ruling 4).'
    );
  }
  const { episodes } = await getEpisodes();
  const lengths = await Promise.all(
    episodes.map((e) => mp4Length(e.lecture.data.bunnyVideoId, e.lecture.data.title))
  );
  const latest = episodes.reduce(
    (max, e) => Math.max(max, e.lecture.data.date.valueOf()),
    0
  );
  const showUrl = podcastUrl('/');
  const feedUrl = podcastUrl('/feed.xml');
  const year = new Date().getFullYear();

  const items = episodes.map((e, i) => {
    const l = e.lecture.data;
    const url = podcastUrl(e.path);
    const commentary = commentaryHref(e.sectionId);
    const secs = durationSeconds(l.duration);
    const plain =
      `${e.passageLabel} · Lecture ${e.numberInUnit} of the ${e.unit.passageLabel} unit.` +
      (l.description ? ` ${l.description}` : '') +
      ` Read the commentary: ${commentary}`;
    const html =
      `<p>${esc(e.passageLabel)} · Lecture ${e.numberInUnit} of the ${esc(e.unit.passageLabel)} unit.</p>` +
      (l.description ? `<p>${esc(l.description)}</p>` : '') +
      `<p><a href="${esc(commentary)}">Read the commentary: ${esc(e.section.data.title)}</a></p>` +
      `<p><a href="${esc(url)}">Watch on the lecture site</a></p>`;
    return [
      '    <item>',
      // The passage leads every episode title (Gate 5, ruling 6): four
      // lectures share "Introduction: Framing and Orientation", and an app's
      // list shows the title alone.
      `      <title>${esc(`${e.passageLabel} · ${l.title}`)}</title>`,
      `      <link>${esc(url)}</link>`,
      `      <guid isPermaLink="false">${esc(url)}</guid>`,
      `      <pubDate>${l.date.toUTCString()}</pubDate>`,
      `      <description>${cdata(plain)}</description>`,
      `      <content:encoded>${cdata(html)}</content:encoded>`,
      `      <enclosure url="${esc(mp4Url(l.bunnyVideoId))}" length="${lengths[i]}" type="video/mp4"/>`,
      secs ? `      <itunes:duration>${secs}</itunes:duration>` : null,
      `      <itunes:season>${e.unit.number}</itunes:season>`,
      `      <itunes:episode>${e.numberInUnit}</itunes:episode>`,
      `      <itunes:episodeType>full</itunes:episodeType>`,
      `      <itunes:explicit>false</itunes:explicit>`,
      '    </item>',
    ]
      .filter(Boolean)
      .join('\n');
  });

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    // A readable page when the feed is opened in a browser (Gate 5, 13 Nov
    // 2026); podcast apps ignore it. See public/feed.xsl.
    '<?xml-stylesheet type="text/xsl" href="/feed.xsl"?>',
    '<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${esc(PODCAST.title)}</title>`,
    `    <link>${esc(showUrl)}</link>`,
    `    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml"/>`,
    `    <language>${PODCAST.language}</language>`,
    `    <copyright>${esc(`© ${year} ${SITE.author}. Licensed under ${SITE.licenseName}: ${SITE.licenseUrl}`)}</copyright>`,
    `    <description>${cdata(PODCAST.description)}</description>`,
    `    <itunes:summary>${cdata(PODCAST.description)}</itunes:summary>`,
    `    <itunes:author>${esc(PODCAST.author)}</itunes:author>`,
    `    <itunes:owner>`,
    `      <itunes:name>${esc(PODCAST.author)}</itunes:name>`,
    `      <itunes:email>${esc(PODCAST.ownerEmail)}</itunes:email>`,
    `    </itunes:owner>`,
    `    <itunes:image href="${esc(podcastUrl(PODCAST.cover))}"/>`,
    `    <image><url>${esc(podcastUrl(PODCAST.cover))}</url><title>${esc(PODCAST.title)}</title><link>${esc(showUrl)}</link></image>`,
    `    <itunes:category text="Religion &amp; Spirituality">`,
    `      <itunes:category text="Christianity"/>`,
    `    </itunes:category>`,
    `    <itunes:explicit>false</itunes:explicit>`,
    `    <itunes:type>serial</itunes:type>`,
    latest ? `    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>` : null,
    ...items,
    '  </channel>',
    '</rss>',
    '',
  ]
    .filter((x) => x !== null)
    .join('\n');

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
};
