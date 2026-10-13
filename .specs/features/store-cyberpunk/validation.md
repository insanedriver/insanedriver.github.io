# Store Cyberpunk Validation

**Date**: 2026-10-12
**Spec**: `.specs/features/store-cyberpunk/spec.md`
**Diff range**: `master..d974a54` (91415d4..d974a54, 7 commits)
**Iteration**: 2 (re-verify after fix commit d974a54)
**Verifier**: independent sub-agent (author ≠ verifier)

## Validation: store-cyberpunk - PASS

**Result**: PASS - all 24 ACs pass with spec-anchored evidence, both edge cases now have tests, and the sensor killed 16/16 mutants. Iteration 1 found one gap (an untested edge case, mutant M17). Commit d974a54 closes it, and the re-run of M17 is killed.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | 91415d4 + 59771bf (combo art amendment, spec.md:33) |
| T2 | ✅ Done | 88710cf |
| T3 | ✅ Done | 78ba1bb |
| T4 | ✅ Done | 414df6d |
| T5 | ✅ Done | 3ab930e |

---

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| STORE-01 | 3 cards, DOM order combo, SF, ID | `tests/store/markup.e2e.cjs:19` - `expect(ids).toEqual(['combo','silicon-fortress','insane-driver'])` (impl `store/index.html:11-35,46`) | ✅ PASS |
| STORE-02 | $35.00 / $25.00 / $22.00 USD | `tests/store/markup.e2e.cjs:24-26` - `toHaveText(/^\s*\$35\.00\s*USD\s*$/)` etc. | ✅ PASS |
| STORE-03 | combo form: webscr, `_s-xclick`, JYP8YSM95V69A, USD, exact os0 | `tests/store/markup.e2e.cjs:34-41` - `toBe('https://www.paypal.com/cgi-bin/webscr')`, `toMatchObject({cmd, hosted_button_id:'JYP8YSM95V69A', currency_code:'USD', os0:'COMBO: CD Silicon Fortress + Insane Driver'})` | ✅ PASS |
| STORE-04 | SF form: `_s-xclick`, JYP8YSM95V69A, USD, `os0=CD Silicon Fortress` | `tests/store/markup.e2e.cjs:51-56` - `toMatchObject({... os0:'CD Silicon Fortress'})` | ✅ PASS |
| STORE-05 | ID form: `_s-xclick`, ACB6SNWZ97592 | `tests/store/markup.e2e.cjs:66-67` - `toMatchObject({cmd:'_s-xclick', hosted_button_id:'ACB6SNWZ97592'})`, `not.toHaveProperty('os0')` | ✅ PASS |
| STORE-06 | title, covers SF then ID on combo with non-empty alt, years 2021 / 2016 / `2021 + 2016` | `tests/store/markup.e2e.cjs:81-87` - `toHaveText(e.year)`, `src` `toEqual([...silicon-fortress.jpg, ...insane-driver.jpg])`, `alt.trim().length > 0`, images loaded | ✅ PASS |
| STORE-07 | visible `BEST DEAL` on combo | `tests/store/markup.e2e.cjs:93-95` - `toHaveCount(1)`, `toHaveText('BEST DEAL')`, `toBeVisible()` | ✅ PASS |
| STORE-08 | `Ships worldwide · PayPal` above cards | `tests/store/markup.e2e.cjs:101-105` - exact text + `DOCUMENT_POSITION_FOLLOWING` | ✅ PASS |
| STORE-09 | one collapsed `<details>` per single card, tracks in `position` order from JSON | `tests/store/markup.e2e.cjs:112-115` - `toHaveCount(1)`, `d.open === false`, `toHaveText(titles(slug))` (sorted by position, :5) | ✅ PASS |
| STORE-10 | combo: two collapsed lists, SF then ID | `tests/store/markup.e2e.cjs:122-125` - `toEqual(['silicon-fortress','insane-driver'])`, `toEqual([false,false])`, titles per list | ✅ PASS |
| STORE-11 | activating summary reveals titles | `tests/store/markup.e2e.cjs:132-135` - `toBeHidden()` then click, `toBeVisible()`, `toHaveText(titles[0])` | ✅ PASS |
| STORE-12 | Brazil heading text + exact Die Hard `Comprar` href | `tests/store/markup.e2e.cjs:142-145` - exact `toHaveText`, exact `toHaveAttribute('href', ...)` | ✅ PASS |
| STORE-13 | English note: ships only within Brazil, use PayPal | `tests/store/markup.e2e.cjs:152-153` - `toContainText('ships only within Brazil')`, `toContainText('PayPal')` | ✅ PASS |
| STORE-14 | no geo-IP call, `imInBrazil` ignored | `tests/store/markup.e2e.cjs:158-167` - same 3 cards + Brazil panel for `''`, `?imInBrazil=true/false`; `hosts.filter(ip-api)` `toEqual([])`. Static check: `git grep -i "imInBrazil\|ip-api\|preorder"` outside tests/.specs returns nothing | ✅ PASS |
| STORE-15 | cyber-zone/panel structure, palette `#00f3ff #005f8c #ff00ea #fcee0a`, bodybg visible | `tests/store/theme.e2e.cjs:23-24` (bodybg + transparent zone), `:30-37` (tab/body/hud/accents), `:43-46` (all 4 palette colours as rgb) | ✅ PASS |
| STORE-16 | >=992px: one row SF, combo, ID | `tests/store/theme.e2e.cjs:55-58` (1280px) and `:65-66` (992px boundary); impl `less/store.less:264-271` | ✅ PASS |
| STORE-17 | <992px single column, combo first | `tests/store/theme.e2e.cjs:74-77` at 375 and 991px | ✅ PASS |
| STORE-18 | no `[data-store]` element past right edge, 320-1440px | `tests/store/theme.e2e.cjs:85-92` at 320/375/768/1024/1440 with tracklists open - `expect(overflowing).toEqual([])` | ✅ PASS |
| STORE-19 | `animation: none` under reduced motion on every default-animated element | `tests/store/theme.e2e.cjs:99,105` - animated list non-empty normally, `toEqual([])` with `reducedMotion:'reduce'` (incl. pseudo-elements); impl `less/store.less:490-495` | ✅ PASS |
| STORE-20 | visible focus outline on buy button and summary via keyboard | `tests/store/theme.e2e.cjs:116-123` - Tab-reached focus, outline style != none, width >= 2, colour `rgb(252, 238, 10)` | ✅ PASS |
| STORE-21 | `/preorder/` navigates to `/store/` via 0s meta refresh | `tests/store/redirect.e2e.cjs:24-25` (JS on and off, lands on `/store/` with 3 cards), `:32` - `toMatch(/^0;\s*url=\/store\/$/i)` | ✅ PASS |
| STORE-22 | canonical, noindex, visible link to `/store/` | `tests/store/redirect.e2e.cjs:37-39` - exact canonical, `toBe('noindex')`, `links` `toContain('/store/')` | ✅ PASS |
| STORE-23 | SF `buyCd === '/store/'` | `tests/store/store-data.test.cjs:21` - `assert.equal(..., '/store/')`; also `tests/discography/discography-data.test.cjs:73` and `tests/discography/markup.e2e.cjs:108` | ✅ PASS |
| STORE-24 | 3 files absent, no `preorder.less` import | `tests/store/store-data.test.cjs:10,16` - `existsSync === false`, `doesNotMatch(/@import .../)` | ✅ PASS |

