# Home Cyberpunk Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/home-cyberpunk/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none (no `AGENTS.md`, `CONTRIBUTING.md`, coverage or lint config) - strong defaults applied. Conventions sampled from `tests/discography/*`, `tests/videos/*`, `playwright.config.cjs`, `package.json`, `.github/workflows/*.yml` (CI runs `npm run test:unit` + `npm run build`; e2e is local-only). `less/README.md` requires the compiled `assets/css/style.min.css` to be committed with every `.less` change.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Pure JS helpers (`assets/js/home-core.js`) | unit | All branches; 1:1 to HOME-09/18/22-25/36-37 and every event shape; every listed edge case (empty singles, tie, missing Spotify URL, throwing storage, missing fonts) | `tests/home/home-core.test.cjs` | `npm run test:unit` |
| Eleventy data file (`_data/homeRelease.js`) | unit | Output fields, today's expected release, `detailUrl` for album and single, `null` path | `tests/home/home-release.test.cjs` | `npm run test:unit` |
| Templates (`_layouts/home.html`, `index.html`, `_includes/**`, `newsletter/index.html`) | e2e | Every AC the rendered markup can assert: happy path + no-JS path + absence of forbidden legacy markup | `tests/home/*.e2e.cjs` | `npm test` |
| Behavior JS (`assets/js/home.js`) | e2e | Loader timing (first/repeat/cap/skip/storage-failure), navbar threshold, preview open/close/one-iframe, every `dataLayer` event, missing `dataLayer`, no-JS degradation | `tests/home/*.e2e.cjs` | `npm test` |
| Styles (`less/home.less`, `less/cyber-links.less` + compiled CSS) | e2e | Computed-style assertions per effect (fonts, palette, overflow, layer order, reduced motion, no horizontal scroll at 375/768/1440, `/band/` navbar unchanged) | `tests/home/*.e2e.cjs` | `npm test` |
| Static assets (`assets/images/home/*`) | none | Build gate only; existence and dimensions asserted by the hero e2e | - | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute. No linter or formatter is configured.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm test` (unit, then `less:build` + Playwright) |
| Build | After phase completion or asset-only tasks | `npm run build && npm test` |

---

## Execution Plan

Phases are ordered and run sequentially - each phase completes before the next begins, and tasks within a phase execute in order.

### Phase 1: Foundation

Pure logic, data and assets. Nothing renders yet.

```
T1 → T2
```

T3 and T4 have no dependency; they are ordered by phase only.

### Phase 2: Markup

The new home renders from data, unstyled but complete, and works without JavaScript.

```
T3 → T5
T2 → T6
T5 → T6
T6 → T7
T7 → T8
T7 → T9
T4 → T9
T6 → T10
T5 → T11
```

### Phase 3: Look

The cyberpunk skin, hero first, then panels, loader and navbar styles.

```
T8 → T12
T12 → T13
T13 → T14
T12 → T15
T12 → T16
```

### Phase 4: Behavior

`home.js` wires loader, navbar, preview and tracking.

```
T11 → T17
T15 → T17
T16 → T18
T17 → T18
T18 → T19
T19 → T20
```

---

## Task Breakdown

### T1: Pure home helpers

**What**: Create `assets/js/home-core.js` (UMD, `window.IDHome`) with `latestRelease`, `releaseTypeLabel`, `spotifyAlbumId`, `spotifyEmbedUrl`, `loaderDismissAt`, `isRepeatVisit`, `markVisited`, `navIsSolid` and the four event builders, per the design interfaces.
**Where**: `assets/js/home-core.js`
**Depends on**: None
**Reuses**: `assets/js/discography-core.js` UMD wrapper and `spotifyEmbedUrl`
**Requirement**: HOME-09, HOME-18, HOME-22, HOME-23, HOME-24, HOME-25, HOME-36, HOME-37, HOME-26, HOME-47, HOME-49, HOME-50

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [x] `latestRelease` returns Keep Away (Acoustic) for the real catalog, the album on a same-day tie, the newest album when `singles` is empty, `null` for an empty catalog
- [x] `spotifyAlbumId` prefers `spotifyId`, parses `open.spotify.com/album/<id>` (with and without query string), returns `null` for missing or non-album URLs
- [x] `loaderDismissAt`: repeat -> start+400; first with early ready -> start+1200; ready at 2s -> start+2000; ready at 5s or never -> start+3500
- [x] `isRepeatVisit` returns `false` for `null` storage and for a storage whose `getItem` throws; `markVisited` never throws
- [x] `navIsSolid(40)` is `false`, `navIsSolid(41)` is `true`
- [x] Each event builder returns exactly the spec shape (asserted with `deepStrictEqual`)
- [x] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Status**: ✅ Done
**Commit**: `feat(home): add pure home helpers`

---

### T2: Latest-release data file

**What**: Create `_data/homeRelease.js` returning the latest release decorated with `typeLabel`, `embedId` and `detailUrl`, or `null`.
**Where**: `_data/homeRelease.js`
**Depends on**: T1
**Reuses**: `_data/highlights.js` data-file pattern, `home-core.js`
**Requirement**: HOME-09, HOME-10, HOME-14

**Tools**:

- MCP: NONE
- Skill: `tdd`

**Done when**:

- [x] Returns `slug: 'keep-away-acoustic'`, `typeLabel: 'SINGLE'`, `embedId: '14HkhB5FwTGesQECbSBSML'`, `detailUrl: '/discography/'` for today's catalog
- [x] An album result gets `detailUrl: '/discography/#<slug>'` (tested through an injected catalog)
- [x] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Status**: ✅ Done
**Commit**: `feat(home): expose the latest release to templates`

---

### T3: Hero image derivatives

**What**: Generate `hero-768`, `hero-1280`, `hero-1920` in WebP and progressive JPG from `assets/images/band.jpg` with ImageMagick into `assets/images/home/`.
**Where**: `assets/images/home/`
**Depends on**: None
**Reuses**: `assets/images/band.jpg`
**Requirement**: HOME-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Six files exist with widths 768/1280/1920 and 3:2 aspect
- [x] Each 1920 file is smaller than the 1920 source JPG
- [x] Gate check passes: `npm run build && npm test`

**Tests**: none
**Gate**: build
**Status**: ✅ Done
**Commit**: `feat(home): add responsive hero photo derivatives`

---

### T4: Shared country list include

**What**: Move the `COUNTRY` `<option>` list from `newsletter/index.html` into `_includes/newsletter/countries.liquid` and render it back in place, with an e2e test pinning the rendered option values and order on `/newsletter/`.
**Where**: `_includes/newsletter/countries.liquid`
**Depends on**: None
**Reuses**: `newsletter/index.html` option list verbatim
**Requirement**: HOME-46

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Before the move, the option values of `/newsletter/` are captured; after, the e2e asserts the same count, first and last values and an order checksum
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `refactor(newsletter): extract the country list into an include`

---

### T5: Home layout frame

**What**: Rewrite `_layouts/home.html`: drop `please-wait`, Owl and the logo `h1`; add Open Graph + Twitter meta, hero image preload, the inline boot script that adds `home-js home-loading` to `<html>`, and the `#home-loader` markup (`role="status"`, logo, three boot lines, progress bar, skip hint).
**Where**: `_layouts/home.html`
**Depends on**: T3
**Reuses**: `_layouts/base.html` include order
**Requirement**: HOME-05, HOME-08, HOME-20, HOME-21, HOME-53

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: `/` has no `#owl-demo`, `.header-img`, `please-wait` script or `.page-header`; menu and footer present
- [x] E2E: `og:title`, `og:description`, `og:type=website`, `og:url`, absolute `og:image` ending `hero-1280.jpg`, `twitter:card=summary_large_image`
- [x] E2E with JS: `html` has `home-loading` at first paint and the loader contains the logo, >= 3 boot lines and a progress bar
- [x] E2E with JS disabled: `#home-loader` is not visible
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `feat(home): rebuild the home layout with a cyber loader frame`

