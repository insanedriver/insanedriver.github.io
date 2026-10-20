# Perf PageSpeed 2 Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/perf-pagespeed-2/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: `package.json` scripts, `playwright.config.cjs`, `tests/perf/*` (round-1 conventions: unit suites read the built `docs/`, e2e suites drive Chromium).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Build scripts (`scripts/*.cjs`, `lib/*.js`) | unit | Every AC 1:1 plus the listed edge cases (missing file, wrong width) | `tests/perf/*.test.cjs` | `npm run test:unit` |
| Pure JS helpers (`assets/js/*-core.js`) | unit | All branches | `tests/home/home-core.test.cjs` | `npm run test:unit` |
| Templates / built HTML / LESS | unit (built output) + e2e | Each markup AC asserted on `docs/`; each "fetches / does not request" AC asserted in Chromium | `tests/perf/*.test.cjs`, `tests/perf/*.e2e.cjs` | `npm run build && npm test` |
| Browser JS (`assets/js/home.js`) | e2e | Happy path + the scrolled-on-load edge case | `tests/home/*.e2e.cjs` | `npm run test:photos` |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Tasks with unit tests only | `npm run build && npm run test:unit` |
| Full | Tasks with e2e tests | `npm run build && npm test` |
| Build | End of each phase | `npm run images && npm run build && npm test` |

---

## Execution Plan

### Phase 1: Image variants

```
T1 → T2 → T3
```

### Phase 2: Cover srcset

```
T4 → T5 → T6
```

### Phase 3: Thumbnail and logo markup

```
T7 → T8 → T9 → T10 → T11 → T12
```

### Phase 4: Home head and navbar

```
T13 → T14 → T15 → T16
```

---

## Task Breakdown

### T1: Cover 160/320 variants

**What**: Add `<c>-160.webp` and `<c>-320.webp` outputs to every home-cover manifest entry, generate them, extend the images test.
**Where**: `scripts/images.cjs`
**Depends on**: None
**Reuses**: `homeCovers()`, `encode()`
**Requirement**: PS2-01, PS2-05

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] `tests/perf/images.test.cjs` asserts the three outputs per home cover at 160/320/600 px wide, and fails when one is missing
- [x] Variants committed; re-running `npm run images` changes no file
- [x] Quick gate passes

**Tests**: unit
**Gate**: quick

**Commit**: `feat(images): generate 160 and 320 px cover variants`

---

### T2: Gallery thumbnail WebP

**What**: Add a native-size WebP output for every `thumbnail` in `_data/photos.json`, generate them, extend the images test.
**Where**: `scripts/images.cjs`
**Depends on**: T1
**Reuses**: `native()`
**Requirement**: PS2-06

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] Test asserts one `tn_X.webp` per referenced thumbnail with the JPEG's width and height
- [x] Quick gate passes

**Tests**: unit
**Gate**: quick

**Commit**: `feat(images): generate WebP gallery thumbnails`

---

### T3: Logo WebP

**What**: Add `logo_loading.webp` (300), `logo_horizontal-300.webp` and `logo_horizontal-600.webp` to the manifest and generate them.
**Where**: `scripts/images.cjs`
**Depends on**: T2
**Reuses**: `encode()`
**Requirement**: PS2-09

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] Test asserts the three files, their widths and `hasAlpha`
- [x] Build gate passes (end of phase)

**Tests**: unit
**Gate**: build

**Commit**: `feat(images): generate WebP band logos`

---

### T4: `coverSrcset` helper

**What**: Add `coverSrcset(cover)` to `home-core.js` returning the 160/320/600 srcset string.
**Where**: `assets/js/home-core.js`
**Depends on**: None (phase order)
**Reuses**: UMD export
**Requirement**: PS2-02, PS2-04

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] `tests/home/home-core.test.cjs` asserts the exact string for a `.jpg` cover
- [x] Quick gate passes

**Tests**: unit
**Gate**: quick

**Commit**: `feat(home): add the cover srcset helper`

---

### T5: Cover `srcset` + `sizes` on the home

**What**: Register `coverSrcset` as a Liquid filter in `.eleventy.js` and use it with per-position `sizes` on the release card, NOW::STREAMING and archive `<source>` tags.
**Where**: `index.html`
**Depends on**: T4
**Reuses**: `coverSrcset`
**Requirement**: PS2-02, PS2-03

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] Unit test on `docs/index.html`: every cover `<source>` has the three descriptors and a non-empty `sizes`
- [x] E2E at 412 × 915, DPR 1.75: no 600 w cover fetched for the card or archive
- [x] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `perf(home): serve covers at the size they are drawn`

---

### T6: Streaming swap keeps the srcset

**What**: `home.js` sets the streaming `<source>` `srcset` via `core.coverSrcset(single.cover)`.
**Where**: `assets/js/home.js`
**Depends on**: T5
**Reuses**: `coverSrcset`
**Requirement**: PS2-04

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] `tests/home/shuffle.e2e.cjs` asserts the swapped `srcset` equals the new single's three widths
- [x] Build gate passes (end of phase)

**Tests**: e2e
**Gate**: build

**Commit**: `perf(home): keep the cover srcset when NOW::STREAMING swaps`

---

### T7: Home gallery teaser thumbnails in `<picture>`

