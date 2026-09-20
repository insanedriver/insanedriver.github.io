# Photos Cyberpunk Theme Refresh Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/photos-cyberpunk-theme/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase sampling (`tests/photos/*.cjs`, `package.json`, `README.md:47,67`) and spec. Guidelines found: `README.md` (LESS/build/commit conventions, no dedicated AGENTS.md/CONTRIBUTING.md - no other testing guideline located).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Photos page structure & styling, wired/user-visible (`photos/index.html`, applied rules in `less/photos.less`) | e2e | Every PXCP AC that changes observable DOM/CSS gets a Playwright assertion; every pre-existing regression AC (carousel nav, PhotoSwipe viewer, keyboard/focus, responsive widths, no-JS fallback) keeps passing - re-pointed to the new markup where the asserted property moved, otherwise left untouched | `tests/photos/*.e2e.cjs` | `npm run test:photos` |
| Dormant/unwired CSS support code (keyframes and component rules not yet referenced by any class in the HTML) | none | Build gate only - nothing observable yet to assert | - | `npm run less:build` |
| Gallery data (`_data/photos.json`, `_data/highlights.js`) | unit | Unchanged - existing floor (23 entries, 6 featured/highlightOrder) maintained, not touched by this feature | `tests/photos/gallery.test.cjs` | `npm run test:unit` |
| Generated CSS artifact (`assets/css/style.min.css`) | none | Must be regenerated and committed alongside every `.less` change (`README.md:67`) | - | `npm run less:build` |

## Gate Check Commands

> Generated from `package.json` scripts.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After a task that only adds dormant/unwired CSS (no DOM wiring yet) | `npm run less:build` |
| Full | After a task that wires new markup/CSS into the rendered page, or edits a test file | `npm run test:unit && npm run test:photos` |
| Build | After the final task / phase completion | `npm run build && npm test` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: LESS Foundations (dormant CSS + independent background fix)

```
T1 (standalone)
T2 → T3
```

### Phase 2: HTML Wiring (the visible structural change)

```
T3 → T4 → T5
```

### Phase 3: Closing Verification

```
T5 → T6
```

---

## Task Breakdown

### T1: Stop hiding the site's blue backdrop on the Photos page

**What**: Delete the `#content { background: #050a10; }` override inside `#page_photos` in `less/photos.less` so the global `bodybg.jpg` (set in `less/general.less:14-16`) shows through, matching Band/Contact/Newsletter. Regenerate `assets/css/style.min.css`.
**Where**: `less/photos.less`
**Depends on**: None
**Reuses**: `less/general.less:14-16` (existing global `#content` background rule - nothing to change there)
**Requirement**: PXCP-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `#page_photos #content { background: #050a10; }` line removed from `less/photos.less`
- [x] `assets/css/style.min.css` regenerated via `npm run less:build` and included in the commit
- [x] New Playwright assertion added to `tests/photos/visual.e2e.cjs` confirming `#content`'s computed `background-image` on `/photos/` contains `bodybg` (not `none` and not a solid override)
- [x] Gate check passes: `npm run test:unit && npm run test:photos`
- [x] No existing test assertion count decreases

**Tests**: e2e
**Gate**: full

**Commit**: `feat(photos): show the site backdrop behind the gallery`

**Status**: ✅ Complete - 3 unit + 22 e2e tests pass (was 21 e2e before this task).

---

### T2: Add cyberpunk keyframe animations (dormant)

**What**: Add `@keyframes photos-noise-drift`, `photos-panel-glow`, `photos-border-flicker`, `photos-blink-dot`, `photos-blink-text` to `less/photos.less`, with the exact timing/values copied from `less/band.less:22-69`. Not referenced by any selector yet - purely additive and inert.
**Where**: `less/photos.less`
**Depends on**: None
**Reuses**: `less/band.less:22-69`
**Requirement**: PXCP-03, PXCP-07 (support - consumed by T3)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] All 5 keyframes present in `less/photos.less` with `photos-` prefix and values matching `band.less`
- [x] `npm run less:build` compiles with no errors and `assets/css/style.min.css` is regenerated and included in the commit
- [x] No existing selector references these keyframes yet (verified inert - grep shows zero usages outside the `@keyframes` blocks themselves)