---

### T6: Hero section

**What**: Replace `index.html` content with the hero: `<picture>` (WebP + JPG srcset 768/1280/1920, `fetchpriority="high"`), the three `aria-hidden` overlay layers, the `h1` with the logo, the tagline and the latest-release card with Spotify and Apple Music anchors.
**Where**: `index.html`
**Depends on**: T2, T5
**Reuses**: `cyber-link-btn--primary` markup from `discography/index.html`
**Requirement**: HOME-02, HOME-03, HOME-04, HOME-05, HOME-06, HOME-10, HOME-11, HOME-12

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: exactly one `h1`, accessible name "Insane Driver", img `alt="Insane Driver"`
- [x] E2E: tagline text `BRAZILIAN METAL // SINCE 2013` inside the hero
- [x] E2E: `srcset` lists 768w, 1280w, 1920w for WebP and JPG; hero image has no `loading="lazy"`
- [x] E2E: card shows Keep Away (Acoustic), `SINGLE`, 2025, Spotify + Apple anchors with `target=_blank`, `rel=noopener`, primary modifier and the catalog hrefs
- [x] E2E: no `#player*`, `#player-sf`, `#player_spotify`; zero `iframe` after `load`
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `feat(home): render the hero with the latest release`

---

### T7: Cyber zone and NOW::STREAMING panel

