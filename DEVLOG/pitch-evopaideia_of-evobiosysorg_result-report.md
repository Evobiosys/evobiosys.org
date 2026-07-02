# Result report — EvoPaideia pitch page

**Page:** `/Users/personal/Documents/code/other/evobiosys.org-pitches/pitch/evopaideia.html` (permalink `/pitch/evopaideia/`)
**Size:** ~50.7 KB, self-contained, one Google Fonts link (Cormorant Garamond + Inter), zero external JS/images.

## What was built

A single-file interactive pitch mirroring the Unlocking Housing exemplar's structural DNA, re-skinned in the EvoPaideia holon identity: wine palette (`#6b2140` / `#8a3a5c` / `#4a1530`), warm parchment/cream, gold accent (`#c9a84c`), Cormorant Garamond display + Inter UI. Fixed left rail-line nav with scroll-spy dots, scroll-progress fill, and the `EvoPaideia / EvoBioSys` brand block; collapses to a sticky horizontal bar under 1060px. Reveal-on-scroll (`.rv`→`.in`) with scroll + interval fallback; `prefers-reduced-motion` and `@media print` honoured throughout.

## Sections (hero + 9 numbered stations)

1. **Hero** — kicker glossing *Παιδεία* (paideía); display word `Unfold.` with gold period; sub bridging both registers; tag row with `← evobiosys.org` and `Holon page →`; two CTAs. Decorative unfurling-spiral SVG draws itself in bottom-band via stroke-dashoffset (path pre-computed, length ~1271 → dasharray 1300), plus a faint oversized Παιδεία watermark.
2. **01 · The narrowing** — credentialing critique, being-a-number, metacrisis why; three qualitative stat tiles; Minerva founder note.
3. **02 · The reframe** — field not catalogue, "tend the soil", MHS autonomy/belonging tension; six principles as chips; the "seed" gold phrase; single umbrella-name note (*Developmental Field*).
4. **03 · The method** — Meet/Hold/Provoke/Reflect as an SVG cycle wheel + phase list ("a cycle, not a ladder"; "growth lives at the edge of the manageable").
5. **04 · The model** — desire-first/degree-second, four model cards (nano-degrees, post-Humboldtian educators, Liminal Village Criteria crediting Roberto Valenti, community of practice); an illustrative nano-degree→degree mapping diagram; a dark SOUBR-floor callout with "lead the mainstream, not the margin".
6. **05 · The ladder** — the interactive demo on deep-wine dark bg (see below).
7. **06 · The first domino** — Prekarium building / floor / people as three pillars; "one building, three pillars, weeks not years"; cross-link button to `/unlocking-housing/`.
8. **07 · Where it stands** — Already real / Next on the line grid; blunt honest-status paragraph; three-segment roadmap strip.
9. **08 · The vision** — the big quote as display pull-quote; federated hubs + childhood→elderhood horizon (marked "horizon, not a claim"); "inherited by being practised" line.
10. **09 · Let's talk** — solid wine bg; four open doors; `Jakob Possert-Bienzle · EvoBioSys · Vienna`; mailto CTA to `connect@evobiosys.org?subject=EvoPaideia%20Pitch`.

## Interactive demo (the one dark-bg interactive)

**"Walk the ladder"** — the container ladder from one call → one-year residency (7 rungs) plus a dashed gate to Degree · Incubator. Controls: a native `range` slider (natively keyboard-accessible: arrows/Home/End), plus clickable/focusable SVG rung dots (role=button, tabindex, Enter/Space + arrow-key navigation, focus-visible outline). Each rung updates a live panel: name, duration, the M/H/P/R cycle chips lit at that scale, "what happens / what it costs / what it proves", and an end-state note that lights up on the final rung. Gold fill line advances along the track. Badged **"Illustrative — containers grow only as fast as their people"**; footer notes no cohort has yet walked it. JS tested in a mock-DOM harness: executes with no runtime error, renders 7 dots, correct dashoffset math, correct chip states.

## Honesty decisions

- No cohort / building / university LOI / accreditation / legal entity claimed as existing — station 07 states each negative explicitly; the *Verein* is framed as foundable "when the first container lands".
- IYG: one clause ("held founder and educator seats in the Integral Youth Gatherings"), zero invented dates/numbers.
- Accreditation framed as the mapped path *after* the residency milestone, never promised.
- The nano-degree "ten → one course from BSc CS, nine from BA Art History" example carries an **Illustrative example** badge and fineprint calling it a worked example, not a measured result.
- The "~90% formed" Minerva note is attributed as the founder's own account, not a metric; fineprint states the pitch cites no unfounded figures.
- First domino explicitly labelled "proposed, not yet executed."
- Capital mechanics: kept light and framed as design; the deeper four-bodies/fund detail was **left out** to avoid overstating a moderate-confidence structure on a public page (brief flagged confidence as moderate; the ladder + first-domino carry the investable story more honestly).
- No "Soaro"/"Alia"; no "EvoSattva"/"Polysattva". "Developmental Field" umbrella noted exactly once. Athena kept to the brief's framing (adults, deliberately small); the holon page's "Kaja" collaborator detail was not surfaced, staying within verified-facts scope.

## Content deliberately left out / condensed

- Full four-bodies capital architecture (Foundation/teaching/incubator/fund) and funding-source list (City of Vienna, philanthropy, family offices, Erasmus) — omitted to keep the page honest and uncluttered; reducible to the "then universities / then incubator" roadmap tail.
- The "Onion of Truth" signature practice — cut for length; the method section already carries the practice-led feel.

## Verification

Tag balance OK (section/div/svg/script/style/header/footer/nav/main all matched); 9 station chips; mailto + housing cross-link present; no Soaro/Alia (only "antialiased"); JS runs clean in mock DOM. Not opened in a browser per constraints — logic verified programmatically and by inspection.

---

pitch-evopaideia done. Result at /Users/personal/Documents/code/other/evobiosys.org-pitches/DEVLOG/pitch-evopaideia_of-evobiosysorg_result-report.md. Resume: review page, link from holon page, publish.
