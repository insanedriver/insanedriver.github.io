# Photos 2020 and Random Highlights Specification

## Problem Statement

The band completed a promotional photoshoot in 2020, but the website's photo gallery only contains older imagery up to 2017. Fans and visitors should see the 2020 photoshoot prioritized at the top of the archive starting with photo 274, while the featured "Selected shots" carousel should dynamically showcase a randomized selection of high-impact photos from the band's catalog on each visit.

## Goals

- [ ] Incorporate 6 high-resolution photos from the 2020 photoshoot into the website assets and data catalog, bringing the archive total from 17 to 23 photos.
- [ ] Display the 2020 photoshoot photos first in the archive grid, beginning with photo 274 followed by visually balanced orientations.
- [ ] Render the 6 photoshoot 2020 photos as the initial static HTML fallback for the "Selected shots" carousel, starting with photo 274.
- [ ] Implement client-side dynamic randomization in the carousel on page load, picking 6 random photos from eligible PROMO and LIVE catalog entries.
- [ ] Maintain full accessibility, keyboard controls, touch gestures, PhotoSwipe integration, and zero-JS fallback.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| External Instagram sync | Explicitly rejected in previous architecture decision. |
| Server-side rendering / dynamic backend | The site is statically hosted on GitHub Pages via Eleventy. |
| Randomizing the archive grid order | The archive must preserve deterministic, chronological order with 2020 photos first. |
| Inclusion of low-resolution BACKSTAGE photos in carousel randomization | Selected shots requires high-resolution stage and promo imagery. |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Origin images location | Copy from `/home/deivid/Downloads/2020-photoshoot-insane` to `assets/gallery/promo2020/` | Confirmed by user; files exist in user Downloads folder. | yes |
| Image naming and thumbnail standard | Clean IDs (`274.jpg`, `20.jpg`, `36.jpg`, `113.jpg`, `133.jpg`, `140.jpg`) and `tn_<id>.jpg` at 285px width | Consistent with existing `promo2017` and `manifesto` conventions. | yes |
| Archive ordering for 2020 photoshoot | Photo 274 first, then alternating orientations: 274 (H), 113 (V), 133 (H), 36 (V), 140 (H), 20 (H) | Confirmed by user in Grilling round 1 (Q3 recommendation). | yes |
| Carousel static fallback | 6 photos of 2020 photoshoot with photo 274 as first slide (`highlightOrder: 1`) | Confirmed by user in Grilling round 2 (Q6 recommendation). | yes |
| Carousel dynamic randomization scope | Random pick of 6 distinct photos from all PROMO and LIVE archive entries | Confirmed by user in Grilling round 1 & 2 (Q1 option C & Q7 recommendation). | yes |
| Metadata and captioning | Category `PROMO`, caption `Promo Picture 2020`, alt text `Insane Driver — Promo Picture 2020, photograph <id>` | Confirmed by user in Grilling round 1 (Q5 recommendation). | yes |

**Open questions:** none - all resolved or logged above (required before the spec is confirmed).

---

## User Stories

### P1: 2020 Photoshoot Archive Display ⭐ MVP

**User Story**: As a site visitor, I want to see the 2020 promotional photoshoot at the very top of the photo archive starting with photo 274, so that I immediately see the band's modern lineup imagery.

**Why P1**: Core deliverable for adding the 2020 photoshoot to the band's official website.

**Acceptance Criteria**:

1. The Photos page SHALL display all 6 photoshoot 2020 photos at the top of the archive grid, with photo 274 as the first entry.
2. The Photos page SHALL display all 23 local archive photos (6 from 2020 and 17 historical entries) with existing full-size links and thumbnails.
3. The Photos data SHALL provide descriptive alternative text, dimensions, category PROMO, and caption "Promo Picture 2020" for each 2020 photo.
4. IF JavaScript is disabled THEN the Photos page SHALL retain direct working links to all 23 full-size archive images.

**Independent Test**: Build site and verify `_data/photos.json` and generated `photos/index.html` render 23 items with the 6 2020 photos at positions 1-6 starting with 274.

---

### P1: Static Fallback and Dynamic Carousel Randomization ⭐ MVP

**User Story**: As a site visitor, I want the "Selected shots" carousel to show fresh selections of the band's best photos each time I visit while loading the 2020 photoshoot as the initial view.

**Why P1**: Fulfills the user requirement for randomized 6 photos in Selected shots while preserving immediate visual rendering and zero-JS compatibility.

**Acceptance Criteria**:

1. The Photos page SHALL render the 6 photoshoot 2020 photos as the static HTML fallback in the Selected shots carousel, with photo 274 as the first slide.
2. WHEN the Photos page initializes in the browser with JavaScript enabled THEN the carousel SHALL randomly select 6 distinct photos from the eligible PROMO and LIVE archive items and populate the carousel slides and thumbnails.
3. WHEN a visitor activates next, previous, thumbnail selection, keyboard arrows, or swipe gestures on the randomized carousel THEN the carousel SHALL update the visible slide, active thumbnail state, and counter synchronously.
4. WHEN a visitor activates any slide in the randomized carousel THEN the Photos page SHALL open the corresponding full-size image in the PhotoSwipe viewer.
5. IF JavaScript is disabled THEN the Photos page SHALL display the 6 static photoshoot 2020 slides and functional links.

**Independent Test**: Load the page in headless browser, verify initial static markup contains 6 2020 highlights, verify client script executes dynamic randomization among eligible entries, and verify clicking slide opens PhotoSwipe.

---

## Edge Cases

- IF JavaScript is disabled THEN the system SHALL preserve static 2020 highlights without layout breakage.
- IF an archive entry has category BACKSTAGE THEN the system SHALL exclude it from carousel randomization to preserve visual quality.
- WHEN randomizing 6 photos THEN the system SHALL ensure all 6 selected photos are unique (no duplicates).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| P2020-01 | P1: 2020 Photoshoot Archive Display | Tasks | Pending |
| P2020-02 | P1: 2020 Photoshoot Archive Display | Tasks | Pending |
| P2020-03 | P1: 2020 Photoshoot Archive Display | Tasks | Pending |
| P2020-04 | P1: 2020 Photoshoot Archive Display | Tasks | Pending |
| P2020-05 | P1: Static Fallback and Dynamic Carousel Randomization | Tasks | Pending |
| P2020-06 | P1: Static Fallback and Dynamic Carousel Randomization | Tasks | Pending |
| P2020-07 | P1: Static Fallback and Dynamic Carousel Randomization | Tasks | Pending |
| P2020-08 | P1: Static Fallback and Dynamic Carousel Randomization | Tasks | Pending |
| P2020-09 | P1: Static Fallback and Dynamic Carousel Randomization | Tasks | Pending |

**Coverage:** 9 total, 9 mapped to tasks, 0 unmapped ⚠️

---

## Success Criteria

- [ ] All 6 photoshoot photos from `~/Downloads/2020-photoshoot-insane` are integrated with generated thumbnails in `assets/gallery/promo2020/`.
- [ ] Archive contains 23 photos total with 2020 photos first starting with 274.
- [ ] Static HTML builds with 6 2020 highlights starting with 274.
- [ ] Client-side carousel randomizes 6 distinct PROMO/LIVE photos on page load.
- [ ] 100% test pass on unit tests and Playwright e2e suite.
