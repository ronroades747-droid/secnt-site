# Held Teaching Aids

Finished slide pages that have **not yet been named for publication**.
Publication is one at a time (Editor's ruling, 16 September 2026): the Editor
decides which page publishes next and on what date, and only then does it
enter the Teaching Aids collection.

This folder is **outside** the `slides` collection (its base is
`src/content/slides/`), so nothing here is built, listed on the cycle page,
date-checked, or counted against `src/lib/slide-ids.ts`.

Files are named by bare slug, with no `NN-` prefix and no `scheduled` line.

**To name one**, in a single commit:

1. Move it to `src/content/slides/NN-<slug>.md`, using the next free prefix.
2. Add `scheduled: YYYY-MM-DD` (the Editor's date) to its frontmatter.
3. Append `'<slug>'` to the end of `SLIDE_IDS` in `src/lib/slide-ids.ts`.

A page the Editor decides will never publish is deleted from here. It has no
URL to protect, because it was never live under this arrangement.

Its served images under `public/slides/<slug>/` stay where they are.
