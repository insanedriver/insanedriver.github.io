# ID-TV Video Player Validation

**Date**: 2026-09-20
**Spec**: `.specs/features/videos-player/spec.md`
**Diff range**: `175a5f8..HEAD` (branch `feature/videos-player`, HEAD `7b4f7db`)
**Verifier**: independent sub-agent (author != verifier), read-only over the real tree
**Round**: 2 (round 1 verdict was FAIL on two surviving mutants; fixes landed in `3b08a3f`, `7b4f7db`)

## Validation: videos-player - PASS ✅

All 29 acceptance criteria are implemented and backed by assertions that target the
spec-defined outcome. Both round-1 blockers are fixed and their mutants now die. The gate is
green at 93 tests. Two items stay open and are tracked below as non-blocking: an iOS autoplay
risk that no browser stub can model, and one Minor test-placement weakness (M18).

---

## Round 1 -> Round 2

| Round-1 gap | Fix commit | Now |
| ----------- | ---------- | --- |
| Gap 1 - VPLR-16 `NOW PLAYING` literal unasserted (mutant M13 survived) | `3b08a3f` | ✅ Closed - `tests/videos/markup.e2e.cjs:46`; M13 killed |
| Gap 2 - VPLR-18 no-`wheel`-`preventDefault` unasserted (mutant M14 survived) | `3b08a3f` | ✅ Closed - `tests/videos/theme.e2e.cjs:34`; M14 killed |
| Gap 3 - VPLR-09 owning test could not observe playback (mutant M12) | `3b08a3f` | ✅ Closed - `tests/videos/select.e2e.cjs:63`; M12 killed by its own test |
| Gap 4 - iOS autoplay after async API load | not fixed | ⚠️ Open risk, non-blocking (see Open Risks) |
| Gap 5 - unescaped `slug`/`id`/`type` in attributes | `7b4f7db` | ✅ Closed - `videos/index.html:66,68` + `tests/videos/videos-data.test.cjs:31` |
| Gap 6 - VPLR-23 stated as a visual description | `7b4f7db` | ✅ Closed - `spec.md:121` now states the stacking-order outcome |
| Gap 7 - unreachable IFRAME check in keydown | `7b4f7db` | ✅ Closed - removed; handler now `assets/js/videos.js:153-162` |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1-T12 | ✅ Done | all committed, no unchecked "Done when" boxes |
| FT1 cover the three unasserted clauses | ✅ Done | `3b08a3f` |
| FT2 escape attributes, constrain ids, drop dead code | ✅ Done | `7b4f7db` |
| FT3 restate VPLR-23 as stacking order | ✅ Done | `7b4f7db` |

---

## Spec-Anchored Acceptance Criteria

Re-derived independently against `spec.md` at `7b4f7db`. Criteria unchanged since round 1 keep
their round-1 evidence; the four the coordinator asked about are re-cited from the new code.

