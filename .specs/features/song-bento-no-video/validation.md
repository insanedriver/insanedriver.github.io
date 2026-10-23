# Song Bento Without Video Validation

## Validation: song-bento-no-video - PASS ✅ (iteration 2 of max 3, final)

**Result**: PASS. Fix commit `699ede0` changes only tests. It closes all three gaps from iteration 1. In a fresh scratch worktree at HEAD, the two mutants that survived iteration 1 (M9, M10) are now killed. The real-tree gate is green: unit 218/218, e2e 315/315.

**Date**: 2026-10-23
**Spec**: `.specs/features/song-bento-no-video/spec.md` (NOVID-01..23)
**Diff range**: `ef05bd0..HEAD` (`ef05bd0..699ede0`, 7 commits, `23894dc..699ede0`)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

### Fix commit reviewed

| Commit | Change | Judgement |
| ------ | ------ | --------- |
| `699ede0` (an amend of `826f109` with the same tree, `git diff --quiet 826f109 699ede0`) | `tests/discography/song-bento.e2e.cjs` only, +17/-2. `:216` drops the `i` flag from the LISTEN NOW text regex. `:414-432` (NOVID-06/15, Age of Lies at 991/768/375) adds the Panel B primary-column check: 2 distinct `left` values, widths within 1px. `:435-443` (new, Faceless Demons at 1280/375) checks that `overflowY` is `visible` and `scrollHeight === clientHeight` for `.song-bento-panel--c .cyber-panel-body` and `.song-bento-panel--c [data-song-lyrics]` | ✅ Test-only. No source file changed since `66d2c29`. No assertion weakened: the regex is stricter. +2 e2e cases |

No source file (`lib/`, `_includes/`, `discography/`, `less/`, `assets/`) changed since iteration 1. The iteration-1 evidence for the other 20 ACs still stands. Its line numbers refer to `66d2c29`, and tests after `:413` moved down by 6 to 17 lines.

### Re-checked ACs (iteration 2)

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| NOVID-12 | one `[data-song-listen]` with text `Listen now`, Spotify icon, href = Spotify URL, `_blank`, `noopener`, `data-disc-link="spotify"`, `data-disc-slug` = album slug | `tests/discography/song-bento.e2e.cjs:213-223` on all 10 lyrics songs. The text check is now case-sensitive, `toHaveText(/^\s*Listen now\s*$/)` (`:216`). Unit `tests/seo/catalog.test.cjs:342-354` | ✅ PASS (gap 3 closed; M2, M3 killed in iteration 1) |
| NOVID-15 | Panel B satisfies BENTO-18..22 and BENTO-24 | BENTO-18..22: `tests/discography/song-bento.e2e.cjs:57-75` (`expectUplink`) on 10 songs; `tests/seo/song.e2e.cjs:190-205`. BENTO-24 on a lyrics song: `tests/discography/song-bento.e2e.cjs:426-431`, `new Set(cols.map(c => c.left)).size` `toBe(2)` and the width spread `toBeLessThanOrEqual(1)` at 991, 768 and 375 | ✅ PASS (M9 killed) |
| NOVID-16 | Panel C satisfies BENTO-25..28 and BENTO-30 | BENTO-25..28 as in iteration 1. BENTO-30 on a lyrics song: `tests/discography/song-bento.e2e.cjs:435-443`, `overflowY` `toBe('visible')` and `scrollHeight` `toBe(clientHeight)` for both selectors at 1280 and 375 | ✅ PASS (M10 killed) |

**Status**: ✅ 23/23 ACs covered, each with a `file:line` assertion on the outcome the spec defines. No spec-precision gaps are open.

### Payload / conjunction rule (iteration 2)

This is unchanged from iteration 1 and still holds. The LISTEN NOW `release_click` is matched with `toEqual` on the filtered `dataLayer` (`tests/discography/song-bento.e2e.cjs` NOVID-08 test), so every field and the count of exactly one are pinned. `layout` and `listenUrl` are unit-tested by value. ✅

### Gate (iteration 2)

- **Command**: `npm run build && npm run test:unit && npx playwright test tests/seo tests/discography` (real tree at `699ede0`)
- **Gate result**: exit 0. Unit 218/218, e2e 315/315 (3.6 min). 0 failed, 0 skipped, 0 flaky.
- **Test count**: 218 unit + 315 e2e, up from 218 + 313 in iteration 1 (+2, the BENTO-30 lyrics test at two widths) and from 214 + 275 before the feature. None removed or weakened.

