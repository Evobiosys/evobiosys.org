// Europe of the Regions — data table + representation model page.
// Pure logic is exported as named functions so it can be unit-tested with
// `node` (see scratchpad self-test) without needing a DOM. DOM bootstrap at
// the bottom is guarded so importing this module under node never touches
// `document`.

const DATA_URL = '../data/regions.json';
const GROUPINGS_URL = '../data/groupings.json';
const GROUPING_SCHEMES_URL = '../data/grouping_schemes.json';

const AUTARKY_KEYS = [
  'water', 'food', 'shelter', 'energy',
  'transportation', 'hygiene_healthcare', 'clothing',
];

const TABLE_COLUMNS = [
  { key: 'name', label: 'Name', sortable: true },
  { key: 'countries', label: 'Countries', sortable: true },
  { key: 'population', label: 'Population', sortable: true, numeric: true },
  { key: 'area_km2', label: 'Area (km²)', sortable: true, numeric: true },
  { key: 'urban_core', label: 'Urban core', sortable: true },
  { key: 'key_industries', label: 'Key industries', sortable: false },
  { key: 'identity_basis', label: 'Identity basis', sortable: false },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'autarky.water', label: 'Water', sortable: true, numeric: true },
  { key: 'autarky.food', label: 'Food', sortable: true, numeric: true },
  { key: 'autarky.shelter', label: 'Shelter', sortable: true, numeric: true },
  { key: 'autarky.energy', label: 'Energy', sortable: true, numeric: true },
  { key: 'autarky.transportation', label: 'Transport', sortable: true, numeric: true },
  { key: 'autarky.hygiene_healthcare', label: 'Hygiene/Health', sortable: true, numeric: true },
  { key: 'autarky.clothing', label: 'Clothing', sortable: true, numeric: true },
  { key: 'autarky.composite', label: 'Composite', sortable: true, numeric: true },
];

// ---------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------

const numberFormat = new Intl.NumberFormat('de-AT');
const decimalFormat = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
const percentFormat = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 1, minimumFractionDigits: 1 });

function formatInt(n) {
  if (n === null || n === undefined) return '—';
  return numberFormat.format(Math.round(n));
}

function formatArea(n) {
  if (n === null || n === undefined) return '—';
  return decimalFormat.format(n);
}

function formatPercent(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—';
  return `${percentFormat.format(n)} %`;
}

// ---------------------------------------------------------------------
// Field access / derived values
// ---------------------------------------------------------------------

function getField(region, key) {
  if (key === 'status') return variantStatusLabel(region);
  if (key.startsWith('autarky.')) {
    const sub = key.split('.')[1];
    return region.autarky ? region.autarky[sub] : null;
  }
  if (key === 'countries') return region.countries.join(', ');
  if (key === 'key_industries') return region.key_industries.join(', ');
  return region[key];
}

// Congruent-mode membership: variant_role is null (base regions) or
// "congruent" (the congruent side of a variant group). Excludes the 3
// "-unified" / noncongruent alternative records.
function isCongruentMode(region) {
  return region.variant_role === null || region.variant_role === undefined || region.variant_role === 'congruent';
}

// Compact congruent/non-congruent status string for the table column.
function variantStatusLabel(region) {
  if (!region.variant_group) return '—';
  if (region.variant_role === 'congruent') return `congruent (${region.variant_group})`;
  if (region.variant_role === 'noncongruent') return `unified (${region.variant_group})`;
  return region.variant_group;
}

// ---------------------------------------------------------------------
// Sorting
// ---------------------------------------------------------------------

function compareValues(a, b) {
  if (a === null || a === undefined) return b === null || b === undefined ? 0 : -1;
  if (b === null || b === undefined) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), 'en');
}

// Returns a NEW sorted array; does not mutate `regions`.
function sortRegions(regions, key, direction) {
  const dir = direction === 'desc' ? -1 : 1;
  const withValues = regions.map((r) => ({ r, v: getField(r, key) }));
  withValues.sort((a, b) => dir * compareValues(a.v, b.v));
  return withValues.map((x) => x.r);
}

// ---------------------------------------------------------------------
// Filtering
// ---------------------------------------------------------------------

function searchableText(region) {
  return [
    region.name,
    region.name_local,
    region.countries.join(' '),
    region.urban_core,
    (region.secondary_centers || []).join(' '),
    region.key_industries.join(' '),
    region.identity_basis,
  ].join(' • ').toLowerCase();
}

