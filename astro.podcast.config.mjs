// @ts-check
import { defineConfig } from 'astro/config';
import { copyChrome } from './podcast/lib/copy-chrome.mjs';

// The lecture site, podcast.secnt.org (Web Dev Ask "The site refocused on the
// written record", §3, Release A; Editor's rulings of 12 November 2026).
//
// A second build of this repository, served by its own Cloudflare Pages
// project. It reads the SAME content collections as secnt.org (see
// podcast/content.config.ts), so a lecture published by its flip appears on
// both sites from one merge and nothing is ever copied or kept by hand.
//
//   srcDir:    podcast/ — its own pages, layout and feed; secnt.org's src/
//              pages are not part of this build.
//   publicDir: podcast/public/ — its own robots.txt. The fonts and favicons it
//              shares with secnt.org are copied in at build by copyChrome
//              rather than duplicated in git, and nothing else of secnt.org's
//              public/ (cards, slides, PDFs) is served from this host.
//   outDir:    dist-podcast/ — the Pages project's output directory.
//
// Neither the slide-date check nor the commentary-PDF step runs here: this
// site serves no slides and prints no PDFs.
//
// Build command: npm run build:podcast
export default defineConfig({
  site: 'https://podcast.secnt.org',
  srcDir: './podcast',
  publicDir: './podcast/public',
  outDir: './dist-podcast',
  trailingSlash: 'always',
  integrations: [copyChrome],
});
