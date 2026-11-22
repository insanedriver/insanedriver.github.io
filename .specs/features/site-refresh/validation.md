# Site refresh Validation

**Date**: 2026-11-15
**Spec**: `.specs/features/site-refresh/spec.md`
**Diff range**: `7f8abcf..98b64ee` (branch `feat/site-refresh`, 14 commits: T1-T10, fix cb648c6, F1 8c2c286, F2 b05bedf, F3 98b64ee)
**Verifier**: independent sub-agent (author ≠ verifier)
**Round**: 2 of 3 (re-verification after fix tasks F1-F3)

**Verdict**: PASS

All 25 requirements and all 3 edge cases now meet the spec, and every injected fault was caught. Round 1 failed on two things, and both are fixed: the reduced-motion edge case (footer transitions on `/dates/` and `/press/`) and a weak REF-21 test (sensor M10 survived). The round-1 spec-precision gaps on REF-01 and REF-04 are closed by spec amendments. What remains is a human visual check against the approved Stitch screens (REF-05/10/17). Tests cannot settle that, and it is not a FAIL.

---

## Round 1 → Round 2 gap status

| # | Round-1 gap | Fix | Round-2 evidence | Status |
| - | ----------- | --- | ---------------- | ------ |
| 1 | Reduced motion skipped the footer on /dates/ and /press/ (16 elements at 0.2s each) | F1 `8c2c286`: `less/dates.less:73-78` and `less/press.less:303-308` now use `&, *, *::before, *::after` inside `#page_dates`/`#page_press` (compiled to `#page_dates, #page_dates *, …`); tests widened to `body, body *` (`tests/dates/dates.e2e.cjs:21`, `tests/press/press.e2e.cjs:9`) | Independent whole-document probe (`html, html *` + `::before/::after`, `reducedMotion: 'reduce'`): `/dates/` 636 boxes, **0 offenders**; `/press/` 1026 boxes, **0 offenders**. Mutants M20-M22 killed | ✅ Closed |
| 2 | REF-21 counts could be hardcoded (M10 survived) | F2 `b05bedf`: `tests/press/press.test.cjs:96-111` renders `press/index.html` with liquidjs and stub data (7 albums, 11 singles) | `press.test.cjs:109-110` `assert.match(facts, /\b7 Album releases\b/)`, `/\b11 Singles\b/`; M10 re-applied → killed | ✅ Closed |
| 3 | REF-04 said "monospace" though tabs use SiliconFont | F3 `98b64ee`: REF-04 names both stacks | Spec now matches `tests/site/readability.e2e.cjs:66-67` exactly | ✅ Closed |
| 4 | REF-01 pull-quote exclusion only in a test comment | F3 `98b64ee`: REF-01 excludes `.cyber-bio-quote` | Spec now matches the `readability.e2e.cjs:6` selector | ✅ Closed |
| 5 | Visual match with approved Stitch screens (REF-05/10/17) | - | Structural proxies pass (below); visual comparison against `.stitch/designs/v2/{footer,dates,press}-*.png` remains | 👁 Human check (not a FAIL) |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1-T7 | ✅ Done | Deviations in T3, T6, T7 judged acceptable (shared X partial, kept sub-partials + `_data/build.js`, single footer container) |
| T8 | ✅ Done | widgetv3 URL (legacy widget answers 403) and the DESK-07 → desktop-area move are legitimate |
| T9 | ✅ Done | `_data/bio.js` single source and the "Album releases" label are legitimate |
| T10 | ✅ Done | - |
| F1 | ✅ Done | `8c2c286` |
| F2 | ✅ Done | `b05bedf` |
| F3 | ✅ Done | `98b64ee` |

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion | Result |
| --------- | -------------------- | ----------------------- | ------ |
| REF-01 | Band bio (excluding `.cyber-bio-quote`), Contact, Newsletter paragraphs: font starts `Rajdhani`, `text-align: left`, at 390 + 1440 | `tests/site/readability.e2e.cjs:42-43` `toMatch(/^"?Rajdhani"?/)`, `toBe('left')`; selectors :6-8 | ✅ PASS (killed M14) |
| REF-02 | ≥16px at 390px | `readability.e2e.cjs:53` `toBeGreaterThanOrEqual(16)` | ✅ PASS (killed M15) |
| REF-03 | contrast ≥4.5:1 | `readability.e2e.cjs:44` `toBeGreaterThanOrEqual(4.5)` (translucent layers composited onto a white worst case, :13-31) | ✅ PASS (killed M19) |
| REF-04 | data-hud `"Share Tech Mono", monospace`; tabs `SiliconFont, Rajdhani, sans-serif` | `readability.e2e.cjs:66-67` exact `toBe` on both | ✅ PASS |
| REF-05 | footer implements the approved layout on every base-layout page | `tests/site/footer.test.cjs:59-63` (logo, `[AUDIO::CHANNELS]`, `[NAV::INDEX]`, 7 icons, bar + top-link); `tests/site/footer.e2e.cjs:24,27-30` (2 cols at 390, 3 zones side by side at 1440) | ✅ PASS structurally; 👁 visual check |
| REF-06 | nav list = header destinations + "Press kit" `/press/`, no `\|` | `footer.test.cjs:31` `deepEqual(hrefs, [...headerHrefs(html), '/press/'])`; :33; :37 `doesNotMatch(/\|/)` | ✅ PASS (killed M2, M3) |
| REF-07 | footer links/icons ≥44×44 at 390 | `footer.e2e.cjs:13-16` | ✅ PASS (killed M18) |
| REF-08 | X logo, name `Insane Driver on X`, no `fa-twitter` in header + footer | `tests/site/x-icon.test.cjs:26,31-34`; `footer.test.cjs:42-47,67-73` | ✅ PASS (killed M16) |
| REF-09 | `© 2013-<build year> Insane Driver` | `footer.test.cjs:54` | ✅ PASS (killed M4) |
| REF-10 | `/dates/` on base layout, widget in a cyber panel | `tests/dates/dates.test.cjs:13-24` | ✅ PASS structurally; 👁 visual check |
| REF-11 | https widget script; no `http://` script/iframe | `dates.test.cjs:31-32` | ✅ PASS (killed M5) |
| REF-12 | visible `Follow on Bandsintown` → `https://www.bandsintown.com/Insane%20Driver` | `dates.test.cjs:40`; `tests/dates/dates.e2e.cjs:10-12` with the widget blocked (:8) | ✅ PASS (killed M6) |
| REF-13 | same title/description/robots, sitemap, not in menus | `dates.test.cjs:45-48,52,60-61` (values match the front matter at `7f8abcf:dates/index.html:2-4`) | ✅ PASS |
| REF-14 | Band Listen/Connect ≥2 cols, ≥44px at 390 | `tests/band/mobile-grid.e2e.cjs:13,15` | ✅ PASS (killed M7) |
| REF-15 | Release streaming ≥2 cols, ≥44px at 390 | `tests/discography/mobile-grid.e2e.cjs:12-13` | ✅ PASS (killed M13) |
| REF-16 | Buy CD / Preview same left edge and height ±1px | `discography/mobile-grid.e2e.cjs:24-25` | ✅ PASS (killed M8) |
| REF-17 | `/press/` on base layout, approved variation | `tests/press/press.test.cjs:29-33` | ✅ PASS structurally; 👁 visual check |
| REF-18 | short = first 2 Band paragraphs; long = all + quote | `press.test.cjs:40-41` vs the built `/band/` bio | ✅ PASS (killed M17) |
| REF-19 | every 2020 PROMO photo, thumbnail + download to `src` | `press.test.cjs:49-52` | ✅ PASS (killed M9) |
| REF-20 | both logo PNG downloads | `press.test.cjs:59` | ✅ PASS |
| REF-21 | album/single counts equal `_data/discography.json` | `press.test.cjs:65-66` (real data) + `press.test.cjs:109-110` (stub render 7/11) | ✅ PASS (M10 now killed) |
| REF-22 | `contact@insanedriver.com.br` mailto | `press.test.cjs:74-75` | ✅ PASS |
| REF-23 | own title/description/canonical, `index, follow`, sitemap, not in header | `press.test.cjs:80-84,88-91` | ✅ PASS |
| REF-24 | Contact links to `/press/` | `tests/site/contact-press.test.cjs:12-13` | ✅ PASS (killed M11) |
| REF-25 | charset in the first 1024 bytes of every page | `tests/site/charset.test.cjs:25-27` | ✅ PASS (killed M1) |

