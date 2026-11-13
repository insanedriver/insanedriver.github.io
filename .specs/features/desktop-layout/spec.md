# Desktop layout standard

## Problem Statement

At 1920×1080, active pages alternate between 560px, 1180px, 1600px and almost full viewport width. Shared alignment and bounded components give the site a consistent desktop composition.

## Out of Scope

Campaigns, pre-sales and the legacy Dates page; new content, typography redesign, integrations, deployment and changes to mobile composition. The pre-existing Contact Bootstrap row overflow is corrected without changing its inner composition.

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Scope | Home, Band, Discography including release/song details, Photos, Videos, Store, Contact, Newsletter | Confirmed after grilling | y |
| Desktop activation | At least 1200px viewport width; usable width min(1360px, viewport minus 64px) | Keeps existing tablet/mobile rules and 32px minimum desktop gutters | y, implementation detail |
| Shared guides | Centered 1360px useful width, backgrounds full viewport | User confirmed Q1–Q4 | y |
| Component sizing | Text, forms and featured media retain smaller internal limits | User confirmed Q5–Q6 | y |
| Grids and spacing | Distribution and 24/32/48–64px scale below | User confirmed Q7–Q9 | y |
| Remote operations | Local implementation only | No publication requested | y |

Open questions: none.

## User Stories

### P1: Consistent desktop composition

As a visitor on a desktop monitor, I want consistent page boundaries and proportionate content.

**Acceptance Criteria**:

1. **DESK-01** — WHILE the viewport is at least 1200px wide, active pages SHALL center their outer content guides, navbar wrapper, page title where present, hero content where present, and footer wrapper at min(1360px, viewport width minus 64px), with a tolerance of 1px; at 1920px the left guide SHALL be 280px. Background sections SHALL remain full width.
2. **DESK-02** — WHILE the viewport is at least 1200px wide, the site SHALL display 3 columns for products, albums and home album/photo highlights, 4 archive photo columns, 5 members and 6 singles; videos SHALL retain one player and a horizontally scrollable feed; album details and newsletter SHALL retain two main columns.
3. **DESK-03** — WHILE the viewport is at least 1200px wide, card grids SHALL use 24px gaps, main paired panels SHALL use 32px gaps, and major section divisions SHALL use 48–64px spacing including decorative separators.
4. **DESK-04** — WHILE the viewport is at least 1200px wide, the Band biography SHALL have a maximum width of 760px, Contact's content panels SHALL have a maximum width of 760px inside the common frame, and newsletter embeds SHALL remain within their panel without changing integration contracts.
5. **DESK-05** — WHILE the viewport is at least 1200px wide, standalone video screens SHALL preserve 16:9 proportions and stay within 60vh, featured gallery images and the Band photo SHALL fit within 60vh with their full image visible, and release/streaming covers SHALL not exceed 360px wide; gallery/player controls SHALL remain visible and usable.
6. **DESK-06** — WHILE the viewport is 320, 390, 768, 1024, 1200, 1366, 1440, 1920 or 2560px wide, all active page types SHALL have no horizontal document overflow; below 1200px the new desktop rules SHALL leave existing component widths and grid composition unchanged.
7. **DESK-07** — The site SHALL preserve navigation destinations, signup integration attributes, gallery/video controls and existing text; excluded pages SHALL receive no desktop layout overrides.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| DESK-01 | P1 | Execute step 1 | Verified |
| DESK-02 | P1 | Execute step 2 | Pending |
| DESK-03 | P1 | Execute step 2 | Pending |
| DESK-04 | P1 | Execute step 2 | Pending |
| DESK-05 | P1 | Execute step 2 | Pending |
| DESK-06 | P1 | Both steps | Verified (step 1; recheck after step 2) |
| DESK-07 | P1 | Both steps | Pending |

## Edge Cases

- 2560px screens keep the same 1360px useful width.
- 1920×720 screens shrink standalone media without distorting it.
- The Home fixed menu and photo composition remain usable with its smaller content frame.
- Song pages use the Discography frame and retain their existing internal bento hierarchy.

## Execution Plan

1. Shared desktop frame → the eight active `less/pages/*.less` entries, `less/desktop-layout.less`, `less/contact.less` (existing row overflow), `tests/desktop/frame.e2e.cjs`, two superseded width assertions in `tests/{discography/theme,photos/visual}.e2e.cjs`, compiled page CSS and this spec → build, unit tests, browser frame checks → `fix(layout): align desktop page frames to common guides`.
2. Bounded grids and media → `less/desktop-layout.less`, `tests/desktop/content.e2e.cjs`, compiled page CSS and this spec → build, unit tests, desktop browser checks and existing affected E2E tests → `fix(layout): standardize desktop grids and media proportions`.

No formal tasks/design phase: two dependent implementation steps; user decisions already confirmed in conversation. The shared desktop Less mixin compiles under each active page ID and uses a 1200px media boundary, keeping the existing CSS bundles and mobile cascade.

### Step 1 complete

Build passed. Unit gate passed (33 test files). Browser gate: all 10 frame tests passed across the initial desktop/exclusion run and responsive rerun, plus both revised legacy width assertions (6 + 6 successful checks total). Existing Contact row overflow fixed with the same row/column gutter reset already used by the adjacent page wrappers.

| Criterion | Evidence and assertion | Expected outcome | Covered |
| --- | --- | --- | --- |
| DESK-01 | `tests/desktop/frame.e2e.cjs:25` `expect(Math.abs(box.width - expectedWidth)).toBeLessThanOrEqual(1)`; line 26 checks x, line 29 background width | min(1360, viewport − 64), centered; full background | Yes |
| DESK-06 | `tests/desktop/frame.e2e.cjs:30` and `:46` `expect(scrollWidth).toBeLessThanOrEqual(width)` | No document overflow at nine viewport widths | Yes |
| DESK-07 exclusion | `tests/desktop/frame.e2e.cjs:54` `expect(customProperty).toBe('')` | Campaign does not receive desktop layout tokens | Yes |
| Menu within frame | `tests/desktop/frame.e2e.cjs:34` / `:35` bounds assertions | Visible navigation fits common guides | Yes |

Reverse mapping: all frame assertions map to DESK-01, DESK-06, DESK-07; the two updated legacy assertions encode DESK-01's confirmed width. No unclaimed tests. Existing `tests/photos/browser.cjs` fixture and repository Playwright configuration are used. Adequacy: exact dimensions, background breadth, navigation bounds and mobile overflow are covered; no tests removed or skipped. Remaining content criteria belong to step 2.
