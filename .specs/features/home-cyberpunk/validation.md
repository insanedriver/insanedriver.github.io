# Home Cyberpunk Validation

## Validation: home-cyberpunk - PASS (round 6 re-verify, 2026-10-05)

The current verdict is PASS. See "Round 6 re-verify" at the end of this report. The sections below record each round in order. Earlier FAIL verdicts were closed by the round that followed them.

## Round 3 (of 3)

**Round-3 verdict (superseded by round 4)**: FAIL. The round-2 blocker HOME-24 is fixed and verified. The gate is green (unit 65/65, Playwright 209/209), and the `defer` change caused no regression: 155/155 green across 5 repeats of the loader, loader-style, tracking, scripts and navbar specs.

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

---

## Round 6 (NOW::STREAMING shuffle)

**Date**: 2026-10-05. **Diff range**: `4930fca..2cb7f75` (`6e8d1c6`, `3d6791f`, `2cb7f75`). **Verifier**: independent sub-agent (author ≠ verifier), read-only over the real tree; the mutants ran in a temporary `git worktree` at `2cb7f75` under the session scratchpad, removed afterwards. `git status --porcelain` on the real tree matched the pre-sensor baseline.

**Round-6 verdict (superseded by the re-verify)**: FAIL. The behavior is correct, but two mutants survive (M14 and M15/M16). Both are test-only fixes.