### Discrimination sensor (iteration 2)

Scratch: a fresh `git worktree add --detach` at HEAD (`699ede0`) under the session scratchpad, with `node_modules` symlinked. Each mutant ran `npm run build`, then unit, then `npx playwright test tests/discography/song-bento.e2e.cjs tests/seo/song.e2e.cjs` (130 tests). `git stash` was never used. The real-tree gate finished before the mutants ran.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M9 (re-run) | `less/song-bento.less:68` (+rule) | lyrics layout only: Panel B primaries in 1 column below 992px | ✅ Killed. 3 failed: NOVID-06/15 at 991, 768 and 375 (`tests/discography/song-bento.e2e.cjs:414`) |
| M10 (re-run) | `less/song-bento.less:68` (+rule) | lyrics layout only: Panel C body `max-height: 300px; overflow-y: hidden` | ✅ Killed. 2 failed: NOVID-16 → BENTO-30 at 1280 and 375 (`tests/discography/song-bento.e2e.cjs:435`) |

Iteration 1's M1-M8 were killed. No source or tested behaviour has changed since, so they were not re-run. M11 (the NOVID-13 template guard) stays equivalent on current data, because every song has a Spotify URL. That accepted residual risk is recorded in the spec's Assumptions.

**Sensor outcome (cumulative)**: 11 injected, 10 killed, 0 survived, 1 equivalent.
**Isolation**: the worktree was removed with `git worktree remove --force` and pruned; `git worktree list` shows only the main tree at `699ede0`. The real tree's `git status --porcelain` matched the iteration-2 baseline both after the gate and after the sensor. That baseline is ` M .specs/LESSONS.md`, ` M .specs/lessons.json` and `?? .specs/features/song-bento-no-video/validation.md`, plus the pre-existing untracked tool folders and `skills-lock.json`.

### Requirement Traceability (iteration 2)

NOVID-01..23 are all ✅ Verified.

### Lessons (iteration 2)

Iteration 2 found no new signal: nothing survived, there are no open gaps and no spec deviations, so nothing new was recorded. The iteration-1 lessons stand. L-037 has been promoted to confirmed (shared partial: test each layout), and L-048 is a candidate (map every AC that another AC imports by reference to a test in the new context).

---

## Iteration 1 history (superseded)


### Iteration 1 outcome: not ready, two gaps found (superseded by iteration 2)

**Iteration 1 outcome**: not ready. The build and tests are green, and 8 of 11 mutants were killed and 1 is equivalent on today's data. Two probe mutants survived. Both are regressions scoped to the lyrics layout that break clauses NOVID-15 and NOVID-16 bring in by reference: BENTO-24 (2-column primaries below 992px) and BENTO-30 (Panel C not clipped). On the lyrics layout those clauses have no test. The test in `tests/discography/song-bento.e2e.cjs` that covers each of them runs only on Keep Away (a video song).

**Date**: 2026-10-23
**Spec**: `.specs/features/song-bento-no-video/spec.md` (NOVID-01..23)
**Diff range**: `ef05bd0..66d2c29` (6 commits, `23894dc..66d2c29`)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

---

### Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | `songLayout`, `listenUrl` in `lib/catalog.js:42-53`, set in `build()` `:138-139` |
| T2 | ✅ Done | Partials extracted. The sticky rule is scoped per layout at `less/song-bento.less:49-50` |
| T3 | ✅ Done | `_includes/discography/song-bento-lyrics.liquid`; `discography/song.liquid:16,22,25-28` switch on `song.layout`; BENTO-02/08 amended |
| T4 | ✅ Done | LISTEN NOW `_includes/discography/song-bento-meta.liquid:27-28` |
| T5 | ✅ Done | `less/song-bento.less:24-31,59-69`; the rebuilt `assets/css/discography.min.css` is committed |
| T6 | ✅ Done (tests only) | Sound. The HUD rules are scoped to `.song-page--bento`, which `song.liquid:22` now sets for every non-stack layout. LISTEN NOW carries the `song-bento-quickplay` class, so it shares that style by construction. NOVID-14/21/22 pass on the built site, so no style change was needed |

---

### Spec-Anchored Acceptance Criteria

