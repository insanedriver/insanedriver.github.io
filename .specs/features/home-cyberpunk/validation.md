# Home Cyberpunk Validation (round 3 of 3)

## Validation: home-cyberpunk - FAIL (escalate to the user)

**Result: FAIL**. The round-2 blocker HOME-24 is fixed and verified. The gate is green (unit 65/65, Playwright 209/209), and the `defer` change caused no regression: 155/155 green across 5 repeats of the loader, loader-style, tracking, scripts and navbar specs.

Two findings remain, and this is the final fix round, so they go to the user:

1. **HOME-28 (behavior)**: on a *first* view whose `home.js` arrives late, the loader is visible but the page beneath is **not inert**, and Tab moves focus to a link hidden behind the loader. This is the same late-script class as round-2's HOME-24. It was not introduced by `defer`: master also loaded `home.js` at the end of the body.
2. **M29 (test-only)**: the head fallback's `aria-hidden="true"` (HOME-27 on the late-script path) can be deleted with every test still green. The product code is correct (the probe below shows `aria-hidden="true"` in the gap). Only the regression protection is missing.

**Date**: 2026-09-30
**Spec**: `.specs/features/home-cyberpunk/spec.md`
**Diff range**: `master..HEAD` = `125443d..75b1ca5`. The feature runs from `1d06ee7`.
- Round-2 fixes: `a4a42a6`, `43601dc`.
- Round-3 fixes: `7fe1711`, `75b1ca5`.

**Verifier**: independent sub-agent (author ≠ verifier), read-only over the real tree. The gate, the sensor and the probes ran in a temporary `git worktree` at `75b1ca5`.

---

## Round-3 delta

| Commit | Change | Verifier finding |
| --- | --- | --- |
| `7fe1711` | `_layouts/home.html:27`: the head gate reads `id-home-booted` in try/catch and, on a repeat view, adds `is-done` + `aria-hidden` to `#home-loader` after `setTimeout(400)` | Correct. Kills M26, M27 and M28. `aria-hidden` is unasserted (M29 survives). |
| `7fe1711` | `_includes/js/home.liquid:2-3`: `home-core.js` and `home.js` are `defer` | No regression. `js/pack` stays parser-blocking, so jQuery and Bootstrap run first. Deferred scripts keep document order (`tests/home/scripts.e2e.cjs:14`). HOME-08 mobile menu green (`tests/home/scripts.e2e.cjs:19-27`). Removing `defer` is killed (M30). |
| `7fe1711` | `tests/home/loader.e2e.cjs:48-65`: repeat view with `home.js` +700ms must be off screen by <=500ms | Discriminating: kills M26 and M30 |
| `75b1ca5` | `liquidjs` 6.4.3 is a devDependency | Closes the round-2 note |

### Hand-off check: head timer vs. late `home.js`

This is a Verifier probe. On a repeat view with `home.js` routed through a +1500ms delay, the state 500ms after `is-done` was:

`{"t":958.6,"opacity":"0","pe":"none","aria":"true","hitLoader":false,"inert":false,"scrollY":300,"loading":true}`

- The loader is invisible, not hit-testable and out of the a11y tree; `getByRole('status', {name:'Loading Insane Driver'})` counted 0.
- The page scrolls.

When `home.js` ran (t≈2031ms):
- `inert` was false, `home-loading` was removed, and the loader was `display:none`.
- No `home_loader_skip` was pushed and there were no page errors.
- The navbar still turned `.is-solid` on scroll.

**No conflict.** One cosmetic note: `loader()` still runs its start-up path and briefly sets `page.inert = true` (`assets/js/home.js:43`). It is cleared by the 0ms repeat timer in the same turn, so it is harmless.

---

## Spec-Anchored Acceptance Criteria