**What**: Add the `.home-shell.cyber-zone > .cyber-zone-inner` wrapper and the `NOW::STREAMING` panel: cover, title, every platform anchor present in `_data/platforms.json` order, detail link, hidden `PREVIEW` button (only when `embedId`), empty preview slot.
**Where**: `index.html`
**Depends on**: T6
**Reuses**: discography release-card link loop and panel markup
**Requirement**: HOME-14, HOME-18, HOME-19, HOME-30

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: panel carries tab `NOW::STREAMING`, `data-hud`, `top-accent` and three corner spans
- [x] E2E: anchors equal the non-null links of the latest release; detail link is `/discography/`
- [x] E2E with JS disabled: `PREVIEW` button hidden, all anchors present
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `feat(home): add the now streaming panel`

---

### T8: Teaser panels

**What**: Add `ID-TV::LATEST` (poster + title of `videos[0]` linking to `/videos/#<slug>`), `DISC::ARCHIVE` (3 album anchors to `/discography/#<slug>`) and `VISUAL::FEED` (6 highlight thumbnails + `/photos/` anchor) with `data-home-teaser` hooks.
**Where**: `index.html`
**Depends on**: T7
**Reuses**: `_data/videos.json`, `_data/discography.json`, `_data/highlights.js`
**Requirement**: HOME-40, HOME-41, HOME-42, HOME-43

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: video anchor href `/videos/#keep-away`, poster `hqdefault.jpg` of `PTT5D9qFKcg`, `loading="lazy"`
- [x] E2E: album anchors in order silicon-fortress, insane-driver-deluxe, insane-driver with covers, titles, years
- [x] E2E: 6 thumbnails in `highlights.js` order with their `alt`, lazy; one anchor to `/photos/`
- [x] E2E with JS disabled: every teaser anchor present with its href
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `feat(home): add video, discography and photo teasers`

---

### T9: Newsletter panel

**What**: Add `SIGNAL::NEWSLETTER` with the Mailchimp form (same `action`, `method=post`, `target=_blank`), required `EMAIL`, required `COUNTRY` from the shared include, honeypot and labelled submit.
**Where**: `index.html`
**Depends on**: T4, T7
**Reuses**: `newsletter/index.html` form markup, `_includes/newsletter/countries.liquid`
**Requirement**: HOME-31, HOME-44, HOME-45, HOME-46, HOME-48

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: `action` equals the `/newsletter/` form `action`
- [x] E2E: `COUNTRY` option values identical to `/newsletter/`
- [x] E2E: every control has a label or accessible name; honeypot present
- [x] E2E: submitting with an empty or invalid email leaves `checkValidity()` false and opens no popup
- [x] E2E: panel order is NOW::STREAMING, ID-TV::LATEST, DISC::ARCHIVE, VISUAL::FEED, SIGNAL::NEWSLETTER
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `feat(home): add the inline newsletter signup`

