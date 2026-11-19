/* methodology.js — client-side NUTS-1 comparison table + reverse summary
 * for regions/methodology.html.
 *
 * Join method (documented in prose on the page too): a region's NUTS-1
 * equivalent is the first three characters of any of its `nuts_codes`
 * entries — by NUTS construction, country (2 chars) + level-1 letter/digit
 * (1 char) = 3 chars, regardless of whether the source code itself is
 * NUTS-1, NUTS-2, NUTS-3, or SR2024. That 3-char prefix is looked up
 * against `data/nuts1_reference.json` by (country, code).
 */
(function () {
  "use strict";

  // Relative to this page (regions/methodology.html) so the same build works
  // unchanged whether served from / or /draft/.
  const REGIONS_URL = "../data/regions.json";
  const NUTS1_URL = "../data/nuts1_reference.json";
  const GROUPINGS_URL = "../data/groupings.json";
  const GROUPING_SCHEMES_URL = "../data/grouping_schemes.json";
  const VARIANT_SETS_URL = "../data/variant_sets.json";
  const COVERAGE_URL = "../data/coverage_report.json";
  const PARLIAMENT_EXCEPTIONS_URL = "../data/parliament_exceptions.json";

  const numberFormat = new Intl.NumberFormat("de-AT");
  function formatInt(n) {
    if (n === null || n === undefined) return "—";
    return numberFormat.format(Math.round(n));
  }

  const tbody = document.getElementById("nuts1-table-body");
  const rowCountEl = document.getElementById("nuts1-row-count");
  const searchInput = document.getElementById("nuts1-search");
  const summaryEl = document.getElementById("nuts1-summary-method");

  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      for (const k in attrs) {
        if (k === "class") node.className = attrs[k];
        else node.setAttribute(k, attrs[k]);
      }
    }
    (children || []).forEach((c) => {
      if (typeof c === "string") node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  // Derive the 3-char NUTS-1-equivalent prefix for a raw nuts_code.
  function nuts1Prefix(code) {
    return code.slice(0, 3);
  }

  // Look up a (country, code3) pair against the reference index; also
  // returns a country-level fallback (the current unified NUTS-1 unit,
  // where the reference table now shows a single non-extra-regio code for
  // that country — e.g. Bulgaria's BG5, post-2024-vintage reform).
  function buildReferenceIndex(nuts1List) {
    const exact = new Map(); // "CC-CODE" -> label
    const byCountry = new Map(); // "CC" -> [{code,label}] excluding *Z extra-regio
    nuts1List.forEach((r) => {
      exact.set(r.country + "-" + r.code, r.label);
      if (!r.code.endsWith("Z")) {
        if (!byCountry.has(r.country)) byCountry.set(r.country, []);
        byCountry.get(r.country).push(r);
      }
    });
    return { exact, byCountry };
  }

  // For one region, return { matches: [{code,label,exact:bool}], anyExact }
  function resolveRegionNuts1(region, refIndex) {
    if (region.nuts_source === "CNTR") {
      return { matches: [], reason: "cntr" };
    }
    const seen = new Map(); // "CC-CODE" -> {code,label,exact}
    region.nuts_codes.forEach((code) => {
      const prefix = nuts1Prefix(code);
      const country = prefix.slice(0, 2);
      const key = country + "-" + prefix;
      if (refIndex.exact.has(key)) {
        seen.set(key, { code: prefix, label: refIndex.exact.get(key), exact: true });
      } else if (!seen.has(key)) {
        // Not resolved at this exact code — try the country-level fallback
        // (a single current non-extra-regio NUTS-1 unit for that country),
        // used e.g. for Bulgaria where the reference list now only carries
        // the post-reform unified BG5 code.
        const fallbackList = refIndex.byCountry.get(country);
        if (fallbackList && fallbackList.length === 1) {
          const fb = fallbackList[0];
          seen.set(country + "-fallback", {
            code: fb.code,
            label: fb.label + " (current unified scheme)",
            exact: false,
          });
        }
      }
    });
    if (seen.size === 0) {
      return { matches: [], reason: region.countries.includes("UK") ? "uk" : "none" };
    }
    return { matches: Array.from(seen.values()), reason: null };
  }

  function noMatchLabel(reason) {
    if (reason === "cntr") return "no NUTS-1 subdivision (country-level geometry only)";
    if (reason === "uk") return "not in Eurostat's NUTS-1 classification (UK excluded post-Brexit)";
    return "no official NUTS-1 match found";
  }

  function renderTable(rows) {
    tbody.replaceChildren();
    if (rows.length === 0) {
      tbody.appendChild(el("tr", null, [el("td", { colspan: "4" }, ["No matching regions."])]));
      rowCountEl.textContent = "0 rows";
      return;
    }
    const frag = document.createDocumentFragment();
    rows.forEach((row) => {
      const tr = el("tr", null, [
        el("td", { class: "region-cell" }, [row.name]),
        el("td", null, [row.countries]),
        el(
          "td",
          { class: row.matches.length ? "nuts1-cell" : "nuts1-cell none-cell" },
          row.matches.length
            ? row.matches.map((m, i) => {
                const wrap = el("span", null, [
                  el("code", null, [m.code]),
                  document.createTextNode(" " + m.label),
                ]);
                if (i < row.matches.length - 1) wrap.appendChild(el("br"));
                return wrap;
              })
            : [row.noMatchText]
        ),
        el("td", { class: "disagreement-cell" }, [row.disagreement]),
      ]);
      frag.appendChild(tr);
    });
    tbody.appendChild(frag);
    rowCountEl.textContent = rows.length + " of " + rows.length + " rows";
  }

  function computeReverseSummary(regions, refIndex) {
    // Base/congruent regions only (exclude schema-v2 alternate-view
    // composites — e.g. tyrol-unified, basque-unified, ireland-unified,
    // silesia-unified — so a shared NUTS-1 code isn't double-counted
    // against its default-visible counterpart already covering the same
    // territory). Schema v1 fallback (`variant_role`) kept for any record
    // that hasn't migrated yet; schema v2's `default_visible` is the
    // primary signal.
    const baseRegions = regions.filter(
      (r) => r.default_visible !== false && r.variant_role !== "noncongruent"
    );

    const codeToRegions = new Map(); // "CC-CODE" -> Set(region ids)
    const regionToCodes = new Map(); // region id -> Set("CC-CODE")

    baseRegions.forEach((region) => {
      if (region.nuts_source === "CNTR") return;
      const codes = new Set();
      region.nuts_codes.forEach((code) => {
        const prefix = nuts1Prefix(code);
        const country = prefix.slice(0, 2);
        const key = country + "-" + prefix;
        if (refIndex.exact.has(key)) codes.add(key);
      });
      if (codes.size === 0) return;
      regionToCodes.set(region.id, codes);
      codes.forEach((key) => {
        if (!codeToRegions.has(key)) codeToRegions.set(key, new Set());
        codeToRegions.get(key).add(region.id);
      });
    });

    let oneToOne = 0;
    let split = 0; // distinct NUTS-1 codes referenced by >1 region
    let absorbedIntoMerge = 0; // codes whose sole referencing region also references other codes

    codeToRegions.forEach((regionSet, key) => {
      if (regionSet.size > 1) {
        split += 1;
      } else {
        const onlyRegionId = Array.from(regionSet)[0];
        const regionCodeCount = regionToCodes.get(onlyRegionId).size;
        if (regionCodeCount === 1) oneToOne += 1;
        else absorbedIntoMerge += 1;
      }
    });

    const mergeRegions = Array.from(regionToCodes.entries()).filter(
      ([, codes]) => codes.size > 1
    ).length;

    return {
      matchedCodes: codeToRegions.size,
      oneToOne,
      split,
      absorbedIntoMerge,
      mergeRegions,
      totalBaseRegions: baseRegions.length,
    };
  }

  function renderSummary(summary) {
    summaryEl.textContent =
      "Method: computed client-side over the " +
      summary.totalBaseRegions +
      " base/congruent regions (the 3 noncongruent unified variants — Tyrol, Basque, Ireland — are excluded to avoid double-counting shared territory), by deriving each region's NUTS-1-equivalent prefix(es) the same way as the table above and grouping by official code. Of " +
      summary.matchedCodes +
      " distinct official NUTS-1 units matched: " +
      summary.oneToOne +
      " map 1:1 onto a single practical region, " +
      summary.split +
      " were split across more than one practical region, and " +
      summary.absorbedIntoMerge +
      " were absorbed into a practical region that merges multiple official units (across " +
      summary.mergeRegions +
      " such merge regions in total). Units with no NUTS-1 counterpart at all — the UK's post-Brexit exclusion, and the CNTR-only microstates/Moldova/Georgia — are outside this count; see the Data Limitations section.";
  }

  function attachSearch(allRows) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) {
        renderTable(allRows);
        return;
      }
      const filtered = allRows.filter((row) => {
        const haystack = (
          row.name +
          " " +
          row.countries +
          " " +
          row.matches.map((m) => m.code + " " + m.label).join(" ") +
          " " +
          row.disagreement
        ).toLowerCase();
        return haystack.includes(q);
      });
      renderTable(filtered);
      rowCountEl.textContent = filtered.length + " of " + allRows.length + " rows";
    });
  }

  // ---- Parliament-exceptions table (section 5) ----------------------------

  function renderParliamentExceptions(rows) {
    const body = document.getElementById("parliament-exceptions-body");
    const countEl = document.getElementById("parliament-exceptions-row-count");
    if (!body) return;
    body.replaceChildren();
    if (rows.length === 0) {
      body.appendChild(el("tr", null, [el("td", { colspan: "3" }, ["No exceptions found."])]));
      if (countEl) countEl.textContent = "0 rows";
      return;
    }
    const frag = document.createDocumentFragment();
    rows.forEach((row) => {
      const parliaments = Array.isArray(row.parliaments_inside)
        ? row.parliaments_inside.join("; ")
        : String(row.parliaments_inside);
      const tr = el("tr", null, [
        el("td", { class: "region-cell" }, [
          row.name + " ",
          el("code", null, [row.region]),
        ]),
        el("td", null, [parliaments]),
        el("td", { class: "disagreement-cell" }, [row.why_kept_merged]),
      ]);
      frag.appendChild(tr);
    });
    body.appendChild(frag);
    if (countEl) countEl.textContent = rows.length + " of " + rows.length + " rows";
  }

  function attachParliamentSearch(allRows) {
    const input = document.getElementById("parliament-exceptions-search");
    const countEl = document.getElementById("parliament-exceptions-row-count");
    if (!input) return;
    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      if (!q) {
        renderParliamentExceptions(allRows);
        return;
      }
      const filtered = allRows.filter((row) => {
        const parliaments = Array.isArray(row.parliaments_inside)
          ? row.parliaments_inside.join(" ")
          : String(row.parliaments_inside);
        const haystack = (
          row.name +
          " " +
          row.region +
          " " +
          row.country +
          " " +
          parliaments +
          " " +
          row.why_kept_merged
        ).toLowerCase();
        return haystack.includes(q);
      });
      renderParliamentExceptions(filtered);
      if (countEl) countEl.textContent = filtered.length + " of " + allRows.length + " rows";
    });
  }

  function loadParliamentExceptions() {
    const body = document.getElementById("parliament-exceptions-body");
    if (!body) return; // section not on this build, skip quietly
    fetch(PARLIAMENT_EXCEPTIONS_URL)
      .then((r) => r.json())
      .then((rows) => {
        renderParliamentExceptions(rows);
        attachParliamentSearch(rows);
      })
      .catch((err) => {
        body.replaceChildren();
        body.appendChild(
          el("tr", null, [
            el("td", { colspan: "3" }, ["Failed to load parliament exceptions: " + err.message]),
          ])
        );
        const countEl = document.getElementById("parliament-exceptions-row-count");
        if (countEl) countEl.textContent = "error";
      });
  }

  // ---- EP delegation model: multi-scheme grouping population balance ------
  // (section 3, A2.2 model + A3.4 multi-scheme comparison)

  // A3.3 binding contract: data/grouping_schemes.json = [{id, label,
  // description, groupings:[{id,name,member_ids,rationale}],
  // alternatives:{unit_id:[grouping_id,…]}, factor_exempt:[…]}]. Falls back
  // to the legacy single-scheme groupings.json (wrapped, no exemptions) when
  // the multi-scheme file is absent/404/unparseable.
  async function loadGroupingSchemesWithFallback() {
    try {
      const res = await fetch(GROUPING_SCHEMES_URL);
      if (res.ok) {
        const schemes = await res.json();
        if (Array.isArray(schemes) && schemes.length > 0) return schemes;
      }
    } catch (err) {
      // fall through to the legacy fallback below
    }
    const fallbackRes = await fetch(GROUPINGS_URL);
    const groupings = await fallbackRes.json();
    return [
      {
        id: "affinity-66",
        label: "Affinity (66)",
        description: "Single-scheme fallback — data/grouping_schemes.json not available in this build.",
        groupings,
        alternatives: {},
        factor_exempt: [],
      },
    ];
  }

  // Sums each grouping's member cultural units' populations. `member_ids`
  // are explicit references into the regions dataset (not filtered by
  // default_visible — a grouping's members are already exactly the set of
  // default-visible units it partitions).
  function computeGroupingPopulations(regions, groupings) {
    const byId = new Map(regions.map((r) => [r.id, r]));
    return groupings.map((g) => {
      const population = g.member_ids.reduce((sum, mid) => {
        const r = byId.get(mid);
        return sum + (r ? r.population : 0);
      }, 0);
      return { id: g.id, name: g.name, population, memberCount: g.member_ids.length };
    });
  }

  function computeGroupingBalance(groupingPops) {
    const sorted = [...groupingPops].sort((a, b) => a.population - b.population);
    const smallest = sorted[0];
    const largest = sorted[sorted.length - 1];
    const maxFactor = smallest && smallest.population > 0 ? largest.population / smallest.population : null;
    const over7x = smallest
      ? sorted
          .filter((g) => g.population > 7 * smallest.population)
          .map((g) => ({ ...g, factor: g.population / smallest.population }))
          .sort((a, b) => b.population - a.population)
      : [];
    return { smallest, largest, maxFactor, over7x, total: groupingPops.length };
  }

  // A3.4/A4.1: per-scheme factor stats, excluding factor_exempt AND
  // sovereign_floor groupings from the factor calculation. Both are reported
  // separately from the max-factor/over-7x numbers but with distinct
  // labels: factor_exempt = "special status" (sovereign microstates,
  // exclaves, and similar singletons the scheme designer chose to exempt);
  // sovereign_floor (A4.1, optional, e.g. the balanced-national scheme) =
  // "sovereign minimum — cannot merge without crossing a border" (small
  // sovereign states that cannot merge upward within their own state
  // boundary under a no-cross-border-merge rule).
  //
  // A4.1: when a scheme carries a numeric `computed_factor` (the data
  // build's own honest max-factor figure, which may account for
  // scheme-specific constraints this client-side recomputation cannot see),
  // it is used in place of the client-computed maxFactor. Guarded
  // defensively — an unexpected shape (missing, non-numeric, NaN, Infinity)
  // silently falls back to client-side computation rather than throwing.
  //
  // Kept byte-identical to the copy in table.js (which is the one covered by
  // the node-runnable self-test, since this closure isn't module.exports'd)
  // — change both together.
  function computeSchemeFactorStats(scheme, regions) {
    const groupingPops = computeGroupingPopulations(regions, scheme.groupings);
    const exemptIds = new Set(scheme.factor_exempt || []);
    const sovereignIds = new Set(scheme.sovereign_floor || []);
    const excludedIds = new Set([...exemptIds, ...sovereignIds]);
    const exempt = groupingPops.filter((g) => exemptIds.has(g.id));
    const sovereign = groupingPops.filter((g) => sovereignIds.has(g.id));
    const nonExcluded = groupingPops.filter((g) => !excludedIds.has(g.id));
    const balance = computeGroupingBalance(nonExcluded.length ? nonExcluded : groupingPops);
    const hasComputedFactor = typeof scheme.computed_factor === "number" && Number.isFinite(scheme.computed_factor);
    if (hasComputedFactor) balance.maxFactor = scheme.computed_factor;
    return { balance, exempt, sovereign, total: scheme.groupings.length, usedComputedFactor: hasComputedFactor };
  }

  // One card per scheme, side by side via .scheme-factor-columns on the
  // container (A3.4: "table+methodology max-factor sections show ALL
  // schemes' stats side by side" — generalized from "BOTH" now that A4.1
  // adds a third scheme).
  function buildSchemeFactorCard(scheme, regions) {
    const { balance, exempt, sovereign, total, usedComputedFactor } = computeSchemeFactorStats(scheme, regions);
    const nonExcludedTotal = total - exempt.length - sovereign.length;

    const children = [el("h4", null, [scheme.label])];
    if (scheme.description) children.push(el("p", { class: "live-stat-caveat" }, [scheme.description]));

    if (!balance.smallest || !balance.largest) {
      children.push(el("p", null, ["Not enough non-exempt groupings to compute a factor."]));
      return el("div", { class: "scheme-factor-card" }, children);
    }

    const inBand = balance.maxFactor !== null && balance.maxFactor <= 7;

    children.push(
      el("div", { class: "stat-strip" }, [
        el("div", { class: "stat-box" }, [
          el("span", { class: "stat-value" }, [balance.largest.name]),
          el("span", { class: "stat-label" }, ["largest (" + formatInt(balance.largest.population) + ")"]),
        ]),
        el("div", { class: "stat-box" }, [
          el("span", { class: "stat-value" }, [balance.smallest.name]),
          el("span", { class: "stat-label" }, ["smallest (" + formatInt(balance.smallest.population) + ")"]),
        ]),
        el("div", { class: "stat-box" }, [
          el("span", { class: "stat-value" }, [
            balance.maxFactor !== null ? balance.maxFactor.toFixed(1) + "×" : "n/a",
          ]),
          el("span", { class: "stat-label" }, [
            "max factor (non-exempt)" + (usedComputedFactor ? " — data build" : ""),
          ]),
        ]),
        el("div", { class: "stat-box" }, [
          el("span", { class: "stat-value" }, [String(balance.over7x.length) + " / " + nonExcludedTotal]),
          el("span", { class: "stat-label" }, [">7× smallest"]),
        ]),
      ])
    );

    children.push(
      el("p", { class: "live-stat-caveat" }, [
        "Non-exempt max factor " +
          (balance.maxFactor !== null ? balance.maxFactor.toFixed(1) + "×" : "n/a") +
          (usedComputedFactor ? " (reported by the data build)" : "") +
          " — " +
          (inBand ? "inside" : "outside") +
          " the 3–7× target (" +
          balance.over7x.length +
          " of " +
          nonExcludedTotal +
          " non-exempt groupings sit above 7×).",
      ])
    );

    if (exempt.length > 0) {
      children.push(
        el("p", { class: "live-stat-caveat" }, [
          el("strong", null, [exempt.length + " special status, outside the factor: "]),
          exempt.map((g) => g.name).join(", "),
        ])
      );
    }

    if (sovereign.length > 0) {
      children.push(
        el("p", { class: "live-stat-caveat" }, [
          el("strong", null, [
            sovereign.length + " sovereign minimum — cannot merge without crossing a border: ",
          ]),
          sovereign.map((g) => g.name).join(", "),
        ])
      );
    }

    const tbodyRows =
      balance.over7x.length === 0
        ? [el("tr", null, [el("td", { colspan: "3" }, ["No non-exempt groupings exceed 7× the smallest — in band."])])]
        : balance.over7x.map((g) =>
            el("tr", null, [
              el("td", null, [g.name]),
              el("td", null, [formatInt(g.population)]),
              el("td", null, [g.factor.toFixed(1) + "×"]),
            ])
          );

    children.push(
      el("div", { class: "table-scroll" }, [
        el("table", { class: "grouping-rebalance-table" }, [
          el("caption", null, ["Non-exempt groupings with population >7× the smallest — re-balancing candidates"]),
          el("thead", null, [
            el("tr", null, [
              el("th", { scope: "col" }, ["Grouping"]),
              el("th", { scope: "col" }, ["Population"]),
              el("th", { scope: "col" }, ["× smallest"]),
            ]),
          ]),
          el("tbody", null, tbodyRows),
        ]),
      ])
    );

    return el("div", { class: "scheme-factor-card" }, children);
  }

  function renderSchemeFactorComparison(regions, schemes) {
    const container = document.getElementById("scheme-factor-comparison");
    if (!container) return;
    container.replaceChildren();
    if (!regions || !schemes || schemes.length === 0) {
      container.appendChild(el("p", null, ["Could not load grouping scheme data."]));
      return;
    }
    for (const scheme of schemes) {
      container.appendChild(buildSchemeFactorCard(scheme, regions));
    }
  }

  // ---- Live stats (tagline, two-level model, changelog) -------------------

  function setStat(id, value) {
    const el2 = document.getElementById(id);
    if (el2) el2.textContent = value;
  }

  function loadLiveStats() {
    Promise.all([
      fetch(REGIONS_URL).then((r) => r.json()),
      loadGroupingSchemesWithFallback().catch(() => []),
      fetch(VARIANT_SETS_URL).then((r) => r.json()).catch(() => []),
      fetch(COVERAGE_URL).then((r) => r.json()).catch(() => null),
    ])
      .then(([regionsData, schemes, variantSets, coverage]) => {
        const regions = regionsData.regions;
        // Count-target (40–70) stats below stay scoped to the default
        // scheme (schemes[0], affinity-66) exactly as before this task —
        // A3's multi-scheme comparison lives only in the max-factor
        // subsection via renderSchemeFactorComparison(regions, schemes).
        const groupings = (schemes[0] && schemes[0].groupings) || [];
        const defaultVisible = regions.filter((r) => r.default_visible !== false);
        const composites = regions.filter((r) => r.default_visible === false);
        const special = regions.filter((r) => r.special_status);
        const withDisagreement = defaultVisible.filter((r) => r.nuts1_disagreement);

        setStat("stat-cultural-units", String(defaultVisible.length));
        setStat("stat-cultural-units-2", String(defaultVisible.length));
        setStat("stat-composite-units", String(composites.length));
        setStat("stat-groupings", String(groupings.length));
        setStat("stat-groupings-2", String(groupings.length));
        setStat("stat-variant-sets", String(variantSets.length));
        setStat("stat-variant-sets-2", String(variantSets.length));
        setStat("stat-nuts1-disagree-count", String(withDisagreement.length));
        setStat("stat-changelog-units", String(defaultVisible.length));
        setStat("stat-changelog-special", String(special.length));

        const note = document.getElementById("groupings-live-note");
        if (note) {
          const inTarget = groupings.length >= 40 && groupings.length <= 70;
          note.textContent = inTarget
            ? "Live from the current data build: " +
              groupings.length +
              " representation groupings, inside the 40–70 target range."
            : "Live from the current data build: " +
              groupings.length +
              " representation groupings — " +
              (groupings.length > 70
                ? "still above the 40–70 target; the cross-zone consolidation pass may not have landed in this build yet."
                : "below the 40–70 target for this build.");
        }

        renderSchemeFactorComparison(regions, schemes);

        if (coverage && coverage.countries) {
          // "Excluded" entries (e.g. Turkey, held out of the country-wide
          // threshold per the plan) are explicitly NOT in-scope, so they
          // must not inflate the in-scope denominator or read as a gap.
          const inScope = Object.values(coverage.countries).filter(
            (c) => c.status !== "excluded"
          );
          const ok = inScope.filter((c) => c.status === "ok" || c.ratio >= 0.97).length;
          setStat("stat-changelog-coverage", ok + " / " + inScope.length);
        } else {
          setStat("stat-changelog-coverage", "n/a");
        }
      })
      .catch((err) => {
        setStat("stat-cultural-units", "?");
        setStat("stat-cultural-units-2", "?");
        setStat("stat-composite-units", "?");
        setStat("stat-groupings", "?");
        setStat("stat-groupings-2", "?");
        setStat("stat-variant-sets", "?");
        setStat("stat-variant-sets-2", "?");
        setStat("stat-nuts1-disagree-count", "?");
        setStat("stat-changelog-units", "?");
        setStat("stat-changelog-special", "?");
        setStat("stat-changelog-coverage", "?");
        const note = document.getElementById("groupings-live-note");
        if (note) note.textContent = "Could not load live counts: " + err.message;
        const container = document.getElementById("scheme-factor-comparison");
        if (container) {
          container.replaceChildren(
            el("p", null, ["Could not load live population-balance analysis: " + err.message])
          );
        }
      });
  }

  Promise.all([fetch(REGIONS_URL).then((r) => r.json()), fetch(NUTS1_URL).then((r) => r.json())])
    .then(([regionsData, nuts1List]) => {
      const regions = regionsData.regions;
      const refIndex = buildReferenceIndex(nuts1List);

      const withDisagreement = regions.filter(
        (r) => r.default_visible !== false && r.nuts1_disagreement
      );

      const rows = withDisagreement.map((region) => {
        const resolved = resolveRegionNuts1(region, refIndex);
        return {
          name: region.name,
          countries: region.countries.join(", "),
          matches: resolved.matches,
          noMatchText: noMatchLabel(resolved.reason),
          disagreement: region.nuts1_disagreement,
        };
      });

      renderTable(rows);
      attachSearch(rows);

      const summary = computeReverseSummary(regions, refIndex);
      renderSummary(summary);
    })
    .catch((err) => {
      tbody.replaceChildren();
      tbody.appendChild(
        el("tr", null, [
          el("td", { colspan: "4" }, [
            "Failed to load region data: " + err.message,
          ]),
        ])
      );
      rowCountEl.textContent = "error";
      summaryEl.textContent = "Could not compute summary — data failed to load.";
    });

  loadParliamentExceptions();
  loadLiveStats();
})();