All e2e paths below are `tests/discography/song-bento.e2e.cjs` unless they name another file. "10 songs" means the `LYRICS_SONGS` set (`:21`): sung songs without a video, derived from the data. The unit test `tests/seo/catalog.test.cjs:330` pins that set to the 10 slugs the spec names.

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| NOVID-01 | one `[data-song-bento]`, tabs C, B, D in DOM order | `:167-168` `toHaveCount(1)`, tabs `toEqual(LYRICS_TABS)` on 10 songs; unit `catalog.test.cjs:322-340` (each `songLayout` branch alone, L-024) | ✅ PASS (M1, M4 killed) |
| NOVID-02 | no PANEL A tab, no `#song-video`, no `[data-song-quickplay]` | `:172-174` three `toHaveCount(0)` on 10 songs | ✅ PASS |
| NOVID-03 | instrumental with no video: no bento, no meta, h1 without badge | `:149-157` on both instrumentals, `toHaveCount(0)` ×2, `classList.contains('song-title-badge')` `toBe(false)`; `:279-281` classes `toEqual(BASE)` | ✅ PASS (M1 killed) |
| NOVID-04 | ≥992: C, B on one row, C left, C/(C+B) ∈ [0.64, 0.69] | `:380-385` at 1280 and 992 on Faceless Demons and Age of Lies | ✅ PASS (M6 killed) |
| NOVID-05 | D below C/B; left within ±2px of C, right within ±2px of B | `:387-389` | ✅ PASS |
| NOVID-06 | <992: C, B, D stacked full width | `:413-425` at 991/768/375: left and width within ±1px of the grid, `b.top ≥ c.bottom`, `d.top ≥ b.bottom` | ✅ PASS |
| NOVID-07 | ≥992: B content `sticky`, `top: 20px`; D `static` | `:391-392` `toEqual(['sticky','20px'])`, D `'static'`; video side `:335` | ✅ PASS (M7 killed) |
| NOVID-08 | click → exactly one `{event:'release_click', platform:'spotify', release:'<album slug>'}` | `:771-780`: navigation blocked, filtered `dataLayer` `toEqual([{…'silicon-fortress'}])` (exact count and every field) | ✅ PASS (M3 killed) |
| NOVID-09 | `scrollWidth === clientWidth` at 375/768/992/1280 | `:445-453` on all 22 `SONGS` | ✅ PASS |
| NOVID-10 | meta bar = BENTO-07 content | `:177-186` cover src, `Track NN // YYYY`, `Runtime M:SS`, album link text, `Recommended intel`, exact fans-of on 10 songs | ✅ PASS |
| NOVID-11 | h1 text = title, `song-title-badge`, `insaneFont` | `:189-190` `toEqual({text, badge:true})`; `:276-278`; font `:620` `toBe('insaneFont')` | ✅ PASS |
| NOVID-12 | one `[data-song-listen]`, text `Listen now`, Spotify icon, href = Spotify URL, `_blank`, `noopener`, `data-disc-link="spotify"`, `data-disc-slug` = album slug | `:213-223` on 10 songs; unit `catalog.test.cjs:342-354` | ✅ PASS (M2, M3 killed). Minor: the text is matched `/^\s*Listen now\s*$/i` (case-insensitive), which is looser than the spec's exact text (gap 3) |
| NOVID-13 | no Spotify URL → no `[data-song-listen]` | unit `catalog.test.cjs:345-347` `listenUrl([apple])` and `listenUrl([])` `toBe(null)`; template guard `_includes/discography/song-bento-meta.liquid:27` `{% elsif song.listenUrl %}` (by inspection) | ✅ PASS (data side). M11, which removes the guard, survives but is equivalent: every song has Spotify today, so no page can show the difference. This is accepted as the spec's Assumptions row states it. Residual risk is noted below |
| NOVID-14 | LISTEN NOW background, color, clip-path = QUICK PLAY's | `:599-611` `toEqual(quick)` plus `quick[0]` `toBe('rgb(0, 243, 255)')` and clip-path `not 'none'` (non-vacuous) | ✅ PASS |
| NOVID-15 | Panel B satisfies BENTO-18..22 **and BENTO-24** | BENTO-18..22: `:57-75` `expectUplink` on 10 songs (keys and order, URLs, primary/compact, sub labels, `_blank`/`noopener`, slug, status line); `tests/seo/song.e2e.cjs:190-205`. BENTO-21's click is covered on a lyrics page by NOVID-08 (same delegated handler and `[data-disc]` shell). **BENTO-24: no test on a lyrics song.** `:340-354` runs on `KEEP_AWAY` only, and `:413-425` (NOVID-06) checks the panel stack, not the primary columns | ❌ GAP: BENTO-24 clause (M9 survived) |
| NOVID-16 | Panel C satisfies BENTO-25..28 **and BENTO-30** | BENTO-25: `tests/seo/song.e2e.cjs:146-177` on every page plus `:199` lyrics inside C; BENTO-26 `:200-202`; BENTO-27 `:233-239` (Faceless) and `:295-299` (Tears of Blood, no labels); BENTO-28 `:638-653`. **BENTO-30: no test on a lyrics song.** `:456-468` runs on `KEEP_AWAY` only | ❌ GAP: BENTO-30 clause (M10 survived) |
| NOVID-17 | D holds About and "Also" (SONG-06/08 content and conditions) and `CATALOG: {CODE}-TRACK-NN // ALL EDITIONS LISTED` | `:205-208` About in D, Also in D count = page count, CATALOG exact; content `tests/seo/song.e2e.cjs:179-186,212-226` | ✅ PASS |
| NOVID-18 | ≥992 split song: About left of Also on one row, ratio ∈ [0.64, 0.69] | `:394-400` (Age of Lies, whose fixture is checked at `:406-411`) | ✅ PASS (M5 killed) |
| NOVID-19 | no "Also": About p width ≤ 70 × `0` glyph | `:428-443` at 1280 and 375, measured with a 70-zero probe in the paragraph's font | ✅ PASS (M8 killed at 1280) |
| NOVID-20 | ≥992: CATALOG below About and Also | `:402` `catalog.top ≥ max(about.bottom, also.bottom)` | ✅ PASS |
| NOVID-21 | BENTO-36/37/39/40/41 on the lyrics layout | `:613-636` (radius 0 in bento, meta, `.song-nav`; SiliconFont ×3 tabs; panel bg `rgba(10,10,10,0.85)` + two 25px gradients; frost text) on Faceless and Age of Lies; `:667-685` reduced motion → `animationName` none | ✅ PASS |
| NOVID-22 | focus → `3px solid rgb(252,238,10)`, offset 4px on LISTEN NOW, Panel B anchor, `.song-nav` link | `:655-665` `:focus-visible` true plus exact outline tuple on 4 selectors | ✅ PASS |
| NOVID-23 | no JS: Panel B and LISTEN NOW anchors stay plain working links | inside `test.describe('without JavaScript')` (`:84-301`): `:219-221` href/target/rel; Panel B `:192` via `expectUplink` | ✅ PASS |

