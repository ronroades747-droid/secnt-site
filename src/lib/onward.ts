// Release D (Web Dev Ask "The site refocused on the written record", §6–§7;
// the Editor's rulings 23 and 24 of 12 Nov 2026). One place for what a
// commentary page says about where it stands in the volume, so the title,
// the Next link, the foot pager, the "same question" links, the related
// articles, the sitemap and the feeds cannot disagree.
//
// EVERYTHING HERE IS DERIVED FROM THE COLLECTIONS AND GATED BY isVisible.
// A draft is never linked, and a version page (the `versions` collection) is
// never read here at all, so neither can enter any onward link.
import { getCollection } from 'astro:content';
import { commentaryUrl, articleUrl, volumeUrl, isVisible } from './site';

type Entry = any; // a commentary entry

// --- Verses -----------------------------------------------------------------
/**
 * The verses a commentary page covers, for its title (ruling 23, measure 2):
 * the section's own `verseStart`/`verseEnd` where given, else the unit's
 * `passageRef`. "1:14–18", "1:1".
 */
export function pageVerses(d: {
  chapter: number;
  passageRef: string;
  verseStart?: number;
  verseEnd?: number;
}) {
  if (d.verseStart == null) return d.passageRef;
  const end = d.verseEnd != null && d.verseEnd !== d.verseStart ? `–${d.verseEnd}` : '';
  return `${d.chapter}:${d.verseStart}${end}`;
}

/**
 * The verse-led title, "John 1:14–18 · The Text: …" (ruling 23, measure 2).
 * English leads and the Greek in the page title stays. BaseHead appends
 * " — SECNT" for the <title>.
 */
export const verseLedTitle = (bookDisplay: string, d: Parameters<typeof pageVerses>[0] & { title: string }) =>
  `${bookDisplay} ${pageVerses(d)} · ${d.title}`;

// --- The volume, unit by unit ------------------------------------------------
export type Unit = {
  id: string; // e.g. john/1-4-to-5
  landing: Entry;
  pages: Entry[]; // the landing, then published sections by sectionNumber
  complete: boolean; // the landing's passageComplete
};

export type Volume = { book: string; bookDisplay: string; title: string; units: Unit[] };

let cache: Map<string, Volume> | null = null;

/** Every published volume, its published units in the order of the text. */
async function volumes() {
  if (cache) return cache;
  const commentary = (await getCollection('commentary')).filter(isVisible);
  const vols = (await getCollection('volumes')).filter(isVisible);
  cache = new Map();
  for (const v of vols) {
    const book = v.data.book;
    const units: Unit[] = commentary
      .filter((e) => e.data.sectionType === 'unit-landing' && e.data.book === book)
      .sort(
        (a, b) =>
          a.data.chapter - b.data.chapter ||
          (a.data.verseStart ?? 0) - (b.data.verseStart ?? 0) ||
          a.id.localeCompare(b.id)
      )
      .map((landing) => ({
        id: landing.id,
        landing,
        pages: [
          landing,
          ...commentary
            .filter((e) => e.id.startsWith(landing.id + '/'))
            .sort((a, b) => a.data.sectionNumber - b.data.sectionNumber),
        ],
        complete: landing.data.passageComplete === true,
      }));
    cache.set(book, { book, bookDisplay: v.data.bookDisplay, title: v.data.title, units });
  }
  return cache;
}

export async function getVolume(book: string) {
  return (await volumes()).get(book) ?? null;
}

/** Every published commentary page in reading order, with its volume. */
export async function readingOrder() {
  const out: { entry: Entry; volume: Volume }[] = [];
  for (const v of (await volumes()).values()) {
    for (const u of v.units) for (const p of u.pages) out.push({ entry: p, volume: v });
  }
  return out;
}

// --- Onward from a page --------------------------------------------------------
export type Link = { url: string; label: string };

export type Onward =
  // the next published page in the same unit
  | { kind: 'page'; next: Link }
  // the unit's last published page: on to the next unit's landing (ruling
  // 24, measure 3). Given whenever a later unit is published, whether or not
  // this unit is marked complete, so the reader at the end of what is
  // published always has somewhere to go.
  | { kind: 'unit'; next: Link }
  // the Volume's last page, its last unit complete: the Volume contents and
  // the Articles (ruling 24, measure 3)
  | { kind: 'volume'; contents: Link; articles: Link | null }
  // the last published page of an unfinished last unit: "More to come"
  | { kind: 'more' }
  | { kind: 'none' };