**Status**: ✅ All 24 ACs covered, each assertion targets the exact spec outcome. No spec-precision gaps.

Precision notes (not gaps):
- STORE-14: the network check only matches hostnames containing `ip-api`. The static grep covers the rest: no geo-IP or `imInBrazil` code is left in the repo.
- STORE-13: the test checks two key phrases, not the full sentence. The spec states intent rather than exact copy, so this is enough.

---

## Edge Cases

- [x] **JS disabled**: every markup test runs with `javaScriptEnabled: false` (`tests/store/markup.e2e.cjs:13-14`), and `/preorder/` is also tested with JS off (`tests/store/redirect.e2e.cjs:18-27`). The page has no store JS.
- [x] **Empty `tracks` array** (closed in iteration 2): `tests/store/store-template.test.cjs:19` - `assert.equal(matches('data-store-tracklist="insane-driver"'), 0)` and `:21` - `assert.equal(matches('data-store-tracklist="silicon-fortress"'), 2)`. The test renders `store/index.html` with liquidjs against a fixture where `insane-driver.tracks = []`. Iteration 1 findings: The guard is `album.tracks.size > 0` at `store/index.html:81`. I checked the behaviour in a scratch build: with `insane-driver.tracks = []`, the `insane-driver` `<details>` was left out of both the combo card and the single card, and only the two `silicon-fortress` lists rendered. Removing the guard (mutant M17) left all 34 store e2e tests and 90 unit tests passing. The real data never has empty tracks, so no e2e test can reach this path. → Fix 1.

---

## Gate Check

