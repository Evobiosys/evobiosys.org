# Idle Compute Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the manifesto + showcase page at evobiosys.org/idle-compute, eight sections, following the spec at `docs/superpowers/specs/2026-05-05-idle-compute-page-design.md`.

**Architecture:** Single Jekyll HTML page, one file, scoped CSS in a `<style>` block following the existing per-holon pattern (`holons/idea2life.html` is the styling reference). No JavaScript, no new layouts, no new data files. Default layout supplies nav and footer. Page-class wrapper (`.ic-page`) scopes all custom CSS.

**Tech Stack:** Jekyll 4.x (kramdown markdown, jekyll-seo-tag), Inter font (already loaded), Bundler for local builds, plain HTML + CSS.

**Branch:** `dev` (per evobiosys.org CLAUDE.md). Optionally a worktree if isolation is wanted.

**Reference files:**
- Spec: `/root/projects/evobiosys.org/docs/superpowers/specs/2026-05-05-idle-compute-page-design.md`
- Layout: `/root/projects/evobiosys.org/_layouts/default.html`
- Style reference: `/root/projects/evobiosys.org/holons/idea2life.html`
- Live source for SoTranscribe Patient Green section (do not link to localhost): `https://sotranscribe.com/#patient-green`

---

## Task 0: Pre-flight

**Files:**
- Read: `/root/projects/evobiosys.org/CLAUDE.md`
- Read: `/root/projects/evobiosys.org/_config.yml`
- Read: `/root/projects/evobiosys.org/_layouts/default.html`
- Read: `/root/projects/evobiosys.org/holons/idea2life.html` (style reference)

- [ ] **Step 1: Verify branch and clean working tree**

```bash
cd /root/projects/evobiosys.org
git fetch origin
git status --short
git branch --show-current
```

