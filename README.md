# Reshma Panibhate — Portfolio V2

A portrait-led, editorial portfolio for computer vision, robotics, machine learning and conservation research. This repository is the current working site and does **not** replace the older `ray021207.github.io` repo.

**Preview:** https://ray021207.github.io/portfolio_v2/

## Current implementation

- **Layered hero**, using individual transparent assets in `assets/hero/`: background, mountain medallion, actual approved portrait, ivory name lettering, robot dog, camera trap, sea turtle, deer and fern.
- The **portrait** links to About. Illustrations are accessible links: robot dog → GraphEQA, turtle/deer/camera trap → conservation AI. These are *temporary thematic mappings*; final icon-to-project associations await approval.
- Desktop top navigation and mobile menu, native wheel scrolling without hijacking, gentle intro and on-scroll reveal, reduced-motion fallback.
- **Selected work** and an alternating **professional journey** timeline with transparent, evidence-backed descriptions.
- **Tikkun Olam Makers** appears only as a 2025 student/community-leadership milestone; the professional roles are **Monark Health (Health Tracker)** and **ASU research**.
- **Monark Health and Health Tracker are the same freelance project** and must not be listed twice. **Adidas and Mindsigns are distinct studies under one ASU research position**, shown in that order.
- **All projects** index with category filters.
- New case studies: `projects/native-invasive.html`, `projects/grapheqa.html`, `projects/sinkronized.html`.
- `scripts/qa_static.py` and a GitHub Actions workflow check internal links and critical assets.

## Important design details

The hero is **composed from separate images**, not a flattened poster. We can scale or rearrange the medallion, photo, name and icons independently to fit laptop and mobile viewports. The source SVG for the medallion is a wrapper around raster art rather than a manually vector-traced image.

The original background contains a medallion. The new layered hero fades the center of that background while preserving the decorative corners, then uses `assets/hero/mountain-medallion.png` as its independent central focal layer.

The user will provide additional design references; treat those as the next visual fidelity target. Do not replace this artistic direction with generic gradient blobs, emoji decorations or AI-looking stock artwork.

## Known follow-ups

- Adjust layout and page transitions against the incoming reference websites after visual review; the current hero has responsive sizing and gentle independent portrait/medallion motion in `assets/site-refinement.css`.
- Verify the experience timeline and full name on the live laptop/mobile website; static visual mockups do not replace real-browser testing.
- Confirm final icon → project mappings with the author.
- Curate and expand the full project listing and original images/screenshots, especially NASA's actual website UI.
- Replace the current résumé link (to the old repository) with the latest approved résumé file once it's explicitly selected for publication.
- Validate actual GitHub Pages rendering on target browsers/devices; file and JavaScript checks alone cannot prove pixel-perfect layout.
- Keep research figures and production claims accurate; never merge the Adidas and Mindsigns ASU research projects into separate employers.

## Run

This is a static site. Start a web server in the repository root:

```bash
python -m http.server 8000
```

Visit http://localhost:8000/ and run `python scripts/qa_static.py` for the smoke test.
