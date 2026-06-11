import fs from 'node:fs';
import path from 'node:path';

/**
 * remark-diagram-anchor — place a commentary `diagram` whose position is
 * "anchor" at an explicit point inside the body prose.
 *
 * Diagram.astro renders a `diagram` frontmatter object as an inline <svg>
 * figure before (`position: top`) or after (`position: bottom`) the body. Both
 * sit OUTSIDE <Content />. Some architectural diagrams belong INSIDE the prose
 * — after the paragraph that introduces them, before the sub-section that walks
 * the detail. `position: anchor` enables that: the body carries a single
 * HTML-comment marker, `<!-- diagram -->`, on its own line where the figure
 * should land, and this plugin swaps that marker for the same inline figure the
 * top/bottom path produces (same `figure.diagram` / `.diagram-svg` markup, so
 * the SVG inherits SBL BibLit and the Visual Register palette tokens —
 * currentColor / --color-gold / --color-meta — identically).
 *
 * The template needs no change: for `position: anchor`, its `diagramTop` and
 * `diagramBottom` are both false, so it renders nothing around <Content />; this
 * plugin does the in-body injection instead.
 *
 * Fail-fast, matching Diagram.astro: position "anchor" with no marker, or a
 * marker pointing at a missing SVG, throws at build rather than silently
 * dropping the figure. Dependency-free: the marker is a top-level node (its own
 * line), so a flat scan of tree.children finds it — no unist-util-visit needed.
 */

const MARKER = /^<!--\s*diagram\s*-->$/;

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default function remarkDiagramAnchor() {
  return (tree, file) => {
    const diagram = file?.data?.astro?.frontmatter?.diagram;
    if (!diagram || diagram.position !== 'anchor') return;

    const mdPath = file?.history?.[0] ?? file?.path;
    if (!mdPath) {
      throw new Error('remark-diagram-anchor: cannot resolve the source file path.');
    }

    const children = tree.children ?? [];
    const idx = children.findIndex(
      (n) => n.type === 'html' && MARKER.test((n.value ?? '').trim())
    );
    if (idx === -1) {
      throw new Error(
        `remark-diagram-anchor: diagram.position is "anchor" but no <!-- diagram --> ` +
          `marker was found in ${mdPath}. Put the marker on its own line where the ` +
          `figure should render, or use position top/bottom.`
      );
    }

    // Resolve the co-located SVG against the .md's own directory.
    const rel = String(diagram.src).replace(/^\.\//, '');
    const svgPath = path.resolve(path.dirname(mdPath), rel);
    let svg;
    try {
      svg = fs.readFileSync(svgPath, 'utf8');
    } catch {
      throw new Error(
        `remark-diagram-anchor: diagram SVG not found: "${diagram.src}" ` +
          `(resolved to ${svgPath}) for ${mdPath}. Co-locate the .svg next to the ` +
          `.md and reference it with a ./ path.`
      );
    }

    const caption = diagram.caption
      ? `<figcaption>${escapeHtml(diagram.caption)}</figcaption>`
      : '';
    const figure =
      `<figure class="diagram">` +
      `<div class="diagram-svg" role="img" aria-label="${escapeHtml(diagram.alt)}">${svg}</div>` +
      caption +
      `</figure>`;

    children[idx] = { type: 'html', value: figure };
  };
}