Expected: branch is `dev` (or `main` if dev not present), `git status --short` shows no unrelated changes other than `docs/` (the new spec dir is untracked at this point, that's fine).

If branch is not `dev`:
```bash
git checkout dev || git checkout -b dev
```

- [ ] **Step 2: Verify Jekyll builds the existing site cleanly**

```bash
cd /root/projects/evobiosys.org
bundle install --quiet
bundle exec jekyll build --quiet
```

Expected: command exits with status 0, `_site/` populated, no Liquid errors.

If `bundle install` reports missing gems, run `bundle install` (no `--quiet`) to surface the error.

- [ ] **Step 3: Verify the target permalink slot is free**

```bash
ls /root/projects/evobiosys.org/_site/idle-compute/ 2>/dev/null && echo "COLLISION" || echo "FREE"
ls /root/projects/evobiosys.org/idle-compute.html 2>/dev/null && echo "FILE EXISTS" || echo "OK"
```

Expected: `FREE` and `OK`. If collision, stop and ask Jakob.

- [ ] **Step 4: Confirm the spec is in place**

```bash
test -f /root/projects/evobiosys.org/docs/superpowers/specs/2026-05-05-idle-compute-page-design.md && echo "SPEC OK" || echo "SPEC MISSING"
grep -cP '\x{2014}' /root/projects/evobiosys.org/docs/superpowers/specs/2026-05-05-idle-compute-page-design.md
```

Expected: `SPEC OK` and `0`.

---

## Task 1: Skeleton page that renders at /idle-compute/

**Files:**
- Create: `/root/projects/evobiosys.org/idle-compute.html`

- [ ] **Step 1: Create the skeleton page with front matter**

Write to `/root/projects/evobiosys.org/idle-compute.html`:

```html
---
layout: default
title: "Idle Compute - EvoBioSys"
description: >-
  Local renewable energy that would otherwise be lost, computers that are not
  being used, and tasks that do not need to happen now. The page where these
  three meet.
permalink: /idle-compute/
---

<div class="ic-page">

  <header class="ic-header">
    <div class="ic-breadcrumb">
      <a href="/">EvoBioSys</a> · Idle Compute
    </div>
    <h1 class="ic-title">Idle compute</h1>
    <p class="ic-lede">Where local renewable energy, idle hardware, and patient workloads meet.</p>
  </header>

  <main class="ic-main">
    <p class="ic-placeholder">Sections incoming.</p>
  </main>

</div>
```

- [ ] **Step 2: Build and verify the page renders**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
test -f _site/idle-compute/index.html && echo "RENDERED" || echo "MISSING"
grep -c "Idle compute" _site/idle-compute/index.html
```

Expected: `RENDERED` and at least `1` (title appears in body).

- [ ] **Step 3: Em-dash check (skeleton)**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
grep -cP '\x{2014}' /root/projects/evobiosys.org/_site/idle-compute/index.html
```

Expected: `0` for both.

- [ ] **Step 4: Commit the skeleton**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: skeleton page rendering at /idle-compute/

Front matter, breadcrumb, title, lede, placeholder. No styling yet.

Instructed by: Jakob
EOF
)"
```

---

## Task 2: Page-wide style scaffold

**Files:**
- Modify: `/root/projects/evobiosys.org/idle-compute.html` (add `<style>` block + class hooks)

- [ ] **Step 1: Insert the scoped style block**

Replace the existing `<div class="ic-page">` opening with this style + opening, keeping everything below the existing skeleton intact:

```html
<style>
  /* === idle-compute - Cycles With Nature === */
  .ic-page {
    --ic-ink: #1a1d24;
    --ic-ink-soft: #4a5260;
    --ic-bg: #fafaf7;
    --ic-bg-soft: #f1efe8;
    --ic-line: #d8d4c8;
    --ic-accent: #003399;       /* EU blue */
    --ic-accent-soft: #2a5caa;
    --ic-warm: #FFCC00;          /* EU yellow */
    --ic-t1: #6c727a;            /* Stardust grey */
    --ic-t2: #2a5caa;            /* Sternschnuppe blue */
    --ic-t3: #d6692e;            /* Star ember */
    --ic-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;
    --ic-radius: 10px;
    --ic-radius-sm: 6px;
    background: var(--ic-bg);
    color: var(--ic-ink);
    min-height: 70vh;
    padding-bottom: 6rem;
  }
  .ic-header {
    max-width: 760px;
    margin: 0 auto;
    padding: 6rem 1.5rem 2rem;
  }
  .ic-breadcrumb {
    font-family: var(--ic-mono);
    font-size: 0.78rem;
    letter-spacing: 0.04em;
    color: var(--ic-accent-soft);
    margin-bottom: 1.5rem;
  }
  .ic-breadcrumb a {
    color: var(--ic-accent-soft);
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-color 0.2s;
  }
  .ic-breadcrumb a:hover { border-bottom-color: var(--ic-accent-soft); }
  .ic-title {
    font-size: clamp(2.4rem, 5vw, 3.5rem);
    font-weight: 300;
    letter-spacing: -0.025em;
    line-height: 1.05;
    margin: 0 0 0.6rem;
    color: var(--ic-ink);
  }
  .ic-lede {
    font-size: 1.18rem;
    line-height: 1.55;
    color: var(--ic-ink-soft);
    margin: 0;
    max-width: 36em;
  }
  .ic-main {
    max-width: 760px;
    margin: 0 auto;
    padding: 0 1.5rem;
  }
  .ic-section {
    padding: 3rem 0 1rem;
    border-top: 1px solid var(--ic-line);
  }
  .ic-section:first-child { border-top: none; }
  .ic-section h2 {
    font-size: 1.65rem;
    font-weight: 500;
    letter-spacing: -0.015em;
    color: var(--ic-ink);
    margin: 0 0 1.25rem;
  }
  .ic-section p {
    font-size: 1.02rem;
    line-height: 1.7;
    color: var(--ic-ink);
    margin: 0 0 1.1rem;
  }
  .ic-section p:last-child { margin-bottom: 0; }
  .ic-section strong { font-weight: 600; color: var(--ic-ink); }
  .ic-section em {
    font-style: normal;
    color: var(--ic-accent);
    font-weight: 500;
  }
  .ic-pillar-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin: 1rem 0 1.5rem;
  }
  .ic-pillar-grid > div {
    padding: 1rem 1.1rem;
    background: var(--ic-bg-soft);
    border-radius: var(--ic-radius-sm);
    border-left: 3px solid var(--ic-accent-soft);
  }
  .ic-pillar-grid h3 {
    font-family: var(--ic-mono);
    font-size: 0.78rem;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--ic-accent-soft);
    margin: 0 0 0.4rem;
  }
  .ic-pillar-grid p { margin: 0; font-size: 0.95rem; line-height: 1.5; }
  @media (max-width: 720px) {
    .ic-pillar-grid { grid-template-columns: 1fr; }
  }
  .ic-tier-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1rem;
    margin: 1.5rem 0;
  }
  .ic-tier {
    padding: 1.25rem 1.25rem 1.4rem;
    background: white;
    border: 1px solid var(--ic-line);
    border-radius: var(--ic-radius);
    border-top: 4px solid var(--ic-t1);
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }
  .ic-tier.t2 { border-top-color: var(--ic-t2); }
  .ic-tier.t3 { border-top-color: var(--ic-t3); }
  .ic-tier .num {
    font-family: var(--ic-mono);
    font-size: 0.7rem;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--ic-ink-soft);
    opacity: 0.7;
  }
  .ic-tier .name {
    font-size: 1.2rem;
    font-weight: 600;
    color: var(--ic-ink);
    margin: 0.1rem 0 0.4rem;
  }
  .ic-tier .row {
    display: flex;
    gap: 0.4rem;
    font-size: 0.88rem;
    line-height: 1.5;
  }
  .ic-tier .row .key {
    font-family: var(--ic-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--ic-ink-soft);
    opacity: 0.65;
    min-width: 5.5rem;
    padding-top: 0.15rem;
  }
  .ic-tier .row .val { flex: 1; color: var(--ic-ink); }
  @media (max-width: 800px) {
    .ic-tier-grid { grid-template-columns: 1fr; }
  }
  .ic-tier-caption {
    font-size: 0.92rem;
    line-height: 1.6;
    color: var(--ic-ink-soft);
    background: var(--ic-bg-soft);
    padding: 1rem 1.2rem;
    border-radius: var(--ic-radius-sm);
    border-left: 3px solid var(--ic-warm);
    margin: 0.5rem 0 0;
  }
  .ic-showcase-card {
    padding: 1.4rem 1.5rem;
    background: white;
    border: 1px solid var(--ic-line);
    border-radius: var(--ic-radius);
    margin: 1rem 0;
  }
  .ic-showcase-card .label {
    font-family: var(--ic-mono);
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--ic-accent-soft);
    margin-bottom: 0.4rem;
  }
  .ic-showcase-card h3 {
    margin: 0 0 0.6rem;
    font-size: 1.18rem;
    font-weight: 600;
    color: var(--ic-ink);
  }
  .ic-showcase-card a {
    color: var(--ic-accent);
    text-decoration: none;
    border-bottom: 1px solid var(--ic-accent);
  }
  .ic-aside {
    background: var(--ic-bg-soft);
    padding: 1.25rem 1.4rem;
    border-radius: var(--ic-radius-sm);
    border-left: 3px solid var(--ic-line);
    margin: 1rem 0;
    font-size: 0.96rem;
    line-height: 1.6;
    color: var(--ic-ink-soft);
  }
  .ic-aside p:first-child { margin-top: 0; }
  .ic-aside p:last-child { margin-bottom: 0; }
  .ic-cta {
    margin: 2rem 0 0;
    padding: 1.5rem 1.6rem;
    background: linear-gradient(135deg, rgba(0,51,153,0.04), rgba(255,204,0,0.05));
    border-radius: var(--ic-radius);
    border: 1px solid var(--ic-line);
  }
  .ic-cta h2 { margin-top: 0; }
  .ic-cta a {
    color: var(--ic-accent);
    text-decoration: none;
    border-bottom: 1px solid var(--ic-accent);
  }
  .ic-credits {
    margin: 3rem 0 0;
    padding-top: 1.5rem;
    border-top: 1px solid var(--ic-line);
    font-size: 0.84rem;
    line-height: 1.6;
    color: var(--ic-ink-soft);
    font-style: italic;
  }
