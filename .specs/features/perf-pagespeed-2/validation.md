# Perf PageSpeed 2 Validation

## Validation: perf-pagespeed-2 - PASS ✅ (iteration 3, final)

**Result**: PASS. Commit `e68b512` closes F2: PS2-23 now pins the shuffle, keeps the last archive figure unrendered, asserts that its thumbnail has no `currentSrc`, and asserts that every viewer placeholder is a WebP. M15 and M15b are each killed 10/10, and HEAD passes PS2-23 20/20. The build gate is clean on the first run (205/205 unit, 587/587 e2e, no retries). O1 (HOME-71) reproduces, but it reproduces equally on `master` (`e406635`), so it is a pre-existing timing flake and is noted only.

**Date**: 2026-10-20
**Spec**: `.specs/features/perf-pagespeed-2/spec.md`
**Diff range**: `e469660..e68b512` (19 commits)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

### PS2-23 spec-anchored check (iteration 3)

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PS2-23 (spec.md:78) opening a photo in the `/photos/` viewer | no `photos.json` thumbnail JPEG is requested, including the placeholders of neighbours not yet scrolled into view | `tests/perf/images.e2e.cjs:142` - `expect(seen.filter(p => jpegs.has(p))).toEqual([])`, plus `:140` - `expect(src).toMatch(/\.webp$/)` for every `.pswp__img--placeholder` | ✅ PASS |
| Precondition: a neighbour is not yet scrolled into view | the opened photo's previous neighbour (the last archive figure) has no loaded thumbnail | `tests/perf/images.e2e.cjs:132` - `expect(await archive.last().locator('img').evaluate(img => img.currentSrc)).toBe('')`, set up by `:123` (`Math.random = () => 0`) and `:124-128` (`.photos-archive figure:last-of-type{display:none}`) | ✅ Asserted |

Notes:
- The test opens the photo through `window.openInsanePhoto` (`tests/perf/images.e2e.cjs:136`, asserting it returns `true`) and then checks `.pswp--open` (`:137`). This is acceptable. `openInsanePhoto` is the same `openPhoto` function that both click handlers call (`assets/js/photoswipe-impl.js:45-49`, `assets/js/photos.js:56-58`), and the placeholder logic under test (`assets/js/photoswipe-impl.js:19`) runs inside it whichever way it is entered. The click-to-open wiring is still covered by real clicks in `tests/photos/viewer.e2e.cjs:12,16,27,40`. The orchestrator reports that a scripted `link.click()` sometimes navigates to the full JPEG, and that this also happens on `master`. That race predates this feature and is out of its scope.
- Hiding the last figure is a test-only setup. It does not change what PS2-23 measures: `photoswipe-impl.js` still builds items from every `figure[data-photo-id]`, hidden ones included. The precondition assertion at `:132` makes the test fail loudly, rather than pass vacuously, if that setup ever stops working.
- The other 22 ACs and 3 edge cases are unchanged since iteration 1 (evidence below). `e68b512` touches only `tests/perf/images.e2e.cjs`.

### Gate (iteration 3)

- **Command**: `npm run images && npm run build && npm test`
- **Result**: exit 0 on the first run. Unit 205/205, e2e 587/587 (7.0 min). No retries, no flaky tests, nothing skipped.
- **Test count**: 205 unit + 587 e2e = 792, the same as iteration 2. None removed. `e68b512` makes the PS2-23 assertions stricter: it adds the precondition and the `.webp` checks, and the count check changes from `> 0` to `> 1`.

### O1: HOME-71 triage (iteration 3)

