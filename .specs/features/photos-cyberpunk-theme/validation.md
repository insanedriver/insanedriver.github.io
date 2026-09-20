# Photos Cyberpunk Theme Refresh Validation

## Validation: photos-cyberpunk-theme - FAIL ❌

**Date**: 2026-09-20
**Spec**: `.specs/features/photos-cyberpunk-theme/spec.md`
**Diff range**: `71cc9d8..HEAD` (branch `feature/photos-cyberpunk-theme`)
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status  | Notes |
| ---- | ------- | ----- |
| T1   | ✅ Done | `#content` override removed, `bodybg` assertion added |
| T2   | ✅ Done | 5 `photos-` keyframes present, dormant |
| T3   | ✅ Done | cyber-panel component CSS present, dormant at time of commit |
| T4   | ✅ Done | Root wrapper + carousel panel wired, matching `data-photo-*` unchanged |
| T5   | ✅ Done | Archive panel + separator wired |
| T6   | ✅ Done | Build/test gate green per author notes; independently reconfirmed below |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| PXCP-01: wrap content in `.cyber-zone` containing `.cyber-zone-inner` | Root carries `.cyber-zone`, one `.cyber-zone-inner` child | `tests/photos/visual.e2e.cjs:9` - `expect(page.locator('.cyber-zone-inner')).toHaveCount(1)` | ⚠️ Partial - `.cyber-zone-inner` count asserted, but no assertion targets the `.cyber-zone` class itself on the root (e.g. `.photos-shell.cyber-zone` count/class check) |
| PXCP-02: `.cyber-panel` with `.cyber-panel-tab` + `.corner-tl/tr/bl` | Each of the 2 sections is a `.cyber-panel` with tab label and 3 named corner elements | `tests/photos/visual.e2e.cjs:11,20` - `.cyber-panel-tab` located (proves panel+tab exist); `visual.e2e.cjs:21` - `.corner-bl` color checked | ⚠️ Partial - tab existence proven by successful locator resolution, `.corner-bl` explicitly checked, but `.corner-tl`/`.corner-tr` are never located by any test (present only in static markup, unverified at runtime) |
| PXCP-03: scanline `::after`, noise `::before`, background grid | `.cyber-zone`/`.cyber-panel-body` show scanline overlay, animated noise (drift), grid, under normal motion | none found | ❌ GAP - `grep -rn "cyber-zone\b" tests/photos/` returns only the `.cyber-zone-inner` count check; no test asserts the scanline gradient, the noise `background-image`/`photos-noise-drift` animation, or the `.cyber-panel-body` grid `background-size` under normal (non-reduced) motion. The only related assertion (`visual.e2e.cjs:23-32`) checks the *reduced-motion off-state*, which does not prove the normal-state effect exists |
| PXCP-04: shared palette (`#00f3ff`/`#005f8c`/`#ff00ea`) for panel borders, tab gradients, corner accents | All 3 colors used across panel borders/tab gradients/corner accents | `tests/photos/visual.e2e.cjs:11,20` (cyan `rgb(0,243,255)` border), `:21` (deep-blue `rgb(0,95,140)` corner) | ⚠️ Spec-precision gap - magenta (`#ff00ea`) is never asserted, and never used, on any panel border/tab-gradient/corner-accent element (`less/photos.less` confirms `.cyber-panel`, `.cyber-panel-tab`, `.corner-tl/tr/bl` are cyan/deep-blue only). `design.md`'s Tech Decision table and spec.md's own confirmed Assumptions row ("magenta ... layered on top of the shared cyan/deep-blue panel chrome") deliberately keep magenta OFF the shared chrome - contradicting the AC's literal wording that lists magenta as a color to use "for panel borders, tab gradients and corner accents." Implementation follows the confirmed assumption, not the AC's literal text; the AC text itself was never corrected to match |
| PXCP-05: `Rajdhani` for panel body text, `Share Tech Mono` for HUD text | Fonts applied per design | none found | ❌ GAP - `grep -rn "font-family\|Rajdhani\|Share Tech Mono" tests/photos/` returns zero matches. `less/photos.less` does apply `font-family: 'Rajdhani'` (`.cyber-panel-tab`) and `'Share Tech Mono'` (`.cyber-panel-body::after`), but no test verifies either |
| PXCP-06: `.cyber-zone` background transparent, `bodybg.jpg` visible | `#content` computed `background-image` contains `bodybg` | `tests/photos/visual.e2e.cjs:2-6` - `expect(backgroundImage).toContain('bodybg')` | ✅ PASS (confirmed killed by sensor mutation 3) |
| PXCP-07: pulsing glow on `.cyber-panel-body` | `animationName` includes `photos-panel-glow` | `tests/photos/visual.e2e.cjs:12-13` - `expect(animationName).toContain('photos-panel-glow')` | ✅ PASS |
| PXCP-08: carousel nav (wraparound, thumbnail `aria-pressed`, arrow keys) | Exact wraparound counters, `aria-pressed="true"` count 1, arrow keys scoped to focus | `tests/photos/carousel.e2e.cjs:4-26` - counter text assertions, `toHaveAttribute('aria-pressed','true')`, `toHaveCount(1)` | ✅ PASS (pre-existing, unmodified, passes against new markup) |
| PXCP-09: 40px horizontal swipe selects one adjacent highlight | Counter increments by exactly one slide per qualifying gesture | `tests/photos/carousel.e2e.cjs:32-42` - counter text before/after gesture | ✅ PASS (pre-existing, unmodified) |
| PXCP-10: `randomizeHighlights()` selects 6 from PROMO/LIVE | 6 unique ids, each present in archive, category in `['PROMO','LIVE']` | `tests/photos/carousel.e2e.cjs:48-59` - `toHaveCount(6)`, `Set(ids).size===6`, `expect(['PROMO','LIVE']).toContain(category)` | ✅ PASS (pre-existing, unmodified) |
| PXCP-11: click opens PhotoSwipe, focus restoration on close | `.pswp` gains `pswp--open`, correct `src`, focus returns to trigger | `tests/photos/viewer.e2e.cjs:7-13,23-34` | ✅ PASS (pre-existing, unmodified) |
| PXCP-12: `data-photo-*` attributes preserved despite re-nesting | Attribute-scoped selectors keep working post-restructure | `tests/photos/carousel.e2e.cjs:14` (`data-photo-select="3"`), `viewer.e2e.cjs:10` (`data-photo-slide`) all pass against the new nested markup | ✅ PASS (indirect but conclusive - these selectors only succeed if attributes/nesting-relative-to-`[data-photo-carousel]` survived) |
| PXCP-13: archive renders all 23 entries | `.photos-archive figure` count 23 | `tests/photos/gallery.e2e.cjs:5` - `toHaveCount(23)` | ✅ PASS |
| PXCP-14: reduced motion disables all decorative animation incl. root pseudo-elements | `animationName === 'none'` on root `::before`/`::after` and all descendants; viewer transitions 0 | `tests/photos/visual.e2e.cjs:23-32` (root pseudo-elements), `:57-64` (blanket descendant check), `tests/photos/viewer.e2e.cjs:35-45` (viewer durations `[0,0]`) | ✅ PASS (confirmed killed by sensor mutation 2) |
| PXCP-15: visible focus + accessible names | `outline-style: solid`, non-empty `aria-label` on every visible control | `tests/photos/visual.e2e.cjs:45-56` | ✅ PASS (pre-existing, unmodified) |
| PXCP-16: no horizontal overflow at 320/390/768/1440 | `scrollWidth <= innerWidth` at each width | `tests/photos/visual.e2e.cjs:33-44` | ✅ PASS |
| PXCP-17: no-JS archive links to all 23 images | 23 links, `200` status, `image/*` content-type | `tests/photos/gallery.e2e.cjs:8-21` | ✅ PASS (pre-existing, unmodified) |

