# evobiosys.org/idle-compute - design spec

**Date:** 2026-05-05
**Page URL:** https://evobiosys.org/idle-compute
**Status:** Spec draft, awaiting Jakob review before writing-plans
**Brainstorming session:** /root/projects/evobiosys.org/.superpowers/brainstorm/287694-1777972778/
**Sibling handover:** /root/resources/chat-handovers/idle-compute-co-creator-recruitment.md (Option C, held back)

## Overview

A subpage of evobiosys.org that explains the idle-compute thesis as a manifesto-with-showcase, in the EvoBioSys voice (contemplative + sovereign + technical). Audience is the values-aligned reader already in the EvoBioSys orbit, not a cold sales page. The page subtly invites co-creators in its closing section but holds back the full recruitment track for a future Option C page.

## Architecture / page IA

Eight sections, top to bottom, sized roughly proportional to planned word count.

### 1. Masthead

- **Title:** "Idle Compute" (one line, Inter or similar, generous letter-spacing)
- **Sub-thesis:** one sentence stating the three-things-at-once definition: local renewable energy that would otherwise be lost + computers that aren't being used + tasks that don't need to happen now.
- **Mood:** cosmic-cycle and nature-cycle vocabulary; no hero image; let typography breathe. EU palette accents (#003399 blue, #FFCC00 yellow) used sparingly.

### 2. The cycle (manifesto core)

Three named criteria in a small list or three-column layout:

- **Energy:** local renewable that would lose to transport or storage.
- **Compute:** chips and machines available locally, not in use right now.
- **Workload:** tasks that can wait until both align.

Closing paragraph names the bottleneck twist: human review is the real constraint on AI improvement, so deferring AI work to renewable peaks costs nothing in throughput. Distinguishes idle compute from on-demand compute (which doesn't wait).

### 3. Cooling (separate from idle)

Short section (one paragraph) clarifying that all three tiers are ideally Fernwärme-cooled, possibly in different physical locations. Pattern pioneered by Infomaniak. Location pattern: old factory halls, ungleich-style colocation. Cooling is on-demand because heat doesn't wait; this distinction is what keeps idle compute from being conflated with the whole infrastructure.

### 4. Three tiers

Three-row table or three-card layout:

| Tier | Name | Compute | Workload | Energy mode |
|------|------|---------|----------|-------------|
| 1 | Stardust | Any compute, even barely-powerable old PCs | Always-on hosting and storage | Constant minimal |
| 2 | Sternschnuppe (Shooting Star) | Old machines too slow for daily use, still capable | Transcription, Whisper Free V3 class, light tasks | Renewable-overflow pulses |
| 3 | Star | Proper chips and GPUs | Actual LLM work | Renewable-overflow + Fernwärme cooling |

**Naming attribution:** *Stardust* credited to Scaleway's discontinued tier of the same name. *Sternschnuppe* (German for shooting star, literally "star-snuff") chosen for the atmospheric-event framing: matter captured by atmosphere releases visible energy in a brief pulse, then frees the path. Maps onto bursty light tasks like transcription.

**Naming caveat:** placeholder names. Can change later if a better fit emerges.

### 5. In action (showcase)

Two examples, each one short paragraph plus a link.

- **SoTranscribe Patient Green** (live, tier 2). €8/month, 300 minutes, queues transcripts for sun + wind peaks. Hosted on Anexia in Klagenfurt and Wien. 100% renewable. Quote the live tier from sotranscribe.com/#patient-green as the working proof.
- **forkaway** (forthcoming, tier TBD). One-line description: a sovereign alternative-finder, helping non-techies fork away from Big Tech tools. Will most likely run on Stardust as static hosting, possibly with Sternschnuppe components if it does AI-assisted matching. Tier confirmation pending; placeholder copy reads "forkaway, forthcoming - we will publish this section once forkaway is live".

### 6. Side note: federation (subtle)

Two paragraphs maximum. Frame: federated tier-2 and tier-3 nodes form a pool. Default trust posture treats all federated work as public, like public Telegram comments where mutual trust is assumed but the content is not load-bearing private. Private workloads stay on the trusted-stack channels of the parties who own them.

Closes with: "More on this when the federation pool is ready to accept nodes."

### 7. If this resonates (subtle co-creator CTA)

One paragraph. Mailing list link, a contact line, "we will publish a how-to-host-or-donate guide" pointing to the future Option C page. Soft, not loud. No funnel, no "Apply now" buttons.

### 8. Footer credits

Inline attribution line (small font, end of page):

> Stardust naming credited to Scaleway. Fernwärme cooling pattern credited to Infomaniak. Old factory hall hosting inspired by ungleich.

## Tier model (canonical definitions)

For future references and downstream artifacts, the canonical tier definitions:

- **Stardust:** any compute at all, including old PCs that are slow or only barely boot. Use case: hosting and storage. Energy: constant minimal trickle, ideally Fernwärme-cooled.
- **Sternschnuppe (Shooting Star):** old machines too slow for daily use as a daily driver, still capable enough to run transcription, Whisper Free V3 class, and similar light AI tasks. Cannot run general LLMs. Energy: pulses with local renewable peaks.
- **Star:** workstation- or server-class hardware with proper CPUs and GPUs. Runs LLMs and other heavy AI work. Energy: pulses with local renewable peaks plus Fernwärme cooling.

The "any compute" boundary at Stardust is intentional - the lowest tier accepts hardware that has been retired from daily use entirely.

## Content directives

### Tone and register

- Cycles-with-nature framing throughout. Cosmic vocabulary (stardust, atmospheric event, ignition) and ecological vocabulary (renewable, regenerative, peaks) both fit.
- Contemplative + technical, not breathless or pitchy.
- Sovereignty language (regenerative, local, sovereign) is welcome but not the loudest signal. The energy-and-attention thesis is the loudest signal.

### Hard constraints

- **No em-dashes anywhere** (per HARD TRIGGER m-268). Use hyphens. Verify with `grep -cP '\x{2014}'` before push (must return 0). The character to avoid is U+2014.
- **No "honest" framing** when comparing schemas (per HARD TRIGGER m-202605-aaa003). Use "better presentation" or "precise".
- **Federation as side note**, not central pillar. Two paragraphs max in section 6.
- **Option C content** (donor and operator recruitment) does not appear on this page. The closing CTA hints at it; the full track waits.
- **Stardust attribution to Scaleway** appears in the tier section AND the footer.

### Words to use

- "Idle compute", "renewable peaks", "Sternschnuppe", "stardust", "star", "cycle", "Fernwärme", "deferred review".

### Words to avoid

- "Cloud" (we are not cloud-positioned).
- "Cheap" (we are not optimizing for price; we are optimizing for fit).
- "Crypto" (no crypto associations even though some patterns rhyme).
- "Mining" (same).
- Pitch-deck verbs like "leverage", "unlock", "scale", "disrupt".

## Tech stack and build approach

- Jekyll page in /root/projects/evobiosys.org, following the existing per-holon pattern (see holons/idea2life.html as a styling reference).
- Page lives at /root/projects/evobiosys.org/idle-compute.html with `permalink: /idle-compute/` so the URL is evobiosys.org/idle-compute (clean, no .html).
- Self-contained `<style>` block scoped with a page-class wrapper (e.g. `.ic-page`), following the idea2life.html pattern. No new global CSS.
- Inter font (already loaded by default layout).
- No JavaScript framework, no build step beyond Jekyll itself.
- Atkinson Hyperlegible may be used for tier-name display if it improves clarity; otherwise Inter.
- Default layout (`_layouts/default.html`) supplies the navigation and footer; the page only writes its own content section.

## Content sourced from this brainstorming

### Tier 1 (Jakob explicit)

- Three tiers, with stardust as tier 1 = any compute including barely-powerable old PCs.
- Tier 2 = old machines, transcription, Whisper Free V3.
- Tier 3 = proper chips + GPUs, LLM work.
- Energy criterion: local renewable that would otherwise have transport/storage loss.
- Cooling criterion: Fernwärme on all tiers ideally, possibly separate locations.
- Location pattern: old factory halls, ungleich-style.
- forkaway and SoTranscribe (Patient Green specifically) as application examples.
- Federation: side note, public-by-default pool, separate trusted-stack channels for private content.
- Human attention as the real bottleneck, deferred review pairs naturally with idle compute.
- Cycles-with-nature linguistic register.
- Stardust naming credited to Scaleway.
- Sternschnuppe (Shooting Star) for tier 2; Star for tier 3.
- Option A (manifesto + showcase) as the framing; subtle co-creator inspiration.
- Option C (full recruitment track) held back for a future session.

### Tier 2 (inferred from Jakob's words)

- Audience is values-aligned EvoBioSys-orbit reader, not cold sales.
- Tone is contemplative + technical (cosmic + Fernwärme registers both fit).
- Page primary job is conviction and inspiration, not conversion.
- Sternschnuppe-as-atmospheric-event metaphor (matter captured, energy released, path freed) maps onto tier-2 bursty workloads.

### Tier 3 (suggested by AI)

- Eight-section IA proposal (above) as the concrete page structure.
- Stardust attribution placed both in the tier section and the footer for visibility.
- A "more on this when the federation pool is ready" line to defer federation cleanly.
- Soft CTA pointing to a forthcoming Option C page rather than a loud recruitment block.

## Out of scope (this page)

- Donor and operator recruitment funnels.
- Federation onboarding flow.
- Technical FAQ for self-hosters.
- Compensation models for federated nodes.
- Geographic prioritization details.
- All of the above belong on the future Option C page (handover doc already written).

## Open items before publish

- **forkaway tier confirmation** - placeholder reads "forthcoming, tier TBD" pending Jakob's one-line description and tier choice. Spec proceeds with this as a known gap.
- **Masthead phrasing** - first draft will offer two or three candidate one-sentence theses; Jakob picks one before publish.
- **Hero element** - currently spec says "no hero image, let typography breathe". Open to a small cosmic-cycle SVG or animated background if it fits the cycles-with-nature register without becoming sales-y. Default: none.

## Success criteria

- The page reads as a manifesto, not a pitch.
- A reader unfamiliar with idle compute can explain the three-criteria definition (energy, compute, workload) after one read.
- The Sternschnuppe and Stardust framings stick (memorable enough to be recalled in conversation).
- SoTranscribe Patient Green and forkaway (when live) are visibly grounded in the tier framework, not bolted on.
- The federation side note is short enough that no reader thinks the page is about federation.
- The closing CTA reads as an invitation, not a recruitment funnel.
- `grep -cP '\x{2014}'` returns 0 on the rendered HTML (no U+2014 em-dashes).
- Jakob can copy-paste any of the eight section descriptions into a separate context (e.g. an essay, a fundraising note) and it stands alone as a thesis fragment.

Instructed by: Jakob
