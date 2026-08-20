// Site-wide configuration and URL helpers — one source of truth for identity
// strings, navigation, and the URL scheme.
//
// The URL scheme mirrors the content tree (path-owns-identity): a commentary
// entry's id IS its path under /commentary/, so URL derivation is just
// prefix + id + trailing slash. No hand-maintained path tables.

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
  // GoatCounter site code — analytics for the whole site (pageviews) and the
  // Teaching Aids download events (downloads headline, views never — Shorts
  // Program Plan D18). The dashboard is https://<code>.goatcounter.com; QR
  // scans arrive with ?q and are recorded as a distinct path (see BaseLayout).
  // Editor's ruling 19 Aug 2026 (GoatCounter over Cloudflare Web Analytics).
  goatcounter: 'secnt',
  banner: {
    src: '/banner.jpg',
    alt: 'An ancient library with scrolls in wooden shelving, classical columns, warm lamps, scholars at study, light from an arched doorway in the distance.',
  },
};

export const NAV = [
  { label: 'About', href: '/about/' },
  { label: 'Architecture Principles', href: '/architecture-principles/' },
  { label: 'Methodology', href: '/methodology/' },
  { label: 'Citing', href: '/citing/' },
  { label: 'Commentaries', href: '/commentary/' },
  { label: 'Articles', href: '/articles/' },
  { label: 'Teaching Aids', href: '/slides/' },
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
// Teaching Aids (shorts resource pages) — one namespace under /slides/: the
// landing at /slides/, cycle indexes and slide pages both directly beneath
// (/slides/john-1-1-to-3/, /slides/<slug>/). Slide-page URLs are the locked,
// QR-baked, citation-stable tier (Decision 6, 19 Aug 2026): they are printed
// into published video and can never be re-pointed. Web Dev owns slug
// uniqueness across the shared namespace at stub creation.
export const slideUrl = (id: string) => `/slides/${id}/`;
export const slideCycleUrl = (id: string) => `/slides/${id}/`;
// Served slide assets live in public/slides/<slug>/ beside the page route,
// named from the slug — stable download URLs, nothing per-entry to drift.
// JPG: the slide generators (Seedream / Nano Banana Pro) emit JPG, and for
// photographic-style imagery JPG serves smaller at identical quality; the
// 9:16 is the QR-composited frame, exported at quality >= 90 so the code
// stays scan-clean. (Editor, 20 Aug 2026.)
export const slideAssetUrl = (id: string, ratio: '16x9' | '9x16') =>
  `/slides/${id}/${id}-${ratio}.jpg`;
// A lecture lives at its paired section's URL + "lecture/".
export const lectureUrl = (sectionId: string) =>
  `/commentary/${sectionId}/lecture/`;

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
