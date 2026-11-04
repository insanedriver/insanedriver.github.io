# Song Listen Button Validation

**Date**: 2026-11-04
**Spec**: `.specs/features/song-listen-button/spec.md`
**Diff range**: `master..fix/song-listen-button` (`1d3176d..57177db`)
**Verifier**: independent sub-agent (author ≠ verifier)

**Verdict**: PASS ✅

---

## Task Completion

No `tasks.md` (Small feature, Tasks phase skipped; spec maps all 3 ACs to a single Execute step).

| Step | Status | Notes |
| ---- | ------ | ----- |
| Execute | ✅ Done | `57177db` - Excluded `:not(.song-bento-quickplay)` from `.disc-page a:not(...)` in `less/discography.less:611`, removed obsolete doubled-class hack in `less/song-bento.less:99`, rebuilt `assets/css/discography.min.css`, and added SLBTN assertions in `tests/discography/song-bento.e2e.cjs:614-652` |

---

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| SLBTN-01 | `[data-song-listen]` on lyrics-bento song pages (album tracks and singles) and `[data-song-quickplay]` on video-bento song pages have computed `background-color: rgb(0, 243, 255)` and `color: rgb(3, 8, 14)` at rest | `tests/discography/song-bento.e2e.cjs:623-626` - `expect(quick[0]).toBe('rgb(0, 243, 255)')`, `expect(quick[1]).toBe('rgb(3, 8, 14)')`, `expect(listen).toEqual(quick)`; `tests/discography/song-bento.e2e.cjs:628-636` - loops over `[KEEP_AWAY.url, '[data-song-quickplay]']` (video bento), `[FACELESS.url, '[data-song-listen]']` (album lyrics bento), and `['/discography/waiting-for-you/', '[data-song-listen]']` (single lyrics bento) asserting `await expect(btn).toHaveCSS('background-color', 'rgb(0, 243, 255)')` (`:635`) and `await expect(btn).toHaveCSS('color', 'rgb(3, 8, 14)')` (`:636`) | ✅ PASS |
| SLBTN-02 | WHEN `[data-song-listen]` or `[data-song-quickplay]` is hovered or focused THEN it has computed `background-color: rgb(252, 238, 10)` and `color: rgb(3, 8, 14)` | `tests/discography/song-bento.e2e.cjs:637-643` - across all three page kinds (`KEEP_AWAY.url`, `FACELESS.url`, `/discography/waiting-for-you/`): after `await btn.focus()` asserts `await expect(btn).toHaveCSS('background-color', 'rgb(252, 238, 10)')` (`:638`) and `await expect(btn).toHaveCSS('color', 'rgb(3, 8, 14)')` (`:639`); after blur + `await btn.hover()` asserts `await expect(btn).toHaveCSS('background-color', 'rgb(252, 238, 10)')` (`:642`) and `await expect(btn).toHaveCSS('color', 'rgb(3, 8, 14)')` (`:643`) | ✅ PASS |
| SLBTN-03 | Prose links inside `.disc-page` that are not `.cyber-link-btn`, `.disc-single-link`, `.disc-buy`, or `.song-bento-quickplay` (such as `[data-song-album]`) keep computed `color: rgb(0, 243, 255)` at rest and `color: rgb(255, 0, 234)` when hovered | `tests/discography/song-bento.e2e.cjs:647-651` - on `FACELESS.url`, `const albumLink = page.locator('[data-song-album]')`: `await expect(albumLink).toHaveCSS('color', 'rgb(0, 243, 255)')` (`:649`), then after `await albumLink.hover()`, `await expect(albumLink).toHaveCSS('color', 'rgb(255, 0, 234)')` (`:651`) | ✅ PASS |

**Status**: ✅ 3/3 ACs covered, asserted values match spec outcomes.

---

## Discrimination Sensor

Scratch: `git worktree add --detach /tmp/wt-slbtn HEAD`, `node_modules` symlinked, one mutant at a time with `node scripts/build-css.cjs` and `git checkout -- .` between mutants, then `git worktree remove --force /tmp/wt-slbtn` + `git worktree prune`. Command: `npx playwright test tests/discography/song-bento.e2e.cjs -g "SLBTN"`.

