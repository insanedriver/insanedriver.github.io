# ID-TV Video Player Validation

**Date**: 2026-09-20
**Spec**: `.specs/features/videos-player/spec.md`
**Diff range**: `175a5f8..HEAD` (branch `feature/videos-player`, HEAD `fa8f2df`)
**Verifier**: independent sub-agent (author != verifier), read-only over the real tree

## Validation: videos-player - FAIL ❌

Every acceptance criterion is implemented correctly and the full gate is green. The FAIL is
narrow and is about the **test suite, not the product**: the discrimination sensor proved two
explicit AC clauses (VPLR-16 `NOW PLAYING`, VPLR-18 no-`wheel`-`preventDefault`) have no
assertion behind them - a regression on either would ship undetected. Two assertions close it.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 `package.json` unit glob | ✅ Done | `tests/*/*.test.cjs`, `package.json:11` |
| T2 Playwright `testDir` | ✅ Done | `playwright.config.cjs:4` |
| T3 `_data/videos.json` | ✅ Done | 10 entries |
| T4 `videos-core.js` | ✅ Done | 6 pure helpers |
| T5 `videos/index.html` | ✅ Done | server-rendered, 0 iframes |
| T6 `_includes/js/videos.liquid` | ✅ Done | core then player |
| T7 `less/videos.less` | ✅ Done | 313 lines, rebuilt `style.min.css` |
| T8 select / poster / feed | ✅ Done | - |
| T9 lazy single player | ✅ Done | - |
| T10 prev/next/auto | ✅ Done | - |
| T11 keyboard + deep links | ✅ Done | - |
| T12 fallback | ✅ Done | - |

All 12 tasks committed; no unchecked "Done when" boxes remain in `tasks.md`.

---

## Spec-Anchored Acceptance Criteria

