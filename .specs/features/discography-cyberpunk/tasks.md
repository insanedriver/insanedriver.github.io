# Discography Cyberpunk Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/discography-cyberpunk/design.md`
**Status**: Draft

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none (no `AGENTS.md`, `CONTRIBUTING.md`, coverage config or lint config in the repo) - strong defaults applied. Conventions sampled from `tests/videos/*`, `tests/photos/*`, `playwright.config.cjs`, `package.json`, `.github/workflows/build-and-deploy.yml` (CI runs `npm run test:unit` + `npm run build`; e2e is local-only). `less/README.md` requires the compiled CSS to be committed alongside the `.less` change.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Catalog data (`_data/discography.json`, `_data/platforms.json`) | unit | Every listed edge case: required fields, unique slug, cover file exists on disk, known platform keys only, positive integer durations, verified-link rule | `tests/discography/*-data.test.cjs` | `npm run test:unit` |
| Pure JS helpers (`assets/js/discography-core.js`) | unit | All branches; 1:1 to the preview-state and event-shape ACs | `tests/discography/discography-core.test.cjs` | `npm run test:unit` |
| Page template (`discography/index.html`) | e2e | Every AC the rendered markup can assert: happy path + sparse-data path + no-JS path | `tests/discography/*.e2e.cjs` | `npm test` |
| Behavior JS (`assets/js/discography.js`) | e2e | Open / switch / re-click-close, one-iframe invariant, no-iframe-on-load, ARIA state, no-JS degradation, tracking push without blocking navigation | `tests/discography/*.e2e.cjs` | `npm test` |
| Styles (`less/*.less` + compiled `assets/css/style.min.css`) | e2e | Panel vocabulary present, no legacy player markup, mobile stacking, band page computed styles unchanged | `tests/discography/theme.e2e.cjs`, `tests/band/cyber-links.e2e.cjs` | `npm test` |
| Static assets (`assets/images/releases/*.jpg`) | none | Build gate only; existence is asserted by the catalog data test | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute. No linter or formatter is configured in this repo, so the Build gate is build + full test suite.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm test` (runs `test:unit`, then `less:build` + Playwright) |
| Build | After phase completion or asset-only tasks | `npm run build && npm test` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Catalog data

The frozen source of truth. Nothing renders until it exists.

```
T1 → T3
T3 → T4
```

T2 has no dependency; it is ordered by phase only.

### Phase 2: Page rendering

Static markup from the catalog. Every listening route works at the end of this phase, unstyled.

```
T2 → T5
T4 → T5
T5 → T6
T6 → T7
T7 → T8
```

### Phase 3: Behavior

Progressive enhancement on top of working markup.

```
T8 → T10
T9 → T10
T10 → T11
```

### Phase 4: Theme

CSS last, so each earlier task was verifiable on its own.

```
T11 → T13
T12 → T13
```

---

## Task Breakdown

### T1: Add release cover images

**What**: Download the highest-resolution cover for each of the 21 releases, resize to 600px, and commit them as `assets/images/releases/<slug>.jpg`.
**Where**: `assets/images/releases/`
**Depends on**: None
**Reuses**: Deezer `cover_xl` (1000px) and iTunes `artworkUrl100` upscaled via the `600x600bb` URL form; `Capa_IDAlbum_Final_RGB.jpg` for the 2016 album.
**Requirement**: DISC-33

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] 21 files exist, named `<slug>.jpg`, one per release in the catalog
- [ ] Each file is 600x600 and <=120KB
- [ ] `git status` shows no image written outside `assets/images/releases/`
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: none
**Gate**: build

**Commit**: `feat(discography): add 600px release covers`

**Status**: ✅ Done

---

### T2: Create the platform registry

**What**: Create `_data/platforms.json` listing the eight platforms in display order with `key`, `name`, `sub`, `icon` and `primary` (true for Spotify and Apple Music), plus `tests/discography/platforms-data.test.cjs` asserting the set, the order, the two primaries and that every icon is a Font Awesome 4 class that exists in `less/font-awesome.less`.
**Where**: `_data/platforms.json`
**Depends on**: None
**Reuses**: icon classes and sub-labels from `band/index.html:117-160`
**Requirement**: DISC-02, DISC-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Registry has exactly the 8 keys: spotify, apple, ytmusic, deezer, tidal, amazon, pandora, bandcamp
- [ ] `primary` is true only for spotify and apple, and they are the first two entries
- [ ] Every `icon` value matches a class defined in `less/font-awesome.less`
- [ ] Gate check passes: `npm run test:unit`
- [ ] Test count: 4 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(discography): add platform registry data`

