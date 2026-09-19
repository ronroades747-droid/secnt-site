// The slide-page slugs in the Teaching Aids collection — checked at build.
//
// A slide entry's id IS its public URL (`/slides/<id>/`) and IS its served
// asset path (`/slides/<id>/<id>-16x9.jpg`), and once published that URL is
// citation-stable: it never changes (Decision 6, 19 Aug 2026). The risk is
// not a deliberate rename — it is a quiet one: the slides loader strips an
// `^\d+-` publication-order prefix from the filename, and any prefix the
// pattern misses (`4-` where `04-` was meant) stays in the id and moves the
// page to a URL nothing links to, without failing anything.
//
// So this list is the independent check. It is not derived from the
// filenames. assertSlideIds() turns any drift into a build failure, and a
// broken build never deploys — the prior deploy keeps serving.
//
// PUBLICATION ONE AT A TIME (Editor's ruling, 16 Sep 2026). The run no longer
// has a pre-set calendar. The Editor names each Teaching Aid, with its date,
// when he decides it; Web Dev then creates its file in `src/content/slides/`
// with the next free `NN-` prefix and adds its slug to the END of this list,
// in the same commit. So this list holds exactly the slides that have been
// NAMED — published, or scheduled and not yet live — and nothing else.
//   - Finished pages not yet named sit in `src/content/slides-held/`, outside
//     the collection: not built, not listed, not date-checked, and not here.
//     Naming one moves it back into `slides/` with its prefix and `scheduled`
//     date, and adds its slug here.
//   - Slot 25 (`no-demiurge-to-blame`) was withdrawn to held on the same date,
//     before it went live, so the prefixes run 24, 26 — deliberate.
//   - The empty placeholders for slots 34–45 were removed on the same date;
//     a candidate with no page has no file anywhere until it is named.
//
// Prefix gap at 15/16. Slots 15 and 16 were never uploaded and were moved to
// the tail of the run (ruling of 14 Sep 2026) as `46-`/`47-`; on 16 Sep 2026
// both went to `slides-held/` with the rest of the unnamed pages. The gap in
// the prefixes is deliberate. The corpus still numbers those two shorts 15
// and 16: the prefix here is publication order, the corpus number is the
// short's identity, and for those two they diverge.
//
// The ORDER IS LOAD-BEARING (since 23 Aug 2026): SlideCyclePage sorts the
// cycle index by it rather than by `scheduled`, because two slides can share
// a date. Keep the list in publication order — which, with each new slide
// appended as it is named, is the order it was named in. The assertion below
// compares SETS, so it will not catch an order mistake; the cycle index is
// where one shows.
export const SLIDE_IDS: readonly string[] = [
  'god-was-never-alone', // 01
  'not-even-one', // 02
  'genesis-echo-departs', // 03
  'communion-with-yourself', // 04
  'word-john-didnt-write', // 05
  'was-means-no-beginning', // 06
  'verse-2-drops-the-clause', // 07
  'sentence-your-bible-breaks', // 08
  'the-making-and-the-made', // 09
  'carsons-foyer', // 10
  'foundation-not-capstone', // 11
  'fills-the-room-locks-the-doors', // 12
  'never-the-idiom-of-beside', // 13
  'four-times-was', // 14
  'through-him-then-in-him', // 17
  'made-not-let-go', // 18
  'communion-god-is', // 19
  'older-than-any-book', // 20
  'verse-1-answered-at-verse-18', // 21
  'nicaea-confessed-it', // 22
  'two-orders-of-existence', // 23
  'not-against-the-gnostics', // 24
  'three-shining-around-me', // 26
  'creed-line-you-already-say', // 27 (corpus short 15)
  'one-sentence-both-heresies', // 28 (SS-022)
  'jn1-029', // 29 (SS-027)
];

// Fails the build if the ids the loader produced are not exactly SLIDE_IDS.
// Called from the /slides/ route's getStaticPaths, on the unfiltered
// collection, so drafts are checked too — a named slide's id is fixed from
// the moment it is scheduled, before its page goes live.
//
// Naming or withdrawing a slide page is a deliberate act: add or remove the
// slug here in the same commit as the file.
export function assertSlideIds(ids: readonly string[]): void {
  const expected = new Set(SLIDE_IDS);
  const found = new Set(ids);
  const missing = SLIDE_IDS.filter((id) => !found.has(id));
  const unexpected = [...found].filter((id) => !expected.has(id)).sort();
  const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i).sort();
  if (missing.length === 0 && unexpected.length === 0 && duplicated.length === 0) return;
  const lines = [
    `Slide ids do not match the ${SLIDE_IDS.length} slugs listed in src/lib/slide-ids.ts.`,
    'A slide id is its published URL and its asset path; a changed id moves the',
    'page to a URL nothing links to. Check the NN- filename prefixes and the',
    "`generateId` strip in content.config.ts before touching this list.",
  ];
  if (missing.length) lines.push(`  expected but not found: ${missing.join(', ')}`);
  if (unexpected.length) lines.push(`  found but not expected: ${unexpected.join(', ')}`);
  if (duplicated.length) lines.push(`  produced more than once: ${duplicated.join(', ')}`);
  throw new Error(lines.join('\n'));
}
