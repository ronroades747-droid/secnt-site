# Publishing a Pair — Production Runbook

*How to take locked Brief prose and a finished lecture and put them live together on secnt.org. Suggested home in the repo: `docs/publishing-a-pair.md`. Supersedes the separate `publishing-a-lecture.md` and `publishing-a-commentary-section.md` runbooks.*

The unit of publication is a **pair**: one Commentary section and the lecture that teaches it. They go live together, in one commit, because the site exposes a pair only when both halves are published. Each half is one Markdown file — the section in the `commentary` collection, the lecture in the `lectures` collection — and both already exist in the repo as stubs with correct frontmatter. Publishing is editing those files and pushing. No template or schema changes are ever needed.

This runbook has three parts: the **rhythm** that governs when things appear, then the two **halves** (section, lecture), then **going live** and the checklist.

---

## The publishing rhythm — incremental exposure

**The site exposes only what is published.** A passage appears on the volume landing only once its first pair is live; its table of contents lists only published pairs and grows as more go live; each pair becomes visible and clickable the moment its own commit lands. There is no "stage the whole cycle and flip it all at once" step — pairs publish one at a time, roughly every day or two, and the live volume always shows finished work and never a "coming" slot.

The order, once per passage:

1. **Open the volume (one time per book).** Set `draft: false` on `src/content/volumes/john.md`. The volume landing (`/commentary/john/`) goes live, opening with its description; no passages are listed yet.

2. **Open the passage (first pair).** Publish the unit landing and Lecture 1 together — `draft: false` on both `commentary/john/1-1-to-3/index.md` and `lectures/john/1-1-to-3/index.md`, `date` set, push. This single trigger makes the passage appear on the volume landing and brings its page into existence: Lecture 1 embeds inline, the TOC lists whatever is published so far, and the line `More to come; check back soon.` shows beneath it.

3. **Publish each pair as it's finished.** Flip the section file and its paired lecture file to `draft: false` in the same commit, set their `date`, push. The pair joins the TOC as a clickable entry and gets its own page. Repeat as each pair lands.

4. **Close the passage (last pair).** In the same commit that publishes the final pair, also set `passageComplete: true` on the unit-landing `index.md`. The `More to come` line retires itself. **This flag is the only manual signal that a passage is finished — nothing infers it, so don't forget it on the last commit.** It goes on the passage `index.md` only, never on the section files.

The **Introduction to John** (volume front-matter) follows the same rule: published last, gated the same way, no reserved or greyed slot — the volume simply opens with its description until the Introduction goes live.

---

## The one rule that prevents almost every mistake

**The stub owns the frontmatter. You supply the body prose only.**

Open the existing section file, leave everything between the `---` fences untouched, and paste the section's prose underneath. Do not rewrite the frontmatter, do not replace the file wholesale, and do not open the body with a title heading.

Why this is the rule and not a preference: the commentary schema (`src/content.config.ts`) requires four fields that have **no default** — `chapter`, `passageRef`, `sectionNumber`, and `sectionType`. A file missing any of them fails the build. Development set those correctly when it built the tree, so they are already in the stub. Pasting prose under them keeps them intact; replacing the file drops them and breaks the build. Identity and presentation belong to the schema and the template; the Brief's prose is the only thing Production adds.

*(One production-owned exception lives in the body: the diagram placeholder marker — see **Diagrams** below.)*

---

## Where the files live

```
src/content/commentary/john/1-1-to-3/NN-slug.md   ← the section
src/content/lectures/john/1-1-to-3/NN-slug.md     ← its paired lecture
```

One file each, sharing the same `NN-slug`. The filename is the section's slug and folder.

**The unit landing is the exception:** the section is `commentary/john/1-1-to-3/index.md` (it has `sectionNumber: 0`, `sectionType: unit-landing`, and carries the §1–§3 front-matter prose), and its lecture is `lectures/john/1-1-to-3/index.md`. Lecture 1 embeds on the landing automatically — no `/lecture/` child route — so the "watch the lecture" link is replaced by the inline video. See *The landing* below.

---

## Half one — the Commentary section

### The frontmatter — Development-owned, do not edit

For reference only. These are already set in every stub. Production never adds, removes, or changes them.

| Field | Set by | Notes |
| --- | --- | --- |
| `title` | Dev | Reader-facing descriptive title. Rendered as the page `<h1>`. |
| `description` | Dev | TOC blurb and meta description |
| `date` | Dev/Prod | Set to the go-live date at the flip |
| `book`, `chapter` | Dev | `chapter` is required, no default |
| `passageRef` | Dev | e.g. `"1:1–3"` with the typographic en-dash. Rendered as *John 1:1–3* |
| `sectionNumber` | Dev | Routing/order only; never reader-facing. Required, no default |
| `verseStart`, `verseEnd` | Dev | Ordering aids; optional |
| `sectionType` | Dev | Required; one of `unit-landing`, `text-critical`, `framing`, `exegesis`, `synthesis`, `theology`, `engagement`, `pastoral` |
| `greekEpigraph` | Dev | Optional polytonic epigraph; rendered under the title |
| `diagram` | Dev | Optional; single object or a **list** (up to two). See *Diagrams* below |
| `license` | Dev | `CC-BY-4.0` |
| `hasLecture` | Dev | Defaults true; drives the "Watch the paired lecture" link |
| `passageComplete` | Dev/Prod | **Unit-landing only.** Dev added the field (default `false`); Production flips it to `true` in the commit that publishes the passage's last pair, retiring the "More to come" line. Ignored on section files. |
| `draft` | Dev/Prod | `true` while staging; flipped at go-live |

