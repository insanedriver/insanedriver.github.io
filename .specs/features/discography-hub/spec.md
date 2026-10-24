# Discography Hub Specification

## Problem Statement

Every album and single now has its own page (`/discography/<slug>/`) with a description, platform links, a tracklist that links to each song, and structured data. The index at `/discography/` still repeats most of that page for every album: platform buttons, BUY CD, a Spotify PREVIEW, a tracklist disclosure, and a full `MusicAlbum` JSON-LD block per album, plus singles hidden behind a "LOAD MORE" disclosure. The index is long, duplicates the release pages, and does little to send visitors to them. It should become a hub: a short catalog of cards whose only job is to open a release.

## Goals

- [ ] All 3 albums and all 18 singles are visible on `/discography/` as cards, and each card is one link to its page.
- [ ] Nothing a visitor can do today is lost: BUY CD and PREVIEW move to the album release pages, where platform links and tracklists already are.
- [ ] The hub publishes one `CollectionPage` that lists every release page, instead of duplicate `MusicAlbum` entities.
- [ ] No horizontal overflow at 375, 768, 992 and 1280px.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Visual redesign in Stitch | Grilling Q8: built in code with the existing `.cyber-zone`/`.cyber-panel` vocabulary |
| New tracking event for card clicks | Grilling Q13: the release pageview measures it; `release_click` stays on the release pages |
| Changes to song pages, release-page tracklist or release-page JSON-LD | Already shipped by `seo-discovery`; untouched here |
| Platform shortcuts on hub cards | Grilling Q2/Q3: the hub is a bridge only |
| Filters, search, sorting controls | Not requested; 21 cards fit one page |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Index panel | `DISC::INDEX` becomes a hero: "Discography." heading plus the counter `03 RELEASES // 18 SINGLES`, no anchor list | Grilling Q6 | y |
| Album cards | Grid, newest first; card = one `<a>` with cover, type/year, title, track count, description clamped to 3 lines, CTA | Grilling Q1/Q10/Q12 | y |
| CTA wording | `OPEN RELEASE →` rather than "ABRIR RELEASE →" | The whole site, including this page (BUY CD, PREVIEW, "All releases"), is in English | n |
| Album grid breakpoints | 3 columns at ≥ 992px, 1 column below | Grilling Q11 (a); 992px matches the song-bento breakpoint | y |
| Single cards | All 18 shown, no disclosure; card = one `<a>` with cover, title, year; no platform icons | Grilling Q3/Q5/Q12 | y |
| Single card destination | `catalog.links[slug].page`: the single's release page, or the song page for singles folded into a song | Keeps IDX-02 from `seo-discovery` | y |
| Removed from the hub | Platform links, BUY CD, PREVIEW, tracklist, per-album `MusicAlbum` JSON-LD | Grilling Q2 (a) / Q7 | y |
| Hub structured data | One `CollectionPage` whose `mainEntity` is an `ItemList` of every card, in DOM order, with absolute URLs | Grilling Q7 (a) | y |
| Release page additions | BUY CD where `buyCd` exists, PREVIEW where `spotifyId` exists, order: links → BUY CD → PREVIEW → tracklist | Grilling Q2 (a) / Q9 (a); today that is Silicon Fortress and Insane Driver for BUY CD, the three albums for PREVIEW | y |
| Hub meta description | Reworded so it no longer promises direct platform links on this page | The old copy describes removed content | n |
| Superseded ACs | DISC-* and IDX-* criteria that describe the old index are amended in `discography-cyberpunk/spec.md` and `seo-discovery/spec.md` to point at this spec (L-004) | Avoid silent contradiction between specs | y |
| Preview/tracking tests | Run on an album page with BUY CD (`/discography/silicon-fortress/`) and checked absent on a single page (L-037) | `release.liquid` renders both albums and singles | y |
| Input validation, failure states, idempotency, auth, concurrency, data lifecycle, state transitions | N/A because the hub is static HTML built from frozen JSON and takes no input | Static site | y |
| External-dependency failure | Covered by HUB-15 (preview failure leaves links usable), carried over from DISC-44 | Spotify embed is the only third party | y |
| Observability | Covered by HUB-16 (`release_click` on the release page) | Existing GTM channel | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Album cards open their release ⭐ MVP