| Criterion | Spec-defined outcome | `file:line` + assertion expression | Verdict |
| --------- | -------------------- | ---------------------------------- | ------- |
| VPLR-01 one card per entry, file order | 10 cards, catalog slug order | `tests/videos/markup.e2e.cjs:12` `expect(cards).toHaveCount(10)`; `tests/videos/markup.e2e.cjs:13` `expect(...dataset.slug).toEqual(videos.map(v => v.slug))` | ✅ PASS |
| VPLR-02 thumb + short title + type | `i.ytimg.com/vi/<id>/hqdefault.jpg`, prefix stripped, type label | `tests/videos/markup.e2e.cjs:20` `toHaveText(short(v.title))`; `:21` `toHaveText(v.type)`; `:22` `toHaveAttribute('src', 'https://i.ytimg.com/vi/${v.id}/hqdefault.jpg')`; `tests/videos/videos-core.test.cjs:7` `equal(shortTitle(...), 'Ghosts [Official Lyric Video]')` | ✅ PASS |
| VPLR-03 card is `<a>` to watch URL | `https://www.youtube.com/watch?v=<id>` | `tests/videos/markup.e2e.cjs:30` `expect(el.tagName).toBe('A')`; `:31` `toHaveAttribute('href', 'https://www.youtube.com/watch?v=${v.id}')` | ✅ PASS |
| VPLR-04 no iframe in served shell | 0 `<iframe>` inside `.videos-shell` | `tests/videos/markup.e2e.cjs:39` `expect(shell).not.toMatch(/<iframe/i)`; `:41` `expect(page.locator('.videos-shell iframe')).toHaveCount(0)` | ✅ PASS |
| VPLR-05 catalog shape and order | 10 entries, unique id/slug, kebab-case, exact order | `tests/videos/videos-data.test.cjs:6` `deepEqual(slugs, ['keep-away',...,'change'])`; `:10` `deepEqual(ids, [...])`; `:17-18` `equal(new Set(...).size, 10)`; `:19` `match(v.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/)` | ✅ PASS |
| VPLR-06 poster only on load, 0 iframes, no YT script | 0 iframes, no youtube host request, play button visible | `tests/videos/select.e2e.cjs:12` `toHaveCount(0)`; `:13` `expect(hosts.filter(/youtube(-nocookie)?\.com/)).toEqual([])`; `:14` `expect('[data-idtv-play]').toBeVisible()` | ✅ PASS |
| VPLR-07 play -> one nocookie iframe, autoplay | src host `www.youtube-nocookie.com`, selected id, playback starts | `tests/videos/embed.e2e.cjs:13` `toHaveCount(1)`; `:14` `toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/${videos[0].id}/)`; `:15` `expect(__yt.configs[0].playerVars.autoplay).toBe(1)` | ✅ PASS |
| VPLR-08 card click switches + `aria-current` exclusive | counter/title/poster follow, exactly 1 `aria-current="true"` | `tests/videos/select.e2e.cjs:24` `expect('[data-idtv-card][aria-current="true"]').toHaveCount(1)`; `:25` `toHaveAttribute('aria-current','true')`; `tests/videos/embed.e2e.cjs:25` `toHaveAttribute('data-video-id', videos[2].id)` | ✅ PASS |
| VPLR-09 re-click active card does not restart | playback continues, no reload of the same id | `tests/videos/select.e2e.cjs:49-51` `toHaveText('04 / 10')` + `toHaveCount(1)` (state only, **no player instantiated in this test**); real discrimination comes from `tests/videos/embed.e2e.cjs:36` `expect(__yt.loads).toEqual([videos[4].id])` and `tests/videos/advance.e2e.cjs:77` `expect(__yt.loads).toEqual([])` | ⚠️ Assertion-precision gap (see Gap 3) |
| VPLR-10 rapid selections resolve to last | last selected id, exactly 1 iframe, 1 player | `tests/videos/embed.e2e.cjs:47-50` `toHaveCount(1)` + `toHaveAttribute('data-video-id', videos[5].id)` + `expect(__yt.players.length).toBe(1)`; `:61-62` post-player variant | ✅ PASS |
| VPLR-11 unknown/empty/wrong-case hash -> first, URL unchanged | index 0, URL as loaded | `tests/videos/nav.e2e.cjs:24` `toHaveText('01 / 10')`; `:26` `expect(page.url()).toBe(loaded)` over `['', '#', '#nope', '#Ghosts']`; `tests/videos/videos-core.test.cjs:40-44` `equal(indexFromHash('#Ghosts', slugs), 0)` | ✅ PASS |
| VPLR-12 NEXT/PREV with wrap both ways | 10->1 and 1->10, playback starts | `tests/videos/advance.e2e.cjs:27-28` `toHaveText('01 / 10')` + `toHaveAttribute('data-video-id', videos[0].id)`; `:33-34` `toHaveText('10 / 10')` + `videos[9].id`; `tests/videos/videos-core.test.cjs:25-26` `equal(step(9,1,10), 0)` / `equal(step(0,-1,10), 9)` | ✅ PASS |
| VPLR-13 end + AUTO on -> next (wrapping) | next id loaded and playing | `tests/videos/advance.e2e.cjs:56-58` `toHaveText('02 / 10')` + `videos[1].id` + `aria-current`; `:65-66` wrap `toHaveText('01 / 10')` + `videos[0].id` | ✅ PASS |
| VPLR-14 API fail/8s timeout -> message + link | `YouTube unavailable`, `Watch on YouTube` -> watch URL, after 8s not before | `tests/videos/fallback.e2e.cjs:15` `toContainText('YouTube unavailable')`; `:16` `toHaveText('Watch on YouTube')`; `:17` `toHaveAttribute('href','...watch?v=${videos[0].id}')`; `:27-30` `clock.runFor(7900)` -> `toBeHidden()`, `runFor(200)` -> `toBeVisible()` | ✅ PASS |
| VPLR-15 feed stays live, link follows selection | fallback link tracks new selection | `tests/videos/fallback.e2e.cjs:42` `toHaveAttribute('href','...v=${videos[3].id}')`; `:44` `...v=${videos[4].id}` after NEXT | ✅ PASS |
| VPLR-16 `NOW PLAYING` + title + `NN / 10` | literal `NOW PLAYING`, active title, zero-padded counter | counter: `tests/videos/select.e2e.cjs:21` `toHaveText('04 / 10')`, `:32` `toHaveText('10 / 10')`, `tests/videos/markup.e2e.cjs:46` `toHaveText('01 / 10')`; title: `tests/videos/select.e2e.cjs:22` `toHaveText('Desperate Prayer [Official Lyric Video]')`; padding: `tests/videos/videos-core.test.cjs:17-19`. **`NOW PLAYING` literal: no assertion anywhere** (mutant M13 survived) | ❌ GAP (partial) |
| VPLR-17 active card scrolled fully visible | card box within feed box | `tests/videos/select.e2e.cjs:41` `card.x >= feed.x - 1 && card.x + card.width <= feed.x + feed.width + 1` polled to `true` | ✅ PASS |
| VPLR-18 scroll-snap, native scroll, no `wheel` `preventDefault` | `scroll-snap-type: x`, `overflow-x: auto`, no wheel handler | `tests/videos/theme.e2e.cjs:22` `toHaveCSS('overflow-x','auto')`; `:23` `expect(scrollSnapType).toContain('x')`; `:24` `scrollWidth > clientWidth`. **no-`wheel`-handler clause: no assertion** (mutant M14 survived); implementation is clean - no `wheel` listener in `assets/js/videos.js` | ❌ GAP (partial) |
| VPLR-19 cyber-zone/panel/tab/corners | `.cyber-zone > .cyber-zone-inner`, 2 panels, tab + 3 corners each | `tests/videos/markup.e2e.cjs:53` `toHaveCount(1)`; `:54-61` `toHaveCount(2)` + per-panel `.cyber-panel-tab`/`.corner-tl`/`.corner-tr`/`.corner-bl` each `toHaveCount(1)` | ✅ PASS |
| VPLR-20 transparent zone, `bodybg.jpg` visible | `#content` bg contains `bodybg`, zone bg transparent | `tests/videos/theme.e2e.cjs:5` `expect(backgroundImage).toContain('bodybg')`; `:6` `toHaveCSS('background-color','rgba(0, 0, 0, 0)')` | ✅ PASS |
| VPLR-21 palette + fonts | `#00f3ff`, `#005f8c`, `#ff00ea`, Rajdhani, Share Tech Mono | `tests/videos/theme.e2e.cjs:11` `toHaveCSS('border-top-color','rgb(0, 243, 255)')`; `:12` `rgb(0, 95, 140)`; `:13` `rgb(255, 0, 234)`; `:15` `toContain('Rajdhani')`; `:16` `toContain('Share Tech Mono')` | ✅ PASS |
| VPLR-22 reduced motion -> no animation/transition | `animation-name: none`, `transition-duration: 0s` | `tests/videos/theme.e2e.cjs:37` `expect(animation).toBe('none')`; `:38` `expect(transition).toBe('0s')`; `:40-41` `::before`/`::after` `toBe('none')` | ✅ PASS |
| VPLR-23 no overlay on the stage | scanline stacked below the stage's container | `tests/videos/theme.e2e.cjs:51` `expect(stageInsideInner).toBe(true)`; `:52` `expect(inner).toBeGreaterThan(scanline)` (z-index 101 vs 100, `less/videos.less:51,71`) | ⚠️ Spec-precision gap (see Gap 5) |
| VPLR-24 no horizontal scroll at 375/1280, 16:9 | `scrollWidth <= innerWidth`, ratio 16/9 | `tests/videos/theme.e2e.cjs:59` `expect(scrollWidth <= innerWidth).toBe(true)`; `:61` `expect(Math.abs(w/h - 16/9)).toBeLessThan(0.02)`; `:62` `toBeLessThanOrEqual(width)`, parameterized over `[375, 1280]` | ✅ PASS |
| VPLR-25 end + AUTO off -> nothing | index unchanged, nothing loaded | `tests/videos/advance.e2e.cjs:75` `toHaveText('01 / 10')`; `:76` `toHaveAttribute('data-video-id', videos[0].id)`; `:77` `expect(__yt.loads).toEqual([])` | ✅ PASS |
| VPLR-26 AUTO `aria-pressed="true"` on load, flips | true -> false -> true | `tests/videos/advance.e2e.cjs:45` `toHaveAttribute('aria-pressed','true')`; `:47` `'false'`; `:49` `'true'` | ✅ PASS |
| VPLR-27 arrows scoped to the player section | in-scope acts as NEXT/PREV, out-of-scope does nothing | `tests/videos/nav.e2e.cjs:57` `toHaveText('02 / 10')`; `:59` `'01 / 10'`; `:67` card focus `'02 / 10'`; `:76` focus on `.menu-font` -> `'01 / 10'`, `:77` `toHaveCount(0)` iframes | ✅ PASS |
| VPLR-28 `#<slug>` via `replaceState`, no history entry | hash becomes slug, `history.length` unchanged | `tests/videos/nav.e2e.cjs:35` `expect(hash).toBe('#ghosts')`; `:37` `'#distant-hearts'`; `:38` `expect(history.length).toBe(before)`; `:46-48` `'#change'` then `'#keep-away'` | ✅ PASS |
| VPLR-29 `#<slug>` on load -> that poster, no autoplay | counter `09 / 10`, 0 iframes, 0 API requests | `tests/videos/nav.e2e.cjs:11` `toHaveText('09 / 10')`; `:13` `aria-current='true'` on card 8; `:16` `toHaveCount(0)` iframes; `:17` `expect(api.requests).toBe(0)` | ✅ PASS |