---

### T10: MusicGroup structured data

**What**: Emit one `application/ld+json` `MusicGroup` script on `/` with `name`, `url`, `foundingDate` "2013", `genre`, `image` and `sameAs` (Spotify, YouTube, Instagram, Facebook, Twitter from the footer).
**Where**: `index.html`
**Depends on**: T6
**Reuses**: discography JSON-LD pattern
**Requirement**: HOME-52

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: exactly one JSON-LD script parses; `@type` `MusicGroup`, `foundingDate` `2013`, `sameAs` equals the five footer URLs
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `feat(home): emit MusicGroup structured data`

---

### T11: Home script include

**What**: Rewrite `_includes/js/home.liquid` to load `js/pack`, `home-core.js` and `home.js`, and replace the legacy `assets/js/home.js` body (Owl init, Spotify playlist append, `loadingScreen.finish`) with an empty IIFE shell.
**Where**: `_includes/js/home.liquid`
**Depends on**: T5
**Reuses**: `_includes/js/discography.liquid`
**Requirement**: HOME-05, HOME-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: `/` loads `home-core.js` and `home.js`, not `insane.js` or `videos.js`; no console errors on load
- [x] E2E: the mobile navbar toggle still opens the menu (Bootstrap from `js/pack`)
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `refactor(home): load the new home scripts`

---

### T12: Hero styles

**What**: Rewrite `less/home.less` with the `#page_home` hero: 100svh (100vh fallback), photo `object-fit`, vignette/grid/scan layers with `home-` keyframes, glitch logo, tagline, release card, desktop and <768px layouts, reduced-motion block; rebuild `style.min.css`.
**Where**: `less/home.less`
**Depends on**: T8
**Reuses**: palette and fonts from `less/discography.less`
**Requirement**: HOME-01, HOME-07, HOME-13, HOME-32, HOME-33, HOME-35

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: hero height equals viewport height at 1440x900 and 375x667
- [x] E2E: z-index order photo < vignette < grid < scan < content; overlays `aria-hidden`
- [x] E2E at 375x667: release card bounding box fully inside the first viewport
- [x] E2E: every hero animation name starts with `home-`; with `reducedMotion: 'reduce'` their computed `animation-name` is `none`
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `style(home): add the cyberpunk hero`

---

### T13: Zone and panel styles

**What**: Add to `less/home.less` the `.cyber-zone` / `.cyber-panel` block copied from discography with `home-` keyframes, the `overflow: hidden; overflow: clip` pair, the full-width guard, and the teaser, archive grid, photo mosaic and newsletter styles.
**Where**: `less/home.less`
**Depends on**: T12
**Reuses**: `less/discography.less:47-200`, `less/mailchimp.less`
**Requirement**: HOME-30, HOME-32, HOME-34, HOME-35, HOME-39

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: panel body font-family contains `Rajdhani`; `data-hud` HUD text uses `Share Tech Mono`; palette colors present (cyan border, magenta accent, yellow flag)
- [x] E2E: zone width equals viewport width; computed `overflow-y` is `clip` or `visible`
- [x] E2E: `scrollWidth <= clientWidth` at 375, 768 and 1440
- [x] E2E: panel animations disabled under reduced motion
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `style(home): theme the home panels`

---

### T14: Shared platform buttons on the home

**What**: Add `#page_home` to the scope of `less/cyber-links.less` so hero and streaming anchors use the shared button system; rebuild CSS.
**Where**: `less/cyber-links.less`
**Depends on**: T13
**Reuses**: `less/cyber-links.less`
**Requirement**: HOME-11, HOME-32

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: home Spotify primary button computed styles match the discography Spotify primary button (border color, font-family)
- [x] Existing `tests/band/cyber-links.e2e.cjs` and discography theme tests still pass
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `style(home): reuse the cyber link buttons`

