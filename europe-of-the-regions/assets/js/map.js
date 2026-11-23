// map.js — MapLibre GL map, sidebar controls, and wiring for the
// "Europe of the Regions" interactive map (draft_v0.1.2, Task U).
//
// Loaded as a native ES module from regions/index.html. `maplibregl` is a
// global exposed by the vendored UMD bundle (vendor/maplibre-gl/maplibre-gl.js),
// loaded via a plain <script> tag before this module runs.

import {
  loadData,
  loadNuts1Boundaries,
  bboxOfGeometry,
  bboxCenterOfFeatures,
  computeVisibleIds,
  computeOverlapIds,
  computeClickOverlayIds,
  variantMembershipInfo,
  buildUnitGroupingMap,
  effectiveGroups,
} from "./data.js";
import { renderDetail, clearDetail } from "./detail.js";

// Dataset text (names, descriptions, notes) is authored/committed content,
// not user input, but we escape it anyway before any innerHTML/setHTML use
// as defense in depth against a future data-pipeline regression.
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Colorblind-safe diverging ramp: LOW autarky = dark orange, HIGH = teal/green
// (req 4 — replaces the v1 viridis/purple ramp).
const CHOROPLETH_RAMP = ["#b35806", "#e08214", "#fdb863", "#80cdc1", "#018571"];

// Categorical palette for the "identity view" mode.
const IDENTITY_COLORS = {
  standard: "#3b528b",
  variant: "#fdb863",
  "cross-border": "#e34a33",
};

// Order must match langFamilyBucket()'s possible return values (data.js).
const LANG_BUCKETS = [
  "Basque",
  "Celtic",
  "Romance",
  "Germanic",
  "Slavic",
  "Baltic",
  "Finno-Ugric / Uralic",
  "Hellenic",
  "Albanian",
  "Semitic",
  "Kartvelian",
  "Armenian",
  "Turkic",
  "Eskimo-Aleut",
  "Other / mixed",
];
const LANG_PALETTE = [
  "#e34a33", "#3b528b", "#2ca25f", "#8856a7", "#d95f0e",
  "#1f78b4", "#f1a340", "#66c2a5", "#e78ac3", "#a6d854",
  "#ffd92f", "#b3b3b3", "#7570b3", "#66a61e", "#999999",
];

// Qualitative palette cycled across the ~40-70 representation groupings
// (req 3). With 100+ groupings some colors repeat — the centroid label is
// the real identifier, not the color, per the documented approximation.
const GROUPING_PALETTE = [
  "#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f",
  "#edc949", "#af7aa1", "#ff9da7", "#9c755f", "#bab0ab",
  "#1f77b4", "#ff7f0e",
];

const DIMENSION_MODES = [
  ["composite", "Composite autarky"],
  ["water", "Water"],
  ["food", "Food"],
  ["shelter", "Shelter"],
  ["energy", "Energy"],
  ["transportation", "Transportation"],
  ["hygiene_healthcare", "Hygiene & Healthcare"],
  ["clothing", "Clothing"],
  ["identity", "Identity view"],
  ["lang_family", "Linguistic family"],
];
const BETA_MODE_KEYS = new Set(["shelter", "transportation", "hygiene_healthcare", "clothing"]);

const EUROPE_VIEW = { center: [10, 54], zoom: 3.6, bearing: 0, pitch: 0 };

// A6.4: build/promote version label, shown bottom-left of the map.
const APP_VERSION = "v0.2.2";

function fillColorExpression(mode) {
  if (mode === "identity") {
    return [
      "match",
      ["get", "identity_class"],
      "standard", IDENTITY_COLORS.standard,
      "variant", IDENTITY_COLORS.variant,
      "cross-border", IDENTITY_COLORS["cross-border"],
      "#666666",
    ];
  }
  if (mode === "lang_family") {
    const expr = ["match", ["get", "lang_bucket"]];
    LANG_BUCKETS.forEach((name, i) => expr.push(name, LANG_PALETTE[i % LANG_PALETTE.length]));
    expr.push("#888888");
    return expr;
  }
  return [
    "interpolate",
    ["linear"],
    ["coalesce", ["get", mode], 0],
    1, CHOROPLETH_RAMP[0],
    2, CHOROPLETH_RAMP[1],
    3, CHOROPLETH_RAMP[2],
    4, CHOROPLETH_RAMP[3],
    5, CHOROPLETH_RAMP[4],
  ];
}

// A3.2/A3.4: color by scheme membership resolved through `unitGroupingMap`
// (scheme groupings with any per-unit alignment overrides folded in), keyed
// on the unit's own `id` rather than a precomputed `grouping_id` property —
// this is what lets scheme switches and per-unit realignments recolor live
// without touching the GeoJSON source at all.
function schemeColorExpression(scheme, unitGroupingMap) {
  const groupingColor = new Map();
  scheme.groupings.forEach((g, i) => groupingColor.set(g.id, GROUPING_PALETTE[i % GROUPING_PALETTE.length]));
  const expr = ["match", ["get", "id"]];
  for (const [unitId, groupingId] of unitGroupingMap) {
    expr.push(unitId, groupingColor.get(groupingId) || "#555555");
  }
  expr.push("#555555");
  return expr;
}

// ---- A3.2 per-unit alignment overrides (localStorage) ---------------------

function alignmentStorageKey(schemeId, unitId) {
  return `mdRegions.align.${schemeId}.${unitId}`;
}

function loadOverridesForScheme(schemeId, scheme) {
  const map = new Map();
  const alternatives = (scheme && scheme.alternatives) || {};
  for (const unitId of Object.keys(alternatives)) {
    const stored = localStorage.getItem(alignmentStorageKey(schemeId, unitId));
    if (stored) map.set(unitId, stored);
  }
  return map;
}

function setAlignmentOverride(schemeId, unitId, groupingId) {
  localStorage.setItem(alignmentStorageKey(schemeId, unitId), groupingId);
}

function resetAllAlignmentOverrides() {
  const keys = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith("mdRegions.align.")) keys.push(k);
  }
  keys.forEach((k) => localStorage.removeItem(k));
}

// ---- A4.2 contested/conflict-zone overlays: default OFF, gated by a master
// toggle (localStorage). The individual per-overlay checkboxes are only ever
// remembered/restored while the master switch itself is on — flipping the
// master off does not erase the individual keys, but they are ignored on the
// next load (and in this session) until the master is back on, so a stale
// "on" from a previous session can never resurrect an overlay silently.
const CONFLICTS_MASTER_KEY = "mdRegions.conflictsMaster";

function conflictStorageKey(conflictId) {
  return `mdRegions.conflict.${conflictId}`;
}

function loadConflictsMasterState() {
  return localStorage.getItem(CONFLICTS_MASTER_KEY) === "1";
}

