// detail.js — renders the region detail sidebar panel.
// Pure DOM string-building; no dependencies. Everything is escaped through
// `escapeHtml` because several source fields (identity_basis, sources, ...)
// contain free text authored from research notes.

const DIMENSIONS = [
  ["water", "Water"],
  ["food", "Food"],
  ["shelter", "Shelter"],
  ["energy", "Energy"],
  ["transportation", "Transportation"],
  ["hygiene_healthcare", "Hygiene & Healthcare"],
  ["clothing", "Clothing"],
];

// BETA dims (Amendment A1.6): easily imported within the continent, so a low
// score reads differently than for water/food/energy. hygiene_healthcare is
// explicitly redefined as capacity to produce medical/sanitation wares, not
// raw healthcare provision.
const BETA_DIMS = new Set(["shelter", "transportation", "hygiene_healthcare", "clothing"]);
const BETA_EXPLANATIONS = {
  shelter: "beta — construction materials/labour are easily importable within the continent.",
  transportation: "beta — vehicles, fuel and transit stock are easily importable within the continent.",
  hygiene_healthcare:
    "beta — hygiene here means the region's own industrial capacity to produce medical/sanitation wares, not healthcare provision generally; readily importable within the continent.",
  clothing: "beta — clothing/textiles are easily importable within the continent.",
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatNumber(n) {
  if (n === null || n === undefined) return "—";
  return n.toLocaleString("en-US");
}

function scoreBar([key, label], score) {
  const pct = Math.max(0, Math.min(5, score || 0)) * 20;
  return `
    <div class="score-row">
      <span class="score-label">${escapeHtml(label)}</span>
      <div class="score-track" role="img" aria-label="${escapeHtml(label)}: ${escapeHtml(score ?? "—")} out of 5">
        <div class="score-fill" style="width:${pct}%"></div>
      </div>
      <span class="score-value">${escapeHtml(score ?? "—")}</span>
    </div>`;
}

function list(items) {
  if (!items || items.length === 0) return "<p class=\"muted\">None recorded.</p>";
  return `<ul>${items.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

/**
 * Per-dimension rationale box (req 5 / Amendment A1.6). Only rendered when
 * `mode` names a specific autarky dimension (not "composite", "identity", or
 * "lang_family"). Falls back to the general autarky rationale when a
 * dimension-specific one isn't authored.
 */
function rationaleBoxHtml(record, mode) {
  const isDimension = DIMENSIONS.some(([key]) => key === mode);
  if (!isDimension) return "";
  const autarky = record.autarky || {};
  const label = DIMENSIONS.find(([key]) => key === mode)[1];
  const score = autarky[mode];
  const rationale = (autarky.rationales && autarky.rationales[mode]) || autarky.rationale || "No rationale recorded.";
  const isBeta = BETA_DIMS.has(mode);
  return `
    <div class="rationale-box${isBeta ? " rationale-beta" : ""}">
      <div class="rationale-head">
        <span class="rationale-dim">${escapeHtml(label)}</span>
        <span class="rationale-score">${escapeHtml(score ?? "—")} / 5</span>
        ${isBeta ? '<span class="badge badge-beta">beta</span>' : ""}
      </div>
      <p class="rationale-text">${escapeHtml(rationale)}</p>
      ${isBeta ? `<p class="rationale-beta-note muted">${escapeHtml(BETA_EXPLANATIONS[mode])}</p>` : ""}
    </div>`;
}

/**
 * Amendment A6.2: prominent alert box directly under the title card when the
 * clicked unit is a member of ≥1 variant set — distinct from (and more
 * prominent than) the existing yellow "variant-only view" pill, which only
 * marks records that are themselves an alternate/hidden-by-default id.
 * Inline links switch that set's active view (data-set-id/data-view-id;
 * wired up by map.js, which owns state.variantViews).
 * @param {Array<{setId:string, setLabel:string, activeViewId:string, views:Array<{id:string,label:string}>}>} membership
 */
function variantAlertHtml(membership) {
  if (!membership || membership.length === 0) return "";
  const n = membership.length;
  const setLabels = membership.map((m) => escapeHtml(m.setLabel)).join(", ");
  const rows = membership
    .map((m) => {
      const otherViews = m.views.filter((v) => v.id !== m.activeViewId);
      const links = otherViews
        .map(
          (v) =>
            `<button type="button" class="variant-alert-link" data-set-id="${escapeHtml(m.setId)}" data-view-id="${escapeHtml(v.id)}">${escapeHtml(v.label)}</button>`
        )
        .join(" · ");
      return `<p class="variant-alert-row"><strong>${escapeHtml(m.setLabel)}:</strong> ${links}</p>`;
    })
    .join("");
  return `
    <div class="variant-alert">
      <p class="variant-alert-head">⚠ ${n} alternative delineation${n === 1 ? "" : "s"} — ${setLabels}</p>
      ${rows}
    </div>`;
}

function poleHtml(record) {
  const pole = record.pole;
  if (!pole) return "";
  const centers = (pole.centers || []).map(escapeHtml).join(", ") || escapeHtml(pole.central || "—");
  return `
    <h3>Pole</h3>
    <dl class="detail-facts">
      <dt>Type</dt><dd>${escapeHtml(pole.type || "—")}</dd>
      <dt>Centers</dt><dd>${centers}</dd>
      ${pole.secondary ? `<dt>Secondary</dt><dd>${escapeHtml(pole.secondary)}</dd>` : ""}
    </dl>
    ${pole.note ? `<p class="muted">${escapeHtml(pole.note)}</p>` : ""}`;
}

function parliamentHtml(record) {
  const parl = record.parliament;
  if (!parl) return "";
  return `
    <h3>Parliament</h3>
    <p>${parl.has_own ? `<strong>${escapeHtml(parl.name || "Own parliament")}</strong>` : "No own parliament."}${
    parl.note ? ` <span class="muted">${escapeHtml(parl.note)}</span>` : ""
  }</p>`;
}

function reachHtml(record) {
  const reach = record.reach;
  if (!reach || reach.length === 0) return "";
  return `
    <h3>Reach</h3>
    <ul>${reach.map((r) => `<li><strong>${escapeHtml(r.target)}</strong>${r.note ? ` — ${escapeHtml(r.note)}` : ""}</li>`).join("")}</ul>`;
}

/**
 * A3.2/A3.4 representation row — only rendered while the map's Cultural ⇄
 * Representation switch is on. Shows the unit's current grouping under the
 * active scheme, the scheme's name, and a "user-aligned" badge when that
 * grouping is the result of a per-unit alignment override rather than the
 * scheme's own authoring.
 * @param {{schemeLabel: string, groupingName: string, overridden: boolean}|null} info
 */
function representationHtml(info) {
  if (!info) return "";
  return `
    <h3>Representation</h3>
    <p><strong>${escapeHtml(info.groupingName)}</strong> <span class="muted">(${escapeHtml(info.schemeLabel)} scheme)</span>${
    info.overridden ? ' <span class="badge badge-aligned">user-aligned ✱</span>' : ""
  }</p>`;
}

/**
 * Render the full detail panel for a region record (from data/regions.json).
 * @param {HTMLElement} container
 * @param {object} record
 * @param {string} mode — the active choropleth mode, so the per-dimension
 *   rationale box (req 5) can appear/update as the mode changes.
 * @param {{schemeLabel: string, groupingName: string, overridden: boolean}|null} [representationInfo]
 *   — A3.2/A3.4: present (non-null) whenever the map's representation switch
 *   is on, regardless of whether this unit has alignment alternatives.
 * @param {Array} [variantMembership] — A6.2: variant-set membership info for
 *   this unit (see data.js `variantMembershipInfo`); [] or omitted when the
 *   unit belongs to no variant set.
 */
export function renderDetail(container, record, mode, representationInfo, variantMembership) {
  if (!record) {
    clearDetail(container);
    return;
  }

  const autarky = record.autarky || {};
  const inclusion = record.inclusion_test || {};
  const variantBadge = record.default_visible === false
    ? `<span class="badge badge-variant">variant-only view</span>`
    : "";
  const specialBadge = record.special_status
    ? `<span class="badge badge-special">special status: ${escapeHtml(record.special_status)}</span>`
    : "";
  const conflictBadges = (record.conflict_flags || [])
    .map((f) => `<span class="badge badge-conflict">⚑ ${escapeHtml(f.id)}</span>`)
    .join(" ");

  container.innerHTML = `
    <button type="button" class="detail-close" aria-label="Close detail panel">×</button>
    <h2 class="detail-title">${escapeHtml(record.name)}</h2>
    ${record.name_local && record.name_local !== record.name ? `<p class="muted detail-local">${escapeHtml(record.name_local)}</p>` : ""}
    ${variantAlertHtml(variantMembership)}
    ${rationaleBoxHtml(record, mode)}
    <div class="badge-row">
      ${(record.countries || []).map((c) => `<span class="badge">${escapeHtml(c)}</span>`).join("")}
      ${variantBadge}
      ${specialBadge}
      ${conflictBadges}
    </div>

    ${representationHtml(representationInfo)}

    <dl class="detail-facts">
      <dt>Urban core</dt><dd>${escapeHtml(record.urban_core || "—")}</dd>
      <dt>Secondary centers</dt><dd>${(record.secondary_centers || []).map(escapeHtml).join(", ") || "—"}</dd>
      <dt>Population</dt><dd>${formatNumber(record.population)}${record.population_note ? ` <span class="muted">(${escapeHtml(record.population_note)})</span>` : ""}</dd>
      <dt>Area</dt><dd>${record.area_km2 ? `${formatNumber(Math.round(record.area_km2))} km²` : "—"}</dd>
      <dt>Language family</dt><dd>${escapeHtml(record.lang_family || "—")}</dd>
    </dl>

    <h3>Identity basis</h3>
    <p>${escapeHtml(record.identity_basis || "—")}</p>

    <h3>Key industries</h3>
    ${list(record.key_industries)}

    <h3>Autarky — composite ${escapeHtml(autarky.composite ?? "—")} / 5</h3>
    <div class="score-chart">
      ${DIMENSIONS.map(([key, label]) => scoreBar([key, label], autarky[key])).join("")}
    </div>
    <p class="muted">${escapeHtml(autarky.rationale || "")}</p>

    ${poleHtml(record)}
    ${parliamentHtml(record)}
    ${reachHtml(record)}

    <h3>Inclusion test</h3>
    <dl class="detail-facts">
      <dt>Urban hub</dt><dd>${escapeHtml(inclusion.urban_hub || "—")}</dd>
      <dt>Diversified industry</dt><dd>${escapeHtml(inclusion.diversified_industry || "—")}</dd>
      <dt>Dependent identity</dt><dd>${escapeHtml(inclusion.dependent_identity || "—")}</dd>
    </dl>

    ${record.nuts1_disagreement ? `<h3>NUTS-1 disagreement</h3><p>${escapeHtml(record.nuts1_disagreement)}</p>` : ""}

    ${(record.conflict_flags || []).length ? `<h3>Contested</h3>${(record.conflict_flags || []).map((f) => `<p><strong>${escapeHtml(f.id)}</strong> — ${escapeHtml(f.description)}</p>`).join("")}` : ""}

    <h3>Sources</h3>
    ${list(record.sources)}
  `;
  container.classList.add("detail-open");
  container.setAttribute("aria-hidden", "false");
}

export function clearDetail(container) {
  container.innerHTML = "";
  container.classList.remove("detail-open");
  container.setAttribute("aria-hidden", "true");
}