function filterRegions(regions, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return regions;
  return regions.filter((r) => searchableText(r).includes(q));
}

// ---------------------------------------------------------------------
// Extremes (computed at runtime from the full 191-record dataset)
// ---------------------------------------------------------------------

function computeExtremes(regions) {
  const byPop = [...regions].sort((a, b) => a.population - b.population);
  const byArea = [...regions].sort((a, b) => a.area_km2 - b.area_km2);
  return {
    smallestPopulation: byPop[0],
    largestPopulation: byPop[byPop.length - 1],
    smallestArea: byArea[0],
    largestArea: byArea[byArea.length - 1],
  };
}

// One-sentence outlier reasoning rendered from thresholds on the actual
// data values (not a per-region lookup table), so it stays correct if the
// underlying dataset changes.
function extremeReasoning(region, kind) {
  const pop = region.population;
  const area = region.area_km2;
  switch (kind) {
    case 'smallest-population':
      return pop < 5000
        ? `At ${formatInt(pop)} residents, ${region.name} is a microstate/enclave whose population is defined by its ecclesiastical or city-state status rather than any residential hinterland.`
        : `At ${formatInt(pop)} residents, ${region.name} is a sparsely populated outlying or island territory.`;
    case 'largest-population':
      return pop > 15000000
        ? `${region.name} tops the ranking at ${formatInt(pop)} people because it is defined as a capital-region commuter belt spanning many NUTS-3 units, not a single city.`
        : `${region.name} is the most populous region at ${formatInt(pop)} people.`;
    case 'smallest-area':
      return area < 50
        ? `At ${formatArea(area)} km², ${region.name} is a fully urbanized microstate enclave — sub-single-digit km² by definition.`
        : `At ${formatArea(area)} km², ${region.name} is the smallest region by land area, reflecting its microstate or dense urban footprint.`;
    case 'largest-area':
      return area > 1000000
        ? `${region.name} spans ${formatArea(area)} km² — a continental-scale Arctic/outlying territory whose land area is driven by ice-sheet or wilderness coverage rather than settlement extent.`
        : `${region.name} is the largest region by land area at ${formatArea(area)} km².`;
    default:
      return '';
  }
}

// ---------------------------------------------------------------------
// Representation model — flat (2 reps/region) vs Bundesrat-weighted
// ---------------------------------------------------------------------

// Germany's Bundesrat population bands (Art. 51 GG): "bis zu zwei
// Millionen" (up to/including two million) -> 3 votes, then strictly-more
// thresholds at 2M/6M/7M. Applied here per-region by population.
function bandVotes(population) {
  if (population <= 2_000_000) return 3;
  if (population <= 6_000_000) return 4;
  if (population <= 7_000_000) return 5;
  return 6;
}

// Splits a per-region quantity across its constituent countries. In the
// current congruent-mode dataset every region has exactly one country, so
// this is a no-op there; it exists to honor the multi-country convention
// (evenly split, e.g. 1+1 for a 2-country region) should one ever appear
// in congruent mode.
function splitAcrossCountries(amount, countries) {
  const n = countries.length || 1;
  return amount / n;
}

function aggregateByCountry(regions, amountFn) {
  const byCountry = new Map();
  for (const region of regions) {
    const amount = amountFn(region);
    const perCountry = splitAcrossCountries(amount, region.countries);
    for (const country of region.countries) {
      if (!byCountry.has(country)) byCountry.set(country, { country, regionCount: 0, amount: 0 });
      const entry = byCountry.get(country);
      entry.regionCount += 1 / region.countries.length;
      entry.amount += perCountry;
    }
  }
  return byCountry;
}

function withShares(byCountryMap) {
  const total = [...byCountryMap.values()].reduce((sum, e) => sum + e.amount, 0);
  return [...byCountryMap.values()]
    .map((e) => ({ ...e, share: total > 0 ? (e.amount / total) * 100 : 0 }))
    .sort((a, b) => b.amount - a.amount);
}

// Flat model: every congruent-mode region gets exactly 2 representatives.
function computeFlatModel(congruentRegions) {
  const byCountry = aggregateByCountry(congruentRegions, () => 2);
  return {
    rows: withShares(byCountry),
    total: congruentRegions.length * 2,
  };
}