**Status**: ✅ Done

---

### T3: Create the album catalog

**What**: Create `_data/discography.json` with `albums` (Silicon Fortress 2021, Insane Driver Deluxe Edition 2018, Insane Driver 2016) - slug, title, year, releaseDate, cover + intrinsic size, type, spotifyId, the eight `links` (each HTTP-checked; anything not answering 2xx/3xx recorded as `null`), `buyCd`, and the full tracklist with per-track durations in seconds - plus `tests/discography/discography-data.test.cjs` covering every data edge case in the spec.
**Where**: `_data/discography.json`
**Depends on**: T1
**Reuses**: `_data/videos.json` shape conventions; iTunes Lookup API and Deezer public API for tracklists and durations
**Requirement**: DISC-01, DISC-30, DISC-43, DISC-46

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] 3 albums with 11 / 15 / 11 tracks, each track carrying position, title and a positive integer duration
- [ ] Every non-null link was fetched once and returned 2xx/3xx; the check result is recorded in the task's commit body
- [ ] `buyCd` is `/preorder/` for silicon-fortress, `/store/` for insane-driver, `null` for the deluxe
- [ ] Data test asserts: required fields present, slugs unique and kebab-case, cover file exists on disk, only known platform keys, durations positive integers, `buyCd` is null or an internal path
- [ ] Gate check passes: `npm run test:unit`
- [ ] Test count: 8 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(discography): add album catalog with verified platform links`

**Status**: ✅ Done

---

### T4: Add the singles to the catalog

**What**: Add the `singles` array (18 releases, newest first, starting with Keep Away (Acoustic) 2025-05-09) with the same shape, `tracks: []`, `spotifyId: null`, and only the Spotify and Apple Music links populated; extend the data test to cover both arrays and assert slug uniqueness across the whole catalog.
**Where**: `_data/discography.json`
**Depends on**: T3
**Reuses**: the album entries' shape; iTunes Lookup API results already gathered
**Requirement**: DISC-15, DISC-19, DISC-43

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] 18 singles present, sorted by `releaseDate` descending
- [ ] The three 2024-2025 releases (the-sun-will-rise, waiting-for-you, keep-away-acoustic) are among the first six
- [ ] Every single has a cover file on disk and at least one non-null link
- [ ] Data test runs over albums + singles and asserts slugs are unique across both
- [ ] Gate check passes: `npm run test:unit`
- [ ] Test count: 11 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(discography): add singles to the catalog`

**Status**: ✅ Done

---

### T5: Rewrite the page with the index panel and album cards

**What**: Replace `discography/index.html` with the cyber-zone shell, the `DISC::INDEX` panel (counters + one anchor per album) and one `REL::<year>` panel per album carrying cover, meta, the platform grid rendered from the registry (primary buttons first, `null` links omitted), and the `BUY CD` anchor; plus `tests/discography/markup.e2e.cjs`.
**Where**: `discography/index.html`
**Depends on**: T2, T4
**Reuses**: panel markup from `videos/index.html:11-45`; button markup from `band/index.html:117-160`
**Requirement**: DISC-01, DISC-02, DISC-03, DISC-04, DISC-05, DISC-06, DISC-07, DISC-08, DISC-09, DISC-10, DISC-35, DISC-36, DISC-37, DISC-38, DISC-45

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Three album cards render, each with `id` equal to its slug, and the index anchors resolve to them
- [ ] Every rendered platform anchor's href equals the catalog value, carries `target="_blank"` and `rel="noopener"`, and no anchor exists for a `null` link
- [ ] Spotify and Apple Music anchors precede the other platforms in DOM order and carry the primary modifier class
- [ ] `BUY CD` present on silicon-fortress and insane-driver, absent on the deluxe
- [ ] E2E asserts the same page with `javaScriptEnabled: false` still exposes every platform anchor
- [ ] Gate check passes: `npm test`
- [ ] Test count: 9 e2e tests pass (no silent deletions)

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): render release cards with multi-platform links`

**Status**: ✅ Done

---

### T6: Add collapsed tracklists

**What**: Add a closed `<details>` tracklist to each album card listing position, title and duration formatted `m:ss`, and extend `tests/discography/seo.e2e.cjs` to cover it.
**Where**: `discography/index.html`
**Depends on**: T5
**Reuses**: native `<details>`; durations from the catalog
**Requirement**: DISC-29, DISC-30

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Each album renders a `<details>` without the `open` attribute
- [ ] Track rows equal the catalog count (11 / 15 / 11) and durations render as `m:ss` with a zero-padded seconds field
- [ ] E2E asserts the disclosure opens with JavaScript disabled
- [ ] Gate check passes: `npm test`
- [ ] Test count: 4 e2e tests pass (no silent deletions)

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): add collapsed tracklists to album cards`

