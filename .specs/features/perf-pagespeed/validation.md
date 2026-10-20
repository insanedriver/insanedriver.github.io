# Perf PageSpeed Validation

## Validation: perf-pagespeed - PASS ✅ (iteration 4, an extra re-verify the user approved after iteration 3 failed)

**Result**: PASS. The gate is clean: unit 183/183, and both full e2e runs passed 579/579 with 0 flakes. Fix commit `f40a350` closes the one iteration-3 gap. Mutant N9 (inline release at 1.4 s) is now killed at `tests/home/loader-style.e2e.cjs:45`. E7, E8, N10 and N11 are still killed, and 3 new mutants of my own in the release contract (N12, N13, N14) are killed too. 40/40 ACs are covered and discriminated.

**Date**: 2026-10-20
**Spec**: `.specs/features/perf-pagespeed/spec.md`
**Diff range**: `8740dc5..f40a350` on `feature/perf-pagespeed`. Fix commit since iteration 3: `f40a350` (test-only: `tests/home/loader-style.e2e.cjs` +5 lines, plus a `tasks.md` note).
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1-T20 | ✅ Done | Unchanged since iteration 1 |
| F1-F3 (iteration 1 fixes) | ✅ Done | Unchanged since iteration 2 |
| Fix iteration 2 (boot-clock timing) | ✅ Done | `d3ec1c4` |
| Fix iteration 3 (release state at 1.5 s) | ✅ Done | `f40a350`. `tasks.md` "Fix iteration 3" note is present |

---

## Review of f40a350

| Check | Finding |
| ----- | ------- |
| Root cause fixed | ✅ The ≥1500 ms check in `expectFailsafeWindow` now also reads the release state (`tests/home/loader-style.e2e.cjs:42-45`): `[window.IDHomeReleased, is-done, aria-hidden, [data-home-page].inert]` must equal `[undefined, false, null, true]`. Those are exactly the four effects of `window.IDHomeRelease` (`_layouts/home.html:15`) plus the inline `page.inert = true` (`:57`). An early release flips all four, so the check no longer depends on visibility, which the opacity fade hides |
| Valid for both callers | ✅ HOME-23 edge (`:51-58`): nothing can release before 2000 ms, because `home.js` is aborted and the session has no repeat-view key, so all four values hold at 1.5 s. CSS-only window (`:72-82`): `IDHomeRelease` is a no-op getter, so the state never changes. `inert` stays `true` for the whole test, and the test never asserts otherwise. In both tests the expected tuple is the true pre-release state |
| Nothing weakened | ✅ It adds assertions only. `isVisible` (`:40`), the `< 1900` guard (now `:46`, still read after the new evaluate) and the `isHidden` check (`:48`) are unchanged |
| Flake risk | ✅ Low. It is one synchronous `evaluate`, read before the `< 1900` guard, so a slow read fails the guard as before and does not pass silently. The unmutated pair passed 30/30 under `--repeat-each=15`, and both full runs passed |
| Bonus coverage | ✅ The `inert === true` element also kills N14 (inline script does not make the page inert), which the iteration-3 tests only caught in `loader.e2e.cjs:191` |

---

## Spec-Anchored Acceptance Criteria

Test paths are relative to the repo root. Line numbers were rechecked against HEAD `f40a350`. `d3ec1c4..f40a350` touches only `tests/home/loader-style.e2e.cjs` (and a `tasks.md` note), so only that file moved: helper `:37-44` → `:37-49` (new state check `:42-45`, `< 1900` guard `:41` → `:46`, hidden check `:43` → `:48`), HOME-23 edge `:46-53` → `:51-58` (inert `:52` → `:57`), PERF-35 delay `:64` → `:69`, CSS-only window `:67-77` → `:72-82` (`:75` → `:80`), reduced motion `:100` → `:105`. Every other row matches iteration 3.

