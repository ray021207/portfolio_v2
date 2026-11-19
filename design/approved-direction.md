# Approved portfolio direction — 2026-11-18

## Landing page — approved visual

The author explicitly approved the supplied **Reshma / Ray editorial portrait collage** image (uploaded in chat as image(1).png). **Use this exact composition as the visual target** rather than creating a new generic hero or an alien-like CGI portrait.

Elements to preserve:
- Smiling centered portrait in a copper-brown jacket over a cream top.
- Oversized ivory editorial serif **Reshma** above and **Panibhate** below the portrait; small handwritten **Ray** accent.
- Deep forest-green background, copper orbit lines, warm paper/cream abstract backdrop, sage-teal hills, topographic contours.
- Nature and research iconography: fern/bird/turtle/deer, camera trap, robotic dog; keep playful but readable.
- Accessible navigation and legible research/professional content downstream.

### Interactive interpretation

Do **not** replace the approved artwork wholesale. Animate **independent, lightweight HTML/SVG layers** where possible:
1. Intro: individual name layers glide subtly apart then resolve into the approved arrangement.
2. Mouse or device tilt: restrained parallax on background contour artwork and decorative stickers, not face warping.
3. Project explorer: art-inspired illustrated objects are keyboard/click/touch accessible entries to real project case studies (robots -> robotics; camera trap/deer -> conservation AI; etc.).
4. Scroll: transition naturally to a warm-ivory technical/editorial section.
5. Respect `prefers-reduced-motion`; avoid heavy 3D, auto-playing videos, and unskippable splash screens.

**Asset note:** The approved image is a user-uploaded file in chat and has not yet been committed to this GitHub repository; avoid claiming it is deployed. Preserve a copy as a design reference when asset upload is available. The existing portrait photographs and project media are in https://github.com/ray021207/ray021207.github.io .

## Site content information architecture

- Selected research: Native vs Invasive Species OOD benchmark; GraphEQA; medical imaging / Chest X-ray CAD; degradation-aware semantic mapping.
- Other academic research: WebArena agent evaluation, fruit grading, human–AI interaction, athlete injury risk, MyCobot maze solving.
- **Professional journey — latest author-approved correction (2026-11-19):** a three-step alternating timeline, starting with **Tikkun Olam Makers** as a 2025 **student/community leadership milestone, not a professional-employment entry**; followed by **Monark Health / Health Tracker**, which are **the same freelance project/role**, not separate companies or jobs; followed by **one Arizona State University Center for Engagement Science research role** with **Adidas midsole comfort research first, Mindsigns head-impact research second**. Show both studies nested under ASU and do not imply Adidas or Mindsigns employed the user directly.
- **Status/claims:** Monark Health's production launch was pending BAA approval per latest résumé; do not imply it has shipped. The Mindsigns study is ongoing and should not be portrayed as completed results.
- **Featured independent/academic research** — Native vs Invasive Species OOD benchmark, GraphEQA embodied QA, Chest X-ray CAD, Degradation-Aware Semantic Mapping, with other relevant academic research linked. Do NOT misclassify academic projects as paid work.
- **Hackathons and builds:** NASA Hackathon, Hackathon Humanity, WasteWise, Glacious/Glacier (verify exact name), Blowpack HydroView, Clarity. Keep the author's classification as hackathons and use clear labels. Health Tracker is freelance, not a hackathon.
- About, skills, education, publication, contact.

## Most recent résumé supplied

`Reshma_Panibhate_Resume_ComputerVision_2026.pdf` supplied in chat (not automatically added as a binary asset to GitHub).

Notably includes a project not yet available as its own GitHub repo:
**Degradation-Aware Semantic Mapping for GPS-Denied Environments** — Isaac Sim, ROS 2 Jazzy, Python. Simulated Spot-like robot in 48×35m cave with RTX LiDAR and 500Hz IMU; assessed LiDAR min-range parameter causing 326 invalid rays and short-term simulated IMU heading drift at or below 0.21° over 15 sec. Treat as a documented in-progress / non-public-code project; link to code only once the author provides it.

### Editorial validation before publication

- The résumé's **GraphEQA** section appears to contain **chest-X-ray bullets** that belong under Chest X-Ray CAD. Use the dedicated GraphEQA research report for actual GraphEQA claims.
- The résumé says Monark Health's production launch is **pending BAA approval**, whereas the previous portfolio text describes it as production/live. Follow the newer résumé's qualified status until the author confirms release.
- Award placements differ between sources for GlobeHacks; confirm before displaying a specific placement.
- Never imply study protocols for ongoing Mindsigns research are completed research outcomes. Do not publish IRB documents or participant data.

## Primary goal — recruitability

**The portfolio must help the author land relevant computer vision, ML, robotics/perception and applied-research roles.** Beautiful design is a differentiator, but clarity, proof, and credibility take precedence. No portfolio can guarantee a hiring decision.

Recruiter-facing requirements:
1. Above fold, immediately surface author's name, job focus (**Computer Vision / ML / Robotics**), short value proposition, and visible **View Projects / Résumé / Contact** links; do not hide all of this behind an intro.
2. Deliver a memorable, faithful portrait-led visual in a fast, accessible, responsive page with tasteful motion and reduced-motion support.
3. Within one scroll, show 2–3 compelling evidence-backed project teasers. Project pages should show problem, individual contribution, pipeline, metrics, pitfalls, outcome and links. Clearly mark pilot statistics and incomplete projects.
4. **Journey** follows student/community Tikkun Olam Makers → one Monark Health / Health Tracker freelance project → one ASU research role with Adidas then Mindsigns. Avoid duplicate health roles, or misclassifying the student community work as paid professional employment.
5. Distinguish research, professional experience and hackathons via honest labels; avoid inflating contributions, timelines, or production status.
6. Provide a scannable skills and tools section, downloadable up-to-date résumé, and clear email/LinkedIn/GitHub links.
7. Accessibility, Core Web Vitals, SEO, legibility, mobile behavior, keyboard interactions and graceful fallbacks matter as much as visual effects.
8. Use the current résumé carefully: GraphEQA bullets appear duplicated from chest X-ray and need correction using the dedicated report.

## Build priority

First: implement a faithful and responsive landing-page prototype using the approved artwork as reference, working navigation, strong recruiter-facing headline/CTA and understated movement. Next: build strong evidence-based technical case studies and professional experience sections, then evaluate performance, mobile UX and accessibility.