| # | File:line | Mutation | Killed by | Killed? |
| - | --------- | -------- | --------- | ------- |
| M1 | `less/discography.less:611` | Removed `:not(.song-bento-quickplay)` (reverts to pre-fix specificity bug) | `tests/discography/song-bento.e2e.cjs:624` (`expect(quick[1]).toBe('rgb(3, 8, 14)')`, received `'rgb(0, 243, 255)'`) | ✅ Killed |
| M2 | `less/song-bento.less:106` | Changed `.song-bento-quickplay` resting `color: #03080e` → `color: #ffffff` | `tests/discography/song-bento.e2e.cjs:624` (`expect(quick[1]).toBe('rgb(3, 8, 14)')`, received `'rgb(255, 255, 255)'`) | ✅ Killed |
| M3 | `less/song-bento.less:114` | Changed `.song-bento-quickplay` `:hover, &:focus` `background: #fcee0a` → `background: #00f3ff` | `tests/discography/song-bento.e2e.cjs:638` (`await expect(btn).toHaveCSS('background-color', 'rgb(252, 238, 10)')`) | ✅ Killed |
| M4 | `less/song-bento.less:114` | Changed `.song-bento-quickplay` `:hover, &:focus` `color: #03080e` → `color: #ff00ea` | `tests/discography/song-bento.e2e.cjs:639` (`await expect(btn).toHaveCSS('color', 'rgb(3, 8, 14)')`) | ✅ Killed |
| M5 | `less/discography.less:612` | Changed `.disc-page a:not(...)` resting `color: #00f3ff` → `color: #e9edf2` | `tests/discography/song-bento.e2e.cjs:649` (`await expect(albumLink).toHaveCSS('color', 'rgb(0, 243, 255)')`) | ✅ Killed |
| M6 | `less/discography.less:614` | Changed `.disc-page a:not(...)` `:hover, &:focus` `color: #ff00ea` → `color: #00f3ff` | `tests/discography/song-bento.e2e.cjs:651` (`await expect(albumLink).toHaveCSS('color', 'rgb(255, 0, 234)')`) | ✅ Killed |

**Sensor depth**: lightweight+ (6 targeted behavior-level mutations across all modified selectors and states)
**Result**: 6/6 killed - PASS ✅

Isolation: real tree `git status --porcelain` captured before the sensor and diffed after worktree removal (`PORCELAIN_MATCH=YES`). `git worktree list` shows only the main tree.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ 1 `:not(.song-bento-quickplay)` exclusion in `less/discography.less:611` + cleanup of redundant `a.song-bento-quickplay.song-bento-quickplay` selector hack in `less/song-bento.less:99` |
| Surgical changes | ✅ Only `less/discography.less`, `less/song-bento.less`, `assets/css/discography.min.css`, and `tests/discography/song-bento.e2e.cjs` |
| No scope creep | ✅ No changes to button geometry, typography, Panel B `.cyber-link-btn`, or instrumental song pages |
| Matches patterns | ✅ Follows exact exclusion pattern `.disc-page a:not(.cyber-link-btn):not(.disc-single-link):not(.disc-buy):not(.song-bento-quickplay)` |
| Spec-anchored outcome check (asserted values match spec) | ✅ Exact RGB values asserted at rest, on focus, and on hover |
| Per-layer Coverage Expectation met | ✅ E2E covers all three bento song page kinds (video, album lyrics, single lyrics) plus prose link regression check |
| Every test maps to a spec requirement - no unclaimed tests | ✅ All new assertions in `NOVID-14/SLBTN-01..03` map directly to `SLBTN-01`, `SLBTN-02`, `SLBTN-03`, and the single-lyrics edge case |
| Documented guidelines followed: `.specs/lessons.md` (L-037 multi-layout verification) | ✅ |

---

## Edge Cases

- [x] Single-lyrics song page (`/discography/waiting-for-you/`) rendering `[data-song-listen]` without a `[data-song-album]` link still has computed `background-color: rgb(0, 243, 255)` and `color: rgb(3, 8, 14)` at rest and `background-color: rgb(252, 238, 10)` and `color: rgb(3, 8, 14)` on focus and hover (`tests/discography/song-bento.e2e.cjs:631-643`).

---

## Gate Check

- **Gate command**: `npm run test:unit` + `npx playwright test tests/discography/song-bento.e2e.cjs -g "SLBTN"` + `npx playwright test tests/discography/theme.e2e.cjs tests/discography/single-lyrics.e2e.cjs`
- **Unit**: 232 passed, 0 failed, 0 skipped
- **Scoped E2E**: 29 passed (1 in `song-bento.e2e.cjs -g "SLBTN"`, 15 in `theme.e2e.cjs`, 13 in `single-lyrics.e2e.cjs`), 0 failed, 0 skipped
- **Test count**: Unchanged test count; existing `NOVID-14` test strengthened into `NOVID-14/SLBTN-01..03` with explicit color/background assertions at rest, focus, and hover across all three bento page types plus `[data-song-album]` prose link assertions
- **Skipped tests**: none
- **Failures**: none

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SLBTN-01 | Implemented | ✅ Verified |
| SLBTN-02 | Implemented | ✅ Verified |
| SLBTN-03 | Implemented | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 3/3 ACs matched spec outcome (plus single-lyrics edge case)
**Sensor**: 6 mutations injected, 6 killed, 0 survived
**Gate**: unit 232/232 passed; scoped discography e2e 29/29 passed
