# Held Teaching Aids

Finished slide pages that have **not yet been named for publication**.
Publication is one at a time (Editor's ruling, 16 September 2026): the Editor
decides which page publishes next and on what date, and only then does it
enter the Teaching Aids collection.

This folder is **outside** the `slides` collection (its base is
`src/content/slides/`), so nothing here is built, listed on the cycle page,
date-checked, or counted against `src/lib/slide-ids.ts`.

Files are named by bare slug, with no `NN-` prefix and no `scheduled` line.

## The hand-off (Editor's rulings, 16 September 2026)

The Editor names each Teaching Aid to Web Dev with:

- **Title** — the **final** title. Web Dev returns the **final slug** at once;
  it does not change afterwards.
- **Old title** — only if the page is already built (a file in this folder),
  so it can be found.
- **Date** — the day it publishes (the page goes live at 8:00 AM ET that day;
  the short at 9:00 PM ET).
- **Level** 0–3, mapped to the `audience` field:
  0 = `for-everyone` · 1 = `new-to-the-bible` ·
  2 = `familiar-with-scripture` · 3 = `students-and-teachers`.

Web Dev returns the **slug** and the **site slot** (the next free `NN-`
prefix after the highest in `src/content/slides/`; the date check requires
dates to be non-decreasing by slot, so a gap left lower down is not reused).

**Slugs:** lowercase ASCII from the final title, words hyphenated, small words
dropped where that keeps it short. A page already built here **keeps its
existing slug** — its served images under `public/slides/<slug>/` are named
for it — even when its title changes.

**The site slot is publication order, not the short's corpus number.** The
corpus numbers its shorts by identity (`NN_<slug>` folders); the two diverge
whenever the order differs, as 15/16 already do.

## To name a held page (one commit)

1. Move it to `src/content/slides/NN-<slug>.md`, using the next free prefix.
2. Add `scheduled: YYYY-MM-DD` (the Editor's date) to its frontmatter, and set
   `title` (and the title inside `description`) and `audience` from the
   hand-off.
3. Append `'<slug>'` to the end of `SLIDE_IDS` in `src/lib/slide-ids.ts`.

## To create a new stub (one commit)

1. Create `src/content/slides/NN-<slug>.md` with `title`, `cycle`,
   `audience`, `scheduled`, `license: CC-BY-4.0` and `draft: true`, and an
   empty body. The cycle page shows it as "Coming <date>" until it is live.
2. Append `'<slug>'` to the end of `SLIDE_IDS`.

The Shorts build then fills the page and places its images under the slug
returned.

## Withdrawing a named page

Move it back here without its prefix and `scheduled` line, and remove its slug
from `SLIDE_IDS` **in the same commit** — a slug left on the list with no file
fails every build.

A page the Editor decides will never publish is deleted from here. It has no
URL to protect, because it was never live under this arrangement.
