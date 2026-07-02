# Handover — Kidur pitch page

**Read first:** `DEVLOG/pitch-system_of-evobiosysorg_handover.md` (shared spec) and the exemplar it points to.
**Write to:** `/Users/personal/Documents/code/other/evobiosys.org-pitches/pitch/kidur.html` (permalink `/pitch/kidur/`)
**Result report:** `/Users/personal/Documents/code/other/evobiosys.org-pitches/DEVLOG/pitch-kidur_of-evobiosysorg_result-report.md`
**Also read for tone/palette:** existing holon page `holons/kidur.html` in this worktree (terminal/blueprint identity) and the live landing kidur.org (copy quoted below — do not fetch).

## Design identity

Terminal / blueprint. Dark: bg `#0a0e14`, raised `#0f1419`, panel `#131820`, accent terminal-green `#26ffb1` (dim `#1a7a55`, glow `rgba(38,255,177,.15)`). Font: JetBrains Mono (Google Fonts) for display/chrome; a readable system serif or sans for body prose is allowed for long paragraphs (your call — keep it legible on dark). Rail nav dots can render as `▸`/prompt-style. Section badges styled like shell prompts (`~/kidur $ 01 — the problem`) if it stays tasteful. Cursor-blink accent on the hero. This page is dark-first throughout (invert the exemplar's light/dark rhythm: make ONE section light for contrast, e.g. the constellation section).

## Content brief (all verified facts — use these, nothing else)

**Name:** Kidur = Sumerian *ki* (place · base · earth) + *dur* (bond · tie · enclosure) → "the foundational binding structure." Naming quote (Jakob, Dec 2025): "Kidur, K-I-D-U-R, is Sumerian for the foundation."

**Essence:** a personal, privacy-first, sovereign archive for a person's "quests" (projects, notes, recordings, memory) — and, at the EvoBioSys portfolio level, the mission-lock that keeps the whole system from drifting off its north star.

**Problem (verbatim-usable, from kidur.org):** "Most of what we build digitally disappears. Apps shut down, drives fail, formats rot, cloud accounts lapse. The record of what mattered to you — what you were actually trying to do — gets lost with it." Companion problem at org level: vision drift once capital enters a regenerative venture; "greenwashing and extraction dressed as regeneration."

**What it is (kidur.org pillars):**
- Chronological index — organized by when and what-it-was-part-of, not by app or format.
- Privacy by design — "lives on your infrastructure… nothing reaches servers you haven't chosen."
- Developmental trajectory — tracks "the arc: what you were becoming, the quests you carried."
- Built to endure — "designed to be handed on — to family, collaborators, or institutions that carry forward what you couldn't finish." Legacy quests: preserving the quests of people who died without fulfilling their mission.

**The mission-lock (thesis role):** MHS = Mutual Holarchic Sovereignty ("back what increases a holon's sovereignty; refuse what manufactures dependency"). 949 = the target equilibrium (nine power poles sovereignly provide the nine Essential Physical Requirements). One-liner to use: "MHS says how holons relate, 949 names the equilibrium they relate toward — and Kidur keeps them from drifting off it." Anti-"fibrosis" framing: like scar tissue stiffening a living body, an un-guarded system calcifies; Kidur guards the equilibrium.

**Architecture direction (present as direction, not shipped product):** local-first; graph database; integrated workspace (graph + docs + canvas); CRDT layer = Loro (native MovableTree solves structural reparenting); an append-only event log (`kidur.jsonl`) as the spine; federation protocol deliberately deferred until Complete Memory completes. Early Rust crates (kidur-core / kidur-log / kidur-supertag) exist inside the questhub.eco server — describe as "first crates in development", nothing stronger.

**Status (honest):** prototype. kidur.org live (rebuilt 2026-06-20) as a waitlist/landing page — EU-hosted, no tracking, double opt-in. First version being built for personal use: "one person's full digital history, deduplicated, indexed, and made navigable. When that works, it becomes something others can use."

**Funding path:** positioned as "the most fundable-by-grant piece in the whole thesis." Named routes: NGI Zero Commons Fund (€5–50k), Sovereign Tech Fund Germany (€50k–1M rolling), Sovereign Tech Fellowship, Prototype Fund, Horizon Europe CL4-2026-04. Framing: "fund it early as infrastructure, not as a bet" — non-dilutive grants first, then the studio.

**Kin projects (market scan, name-drop as context):** Solid (Tim Berners-Lee), Anytype, Holochain, Nextcloud "Sovereignty 2030", Ink & Switch local-first research. Kidur's differentia: chronological quest-arc + legacy handover + mission-lock, not another notes app.

**Constellation:** lineage Complete Memory → Kidur → SilkNotes. Kidur = substrate/tech foundation; SilkNotes = the authoring layer on top (link to `/pitch/logsilk/` and `/holons/silknotes/`). Part of EvoBioSys ("sovereign infrastructure — tools that belong to the people who use them, designed to evolve over decades rather than extract value over quarters"). Priority #2 in the founder's own ranking.

## Claims you must NOT make

- No claim that the product works today, has users, or that the crates are feature-complete.
- Do not present kidur.jsonl/crates as verified shipped infrastructure — "in development."
- No dates promised for launch. No security/encryption guarantees ("privacy by architecture" = design intent).
- Do not say grants are applied-for or won — they are the identified path.

## Interactive demo (station on… light background for contrast, or keep dark — your call)

"**A life, indexed.**" — an illustrative quest-timeline explorer: a horizontal timeline (SVG or DOM) of one fictional person's quests over ~30 years (e.g. "learn violin", "the garden house", "the unfinished book"…), each a node; clicking/hovering a node opens a terminal-style record card (`quest.jsonl` lines: started, artifacts, status: handed-on / dormant / fulfilled). Include one "legacy quest" inherited from a grandparent to make the endure/hand-on point emotionally. Badge: "Illustrative — no real data." Keyboard accessible. Alternative if you prefer: a typed-command terminal (`kidur query --year 2031`) with canned outputs. Pick ONE and execute it well.

## Station outline (adapt freely, keep 8–10)

1. Hero — `Ki·dur.` (accent on the interpunct), sub: what disappears / what endures. CTA: See the archive (demo) / Let's talk.
2. 01 · The vanishing — the problem (digital work disappears; missions drift).
3. 02 · The name — ki + dur etymology as two interactive panels → "foundational binding structure."
4. 03 · The archive — four pillars (chronological index, privacy, trajectory, endurance).
5. 04 · The demo — quest-timeline explorer (illustrative).
6. 05 · The mission-lock — MHS × 949, fibrosis metaphor; why a portfolio needs a keel.
7. 06 · The stack — architecture direction chips (local-first, Loro CRDT, event log, graph DB), honest "in development" badge; kin projects strip.
8. 07 · Where it stands — Already real (kidur.org live, waitlist, first crates, personal-use build underway) / Next on the line (single-user MVP: one full digital history; grant applications NGI Zero + Sovereign Tech Fund; then others).
9. 08 · The vision — legacy quests; "structured to outlast you."
10. 09 · Let's talk — grant partners, sovereign-infra allies, first archivists. mailto CTA.

**Handback prompt (end your final message with exactly):**
`pitch-kidur done. Result at /Users/personal/Documents/code/other/evobiosys.org-pitches/DEVLOG/pitch-kidur_of-evobiosysorg_result-report.md. Resume: review page, link from holon page, publish.`