**Status**: ✅ Done

---

### T7: Emit MusicAlbum JSON-LD

**What**: Add one `application/ld+json` `MusicAlbum` block per album (name, datePublished, byArtist, numTracks, image, `sameAs` with every non-null platform URL, and a `track` list of `MusicRecording` with name, position and ISO 8601 duration), and extend `tests/discography/seo.e2e.cjs` to parse and assert it.
**Where**: `discography/index.html`
**Depends on**: T6
**Reuses**: catalog durations converted to `PTxMyS`
**Requirement**: DISC-31, DISC-32, DISC-33, DISC-34

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Three JSON-LD blocks parse as valid JSON with `@type: MusicAlbum`
- [ ] `sameAs` equals exactly the non-null platform URLs of that album
- [ ] `track` length matches the tracklist and each duration matches the ISO form of the catalog seconds
- [ ] Every cover `<img>` src starts with `/assets/images/releases/` and carries width, height, and `loading="lazy"` on all but the first
- [ ] Gate check passes: `npm test`
- [ ] Test count: 8 e2e tests pass (no silent deletions)

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): emit MusicAlbum structured data`

**Status**: ✅ Done

---

### T8: Add the singles panel

**What**: Add the `DISC::SINGLES` panel rendering the 6 newest singles (`limit:6`) followed by a closed `<details>` containing the rest (`offset:6`), each card showing cover, title, year and its Spotify / Apple Music anchors; plus `tests/discography/singles.e2e.cjs`.
**Where**: `discography/index.html`
**Depends on**: T7
**Reuses**: verified `limit`/`offset` support on liquidjs 6.4.3; platform registry for the two compact links
**Requirement**: DISC-15, DISC-16, DISC-17, DISC-18, DISC-19, DISC-20, DISC-45

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] 6 single cards render outside any `<details>`; the remaining 12 render inside a closed one
- [ ] No single card contains a preview button or a Spotify iframe
- [ ] E2E with `javaScriptEnabled: false` opens the disclosure and finds the remaining singles
- [ ] The index panel's single counter equals the catalog length
- [ ] Gate check passes: `npm test`
- [ ] Test count: 6 e2e tests pass (no silent deletions)

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): add singles panel with native disclosure`

**Status**: ✅ Done

---

### T9: Add the pure preview/tracking helpers

**What**: Create `assets/js/discography-core.js` exposing `spotifyEmbedUrl(id)`, `clickEvent(platform, slug)` and `nextPreviewState(current, requested)` with the dual `window` / `module.exports` export used by `videos-core.js`, plus `tests/discography/discography-core.test.cjs`.
**Where**: `assets/js/discography-core.js`
**Depends on**: None
**Reuses**: `assets/js/videos-core.js` export pattern
**Requirement**: DISC-22, DISC-23, DISC-24, DISC-25, DISC-39, DISC-41

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `spotifyEmbedUrl` returns `https://open.spotify.com/embed/album/<id>` and throws or returns null for an empty id
- [ ] `nextPreviewState` covers all three branches: open from closed, switch, close on re-request
- [ ] `clickEvent` returns exactly `{event:'release_click', platform, release}`
- [ ] Gate check passes: `npm run test:unit`
- [ ] Test count: 7 tests pass (no silent deletions)

**Tests**: unit
**Gate**: quick

**Commit**: `feat(discography): add pure preview and tracking helpers`

**Status**: ✅ Done

---

### T10: Wire the lazy Spotify preview

