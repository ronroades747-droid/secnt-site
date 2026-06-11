// @ts-check
import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import remarkDiagramAnchor from './src/lib/remark-diagram-anchor.mjs';

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

export default defineConfig({
  site: 'https://secnt.org',
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkGfm, remarkDiagramAnchor],
  },
});