### P1: Trackers

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| PERF-01 | no `google-analytics.com/analytics.js` or `UA-60390716-1` in any built page | `tests/perf/trackers.test.cjs:9-10` - `assert.ok(!html.includes(...))` over >40 pages; `tests/perf/guard.test.cjs:16-17` | ✅ |
| PERF-02 | no `gtm.js`/`fbevents.js` request before window `load` | `tests/perf/trackers.e2e.cjs:38-61`, which loops over `LAYOUTS` (`/band/` and `/`). `:45-46` - `log.gtm[0].at toBeGreaterThanOrEqual(log.loadAt)`. `:58-59` - with load held (header image or home hero), `readyState` is not `complete` and `counts toEqual([0, 0])`. `tests/perf/trackers.test.cjs:27-40` - on every layout page each script is named exactly once (`occurrences === 1`), in an inline body, through `inject('<url>')`, inside the `addEventListener('load', … requestIdleCallback` loader | ✅ (E9 is now killed) |
| PERF-03 | after load + idle (or 2 s): `gtm.js?id=GTM-WW9HZGP` and `fbevents.js` exactly once each | `tests/perf/trackers.e2e.cjs:41-50`, on both layouts - `toEqual([1, 1])`, `log.gtm[0].url toBe(GTM)`, `log.fb[0].url toBe(FB)`, `< 2500` ms after load, still `[1, 1]` 2.5 s later | ✅ |
| PERF-04 | the first `pointerdown`/`keydown`/`scroll`/`touchstart` before load triggers both scripts once, never again | `tests/perf/trackers.e2e.cjs:97-114` (one test per event) - `[0,0]` before, `[1, 1]` after the event, `loadAt toBeNull()`, exact URLs, `[1, 1]` after load + 2.5 s | ✅ (new mutant N1 killed) |
| PERF-05 | `fbq('init','379421529852933')`, `fbq('track','PageView')` and `gtm.start` are queued at parse time and seen by the scripts | `tests/perf/trackers.e2e.cjs:72-79` - `first.event toBe('gtm.js')`, `typeof first['gtm.start'] toBe('number')`, `fbq toEqual([['init','379421529852933'],['track','PageView']])`, `gtmSaw[0] toEqual(queued.first)` | ✅ |
| PERF-06 | GTM `<noscript>` iframe and Pixel `<noscript>` image are kept | `tests/perf/trackers.test.cjs:18-19` - `assert.match` on the exact iframe and img URLs | ✅ |
| PERF-39 | without `requestIdleCallback`, trackers load 2 s after `load` | `tests/perf/trackers.e2e.cjs:117-126` - `[0,0]` at 1.5 s, `gtm.at - loadAt toBeGreaterThanOrEqual(1900)`, `[1,1]` | ✅ |

### P1: JavaScript

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| PERF-07 | no jQuery/Bootstrap/Owl/`insane.js` on layout pages except the picker | `tests/perf/scripts.test.cjs:46-47` - `deepEqual(removedIn(html), [])`; `tests/perf/guard.test.cjs:36` | ✅ |
| PERF-08 | the picker has `jquery.min.js` and no bootstrap/owl | `tests/perf/scripts.test.cjs:53-57` | ✅ |
| PERF-09 | <768 px: the toggle shows `#navbar` and sets `aria-expanded="true"` | `tests/perf/nav.e2e.cjs:24-25` - `toBeVisible()`, `toHaveAttribute('aria-expanded','true')` on `/band/` and `/` | ✅ (new mutant N4 killed) |
| PERF-10 | a second toggle hides `#navbar` and sets `aria-expanded="false"` | `tests/perf/nav.e2e.cjs:29-30` | ✅ |
| PERF-11 | every local `<script src>` has `defer`/`async` | `tests/perf/scripts.test.cjs:16,60-63` | ✅ |
| PERF-12 | the menu works when a page script throws | `tests/perf/nav.e2e.cjs:43-50` - `errors toContain('page boom')`, then open and close with exact `aria-expanded` | ✅ |
| PERF-40 | ≥768 px: `#navbar` is visible regardless of toggle state | `tests/perf/nav.e2e.cjs:53-68` | ✅ |

