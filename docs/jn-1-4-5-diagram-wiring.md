# John 1:4–5 — Reader-Facing Diagram Wiring Plan

*Development handoff, 2026-07-20; placement convention revised 2026-07-21. The site infrastructure for the eight §III.5 reader-facing diagrams is built and verified; the SVGs are authored in the SVG project (SVG Creation's register) and are now all co-located beside their home stubs. This is the drop-in spec.*

## Placement convention — production specifies the location (revised 2026-07-21)

Every reader-facing diagram is placed with an in-body **placeholder marker** — the same `<!-- diagram -->` mechanism John 1:1–3 already uses — not the frontmatter `top`/`bottom` defaults. Rationale: a diagram belongs at a specific point in the argument, and with up to two diagrams per page, **production is the register that knows where each one lands**. So the *location* is production-owned, expressed by placing the marker in the prose; the frontmatter `diagram` field (Development-owned: `src`, `alt`, `caption`, `position: anchor`) supplies the metadata, not the position.

- `position: anchor` on every diagram field.
- One `<!-- diagram -->` marker per diagram, each on its own line, in frontmatter **list order** (the Nth marker takes the Nth diagram). On the two doubled pages, two markers.
- **A marker must exist wherever the field exists.** `position: anchor` with no marker fails the build (fail-fast, by design — a declared figure never silently vanishes). So the marker is seeded into the stub body when the diagram is wired, and production positions it as the prose is written. This keeps the drafts-shown preview build green at every step.
- `top`/`bottom` remain supported by the template but are no longer the plan's default; **anchor is the standard**.

*(No code change was needed for any of this: the `remark-diagram-anchor.mjs` plugin, the list-valued schema, and multi-marker ordering were already built. This is a convention + docs change only.)*

## Infrastructure state (done)

- **Anchor placement** — built and in use since John 1:1–3 (`src/lib/remark-diagram-anchor.mjs`); handles one or two markers per page, fail-fast on a missing marker or missing SVG.
- **Multiple diagrams per page** — built. The commentary `diagram` field accepts a **list** of diagram objects as well as a single object. `§4.1` (`02-gradatio-and-foyer`) and `§5.4` (`08-cosmology-light-in-darkness`) each carry two. Every existing single-diagram page is unaffected. Build green: 52 pages (drafts hidden), 86 (drafts shown); a two-figures-on-one-page render was verified.
- **Unit-landing diagrams** — the anchor path injects in-body via the plugin, independent of the landing template, so the landing renders diagrams the same as any section. (The old "landing template doesn't render the `diagram` field" open item is retired; the top/bottom template path was also fixed, but anchor does not depend on it.)

## Authoring house style (so the web SVGs render right)

These are the **reader-facing web** diagrams — they inline onto the cream Visual Register, not the black slide background. Author them like the Cycle-1 files beside the 1:1–3 stubs (`src/content/commentary/john/1-1-to-3/jn1-1-3-*.svg`), which are the exact template:

- No background `<rect>` — let the page show through.
- `fill:currentColor` for ink; `var(--color-gold, #b8860b)` and `var(--color-meta, #6b6b6b)` (with hard-coded fallbacks) for accents — never hard-coded slide colors.
- Greek in a class using `font-family:'SBL BibLit','Cardo',…,serif` so it inherits the loaded polytonic webfont and matches the running prose.
- A `viewBox`, `role="img"`, and `<title>`/`<desc>` for accessibility.
- **Grayscale-safe** for the Gradatio Staircase and Macro-Tense Run (§III.4): structure and labels carry the meaning, not color.

The slide-embedded versions (black background, gold/cream/gray) are a separate register and are not what wires into the site.

## The eight diagrams — filename · home stub · position · drafted alt/caption

All are `position: anchor`; each is placed by a `<!-- diagram -->` marker in the body, in frontmatter list order. On the two doubled pages the first marker takes the first listed diagram. Alt/caption are **drafted from §III.5 for Research/Editor sign-off** before publish.

### 1 · `jn1-4-5-architectural-orientation.svg` → `commentary/john/1-4-to-5/index.md` · position: `anchor`
- **alt:** Architectural orientation diagram of the Prologue of John (1:1–18), with 1:4–5 at the close of the first movement. Three movements left to right — 1:1–5 (the foyer), 1:6–13, 1:14–18. The v. 4 / v. 14 foyer pole arcs from the highlighted 1:4–5 unit to 1:14 at the far end. Beneath, a macro-tense spine runs diachronically — ἦν, ἐγένετο, ὃ γέγονεν.
- **caption:** Architectural orientation: 1:4–5 at the close of the Prologue's first movement, the v. 4 / v. 14 foyer pole, and the macro-tense spine running through.

### 2 · `jn1-4-5-gradatio-staircase.svg` → `02-gradatio-and-foyer.md` (1st marker) · position: `anchor`
- **alt:** The four-tread gradatio of John 1:4–5 as a staircase built by anadiplosis: ζωή → ἡ ζωή / τὸ φῶς → τὸ φῶς / τῇ σκοτίᾳ → ἡ σκοτία / οὐ κατέλαβεν. The four treads labeled ontology, anthropology, cosmology, soteriology, with the catchword linkages marked; Reading A shown as the punctuation that lets the staircase begin cleanly.
- **caption:** The gradatio staircase: life → light → darkness → the darkness's failure, each tread taking up the previous term by anadiplosis, across ontology / anthropology / cosmology / soteriology.

### 3 · `jn1-4-5-foyer-pole.svg` → `02-gradatio-and-foyer.md` (2nd marker) · position: `anchor`
- **alt:** The v. 4 / v. 14 foyer pole: 1:4–5 at the near pole and 1:14 at the far pole of the Prologue's foyer bracket — the life-and-light of v. 4 answered by the Word-made-flesh whose glory is beheld at v. 14. The pole-content is marked (light = glory = one divine self-disclosure); the pairing's register flagged high/provisional, elevation assigned to the future 1:14 treatment.
- **caption:** The v. 4 / v. 14 foyer pole: the light of v. 4 disclosed as the glory of v. 14. Held high/provisional, confirmed at 1:14.

### 4 · `jn1-4-5-macro-tense-run.svg` → `03-macro-tense-run.md` · position: `anchor`
- **alt:** The unit-level macro-tense run of John 1:4–5: ἦν, ἦν (v. 4) → φαίνει (v. 5a, the Prologue's first present indicative) → κατέλαβεν (v. 5b), as the unit-level instantiation of the Prologue's macro-tense spine. The layered-temporal payload marked: the protological imperfect grounding the eternal frame; the marked present holding creational, incarnational, and ongoing frames; the constative aorist summarizing the darkness's failure as one completed fact.
- **caption:** The macro-tense run: ἦν → φαίνει → κατέλαβεν — eternal being, the one present shining, the darkness's failure gathered into a single completed fact.

### 5 · `jn1-4-5-coordinate-articulation.svg` → `04-coordinate-articulation.md` · position: `anchor`
- **alt:** The coordinate articulation of shape and spine in John 1:4–5. The synchronic gradatio and the diachronic macro-tense run superimposed on the same four treads, held co-primary and split by register so neither borrows the other's witnesses — the figure anchored by Nässelqvist and Miller, the tenses by Ridderbos and Waetjen. Shown as two dimensions of one composition, not alternatives.
- **caption:** Coordinate articulation: the gradatio (synchronic) and the macro-tense run (diachronic) as two dimensions of one composition, co-primary and split by register.

### 6 · `jn1-4-5-genesis-frame.svg` → `08-cosmology-light-in-darkness.md` (1st marker) · position: `anchor`
- **alt:** The Genesis frame of John 1:4–5: the christological transposition of Genesis 1:1–5 across the unit. The creation-light of Genesis 1 now the light of men in the Word; the primeval darkness now a darkness set against God. 1:4–5 shown as the third sustained engagement with Genesis 1:1–5 in five verses (after 1:1 and 1:3), the shared light / darkness / shine vocabulary registered.
- **caption:** The Genesis frame: 1:4–5 as a christological transposition of Genesis 1:1–5 — the creation-light become the light of men, the primeval darkness now set against God.

### 7 · `jn1-4-5-modified-dualism.svg` → `08-cosmology-light-in-darkness.md` (2nd marker) · position: `anchor`
- **alt:** The modified, non-ultimate dualism of John 1:5. The σκοτία's three registers — cosmological, moral, noetic — shown as bounded and non-ultimate: not an eternal counter-principle, not a Gnostic realm. The locative ἐν shows the light shining within the darkness, not merely at it. Three Tier-1 guards marked: Bultmann (a revolt, not a substance), Dodd (not ultimate), Lincoln (a qualification of the War Scroll / 1 Enoch dualism, not its equivalent).
- **caption:** The modified dualism: the darkness real but non-ultimate — the light shining within it (locative ἐν), guarded against an eternal or Gnostic counter-principle.

### 8 · `jn1-4-5-one-life-arc.svg` → `14-one-life-arc.md` · position: `anchor`
- **alt:** The one-life arc integrating the five theological Loci of John 1:4–5. Loci One–Four — the life in the Word, the light of men, the light shining within the darkness, the light unovercome — gathered by Locus Five into a single arc: the one life traced from creation (the protological pole, v. 4a) to consummation (the eschatological pole, ζωὴ αἰώνιος), reaching its within-volume terminus at the v. 4 / v. 14 foyer.
- **caption:** The one-life arc: Loci One–Four gathered by Locus Five into one life — in the Word, of men, within the darkness, unovercome — from creation to consummation.

## Deploying

All eight SVGs are co-located. For each: keep the co-located `.svg`; add the `diagram` field with `position: anchor` (a **list** entry on the two doubled pages, a single object on the rest); place a `<!-- diagram -->` marker in the body per diagram, in list order; build-verify (`npm run build`, and grayscale-check the staircase and tense-run); commit field + SVG + marker together. Because the sections are `draft: true`, nothing appears live until the Editor publishes the pair — production sets each marker's final location as it writes the prose (seed the marker when wiring so the drafts-shown build stays green, then move it to the right argumentative point at publish).
