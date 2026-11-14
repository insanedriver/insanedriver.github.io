# Desktop layout PR readiness tasks

## Execution Protocol

Use `tlc-spec-driven`: preserve exact assertions, verify each task, commit code/tests/status together, and obtain a fresh independent Verifier after the last implementation task. The original layout steps and commits remain recorded in `spec.md`. This file formalizes the remaining follow-up after the complete suite exposed additional SEO/image contracts and the mobile cover sizing race. The user's instruction authorizes these repairs and PR preparation.

**Status**: In Progress

## Test Coverage Matrix

Generated from `package.json`, `playwright.config.cjs`, the existing browser fixture and the spec. No additional project testing guidelines were found; strong defaults apply.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Rendered SEO contracts | e2e | Exact per-track copy, album ranking/genres, bounded single descriptions, fallback releases | `tests/seo/*.e2e.cjs` | `npx playwright test tests/seo/song.e2e.cjs tests/seo/release.e2e.cjs tests/seo/single-song.e2e.cjs` |
| Gallery image contract | e2e | Real viewer, exact WebP source for every item including lazy neighbour, no JPEG thumbnails | `tests/perf/images.e2e.cjs` | `npx playwright test tests/perf/images.e2e.cjs` |
| Mobile cover layout | e2e | Full panel width up to 420px, centered before image availability and at existing breakpoints | `tests/home/phone-fit.e2e.cjs` | `npx playwright test tests/home/phone-fit.e2e.cjs` |
| Whole site closure | unit + e2e | Every existing case retained; build and complete suite green, independent mutation check | `tests/*/*` | `npm test` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | Unit-only checks | `npm run test:unit` |
| Full | Each rendered-contract task | `npm run test:unit` plus the task's Playwright command from the matrix; unchanged successful gate evidence may be shared |
| Build | Closure | `npm run build` then `npm test`; no lint command is configured |

An equivalent isolated server may run the same cases. It must serve HTML as UTF-8; the initial plain Python server probe is invalid for Unicode SEO assertions. Completed affected gates: 59 SEO/image cases, 13 dossier/image cases and 240 unit cases. The mobile cover and final full gate remain in progress.

## Execution Plan

### Phase 1: PR readiness closure

```text
T1 → T2 → T3 → T4 → T5 → T6 → T7
```

## Task Breakdown

### T1: Reconcile song SEO copy expectations

**What**: Assert exact curated per-track fans-of copy independently of production formatting.
**Where**: `tests/seo/song.e2e.cjs`
**Depends on**: None
**Requirement**: DESK-11
**Done when**:
- [x] Every song case retains its other assertions and uses exact track-specific bands. Complete: affected 59/59 browser cases and 240/240 unit cases passed; `tests/seo/song.e2e.cjs:265` asserts full curated text and `:266` retains visibility.
**Tests**: e2e, song cases in the 59-case affected gate.
**Gate**: Full
**Commit**: `test(seo): assert curated similar bands on song pages`

### T2: Reconcile album SEO expectations

**What**: Assert independently audited top-four band rankings and ordered genres, retaining fallback release checks; add the shared literal SEO fixture.
**Where**: `tests/seo/release.e2e.cjs`
**Depends on**: T1
**Requirement**: DESK-11
**Done when**:
- [x] Studio/deluxe album assertions use the audited fixture and variant releases retain the default copy. Complete: 59/59 affected cases and 240/240 unit cases passed. `tests/seo/release.e2e.cjs:76` asserts exact fans-of text and `:98` exact ordered genres; an independent raw-data audit confirmed the fixture rankings and genres.
**Tests**: e2e, release cases in the 59-case affected gate; shared fixture `tests/seo/seo-regression.fixture.json`.
**Gate**: Full
**Commit**: `test(seo): assert aggregated album bands and genres`

### T3: Reconcile single-song description expectations

**What**: Assert exact descriptions containing the source summary and curated bands, bounded to 160 characters.
**Where**: `tests/seo/single-song.e2e.cjs`
**Depends on**: T2
**Requirement**: DESK-11
**Done when**:
- [x] Both single-song descriptions match independent literal expectations and retain existing JSON-LD checks. Complete: 59/59 affected cases and 240/240 unit cases passed; `tests/seo/single-song.e2e.cjs:24` asserts the full description and `:25` its 160-character bound.
**Tests**: e2e, single cases in the 59-case affected gate.
**Gate**: Full
**Commit**: `test(seo): preserve summaries and bands in single descriptions`