### P1: CSS

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| PERF-13 | `core.min.css` has the shared styles and no owl/blog/Glyphicons/`#page_` rules | `tests/perf/css.test.cjs:47-50`; `tests/perf/fonts.test.cjs:16` | ✅ |
| PERF-14 | 9 named bundles, each holding only its own `#page_<id>` rules (plus PhotoSwipe in photos) | `tests/perf/css.test.cjs:40-41,55-65` | ✅ |
| PERF-15 | each layout page links `core.min.css` plus at most one bundle, and no `style.min.css` | `tests/perf/css.test.cjs:86-97` - core `=== 1`, bundles `<= 1`, own bundle linked against the hard-coded `BUNDLES` list (`:8`) | ✅ (new mutant N5 killed) |
| PERF-16 | `/` links `home` and `/band/` links `band` | `tests/perf/css.test.cjs:100-107` - exact `deepEqual` | ✅ |
| PERF-17 | `core.min.css` ≤ 200 KB | `tests/perf/css.test.cjs:70` - `bytes <= 200 * 1000` | ✅ |
| PERF-18 | the CSS is minified | `tests/perf/css.test.cjs:76-77` | ✅ |

### P1: Fonts

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| PERF-19 | every `@font-face` declares `font-display: swap` | `tests/perf/fonts.test.cjs:54-61` | ✅ |
| PERF-20 | no `fonts.googleapis.com`/`fonts.gstatic.com` | `tests/perf/fonts.test.cjs:31-32`; `tests/perf/fonts.e2e.cjs:49` | ✅ (new mutant N6 killed) |
| PERF-21 | self-hosted woff2 faces; the font families still resolve | `tests/perf/fonts.test.cjs:45-48`; `tests/perf/fonts.e2e.cjs:45-48` | ✅ |
| PERF-22 | SiliconFont serves woff2 first, with `.ttf` second | `tests/perf/fonts.test.cjs:66-72` | ✅ |
| PERF-23 | no Glyphicons; back-to-top uses `fa fa-chevron-up` | `tests/perf/fonts.test.cjs:16,19,26`; `tests/perf/fonts.e2e.cjs:6-17` | ✅ |
| PERF-24 | no preload of Glyphicons or `Mars-Mission.ttf` | `tests/perf/fonts.test.cjs:82-86` | ✅ |

### P1: Images

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| PERF-25 | `npm run images` produces the WebP set and is idempotent | `tests/perf/images.test.cjs:16-30,50-56` | ✅ |
| PERF-26 | header `<picture>`: WebP srcset at 3 widths, JPEG fallback, `width`, `height`, `sizes`, `fetchpriority="high"`, not lazy | `tests/perf/images.test.cjs:83-90` - `fetchpriority 'high'`, `loading undefined`, exact srcset; `tests/perf/images.e2e.cjs:16-18` | ✅ (new mutant N2 killed) |
| PERF-27 | `#content` and footer backgrounds use WebP via `image-set()`, with a JPEG fallback | `tests/perf/images.test.cjs:124-127,134-137` - plain JPEG `url()` first, then `image-set(webp, jpg)` in that order; `tests/perf/images.e2e.cjs:51-52` | ✅ (new mutant N3, swapped `image-set` order, killed) |
| PERF-28 | band photo `<picture>`: WebP, `width`, `height`, lazy, async | `tests/perf/images.test.cjs:100-107`; `tests/perf/images.e2e.cjs:36-40` | ✅ |
| PERF-29 | home covers in WebP with `width`/`height`; hero cover eager; the rest lazy | `tests/perf/images.test.cjs:145-159`; `tests/perf/images.e2e.cjs:65,69-71` | ✅ (new mutants N7 and N8 killed) |
| PERF-30 | every `<img>` on `/` and `/band/` has `width` and `height` | `tests/perf/images.test.cjs:167-173,183` | ✅ |
| PERF-31 | a missing WebP variant fails the unit test | `tests/perf/images.test.cjs:38` | ✅ |

