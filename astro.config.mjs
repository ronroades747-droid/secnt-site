// @ts-check
import { defineConfig } from 'astro/config';
import remarkGfm from 'remark-gfm';
import remarkDiagramAnchor from './src/lib/remark-diagram-anchor.mjs';
import rehypeFootnotesApart from './src/lib/rehype-footnotes-apart.mjs';
import { commentaryPdfs } from './src/lib/commentary-pdf.mjs';
import { datedVersions } from './src/lib/versions.mjs';

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
//   rehype-footnotes-apart: on the living commentary pages only, hands the
//                  footnote apparatus to the template, which sets the "Next"
//                  link between the body text and the footnotes (Release D).
//
// The slide-date check that stood here retired with the /slides/ pages
// (Release B, Ask §4.2): with no slide page to publish, a `scheduled` date
// gates nothing.
//
// The dated versions (Release C) are generated from the Git history before
// anything is built or served; see src/lib/versions.mjs. The integration runs
// first, so the version files exist when the content layer reads them.
//
// The commentary PDFs are printed from the built pages after every Cloudflare
// build and never committed; see src/lib/commentary-pdf.mjs.

export default defineConfig({
  site: 'https://secnt.org',
  integrations: [datedVersions, commentaryPdfs],
  trailingSlash: 'always',
  markdown: {
    remarkPlugins: [remarkGfm, remarkDiagramAnchor],
    rehypePlugins: [rehypeFootnotesApart],
  },
});
