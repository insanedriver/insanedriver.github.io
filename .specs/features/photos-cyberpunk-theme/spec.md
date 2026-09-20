# Photos Cyberpunk Theme Refresh Specification

## Problem Statement

The Photos page shipped its cyberpunk styling before Band, Contact and Newsletter adopted the shared `.cyber-zone` / `.cyber-panel` component system (angular panels, tab labels, scanlines, animated noise, panel grid, pulsing glow). Photos now looks visually inconsistent with the rest of the site, and it hides the site-wide `bodybg.jpg` backdrop that the other cyberpunk pages show, because `less/photos.less` overrides `#content` to a solid dark navy (`#050a10`). This feature brings Photos into the same visual language without touching its already-validated carousel and gallery behavior.

## Goals

- [x] Photos page renders the shared `.cyber-zone`/`.cyber-panel` structure, palette, typography and animated effects used by Band, Contact and Newsletter.
- [x] Photos page shows the site's `bodybg.jpg` backdrop behind its panels instead of a solid dark override.
- [x] Existing carousel, highlight-randomization, PhotoSwipe viewer and no-JS fallback behavior is unchanged.
- [x] `tests/photos/*.cjs` pass, with only the CSS-value/structural assertions updated to match the new markup - no coverage removed or weakened.

## Out of Scope

| Feature                                                    | Reason                                                                                     |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Swapping the carousel for a third-party library             | Decided in grilling: no library is in use today (vanilla JS); no technical limitation forces a swap, and one would require rewriting validated logic and tests for no visual gain. |
| Shared cross-page theme/variables file                      | Decided in grilling: project convention duplicates palette/keyframes per page file; extracting shared infra is a separate, deliberate task. |
| Changing the display paradigm (e.g. grid + lightbox instead of carousel) | Decided in grilling: keep the carousel paradigm. |
| Changing `randomizeHighlights()` selection logic             | Decided in grilling: behavior stays as shipped in the `photos-2020` feature. |
| Retrofitting `prefers-reduced-motion` support into `band.less`/`contact.less` | Those pages currently have no reduced-motion handling at all; fixing that is outside this feature's boundary (Photos only). |
| Any remote deploy, push, or production publish              | Requires separate explicit authorization per workflow rules. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Panel grouping | Two `.cyber-panel` blocks inside one `.cyber-zone`: one wrapping the featured carousel (`.photos-stage` + controls + thumbnails), one wrapping the archive grid, separated by `.cyber-separator` | Mirrors the existing two-section structure (stage vs. archive) already in the DOM/tests, and matches the multi-panel pattern Band/Contact/Newsletter use | n (cosmetic default, reviewable) |
| Tab label copy | `VISUAL::CAROUSEL` for the featured panel, `VISUAL::ARCHIVE` for the grid panel | Matches the `CATEGORY::TOPIC` HUD-label convention already used on Band/Contact (e.g. `BIO::ORIGIN`) | n (cosmetic default, reviewable) |
| Secondary accent color | Keep `#ff00ea` magenta as Photos' distinguishing accent (counter, selected-thumbnail highlight) layered on top of the shared cyan/deep-blue panel chrome | Preserves Photos' existing identity while adopting the shared structural system - consistent with the grilled decision that Photos keeps "the same language, distinct identity" | y (implied by grilled Q2/Q9 outcome) |
| Reduced-motion coverage | Extend the existing blanket rule in `photos.less` (`.photos-shell, .photos-shell *, ...{ animation:none; transition:none }`) to cover every new cyber-panel/cyber-zone element added to the page | Photos already ships this accessibility guarantee (PHOTO-15, tested); Band/Contact regressing on it is not a reason for Photos to drop it | y (carried over from prior validated spec) |
| Archive image count in this spec's ACs | 23 (current `_data/photos.json` count, post `photos-2020`) | The prior `photos-cyberpunk` spec was written before the 2020 photoshoot ingestion (it says 17); this feature specifies against the current, correct count | y (verified in `_data/photos.json`) |