**What**: Create `assets/js/discography.js` that reveals the hidden `PREVIEW` buttons, injects the Spotify iframe into the album's preview slot on click, enforces one open preview at a time, closes on re-click and keeps `aria-expanded` in sync; add `_includes/js/discography.liquid` loading `js/pack`, the core and the page script; point the page front matter at it; plus `tests/discography/preview.e2e.cjs`.
**Where**: `assets/js/discography.js`, `_includes/js/discography.liquid`, `discography/index.html`
**Depends on**: T8, T9
**Reuses**: `_includes/js/videos.liquid`; the hidden-controls pattern from `assets/js/videos.js`
**Requirement**: DISC-21, DISC-22, DISC-23, DISC-24, DISC-25, DISC-26, DISC-27, DISC-28, DISC-44

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] No `open.spotify.com` request fires on initial load (asserted by intercepting network requests)
- [ ] Opening a second preview leaves exactly one iframe in the DOM
- [ ] Re-clicking the open album's button removes the iframe and sets `aria-expanded="false"`
- [ ] Cover and platform anchors stay visible and clickable while a preview is open
- [ ] With `javaScriptEnabled: false`, no preview button is visible and every platform anchor still works
- [ ] Albums without a `spotifyId` render no preview button
- [ ] Gate check passes: `npm test`
- [ ] Test count: 8 e2e tests pass (no silent deletions)

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): load the Spotify preview on demand`

**Status**: ✅ Done

---

### T11: Push platform clicks to the dataLayer

**What**: Extend `assets/js/discography.js` with a delegated click handler that pushes `{event:'release_click', platform, release}` to `window.dataLayer` (creating the array when absent) without calling `preventDefault`; plus `tests/discography/tracking.e2e.cjs`.
**Where**: `assets/js/discography.js`
**Depends on**: T10
**Reuses**: `clickEvent` from the core helpers; GTM already loaded by `_includes/head/gtm.liquid`
**Requirement**: DISC-39, DISC-40, DISC-41, DISC-42

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Clicking a platform anchor records the expected object in `window.dataLayer`
- [ ] The handler never calls `preventDefault` and the anchor's default navigation is preserved (asserted by observing the popup/navigation attempt)
- [ ] With `window.dataLayer` deleted before the click, the handler recreates it and pushes without throwing
- [ ] Anchors still navigate with JavaScript disabled
- [ ] Gate check passes: `npm test`
- [ ] Test count: 5 e2e tests pass (no silent deletions)

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): track platform clicks in the dataLayer`

**Status**: ✅ Done

---

### T12: Extract the shared platform-button system

> **Executed out of plan order, before T11.** T12 declares `Depends on: None`, so nothing blocked it. T11's click test could not pass first: with no CSS, `.cyber-link-btn` is still an inline anchor whose bounding box has a hole in the middle, and the click hit-tests onto the shell. Styling the button removed the obstacle. No dependency was violated; only the phase sequence written in this file.

**What**: Move `.cyber-link-btn` and the per-platform hover rules out of `less/band.less` into a new `less/cyber-links.less` as a `.cyber-links-system()` mixin, import it from `less/style.less`, invoke it inside `#page_band`, recompile `assets/css/style.min.css`, and add `tests/band/cyber-links.e2e.cjs` asserting the band buttons' computed styles.
**Where**: `less/cyber-links.less`, `less/band.less`, `less/style.less`, `assets/css/style.min.css`
**Depends on**: None
**Reuses**: the exact declarations at `less/band.less:590-730`
**Requirement**: DISC-11, DISC-12

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `less/band.less` no longer declares `.cyber-link-btn` or any `.cyber-link--*` rule
- [ ] The compiled `assets/css/style.min.css` is committed alongside the `.less` changes (per `less/README.md`)
- [ ] E2E asserts the band page's Spotify button keeps its border color, box-shadow and icon color on hover and its computed font-size/letter-spacing unchanged
- [ ] Gate check passes: `npm test`
- [ ] Test count: 4 e2e tests pass (no silent deletions)

**Tests**: e2e
**Gate**: full

**Commit**: `refactor(css): extract the cyber link button system`

**Status**: ✅ Done

---

### T13: Theme the discography page

