// @ts-check
import { defineConfig } from 'astro/config';

// SECNT — Scholars Exegetical Commentaries on the New Testament
// Site config. Two settings here are load-bearing for the citation-stable
// corpus (per the Jn 1:1–3 Site Structure Handoff, §4), not cosmetic:
//
//   site:          the canonical origin. Astro uses this to build absolute
//                  canonical URLs. Must be the production domain.
//   trailingSlash: 'always' — every published URL ends in a slash, e.g.
//                  /commentary/john/1-1-to-3/05-en-arche/. Citations point
//                  at slashed URLs; this guarantees they resolve and that
//                  Astro emits matching <link rel="canonical"> hrefs.

export default defineConfig({
  site: 'https://secnt.org',
  trailingSlash: 'always',
});
