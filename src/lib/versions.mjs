// DATED VERSIONS, generated from Git history at every build (Web Dev Ask "The
// site refocused on the written record", §5.2, Release C; the Editor's rulings
// 14, 15, 17, 18 and 22 of 12 Nov 2026, and 2 of 13 Nov 2026).
//
// THE RULE. A version is the page EXACTLY AS COMMITTED in the commit that set
// its date, and it never changes (ruling 22):
//   - the page as first published is version 1, dated its `date`;
//   - each new `revised` date (an article's `updated`) cuts a new version,
//     dated that day (ruling 14);
//   - a correction that leaves the date unmoved cuts none: it appears on the
//     current page only.
// So for each page this walks the file's history, oldest first, and at each
// commit reads the file as it stood. A commit at which the page is published
// (`draft` not true) and whose effective date (`revised` ?? `date`) has not
// been seen before is the commit that set that date: its file is the version.
//
// GENERATED, NEVER KEPT (§5.2, the constraint; CLAUDE.md canonicity chain 3).
// Nothing here is committed. The files are written at the start of every build
// and every dev start into src/content/versions/, which .gitignore excludes,
// exactly as the PDFs are printed at build and never kept. A stored copy is
// what drifted before.
//
// Layout: versions/<kind>/<page id>/v/<YYYY-MM-DD>/index.md, the historical
// file verbatim, with any diagram SVG it names written beside it as it stood
// in the same commit, so the diagram pipeline renders the version's own
// figure. versions/manifest.json lists every version for the templates.
//
// HISTORY (ruling 2 of 13 Nov 2026). Cloudflare Pages clones one commit deep.
// If the clone is shallow this first runs `git fetch --unshallow`, which the
// build can do (probe of 13 Nov 2026: 701 commits back to 28 May 2026, in
// about 1.5 s). If history still does not reach the first commit, the build
// FAILS rather than publish an incomplete record.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUT = path.join(ROOT, 'src/content/versions');
const FIRST_COMMIT_DATE = '2026-05-28';

const git = (...args) =>
  execFileSync('git', args, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

function ensureFullHistory(logger) {
  if (git('rev-parse', '--is-shallow-repository').trim() === 'true') {
    logger?.info('shallow clone: fetching the full history');
    git('fetch', '--unshallow', '--quiet', 'origin');
  }
  const roots = git('rev-list', '--max-parents=0', 'HEAD').trim().split('\n');
  const reaches = roots.some((r) => git('show', '-s', '--format=%as', r).trim() <= FIRST_COMMIT_DATE);
  if (!reaches) {
    throw new Error(
      `[versions] the Git history does not reach ${FIRST_COMMIT_DATE}; ` +
        'dated versions cannot be built from a partial history.'
    );
  }
}

const iso = (d) => (d instanceof Date ? d.toISOString().slice(0, 10) : d ? String(d).slice(0, 10) : null);

function frontmatter(text) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);
  if (!m) return null;
  try {
    return yaml.load(m[1]) ?? {};
  } catch {
    return null;
  }
}

// Each tracked page file: commentary entries and parent articles.
function pageFiles() {
  const out = [];
  const walk = (dir, kind, base) => {
    for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, name.name);
      if (name.isDirectory()) walk(p, kind, base);
      else if (name.name.endsWith('.md')) {
        const rel = path.relative(base, p).replaceAll(path.sep, '/');
        const id = rel.replace(/\.md$/, '').replace(/\/index$/, '');
        if (kind === 'articles' && id.includes('/')) continue; // chapters are not cited pages
        out.push({ kind, id, file: path.relative(ROOT, p).replaceAll(path.sep, '/') });
      }
    }
  };
  walk(path.join(ROOT, 'src/content/commentary'), 'commentary', path.join(ROOT, 'src/content/commentary'));
  walk(path.join(ROOT, 'src/content/articles'), 'articles', path.join(ROOT, 'src/content/articles'));
  return out;
}

// The file's history, oldest first: [{ commit, path }] with the path it had
// at that commit (followed across renames).
function history(file) {
  const raw = git('log', '--follow', '--format=@%H', '--name-status', '--', file);
  const out = [];
  let commit = null;
  for (const line of raw.split('\n')) {
    if (line.startsWith('@')) commit = line.slice(1);
    else if (commit && line.trim()) {
      const parts = line.split('\t');
      const status = parts[0];
      if (status.startsWith('D')) continue;
      out.push({ commit, path: parts[parts.length - 1] });
      commit = null;
    }
  }
  return out.reverse();
}

function versionsOf(page) {
  // The page's `date` as it stands now. Many pages had their publication date
  // corrected after they went live (16 Aug 2026, "publication-date
  // integrity"), so the date a version 1 carries is the corrected one, read
  // from the current file, never the stub date the first commit happened to
  // hold. Only a new revision date (`revised`; an article's `updated`) cuts a
  // later version.
  const current = frontmatter(fs.readFileSync(path.join(ROOT, page.file), 'utf8')) ?? {};
  const published = iso(current.date);
  const revisedOf = (fm) => iso(page.kind === 'articles' ? fm.updated : fm.revised);
  const found = [];
  let last = null;
  for (const { commit, path: p } of history(page.file)) {
    let text;
    try {
      text = git('show', `${commit}:${p}`);
    } catch {
      continue;
    }
    const fm = frontmatter(text);
    if (!fm || fm.draft === true) continue;
    const rev = revisedOf(fm);
    if (found.length === 0) {
      // Version 1: the commit that first published the page. A revision date
      // it already carries is part of that first state, not a second version.
      if (!published) return [];
      found.push({ date: published, commit, path: p, text, fm });
      last = rev && rev > published ? rev : published;
      continue;
    }
    // A later version: a revision date newer than every date seen so far.
    if (rev && rev > last) {
      found.push({ date: rev, commit, path: p, text, fm });
      last = rev;
    }
  }
  return found;
}

function diagramSrcs(fm) {
  const d = fm?.diagram;
  const list = d == null ? [] : Array.isArray(d) ? d : [d];
  return list.map((x) => x?.src).filter(Boolean);
}

/** Write every version; return the manifest. */
export function generateVersions(logger) {
  ensureFullHistory(logger);
  const started = Date.now();
  fs.rmSync(OUT, { recursive: true, force: true });
  const manifest = {};
  let count = 0;
  for (const page of pageFiles()) {
    const versions = versionsOf(page);
    if (versions.length === 0) continue;
    manifest[`${page.kind}/${page.id}`] = versions.map((v) => ({ date: v.date, commit: v.commit }));
    for (const v of versions) {
      const dir = path.join(OUT, page.kind, page.id, 'v', v.date);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, 'index.md'), v.text);
      for (const src of diagramSrcs(v.fm)) {
        const rel = String(src).replace(/^\.\//, '');
        const from = path.posix.join(path.posix.dirname(v.path), rel);
        try {
          fs.writeFileSync(path.join(dir, rel), git('show', `${v.commit}:${from}`));
        } catch {
          // The version names a figure its own commit lacks; the diagram
          // pipeline fails the build on it, naming the file, as it would for
          // the current page.
        }
      }
      count++;
    }
  }
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  logger?.info(`${count} dated versions of ${Object.keys(manifest).length} pages in ${((Date.now() - started) / 1000).toFixed(1)}s`);
  return manifest;
}

/** Astro integration: generate before anything is built or served. */
export const datedVersions = {
  name: 'secnt:dated-versions',
  hooks: {
    'astro:config:setup': ({ logger }) => {
      generateVersions(logger);
    },
  },
};