// Bundesrat-weighted model: each region's population banded per bandVotes.
function computeBundesratModel(congruentRegions) {
  const byCountry = aggregateByCountry(congruentRegions, (r) => bandVotes(r.population));
  const total = congruentRegions.reduce((sum, r) => sum + bandVotes(r.population), 0);
  return {
    rows: withShares(byCountry),
    total,
  };
}

// Headline comparison number: share of seats/votes held by the 10 most
// populous congruent-mode regions under each model.
function computeTop10Shift(congruentRegions) {
  const sorted = [...congruentRegions].sort((a, b) => b.population - a.population);
  const top10 = sorted.slice(0, 10);
  const flatTotal = congruentRegions.length * 2;
  const bundesratTotal = congruentRegions.reduce((sum, r) => sum + bandVotes(r.population), 0);
  const top10Flat = top10.length * 2;
  const top10Bundesrat = top10.reduce((sum, r) => sum + bandVotes(r.population), 0);
  return {
    top10Names: top10.map((r) => r.name),
    flatSharePct: (top10Flat / flatTotal) * 100,
    bundesratSharePct: (top10Bundesrat / bundesratTotal) * 100,
  };
}

// ---------------------------------------------------------------------
// EP delegation model — grouping population balance (A2.2)
// ---------------------------------------------------------------------

// Sums each representation grouping's member cultural units' populations.
// `member_ids` are explicit references into the regions dataset.
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

// Returns { smallest, largest, maxFactor, over7x, total } — over7x is every
// grouping whose population exceeds 7x the smallest grouping's population,
// sorted largest-first (candidates for a re-balancing pass).
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

// ---------------------------------------------------------------------
// A3.3/A3.4 multi-scheme representation layer
// ---------------------------------------------------------------------

// A3.3 binding contract: data/grouping_schemes.json = [{id, label,
// description, groupings:[{id,name,member_ids,rationale}],
// alternatives:{unit_id:[grouping_id,…]}, factor_exempt:[…]}]. Falls back to
// the legacy single-scheme groupings.json (wrapped, no exemptions) when the
// multi-scheme file is absent/404/unparseable, so the page never hard-fails
// while the data pipeline hasn't emitted it yet.
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
      id: 'affinity-66',
      label: 'Affinity (66)',
      description: 'Single-scheme fallback — data/grouping_schemes.json not available in this build.',
      groupings,
      alternatives: {},
      factor_exempt: [],
    },
  ];
}

// A3.4/A4.1: per-scheme factor stats, excluding factor_exempt AND
// sovereign_floor groupings from the factor calculation. Both are reported
// separately from the max-factor/over-7x numbers but with distinct labels:
// factor_exempt = "special status" (sovereign microstates, exclaves, and
// similar singletons the scheme designer chose to exempt); sovereign_floor
// (A4.1, optional, e.g. the balanced-national scheme) = "sovereign minimum —
// cannot merge without crossing a border" (small sovereign states that
// cannot merge upward within their own state boundary under a
// no-cross-border-merge rule).
//
// A4.1: when a scheme carries a numeric `computed_factor` (the data build's
// own honest max-factor figure, which may account for scheme-specific
// constraints this client-side recomputation cannot see), it is used in
// place of the client-computed maxFactor. Guarded defensively — an
// unexpected shape (missing, non-numeric, NaN, Infinity) silently falls back
// to client-side computation rather than throwing.
function computeSchemeFactorStats(scheme, regions) {
  const groupingPops = computeGroupingPopulations(regions, scheme.groupings);
  const exemptIds = new Set(scheme.factor_exempt || []);
  const sovereignIds = new Set(scheme.sovereign_floor || []);
  const excludedIds = new Set([...exemptIds, ...sovereignIds]);
  const exempt = groupingPops.filter((g) => exemptIds.has(g.id));
  const sovereign = groupingPops.filter((g) => sovereignIds.has(g.id));
  const nonExcluded = groupingPops.filter((g) => !excludedIds.has(g.id));
  const balance = computeGroupingBalance(nonExcluded.length ? nonExcluded : groupingPops);
  const hasComputedFactor = typeof scheme.computed_factor === 'number' && Number.isFinite(scheme.computed_factor);
  if (hasComputedFactor) balance.maxFactor = scheme.computed_factor;
  return { balance, exempt, sovereign, total: scheme.groupings.length, usedComputedFactor: hasComputedFactor };
}