**Tests**: none
**Gate**: quick

**Commit**: `feat(photos): add cyberpunk keyframe animations`

**Status**: ✅ Complete - `npm run less:build` compiled clean; `grep` for the new keyframe names in `photos/index.html` returned nothing.

---

### T3: Add cyber-panel component styles (dormant)

**What**: Add, scoped under `#page_photos`, the dormant rules: `.cyber-zone` (`position: relative; overflow: hidden; background-color: transparent;` + `::before` noise using `photos-noise-drift` + `::after` scanline), `.cyber-zone-inner` (`max-width: 1180px`, matching Photos' existing width), `.cyber-panel`, `.cyber-panel-tab` (with `.tab-icon` using `photos-blink-dot`), `.cyber-panel-body` and its `--photos-stage`/`--photos-archive` modifiers (using `photos-panel-glow` + `photos-border-flicker`, `data-hud` via `::after` using `photos-blink-text`), `.corner-tl`/`.corner-tr`/`.corner-bl`, `.top-accent`, `.cyber-separator` - values copied from `less/band.less:93-287`. Also extend the existing `@media (prefers-reduced-motion: reduce)` block (`less/photos.less:69-71`) to add `.photos-shell::before, .photos-shell::after` alongside the current selector list, closing the pseudo-element gap identified in `design.md` Risks & Concerns *before* those pseudo-elements go live in T4. None of this is referenced by any HTML class yet.
**Where**: `less/photos.less`
**Depends on**: T2 (needs the keyframe names to reference)
**Reuses**: `less/band.less:93-287` (exact component CSS pattern)
**Requirement**: PXCP-01, PXCP-02, PXCP-03, PXCP-04, PXCP-05, PXCP-07, PXCP-14 (support - all consumed by T4/T5)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] All listed selectors present under `#page_photos`, palette matches `#00f3ff`/`#005f8c`/`#ff00ea`, fonts `Rajdhani`/`Share Tech Mono` applied per design
- [ ] Reduced-motion media query now includes `.photos-shell::before, .photos-shell::after` in addition to the existing selector list
- [ ] `npm run less:build` compiles with no errors and `assets/css/style.min.css` is regenerated and included in the commit
- [ ] Verified inert: no HTML class currently applies `.cyber-zone`/`.cyber-panel`/etc. (grep confirms zero usages in `photos/index.html` at this point)

**Tests**: none
**Gate**: quick

**Commit**: `feat(photos): add cyber-panel component styles`

---

### T4: Wire the root wrapper and featured-carousel panel

**What**: In `photos/index.html`, change the root `<div class="photos-shell">` to `<div class="photos-shell cyber-zone">`, add a `<div class="cyber-zone-inner">` wrapping all existing content, and wrap the existing `<section class="photos-featured" ... data-photo-carousel>` block in a `.cyber-panel` with `.cyber-panel-tab` (label `VISUAL::CAROUSEL`) and a `.cyber-panel-body cyber-panel-body--photos-stage` (with `data-hud="GALLERY.FEED // LIVE_"`, `.top-accent`, `.corner-tl`, `.corner-tr`, `.corner-bl`). No existing attribute, class, or nesting *inside* `<section class="photos-featured">` changes.
**Where**: `photos/index.html`, `tests/photos/visual.e2e.cjs`
**Depends on**: T3
**Reuses**: `band/index.html:15-34` markup pattern; all existing carousel markup/attributes unchanged
**Requirement**: PXCP-01, PXCP-02, PXCP-04, PXCP-05, PXCP-07, PXCP-14 (plus regression: PXCP-08, PXCP-09, PXCP-11, PXCP-12, PXCP-15)

