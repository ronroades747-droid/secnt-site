// Site-wide configuration and URL helpers — one source of truth for identity
// strings, navigation, and the URL scheme.
//
// The URL scheme mirrors the content tree (path-owns-identity): a commentary
// entry's id IS its path under /commentary/, so URL derivation is just
// prefix + id + trailing slash. No hand-maintained path tables.

import { commentaryPdfName } from './commentary-pdf.mjs';

export const SITE = {
  wordmark: 'SECNT',
  // The locked, substantive series name is "Systematic Evangelical" (see
  // about.md §2, where the three-word claim is load-bearing) — NOT the
  // "Scholars Exegetical" wording in the older May 28 project instructions
  // and the astro.config comment. Identity strings use the substantive name.
  name: 'Systematic Evangelical Commentaries on the New Testament',
  author: 'Ronald E. Roades',
  origin: 'https://secnt.org',
  licenseName: 'CC BY 4.0',
  licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
  // Bunny Stream pull-zone library id (the GUID per video lives in lecture
  // frontmatter as bunnyVideoId). Set this once.
  bunnyLibraryId: '672956',
  banner: {
    src: '/banner.jpg',
    alt: 'An ancient library with scrolls in wooden shelving, classical columns, warm lamps, scholars at study, light from an arched doorway in the distance.',
  },
};

// Content first (Web Dev Ask "The site refocused on the written record",
// §4.3, Release B). Teaching Aids left the navigation with the /slides/ pages.
export const NAV = [
  { label: 'Commentaries', href: '/commentary/' },
  { label: 'Articles', href: '/articles/' },
  { label: 'About', href: '/about/' },
  { label: 'Methodology', href: '/methodology/' },
  { label: 'Architecture Principles', href: '/architecture-principles/' },
  { label: 'Citing', href: '/citing/' },
];

// --- Sections-sidebar segment grouping -------------------------------------
// June 6, 2026 navigation handoff, Change 4. Dev decision recorded: grouping
// derives from a sectionType → segment mapping (option a) — the schema's
// type vocabulary maps cleanly onto the segments for this unit and is expected
// to for future units. If a future unit breaks the mapping, switch to an
// optional `segment` frontmatter field on the stubs (option b); either way
// Production authors nothing — grouping derives from Dev-owned frontmatter.
export const SEGMENT_ORDER = [
  'Introduction',
  'The Text',
  'Architecture',
  'Exegesis',
  'Theology',
  'Engagement & Pastoral Close',
] as const;

export const SEGMENT_OF: Record<string, (typeof SEGMENT_ORDER)[number]> = {
  'unit-landing': 'Introduction',
  'text-critical': 'The Text',
  framing: 'Architecture',
  exegesis: 'Exegesis',
  synthesis: 'Exegesis', // Exegesis segment spans exegesis + synthesis types
  theology: 'Theology',
  engagement: 'Engagement & Pastoral Close',
  pastoral: 'Engagement & Pastoral Close',
};

// --- URL helpers ---------------------------------------------------------
// commentary id is e.g. "john/1-1-to-3" or "john/1-1-to-3/06-en-arche".
export const commentaryUrl = (id: string) => `/commentary/${id}/`;
export const volumeUrl = (book: string) => `/commentary/${book}/`;
export const frontmatterUrl = (id: string) => `/${id}/`;
// An article id is its slug under /articles/ (path-owns-identity, same as
// commentary).
export const articleUrl = (id: string) => `/articles/${id}/`;
// The paired lecture's thumbnail: Slide 1 of that lecture's deck, which
// already exists for every pair in the corpus at
// Volumes/<Vol>/Cycles/<Cycle>/Diptychs/<NN-slug>/Slide1.PNG and is copied
// into public/lectures/ at the pair's media commit, downscaled.
//
// The path derives from the entry's id, so there is no per-entry frontmatter field to drift and
// nothing to backfill but the files themselves. The id already contains the
// book and unit (john/1-6-to-13/08-co-articulation), so it lays the tree out
// under /lectures/ exactly as the content tree lays it out.
//
// Since Release B no page shows it: the Triptych panel and the home-page
// cards that did are gone. The files stay in public/lectures/ because Release
// D's share image uses them (Ask §6, item 3), and this helper names them.
export const lectureThumbUrl = (sectionId: string) => `/lectures/${sectionId}.png`;