### P2: Loader

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| PERF-32 | first view: dismissed no sooner than 600 ms | `tests/home/home-core.test.cjs:83`; `tests/home/loader.e2e.cjs:58-62` - `dismissedAfter === 600` on a fake clock | ✅ |
| PERF-33 | ready after 600 ms: dismissed at that moment | `tests/home/home-core.test.cjs:87`; `tests/home/loader.e2e.cjs:30-38` | ✅ |
| PERF-34 | not ready by 1500 ms: dismissed at 1500 ms | `tests/home/home-core.test.cjs:91-92`; `tests/home/loader.e2e.cjs:65-70` | ✅ |
| PERF-35 | `home.js` never runs: the CSS failsafe and the inline body script release the page at 2000 ms | CSS half: `tests/home/loader-style.e2e.cjs:69` and `:105` (reduced motion) - `toEqual(['home-loader-failsafe', '2s'])`. `:72-82` - `home.js` aborted and `IDHomeRelease` made a no-op, then `expectFailsafeWindow` (`:37-49`), timed from `IDHomeBootAt`: `:40` `isVisible() toBe(true)` at ≥1500 ms, `:48` `isHidden() toBe(true)` at ≥2500 ms; `:80` `IDHomeReleased toBeUndefined()`. Inline half, lower bound: `:42-45` at ≥1500 ms - `[IDHomeReleased, is-done, aria-hidden, page.inert] toEqual([undefined, false, null, true])`, then `:46` elapsed `toBeLessThan(1900)`. Inline half, upper bound: `:51-58` (`:57` `inert toBe(false)` at ≥2500 ms) and `tests/home/loader.e2e.cjs:290-293` | ✅ Both halves discriminated both ways (E7, E8, N9, N10, N11, N14 killed) |
| PERF-36 | repeat view: dismissed at 400 ms | `tests/home/home-core.test.cjs:78-79`; `tests/home/loader.e2e.cjs:86-96` | ✅ |

### P3: Guard

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| PERF-37 | unit suite fails on a removed script, `style.min.css`, Google Fonts or Glyphicons | `tests/perf/guard.test.cjs:11-21,36` | ✅ (new mutant N6 killed it) |
| PERF-38 | unit suite fails if `core.min.css` > 200 KB | `tests/perf/guard.test.cjs:30,41` | ✅ |

**Status**: ✅ 40/40 ACs have evidence that matches the spec outcome and is discriminated. No spec-precision gaps.

---

## Discrimination Sensor

All mutants ran in a fresh isolated `git worktree` at `node_modules/.cache/perf-verify/wt`, created at detached HEAD `f40a350` with `node_modules` symlinked. The driver resets the scratch (`git checkout -- . && git clean -fdq -e node_modules`), applies one `sed -E` mutation (it aborts if the diff is empty), runs `npm run less:build`, then runs Playwright through its webServer on :4178 (port checked free first), and resets again. Unmutated baseline in the scratch: loader-style + loader e2e 30/30. Each kill below is the failing `file:line` from the Playwright stack.