**BENTO-02 / BENTO-08 narrowing**: the text in `.specs/features/song-video-bento/spec.md:68,98` now matches the tests. BENTO-02 is checked by `:149-157`, which runs over `INSTRUMENTALS` only, and BENTO-08 by `:262-285`, which expects lyrics songs to carry the badge and instrumentals not to. They agree, following L-004.

**Status**: ❌ 21/23 ACs fully covered. NOVID-15 and NOVID-16 each have one referenced clause with no evidence on the in-scope songs. No spec-precision gaps are open.

---

### Payload / Conjunction Rule

- `release_click` from LISTEN NOW: `event`, `platform` and `release` are asserted by value with `toEqual` on the filtered array, which also pins the count ("exactly one"). See `:777-779`. ✅
- `layout`: every branch has a unit test with each condition true alone (`catalog.test.cjs:322-328`), and the built set is pinned by exact slug lists (`:333-339`). ✅
- `listenUrl`: the value is asserted for a Spotify entry in non-first position, for no Spotify entry and for an empty list (`:342-347`), and on built data against the exact track URL (`:350-354`). ✅
- NOVID-12's conjunction (text, icon, href, target, rel, two data attributes) is asserted conjunct by conjunct (`:213-223`). ✅

---

### Discrimination Sensor

Scratch: `git worktree add --detach` at `66d2c29` under the session scratchpad, with `node_modules` symlinked. Each mutant ran `npm run build` (`less:build` plus Eleventy), then `node --test tests/*/*.test.cjs`, then `npx playwright test tests/discography/song-bento.e2e.cjs tests/seo/song.e2e.cjs` (128 tests). The worktree was reset with `git checkout -- .` between mutants. `git stash` was never used. The real-tree gate finished before any mutant ran (fixed port 4178). For M9 and M10, the built `discography.min.css` was inspected to confirm the rule was emitted with a winning selector, so the survivals are real.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `lib/catalog.js:46` | `songLayout` always `'lyrics'` when there is no video (instrumentals get the bento) | ✅ Killed. Unit fail, 5 e2e (NOVID-03 ×2, BENTO-08, SONG-03..10 ×2) |
| M2 | `lib/catalog.js:51` | `listenUrl` picks the `apple` entry | ✅ Killed. Unit fail, 10 e2e (NOVID-12 href ×10) |
| M3 | `_includes/discography/song-bento-meta.liquid:28` | `data-disc-slug` = song slug instead of album slug | ✅ Killed. 11 e2e (NOVID-12 ×10, NOVID-08 payload) |
| M4 | `_includes/discography/song-bento-lyrics.liquid:5-6` | DOM order B, C, D | ✅ Killed. 10 e2e (NOVID-01 ×10) |
| M5 | `_includes/discography/song-panel-dossier.liquid:9` | drop the `--split` modifier | ✅ Killed. 2 e2e (NOVID-18 on Age of Lies at 1280 and 992) |
| M6 | `less/song-bento.less:28` | desktop areas `"c c c b b b"` (ratio 0.5) | ✅ Killed. 4 e2e (NOVID-04) |
| M7 | `less/song-bento.less:50` | lyrics sticky rule targets Panel D instead of B | ✅ Killed. 4 e2e (NOVID-07) |
| M8 | `less/song-bento.less:68` | About `max-width: none` instead of `70ch` | ✅ Killed. 1 e2e (NOVID-19 at 1280) |
| M9 (probe) | `less/song-bento.less:68` (+rule) | lyrics layout only: Panel B primaries in 1 column below 992px (breaks BENTO-24 via NOVID-15) | ❌ **Survived** (128/128 passed) → fix 1 |
| M10 (probe) | `less/song-bento.less:68` (+rule) | lyrics layout only: Panel C body `max-height: 300px; overflow-y: hidden` (breaks BENTO-30 via NOVID-16) | ❌ **Survived** (128/128 passed) → fix 2 |
| M11 | `_includes/discography/song-bento-meta.liquid:27` | `{% elsif song.listenUrl %}` → `{% else %}` | ⚪ Equivalent on current data (no song lacks Spotify; the built output is identical). Not counted as survived |