The only fields Production touches are `draft` and — on the landing, at passage close — `passageComplete`. Placement of any diagram is production-owned, but it is done in the **body** (a marker), not by editing the frontmatter — see *Diagrams*.

### What goes in the body — Production-owned

The body is the rendered Brief prose, and **only** the prose (plus any diagram marker):

- **Start at `##`.** Never a top-level `#`. The template renders the title as the page `<h1>` from frontmatter; a body `#` produces a doubled title. The body's first heading is the section's first sub-head at `##`.
- **Do not restate in the body:** the passage-reference line, the Greek epigraph, a "watch the lecture" link, or the lecture video. The template renders all four from frontmatter and the lecture pairing. (Quoting the *full* passage text as scholarly content within the prose is fine — that is different from the one-line ref the template prints.)
- **Footnotes** use standard Markdown footnote syntax; they render at section-end in print. Restore any footnotes a text export flattened before publishing.
- **Greek** is inline polytonic; the site font renders it. No special markup.
- **Section cross-references** in the prose (§4, §5.1, …) are fine — they are the Commentary's own structure, not routing numbers, and read correctly to the reader.

### Diagrams

**Placement is production-owned, and it is done with a placeholder marker in the body** — the John 1:1–3 mechanism, now the standard for every page. The frontmatter `diagram` field (Development-owned) supplies the metadata; *where* the figure appears is set by a `<!-- diagram -->` marker you put in the prose, at the point in the argument where the figure belongs.

```yaml
diagram:
  src: ./jn1-1-3-architectural-orientation.svg   # co-located next to this .md
  alt: "Full scholarly-descriptive alt text."
  caption: "Caption rendered under the figure."
  position: anchor
```

In the body, on its own line, at the spot the figure should land:

```
<!-- diagram -->
```

- **One marker per diagram.** The field may be a single object or a **list of up to two**. For two diagrams, put two markers, each on its own line, in the **same order as the list** — the first marker takes the first diagram.
- **A marker must exist for every declared diagram.** `position: anchor` with no marker fails the build (deliberate — a declared figure never silently vanishes). Development seeds the marker when it wires the diagram; you move it to the right point as you place the prose.
- **Co-locate the `.svg`** in the same folder as the `.md`, referenced with a `./` path. The SVG must exist when the field is present, or the build fails.
- **Never hand-roll a `<figure>` or `<img>` in the body.** Raw HTML skips the diagram component — wrong classes, no palette/font inheritance — and ignores the marker entirely, so it renders wherever it was pasted and out of the Visual Register. If you find one pasted in, delete it and put a `<!-- diagram -->` marker where you want the figure.
- `position: top` / `bottom` still work (render outside the prose, before/after the body) but marker placement is the standard.

**Converting the Production sentinel.** Commentary Production marks a diagram's location in its authored prose with a visible `[[DIAGRAM: name]]` sentinel (see `docs/diagram-handoff-contract.md`), not a raw marker — an HTML comment does not survive a Google Doc. At the paste-into-stub step, replace each `[[DIAGRAM: name]]` with a `<!-- diagram -->` marker on its own line at the same position, one per diagram in reading order. That conversion is the Editor's; the sentinel never reaches the committed `.md`, and no `<figure>`/`<img>` ever does.

The unit landing renders diagrams the same way — the marker injects the figure in-body via the diagram plugin, independent of the landing template.

### The landing

The unit landing (`index.md`) works like any section, with three differences, all handled by the template — nothing extra in the file:

- **Lecture 1 embeds inline.** The template finds the lecture whose `sectionRef` points at the landing and renders the video on the page. No `/lecture/` child route, no embed markup in the file.
- **No "watch the lecture" link** — the embed replaces it.
- The body is the §1–§3 front-matter prose (Introduction, Framework, Sources / Method), plus the architectural-orientation diagram's `<!-- diagram -->` marker where you want the figure.

---

## Half two — the lecture

### Before you start

Have these in hand:

- The lecture **uploaded to Bunny Stream** (library `672956`), encoded, with its **16:9 title-slide thumbnail** set in Bunny.
- The video's **GUID** — the long hex string, e.g. `6f660192-a6f4-4c7d-8c7d-f6297f881f19`.

The Bunny library ID is global (already in `src/lib/site.ts`); you never set it per lecture. The thumbnail lives in Bunny and is pulled by the player automatically — it is **not** referenced in the site files.

### The frontmatter