// ---------------------------------------------------------------------
// Exports (importable from node without touching `document`)
// ---------------------------------------------------------------------

const TableLogic = {
  AUTARKY_KEYS,
  TABLE_COLUMNS,
  formatInt,
  formatArea,
  formatPercent,
  getField,
  isCongruentMode,
  variantStatusLabel,
  compareValues,
  sortRegions,
  searchableText,
  filterRegions,
  computeExtremes,
  extremeReasoning,
  bandVotes,
  splitAcrossCountries,
  aggregateByCountry,
  withShares,
  computeFlatModel,
  computeBundesratModel,
  computeTop10Shift,
  computeGroupingPopulations,
  computeGroupingBalance,
  computeSchemeFactorStats,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TableLogic;
}

// ---------------------------------------------------------------------
// DOM bootstrap (browser only — guarded so `node -e "require(...)"` works)
// ---------------------------------------------------------------------

if (typeof document !== 'undefined') {
  bootstrap();
}

async function bootstrap() {
  const state = {
    all: [],
    congruent: [],
    schemes: [],
    sortKey: 'name',
    sortDir: 'asc',
    query: '',
  };

  try {
    const res = await fetch(DATA_URL);
    const data = await res.json();
    state.all = data.regions;
    state.congruent = state.all.filter(isCongruentMode);
  } catch (err) {
    renderError(err);
    return;
  }

  try {
    state.schemes = await loadGroupingSchemesWithFallback();
  } catch (err) {
    state.schemes = [];
    // eslint-disable-next-line no-console
    console.error('Could not load grouping scheme data:', err);
  }

  renderCounts(state);
  renderTable(state);
  renderExtremes(state);
  renderRepresentation(state);
  renderSchemeFactorComparison(state);

  const filterInput = document.getElementById('filter-input');
  if (filterInput) {
    filterInput.addEventListener('input', () => {
      state.query = filterInput.value;
      renderTable(state);
      renderCounts(state);
    });
  }
}

function renderError(err) {
  const main = document.getElementById('app');
  if (main) {
    main.innerHTML = `<p class="error">Could not load region data: ${String(err)}</p>`;
  }
  // eslint-disable-next-line no-console
  console.error(err);
}

function renderCounts(state) {
  const el = document.getElementById('counts-line');
  if (!el) return;
  const total = state.all.length;
  const congruentCount = state.congruent.length;
  const unifiedCount = total - congruentCount;
  let text = `${total} regions — ${congruentCount} shown in congruent mode, ${unifiedCount} unified alternatives`;
  if (state.query.trim()) {
    const filtered = filterRegions(state.all, state.query).length;
    text += ` — ${filtered} match the current filter`;
  }
  el.textContent = text;
}