</style>
```

Insert this `<style>` block between the front-matter closing `---` and the `<div class="ic-page">` opening.

- [ ] **Step 2: Build and confirm no Liquid errors**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
echo "exit=$?"
```

Expected: `exit=0`.

- [ ] **Step 3: Em-dash check**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
```

Expected: `0`.

- [ ] **Step 4: Commit the style scaffold**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: scoped style scaffold (.ic-page wrapper)

EU palette accents, three-tier color tokens, responsive grid setup.
No content changes yet.

Instructed by: Jakob
EOF
)"
```

---

## Task 3: Section 2 - The cycle (manifesto core)

**Files:**
- Modify: `/root/projects/evobiosys.org/idle-compute.html` (replace `<main class="ic-main">` placeholder content)

- [ ] **Step 1: Replace placeholder with the cycle section**

Inside `<main class="ic-main">`, replace `<p class="ic-placeholder">Sections incoming.</p>` with:

```html
    <section class="ic-section">
      <h2>Three things have to be true at once</h2>

      <div class="ic-pillar-grid">
        <div>
          <h3>Energy</h3>
          <p>Local renewable that would lose to transport or storage. The energy is already at the location, ready to be used.</p>
        </div>
        <div>
          <h3>Compute</h3>
          <p>Chips and machines available locally, not in use right now. Old laptops, retired workstations, the desktop gathering dust.</p>
        </div>
        <div>
          <h3>Workload</h3>
          <p>Tasks that can wait until the first two align. Transcription. Pattern detection across days. Long-running model runs. Things where the answer matters more than the latency.</p>
        </div>
      </div>

      <p>Together: <em>idle compute</em>. Distinct from on-demand compute, which does not wait.</p>

      <p>The bottleneck twist: human review is the real constraint on AI improvement. Transcripts pile up faster than anyone reads them. Model outputs need quality checks that no GPU can do for you. Deferring AI work to renewable peaks costs nothing in throughput, because the review queue is already paced by people, not chips.</p>
    </section>
```