| Field | Required | What it is |
| --- | --- | --- |
| `title` | yes | Public lecture title, form `Lecture N — [descriptor]` |
| `description` | no | One-line gloss |
| `date` | yes | Publication date, `YYYY-MM-DD` |
| `sectionRef` | yes | The **ID of the Commentary section this lecture teaches** (see below) |
| `bunnyVideoId` | yes | The **bare GUID** — see the rule below |
| `youtubeUrl` | no | YouTube mirror link |
| `duration` | no | `MM:SS` or `HH:MM:SS`; rendered if present |
| `license` | yes | `CC-BY-4.0` |
| `draft` | yes | `true` while staging, `false` to go live |

### The two edits that put a video live

1. **`bunnyVideoId`** — paste the **bare GUID only**:

   ```yaml
   bunnyVideoId: "6f660192-a6f4-4c7d-8c7d-f6297f881f19"
   ```

   Not the player URL, not the embed URL, not `player.mediadelivery.net/...` — just the hex string. The site builds the full embed URL around it.

2. **`draft`** — flip to `false`.

### `sectionRef` — make it match exactly

`sectionRef` is the ID of the Commentary section the lecture pairs with: the file path under `commentary/` with no leading slash and no `.md`:

- Section file `commentary/john/1-1-to-3/01-the-text.md` → `sectionRef: john/1-1-to-3/01-the-text`
- For **Lecture 1**, the section is the unit landing: `sectionRef: john/1-1-to-3`

If `sectionRef` doesn't match a real section ID, the build fails (deliberate — it catches a mistyped pairing before it ships). The section page's "Watch the lecture" link and the lecture's back-link are both generated from this one field.

---

## Going live

A pair goes live in one commit that flips both files. Preview first, then commit and push.

### Preview before you flip

Draft content is hidden from a normal build but visible in dev and in a drafts-shown build.

- Local dev (shows all drafts):

  ```powershell
  npm run dev
  ```

- Drafts-shown production build — PowerShell sets the env var differently than bash:

  ```powershell
  $env:SECNT_SHOW_DRAFTS = "1"; npm run build
  Remove-Item Env:\SECNT_SHOW_DRAFTS   # clear it afterward
  ```

A plain `npm run build` shows only non-draft content — exactly what production will serve.

### Commit and push

Git is the source of truth; Cloudflare Pages rebuilds on push to `main`.

```powershell
git pull
git add src/content/commentary/john/1-1-to-3/NN-slug.md src/content/lectures/john/1-1-to-3/NN-slug.md
# if this is the last pair, also stage the landing with passageComplete flipped:
# git add src/content/commentary/john/1-1-to-3/index.md
git commit -m "Publish §… — <descriptor> (section + lecture)"
git push
```

Cloudflare rebuilds automatically. `draft: false` content goes live; `draft: true` content is held back.

---

## Creating a new section + lecture pair

When a new pair must be added to the tree — a later cycle, or a section created after the initial scaffold — it is **two steps across two registers**, not one:

1. **Development** creates the stub — frontmatter with a unique `sectionNumber`, `sectionType`, `passageRef`, etc. — and the paired lecture stub with its `sectionRef`. This is a tree change; it keeps numbering and schema coherent and routes through Development.
2. **Production** then fills the body and publishes the pair, per this runbook.

Do not author a section file from scratch on the Production side. The frontmatter is Development's to set so that `sectionNumber`, the slug, and the section count stay consistent with the rest of the tree.

---

## Checklist (per pair)

**Section**
- [ ] Prose pasted **under** the existing frontmatter; frontmatter untouched
- [ ] Body starts at `##` — no top-level `#`
- [ ] No passage-ref line, Greek epigraph, lecture link, or video embed written by hand in the body
- [ ] Footnotes present and rendering; Greek rendering
- [ ] Diagram(s), if any: `diagram` field with `position: anchor` and the `.svg` co-located; one `<!-- diagram -->` marker per diagram in the body, in frontmatter list order, placed where the figure belongs — **no body `<figure>` or `<img>`**

**Lecture**
- [ ] Video uploaded to Bunny, encoded, 16:9 title-slide thumbnail set
- [ ] `bunnyVideoId` = bare GUID (no URL)
- [ ] `sectionRef` matches the section's ID exactly
- [ ] `title` in `Lecture N — [descriptor]` form

**Going live**
- [ ] Previewed with `npm run dev` (or the drafts-shown build)
- [ ] `draft: false` and `date` set on **both** files, in one commit
- [ ] If this is the **first** pair: the volume (`john.md`) and unit landing (`index.md`) are also `draft: false`
- [ ] If this is the **last** pair: `passageComplete: true` set on the unit-landing `index.md` in the same commit
- [ ] Committed and pushed; Cloudflare rebuild succeeded (green in the Pages dashboard)
- [ ] Opened the live page: title shows once, passage ref and epigraph render, video plays, back-link/embed resolves; any diagram renders once, at its marker, in place; on the unit landing, the `More to come` line is present (or correctly gone, if this was the last pair)