**Status**: ❌ Gaps present - PXCP-03 and PXCP-05 have zero test evidence (evidence-or-zero ⇒ NOT covered); PXCP-01 and PXCP-02 are only partially covered; PXCP-04 has an unresolved spec-text/design contradiction. 12/17 ACs fully PASS with precise evidence.

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ------------ | ------- |
| 1 | `less/photos.less:84` (scratch) | `.cyber-panel-tab` border color `#00f3ff` → `#ff00ea` | ✅ Killed - `visual.e2e.cjs:11` and `:20` both failed (`rgb(255, 0, 234)` received) |
| 2 | `less/photos.less:253-257` (scratch) | Reverted reduced-motion selector to drop `.photos-shell::before, .photos-shell::after` (the root-pseudo-element gap fix from `design.md` Risks & Concerns) | ✅ Killed - `visual.e2e.cjs:30` failed (`photos-noise-drift` received instead of `'none'`) |
| 3 | `less/photos.less:1-2` (scratch) | Re-added `#page_photos #content { background: #050a10; }` | ✅ Killed - `visual.e2e.cjs:2-6` (`PXCP-06`) failed |

**Sensor depth**: lightweight (3 targeted mutations)
**Sensor outcome**: 3/3 killed, 0 survived (tests are discriminating for the mutated behaviors)
**Isolation**: scratch git worktree at `/tmp/.../pxcp-sensor` (removed via `git worktree remove --force`); `git status --porcelain` on the real tree matched the pre-sensor baseline exactly (untracked skill-config dirs only, no tracked-file changes) before and after.

