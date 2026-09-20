# Discography Cyberpunk Specification

## Problem Statement

`/discography` is the only commercial page of the site still wearing the pre-2026 Bootstrap skin: two hardcoded blocks, each a cover image beside a full-height Spotify iframe. It offers exactly one place to listen - Spotify - while the band's catalog is live on eight platforms, and it hides a third of that catalog: the Insane Driver Deluxe Edition (2018) and eighteen singles, three of them released in 2024-2025, appear nowhere on the site. A visitor who does not use Spotify leaves with no route to the music, and a visitor who does gets a white embed that clashes with the cyberpunk identity every other refreshed page now carries.

## Goals

- [ ] Every release reachable in one click on eight platforms, with Spotify and Apple Music given primary weight.
- [ ] The full catalog visible: 3 albums plus 18 singles, including the 2024-2025 releases the site never announced.
- [ ] The page reads as part of the same system as band, photos and videos - same `.cyber-zone` / `.cyber-panel` vocabulary.
- [ ] Platform-click volume measurable per release and per platform in GTM.
- [ ] No regression for visitors without JavaScript: every listening link still works.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Home page player block (`index.html`) | Same pre-cyberpunk styling, but highest-traffic page; deserves its own grilling round rather than riding along. |
| Renaming or reworking `/preorder` and `/store` | A page called `/preorder` selling a 2021 record is confusing, but fixing it is a separate change; this feature only links to them with honest labels. |
| Per-single platform grids | Singles link to Spotify and Apple Music only; eighteen 8-button grids would drown the albums. |
| Third-party smart links (ffm.to, Linkfire) | Adds a redirect hop and an external tracker between the visitor and the music. |
| Removing `less/player.less` | The home page still depends on `.player-art` and `#player-sf`. |
| Replacing Universal Analytics (`analytics.js`, UA-60390716-1) | Dead property since 2023, but site-wide cleanup, not this feature. |
| Automated catalog sync from platform APIs | Data is frozen into `_data/discography.json` at build time; live API calls would add a runtime dependency to a static site. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Catalog scope | 3 albums as full cards + 18 singles in a dedicated panel | The deluxe edition and the 2024-2025 singles were invisible on the site; the singles panel is cheap because it reuses the same data shape. | y |
| Link granularity | Deep link to the release on each platform | Landing on the record, not on an artist profile, is what "leva a pessoa fácil" means. | y |
| Platform not carrying a release | Omit the button (JSON value `null`) | A button that promises the album and delivers a profile is friction. | y |
| Platform set | Spotify, Apple Music, YouTube Music, Deezer, Tidal, Amazon Music, Pandora, Bandcamp (8) | Plain YouTube duplicates YT Music at album level and already lives on band/videos. | y |
| Link verification | Each URL is fetched once during implementation and recorded with its HTTP status; only 2xx/3xx links ship | Dead deep links are worse than an omitted button. | y |
| Spotify embed | Kept but lazy, below the link grid, albums only, one open at a time | The white iframe fights the theme and costs bandwidth; links are the primary CTA. | y |
| Cover art | 1000px source downloaded into `assets/images/releases/`, served at ~600px | Repo art is ~325px; the shopfront should not depend on a third-party CDN. | y |
| Tracklist detail | Number, title, duration; collapsed by default | Durations feed `MusicRecording.duration`; collapsing keeps the CTA high on the card. | y |
| Duration source | Deezer public API at authoring time, frozen into the JSON | No runtime dependency; durations do not change. | y |
| Click tracking | `dataLayer.push({event:'release_click', ...})`; GTM tag configuration is out of band | GTM is already loaded site-wide; the tag itself is the user's to configure. | y |
| Physical CTA mapping | Silicon Fortress -> `/preorder`, Insane Driver 2016 -> `/store`, deluxe none | Those pages sell those CDs today; the deluxe has no physical edition. | y |
| Button label for `/preorder` | "Buy CD" | The record shipped in 2021; "Pre-order" would be a false promise. | y |
| Shared platform-button CSS | Extracted from `less/band.less` into `less/cyber-links.less`, consumed by band and discography | Stops the duplication at the one place it is about to be duplicated. | y |
| Band page visual after refactor | Pixel-identical; the extraction is pure relocation | The band page is stable and is not the subject of this change. | y |
| Page language | English | Whole site is in English. | y |
| Release ordering | Newest first (2021, 2018, 2016); singles newest first | Matches the existing page order and listener expectation. | y |
| Data lifecycle | JSON is maintained by hand; a new release is a data edit plus a cover file | No CMS or scheduled job on this static site. | y |
| Auth, rate limits, concurrency, idempotency of writes | N/A - static page, no user input, no server state, no writes | Nothing to authorize, throttle or serialize. | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Listen on your own platform ⭐ MVP