**User Story**: As a visitor on `/discography/`, I want to see every album at a glance and open one with a single click so that I reach its full page.

**Why P1**: This is the purpose of the hub.

**Acceptance Criteria**:

1. HUB-01: The hub SHALL render one album card per entry in `discography.albums`, in that order (Silicon Fortress, Insane Driver Deluxe, Insane Driver).
2. HUB-02: Each album card SHALL be exactly one `<a>` whose `href` equals `catalog.links[slug].page` (`/discography/<slug>/`) and SHALL contain no other link or button.
3. HUB-03: Each album card SHALL show the cover (`alt="<title> cover"`), the type label (`ALBUM` or `DELUXE EDITION`) with the year, the title, `<n> tracks`, the release description and the text `OPEN RELEASE`.
4. HUB-04: The album card description SHALL contain the full release description text and SHALL be clamped to 3 lines (`-webkit-line-clamp: 3`).
5. HUB-05: WHILE the viewport is at least 992px wide the album grid SHALL place all three cards in one row; WHILE it is narrower the cards SHALL stack in one column.

**Independent Test**: Open `/discography/`, check three cards in a row at 1280px, click the Silicon Fortress card and land on `/discography/silicon-fortress/`.

---

### P1: Single cards open their page ⭐ MVP

**User Story**: As a visitor, I want every single visible without expanding anything so that I can scan the whole catalog.

**Why P1**: The hub would hide two thirds of the catalog otherwise.

**Acceptance Criteria**:

1. HUB-06: The hub SHALL render one single card per entry in `discography.singles`, in that order, and SHALL contain no `<details>` element.
2. HUB-07: Each single card SHALL be exactly one `<a>` whose `href` equals `catalog.links[slug].page` and SHALL show the cover, the title and the year.
3. HUB-08: The hub SHALL contain no element carrying `data-disc-link`.
4. HUB-09: WHILE the viewport is 375px wide the singles grid SHALL show at least two cards per row.

**Independent Test**: Open `/discography/`, count 18 single cards with no disclosure, click one and land on its page.

---

### P1: Hero replaces the index panel ⭐ MVP

**User Story**: As a visitor, I want a clear heading with the size of the catalog instead of a list of anchors to cards right below it.

**Acceptance Criteria**:

1. HUB-10: The hub's first panel SHALL show the heading `Discography.` and the counter `03 RELEASES // 18 SINGLES`, computed from `discography.albums.size` (zero-padded below 10) and `discography.singles.size`.
2. HUB-11: The hub's `.disc-shell` SHALL contain no link whose `href` starts with `#` (the site-wide scroll-to-top link in the base layout is outside it).

**Independent Test**: Open `/discography/` and read the counter; no in-page anchors.

---

### P1: Release pages carry BUY CD and PREVIEW ⭐ MVP

**User Story**: As a visitor on an album page, I want to buy the CD and preview the album there, since those actions are leaving the hub.

**Why P1**: Without this, the hub change removes functionality.

**Acceptance Criteria**:

1. HUB-12: WHERE a release has `buyCd` the release page SHALL render one `a.disc-buy` with `href` equal to `buyCd`, after the platform links and before the tracklist.
2. HUB-13: WHERE a release has `spotifyId` the release page SHALL render one PREVIEW button carrying `data-disc-preview-btn="<slug>"` and `data-disc-spotify-id="<spotifyId>"`, after BUY CD (when present) and before the tracklist.
3. HUB-14: IF a release has no `buyCd` THEN its page SHALL render no `.disc-buy`, and IF it has no `spotifyId` THEN its page SHALL render no `[data-disc-preview-btn]` (Insane Driver Deluxe has no BUY CD; no single has either).
4. HUB-15: WHEN a visitor clicks PREVIEW on a release page THEN the page SHALL inject exactly one `iframe` whose `src` contains `open.spotify.com/embed/album/<spotifyId>` and set `aria-expanded="true"`, and WHEN they click it again THEN the page SHALL remove the iframe and set `aria-expanded="false"`; no request to `open.spotify.com` SHALL leave before the first click.
5. HUB-16: WHEN a visitor clicks a platform anchor on a release page THEN the page SHALL push `{ event: 'release_click', platform: <key>, release: <slug> }` to `dataLayer` without cancelling the navigation.

