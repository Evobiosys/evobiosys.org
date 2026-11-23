// data.js — fetches and prepares the region/variant/grouping datasets for the
// map app, and hosts the pure visibility-engine helpers used by map.js.
//
// Paths are relative to the DOCUMENT (regions/index.html), not to this
// module's own URL — `fetch("../data/x")` resolves against window.location,
// so the identical build works served at "/regions/" and at
// "/draft/regions/" (req 12).

const REGIONS_GEOJSON_URL = "../data/regions.geojson";
const REGIONS_JSON_URL = "../data/regions.json";
const CONFLICTS_GEOJSON_URL = "../data/conflicts.geojson";
const VARIANT_SETS_URL = "../data/variant_sets.json";
const GROUPINGS_URL = "../data/groupings.json";
const GROUPING_SCHEMES_URL = "../data/grouping_schemes.json";
const NUTS1_BOUNDARIES_URL = "../assets/data/nuts1_boundaries.geojson";

// ---- linguistic bucketing (Perspectives: "Linguistic" lens) ----------------
//
// `lang_family` is authored free text (dialect-level detail, minority notes,
// e.g. "West Slavic (Polish; Kashubian minority ethnolect)"). For a
// categorical choropleth we coarsen it to ~12 top-level families by keyword
// match. This is a display simplification only — the full authored string is
// still shown verbatim in the detail panel, so no information is lost or
// fabricated (per the "honest, no fake data" requirement for the Perspectives
// panel as a whole).
const LANG_FAMILY_BUCKETS = [
  ["basque", "Basque"],
  ["celtic", "Celtic"],
  ["eastern romance", "Romance"],
  ["romance", "Romance"],
  ["german", "Germanic"],
  ["slavic", "Slavic"],
  ["baltic", "Baltic"],
  ["finno-ugric", "Finno-Ugric / Uralic"],
  ["uralic", "Finno-Ugric / Uralic"],
  ["hellenic", "Hellenic"],
  ["greek", "Hellenic"],
  ["albanian", "Albanian"],
  ["semitic", "Semitic"],
  ["kartvelian", "Kartvelian"],
  ["armenian", "Armenian"],
  ["turkic", "Turkic"],
  ["eskimo-aleut", "Eskimo-Aleut"],
];

export function langFamilyBucket(raw) {
  const s = String(raw || "").toLowerCase();
  for (const [needle, bucket] of LANG_FAMILY_BUCKETS) {
    if (s.includes(needle)) return bucket;
  }
  return "Other / mixed";
}

/**
 * A3.3/A4.1 binding contract: data/grouping_schemes.json =
 * [{id, label, description, groupings:[{id,name,member_ids,rationale}],
 *   alternatives:{unit_id:[grouping_id,…]}, factor_exempt:[…],
 *   sovereign_floor:[…]?, computed_factor:number?}]. The array length is not
 * fixed at 2 — it started as [affinity-66, balanced] and A4.1 adds a third
 * "balanced-national" scheme, so all app code iterates `schemes` generically
 * rather than indexing scheme[0]/scheme[1] by position.
 *
 * Falls back to the legacy single-scheme data/groupings.json — wrapped as a
 * synthetic one-scheme array with no alternatives/exemptions — when
 * grouping_schemes.json is absent, 404s, or fails to parse, so the app
 * degrades gracefully instead of hard-failing while the data pipeline hasn't
 * emitted the multi-scheme file yet.
 */
export async function loadGroupingSchemes() {
  try {
    const res = await fetch(GROUPING_SCHEMES_URL);
    if (res.ok) {
      const schemes = await res.json();
      if (Array.isArray(schemes) && schemes.length > 0) return schemes;
    }
  } catch (err) {
    console.warn(`grouping_schemes.json unavailable (${err.message}); falling back to groupings.json.`);
  }
  const fallbackRes = await fetch(GROUPINGS_URL);
  if (!fallbackRes.ok) throw new Error(`Failed to load ${GROUPINGS_URL}: ${fallbackRes.status}`);
  const groupings = await fallbackRes.json();
  return [
    {
      id: "affinity-66",
      label: "Affinity (66)",
      description:
        "Original affinity-based grouping layer (single-scheme fallback — data/grouping_schemes.json not available in this build).",
      groupings,
      alternatives: {},
      factor_exempt: [],
    },
  ];
}

/** unit id -> grouping id for one scheme, with per-unit alignment overrides
 * (A3.2) applied on top. `overrides` is a Map<unitId, groupingId>; only
 * applied when the unit actually exists in the scheme (defensive against a
 * stale localStorage entry from a scheme that no longer partitions that
 * unit). */
export function buildUnitGroupingMap(scheme, overrides) {
  const map = new Map();
  for (const grp of scheme.groupings) {
    for (const id of grp.member_ids || []) map.set(id, grp.id);
  }
  if (overrides) {
    for (const [unitId, groupingId] of overrides) {
      if (map.has(unitId)) map.set(unitId, groupingId);
    }
  }
  return map;
}

