# Transcription deliverable spec — Roades 1974 digital edition

*The cross-project contract between the source documentation project (which
produces transcriptions) and Development (which publishes them). The source
project's instructions carry this spec; this copy is the versioned record.
Companion to `publishing-a-pair.md`. Current as of June 7, 2026.*

## 0. Source of truth

The PAGE IMAGE is the source of truth. OCR text, if present, may be used only
as a typing aid and must never be trusted — it silently corrupts Greek,
numerals, and sigla. Every word and EVERY NUMERAL (GNO/Migne references,
verse numbers, work numbers) is read from the image. After drafting each
page, make a second pass over the image checking every numeral and every
Greek word character-by-character. A plausible-looking wrong reference is the
worst possible error in this work.

## 1. What is transcribed and what is not

Transcribe: lemmas, apparatus entries, lettered notes — the page's content.
Do NOT transcribe: the typescript's printed page number at the top of the
page (the page marker replaces it), running headers, scan artifacts, or
stray marks.

## 2. Lemma (the verse text at the top of each block)

Bold verse number, then the polytonic Greek exactly as typed, preserving the
thesis sigla ( ) [ ] and all punctuation:

    **3** πάντα δι' αὐτοῦ ἐγένετο, καὶ χωρὶς αὐτοῦ ἐγένετο [οὐδέν][^a] …

Lettered note anchors (a), (b)… become footnote references [^a], [^b]…
placed exactly where the typescript anchors them. NOTE (lemmas are
accented): if a lemma accent or breathing looks absent in the scan, the
prior is that the typescript HAS it and the scan dropped it — verify, do
not assume omission.

## 3. Apparatus entries

Follow the lemma after a line containing only `---`. Each verse's entry is
one flowing paragraph beginning with the bold verse number. Conventions:

- Work titles (Eun., fid., hom. opif., ref. Eun., v. Mos., or. catech., …)
  in *italics*, matching the typescript's underlined titles.
- Johannine wording inside Gregory's text — the Greek the typescript
  underlines — wrapped in `<u>…</u>`.
- Apparatus Greek is UNACCENTED, exactly as the typescript types it. Do not
  add accents or breathings the typescript does not have; do not drop the
  ones it has.
- Sigla and spacing preserved: ". . ." ellipses, "/" dividers, bracketed
  cross-reference strings like [1,4,5,2,18,1], "ADAPT." labels.

## 4. Lettered notes

The typescript's lettered text-critical notes (a), (b)… become markdown
footnotes [^a], [^b]…, each one flowing paragraph, with the same italic and
Greek conventions as the apparatus. Never place a page marker inside a
footnote.

## 5. Page markers

At every typescript page break:

    <span id="pNN" class="page-marker">p. NN</span>

NN = the printed page number of the page that BEGINS at the break; no
leading zeros; unnumbered pages get no marker. Between blocks: marker on its
own line with one blank line above and below. Mid-sentence: inline at the
exact break point with a space each side. If a word breaks across the page
boundary, complete the word first, then place the marker.

## 6. Flowing text

The deliverable is publication markdown, not a line facsimile. Each block
(lemma, apparatus entry, footnote) is one flowing paragraph; the
typescript's line breaks are not preserved. Words hyphenated at typescript
line ends are rejoined with the hyphen dropped (ου-/δεν → ουδεν); hyphens
that are content (GNO 3-1.64.23, compound words) are kept — judge each
against the image.

## 7. Deliverable scope

Body markdown only — no frontmatter, no styling, no CSS.

- Do not include the typescript's chapter heading in the body — it is
  carried by the chapter stub's frontmatter title. (Earlier spec versions
  converted "Chapter 1" → `## Chapter 1`; that doubles the heading and is
  now removed.)

## 8. Self-check before delivery

Re-read the delivered text against the page image one final time, numerals
first, lemmas second. If any character is illegible in the scan, mark it
[illegible: …?] rather than guessing.

- Look-alike substitutions to check explicitly, alongside numerals: φ↔ω
  (e.g. τω/τφ, λογω/λογφ), and the breathing/accent on lemma vowels.

## Acceptance on the Development side

On receipt, Development checks the delivery against the facsimile (numerals
first, lemmas second, conventions third) before pasting it under the
chapter stub's frontmatter. Failures route back to the source project as
observations — deliveries are not repaired at paste time. Ron's substantive
verification pass (including underline-boundary judgment calls) precedes
the draft flip.