**Status**: 26/29 fully covered with spec-matching assertions; 2 ACs partially covered
(VPLR-16, VPLR-18 - one clause each with zero evidence); 1 assertion-precision gap (VPLR-09);
1 spec-precision gap (VPLR-23).

---

## Discrimination Sensor

Isolated scratch: `git worktree add --detach <scratchpad>/mut HEAD` with `node_modules`
symlinked; mutants applied and reverted with `git checkout -- .`; worktree removed with
`git worktree remove --force`. The real tree was never edited; no `git stash` was used.

| # | Mutation | File:line | Description | Killed? |
| - | -------- | --------- | ----------- | ------- |
| M1 | step no wrap | `assets/js/videos-core.js:31` | `(index + delta + length) % length` -> `index + delta` | ✅ Killed (`videos-core.test.cjs:25`) |
| M2 | hash case-insensitive | `assets/js/videos-core.js:36` | `indexOf(slug)` -> lowercased compare | ✅ Killed (`videos-core.test.cjs:43`) |
| M3 | drop `replaceState` | `assets/js/videos.js:133` | remove the hash write | ✅ Killed (`nav.e2e.cjs:35`) |
| M4 | drop nocookie `host` | `assets/js/videos.js:59` | remove `host: EMBED_HOST` | ✅ Killed (`embed.e2e.cjs:14`) |
| M5 | new player per selection | `assets/js/videos.js:98` | always `createPlayer()` | ✅ Killed (`embed.e2e.cjs:37`) |
| M6 | ignore AUTO off | `assets/js/videos.js:69` | drop `&& state.auto` | ✅ Killed (`advance.e2e.cjs:75`) |
| M7 | skip the 8s timeout | `assets/js/videos.js:79` | remove `setTimeout(failApi, 8000)` | ✅ Killed (`fallback.e2e.cjs:30`) |
| M8 | keydown ignores focus scope | `assets/js/videos.js:153` | `root.addEventListener` -> `document.addEventListener` | ✅ Killed (`nav.e2e.cjs:76`) |
| M9 | iframe created on load | `assets/js/videos.js:167` | call `play()` at init | ✅ Killed (`select.e2e.cjs:12`) |
| M10 | wrong counter padding | `assets/js/videos-core.js:23` | `(n < 10 ? '0' : '') + n` -> `'' + n` | ✅ Killed (`videos-core.test.cjs:17`) |
| M11 | `aria-current` not cleared | `assets/js/videos.js:122` | drop `removeAttribute('aria-current')` | ✅ Killed (`select.e2e.cjs:24`) |
| M12 | idempotency guard removed | `assets/js/videos.js:36` | drop `state.loadedId === currentId()` from `syncPlayer` | ✅ Killed by the suite (`advance.e2e.cjs:77`, `embed.e2e.cjs:36`) - **survived the dedicated VPLR-09 test** (`select.e2e.cjs:45-52`) |
| M13 | `NOW PLAYING` label changed | `videos/index.html:42` | `NOW PLAYING` -> `TRANSMITTING` | ❌ **Survived** (46/46 videos e2e still green) |
| M14 | wheel hijack added | `assets/js/videos.js:152` | add `feed.addEventListener('wheel', e => { e.preventDefault(); ... })` | ❌ **Survived** (46/46 videos e2e still green) |