- [ ] **Step 2: Build and verify the section renders**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -c "Three things have to be true" _site/idle-compute/index.html
```

Expected: `1`.

- [ ] **Step 3: Em-dash check**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
```

Expected: `0`.

- [ ] **Step 4: Commit**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: section 2 - the cycle (energy / compute / workload)

Three-pillar definition + bottleneck twist (human review as real constraint).

Instructed by: Jakob
EOF
)"
```

---

## Task 4: Section 3 - Cooling

**Files:**
- Modify: `/root/projects/evobiosys.org/idle-compute.html`

- [ ] **Step 1: Append the cooling section**

After the closing `</section>` of the cycle section, append:

```html
    <section class="ic-section">
      <h2>Cooling, separately</h2>

      <p>All three tiers are ideally Fernwärme-cooled, possibly in different physical locations. The pattern was pioneered by <em>Infomaniak</em>: the data center heats nearby buildings instead of dumping warm air to the sky.</p>

      <p>The location pattern is old factory halls, <em>ungleich</em>-style colocation, where the building is already there and the energy loop is already built into the neighborhood.</p>

      <p>Cooling is on-demand, not idle. Heat does not wait.</p>
    </section>
```

- [ ] **Step 2: Build and verify**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -c "Cooling, separately" _site/idle-compute/index.html
grep -c "Fernwärme" _site/idle-compute/index.html
```

Expected: `1` and `1`.

- [ ] **Step 3: Em-dash check**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
```

Expected: `0`.

- [ ] **Step 4: Commit**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: section 3 - cooling (Fernwärme on every tier, ungleich pattern)

Establishes that cooling is on-demand, distinct from the idle-compute frame.
Credits Infomaniak (pattern) and ungleich (location pattern).

Instructed by: Jakob
EOF
)"
```

---

## Task 5: Section 4 - Three tiers

**Files:**
- Modify: `/root/projects/evobiosys.org/idle-compute.html`

- [ ] **Step 1: Append the three-tier section**

After the cooling section's closing `</section>`, append:

