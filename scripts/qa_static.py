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
# Include every active case study. The old prototype gallery (explore.html) is not linked.
PAGES = [ROOT / "index.html"] + sorted(
    page for page in (ROOT / "projects").glob("*.html")
    if page.name != "explore.html"
)
CSS_FILES = [
    ROOT / "assets/site-v3.css",
    ROOT / "assets/site-refinement.css",
    ROOT / "assets/hero-arc.css",
    ROOT / "assets/hero-motion.css",
    ROOT / "assets/category-pages.css",
    ROOT / "assets/portfolio-polish.css",
    ROOT / "assets/awards-compact.css",
    ROOT / "assets/evidence-pages.css",
    ROOT / "assets/coverflow-work.css",
]
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
    "assets/hero/robot-dog.png",
    "assets/hero/medical-monitor.png",
    "assets/hero/camera-trap.png",
    "assets/hero/deer.png",
]:
    if required not in home:
        ISSUES.append(f"Missing hero layer reference: {required}")
    target = ROOT / required
    if not target.exists() or target.stat().st_size < 1000:
        ISSUES.append(f"Hero layer missing or unexpectedly small: {required}")

# The four illustrated portals must lead to their actual topic pages.
for topic in ["robotics", "vision", "health", "conservation"]:
    if f'href="projects/{topic}.html"' not in home:
        ISSUES.append(f"Missing illustrated navigation to {topic} area")
if 'assets/hero/sea-turtle.png' in home:
    ISSUES.append("Turtle icon unexpectedly reintroduced")
for topic in ["robotics", "vision", "health", "conservation"]:
    if not (ROOT / "projects" / f"{topic}.html").exists():
        ISSUES.append(f"Missing category page for {topic}")

# Curved SVG typography replaces the previous PNG name art; keep the portrait clear.
for expected in ["id=\"heroReshmaArc\"", "id=\"heroPanibhateArc\"",
                 'class=\"hero-centerpiece\"', 'assets/hero-arc.css']:
    if expected not in home:
        ISSUES.append(f"Missing curved hero typography or styling: {expected}")
if 'class="hero-first"' in home or 'class="hero-last"' in home:
    ISSUES.append("Old oversized name image layers reintroduced")
if 'class="art-fern"' in home:
    ISSUES.append("Distorted hero fern reintroduced")

for css in CSS_FILES:
    if not css.exists():
        ISSUES.append(f"Missing CSS: {css.relative_to(ROOT)}")
        continue
    for reference in re.findall(r"url\(\s*['\"]?([^)'\"]+)", css.read_text("utf-8")):
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

# Navigation & editorial content guardrails
if 'href="projects/index.html">Work</a>' not in home:
    ISSUES.append("Work must navigate directly to four-category index")
if 'class="work-card' in home or 'id="work"' in home:
    ISSUES.append("Old homepage Selected Work cards were restored")
if 'Reshma Panibhate <em>(Ray)</em>' not in home:
    ISSUES.append("Preferred navigation name missing")
if '<h3>RecoveryIQ</h3>' in home and not re.search(
    r'<a class="award-card reveal" href="projects/recoveryiq.html">\s*'
    r'<span class="award-rank">02 <small>SECOND</small></span>',
    home, flags=re.S
):
    ISSUES.append("RecoveryIQ hackathon placement must be second")
if 'class="page-section beyond-page" id="beyond"' not in home:
    ISSUES.append("Beyond-the-Lab viewport section is missing")
if 'href="assets/awards-compact.css?v=2"' not in home:
    ISSUES.append("Compact awards layout stylesheet is not loaded")
if 'class="awards-next" href="#beyond"' not in home:
    ISSUES.append("Awards-to-Beyond navigation is missing")
if home.count('class="award-card reveal"') != 3:
    ISSUES.append("Awards must have exactly three project cards")
for photo in [
    "assets/evidence/volunteer/shelter.jpg",
    "assets/evidence/volunteer/farm.jpg",
    "assets/evidence/volunteer/fire-safety.jpg",
]:
    if photo not in home or not (ROOT / photo).is_file():
        ISSUES.append(f"Original volunteering photo missing: {photo}")