**Sensor depth**: expanded (14 behavior-level mutations, above the lightweight 1-3 tier)
**Outcome**: 12/14 killed outright, 1 killed only by a non-dedicated test, 2 survived - FAIL ❌

**Isolation check**: `git status --porcelain` of the real tree before the sensor and after
worktree removal are byte-identical (9 pre-existing untracked entries: `.agent/`, `.agents/`,
`.claude/`, `.codex/`, `.cursor/`, `.gemini/`, `.github/skills/`, `.windsurf/`,
`skills-lock.json`). Sensor run is valid.

---

## Gate Check

- **Gate command**: `npm run build && npm test` (Build level, `tasks.md` Gate Check Commands)
- **Outcome**: exit 0 - unit 13 passed / 0 failed / 0 skipped; Playwright 76 passed / 0 failed
- **Test count before feature** (photos only): 3 unit + 30 e2e = 33
- **Test count after feature**: 13 unit + 76 e2e = 89
- **Delta**: +10 unit, +46 e2e (`tests/videos/*`); no test deleted, no assertion weakened
- **Skipped tests**: none
- **Failures**: none

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ `videos.js` is 170 lines replacing 316; the 15-player dead code is gone |
| Surgical changes | ✅ only the 8 files the tasks name, plus the rebuilt `assets/css/style.min.css` |
| No scope creep | ✅ out-of-scope teasers, new videos and a shared theme file were not added |
| Matches patterns | ✅ mirrors `photos/index.html`, `less/photos.less`, `tests/photos/browser.cjs` |
| Spec-anchored outcome check | ⚠️ 2 AC clauses unasserted (VPLR-16, VPLR-18) |
| Per-layer Coverage Expectation met | ✅ data + pure logic 1:1 unit; markup/theme/controller e2e happy + edge + error |
| Every test maps to a spec requirement | ✅ every test title carries its VPLR id; no unclaimed tests |
| Documented guidelines followed | ✅ none exist (`AGENTS.md`/`CONTRIBUTING.md` absent) - strong defaults + `tests/photos/*` as the floor |