### Spec-anchored acceptance criteria (round-6 scope)

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| P1 AC6 (spec.md:99) | The panel shows the cover, title, eyebrow `SHUFFLE // SINGLE // YYYY.MM.DD`, the exact lead, one anchor per platform in `links`, `/discography/`, and PREVIEW | `tests/home/panels.e2e.cjs:42` `toHaveText('SHUFFLE // SINGLE // 2025.02.21')`, `:44` exact lead, `:47` anchor keys `toEqual(fallbackKeys)`, `:55` `href '/discography/'`; `tests/home/hero-template.test.cjs:61-71` (same values at template level); `tests/home/shuffle.e2e.cjs:26,33` (eyebrow and anchors after the shuffle) | ✅ PASS |
| P1 AC8 (spec.md:101) | PREVIEW embeds the single shown in the panel | `tests/home/shuffle.e2e.cjs:82` iframe `src` = `embed/album/${pool[5].embedId}`; `tests/home/preview.e2e.cjs:4,11` (pinned pool[0] embed) | ✅ PASS |
| P1 AC10 (spec.md:103) | A shown single with no id keeps PREVIEW hidden; it ships with an empty id | `tests/home/hero-template.test.cjs:58` `data-home-preview-btn="" ... hidden>`; `tests/home/shuffle.e2e.cjs:73` `toBeHidden()` for a shuffled single with no id; `tests/home/home-shuffle.test.cjs:30` `embedId === null` | ✅ PASS |
| P1 AC11 (spec.md:104) | With no JS, PREVIEW is hidden and every anchor is clickable | `tests/home/panels.e2e.cjs:61-63` `toBeHidden()`, count = `fallbackKeys.length`, each `toBeVisible()` | ✅ PASS |
| P1 AC12 / HOME-55 (spec.md:105) | The pool holds every single except the hero release, with no albums, newest first | `tests/home/home-core.test.cjs:143` `['new','mid','old']`; `:147-150` length = singles-1, no `keep-away-acoustic`, no non-SINGLE; `:156` album hero keeps every single; `tests/home/home-shuffle.test.cjs:7` length 17 | ✅ PASS |
| P1 AC13 / HOME-56 (spec.md:106) | A uniform pick per load replaces cover src/alt/**width/height**, title, date, anchors, embed id and HUD, with no memory | `tests/home/home-core.test.cjs:167-172` floor mapping at 0/.2499/.25/.6/.9999; `tests/home/shuffle.e2e.cjs:46-53` pinned draws of pool[0], [7], [16]; `:23-43` (`expectShows`): slug, HUD `SIGNAL.<SLUG> // STREAMING_`, h2, eyebrow, src, alt, anchors, embed id; `:55-61` reload with the same draw shows the same single | ⚠️ GAP: the width/height assertions (`:30-31`) cannot fail, because every cover in `_data/discography.json` is 600x600 and the `odd` fixture (`:64`) copies pool[0]'s size. M14 survives. |
| P1 AC14 / HOME-57 (spec.md:107) | With no JS, the panel shows the newest pool single (Waiting for You) | `tests/home/panels.e2e.cjs:34-56` HUD `SIGNAL.WAITING-FOR-YOU // STREAMING_`, h2 `Waiting for You.`, src, alt; `tests/home/home-shuffle.test.cjs:8-20` `pool[0]` deepEqual | ✅ PASS |
| P1 AC15 / HOME-58 (spec.md:108) | An empty pool renders no panel | `tests/home/hero-template.test.cjs:80-84` `doesNotMatch(/NOW::STREAMING/)`, `doesNotMatch(/data-home-shuffle/)`; `tests/home/home-core.test.cjs:159-163` `[]` | ✅ PASS |
| P2 AC1 / HOME-49 (spec.md:203) | A streaming click reports the slug of the shown single; a hero click reports the hero slug | `tests/home/tracking.e2e.cjs:46` `release: SHUFFLED` (pool[4], pinned at `:26`); `:31-38` hero `release: SLUG` | ✅ PASS |
| Edge (spec.md:220) | Missing **or** unparseable shuffle data keeps the server-rendered single | `tests/home/shuffle.e2e.cjs:85-90` (unparseable only): `expectShows(page, pool[0])` | ⚠️ GAP: no test covers missing data (M16 survives). The unparseable test does not check that the rest of `home.js` still runs (M15 survives). |
| Inline JSON safety (Assumptions row) | `<` is escaped and the JSON equals the pool | `tests/home/home-shuffle.test.cjs:38-39` `!json.includes('<')`, deepEqual; `tests/home/hero-template.test.cjs:73-77` | ✅ PASS |

**Regression check (previously verified)**: hero card HOME-10..13 (`tests/home/hero.e2e.cjs:40`, `tests/home/hero-template.test.cjs:34-46`, `tests/home/hero-style.e2e.cjs:52`) and HOME-15/16/17 preview (`tests/home/preview.e2e.cjs:17-45`) are all green. The HOME-12 template tests dropped their streaming assertions because the panel no longer shows the hero release. That coverage now lives in `tests/home/hero-template.test.cjs:48-52` and `tests/home/shuffle.e2e.cjs:63-74`.

**Spec-precision notes (non-blocking)**: "uniformly at random" is verified structurally: the `pickShuffle` floor mapping is exact (`home-core.test.cjs:165`), and pinning `Math.random` drives the pick in e2e. No statistical test exists, and none is needed. In `spec.md:287`, the traceability footer reads "58 total, 0 mapped, 54 unmapped". The arithmetic is stale.

### Discrimination sensor (worktree at `2cb7f75`; unit = `node --test tests/*/*.test.cjs`, e2e = shuffle + tracking + preview + panels)

| # | File | Mutation | Result |
| --- | --- | --- | --- |
| M1 | `assets/js/home-core.js:37` | The pool keeps the hero release (`!== featured` → `true`) | ✅ Killed (unit) |
| M2 | `assets/js/home-core.js:42` | The pool sort is reversed (oldest first) | ✅ Killed (unit) |
| M3 | `assets/js/home-core.js:48` | `pickShuffle` always returns `pool[0]` | ✅ Killed (unit) |
| M4 | `assets/js/home-core.js:48` | `Math.floor` → `Math.round` (off by one) | ✅ Killed (unit) |
| M11 | `_data/homeShuffle.js:30` | The `<` escaping is removed | ✅ Killed (unit) |
| M12 | `index.html:64` | An empty pool still renders the panel (`{% if true %}`) | ✅ Killed (unit) |
| M18 | `_data/homeShuffle.js:20` | `embedId` drops the URL fallback (`single.spotifyId`) | ✅ Killed (unit) |
| M19 | `_data/homeShuffle.js:9` | Empty link values are kept | ✅ Killed (unit) |
| M5 | `assets/js/home.js:146` | `shuffle()` always draws index 0 | ✅ Killed (6 e2e) |
| M6 | `assets/js/home.js:164` | The server anchors are not cleared before the rebuild | ✅ Killed (6) |
| M6b | `assets/js/home.js:171` | Rebuilt anchors are never appended | ✅ Killed (7) |
| M7 | `assets/js/home.js:156` | The HUD is not updated | ✅ Killed (4) |
| M8 | `assets/js/home.js:174` | The PREVIEW embed id is not updated | ✅ Killed (5) |
| M9 | `assets/js/home.js:162` | The eyebrow date is not updated | ✅ Killed (4) |
| M10 | `assets/js/home.js:220` | A streaming click reports the hero slug | ✅ Killed (1) |
| M13 | `assets/js/home.js:237` | `preview()` runs before `shuffle()` | ✅ Killed (2) |
| M17 | `assets/js/home.js:168` | An anchor is appended for every platform, even with no URL | ✅ Killed (5) |
| M20 | `assets/js/home.js:155` | `data-home-streaming` keeps the default slug | ✅ Killed (5) |
| M21 | `assets/js/home.js:237-239` | `shuffle()` runs after `tracking()` | ✅ Killed (3) |
| M14 | `assets/js/home.js:159-160` | The cover `width`/`height` are not replaced | ❌ **Survived** |
| M15 | `assets/js/home.js:141-145` | The `try/catch` around `JSON.parse` is removed, so bad data throws and PREVIEW and tracking never initialise | ❌ **Survived** |
| M16 | `assets/js/home.js:139` | The `!data` guard is removed, so missing data throws a TypeError | ❌ **Survived** (the missing-data path has no test) |

**Sensor depth**: expanded (22 mutants). **Sensor score (round 6)**: 19/22 killed, which failed the sensor until the re-verify below.

### Gate

- **Command**: `npm run build && npm test` (Build gate, tasks.md).
- **Unit**: 77/77 (round 5: 65).
- **Playwright**: 225 passed, 1 failed (226 total; round 5: 219). The failure was `tests/home/loader.e2e.cjs:39` HOME-24 "flashes for at most 0.5s" at 578.5ms. This is the known load-dependent flake documented in round 4. Rerun in isolation with `--repeat-each=15`: 15/15 pass. The round-6 diff does not touch it.
- **Test integrity**: no test was deleted without a replacement. The old HOME-14 JS-on test was replaced by the no-JS HOME-14/57 test and `shuffle.e2e.cjs`. The old HOME-18 template test was replaced by `hero-template.test.cjs:54`.

### Code quality

The changes are minimal and match the existing patterns: the `home-core` UMD export, `_data/*.js` loaders, and `data-home-*` hooks. The shared `streaming-link.liquid` include avoids duplicating the anchor markup between the panel and `<template>`. The JSON uses an escaped `<`, and `textContent` is used for the title and date. Every new test maps to HOME-55..58, HOME-49, HOME-16/18 or the new edge case.

### Fix plans (test-only)

1. **Fix R6-A (Minor, HOME-56 / M14)**: in `tests/home/shuffle.e2e.cjs:63-74`, give the `odd` fixture a cover size that differs from 600x600 (for example `coverWidth: 640, coverHeight: 480`). `expectShows` then kills M14.
2. **Fix R6-B (Minor, edge case / M15, M16)**: extend `tests/home/shuffle.e2e.cjs:85-90` to also assert that the page still works after bad data. Either PREVIEW is visible and opens the pool[0] embed, or a streaming click pushes `release: 'waiting-for-you'`. Then add a missing-data variant that strips the `<script data-home-shuffle>` element (`serveShuffle` would need a remove mode) with the same assertions.

**Summary**: 9/11 round-6 rows verified. 2 rows have test gaps, and the behavior is correct for both. The sensor killed 19/22. Unit 77/77; Playwright 225/226, and the 1 failure is the pre-existing HOME-24 flake, which passed 15/15 on rerun.

## Round 6 re-verify (fix `6d2810f`)

**Date**: 2026-10-05. **Diff range**: `2cb7f75..6d2810f` (`tests/home/shuffle.e2e.cjs` and the `spec.md` coverage footer only; no product code changed). **Verifier**: independent sub-agent (author ≠ verifier), read-only over the real tree. The mutants ran in a temporary `git worktree` at `6d2810f` under the session scratchpad, which was removed and pruned afterwards. `git status --porcelain` on the real tree matched the baseline before the sensor, after it, and after the gate.

**Result**: PASS. Fix R6-A kills M14 and fix R6-B kills M15. M16 is an equivalent mutant: `data.textContent` is read inside the `try` (`assets/js/home.js:141-145`), so with the `!data` guard gone the TypeError is caught and `shuffle()` still returns. The new missing-data test kills the non-equivalent form of M16 (M16b).

### Spec-anchored check of the fix

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| P1 AC13 / HOME-56 (spec.md:106) | The pick replaces the cover `width`/`height` | `tests/home/shuffle.e2e.cjs:66` the `odd` fixture is 640x480, which differs from every 600x600 catalog cover; `:72` `expectShows(page, odd)` asserts `width` = `640` and `height` = `480` (`:31-32`) | ✅ PASS (kills M14) |
| Edge (spec.md:220) | Unparseable shuffle data keeps the server-rendered single | `tests/home/shuffle.e2e.cjs:103-109` (`unparseable`, body `{not json`) → `expectDefaultStillWired`: `:91` `expectShows(page, pool[0])`, `:94` PREVIEW iframe `src` = `embed/album/${pool[0].embedId}`, `:98-100` the `dataLayer` holds exactly one `home_release_click` with `release: pool[0].slug, placement: 'streaming'` | ✅ PASS (kills M15) |
| Edge (spec.md:220) | Missing shuffle data keeps the server-rendered single | `tests/home/shuffle.e2e.cjs:16` `body === null` strips the whole `<script data-home-shuffle>`; `:17` throws if nothing was stripped, so the test cannot pass vacuously; `:103-109` (`missing`) runs the same assertions | ✅ PASS (kills M16b) |

**Test integrity**: no test was deleted or weakened. The old unparseable test (`expectShows(page, pool[0])` only) is now the `unparseable` case of the loop, with PREVIEW and tracking assertions added. The `odd` fixture only gained `coverWidth`/`coverHeight`. `spec.md:287` now has correct arithmetic: HOME-01..53 map to T1-T20, and HOME-54..58 come from rounds 5 and 6.

### Discrimination sensor (worktree at `6d2810f`; e2e = shuffle + tracking + preview + panels, 23 tests; baseline 23/23 green, unit 77/77)

| # | File | Mutation | Result |
| --- | --- | --- | --- |
| M14 | `assets/js/home.js:159-160` | The cover `width`/`height` are not replaced | ✅ Killed (1: `shuffle.e2e.cjs:64`) |
| M15 | `assets/js/home.js:141-145` | The `try/catch` around `JSON.parse` is removed | ✅ Killed (1: `shuffle.e2e.cjs:104` unparseable) |
| M16 | `assets/js/home.js:139` | `if (!data \|\| !section)` → `if (!section)` | ⚪ Equivalent (23/23 pass). The null dereference `data.textContent` happens inside the `try` at `:142`, so it is caught and no behavior changes. |
| M16b | `assets/js/home.js:139-142` | Guard removed and `data.textContent` read before the `try` (missing data now throws) | ✅ Killed (1: `shuffle.e2e.cjs:104` missing) |
| M5 | `assets/js/home.js:146` | `shuffle()` always draws index 0 | ✅ Killed (6), regression sample |
| M8 | `assets/js/home.js:174` | The PREVIEW embed id is not updated | ✅ Killed (5), regression sample |
| M10 | `assets/js/home.js:212` | A streaming click reports the hero slug | ✅ Killed (3: `tracking.e2e.cjs:40` and both new edge tests), regression sample |

**Sensor depth**: targeted (3 survivors + 1 non-equivalent variant + 3 regression samples). **Result**: 6/6 non-equivalent mutants killed; M16 is equivalent. With round 6, that is 21/21 non-equivalent mutants killed.

### Gate

- **Command**: `npm run build && npm test` in the real tree (exit 0).
- **Unit**: 77/77.
- **Playwright**: 227/227 passed (round 6: 225/226). The +1 is the new missing-data edge test. The HOME-24 loader flake did not fire this run.

**Summary**: R6-A and R6-B are verified. Round 6 now passes: 11/11 round-6 rows are verified, every non-equivalent mutant is killed, unit 77/77, and Playwright 227/227.
