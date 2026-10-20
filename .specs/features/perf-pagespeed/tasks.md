# Perf PageSpeed Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/perf-pagespeed/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none (no `AGENTS.md`, `CONTRIBUTING.md`, coverage or lint config), so strong defaults apply.
> - Conventions were sampled from `tests/seo/*.test.cjs` (reads the built `docs/`), `tests/home/scripts.e2e.cjs`, `tests/home/helpers.cjs` (font routing), `tests/photos/browser.cjs` (hermetic fixture) and `playwright.config.cjs` (Eleventy dev server on :4178).
> - Compiled CSS under `assets/css/` is committed with every `.less` change. `docs/` is never committed (gitlink quirk).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Build scripts (`scripts/build-css.cjs`, `scripts/images.cjs`) | unit | Every output file the spec names exists; minified; size bound; idempotent re-encode; missing-variant failure (PERF-31) | `tests/perf/css.test.cjs`, `tests/perf/images.test.cjs` | `npm run build && npm run test:unit` |
| Built HTML and CSS (`docs/**`, `assets/css/*.min.css`) | unit | Each static AC asserted over every built layout page, not one sample | `tests/perf/*.test.cjs` | `npm run build && npm run test:unit` |
| Inline and browser JS (`head/trackers.liquid`, `assets/js/nav.js`, `home-core.js`) | e2e (+ unit for `home-core.js`) | Happy path, every listed edge case (no `requestIdleCallback`, interaction before load, page script throws, ≥ 768 px) | `tests/perf/*.e2e.cjs`, `tests/home/loader*.e2e.cjs`, `tests/home/home-core.test.cjs` | `npm test` |
| Markup and styles (layouts, includes, `.less`) | e2e | The rendered result: WebP actually fetched, fonts resolve same-origin, existing theme/style suites stay green | `tests/perf/*.e2e.cjs` + existing suites | `npm test` |
| Spec docs | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> No linter or formatter is configured, so the Build gate is the build plus the full test suite.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run build && npm run test:unit` |
| Full | After tasks with e2e tests | `npm run build && npm test` |
| Build | After phase completion | `npm run build && npm test` |

---

## Execution Plan

Phases run in order; tasks inside a phase run in order.

### Phase 1: Trackers

```
T1 → T2
```

### Phase 2: JavaScript

```
T3 → T4 → T5 → T6
```

### Phase 3: CSS split

```
T7 → T8 → T9
```

### Phase 4: Fonts

```
T10 → T11 → T12
```

### Phase 5: Images

```
T13 → T14 → T15 → T16 → T17 → T18
```

### Phase 6: Loader and guard

```
T19 → T20
```

---

## Task Breakdown

### T1: Remove the Universal Analytics tag

**Status**: ✅ Done

**What**: Delete `_includes/head/analytics.liquid` and its include in both layouts.
**Where**: `_includes/head/analytics.liquid` (delete)
**Depends on**: None
**Reuses**: `tests/seo/*.test.cjs` pattern for reading `docs/`
**Requirement**: PERF-01

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/trackers.test.cjs` asserts that no built HTML page references `analytics.js` or `UA-60390716-1`
- [x] Quick gate passes; prior unit count + new tests pass

**Tests**: unit
**Gate**: quick
**Commit**: `perf(analytics): drop the dead Universal Analytics tag`

---

### T2: Load GTM and the Pixel after first render

**Status**: ✅ Done

**What**: Replace `head/gtm.liquid` and `head/fbpixel.liquid` with `head/trackers.liquid`. It queues `gtm.start`, `fbq init` and `PageView` at parse time, then injects both scripts once, on `load` + idle (2 s timeout, `setTimeout` fallback) or on the first interaction. Both `<noscript>` fallbacks stay.
**Where**: `_includes/head/trackers.liquid` (new)
**Depends on**: T1
**Reuses**: the existing GTM and Pixel snippets
**Requirement**: PERF-02, PERF-03, PERF-04, PERF-05, PERF-06, PERF-39

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/trackers.e2e.cjs` routes the tracker hosts and asserts:
  - no request before `load` (PERF-02)
  - exactly one of each after idle (PERF-03)
  - an early `pointerdown` loads them, and a later idle does not load them again (PERF-04)
  - `dataLayer[0]` has `gtm.start`, and `fbq.queue` holds `init` + `PageView` (PERF-05)
  - with `requestIdleCallback` deleted, the scripts load 2 s after `load` (PERF-39)
- [x] `tests/perf/trackers.test.cjs` asserts both `<noscript>` blocks in the built HTML (PERF-06)
- [x] The existing `tests/home/tracking.e2e.cjs` and `tests/discography/tracking.e2e.cjs` pass unchanged
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(analytics): load GTM and the Facebook Pixel after load or first interaction`

---

### T3: Vanilla mobile menu toggle

**Status**: ✅ Done

**What**: Add `assets/js/nav.js` (deferred, included by `base.html` and `home.html`). It toggles `in` on the `data-target`, `aria-expanded`, and `collapsed` on the button.
**Where**: `assets/js/nav.js` (new)
**Depends on**: None (phase order)
**Reuses**: Bootstrap 3 `.navbar-collapse.in` CSS already in the bundle
**Requirement**: PERF-09, PERF-10, PERF-12, PERF-40

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/nav.e2e.cjs` covers, on `/band/` and `/` at 375 px: open (PERF-09), close (PERF-10), toggle still works after an injected page-script error (PERF-12)
- [x] The same file asserts that at 1024 px `#navbar` is visible (PERF-40)
- [x] The existing `tests/site/header.e2e.cjs` and `tests/home/navbar*.e2e.cjs` pass
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `feat(nav): toggle the mobile menu without Bootstrap JS`

---

### T4: Drop the pack from page script includes

**Status**: ✅ Done

**What**: Remove `{% include 'js/pack' %}` from the `discography`, `home`, `photos`, `song` and `videos` includes, and add `defer` to every remaining tag (order kept).
**Where**: `_includes/js/` (five includes, one pattern)
**Depends on**: T3
**Reuses**: -
**Requirement**: PERF-07, PERF-11

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/scripts.test.cjs` asserts that every built page using these includes has no jQuery/Bootstrap/Owl/`insane.js` and that every local `<script src>` has `defer`/`async`
- [x] The photos, discography, videos and home e2e suites pass
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(js): stop loading jQuery, Bootstrap and Owl on script-bearing pages`

---

### T5: Drop the pack and insane.js from the remaining pages

**Status**: ✅ Done

**What**: Remove `jspath: js/pack` (band, newsletter, pre-save) and `jspath: js/insane` (store, contact, reward pages where applicable). Delete `_includes/js/pack.liquid` and `_includes/js/insane.liquid`.
**Where**: `_includes/js/pack.liquid` (delete)
**Depends on**: T4
**Reuses**: -
**Requirement**: PERF-07

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/scripts.test.cjs` extended so PERF-07 holds on every built layout page except spotify-select-playlist
- [x] The band, newsletter, store and contact e2e suites pass
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(js): remove the jQuery pack from static pages`

---

### T6: Slim the spotify-select-playlist scripts

**Status**: ✅ Done

**What**: Keep only `jquery.min.js` and `spotify-select-playlist.js`, both `defer`.
**Where**: `_includes/js/spotify-select-playlist.liquid`
**Depends on**: T5
**Reuses**: -
**Requirement**: PERF-08, PERF-11

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/scripts.test.cjs` asserts PERF-08 on `/pre-save/spotify-select-playlist/`
- [x] Quick gate passes

**Tests**: unit
**Gate**: quick
**Commit**: `perf(js): load only jQuery on the playlist picker`

---

### T7: CSS build script with core and page bundles

**Status**: ✅ Done

**What**: Add `scripts/build-css.cjs` (`less` API, `compress: true`, `--watch`).
- It builds `less/core.less` and every `less/pages/<area>.less` into `assets/css/<name>.min.css`.
- Wire `less:build` and `watch` to the script.
- Delete `owl.less`, `blog.less` and `style.less`.
**Where**: `scripts/build-css.cjs` (new)
**Depends on**: None (phase order)
**Reuses**: the existing `.less` files, moved unchanged into the entries
**Requirement**: PERF-13, PERF-14, PERF-17, PERF-18

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/css.test.cjs` asserts:
  - the 9 bundles plus core exist
  - core has no `.owl-`, `.blog-` or `#page_`
  - each bundle has only its own `#page_<id>` (plus `.pswp` in photos)
  - core is ≤ 200 KB
  - no `/*` comments and no newline-indentation
- [x] Compiled CSS is committed
- [x] Quick gate passes

**Tests**: unit
**Gate**: quick
**Commit**: `build(css): split the stylesheet into a core and per-page bundles`

---

### T8: Link core plus the page bundle

**Status**: ✅ Done

**What**:
- Add `_data/cssBundles.js`.
- `head/styles.liquid` links `core.min.css` and `{{ page_id }}.min.css` when it is listed there.
- Delete `assets/css/style.min.css`.
- Repoint `dates/index.html` to `core.min.css`.
- Point `tests/home/legacy.test.cjs` and `tests/home/layout.e2e.cjs` at the new files without changing what they assert.
**Where**: `_includes/head/styles.liquid`
**Depends on**: T7
**Reuses**: cache-bust transform (`.eleventy.js:24`)
**Requirement**: PERF-15, PERF-16

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/css.test.cjs` asserts that every built layout page links core + at most one bundle and no `style.min.css`, that `/` links `home` and that `/band/` links `band`
- [x] All existing theme/style e2e suites pass
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(css): load the core stylesheet plus the page bundle only`

---

### T9: Remove Glyphicons

**Status**: ✅ Done

**What**: Strip the `.glyphicon*` rules and the Glyphicons `@font-face` from `less/bootstrap.less`, and switch the footer back-to-top icon to `fa fa-chevron-up`.
**Where**: `less/bootstrap.less`
**Depends on**: T8
**Reuses**: Font Awesome already loaded
**Requirement**: PERF-23

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/fonts.test.cjs` asserts that no emitted CSS or built HTML contains `glyphicon`
- [x] e2e: the footer `.scroll-top i` has `fa-chevron-up` and a non-zero rendered width
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(fonts): drop Glyphicons for the Font Awesome chevron`

---

### T10: Self-host Rajdhani and Share Tech Mono

**Status**: ✅ Done

**What**: Add the latin woff2 files under `assets/fonts/` and `less/fonts.less` (in core). Remove the Google Fonts `preconnect` and stylesheet from `head/styles.liquid`.
**Where**: `less/fonts.less` (new)
**Depends on**: None (phase order)
**Reuses**: Google's latin `unicode-range`
**Requirement**: PERF-20, PERF-21

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/fonts.test.cjs` asserts no `fonts.googleapis.com`/`fonts.gstatic.com` in built HTML or CSS
- [x] `tests/perf/fonts.e2e.cjs` asserts that on `/band/` and `/`, `document.fonts` reports Rajdhani 500/600/700 and Share Tech Mono loaded from same-origin URLs, and a `.cyber-panel-tab` computed `font-family` starts with the same family as before
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(fonts): self-host Rajdhani and Share Tech Mono`

---

### T11: woff2 SiliconFont and font-display everywhere

**Status**: ✅ Done

**What**: Add `Mars-Mission.woff2` (fonttools) as the first `src` and add `font-display: swap` to every `@font-face` (typography, insane-font, font-awesome).
**Where**: `less/typography.less`
**Depends on**: T10
**Reuses**: -
**Requirement**: PERF-19, PERF-22

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/fonts.test.cjs` asserts that every `@font-face` in every emitted CSS has `font-display:swap` and that SiliconFont's first `src` is `.woff2`
- [x] Quick gate passes

**Tests**: unit
**Gate**: quick
**Commit**: `perf(fonts): serve SiliconFont as woff2 and swap every face`

---

### T12: Preload only the icon font

**Status**: ✅ Done

**What**: Remove the Glyphicons and Mars-Mission preloads, keeping the Font Awesome woff2 preload.
**Where**: `_includes/head/styles.liquid`
**Depends on**: T11
**Reuses**: -
**Requirement**: PERF-24

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/fonts.test.cjs` asserts that the only font preload in built HTML is `fontawesome-webfont.woff2`
- [x] Quick gate passes

**Tests**: unit
**Gate**: quick
**Commit**: `perf(fonts): preload only the icon font`

---

### T13: WebP image pipeline

**Status**: ✅ Done

**What**: Add `sharp` (devDependency), `scripts/images.cjs` with an exported manifest, and `npm run images`. Generate and commit every variant from the design.
**Where**: `scripts/images.cjs` (new)
**Depends on**: None (phase order)
**Reuses**: hero variant naming (`assets/images/home/hero-<w>.webp`)
**Requirement**: PERF-25, PERF-31

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/images.test.cjs` asserts that every manifest output exists (PERF-31), that the width of each output matches the manifest, and that re-encoding one source into a temp dir is byte-identical to the committed file (PERF-25)
- [x] Quick gate passes

**Tests**: unit
**Gate**: quick
**Commit**: `build(images): generate WebP variants with sharp`

---

### T14: Responsive header picture on inner pages

**Status**: ✅ Done

**What**: `base.html` header becomes `<picture>` with the WebP srcset, a JPEG `<img>` fallback, `width="1920" height="320" sizes="100vw" fetchpriority="high"` and no lazy loading.
**Where**: `_layouts/base.html`
**Depends on**: T13
**Reuses**: hero `<picture>` markup
**Requirement**: PERF-26

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/images.test.cjs` asserts the markup on every `base.html` page
- [x] `tests/perf/images.e2e.cjs` asserts that `/band/` at 375 px fetches `header_3-768.webp` and not `header_3.jpg`
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(images): serve responsive WebP page headers`

---

### T15: Band photo as lazy WebP

**Status**: ✅ Done

**What**: `band.jpg` on `/band/` becomes `<picture>` with a WebP srcset, `width`, `height`, `loading="lazy"` and `decoding="async"`.
**Where**: `band/index.html`
**Depends on**: T14
**Reuses**: T14 markup
**Requirement**: PERF-28

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/images.test.cjs` asserts the markup
- [x] e2e: a WebP is the one fetched once the photo is scrolled into view
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(band): lazy-load the band photo as WebP`

---

### T16: WebP backgrounds via image-set

**Status**: ✅ Done

**What**: `#content`, `footer` and the home bodybg layer get an `image-set()` declaration with a WebP and JPEG `type()`, after the plain `url()`.
**Where**: `less/general.less`
**Depends on**: T15
**Reuses**: -
**Requirement**: PERF-27

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/images.test.cjs` asserts that the emitted CSS has the `image-set` for `bodybg` and `footer`
- [x] e2e: on `/band/`, `bodybg.webp` and `footer.webp` are fetched and the `.jpg` files are not
  - Deviation: `/band/` hides the footer texture (`band.less` sets `footer { background-image: none; }`), so `footer.webp` is checked on `/videos/`; `bodybg.webp` is checked on both
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(images): serve WebP page and footer backgrounds`

---

### T17: WebP release covers on the home

**Status**: ✅ Done

**What**: The latest-release, streaming and album covers in `index.html` become `<picture>` with a WebP source. The first cover stays eager; the rest stay lazy.
**Where**: `index.html`
**Depends on**: T16
**Reuses**: T14 markup
**Requirement**: PERF-29

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/images.test.cjs` asserts a WebP source for every cover on `/`
- [x] The existing home e2e suites pass, including `shuffle.e2e.cjs` (the streaming cover swap must also swap the WebP source)
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(home): serve release covers as WebP`

---

### T18: Dimensions on every image

**Status**: ✅ Done

**What**: The menu logo gets `width="600" height="95" loading="lazy"`. Any remaining `<img>` on `/` and `/band/` without dimensions gets them.
**Where**: `_includes/header/menu.liquid`
**Depends on**: T17
**Reuses**: -
**Requirement**: PERF-30

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/perf/images.test.cjs` asserts that every `<img>` in built `/` and `/band/` has `width` and `height`
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(images): size every image on the home and band pages`

---

### T19: Faster home loader

**Status**: ✅ Done

**What**:
- `home-core.js`: `LOADER_MIN` 600, `LOADER_MAX` 1500, `LOADER_FAILSAFE` 2000.
- `home.less`: failsafe `2s`.
- `home.html` inline script: `+ 2000`.
**Where**: `assets/js/home-core.js`
**Depends on**: None (phase order)
**Reuses**: existing loader tests
**Requirement**: PERF-32, PERF-33, PERF-34, PERF-35, PERF-36

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] `tests/home/home-core.test.cjs` and `tests/home/loader*.e2e.cjs` updated to the new bounds only (no assertion removed)
- [x] Each of PERF-32..36 is mapped to a test
- [x] Full gate passes

**Tests**: e2e
**Gate**: full
**Commit**: `perf(home): shorten the boot loader to 0.6-1.5 s`

---

### T20: Regression guard

**Status**: ✅ Done

**What**: Add `tests/perf/guard.test.cjs`. It walks every built layout page and fails on any removed script, `style.min.css`, Google Fonts or Glyphicons reference, or on a `core.min.css` larger than 200 KB.
**Where**: `tests/perf/guard.test.cjs` (new)
**Depends on**: T19
**Reuses**: helpers from `tests/perf/*.test.cjs`
**Requirement**: PERF-37, PERF-38

**Tools**: MCP: NONE · Skill: NONE

**Done when**:

- [x] The guard passes on the current tree and fails on a hand-injected `jquery.min.js` reference (checked in a scratch copy, not committed)
- [x] Build gate passes

**Tests**: unit
**Gate**: build
**Commit**: `test(perf): guard against the removed weight coming back`

---

## Approved test retargets

Existing tests whose target moved with the feature. Each keeps its assertions; only the file, selector, route or timing bound changed.

- `tests/home/legacy.test.cjs` (HOME-70) and `tests/home/layout.e2e.cjs:36` → the new CSS files (`core.min.css` + page bundles) instead of `style.min.css` (T8)
- STORE-24 (`tests/store/store-data.test.cjs`) and BIT-18 (`tests/newsletter/cleanup.test.cjs`) → read `less/core.less` + `less/pages/*.less` instead of `less/style.less` (T7)
- `tests/perf/trackers.e2e.cjs` `holdLoad` route → header image `jpg|webp` (T14)
- HOME-04 selector → `.home-hero-photo source` (T17)
- HOME-29 → hero image held ~1400 ms so the loader stays up while sampled (T19)
- Loader bounds → 600 / 1500 / 2000 ms (T19)

**Fix iteration 1** (Verifier FAIL, `validation.md`):

- F1: PERF-02/03 trackers held-load and once-after-idle e2e also run on `/` (home hero held), plus a unit check that every layout page names `gtm.js` and `fbevents.js` once, only inside the deferred loader. Kills mutant E9.
- F2: PERF-35 CSS failsafe pinned: computed `animation-delay` is `2s` (normal and reduced motion), and CSS alone hides the loader between 2 s and 2.5 s with `home.js` and `IDHomeRelease` neutralized. Kills mutant E7.

**Fix iteration 2** (Verifier FAIL, `validation.md` Fix 1): HOME-23 edge and the PERF-35 CSS-only window in `tests/home/loader-style.e2e.cjs` are timed from the boot clock (`performance.now() - window.IDHomeBootAt`), not from `domcontentloaded`. Same bounds: visible at 1.5 s (checked before 1.9 s), hidden at 2.5 s, each checked once without retry. E7 and E8 still killed.

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | 1 include removed | ✅ |
| T2 | 1 new include replacing 2 | ✅ |
| T3 | 1 script | ✅ |
| T4 | 1 pattern across 5 includes | ⚠️ cohesive |
| T5 | front matter + 2 deletions, 1 concept | ⚠️ cohesive |
| T6 | 1 include | ✅ |
| T7 | 1 build script + moved entries | ⚠️ cohesive |
| T8 | 1 include + data file | ✅ |
| T9 | 1 vendor file + 1 icon | ✅ |
| T10 | 1 font file set | ✅ |
| T11 | 1 face concept | ✅ |
| T12 | 1 include | ✅ |
| T13 | 1 script + outputs | ✅ |
| T14-T18 | 1 template each | ✅ |
| T19 | 1 constant set | ✅ |
| T20 | 1 test file | ✅ |

## Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram | Status |
| --- | --- | --- | --- |
| T1 | None | start of P1 | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | None (phase order) | start of P2 (P1 before) | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | None (phase order) | start of P3 | ✅ |
| T8 | T7 | T7 → T8 | ✅ |
| T9 | T8 | T8 → T9 | ✅ |
| T10 | None (phase order) | start of P4 | ✅ |
| T11 | T10 | T10 → T11 | ✅ |
| T12 | T11 | T11 → T12 | ✅ |
| T13 | None (phase order) | start of P5 | ✅ |
| T14 | T13 | T13 → T14 | ✅ |
| T15 | T14 | T14 → T15 | ✅ |
| T16 | T15 | T15 → T16 | ✅ |
| T17 | T16 | T16 → T17 | ✅ |
| T18 | T17 | T17 → T18 | ✅ |
| T19 | None (phase order) | start of P6 | ✅ |
| T20 | T19 | T19 → T20 | ✅ |

## Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Built HTML | unit | unit | ✅ |
| T2 | Inline JS | e2e | e2e | ✅ |
| T3 | Browser JS | e2e | e2e | ✅ |
| T4, T5 | Markup | e2e | e2e | ✅ |
| T6 | Built HTML | unit | unit | ✅ |
| T7 | Build script | unit | unit | ✅ |
| T8, T9, T10 | Markup/styles | e2e | e2e | ✅ |
| T11, T12 | Built CSS/HTML | unit | unit | ✅ |
| T13 | Build script | unit | unit | ✅ |
| T14-T18 | Markup/styles | e2e | e2e | ✅ |
| T19 | Browser JS + `home-core.js` | e2e + unit | e2e | ✅ |
| T20 | Built output | unit | unit | ✅ |
