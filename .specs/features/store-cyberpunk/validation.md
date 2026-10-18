# Store Cyberpunk Validation

## Round 2 (Brazil panel redesign)

**Date**: 2026-10-17
**Spec**: `.specs/features/store-cyberpunk/spec.md` (amended STORE-12, new STORE-25 to STORE-31)
**Diff range**: `3c0c3d3..b118f89` (2 commits: T6 `5b57b09`, fix R2-1 `b118f89`)
**Iteration**: 2 (re-verify after fix commit b118f89)
**Verifier**: independent sub-agent (author ≠ verifier)

### Validation (round 2): store-cyberpunk Brazil panel - PASS

**Result**: PASS (round 2). All 8 round-2 ACs have spec-anchored evidence, STORE-13/18/19/20 still hold, and the sensor killed 14/14 non-equivalent mutants. Iteration 1 found one gap (M13, covers drawn in reverse order). Commit `b118f89` amends STORE-26 to "from left to right" and asserts the rendered order at `tests/store/theme.e2e.cjs:152`; the re-run of M13 is killed. Fix R2-1 is resolved.

#### Iteration 2 (re-verify of b118f89)

- **Fix diff** (`5b57b09..b118f89`): `spec.md` STORE-26 gains "from left to right"; `tests/store/theme.e2e.cjs:132` the `brazil` helper also returns each image's `src`; `:145` STORE-26 test renamed; `:151-152` new assertion `left('silicon-fortress')` `toBeLessThan(left('insane-driver'))` at 375 and 1280px. The existing `toHaveLength(2)` and 96px width assertions are unchanged; no other test is touched, removed or loosened.
- **M13 re-run**: killed. `flex-direction: row-reverse` on `.store-brazil-covers` (`less/store.less:522`, confirmed in the compiled CSS) fails `tests/store/theme.e2e.cjs:152` at 375 and 1280px (2 failed, 46 passed).
- **Sanity re-runs**: M7 (cover width 96 → 110px, `less/store.less:528`) killed by `theme.e2e.cjs:150` at 375 and 1280px; M8 (link `min-height` 56 → 40px, `less/store.less:510`) killed by `theme.e2e.cjs:160` at 375px.
- **Isolation**: fresh detached worktree at `b118f89` in the session scratchpad, `node_modules` symlinked, `npm run less:build` per mutation, one Playwright run at a time. Worktree removed; real-tree `git status --porcelain` matched the pre-sensor baseline after the sensor and again after the gate.

#### Iteration 1 (5b57b09) - kept for history

**Iteration 1 outcome**: not passed. All 8 round-2 ACs have spec-anchored evidence and STORE-13/18/19/20 still hold, but 1 of 14 non-equivalent sensor mutants survived: the covers can be drawn in reverse order (Insane Driver left of Silicon Fortress) and every test still passes. STORE-26 says "silicon-fortress.jpg then insane-driver.jpg", and the tests check that order only in the DOM. One fix task, minor severity.

### Task completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T6 | ✅ Done | 5b57b09; gate green |
| R2-1 | ✅ Done | b118f89; M13 now killed |