Unchanged from round 2 except where noted. Line numbers in `tests/home/loader.e2e.cjs` moved by +19 after line 47.

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| HOME-01 | hero 100svh / 100vh | `tests/home/hero-style.e2e.cjs:22` | PASS |
| HOME-02 | one `h1` "Insane Driver" | `tests/home/hero.e2e.cjs:9-13` | PASS |
| HOME-03 | tagline | `tests/home/hero.e2e.cjs:18` | PASS |
| HOME-04 | srcset, not lazy | `tests/home/hero.e2e.cjs:27-30` | PASS (M14 killed) |
| HOME-05 | legacy markup/scripts absent | `tests/home/layout.e2e.cjs:5-9`; `tests/home/scripts.e2e.cjs:11-13` | PASS on intent. ⚠️ Wording (`home.js` name) is for the user; not blocking. |
| HOME-06 | zero iframes on load | `tests/home/hero.e2e.cjs:67` | PASS |
| HOME-07 | overlays aria-hidden and layered | `tests/home/hero-style.e2e.cjs:38-49` | PASS. ⚠️ Minor: the glitch span's aria-hidden is unasserted. |
| HOME-08 | menu and footer | `tests/home/layout.e2e.cjs:14-16`; `tests/home/scripts.e2e.cjs:25` | PASS (re-checked after `defer`) |
| HOME-09 | latest-release rule | `tests/home/home-core.test.cjs:11-46` | PASS (M1 killed) |
| HOME-10 | hero card content | `tests/home/hero.e2e.cjs:44-46` | PASS |
| HOME-11 | primary anchors | `tests/home/hero.e2e.cjs:55-58`; `tests/home/hero-template.test.cjs:30` | PASS |
| HOME-12 | no anchor without a URL | `tests/home/hero-template.test.cjs:35-36,41-42` | PASS (M13, M24 killed) |
| HOME-13 | card in the fold | `tests/home/hero-style.e2e.cjs:57-61` | PASS |
| HOME-14 | NOW::STREAMING | `tests/home/panels.e2e.cjs:34-47`; `tests/home/home-release.test.cjs:12,21` | PASS (M12 killed). ⚠️ The "remaining" wording is for the user. |
| HOME-15 | no iframe before PREVIEW | `tests/home/preview.e2e.cjs:18` | PASS |
| HOME-16 | PREVIEW opens | `tests/home/preview.e2e.cjs:25-27` | PASS |
| HOME-17 | PREVIEW closes | `tests/home/preview.e2e.cjs:30-31` | PASS (M7 killed) |
| HOME-18 | no PREVIEW without an id | `tests/home/hero-template.test.cjs:46-47` | PASS (M22 killed) |
| HOME-19 | no-JS PREVIEW hidden | `tests/home/panels.e2e.cjs:56-58` | PASS (M15 killed) |
| HOME-20 | loader content before first paint | `tests/home/layout.e2e.cjs:39-45`; `tests/home/loader-style.e2e.cjs:24-28` | PASS |
| HOME-21 | no loader without JS | `tests/home/layout.e2e.cjs:53-54` | PASS (M16 killed) |
| HOME-22 | max(1.2s, ready) | `tests/home/loader.e2e.cjs:16-17,27-28`; `tests/home/home-core.test.cjs:83,87` | PASS (M6, M27 killed) |
| HOME-23 | <=3.5s | `tests/home/home-core.test.cjs:91-92`; `tests/home/loader.e2e.cjs:35-36` | PASS |
| HOME-24 | repeat view within 0.4s | `tests/home/home-core.test.cjs:78`; `tests/home/loader.e2e.cjs:45` and **`:64` (home.js +700ms)** - `toBeLessThanOrEqual(500)` | ✅ **PASS**. The round-2 gap is closed (M26, M30 killed). ⚠️ The 0.4s vs <=0.5s tolerance wording is for the user. |
| HOME-25 | throwing storage -> full boot | `tests/home/loader.e2e.cjs:75-76` | PASS (M28 killed: the head gate must swallow the error) |
| HOME-26 | skip + event | `tests/home/loader.e2e.cjs:86-87,95` | PASS (M4 killed) |
| HOME-27 | released for pointer, a11y and scroll | `tests/home/loader.e2e.cjs:111-117` | PASS on the `home.js` path (M5 killed). ❌ The late-script path (head fallback) has no assertion; **M29 survived**. |
| HOME-28 | while visible: `role=status` + label, content `inert` | `tests/home/loader.e2e.cjs:102-105` - `el.inert` `toBe(true)`, measured only after `window.IDHome` exists | ❌ **GAP (behavior)**. Verifier probe on a first view, 600ms after the footer parsed: with `home.js` +0ms, `{"loaderVisible":true,"inert":true}` and Tab went to `BODY`. With `home.js` +1500ms, `{"loaderVisible":true,"inert":false}` and **Tab focused `page-content:A`** under the loader. `inert` is only ever set by `assets/js/home.js:43`. |
| HOME-29 | reduced motion, fade <=200ms | `tests/home/loader-style.e2e.cjs:54-55,68-71` | PASS (M17, M25 killed) |
| HOME-30 | panel shell | `tests/home/panels.e2e.cjs:12-27` | PASS |
| HOME-31 | panel order | `tests/home/newsletter.e2e.cjs:60` | PASS |
| HOME-32 | fonts and palette | `tests/home/panels-style.e2e.cjs:15-22` | PASS |
| HOME-33 | scope and `home-` keyframes | `tests/home/hero-style.e2e.cjs:67`; `tests/home/panels-style.e2e.cjs:48`; `tests/home/loader-style.e2e.cjs:45` | PASS. ⚠️ Scoping has static evidence only. |
| HOME-34 | full width, not a scroll container | `tests/home/panels-style.e2e.cjs:29,32` | PASS (M18 killed) |
| HOME-35 | reduced motion page-wide | `tests/home/hero-style.e2e.cjs:77`; `tests/home/panels-style.e2e.cjs:58` | PASS (M21 killed) |
| HOME-36 | transparent at <=40px | `tests/home/navbar-style.e2e.cjs:13-17`; `tests/home/home-core.test.cjs:114` | PASS (M2 killed) |
| HOME-37 | opaque past 40px | `tests/home/navbar.e2e.cjs:13`; `tests/home/navbar-style.e2e.cjs:25` | PASS (M20 killed) |
| HOME-38 | other navbars unchanged | `tests/home/navbar-style.e2e.cjs:31-32` | PASS |
| HOME-39 | no horizontal scroll | `tests/home/panels-style.e2e.cjs:40` | PASS |
| HOME-40 | ID-TV teaser | `tests/home/teasers.e2e.cjs:12-17,48` | PASS |
| HOME-41 | album anchors | `tests/home/teasers.e2e.cjs:20-29` | PASS |
| HOME-42 | photo feed | `tests/home/teasers.e2e.cjs:33-36` | PASS |
| HOME-43 | plain anchors without JS | `tests/home/teasers.e2e.cjs:54-57` | PASS |
| HOME-44 | form action | `tests/home/newsletter.e2e.cjs:15-17` | PASS |
| HOME-45 | fields and labels | `tests/home/newsletter.e2e.cjs:24-31` | PASS |
| HOME-46 | shared country include | `tests/home/newsletter.e2e.cjs:38`; `tests/home/countries.e2e.cjs:14-18` | PASS |
| HOME-47 | submit event | `tests/home/tracking.e2e.cjs:66,73` | PASS (M10 killed) |
| HOME-48 | native validation | `tests/home/newsletter.e2e.cjs:51,54` | PASS |
| HOME-49 | release click | `tests/home/tracking.e2e.cjs:31-33,41-43` | PASS (M8 killed; re-checked after `defer`) |
| HOME-50 | teaser clicks | `tests/home/tracking.e2e.cjs:54-55` | PASS |
| HOME-51 | missing dataLayer | `tests/home/tracking.e2e.cjs:81-82,88` | PASS (M9 killed) |
| HOME-52 | JSON-LD | `tests/home/seo.e2e.cjs:12-22` | PASS |
| HOME-53 | OG and Twitter meta | `tests/home/layout.e2e.cjs:22-27` | PASS |

