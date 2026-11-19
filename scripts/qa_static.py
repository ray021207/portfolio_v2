#!/usr/bin/env python3
"""Lightweight no-dependency link and asset smoke test for the static portfolio."""
from __future__ import annotations
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PAGES = [
    ROOT / "index.html",
    ROOT / "projects/index.html",
    ROOT / "projects/native-invasive.html",
    ROOT / "projects/grapheqa.html",
    ROOT / "projects/sinkronized.html",
]
CSS_FILES = [ROOT / "assets/site-v3.css", ROOT / "assets/site-refinement.css"]
JS = ROOT / "assets/site-v3.js"
ISSUES = []

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
        self.anchors = set()
    def handle_starttag(self, tag, attrs):
        props = dict(attrs)
        if props.get("id"): self.anchors.add(props["id"])
        for key in ("href", "src"):
            if props.get(key): self.references.append(props[key])

def resolve(page, raw):
    parsed = urlsplit(raw)
    if parsed.scheme or parsed.netloc or raw.startswith(("//", "mailto:", "tel:", "data:")):
        return None
    pathname = unquote(parsed.path)
    target = ROOT / pathname.lstrip("/") if pathname.startswith("/") else page.parent / pathname
    if not pathname:
        target = page
    if not target.suffix and target.is_dir():
        target = target / "index.html"
    return target.resolve(), parsed.fragment

for page in PAGES:
    if not page.exists():
        ISSUES.append(f"Missing HTML: {page.relative_to(ROOT)}")
        continue
    source = page.read_text("utf-8")
    parser = Links()
    parser.feed(source)
    for raw in parser.references:
        dest = resolve(page, raw)
        if not dest:
            continue
        path, fragment = dest
        try:
            path.relative_to(ROOT)
        except ValueError:
            ISSUES.append(f"Unsafe external relative path in {page.name}: {raw}")
            continue
        if not path.exists():
            ISSUES.append(f"Broken link in {page.relative_to(ROOT)}: {raw}")
            continue
        if fragment and path.suffix == ".html":
            target = Links()
            target.feed(path.read_text("utf-8"))
            if fragment not in target.anchors:
                ISSUES.append(f"Unknown anchor in {page.relative_to(ROOT)}: {raw}")

# Catch regression to the once-missing image and broken hero.
home = (ROOT / "index.html").read_text("utf-8")
for required in [
    "assets/hero/mountain-medallion.png",
    "assets/hero/portrait.png",
    "assets/hero/name-reshma.png",
    "assets/hero/name-panibhate.png",
    "assets/hero/robot-dog.png",
    "assets/hero/sea-turtle.png",
    "assets/hero/camera-trap.png",
    "assets/hero/deer.png",
]:
    if required not in home:
        ISSUES.append(f"Missing hero layer reference: {required}")
    target = ROOT / required
    if not target.exists() or target.stat().st_size < 1000:
        ISSUES.append(f"Hero layer missing or unexpectedly small: {required}")

for css in CSS_FILES:
    if not css.exists():
        ISSUES.append(f"Missing CSS: {css.relative_to(ROOT)}")
        continue
    for reference in re.findall(r"url\\(\\s*['\\\"]?([^)'\\\"]+)", css.read_text("utf-8")):
        if reference.startswith(("http", "data:")):
            continue
        resource = (css.parent / reference).resolve()
        if not resource.exists():
            ISSUES.append(f"Broken CSS asset URL in {css.name}: {reference}")

if JS.exists():
    proc = subprocess.run(["node", "--check", str(JS)], capture_output=True, text=True)
    if proc.returncode:
        ISSUES.append("JavaScript syntax failed: " + proc.stderr.strip())
else:
    ISSUES.append("Missing JavaScript")

# Role identity: Health Tracker is the Monark Health freelance project,
# not a second job, and TOM remains a community milestone.
if home.count("<h3>Monark Health</h3>") != 1:
    ISSUES.append("Expected exactly one Monark Health professional timeline entry")
if "<h3>Health Tracker</h3>" in home:
    ISSUES.append("Health Tracker incorrectly duplicated as its own role")
if "<h3>Arizona State University</h3>" not in home:
    ISSUES.append("Missing unified ASU research role")
if "journey-milestone--left" not in home:
    ISSUES.append("Missing professional journey timeline")

if ISSUES:
    print("FAILED:")
    for issue in ISSUES:
        print(" -", issue)
    sys.exit(1)
print(f"PASS: {len(PAGES)} main pages and hero assets checked.")