**Sensor depth**: expanded (11 mutations across every file in the diff surface).
**Iteration 1 sensor outcome**: 11 injected, 8 killed, 2 survived (M9, M10), 1 equivalent (M11). Not ready
**Isolation**: the worktree was removed with `git worktree remove --force` and pruned; `git worktree list` shows only the main tree at `66d2c29`. The real tree's `git status --porcelain` matched the pre-sensor baseline (only the pre-existing untracked tool folders and `skills-lock.json`), including after the real-tree gate build.

---

### Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ One rule (`songLayout`) feeds the wrapper class, the h1 class and the composition switch. The partials are shared by two compositions |
| Surgical changes | ✅ The video composition's DOM is unchanged apart from the wrapper class and the Panel B sticky wrapper (static on video, asserted at `:335`) |
| No scope creep | ✅ |
| Matches patterns | ✅ The same `.song-page--bento` scope and the same test helpers (`expectUplink` was extracted and reused for both layouts) |
| Spec-anchored outcome check | ⚠️ NOVID-12 text matched case-insensitively (gap 3) |
| Per-layer coverage expectation | ❌ The matrix asks for "each layout AC at the named widths". BENTO-24 and BENTO-30 are not run on the lyrics layout |
| Every test maps to a requirement | ✅ Every new test carries NOVID/BENTO ids. The fixture test `:406` backs NOVID-18/19 |
| Documented guidelines | `.specs/LESSONS.md` L-004 (applied to BENTO-02/08), L-024 (applied to `songLayout`), L-046 (applied: NOVID-08 click test). Candidate L-037 (shared partial, test each layout) was not applied, and this is what M9 and M10 show |

---

### Edge Cases

