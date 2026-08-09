# secnt-site/docs — what lives here

This folder carries the site's operational documentation only: **`publishing-a-pair.md`**, the publish runbook.

On 9 August 2026 the remaining documentation was consolidated into the corpus repo (`ronroades747-droid/secnt`, private) under the PFW-014 documentation-store assignment — one home per document, cross-referenced rather than duplicated:

| Was here | Now lives at (corpus repo) |
| --- | --- |
| `decisions-locked.md` | `_Methods/decisions-locked.md` |
| `diagram-handoff-contract.md` | `_Methods/diagram-handoff-contract.md` |
| `transcription-spec.md` | `_Methods/transcription-spec.md` |
| `jn-1-4-5-diagram-wiring.md` | `Volumes/Jn1_1-18_Prologue/Cycles/Jn1_4-5/jn-1-4-5-diagram-wiring.md` |

Tombstone pointers stand at the old paths (safe to `git rm` once nothing external depends on them). The site-governing content in those documents remains in force — in particular Decision 5 (`position: anchor` / `<!-- diagram -->` marker placement), which the build enforces; its record is now at `_Methods/decisions-locked.md` in the corpus.

The boundary going forward: site mechanics, schema, and runbooks are documented here; scholarly and production-lane conventions live in the corpus.