**Status**: 51/53 fully match the spec outcome. There is 1 behavior gap (HOME-28, late-script path) and 1 unasserted path (HOME-27, head fallback, M29). Five wording or static-only flags are non-blocking (HOME-05, HOME-07, HOME-14, HOME-24 tolerance, HOME-33).

---

## Edge Cases

- [x] Hero image never arrives: 3.5s (`tests/home/loader.e2e.cjs:31-37`)
- [ ] `document.fonts` unsupported: handled at `assets/js/home.js:94`, no test (non-blocking, deferred by the coordinator)
- [x] Spotify embed stubbed (`tests/home/preview.e2e.cjs:37-44`)
- [x] Hash or restored scroll navbar (`tests/home/navbar.e2e.cjs:25-38`)
- [x] No singles (`tests/home/home-core.test.cjs:40-43`)
- [x] Late `home.js` on a repeat view: released at 0.4s (`tests/home/loader.e2e.cjs:48-65`)
- [ ] **Late `home.js` on a first view: content not inert while the loader is visible (HOME-28)**

---

## Gate Check

- **Gate command**: `npm run build && npm test`, run in the scratch at `75b1ca5`
- **Result**: build exit 0. Unit 65/65. Playwright 209 passed, 0 failed, 0 skipped.
- **Stability (defer regression check)**: `--repeat-each=5` over `loader`, `loader-style`, `tracking`, `scripts` and `navbar` specs: 155/155 passed, 0 flaky.
- **Delta vs round 2**: +1 e2e (HOME-24 late script). Nothing was removed or weakened.