> **Note on `Where` spanning two files**: the HTML wiring and its test update cannot be split into separate tasks without leaving the gate red in between (`visual.e2e.cjs`'s reduced-motion assertion only checks real elements today - the new root pseudo-element animations must be asserted in the same task that makes them live, per the design's Risks & Concerns). This is the "merge backward" resolution from the Tasks process, not a granularity miss.

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Root element carries both `photos-shell` and `cyber-zone` classes; `.cyber-zone-inner` wraps all page content
- [ ] `.photos-featured` section is nested inside one `.cyber-panel` with tab, body modifier, `data-hud`, and all four corner/accent elements
- [ ] All existing `data-photo-*` attributes and their nesting relative to `[data-photo-carousel]` are byte-identical to before this task
- [ ] New Playwright assertions added to `tests/photos/visual.e2e.cjs`: (a) `.cyber-zone-inner` exists, (b) the carousel's `.cyber-panel-tab` has the expected gradient/border color, (c) the carousel's `.cyber-panel-body` has a non-`'none'` `animationName` under normal motion, (d) under `prefers-reduced-motion: reduce`, `getComputedStyle(document.querySelector('.photos-shell'), '::before').animationName` and `('::after')` are both `'none'` - closing the pseudo-element gap
- [ ] All pre-existing `visual.e2e.cjs` assertions (`.photos-stage` border color, `.photos-accent` color, `.photos-archive` display, focus/outline loop, real-element reduced-motion check) still pass unmodified
- [ ] `assets/css/style.min.css` unchanged by this task (no `.less` edits) - only regenerate if a `.less` file was touched
- [ ] Gate check passes: `npm run test:unit && npm run test:photos`
- [ ] Test count did not decrease; new assertions listed above are present in addition to the existing ones

**Tests**: e2e
**Gate**: full

**Commit**: `feat(photos): wrap the featured carousel in a cyber-panel`

---

### T5: Wire the archive-grid panel

**What**: In `photos/index.html`, add a `.cyber-separator` immediately after the carousel `.cyber-panel` (still inside `.cyber-zone-inner`), then wrap the existing `<section class="photos-archive-section">` block in a second `.cyber-panel` with `.cyber-panel-tab` (label `VISUAL::ARCHIVE`) and `.cyber-panel-body cyber-panel-body--photos-archive` (with `data-hud="GALLERY.GRID // {{ photos.size }}_"`, `.top-accent`, `.corner-tl`, `.corner-tr`, `.corner-bl`). No existing attribute, class, or nesting *inside* `<section class="photos-archive-section">` changes.
**Where**: `photos/index.html`, `tests/photos/visual.e2e.cjs`
**Depends on**: T4
**Reuses**: `band/index.html:37-53` markup pattern (panel + preceding separator); all existing archive-grid markup/attributes unchanged
**Requirement**: PXCP-01, PXCP-02, PXCP-04, PXCP-05, PXCP-07 (plus regression: PXCP-10, PXCP-13, PXCP-16, PXCP-17)

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `.cyber-separator` present between the two panels; `.photos-archive-section` nested inside its own `.cyber-panel` with tab, body modifier, `data-hud`, and all four corner/accent elements
- [ ] Exactly 2 `.cyber-panel` elements exist on the page (verified by a new Playwright assertion)
- [ ] All existing `data-photo-id`/`data-category`/`data-photo-open` attributes on archive figures are byte-identical to before this task
- [ ] New Playwright assertion added confirming the archive panel's `.cyber-panel-tab` and corner colors match the shared palette
- [ ] Full 4-width overflow check (320/390/768/1440, `PHOTO-03/14` test) re-run and passing with the complete two-panel layout - if clip-path corners cause clipping at any width, adjust `.cyber-panel-body`'s padding/clip size in `less/photos.less` for `#page_photos` (regenerate `assets/css/style.min.css` if so) until it passes
- [ ] All pre-existing `visual.e2e.cjs` and other `tests/photos/*.e2e.cjs`/`*.test.cjs` assertions still pass unmodified
- [ ] Gate check passes: `npm run test:unit && npm run test:photos`
- [ ] Test count did not decrease; new assertions listed above are present in addition to the existing ones

**Tests**: e2e
**Gate**: full

**Commit**: `feat(photos): wrap the archive grid in a cyber-panel`

---

### T6: Closing build, full regression, and visual parity check

