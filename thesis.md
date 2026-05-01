---
layout: default
title: Proto Investment Thesis - EvoBioSys Capital
description: >-
  The structural investment thesis behind EvoBioSys Capital. Sovereign access
  to nine essential physical requirements across nine power poles (the 9x9
  framework) as the floor on which all other investing stands. Living systems
  as method, not metaphor.
permalink: /capital/thesis/

# #agent-note: Update `last_updated` ONLY when making substantive content changes
# (refocus, new section, factual revision, materially different framing).
# Skip for typos, whitespace, formatting, link tweaks. Format: "Month YYYY".
# #agent-note: Bump `version` (semver-style v0.x.y) on substantive edits too.
# Patch (z) for tightening, minor (y) for new section / framing shift.
last_updated: "May 2026"
version: "v0.1.2"
---

<style>
  .thesis-page {
    --th-ink: #1a2e25;
    --th-ink-soft: #3b4a43;
    --th-line: #d8e2dc;
    --th-pale: #f5f7f3;
    --th-accent: #2d6a4f;
    --th-gold: #c9a84c;
  }

  .thesis-page .page-header {
    padding: 6rem 2rem 2rem;
  }

  .thesis-page .epigraph {
    font-style: italic;
    color: var(--th-ink-soft);
    margin: 0 0 0.5rem 0;
  }

  .thesis-page .draft-stamp {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--th-line);
    border-radius: 100px;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    color: var(--th-ink-soft);
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .thesis-prose {
    max-width: 720px;
    margin: 0 auto;
    padding: 0 2rem;
    font-size: 1.05rem;
    line-height: 1.75;
    color: var(--th-ink);
  }

  .thesis-prose h2 {
    margin-top: 3.5rem;
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--th-line);
    font-size: 1.6rem;
    letter-spacing: -0.01em;
  }

  .thesis-prose h3 {
    margin-top: 2.25rem;
    font-size: 1.2rem;
  }

  .thesis-prose p { margin: 1rem 0; }

  .thesis-prose strong { color: var(--th-ink); }

  .thesis-prose hr {
    border: 0;
    border-top: 1px solid var(--th-line);
    margin: 3rem auto;
    width: 60%;
  }

  .thesis-prose blockquote.callout {
    margin: 2rem 0;
    padding: 1.25rem 1.5rem;
    background: var(--th-pale);
    border-left: 3px solid var(--th-accent);
    border-radius: 0 6px 6px 0;
    color: var(--th-ink);
  }

  .thesis-prose blockquote.callout p:first-child { margin-top: 0; }
  .thesis-prose blockquote.callout p:last-child { margin-bottom: 0; }
  .thesis-prose blockquote.callout strong { color: var(--th-accent); }

  .thesis-table-wrap {
    position: relative;
    /* Break out of the 720px prose for breathing room on big desktops.
       Spans up to 1280px, centred on the viewport.
       Falls back to prose-width with horizontal scroll on narrow screens. */
    width: min(100vw - 4rem, 1280px);
    margin: 2.5rem 0;
    margin-left: 50%;
    transform: translateX(-50%);
    padding: 0 2rem;
    box-sizing: border-box;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  /* Right-edge fade hints there's more table to scroll to on narrow viewports. */
  .thesis-table-wrap::after {
    content: '';
    position: sticky;
    right: 0;
    top: 0;
    float: right;
    width: 2.5rem;
    height: 100%;
    margin-left: -2.5rem;
    pointer-events: none;
    background: linear-gradient(to right, rgba(255,255,255,0) 0%, rgba(255,255,255,0.95) 100%);
  }

  .thesis-scroll-hint {
    display: none;
    font-size: 0.82rem;
    color: var(--th-ink-soft);
    margin: 0 0 0.5rem 0;
    text-align: right;
  }
  @media (max-width: 720px) {
    .thesis-scroll-hint { display: block; }
  }

  .thesis-table-wrap table {
    width: 100%;
    min-width: 720px;
    border-collapse: collapse;
    font-size: 0.92rem;
    line-height: 1.55;
  }

  .thesis-table-wrap th,
  .thesis-table-wrap td {
    padding: 0.85rem 1rem;
    border: 1px solid var(--th-line);
    vertical-align: top;
    text-align: left;
  }

  .thesis-table-wrap thead th {
    background: var(--th-pale);
    font-weight: 600;
    color: var(--th-ink);
  }

  .thesis-table-wrap tbody tr td:first-child {
    background: var(--th-pale);
    font-weight: 600;
    width: 14%;
  }

  .thesis-table-wrap tbody tr td:last-child {
    background: rgba(45, 106, 79, 0.04);
  }

  .thesis-prose .colophon {
    margin-top: 4rem;
    padding-top: 2rem;
    border-top: 1px solid var(--th-line);
    font-size: 0.92rem;
    color: var(--th-ink-soft);
  }

  .thesis-prose .colophon p { margin: 0.5rem 0; }

  .thesis-prose .thesis-toc {
    margin: 2rem 0 3rem;
    padding: 1.25rem 1.5rem;
    background: var(--th-pale);
    border-left: 3px solid var(--th-line);
    border-radius: 0 6px 6px 0;
    font-size: 0.92rem;
  }
  .thesis-prose .thesis-toc-label {
    margin: 0 0 0.5rem 0;
    color: var(--th-ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.78rem;
  }
  .thesis-prose .thesis-toc ul { margin: 0; padding-left: 1.25rem; }
  .thesis-prose .thesis-toc li { margin: 0.25rem 0; }
  .thesis-prose .thesis-toc a {
    color: var(--th-accent);
    text-decoration: none;
    border-bottom: 1px solid transparent;
  }
  .thesis-prose .thesis-toc a:hover { border-bottom-color: var(--th-accent); }

  @media (max-width: 720px) {
    .thesis-prose { font-size: 1rem; padding: 0 1.25rem; }
    .thesis-prose h2 { font-size: 1.35rem; }
    .thesis-table-wrap {
      width: 100%;
      margin: 2rem 0;
      margin-left: -1.25rem;
      transform: none;
      padding: 0 1.25rem;
      box-sizing: content-box;
    }
  }
</style>

<div class="thesis-page">

<header class="page-header">
  <p class="breadcrumb"><a href="/">Home</a> &rsaquo; <a href="/capital/">Capital</a> &rsaquo; Proto Thesis</p>
  <!-- #agent-note: This date renders from `page.last_updated` in the front-matter above. Edit there, only on substantive content changes. -->
  <span class="draft-stamp">Draft for review &middot; {{ page.version }} &middot; {{ page.last_updated }}</span>
  <h1>EvoBioSys Capital - Proto Investment Thesis</h1>
  <p class="epigraph">Living systems as method, not metaphor.</p>
</header>

<div class="thesis-prose" markdown="1">

<nav class="thesis-toc" markdown="1">
**Contents**
{:.thesis-toc-label}

* TOC
{:toc}

</nav>

## The conviction

The next decade of investing rewards capital architecture grounded in *structural demand*: the essentials every community needs regardless of which macro scenario unfolds. Trend-based theses move with the cycle. A thesis anchored in essentials holds through it.

EvoBioSys Capital is built on that floor. We treat living systems as method, biomimicry applied to capital architecture rather than as branding, because adaptive open systems compound through phase transitions while closed systems hit ceilings.

What follows is the financial logic. The wider worldview that informs it (ecological framing, founder posture) lives elsewhere on the site and in the long-form writing, with the geopolitical posture kept in the body below because it shapes deployment directly.

---

## What we invest in

The 9x9 framework: nine essential physical requirements that every community needs to participate in economic life on its own terms, read across the nine power poles where those communities live.

**The nine essentials.** Security (incl. police, military, diplomacy) · Water · Food · Housing · Clothing · Energy (incl. heating) · Transportation · Digital (software & hardware) · Medicine & Hygiene.

**The nine power poles.** US · EU · China · India · ASEAN · Sub-Saharan Africa · Latin America · Arab world · Central Asia.

These are not aspirational categories. They are the minimum. Without sovereign access to each of the nine, a community operates at the mercy of whoever controls the supply. With sovereign access, the incentive structure for coercion disappears and peace becomes structurally favorable.

The 9x9 grid is the investment universe. Every cell is a deployment opportunity, weighted by need, fragility, and tractable entry. Everything EvoBioSys Capital does serves one or more cells of that grid.

---

## The two-layer economics

**Layer 1 - The commons stewardship floor.** Access to essentials is held by holonic networks that steward the commons. These are not charities and not state programs. They are living coordination structures, organized so that any community that uses them can also influence them. The floor does not need to generate outsized returns. It needs to not fail.

**Layer 2 - The innovation layer.** Everything built on top of a secure foundation - new products, services, improvements to the essentials, technology that makes them more efficient or accessible - operates within an eco-social market economy. This is where market-rate returns live. Not from extracting value from the essentials, but from co-evolving with them.

SOFIN (sofin.bio) endows the floor. idea2life (idea2.life) builds on top. Neither works without the other. The pairing is itself biomimetic: roots and canopy, mycelium and fruiting body - the floor stabilizes; the innovation layer reaches for light.

---

## Why now

Three forces are converging:

**The sovereignty push.** 84% of EU citizens distrust US tech companies with their data (Politico, April 2026). Europe's tech spending exceeds EUR 1.5 trillion in 2026 for the first time, driven by AI, cloud, cybersecurity, and sovereignty. The EU has committed EUR 200 billion through InvestAI. The Cloud and AI Development Act is being finalized. Sovereign infrastructure is no longer an ambition - it is policy.

**The retrofit mandate.** The EU Renovation Wave targets 35 million buildings by 2030. Meeting EPBD energy standards requires an estimated EUR 1.2 trillion in investment. This is not speculative demand - it is regulatory. Every building in Europe that fails to meet energy performance standards will need to be upgraded. The housing investment gap alone is EUR 150 billion per year.

**The wealth transfer.** USD 124 trillion in assets will change hands through 2048 - the largest intergenerational wealth transfer in history. 90% of Gen Z and millennial investors want their money to influence environmental outcomes. 72% believe traditional stocks and bonds are insufficient. The capital is moving toward values-aligned deployment, but the vehicles and trusted advisors barely exist.

---

## The phase shift filter

Every investment decision passes through three conditions. All three must clear, not just one.

- **Condition 1. Good now.** Does the investment deliver value today, regardless of when or whether any transition happens? If yes, it is immediately viable and the risk is contained. *(See [Where we focus first](#where-we-focus-first) for deployment areas already meeting this bar.)*

- **Condition 2. Holds during transition.** Does the investment survive the phase shift in climate, AI, migration, and geopolitics, without depending on a narrow Goldilocks scenario to function? *(See [Why now](#why-now) for the macro forces driving the shift, and [Posture across the nine poles](#posture-across-the-nine-poles) for the geopolitical backdrop the deployment has to hold through.)*

- **Condition 3. Still valuable after.** Once the transition has occurred and a more regenerative economy is in place, does the investment retain its utility and value? If it becomes obsolete in the world we are building toward, it is a short-term bet, not a structural one. *(See [What we invest in](#what-we-invest-in) for why the 9x9 essentials clear this bar by definition.)*

Food, housing, water, energy: these pass all three conditions. That is why a thesis anchored in the 9x9 holds where trend-based theses don't have to. Trends matter at the innovation layer; the essentials are the floor under the trends.

---

## Where we focus first

**Housing retrofitting in Europe.** Regulatory mandate makes demand structural, not speculative. Vienna's Dachbodenausbau (rooftop extension) model: increases property value, improves energy efficiency, adds housing supply, generates returns. The pattern repeats across every European city with aging building stock. Partner with one executor per project while stewarding investment, governance, and quality.

**Regenerative food systems.** Partner with one farmer-executor per bioregion. Flower strips (Blühstreifen) at field edges increase pollinator populations, natural pest control, and yields by 5–15%. Cover cropping, agroforestry, integrated pest management - all reduce input costs while building soil health. EU Farm to Fork targets 25% organic by 2030. CAP reform redirects subsidies toward ecological outcomes.

**Sovereign digital infrastructure.** KIDUR (kidur.org) - sovereign knowledge infrastructure. Privacy-first, local-first, EU-jurisdictional. Interoperates knowledge systems within and between communities. 52% of Western European enterprises are accelerating data sovereignty investment. By 2027, over a third will use localized AI platforms (up from 5% today).

---

## The vehicle

**EvoBioSys** is the ecosystem. Within it:

**EvoBioSys Capital** deploys investment into 9x9-aligned ventures. The investment fund is separate from the commons network and from entity equity structures.

**SOFIN** (sofin.bio) stewards the financial infrastructure. Contains a stabilizing foundation (SoUBR) that provides minimal living grants so purpose-driven individuals can focus full-time on building. Multiple fund layers serve different functions: stabilizing, growth, and advisory.

**idea2life** (idea2.life) is the venture studio. It partners with one executor per venture - one farmer, one builder, one developer - and provides the coordination layer: capital, governance, market access, quality assurance.

**QuestHub** is the social coordination layer. Quests are community-oriented milestones people coordinate around. Resources and AI tools support bringing quests to life.

**KIDUR** (kidur.org) is sovereign knowledge infrastructure. Technical pillar. Open-source, privacy-first, designed to interoperate people's knowledge systems within and between communities.

Each entity operates as a holon, a whole unto itself and a part of the larger whole. The commons network holds 51% of holon entities. A source keeper maintains vision integrity. The architecture scales through composition, not centralized control.

---

## Posture across the nine poles

A bias to name openly. I am an EU citizen and the steward of this fund, with a personal stake in the EU's continued strength. I hold that the EU is presently the most functional democracy among the major poles, and that its democratic institutions and self-defense capacity matter to the world even where they need to evolve. That is a starting position, not a conclusion. It is named here so it can be examined rather than smuggled in.

But the fund is not EU-only. The 9x9 framework is read across all nine poles, and each pole's evolution matters. We are not against any pole. We are against extraction patterns wherever they appear:

- the US Cloud Act and surveillance reach over hosted data
- China's data sovereignty regime extending into private firms
- Russia's autocratic capture of essentials and information channels
- the Arab states' rentier consolidation around energy and finance
- any pole's leveraging of essentials as coercion against its own people or its neighbours

Sovereignty as method, not anti-Americanism, not anti-China-ism, not nationalism. We acknowledge what the US has built, from computing to AI. We work with what China has built in manufacturing and applied science. We expect every pole to evolve, and we want to be useful to that evolution where we can be.

Capital deployment priorities tilt toward Sub-Saharan Africa and Latin America (most needed, least funded) and toward EU-anchored sovereign infrastructure. Not charity. Structural investment in the essentials, with returns.

---

## How this fits within investing's developmental arc

Each generation of investing carries forward what the previous one built and opens what it could not yet hold. The table below is a developmental arc, not a verdict. Conventional investing organized capital at scale. Impact investing insisted that outcomes beyond price signal must count. Systemic investing widened the unit of analysis to whole systems. Structural investing - the frame we work in - extends that lineage one step further: it asks what infrastructure every community needs to participate in any system at all, and treats sovereign access to those essentials as the floor on which all other investing stands.

We honor each prior school. We are descendants, not competitors.

<p class="thesis-scroll-hint">↔ scroll &rarr;</p>

<div class="thesis-table-wrap" markdown="1">

| | Conventional Investing | Impact Investing | Systemic Investing | Structural Investing (EvoBioSys) |
|---|---|---|---|---|
| **Primary goal** | Maximize financial returns | Financial returns plus measurable social/environmental outcomes | Transform the underlying systems that generate outcomes | Ensure sovereign access to the essential physical requirements that any system depends on |
| **Relationship to the system** | Operates within the current system and optimizes for it | Works within the system while mitigating harm and creating positive outcomes | Identifies leverage points to shift the system | Builds the infrastructure the next system requires, alongside what already exists |
| **Unit of analysis** | Individual asset or company | Individual investment with impact metrics | Interconnected portfolio targeting system dynamics | The 9x9 essentials - what every community needs regardless of system |
| **Time horizon** | Quarterly to 5 years | 5–10 years, fund lifecycle | 10–20 years, system transformation cycles | The infinite game - multigenerational, with realism about one human lifetime |
| **Returns** | Market-rate or above | Often concessionary; increasingly market-rate as the field matures | Market-rate through systemic value creation | Market-rate through structural demand - regulatory mandates, essential needs, and demographic shifts |
| **Risk model** | Market risk, sector risk | Impact risk plus financial risk | Complexity risk - systems are unpredictable | Phase shift resilience - good now, holds during transition, still valuable after |
| **What it makes possible** | Liquidity, scale, capital formation | A vocabulary for outcomes beyond price; the IRIS+ and GIIN infrastructure that lets capital see what it does | A discipline for working with whole systems rather than point investments | A floor of sovereign essentials so the other three can do their work without depending on fragile supply chains |
| **What it invites next** | Pricing in externalities → impact investing | Composing point investments into systemic patterns → systemic investing | Anchoring system change in non-negotiable physical foundations → structural investing | Continued evolution - we expect to be superseded too |
| **Key reference** | Modern Portfolio Theory (Markowitz) | GIIN, IRIS+, IFC Operating Principles | *Investor's Guide to Systemic Investing* (Tews, Jay, Andersen, Paetzold - UZH/MIT Sloan, 2025) | This document |

</div>

Systemic investing - as articulated by Tews, Jay, Andersen, Paetzold and the UZH/MIT Sloan collaboration - is the closest neighbour. The distinction we draw is small but practical: systemic investing identifies leverage points within existing systems to shift them; structural investing builds the infrastructure the next system requires *while the current one is still running*. We are not trying to fix the current food system. We are building sovereign food access alongside it. We are not trying to reform the housing market. We are building the retrofit infrastructure that regulation already demands. The system shifts around the structures we build.

> **An invitation, not a boundary.** If you are an impact or systemic investor reading this: we are not drawing a line. We are extending one. The vehicles you helped legitimize - concessionary capital, blended finance, IRIS+, B Corp, the GIIN - are why a thesis like this is even legible to a fiduciary today. Structural investing is what becomes possible *because* of that lineage, not despite it. The 9x9 floor is the layer we can now see is missing. We would welcome co-investment, co-design, and honest critique from anyone already working at the impact or systemic layer who feels the pull toward the foundation beneath.
{: .callout }

---

## The invitation

We are looking for co-creators, not followers. People who see the same phase shift and want to build the infrastructure that holds through it.

We extend the invitation to four kinds of partners specifically:

**Capital stewards** - managing private wealth, family office, foundation endowment, or aligned fund mandates - who want deployment that is good now, holds during transition, and is still valuable after.

**Impact and systemic investors** who have built the field that made this thesis legible. We are not asking you to set aside what you've built. We are asking whether the floor under your work - sovereign access to the essentials - is part of the portfolio you can now see. If it is, there is room here to compose.

**Builders inside the 9x9** - farmers, Baumeister, retrofit teams, energy cooperatives, sovereign-cloud teams, water collectives, regenerative-agriculture teams - who want a stewardship-aligned coordination layer behind their work, not extraction in a softer wrapper.

**Quiet contributors** - researchers, advisors, integral practitioners, contemplatives with capital - who do not want a public role but want to contribute their seeing. Field awareness counts. We will treat your contribution accordingly.

If any of these resonate, we would welcome a conversation: [connect@evobiosys.org](mailto:connect@evobiosys.org).

---

## Why me

Capital stewardship is a craft. The credentials behind this thesis:

- **Finance training.** Studied finance at university and passed the Austrian financial advisor licensing exam.
- **Algorithmic trading.** Hands-on experience building, running, and maintaining algorithmic trading systems, the practical discipline of letting markets correct your hypothesis quickly and cheaply.
- **Living-systems anchor.** Beyond the financial training, two decades of attention to living systems, regenerative practice, and the structural questions that macro alone cannot answer.

The financial training is necessary. It is not sufficient. The 9x9 framework is what I work in *because* the financial frame, taken alone, fails to see what every community actually needs.

<div class="colophon" markdown="1">

*Jakob Possert-Bienzle lives in Vienna, Austria, with his wife. He is the founder and steward of EvoBioSys.*

*This document is a formulation of Jakob's notes and intention, drafted by an AI assistant on his instruction. It has not been line-by-line reviewed by him; phrasing, emphasis, and details may need correction. Read it as a faithful synthesis attempt rather than a vetted public statement. Corrections are welcome at [connect@evobiosys.org](mailto:connect@evobiosys.org).*

*This is a living document. It will be refined through ongoing research, collaboration, and the Signal Orbit knowledge pipeline. Background depth - the full worldview thesis, the 9x9 chapter expansions, the membrane-holder posture - is available on request.*

</div>

</div>
</div>
