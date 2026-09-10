// SECNT — scheduled publish build.
//
// The site is a static Astro build on Cloudflare Pages, so a page becomes
// live only when a build runs. `isSlideVisible` (src/lib/site.ts) holds a
// slide page back until its `scheduled` date has arrived; this Worker is what
// makes a build happen on the morning of that date, so the page is live hours
// before its short goes out at 9:00 PM ET (the Editor's ruling of 10 September 2026).
//
// The cron is 12:00 UTC — 8:00 AM Eastern in EDT, 7:00 AM in EST. The hour is
// deliberately NOT DST-corrected (Editor's ruling, 10 September 2026): the
// drift is one hour, it moves the build EARLIER in winter and never later,
// and the build only has to beat 9:00 PM.
//
// DEPLOY_HOOK_URL is a Cloudflare Pages deploy hook and is a credential —
// anyone holding it can trigger builds. It is set as a Worker secret
// (`wrangler secret put DEPLOY_HOOK_URL`) and never committed.
export default {
  async scheduled(controller, env, ctx) {
    const stamp = new Date(controller.scheduledTime).toISOString();

    if (!env.DEPLOY_HOOK_URL) {
      // Throwing marks the run failed in the Cron Trigger "Past Events"
      // table, which is the only place a silent miss would otherwise hide.
      throw new Error(`[secnt-publish] ${stamp} DEPLOY_HOOK_URL is not set`);
    }

    const res = await fetch(env.DEPLOY_HOOK_URL, { method: 'POST' });
    console.log(`[secnt-publish] ${stamp} cron=${controller.cron} -> ${res.status}`);

    if (!res.ok) {
      throw new Error(
        `[secnt-publish] ${stamp} deploy hook returned ${res.status} ${res.statusText}`,
      );
    }
  },
};
