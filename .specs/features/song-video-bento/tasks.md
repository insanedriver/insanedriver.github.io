# Song Video Bento Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/song-video-bento/design.md`
**Status**: In Progress

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `package.json` scripts, `playwright.config.cjs`, `.specs/LESSONS.md` (L-004, L-024); no coverage threshold configured - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Build-time data (`lib/catalog.js`) | unit | All branches; 1:1 to the data-side ACs; each OR branch of `sectionFamily` tested alone (L-024) | `tests/seo/catalog.test.cjs` | `npm run test:unit` |
| Liquid templates (markup) | e2e (no JS) | Every video song for markup ACs; one video and one non-video song for negatives | `tests/discography/song-bento.e2e.cjs`, `tests/seo/song.e2e.cjs` | `npx playwright test <file>` |
| Less (layout / finish) | e2e (computed styles) | Each layout AC at the named viewport widths; each style AC asserted on computed values | `tests/discography/song-bento.e2e.cjs` | `npx playwright test <file>` |
| Browser JS (`assets/js/song.js`) | e2e | Happy path, already-playing path, reduced motion, no-JS | `tests/discography/song-bento.e2e.cjs`, `tests/seo/video.e2e.cjs` | `npx playwright test <file>` |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm run build && npm run test:unit && npx playwright test tests/seo tests/discography` |
| Build | After the last task | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Data

```
T1 → T2 → T3
```

### Phase 2: Markup

```
T4 → T5 → T6 → T7
```

### Phase 3: Styles and behavior

```
T8 → T9 → T10
```

---

## Task Breakdown

### T1: Lyrics section families ✅

**What**: Export `sectionFamily(label)` and set `family` on every parsed section.
**Where**: `lib/catalog.js`
**Depends on**: None
**Reuses**: `parseSections`
**Requirement**: BENTO-27

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] `Verse`, `Verse 1` → verse; `Chorus`, `Chorus 2` → chorus; `Bridge`, `Bridge 3` → bridge; `Interlude` → bridge (alone); `Prayer` → other; null → null
- [ ] `build()` sections carry `family`
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(catalog): classify lyrics sections by family`

---

### T2: Track number and catalog code ✅

**What**: Add `number`, `catalogCode` to songs and `number` to `prev`/`next`; export `albumCode`.
**Where**: `lib/catalog.js`
**Depends on**: T1
**Reuses**: `build()` prev/next loop
**Requirement**: BENTO-26, BENTO-32, BENTO-35

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] `keep-away` → number `03`, catalogCode `SF-TRACK-03`; `today-is-sunday` → `ID-TRACK-08`; `distant-hearts` → `11`
- [ ] SONG-10 unit expectation updated with `number` on prev/next
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(catalog): add track number and catalog code to songs`

---

### T3: Audio uplink list ✅

**What**: Export `uplink(platforms, listen)`, pass `platforms.json` from `_data/catalog.js`, set `song.uplink`.
**Where**: `lib/catalog.js`
**Depends on**: T2
**Reuses**: `listen` (SONG-07 fallback)
**Requirement**: BENTO-18, BENTO-19, BENTO-20

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] Order spotify, apple, ytmusic, bandcamp (primary true) then deezer, tidal, amazon, pandora (primary false)
- [ ] Track URL wins over album URL; missing URL drops the entry
- [ ] Sub labels per BENTO-20 for track URLs, `platform.sub` for album fallback (each platform tested in both states)
- [ ] `build()` without `platforms` yields `uplink: []`
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(catalog): build the audio uplink platform list for song pages`

---

### T4: Extract lyrics and dossier partials ✅

**What**: Move lyrics and About/Also markup into `_includes/discography/song-lyrics.liquid` and `song-dossier.liquid`, adding `song-lyrics-section--{family}` classes; `song.liquid` includes them.
**Where**: `_includes/discography/song-lyrics.liquid`
**Depends on**: None (Phase 1 complete)
**Reuses**: Current `song.liquid` markup
**Requirement**: BENTO-25, BENTO-27, BENTO-31

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] Existing SONG-04/06/08 e2e stay green on all 22 pages
- [ ] New e2e: every labelled section of Keep Away carries exactly one family class; Tears of Blood carries none
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `refactor(song): extract lyrics and dossier partials with section families`

---

### T5: Track sequencer bar ✅