| Criterion | Spec-defined outcome | `file:line` + assertion expression | Verdict |
| --------- | -------------------- | ---------------------------------- | ------- |
| VPLR-01 one card per entry, file order | 10 cards, catalog slug order | `tests/videos/markup.e2e.cjs:12` `expect(cards).toHaveCount(10)`; `:13` `expect(...dataset.slug).toEqual(videos.map(v => v.slug))` | ✅ PASS |
| VPLR-02 thumb + short title + type | ytimg hqdefault, prefix stripped, type label | `tests/videos/markup.e2e.cjs:20` `toHaveText(short(v.title))`; `:21` `toHaveText(v.type)`; `:22` `toHaveAttribute('src', 'https://i.ytimg.com/vi/${v.id}/hqdefault.jpg')`; `tests/videos/videos-core.test.cjs:7` `equal(shortTitle(...), 'Ghosts [Official Lyric Video]')` | ✅ PASS |
| VPLR-03 card is `<a>` to watch URL | `https://www.youtube.com/watch?v=<id>` | `tests/videos/markup.e2e.cjs:30` `expect(el.tagName).toBe('A')`; `:31` `toHaveAttribute('href', ...)` | ✅ PASS |
| VPLR-04 no iframe in served shell | 0 `<iframe>` inside `.videos-shell` | `tests/videos/markup.e2e.cjs:39` `expect(shell).not.toMatch(/<iframe/i)`; `:41` `toHaveCount(0)` | ✅ PASS |
| VPLR-05 catalog shape, order, id format | 10 entries, unique id/slug, kebab-case, exact order, valid YouTube ids | `tests/videos/videos-data.test.cjs:6` `deepEqual(slugs, [...])`; `:10` `deepEqual(ids, [...])`; `:17-18` `equal(new Set(...).size, 10)`; `:19` `match(v.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)`; **`:31` `assert.match(v.id, /^[A-Za-z0-9_-]{11}$/)`** (new) | ✅ PASS |
| VPLR-06 poster only on load | 0 iframes, no youtube host request | `tests/videos/select.e2e.cjs:13` `toHaveCount(0)`; `:14` `expect(hosts.filter(/youtube(-nocookie)?\.com/)).toEqual([])`; `:15` `toBeVisible()` | ✅ PASS |
| VPLR-07 play -> one nocookie iframe, autoplay | nocookie host, selected id, autoplay 1 | `tests/videos/embed.e2e.cjs:13` `toHaveCount(1)`; `:14` `toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/.../)`; `:15` `expect(__yt.configs[0].playerVars.autoplay).toBe(1)` | ✅ PASS |
| VPLR-08 card click switches, `aria-current` exclusive | exactly 1 `aria-current="true"` | `tests/videos/select.e2e.cjs:25` `toHaveCount(1)`; `:26` `toHaveAttribute('aria-current','true')`; `tests/videos/embed.e2e.cjs:25` `toHaveAttribute('data-video-id', videos[2].id)` | ✅ PASS |
| **VPLR-09 re-click active card does not restart** | playback continues, the same id is not reloaded | **`tests/videos/select.e2e.cjs:63` `expect(await page.evaluate(() => window.__yt.loads)).toEqual([])`; `:64` `expect(__yt.players.length).toBe(1)`; `:65` `toHaveAttribute('data-video-id', videos[3].id)`** - the test now stubs the API (`:56`), plays card 4, then re-clicks it twice | ✅ PASS (was ⚠️) |
| VPLR-10 rapid selections resolve to last | last id, 1 iframe, 1 player | `tests/videos/embed.e2e.cjs:47-50` `toHaveCount(1)` + `toHaveAttribute('data-video-id', videos[5].id)` + `expect(__yt.players.length).toBe(1)` | ✅ PASS |
| VPLR-11 unknown/empty/wrong-case hash -> first | index 0, URL as loaded | `tests/videos/nav.e2e.cjs:24` `toHaveText('01 / 10')`; `:26` `expect(page.url()).toBe(loaded)`; `tests/videos/videos-core.test.cjs:43` `equal(indexFromHash('#Ghosts', slugs), 0)` | ✅ PASS |
| VPLR-12 NEXT/PREV wrap both ways | 10->1, 1->10, playback starts | `tests/videos/advance.e2e.cjs:27-28`; `:33-34`; `tests/videos/videos-core.test.cjs:25-26` `equal(step(9,1,10), 0)` / `equal(step(0,-1,10), 9)` | ✅ PASS |
| VPLR-13 end + AUTO on -> next (wrapping) | next id loaded and playing | `tests/videos/advance.e2e.cjs:56-58`; `:65-66` wrap | ✅ PASS |
| VPLR-14 API fail / 8s timeout -> poster + message + link | poster shown, `YouTube unavailable`, `Watch on YouTube`, at 8s not before | `tests/videos/fallback.e2e.cjs:15` `toContainText('YouTube unavailable')`; `:16` `toHaveText('Watch on YouTube')`; `:17` `toHaveAttribute('href', ...)`; `:18` `expect('[data-idtv-poster]').toBeVisible()`; `:27-30` `clock.runFor(7900)` -> hidden, `runFor(200)` -> visible | ✅ PASS (poster clause weakly placed - see M18) |
| VPLR-15 feed stays live, link follows selection | link retargets to the new video | `tests/videos/fallback.e2e.cjs:42` `toHaveAttribute('href','...v=${videos[3].id}')`; `:44` `...v=${videos[4].id}` | ✅ PASS |
| **VPLR-16 `NOW PLAYING` + title + `NN / 10`** | literal `NOW PLAYING`, active title, zero-padded counter | **`tests/videos/markup.e2e.cjs:46` `expect(page.locator('.videos-now .videos-eyebrow')).toHaveText('NOW PLAYING')`; `:47` `toHaveText('Keep Away [Official Music Video]')`**; counter `tests/videos/select.e2e.cjs:22` `toHaveText('04 / 10')`, `:33` `'10 / 10'`, `tests/videos/markup.e2e.cjs:52` `'01 / 10'`; padding `tests/videos/videos-core.test.cjs:17-19` | ✅ PASS (was ❌) |
| VPLR-17 active card scrolled fully visible | card box inside feed box | `tests/videos/select.e2e.cjs:42` `card.x >= feed.x - 1 && card.x + card.width <= feed.x + feed.width + 1` polled to `true` | ✅ PASS |
| **VPLR-18 scroll-snap, native scroll, no `wheel` `preventDefault`** | `scroll-snap-type: x`, `overflow-x: auto`, wheel never cancelled | `tests/videos/theme.e2e.cjs:22` `toHaveCSS('overflow-x','auto')`; `:23` `expect(scrollSnapType).toContain('x')`; `:24` `scrollWidth > clientWidth`; **`:34` `expect(cancelled).toBe(false)` after dispatching a cancelable `WheelEvent` on `[data-idtv-feed]` (`:29-33`)** | ✅ PASS (was ❌) |
| VPLR-19 cyber-zone/panel/tab/corners | 2 panels, tab + 3 corners each | `tests/videos/markup.e2e.cjs:59` `toHaveCount(1)`; `:60-67` panels and accents each `toHaveCount(1)` | ✅ PASS |
| VPLR-20 transparent zone, `bodybg.jpg` visible | `#content` bg contains `bodybg`, zone transparent | `tests/videos/theme.e2e.cjs:5` `toContain('bodybg')`; `:6` `toHaveCSS('background-color','rgba(0, 0, 0, 0)')` | ✅ PASS |
| VPLR-21 palette + fonts | `#00f3ff`, `#005f8c`, `#ff00ea`, Rajdhani, Share Tech Mono | `tests/videos/theme.e2e.cjs:11` `rgb(0, 243, 255)`; `:12` `rgb(0, 95, 140)`; `:13` `rgb(255, 0, 234)`; `:15` `toContain('Rajdhani')`; `:16` `toContain('Share Tech Mono')` | ✅ PASS |
| VPLR-22 reduced motion -> no animation/transition | `animation-name: none`, `transition-duration: 0s` | `tests/videos/theme.e2e.cjs:47` `expect(animation).toBe('none')`; `:48` `expect(transition).toBe('0s')`; `:50-51` pseudo-elements `toBe('none')` | ✅ PASS |
| **VPLR-23 scanline stacks below `.cyber-zone-inner`** | `z-index` of `.cyber-zone-inner` > scanline's; stage inside inner | spec now states the outcome at `.specs/features/videos-player/spec.md:121`; **`tests/videos/theme.e2e.cjs:61` `expect(stacking.stageInsideInner).toBe(true)`; `:62` `expect(stacking.inner).toBeGreaterThan(stacking.scanline)`** (101 vs 100, `less/videos.less:51,71`) | ✅ PASS (was ⚠️ spec-precision gap) |
| VPLR-24 no horizontal scroll at 375/1280, 16:9 | `scrollWidth <= innerWidth`, ratio 16/9 | `tests/videos/theme.e2e.cjs:69` `expect(scrollWidth <= innerWidth).toBe(true)`; `:71` `toBeLessThan(0.02)`; `:72` `toBeLessThanOrEqual(width)` | ✅ PASS |
| VPLR-25 end + AUTO off -> nothing | index unchanged, nothing loaded | `tests/videos/advance.e2e.cjs:75` `toHaveText('01 / 10')`; `:77` `expect(__yt.loads).toEqual([])` | ✅ PASS |
| VPLR-26 AUTO `aria-pressed="true"`, flips | true -> false -> true | `tests/videos/advance.e2e.cjs:45`, `:47`, `:49` `toHaveAttribute('aria-pressed', ...)` | ✅ PASS |
| VPLR-27 arrows scoped to the player section | in-scope NEXT/PREV, out-of-scope inert | `tests/videos/nav.e2e.cjs:57` `'02 / 10'`; `:59` `'01 / 10'`; `:67` card focus `'02 / 10'`; `:76` `.menu-font` focus -> `'01 / 10'`; `:77` `toHaveCount(0)` | ✅ PASS |
| VPLR-28 `#<slug>` via `replaceState` | hash set, `history.length` unchanged | `tests/videos/nav.e2e.cjs:35` `toBe('#ghosts')`; `:37` `'#distant-hearts'`; `:38` `expect(history.length).toBe(before)` | ✅ PASS |
| VPLR-29 `#<slug>` on load -> poster, no autoplay | `09 / 10`, 0 iframes, 0 API requests | `tests/videos/nav.e2e.cjs:11` `toHaveText('09 / 10')`; `:16` `toHaveCount(0)`; `:17` `expect(api.requests).toBe(0)` | ✅ PASS |