```html
    <section class="ic-section">
      <h2>Three tiers</h2>

      <div class="ic-tier-grid">
        <article class="ic-tier t1">
          <span class="num">Tier 1</span>
          <span class="name">Stardust</span>
          <div class="row"><span class="key">Compute</span><span class="val">Any compute, even an old PC that barely powers on.</span></div>
          <div class="row"><span class="key">Workload</span><span class="val">Always-on hosting and storage.</span></div>
          <div class="row"><span class="key">Energy</span><span class="val">Constant minimal trickle.</span></div>
        </article>

        <article class="ic-tier t2">
          <span class="num">Tier 2</span>
          <span class="name">Sternschnuppe</span>
          <div class="row"><span class="key">Compute</span><span class="val">Old machines too slow for daily use, still capable.</span></div>
          <div class="row"><span class="key">Workload</span><span class="val">Transcription, Whisper Free V3 class, bursty light tasks.</span></div>
          <div class="row"><span class="key">Energy</span><span class="val">Pulses with renewable peaks.</span></div>
        </article>

        <article class="ic-tier t3">
          <span class="num">Tier 3</span>
          <span class="name">Star</span>
          <div class="row"><span class="key">Compute</span><span class="val">Workstation- or server-class, proper CPUs and GPUs.</span></div>
          <div class="row"><span class="key">Workload</span><span class="val">Actual LLM work.</span></div>
          <div class="row"><span class="key">Energy</span><span class="val">Pulses with renewable peaks, Fernwärme-cooled.</span></div>
        </article>
      </div>

      <div class="ic-tier-caption">
        <p style="margin:0 0 0.6rem"><strong>Stardust</strong> takes its name from Scaleway's discontinued tier of the same name. <strong>Sternschnuppe</strong> is German for shooting star, literally "star-snuff": matter being captured by atmosphere, releasing visible energy in a brief pulse, then freeing the path. The shape of bursty light tasks like transcription.</p>
        <p style="margin:0; font-size:0.85em; opacity:0.8">Names are placeholders. They can change later if a better fit emerges.</p>
      </div>
    </section>
```

- [ ] **Step 2: Build and verify**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -c "Stardust" _site/idle-compute/index.html
grep -c "Sternschnuppe" _site/idle-compute/index.html
grep -c "Scaleway" _site/idle-compute/index.html
```

Expected: at least `1` for each.

- [ ] **Step 3: Em-dash check**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
```

Expected: `0`.

- [ ] **Step 4: Commit**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: section 4 - three tiers (Stardust / Sternschnuppe / Star)

Three-card grid with compute/workload/energy rows per tier.
Caption credits Scaleway and explains the Sternschnuppe metaphor.

Instructed by: Jakob
EOF
)"
```

---

## Task 6: Section 5 - In action (showcase)

**Files:**
- Modify: `/root/projects/evobiosys.org/idle-compute.html`

- [ ] **Step 1: Append the showcase section**

After the three-tier section's closing `</section>`, append:

```html
    <section class="ic-section">
      <h2>Already running</h2>

      <article class="ic-showcase-card">
        <div class="label">Tier 2 · live</div>
        <h3>SoTranscribe Patient Green</h3>
        <p>€8 per month, 300 minutes, queues your transcripts for sun-and-wind peaks at <em>Anexia</em> in Klagenfurt and Wien. Hosting is 100% renewable. Transcripts arrive when the energy and the compute and the patience all line up.</p>
        <p style="margin:0"><a href="https://sotranscribe.com/#patient-green">sotranscribe.com</a></p>
      </article>

      <article class="ic-showcase-card">
        <div class="label">Tier 1 or 2 · forthcoming</div>
        <h3>forkaway</h3>
        <p>A sovereign alternative-finder, helping you fork away from Big Tech tools toward EU-sovereign equivalents. Forthcoming. We will publish this section once forkaway goes live.</p>
        <p style="margin:0"><a href="https://github.com/Evobiosys/forkaway">github.com/Evobiosys/forkaway</a></p>
      </article>
    </section>
```

- [ ] **Step 2: Build and verify**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -c "Patient Green" _site/idle-compute/index.html
grep -c "forkaway" _site/idle-compute/index.html
```

Expected: at least `1` for each.

- [ ] **Step 3: Em-dash check**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
```

Expected: `0`.

- [ ] **Step 4: Commit**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: section 5 - showcase (SoTranscribe Patient Green + forkaway)

SoTranscribe Patient Green as live tier-2 example with concrete pricing.
forkaway listed as forthcoming with GitHub pointer.

Instructed by: Jakob
EOF
)"
```

---

## Task 7: Section 6 - Federation (side note)

**Files:**
- Modify: `/root/projects/evobiosys.org/idle-compute.html`

- [ ] **Step 1: Append the federation aside**

After the showcase section's closing `</section>`, append:

