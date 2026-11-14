// The record of a page (Release C, Ask §5): its dated versions, and the
// citation its "Cite this page" block gives. One place, so the block, the
// Versions list, the version pages and the Scholar tags cannot disagree.
//
// Versions come from the `versions` collection, which src/lib/versions.mjs
// generates from the Git history at every build (never kept as files).
import { getCollection } from 'astro:content';
import { SITE, formatDate } from './site';

export type Kind = 'commentary' | 'articles';

/** A version's address: <page URL>v/<YYYY-MM-DD>/ (ruling 15). */
export const versionUrl = (kind: Kind, pageId: string, date: string) =>
  `/${kind}/${pageId}/v/${date}/`;

/** "2026-11-12" → "12 November 2026", in UTC like every date on the site. */
export const formatIsoDate = (iso: string) => formatDate(new Date(`${iso}T00:00:00Z`));

export type Version = { date: string; url: string; entry: any };

/** Every dated version of a page, oldest first. */
export async function pageVersions(kind: Kind, pageId: string): Promise<Version[]> {
  const prefix = `${kind}/${pageId}/v/`;
  return (await getCollection('versions'))
    .filter((v) => v.id.startsWith(prefix) && !v.id.slice(prefix.length).includes('/'))
    .map((v) => {
      const date = v.id.slice(prefix.length);
      return { date, url: versionUrl(kind, pageId, date), entry: v };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Split a version entry's id into its kind, page id and date. */
export function parseVersionId(id: string) {
  const m = /^(commentary|articles)\/(.+)\/v\/(\d{4}-\d{2}-\d{2})$/.exec(id);
  return m ? { kind: m[1] as Kind, pageId: m[2], date: m[3] } : null;
}

const esc = (t: string) =>
  t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** "Commentary on the Prologue of John" → "SECNT: Prologue of John". */
const shortVolume = (volumeTitle: string) =>
  `SECNT: ${volumeTitle.replace(/^Commentary on (the )?/i, '')}`;

export type Citation = { full: string; short?: string };

/**
 * The forms of the Citing page (§8, items (d) and (h); the Editor's approval
 * of 12 Nov 2026), filled in. HTML, with titles of works in <em>.
 */
export function cite(
  args:
    | { kind: 'commentary'; volumeTitle: string; passage: string; title: string; date: string; url: string }
    | { kind: 'articles'; title: string; origin?: string; date: string; url: string }
): Citation {
  const date = formatIsoDate(args.date);
  const url = new URL(args.url, SITE.origin).href;
  if (args.kind === 'commentary') {
    return {
      full:
        `Roades, Ronald E., ed. <em>${esc(args.volumeTitle)}</em>, on ${esc(args.passage)}: ` +
        `“${esc(args.title)}.” ${esc(SITE.name)}. Version of ${date}. ${esc(url)}.`,
      short: `Roades, ed., <em>${esc(shortVolume(args.volumeTitle))}</em>, on ${esc(args.passage)} (version of ${date}).`,
    };
  }
  const origin = args.origin ? ` ${esc(args.origin.replace(/\.?$/, '.'))}` : '';
  return {
    full: `Roades, Ronald E. “${esc(args.title)}.”${origin} ${esc(SITE.name)}. Version of ${date}. ${esc(url)}.`,
  };
}

/** An article's origin for its citation: the provenance before any " · ". */
export const articleOrigin = (provenance?: string) =>
  provenance ? provenance.split(' · ')[0].trim() : undefined;