**Status**: ✅ 29/29 ACs covered with assertions matching the spec-defined outcome. No
spec-precision gaps remain.

---

## Discrimination Sensor

Isolated scratch: `git worktree add --detach <scratchpad>/mut2 HEAD` with `node_modules`
symlinked; each mutant reverted with `git checkout -- .`; worktree removed with
`git worktree remove --force`. Playwright runs were sequential (port 4178,
`reuseExistingServer: false`). The real tree was never edited; no `git stash` was used.

| # | Mutation | File:line | Description | Killed? |
| - | -------- | --------- | ----------- | ------- |
| M12 | idempotency guard removed | `assets/js/videos.js:36` | drop `state.loadedId === currentId()` from `syncPlayer` | ✅ Killed by its own AC test now (`select.e2e.cjs:63`) - round 1 it survived there |
| M13 | `NOW PLAYING` label changed | `videos/index.html:42` | `NOW PLAYING` -> `TRANSMITTING` | ✅ Killed (`markup.e2e.cjs:46`) - **survived in round 1** |
| M14 | wheel hijack added | `assets/js/videos.js:152` | add `feed.addEventListener('wheel', e => { e.preventDefault(); ... })` | ✅ Killed (`theme.e2e.cjs:34`) - **survived in round 1** |
| M15 | no scroll-into-view | `assets/js/videos.js:112` | remove the `feed.scrollTo(...)` call | ✅ Killed (`select.e2e.cjs:42`) |
| M16 | wrong poster resolution | `assets/js/videos-core.js:19` | `hqdefault.jpg` -> `mqdefault.jpg` | ✅ Killed (`videos-core.test.cjs:13`) |
| M17 | `shortTitle` strips the prefix anywhere | `assets/js/videos-core.js:11` | prefix test -> `title.split(PREFIX).pop()` | ✅ Killed (`videos-core.test.cjs:8`) |
| M18 | fallback no longer restores the poster | `assets/js/videos.js:44` | drop `poster.hidden = false` from `showFallback()` | ❌ **Survived** (49/49 videos e2e green) |
| M19 | fallback link not retargeted in `select()` | `assets/js/videos.js:129` | remove `fallbackLink.href = core.watchUrl(id)` | ❌ Survived - **equivalent mutant**, see below |