**Independent Test**: Open `/discography/silicon-fortress/`, see BUY CD and PREVIEW, open and close the preview; open `/discography/insane-driver-deluxe/` and see PREVIEW without BUY CD.

---

### P1: Hub structured data and SEO ⭐ MVP

**Acceptance Criteria**:

1. HUB-17: The hub SHALL contain no JSON-LD block of `@type` `MusicAlbum`.
2. HUB-18: The hub SHALL contain one JSON-LD block of `@type` `CollectionPage` whose `mainEntity` is an `ItemList` with 21 `ListItem`s, `position` 1 to 21 in card DOM order, each `url` equal to `https://insanedriver.com.br` + that card's `href` and each `name` equal to the release title.
3. HUB-19: Every hub cover SHALL be served from `/assets/images/releases/`, declare `width` and `height`, and every cover except the first album's SHALL carry `loading="lazy"`.
4. HUB-20: The hub `<meta name="description">` SHALL NOT mention streaming platform names.

---

### P2: Layout and accessibility

**Acceptance Criteria**:

1. HUB-21: WHEN the hub is loaded at 375, 768, 992 or 1280px THEN `document.documentElement.scrollWidth` SHALL NOT exceed the viewport width.
2. HUB-22: WHEN a card receives keyboard focus THEN it SHALL show a visible outline (computed `outline-style` not `none`).
3. HUB-23: WHILE JavaScript is disabled every hub card SHALL still navigate to its page.
4. HUB-24: The hub SHALL keep the shared cyber vocabulary: a transparent `.cyber-zone` shell and `.cyber-panel` panels, as DISC-08 requires today.

---

## Edge Cases

- IF a release description is longer than 3 lines at the card width THEN the card SHALL clip it with an ellipsis without growing past its siblings' row (HUB-04).
- WHEN the catalog has fewer than 10 albums THEN the counter SHALL zero-pad the album count (HUB-10).
- IF the Spotify embed fails to load THEN the release page's platform links and BUY CD SHALL remain clickable (HUB-15, carried over from DISC-44).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| HUB-01 | P1: Album cards | T2 | Implementing |
| HUB-02 | P1: Album cards | T2 | Implementing |
| HUB-03 | P1: Album cards | T2 | Implementing |
| HUB-04 | P1: Album cards | Tasks | Pending |
| HUB-05 | P1: Album cards | Tasks | Pending |
| HUB-06 | P1: Single cards | Tasks | Pending |
| HUB-07 | P1: Single cards | Tasks | Pending |
| HUB-08 | P1: Single cards | Tasks | Pending |
| HUB-09 | P1: Single cards | Tasks | Pending |
| HUB-10 | P1: Hero | T2 | Implementing |
| HUB-11 | P1: Hero | T2 | Implementing |
| HUB-12 | P1: Release page | T1 | Implementing |
| HUB-13 | P1: Release page | T1 | Implementing |
| HUB-14 | P1: Release page | T1 | Implementing |
| HUB-15 | P1: Release page | T1 | Implementing |
| HUB-16 | P1: Release page | T1 | Implementing |
| HUB-17 | P1: Structured data | T2 | Implementing |
| HUB-18 | P1: Structured data | Tasks | Pending |
| HUB-19 | P1: Structured data | Tasks | Pending |
| HUB-20 | P1: Structured data | Tasks | Pending |
| HUB-21 | P2: Layout | Tasks | Pending |
| HUB-22 | P2: Layout | Tasks | Pending |
| HUB-23 | P2: Layout | T2 | Implementing |
| HUB-24 | P2: Layout | Tasks | Pending |

**Coverage:** 24 total, 0 mapped to tasks, 24 unmapped ⚠️

---

## Success Criteria

- [ ] `/discography/` shows 21 cards and every one reaches its page in one click.
- [ ] BUY CD and PREVIEW work on the album pages; the full unit and e2e suites are green.
- [ ] The hub page is shorter than today at 1280px (no tracklists or link grids).
