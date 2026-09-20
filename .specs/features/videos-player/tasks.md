# ID-TV Video Player Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/videos-player/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase and spec - confirm before Execute. Guidelines found: none (`AGENTS.md`, `CONTRIBUTING.md` absent; README "Testing" section describes `npm test`) - strong defaults applied, existing `tests/photos/*` used as floor and style.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Data (`_data/videos.json`) | unit | 1:1 to VPLR-05 (count, unique ids/slugs, order, kebab-case, types) | `tests/videos/*.test.cjs` | `npm run test:unit` |
| Pure logic (`videos-core.js`) | unit | All branches; 1:1 to VPLR-02, 03, 11, 12, 13, 16, 28 helpers; wrap and unknown-hash edges | `tests/videos/*.test.cjs` | `npm run test:unit` |
| Markup (`videos/index.html`) | e2e | VPLR-01..04 with JS disabled | `tests/videos/*.e2e.cjs` | `npm run test:photos` |
| Theme (`less/videos.less`) | e2e | Computed-style asserts for VPLR-19..24 at 375 and 1280 px, reduced-motion | `tests/videos/*.e2e.cjs` | `npm run test:photos` |
| Controller (`videos.js`) | e2e | Every AC of the P1/P2 stories: happy, edge, error, with a stubbed YouTube API | `tests/videos/*.e2e.cjs` | `npm run test:photos` |
| Config (`package.json`, `playwright.config.cjs`) | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> Generated from `package.json` - confirm before Execute.

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm run test:unit && npm run test:photos` |
| Build | After config tasks and at phase end | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Foundation

```
T1 → T2 → T3 → T4
```

### Phase 2: Markup and theme

```
T4 → T5 → T6 → T7
```

### Phase 3: Behavior

```
T7 → T8 → T9 → T10 → T11 → T12
```

---

## Task Breakdown

### T1: Widen the unit test glob

**What**: Make `test:unit` run every `tests/*/*.test.cjs`.
**Where**: `package.json`
**Depends on**: None
**Reuses**: existing `test:unit` script
**Status**: ✅ Done
**Requirement**: VPLR-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `npm run test:unit` still runs the existing photos tests with the same count
- [x] Gate check passes: `npm run build && npm test`

**Tests**: none
**Gate**: build

**Commit**: `chore(tests): run unit tests from every tests folder`

---

### T2: Widen the Playwright test directory

**What**: Point `testDir` at `./tests` so `tests/videos/*.e2e.cjs` are discovered.
**Where**: `playwright.config.cjs`
**Depends on**: T1
**Reuses**: existing config
**Status**: ✅ Done
**Requirement**: VPLR-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Existing photos e2e tests still run with the same count
- [x] Gate check passes: `npm run build && npm test`

**Tests**: none
**Gate**: build

**Commit**: `chore(tests): discover e2e tests in every tests folder`

---

### T3: Create the video catalog

**What**: Add `_data/videos.json` with the 10 videos and a unit test for it.
**Where**: `_data/videos.json` (test in `tests/videos/videos-data.test.cjs`)
**Depends on**: T2
**Reuses**: `_data/photos.json` convention, `tests/photos/gallery.test.cjs` style
**Status**: ✅ Done
**Requirement**: VPLR-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] 10 entries, unique `id`, unique lowercase kebab-case `slug`, `type` in the allowed set
- [x] Order is Keep Away, Ghosts, Distant Hearts, Desperate Prayer, Imagined Realities, Silicon Fortress, Today Is Sunday, Buried Thoughts, Tide Of Fears, Change with ids from `videos.js`
- [x] Gate check passes: `npm run test:unit`
- [x] Test count: photos tests plus the new ones, none removed

**Tests**: unit
**Gate**: quick

**Commit**: `feat(videos): add video catalog data`

---

### T4: Add pure player helpers

**What**: Create `videos-core.js` with `shortTitle`, `indexFromHash`, `step`, `watchUrl`, `posterUrl`, `formatCounter`.
**Where**: `assets/js/videos-core.js` (tests in `tests/videos/videos-core.test.cjs`)
**Depends on**: T3
**Reuses**: none (new pure module)
**Status**: ✅ Done
**Requirement**: VPLR-02, VPLR-11, VPLR-12, VPLR-13, VPLR-16, VPLR-28

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `step` wraps last to first and first to last
- [x] `indexFromHash` returns 0 for empty, unknown and wrong-case hashes and the exact index otherwise (with or without leading `#`)
- [x] `formatCounter(2, 10)` returns `03 / 10`; `shortTitle` strips only the `Insane Driver - ` prefix
- [x] Gate check passes: `npm run test:unit`
- [x] Test count: all previous plus the new ones, none removed

**Tests**: unit
**Gate**: quick

**Commit**: `feat(videos): add pure player helpers`

---

### T5: Render the stage shell and feed

**What**: Rewrite `videos/index.html` as the server-rendered ID-TV page (cyber-zone panels, stage poster, controls, 10 cards as links, no iframes).
**Where**: `videos/index.html` (tests in `tests/videos/markup.e2e.cjs`)
**Depends on**: T4
**Reuses**: `photos/index.html` markup pattern and data hooks
**Status**: ✅ Done
**Requirement**: VPLR-01, VPLR-02, VPLR-03, VPLR-04, VPLR-19

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] With JavaScript disabled: 10 cards in file order, each an `<a>` to `https://www.youtube.com/watch?v=<id>`, short title and type visible, thumbnail from `i.ytimg.com`
- [x] Zero `<iframe>` in the served HTML
- [x] `.cyber-zone > .cyber-zone-inner` with `.cyber-panel`, `.cyber-panel-tab` and corner spans
- [x] Gate check passes: `npm run test:unit && npm run test:photos`
- [x] Test count: all previous plus the new ones, none removed

**Tests**: e2e
**Gate**: full

**Commit**: `feat(videos): render ID-TV stage and feed from catalog`

---

### T6: Load the new scripts on the page

**What**: Update the videos JS include to load `videos-core.js` then `videos.js`.
**Where**: `_includes/js/videos.liquid`
**Depends on**: T5
**Reuses**: `_includes/js/photos.liquid` pattern
**Requirement**: VPLR-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Page source contains both script tags in that order, after `pack`
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: none
**Gate**: build

**Commit**: `chore(videos): load core and player scripts`

---

### T7: Apply the cyberpunk theme

**What**: Rewrite `less/videos.less` with the cyber-zone/panel pattern, monitor stage frame, scroll-snap feed, cards, reduced-motion; rebuild `assets/css/style.min.css`.
**Where**: `less/videos.less` (tests in `tests/videos/theme.e2e.cjs`; rebuilt `assets/css/style.min.css`)
**Depends on**: T6
**Reuses**: `less/band.less` chrome, `less/photos.less` reduced-motion rule
**Requirement**: VPLR-18, VPLR-20, VPLR-21, VPLR-22, VPLR-23, VPLR-24

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `#content` background contains `bodybg`; panel tab border is `rgb(0, 243, 255)`; body font is Rajdhani
- [ ] Feed has `scroll-snap-type` x and `overflow-x: auto`
- [ ] Under `prefers-reduced-motion: reduce`, computed `animation-name` is `none` on cyber-zone/panel elements
- [ ] No scanline/noise/glow pseudo-element overlays the stage area
- [ ] `document.documentElement.scrollWidth <= innerWidth` at 375 and 1280 px
- [ ] Gate check passes: `npm run test:unit && npm run test:photos`
- [ ] Test count: all previous plus the new ones, none removed

**Tests**: e2e
**Gate**: full

**Commit**: `feat(videos): apply cyberpunk theme to ID-TV`

---

### T8: Wire selection, poster and feed behavior

**What**: Rewrite `videos.js` (drop the 15-player code) with `select()`: card click sets active card, `aria-current`, poster, title, counter and scrolls the active card into view; no YouTube request on load.
**Where**: `assets/js/videos.js` (tests in `tests/videos/select.e2e.cjs`)
**Depends on**: T7
**Reuses**: `videos-core.js` helpers
**Requirement**: VPLR-06, VPLR-08, VPLR-09, VPLR-16, VPLR-17

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] On load: 0 iframes and 0 requests to `youtube.com`, `youtube-nocookie.com` or `i.ytimg.com/vi/.../maxres` beyond poster images
- [ ] Clicking card 4 shows `04 / 10`, `NOW PLAYING` with its title, exactly one card with `aria-current="true"`
- [ ] The active card is fully inside the feed's visible box after selection
- [ ] Clicking the already-active card does not change stage state
- [ ] Gate check passes: `npm run test:unit && npm run test:photos`
- [ ] Test count: all previous plus the new ones, none removed

**Tests**: e2e
**Gate**: full

**Commit**: `feat(videos): select videos from the feed with poster stage`

---

### T9: Embed the YouTube player lazily

**What**: On first play load the IFrame API once, create one `YT.Player` with `host` nocookie and autoplay, reuse it via `loadVideoById`; add the test stub for the API.
**Where**: `assets/js/videos.js` (stub in `tests/videos/yt-stub.cjs`, tests in `tests/videos/embed.e2e.cjs`)
**Depends on**: T8
**Reuses**: `select()` from T8
**Requirement**: VPLR-07, VPLR-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Play button click creates exactly one iframe whose `src` host is `www.youtube-nocookie.com` and contains the selected video id
- [ ] Clicking another card reuses the player (still one iframe) with the new video id
- [ ] Five rapid card clicks end on the last card with one iframe
- [ ] Gate check passes: `npm run test:unit && npm run test:photos`
- [ ] Test count: all previous plus the new ones, none removed

**Tests**: e2e
**Gate**: full

**Commit**: `feat(videos): embed one lazy YouTube player`

---

### T10: Add PREV, NEXT and AUTO advance

**What**: PREV/NEXT buttons with wraparound, AUTO toggle (`aria-pressed`, default true), end-of-video handling.
**Where**: `assets/js/videos.js` (tests in `tests/videos/advance.e2e.cjs`)
**Depends on**: T9
**Reuses**: `step()` from `videos-core.js`, stub `ended` trigger
**Requirement**: VPLR-12, VPLR-13, VPLR-25, VPLR-26

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] NEXT from 10 selects 01; PREV from 01 selects 10, both start playback
- [ ] Ended with AUTO on selects the next (wrapping) and plays it
- [ ] Ended with AUTO off changes nothing and starts nothing
- [ ] AUTO has `aria-pressed="true"` on load and flips on each click
- [ ] Gate check passes: `npm run test:unit && npm run test:photos`
- [ ] Test count: all previous plus the new ones, none removed

**Tests**: e2e
**Gate**: full

**Commit**: `feat(videos): add prev, next and auto-advance`

---

### T11: Add keyboard navigation and deep links

**What**: ArrowLeft/ArrowRight scoped to the player section, `#slug` read on load and written with `replaceState`.
**Where**: `assets/js/videos.js` (tests in `tests/videos/nav.e2e.cjs`)
**Depends on**: T10
**Reuses**: `indexFromHash()` from `videos-core.js`
**Requirement**: VPLR-11, VPLR-27, VPLR-28, VPLR-29

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `/videos/#tide-of-fears` shows `09 / 10` poster and creates no iframe
- [ ] Selecting a video sets `location.hash` to its slug and `history.length` is unchanged
- [ ] Empty, unknown and `#Ghosts` hashes show `01 / 10` and leave the URL as loaded
- [ ] ArrowRight/ArrowLeft act as NEXT/PREV with focus on a player control, and do nothing with focus outside the section
- [ ] Gate check passes: `npm run test:unit && npm run test:photos`
- [ ] Test count: all previous plus the new ones, none removed

**Tests**: e2e
**Gate**: full

**Commit**: `feat(videos): add keyboard navigation and deep links`

---

### T12: Handle YouTube being unavailable

**What**: Fallback message and watch link when the API fails, times out (8 s) or the player errors; keep the feed interactive.
**Where**: `assets/js/videos.js` (tests in `tests/videos/fallback.e2e.cjs`)
**Depends on**: T11
**Reuses**: `[data-idtv-fallback]` markup from T5, `watchUrl()`
**Requirement**: VPLR-14, VPLR-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] With the API request aborted, pressing play shows `YouTube unavailable` and a `Watch on YouTube` link to the current watch URL
- [ ] With the API stubbed to never become ready, the message appears after 8 seconds and not before
- [ ] While the message shows, selecting another card updates the link to that video
- [ ] Gate check passes: `npm run build && npm test`
- [ ] Test count: all previous plus the new ones, none removed

**Tests**: e2e
**Gate**: build

**Commit**: `feat(videos): show fallback when YouTube is unavailable`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 → T2 → T3 → T4
Phase 2:  T4 → T5 → T6 → T7
Phase 3:  T7 → T8 → T9 → T10 → T11 → T12
```

Execution is strictly sequential. 12 tasks pack into 2 batches (~7 per worker: Phase 1 + Phase 2 = 7, Phase 3 = 5).

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | 1 script line | ✅ Granular |
| T2 | 1 config line | ✅ Granular |
| T3 | 1 data file + its test | ✅ Granular |
| T4 | 1 module, 6 small functions | ✅ Cohesive |
| T5 | 1 page template | ✅ Granular |
| T6 | 1 include | ✅ Granular |
| T7 | 1 stylesheet | ✅ Cohesive |
| T8-T12 | 1 behavior each in one file | ✅ Cohesive |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| ---- | ---------------------- | ------------- | ------ |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |
| T11 | T10 | T10 → T11 | ✅ Match |
| T12 | T11 | T11 → T12 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| ---- | --------------------------- | --------------- | --------- | ------ |
| T1 | Config | none | none | ✅ OK |
| T2 | Config | none | none | ✅ OK |
| T3 | Data | unit | unit | ✅ OK |
| T4 | Pure logic | unit | unit | ✅ OK |
| T5 | Markup | e2e | e2e | ✅ OK |
| T6 | Config (include wiring) | none | none | ✅ OK |
| T7 | Theme | e2e | e2e | ✅ OK |
| T8-T12 | Controller | e2e | e2e | ✅ OK |

## Requirement Coverage

All 29 IDs are covered: VPLR-01..05 (T3, T5), 02/11/12/13/16/28 helpers (T4), 06/08/09/16/17 (T8), 07/10 (T9), 12/13/25/26 (T10), 11/27/28/29 (T11), 14/15 (T12), 18/19..24 (T5, T7).