**Sensor depth**: expanded (8 mutations this round; 14 in round 1, 22 total)
**Outcome**: 6/8 killed; 1 genuine survivor (M18, Minor); 1 equivalent mutant (M19, not a
coverage gap) - PASS ✅

**M19 is an equivalent mutant, not a test gap.** `fallbackLink.href` has exactly two writers:
`showFallback()` at `assets/js/videos.js:42` and `select()` at `:129`. The fallback element
only ever becomes visible inside `showFallback()` (`:43`), which always writes the href from
`currentId()` first. The `select()` write is therefore unobservable on every path, so no test
can distinguish the mutant. The line is dead weight, not missing coverage - removing it is a
tidy-up, not a fix.

**M18 is a genuine but Minor survivor.** `poster.hidden = false` in `showFallback()` matters
only on one path: the player was created and playing (so `:97` had set `poster.hidden = true`)
and then `onError` fired. `tests/videos/fallback.e2e.cjs:47-57` exercises exactly that path but
asserts only the message and the link, never the poster. The other VPLR-14 test asserts poster
visibility at `:18`, but on the API-abort path the poster was never hidden, so that assertion
holds trivially and cannot discriminate. Real-world impact is small: `.videos-fallback` is
`position: absolute; inset: 0` with an 88%-opaque background (`less/videos.less:250-251`), so
the viewer sees the message either way - the iframe would just stay mounted underneath instead
of the poster being restored. Recorded as follow-up Fix 2, not a blocker, because VPLR-14's
poster clause does have a spec-matching assertion (`fallback.e2e.cjs:18`); it is placed on a
path where it cannot fail.

