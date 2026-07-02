# Result report — LogSilk / SilkNotes pitch page

**File written:** `/Users/personal/Documents/code/other/evobiosys.org-pitches/pitch/logsilk.html` (permalink `/pitch/logsilk/`)
**Size:** ~55 KB, single self-contained document. Jekyll `layout: null` front-matter; one Google Fonts link (Inter). Zero external JS/images; all CSS inline; all art drawn in SVG.

## What I built

A 10-station interactive pitch modelled on the Unlocking-Housing exemplar's structural DNA, re-skinned in the SilkNotes "silky/flowing" identity (palette pulled from `holons/silknotes.html`: paper `#faf9f7`, accent violet `#8b6cc1`, dark demo section deep-plum `#211c2b` with a glowing `#b79ae4`). Font: Inter (light 300 weights for display, giving the silky feel).

Reproduced exemplar features:
- **Fixed left rail-line nav** — vertical thread-line with dots, scroll-spy `.on` highlighting, scroll-progress fill, `LogSilk / EvoBioSys` brand block. Collapses to a sticky horizontal scrollable bar under 1060px.
- **Numbered stations** — pill badge `01 · The silo`, light display `h2`, lede, content blocks.
- **Hero** — huge `LogSilk.` with violet accent dot, subline, tag row, two CTAs, and a **dual silk-thread SVG** at the bottom drawing in via `stroke-dashoffset` (weaving through five labelled station dots: Markdown → Parser → Supertags(lead) → Atoms → Local AI).
- **Reveal-on-scroll** (`.rv`→`.in`, scroll handler + resize + 350 ms interval fallback), `prefers-reduced-motion` and `@media print` fallbacks throughout.
- **One dark interactive demo section**, stat tiles, decision cards, two-column Already-real / Next-on-the-line status grid, a v0.x roadmap strip, a constellation strip, a big vision-style horizon line, a solid violet-gradient "Let's talk" close with mailto CTA, and a small footer.

## Stations

1. **Hero** — `LogSilk.`; sub "your knowledge, on your machine, woven whole … in plain `.md` … forever"; hero topline carries `← evobiosys.org` and `Holon page →`.
2. **01 · The silo** — cloud dependency + format lock-in + silo fragmentation; EU digital-sovereignty frame; German gloss *bleibt bei dir* (stays with you).
3. **02 · The wager** — Rust rewrite of file-based Logseq 0.10.15; `.md` canonical, SQLite index behind a trait seam; sibling parity layer.
4. **03 · The engine room** — 4 stat tiles (1096/1096 mldoc blocks, 226 engine tests, 104 parity tests, 44 MB binary), 4 concept cards (supertags+extends, atoms/anchors on Loro CRDT + ADR-0001, live queries + local Ollama qwen3 AI, journal-safety gate), stack chips.
5. **04 · The demo** — dark silk interactive mini-outliner (see below).
6. **05 · Decisions that hold** — 4 "Locked" cards (md+SQLite trait seams, Loro CRDT, Tauri+React with Flutter explicitly rejected, sibling-repo layering); "boring choices, deliberately."
7. **06 · Where it stands** — Already-real vs Next-on-the-line grid; v0.1→v0.5 roadmap strip (v0.5 marked "now"); a "designed-for, deferred" callout for multiplayer/federation/Postgres/Notion.
8. **07 · The SilkNotes horizon** — typed bridges (file-level / API adapters / output API), "no Zapier required", open-source free tier + premium support, silknotes.one flagged as placeholder.
9. **08 · The constellation** — Complete Memory → *Kidur* → LogSilk→SilkNotes strip, with a link to `/pitch/kidur/`; "tools that belong to the people who use them."
10. **09 · Let's talk** — 3 audience cards (OSS contributors / EU sovereign-tech funders / early adopters); `mailto:connect@evobiosys.org?subject=LogSilk%20Pitch`; Jakob Possert-Bienzle · EvoBioSys · Vienna.

## Interactive demo — "The outliner, alive"

Pure DOM/JS mini-outliner (10 hand-written nodes rendered from a JS model), badged **"Illustrative demo — the real engine runs local-first in Rust."** Three interactions, all keyboard-accessible:

1. **Tap a `#supertag` chip** (a real `<button>`) → side panel renders that tag's typed field schema. `#quest` demonstrates **`extends`**: it shows Status + Owner marked *inherited from #project* plus its own Due field. When triggered from a specific node, the panel also lists that node's actual field values. Panel closes via × button or `Esc`.
2. **Live-query bar** — three preset query buttons (not free text): `#book` (2 matches), `#quest · Owner :: Jakob` (2, a typed field inherited from #project), `Status :: reading` (1, a field query cutting across supertags), plus `clear`. Matching nodes highlight and gain an inline result badge; non-matching leaf nodes dim (group headers stay legible); an `aria-live` status line narrates the count. Buttons toggle off on second click.
3. **Hover/focus a `((block-ref))`** → the referenced node glows elsewhere in the tree (violet halo). Two refs wired: `((anchored ranges))` → ADR note, `((Ada))` → the #person node. Keyboard: refs are `tabindex=0 role=button`; Enter/Space triggers a timed 1.4 s glow.

Verified in Node: query counts (2/2/1) and both ref targets resolve; full script passes `node --check`.

## Honesty decisions taken

- **Followed my brief over the holon page's aspirational copy.** `holons/silknotes.html` presents PostgreSQL persistence, WebSocket sync, Screenpipe, and "Working" Logseq/Obsidian/Cursor/Notion bridges as if live. My brief marks Postgres/graph-DB backend, multiplayer, federation and Notion sync as **deferred**, and the bridges as horizon/planned. The pitch therefore frames all interop bridges as **Planned**, and carries an explicit "designed-for, deferred" callout naming multiplayer/federation/Postgres/Notion — plus a footer disclaimer. No user counts, no release date, no "beta available." Status reads "a working prototype used by the person who built it."
- **silknotes.one** described as holding a placeholder today, product living in the prototype — not implying a shipped product.
- **Every figure comes from the brief** (1096/1096, 226, 104, 44 MB, dates 2026-06-12 / 2026-06-20 / 2026-07-02). A fineprint line attributes them to the project's own suites; the demo is explicitly hand-written illustration.
- German gloss *bleibt bei dir* used with English translation. I deliberately did **not** assert an etymology for *Kidur* (Sumerian origin unverified) — italicised it as a name and described its role only.

## Left out / notes

- The `Holon page →` link and footer point to `/holons/silknotes/` (there is no `/holons/logsilk/`; LogSilk's holon is SilkNotes). The constellation section links `/pitch/kidur/` (a sibling agent's page).
- Kept to the honest engineering-status register rather than the holon page's broad feature-vision list; omitted Global Wiki Tree, InfraNodus/Fileverse partner names, lex.page, read-receipts, etc. — out of scope for the LogSilk-engine pitch and not in my verified brief.
- File is 55 KB (top of the 35–55 KB target) due to the interactive demo; still a single self-contained document.

pitch-logsilk done. Result at /Users/personal/Documents/code/other/evobiosys.org-pitches/DEVLOG/pitch-logsilk_of-evobiosysorg_result-report.md. Resume: review page, link from holon page, publish.
