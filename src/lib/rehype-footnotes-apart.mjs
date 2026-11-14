import path from 'node:path';
import { toHtml } from 'hast-util-to-html';

/**
 * rehype-footnotes-apart — lift a commentary page's footnote apparatus out of
 * the rendered body, so the page template can set the "Next" link between the
 * body text and the footnotes (Release D, Ask §7, measure 2; the Editor's
 * ruling 24 of 12 Nov 2026: "A Next link directly after the body text, before
 * the footnotes, naming the next page").
 *
 * remark-gfm renders the apparatus as one <section data-footnotes> at the end
 * of the body, inside <Content />, where no template can reach between the
 * last paragraph and it. This plugin removes that section from the tree and
 * hands its HTML, unchanged, to the template through the entry's plugin
 * frontmatter (`footnotesHtml`, read from render(entry).remarkPluginFrontmatter).
 * The template renders it straight after the Next link, so the page reads
 * exactly as before with one link added: same markup, same ids, same
 * back-references, same place in print and in the PDF (the Next link is
 * hidden in print).
 *
 * Scope: ONLY the living commentary pages, src/content/commentary/. Every
 * other collection, the dated versions of Release C included
 * (src/content/versions/), renders exactly as before, footnotes in place.
 */
const COMMENTARY = `${path.sep}src${path.sep}content${path.sep}commentary${path.sep}`;

export default function rehypeFootnotesApart() {
  return (tree, file) => {
    const where = file.path ?? file.history?.[0] ?? '';
    if (!where.includes(COMMENTARY)) return;
    const i = tree.children.findIndex(
      (n) => n.type === 'element' && n.tagName === 'section' && n.properties && 'dataFootnotes' in n.properties
    );
    if (i < 0) return;
    const [section] = tree.children.splice(i, 1);
    const fm = ((file.data.astro ??= {}).frontmatter ??= {});
    fm.footnotesHtml = toHtml(section, { allowDangerousHtml: true });
  };
}