**Isolation check**: `git status --porcelain` before the sensor and after worktree removal are
identical (`.specs/LESSONS.md` and `.specs/lessons.json` modified by this Verifier's round-1
distillation, plus the 9 pre-existing untracked tool dirs). Sensor run is valid.

---

## Gate Check

- **Gate command**: `npm run build && npm test` (Build level, `tasks.md` Gate Check Commands)
- **Outcome**: exit 0 - unit 14 passed / 0 failed / 0 skipped; Playwright 79 passed / 0 failed
- **Test count round 1**: 13 unit + 76 e2e = 89
- **Test count round 2**: 14 unit + 79 e2e = 93
- **Delta**: +1 unit (id format), +3 e2e (`NOW PLAYING`, wheel, active-card re-click); no test
  deleted, no assertion weakened or loosened
- **Skipped tests**: none
- **Failures**: none

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ fixes are 3 tests + 3 `escape` filters + 1 deleted line |
| Surgical changes | ✅ no production behavior changed except removing unreachable code |
| No scope creep | ✅ nothing added beyond the round-1 gap list |
| Matches patterns | ✅ new tests reuse `stubYouTube` and the existing locator helpers |
| Spec-anchored outcome check | ✅ 29/29 assert the spec-defined outcome |
| Per-layer Coverage Expectation met | ✅ data + pure logic 1:1 unit; markup/theme/controller e2e happy + edge + error |
| Every test maps to a spec requirement | ✅ all 93 test titles carry a requirement id; no unclaimed tests |
| Documented guidelines followed | ✅ none exist (`AGENTS.md`/`CONTRIBUTING.md` absent) - strong defaults + `tests/photos/*` as the floor |

---

## Edge Cases

- [x] `#Ghosts` (case differs from slug) -> first video - `tests/videos/nav.e2e.cjs:20-28`
- [x] Viewport < 768px keeps 16:9 filling the panel - `tests/videos/theme.e2e.cjs:65-74` at 375px
- [x] Empty hash / `#` / unknown slug -> first video, URL untouched - `tests/videos/nav.e2e.cjs:26`
- [x] Player error mid-playback -> fallback, and selecting another card retries - `tests/videos/fallback.e2e.cjs:53-57`
- [x] Catalog id must be a well-formed YouTube id - `tests/videos/videos-data.test.cjs:31`