- [x] Unlabeled lyrics (Tears of Blood): no markers or family classes (`:295-299`, BENTO-27 edge)
- [x] No "Also released as" (Faceless Demons): About within 70ch (`:428-443`)
- [x] No Spotify URL: no LISTEN NOW. The data side is unit-tested (`catalog.test.cjs:345-347`) and the template guard was checked by inspection. No page exercises it today (M11 equivalent)
- [x] Instrumental: old layout stays (`:149-157`)

---

### Gate Check

- **Gate command**: `npm run build && npm run test:unit && npx playwright test tests/seo tests/discography` (real tree, at `66d2c29`)
- **Iteration 1 gate**: exit 0. Unit 218/218, e2e 313/313 (3.6 min). 0 failed, 0 skipped, 0 flaky.
- **Test count before feature**: 214 unit + 275 e2e in this scope (the `song-video-bento` final gate)
- **Test count after feature**: 218 unit + 313 e2e (+4 unit, +38 e2e). None removed. The BENTO-02 loop was re-targeted from {Faceless Demons, Endless Path} to the two instrumentals, as the amended AC requires. SONG-07's selector excludes `[data-song-listen]`, which is justified because LISTEN NOW repeats the Spotify link. No assertion was weakened.
- **Full `npm test`**: not re-run by the verifier. The author reports 686 passed and 1 failed (PS2-23 `/photos/` networkidle timeout, a pre-existing environment issue outside the song pages).

---

### Fix Plans

### Fix 1: BENTO-24 on the lyrics layout (NOVID-15)

- **Root cause**: the 2-column primary check exists only in `tests/discography/song-bento.e2e.cjs:340-354`, which runs on `KEEP_AWAY`.
- **Fix task**: in the NOVID-06 test (`:413-425`, Age of Lies at 991/768/375), add the primary-column assertion. Collect the `.song-bento-panel--b .cyber-link-btn--primary` boxes and check that there are 2 distinct `left` values and that the widths differ by at most 1px.
- **Done when**: M9 is killed.
- **Priority**: Minor

### Fix 2: BENTO-30 on the lyrics layout (NOVID-16)

- **Root cause**: the not-clipped check exists only in `:456-468` on `KEEP_AWAY`.
- **Fix task**: add a lyrics-song test at 1280 and 375, for example on Faceless Demons. For `.song-bento-panel--c .cyber-panel-body` and `.song-bento-panel--c [data-song-lyrics]`, assert `overflowY === 'visible'` and `scrollHeight === clientHeight`.
- **Done when**: M10 is killed.
- **Priority**: Minor

### Fix 3: exact LISTEN NOW text (NOVID-12)

- **Root cause**: `:216` uses `/^\s*Listen now\s*$/i`.
- **Fix task**: drop the `i` flag so that a change of case in the markup fails the test.
- **Priority**: Cosmetic

---

### Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| NOVID-01..14, 17..23 | Implementing | ✅ Verified (pending re-verify after fixes) |
| NOVID-15 | Implementing | ❌ Needs Fix (BENTO-24 clause) |
| NOVID-16 | Implementing | ❌ Needs Fix (BENTO-30 clause) |

---

### Summary

**Overall**: ❌ Not Ready. The work is small and test-only. The implementation itself shows no defect.

**Spec-anchored check**: 21/23 ACs matched the spec outcome. NOVID-15 and NOVID-16 each lack one referenced clause. There are 0 spec-precision gaps.
**Sensor**: 11 injected, 8 killed, 2 survived (M9, M10), 1 equivalent (M11).
**Gate**: 218 unit and 313 e2e passed, 0 failed.

**What works**: layout classification, the lyrics bento markup, LISTEN NOW (attributes, payload and style parity), the desktop and mobile grid, sticky scoping, the dossier split and the 70ch cap, the HUD finish, focus and no-JS links. The BENTO-02/08 narrowing is consistent between spec and tests.

**Next steps**: route Fixes 1-3 to an implementer as test-only changes, then re-verify (iteration 2).

---

### Lessons

- M9 and M10 (`surviving_mutant`) were recorded against the existing candidate L-037, reusing its exact text so the recurrence merges.
- The NOVID-15/16 referenced-clause gap (`ac_gap`) was recorded as a new candidate: ACs that import other ACs by reference need every imported clause mapped to a test on the new context.
