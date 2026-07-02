# Result report — Kidur pitch page

**File written:** `/Users/personal/Documents/code/other/evobiosys.org-pitches/pitch/kidur.html` (permalink `/pitch/kidur/`)
**Size:** ~59.5 KB (slightly over the ~55 KB soft target; content-dense, all inline, no external assets beyond one Google Fonts link).
**Status:** complete, self-contained, validated (JS parses clean under `node --check`; braces/parens/brackets balanced; all rail anchors resolve to existing section IDs).

## What was built

A dark-first terminal/blueprint pitch page mirroring the exemplar's structural DNA (fixed left rail-line nav with scroll-spy + progress fill, numbered stations, reveal-on-scroll, one interactive demo, stat tiles, status grid, roadmap strip, vision line, solid closing CTA, small footer) — inverted to a dark palette per the Kidur identity, with exactly ONE light section for contrast (the vision/lineage station).

**Design system:** JetBrains Mono (Google Fonts) for all chrome/headings/badges/code; a system serif (`Iowan Old Style`/Palatino/Georgia) for long body prose — legible on dark, per the handover's explicit allowance. Palette taken verbatim from the brief (bg `#0a0e14`, panel `#131820`, terminal-green `#26ffb1`, dim `#1a7a55`, glow `rgba(38,255,177,.15)`, plus cyan/amber/purple/red accents). Grid-line background echoes the holon page. Section badges styled as shell prompts (`~/kidur $ 01 — the vanishing`). Cursor-blink on the hero wordmark `Ki·dur` (accent on the interpunct). Hero decorative SVG = an append-only event-log spine drawing in via stroke-dashoffset, thematically tied to `kidur.jsonl`.

## Station list (10)

1. **Hero** — `Ki·dur`, blinking cursor, disappears/endures subline, `← evobiosys.org` + `Holon page →` links, two CTAs, animated log-spine.
2. **01 · The vanishing** — the problem (digital work disappears + missions drift once capital enters), three stat tiles.
3. **02 · The name** — interactive two-panel etymology (tap `ki` / `dur` to decode; when both open, the result line "foundational binding structure" lights up). Includes the verbatim Jakob naming quote.
4. **03 · The archive** — four pillars (chronological index, privacy by design, developmental trajectory, built to endure) with verbatim kidur.org phrasing.
5. **04 · A life, indexed** — the interactive demo (details below).
6. **05 · The mission-lock** — MHS × 949 cards, the exact one-liner, plus an interactive "fibrosis / guarded keel" toggle: a drifter node either holds at the 949 equilibrium (guarded) or drifts off and calcifies (un-guarded).
7. **06 · The stack** — architecture-direction chips (local-first, graph DB, integrated workspace, Loro CRDT, kidur.jsonl), honest "in development" badge, three crate cards, kin-projects strip, differentia line.
8. **07 · Where it stands** — Already real / Next on the line two-column grid, roadmap strip, funding-path list with amounts + honest disclaimer.
9. **08 · The vision** — **the light/blueprint section** (paper background, dark ink, deep-green accent): Complete Memory → Kidur → SilkNotes lineage SVG + cards (links to `/pitch/logsilk/` and `/holons/silknotes/`), legacy-quest promise, big vision line "structured to outlast you."
10. **09 · Let's talk** — three doors (grant partners / sovereign-infra allies / first archivists), `mailto:connect@evobiosys.org?subject=Kidur%20Pitch`, "Write to Jakob", Vienna attribution.

## Interactive elements

- **Etymology panels** — click/keyboard buttons, `aria-expanded`, combine into the result line.
- **Quest-timeline explorer** (the assigned demo) — SVG horizontal spine, 1966–2033. Seven quests of one fictional life as nodes; selecting one (click, focus, `Enter`/`Space`, `←/→/Home/End` roving) opens a terminal record card rendering `quest.jsonl` lines with colored key/val/num syntax, a status chip, and an emotional note. **One legacy quest** (grandfather's alpine-wheat seed-bank, 1968, inherited 2016, status `carried-forward`, shown dashed violet) is the default selection — leads with the endure/hand-on point. Arc closes with a 2031 `handed-on` quest. Badge: "Illustrative — no real data." Larger invisible hit-targets for touch; keyboard hint row shown.
- **Mission-lock keel toggle** — `aria-pressed` button animating drift vs. hold.
- Rail scroll-spy, progress fill, reveal-on-scroll with interval fallback, `prefers-reduced-motion` honored on every animation, print fallback (rail hidden, reveals forced visible).

## Honesty decisions

- Crates and `kidur.jsonl` framed strictly as "first crates in development" / "design commitments in development" — never shipped/feature-complete.
- kidur.org described as live waitlist landing page (rebuilt 2026-06-20, EU-hosted, no tracking, double opt-in) — the one thing that genuinely is live.
- Privacy framed as "privacy as architecture — a design intent, not a policy promise" — no encryption/security guarantees.
- Grants: "These name the path; none is applied-for or won."
- No launch dates. All demo data explicitly badged illustrative/fictional.
- Federation described as "deliberately deferred until Complete Memory completes."

## Deviations / notes

- The older holon page (`holons/kidur.html`) lists Apache AGE + Yrs; the handover brief supersedes that with **Loro CRDT + graph DB + kidur.jsonl**. I followed the handover (authoritative) for all stack facts.
- Slightly over the KB soft ceiling (59.5 vs 55) — dense, honest content; no external assets. Trimmable if needed but not at the cost of the demo or honesty framing.
- Could not run a live browser render (subagent constraint: no GUI/browser). Verified via static parse, bracket balance, anchor/id cross-check, and pure-logic unit checks under `node`. Recommend a quick visual pass on the reviewing session.
- No content left out — all brief facts placed.