**Open questions:** none - all resolved above or already settled during grilling.

---

## User Stories

### P1: Visual parity with the site's cyberpunk language ⭐ MVP

**User Story**: As a visitor who has already seen the Band, Contact or Newsletter pages, I want the Photos page to feel like the same site so the cyberpunk identity reads as intentional, not inconsistent.

**Why P1**: This is the entire purpose of the feature.

**Acceptance Criteria**:

1. The Photos page SHALL wrap its content in a `.cyber-zone` containing a `.cyber-zone-inner`, matching the structure used on the Band, Contact and Newsletter pages. (PXCP-01)
2. The Photos page SHALL render its featured-carousel section and its archive section as `.cyber-panel` components, each with a `.cyber-panel-tab` label and `.corner-tl`/`.corner-tr`/`.corner-bl` corner accents. (PXCP-02)
3. The Photos page SHALL apply the shared scanline overlay (`::after` repeating gradient), animated noise overlay (`::before` SVG turbulence with drift animation), and subtle background grid to its `.cyber-zone`/`.cyber-panel-body` elements. (PXCP-03)
4. The Photos page SHALL use the shared cyberpunk chrome palette (`#00f3ff` cyan, `#005f8c` deep blue) for panel borders, tab gradients and corner accents, consistent with the Band, Contact and Newsletter pages. `#ff00ea` magenta is not part of this shared chrome - it remains Photos' own secondary accent on pre-existing elements (`.photos-accent`, `.photos-counter`, `.photos-frame-corner`, selected-thumbnail state), per the Assumptions row above. (PXCP-04)
5. The Photos page SHALL use the `Rajdhani` font for panel body text and `Share Tech Mono` for HUD-style technical text, matching the Band, Contact and Newsletter pages. (PXCP-05)
6. The Photos page SHALL leave its `.cyber-zone` background transparent so the site-wide `bodybg.jpg` image is visible behind the panels, matching the Band, Contact and Newsletter pages. (PXCP-06)
7. The Photos page SHALL apply a pulsing glow animation to its `.cyber-panel-body` elements, matching the Band, Contact and Newsletter pages. (PXCP-07)

**Independent Test**: Open Photos next to Band/Contact/Newsletter side by side; confirm shared panel chrome, palette, fonts, scanline/noise/grid/glow effects, and that the blue paper backdrop is visible behind the panels.

---

### P1: No regression in carousel, gallery and viewer behavior ⭐ MVP

**User Story**: As a visitor, I want the photo carousel, archive grid and full-screen viewer to keep working exactly as before, so the visual refresh doesn't cost me functionality.

**Why P1**: The carousel/viewer logic is already validated (prior `photos-cyberpunk` and `photos-2020` features); this feature must not regress it.

**Acceptance Criteria**:

1. The Photos page SHALL preserve existing carousel navigation: next/previous wraparound across the 6 featured highlights, thumbnail selection with `aria-pressed`, and arrow-key navigation when a carousel control has focus. (PXCP-08)
2. WHEN the visitor swipes horizontally at least 40 CSS pixels with horizontal displacement greater than vertical displacement THEN the carousel SHALL select one adjacent highlight, unchanged from current behavior. (PXCP-09)
3. The Photos page SHALL preserve the existing client-side `randomizeHighlights()` behavior, selecting 6 highlights from `PROMO`/`LIVE` categories on load. (PXCP-10)
4. WHEN the visitor clicks the selected highlight or an archive image THEN the page SHALL open that image in the existing PhotoSwipe full-screen viewer, preserving focus restoration on close. (PXCP-11)
5. The Photos page SHALL preserve the `data-photo-*` attributes used by the carousel/viewer scripts and automated tests, even where markup is re-nested inside the new `.cyber-panel` structure. (PXCP-12)
6. The Photos page archive grid SHALL continue to render all 23 entries from `_data/photos.json`. (PXCP-13)