| # | File:line | Mutation | Tests run | Result |
| - | --------- | -------- | --------- | ------ |
| N9 | `_layouts/home.html:57` | Inline release `IDHomeBootAt + 2000` → `+ 1400` (early release when `home.js` never runs) | loader-style + loader e2e | ✅ **Killed**: `tests/home/loader-style.e2e.cjs:45` (HOME-23 edge). Received `[true, true, "true", false]` at 1.5 s |
| E8 | `_layouts/home.html:57` | Inline release `+ 2000` → `+ 4000` | loader-style + loader e2e | ✅ Killed: `tests/home/loader-style.e2e.cjs:57` (HOME-23 edge, page still `inert` at 2.5 s) |
| E7 | `less/home.less:1413,1588` | CSS failsafe `linear 2s` → `linear 4s`, normal and reduced motion (CSS recompiled) | loader-style + loader e2e | ✅ Killed, 4 failed: `tests/home/loader-style.e2e.cjs:48` (HOME-23 edge and the CSS-only window), `:69`, `:105` |
| N10 | `less/home.less:1413,1588` | CSS failsafe `2s` → `2.7s` (run only against the CSS-only window, so the `'2s'` pin cannot mask it) | `-g "CSS alone"` | ✅ Killed: `tests/home/loader-style.e2e.cjs:48` |
| N11 | `less/home.less:1413,1588` | CSS failsafe `2s` → `1.4s` (same isolation) | `-g "CSS alone"`, then the whole file | ✅ Killed: `tests/home/loader-style.e2e.cjs:40` in 7 of 8 isolated runs (6/6 under `--repeat-each=6`). With the whole file it is always killed by the `'2s'` pin at `:69` and `:105`. See watch item 1 |
| N12 (new) | `_layouts/home.html:15` | `IDHomeRelease` no longer clears `inert`: `if (page) { page.inert = false; }` → `if (!page) {…}`. The `.inert = false` text stays, so the HOME-63 source-count unit test cannot see it | loader-style + loader e2e | ✅ Killed, 8 failed: `tests/home/loader-style.e2e.cjs:57`, `tests/home/loader.e2e.cjs:112,196,204,249,293,301,343` |
| N13 (new) | `_layouts/home.html:15` | `IDHomeRelease` no longer sets `aria-hidden`: `el.setAttribute('aria-hidden','true');` → `if (!el) el.setAttribute(…);` (the text survives the HOME-63 unit count) | loader-style + loader e2e | ✅ Killed, 6 failed: `tests/home/loader.e2e.cjs:112,135,249,293,301,343` |
| N14 (new) | `_layouts/home.html:57` | The inline script leaves the page interactive under the loader: `page.inert = true` → `page.inert = !1` | loader-style + loader e2e | ✅ Killed, 3 failed: `tests/home/loader-style.e2e.cjs:45` (HOME-23 edge and the CSS-only window, the new check), `tests/home/loader.e2e.cjs:191` |

**Sensor depth**: expanded. 5 re-injections (N9, E7, E8, N10, N11) plus 3 new mutants on the release contract.
**Result**: 8/8 killed - PASS ✅. Cumulative over 4 iterations: 40/43, and every survivor from earlier iterations (E7, E9, N9) is now killed.

**Isolation**: `git status --porcelain` of the real tree was recorded before any work: 2 modified lessons files and 10 untracked entries, including this report. After the worktree was removed (`git worktree remove --force` and `prune`) it was diffed again and was identical (`ISOLATION_OK`). `git worktree list` shows only the main tree.

---

## Gate Check

- **Gate commands**: `npm run build && npm run test:unit`, then `npm test` twice (unit + `less:build` + Playwright on :4178, 1 worker). Port 4178 was confirmed free before the e2e runs.
- **Build + unit**: build exit 0. 183 passed, 0 failed, 0 skipped
- **Full run 1**: exit 0. Unit 183/183. E2E **579 passed**, 0 failed, 0 flaky (6.3 min)
- **Full run 2**: exit 0. Unit 183/183. E2E **579 passed**, 0 failed, 0 flaky (6.3 min)
- **Known flakes** (HOME-24/26/29/67/71): all passed first time in both runs, so no solo re-runs were needed
- **Changed tests alone**: HOME-23 edge and the PERF-35 CSS-only window passed 30/30 (`--repeat-each=15`, unmutated scratch)
- **Test count**: unit 150 before the feature → 183. E2E 574 → 579. Unchanged since iteration 2, and no tests were removed

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code / surgical | ✅ `f40a350` adds 5 lines to one shared test helper, plus one `tasks.md` note. No product code changed |
| Matches patterns | ✅ It reads the same release tuple that `tests/home/loader.e2e.cjs:245` uses for HOME-63 |
| Spec-anchored outcome | ✅ The "not yet released at 1.5 s" side is now asserted on release state, not only on visibility |
| Every test maps to a requirement | ✅ |
| Timing robustness | ✅ No new real-time margin was added. See watch item 2 for the one that remains |
| Documented guidelines | none - strong defaults applied |