---

## Edge Cases

- [x] `#Ghosts` (case differs from slug) -> first video - `tests/videos/nav.e2e.cjs:20-28`
- [x] Viewport < 768px keeps 16:9 filling the panel - `tests/videos/theme.e2e.cjs:56-63` at 375px
- [x] Empty hash / `#` / unknown slug -> first video, URL untouched - `tests/videos/nav.e2e.cjs:26`
- [x] Player error (`onError`) -> fallback, and selecting another card retries - `tests/videos/fallback.e2e.cjs:53-57`

---

## Fix Plans

### Fix 1: Assert the `NOW PLAYING` label (Blocker for done - surviving mutant M13)

- **Root cause**: VPLR-16 names the literal `NOW PLAYING`, but every test asserts only
  `[data-idtv-now]` (the title) and `[data-idtv-counter]`. The eyebrow at
  `videos/index.html:42` has no coverage, so renaming or dropping it ships silently.
- **Fix task**: in `tests/videos/markup.e2e.cjs`, add
  `await expect(page.locator('.videos-now .videos-eyebrow')).toHaveText('NOW PLAYING');`
- **Verify**: re-run mutant M13 (`NOW PLAYING` -> `TRANSMITTING`); the suite must fail.
- **Priority**: Major

### Fix 2: Assert the feed does not hijack `wheel` (Blocker for done - surviving mutant M14)

