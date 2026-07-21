# SECNT Template Arc — Four Decisions, Locked

All four flagged decisions from the original handoff are resolved. Three required
no code change; one (palette) was a clarity edit that changed no rendered output.

| # | Decision | Resolution | Code change |
| --- | --- | --- | --- |
| 1 | Series name | **Systematic Evangelical Commentaries on the New Testament** (the "Scholars Exegetical" notes pre-date the SECNT lock; stale) | none — `SITE.name` already correct |
| 2 | Palette | **Visual Register** active for web (warm-cream / near-black / atmospheric-warm gold); slide navy/gold is a coordinate register for video, not an alternative | `global.css` — ALTERNATE block removed, comment reframed; **no value change** |
| 3 | Lecture URL | **Section-child** (`/commentary/john/1-1-to-3/01-the-text/lecture/`); each lecture is a child of the Commentary section it pairs to, with its own canonical | none — templates already build it |
| 4 | Body serif | **EB Garamond** (coordinates with the banner's warm-scholarly register and with SBL Greek's old-style design); Source Serif Pro stays documented as the alternative | none — already the active family |

## What's in `decisions-applied.tar.gz`

Two files, at repo-relative paths — extract from the repo root to overwrite:

- **`src/lib/site.ts`** — `bunnyLibraryId` is now the real value `'672956'` (was the placeholder). This is the only functional change in the file.
- **`src/styles/global.css`** — the design-tokens block: the commented-out slide-palette ALTERNATE block is gone, and the header comment now states the slide palette is a coordinate register for video (see slide-template docs), not a flip-option. The active token *values* are unchanged, so the site renders identically.

If you've already committed the original tarball and made your own edits, you can apply these two by hand instead — they're small and described above.

## Build state

Full build clean: 40 pages. Still on your side before the real content lands:
SBL BibLit + EB Garamond font files into `public/fonts/`, the banner into
`public/banner.jpg`, and real per-lecture GUIDs into frontmatter (per the
publish runbook). The library ID is wired and the Bunny embed is validated.

---

## Decision 5 — Diagram placement (locked 2026-07-21)

Reader-facing diagrams are placed by an in-body `<!-- diagram -->` **marker** (the `position: anchor` path), **production-owned**, not by the frontmatter `top`/`bottom` defaults. With up to two diagrams per page now supported, the register that knows where a figure belongs in the argument — production — sets its location: one marker per diagram, on its own line, in frontmatter list order.

Matches what John 1:1–3 already did; now the standard for all pages. `top`/`bottom` remain available in the template but are no longer the default.

**Code change: none.** The `remark-diagram-anchor.mjs` plugin, the list-valued `diagram` schema, and multi-marker ordering were already built. The wiring plan (`docs/jn-1-4-5-diagram-wiring.md`) and the publish runbook (`docs/publishing-a-pair.md`) are updated to match.

Guardrails carried by this decision:
- A `<figure>` or `<img>` hand-pasted into the body is a defect — it skips the diagram component (wrong classes, no palette/font inheritance) and ignores placement. Replace any such paste with a marker. *(This was the John 1:4–5 index-page bug: the architectural-orientation SVG was pasted inline mid-body while the field said `position: top`, so it rendered out of place. Fixed by removing the paste, setting `position: anchor`, and putting a marker at the intended spot.)*
- `position: anchor` with no matching marker fails the build by design; seed the marker when the diagram is wired so the drafts-shown build stays green, then position it at publish.
