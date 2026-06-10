// @ts-check
import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * SECNT content schema — Jn 1:1–3 foundation.
 *
 * Governing structure: Site Structure Handoff — Revised (May 29) plus the
 * May 30 architectural lock (three registers: series / volume / unit).
 *
 * Four collections, one per register:
 *   - frontmatter — series-register pages framing the work (About SECNT,
 *     Methodology, Architecture Principles, Citing). Single-level siblings
 *     at site root.
 *   - volumes     — volume-register pages, one per NT book commented on.
 *     The Commentary-on-John landing lives here.
 *   - commentary  — unit-register pages. One entry per published Commentary
 *     section. Schema is count-agnostic (no upper bound on sectionNumber).
 *   - lectures    — one entry per section that has a lecture. Strict
 *     one-to-one: one lecture, one video, no embedded sequences.
 *
 * Lecture 1 (unit-landing pairing): a lecture entry pairs to the unit-
 * landing commentary entry the same way every other lecture pairs to its
 * section. The URL difference is rendering only — the unit-landing template
 * embeds its lecture inline on the landing rather than at a /lecture/ child
 * route. Schema stays uniform.
 *
 * Schema principle: THE PATH OWNS IDENTITY; FRONTMATTER OWNS PRESENTATION.
 * No `passageSlug` field — the folder IS the slug. `passageRef` stated
 * explicitly for the typographic en-dash the URL cannot carry.
 *
 * Labeling: only descriptive title and verse reference are reader-facing.
 * Numeric folder prefixes are routing/order only. No research-internal
 * apparatus appears in this data model.
 *
 * License field: every entry carries `license` explicitly with the SPDX
 * identifier (default and overwhelmingly common value: 'CC-BY-4.0'). This
 * makes every markdown file self-describing for archival, preservation, and
 * machine-harvest purposes — the license travels with the source, not just
 * with the template. The site is openly licensed; explicit licensing on
 * every entry honors that commitment in the source itself.
 *
 * Start minimal, extend deliberately. Optional fields carry sensible defaults.
 */

// ---------------------------------------------------------------------------
// Shared: section type
// ---------------------------------------------------------------------------
const sectionType = z.enum([
  'unit-landing',
  'text-critical',
  'framing',
  'exegesis',
  'synthesis',
  'theology',
  'engagement',
  'pastoral',
]);

// SPDX license identifier. Locked as an enum to prevent silent drift (the
// failure mode of a free-form string is that variants like 'CC BY 4.0' or
// 'cc-by-4.0' validate but break machine-harvest consistency). SECNT publishes
// everything under CC-BY-4.0; if a future entry ever requires a different
// license (e.g. CC0-1.0 for a public-domain figure), expand this enum — a
// deliberate, reviewable schema change rather than an accidental hand-edit.
// SPDX is case-sensitive and hyphen-precise: https://spdx.org/licenses/
const license = z.enum(['CC-BY-4.0']).default('CC-BY-4.0');

// ---------------------------------------------------------------------------
// Collection: frontmatter  —  series register
// ---------------------------------------------------------------------------
const frontmatter = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/frontmatter' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string().default('Ronald E. Roades'),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      order: z.number().int().min(0),
      group: z.string().optional(),
      license,
      draft: z.boolean().default(false),
      revisions: z
        .array(z.object({ date: z.coerce.date(), note: z.string() }))
        .default([]),
    }),
});

// ---------------------------------------------------------------------------
// Collection: volumes  —  volume register
// ---------------------------------------------------------------------------
const volumes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/volumes' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      book: z.string(),
      bookDisplay: z.string(),
      author: z.string().default('Ronald E. Roades'),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      license,
      draft: z.boolean().default(false),
      revisions: z
        .array(z.object({ date: z.coerce.date(), note: z.string() }))
        .default([]),
    }),
});

