# Shared spec — EvoBioSys interactive pitch pages (read FIRST, then your per-project handover)

You are building ONE self-contained interactive pitch webpage for the evobiosys.org Jekyll site (GitHub Pages). Three sibling agents build the other pages in the same worktree — touch ONLY the files assigned to you.

## The exemplar (structural DNA — study it before writing)

Read in full: `/Users/personal/Documents/code/EvoBioSys/Projects/evobioSYS-sys/pitch/unlocking-housing-pitch.html`

That is the "Unlocking Housing" pitch. Reproduce its *kind*, not its content:
- **Fixed left rail-line nav** ("stations" metaphor): vertical line with dots, scroll-spy highlighting, scroll-progress fill, brand block on top. Collapses to a sticky horizontal scrollable bar under 1060px.
- **Sections as numbered stations**: badge chip `01 · The asymmetry` style, big display `h2`, lede paragraph, then content blocks.
- **Hero**: one huge display word + accent-colored punctuation, subline, tag line, two CTAs (solid + ghost), decorative animated SVG at the bottom (stroke-dashoffset draw-in).
- **Reveal-on-scroll** (`.rv` → `.in`, IntersectionObserver or scroll handler + interval fallback), `prefers-reduced-motion` respected everywhere, print fallback.
- **One interactive demo section on a dark background** — sliders/hover/canvas, clearly badged "Illustrative demo".
- **Stat tiles**, **model cards**, a two-column "Already real / Next on the line" status grid, a roadmap strip (v0.x segments), a short vision section with one big styled line, closing "Let's talk" section on a solid accent background with mailto CTA, small footer.
- Vanilla JS only, zero external JS. All CSS inline in one `<style>`. Self-contained.

## Jekyll wrapper (exact)

Write your page to the file path given in your per-project handover, with this shape:

```
---
layout: null
title: "<Title> — EvoBioSys Pitch"
description: >-
  <1-2 line description>
permalink: /pitch/<name>/
---
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><Title> — EvoBioSys</title>
  <meta name="description" content="...">
  <link rel="canonical" href="https://evobiosys.org/pitch/<name>/">
</head>
<body>
... full standalone page ...
</body>
</html>
```

`layout: null` means Jekyll emits your HTML verbatim — you own the whole document. One Google Fonts `<link>` or `@import` is allowed (the site already uses Google Fonts); otherwise system font stacks like the exemplar.

## Voice & honesty rules (non-negotiable)

- Register: the exemplar's voice — confident, warm, precise, European. Hero greeting/opener may play ("Servus." belongs to the housing pitch — find your project's own).
- Lean ePrime: minimize "is/are" constructions in body prose where natural.
- Organic metaphors (cultivate, weave, tend, grow) over martial ones.
- German/Greek/Sumerian terms italic with English gloss in parentheses at first use.
- **Never invent figures.** Every number must come from your handover brief. Anything illustrative gets an explicit "Illustrative" badge or fineprint, exactly like the exemplar's demo.
- **Honest status framing.** These pitches must survive a diligence reviewer. Your per-project handover lists claims you must NOT make. When in doubt, downgrade the claim ("in development", "aspirational", "concept, not commitment").
- Footer line: `<Project> · a holon of the EvoBioSys thesis. © 2026 EvoBioSys.` plus a link to `/holons/<name>/` and `https://evobiosys.org`.
- Contact CTA: `mailto:connect@evobiosys.org?subject=<Project>%20Pitch` with button text like "Write to Jakob". Who: `Jakob Possert-Bienzle · EvoBioSys · Vienna`.
- Rail nav brand block: `<Project><br><b>/ EvoBioSys</b>` pattern.
- Add a small top-left-of-content or hero-tag link back: `← evobiosys.org` and `Holon page →` (to /holons/<name>/) somewhere sensible (hero tag row or footer).

## Quality bar

- 8–10 stations. Total file ~35–55 KB. Every interactive element keyboard-accessible (tabindex, focus-visible) and reduced-motion-safe.
- Test your JS logic mentally for edge cases; no console errors; everything must work when opened as a plain file.
- Responsive: 320px phone → wide desktop. Tables/wide art inside `overflow-x:auto` wrappers.
- No external images. SVG/canvas drawn inline.
- Do NOT mention or link "Soaro" or "Alia" anywhere (archived; hard rule).
- Do not install anything; do not open browsers or GUI apps; do not run servers. You may use `node -e` or `python3` to sanity-check pure JS/logic snippets if you wish.

## Deliverables

1. The page file (path in your per-project handover).
2. Result report: `DEVLOG/<job>_of-evobiosysorg_result-report.md` (path in your handover) — what you built, section list, interactive elements, honesty decisions taken, any content you had to leave out and why.
3. End your final message with the handback prompt line given in your handover.
