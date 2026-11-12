// The lecture site's one source of episodes: every published lecture, in
// canonical order, derived from the lectures and commentary collections at
// build and never kept by hand (Ask §3.1). The show page, the episode pages,
// their Previous/Next links and the feed all read this list, so they cannot
// disagree about order or numbering.
//
// Canonical order: units in the order of the text (chapter, then first verse
// of the unit landing), and within a unit the landing's lecture first, then
// the section lectures by sectionNumber — the order of the commentary's own
// contents page. Previous/Next run straight through the units (§3.1).
//
// Visibility: a lecture is an episode when it and the commentary entry it
// teaches are both visible by secnt.org's own gate (isVisible), so draft
// staging works here exactly as it does there.
import { getCollection } from 'astro:content';
import { SITE, isVisible, normalizeId } from '../../src/lib/site';

export const PODCAST = {
  origin: 'https://podcast.secnt.org',
  // Show identity: the Editor's wording, ruled 12 November 2026 (Gate 5,
  // rulings 2 and 3).
  title: 'SECNT Lectures',
  description:
    'Video lectures from the Systematic Evangelical Commentaries on the New Testament. ' +
    'Each lecture teaches one section of the written Commentary at expositional depth, ' +
    'for pastors, teachers and seminary students, and links to the Commentary it teaches ' +
    'at secnt.org. Free to watch and share under CC BY 4.0, with no advertising.',
  author: SITE.author,
  language: 'en',
  // The show's square cover, 3000 × 3000 (Ask §3.4: Commentary Production
  // makes it). Until it exists the feed carries a plainly marked placeholder,
  // which the Editor allowed for the phone test ONLY (Gate 5, ruling 4): the
  // real cover must replace it before the feed is submitted to Apple Podcasts
  // or Pocket Casts. coverIsPlaceholder makes every build say so in its log.
  cover: '/cover-placeholder.jpg',
  coverIsPlaceholder: true,
  // The owner email directories read from the feed (Gate 5, ruling 5).
  ownerEmail: 'editor@secnt.org',
  // Bunny Stream's pull zone for library SITE.bunnyLibraryId, and the MP4
  // rendition each enclosure uses (720p; Editor's rulings of 26 Sep and
  // 12 Nov 2026).
  bunnyCdnHost: 'vz-6567ecee-051.b-cdn.net',
  rendition: 'play_720p.mp4',
};

export const podcastUrl = (pathname: string) => new URL(pathname, PODCAST.origin).href;

// An episode's page lives at its section's id, mirroring the commentary
// tree (path owns identity): /john/1-1-to-3/06-en-arche/; the unit's
// opening lecture at the unit's own id, /john/1-1-to-3/.
export const episodePath = (sectionId: string) => `/${sectionId}/`;

// The commentary section an episode teaches, on secnt.org.
export const commentaryHref = (sectionId: string) =>
  `${SITE.origin}/commentary/${sectionId}/`;

export const mp4Url = (bunnyVideoId: string) =>
  `https://${PODCAST.bunnyCdnHost}/${bunnyVideoId}/${PODCAST.rendition}`;

// "40:07" or "1:02:03" → seconds; null when absent or the "00:00" placeholder.
export function durationSeconds(d?: string): number | null {
  if (!d) return null;
  const parts = d.split(':').map(Number);
  if (parts.some((n) => !Number.isFinite(n))) return null;
  const s = parts.reduce((acc, n) => acc * 60 + n, 0);
  return s > 0 ? s : null;
}

export type Unit = {
  id: string; // commentary unit id, e.g. john/1-1-to-3
  number: number; // 1-based, in canonical order (the feed's season)
  passageLabel: string; // "John 1:1–3"
  title: string; // the unit landing's title
};

export type Episode = {
  lecture: any; // lectures entry
  section: any; // the commentary entry it teaches
  sectionId: string;
  unit: Unit;
  numberInUnit: number; // "Lecture N" within the unit (the feed's episode)
  passageLabel: string; // the section's own verses where given, else the unit's
  path: string;
  prev: Episode | null;
  next: Episode | null;
};

let cache: { units: Unit[]; episodes: Episode[] } | null = null;

export async function getEpisodes() {
  if (cache) return cache;
  const commentary = await getCollection('commentary');
  const lectures = (await getCollection('lectures')).filter(isVisible);
  const volumes = await getCollection('volumes');
  const byId = new Map(commentary.map((c) => [c.id, c]));
  const lectureFor = new Map(lectures.map((l) => [normalizeId(l.data.sectionRef.id), l]));

  const landings = commentary
    .filter((c) => c.data.sectionType === 'unit-landing' && isVisible(c))
    .sort(
      (a, b) =>
        a.data.chapter - b.data.chapter ||
        (a.data.verseStart ?? 0) - (b.data.verseStart ?? 0) ||
        a.id.localeCompare(b.id)
    );

  const units: Unit[] = [];
  const episodes: Episode[] = [];
  for (const landing of landings) {
    const book = landing.data.book;
    const bookDisplay = volumes.find((v) => v.data.book === book)?.data.bookDisplay ?? book;
    const sections = commentary
      .filter((c) => c.id.startsWith(landing.id + '/') && isVisible(c))
      .sort((a, b) => a.data.sectionNumber - b.data.sectionNumber);
    const taught = [landing, ...sections].filter((c) => lectureFor.has(c.id));
    if (taught.length === 0) continue;

    const unit: Unit = {
      id: landing.id,
      number: units.length + 1,
      passageLabel: `${bookDisplay} ${landing.data.passageRef}`,
      title: landing.data.title,
    };
    units.push(unit);

    taught.forEach((section, i) => {
      const d = section.data;
      const verses =
        d.sectionType !== 'unit-landing' && d.verseStart != null
          ? `${d.chapter}:${d.verseStart}${d.verseEnd != null && d.verseEnd !== d.verseStart ? `–${d.verseEnd}` : ''}`
          : d.passageRef;
      episodes.push({
        lecture: lectureFor.get(section.id),
        section: byId.get(section.id),
        sectionId: section.id,
        unit,
        numberInUnit: i + 1,
        passageLabel: `${bookDisplay} ${verses}`,
        path: episodePath(section.id),
        prev: null,
        next: null,
      });
    });
  }
  episodes.forEach((e, i) => {
    e.prev = episodes[i - 1] ?? null;
    e.next = episodes[i + 1] ?? null;
  });

  cache = { units, episodes };
  return cache;
}
