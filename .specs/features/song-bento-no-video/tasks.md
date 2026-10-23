# Song Bento Without Video Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/song-bento-no-video/design.md`
**Status**: In Progress

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `package.json` scripts, `playwright.config.cjs`, `.specs/LESSONS.md` (L-004, L-024, candidates L-045/L-046); no coverage threshold configured - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Build-time data (`lib/catalog.js`) | unit | All branches; each condition of `songLayout` true alone (L-024) | `tests/seo/catalog.test.cjs` | `npm run test:unit` |
| Liquid templates (markup) | e2e (no JS) | Every in-scope song for markup ACs; one instrumental and one video song for negatives | `tests/discography/song-bento.e2e.cjs` | `npx playwright test <file>` |
| Less (layout / finish) | e2e (computed styles) | Each layout AC at the named widths; each style AC on computed values | `tests/discography/song-bento.e2e.cjs` | `npx playwright test <file>` |
| Tracking (existing delegated handler) | e2e | Click asserts the pushed payload, navigation blocked (L-046) | `tests/discography/song-bento.e2e.cjs` | `npx playwright test <file>` |

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
T1
```

### Phase 2: Markup

```
T2 → T3 → T4
```

### Phase 3: Styles

```
T5 → T6
```

---

## Task Breakdown

### T1: Song layout rule ✅

**What**: Export `songLayout(song)` and `listenUrl(uplink)`; set `layout` (`video` | `lyrics` | `stack`) and `listenUrl` on every built song.
**Where**: `lib/catalog.js`
**Depends on**: None
**Reuses**: `build()` song object
**Requirement**: NOVID-01, NOVID-03, NOVID-12, NOVID-13 (data side)

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] `{video}` → `video`; `{video, instrumental}` → `video`; `{instrumental}` → `stack`; `{}` → `lyrics`
- [ ] `build()`: keep-away `video`, faceless-demons `lyrics`, endless-path `stack`; 10 songs are `lyrics`
- [ ] `listenUrl`: the `spotify` entry's URL from the uplink list; `null` when the list has no `spotify` entry or is empty (NOVID-13)
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(catalog): classify song pages by layout and pick the listen url`

---

### T2: Extract bento partials

**What**: Split `song-bento.liquid` into `song-bento-meta.liquid` and `song-panel-uplink/dossier/lyrics.liquid`; the video composition includes them, adds `song-bento--video`, and Panel B wraps its content in `.song-bento-sticky`; sticky rule scoped to `.song-bento--video .song-bento-panel--d`.
**Where**: `_includes/discography/song-bento.liquid`
**Depends on**: None (Phase 1 complete)
**Reuses**: Current bento markup
**Requirement**: NOVID-07 (video side preserved)

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] All existing BENTO-* and SONG-* e2e stay green on the 10 video songs
- [ ] New e2e: on a video song at 1280px, Panel B's `.song-bento-sticky` has `position: static` and Panel D's has `sticky`
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `refactor(song): extract the bento meta bar and panels into partials`

---

### T3: Lyrics bento markup

**What**: `song-bento-lyrics.liquid` (meta, C, B, D) rendered when `song.layout == 'lyrics'`; wrapper class and `page_header_class` driven by `song.layout`; Panel D wraps About/Also in `.song-bento-dossier` (+ `--split`); BENTO-02 and BENTO-08 text and tests narrowed to instrumental songs.
**Where**: `_includes/discography/song-bento-lyrics.liquid`
**Depends on**: T2
**Reuses**: T2 partials, `song.layout`
**Requirement**: NOVID-01, 02, 03, 10, 11, 15, 16, 17

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] No-JS e2e over all 10 in-scope songs: tab order C, B, D; no PANEL A / `#song-video` / QUICK PLAY; meta bar content; badge h1; Panel B per BENTO-18..22; Panel C per BENTO-25..27; Panel D About/Also/CATALOG
- [ ] Endless Path and Back to 1994: no bento, no meta bar, h1 without badge (NOVID-03); BENTO-02/08 amended in `song-video-bento/spec.md`
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(song): render the bento grid for songs without a video`

---

### T4: LISTEN NOW

**What**: The meta partial renders `[data-song-listen]` (`href` = `song.listenUrl`, `release_click` attributes) when the song has no video and `song.listenUrl` is set.
**Where**: `_includes/discography/song-bento-meta.liquid`
**Depends on**: T3
**Reuses**: `song.listenUrl` (T1), delegated `release_click` handler
**Requirement**: NOVID-08, 12, 13, 23

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] e2e on all 10 songs: text `Listen now`, `fa-spotify` icon, href = Spotify uplink URL, `_blank`, `noopener`, `data-disc-link="spotify"`, `data-disc-slug` = album slug
- [ ] e2e click (navigation blocked) pushes exactly one `{event:'release_click', platform:'spotify', release:<album slug>}`
- [ ] NOVID-13: the `null` case is covered by T1's unit test; the template guards on `song.listenUrl` (no song lacks Spotify today, so no e2e page exists for it)
- [ ] With JS disabled the anchor keeps its href and target (NOVID-23)
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(song): add listen now to the metadata bar of songs without a video`

---

### T5: Lyrics bento layout

**What**: `.song-bento--lyrics` grid, Panel B sticky, Panel D split and 70ch About.
**Where**: `less/song-bento.less`
**Depends on**: None (Phase 2 complete)
**Reuses**: `.song-bento` grid, sticky rule
**Requirement**: NOVID-04, 05, 06, 07, 09, 18, 19, 20

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] e2e at 1280 and 992: C/B ratio 0.64–0.69, D spans C-left to B-right ±2px, B sticky `top: 20px`, D static, About/Also ratio 0.64–0.69 on a split song, CATALOG below both
- [ ] e2e at 991/768/375: C, B, D stacked full width
- [ ] Faceless Demons About width ≤ 70 × `0` glyph width
- [ ] Overflow check at 375/768/992/1280 on all 22 song pages
- [ ] Rebuilt `assets/css/discography.min.css` committed
- [ ] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(song): lay out the lyrics bento responsively`

---

### T6: HUD finish for the lyrics bento

**What**: LISTEN NOW style parity and the HUD ACs on the lyrics layout.
**Where**: `less/song-bento.less`
**Depends on**: T5
**Reuses**: `a.song-bento-quickplay` rule, focus ring `less/discography.less:225`
**Requirement**: NOVID-14, 21, 22

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [ ] e2e: LISTEN NOW background, color and clip-path equal QUICK PLAY's on a video song
- [ ] e2e on a lyrics song: BENTO-36/37/39/40/41 assertions (radius 0, SiliconFont tabs, `animation-name: none` under reduced motion, panel background, text colors)
- [ ] e2e: keyboard focus on LISTEN NOW, a Panel B anchor and a `.song-nav` link shows the 3px yellow outline at 4px offset
- [ ] Rebuilt `assets/css/discography.min.css` committed
- [ ] Gate check passes: build gate

**Tests**: e2e
**Gate**: build
**Commit**: `feat(song): apply the hud finish to songs without a video`

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | start of Phase 1 | ✅ Match |
| T2 | None (phase order) | start of Phase 2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | None (phase order) | start of Phase 3 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Build-time data | unit | unit | ✅ OK |
| T2 | Liquid templates + Less (sticky scope) | e2e | e2e | ✅ OK |
| T3 | Liquid templates | e2e | e2e | ✅ OK |
| T4 | Liquid templates + tracking | e2e | e2e | ✅ OK |
| T5 | Less | e2e | e2e | ✅ OK |
| T6 | Less | e2e | e2e | ✅ OK |