```html
    <section class="ic-section">
      <h2>Side note: federation</h2>

      <div class="ic-aside">
        <p>Tier-2 and tier-3 nodes can federate into a pool. The default trust posture is to treat all federated work as public, like the public-comment side of a chat where mutual trust is assumed but the content is not load-bearing private. Private workloads stay on the trusted-stack channels of the parties who own them.</p>
        <p>More on this when the federation pool is ready to accept nodes.</p>
      </div>
    </section>
```

- [ ] **Step 2: Build and verify**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -c "federation" _site/idle-compute/index.html
```

Expected: at least `1`.

- [ ] **Step 3: Em-dash check**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
```

Expected: `0`.

- [ ] **Step 4: Commit**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: section 6 - federation as side note

Public-by-default pool framing, two paragraphs only, deferred to future.

Instructed by: Jakob
EOF
)"
```

---

## Task 8: Section 7 - If this resonates (soft CTA)

**Files:**
- Modify: `/root/projects/evobiosys.org/idle-compute.html`

- [ ] **Step 1: Append the soft-CTA section**

After the federation section's closing `</section>`, append:

```html
    <section class="ic-section ic-cta">
      <h2>If this resonates</h2>

      <p>We will publish a how-to-host-or-donate guide once the federation pool is ready to accept nodes. Until then, the easiest way to participate is to use SoTranscribe Patient Green and tell us what you would queue.</p>

      <p>Stay in the loop: <a href="/#connect">evobiosys.org/#connect</a><br>
      Contact: <a href="mailto:connect@evobiosys.org">connect@evobiosys.org</a></p>
    </section>
```

- [ ] **Step 2: Build and verify**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -c "If this resonates" _site/idle-compute/index.html
grep -c "connect@evobiosys.org" _site/idle-compute/index.html
```

Expected: at least `1` for each.

- [ ] **Step 3: Em-dash check**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
```

Expected: `0`.

- [ ] **Step 4: Commit**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: section 7 - soft CTA (if this resonates)

Mailing list link + contact, no recruitment funnel. Subtle by design.

Instructed by: Jakob
EOF
)"
```

---

## Task 9: Section 8 - Footer credits

**Files:**
- Modify: `/root/projects/evobiosys.org/idle-compute.html`

- [ ] **Step 1: Append the footer credits**

After the CTA section's closing `</section>`, append:

```html
    <p class="ic-credits">
      Stardust naming credited to Scaleway. Fernwärme cooling pattern credited to Infomaniak. Old factory hall hosting inspired by ungleich.
    </p>
```

- [ ] **Step 2: Build and verify**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -c "ungleich" _site/idle-compute/index.html
grep -c "Scaleway" _site/idle-compute/index.html
grep -c "Infomaniak" _site/idle-compute/index.html
```

Expected: at least `2`, `2`, `1` (Scaleway is also in the tier caption; ungleich is in cooling section + footer).

- [ ] **Step 3: Em-dash check**

```bash
grep -cP '\x{2014}' /root/projects/evobiosys.org/idle-compute.html
```

Expected: `0`.

- [ ] **Step 4: Commit**

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: section 8 - footer credits

Inline attribution: Scaleway / Infomaniak / ungleich.

Instructed by: Jakob
EOF
)"
```

---

## Task 10: Final sweep

**Files:**
- Modify (only if issues found): `/root/projects/evobiosys.org/idle-compute.html`
- Read: `/root/projects/evobiosys.org/_site/idle-compute/index.html`

- [ ] **Step 1: Final em-dash sweep across source and rendered**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -cP '\x{2014}' idle-compute.html
grep -cP '\x{2014}' _site/idle-compute/index.html
```

Expected: `0` and `0`. If non-zero, find with:

```bash
grep -nP '\x{2014}' idle-compute.html
```

Replace each em-dash with a hyphen, rebuild, re-check.

- [ ] **Step 2: Banned-words sweep**

```bash
cd /root/projects/evobiosys.org
for w in "leverage" "unlock" "disrupt" "cloud" "crypto" "mining"; do
  count=$(grep -ic "$w" idle-compute.html)
  echo "$w: $count"