/** Effective groups after alignment overrides are folded in — the single
 * source of truth for both the fill-color expression and the on-map group
 * labels, so they can never disagree about which unit currently renders as
 * part of which group. Returns [{id, name, memberIds}]. */
export function effectiveGroups(scheme, unitGroupingMap) {
  const byGroup = new Map();
  for (const [unitId, groupingId] of unitGroupingMap) {
    if (!byGroup.has(groupingId)) byGroup.set(groupingId, []);
    byGroup.get(groupingId).push(unitId);
  }
  const groupingById = new Map(scheme.groupings.map((g) => [g.id, g]));
  return [...byGroup.entries()].map(([id, memberIds]) => ({
    id,
    name: (groupingById.get(id) || {}).name || id,
    memberIds,
  }));
}

/**
 * Load all datasets and pre-process region features so every value the
 * paint/filter expressions need already exists as a flat, primitive property
 * (no array access inside MapLibre expressions).
 */
export async function loadData() {
  const [regionsGeojsonRes, regionsJsonRes, conflictsGeojsonRes, variantSetsRes, schemes] =
    await Promise.all([
      fetch(REGIONS_GEOJSON_URL),
      fetch(REGIONS_JSON_URL),
      fetch(CONFLICTS_GEOJSON_URL),
      fetch(VARIANT_SETS_URL),
      loadGroupingSchemes(),
    ]);

  for (const [res, url] of [
    [regionsGeojsonRes, REGIONS_GEOJSON_URL],
    [regionsJsonRes, REGIONS_JSON_URL],
    [conflictsGeojsonRes, CONFLICTS_GEOJSON_URL],
    [variantSetsRes, VARIANT_SETS_URL],
  ]) {
    if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  }

  const regionsGeojson = await regionsGeojsonRes.json();
  const regionsJson = await regionsJsonRes.json();
  const conflictsGeojson = await conflictsGeojsonRes.json();
  const variantSets = await variantSetsRes.json();
  // Back-compat: `groupings` is scheme[0]'s (affinity-66) grouping list —
  // map.js drives live scheme switching off `schemes` directly.
  const groupings = schemes[0].groupings;

  // ---- variant-set index: which ids ever appear in any view (removeSet),
  // and which set(s) a given id belongs to ("has variant views"). ----------
  const variantRemoveIds = new Set();
  const idToVariantSets = new Map(); // id -> Set<setId>
  for (const set of variantSets) {
    for (const view of set.views) {
      for (const id of view.show) {
        variantRemoveIds.add(id);
        if (!idToVariantSets.has(id)) idToVariantSets.set(id, new Set());
        idToVariantSets.get(id).add(set.id);
      }
    }
  }

  // ---- grouping index: unit id -> grouping record --------------------------
  const groupingByMemberId = new Map();
  for (const grp of groupings) {
    for (const id of grp.member_ids || []) {
      groupingByMemberId.set(id, grp);
    }
  }

  for (const feature of regionsGeojson.features) {
    const props = feature.properties;
    props.country_count = (props.countries || []).length;
    props.cross_border = props.country_count > 1;
    props.has_variant_views = idToVariantSets.has(props.id);
    // identity_class kept for the choropleth "identity" mode; cross-border
    // takes priority visually, but the legend spells out both concepts
    // separately per req 13 (they are not mutually exclusive).
    props.identity_class = props.cross_border
      ? "cross-border"
      : props.has_variant_views
      ? "variant"
      : "standard";
    props.lang_bucket = langFamilyBucket(props.lang_family);
    const grp = groupingByMemberId.get(props.id);
    props.grouping_id = grp ? grp.id : null;
    props.grouping_name = grp ? grp.name : null;
  }

  const regionsById = new Map();
  for (const record of regionsJson.regions) {
    regionsById.set(record.id, record);
  }

  const variantSetsById = new Map(variantSets.map((s) => [s.id, s]));

  const conflictFlags = [];
  const geometryIds = new Set(conflictsGeojson.features.map((f) => f.properties.id));
  for (const record of regionsJson.regions) {
    for (const flag of record.conflict_flags || []) {
      conflictFlags.push({
        id: flag.id,
        description: flag.description,
        region_id: record.id,
        region_name: record.name,
        has_geometry: geometryIds.has(flag.id),
      });
    }
  }
  conflictFlags.sort((a, b) => a.region_name.localeCompare(b.region_name));

  return {
    regionsGeojson,
    regionsJson,
    regionsById,
    conflictsGeojson,
    variantSets,
    variantSetsById,
    variantRemoveIds,
    idToVariantSets,
    schemes,
    groupings,
    groupingByMemberId,
    conflictFlags,
    notes: regionsJson.notes || [],
    attribution: regionsJson.attribution || [],
  };
}

let nuts1Cache = null;
/** Lazy-loaded (~350KB): only fetched the first time the "Political / NUTS-1"
 * perspective is selected, so the base app load stays light. */