### Spec-anchored acceptance criteria (round 2)

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| STORE-12 (amended) | Panel shown, placed after the product cards, heading `No Brasil? Compre pela Die Hard 🇧🇷`, link named `Comprar na Die Hard` to the exact Die Hard URL | `tests/store/markup.e2e.cjs:141` `expect(br).toBeVisible()`; `:142` `toHaveText('No Brasil? Compre pela Die Hard 🇧🇷')`; `:143` `getByRole('link', { name: 'Comprar na Die Hard', exact: true })`; `:144` `toHaveAttribute('href', 'https://www.diehard.com.br/...pesquisa=Insane+Driver')`; `:151` last card `compareDocumentPosition(panel) & FOLLOWING` → `toBe(true)` | ✅ PASS |
| STORE-13 | English note says Die Hard ships only within Brazil and points international buyers to PayPal | `tests/store/markup.e2e.cjs:193-195` `toBeVisible()`, `toContainText('ships only within Brazil')`, `toContainText('PayPal')` | ✅ PASS (still holds) |
| STORE-25 | Line `Pague em reais · Pix ou cartão · Envio para todo o Brasil`, between heading and link | `tests/store/markup.e2e.cjs:158` `toHaveText('Pague em reais · Pix ou cartão · Envio para todo o Brasil')`; `:164` heading→benefit→link DOM order `toEqual([true, true])` | ✅ PASS (see precision note 2) |
| STORE-26 | Two covers, non-empty `alt`, `silicon-fortress.jpg` then `insane-driver.jpg` from left to right, each 96px wide | `tests/store/markup.e2e.cjs:170` src list `toEqual(['/assets/images/releases/silicon-fortress.jpg', '/assets/images/releases/insane-driver.jpg'])`; `:173` `alt.trim().length` `toBeGreaterThan(0)`; `tests/store/theme.e2e.cjs:149` `toHaveLength(2)`; `:150` `Math.abs(img.width - 96)` `toBeLessThanOrEqual(0.5)`; `:152` `left('silicon-fortress')` `toBeLessThan(left('insane-driver'))` at 375 and 1280px | ✅ PASS (iteration 2; spec now says "from left to right", rendered order asserted, M13 killed) |
| STORE-27 | Link has `target="_blank"` and `rel` containing `noopener` | `tests/store/markup.e2e.cjs:180` `toHaveAttribute('target', '_blank')`; `:181` `rel.split(/\s+/)` `toContain('noopener')` | ✅ PASS |
| STORE-28 | Link at least 56px tall | `tests/store/theme.e2e.cjs:160` `link.height` `toBeGreaterThanOrEqual(56)` at 375, 768, 1280px | ✅ PASS |
| STORE-29 | ≥768px: heading, benefit, note in the left column; covers above the link in the right column; link ≥280px wide | `tests/store/theme.e2e.cjs:170` each text part `right` `toBeLessThanOrEqual(min(covers.left, link.left))`; `:171` `covers.bottom` `toBeLessThanOrEqual(link.top)`; `:172` `link.width` `toBeGreaterThanOrEqual(280)` at 768 and 1280px | ✅ PASS |
| STORE-30 | <768px: stack heading, benefit, covers, link, note; link as wide as the panel content ±1px | `tests/store/theme.e2e.cjs:182` four vertical orderings `toEqual([true, true, true, true])`; `:183` `Math.abs(link.width - content)` `toBeLessThanOrEqual(1)` at 320, 375, 767px | ✅ PASS |
| STORE-31 | Panel `lang="pt-BR"`, note `lang="en"` | `tests/store/markup.e2e.cjs:186` `toHaveAttribute('lang', 'pt-BR')`; `:187` `toHaveAttribute('lang', 'en')` | ✅ PASS |
| STORE-18 | No element inside `[data-store]` past the viewport's right edge, 320 to 1440px | `tests/store/theme.e2e.cjs:81-92` (loop over 320/375/768/1024/1440) overflowing list `toEqual([])`; covers the new 600px images | ✅ PASS (still holds) |
| STORE-19 | Reduced motion sets `animation: none` on every animated store element | `tests/store/theme.e2e.cjs:96-105` `animated(reduced)` `toEqual([])` over all of `[data-store]`; the diff adds no animation | ✅ PASS (still holds) |
| STORE-20 | Focused buy button shows a visible outline | `tests/store/theme.e2e.cjs:111` selector list includes `[data-store-brazil] .store-buy`; `:121-123` outline style not `none`, width ≥2, color `rgb(252, 238, 10)` | ✅ PASS (still holds) |

**Spec-precision notes**

1. Resolved in iteration 2 (b118f89). Iteration 1 note: STORE-26 "`silicon-fortress.jpg` then `insane-driver.jpg`" did not say whether "then" is source order or left-to-right rendering. The tests take the source-order reading (`tests/store/markup.e2e.cjs:170`); a CSS reversal (M13) survives. Gap: amend the AC to "left to right" and assert it.
2. STORE-25 "between the heading and the link" can only mean reading order, since at ≥768px the link sits in the right column. The DOM-order check (`tests/store/markup.e2e.cjs:164`) is the right reading, and STORE-30 checks the rendered order below 768px. No action.

### Discrimination sensor (round 2)

Scratch: detached worktree of `5b57b09` under the session scratchpad, `node_modules` symlinked, `npm run less:build` after each mutation, `npx playwright test tests/store/` (48 tests, baseline 48 passed). One mutant at a time on port 4178. Worktree removed afterwards; real-tree `git status --porcelain` matched the pre-sensor baseline.