**What**: `_includes/discography/song-nav.liquid` with `← Previous track // NN` / `Next track → // NN`, rendered after the last panel on every song page.
**Where**: `_includes/discography/song-nav.liquid`
**Depends on**: T4
**Reuses**: Existing `.song-nav` classes and `rel`
**Requirement**: BENTO-34, BENTO-35

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] e2e on all 22 pages: `.song-nav` has no `.cyber-panel` ancestor and follows the last panel; labels carry NN; first/last omission unchanged
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(song): move track navigation to a full-width sequencer bar`

---

### T6: Title badge hook ✅

**What**: `base.html` h1 appends `{{ page_header_class }}`; `song.liquid` computes `song-title-badge` for video songs.
**Where**: `_layouts/base.html`
**Depends on**: T5
**Reuses**: `eleventyComputed` in `song.liquid`
**Requirement**: BENTO-08 (class hook)

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] e2e: video song h1 has `song-title-badge` and the song title; non-video song h1 has no such class; non-song pages keep their h1 class list
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(song): add a header class hook for the title badge`

---

### T7: Bento markup ✅

**What**: `_includes/discography/song-bento.liquid` (meta bar + panels A, B, D, C) included by `song.liquid` for video songs; non-video branch unchanged.
**Where**: `_includes/discography/song-bento.liquid`
**Depends on**: T6
**Reuses**: Partials from T4, facade markup, `song.uplink`, fans-of include
**Requirement**: BENTO-01, 02, 07, 09, 15, 16, 17, 21, 22, 26, 32, 42

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] New no-JS e2e over all 10 video songs asserts every listed AC's text, attributes and DOM order; a non-video song asserts BENTO-02
- [ ] `tests/seo/song.e2e.cjs` SONG-07 expectation uses uplink order for video songs, unchanged for the rest
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(song): render the bento grid for songs with a video`

---

### T8: Bento layout

**What**: `less/song-bento.less` grid, responsive stacking, Panel B columns, sticky dossier; imported by `less/pages/discography.less`.
**Where**: `less/song-bento.less`
**Depends on**: None (Phase 2 complete)
**Reuses**: `.cyber-panel`, `.disc-links`, `.song-video-frame-box`
**Requirement**: BENTO-03, 04, 05, 06, 14, 24, 30, 33

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] e2e at 1280 and 992 (A/B ratio, C/D widths, sticky), 991/768/375 (stack order, 2-col primary), overflow at 375/768/992/1280 on all 22 song pages, 16:9 frame, lyrics unclipped
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(song): lay out the bento grid responsively`

---

### T9: HUD finish

**What**: Badge h1 font, SiliconFont tabs, panel background grid, lyrics markers and chorus italics, zero radius, focus ring, text colors, reduced motion - in `less/song-bento.less`.
**Where**: `less/song-bento.less`
**Depends on**: T8
**Reuses**: Focus ring from `less/home.less:626`, brand hovers in `less/cyber-links.less`
**Requirement**: BENTO-08 (font), 23, 28, 36, 37, 38, 39, 40, 41

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] e2e asserts each AC on computed styles (hover Spotify border, marker colors per family, italic chorus, radius 0 on every element in scope, h1 in `insaneFont`, tabs in `SiliconFont`, focus outline via keyboard, `animation-name: none` under reduced motion, panel background, text colors)
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(song): apply the neon hud finish to the bento panels`

---

### T10: QUICK PLAY

**What**: Extract `activate(facade)` in `assets/js/song.js`; QUICK PLAY scrolls to Panel A, activates the video once, pushes `song_quick_play`, respects reduced motion.
**Where**: `assets/js/song.js`
**Depends on**: T9
**Reuses**: Existing facade code
**Requirement**: BENTO-10, 11, 12, 13, 43

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] e2e: click → iframe autoplay src, same URL, Panel A in viewport, dataLayer event; second click keeps one iframe; reduced motion → Panel A in viewport immediately; no YouTube request before activation
- [ ] SONG-12/13 stay green
- [ ] Gate check passes: build gate

**Tests**: e2e
**Gate**: build
**Commit**: `feat(song): add quick play to start the video from the metadata bar`

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | start of Phase 1 | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | None (phase order) | start of Phase 2 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | None (phase order) | start of Phase 3 | ✅ Match |
| T9 | T8 | T8 → T9 | ✅ Match |
| T10 | T9 | T9 → T10 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Build-time data | unit | unit | ✅ OK |
| T2 | Build-time data | unit | unit | ✅ OK |
| T3 | Build-time data | unit | unit | ✅ OK |
| T4 | Liquid templates | e2e | e2e | ✅ OK |
| T5 | Liquid templates | e2e | e2e | ✅ OK |
| T6 | Liquid templates | e2e | e2e | ✅ OK |
| T7 | Liquid templates | e2e | e2e | ✅ OK |
| T8 | Less | e2e | e2e | ✅ OK |
| T9 | Less | e2e | e2e | ✅ OK |
| T10 | Browser JS | e2e | e2e | ✅ OK |