function renderTable(state) {
  const thead = document.getElementById('table-head');
  const tbody = document.getElementById('table-body');
  if (!thead || !tbody) return;

  thead.innerHTML = '';
  const headRow = document.createElement('tr');
  for (const col of TABLE_COLUMNS) {
    const th = document.createElement('th');
    th.textContent = col.label;
    if (col.sortable) {
      th.classList.add('sortable');
      if (state.sortKey === col.key) {
        th.classList.add(state.sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
      }
      th.addEventListener('click', () => {
        if (state.sortKey === col.key) {
          state.sortDir = state.sortDir === 'asc' ? 'desc' : 'asc';
        } else {
          state.sortKey = col.key;
          state.sortDir = 'asc';
        }
        renderTable(state);
      });
    }
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);

  const filtered = filterRegions(state.all, state.query);
  const sorted = sortRegions(filtered, state.sortKey, state.sortDir);

  tbody.innerHTML = '';
  for (const region of sorted) {
    const tr = document.createElement('tr');
    for (const col of TABLE_COLUMNS) {
      const td = document.createElement('td');
      const value = getField(region, col.key);
      if (col.key === 'identity_basis') {
        const truncated = value.length > 70 ? `${value.slice(0, 67)}…` : value;
        td.textContent = truncated;
        td.title = value;
      } else if (col.key === 'population') {
        td.textContent = formatInt(value);
      } else if (col.key === 'area_km2') {
        td.textContent = formatArea(value);
      } else if (col.numeric) {
        td.textContent = value === null || value === undefined ? '—' : String(value);
      } else {
        td.textContent = value === null || value === undefined ? '—' : String(value);
      }
      if (col.numeric) td.classList.add('num');
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

function renderExtremes(state) {
  const el = document.getElementById('extremes');
  if (!el) return;
  const ex = computeExtremes(state.all);
  const cards = [
    ['Largest by population', ex.largestPopulation, 'largest-population', `${formatInt(ex.largestPopulation.population)} people`],
    ['Smallest by population', ex.smallestPopulation, 'smallest-population', `${formatInt(ex.smallestPopulation.population)} people`],
    ['Largest by area', ex.largestArea, 'largest-area', `${formatArea(ex.largestArea.area_km2)} km²`],
    ['Smallest by area', ex.smallestArea, 'smallest-area', `${formatArea(ex.smallestArea.area_km2)} km²`],
  ];
  el.textContent = '';
  for (const [label, region, kind, stat] of cards) {
    const card = document.createElement('div');
    card.className = 'extreme-card';

    const h3 = document.createElement('h3');
    h3.textContent = label;

    const nameP = document.createElement('p');
    nameP.className = 'extreme-name';
    nameP.append(`${region.name} `);
    const statSpan = document.createElement('span');
    statSpan.className = 'extreme-stat';
    statSpan.textContent = `(${stat})`;
    nameP.appendChild(statSpan);

    const reasoningP = document.createElement('p');
    reasoningP.className = 'extreme-reasoning';
    reasoningP.textContent = extremeReasoning(region, kind);

    card.append(h3, nameP, reasoningP);
    el.appendChild(card);
  }
}

function renderRepresentation(state) {
  const flat = computeFlatModel(state.congruent);
  const bundesrat = computeBundesratModel(state.congruent);
  const shift = computeTop10Shift(state.congruent);

  renderSeatTable('flat-table', flat, 'Seats');
  renderSeatTable('bundesrat-table', bundesrat, 'Votes');
  renderBarChart(flat, bundesrat);

  const analysis = document.getElementById('representation-analysis');
  if (analysis) {
    analysis.textContent = '';
    const p = document.createElement('p');
    p.textContent =
      `Under the flat model (2 representatives per region), the 10 most populous ` +
      `congruent-mode regions — ${shift.top10Names.slice(0, 3).join(', ')}, and 7 others — ` +
      `hold ${formatPercent(shift.flatSharePct)} of all ${flat.total} seats. ` +
      `Under the Bundesrat-weighted model, the same 10 regions hold ` +
      `${formatPercent(shift.bundesratSharePct)} of all ${bundesrat.total} votes — ` +
      `roughly ${(shift.bundesratSharePct / shift.flatSharePct).toFixed(1)}× their flat-model share. ` +
      `Flattening representation to a uniform 2-per-region formula shifts influence away from ` +
      `population-dominant regions (and the countries that host them) toward smaller and ` +
      `mid-sized regions, which is the mechanism by which this model equalizes prominence ` +
      `across members rather than weighting by headcount.`;
    analysis.appendChild(p);
  }
}

// A3.4/A4.1: one card per scheme (side by side via .scheme-factor-columns on
// the container, however many schemes are in the data build), each showing
// that scheme's own largest/smallest/max-factor stats (factor_exempt AND
// sovereign_floor groupings excluded from the factor, each listed separately
// under its own distinct label) and its own re-balancing-candidates table.
function buildSchemeFactorCard(scheme, regions) {
  const { balance, exempt, sovereign, total, usedComputedFactor } = computeSchemeFactorStats(scheme, regions);
  const nonExcludedTotal = total - exempt.length - sovereign.length;

  const card = document.createElement('div');
  card.className = 'scheme-factor-card';

  const h4 = document.createElement('h4');
  h4.textContent = scheme.label;
  card.appendChild(h4);

  if (scheme.description) {
    const desc = document.createElement('p');
    desc.className = 'section-note';
    desc.textContent = scheme.description;
    card.appendChild(desc);
  }

  if (!balance.smallest || !balance.largest) {
    const p = document.createElement('p');
    p.className = 'analysis';
    p.textContent = 'Not enough non-exempt groupings to compute a factor.';
    card.appendChild(p);
    return card;
  }

  const grid = document.createElement('div');
  grid.className = 'extremes-grid';
  const cards = [
    ['Largest', balance.largest.name, `${formatInt(balance.largest.population)} people`],
    ['Smallest', balance.smallest.name, `${formatInt(balance.smallest.population)} people`],
    ['Max factor (non-exempt)', null, balance.maxFactor !== null ? `${balance.maxFactor.toFixed(1)}×` : '—'],
    ['>7× smallest', null, `${balance.over7x.length} of ${nonExcludedTotal}`],
  ];
  for (const [label, name, stat] of cards) {
    const c = document.createElement('div');
    c.className = 'extreme-card';

    const h3 = document.createElement('h3');
    h3.textContent = label;

    const nameP = document.createElement('p');
    nameP.className = 'extreme-name';
    if (name) nameP.append(`${name} `);
    const statSpan = document.createElement('span');
    statSpan.className = 'extreme-stat';
    statSpan.textContent = name ? `(${stat})` : stat;
    nameP.appendChild(statSpan);

    c.append(h3, nameP);
    grid.appendChild(c);
  }
  card.appendChild(grid);

  const inBand = balance.maxFactor !== null && balance.maxFactor <= 7;
  const summary = document.createElement('p');
  summary.className = 'analysis';
  summary.textContent =
    `Non-exempt max factor: ${balance.maxFactor.toFixed(1)}×${usedComputedFactor ? ' (reported by the data build)' : ''} (${balance.largest.name}, ` +
    `${formatInt(balance.largest.population)} people, vs. ${balance.smallest.name}, ` +
    `${formatInt(balance.smallest.population)} people) — ${inBand ? 'inside' : 'outside'} the 3–7× target. ` +
    `${balance.over7x.length} of ${nonExcludedTotal} non-exempt groupings sit above 7× the smallest.`;
  card.appendChild(summary);

  if (exempt.length > 0) {
    const exemptP = document.createElement('p');
    exemptP.className = 'section-note';
    const strong = document.createElement('strong');
    strong.textContent = `${exempt.length} special status, outside the factor: `;
    exemptP.appendChild(strong);
    exemptP.append(exempt.map((g) => g.name).join(', '));
    card.appendChild(exemptP);
  }

  if (sovereign.length > 0) {
    const sovereignP = document.createElement('p');
    sovereignP.className = 'section-note';
    const strong = document.createElement('strong');
    strong.textContent = `${sovereign.length} sovereign minimum — cannot merge without crossing a border: `;
    sovereignP.appendChild(strong);
    sovereignP.append(sovereign.map((g) => g.name).join(', '));
    card.appendChild(sovereignP);
  }

  const scrollWrap = document.createElement('div');
  scrollWrap.className = 'table-scroll';
  const table = document.createElement('table');
  table.className = 'seat-table';
  const caption = document.createElement('caption');
  caption.textContent = 'Non-exempt groupings with population >7× the smallest — re-balancing candidates';
  table.appendChild(caption);

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of ['Grouping', 'Population', '× smallest']) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = label;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  if (balance.over7x.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 3;
    td.textContent = 'No non-exempt groupings exceed 7× the smallest — in band.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    for (const g of balance.over7x) {
      const tr = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = g.name;
      tr.appendChild(tdName);

      const tdPop = document.createElement('td');
      tdPop.className = 'num';
      tdPop.textContent = formatInt(g.population);
      tr.appendChild(tdPop);

      const tdFactor = document.createElement('td');
      tdFactor.className = 'num';
      tdFactor.textContent = `${g.factor.toFixed(1)}×`;
      tr.appendChild(tdFactor);

      tbody.appendChild(tr);
    }
  }
  table.appendChild(tbody);
  scrollWrap.appendChild(table);
  card.appendChild(scrollWrap);

  return card;
}

function renderSchemeFactorComparison(state) {
  const container = document.getElementById('scheme-factor-comparison');
  if (!container) return;
  container.innerHTML = '';

  if (!state.schemes || state.schemes.length === 0) {
    const p = document.createElement('p');
    p.className = 'analysis';
    p.textContent = 'Could not load grouping scheme data.';
    container.appendChild(p);
    return;
  }

  for (const scheme of state.schemes) {
    container.appendChild(buildSchemeFactorCard(scheme, state.all));
  }
}

function renderSeatTable(elementId, model, unitLabel) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const table = document.createElement('table');
  table.className = 'seat-table';

  const thead = document.createElement('thead');
  const headRow = document.createElement('tr');
  for (const label of ['Country', '#Regions', unitLabel, 'Share']) {
    const th = document.createElement('th');
    th.textContent = label;
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const r of model.rows) {
    const tr = document.createElement('tr');

    const tdCountry = document.createElement('td');
    tdCountry.textContent = r.country;
    tr.appendChild(tdCountry);

    const tdRegionCount = document.createElement('td');
    tdRegionCount.className = 'num';
    tdRegionCount.textContent = formatInt(r.regionCount);
    tr.appendChild(tdRegionCount);

    const tdAmount = document.createElement('td');
    tdAmount.className = 'num';
    tdAmount.textContent = formatInt(r.amount);
    tr.appendChild(tdAmount);

    const tdShare = document.createElement('td');
    tdShare.className = 'num';
    tdShare.textContent = formatPercent(r.share);
    tr.appendChild(tdShare);

    tbody.appendChild(tr);
  }
  table.appendChild(tbody);

  const tfoot = document.createElement('tfoot');
  const footRow = document.createElement('tr');

  const tdTotalLabel = document.createElement('td');
  tdTotalLabel.textContent = 'Total';
  footRow.appendChild(tdTotalLabel);

  const tdTotalRegions = document.createElement('td');
  tdTotalRegions.className = 'num';
  tdTotalRegions.textContent = formatInt(model.rows.reduce((s, r) => s + r.regionCount, 0));
  footRow.appendChild(tdTotalRegions);

  const tdTotalAmount = document.createElement('td');
  tdTotalAmount.className = 'num';
  tdTotalAmount.textContent = formatInt(model.total);
  footRow.appendChild(tdTotalAmount);

  const tdTotalShare = document.createElement('td');
  tdTotalShare.className = 'num';
  tdTotalShare.textContent = '100.0 %';
  footRow.appendChild(tdTotalShare);

  tfoot.appendChild(footRow);
  table.appendChild(tfoot);

  el.textContent = '';
  el.appendChild(table);
}

function renderBarChart(flat, bundesrat) {
  const el = document.getElementById('bar-chart');
  if (!el) return;
  const bundesratByCountry = new Map(bundesrat.rows.map((r) => [r.country, r]));
  const order = flat.rows.map((r) => r.country); // sorted by flat share, per requirement

  const legend = document.createElement('div');
  legend.className = 'bar-chart-legend';

  const flatSwatch = document.createElement('span');
  flatSwatch.className = 'legend-swatch legend-flat';
  legend.appendChild(flatSwatch);
  legend.append(' Flat model (2/region)');

  const bundesratSwatch = document.createElement('span');
  bundesratSwatch.className = 'legend-swatch legend-bundesrat';
  legend.appendChild(bundesratSwatch);
  legend.append(' Bundesrat-weighted');

  const rowsContainer = document.createElement('div');
  rowsContainer.className = 'bar-chart-rows';

  for (const country of order) {
    const flatRow = flat.rows.find((r) => r.country === country);
    const bundesratRow = bundesratByCountry.get(country);
    const flatShare = flatRow ? flatRow.share : 0;
    const bundesratShare = bundesratRow ? bundesratRow.share : 0;

    const barRow = document.createElement('div');
    barRow.className = 'bar-row';

    const label = document.createElement('div');
    label.className = 'bar-label';
    label.textContent = country;
    barRow.appendChild(label);

    const tracks = document.createElement('div');
    tracks.className = 'bar-tracks';

    const flatTrack = document.createElement('div');
    flatTrack.className = 'bar-track';
    const flatBar = document.createElement('div');
    flatBar.className = 'bar bar-flat';
    flatBar.style.width = `${flatShare.toFixed(2)}%`;
    flatBar.title = `Flat: ${formatPercent(flatShare)}`;
    flatTrack.appendChild(flatBar);
    tracks.appendChild(flatTrack);

    const bundesratTrack = document.createElement('div');
    bundesratTrack.className = 'bar-track';
    const bundesratBar = document.createElement('div');
    bundesratBar.className = 'bar bar-bundesrat';
    bundesratBar.style.width = `${bundesratShare.toFixed(2)}%`;
    bundesratBar.title = `Bundesrat-weighted: ${formatPercent(bundesratShare)}`;
    bundesratTrack.appendChild(bundesratBar);
    tracks.appendChild(bundesratTrack);

    barRow.appendChild(tracks);
    rowsContainer.appendChild(barRow);
  }

  el.textContent = '';
  el.appendChild(legend);
  el.appendChild(rowsContainer);
}
