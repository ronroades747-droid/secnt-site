# `ops/publish-cron` — the daily publish build

**What it is.** A Cloudflare Worker with one cron trigger. Every day at
**12:00 UTC** it POSTs a **Cloudflare Pages deploy hook**, which rebuilds the
site from `main`. It has no fetch handler and no route: nothing can call it
over HTTP.

**It is not the only trigger.** `.github/workflows/daily-publish.yml` POSTs the
same hook at **12:30 UTC**, half an hour behind this one (Editor's ruling,
12 September 2026). Either trigger alone publishes the day's page, so read what
follows as describing one of two independent paths to the same build.

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
lands on a 404 for the audience the short just sent. Two things stand against
that. The first is redundancy: the GitHub Actions workflow above POSTs the same
hook at 12:30 UTC, so both triggers must fail on the same morning before a page
goes dark. The second is that the workflow is also the alarm. A Cloudflare
**Notifications** alert on Worker errors would be the natural instrument and is
not available here — those alert types require the Workers **Paid** plan, and
this account is on the free one — whereas GitHub emails the owner when a
scheduled workflow fails, for nothing. Note that GitHub disables a scheduled
workflow after 60 days without repository activity; this repo is nowhere near
that, but a long quiet stretch is worth a glance at the Actions tab.

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
3. **Give the same URL to the second trigger.** GitHub → the `secnt-site` repo →
   Settings → Secrets and variables → Actions → **New repository secret**, named
   `CF_DEPLOY_HOOK_URL`. Until it exists the workflow fails loudly on every run,
   which is the intended behaviour — a silent no-op would be worse.

## Checking it

- **Did it run, and what happened?** Cloudflare dashboard → the Worker →
  **Observability**, range Last 24 hours. A success writes
  `[secnt-publish] <timestamp> cron=0 12 * * * -> 200`; a failure writes its
  reason in words, because both throws in `worker.js` carry the cause in the
  message. This works only because `[observability]` is set in `wrangler.toml`.
  It was not on 12 September 2026, and that failed run left nothing behind but a
  count. Free-plan retention is three days: a failure not read inside that
  window is gone.
- **If the logs have aged out.** The Worker → **Metrics** keeps invocation and
  error counts longer than the logs live. It will tell you a run failed but not
  why — with one useful exception: a failure recording **zero subrequests** means
  the POST was never attempted, which narrows it to the `DEPLOY_HOOK_URL` guard
  or to a value malformed enough that `fetch` refused it. That is how the
  12 September failure was diagnosed with no log to read.
- **Force a run locally:**
  ```
  npx wrangler dev
  curl "http://localhost:8787/cdn-cgi/local/scheduled?format=json"
  ```
  This uses a local secret, so it exercises the code and not the deployed
  `DEPLOY_HOOK_URL`.
- **Force a run against the real secret:**
  ```
  npx wrangler dev --remote --test-scheduled
  ```
  then open `http://localhost:8787/__scheduled`. The Worker runs on Cloudflare
  with its real bindings, so this is the only check that proves the stored URL
  works — and it fires an actual build.
- **Force a real build without waiting:** POST the deploy hook yourself.

## What this does not do

It does not touch YouTube. The short is scheduled in YouTube Studio from the
same date in the Subject Index's publication-order table; the two surfaces
read one date and neither triggers the other.