const unitLabel = (v: Volume, u: Unit) =>
  `${v.bookDisplay} ${u.landing.data.passageRef} · ${u.landing.data.title}`;

export async function onwardFrom(pageId: string): Promise<Onward> {
  const book = pageId.split('/')[0];
  const v = await getVolume(book);
  if (!v) return { kind: 'none' };
  const ui = v.units.findIndex((u) => pageId === u.id || pageId.startsWith(u.id + '/'));
  if (ui < 0) return { kind: 'none' };
  const unit = v.units[ui];
  const pi = unit.pages.findIndex((p) => p.id === pageId);
  if (pi < 0) return { kind: 'none' };

  const nextPage = unit.pages[pi + 1];
  if (nextPage) {
    return {
      kind: 'page',
      next: {
        url: commentaryUrl(nextPage.id),
        label: nextPage.data.sectionType === 'unit-landing' ? 'Introduction' : nextPage.data.title,
      },
    };
  }
  const nextUnit = v.units[ui + 1];
  if (nextUnit) {
    return { kind: 'unit', next: { url: commentaryUrl(nextUnit.id), label: unitLabel(v, nextUnit) } };
  }
  if (!unit.complete) return { kind: 'more' };
  const hasArticles = (await getCollection('articles')).some((a) => !a.id.includes('/') && isVisible(a));
  return {
    kind: 'volume',
    contents: { url: volumeUrl(book), label: v.title },
    articles: hasArticles ? { url: '/articles/', label: 'Articles' } : null,
  };
}

// --- The same question in the other units --------------------------------------
// Ruling 24, measure 4: each The Text, Engagement with Prior Scholarship and
// Pastoral Hearing page links to its counterparts in the other units of its
// volume, derived from `sectionType`. Ruling 24's sixth measure (chosen links
// between exegesis and theology pages) is later work and is not built.
export const SAME_QUESTION_TYPES = ['text-critical', 'engagement', 'pastoral'] as const;

export async function sameQuestion(page: Entry): Promise<Link[]> {
  const type = page.data.sectionType;
  if (!(SAME_QUESTION_TYPES as readonly string[]).includes(type)) return [];
  const v = await getVolume(page.data.book);
  if (!v) return [];
  const out: Link[] = [];
  for (const u of v.units) {
    if (page.id.startsWith(u.id + '/')) continue;
    for (const p of u.pages) {
      if (p.data.sectionType === type) {
        out.push({ url: commentaryUrl(p.id), label: `${v.bookDisplay} ${u.landing.data.passageRef} · ${p.data.title}` });
      }
    }
  }
  return out;
}

// --- Articles and the passages they bear on ---------------------------------------
// Ruling 24, measure 5. An article names the passages it bears on in its
// optional `passages` field, as commentary unit ids ("john/1-14-to-18").
// Each published commentary page in those passages shows "Related article:
// …", and the article page lists those passages in return. The thesis's
// value is empty by the Editor's ruling of 14 Nov 2026 ("none for now").

/** Published articles naming the unit this page belongs to. */
export async function relatedArticles(pageId: string): Promise<Link[]> {
  const unitId = pageId.split('/').slice(0, 2).join('/');
  return (await getCollection('articles'))
    .filter((a) => !a.id.includes('/') && isVisible(a))
    .filter((a) => (a.data.passages ?? []).some((p: { id: string }) => p.id === unitId))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
    .map((a) => ({ url: articleUrl(a.id), label: a.data.title }));
}

/** The published passages an article names, as links to their pages. */
export async function articlePassages(refs: { id: string }[] = []): Promise<{ unit: Link; pages: Link[] }[]> {
  const passages = refs.map((r) => r.id);
  const known = new Set((await getCollection('commentary')).filter((e) => e.data.sectionType === 'unit-landing').map((e) => e.id));
  for (const p of passages) {
    if (!known.has(p)) throw new Error(`An article's passages names "${p}", which is not a commentary unit landing (e.g. john/1-14-to-18).`);
  }
  const out: { unit: Link; pages: Link[] }[] = [];
  for (const v of (await volumes()).values()) {
    for (const u of v.units) {
      if (!passages.includes(u.id)) continue;
      out.push({
        unit: { url: commentaryUrl(u.id), label: unitLabel(v, u) },
        pages: u.pages.slice(1).map((p) => ({ url: commentaryUrl(p.id), label: p.data.title })),
      });
    }
  }
  return out;
}
