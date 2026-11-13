// THROWAWAY PROBE, never merged (Release C, Ask §9 Q4). It answers one
// question: does the Cloudflare Pages build clone this repository's full Git
// history? It FAILS the preview build if the clone is shallow, or if its
// first commit is later than 28 May 2026, the repository's first commit.
// A green check therefore means: full history, reaching the beginning.
import { execSync } from 'node:child_process';
const sh = (c) => execSync(c, { encoding: 'utf8' }).trim();
const shallow = sh('git rev-parse --is-shallow-repository');
const roots = sh('git rev-list --max-parents=0 HEAD').split('\n');
const rootDates = roots.map((r) => sh(`git show -s --format=%as ${r}`));
const count = sh('git rev-list --count HEAD');
console.log(`[probe] shallow=${shallow} commits=${count} roots=${roots.join(',')} rootDates=${rootDates.join(',')}`);
if (shallow !== 'false') { console.error('[probe] FAIL: shallow clone'); process.exit(1); }
if (!rootDates.some((d) => d <= '2026-05-28')) { console.error('[probe] FAIL: history does not reach 28 May 2026'); process.exit(1); }
console.log('[probe] PASS: full history');
