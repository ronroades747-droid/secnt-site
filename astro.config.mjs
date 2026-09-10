// @ts-check
import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import remarkDiagramAnchor from './src/lib/remark-diagram-anchor.mjs';
import { checkSlideDates } from './src/lib/check-slide-dates.mjs';

// SECNT — Systematic Evangelical Commentaries on the New Testament
// (substantive series name per about.md §2; the earlier "Scholars Exegetical"
// wording is superseded).
//
// Load-bearing settings for the citation-stable corpus (not cosmetic):
//   site:          canonical origin; Astro builds absolute canonical URLs from it.
//   trailingSlash: 'always' — every published URL ends in a slash; citations
//                  point at slashed URLs and <link rel="canonical"> matches.
//   remark-gfm:    enables Markdown footnotes ([^1]) — the apparatus-substantial
//                  Commentary renders its footnote apparatus at document end.
//   remark-diagram-anchor: lets a commentary `diagram` with position "anchor"
//                  render at a <!-- diagram --> marker inside the body prose,
//                  rather than only above (top) or below (bottom) it.
//
// The slide-date check is an integration rather than a script so that it
// cannot be forgotten: it runs on every build and every dev start. Since
// Plan D33 `scheduled` decides whether a slide page publishes, and a
// well-formed but wrong date ships the page silently — early, ahead of its
// short. See src/lib/check-slide-dates.mjs for what it can and cannot catch.

/** Fails the build if a slide's `scheduled` precedes an earlier slot's. */
const slideDateCheck = {
  name: 'secnt:slide-date-check',
  hooks: { 'astro:config:setup': () => checkSlideDates() },
};

export default defineConfig({
  site: 'https://secnt.org',
  integrations: [slideDateCheck],
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkGfm, remarkDiagramAnchor],
  },
});