---

## Fix Plans

None. No gaps remain.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| PERF-01..PERF-40 | Implementing | ✅ Verified |

---

## Iteration History

| Iteration | Range | Verdict | Sensor | Gaps |
| --------- | ----- | ------- | ------ | ---- |
| 1 | `8740dc5..a218807` | FAIL | 17/19 (E7, E9 survived) | PERF-02 home layout untested (E9); PERF-35 CSS delay masked (E7); stale traceability and undocumented deviations |
| 2 | `8740dc5..9c90de6` | FAIL | 11/11 (E7, E9 killed; N1-N8 killed) | Gate: HOME-23 edge failed in 1/2 full runs (DCL-relative timing) |
| 3 | `8740dc5..d3ec1c4` | FAIL | 4/5 (E7, E8, N10, N11 killed; N9 survived) | PERF-35: an early inline release is undetected, because `isVisible` ignores the opacity fade. The gate is clean (2 × 579/579) |
| 4 | `8740dc5..f40a350` | PASS | 8/8 (N9, E7, E8, N10, N11 killed; new N12-N14 killed) | None. The gate is clean (2 × 579/579) |

---

## Watch Items

1. **N11 window kill is timing-bound** (`tests/home/loader-style.e2e.cjs:40`): a 1.4 s CSS failsafe starts after the stylesheet loads, so it hides the loader at about boot + 1.7-1.8 s. The 1.5 s visibility check catches it only when CSS starts within about 100 ms of boot. It was killed in 7 of 8 isolated runs. In the real suite it is always killed by the `'2s'` pin (`:69`, `:105`), so this is not a gap.
2. **CSS-only hidden check slack** (`tests/home/loader-style.e2e.cjs:48` via `:79`): 500 ms between boot and the CSS animation start. Carried over from iteration 3. It never failed here (2 full runs and 15 repeats).
3. **HOME-67 click-skip race** (`tests/home/loader.e2e.cjs:324`) and **HOME-71** (`tests/home/phone-fit.e2e.cjs:11`): known flakes. Both passed in both runs this iteration.
4. **KB definition**: PERF-17 reads 200 KB as 200,000 B (`css.test.cjs:70`) and PERF-38 as 204,800 B (`guard.test.cjs:30`). Not a gap, because the stricter bound always applies.
5. **Sensor harness note**: Eleventy `--serve` in the worktree logs "Circular symlink detected" for the symlinked `node_modules`. It is noise: the server still serves, and the unmutated baseline passes.

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 40/40 ACs matched the spec outcome and are discriminated. 0 spec-precision gaps.
**Sensor**: 8 injected, 8 killed, 0 survived
**Gate**: unit 183/183. E2E 579/579 in both full runs, with 0 failures and 0 flakes

**What works**: every behavior in scope is discriminated, including both directions of the CSS failsafe, both directions of the inline release, and each effect of the release contract (`inert`, `aria-hidden`, `is-done`, `IDHomeReleased`).

**Issues found**: none.

**Lessons**: none new. This is a clean PASS. L-041, recorded in iteration 3 from N9, stays as it is.

**Next steps**: the feature can be merged. The Lighthouse goals in the spec still need the post-deploy measurement.
