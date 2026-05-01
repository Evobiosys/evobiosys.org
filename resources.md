---
layout: default
title: Resources — EvoBioSys
description: >-
  Curated resources for living-systems work — readings, references, and the
  capital, network, and tooling layers that support the EvoBioSys network.
permalink: /resources/

# #agent-note: Update `last_updated` ONLY when making substantive content changes
# (new curated entries, structural changes). Skip for typos/whitespace.
# Format: "Month YYYY".
last_updated: "May 2026"
---

<style>
  .resources-page {
    --rs-ink: #1a2e25;
    --rs-ink-soft: #3b4a43;
    --rs-line: #d8e2dc;
    --rs-pale: #f5f7f3;
    --rs-accent: #2d6a4f;
  }

  .resources-page .page-header {
    padding: 6rem 2rem 2rem;
  }

  .resources-page .draft-stamp {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--rs-line);
    border-radius: 100px;
    font-size: 0.78rem;
    letter-spacing: 0.05em;
    color: var(--rs-ink-soft);
    margin-bottom: 1rem;
    text-transform: uppercase;
  }

  .resources-grid {
    max-width: 1080px;
    margin: 2rem auto 5rem;
    padding: 0 2rem;
    display: grid;
    grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    gap: 4rem;
    align-items: start;
  }

  .resources-main {
    color: var(--rs-ink);
    font-size: 1.05rem;
    line-height: 1.75;
  }

  .resources-main h2 {
    margin-top: 0;
    margin-bottom: 1.25rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--rs-line);
    font-size: 1.5rem;
    letter-spacing: -0.01em;
  }

  .resources-main p { margin: 1rem 0; }

  .resources-main .placeholder-card {
    margin: 2rem 0;
    padding: 2rem;
    background: var(--rs-pale);
    border-left: 3px solid var(--rs-line);
    border-radius: 0 6px 6px 0;
    color: var(--rs-ink-soft);
    font-size: 0.98rem;
  }

  .resources-aside {
    position: sticky;
    top: 6rem;
    align-self: start;
    padding: 1.5rem 1.5rem 1.75rem;
    background: var(--rs-pale);
    border-radius: 8px;
    border: 1px solid var(--rs-line);
  }

  .resources-aside .aside-label {
    margin: 0 0 0.75rem 0;
    color: var(--rs-ink-soft);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    font-size: 0.78rem;
  }

  .resources-aside ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  .resources-aside li {
    margin: 0;
    border-top: 1px solid var(--rs-line);
  }
  .resources-aside li:first-child { border-top: 0; }

  .resources-aside li a {
    display: block;
    padding: 0.7rem 0;
    color: var(--rs-ink);
    text-decoration: none;
    font-weight: 500;
    transition: color 0.15s ease, padding-left 0.15s ease;
  }

  .resources-aside li a:hover,
  .resources-aside li a:focus {
    color: var(--rs-accent);
    padding-left: 0.25rem;
  }

  .resources-aside li a .aside-blurb {
    display: block;
    margin-top: 0.15rem;
    font-size: 0.82rem;
    font-weight: 400;
    color: var(--rs-ink-soft);
  }

  .resources-aside li a[aria-current="page"] {
    color: var(--rs-accent);
  }

  @media (max-width: 720px) {
    .resources-grid {
      grid-template-columns: 1fr;
      gap: 2rem;
      padding: 0 1.25rem;
    }
    .resources-aside {
      position: static;
      top: auto;
    }
    .resources-main { font-size: 1rem; }
  }
</style>

<div class="resources-page">

<header class="page-header">
  <p class="breadcrumb"><a href="/">Home</a> &rsaquo; Resources</p>
  <!-- #agent-note: This date renders from `page.last_updated` in the front-matter above. Edit there, only on substantive content changes. -->
  <span class="draft-stamp">Placeholder &middot; {{ page.last_updated }}</span>
  <h1>Resources</h1>
  <p class="lead">
    Curated resources for living-systems work &mdash; readings, references, and
    the capital, network, and tooling layers that support the EvoBioSys network.
  </p>
</header>

<div class="resources-grid">

  <main class="resources-main">
    <h2>Intellectual resources</h2>
    <p>
      A curated collection of readings, references, and research that inform
      the EvoBioSys frame &mdash; living systems, structural investing,
      sovereignty, regenerative practice, and the operational patterns that
      make holonic networks work in practice.
    </p>
    <div class="placeholder-card">
      <strong>In progress.</strong> The curation is being assembled. Categories
      will include foundational texts, contemporary research, working papers,
      podcasts, and field notes &mdash; with brief annotations on why each
      entry matters and where it sits in the wider arc.
    </div>
    <p>
      Until then, the right-hand panel points to the other resource layers
      already live or under development. <strong>Capital</strong> is the most
      mature of these &mdash; the investment thesis, fund structure, and
      partner posture are documented there.
    </p>
  </main>

  <aside class="resources-aside">
    <p class="aside-label">Resource layers</p>
    <ul>
      <li>
        <a href="/resources/intellectual/">
          Intellectual
          <span class="aside-blurb">Readings &amp; references &mdash; in progress</span>
        </a>
      </li>
      <li>
        <a href="/capital/">
          Capital
          <span class="aside-blurb">Investment thesis &amp; fund posture &mdash; live</span>
        </a>
      </li>
      <li>
        <a href="/resources/networks/">
          Networks
          <span class="aside-blurb">Holons, partners, allied collectives &mdash; planned</span>
        </a>
      </li>
      <li>
        <a href="/resources/tools/">
          Tools
          <span class="aside-blurb">Sovereign tooling &amp; infrastructure &mdash; planned</span>
        </a>
      </li>
    </ul>
  </aside>

</div>

</div>