// A quotation card's page and its two served images (content.config.ts, the
// cards collection). Names derive from the id: the
// 1080 square is shown on the pages, the 2048 original is the download.
export const cardUrl = (id: string) => `/cards/${id}/`;
export const cardImageUrl = (id: string, size: 'web' | 'full' = 'web') =>
  size === 'full' ? `/cards/${id}/${id}-2048.jpg` : `/cards/${id}/${id}.jpg`;

// A commentary page's PDF, printed from the built page at every Cloudflare
// build and never committed (see src/lib/commentary-pdf.mjs, which writes the
// file under this same name). It sits beside the page, named from the id:
// /commentary/john/1-1-to-3/06-en-arche/john-1-1-to-3-06-en-arche.pdf.
export const commentaryPdfUrl = (id: string) =>
  `${commentaryUrl(id)}${commentaryPdfName(id)}`;
// A lecture lives on the lecture site, podcast.secnt.org, at its section's id
// (Release B, Ask §4.1; the episode path is podcast/lib/episodes.ts's
// episodePath). secnt.org's own /lecture/ pages are gone, and each old address
// redirects here (src/pages/[redirects].ts).
export const LECTURE_SITE = 'https://podcast.secnt.org';
export const lectureUrl = (sectionId: string) => `${LECTURE_SITE}/${sectionId}/`;

// Some reference ids carry a trailing "/index" (the unit-landing lecture stub
// does). Normalize so getEntry lookups resolve against the real entry id.
export const normalizeId = (id: string) => id.replace(/\/index$/, '');

// Split a commentary id into route params. section is undefined for the
// unit-landing entry (id has only book/unit).
export function splitCommentaryId(id: string) {
  const [book, unit, section] = id.split('/');
  return { book, unit, section };
}

// Absolute canonical URL for a pathname.
export const canonical = (pathname: string) =>
  new URL(pathname, SITE.origin).href;

// Reader-facing date form for the page-foot publication/revision line, per the
// Publication & Revision Dates standard: month spelled, e.g. "3 June 2026".
// Formatted in UTC so a date-only frontmatter value (parsed as UTC midnight)
// never renders one day off in a negative-offset build/runtime timezone.
export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

// Visibility gate for draft staging:
//   dev               -> show everything
//   preview build     -> set SECNT_SHOW_DRAFTS=1 to show drafts
//   production build  -> published entries only
const showDrafts = process.env.SECNT_SHOW_DRAFTS === '1';
export const isVisible = (entry: { data: { draft?: boolean } }) =>
  !import.meta.env.PROD || showDrafts ? true : !entry.data.draft;

// Visibility for a quotation card. A card has no flip of its own: it is live
// exactly when the commentary section it names is live, so one flip of the
// section's `draft` publishes the page and its cards together (the rule D47
// sec 3 set for the teaching aids, kept for the cards that replaced them).
// `section` is the resolved commentary entry, or undefined when the reference
// points at an entry the caller did not load — the card then stays hidden,
// which is the safe direction.
export const isCardVisible = (section: { data: { draft?: boolean } } | undefined) => {
  if (!import.meta.env.PROD || showDrafts) return true;
  return section ? isVisible(section) : false;
};

// Normalize the commentary `diagram` field to an array. The field is either a
// single diagram object (the common case, and every Cycle-1 page) or an array
// of them (a page carrying several — Jn 1:4–5 §4.1 and §5.4). Consumers — the
// section and unit-landing templates, and remark-diagram-anchor — call this so
// they can treat the one-and-many cases uniformly. Order is preserved.
export type DiagramField = {
  src: string;
  alt: string;
  caption?: string;
  position?: 'top' | 'bottom' | 'anchor';
};
export const asDiagrams = (
  d: DiagramField | DiagramField[] | undefined | null
): DiagramField[] => (d == null ? [] : Array.isArray(d) ? d : [d]);
