# Single Lyrics Specification

## Problem Statement

Every album track has a song page with its lyrics, but the two original songs that were released only as singles, Waiting for You (2025) and The Sun Will Rise (2024), have no lyrics anywhere on the site. Their `/discography/<slug>/` page is a release page with a cover, a description and platform links. A fan searching "Waiting for You lyrics" lands on nothing, and the catalog builder cannot hold a song that does not belong to an album.

## Goals

- [ ] `/discography/waiting-for-you/` and `/discography/the-sun-will-rise/` show the full lyrics in the same lyrics bento as the album songs.
- [ ] No URL changes: the hub cards, the sitemap and external links keep pointing at `/discography/<slug>/`.
- [ ] A future original single needs only a lyrics file and a `songs.json` entry.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Lyrics for version singles (Acoustic, Live, Eder Franco) | Grilling Q1: their release page already links to the original song's lyrics |
| Showing the Portuguese translation | Grilling Q4: `.pt.txt` files stay stored, never rendered, as for album songs |
| Previous/next navigation between singles | Grilling Q10 (a) |
| Spotify track-level links for the singles | The track IDs are not in the repo; the Spotify album link is kept |
| Visual redesign | The page reuses the existing lyrics bento |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Which songs | Waiting for You, The Sun Will Rise | Grilling Q1: the only original songs with no album | y |
| Page shape | The single's `/discography/<slug>/` page becomes a song page with the lyrics bento; no release page is generated for that single | Grilling Q3 (a) | y |
| Data model | `songs.json` entry carries `"single": "<single slug>"` instead of `"album"`; lyrics live in `_data/lyrics/singles/<slug>.txt` | Grilling Q12 | y |
| Catalog code | `<initials of the single title>-SINGLE`: `WFY-SINGLE`, `TSWR-SINGLE` | Grilling Q11 | y |
| Navigation | No previous/next links | Grilling Q10 (a) | y |
| About copy | New English `about` written from the user's notes ("resilience"; "everything will turn out okay despite adversity") | Grilling Q9 | y |
| Release copy | `songs.json` `releases` entries for both singles stay in the file; with no release page they are no longer rendered | Grilling Q9 kept them; no other consumer reads them | y |
| Portuguese translation | Claude writes `.pt.txt` for both songs; the user reviews it in the PR | Grilling Q8 | y |
| Lyrics edits | The Sun Will Rise sections per Grilling Q5; Waiting for You: `Verse 3` → `Verse 2`, the two 3-line stanzas end with a period, `Oh,` capitalized; `’` and `…` throughout | Grilling Q5/Q6/Q7 | y |
| Durations | Waiting for You 218 s (3:38), The Sun Will Rise 281 s (4:41) | iTunes lookup API, `trackTimeMillis` 217773 and 281215, rounded | y |
| Apple Music track links | `songs.json` `links.apple` = the `?i=` track URL from the iTunes lookup | Matches album songs (SONG-07) | y |
| Meta panel text | Eyebrow `Single // <year>`; line `Single · Released <year>`; no album link | No album exists to link to | y |
| Panel tab | `SINGLE::<year>`; lyrics telemetry `HUD.LOG::LYR_01` | A single has one track | y |
| JSON-LD | `MusicRecording` without `inAlbum` and without `position` | There is no album entity to reference | y |
| Breadcrumbs | `Discography` → song (2 items) | A third item would repeat the same URL | y |
| Input validation, idempotency, auth, concurrency, data lifecycle, state transitions, observability, external dependencies | N/A because the pages are static HTML built from frozen JSON; `release_click` tracking is reused as is | Static site | y |
| Build failure states | Covered by SLYR-03 and SLYR-04 | Bad data must fail the build, as it does for album songs | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Single lyrics page ⭐ MVP

**User Story**: As a fan, I want to read the lyrics of Waiting for You and The Sun Will Rise on the band's site so that I can sing along and understand the song.

**Why P1**: This is the feature.

**Acceptance Criteria**:

1. SLYR-01: WHEN a `songs.json` entry carries `"single": "<slug>"` THEN the catalog SHALL build a song whose `url` is `/discography/<slug>/`, and the site SHALL render that song's page at that URL.
2. SLYR-02: The song page of a single SHALL render the lyrics of `_data/lyrics/singles/<song slug>.txt` as sections in file order, with the section labels of the file: Waiting for You = `Verse 1, Pre-Chorus, Chorus, Verse 2, Pre-Chorus, Chorus`; The Sun Will Rise = `Verse 1, Pre-Chorus, Chorus, Verse 2, Pre-Chorus, Chorus 2, Bridge, Pre-Chorus, Outro, Chorus 3`.
3. SLYR-03: IF a non-instrumental single song has no lyrics file THEN the build SHALL throw `seo-discovery: <slug> has no lyrics file and is not instrumental`.
4. SLYR-04: IF a `songs.json` entry's `single` names no entry of `discography.singles` THEN the build SHALL throw `seo-discovery: <slug> references unknown single`.
5. SLYR-05: The catalog SHALL NOT build a release page for a single that has its own song, and `catalog.links[<single slug>].page` SHALL equal the song's URL.
6. SLYR-06: The song page of a single SHALL use the `lyrics` layout (`.song-bento--lyrics`).
7. SLYR-07: The meta panel of a single's song page SHALL show the tab `SINGLE::<year>`, the eyebrow `Single // <year>`, the runtime (`Runtime 3:38` for Waiting for You, `Runtime 4:41` for The Sun Will Rise) and the line `Single · Released <year>`, and SHALL contain no `[data-song-album]` link.
8. SLYR-08: The dossier foot of a single's song page SHALL read `CATALOG: <initials>-SINGLE // ALL EDITIONS LISTED` (`WFY-SINGLE`, `TSWR-SINGLE`).
9. SLYR-09: The song page of a single SHALL show the cover `/assets/images/releases/<single cover>` with `alt="<title> single cover"`.
10. SLYR-10: The song page of a single SHALL show an "About the song" section whose text equals the song's `about` in `songs.json`.
11. SLYR-11: The Audio Uplink of a single's song page SHALL list the single's platform links, with the song's own `links` overriding them (Apple Music = the `?i=` track URL, sub label `Play the track`), and every uplink and LISTEN NOW link SHALL carry `data-disc-slug="<single slug>"`.
12. SLYR-12: The song page of a single SHALL contain no `.song-nav` element.