---

## Code Quality

| Principle | Status |
| --- | --- |
| No features beyond what was asked | ✅ - diff limited to `photos/index.html`, `less/photos.less`, generated CSS, `visual.e2e.cjs`, plus planning docs |
| No abstractions for single-use code | ✅ |
| No unnecessary "flexibility" added | ✅ |
| Only touched files required for task | ✅ - no `.js` files, no `_data/*`, no other page templates touched |
| Didn't "improve" unrelated code | ✅ |
| Matches existing patterns/style | ✅ - `.cyber-panel`/`.cyber-panel-tab`/`.corner-*` CSS in `less/photos.less` matches `less/band.less:93-287` almost verbatim; markup matches `band/index.html:15-53` skeleton; `photos-` keyframe prefix matches Newsletter's established `newsletter-*` precedent |
| Would senior engineer approve? | ✅ |
| Tests map to acceptance criteria and are non-shallow (spot-check one story) | ⚠️ - P1 "Visual parity" story spot-checked: PXCP-06/07 are precise and non-shallow; PXCP-03/05 have no assertions at all (see gaps above) |
| Spec-anchored outcome check: each test's asserted value matches the spec-defined outcome (or gap flagged) | ⚠️ - see AC table; 5/17 ACs flagged |
| Per-layer Coverage Expectation met | ⚠️ - e2e coverage for wired DOM/CSS is present but incomplete for PXCP-01/02/03/05 per the task matrix's own stated expectation ("every PXCP AC that changes observable DOM/CSS gets a Playwright assertion") |
| Every test in scope maps to a spec AC, listed edge case, or Done-when criterion (no unclaimed tests) | ✅ - all 4 new `visual.e2e.cjs` tests carry `PXCP-*` tags matching real ACs |
| Documented project quality/testing guidelines followed | ✅ - `README.md:67` (LESS build regenerated & committed with every `.less` change) - confirmed, no stray diff after `npm run less:build` |

---

## Edge Cases

- [x] Long dynamic content not overflowing container at 4 widths (PXCP-16): handled, `visual.e2e.cjs:33-44` passes at all 4 widths
- [x] `prefers-reduced-motion: reduce` neutralizes new scanline/noise/glow keyframes identically to existing ones (PXCP-14): handled, confirmed by sensor mutation 2

---

## Gate Check

- **Gate command**: `npm run test:unit && npm run test:photos` (Full gate per `tasks.md`); `npm run less:build` re-run separately to confirm CSS is current
- **Result**: 28 passed (3 unit + 25 e2e), 0 failed, 0 skipped
- **Test count before feature** (per `tasks.md` T1 baseline note): 3 unit + 21 e2e = 24
- **Test count after feature**: 3 unit + 25 e2e = 28
- **Delta**: +4 new e2e tests (all in `tests/photos/visual.e2e.cjs`: PXCP-06, 2x PXCP-01/02/04/07, PXCP-14) - no coverage removed, matches author's task-by-task counts
- **Skipped tests**: none
- **Failures**: none
- **`npm run less:build`**: compiles clean; `git status --porcelain -- assets/css/style.min.css` empty after rebuild (CSS artifact is current)

---

## Fix Plans (if issues found)

### Fix 1: PXCP-03 (scanline/noise/grid) has zero test coverage in normal motion state