- **HEAD**: `npx playwright test tests/home/phone-fit.e2e.cjs -g HOME-71 --repeat-each=10` failed 2/70 (768 and 859 px). A second run also failed 2/70 (320 px: received 236; 768 px: received 402). The full gate run did not flake.
- **master `e406635`** (scratch worktree, same command run twice): failed 1/70 (859 px, 402), then 3/70 (768, 859 and 414 px; 402, 402 and 330). The flake rate on master matches HEAD.
- **What is off**: the art is too small, not doubled. A probe (25 repeats × 4 widths on HEAD) caught 5 bad samples. All 5 were `art.width = 18` (the box's own padding), cover `<img>` width 0, `complete === false`, with a correct column (for example 735 at 859 px). The lazy cover has no width yet at `load`, so the art box collapses. The received values are just `min(column, 420) - 18`.
- **Classification**: a pre-existing timing flake in the test (it measures at `load` before the lazy cover has a size). It is not caused by this feature. Noted only, not a gate failure. Suggested follow-up, outside this feature: wait for `[data-home-streaming-cover]` to be `complete`, or poll the width, in `tests/home/phone-fit.e2e.cjs:13-17`, and add HOME-71 to the known-flake list until then.

### Discrimination sensor (iteration 3)

Scratch: `git worktree add --detach` under the session scratchpad, with `node_modules` symlinked and `npm run images` + `npm run build` run there. `git stash` was never used. The Playwright config has a fixed port (4178) and `reuseExistingServer: false`, so every worktree run was done in sequence, after the real-tree gate had finished, with no other server on that port. The unmutated HEAD worktree passed PS2-23 20/20 first.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M15b | `assets/js/photoswipe-impl.js:19` | `msrc: image.currentSrc \|\| image.getAttribute('src')` (the pre-fix code) | ✅ Killed 10/10 (`--repeat-each=10`, all at `images.e2e.cjs:140`, the `.webp` match) |
| M15 | `assets/js/photoswipe-impl.js:19` | `msrc: image.getAttribute('src')` | ✅ Killed 10/10 (all at `images.e2e.cjs:140`) |
| M13 (spot check) | `index.html:157` | archive `sizes` → `100vw` | ✅ Killed (PS2-03 e2e fails) |
| M16 (spot check) | `_layouts/home.html:17` | `fetchpriority="high"` removed from the preload | ✅ Killed (`tests/perf` unit 1 fail) |

**Sensor outcome**: 4 injected, 4 killed, 0 survived.
**Isolation**: both worktrees (HEAD and master) were removed with `git worktree remove --force` and pruned. The real tree's `git status --porcelain` is identical to the baseline taken before any work.

### Ranked gaps (iteration 3)

None blocking. F2 is closed. O1 is a pre-existing test flake and is noted only (see above).

### Requirement traceability (iteration 3)

PS2-01..PS2-23 moved from `Implementing` to `Verified` in `spec.md`.

---

## Iteration 2 report (kept for history): verdict FAIL ❌

**Outcome (iteration 2)**: FAIL. The fix commit `82110f7` adds PS2-23 and its e2e test, and M15 (`msrc` = `getAttribute('src')`) is now killed. But M15b (`msrc` = `image.currentSrc || image.getAttribute('src')`, which is the exact pre-fix code) is killed only some of the time. In the first full-file run it survived, and over 20 runs it was killed 15 times. PS2-23 rests on an unchecked premise: that some neighbour of the opened photo still has no `currentSrc`. The lazy loader sometimes has already loaded that neighbour, and then the mutant passes. The gate passes (205/205 unit, 587/587 e2e) once one unlisted HOME-71 flake is retried.

**Date**: 2026-10-20
**Spec**: `.specs/features/perf-pagespeed-2/spec.md`
**Diff range**: `e469660..HEAD` (`e469660..82110f7`, 18 commits)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

### PS2-23 spec-anchored check

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PS2-23 opening a photo in the `/photos/` viewer | no `photos.json` thumbnail JPEG requested, including neighbour placeholders not yet scrolled into view | `tests/perf/images.e2e.cjs:127` - `expect(seen.filter(p => jpegs.has(p))).toEqual([])` after `.pswp--open` (`:124`) and a placeholder count > 0 (`:125`) | ⚠️ The assertion matches the outcome, but the test does not reliably set up the "not yet scrolled into view" case (see F2) |

Notes on the test:
- `tests/perf/images.e2e.cjs:123` clicks `page.locator('[data-photo-open]').first()`. That is the first slide of the highlights carousel, which `assets/js/photos.js:61-129` shuffles at random, not "the first archive photo" as the comment at `:122` says. So the photo that opens changes from run to run.
- Even with `.photos-archive [data-photo-open]`, M15b was killed in only 7 of 10 runs. A probe shows the last archive thumbnail (`photo-17`, `tn__MG_3610`) sometimes already has a `currentSrc` at `load` (1 of 4 probe runs). When it does, no JPEG is requested and the mutant passes.

The other 22 ACs and 3 edge cases are unchanged from iteration 1 (evidence below). The iteration-1 spec-precision gap on PS2-08 is closed by the new PS2-23 AC.

### Discrimination sensor (iteration 2)

Scratch: `git worktree add --detach` under the session scratchpad, with `node_modules` symlinked in and `npm run images` run there. The real tree was never mutated.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M15 | `assets/js/photoswipe-impl.js:19` | `msrc: image.getAttribute('src')` | ✅ Killed (PS2-23 fails, `images.e2e.cjs` 1 failed / 11 passed) |
| M15b | `assets/js/photoswipe-impl.js:19` | `msrc: image.currentSrc \|\| image.getAttribute('src')` (the pre-fix code) | ❌ Survived intermittently. First full-file run: 12/12 passed. Then 2 of 3 full-file runs failed, PS2-23 alone ×5 failed 4, PS2-23 alone ×10 failed 7. That is 15 kills in 20 runs → fix task F2 |
| M1 (spot check) | `lib/inline-css.js:12` | `url($1/assets/` → `url($1/` | ✅ Killed (`inline-css.test.cjs` 3 fail) |
| M3 (spot check) | `assets/js/home.js:180` | the swap sets the old single-file `.webp` srcset | ✅ Killed (`shuffle.e2e.cjs` 5 fail) |
| M5 (spot check) | `assets/js/home.js:147-148` | navbar init back to a synchronous `update()` | ✅ Killed (PS2-21) |

**Sensor outcome**: 5 injected, 4 killed, 1 survived (M15b, intermittent).
**Isolation**: the worktree was removed with `git worktree remove --force` and pruned. The real tree's `git status --porcelain` is identical to the pre-sensor baseline.

### Gate (iteration 2)

- **Command**: `npm run images && npm run build && npm test`
- **First run**: exit 1. Unit 205/205. E2E 586 passed, 1 failed: `tests/home/phone-fit.e2e.cjs:11` HOME-71 at 375 px (`|art.width - column.width|` = 291, limit 1).
- **Retry**: `npx playwright test --retries=2` gave exit 0, 586 passed + 1 flaky (HOME-71 at 320 px, received 236, passed on retry #1). So 587/587 e2e pass.
- HOME-71 is **not** on the known-flake list. It passed 5 of 5 when `phone-fit.e2e.cjs` ran alone (`--repeat-each=5`), and it did not flake in iteration 1. Both failures equal `100vw - 84px`, which is the streaming cover's new `sizes` value at those widths (`index.html:76`). This fits the cover box collapsing to its padding while the image has no width yet, during the swap. It is logged as an observation (O1), not a gate failure.
- **Test count**: 205 unit + 587 e2e = 792 (+1 from PS2-23 compared with iteration 1). None removed, none skipped.

### Ranked gaps (iteration 2)

1. **F2 (Major): PS2-23 does not reliably kill the pre-fix code (M15b)**. `tests/perf/images.e2e.cjs:118-128`.
   - **Root cause**: the test assumes a neighbour of the opened photo has no `currentSrc`, but it neither picks a fixed photo nor asserts that. It clicks the randomised highlight slide (`:123`), and lazy loading sometimes loads the last archive thumbnail first.
   - **Fix task**: open a photo from `.photos-archive`. Before clicking, assert the precondition that the chosen figure's neighbour `<img>` has `currentSrc === ''`. You can pick a figure whose neighbour meets this, or use a viewport small enough that it is guaranteed. After opening, also assert that every `.pswp__img--placeholder` `src` ends in `.webp`.
   - **Verify**: M15b fails in 10 of 10 runs (`--repeat-each=10`), and HEAD passes in 10 of 10.
2. **O1 (Minor, triage)**: a new HOME-71 phone-fit flake under full-suite load. The cover width is measured before the image has a width (see Gate). Decide whether to wait for the cover to be `complete` in the test, or whether the `sizes` swap needs a fix. Then either fix it or add it to the known-flake list.

### Requirement traceability (iteration 2)

No change at the time. The PS2 rows stayed `Implementing` until F2 is fixed and re-verified (iteration 3 of 3).

---

# Iteration 1 report (kept for history)

## Iteration 1 verdict: FAIL ❌

**Outcome (iteration 1)**: FAIL. The 22 ACs and 3 edge cases all have evidence, and the build gate is clean: 205/205 unit and 586/586 e2e, with no flakes. 17 mutants were injected and 16 were killed. One survived: the out-of-plan change in `assets/js/photoswipe-impl.js:17` (the PhotoSwipe placeholder `msrc` taken from `currentSrc`) has no test. Reverting it passes every suite, yet opening the viewer then requests the `*_tn.jpg` thumbnails again (confirmed with a probe). The validate checklist does not let a feature be marked done while a mutant survives.

**Date**: 2026-10-20
**Spec**: `.specs/features/perf-pagespeed-2/spec.md`
**Diff range**: `e469660..120c70f` on `feature/perf-pagespeed-2` (17 commits, `901ed9d` to `120c70f`)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1-T3 (image variants) | ✅ Done | `901ed9d`, `cfe4cbc`, `18b8d3f` |
| T4-T6 (cover srcset) | ✅ Done | `6b550dd`, `36f669e`, `048037e` |
| T7-T12 (thumbnail / logo markup, mask) | ✅ Done | `3400c2f`, `f781ab5`, `f15a6b3`, `ed7e8a3`, `b3da3c2`, `0857f29` |
| T13-T16 (inline CSS, preloads, navbar) | ✅ Done | `b0f12b2`, `e9ad95b`, `1e2bd2e`, `8225466` |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| PS2-01 cover variants | `<c>-160.webp` 160 px, `<c>-320.webp` 320 px, `<c>.webp` 600 px for every home cover | `tests/perf/images.test.cjs:43` - `files.some(out => out.file === file && out.width === …)`; `:47` - `assert.equal(meta.width, width)` over `[-160,160],[-320,320],['',600]` | ✅ PASS |
| PS2-02 cover `<source>` srcset + sizes | three files with `160w 320w 600w`, non-empty `sizes`, on the card, STREAMING and archive | `tests/perf/images.test.cjs:212` - `sources.length === 2 + albums.length`; `:215` - `deepEqual(widths, ['160w','320w','600w'])`; `:217` - URL order; `:219` - `sizes.trim() !== ''`; `tests/home/home-core.test.cjs:206` - exact `coverSrcset('x.jpg')` string | ✅ PASS |
| PS2-03 no 600 w at 412×915 DPR 1.75 | card and archive covers never fetch the 600 w file | `tests/perf/images.e2e.cjs:87` - `currentSrc toMatch(/-(160\|320)\.webp$/)`; `:92` - `expect(seen).not.toContain(<600w url>)` | ✅ PASS |
| PS2-04 streaming swap srcset | swapped `<source>` srcset = the new cover's three widths | `tests/home/shuffle.e2e.cjs:35` - `toHaveAttribute('srcset', core.coverSrcset(single.cover))` plus a literal-string check after it | ✅ PASS |
| PS2-05 missing / wrong-width variant fails | the unit test fails | `tests/perf/images.test.cjs:43-47` (manifest entry, `existsSync`, `meta.width`); mutant M14 (320 dropped) killed | ✅ PASS |
| PS2-06 thumbnail WebP | `tn_X.webp` with the JPEG's width and height for every `photos.json` thumbnail | `tests/perf/images.test.cjs:63` - `deepEqual([meta.width, meta.height], [jpeg.width, jpeg.height])` | ✅ PASS |
| PS2-07 thumbnail `<picture>` on `/` and `/photos/` | `<source type=image/webp srcset=tn.webp>`, JPEG kept as the `<img src>` | `tests/perf/images.test.cjs:260` - `source.srcset === img.src.replace('.jpg','.webp')`; `:268`, `:275` - every highlight/grid thumbnail is enumerated | ✅ PASS |
| PS2-08 `/photos/` fetches `.webp`, no `tn_*.jpg` | WebP `currentSrc`; no thumbnail JPEG requested on load | `tests/perf/images.e2e.cjs:112` - `currentSrc === src.replace('.jpg','.webp')`; `:115` - `seen.filter(jpegs).toEqual([])` | ✅ PASS (see the ⚠️ viewer note below) |
| PS2-09 logo WebP | `logo_loading.webp` 300, `logo_horizontal-300/600.webp`, alpha kept | `tests/perf/images.test.cjs:74` - `meta.width`; `:75` - `meta.hasAlpha === true` | ✅ PASS |
| PS2-10 loader + hero-title `<picture>` | `logo_loading.webp` source, PNG `<img src>` | `tests/perf/images.test.cjs:293`, `:299` - `assertLoadingLogoPicture` (exact `srcset` and `src`, `:285-286`) | ✅ PASS |
| PS2-11 footer logo `<picture>` on every layout page | WebP 300w/600w `srcset`, `sizes`, PNG `src` | `tests/perf/images.test.cjs:311` - `deepEqual(srcset, [[…-300.webp,'300w'],[…-600.webp,'600w']])`; `:313` - `sizes === '(max-width: 768px) 150px, 30vw'`; `tests/perf/images.e2e.cjs:131` - same box height as before | ✅ PASS |
| PS2-12 mask `image-set()` with WebP first | every `logo_loading` mask: plain PNG `url()`, then `image-set(webp, png)` | `tests/perf/images.test.cjs:334` - `masks[0]` plain PNG; `:335` - `masks[1]` `image-set(webp … , png …)` for both `mask` and `-webkit-mask` | ✅ PASS |
| PS2-13 home requests no PNG logo | neither `logo_loading.png` nor `logo_horizontal.png` | `tests/perf/images.e2e.cjs:143-144` - `expect(seen).not.toContain(...)` after the WebP files were seen | ✅ PASS |
| PS2-14 inline `home.min.css` | full emitted CSS in a `<head><style>`; no link to `/assets/css/home.min.css` | `tests/perf/css.test.cjs:115` - `!html.includes('/assets/css/home.min.css')`; `:118` - `headStyles(html).some(css => css === expected)` | ✅ PASS |
| PS2-15 no `url(../` | rewritten to the same `/assets/…` file | `tests/perf/css.test.cjs:124` - `!/url\(\s*["']?\.\.\//`; `tests/perf/inline-css.test.cjs:20` - exact output for all three quote forms; `:30` - absolute/`data:` untouched | ✅ PASS |
| PS2-16 other bundles still linked | `<link rel="stylesheet">` for each other page bundle | `tests/perf/css.test.cjs:138` - `stylesheets(html).includes(\`/assets/css/${id}.min.css\`)` | ✅ PASS |
| PS2-17 font preloads on `/` | three woff2 files, `as=font`, `type=font/woff2`, `crossorigin` | `tests/perf/fonts.test.cjs:102-104` - `as`, `type`, `crossorigin !== null` per font | ✅ PASS |
| PS2-18 no font preload elsewhere | other pages do not preload the three fonts | `tests/perf/fonts.test.cjs:113` - `!fontPreloads(html).includes(href)` | ✅ PASS |
| PS2-19 hero `fetchpriority` | `fetchpriority="high"` | `tests/perf/fonts.test.cjs:120` - `assert.equal(attr(hero[0], 'fetchpriority'), 'high')` | ✅ PASS |
| PS2-20 missing bundle fails the build | build fails, error names the file | `tests/perf/inline-css.test.cjs:36` - `err.message.includes('assets/css/home.min.css')`. Checked by hand: with the file removed, `npx @11ty/eleventy` exited 1 with `inline-css: assets/css/home.min.css not found` | ✅ PASS (the unit test covers the helper only; the build behaviour was checked by hand) |
| PS2-21 scroll read in rAF | no synchronous offset read during init; read inside a frame | `tests/home/navbar.e2e.cjs:72` - `reads.filter(r => r.duringHomeInit).toEqual([])`; `:73` - `some(r => r.fromHome && r.inFrame)` | ✅ PASS |
| PS2-22 `is-solid` by the first frame | `nav.navbar` has `is-solid` | `tests/home/navbar.e2e.cjs:90` - `__solidAfterFirstFrame` `toBe(true)` | ✅ PASS |

**Status**: ✅ All 22 ACs covered and matched to the spec outcome. ⚠️ 1 spec-precision gap: PS2-08 covers page load only. The spec says nothing about opening the PhotoSwipe viewer, which is where the untested `photoswipe-impl.js` change matters.

---

## Discrimination Sensor

Scratch: `git worktree add --detach` under the session scratchpad, with `node_modules` symlinked in and `docs/` created by the build. Each mutant: apply it, run `npm run build`, run the targeted tests, then restore the file.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `lib/inline-css.js:12` | `url($1/assets/` → `url($1/` (wrong rewrite) | ✅ Killed (inline-css + css: 5 fail) |
| M2 | `assets/js/home-core.js:68` | `-160.webp 160w` → `320w` | ✅ Killed (home-core + PS2-02) |
| M3 | `assets/js/home.js:180` | swap sets the old single-file srcset | ✅ Killed (shuffle.e2e 5 fail) |
| M4 | `assets/js/photos.js:126` | highlight-button `<source>` srcset sync removed | ✅ Killed (PS2-08) |
| M5 | `assets/js/home.js:147-148` | navbar init back to a synchronous `update()` | ✅ Killed (PS2-21) |
| M6 | `assets/js/home.js:147-148` | navbar initial check removed entirely | ✅ Killed (PS2-22) |
| M8 | `_layouts/home.html:21` | `crossorigin` dropped from the rajdhani-700 preload | ✅ Killed (PS2-17) |
| M9 | `less/home.less:13` | `image-set()` order PNG first | ✅ Killed (PS2-12) |
| M10 | `_includes/footer/copyright.liquid:1` | footer `sizes` → `100vw` | ✅ Killed (PS2-11 unit) |
| M11 | `less/footer.less:72` | `aspect-ratio` removed | ✅ Killed (PS2-11 e2e at 412 px) |
| M12 | `_includes/head/styles.liquid:6` | home links `home.min.css` instead of inlining | ✅ Killed (PS2-14 / PERF-16) |
| M13 | `index.html:157` | archive `sizes` → `100vw` | ✅ Killed (PS2-03) |
| M14 | `scripts/images.cjs:22` | `COVER_WIDTHS` drops 320 | ✅ Killed (PS2-01/05) |
| M15 | `assets/js/photoswipe-impl.js:17` | `msrc` back to `image.getAttribute('src')` | ❌ Survived (all 205 unit and all 30 `tests/photos` e2e pass; a probe shows that opening the viewer then requests `promo2017/{1,2,3}_tn.jpg`) → fix task F1 |
| M16 | `_layouts/home.html:17` | `fetchpriority="high"` removed | ✅ Killed (PS2-19) |
| M17 | `_includes/header/menu.liquid:16` | header logo `<picture>` reverted to a plain PNG | ✅ Killed (PS2-13) |

(M7 was a no-op placeholder and was not run.)

**Sensor depth**: expanded (17 manual behaviour-level mutants across every risky area)
**Sensor outcome**: 16/17 killed, 1 survived

Isolation: the worktree was removed with `git worktree remove --force` and pruned. The real tree's `git status --porcelain` matches the pre-sensor baseline (only the pre-existing untracked agent folders and `skills-lock.json`).

---

## Out-of-plan Changes Review

| Change | Judgement |
| ------ | --------- |
| `assets/js/photos.js:125-126` (copies the archive `<source>` srcset onto the re-shuffled highlight buttons) | ✅ Required. Without it, a shuffled button's `<source>` would keep showing the old photo. Covered by PS2-08 (`Math.random = () => 0`, `tests/perf/images.e2e.cjs:106`, `:112`); M4 was killed |
| `assets/js/photoswipe-impl.js:17` (`msrc` from `currentSrc`) | ⚠️ Correct and useful: the viewer placeholder reuses the WebP that is already loaded and does not fetch the JPEG thumbnail. **No test** covers it, and M15 survived. Gap F1 |
| `less/footer.less:71-72` (`box-sizing: content-box; aspect-ratio: 600 / 95`) | ✅ Keeps the logo box unchanged, because the 300 w WebP is 300×48 and not 300×47.5 (goal: no visual change). Pinned by `tests/perf/images.e2e.cjs:131` (box at 412/1280 px); M11 was killed |
| `_includes/header/menu.liquid:16` (WebP `<source>` on the header logo, every page) | ✅ Needed for PS2-13, because the header logo is also on `/`. The single 600 w file with no `sizes` is valid. PERF-30 (`tests/perf/images.test.cjs:241`) still pins the 600×95 lazy `<img>`; M17 was killed |
| `tests/perf/css.test.cjs` PERF-15/16 | ✅ Follows from the spec (PS2-14 says `/` SHALL NOT link its bundle). The home exclusion is replaced by the stricter PS2-14 check |
| `tests/perf/fonts.test.cjs` PERF-24 | ✅ Follows from the spec (PS2-17). The three fonts are allowed on `/` only; other pages still get the strict `deepEqual`, and PS2-18 adds a negative check |
| `tests/home/layout-template.test.cjs:38` (HOME-68 harness) | ✅ Harness only: it registers the `inlineCss` tag that `.eleventy.js` provides. No assertion changed |
| `tests/perf/images.test.cjs:198` PERF-29 | ✅ The `srcset` equality became "ends with `<cover>.webp 600w`". The dropped `existsSync` is now covered for every candidate by PS2-02 (`:218`). Not weaker |
| `tests/perf/images.e2e.cjs:66`, `:71` PERF-29 | ✅ The hero check is now more exact (`-160.webp` at 1280 px). The streaming check accepts any of the three widths, which is correct because the drawn width depends on the viewport. The no-JPEG assertion is kept |

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ (the menu-logo change is needed for PS2-13) |
| Matches patterns | ✅ (UMD helper reused as an Eleventy filter, the `<picture>` shape reused) |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met | ⚠️ `photoswipe-impl.js` browser-JS change has no e2e |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: `tasks.md` Test Coverage Matrix, `playwright.config.cjs` | ✅ |

---

## Edge Cases

- [x] A cover without `-160`/`-320` makes the images unit test fail: `tests/perf/images.test.cjs:43-47`, M14 killed
- [x] No WebP support falls back to the JPEG/PNG `<img src>`: the `<picture>` structure is asserted with the fallback `src` (`tests/perf/images.test.cjs:260`, `:286`, `:314`)
- [x] No `image-set()` in `mask` keeps the PNG mask: the plain `url()` is asserted before the `image-set()` (`tests/perf/images.test.cjs:334`)

---

## Gate Check

- **Gate command**: `npm run images && npm run build && npm test`
- **`npm run images`**: no tracked file changed (porcelain identical before and after)
- **Gate outcome**: 205/205 unit and 586/586 e2e passed, 0 failed, 0 skipped, 0 flaky (no retries needed)
- **Test count before feature**: 183 unit + 579 e2e = 762 (from the perf-pagespeed report; consistent with this diff, which adds 22 unit and 7 e2e test cases)
- **Test count after feature**: 205 unit + 586 e2e = 791
- **Delta**: +29 tests, none removed
- **Skipped tests**: none
- **Failures**: none

---

## Fix Plans

### Fix F1: PhotoSwipe placeholder has no test (M15 survived)

- **Root cause**: `assets/js/photoswipe-impl.js:17` was changed so that the viewer's `msrc` placeholder uses `image.currentSrc`, the WebP already shown. No test exercises the viewer's network requests, so reverting the change goes unnoticed and the `*_tn.jpg` requests come back when the viewer opens.
- **Fix task**: add an e2e test (for example in `tests/perf/images.e2e.cjs` next to PS2-08, or in `tests/photos/viewer.e2e.cjs`). Load `/photos/`, wait for an archive thumbnail to be `complete`, click it, wait for `.pswp--open`, and assert that no `photos.json` thumbnail JPEG was requested. Optionally also assert that the `.pswp__img--placeholder` `src` ends in `.webp`.
- **Verify**: the test passes on HEAD and fails with `msrc: image.getAttribute('src')`.
- **Priority**: Minor. The behaviour is correct today; only the regression guard is missing.

---

## Requirement Traceability Update

No change. The feature is not done until F1 is fixed and re-verified. The spec rows stay `Implementing`.

---

## Summary

**Overall**: ⚠️ Issues (one test gap)

**Spec-anchored check**: 22/22 ACs matched to the spec outcome; 1 spec-precision gap (PS2-08 does not cover opening the viewer)
**Sensor**: 16/17 mutations killed
**Gate**: 791 passed, 0 failed

**What works**: all of P1 and P2 (cover variants and srcset, WebP thumbnails and logos, the `image-set()` mask, the inlined home CSS, font preloads, `fetchpriority`, the rAF navbar init).

**Issues found**: M15 survived, the untested PhotoSwipe `msrc` change. Fix with F1.

**Next steps**: run F1 (test-only), then re-verify.