function setConflictsMasterState(on) {
  localStorage.setItem(CONFLICTS_MASTER_KEY, on ? "1" : "0");
}

function loadEnabledConflictsIfMasterOn(masterOn, conflictFlags) {
  const enabled = new Set();
  if (!masterOn) return enabled; // master off on load -> all overlays off, stored individuals ignored
  for (const flag of conflictFlags) {
    if (localStorage.getItem(conflictStorageKey(flag.id)) === "1") enabled.add(flag.id);
  }
  return enabled;
}

// ---- A5.3 on-map variant chip visibility toggle: default ON, localStorage-
// persisted. This only hides/removes the on-map chip markers themselves —
// the sidebar "Variant sets" mirror list keeps working regardless, since it
// reads/writes state.variantViews the same way whether or not any chip is
// currently attached to the map.
const VARIANT_CHIPS_VISIBLE_KEY = "mdRegions.variantChipsVisible";

function loadVariantChipsVisible() {
  const stored = localStorage.getItem(VARIANT_CHIPS_VISIBLE_KEY);
  return stored === null ? true : stored === "1"; // unset -> default ON
}

function setVariantChipsVisible(on) {
  localStorage.setItem(VARIANT_CHIPS_VISIBLE_KEY, on ? "1" : "0");
}

function legendHtml(mode) {
  if (mode === "identity") {
    return `
      <div class="legend-swatches">
        <span><i style="background:${IDENTITY_COLORS.standard}"></i>Standard cultural unit</span>
        <span><i style="background:${IDENTITY_COLORS.variant}"></i>Has variant views (toggleable)</span>
        <span><i style="background:${IDENTITY_COLORS["cross-border"]}"></i>Cross-border (territory spans 2+ states)</span>
      </div>`;
  }
  if (mode === "lang_family") {
    return `
      <div class="legend-swatches legend-swatches-compact">
        ${LANG_BUCKETS.map((name, i) => `<span><i style="background:${LANG_PALETTE[i % LANG_PALETTE.length]}"></i>${escapeHtml(name)}</span>`).join("")}
      </div>
      <p class="muted" style="font-size:0.68rem;">Approximate: coarsened from authored per-region dialect/minority notes. Full text in the detail panel.</p>`;
  }
  const isBeta = BETA_MODE_KEYS.has(mode);
  return `
    <div class="legend-ramp">
      ${CHOROPLETH_RAMP.map((c) => `<i style="background:${c}"></i>`).join("")}
    </div>
    <div class="legend-scale-labels"><span>1 (low)</span><span>5 (high)</span></div>
    ${isBeta ? `<p class="muted" style="font-size:0.68rem;">Beta dimension — easily importable within the continent; see the rationale box on a selected region.</p>` : ""}`;
}

function legendSymbolsHtml() {
  return `
    <div class="legend-swatches">
      <span><i class="legend-dash-swatch"></i>Special status (dashed border) — hover a region for the reason</span>
      <span><i class="legend-dot-swatch"></i>Capital / urban-core marker (zoom ≥ 4)</span>
      <span><i class="legend-dot-hollow-swatch"></i>Secondary pole (dipole regions)</span>
      <span><i class="legend-ring-swatch"></i>Monopole ring</span>
      <span><span class="badge badge-beta">beta</span> autarky dimension — easily imported within the continent (hygiene = capacity to produce medical/sanitation wares)</span>
    </div>`;
}

