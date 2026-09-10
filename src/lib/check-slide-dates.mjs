// Build-time assertion on slide publication dates (Plan D33; Shorts Loop
// Rev 39(b)). Runs on every build and every `astro dev` start.
//
// Why it exists. Since D33, `scheduled` decides whether a slide page is
// published: `isSlideVisible` in site.ts withholds the page until that date
// has arrived. A MALFORMED date fails the build loudly on its own — Zod's
// `z.coerce.date()` rejects it — but a WELL-FORMED WRONG one does not. It
// simply ships the page, and in the direction that matters it ships it
// EARLY, ahead of the short whose description link belongs to it.
//
// What it checks. The run publishes in slot order, and the slot is the
// filename's leading two digits. So `scheduled` must be NON-DECREASING with
// slot number: a later slot may share a date with an earlier one — a day
// carrying two shorts is expected once the backlog runs ahead of the
// calendar — but it may never precede it. Any single mistyped date that
// moves a slot backwards breaks that, which is every past-date typo except
// one landing on slot 01.
//
// What it cannot check. This repo cannot see the Subject Index, which is the
// actual authority for these dates and lives in the corpus repo. Exact
// agreement with the publication-order table is checked in two other places:
// at GATE S0 of each build session (Loop Rev 39(b)), and by the daily
// conformance read that mails the Editor any disagreement.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SLIDES_DIR = fileURLToPath(new URL('../content/slides/', import.meta.url));
const SLOT_NAME = /^(\d{2})-(.+)\.md$/;
const SCHEDULED = /^scheduled:\s*(\S+)\s*$/m;

const slot = (n) => String(n).padStart(2, '0');

export function checkSlideDates() {
  const files = fs
    .readdirSync(SLIDES_DIR)
    .filter((f) => f.endsWith('.md'))
    .sort();

  const rows = [];
  const problems = [];

  for (const file of files) {
    const named = SLOT_NAME.exec(file);
    if (!named) {
      problems.push(`${file}: the filename does not open with a two-digit slot number`);
      continue;
    }
    const source = fs.readFileSync(path.join(SLIDES_DIR, file), 'utf8');
    const found = SCHEDULED.exec(source);
    if (!found) {
      problems.push(`${file}: no \`scheduled:\` line in the frontmatter`);
      continue;
    }
    const raw = found[1].replace(/^['"]|['"]$/g, '');
    const when = new Date(raw);
    if (Number.isNaN(when.getTime())) {
      problems.push(`${file}: \`scheduled: ${raw}\` is not a date`);
      continue;
    }
    rows.push({ slot: Number(named[1]), file, raw, t: when.getTime() });
  }

  rows.sort((a, b) => a.slot - b.slot);

  for (let i = 1; i < rows.length; i += 1) {
    const prev = rows[i - 1];
    const cur = rows[i];
    if (cur.t < prev.t) {
      problems.push(
        `slot ${slot(cur.slot)} (${cur.file}) is dated ${cur.raw}, which is earlier than ` +
          `slot ${slot(prev.slot)} (${prev.file}) at ${prev.raw} — the run publishes in slot ` +
          `order, so a later slot may share a date with an earlier one but never precede it`,
      );
    }
  }

  if (problems.length > 0) {
    throw new Error(
      '[secnt] slide publication dates will not do (Plan D33; Shorts Loop Rev 39(b)):\n  - ' +
        problems.join('\n  - ') +
        '\n\nThe authority for these dates is the publication-order table in the corpus at ' +
        'Shorts\\Shorts Subject Index — SECNT Lectures.md. Fix the date rather than the check.',
    );
  }
}
