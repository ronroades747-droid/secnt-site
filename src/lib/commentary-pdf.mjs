// Commentary PDFs — every published commentary page printed to a PDF at build.
// Web Dev Ask "Downloads on the commentary page" (26 Sep 2026) sec 4, with the
// Editor's rulings of the same day on sec 7 Q4 and Q5.
//
// GENERATED, NEVER KEPT. The PDF is printed from the built page on every build
// and is never committed. A page body exists only in this repo (process change
// of 7 Aug 2026); a PDF made once and stored would be exactly the kind of copy
// that drifts from a page later edited in place. Printed at each build, it
// cannot. Its look is the print stylesheet in global.css as it stands: this
// step designs nothing, it presses Print.
//
// WHICH PAGES. Commentary pages proper — the section pages and the unit
// landings — and nothing else on the site (Editor, 26 Sep 2026). They are
// taken from the pages this build actually wrote, never from a list, so a
// draft that did not build has no PDF (sec 4: only a live page has one).
//
// WHERE. Beside the page, named from its id (sec 7 Q5, agreed 26 Sep 2026):
//   /commentary/john/1-1-to-3/06-en-arche/john-1-1-to-3-06-en-arche.pdf
//   /commentary/john/1-1-to-3/john-1-1-to-3.pdf
// Same origin as the page, so the link's `download` attribute holds and the
// file saves under that name.
//
// WHEN. On Cloudflare Pages builds (CF_PAGES=1, set by Cloudflare itself) —
// production and preview alike — and locally only on request (SECNT_PDF=1).
// An ordinary local `npm run build` skips the step and says so, so the
// Editor's preview builds on Windows need no browser. Where the step runs, a
// failure FAILS THE BUILD: every commentary page shows its PDF link, and a
// build that shipped the links without the files would serve 404s. A failed
// build is rejected and the last good deploy keeps serving.
//
// THE BROWSER. Cloudflare's build image carries no Chrome, so the browser is
// @sparticuz/chromium, a self-contained Chromium build for bare Linux hosts.
// SECNT_CHROME_PATH points the step at another Chrome instead (e.g. on
// Windows: the installed Chrome's chrome.exe).

import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** File name of a commentary entry's PDF: its id with slashes as hyphens. */
export const commentaryPdfName = (id) => `${id.replaceAll('/', '-')}.pdf`;

// A built pathname is a commentary page proper when it is a unit landing
// (commentary/<book>/<unit>/) or a section (commentary/<book>/<unit>/<section>/)
// — not the volume page above them, and not a lecture page below them.
const COMMENTARY_PAGE = /^commentary\/[^/]+\/[^/]+\/(?:[^/]+\/)?$/;
const isCommentaryPage = (pathname) =>
  COMMENTARY_PAGE.test(pathname) && !pathname.endsWith('/lecture/');

// Paper and margins. US Letter: the author and the likeliest printers are
// American. Nothing else is set — headers, footers and page numbers would be
// design, and sec 4 asks for the page as printed.
const PDF_OPTIONS = {
  format: 'Letter',
  margin: { top: '0.75in', bottom: '0.75in', left: '0.75in', right: '0.75in' },
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

/** Serve the built site read-only on a free localhost port. */
function serve(root) {
  const server = http.createServer((req, res) => {
    let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (!file.startsWith(root)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!fs.existsSync(file)) return res.writeHead(404).end();
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] ?? 'application/octet-stream' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

async function launchBrowser() {
  const { chromium } = await import('playwright-core');
  if (process.env.SECNT_CHROME_PATH) {
    return chromium.launch({ executablePath: process.env.SECNT_CHROME_PATH });
  }
  const { default: sparticuz } = await import('@sparticuz/chromium');
  return chromium.launch({ executablePath: await sparticuz.executablePath(), args: sparticuz.args });
}

/** Print each built commentary page to a PDF beside it. */
async function renderCommentaryPdfs({ dir, pages, logger }) {
  const root = fileURLToPath(dir);
  const targets = pages.map((p) => p.pathname).filter(isCommentaryPage);
  const started = Date.now();
  const server = await serve(root);
  const origin = `http://127.0.0.1:${server.address().port}`;
  const browser = await launchBrowser();
  try {
    const page = await browser.newPage();
    // The built page loads nothing from outside that its print needs; blocking
    // the rest keeps GoatCounter from counting a build as a reader.
    await page.route('**/*', (route) =>
      route.request().url().startsWith(origin) ? route.continue() : route.abort()
    );
    for (const pathname of targets) {
      const id = pathname.replace(/^commentary\//, '').replace(/\/$/, '');
      const response = await page.goto(`${origin}/${pathname}`, { waitUntil: 'load' });
      if (!response?.ok()) throw new Error(`/${pathname} answered ${response?.status()}`);
      await page.evaluate(() => document.fonts.ready);
      await page.pdf({ ...PDF_OPTIONS, path: path.join(root, pathname, commentaryPdfName(id)) });
    }
  } finally {
    await browser.close();
    server.close();
  }
  logger.info(`${targets.length} commentary PDFs in ${((Date.now() - started) / 1000).toFixed(1)}s`);
}

/** Astro integration: runs after the site is written to dist/. */
export const commentaryPdfs = {
  name: 'secnt:commentary-pdfs',
  hooks: {
    'astro:build:done': async ({ dir, pages, logger }) => {
      if (process.env.CF_PAGES !== '1' && process.env.SECNT_PDF !== '1') {
        logger.info('skipped (runs on Cloudflare builds; set SECNT_PDF=1 to run it here)');
        return;
      }
      await renderCommentaryPdfs({ dir, pages, logger });
    },
  },
};