---

### T15: Loader styles

**What**: Add the loader styles to `less/home.less`: shown only under `html.home-loading`, RGB-split glitch logo, staggered boot lines, progress bar, scanlines, `.is-done` exit, reduced-motion variant and the 4s CSS failsafe.
**Where**: `less/home.less`
**Depends on**: T12
**Reuses**: palette and scanline recipe from the hero
**Requirement**: HOME-20, HOME-21, HOME-29

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: boot lines use `Share Tech Mono`; loader covers the viewport while `home-loading` is set
- [x] E2E: with `home.js` blocked by route, the loader is hidden by 4.5s (failsafe)
- [x] E2E with reduced motion: loader animation names are `none`
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `style(home): add the cyberpunk boot loader`

---

### T16: Home navbar styles

**What**: Add `#page_home` navbar styles to `less/home.less`: fixed, transparent with a legibility scrim at top, `.is-solid` opaque with blur and cyan hairline, solid background when the mobile menu is open.
**Where**: `less/home.less`
**Depends on**: T12
**Reuses**: `less/header.less`
**Requirement**: HOME-36, HOME-37, HOME-38

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E: home navbar background alpha is 0 without `.is-solid` and 1 > alpha >= 0.9 with it (class set by the test)
- [x] E2E: `/band/` navbar computed background stays `rgb(0, 0, 0)` and position stays `static`/`relative`
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `style(home): float the navbar over the hero`

---

### T17: Loader behavior

**What**: Implement `loader()` in `assets/js/home.js`: ready promise (hero image + fonts), `loaderDismissAt` timer, 3.5s hard cap, session flag, click/`Esc` skip with `home_loader_skip`, `inert` on content while visible, progress bar width, dismissal cleanup.
**Where**: `assets/js/home.js`
**Depends on**: T11, T15
**Reuses**: `home-core.js`
**Requirement**: HOME-22, HOME-23, HOME-24, HOME-25, HOME-26, HOME-27, HOME-28

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] E2E (clock control): first view hidden between 1.2s and 3.5s; hero image routed to hang -> hidden at 3.5s
- [x] E2E: second view in the same context hidden by 0.5s
- [x] E2E: `sessionStorage` stubbed to throw -> full boot, no page error
- [x] E2E: `Esc` and click dismiss immediately; `dataLayer` holds `{event:'home_loader_skip'}`
- [x] E2E: while visible `role=status` with label and content `inert`; after dismissal loader `hidden`, content not `inert`, page scrollable
- [x] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Status**: ✅ Done
**Commit**: `feat(home): drive the boot loader`

---

### T18: Navbar scroll behavior

**What**: Implement `navbar()` in `assets/js/home.js`: rAF-throttled passive scroll listener toggling `.is-solid` via `navIsSolid`, plus an initial check on load.
**Where**: `assets/js/home.js`
**Depends on**: T16, T17
**Reuses**: `home-core.js`
**Requirement**: HOME-36, HOME-37

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] E2E: at scrollY 40 no `.is-solid`; at 41 `.is-solid`; back to 0 removes it
- [ ] E2E: loading `/` already scrolled (restored position) applies `.is-solid` on load
- [ ] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(home): solidify the navbar on scroll`

---

### T19: Spotify preview behavior

**What**: Implement `preview()` in `assets/js/home.js`: reveal the `PREVIEW` button, toggle one Spotify iframe in the slot, sync `aria-expanded`.
**Where**: `assets/js/home.js`
**Depends on**: T18
**Reuses**: `assets/js/discography.js` iframe creation
**Requirement**: HOME-15, HOME-16, HOME-17, HOME-19

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] E2E: no iframe after load; click -> one iframe with `src` `https://open.spotify.com/embed/album/14HkhB5FwTGesQECbSBSML`, `aria-expanded=true`; click again -> zero iframes, `aria-expanded=false`
- [ ] E2E: platform anchors stay visible while the preview is open
- [ ] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full
**Commit**: `feat(home): load the Spotify preview on demand`