async function main() {
  const data = await loadData();
  const {
    regionsGeojson,
    regionsById,
    conflictsGeojson,
    conflictFlags,
    notes,
    attribution,
    variantSets,
    variantSetsById,
    variantRemoveIds,
    idToVariantSets,
    schemes,
  } = data;

  const geojsonById = new Map(regionsGeojson.features.map((f) => [f.properties.id, f]));
  const specialStatusIds = new Set(
    regionsGeojson.features.filter((f) => f.properties.special_status).map((f) => f.properties.id)
  );

  function activeScheme() {
    return schemes.find((s) => s.id === state.schemeId) || schemes[0];
  }

  // Recomputed by applyStyle() every time the scheme/overrides change; kept
  // in this closure variable so the click handler and hover tooltip can read
  // "what grouping is this unit in right now" without recomputing it.
  let currentUnitGroupingMap = new Map();

  const state = {
    mode: "composite",
    representation: false,
    schemeId: schemes[0].id,
    alignmentOverrides: loadOverridesForScheme(schemes[0].id, schemes[0]),
    // Defensive: fall back to the first view if a set's authored default_view
    // id doesn't match any of its own views (data/variant_sets.json bug seen
    // in "madrid": default_view "current" vs. view ids
    // city-region/with-surroundings/overlap — data/ is out of scope for this
    // task, so we validate defensively here rather than editing it).
    variantViews: Object.fromEntries(
      variantSets.map((s) => {
        const isValid = s.views.some((v) => v.id === s.default_view);
        if (!isValid) {
          console.warn(
            `variant set "${s.id}": default_view "${s.default_view}" not found among its views ` +
              `(${s.views.map((v) => v.id).join(", ")}) — falling back to "${s.views[0].id}". ` +
              `Data bug in data/variant_sets.json.`
          );
        }
        return [s.id, isValid ? s.default_view : s.views[0].id];
      })
    ),
    perspective: "curated", // curated | political | linguistic | selfsufficiency
    // A4.2: master toggle default OFF; individual overlay checkboxes only
    // ever restored from localStorage when the master itself was left on.
    conflictsMasterOn: loadConflictsMasterState(),
    enabledConflicts: new Set(),
    // A5.3: on-map variant chip markers visibility; default ON.
    variantChipsVisible: loadVariantChipsVisible(),
    selectedRegionId: null,
  };
  state.enabledConflicts = loadEnabledConflictsIfMasterOn(state.conflictsMasterOn, conflictFlags);

  let nuts1Loaded = false;

  // ---- visibility engine (shared by fills, outlines, capital markers) ----

  function visibleIdsArray() {
    return computeVisibleIds(regionsGeojson, variantRemoveIds, variantSetsById, state.variantViews);
  }

  // ---- derived layers built client-side from the current visible set ----

  function buildCapitalPoints(visibleSet) {
    const points = [];
    for (const feature of regionsGeojson.features) {
      const p = feature.properties;
      if (!visibleSet.has(p.id)) continue;
      if (!p.pole_central_coord) continue;
      points.push({
        type: "Feature",
        properties: { id: p.id, kind: "central", pole_type: p.pole_type },
        geometry: { type: "Point", coordinates: p.pole_central_coord },
      });
      if (p.pole_secondary_coord) {
        points.push({
          type: "Feature",
          properties: { id: p.id, kind: "secondary", pole_type: p.pole_type },
          geometry: { type: "Point", coordinates: p.pole_secondary_coord },
        });
      }
    }
    return { type: "FeatureCollection", features: points };
  }

  // ---- map setup -------------------------------------------------

  const map = new maplibregl.Map({
    container: "map",
    style: {
      version: 8,
      sources: {
        osm: {
          type: "raster",
          tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
          tileSize: 256,
          attribution: "© OpenStreetMap contributors",
        },
      },
      layers: [{ id: "osm", type: "raster", source: "osm" }],
    },
    center: EUROPE_VIEW.center,
    zoom: EUROPE_VIEW.zoom,
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  // req 8: compass/reset ("einnorden") control, stacked under the zoom controls.
  class CompassResetControl {
    onAdd(mapInstance) {
      const container = document.createElement("div");
      container.className = "maplibregl-ctrl maplibregl-ctrl-group compass-reset-ctrl";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "compass-reset-btn";
      btn.setAttribute("aria-label", "Reset view north (einnorden) and refit Europe");
      btn.title = "Reset bearing/pitch north and refit Europe";
      btn.textContent = "⊙";
      btn.addEventListener("click", () => {
        mapInstance.easeTo({
          bearing: EUROPE_VIEW.bearing,
          pitch: EUROPE_VIEW.pitch,
          center: EUROPE_VIEW.center,
          zoom: EUROPE_VIEW.zoom,
          duration: 400,
        });
      });
      container.appendChild(btn);
      this._container = container;
      return container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }
  }
  map.addControl(new CompassResetControl(), "top-right");

  // A6.4: build/promote version label, bottom-left corner near the
  // attribution area. A plain custom control (not a static HTML element)
  // so it shares the standard bottom-left float/margin/z-index behavior
  // MapLibre applies to every control in that corner.
  class VersionBadgeControl {
    onAdd() {
      const container = document.createElement("div");
      container.className = "maplibregl-ctrl map-version-badge";
      container.textContent = APP_VERSION;
      this._container = container;
      return container;
    }
    onRemove() {
      this._container.parentNode.removeChild(this._container);
    }
  }
  map.addControl(new VersionBadgeControl(), "bottom-left");

  map.on("error", (e) => {
    // Surface tile/network errors in the console deliberately (not swallowed)
    // so the smoke test / a human can distinguish "blocked basemap" from
    // "silently broken app".
    console.error("MapLibre error:", e && e.error ? e.error.message : e);
  });

  await new Promise((resolve) => map.on("load", resolve));

  map.addSource("regions", { type: "geojson", data: regionsGeojson });
  map.addLayer({
    id: "regions-fill",
    type: "fill",
    source: "regions",
    paint: { "fill-color": fillColorExpression(state.mode), "fill-opacity": 0.75 },
  });
  map.addLayer({
    id: "regions-outline",
    type: "line",
    source: "regions",
    // req 1: fills AND boundary lines use the SAME visibility filter, so
    // unified/connected regions render one continuous outer border with no
    // internal member borders (v1 bug).
    paint: { "line-color": "#0b0b0f", "line-width": 0.6, "line-opacity": 0.6 },
  });
  map.addLayer({
    id: "regions-selected",
    type: "line",
    source: "regions",
    paint: { "line-color": "#ffffff", "line-width": 3 },
    filter: ["==", ["get", "id"], "__none__"],
  });

  // Amendment A6.1: overlap-view emphasis, retuned to a translucent style
  // (was near-opaque fill + solid amber outline via a paint-property "case",
  // which blanked the basemap under a wide unified geometry — user
  // screenshot evidence). fill-opacity for these ids is capped at 0.2 via
  // "regions-fill"'s own paint case below; line-dasharray is NOT a
  // data-driven-capable paint property in the mapbox/maplibre style spec, so
  // the dashed emphasis lives on its own filtered layer rather than as a
  // "case" on the shared "regions-outline" layer (which stays a plain
  // constant solid line again).
  map.addLayer({
    id: "overlap-outline",
    type: "line",
    source: "regions",
    paint: { "line-color": "#ffb454", "line-width": 1.6, "line-dasharray": [2, 1.5], "line-opacity": 0.85 },
    filter: ["in", ["get", "id"], ["literal", []]],
  });

  // Amendment A6.1: click-scoped variant overlay — when the selected unit is
  // a member of a variant set, the OTHER views' geometries for that set are
  // shown here as a see-through overlay (independent of the chip-visibility
  // toggle, and without switching state.variantViews / the active view).
  // Same "regions" source (every alternate-view id already exists as its own
  // feature there); a distinct cyan dash separates this from the amber
  // overlap-outline above. Filter recomputed in applyStyle() from
  // state.selectedRegionId, so it clears for free on deselect.
  map.addLayer({
    id: "click-overlay-fill",
    type: "fill",
    source: "regions",
    paint: { "fill-color": "#5ad1ff", "fill-opacity": 0.2 },
    filter: ["in", ["get", "id"], ["literal", []]],
  });
  map.addLayer({
    id: "click-overlay-outline",
    type: "line",
    source: "regions",
    paint: { "line-color": "#5ad1ff", "line-width": 1.8, "line-dasharray": [1, 1.4], "line-opacity": 0.9 },
    filter: ["in", ["get", "id"], ["literal", []]],
  });

  // req 7: special_status dashed strokes, above the base outline.
  map.addLayer({
    id: "special-dashed-outline",
    type: "line",
    source: "regions",
    paint: { "line-color": "#ffd25a", "line-width": 1.6, "line-dasharray": [2, 1.5] },
    filter: ["in", ["get", "id"], ["literal", []]],
  });

  // Amendment A1.2: Northern Ireland renders as a DASHED internal boundary
  // above the ireland-unified fill whenever the Ireland set's active view
  // isn't "current" (i.e. NI sits inside/against the unified outline rather
  // than standing as an ordinary separately-bordered unit).
  map.addLayer({
    id: "ni-dashed-outline",
    type: "line",
    source: "regions",
    paint: { "line-color": "#8ab4ff", "line-width": 1.8, "line-dasharray": [2, 2] },
    filter: ["==", ["get", "id"], "uk-northern-ireland"],
    layout: { visibility: "none" },
  });

  // req 3: representation-group labels (approximation — see about-panel note).
  // Rendered as DOM markers (not a symbol layer) because the vendored
  // MapLibre style has no "glyphs" PBF source to shape text-field labels
  // offline; plain HTML text needs no glyph fetch.
  let groupingLabelMarkers = [];
  function setGroupingLabels(visibleSet, scheme, unitGroupingMap) {
    for (const m of groupingLabelMarkers) m.remove();
    groupingLabelMarkers = [];
    if (!state.representation) return;
    // Label the EFFECTIVE groups (post alignment-override), not the
    // authored scheme.groupings directly — otherwise a realigned unit would
    // still show up under its old group's label.
    for (const grp of effectiveGroups(scheme, unitGroupingMap)) {
      const memberFeatures = grp.memberIds
        .map((id) => geojsonById.get(id))
        .filter((f) => f && visibleSet.has(f.properties.id));
      if (memberFeatures.length === 0) continue;
      const center = bboxCenterOfFeatures(memberFeatures);
      const el = document.createElement("div");
      el.className = "grouping-label";
      el.textContent = grp.name;
      const marker = new maplibregl.Marker({ element: el, anchor: "center" }).setLngLat(center).addTo(map);
      groupingLabelMarkers.push(marker);
    }
  }

  // req 11: Political / NUTS-1 overlay (lazy-loaded, additive over any fill mode).
  map.addSource("nuts1", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: "nuts1-outline",
    type: "line",
    source: "nuts1",
    paint: { "line-color": "#ffffff", "line-width": 1.1, "line-dasharray": [1, 1], "line-opacity": 0.85 },
    layout: { visibility: "none" },
  });

  map.addSource("conflicts", { type: "geojson", data: conflictsGeojson });
  map.addLayer({
    id: "conflict-fill",
    type: "fill",
    source: "conflicts",
    paint: { "fill-color": "#ff8a00", "fill-opacity": 0.25 },
    filter: ["in", ["get", "id"], ["literal", []]],
  });
  map.addLayer({
    id: "conflict-outline",
    type: "line",
    source: "conflicts",
    paint: { "line-color": "#ff8a00", "line-width": 2, "line-dasharray": [2, 2] },
    filter: ["in", ["get", "id"], ["literal", []]],
  });
  map.addLayer({
    id: "conflict-region-highlight",
    type: "line",
    source: "regions",
    paint: { "line-color": "#ff8a00", "line-width": 3, "line-dasharray": [1, 1] },
    filter: ["in", ["get", "id"], ["literal", []]],
  });

  // req 6: capital markers — client-side point source (a circle layer on the
  // polygon source would render at every vertex, not one dot per region).
  map.addSource("capitals", { type: "geojson", data: { type: "FeatureCollection", features: [] } });
  map.addLayer({
    id: "capital-ring",
    type: "circle",
    source: "capitals",
    minzoom: 4,
    filter: ["all", ["==", ["get", "kind"], "central"], ["==", ["get", "pole_type"], "monopole"]],
    paint: {
      "circle-radius": 6,
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1.2,
      "circle-stroke-opacity": 0.8,
    },
  });
  map.addLayer({
    id: "capital-dots-secondary",
    type: "circle",
    source: "capitals",
    minzoom: 4,
    filter: ["==", ["get", "kind"], "secondary"],
    paint: {
      "circle-radius": 3.2,
      "circle-color": "rgba(0,0,0,0)",
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1.4,
    },
  });
  map.addLayer({
    id: "capital-dots",
    type: "circle",
    source: "capitals",
    minzoom: 4,
    filter: ["==", ["get", "kind"], "central"],
    paint: {
      "circle-radius": 3,
      "circle-color": "#ffffff",
      "circle-stroke-color": "#0b0b0f",
      "circle-stroke-width": 1,
    },
  });

  // ---- applyStyle: the single state -> paint/filter spine ----------------
  // Precedence: representation ON overrides the fill mode entirely (grouping
  // colors + faded borders + labels). Otherwise the choropleth mode (which
  // "linguistic"/"self-sufficiency" perspectives drive) picks the fill.
  // Variant-set visibility and the overlap/dashed emphasis sit underneath
  // both, applied to whichever fill is active.

  const regionCountEl = document.getElementById("region-count-line");

  function applyStyle() {
    const visible = visibleIdsArray();
    const visibleSet = new Set(visible);
    const overlapIds = computeOverlapIds(variantSetsById, state.variantViews);

    const baseFilter = ["in", ["get", "id"], ["literal", visible]];
    map.setFilter("regions-fill", baseFilter);
    map.setFilter("regions-outline", baseFilter);

    const scheme = activeScheme();
    currentUnitGroupingMap = buildUnitGroupingMap(scheme, state.alignmentOverrides);

    if (state.representation) {
      map.setPaintProperty("regions-fill", "fill-color", schemeColorExpression(scheme, currentUnitGroupingMap));
      map.setPaintProperty("regions-outline", "line-opacity", 0.2);
    } else {
      map.setPaintProperty("regions-fill", "fill-color", fillColorExpression(state.mode));
      map.setPaintProperty("regions-outline", "line-opacity", 0.6);
    }

    // req 1 / Amendment A6.1: overlap views get a translucent fill (capped
    // at 0.2, see the top-of-file A6.1 rendering note) + a dedicated dashed
    // amber outline layer (line-dasharray can't be a "case" on the shared
    // outline layer — see "overlap-outline" addLayer comment above) so
    // overlapping claims read clearly without blanking the basemap.
    const overlapIdsLiteral = [...overlapIds];
    map.setPaintProperty("regions-fill", "fill-opacity", [
      "case",
      ["in", ["get", "id"], ["literal", overlapIdsLiteral]],
      0.2,
      0.75,
    ]);
    map.setFilter("overlap-outline", ["in", ["get", "id"], ["literal", overlapIdsLiteral]]);

    // Amendment A6.1: click-scoped variant overlay, purely a function of
    // state.selectedRegionId + state.variantViews — recomputed every
    // applyStyle() call so it can never go stale after a view switch, and
    // clears for free whenever selectedRegionId is null.
    const clickOverlayIdsLiteral = state.selectedRegionId
      ? [...computeClickOverlayIds(state.selectedRegionId, idToVariantSets, variantSetsById, state.variantViews)]
      : [];
    map.setFilter("click-overlay-fill", ["in", ["get", "id"], ["literal", clickOverlayIdsLiteral]]);
    map.setFilter("click-overlay-outline", ["in", ["get", "id"], ["literal", clickOverlayIdsLiteral]]);

    // Amendment A6.1 (selection ring) — also purely state-driven now, so
    // every call site that used to poke "regions-selected" directly (map
    // click, search/jump focusRegion, detail-close) just sets
    // state.selectedRegionId and calls applyStyle().
    map.setFilter("regions-selected", ["==", ["get", "id"], state.selectedRegionId || "__none__"]);

    const specialVisible = visible.filter((id) => specialStatusIds.has(id));
    map.setFilter("special-dashed-outline", ["in", ["get", "id"], ["literal", specialVisible]]);

    const irelandView = state.variantViews.ireland;
    map.setLayoutProperty("ni-dashed-outline", "visibility", irelandView && irelandView !== "current" ? "visible" : "none");

    map.getSource("capitals").setData(buildCapitalPoints(visibleSet));

    setGroupingLabels(visibleSet, scheme, currentUnitGroupingMap);

    const legendEl = document.getElementById("legend-scale");
    legendEl.innerHTML = state.representation
      ? `<p class="muted" style="font-size:0.72rem;">Representation view (${escapeHtml(scheme.label)}): fill color = grouping (see legend note above); label = grouping name. Units with a user alignment choice show ✱ in their tooltip and detail panel.</p>`
      : legendHtml(state.mode);

    regionCountEl.textContent = `${visible.length} of ${regionsGeojson.features.length} region records currently visible.`;

    syncVariantControls();

    // A3.4: scheme selector + reset-alignments only make sense in
    // representation mode; the description line mirrors the active scheme.
    if (schemeSelectorRow) schemeSelectorRow.hidden = !state.representation;
    if (schemeDescriptionEl) schemeDescriptionEl.textContent = state.representation ? scheme.description || "" : "";
    syncSchemeSelector();

    if (state.selectedRegionId) {
      const membership = variantMembershipInfo(state.selectedRegionId, idToVariantSets, variantSetsById, state.variantViews);
      renderDetail(
        detailPanel,
        regionsById.get(state.selectedRegionId),
        state.mode,
        buildRepresentationInfo(state.selectedRegionId),
        membership
      );
    } else {
      clearDetail(detailPanel);
    }
  }

  // Note: the initial applyStyle() call happens at the end of main(), once
  // every control it touches (chips, mirror selects, mode select, region
  // count element) has been wired up.

  // A3.4/A3.2: build the "Representation" detail-panel row info for a unit —
  // null outside representation mode; otherwise its current (post-override)
  // grouping name, the active scheme's label, and whether that's the result
  // of a user alignment choice rather than the scheme's own authoring.
  function buildRepresentationInfo(unitId) {
    if (!state.representation) return null;
    const scheme = activeScheme();
    const groupingId = currentUnitGroupingMap.get(unitId);
    const grouping = scheme.groupings.find((g) => g.id === groupingId);
    return {
      schemeLabel: scheme.label,
      groupingName: grouping ? grouping.name : "—",
      overridden: state.alignmentOverrides.has(unitId),
    };
  }

  // ---- hover tooltip (DOM popup, not a symbol layer) -------------------------------------------------

  const popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false, offset: 8 });
  map.on("mousemove", "regions-fill", (e) => {
    map.getCanvas().style.cursor = "pointer";
    const f = e.features[0];
    const record = regionsById.get(f.properties.id);
    const specialLine =
      record && record.special_status
        ? `<br><span class="popup-special">special status: ${escapeHtml(record.special_status)}</span>`
        : "";
    // A3.2: mark units carrying a user alignment choice with an asterisk on
    // their name plus an explicit line, so the override is visible without
    // opening the detail panel.
    const isAligned = state.representation && state.alignmentOverrides.has(f.properties.id);
    const alignedLine = isAligned ? `<br><span class="popup-aligned">user-aligned ✱</span>` : "";
    popup
      .setLngLat(e.lngLat)
      .setHTML(`<strong>${escapeHtml(f.properties.name)}${isAligned ? " ✱" : ""}</strong>${specialLine}${alignedLine}`)
      .addTo(map);
  });
  map.on("mouseleave", "regions-fill", () => {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  // ---- click -> detail (+ A3.2 alignment popover) -------------------------------------------------

  const detailPanel = document.getElementById("detail-panel");
  let alignmentPopup = null;

  // A3.2: opens near the click point when the active scheme's `alternatives`
  // names candidate groupings for this unit — works for whichever scheme
  // actually authors alternatives (the balanced scheme today), not a
  // hardcoded scheme id, so it degrades correctly under the groupings.json
  // fallback (alternatives: {}) with no popover ever appearing.
  function openAlignmentPopover(unitId, lngLat) {
    const scheme = activeScheme();
    const altIds = (scheme.alternatives && scheme.alternatives[unitId]) || [];
    if (altIds.length === 0) return;

    const currentGroupingId = currentUnitGroupingMap.get(unitId);
    const candidateIds = [currentGroupingId, ...altIds.filter((gid) => gid !== currentGroupingId)];
    const groupingById = new Map(scheme.groupings.map((g) => [g.id, g]));
    const candidates = candidateIds.map((gid) => groupingById.get(gid)).filter(Boolean);
    if (candidates.length === 0) return;

    const record = regionsById.get(unitId);

    if (alignmentPopup) alignmentPopup.remove();

    const container = document.createElement("div");
    container.className = "align-popover";

    const title = document.createElement("p");
    title.className = "align-popover-title";
    title.textContent = `Align ${record ? record.name : unitId} with:`;
    container.appendChild(title);

    const list = document.createElement("div");
    list.className = "override-list";
    for (const grouping of candidates) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "align-choice";
      input.value = grouping.id;
      input.checked = grouping.id === currentGroupingId;
      input.addEventListener("change", () => {
        setAlignmentOverride(scheme.id, unitId, grouping.id);
        state.alignmentOverrides.set(unitId, grouping.id);
        applyStyle();
        if (alignmentPopup) alignmentPopup.remove();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + grouping.name));
      list.appendChild(label);
    }
    container.appendChild(list);

    alignmentPopup = new maplibregl.Popup({ closeButton: true, closeOnClick: true, offset: 10 })
      .setLngLat(lngLat)
      .setDOMContent(container)
      .addTo(map);
  }

  // Amendment A6.1: selection (and everything it drives — the white
  // selection ring, the click-scoped variant overlay, the detail panel) is
  // fully derived from state.selectedRegionId inside applyStyle() now — see
  // the "single state -> paint/filter spine" note above it. Every place that
  // changes selection just sets the id and calls applyStyle().
  function deselectRegion() {
    if (state.selectedRegionId === null) return;
    state.selectedRegionId = null;
    if (alignmentPopup) alignmentPopup.remove();
    applyStyle();
  }

  map.on("click", "regions-fill", (e) => {
    const f = e.features[0];
    const id = f.properties.id;
    state.selectedRegionId = id;
    applyStyle();
    if (state.representation) openAlignmentPopover(id, e.lngLat);
  });

  // Amendment A6.1: clicking outside any region (open sea, etc.) clears the
  // current selection — and with it the click-scoped overlay and detail
  // panel. Guarded by queryRenderedFeatures so this never double-handles a
  // click that the layer-scoped listener above already processed (MapLibre
  // fires the generic "click" event for every click regardless of layer).
  map.on("click", (e) => {
    const hits = map.queryRenderedFeatures(e.point, { layers: ["regions-fill"] });
    if (hits.length > 0) return;
    deselectRegion();
  });

  // Amendment A6.1: Escape clears the selection (and click-scoped overlay)
  // from anywhere on the page, not just via the detail panel's close button.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") deselectRegion();
  });

  detailPanel.addEventListener("click", (e) => {
    if (e.target.closest(".detail-close")) {
      deselectRegion();
      return;
    }
    // Amendment A6.2: inline view-switch links inside the variant alert box
    // reuse the exact same "set the active view, restyle" pattern as the
    // on-map chips / sidebar mirror selects below — no dedicated switching
    // logic to keep in sync.
    const alertLink = e.target.closest(".variant-alert-link");
    if (alertLink) {
      state.variantViews[alertLink.dataset.setId] = alertLink.dataset.viewId;
      applyStyle();
    }
  });

  // ---- mode selector -------------------------------------------------

  const modeSelect = document.getElementById("mode-select");
  for (const [value, label] of DIMENSION_MODES) {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = label;
    modeSelect.appendChild(opt);
  }
  modeSelect.value = state.mode;
  modeSelect.addEventListener("change", () => {
    state.mode = modeSelect.value;
    applyStyle();
  });

  // ---- cultural <-> representation master switch -------------------------------------------------

  const representationToggle = document.getElementById("representation-master");
  representationToggle.addEventListener("change", () => {
    state.representation = representationToggle.checked;
    applyStyle();
  });

  // ---- A3.4 representation scheme selector + A3.2 reset-alignments -------------------------------------------------

  const schemeSelectorRow = document.getElementById("scheme-selector-row");
  const schemeSelectorList = document.getElementById("scheme-selector-list");
  const schemeDescriptionEl = document.getElementById("scheme-description");
  const resetAlignmentsBtn = document.getElementById("reset-alignments-link");

  function buildSchemeSelector() {
    schemeSelectorList.innerHTML = "";
    for (const scheme of schemes) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "scheme-select";
      input.value = scheme.id;
      input.checked = scheme.id === state.schemeId;
      input.addEventListener("change", () => {
        if (!input.checked) return;
        state.schemeId = scheme.id;
        state.alignmentOverrides = loadOverridesForScheme(scheme.id, scheme);
        if (alignmentPopup) alignmentPopup.remove();
        applyStyle();
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + scheme.label));
      schemeSelectorList.appendChild(label);
    }
  }

  function syncSchemeSelector() {
    schemeSelectorList.querySelectorAll("input[type=radio]").forEach((input) => {
      input.checked = input.value === state.schemeId;
    });
  }

  buildSchemeSelector();

  if (resetAlignmentsBtn) {
    resetAlignmentsBtn.addEventListener("click", () => {
      resetAllAlignmentOverrides();
      state.alignmentOverrides = new Map();
      if (alignmentPopup) alignmentPopup.remove();
      applyStyle();
    });
  }

  // ---- perspectives panel -------------------------------------------------

  // A2.3 (round-3 amendment): the "planned — needs source" stub cards live
  // as static markup in regions/index.html's #perspective-list (outside this
  // file's ownership scope for this task), so the Bioregions stub is added
  // here at runtime instead of touching that file. Matches the existing
  // stub cards' markup/classes exactly; see index.html for the others
  // (dioceses, tourism, phone prefixes, postal zones).
  const perspectiveList = document.getElementById("perspective-list");
  if (perspectiveList && !perspectiveList.querySelector('input[value="bioregions"]')) {
    const label = document.createElement("label");
    label.className = "perspective-planned";
    label.title = "planned — needs source";
    label.innerHTML =
      '<input type="radio" name="perspective" value="bioregions" disabled> ' +
      "Bioregions (HydroSHEDS — from Unlocking Housing) " +
      '<span class="badge badge-small">planned</span>';
    perspectiveList.appendChild(label);
  }

  async function handlePerspectiveChange() {
    if (state.perspective === "political") {
      if (!nuts1Loaded) {
        const geo = await loadNuts1Boundaries();
        map.getSource("nuts1").setData(geo);
        nuts1Loaded = true;
      }
      map.setLayoutProperty("nuts1-outline", "visibility", "visible");
    } else {
      map.setLayoutProperty("nuts1-outline", "visibility", "none");
    }

    if (state.perspective === "linguistic") {
      state.mode = "lang_family";
      modeSelect.value = "lang_family";
      applyStyle();
    } else if (state.perspective === "selfsufficiency") {
      if (state.mode === "identity" || state.mode === "lang_family") {
        state.mode = "composite";
        modeSelect.value = "composite";
        applyStyle();
      }
      setSectionCollapsed("choropleth", false);
    }
  }

  document.querySelectorAll('input[name="perspective"]').forEach((input) => {
    input.addEventListener("change", () => {
      if (!input.checked) return;
      state.perspective = input.value;
      handlePerspectiveChange();
    });
  });

  // ---- on-map variant chips + sidebar mirror -------------------------------------------------

  const chipControls = new Map(); // setId -> { btn, menu }

  function buildChipElement(set) {
    const wrap = document.createElement("div");
    wrap.className = "variant-chip";
    wrap.dataset.setId = set.id;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "variant-chip-btn";
    wrap.appendChild(btn);

    const menu = document.createElement("div");
    menu.className = "variant-chip-menu";
    menu.hidden = true;
    for (const view of set.views) {
      const label = document.createElement("label");
      const input = document.createElement("input");
      input.type = "radio";
      input.name = `chip-${set.id}`;
      input.value = view.id;
      input.addEventListener("change", () => {
        state.variantViews[set.id] = view.id;
        applyStyle();
        menu.hidden = true;
      });
      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + view.label));
      menu.appendChild(label);
    }
    wrap.appendChild(menu);

    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".variant-chip-menu").forEach((m) => {
        if (m !== menu) m.hidden = true;
      });
      menu.hidden = !menu.hidden;
    });
    wrap.addEventListener("click", (e) => e.stopPropagation());

    return { wrap, btn, menu };
  }

  const chipMarkers = []; // A5.3: kept so the master checkbox can remove/re-add every chip marker

  for (const set of variantSets) {
    const { wrap, btn, menu } = buildChipElement(set);
    // Small + offset so the chip cannot swallow region clicks beyond its own
    // tiny footprint (req 2).
    const marker = new maplibregl.Marker({ element: wrap, anchor: "bottom", offset: [0, -4] }).setLngLat(set.anchor).addTo(map);
    chipControls.set(set.id, { btn, menu });
    chipMarkers.push(marker);
  }
  document.addEventListener("click", () => {
    document.querySelectorAll(".variant-chip-menu").forEach((m) => (m.hidden = true));
  });

  const variantMirrorEl = document.getElementById("variant-sets-list");
  variantMirrorEl.innerHTML = variantSets
    .map(
      (set) => `
      <div class="variant-mirror-row">
        <span class="variant-mirror-label">${escapeHtml(set.label)}</span>
        <select data-set-id="${escapeHtml(set.id)}">
          ${set.views.map((v) => `<option value="${escapeHtml(v.id)}">${escapeHtml(v.label)}</option>`).join("")}
        </select>
      </div>`
    )
    .join("");
  variantMirrorEl.querySelectorAll("select[data-set-id]").forEach((sel) => {
    sel.addEventListener("change", () => {
      state.variantViews[sel.dataset.setId] = sel.value;
      applyStyle();
    });
  });

  function syncVariantControls() {
    for (const set of variantSets) {
      const activeViewId = state.variantViews[set.id];
      const activeView = set.views.find((v) => v.id === activeViewId);
      const chip = chipControls.get(set.id);
      if (chip) {
        chip.btn.textContent = `${set.label}: ${activeView ? activeView.label : "?"}`;
        chip.menu.querySelectorAll("input[type=radio]").forEach((input) => {
          input.checked = input.value === activeViewId;
        });
      }
      const sel = variantMirrorEl.querySelector(`select[data-set-id="${CSS.escape(set.id)}"]`);
      if (sel) sel.value = activeViewId;
    }
  }

  // ---- A5.3 "Show variant switchers on map" chip-visibility master toggle ----
  // Every marker was added to the map in the loop above, so this only ever
  // removes markers that should be hidden (or re-adds ones previously
  // removed) — it never double-adds a still-attached marker.
  function applyVariantChipsVisibility() {
    for (const marker of chipMarkers) {
      if (state.variantChipsVisible) marker.addTo(map);
      else marker.remove();
    }
  }

  const variantChipsMasterToggle = document.getElementById("variant-chips-master");
  if (variantChipsMasterToggle) {
    variantChipsMasterToggle.checked = state.variantChipsVisible;
    variantChipsMasterToggle.addEventListener("change", () => {
      state.variantChipsVisible = variantChipsMasterToggle.checked;
      setVariantChipsVisible(state.variantChipsVisible);
      applyVariantChipsVisibility();
    });
  }
  applyVariantChipsVisibility(); // sync marker attachment to the resolved initial state

  // ---- conflict list -------------------------------------------------

  function applyConflictFilter() {
    const withGeom = [];
    const regionHighlights = [];
    for (const flag of conflictFlags) {
      if (!state.enabledConflicts.has(flag.id)) continue;
      if (flag.has_geometry) withGeom.push(flag.id);
      else regionHighlights.push(flag.region_id);
    }
    map.setFilter("conflict-fill", ["in", ["get", "id"], ["literal", withGeom]]);
    map.setFilter("conflict-outline", ["in", ["get", "id"], ["literal", withGeom]]);
    map.setFilter("conflict-region-highlight", ["in", ["get", "id"], ["literal", regionHighlights]]);
  }

  const conflictListEl = document.getElementById("conflict-list");
  conflictListEl.innerHTML = conflictFlags
    .map(
      (flag) => `
      <li class="conflict-item">
        <label>
          <input type="checkbox" data-conflict-id="${escapeHtml(flag.id)}">
          <span class="conflict-region">${escapeHtml(flag.region_name)}</span>
          ${flag.has_geometry ? "" : '<span class="badge badge-small">no geometry</span>'}
        </label>
        <p class="conflict-desc muted">${escapeHtml(flag.description)}</p>
      </li>`
    )
    .join("");
  conflictListEl.querySelectorAll("input[data-conflict-id]").forEach((input) => {
    // Reflect state.enabledConflicts (already resolved from localStorage only
    // when the master toggle was on) as the initial checkbox state.
    input.checked = state.enabledConflicts.has(input.dataset.conflictId);
    input.addEventListener("change", () => {
      const id = input.dataset.conflictId;
      if (input.checked) state.enabledConflicts.add(id);
      else state.enabledConflicts.delete(id);
      // A4.2: individual overlay state is only persisted while the master
      // toggle is on — flipping it off later leaves these keys stale but
      // they are never read back unless the master is on again.
      if (state.conflictsMasterOn) {
        localStorage.setItem(conflictStorageKey(id), input.checked ? "1" : "0");
      }
      applyConflictFilter();
    });
  });
  applyConflictFilter(); // sync map filter to the resolved initial state

  // ---- A4.2 master toggle: "Contested & cultural overlays" -----------------

  const conflictsMasterToggle = document.getElementById("conflicts-master");
  const conflictsOverlayBodyEl = document.getElementById("conflicts-overlay-body");

  function applyConflictsMasterVisibility() {
    if (conflictsOverlayBodyEl) conflictsOverlayBodyEl.hidden = !state.conflictsMasterOn;
  }

  if (conflictsMasterToggle) {
    conflictsMasterToggle.checked = state.conflictsMasterOn;
    applyConflictsMasterVisibility();
    conflictsMasterToggle.addEventListener("change", () => {
      state.conflictsMasterOn = conflictsMasterToggle.checked;
      setConflictsMasterState(state.conflictsMasterOn);
      applyConflictsMasterVisibility();
      if (!state.conflictsMasterOn) {
        // Turning the master off clears every active overlay immediately —
        // per A4.2 "master off -> all overlays off regardless of stored
        // individuals" applies within the session too, not just on reload.
        state.enabledConflicts.clear();
        conflictListEl.querySelectorAll("input[data-conflict-id]").forEach((input) => {
          input.checked = false;
        });
        applyConflictFilter();
      }
    });
  }

  // ---- search + alphabetical jump dropdown -------------------------------------------------

  const searchInput = document.getElementById("search-input");
  const searchResults = document.getElementById("search-results");
  const searchNotice = document.getElementById("search-notice");
  const jumpSelect = document.getElementById("region-jump-select");

  // A matched region can be hidden by the current variant-set state (e.g.
  // searching "South Tyrol" while Tyrol's chip is set to "connected"/unified).
  // Zooming to it would show nothing — instead surface an inline notice.
  function regionVisibilityInfo(props) {
    const visibleSet = new Set(visibleIdsArray());
    if (visibleSet.has(props.id)) return { visible: true };
    const owningSets = variantSets.filter((s) => s.views.some((v) => v.show.includes(props.id)));
    if (owningSets.length === 0) return { visible: true }; // default_visible false w/ no set owns it: shouldn't happen, fail open
    const set = owningSets[0];
    const owningView = set.views.find((v) => v.show.includes(props.id));
    return { visible: false, setLabel: set.label, viewLabel: owningView.label, setId: set.id };
  }

  function focusRegion(f) {
    const info = regionVisibilityInfo(f.properties);
    if (!info.visible) {
      searchNotice.textContent =
        `"${f.properties.name}" is only shown when the "${escapeHtml(info.setLabel)}" variant set is on ` +
        `"${escapeHtml(info.viewLabel)}" — switch its chip/mirror control to view it.`;
      searchResults.innerHTML = "";
      return;
    }
    searchNotice.textContent = "";
    const [minX, minY, maxX, maxY] = bboxOfGeometry(f.geometry);
    map.fitBounds([[minX, minY], [maxX, maxY]], { padding: 60, maxZoom: 8 });
    state.selectedRegionId = f.properties.id;
    applyStyle();
    searchResults.innerHTML = "";
  }

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = "";
    searchNotice.textContent = "";
    if (!q) return;
    const matches = regionsGeojson.features
      .filter((f) => f.properties.name.toLowerCase().includes(q))
      .slice(0, 12);
    for (const f of matches) {
      const li = document.createElement("li");
      li.textContent = f.properties.name;
      li.addEventListener("click", () => {
        searchInput.value = f.properties.name;
        focusRegion(f);
      });
      searchResults.appendChild(li);
    }
  });

  // req 9: alphabetical <select> jump-to dropdown, beside the text search.
  const sortedFeatures = [...regionsGeojson.features].sort((a, b) => a.properties.name.localeCompare(b.properties.name));
  const placeholderOpt = document.createElement("option");
  placeholderOpt.value = "";
  placeholderOpt.textContent = "Jump to region…";
  jumpSelect.appendChild(placeholderOpt);
  for (const f of sortedFeatures) {
    const opt = document.createElement("option");
    opt.value = f.properties.id;
    opt.textContent = f.properties.name;
    jumpSelect.appendChild(opt);
  }
  jumpSelect.addEventListener("change", () => {
    if (!jumpSelect.value) return;
    const f = geojsonById.get(jumpSelect.value);
    if (f) focusRegion(f);
    jumpSelect.value = "";
  });

  // ---- legend: static symbols + mode-dependent scale + footer -------------------------------------------------

  document.getElementById("legend-symbols").innerHTML = legendSymbolsHtml();

  // Match only the note that is actually ABOUT Kaliningrad (starts with the
  // place name); a substring match on "kaliningrad" alone would also catch
  // the Ceuta/Melilla note, which merely references "a Kaliningrad-style
  // treatment" in passing.
  const kaliningradNote = notes.find((n) => n.trim().toLowerCase().startsWith("kaliningrad"));
  const footerEl = document.getElementById("legend-footer");
  // Amendment A6.3: collapsed by default (no "open" attribute) — the note is
  // long enough to otherwise dominate the legend/attribution box.
  footerEl.innerHTML = `
    ${
      kaliningradNote
        ? `<details class="legend-note-details"><summary>Kaliningrad note</summary><p class="legend-note">${escapeHtml(kaliningradNote)}</p></details>`
        : ""
    }
    <p class="legend-attribution">© OpenStreetMap contributors${attribution.length ? " · " + escapeHtml(attribution.join(" · ")) : ""}</p>
  `;

  // ---- collapsible sidebar sections (req 10), state in localStorage -------------------------------------------------

  function setSectionCollapsed(key, collapsed) {
    const el = document.querySelector(`.sidebar-section[data-section="${CSS.escape(key)}"]`);
    if (!el) return;
    el.classList.toggle("section-collapsed", collapsed);
    localStorage.setItem(`mdRegions.collapsed.${key}`, collapsed ? "1" : "0");
  }

  document.querySelectorAll(".sidebar-section").forEach((section) => {
    const key = section.dataset.section;
    const toggle = section.querySelector(".chevron-toggle");
    const stored = localStorage.getItem(`mdRegions.collapsed.${key}`);
    if (stored === "1") section.classList.add("section-collapsed");
    toggle.addEventListener("click", () => {
      setSectionCollapsed(key, !section.classList.contains("section-collapsed"));
    });
  });

  // ---- sidebar drawer (mobile) -------------------------------------------------

  const sidebar = document.getElementById("sidebar");
  const sidebarToggle = document.getElementById("sidebar-toggle");
  sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("sidebar-open");
  });

  // ---- about panel -------------------------------------------------

  const aboutToggle = document.getElementById("about-toggle");
  const aboutPanel = document.getElementById("about-panel");
  aboutToggle.addEventListener("click", () => {
    aboutPanel.classList.toggle("collapsed");
  });

  // Now that every control applyStyle() touches (chips, mirror selects, mode
  // select, region-count element) is wired up, run it once to paint the
  // initial state.
  applyStyle();

  // Expose for the headless smoke test (window.__mdApp.state, .map, plus a
  // couple of direct setters so Playwright can drive state without needing
  // to simulate every DOM interaction).
  window.__mdApp = {
    state,
    map,
    schemes,
    featureCount: regionsGeojson.features.length,
    visibleIds: () => visibleIdsArray(),
    setVariantView(setId, viewId) {
      state.variantViews[setId] = viewId;
      applyStyle();
    },
    // A3-app test hooks: drive scheme switching / per-unit alignment without
    // needing to simulate every click/radio interaction.
    setScheme(schemeId) {
      const scheme = schemes.find((s) => s.id === schemeId);
      if (!scheme) return;
      state.schemeId = schemeId;
      state.alignmentOverrides = loadOverridesForScheme(schemeId, scheme);
      applyStyle();
    },
    getUnitGrouping: (unitId) => currentUnitGroupingMap.get(unitId),
    setAlignment(unitId, groupingId) {
      setAlignmentOverride(state.schemeId, unitId, groupingId);
      state.alignmentOverrides.set(unitId, groupingId);
      applyStyle();
    },
    resetAlignments() {
      resetAllAlignmentOverrides();
      state.alignmentOverrides = new Map();
      applyStyle();
    },
  };
}

/**
 * F5.1: user-visible failure state. If data loading / map init fails, the
 * console.error alone leaves a blank dark page — render an explicit error
 * banner into the map container and sidebar so the failure is visible.
 */
function renderLoadFailure(err) {
  const message = err && err.message ? err.message : String(err);

  function buildBanner() {
    const banner = document.createElement("div");
    banner.className = "load-error";
    banner.setAttribute("role", "alert");

    const title = document.createElement("strong");
    title.textContent = "Data failed to load.";
    banner.appendChild(title);

    const body = document.createElement("p");
    body.textContent = `The region dataset could not be fetched (${message}). Please reload the page to retry.`;
    banner.appendChild(body);

    const retry = document.createElement("button");
    retry.type = "button";
    retry.textContent = "Reload";
    retry.addEventListener("click", () => location.reload());
    banner.appendChild(retry);

    return banner;
  }

  const mapEl = document.getElementById("map");
  if (mapEl) mapEl.prepend(buildBanner());
  const sidebarEl = document.getElementById("sidebar");
  if (sidebarEl) sidebarEl.prepend(buildBanner());
}

main().catch((err) => {
  console.error("Map app failed to initialize:", err);
  renderLoadFailure(err);
});
