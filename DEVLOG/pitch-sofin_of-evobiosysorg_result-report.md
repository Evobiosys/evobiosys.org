# Result report — SoFin pitch page

**Built:** `/Users/personal/Documents/code/other/evobiosys.org-pitches/pitch/sofin.html` (permalink `/pitch/sofin/`), ~55 KB, self-contained, `layout: null`.
**Replaces:** the early-2025 SoFin pitch deck, as a webpage — deck's soul carried, updated to 2026 reality, with a dedicated honesty station.

## Design system

Regenerative-finance green/gold, drawn from the holon page palette. Green (`#1a5c3a` / light `#2d8a5e` / deep `#0e2f1e` / pale `#e8f4ed`) as the structural brand; gold (`#b8912a` / light `#d4ab3e`, deep `#8f6e17` for AA-legible text/links) as the single accent (hero dot, active rail dot, progress fill, pull-lines). Fonts via one Google Fonts link — **Fraunces** (humanist serif) for display + **Inter** for body — with system-serif/sans fallbacks so it degrades gracefully offline. Water/irrigation motif throughout: tributaries converging to a gilded river-mouth in the hero (stroke-dashoffset draw-in).

Mirrors the exemplar's DNA: fixed left rail-line nav with scroll-spy + progress fill + brand block, collapsing to a sticky horizontal bar under 1060px; numbered station badges; reveal-on-scroll (`.rv`→`.in`) with interval fallback; `prefers-reduced-motion` and print fallbacks; one dark demo section; solid/ghost/gold CTAs.

## Stations (hero + 9 numbered)

1. **Hero** — `SoFin.` gold dot; sub, tag row (UBI · Ventures · Endowments), `← evobiosys.org` + `Holon page →` backlinks, animated watershed SVG.
2. **01 · The request** — deck's opening ask, refreshed; "money alone neither makes happy nor provides the essential physical requirements"; pull-line "Money returning to what it serves. Provision, not predation."
3. **02 · The challenge** — the deck's 5-link causal chain (short-termism → resource vacuum → financial insecurity → purpose as luxury → stifled potential), rendered as an **interactive chain** with connector verbs and a live caption.
4. **03 · The solution** — mirrored 5-chain, endowment-engine version; same interactive component; opens with the honest "the 2025 pitch put an algorithmic-trading engine here … scrutiny moved it onto real-asset ground" line.
5. **04 · Who it irrigates** — three recipient cards: purpose agents (SoUBR floor) / ventures / commons foundations (incl. psychological commons).
6. **05 · From grants to endowments** — grant-vs-endowment contrast + implementations A/B/C cards; explicit "designed, not yet live" framing.
7. **06 · Feel the difference** (dark) — the interactive simulator (below).
8. **07 · Since the 2025 pitch** — dated timeline (2025-02 → now), the two-tier stack diagram, and the **flywheel** (Commons → builders → ventures → commons); pull-line "Boring + local + shipped beats sovereign + visionary + vaporware."
9. **08 · Where it stands** — Already real / Next on the line grid + v0.1–v0.4 roadmap strip.
10. **09 · Let's talk** — vision line, Jakob bio block with honest track-record caveat, `mailto:connect@evobiosys.org?subject=SoFin%20Pitch` ("Write to Jakob").

## Interactive elements

- **Two causal chains** (challenge + solution) — data-driven buttons, click/hover/focus to update caption, arrow-key navigation, `aria-pressed`, `aria-live` caption, focus-visible; collapse to vertical on mobile.
- **Grant-vs-endowment simulator** — three native range sliders (initial €50k–€2M, real yield 0–8%, annual costs €0–120k). SVG twin-line chart over 20 years + live readouts. Math verified across 8 scenarios: default (1M/4%/30k) → sustainable, surplus €10k/yr, endowment grows to ~€1.3M while grant declines; break-even holds principal flat; under-yield draws down honestly ("lasts ~29y vs grant ~17y"); 0% yield behaves exactly like a grant ("no free lunch"); zero-cost compounds. The demo never claims a return. Links to the live simulator.
- **Flywheel** — SVG with three 120°-spaced nodes on a ring (geometry verified: all exactly r=96) and a travelling token via `animateMotion`, injected only when reduced-motion is off (static dot otherwise).

## Honesty decisions

- **No crypto-bot / ROI / performance claims.** The trading thread appears only as the decoupled, separately-licensed venture in the timeline; the "engine moved onto real-asset ground" sentence is stated once, plainly.
- **Endowment/fund = designed and aspirational**, sequenced after the first physical asset — stated in stations 05, 08, and the footer.
- **Flatcoins = inspiration/valuation frame only**, MiCA-aware, "asset first, coin later; regulated, not retail." Never a near-term product.
- **No external individuals named** beyond Jakob — the 2025-04 collaboration is "through collaboration" (Sarah McCrum omitted); the board is "a six-seat internal board review"; the contract is "a bilateral … agreement." No counterparty names.
- **No "Canva" / "v2.3.4"** in visible copy — "the 2025 pitch" / "the original deck" only.
- **Bio track-record caveat** included as an explicit red-team note ("no personal positive investment track record yet … the discipline studied, not yet practised for return").
- No Soaro/Alia anywhere (verified by grep). No AUM.

## Verification done (static + logic — no browser per spec)

- Tag balance: 9/9 sections, 1/1 style, 1/1 script, 5/5 svg.
- Inline script passes `node --check` (no syntax errors).
- All 16 `getElementById` targets exist; all 10 nav anchors resolve to real ids.
- Simulator arithmetic replicated in Node across 8 edge cases — all honest, none misleading.
- Flywheel node coordinates confirmed on the r=96 circle.
- Grep: no Soaro/Alia, no AUM, no "trading bot / grid-bot / reliable low-risk / guaranteed return."

**Not done:** live browser render (spec forbids opening browsers/GUI). Recommend a quick visual pass on the deployed `/draft` before publishing, plus wiring a link to `/pitch/sofin/` from `holons/sofin.html`.

## Left out / deferred

- Kept the challenge/solution chains as two separate stations (per outline) rather than a single toggle, for clarity and DRY via one shared renderer.
- Vision folded into the top of the Let's-talk station rather than its own nav entry, to hold the count at hero + 9.

## Handback prompt

`pitch-sofin done. Result at /Users/personal/Documents/code/other/evobiosys.org-pitches/DEVLOG/pitch-sofin_of-evobiosysorg_result-report.md. Resume: review page, link from holon page, publish.`
