# `ops/publish-cron` — the daily publish build

**What it is.** A Cloudflare Worker with one cron trigger. Every day at
**12:00 UTC** it POSTs a **Cloudflare Pages deploy hook**, which rebuilds the
site from `main`. It has no fetch handler and no route: nothing can call it
over HTTP.

**Why it exists.** The site is a static Astro build, so a page goes live only
when a build runs. `isSlideVisible` in `src/lib/site.ts` holds a slide page
back until its `scheduled` date has arrived — and without a build at that
moment, "arrived" never happens. This Worker is that moment.

A deploy hook builds the branch it points at whether or not any commit has
changed, which is the normal case here: most mornings nothing has been pushed
and the only thing that differs is the clock.

## If a day is missed

Nothing is lost, and no catch-up is needed. The gate is a predicate over every
entry, not a queue of pending work: each build asks of all forty-five slides
which of them have dates that have arrived. So a cron that fails on the 12th
leaves that page dark for a day, and the build on the 13th publishes both it
and the 13th's page together. Any build does this — a push to `main`, or
**Retry deployment** in the Pages dashboard — so the fix for a broken cron is
never to fix the cron first.

What this cannot repair is the other surface. The short goes out at 9:00 PM ET
on its own date regardless, so a missed morning means the description link
lands on a 404 for the audience the short just sent. That is the reason to
enable a Cloudflare **Notifications** alert on Worker errors: it is the only
thing that catches a failure on a morning nobody is looking.

**The hour.** 12:00 UTC is 08:00 Eastern in EDT and 07:00 in EST. The hour is
deliberately not DST-corrected (Plan D33; Editor's ruling, 10 September 2026): the drift
is one hour, it always moves the build *earlier*, and the build only has to
beat the short's 9:00 PM ET publication.

## Setup, once

1. **Create the deploy hook.** Cloudflare dashboard → Workers & Pages → the
   `secnt-site` project → Settings → Builds → **Add deploy hook**. Name it
   (e.g. `daily-publish`) and point it at **`main`**. Copy the URL.
   **Treat that URL as a secret** — it needs no authentication, so anyone
   holding it can trigger builds.
2. **Deploy the Worker and give it the URL:**
   ```
   cd ops/publish-cron
   npx wrangler deploy
   npx wrangler secret put DEPLOY_HOOK_URL      # paste the hook URL
   ```

## Checking it

- **Did it run?** Cloudflare dashboard → the Worker → Settings → Trigger
  Events → **Cron Triggers → Past Events**. A failed POST throws, so a bad or
  missing hook shows up there as a failed run rather than as silence.
- **Force a run locally:**
  ```
  npx wrangler dev
  curl "http://localhost:8787/cdn-cgi/local/scheduled?format=json"
  ```
- **Force a real build without waiting:** POST the deploy hook yourself.

## What this does not do

It does not touch YouTube. The short is scheduled in YouTube Studio from the
same date in the Subject Index's publication-order table; the two surfaces
read one date and neither triggers the other.