// ---------------------------------------------------------------------------
// Collection: articles  —  article register
// ---------------------------------------------------------------------------
// Top-level section parallel to Commentary (IA decision, June 6, 2026).
// Designed against the first real article — the 1974 M.A. thesis. Articles
// take two shapes, both in this one collection, with path owning identity:
//   - single-page article: one file, articles/slug.md; the body carries the
//     full prose (or the landing prose for a born-print PDF artifact)
//   - chaptered article (theses): a folder, articles/slug/index.md as the
//     article landing plus articles/slug/NN-or-name.md chapter children,
//     publishing chapter by chapter under the incremental-exposure rhythm
//     (the landing lists published chapters; `complete` retires the
//     "More to come" line, like passageComplete on commentary landings)
// An entry whose id contains '/' is a chapter; chapters require
// chapterNumber for ordering. Start minimal, extend deliberately.
const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string().default('Ronald E. Roades'),
      // Site publication date — drives the reverse-chronological listing.
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      // Provenance of a work first produced elsewhere/earlier, rendered under
      // the title and in the listing (e.g. "M.A. thesis, Wheaton College,
      // June 1974"). Omitted for articles original to SECNT.
      provenance: z.string().optional(),
      // Chapters only: ordering within the parent article (routing/order,
      // never reader-facing — the title carries the reader-facing name).
      chapterNumber: z.number().int().positive().optional(),
      // Article landing only: flipped true in the commit that publishes the
      // final chapter; retires the "More to come" line.
      complete: z.boolean().default(false),
      // The artifact, for born-print articles. `src` is a site-absolute path
      // under /articles/ in public/ (PDFs bypass the asset pipeline).
      pdf: z
        .object({
          src: z.string(),
          // Block label; default suits a born-print article whose PDF IS the
          // article. Override when the PDF is secondary (e.g. a facsimile
          // alongside a digital publication text).
          label: z.string().default('The article (PDF)'),
          pages: z.number().int().positive().optional(),
          sizeMB: z.number().positive().optional(),
          note: z.string().optional(),
        })
        .optional(),
      license,
      draft: z.boolean().default(false),
      revisions: z
        .array(z.object({ date: z.coerce.date(), note: z.string() }))
        .default([]),
    }),
});

// ---------------------------------------------------------------------------
// Collection: commentary  —  unit register
// ---------------------------------------------------------------------------
const commentary = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/commentary' }),
  schema: () =>
    z.object({
      title: z.string(),
      description: z.string(),
      author: z.string().default('Ronald E. Roades'),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),

      book: z.string().default('john'),
      chapter: z.number().int().positive(),
      passageRef: z.string(),

      sectionNumber: z.number().int().min(0),
      verseStart: z.number().int().positive().optional(),
      verseEnd: z.number().int().positive().optional(),

      sectionType,
      greekEpigraph: z.string().optional(),

      // Reader-facing architectural diagram. `src` is a relative ./ path to an
      // SVG co-located beside this entry's .md. Diagram.astro inlines the SVG
      // into the page DOM (not an <img>), so it inherits the site's SBL BibLit
      // (Greek matches the running prose) and the Visual Register palette tokens
      // (currentColor / --color-gold / --color-meta). The path is resolved
      // against the entry's file path at build; a missing file throws.
      diagram: z
        .object({
          src: z.string(),
          alt: z.string(),
          caption: z.string().optional(),
          position: z.enum(['top', 'bottom']).default('bottom'),
        })
        .optional(),

      license,
      draft: z.boolean().default(false),
      revisions: z
        .array(z.object({ date: z.coerce.date(), note: z.string() }))
        .default([]),

      hasLecture: z.boolean().default(true),

      // Unit-landing only. Marks a passage as fully published ("exhausted").
      // While false, the unit-landing page shows a "more to come" line; flip to
      // true in the same commit that publishes the passage's final pair and the
      // line retires itself. Ignored on section entries.
      passageComplete: z.boolean().default(false),
    }),
});

// ---------------------------------------------------------------------------
// Collection: lectures  —  lecture register (paired to commentary entries)
// ---------------------------------------------------------------------------
const lectures = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lectures' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),

    sectionRef: reference('commentary'),

    bunnyVideoId: z.string(),
    youtubeUrl: z.string().url().optional(),
    slidesPdf: z.string().optional(),
    duration: z.string().optional(),

    license,
    draft: z.boolean().default(false),
  }),
});

export const collections = { frontmatter, volumes, commentary, lectures, articles };