**What**: Wrap the home teaser thumbnails in `<picture>` with a WebP source.
**Where**: `index.html`
**Depends on**: None (phase order)
**Reuses**: cover `<picture>` shape
**Requirement**: PS2-07

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] Unit test on `docs/index.html` asserts the structure for every thumbnail
- [x] Teaser/panels style e2e stay green
- [x] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `perf(home): serve gallery teaser thumbnails as WebP`

---

### T8: `/photos/` thumbnails in `<picture>`

**What**: Wrap the grid and highlight-button thumbnails on `/photos/` in `<picture>` with a WebP source.
**Where**: `photos/index.html`
**Depends on**: T7
**Reuses**: T7 shape
**Requirement**: PS2-07, PS2-08

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] Unit test asserts the structure on `docs/photos/index.html`
- [x] E2E: `/photos/` requests `.webp` thumbnails and no `tn_*.jpg`; `viewer.e2e.cjs` and `visual.e2e.cjs` green
- [x] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `perf(photos): serve gallery thumbnails as WebP`

---

### T9: Loader logo `<picture>`

**What**: Wrap the loader logo in `_layouts/home.html` in `<picture>` with `logo_loading.webp`.
**Where**: `_layouts/home.html`
**Depends on**: T8
**Reuses**: —
**Requirement**: PS2-10

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] Unit test asserts the loader `<picture>`; loader style e2e green
- [x] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `perf(home): serve the loader logo as WebP`

---

### T10: Hero title logo `<picture>`

**What**: Wrap the `#home-title` logo in `<picture>` with `logo_loading.webp`.
**Where**: `index.html`
**Depends on**: T9
**Reuses**: T9 shape
**Requirement**: PS2-10

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [x] Unit test asserts the title `<picture>`; hero style e2e green
- [x] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `perf(home): serve the hero title logo as WebP`

---

### T11: Footer logo `<picture>`

**What**: Footer logo as `<picture>` with the 300/600 WebP `srcset` and `sizes`.
**Where**: `_includes/footer/copyright.liquid`
**Depends on**: T10
**Reuses**: —
**Requirement**: PS2-11

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [ ] Unit test asserts the structure on every layout page
- [ ] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `perf(site): serve the footer logo as WebP`

---

### T12: Logo mask `image-set()`

**What**: Add `image-set()` (WebP first, PNG fallback) after the plain `url()` for both mask declarations in `home.less`.
**Where**: `less/home.less`
**Depends on**: T11
**Reuses**: `@home-logo`
**Requirement**: PS2-12, PS2-13

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [ ] Unit test on the emitted `home.min.css` asserts `image-set()` lists the WebP before the PNG
- [ ] E2E: the home requests neither `logo_loading.png` nor `logo_horizontal.png`
- [ ] Build gate passes (end of phase)

**Tests**: e2e
**Gate**: build

**Commit**: `perf(home): use the WebP logo in the CSS mask`

---

### T13: `inlineCss` helper

**What**: `lib/inline-css.js` reads `assets/css/<name>.min.css`, rewrites `url(../…)` to `/assets/…`, throws a named error when the file is missing; registered as a Liquid shortcode.
**Where**: `lib/inline-css.js`
**Depends on**: None (phase order)
**Reuses**: `lib/filters.js` style
**Requirement**: PS2-15, PS2-20

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [ ] Unit tests: the three quote forms rewritten; absolute and `data:` URLs untouched; missing file throws naming the path
- [ ] Quick gate passes

**Tests**: unit
**Gate**: quick

**Commit**: `feat(build): add the inline CSS helper`

---

### T14: Inline `home.min.css` on the home

**What**: `head/styles.liquid` inlines the home bundle and keeps the `<link>` for other bundles.
**Where**: `_includes/head/styles.liquid`
**Depends on**: T13
**Reuses**: `inlineCss`
**Requirement**: PS2-14, PS2-15, PS2-16

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [ ] Unit test: `docs/index.html` has the inlined CSS, no `home.min.css` link, no `url(../`; other bundle pages still link theirs
- [ ] Home style e2e suites green
- [ ] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `perf(home): inline the home stylesheet`

---

### T15: Font preloads and hero `fetchpriority`

**What**: Add the three font preloads and `fetchpriority="high"` on the hero preload in the home layout.
**Where**: `_layouts/home.html`
**Depends on**: T14
**Reuses**: —
**Requirement**: PS2-17, PS2-18, PS2-19

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [ ] Unit test: the home has the three preloads with `as`, `type` and `crossorigin`, and the hero preload has `fetchpriority="high"`; no other page preloads those fonts
- [ ] Quick gate passes

**Tests**: unit
**Gate**: quick

**Commit**: `perf(home): preload the critical fonts and prioritise the hero`

---

### T16: Navbar init without forced reflow

**What**: `navbar()` defers its first `update()` to `requestAnimationFrame`, sharing the `pending` guard.
**Where**: `assets/js/home.js`
**Depends on**: T15
**Reuses**: existing `pending` flag
**Requirement**: PS2-21, PS2-22

**Tools**: MCP: NONE. Skill: NONE

**Done when**:

- [ ] E2E: `pageYOffset` is not read before the first animation frame (getter spy via init script); a page scrolled past the threshold has `is-solid` after one frame
- [ ] Build gate passes

**Tests**: e2e
**Gate**: build

**Commit**: `perf(home): read the scroll offset in a frame on navbar init`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 → T2 → T3
Phase 2:  T4 → T5 → T6
Phase 3:  T7 → T8 → T9 → T10 → T11 → T12
Phase 4:  T13 → T14 → T15 → T16
```
