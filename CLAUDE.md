# secnt-site — pointer, not a second rulebook

This is the **public** site repo (`ronroades747-droid/secnt-site`). It carries the Astro build and every published Commentary page body. It does **not** carry project conventions.

## Read this first

**`CLAUDE.md` at the corpus repo root — `C:\Users\reroa\Projects\secnt\CLAUDE.md`** — before working here. It holds the canonicity chain, the folder map, the LFS pattern set, the commit-message convention, and the standing guardrails. Every SECNT lane's project instructions already point there; this file exists only so a session opened directly against the site folder, rather than at `Projects\` level, does not miss it.

Then, for anything touching publication: **`docs/publishing-a-pair.md`**, the publish runbook, which is canonical for site mechanics.

## The boundary (PFW-014, decided 9 August 2026)

Site mechanics, schema, and runbooks are documented **here**. Scholarly and production-lane conventions live in **the corpus repo**, one home per document, cross-referenced rather than duplicated. See `docs/README.md` for the full record and the tombstone map.

**So: do not copy corpus conventions into this repo.** If a rule seems to be missing here, it is in the corpus by design.

## Two things that are absolute in this repo

1. **Never copy `Sources/` content here.** The corpus repo is private because its archives are licensed. This repo is public. Licensed source material must never reach it in any form — not as a quotation block, not as an archive file, not in a commit message.
2. **Claude never publishes.** A session authors, delivers and verifies; it does not publish. Publication is Ron's, per the single-placer rule in the Commentary Production instructions.

   ***Amended for the Shorts register, 14 September 2026*** *(Editor's ruling; Shorts Loop **Rev 46(e)**, Program Plan **D38**)*. In that register a slide page is now **authored `draft: false`** and left **uncommitted**; `scheduled` alone governs release, and **the Editor's push is the act of publishing** *(**Rev 48**, 18 September 2026, superseding Rev 46(b): **Claude commits and reports the commit — hash, file list and message — and the Editor reviews the diff and pushes; the push is both the acceptance and the publication.** The clause read “the Editor's own commit and push” until that date, and was true when written)*. The rule's purpose is untouched — nothing a session writes is live until Ron pushes, and the uncommitted working tree is the hold that `draft: true` used to be. **Elsewhere in this repo the flat prohibition stands**: for Commentary pages and every other collection, Claude does not set `draft: false` at all. *The guard that makes the Shorts case safe is `src/lib/check-slide-dates.mjs`, which fails the build on any `scheduled` that moves a slot backwards.*

---

*Pointer file. Added 12 August 2026 as labeled cross-lane work (authored in a Source Processing session on Ron's explicit confirmation; the owning lane is Web Dev).*
