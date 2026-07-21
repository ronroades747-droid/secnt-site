# Diagram Handoff — Commentary Production → Editor

*Boundary contract between the scholarly-content register (Commentary Production, Drive) and the site register (Site Development, repo). Canonical copy lives in `secnt-site/docs/`; mirror this into the Commentary Production project so the producing side actually sees it. Short and stable by design — it should rarely change.*

## The rule

Commentary Production authors **body prose only**. It never embeds a diagram in the authored artifact — no `<figure>`, no `<svg>`, no `<img>`, no pasted rendered image. A diagram's SVG, its CSS classes, its alt text and caption, and its rendering are the **site's** to supply. The producing register never handles them.

## Where a diagram goes — a named placeholder

Where a diagram belongs in the argument, drop **one visible placeholder line**, on its own paragraph, at that point:

```
[[DIAGRAM: architectural-orientation]]
```

- Use the diagram's filename stem from the Cycle Plan §III.5 list — e.g. `architectural-orientation`, `gradatio-staircase`, `foyer-pole`, `macro-tense-run`, `genesis-frame`, `modified-dualism`, `one-life-arc`.
- One placeholder per diagram, in reading order. A page may carry up to two.
- The placeholder's **location** is the only diagram-related thing Production owns — it says *where*, not *what*.

Use a visible `[[DIAGRAM: …]]` sentinel, **not** a raw `<!-- diagram -->` HTML comment, in the Google-Doc-canonical artifact: an HTML comment is invisible in a Doc and is easily lost or auto-mangled on export, whereas the sentinel survives the transform and is reviewable in the Doc.

## What the Editor does at publish

At the transcription / paste-into-stub step, the Editor converts each `[[DIAGRAM: name]]` sentinel into the site's marker — `<!-- diagram -->`, on its own line, at the sentinel's position. The site then renders the co-located SVG (authored by SVG Creation) through the `diagram` frontmatter field (wired by Development with `position: anchor`) at that marker. Identity and presentation are the site's; only the location came from Production.

## Why — the failure this prevents

A `<figure>` or SVG pasted into the body skips the site's diagram component — wrong classes, no Visual-Register palette or SBL-font inheritance — and ignores placement, so it renders out of place and off-style. That was the John 1:4–5 index-page bug: the architectural-orientation SVG was pasted mid-body while the frontmatter said `position: top`, so it rendered in the wrong spot and outside the component. The placeholder keeps Production in its register and lets the site own presentation.
