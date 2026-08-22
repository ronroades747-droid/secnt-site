// The 45 slide-page slugs of the Jn 1:1–3 run — frozen, and checked at build.
//
// A slide entry's id IS its public URL (`/slides/<id>/`) and IS its served
// asset path (`/slides/<id>/<id>-16x9.jpg`), and from first publish that URL
// is baked into a QR code that is already generated and placed. It can never
// change (Decision 6, 19 Aug 2026; the route header says the same). The risk
// is not a deliberate rename — it is a quiet one: the slides loader strips an
// `^\d+-` run-order prefix from the filename, and any prefix the pattern
// misses (`4-` where `04-` was meant) stays in the id and re-points that
// page's code at a 404 without failing anything.
//
// So this list is the independent check. It is not derived from the
// filenames; it is the set of slugs the codes encode. assertSlideIds() turns
// any drift into a build failure, and a broken build never deploys — the
// prior deploy keeps serving.
//
// Order below is the first-run publication order (Shorts Subject Index,
// Editor-approved 19 Aug 2026), the same number the filenames and the corpus
// short folders carry. Order here is documentation; the assertion compares
// sets, so re-sequencing the run does not touch this file — only adding or
// retiring a slide page does.
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
  'creed-line-you-already-say', // 15
  'article-present-then-withheld', // 16
  'through-him-then-in-him', // 17
  'made-not-let-go', // 18
  'communion-god-is', // 19
  'older-than-any-book', // 20
  'verse-1-answered-at-verse-18', // 21
  'nicaea-confessed-it', // 22
  'two-orders-of-existence', // 23
  'not-against-the-gnostics', // 24
  'no-demiurge-to-blame', // 25
  'three-shining-around-me', // 26
  'the-word-retires', // 27
  'agent-not-instrument', // 28
  'verb-john-refused', // 29
  'one-sentence-both-heresies', // 30
  'a-god-on-malta', // 31
  'the-fathers-exegete', // 32
  'eternity-not-endless-time', // 33
  'old-idiom-new-agent', // 34
  'no-sending-without-distinction', // 35
  'two-greek-nothings', // 36
  'answered-with-a-tense', // 37
  'revelation-rests-on-creation', // 38
  'one-letter-not-the-iota', // 39
  'spine-of-the-prologue', // 40
  'aseity-is-a-denial', // 41
  'being-and-becoming', // 42
  'calvins-autotheos', // 43
  'one-choice-two-architectures', // 44
  'same-hands', // 45
];

// Fails the build if the ids the loader produced are not exactly SLIDE_IDS.
// Called from the /slides/ route's getStaticPaths, on the unfiltered
// collection, so drafts are checked too — a stub's id is baked into a code
// long before its page goes live.
//
// Adding or retiring a slide page is a deliberate act: add or remove the slug
// here in the same commit, and say in the message which code it answers to.
export function assertSlideIds(ids: readonly string[]): void {
  const expected = new Set(SLIDE_IDS);
  const found = new Set(ids);
  const missing = SLIDE_IDS.filter((id) => !found.has(id));
  const unexpected = [...found].filter((id) => !expected.has(id)).sort();
  const duplicated = ids.filter((id, i) => ids.indexOf(id) !== i).sort();
  if (missing.length === 0 && unexpected.length === 0 && duplicated.length === 0) return;
  const lines = [
    `Slide ids do not match the ${SLIDE_IDS.length} QR-baked slugs in src/lib/slide-ids.ts.`,
    'A slide id is its published URL and its asset path; a changed id points a',
    'placed QR code at a 404. Check the NN- filename prefixes and the',
    "`generateId` strip in content.config.ts before touching this list.",
  ];
  if (missing.length) lines.push(`  expected but not found: ${missing.join(', ')}`);
  if (unexpected.length) lines.push(`  found but not expected: ${unexpected.join(', ')}`);
  if (duplicated.length) lines.push(`  produced more than once: ${duplicated.join(', ')}`);
  throw new Error(lines.join('\n'));
}