**What**: Replace `less/discography.less` with the full `#page_discography` theme - cyber zone and panels, index panel, two-column release card collapsing to stacked below 768px, primary/secondary link grids via the shared mixin, singles grid, tracklist and preview slot - recompile `assets/css/style.min.css`, and add `tests/discography/theme.e2e.cjs`.
**Where**: `less/discography.less`, `assets/css/style.min.css`
**Depends on**: T11, T12
**Reuses**: `less/videos.less` panel styles; the `.cyber-zone-inner` max-width escape documented at `less/videos.less:72-79`
**Requirement**: DISC-08, DISC-09, DISC-13, DISC-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Page exposes `.cyber-zone`, `.cyber-panel`, `.cyber-panel-tab`, `data-hud` and the corner spans
- [ ] No `.player`, `.iframe-spotify` or `.player-art` element exists on the page, and `less/player.less` is unchanged
- [ ] `.cyber-zone-inner` renders wider than 560px at a 1280px viewport (the `contact.less` leak is neutralized)
- [ ] At a 375px viewport the cover renders above the platform buttons in each release card
- [ ] Compiled CSS committed with the `.less` change
- [ ] Gate check passes: `npm run build && npm test`
- [ ] Test count: 7 e2e tests pass (no silent deletions)

**Tests**: e2e
**Gate**: build

**Commit**: `style(discography): apply the cyberpunk theme`

---

## Phase Execution Map

Phases run in sequence; tasks within a phase run in order. One arrow per real dependency:

```
Phase 1:
T1 → T3
T3 → T4

Phase 2:
T2 → T5
T4 → T5
T5 → T6
T6 → T7
T7 → T8

Phase 3:
T8 → T10
T9 → T10
T10 → T11

Phase 4:
T11 → T13
T12 → T13
```

T2, T9 and T12 carry no dependency and are positioned by phase order alone.

Execution is strictly sequential - there is no intra-phase parallelism.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Release covers | 1 asset directory | ✅ Granular |
| T2: Platform registry | 1 data file | ✅ Granular |
| T3: Album catalog | 1 data file | ✅ Granular |
| T4: Singles catalog | same data file, additive | ✅ Granular |
| T5: Page rewrite | 1 template | ✅ Granular |
| T6: Tracklists | same template, one section | ✅ Granular |
| T7: JSON-LD | same template, one block type | ✅ Granular |
| T8: Singles panel | same template, one panel | ✅ Granular |
| T9: Core helpers | 1 module | ✅ Granular |
| T10: Preview wiring | 1 script + its loader include + front-matter line | ⚠️ 3 files, one cohesive deliverable - a script that is not loaded cannot be e2e-tested, so merging backward is required by the test co-location rule |
| T11: Click tracking | same script, one handler | ✅ Granular |
| T12: CSS extraction | 1 new file + the file it is moved out of + import + compiled output | ⚠️ 4 files, but a move is atomic by nature - splitting it would leave the band page with duplicate or missing rules mid-sequence |
| T13: Page theme | 1 stylesheet + compiled output | ⚠️ 2 files, but `less/README.md` requires the compiled CSS in the same commit |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | none | ✅ Match |
| T2 | None | none (phase order only) | ✅ Match |
| T3 | T1 | T1 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T2, T4 | T2 → T5, T4 → T5 | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | None | none (phase order only) | ✅ Match |
| T10 | T8, T9 | T8 → T10, T9 → T10 | ✅ Match |
| T11 | T10 | T10 → T11 | ✅ Match |
| T12 | None | none (phase order only) | ✅ Match |
| T13 | T11, T12 | T11 → T13, T12 → T13 | ✅ Match |

No dependency points at a later phase.

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Static assets | none | none | ✅ OK |
| T2 | Catalog data | unit | unit | ✅ OK |
| T3 | Catalog data | unit | unit | ✅ OK |
| T4 | Catalog data | unit | unit | ✅ OK |
| T5 | Page template | e2e | e2e | ✅ OK |
| T6 | Page template | e2e | e2e | ✅ OK |
| T7 | Page template | e2e | e2e | ✅ OK |
| T8 | Page template | e2e | e2e | ✅ OK |
| T9 | Pure JS helpers | unit | unit | ✅ OK |
| T10 | Behavior JS + page template | e2e | e2e | ✅ OK |
| T11 | Behavior JS | e2e | e2e | ✅ OK |
| T12 | Styles | e2e | e2e | ✅ OK |
| T13 | Styles | e2e | e2e | ✅ OK |