**Independent Test**: Run `npm run test:photos` (Playwright) and the existing Node unit test for `_data/photos.json`; all carousel/viewer/gallery assertions pass against the redesigned markup.

---

### P1: Accessibility and responsiveness preserved ⭐ MVP

**User Story**: As a visitor using a keyboard, small screen, or reduced-motion setting, I want the redesigned Photos page to remain as accessible and responsive as it is today.

**Why P1**: These guarantees are already shipped (`PHOTO-11` through `PHOTO-17`); the redesign must not regress them.

**Acceptance Criteria**:

1. WHILE reduced motion is requested THE Photos page SHALL disable all decorative animation - scanline drift, noise drift, panel glow, glitch, blink - in addition to carousel transitions, across every `.cyber-zone`/`.cyber-panel` element added by this feature. (PXCP-14)
2. The Photos page SHALL retain visible focus indicators and accessible names for every gallery navigation control after the redesign. (PXCP-15)
3. WHILE viewport width is 320, 390, 768 or 1440 CSS pixels THE Photos page SHALL render the new panel layout without document-level horizontal overflow. (PXCP-16)
4. IF JavaScript is unavailable THEN the Photos page SHALL retain working links to all 23 full-size archive images inside the new panel markup. (PXCP-17)

**Independent Test**: Re-run `tests/photos/visual.e2e.cjs` (reduced motion, viewport widths, focus/outline) and the no-JS archive-link check; all pass against the new structure.

---

## Edge Cases

- IF a `.cyber-panel` contains long dynamic content (e.g. a very long alt-text caption) THEN the panel SHALL NOT overflow its container at any of the four tested viewport widths. (covered by PXCP-16)
- IF `prefers-reduced-motion: reduce` is set THEN newly added scanline/noise/glow/glitch keyframes SHALL be neutralized identically to existing ones. (covered by PXCP-14)

---

## Requirement Traceability

| Requirement ID | Story                                   | Phase  | Status  |
| -------------- | ---------------------------------------- | ------ | ------- |
| PXCP-01        | P1: Visual parity                        | Execute | Verified |
| PXCP-02        | P1: Visual parity                        | Execute | Verified |
| PXCP-03        | P1: Visual parity                        | Execute | Verified |
| PXCP-04        | P1: Visual parity                        | Execute | Verified |
| PXCP-05        | P1: Visual parity                        | Execute | Verified |
| PXCP-06        | P1: Visual parity                        | Execute | Verified |
| PXCP-07        | P1: Visual parity                        | Execute | Verified |
| PXCP-08        | P1: No regression                        | Execute | Verified |
| PXCP-09        | P1: No regression                        | Execute | Verified |
| PXCP-10        | P1: No regression                        | Execute | Verified |
| PXCP-11        | P1: No regression                        | Execute | Verified |
| PXCP-12        | P1: No regression                        | Execute | Verified |
| PXCP-13        | P1: No regression                        | Execute | Verified |
| PXCP-14        | P1: Accessibility & responsiveness       | Execute | Verified |
| PXCP-15        | P1: Accessibility & responsiveness       | Execute | Verified |
| PXCP-16        | P1: Accessibility & responsiveness       | Execute | Verified |
| PXCP-17        | P1: Accessibility & responsiveness       | Execute | Verified |

**ID format:** `PXCP-[NUMBER]` (Photos Cyber Panel)

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 17 total, 17 verified with independent Verifier evidence (round 2 PASS) ✅

---

## Success Criteria

- [x] Side-by-side visual check (Chrome) shows Photos sharing panel chrome, palette, fonts, scanline/noise/grid/glow language, and the `bodybg.jpg` backdrop with Band, Contact and Newsletter.
- [x] `npm run less:build` compiles without error and the generated CSS is included in the diff.
- [x] `npm run test:unit` (gallery data test) and `npm run test:photos` (Playwright: gallery, carousel, viewer, visual) pass.
- [x] No `data-photo-*` attribute, PhotoSwipe hook, or `randomizeHighlights()` behavior changed.