**Status**: ✅ All ACs covered and matching the spec outcome. Visual Stitch match (REF-05/10/17) left for human review.

---

## Edge Cases

- [x] Bandsintown script fails → panel + Follow link visible: `tests/dates/dates.e2e.cjs:4-13` (external hosts blocked; asserts the widgetv3 request failed).
- [x] Reduced motion on `/dates/` and `/press/`: whole-page scan in `tests/dates/dates.e2e.cjs:21,31` and `tests/press/press.e2e.cjs:9,19` (`expect(long).toEqual([])`). My independent probe found 0 offenders on both pages. Implementation: `less/dates.less:73-78`, `less/press.less:303-308`.
- [x] No horizontal overflow at 320-1920: `tests/site/readability.e2e.cjs:70-75` (Band/Contact/Newsletter), `tests/site/footer.e2e.cjs:33-38` (Home/Band), `tests/dates/dates.e2e.cjs:34-39`, `tests/press/press.e2e.cjs:34-39`. Release: `tests/discography/mobile-grid.e2e.cjs:28-33`, plus `tests/desktop/frame.e2e.cjs:43-49` (320-1024) and `:13-30` (1200-2560).

---

## Modified existing tests (weakening check)

| File | Change | Judgement |
| ---- | ------ | --------- |
| `tests/desktop/preservation.e2e.cjs` | `/dates/` moved from the DESK-07 exclusion list to the desktop areas | Legitimate (REF-10); the exclusion test still runs for `/pre-save/` and `/preorder/` |
| `tests/desktop/frame.e2e.cjs` | `/dates/` added | Coverage added |
| `tests/perf/built.cjs` | stops skipping `/dates/` | Coverage added |
| `tests/perf/scripts.test.cjs` | counts 43→45, 44→46 | Inventory change (+Dates, +Press); exact counts kept |
| `tests/seo/output.test.cjs` | `/press/` indexable, sitemap 39→40 | REF-23; exact set kept |
| `tests/dates/dates.e2e.cjs`, `tests/press/press.e2e.cjs` (F1) | scan widened from `main` to `body` | Stronger |

