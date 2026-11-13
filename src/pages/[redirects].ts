// The redirect list for Cloudflare Pages, written at every build as
// dist/_redirects (Web Dev Ask "The site refocused on the written record",
// §4.1 and §4.2, Release B). It is GENERATED FROM THE COLLECTIONS, never kept
// by hand (§4.2), so it lands with the removals and cannot drift from them.
//
// Why a dynamic route: Astro ignores a page FILE whose name starts with "_",
// but not a route PARAMETER, so this one-path route writes dist/_redirects
// exactly, and the file comes from the same collections as every page.
//
// Every rule is a permanent (301) redirect, in both forms of the address, with
// and without the trailing slash. Cloudflare Pages reads _redirects before it
// serves a file, and allows 2,000 static rules; this list is far below that.
//
// 1. THE LECTURES (§4.1). Every lecture page secnt.org served, under exactly
//    the rule its route used (a visible lecture whose `sectionRef` resolves to
//    a visible commentary entry), goes to its episode page on the lecture site.
// 2. THE TEACHING AIDS (§4.2). Every entry in the slides collection goes to
//    the commentary section its `section` names, or, without one, to the unit
//    landing its cycle names (`commentaryUnit`). A target that is not
//    published falls back to the commentary contents page, never to a 404.
// 3. THE AID INDEXES (§4.2). /slides/ and each slide-cycle page go to the
//    commentary contents page.
import { getCollection } from 'astro:content';
import { commentaryUrl, lectureUrl, normalizeId, isVisible } from '../lib/site';

export function getStaticPaths() {
  return [{ params: { redirects: '_redirects' } }];
}

export async function GET() {
  const commentary = await getCollection('commentary');
  const visibleIds = new Set(commentary.filter(isVisible).map((c) => c.id));
  const contents = '/commentary/';
  const rules: [string, string][] = [];

  // 1. Lectures.
  for (const lecture of (await getCollection('lectures')).filter(isVisible)) {
    const id = normalizeId(lecture.data.sectionRef.id);
    if (!visibleIds.has(id)) continue;
    rules.push([`${commentaryUrl(id)}lecture/`, lectureUrl(id)]);
  }

  // 2. Teaching aids.
  const cycles = await getCollection('slideCycles');
  const unitOfCycle = new Map(cycles.map((c) => [c.id, c.data.commentaryUnit]));
  for (const aid of await getCollection('slides')) {
    const sectionId = aid.data.section ? normalizeId(aid.data.section.id) : undefined;
    const unitId = aid.data.cycle ? unitOfCycle.get(aid.data.cycle.id) : undefined;
    const targetId = sectionId ?? unitId;
    const target = targetId && visibleIds.has(targetId) ? commentaryUrl(targetId) : contents;
    rules.push([`/slides/${aid.id}/`, target]);
  }

  // 3. The aid indexes.
  rules.push(['/slides/', contents]);
  for (const cycle of cycles) rules.push([`/slides/${cycle.id}/`, contents]);

  const seen = new Set<string>();
  const lines: string[] = [];
  for (const [from, to] of rules) {
    for (const src of [from, from.replace(/\/$/, '')]) {
      if (seen.has(src)) throw new Error(`[redirects] duplicate source ${src}`);
      seen.add(src);
      lines.push(`${src} ${to} 301`);
    }
  }
  return new Response(lines.join('\n') + '\n', {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
