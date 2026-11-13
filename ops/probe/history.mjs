// THROWAWAY PROBE, never merged (Release C, Ask §9 Q4), second form. The
// first form failed: the clone as delivered is not full history. This form
// asks whether the build can DEEPEN it: it runs `git fetch --unshallow`
// (only if shallow) and then requires history reaching 28 May 2026. A green
// check means versions can be built on Cloudflare by deepening first.
import { execSync } from 'node:child_process';
const sh = (c) => execSync(c, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();
const before = sh('git rev-parse --is-shallow-repository');
console.log(`[probe] before: shallow=${before} commits=${sh('git rev-list --count HEAD')}`);
if (before === 'true') sh('git fetch --unshallow --quiet origin');
const after = sh('git rev-parse --is-shallow-repository');
const rootDates = sh('git rev-list --max-parents=0 HEAD').split('\n').map((r) => sh(`git show -s --format=%as ${r}`));
console.log(`[probe] after: shallow=${after} commits=${sh('git rev-list --count HEAD')} rootDates=${rootDates}`);
if (after !== 'false' || !rootDates.some((d) => d <= '2026-05-28')) process.exit(1);
console.log('[probe] PASS: full history after deepening');