| # | File | Mutation | Killed? | Killed by |
| - | ---- | -------- | ------- | --------- |
| M1 | `store/index.html:107` | Heading `Compre pela` → `Compre na` | ✅ Killed | `markup.e2e.cjs:138` STORE-12 |
| M2 | `store/index.html:108` | Benefit `Pix ou cartão` → `Pix ou boleto` | ✅ Killed | `markup.e2e.cjs:154` STORE-25 |
| M3 | `store/index.html:115` | Drop `target="_blank"` | ✅ Killed | `markup.e2e.cjs:177` STORE-27 |
| M4 | `store/index.html:115` | `rel="noopener"` → `rel="noreferrer"` | ✅ Killed | `markup.e2e.cjs:177` STORE-27 |
| M5 | `store/index.html:37` | `brazil_albums` order swapped | ✅ Killed | `markup.e2e.cjs:167` STORE-26 |
| M6 | `store/index.html:117` | Drop `lang="en"` from the note | ✅ Killed | `markup.e2e.cjs:184` STORE-31 |
| M7 | `less/store.less:528` | Cover `width: 96px` → `110px` | ✅ Killed | `theme.e2e.cjs:145` STORE-26 (375, 1280) |
| M8 | `less/store.less:510` | Link `min-height: 56px` → `40px` | ✅ Killed | `theme.e2e.cjs:155` STORE-28 (375) |
| M9 | `less/store.less:484` | Panel grid breakpoint 768 → 800px | ✅ Killed | `theme.e2e.cjs:163` STORE-29 (768) |
| M10 | `less/store.less:472` | Mobile areas: note before media | ✅ Killed | `theme.e2e.cjs:175` STORE-30 (320, 375, 767) |
| M11 | `less/store.less:486` | Right column `minmax(280px, 320px)` → `minmax(200px, 240px)` | ✅ Killed | `theme.e2e.cjs:163` STORE-29 (768, 1280) |
| M12 | `less/store.less:514` | Mobile link `align-self: flex-start` (equivalent: `width: 100%` still applies) | n/a, equivalent | replaced by M12b |
| M12b | `less/store.less:514` | Mobile link `width: auto; align-self: flex-start` | ✅ Killed | `theme.e2e.cjs:175` STORE-30 (767) |
| M13 | `less/store.less:522` | Covers `flex-direction: row-reverse` (Insane Driver drawn left) | ❌ Survived in iteration 1 (48/48 passed); ✅ Killed in iteration 2 | `theme.e2e.cjs:152` STORE-26 (375, 1280) |
| M14 | `less/store.less:487` | Desktop areas: media column moved left | ✅ Killed | `theme.e2e.cjs:163` STORE-29 (768, 1280) |

**Sensor outcome**: iteration 1 killed 13/14 (M13 survived); iteration 2 re-ran M13 (killed) plus M7 and M8 (killed). Final: 14/14 non-equivalent mutants killed (1 equivalent discarded). Line numbers in the table refer to `5b57b09`; the fix did not touch product files.

### Gate (round 2)

Iteration 2 (at `b118f89`): `npm run build && npm test` in the real tree, exit 0; unit 91 pass / 0 fail / 0 skipped; Playwright 370 passed / 0 failed / 0 skipped (4.7 min). Matches the expected baseline. Real-tree porcelain unchanged.

Iteration 1 (at `5b57b09`):

- **Command**: `npm run build && npm test` (real tree, exit 0)
- **Unit**: 91 tests, 91 pass, 0 fail, 0 skipped
- **Playwright**: 370 passed, 0 failed, 0 skipped
- Matches the expected baseline (unit 91, Playwright 370). Real-tree porcelain unchanged by the gate.

### Code quality (round 2)

Changes stay inside `store/index.html`, `less/store.less`, the compiled CSS and the two store test files; covers reuse the catalog loop pattern of the product cards. Every new test names its AC. No scope creep found.

### Fix plans (round 2)

**Fix R2-1: assert the rendered cover order (STORE-26)** - Minor - ✅ Resolved by `b118f89` (iteration 2: M13 killed, gate green)
- **Root cause**: STORE-26 order is asserted only on DOM `src` order (`tests/store/markup.e2e.cjs:170`). A CSS reversal of `.store-brazil-covers` draws Insane Driver first and passes every test.
- **Fix task**: amend STORE-26 to read "left to right"; in `tests/store/theme.e2e.cjs` (the `brazil` helper, line 128) also return each image's `src`, and in the STORE-26 test (line 145) assert the image with `silicon-fortress.jpg` has a smaller `left` than the one with `insane-driver.jpg` at 375 and 1280px.
- **Done when**: re-running M13 (`flex-direction: row-reverse` on `.store-brazil-covers`) fails the STORE-26 test; gate green.

---

## Round 1

**Date**: 2026-10-12
**Spec**: `.specs/features/store-cyberpunk/spec.md`
**Diff range**: `master..d974a54` (91415d4..d974a54, 7 commits)
**Iteration**: 2 (re-verify after fix commit d974a54)
**Verifier**: independent sub-agent (author ≠ verifier)

### Round 1 verdict: store-cyberpunk - PASS

**Round 1 outcome**: PASS - all 24 ACs pass with spec-anchored evidence, both edge cases now have tests, and the sensor killed 16/16 mutants. Iteration 1 found one gap (an untested edge case, mutant M17). Commit d974a54 closes it, and the re-run of M17 is killed.

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
- **Outcome**: exit 0 - unit 90 passed / 0 failed / 0 skipped; Playwright 336 passed / 0 failed / 0 skipped (4.6 min)
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
**Sensor outcome**: 16/16 killed (iteration 2). Scratch worktree removed and real-tree porcelain matches the baseline.

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