# Verify that the owner's actual photographs—not generated substitutes—are present.
for photo in [
    "assets/evidence/personal/foster-puppies.jpg",
    "assets/evidence/personal/animal-facts-journal.png",
    "assets/evidence/personal/my-paintings.png",
]:
    if photo not in home or not (ROOT / photo).is_file():
        ISSUES.append(f"Personal photo missing or not referenced: {photo}")
if home.count('class="personal-photo personal-photo--') != 3:
    ISSUES.append("Expected exactly three personal photo cards")
if 'href="assets/awards-compact.css?v=2"' not in home:
    ISSUES.append("Personal photography styling is not loaded")
if 'Foster-puppy photos, animal-journal pages and paintings will be added' in home:
    ISSUES.append("Outdated placeholder caption after personal photo upload")

# Four-card, single-viewport Work explorer — no extra full-screen introduction.
work_index = ROOT / "projects" / "index.html"
if work_index.is_file():
    work = work_index.read_text("utf-8")
    if "Pick a question." in work or '<section class="subpage-header' in work:
        ISSUES.append("Old oversized Work hero was reintroduced")
    if 'class="work-coverflow-main"' not in work:
        ISSUES.append("Single-screen coverflow main is missing")
    if 'data-coverflow-stage' not in work:
        ISSUES.append("Interactive coverflow stage is missing")
    if work.count('data-coverflow-card') != 4:
        ISSUES.append("Work explorer must have exactly four project cards")
    for category in ["robotics", "vision", "health", "conservation"]:
        if f'href="{category}.html"' not in work:
            ISSUES.append(f"Missing Work coverflow destination: {category}")
    for key in ['data-coverflow-prev', 'data-coverflow-next', 'data-coverflow-dot="0"',
                'data-coverflow-dot="1"', 'data-coverflow-dot="2"', 'data-coverflow-dot="3"']:
        if key not in work:
            ISSUES.append(f"Work coverflow control missing: {key}")
    for asset in ['../assets/coverflow-work.css?v=1', '../assets/coverflow-work.js?v=1']:
        if asset not in work:
            ISSUES.append(f"Work coverflow stylesheet/script not linked: {asset}")

work_js = ROOT / "assets/coverflow-work.js"
if work_js.exists():
    check = subprocess.run(["node", "--check", str(work_js)], capture_output=True, text=True)
    if check.returncode != 0:
        ISSUES.append("Work coverflow JavaScript syntax failed: " + check.stderr.strip())
else:
    ISSUES.append("Missing Work coverflow JavaScript")

for page in PAGES:
    if page.name == "index.html" and page.parent == ROOT:
        continue
    if not page.is_file():
        continue
    content = page.read_text("utf-8")
    if 'Reshma Panibhate <em>(Ray)</em>' not in content:
        ISSUES.append(f"Outdated masthead in {page.relative_to(ROOT)}")
    if "https://ray021207.github.io/" in content:
        ISSUES.append(f"Legacy portfolio link in {page.relative_to(ROOT)}")

for category in ["robotics", "vision", "health", "conservation"]:
    file = ROOT / "projects" / f"{category}.html"
    if not file.is_file():
        continue
    content = file.read_text("utf-8")
    if "Selected work,<br>" in content:
        ISSUES.append(f"Unwanted intro reintroduced in {category} category")
    cards = re.findall(r'<article class="category-project reveal">.*?<h3>(.*?)</h3>',
                       content, flags=re.S)
    if not cards:
        ISSUES.append(f"No projects in {category} category")
    if category == "vision" and (not cards or cards[0] != "CV-based fruit grading system"
                                 or cards[-1] != "Clarity"):
        ISSUES.append("Vision project ordering changed; research goes first, hackathons last")
    if category == "conservation" and (not cards or
        cards[0] != "Do camera-trap species classifiers survive a new camera?" or
        cards[-1] != "Glacious"):
        ISSUES.append("Conservation paper should be first, hackathons last")
    if category == "health" and (not cards or cards[0] !=
        "Chest X-ray computer-aided diagnosis" or cards[-1] != "RecoveryIQ"):
        ISSUES.append("Healthcare research should precede hackathons")
    if category == "robotics" and (not cards or cards[0] != "GraphEQA"):
        ISSUES.append("GraphEQA should lead the robotics area")

if ISSUES:
    print("FAILED:")
    for issue in ISSUES:
        print(" -", issue)
    sys.exit(1)
print(f"PASS: {len(PAGES)} main pages and hero assets checked.")
