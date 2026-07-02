# Handover — LogSilk / SilkNotes pitch page

**Read first:** `DEVLOG/pitch-system_of-evobiosysorg_handover.md` (shared spec) and the exemplar it points to.
**Write to:** `/Users/personal/Documents/code/other/evobiosys.org-pitches/pitch/logsilk.html` (permalink `/pitch/logsilk/`)
**Result report:** `/Users/personal/Documents/code/other/evobiosys.org-pitches/DEVLOG/pitch-logsilk_of-evobiosysorg_result-report.md`
**Also read for tone/palette:** existing holon page `holons/silknotes.html` in this worktree (silky/flowing identity).

## Design identity

Silky, light, flowing. Palette from the holon page: bg `#faf9f7`, warm `#f5f2ee`, deep `#e8e2d9`, text `#2c2825`, soft `#6b6360`, accent violet `#8b6cc1`. Font: Inter (Google Fonts) for display; system serif optional for body. The dark demo section can go deep-plum/ink (e.g. `#211c2b`) with the violet accent glowing. Thread/weave motifs: a drawn SVG "silk thread" in the hero (like the exemplar's corridor line), weaving through station dots.

## Content brief (all verified facts — use these, nothing else)

**Naming:** **SilkNotes** = the product vision — an open-source, local-first, EU-sovereign knowledge OS; future home silknotes.one (today a placeholder). **LogSilk** = its engine — a from-scratch Rust rewrite of file-based Logseq 0.10.15 (`.md` vanilla). A sibling layer (internally "tana-on-logsilk") rebuilds the full Tana feature envelope on LogSilk's crates. Public page leads with **LogSilk** as title, frames SilkNotes as the horizon. Kidur = the substrate underneath (link `/pitch/kidur/`).

**Problem:** Your second brain lives in someone else's cloud. Outliner tools that people run their lives on (Tana et al.) are closed, non-local, non-EU-sovereign; the workflow they hold — typed supertags, fields, live queries, AI commands — has become mission-critical with no exit. Knowledge silos don't interoperate. Broader frame: EU digital sovereignty, local-first ("your notes on your machine, in plain `.md` you can read in any editor forever").

**How it works / key concepts (explain each in one clean sentence):**
- Plain Markdown stays canonical; a derived SQLite index provides speed (swappable storage engine behind a trait).
- The parser: a native-Rust reimplementation of Logseq's `mldoc` grammar — differential-tested to a 100% match on 1096/1096 blocks of a real corpus.
- Supertags: typed templates with fields, including schema inheritance (`extends`).
- Atoms & anchors: per-word/per-range references built on the Loro CRDT — anchored ranges survive concurrent edits (tested, incl. delete-boundary and concurrent-interior cases; documented in ADR-0001).
- Live queries + AI commands: local inference via Ollama (live-verified with a local qwen3 model) — no cloud calls.
- App shell: Tauri (Rust) + React outliner/prose/canvas/daily-notes; a 44 MB desktop binary confirmed launching.
- Safety: journal-safety gate — backup-first, refuses to touch today's journal file.

**Verified status (use, with dates):**
- LogSilk engine: 226 Rust tests; parser + model/extract/serialize passes GREEN (mldoc pass done 2026-06-12).
- Tana-parity layer: 104 tests; milestone tags v0.1 model → v0.2 supertags → v0.3 queries → v0.3.5 safety → v0.4 UI → v0.5 (2026-07-02: backlink badges, tag-vs-page detection, domain-`.md` mirrors). "Prototype Definition-of-Done reached" 2026-06-20.
- Locked decisions: sibling-repo layering; Loro CRDT; `.md` + SQLite behind trait seams; Tauri+React (Flutter explicitly rejected); anchored-range atoms.
- Daily-driver proof: "SuperLogseq" — vanilla Logseq running with the Rust parser dropped in, used on the founder's real vault.

**Roadmap (honest):** next load-bearing gap = cross-graph block embedding (M3) — resolving `((block-uuid))` across nested graph boundaries; then bidirectional writing, page⇄graph equivalence, all-pages filtering. Later tier: semantic search (local embeddings), automatic linking/unlinked mentions, canvas⇄outliner toggle, visual graph view. Explicitly deferred: multiplayer, federation, Postgres/graph-DB backend, Notion import/export (the CRDT + trait seams exist so these stay possible).

**SilkNotes horizon:** interoperating knowledge silos — typed bridges between tools (Logseq, Obsidian file-level; API adapters for proprietary tools), a unified output API, "no Zapier required"; open-source free tier + premium support; silknotes.one as future home.

**Constellation:** Complete Memory → Kidur → SilkNotes; LogSilk = engine. EU-sovereign, open-source; "tools that belong to the people who use them."

## Claims you must NOT make

- No user counts, no release date, no "beta available." It's a working prototype used by its builder.
- Don't claim multiplayer/federation/Notion sync exist — "designed-for, deferred."
- Don't claim the full Tana envelope is done — supertags/fields/atoms/queries/AI-commands work at prototype level; canvas integration and semantic search are still ahead.
- silknotes.one currently shows a placeholder — don't imply a product lives there yet.

## Interactive demo

"**The outliner, alive.**" — an illustrative mini-outliner (pure DOM/JS): ~10 prewritten bullet nodes; some carry supertags (`#book`, `#person`, `#quest`) with fields. Three interactions: (1) click a supertag chip → side panel shows its typed fields (schema incl. one `extends` example); (2) a live-query box with 2–3 preset queries (buttons, not free text) that filter/highlight matching nodes live; (3) hover a `((block-ref))` inside one node → the referenced block glows elsewhere (the atom/anchor idea). Badge: "Illustrative demo — the real engine runs local-first in Rust." Keyboard accessible.

## Station outline (adapt freely, keep 8–10)

1. Hero — `Silk.` or `LogSilk.` with accent dot; sub: your knowledge, on your machine, woven whole. Thread SVG draw-in.
2. 01 · The silo problem — cloud dependency + tool lock-in + silo fragmentation.
3. 02 · The wager — rewrite the engine in Rust on plain `.md`; sovereignty through boring formats.
4. 03 · The engine room — parser 1096/1096, 226 + 104 tests, stat tiles; concept chips (supertags, atoms, live queries, local AI, journal-safety).
5. 04 · The demo — mini-outliner (dark silk section).
6. 05 · Decisions that hold — the locked architecture decisions as cards (Loro CRDT, trait seams, Tauri+React, md+SQLite) — "boring choices, deliberately."
7. 06 · Where it stands — Already real (prototype DoD, v0.5 milestone, SuperLogseq daily-driving the real vault) / Next on the line (cross-graph embeds, bidirectional writing, semantic search).
8. 07 · The SilkNotes horizon — bridges/interoperation, silknotes.one, open-source + premium support model.
9. 08 · The constellation — Kidur substrate, Complete Memory lineage, EvoBioSys.
10. 09 · Let's talk — open-source contributors, EU sovereign-tech funders, early adopters who live in outliners. mailto CTA.

**Handback prompt (end your final message with exactly):**
`pitch-logsilk done. Result at /Users/personal/Documents/code/other/evobiosys.org-pitches/DEVLOG/pitch-logsilk_of-evobiosysorg_result-report.md. Resume: review page, link from holon page, publish.`