**What**: Run the full production build and test suite, then visually compare the redesigned Photos page against Band, Contact and Newsletter in Chrome to confirm the cyberpunk language reads as consistent (grilled requirement). Fix any narrow visual issue found (e.g. clipping, color mismatch) directly in `less/photos.less`/`photos/index.html` before closing the feature; if nothing needs fixing, this task produces no diff beyond the build artifacts already committed in T1-T5.
**Where**: N/A (verification task; touches `less/photos.less`/`photos/index.html`/`assets/css/style.min.css` only if a fix is needed)
**Depends on**: T5
**Reuses**: N/A
**Requirement**: Success Criteria (spec.md) - closes PXCP-01 through PXCP-17 as a whole

**Tools**:
- MCP: `claude-in-chrome`
- Skill: `claude-in-chrome`

**Done when**:
- [ ] `npm run build` completes with no errors (Eleventy + LESS)
- [ ] `npm test` (`test:unit` + `test:photos`) passes in full
- [ ] Photos page opened in Chrome side by side with Band, Contact and Newsletter; panel chrome, palette, fonts, scanline/noise/grid/glow language and the `bodybg.jpg` backdrop confirmed consistent across all four pages
- [ ] Any fix found during the visual check is committed with its own gate-passing verification before this task is marked done
- [ ] `docs/` output left untouched (not committed - it's Eleventy-generated, per `README.md:67`)

**Tests**: none (verification of existing coverage; any fix task reuses the `Full` gate above)
**Gate**: build

**Commit**: `test(photos): confirm cyberpunk parity with band/contact/newsletter` (only if a fix was needed - otherwise no commit, report done)

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 (standalone)
          T2 ------→ T3
Phase 2:  T3 ------→ T4 ------→ T5
Phase 3:  T5 ------→ T6
```

Execution is strictly sequential - there is no intra-phase parallelism. A single agent works one task at a time, in order. Total task count is 6 (≤ ~8), so this executes inline in the main session - no sub-agent batching offer applies.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Remove dark `#content` override | 1 CSS rule removal + 1 assertion | ✅ Granular |
| T2: Add keyframes | 1 cohesive set of related, unused animations in 1 file | ✅ Granular (OK if cohesive) |
| T3: Add cyber-panel component styles | 1 cohesive component system in 1 file, all dormant | ✅ Granular (OK if cohesive) |
| T4: Wire root + carousel panel | 1 structural wrapping change + its required test update | ✅ Granular (2 files, justified - see note under T4) |
| T5: Wire archive panel | 1 structural wrapping change + its required test update | ✅ Granular (2 files, justified - same reason as T4) |
| T6: Closing verification | 1 verification pass, fix-if-needed | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | standalone in Phase 1 | ✅ Match |
| T2 | None | standalone start of `T2 → T3` | ✅ Match |
| T3 | T2 | `T2 → T3` | ✅ Match |
| T4 | T3 | `T3 → T4` | ✅ Match |
| T5 | T4 | `T4 → T5` | ✅ Match |
| T6 | T5 | `T5 → T6` | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1: content bg removal | Photos page structure & styling (wired/visible) | e2e | e2e | ✅ OK |
| T2: keyframes | Dormant CSS support code | none | none | ✅ OK |
| T3: cyber-panel styles | Dormant CSS support code | none | none | ✅ OK |
| T4: wire root + carousel panel | Photos page structure & styling (wired/visible) | e2e | e2e | ✅ OK |
| T5: wire archive panel | Photos page structure & styling (wired/visible) | e2e | e2e | ✅ OK |
| T6: closing verification | none (verification only) | none | none | ✅ OK |

---

## Tips

- Every task that touches a `.less` file regenerates and commits `assets/css/style.min.css` in the same commit (`README.md:67`).
- `docs/` is Eleventy-generated output - never edit or commit inside it (`README.md:67`).
- No task touches `assets/js/photos.js`, `assets/js/photoswipe-impl.js`, `_data/photos.json`, or `_data/highlights.js` - carousel/gallery/randomization logic is out of scope by design.