No test was weakened, skipped or deleted.

---

## Discrimination Sensor

Scratch: temporary `git worktree` per round (round 1 at `8619157`, round 2 at `98b64ee`), node_modules symlinked. Each mutant was applied, rebuilt, tested and reverted with `git checkout -- .`. Runs were sequential on port 4178.

| # | File:line | Mutation | Round | Killed? | Killed by |
| - | --------- | -------- | ----- | ------- | --------- |
| M1 | `_layouts/base.html:5` | charset after the trackers include | 1 | ✅ | charset.test (45) |
| M2 | `_includes/footer/menu.liquid` | ` \|` after every link | 1 | ✅ | footer.test REF-06 |
| M3 | `_includes/footer/menu.liquid` | Press kit removed | 1 | ✅ | footer.test REF-06 |
| M4 | `_includes/footer/copyright.liquid:1` | year hardcoded `2025` | 1 | ✅ | footer.test REF-09 |
| M5 | `dates/index.html` | widget script → `http://` | 1 | ✅ | dates.test REF-11 |
| M6 | `dates/index.html` | Follow link removed | 1 | ✅ | dates.test REF-12 |
| M7 | `less/band.less` | links grid → `1fr` | 1 | ✅ | band/mobile-grid REF-14 |
| M8 | `less/discography.less` | Preview shifted 8px | 1 | ✅ | discography/mobile-grid REF-16 |
| M9 | `press/index.html` | photo filter lets in 2017/2015 promos | 1 | ✅ | press.test REF-19 |
| M10 | `press/index.html` facts | counts hardcoded `3`/`18` | 1 | ❌ survived | - |
| M10 | same | same | **2** | ✅ | press.test:96 stub render (REF-21) |
| M11 | `contact/index.html` | Contact press link removed | 1 | ✅ | contact-press.test REF-24 |
| M12 | `less/dates.less` | reduced-motion block removed | 1 | ✅ | dates.e2e |
| M13 | `less/discography.less` | `.disc-links` → `1fr` | 1 | ✅ | discography/mobile-grid REF-15 |
| M14 | `less/band.less` | bio `text-align: center` | 1 | ✅ | readability REF-01 |
| M15 | `less/cyber-global.less` | desc text 14px | 1 | ✅ | readability REF-02 |
| M16 | `_includes/header/menu.liquid` | title back to "on Twitter" | 1 | ✅ | x-icon.test |
| M17 | `press/index.html` | short bio `limit: 3` | 1 | ✅ | press.test REF-18 |
| M18 | `less/footer.less` | footer links 30px tall | 1 | ✅ | footer.e2e REF-07 |
| M19 | `less/cyber-global.less` | desc color `#555` | 1 | ✅ | readability REF-03 |
| M20 | `less/dates.less:74` | widened selector reverted to `main *` (footer transitions return) | 2 | ✅ | dates.e2e reduced motion |
| M21 | `less/press.less:304` | widened selector reverted to `main *` | 2 | ✅ | press.e2e reduced motion |
| M22 | `less/press.less:303-308` | reduced-motion block removed | 2 | ✅ | press.e2e reduced motion |