---

## Discrimination Sensor

Depth: expanded. All 25 prior mutants were re-run and 5 new ones added for `7fe1711`. The runs are isolated, and LESS mutants were followed by `npm run less:build`.

| # | File:line | Mutation | Result |
| --- | --- | --- | --- |
| M1-M10 | `assets/js/home-core.js`, `assets/js/home.js` | as in round 2 | ✅ 10/10 killed |
| M11 | `assets/js/home.js:128-129` | no on-load navbar check | ⚠️ Survived, equivalent in Chromium (spec outcome holds) |
| M12-M22 | `_data/homeRelease.js`, `index.html`, `_layouts/home.html:47`, `less/home.less` | as in round 2 | ✅ 11/11 killed |
| M23 | `assets/js/home.js:81` | early-fire guard removed | ✅ Killed this round, but only by chance (HOME-25 received **1199.6ms**, `tests/home/loader.e2e.cjs:75`). This confirms the guard is needed; a `page.clock` test would make the kill reliable. |
| M24, M25 | `index.html:80`, `less/home.less:1478` | as in round 2 | ✅ Killed |
| M26 | `_layouts/home.html:27` | head fallback `400` -> `900` | ✅ Killed (loader.e2e:64) |
| M27 | `_layouts/home.html:27` | head fallback on every view (`if (true)`) | ✅ Killed (HOME-22 floor) |
| M28 | `_layouts/home.html:27` | `catch (e) {}` -> rethrow | ✅ Killed (HOME-25 / layout) |
| M29 | `_layouts/home.html:27` | head fallback no longer sets `aria-hidden="true"` | ❌ **Survived** (loader.e2e green) -> fix task |
| M30 | `_includes/js/home.liquid:3` | `defer` removed from `home.js` | ✅ Killed (loader.e2e:64) |

**Result**: 28/30 killed. M11 is equivalent. **M29 is a real survivor.**

**Isolation**: `git status --porcelain` of the real tree was captured before the round (the round-2 `validation.md` and lessons changes plus the untracked tool directories). It was identical after `git worktree remove --force` (diff empty). No `git stash` was used and nothing inside `docs/` was touched. The probe specs `tests/home/zz-probe.e2e.cjs` lived only in the scratch.

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code / surgical | ✅ One inline statement, two `defer` attributes and one devDependency |
| Matches patterns | ✅ The head script reuses the `home-core.js` key; there is a comment at `_layouts/home.html:26` |
| Spec-anchored outcome check | ❌ HOME-28 on the late-script path |
| Per-layer coverage | ❌ Head fallback a11y (M29) is unasserted |
| Every test maps to an AC | ✅ |
| Guidelines | none documented; strong defaults applied |

---

## Fix Plans (for the user's decision; the 3-round loop is exhausted)

### Fix A (Major, a11y): HOME-28 content not inert before `home.js` runs

- **Root cause**: `inert` is only applied by `assets/js/home.js:43`. Until the deferred script executes, the page under a visible loader stays focusable.
- **Fix task**:
  - Add a tiny inline script immediately after `<div class="home-page" data-home-page>` (`_layouts/home.html:68`). When `<html>` has `home-loading`, it sets `this`/the element `inert`, so no-JS stays untouched.
  - The head repeat-view timer (`:27`) must also clear `inert` at 400ms.
  - Add an inline un-inert fallback at the 4s failsafe (or 3.5s cap). A `home.js` 404 must never leave the page inert, since `inert` also blocks pointers. `tests/home/loader-style.e2e.cjs:31-40` must stay green and gain an `inert === false` assertion.
- **Test**: in `tests/home/loader.e2e.cjs`, run a first view with `home.js` +1500ms. At about 600ms assert `[data-home-page].inert === true`. Also assert it is false after dismissal.

### Fix B (Minor, test-only): kill M29

- Extend `tests/home/loader.e2e.cjs:48-65`: once off screen, assert `#home-loader[aria-hidden="true"]` (or `getByRole('status', {name:'Loading Insane Driver'})` count 0) *before* `home.js` arrives.

### Non-blocking (deferred by the coordinator)

