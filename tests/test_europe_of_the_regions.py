# SPDX-License-Identifier: LicenseRef-AMPL-1.0 OR AGPL-3.0-or-later
"""Europe-of-the-regions map: files exist, every local asset ref resolves in the built site.

Jekyll (bundle) may be unavailable offline; build_site() mirrors Jekyll's copy rules
(skip _/. names, honour _config.yml exclude, front-matter files count as processed)
and, when `bundle exec jekyll` works, the real _site is used instead (env EOTR_SITE).
"""
import fnmatch
import os
import re
import unittest
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parent.parent
BASE = "europe-of-the-regions"
DEFAULT_EXCLUDE = ["node_modules", "vendor/bundle", "vendor/cache", "vendor/gems", "vendor/ruby",
                   "Gemfile", "Gemfile.lock", ".sass-cache", ".jekyll-cache", "gemfiles"]


def config_excludes():
    out, on = [], False
    for line in (ROOT / "_config.yml").read_text().splitlines():
        if line.startswith("exclude:"):
            on = True
        elif on and line.strip().startswith("- "):
            out.append(line.strip()[2:].strip().rstrip("/"))
        elif on and line.strip():
            on = False
    return out + DEFAULT_EXCLUDE


def build_site():
    site = os.environ.get("EOTR_SITE")
    if site:
        return Path(site)
    excl = config_excludes()
    files = {}
    for dirpath, dirs, names in os.walk(ROOT):
        rel_dir = Path(dirpath).relative_to(ROOT)
        keep = []
        for d in dirs:
            rel = (rel_dir / d).as_posix().lstrip("./")
            if d[0] in "_.~" or any(rel == e or fnmatch.fnmatch(rel, e) for e in excl):
                continue
            keep.append(d)
        dirs[:] = keep
        for n in names:
            rel = (rel_dir / n).as_posix().lstrip("./")
            if n[0] in "_.~" or any(rel == e or fnmatch.fnmatch(rel, e) for e in excl):
                continue
            files[rel] = ROOT / rel
    return files


SITE = None


def site():
    global SITE
    if SITE is None:
        s = build_site()
        if isinstance(s, Path):
            SITE = {p.relative_to(s).as_posix(): p for p in s.rglob("*") if p.is_file()}
        else:
            SITE = s
    return SITE


def resolves(page, ref):
    """Return True when ref (as seen from site path `page`) maps to a built file."""
    u = urlparse(ref)
    if u.scheme or u.netloc or not u.path or ref.startswith(("#", "data:")):
        return True
    if u.path.startswith("/"):
        target = u.path.lstrip("/")
    else:
        d = Path("/") / Path(page).parent
        target = os.path.normpath(str(d / u.path)).lstrip("/")
    if u.path.endswith("/") or target in ("", "."):
        target = (target.rstrip("/") + "/index.html").lstrip("/")
    cands = [target, target + ".html", target + "/index.html"]
    return any(c in site() for c in cands)


class EuropeOfTheRegions(unittest.TestCase):
    def test_files_exist(self):
        for f in ["index.html", "regions/index.html", "regions/table.html", "regions/methodology.html",
                  "assets/js/map.js", "assets/js/data.js", "assets/css/site.css",
                  "data/regions.geojson", "data/regions.json", "data/groupings.json",
                  "assets/data/nuts1_boundaries.geojson", "lib/maplibre-gl/maplibre-gl.js",
                  "lib/maplibre-gl/maplibre-gl.css"]:
            self.assertIn(f"{BASE}/{f}", site(), f)

    def test_redirect_page(self):
        self.assertIn("europeoftheregions/index.html", site())
        html = Path(site()["europeoftheregions/index.html"]).read_text()
        self.assertRegex(html, r'http-equiv="refresh"[^>]*/europe-of-the-regions/')
        self.assertIn('rel="canonical" href="https://evobiosys.org/europe-of-the-regions/"', html)
        self.assertIn("location.replace", html)

    def test_no_front_matter_or_liquid(self):
        for rel, p in site().items():
            if rel.startswith((BASE + "/", "europeoftheregions/")) and rel.endswith((".html", ".js", ".css")):
                txt = Path(p).read_text(errors="replace")
                self.assertFalse(txt.startswith("---"), rel + " would be Liquid-processed")

    def test_local_refs_resolve(self):
        pages = [r for r in site() if r.startswith(BASE + "/") and r.endswith(".html")] + ["europeoftheregions/index.html"]
        self.assertGreaterEqual(len(pages), 4)
        for page in pages:
            txt = Path(site()[page]).read_text()
            for ref in re.findall(r'(?:src|href)="([^"]*)"', txt):
                self.assertTrue(resolves(page, ref), f"{page}: {ref}")
        for js in [r for r in site() if r.startswith(BASE + "/assets/js/")]:
            txt = Path(site()[js]).read_text()
            for ref in re.findall(r'["\'](\.\./[\w./-]+\.(?:json|geojson|js|css))["\']', txt):
                self.assertTrue(resolves(BASE + "/regions/index.html", ref), f"{js}: {ref}")

    def test_no_stale_absolute_paths(self):
        for rel, p in site().items():
            if rel.startswith(BASE + "/") and rel.endswith((".html", ".js")):
                txt = Path(p).read_text(errors="replace")
                self.assertIsNone(re.search(r'(?:src|href)="/(?!europe-of-the-regions/)[a-z]', txt), rel)
                self.assertIsNone(re.search(r'fetch\(["\']/(?!europe-of-the-regions/)', txt), rel)

    def test_attribution_and_footer(self):
        for f in ["index.html", "regions/methodology.html"]:
            txt = Path(site()[f"{BASE}/{f}"]).read_text()
            self.assertIn("© OpenStreetMap contributors via geoBoundaries (ODbL)", txt, f)
            self.assertIn("Made with love in Europe", txt, f)
            self.assertIn('Formerly at <a href="https://meta-democracy.org">meta-democracy.org</a>', txt, f)


if __name__ == "__main__":
    unittest.main()