export async function loadNuts1Boundaries() {
  if (nuts1Cache) return nuts1Cache;
  const res = await fetch(NUTS1_BOUNDARIES_URL);
  if (!res.ok) throw new Error(`Failed to load ${NUTS1_BOUNDARIES_URL}: ${res.status}`);
  nuts1Cache = await res.json();
  return nuts1Cache;
}

// ---- visibility engine ------------------------------------------------
//
// visible = (default_visible − removeSet) ∪ addSet
// removeSet = union of every view's `show` list across ALL variant sets
//             (variantRemoveIds, precomputed once above)
// addSet    = union of the ACTIVE view's `show` list for every set, given the
//             current `variantViews` state ({setId: viewId})
//
// The same formula (and the same resulting id list) drives fills, outlines,
// capital-marker points, and the overlap/dashed emphasis layers, so they can
// never disagree about what's on screen.
export function computeVisibleIds(regionsGeojson, variantRemoveIds, variantSetsById, variantViews) {
  const ids = [];
  for (const feature of regionsGeojson.features) {
    const p = feature.properties;
    if (variantRemoveIds.has(p.id)) continue;
    if (p.default_visible) ids.push(p.id);
  }
  for (const [setId, viewId] of Object.entries(variantViews)) {
    const set = variantSetsById.get(setId);
    if (!set) continue;
    const view = set.views.find((v) => v.id === viewId);
    if (!view) continue;
    for (const id of view.show) ids.push(id);
  }
  return ids;
}

/** ids that should render translucent + emphasized-outline because they are
 * members of a currently-active `overlap: true` view. */
export function computeOverlapIds(variantSetsById, variantViews) {
  const ids = new Set();
  for (const [setId, viewId] of Object.entries(variantViews)) {
    const set = variantSetsById.get(setId);
    if (!set) continue;
    const view = set.views.find((v) => v.id === viewId);
    if (view && view.overlap) {
      for (const id of view.show) ids.add(id);
    }
  }
  return ids;
}

/**
 * Amendment A6.1: ids that should render as a translucent click-scoped
 * overlay when `unitId` is currently selected. Scoped to ONLY the variant
 * set(s) `unitId` is a member of (via `idToVariantSets`), and — within each
 * of those sets — to the views OTHER than the one currently active for that
 * set. Independent of the on-map chip-visibility toggle (that only hides
 * chip markers) and never mutates `variantViews` itself (no view switch).
 * Returns a Set<string>; empty when the unit belongs to no variant set.
 */
export function computeClickOverlayIds(unitId, idToVariantSets, variantSetsById, variantViews) {
  const ids = new Set();
  const ownerSetIds = idToVariantSets ? idToVariantSets.get(unitId) : null;
  if (!ownerSetIds) return ids;
  for (const setId of ownerSetIds) {
    const set = variantSetsById.get(setId);
    if (!set) continue;
    const activeViewId = variantViews[setId];
    for (const view of set.views) {
      if (view.id === activeViewId) continue;
      for (const id of view.show) ids.add(id);
    }
  }
  return ids;
}

/**
 * Amendment A6.2: variant-set membership info for `unitId`, one entry per
 * variant set it belongs to — {setId, setLabel, activeViewId, views:[{id,
 * label}]} — used to build the detail-panel alert box and its inline
 * view-switch links. Returns [] when the unit belongs to no variant set.
 */
export function variantMembershipInfo(unitId, idToVariantSets, variantSetsById, variantViews) {
  const ownerSetIds = idToVariantSets ? idToVariantSets.get(unitId) : null;
  if (!ownerSetIds || ownerSetIds.size === 0) return [];
  const result = [];
  for (const setId of ownerSetIds) {
    const set = variantSetsById.get(setId);
    if (!set) continue;
    result.push({
      setId: set.id,
      setLabel: set.label,
      activeViewId: variantViews[setId],
      views: set.views.map((v) => ({ id: v.id, label: v.label })),
    });
  }
  return result;
}

/** Compute a lon/lat bounding box for a GeoJSON geometry (Polygon/MultiPolygon). */
export function bboxOfGeometry(geometry) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  function walk(coords) {
    if (typeof coords[0] === "number") {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    for (const c of coords) walk(c);
  }

  walk(geometry.coordinates);
  return [minX, minY, maxX, maxY];
}

/** Rough centroid (bbox center) of the union of a set of feature geometries —
 * good enough for placing a grouping label; no turf vendored so we don't
 * pretend to true polygon-area centroids. */
export function bboxCenterOfFeatures(features) {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const f of features) {
    const [x0, y0, x1, y1] = bboxOfGeometry(f.geometry);
    if (x0 < minX) minX = x0;
    if (y0 < minY) minY = y0;
    if (x1 > maxX) maxX = x1;
    if (y1 > maxY) maxY = y1;
  }
  return [(minX + maxX) / 2, (minY + maxY) / 2];
}