**User Story**: As a listener who does not use Spotify, I want each release to offer my own streaming service so that I can play the record without hunting for it.

**Why P1**: This is the page's entire commercial job, and today it fails for every non-Spotify visitor.

**Acceptance Criteria**:

1. The system SHALL render every release listed in `_data/discography.json` as a card on `/discography`.
2. The system SHALL render, for each release, one anchor per platform whose URL is present in that release's data, drawn from Spotify, Apple Music, YouTube Music, Deezer, Tidal, Amazon Music, Pandora and Bandcamp.
3. IF a release has no URL for a platform THEN the system SHALL render no button for that platform on that release.
4. The system SHALL render the Spotify and Apple Music buttons before the other platform buttons in DOM order, with the `cyber-link-btn--primary` modifier.
5. The system SHALL give every platform anchor `target="_blank"` and `rel="noopener"`.
6. The system SHALL point every platform anchor at the release itself, never at an artist profile or search page.
7. WHEN the page is served with JavaScript disabled THEN every platform anchor SHALL remain present and clickable.

**Independent Test**: Load `/discography` with JS off; each of the three album cards shows its available platform buttons, Spotify and Apple Music first, and every href resolves to that album's page on that platform.

---

### P1: One system, one look ⭐ MVP

**User Story**: As a visitor arriving from the videos or band page, I want the discography to look like the same site so that the band reads as one coherent thing.

**Why P1**: Visual inconsistency on the commercial page undercuts the whole refresh; and the shared-CSS extraction it requires must land before any second page copies the buttons.

**Acceptance Criteria**:

1. The system SHALL wrap the page content in a `.cyber-zone` > `.cyber-zone-inner` shell containing `.cyber-panel` blocks with `.cyber-panel-tab`, `.cyber-panel-body`, a `data-hud` attribute and the corner/accent spans used by the videos and photos pages.
2. The system SHALL render a `DISC::INDEX` panel above the releases showing the release count, the single count and an anchor link per album.
3. WHEN an index anchor is activated THEN the browser SHALL navigate to the matching release card, whose `id` is that release's slug.
4. The system SHALL define `.cyber-link-btn`, its name/sub children and the per-platform hover colors in a shared LESS file imported by both `#page_band` and `#page_discography`.
5. The system SHALL leave the rendered band page visually unchanged by that extraction.
6. The system SHALL contain no `.player`, `.iframe-spotify` or `.player-art` markup on `/discography`, and SHALL leave `less/player.less` in place for the home page.
7. WHILE the viewport is narrower than 768px the system SHALL stack each release card with the cover above the platform buttons.

**Independent Test**: Side-by-side screenshots of `/videos` and `/discography` share the panel vocabulary; a screenshot of `/band` before and after the CSS extraction is identical.

---

### P2: See the whole catalog

**User Story**: As a fan, I want to see the singles - including the recent ones - so that I know the band is still releasing music.

**Why P2**: High value and the page's biggest content gap, but the albums are the MVP surface.

**Acceptance Criteria**:

1. The system SHALL render a `DISC::SINGLES` panel listing every single in `_data/discography.json`, newest first.
2. The system SHALL show the 6 most recent singles outside any collapsed container.
3. The system SHALL place the remaining singles inside a `<details>` element that is closed on initial render.
4. WHEN the visitor activates that `<details>` summary THEN the browser SHALL reveal the remaining singles without requiring JavaScript.
5. The system SHALL render, for each single, its cover, title, release year and an anchor to Spotify plus an anchor to Apple Music where those URLs exist.
6. The system SHALL render no Spotify preview embed for a single.

**Independent Test**: With JS disabled, `/discography` shows 6 single cards plus a closed disclosure; opening it reveals the remaining 12, each linking out.

---

### P2: Preview before leaving

**User Story**: As an undecided visitor, I want to hear an album on the page so that I can decide before committing to a platform.

**Why P2**: Preserves what the old page did well without letting the embed dominate the design.

**Acceptance Criteria**:

1. The system SHALL render, for each album, a `PREVIEW` button and an empty preview container placed after the platform link grid.
2. The system SHALL NOT create the Spotify iframe during initial page load.
3. WHEN the visitor activates an album's `PREVIEW` button THEN the system SHALL insert a Spotify embed iframe for that album's Spotify id into that album's preview container.
4. WHILE one album's preview is open, WHEN the visitor opens another album's preview THEN the system SHALL remove the first iframe from the DOM before inserting the second.
5. WHEN the visitor activates the `PREVIEW` button of the album whose preview is already open THEN the system SHALL remove that iframe and return the button to its closed state.
6. The system SHALL keep the cover and the platform buttons visible while a preview is open.
7. The system SHALL reflect preview state in `aria-expanded` on the `PREVIEW` button and SHALL keep the button hidden when JavaScript has not run.
8. IF an album has no Spotify id THEN the system SHALL render no `PREVIEW` button for that album.