done
```

Expected: `0` for each. If a banned word appears, rephrase. Note: "renewable" is allowed; "leverage" is not (pitch-deck verb).

- [ ] **Step 3: Spec coverage check**

```bash
echo "--- Section markers in built HTML ---"
for s in "Three things have to be true" "Cooling, separately" "Three tiers" "Already running" "Side note: federation" "If this resonates" "Stardust naming credited to Scaleway"; do
  count=$(grep -c "$s" /root/projects/evobiosys.org/_site/idle-compute/index.html)
  echo "[$count] $s"
done
```

Expected: every line shows `[1]` or higher.

- [ ] **Step 4: Responsive smoke test by curl**

```bash
cd /root/projects/evobiosys.org
curl -s "file://$(pwd)/_site/idle-compute/index.html" 2>/dev/null | head -20 || cat _site/idle-compute/index.html | head -20
```

Expected: front-matter is gone, layout wraps content, scoped class `.ic-page` appears in HTML.

(Visual responsive check requires opening in a browser; the visual companion is the easiest way - copy `_site/idle-compute/index.html` into the brainstorming session content dir and refresh.)

- [ ] **Step 5: Final consolidated commit if any fixes**

If Step 1 or Step 2 required edits:

```bash
cd /root/projects/evobiosys.org
git add idle-compute.html
git commit -m "$(cat <<'EOF'
idle-compute: final em-dash and banned-word sweep

Replaces any U+2014 occurrences with hyphens; removes pitch-deck verbs
flagged in the spec.

Instructed by: Jakob
EOF
)"
```

If no fixes were needed, skip the commit.

- [ ] **Step 6: Push to dev**

```bash
cd /root/projects/evobiosys.org
git push origin dev
```

(Do NOT push to main without Jakob's explicit instruction.)

---

## Task 11: Optional - cross-link from the EvoBioSys homepage

**Files:**
- Modify (optional): `/root/projects/evobiosys.org/index.html`

This task is OPTIONAL and gated on Jakob's review of the live page first.

- [ ] **Step 1: Read the homepage**

```bash
cat /root/projects/evobiosys.org/index.html | head -60
```

Identify a natural insertion point near other internal links (e.g. near the "Capital", "Holons", or "How We Work" CTAs).

- [ ] **Step 2: Add a single link**

Suggested anchor text: "Idle Compute" or "Read about idle compute".
Path: `/idle-compute/`.

Only add the link if the homepage has a section that thematically fits (sovereignty, infrastructure, regenerative). Do NOT add to the top nav (the spec keeps the page reachable by direct URL by default).

- [ ] **Step 3: Build, verify, commit**

```bash
cd /root/projects/evobiosys.org
bundle exec jekyll build --quiet
grep -c "/idle-compute/" _site/index.html
git add index.html
git commit -m "$(cat <<'EOF'
homepage: link to /idle-compute/

Single contextual link from the homepage to the new manifesto page.
Top nav remains unchanged.

Instructed by: Jakob
EOF
)"
git push origin dev
```

---

## Self-review notes (recorded after writing)

**Spec coverage check.** Each spec section has at least one corresponding task:
- Spec section 1 (Masthead) → Task 1 (skeleton includes title and lede)
- Spec section 2 (The cycle) → Task 3
- Spec section 3 (Cooling) → Task 4
- Spec section 4 (Three tiers) → Task 5
- Spec section 5 (Showcase) → Task 6
- Spec section 6 (Federation) → Task 7
- Spec section 7 (CTA) → Task 8
- Spec section 8 (Footer credits) → Task 9
- Spec hard constraints (no em-dashes, banned words) → Task 10
- Spec optional (homepage cross-link) → Task 11

**Placeholder scan.** No "TBD" / "TODO" / "implement later" steps. The forkaway tier label reads "Tier 1 or 2 · forthcoming" which is a known accepted gap from the spec, not a placeholder.

**Type consistency.** CSS class names match across tasks: `.ic-page`, `.ic-header`, `.ic-section`, `.ic-pillar-grid`, `.ic-tier-grid`, `.ic-tier`, `.ic-showcase-card`, `.ic-aside`, `.ic-cta`, `.ic-credits`. Tier color tokens `--ic-t1 / t2 / t3` defined in Task 2 and referenced in Task 5 only.

**Em-dash discipline.** Every task ends with an em-dash check. The plan itself contains 0 em-dashes (verified before saving).

Instructed by: Jakob