- **Root cause**: `visual.e2e.cjs` only asserts the reduced-motion *off*-state (`animationName === 'none'`) for the root pseudo-elements; nothing asserts the *on*-state (that `photos-noise-drift` runs and the scanline gradient/grid background exist under normal motion).
- **Fix task**: Add a Playwright assertion (no `reducedMotion` emulation) checking `getComputedStyle(el, '::before').animationName` contains `photos-noise-drift` and `.cyber-panel-body` computed `background-size` matches the grid values.
- **Priority**: Minor (visual-only regression risk; the effect is visually confirmed per T6's manual Chrome check, but not machine-enforced).

### Fix 2: PXCP-05 (fonts) has zero test coverage

- **Root cause**: No test in `tests/photos/*.cjs` ever reads `font-family`.
- **Fix task**: Add an assertion on `.cyber-panel-body` (or `.photos-shell`) computed `font-family` containing `Rajdhani`, and on `.cyber-panel-body::after`/HUD text containing `Share Tech Mono`.
- **Priority**: Minor.

### Fix 3: PXCP-04 spec-text / design contradiction on magenta usage

- **Root cause**: `spec.md`'s AC text (PXCP-04) lists magenta as a color for "panel borders, tab gradients and corner accents," but `spec.md`'s own confirmed Assumptions row and `design.md`'s Tech Decision both explicitly keep magenta OFF that shared chrome. The implementation (correctly) follows the assumption, not the AC's literal wording, but the AC text was never reconciled.
- **Fix task**: Amend PXCP-04's wording in `spec.md` to say the shared cyan/deep-blue palette is used for panel borders/tab gradients/corner accents, and magenta is retained as Photos' distinct secondary accent elsewhere (matching the Assumptions row) - not a code fix.
- **Priority**: Minor (documentation-accuracy issue, not a behavior defect).

### Fix 4: PXCP-01/02 partial coverage (`.cyber-zone` class, `.corner-tl`/`.corner-tr`)

- **Root cause**: Tests check `.cyber-zone-inner` and `.corner-bl` but never directly assert the root carries `.cyber-zone` or that `.corner-tl`/`.corner-tr` exist.
- **Fix task**: Add `expect(page.locator('.photos-shell.cyber-zone')).toHaveCount(1)` and `expect(panel.locator('.corner-tl')).toHaveCount(1)` / `.corner-tr` per panel.
- **Priority**: Minor.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | ---------------- | ---------- |
| PXCP-01 | Implementing | ⚠️ Needs Fix (partial coverage) |
| PXCP-02 | Implementing | ⚠️ Needs Fix (partial coverage) |
| PXCP-03 | Implementing | ❌ Needs Fix (no coverage) |
| PXCP-04 | Implementing | ⚠️ Needs Fix (spec-text discrepancy) |
| PXCP-05 | Implementing | ❌ Needs Fix (no coverage) |
| PXCP-06 | Implementing | ✅ Verified |
| PXCP-07 | Implementing | ✅ Verified |
| PXCP-08 | Implementing | ✅ Verified |
| PXCP-09 | Implementing | ✅ Verified |
| PXCP-10 | Implementing | ✅ Verified |
| PXCP-11 | Implementing | ✅ Verified |
| PXCP-12 | Implementing | ✅ Verified |
| PXCP-13 | Implementing | ✅ Verified |
| PXCP-14 | Implementing | ✅ Verified |
| PXCP-15 | Implementing | ✅ Verified |
| PXCP-16 | Implementing | ✅ Verified |
| PXCP-17 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ⚠️ Issues (12/17 ACs fully verified with precise evidence; gate green; sensor 3/3 killed; but evidence-or-zero rules 2 ACs uncovered and 3 partially/ambiguously covered)

**Spec-anchored check**: 12/17 ACs matched spec outcome with precise `file:line` evidence; 2 ACs (PXCP-03, PXCP-05) have zero evidence; 3 ACs (PXCP-01, PXCP-02, PXCP-04) partially covered or spec-precision-ambiguous
**Sensor**: 3/3 mutations killed
**Gate**: 28 passed, 0 failed, 0 skipped; `less:build` output current

**What works**: Structural wiring (`.cyber-zone`/`.cyber-panel`), palette (cyan/deep-blue), glow animation, backdrop visibility, reduced-motion root-pseudo-element fix, and all pre-existing carousel/viewer/gallery/no-JS regression coverage are solidly verified and demonstrably regression-proof (sensor confirms).

**Issues found**: PXCP-03 and PXCP-05 lack any test assertion (visual/font checks exist in CSS but are unverified); PXCP-01/02 are only indirectly/partially asserted; PXCP-04's AC wording contradicts the project's own confirmed design assumption about magenta placement.

**Next steps**: Route Fix 1, Fix 2, Fix 4 as e2e test-addition tasks to an implementer; route Fix 3 as a spec.md wording correction (no code change). Re-verify after fixes land.