---

### T20: Click and submit tracking

**What**: Implement `tracking()` in `assets/js/home.js`: delegated listeners pushing `home_release_click`, `home_teaser_click` and `home_newsletter_submit`, creating `window.dataLayer` when missing, never preventing navigation.
**Where**: `assets/js/home.js`
**Depends on**: T19
**Reuses**: `assets/js/discography.js` tracking listener
**Requirement**: HOME-47, HOME-49, HOME-50, HOME-51

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] E2E: hero Spotify click pushes `{event:'home_release_click', platform:'spotify', release:'keep-away-acoustic', placement:'hero'}`; a streaming-panel click pushes `placement:'streaming'`
- [ ] E2E: video, album and photos teasers push their exact event shapes
- [ ] E2E: valid newsletter submit pushes `{event:'home_newsletter_submit'}` (popup stubbed); invalid submit pushes nothing
- [ ] E2E: with `dataLayer` deleted before click, the array is created and navigation proceeds
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: build
**Commit**: `feat(home): track home clicks in the dataLayer`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 → T2
          T3
          T4
Phase 2:  T3 → T5 → T6 → T7 → T8
          T2 → T6
          T7 → T9
          T4 → T9
          T6 → T10
          T5 → T11
Phase 3:  T8 → T12 → T13 → T14
          T12 → T15
          T12 → T16
Phase 4:  T11 → T17 → T18 → T19 → T20
          T15 → T17
          T16 → T18
```

Execution is strictly sequential in task-number order.

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | 1 module of pure functions | ✅ Granular |
| T2 | 1 data file | ✅ Granular |
| T3 | 1 asset set | ✅ Granular |
| T4 | 1 include (pure relocation) | ✅ Granular |
| T5 | 1 layout | ⚠️ Cohesive (head meta + loader frame in one file) |
| T6-T10 | 1 section each in `index.html` | ✅ Granular |
| T11 | 1 include (+ legacy body emptied) | ✅ Granular |
| T12-T16 | 1 style concern each | ✅ Granular |
| T17-T20 | 1 behavior module each | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | - | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | None | - | ✅ Match |
| T4 | None | - | ✅ Match |
| T5 | T3 | Phase 1 (cross-phase) | ✅ Match |
| T6 | T2, T5 | T5 → T6 (+ T2 cross-phase) | ✅ Match |
| T7 | T6 | T6 → T7 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | T4, T7 | T7 → T9 (+ T4 cross-phase) | ✅ Match |
| T10 | T6 | T6 → T10 | ✅ Match |
| T11 | T5 | T5 → T11 | ✅ Match |
| T12 | T8 | Phase 2 (cross-phase) | ✅ Match |
| T13 | T12 | T12 → T13 | ✅ Match |
| T14 | T13 | T13 → T14 | ✅ Match |
| T15 | T12 | T12 → T15 | ✅ Match |
| T16 | T12 | T12 → T16 | ✅ Match |
| T17 | T11, T15 | Phase 2/3 (cross-phase) | ✅ Match |
| T18 | T16, T17 | T17 → T18 (+ T16 cross-phase) | ✅ Match |
| T19 | T18 | T18 → T19 | ✅ Match |
| T20 | T19 | T19 → T20 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Pure JS helpers | unit | unit | ✅ OK |
| T2 | Eleventy data file | unit | unit | ✅ OK |
| T3 | Static assets | none | none | ✅ OK |
| T4 | Templates | e2e | e2e | ✅ OK |
| T5-T11 | Templates | e2e | e2e | ✅ OK |
| T12-T16 | Styles | e2e | e2e | ✅ OK |
| T17-T20 | Behavior JS | e2e | e2e | ✅ OK |