- **Root cause**: VPLR-18 forbids a `wheel` handler that calls `preventDefault`; `theme.e2e.cjs`
  asserts only `overflow-x` and `scroll-snap-type`. Adding a wheel hijack (the exact thing the
  spec put Out of Scope) passes the whole suite.
- **Fix task**: in `tests/videos/theme.e2e.cjs`, dispatch a cancelable `wheel` event on
  `[data-idtv-feed]` and assert it is not consumed, e.g.
  `expect(await feed.evaluate(el => el.dispatchEvent(new WheelEvent('wheel', { deltaY: 100, cancelable: true, bubbles: true })))).toBe(true);`
- **Verify**: re-run mutant M14; the suite must fail.
- **Priority**: Major

### Fix 3: Make the VPLR-09 test actually observe playback (mutant M12)

- **Root cause**: `tests/videos/select.e2e.cjs:45-52` never stubs the YouTube API, so no player
  exists and "does not restart" cannot be observed; it asserts only counter and `aria-current`.
  Removing the `state.loadedId === currentId()` guard at `assets/js/videos.js:36` leaves this
  test green (other tests catch it, but not the one that owns the AC).
- **Fix task**: add `await stubYouTube(page)` to that test, click card 4 twice, then assert
  `expect(await page.evaluate(() => window.__yt.loads)).toEqual([videos[3].id])` and
  `expect(await page.evaluate(() => window.__yt.players.length)).toBe(1)`.
- **Priority**: Minor

### Fix 4: Autoplay may not start when the API resolves after the click (real-world risk)

- **Root cause**: `assets/js/videos.js:53-75` creates the player from
  `onYouTubeIframeAPIReady` (`:80-84`), which fires on script load - after the click's
  transient user activation has expired. Chrome usually still allows it via sticky activation,
  but Safari/iOS commonly blocks autoplay-with-sound from a non-gesture callback, leaving a
  hidden poster (`:97`) over a paused player. The stub (`tests/videos/yt-stub.cjs`) has no
  autoplay policy, so no test can see this.
- **Fix task**: after `onReady`, call `event.target.playVideo()` and, on a
  `UNSTARTED`/`PAUSED` state that never advances, keep the poster visible. Manual check on a
  real device covers it.
- **Priority**: Major (real-world, not spec-visible) - needs a UAT pass on iOS Safari

### Fix 5: Unescaped catalog fields in HTML attributes (defense in depth)

- **Root cause**: `videos/index.html:66-68` interpolates `{{ video.slug }}`, `{{ video.id }}`
  and `{{ video.type }}` into attributes/text without `| escape` (only `title` is escaped).
  Data is author-curated and the unit tests constrain `slug` (kebab regex) and `type`
  (allow-list), so exploitation needs a hand-edit of `_data/videos.json` - but `id` is
  unconstrained.
- **Fix task**: add `| escape` to the three interpolations, or assert an `id` pattern in
  `tests/videos/videos-data.test.cjs` (`/^[A-Za-z0-9_-]{11}$/`).
- **Priority**: Minor

### Fix 6: Dead iframe guard in the keydown handler (clarity only)

