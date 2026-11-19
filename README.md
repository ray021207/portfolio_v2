# Reshma Panibhate (Ray) — Portfolio

**Live site:** https://ray021207.github.io/portfolio_v2/

A layered, portrait-led, editorial portfolio covering robotics, computer vision, healthcare AI, and conservation/geospatial research. The approved visual style uses forest green, warm ivory, copper, and engraved botanical imagery.

## Current structure

The home page uses the approved portrait, an independently scalable mountain medallion, and two curved inline SVG name arcs. **Work** goes straight to `projects/index.html`, now a **single-viewport four-card, 3D coverflow gallery** with the oversize Work introduction removed. The gallery uses original CSS and vanilla JavaScript inspired by the interaction pattern of the [Origin Kit Coverflow Gallery](https://www.originkit.dev/components/coverflowgallery?preset=base), without copying its proprietary component source. Side cards rotate into selection; the centered card opens its category. Controls include arrows, four position buttons, keyboard navigation, and drag/swipe, with a flat grid for reduced-motion visitors. **Journey** opens the approved professional timeline.

The four interactive hero illustrations lead to individual, filtered subject areas:

| Illustration | Project area |
| --- | --- |
| Robot dog | `projects/robotics.html` — Robotics & Embedded AI |
| Deer in detection brackets | `projects/vision.html` — Computer Vision & Applied AI |
| Medical monitor (replaces the sea turtle) | `projects/health.html` — Healthcare, CV & AI |
| Camera trap | `projects/conservation.html` — Conservation & Geospatial AI |

Each project leads to a **local case-study page** in this repository rather than the original portfolio. Across categories, published research and coursework come before hackathon prototypes. Every hackathon item is labeled accordingly.

In the healthcare page, **professional experience is shown first**: Adidas and Mindsigns are separate studies within the **one ASU Center for Engagement Science research role**; Monark Health and Health Tracker are **the same freelance project**. Tikkun Olam Makers is a student/community milestone, not a paid employer.

## Editorial motion and scrolling

- `assets/hero-motion.css` animates only the approved icon layers: robot footsteps, camera-trap scanning, medical ECG trace, and a computer-vision snapshot/detection effect.
- The medallion and portrait have subtle independent motion; all four illustrations remain keyboard- and touch-accessible links.
- `assets/site-v3.js` uses **passive** scroll observation and a progress line, not an intercepted wheel/touch event or an altered scroll rate.
- Scrolling reveals are progressive, with optional view-timeline transitions in supported browsers.
- `prefers-reduced-motion` suppresses decorative movement.

## Evidence, photography, and rights

Case studies contain original project figures and measured data, including the camera-trap location-shift plots, the CheXpert evaluation chart, GraphEQA ROS2 screenshot, and four-step robotic-arm maze images.

**Beyond the Lab** now features three **original owner-uploaded photographs**: foster puppies, an octopus wildlife-journal spread, and the author's paintings. A compact strip underneath reuses genuine shelter, community-farm, and fire-safety photographs from the previous portfolio. **No AI-generated hobby or evidence imagery is used**; photos receive only CSS color balancing and responsive crops.

Asset provenance and licensing considerations are documented at `assets/evidence/README.md`. Publicly visible GitHub files are **not** automatically public domain; preserve original credits, source licenses, and privacy.

Awards currently shown: WasteWise — first place; Glacious — second place; RecoveryIQ — second place.

## Quality checks

`python scripts/qa_static.py` validates every active HTML page (excluding the old unlinked `projects/explore.html` prototype), relative asset and anchor links, JavaScript syntax, the four hero routes, correct author name, research-first project ordering, RecoveryIQ placement, and original volunteering image references.

The GitHub Actions workflow in `.github/workflows/site-qa.yml` executes the static checks on relevant changes.

To preview locally, serve the repository from its root:

```bash
python -m http.server 8000
```

## Next visual review

Confirm the layout in an actual desktop and mobile browser, especially side-text/icon separation and scroll pacing. Add the owner's real fostering, field-journal, and painting photos when supplied. Do not invent their images, swap them for generated art, or claim a clinical model or hackathon demo is a deployed production service.

The official NASA Space Apps team website remains linked from `projects/sinkronized.html`, with explicit limitations on scientific interpretation.