---

## Open Risks (non-blocking)

### Risk 1: autoplay may not start on iOS when the API resolves after the click

- **What**: `createPlayer()` (`assets/js/videos.js:53-75`) runs from `onYouTubeIframeAPIReady`
  (`:80-84`), which fires on script load - after the click's transient user activation has
  expired. Chrome generally still allows playback via sticky activation; iOS Safari commonly
  blocks autoplay-with-sound from a non-gesture callback, which would leave the poster hidden
  (`:97`) over a paused player.
- **Why it is not a blocker**: no acceptance criterion constrains cross-browser autoplay
  policy, and no browser stub can model it - `tests/videos/yt-stub.cjs` has no policy engine.
  It is a real-device UAT item, not a spec gap.
- **Suggested mitigation**: call `event.target.playVideo()` in `onReady`, and keep the poster
  visible while the player state stays `UNSTARTED`/`PAUSED`.
- **Priority**: Major (real-world) - needs a manual pass on iOS Safari before release

---

## Follow-ups (non-blocking)

### Fix 1: Remove the redundant `fallbackLink.href` write in `select()` (mutant M19)

- **Root cause**: `assets/js/videos.js:129` is unobservable - `showFallback()` (`:42`) always
  rewrites the href before the fallback becomes visible.
- **Fix task**: delete the line; `tests/videos/fallback.e2e.cjs:42,44` must stay green.
- **Priority**: Cosmetic

### Fix 2: Assert the poster is restored when the player errors mid-playback (mutant M18)

- **Root cause**: `tests/videos/fallback.e2e.cjs:47-57` drives the `onError`-after-playing path
  but never asserts poster visibility, so dropping `poster.hidden = false` at
  `assets/js/videos.js:44` ships green.
- **Fix task**: in that test, after `window.__ytError()`, add
  `await expect(page.locator('[data-idtv-poster]')).toBeVisible();`
- **Verify**: re-run mutant M18; the suite must fail.
- **Priority**: Minor

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| VPLR-01..08, 10..15, 17, 19..22, 24..29 | Implementing / ✅ Verified | ✅ Verified |
| VPLR-09 | ⚠️ Verified (weak owning test) | ✅ Verified (`select.e2e.cjs:63`) |
| VPLR-16 | ❌ Needs Fix | ✅ Verified (`markup.e2e.cjs:46`) |
| VPLR-18 | ❌ Needs Fix | ✅ Verified (`theme.e2e.cjs:34`) |
| VPLR-23 | ⚠️ Verified via z-index proxy | ✅ Verified (`spec.md:121`, `theme.e2e.cjs:62`) |

---

## Summary

**Overall**: ✅ Ready - with one open real-device risk and two cosmetic/minor follow-ups

**Spec-anchored check**: 29/29 ACs matched the spec-defined outcome; 0 spec-precision gaps
**Sensor**: 6/8 killed this round (22 mutations total across both rounds); 1 equivalent mutant; 1 Minor survivor tracked as Fix 2
**Gate**: 93 passed, 0 failed, 0 skipped

**What works**: 10 videos render server-side as real links with zero iframes; a single lazily
created `youtube-nocookie.com` player is reused across every selection; prev/next/auto with
wraparound; arrow keys scoped to the player section; `#slug` deep links written with
`replaceState`; an 8-second API timeout with a live, retargeting fallback link; cyber-theme
parity, reduced-motion support, escaped catalog attributes and no horizontal scroll at 375px or
1280px.

**Issues found**: none blocking. Risk 1 (iOS autoplay) needs a human check on a real device;
Fix 1 and Fix 2 are tidy-ups worth folding into the next touch of this file.

**Next steps**: feature is ready to mark done. Run the iOS Safari UAT pass before release.