- **Root cause**: `assets/js/videos.js:155` checks `event.target.tagName === 'IFRAME'`, but
  keydown inside a cross-origin YouTube iframe never bubbles to the parent document, so the
  branch is unreachable. VPLR-27's "outside the YouTube iframe" clause is satisfied by browser
  behavior, not by this line.
- **Fix task**: drop the line, or keep it with a comment saying it is belt-and-braces.
- **Priority**: Cosmetic

---

## Additional Review (real-world behavior the stub cannot model)

Checked and found **correct**:

- Player methods before `onReady`: guarded by `state.playerReady` (`assets/js/videos.js:36`);
  selections made while the API loads are replayed in `onReady` (`:63-66`). ✅
- `host` option: `https://www.youtube-nocookie.com` is the documented IFrame API form
  (`assets/js/videos.js:23, 59`); the loader script legitimately stays on `youtube.com`
  (`:22`), which VPLR-06 only constrains before the first play. ✅
- The real API replaces the holder `<div>` with the iframe: `.videos-screen iframe` is
  absolutely positioned to fill the 16:9 box (`less/videos.less:230-231`), so the replacement
  is styled correctly instead of falling back to YouTube's 640x360 attributes. ✅
- Hash injection: `history.replaceState` (`assets/js/videos.js:133`) writes only `data-slug`,
  which the unit test pins to `/^[a-z0-9]+(-[a-z0-9]+)*$/`
  (`tests/videos/videos-data.test.cjs:19`). ✅
- `innerHTML`: never used; the only dynamic text goes through `textContent`
  (`assets/js/videos.js:127`) and `href`/`src` assignments from `core.watchUrl`/`core.posterUrl`. ✅
- Layout at 375px: `.videos-feed-item` is `flex: 0 0 clamp(220px, 26vw, 300px)`
  (`less/videos.less:278`) inside an `overflow-x: auto` feed, so the strip never widens the
  page - confirmed by `tests/videos/theme.e2e.cjs:59`. ✅
- Timeout bookkeeping: a late `onYouTubeIframeAPIReady` after `failApi` recovers the player
  rather than staying stuck (`assets/js/videos.js:47-51, 80-84`). ✅

Open real-world risks: Fix 4 (autoplay policy) and Fix 5 (unescaped `id`).

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| VPLR-01..08, 10..15, 17, 19..22, 24..29 | Implementing | ✅ Verified |
| VPLR-09 | Implementing | ⚠️ Verified (owning test is weak - Fix 3) |
| VPLR-16 | Implementing | ❌ Needs Fix (`NOW PLAYING` clause unasserted - Fix 1) |
| VPLR-18 | Implementing | ❌ Needs Fix (no-`wheel` clause unasserted - Fix 2) |
| VPLR-23 | Implementing | ⚠️ Verified via z-index proxy (spec-precision gap) |

---

## Summary

**Overall**: ⚠️ Issues - product behavior is correct; two AC clauses have no test evidence

**Spec-anchored check**: 26/29 ACs matched the spec outcome; 2 partially covered; 1 assertion-precision gap; 1 spec-precision gap
**Sensor**: 12/14 mutations killed, 2 survived
**Gate**: 89 passed, 0 failed, 0 skipped

**What works**: all 10 videos render server-side as real links with 0 iframes; one lazily
created nocookie player reused across selections; prev/next/auto with wrap; scoped keyboard
nav; `#slug` deep links via `replaceState`; 8s API timeout with a live fallback link; cyber
theme parity, reduced-motion support and no horizontal scroll at 375/1280.

**Issues found**: Fix 1 and Fix 2 (surviving mutants, ~2 assertions) block done; Fix 3-6 are
follow-ups, with Fix 4 (autoplay policy on iOS) worth a manual UAT pass.

**Next steps**: apply Fix 1 and Fix 2, re-run mutants M13 and M14 to confirm they are killed,
then re-verify. Fix 4 needs a human check on a real device.