**Independent Test**: Open preview on Silicon Fortress, then on Insane Driver 2016; the DOM holds exactly one Spotify iframe at any moment, and re-clicking closes it.

---

### P2: Tracklist and structured data

**User Story**: As a visitor deciding whether a record is for me - and as a search engine indexing it - I want the track listing so that the page says what is actually on each album.

**Why P2**: Content and SEO value, but not required for the listen-anywhere MVP.

**Acceptance Criteria**:

1. The system SHALL render each album's tracklist inside a `<details>` element that is closed on initial render.
2. The system SHALL render, for each track, its position, title and duration formatted as `m:ss`.
3. The system SHALL emit one `application/ld+json` script per album containing a schema.org `MusicAlbum` with `name`, `datePublished`, `byArtist`, `numTracks`, an `image` and a `track` list of `MusicRecording` entries carrying `name`, `position` and ISO 8601 `duration`.
4. The system SHALL list every platform URL of that album in the `MusicAlbum`'s `sameAs` array.
5. The system SHALL serve every release cover from `assets/images/releases/` - no cover is loaded from a third-party domain.
6. The system SHALL give every cover `<img>` explicit `width` and `height` attributes and `loading="lazy"` on all but the first.

**Independent Test**: Google's Rich Results test accepts each album's JSON-LD; the tracklist disclosure shows 11 / 15 / 11 tracks with durations.

---

### P2: Buy the physical record

**User Story**: As a fan who wants the CD, I want the buy route on the release itself so that I do not have to discover `/store` or `/preorder` by accident.

**Why P2**: Real revenue path, small surface.

**Acceptance Criteria**:

1. The system SHALL render a `BUY CD` anchor on the Silicon Fortress card pointing to `/preorder/`.
2. The system SHALL render a `BUY CD` anchor on the Insane Driver 2016 card pointing to `/store/`.
3. The system SHALL render no physical-purchase anchor on the Insane Driver Deluxe Edition card.
4. The system SHALL render the `BUY CD` anchor visually distinct from the streaming buttons.

**Independent Test**: Each card's buy link resolves to the page that actually sells that CD; the deluxe card has none.

---

### P3: Know what converts

**User Story**: As the band, I want to see which platform visitors choose so that I know whether this work paid off.

**Why P3**: Measurement, not function; the page works without it.

**Acceptance Criteria**:

1. WHEN a visitor activates a platform anchor THEN the system SHALL push an object to `window.dataLayer` with `event: 'release_click'`, the platform key and the release slug.
2. The system SHALL push the event without preventing or delaying the anchor's navigation.
3. IF `window.dataLayer` is undefined THEN the system SHALL create it as an empty array before pushing.
4. IF JavaScript has not run THEN the anchor SHALL still navigate normally.

**Independent Test**: With a `dataLayer` spy in the console, clicking Apple Music on Silicon Fortress records `{event:'release_click', platform:'apple', release:'silicon-fortress'}` and the tab still opens.

---

## Edge Cases