**Independent Test**: Build, open `/discography/waiting-for-you/`, read the six lyric sections, the 3:38 runtime and `CATALOG: WFY-SINGLE`.

---

### P1: Search engines see a lyrics page ⭐ MVP

**User Story**: As a fan searching "<song> lyrics", I want the band's page to come up so that I find the official lyrics.

**Why P1**: The point of publishing lyrics on the site is to be found.

**Acceptance Criteria**:

1. SLYR-13: The `<title>` of a single's song page SHALL be `<title> Lyrics – Insane Driver`, and its meta description SHALL be the song's `about` through the `metaDescription` filter.
2. SLYR-14: IF a single song has no `about` THEN its meta description SHALL be `Lyrics of "<title>", Insane Driver's <year> single – hard rock, heavy metal and metalcore from São Paulo, Brazil.` through the `metaDescription` filter.
3. SLYR-15: The single's song page SHALL publish one `MusicRecording` JSON-LD with `url` = the absolute page URL, `duration` (`PT3M38S`, `PT4M41S`), `image` = the absolute single cover URL, `recordingOf.lyrics.text` = the trimmed lyrics file, and no `inAlbum` or `position` property.
4. SLYR-16: The single's song page SHALL publish a `BreadcrumbList` of exactly two items: `Discography` → `<title>` at the page URL.
5. SLYR-17: The sitemap SHALL list `https://insanedriver.com.br/discography/<slug>/` exactly once for each of the two singles.
6. SLYR-18: The hub single card of each of the two singles SHALL link to `/discography/<slug>/`.

**Independent Test**: Build, open `/discography/the-sun-will-rise/`, check the title, both JSON-LD blocks and the sitemap entry.

---

### P2: Lyrics files follow the catalog conventions

**User Story**: As the band, I want the single lyrics stored like the album lyrics so that the catalog stays consistent.

**Why P2**: The page works without it; consistency keeps future edits easy.

**Acceptance Criteria**:

1. SLYR-19: Each single song SHALL have `_data/lyrics/singles/<slug>.txt` and `_data/lyrics/singles/<slug>.pt.txt`, and the `.pt.txt` SHALL carry the same number of sections as the `.txt`.
2. SLYR-20: The single lyrics files SHALL contain no straight apostrophe (`'`) and no three-dot sequence (`...`).
3. SLYR-21: The rendered single song pages SHALL contain no text of the `.pt.txt` files.

---

## Edge Cases

- IF a single entry in `discography.singles` has no song in `songs.json` THEN the catalog SHALL keep building its release page as today (covered by the existing REL tests on the version singles).
- WHEN the 22 album songs are built THEN their URL, layout, navigation and catalog code SHALL be unchanged (covered by the existing `catalog.test.cjs`, `song.e2e.cjs` and `song-bento.e2e.cjs` suites).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| SLYR-01 | P1: Single lyrics page | Execute | Pending |
| SLYR-02 | P1: Single lyrics page | Execute | Pending |
| SLYR-03 | P1: Single lyrics page | Execute | Pending |
| SLYR-04 | P1: Single lyrics page | Execute | Pending |
| SLYR-05 | P1: Single lyrics page | Execute | Pending |
| SLYR-06 | P1: Single lyrics page | Execute | Pending |
| SLYR-07 | P1: Single lyrics page | Execute | Pending |
| SLYR-08 | P1: Single lyrics page | Execute | Pending |
| SLYR-09 | P1: Single lyrics page | Execute | Pending |
| SLYR-10 | P1: Single lyrics page | Execute | Pending |
| SLYR-11 | P1: Single lyrics page | Execute | Pending |
| SLYR-12 | P1: Single lyrics page | Execute | Pending |
| SLYR-13 | P1: Search engines see a lyrics page | Execute | Pending |
| SLYR-14 | P1: Search engines see a lyrics page | Execute | Pending |
| SLYR-15 | P1: Search engines see a lyrics page | Execute | Pending |
| SLYR-16 | P1: Search engines see a lyrics page | Execute | Pending |
| SLYR-17 | P1: Search engines see a lyrics page | Execute | Pending |
| SLYR-18 | P1: Search engines see a lyrics page | Execute | Pending |
| SLYR-19 | P2: Lyrics files follow the catalog conventions | Execute | Pending |
| SLYR-20 | P2: Lyrics files follow the catalog conventions | Execute | Pending |
| SLYR-21 | P2: Lyrics files follow the catalog conventions | Execute | Pending |

**Coverage:** 21 total, 0 mapped to tasks, 21 unmapped ⚠️

---

## Success Criteria

- [ ] Both single pages show their lyrics, and every existing unit and discography/SEO e2e test still passes.
- [ ] The built site has no duplicate permalink and no release page left at the two single URLs.