**Sensor depth**: expanded (22 distinct mutations)
**Result**: 22/22 killed at `98b64ee` (round 1 had 18/19): PASS ✅

Isolation: both worktrees removed (`git worktree remove --force` + `git worktree prune`). Real-tree `git status --porcelain` matched the pre-sensor baseline each round, apart from this `validation.md` and the Verifier's lessons writes.

---

## Gate Check

- **Gate command**: `npm run build && npm test` (scratch worktree at `98b64ee`)
- **Result**: 334 unit + 839 e2e passed, 0 failed, 0 skipped (exit 0)
- **Round 1 (at `8619157`)**: 333 unit + 839 e2e passed, 0 failed
- **Delta from fixes**: +1 unit test (REF-21 stub render); e2e count unchanged (two scans widened)
- **Skipped tests**: none
- **Failures**: none

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (F1 touches only the two page-scoped blocks; the shared footer is left alone) |
| No scope creep | ⚠️ Press "Copy" buttons were not specified; they are tested (`tests/press/press.e2e.cjs:22-32`) |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ |
| Per-layer coverage expectation | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed | none found: strong defaults applied |

---

## Fix Plans

None open. Round-1 Fix 1-3 were done as F1-F3 and verified above.

Human check (not blocking): compare the footer, `/dates/` and `/press/` at 390/1440 with `.stitch/designs/v2/{footer,dates,press}-{desktop,mobile}.png`, using the corrections listed in tasks.md.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| REF-01..04 | Done | ✅ Verified |
| REF-05 | Done | ✅ Verified (structure); 👁 visual check |
| REF-06..09 | Done | ✅ Verified |
| REF-10 | Done | ✅ Verified (structure); 👁 visual check |
| REF-11..16 | Done | ✅ Verified |
| REF-17 | Done | ✅ Verified (structure); 👁 visual check |
| REF-18..25 | Done | ✅ Verified |
| Edge cases (3) | - | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready (pending the human visual check of the Stitch match)

**Spec-anchored check**: 25/25 ACs match the spec outcome; 3/3 edge cases met; 0 open spec-precision gaps
**Sensor**: 22/22 mutations killed
**Gate**: 334 unit + 839 e2e passed, 0 failed, 0 skipped (exit 0)

**What works**: everything in REF-01..25 and the three edge cases, now including reduced motion across the whole Dates and Press pages and data-driven Press counts.

**Issues found**: none blocking.

**Next steps**: human visual review of the footer, Dates and Press against the approved Stitch screens. Push, PR and deploy each need their own explicit go-ahead.