- IF `_data/discography.json` contains a release without a slug, title, year, cover or `type` THEN the build-time data test SHALL fail.
- IF two releases share a slug THEN the build-time data test SHALL fail, because slugs are anchor ids.
- IF a release's cover file named in the JSON is absent from `assets/images/releases/` THEN the data test SHALL fail.
- IF a platform key in a release's `links` object is not one of the eight supported keys THEN the data test SHALL fail.
- IF a track's duration is missing or not a positive integer number of seconds THEN the data test SHALL fail.
- IF the Spotify embed fails to load or is blocked THEN the platform buttons and cover SHALL remain visible and functional, and the page SHALL show no broken-player state.
- WHEN a release has fewer than three platform links THEN the link grid SHALL render without empty placeholder cells.
- WHEN there are 6 or fewer singles in the data THEN the `<details>` overflow container SHALL NOT be rendered.
- IF a platform URL returns a non-2xx/3xx status during the authoring-time link check THEN that URL SHALL be recorded as `null` rather than shipped.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| DISC-01 | P1: Listen on your own platform | Execute | Implementing |
| DISC-02 | P1: Listen on your own platform | Execute | Implementing |
| DISC-03 | P1: Listen on your own platform | Design | Pending |
| DISC-04 | P1: Listen on your own platform | Execute | Implementing |
| DISC-05 | P1: Listen on your own platform | Design | Pending |
| DISC-06 | P1: Listen on your own platform | Design | Pending |
| DISC-07 | P1: Listen on your own platform | Design | Pending |
| DISC-08 | P1: One system, one look | Design | Pending |
| DISC-09 | P1: One system, one look | Design | Pending |
| DISC-10 | P1: One system, one look | Design | Pending |
| DISC-11 | P1: One system, one look | Design | Pending |
| DISC-12 | P1: One system, one look | Design | Pending |
| DISC-13 | P1: One system, one look | Design | Pending |
| DISC-14 | P1: One system, one look | Design | Pending |
| DISC-15 | P2: See the whole catalog | Design | Pending |
| DISC-16 | P2: See the whole catalog | Design | Pending |
| DISC-17 | P2: See the whole catalog | Design | Pending |
| DISC-18 | P2: See the whole catalog | Design | Pending |
| DISC-19 | P2: See the whole catalog | Design | Pending |
| DISC-20 | P2: See the whole catalog | Design | Pending |
| DISC-21 | P2: Preview before leaving | Design | Pending |
| DISC-22 | P2: Preview before leaving | Design | Pending |
| DISC-23 | P2: Preview before leaving | Design | Pending |
| DISC-24 | P2: Preview before leaving | Design | Pending |
| DISC-25 | P2: Preview before leaving | Design | Pending |
| DISC-26 | P2: Preview before leaving | Design | Pending |
| DISC-27 | P2: Preview before leaving | Design | Pending |
| DISC-28 | P2: Preview before leaving | Design | Pending |
| DISC-29 | P2: Tracklist and structured data | Design | Pending |
| DISC-30 | P2: Tracklist and structured data | Execute | Implementing |
| DISC-31 | P2: Tracklist and structured data | Design | Pending |
| DISC-32 | P2: Tracklist and structured data | Design | Pending |
| DISC-33 | P2: Tracklist and structured data | Execute | Implementing |
| DISC-34 | P2: Tracklist and structured data | Design | Pending |
| DISC-35 | P2: Buy the physical record | Design | Pending |
| DISC-36 | P2: Buy the physical record | Design | Pending |
| DISC-37 | P2: Buy the physical record | Design | Pending |
| DISC-38 | P2: Buy the physical record | Design | Pending |
| DISC-39 | P3: Know what converts | Design | Pending |
| DISC-40 | P3: Know what converts | Design | Pending |
| DISC-41 | P3: Know what converts | Design | Pending |
| DISC-42 | P3: Know what converts | Design | Pending |
| DISC-43 | Edge: data integrity (slug/title/year/cover/type, unique slug, cover exists, known platform keys, valid duration) | Execute | Implementing |
| DISC-44 | Edge: embed failure leaves links usable | Design | Pending |
| DISC-45 | Edge: sparse link grid and <=6 singles render without empty containers | Design | Pending |
| DISC-46 | Edge: authoring-time link check nulls non-2xx/3xx URLs | Execute | Implementing |

**ID mapping:** DISC-01..07 = P1 "Listen on your own platform" ACs 1-7; DISC-08..14 = P1 "One system, one look" ACs 1-7; DISC-15..20 = P2 "See the whole catalog" ACs 1-6; DISC-21..28 = P2 "Preview before leaving" ACs 1-8; DISC-29..34 = P2 "Tracklist and structured data" ACs 1-6; DISC-35..38 = P2 "Buy the physical record" ACs 1-4; DISC-39..42 = P3 "Know what converts" ACs 1-4; DISC-43..46 = Edge Cases.

**Coverage:** 46 total, 0 mapped to tasks, 46 unmapped (Tasks phase pending).

---

## Success Criteria

- [ ] A visitor can reach any of the 3 albums on any platform that carries it in one click from `/discography`.
- [ ] All 18 singles and 3 albums are present on the page, with the 2024-2025 releases among the 6 visible singles.
- [ ] Zero platform anchors point at a dead URL (every shipped link returned 2xx/3xx at authoring time).
- [ ] Initial page load creates no Spotify iframe; network trace shows no `open.spotify.com` request until `PREVIEW` is clicked.
- [ ] With JavaScript disabled, every platform anchor and every single is reachable.
- [ ] `/band` renders identically before and after the CSS extraction.
- [ ] Each album's JSON-LD validates as a `MusicAlbum` with its full tracklist.
- [ ] `release_click` events appear in GTM preview for every platform button.