- A `page.clock` test for M23
- The glitch layer's `aria-hidden` (HOME-07)
- A test for missing `document.fonts`
- Spec wording for HOME-05, HOME-14 and the HOME-24 tolerance

---

## Requirement Traceability Update (proposed; spec.md was not edited by the Verifier)

| Requirement | Previous | New |
| --- | --- | --- |
| HOME-24 | Needs Fix (round 2) | ✅ Verified |
| HOME-28 | Implemented | ❌ Needs Fix (late-script path) |
| HOME-27 | Implemented | ⚠️ Verified behavior; late-script path unasserted |
| HOME-05, HOME-14 | Implemented | ⚠️ Verified, wording for the user |
| All other HOME-xx | - | ✅ Verified |

---

## Summary

**Overall**: ❌ Not Ready. Escalate to the user; the 3 fix→re-verify rounds are used up.

**Spec-anchored check**: 51/53 fully match. HOME-28 is a behavior gap, HOME-27 has an unasserted path, and 5 flags are non-blocking.
**Sensor**: 28/30 killed (M11 equivalent, M29 survived).
**Gate**: 65 unit + 209 e2e passed. Defer stability: 155/155.

**What works**:
- the HOME-24 fix and the head/`home.js` hand-off
- `defer`, with no regression to the menu, tracking, navbar, failsafe or loader timing
- every AC fixed in earlier rounds

---

## Round 4 (user-approved fixes after escalation)

**Date**: 2026-09-30. **Commits**: `bb91776`, `8091291`. The user chose Fix A + B.

- **Fix A (HOME-28)**: an inline script at the top of `[data-home-page]` sets `inert` while `home-loading` is on, releasing at boot+4s (CSS failsafe). The head 0.4s timer also clears `inert`. Test: first view with `home.js` +1500ms is inert and Tab stays out of the page; the failsafe spec asserts `inert === false`.
- **Fix B (M29)**: the late-`home.js` repeat-view test asserts `aria-hidden="true"`, `inert === false` and no `status` role before `home.js` is delivered.
- **New defect found while testing (HOME-24)**: if `<head>` is still parsing at 0.4s, the head timer found no `#home-loader`, so a repeat view waited for `home.js` (probe: 2.8s). The timer now sets `window.IDHomeReleased`, and the inline body script finishes the release. Test: CSS +900ms and `home.js` +2500ms on a repeat view; the loader is released and the page is not inert before `home.js` arrives.

**Sensor (author-run, not independent)**: M29, M31 (head timer keeps inert), M32 (no body gate), M33 (no failsafe release), M34 (no released flag), M35 (flag branch does not release), M36 (flag branch drops aria-hidden) are 7/7 killed.

**Gate**: unit 65/65; Playwright 211/211 on rerun. `loader` + `loader-style` x5 is 95/95.

**Known pre-existing flake**: `HOME-24: a second home view ... at most 0.5s` sometimes measures 546-676ms under load. At `75b1ca5` it failed 2/30 in isolation; after these fixes it was 0/30. The cause is load-dependent parse time before the loader exists, not the fix.

**Result**: HOME-28 and M29 closed. Still deferred: the M23 `page.clock` test, the glitch `aria-hidden`, a missing `document.fonts` test, and the HOME-05/14/24 wording.

---

## Round 5 (codex review fixes and HOME-54)

**Date**: 2026-10-02. **Commits**: `e328991`, `d9bc6c6`.

- **HOME-01 (codex review)**: the hero had a fixed 100svh height with overflow clipped, so on an 844x390 landscape phone the logo fell off-screen and the navbar covered the release card. The hero is now at least 100svh tall and grows to fit its content. The 768-991px band also leaves room for the two-row navbar. AC1 is reworded. Test: landscape phones, where the hero grows to fit its content.
- **HOME-29 (codex review)**: under reduced motion, the loader's `requestAnimationFrame` loop kept widening the progress bar. The bar now holds still and only fills on dismissal. AC10 is reworded. Test: the bar does not move while the loader is up.
- **HOME-54 (new, user request)**: below 768px, the hero photo starts framed on a band member picked at random per load and pans across the band (45s per sweep). Under reduced motion it holds still on the picked member. From 768px up, nothing changes. Tests cover the random start positions, reduced motion, and the fixed framing at 768px and up.

**Gate**: unit 65/65; Playwright 219/219 (2026-10-03, after a fresh build).

**Result**: Ready for the user's review. The round-4 deferrals are still open.
