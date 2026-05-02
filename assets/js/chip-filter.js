/* chip-filter.js - declarative chip-based item filtering
 *
 * Markup contract:
 *   <div data-chip-filter="source">                    chip group (attr it filters)
 *     <button data-chip-value="evobiosys">EvoBioSys</button>
 *     <button data-chip-value="external">External</button>
 *   </div>
 *   <article data-source="evobiosys">...</article>     filterable item
 *   <article data-source="external de">...</article>   multi-value (space-separated)
 *
 * Behaviour:
 *   - Click a chip to show only items whose data-<attr> token-list contains its value.
 *   - Click the same chip again to clear the filter (show all).
 *   - Active chip gets the .chip-active class for styling.
 *   - Empty section headers (h2/h3 with [data-section]) auto-hide when no visible items follow.
 *
 * No dependencies. Idempotent: safe to load multiple times.
 * To be extracted under kidur as a standalone module.
 */
(function () {
  'use strict';

  function tokens(str) {
    return (str || '').trim().split(/\s+/).filter(Boolean);
  }

  function setupGroup(group) {
    var attr = group.getAttribute('data-chip-filter');
    if (!attr) return;
    var datasetKey = attr.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
    var chips = group.querySelectorAll('[data-chip-value]');
    var items = document.querySelectorAll('[data-' + attr + ']');
    var active = null;

    function applyFilter() {
      // Update chip active states
      chips.forEach(function (c) {
        c.classList.toggle('chip-active', c.getAttribute('data-chip-value') === active);
      });

      // Show / hide items
      items.forEach(function (item) {
        var vals = tokens(item.dataset[datasetKey]);
        var visible = (active === null) || vals.indexOf(active) !== -1;
        item.style.display = visible ? '' : 'none';
      });

      // Hide section headers whose following items are all hidden
      document.querySelectorAll('[data-section]').forEach(function (h) {
        var any = false;
        var sib = h.nextElementSibling;
        while (sib && !sib.matches('[data-section]')) {
          if (sib.matches('[data-' + attr + ']') && sib.style.display !== 'none') {
            any = true;
            break;
          }
          sib = sib.nextElementSibling;
        }
        h.style.display = any ? '' : 'none';
        // Also hide an immediately-following "intro" sibling if the section is hidden
        var intro = h.nextElementSibling;
        if (intro && intro.matches('.section-intro, .gloss-section-intro')) {
          intro.style.display = h.style.display;
        }
      });
    }

    chips.forEach(function (chip) {
      chip.style.cursor = 'pointer';
      chip.setAttribute('role', 'button');
      chip.setAttribute('tabindex', '0');
      var click = function () {
        var val = chip.getAttribute('data-chip-value');
        active = (active === val) ? null : val;
        applyFilter();
      };
      chip.addEventListener('click', click);
      chip.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          click();
        }
      });
    });
  }

  function init() {
    document.querySelectorAll('[data-chip-filter]').forEach(setupGroup);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
