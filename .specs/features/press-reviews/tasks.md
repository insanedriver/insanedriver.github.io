# Press reviews Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: skipped. The feature reuses the existing patterns (Eleventy `_data` JSON, base layout pages, `less/pages/<page_id>.less` bundles, `cyber-panel` markup, `node:test` over built `docs/`, Playwright e2e).
**Status**: Done

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: `package.json` scripts, `playwright.config.cjs`, existing `tests/press/*.cjs` and `tests/band/*` samples. No coverage thresholds configured.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Data (`_data/reviews.json`) | unit | Every REV-13..16 rule, each with a test where it alone fails | `tests/press/*.test.cjs` | `npm run test:unit` |
| Page templates (built HTML) | unit | 1:1 to REV-01..12, 17..21 ACs and listed edge cases | `tests/press/*.test.cjs`, `tests/band/*.test.cjs` | `npm run build && npm run test:unit` |
| Styles (Less bundles) | e2e | REV-22, REV-23 at 390px and 1440px | `tests/press/*.e2e.cjs` | `npx playwright test tests/press` |
| Script (`scripts/check-review-links.cjs`) | unit | REV-24 with a stubbed fetch (2xx, 3xx, 4xx, network error); REV-25 | `tests/press/*.test.cjs` | `npm run test:unit` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run build && npm run test:unit` |
| Full | After tasks with e2e tests | `npm run build && npm run test:unit && npx playwright test tests/press tests/band` |
| Build | After the last task | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Data and reviews page

```
T1 → T2 → T3
```

### Phase 2: Entry points

```
T4 → T5
```

### Phase 3: Link health

```
T6
```

---

## Task Breakdown

### T1: Create the review data

**What**: `_data/reviews.json` with 18 reviews and 3 recognitions, written from the research file, plus the schema unit test.
**Where**: `_data/reviews.json`
**Depends on**: None
**Reuses**: `_data/discography.json` album slugs
**Requirement**: REV-13, REV-14, REV-15, REV-16

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] 12 `insane-driver` reviews and 6 `silicon-fortress` reviews, 3 recognitions (Terrorizer dropped in 00005d0)
- [x] `tests/press/reviews-data.test.cjs` covers REV-13..16
- [x] Gate check passes: `npm run build && npm run test:unit`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(press): add press review data for both albums`

---

### T2: Build the /press/reviews/ page

**What**: `press/reviews/index.html` rendering the intro, the Recognition list and the album sections with review cards from `_data/reviews.json`.
**Where**: `press/reviews/index.html`
**Depends on**: T1
**Reuses**: `press/index.html` panel markup
**Requirement**: REV-01, REV-02, REV-03, REV-04, REV-05, REV-06, REV-07, REV-08, REV-09, REV-10, REV-11, REV-12

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/press/reviews-page.test.cjs` covers REV-01..12 and the three edge cases over the built HTML
- [x] Gate check passes: `npm run build && npm run test:unit`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(press): add the press reviews page`

---

### T3: Style the reviews page

**What**: `less/pages/press-reviews.less` bundle (importing `less/press-reviews.less`) for cards, labels, Recognition list, readable type.
**Where**: `less/press-reviews.less`
**Depends on**: T2
**Reuses**: `less/press.less`, `less/desktop-layout.less`
**Requirement**: REV-22, REV-23

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/press/reviews.e2e.cjs` covers REV-22 at 320/390/768/1440px and REV-23 at 390px
- [x] Gate check passes: full gate

**Tests**: e2e
**Gate**: full

**Commit**: `feat(press): style the press reviews page`

---

### T4: Add the EPK::REVIEWS panel to /press/

**What**: Shared include `_includes/press/featured-reviews.liquid` (3 featured quotes + "Read all N reviews"), used by a new `EPK::REVIEWS` panel after `EPK::FACTS` in `press/index.html`, styled in `less/press.less`.
**Where**: `_includes/press/featured-reviews.liquid`
**Depends on**: None
**Reuses**: `press/index.html` panel markup
**Requirement**: REV-17, REV-18, REV-19, REV-21

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/press/press.test.cjs` gains REV-17..19 tests; the REV-17 panel-list test includes `EPK::REVIEWS`
- [x] `/press/` has no horizontal overflow (existing e2e)
- [x] Gate check passes: full gate

**Tests**: unit
**Gate**: full

**Commit**: `feat(press): feature three press quotes on the press kit`

---

### T5: Add the PRESS::SIGNAL panel to /band/

**What**: A `PRESS::SIGNAL` panel after `BIO::ORIGIN` in `band/index.html` that renders the shared include, styled in `less/band.less`.
**Where**: `band/index.html`
**Depends on**: T4
**Reuses**: `_includes/press/featured-reviews.liquid`
**Requirement**: REV-20, REV-21

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/band/band-reviews.test.cjs` covers REV-20 and REV-21 (identical featured markup on both pages)
- [x] `/band/` has no horizontal overflow (existing e2e)
- [x] Gate check passes: full gate

**Tests**: unit
**Gate**: full

**Commit**: `feat(band): show press quotes on the band page`

---

### T6: Add the review link checker

**What**: `scripts/check-review-links.cjs` that requests every review and recognition URL and prints the failing ones with their status.
**Where**: `scripts/check-review-links.cjs`
**Depends on**: None
**Reuses**: Node built-in `fetch`
**Requirement**: REV-24, REV-25

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/press/check-review-links.test.cjs` covers REV-24 with a stubbed fetch and REV-25
- [x] Gate check passes: build gate `npm run build && npm test`

**Tests**: unit
**Gate**: build

**Commit**: `feat(press): add a review link checker`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 ------→ T2 ------→ T3
Phase 2:  T4 ------→ T5
Phase 3:  T6
```

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | none | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | None (Phase 1 done) | phase start | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | None | phase start | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Data | unit | unit | ✅ OK |
| T2 | Page template | unit | unit | ✅ OK |
| T3 | Styles | e2e | e2e | ✅ OK |
| T4 | Page template + include + styles | unit (+ existing e2e overflow) | unit, full gate | ✅ OK |
| T5 | Page template + styles | unit (+ existing e2e overflow) | unit, full gate | ✅ OK |
| T6 | Script | unit | unit | ✅ OK |