- **Gate command**: `npm run build && npm test` (Build gate from tasks.md)
- **Result**: exit 0 - unit 90 passed / 0 failed / 0 skipped; Playwright 336 passed / 0 failed / 0 skipped (4.6 min)
- **Iteration 2**: `npm run test:unit` gives 91 passed / 0 failed / 0 skipped (+1 test: `tests/store/store-template.test.cjs`). Commit d974a54 changes only a test and the spec, not product code, so the iteration-1 Playwright result above still stands.
- **Test count delta**: +38 new tests (+37 in iteration 1, +1 in iteration 2) (unit +3: `tests/store/store-data.test.cjs`; e2e +34: markup 16, redirect 4, theme 14). No tests were deleted.
- **Changed existing assertions**: `tests/discography/discography-data.test.cjs:73` and `tests/discography/markup.e2e.cjs:108`. Both swap `/preorder/` for `/store/`. This follows the requirement change in STORE-23 and does not weaken either test.
- **Compiled CSS**: a fresh `npm run less:build` reproduces the committed `assets/css/style.min.css` byte for byte.

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt HEAD`, with `node_modules` symlinked. Mutants ran one at a time, never alongside the real tree on port 4178. The worktree was removed afterwards, and the real tree's `git status --porcelain` matched the baseline taken before the sensor ran.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `store/index.html:18` | combo `os0` changed to `CD Silicon Fortress` (swapped value) | ✅ Killed (STORE-03) |
| M2 | `store/index.html:34` | ID `hosted_button_id` changed to `ACB6SNWZ97593` | ✅ Killed (STORE-05) |
| M3 | `less/store.less:268-270` | desktop `order` rules removed | ✅ Killed (STORE-16 ×2) |
| M4 | `less/store.less:493` | `animation: none` removed from the reduced-motion block | ✅ Killed (STORE-19) |
| M5 | `preorder/index.html:6` | refresh changed from `0;` to `1; url=/store/` | ✅ Killed (STORE-21) |
| M6 | `store/index.html:19` | `BEST DEAL` badge removed | ✅ Killed (STORE-07) |
| M7 | `store/index.html:85` | tracklist loop `reversed` | ✅ Killed (STORE-09, STORE-10) |
| M8 | `_data/discography.json:23` | SF `buyCd` reverted to `/preorder/` | ✅ Killed (STORE-23, DISC-37) |
| M9 | `store/index.html:76` | `currency_code` hidden input removed | ✅ Killed (STORE-03, STORE-04) |
| M10 | `less/store.less:212` | focus-visible outline set to `none` | ✅ Killed (STORE-20) |
| M11 | `store/index.html:20` | combo album order reversed | ✅ Killed (STORE-06, STORE-10) |
| M13 | `less/store.less:448` | track grid column fixed at 420px (overflow) | ✅ Killed (STORE-18 ×3) |
| M14 | `less/store.less:44` | cyber-zone background changed to `#000` | ✅ Killed (STORE-15) |
| M15 | `store/index.html:42` | shipping line shortened to `Ships worldwide` | ✅ Killed (STORE-08) |
| M16 | `store/index.html:107` | Brazil note no longer mentions PayPal | ✅ Killed (STORE-13) |
| M17 | `store/index.html:81` | empty-tracks guard `and album.tracks.size > 0` removed | Iteration 1: ❌ Survived. Iteration 2 (fresh scratch worktree at d974a54): ✅ Killed by `tests/store/store-template.test.cjs:16` |

**Sensor depth**: expanded (≥5 mutations; this is the checkout/payment path)
**Sensor result**: 16/16 killed (iteration 2). Scratch worktree removed and real-tree porcelain matches the baseline.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ Products come from front matter, catalog data from `_data/discography.json`, no JS |
| Surgical changes | ✅ Only the store, preorder, catalog and style import files changed, plus the files T4 removes |
| No scope creep | ✅ |
| Matches patterns | ✅ Per-page `.less` scoped to `#page_store`, `cyber-*` structure, reduced-motion block (project convention) |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ (empty-tracks edge case covered in iteration 2) |
| Every test maps to a spec requirement | ✅ Every test title carries its STORE-xx id |
| Documented guidelines followed | none found - strong defaults applied |

Doc nit from iteration 1 (stale traceability footer) is fixed: `.specs/features/store-cyberpunk/spec.md:175` now reads "24 mapped to tasks (T1-T5), 0 unmapped".

Advisory (not blocking): `tests/store/store-template.test.cjs:5` requires `gray-matter`, which is not a direct devDependency. It reaches the test only as a hoisted transitive dependency of Eleventy (`package-lock.json:1445`). It works today with `npm ci`, but listing it in `devDependencies` would make it explicit.

---

## Fix Plans

### Fix 1: The empty-tracks edge case has no test - ✅ RESOLVED in d974a54

- **Root cause**: The spec lists the edge case, but the Test Coverage Matrix only planned the no-JS edge case. Real data can never reach the empty path, so e2e cannot cover it.
- **Fix task**: Add a node:test in `tests/store/` that renders `store/index.html` with liquidjs 6.4.3 (body after the front matter, `products` from the parsed front matter, and a `discography` fixture where one album has `tracks: []`). Assert that no `data-store-tracklist="<slug>"` appears for that album, and that the other album's list still renders. Alternatively, if the user decides the guard is unnecessary, amend the spec and drop the edge case. That is a spec change and needs the user's approval.
- **Priority**: Minor (defensive behaviour, which is correct today)

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| STORE-01..STORE-24 | Implemented | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 24/24 ACs match the spec outcome, 0 spec-precision gaps
**Sensor**: 16/16 mutations killed (M17 killed in iteration 2)
**Gate**: 91 unit (iteration 2) + 336 e2e (iteration 1) passed, 0 failed, 0 skipped

**What works**: all three PayPal forms carry the exact hidden fields, the prices, art, years and badge render as specified, tracklists come from the JSON in order, the Brazil route is always shown with no geo-IP, the desktop and mobile order, overflow, reduced-motion and focus checks pass, `/preorder/` redirects with canonical and noindex, `buyCd` is updated and the pre-order assets are gone.

**Issues found**: none open. Fix 1 is resolved. One advisory: declare `gray-matter` as a devDependency.

**Next steps**: the feature is done. Optionally run interactive UAT on the visual look.