### T4: Observe stable gallery placeholder state

**What**: Capture real PhotoSwipe item sources without depending on global network idleness or transient DOM placeholders.
**Where**: `tests/perf/images.e2e.cjs`
**Depends on**: T3
**Requirement**: DESK-11
**Done when**:
- [x] Every exact WebP thumbnail, loaded full image and no-JPEG request assertion passes, including the hidden lazy neighbour. Complete: 59/59 affected cases and the strengthened full-run PS2-23 case passed; `tests/perf/images.e2e.cjs:157` asserts the complete exact source array, `:160` confirms a real full image loads and `:161` requires no JPEG thumbnail requests. No viewer production code changed.
**Tests**: e2e, image cases in the 59-case affected gate; strengthened exact mapping also passed in the complete run.
**Gate**: Full
**Commit**: `test(photos): verify stable webp viewer placeholder sources`

### T5: Preserve mobile streaming-cover width before image load

**What**: Give the mobile cover an explicit full width inside its existing 420px cap; regenerate the existing Home bundle and add the unavailable-image regression case.
**Where**: `less/home.less`
**Depends on**: T4
**Requirement**: DESK-12
**Done when**:
- [x] The cover fills and centers in its panel even when images have no natural width; existing phone/desktop button and cover checks pass. Complete: 40/40 phone-fit cases, 240/240 unit cases and build passed. `tests/home/phone-fit.e2e.cjs:14` requires naturalWidth 0 and `:19–20` preserve the exact width/centering assertions. One regression case was added; no existing case was disabled.
**Tests**: e2e, co-located `tests/home/phone-fit.e2e.cjs`; compiled artifact `assets/css/home.min.css`.
**Gate**: Full
**Commit**: `fix(home): retain mobile cover width before images load`

### T6: Stabilize loader contract sampling

**What**: Sample loader interactions under paused JS/CSS time, hold deferred script delivery explicitly, and inspect CSS failsafe checkpoints on its own animation clock rather than head-gate wall time. Production deadlines and all 30 cases remain unchanged.
**Where**: `tests/home/loader.e2e.cjs`
**Depends on**: T5
**Requirement**: DESK-13
**Done when**:
- [x] All 30 loader/style cases pass with exact 400ms repeat, less-than-600ms skip and CSS 1500/2500ms checkpoints retained; unit suite 240/240 passes. Shared loader component tests include `tests/home/loader-style.e2e.cjs`. The late-script cleanup case was repeated successfully after adding guaranteed release.
**Tests**: e2e, `npx playwright test tests/home/loader.e2e.cjs tests/home/loader-style.e2e.cjs`.
**Gate**: Full
**Commit**: `test(home): control loader clocks and script delivery`

### T7: Close complete validation and prepare PR

**What**: Record the complete green gate and independent spec/mutation verification, update handoff, and prepare the reviewed PR description.
**Where**: `.specs/features/desktop-layout/validation.md`
**Depends on**: T6
**Requirement**: DESK-10
**Done when**:
- [ ] Build, unit and complete browser suite pass with no disabled cases; independent report passes the state validator.
**Tests**: unit + e2e; complete repository suite and independent targeted behavior mutations.
**Gate**: Build
**Commit**: `docs(spec): record complete desktop pr readiness verification`

## Task Granularity Check

Each T1–T4 changes one regression contract file. T5 changes one cover component with its compiled bundle and colocated browser test. T6 stabilizes one loader contract across its behavior/style files. T7 records one validation outcome with its status/handoff metadata. No unrelated application feature is included.

## Diagram-Definition Cross-Check

| Task | Depends On | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | Start | Match |
| T2 | T1 | T1 → T2 | Match |
| T3 | T2 | T2 → T3 | Match |
| T4 | T3 | T3 → T4 | Match |
| T5 | T4 | T4 → T5 | Match |
| T6 | T5 | T5 → T6 | Match |
| T7 | T6 | T6 → T7 | Match |

## Test Co-location Validation

| Task | Layer | Required | Declared | Status |
| --- | --- | --- | --- | --- |
| T1 | Song rendering | e2e | e2e | Match |
| T2 | Album rendering | e2e | e2e | Match |
| T3 | Single rendering | e2e | e2e | Match |
| T4 | Viewer rendering | e2e | e2e | Match |
| T5 | Cover layout | e2e | e2e | Match |
| T6 | Loader contract | e2e | e2e | Match |
| T7 | Whole site | unit + e2e | unit + e2e | Match |
