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
  { label: 'Commentary', href: '/commentary/' },
  { label: 'Articles', href: '/articles/' },
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

// Visibility gate for draft staging:
//   dev               -> show everything
//   preview build     -> set SECNT_SHOW_DRAFTS=1 to show drafts
//   production build  -> published entries only
const showDrafts = process.env.SECNT_SHOW_DRAFTS === '1';
export const isVisible = (entry: { data: { draft?: boolean } }) =>
  !import.meta.env.PROD || showDrafts ? true : !entry.data.draft;
