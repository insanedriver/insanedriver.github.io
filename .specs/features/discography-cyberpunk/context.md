# Discography Cyberpunk - User Decisions

Captured from a grilling session on 2026-09-20. Five rounds, every branch confirmed by the user.

## Catalog scope

| Decision | Choice | Rationale |
| --- | --- | --- |
| Which releases | 3 albums: Silicon Fortress (2021), Insane Driver Deluxe Edition (2018), Insane Driver (2016) | The deluxe edition and its `player_ID_Deluxe.jpg` asset were already in the repo but invisible on the site. |
| Singles | Own panel, 6 most recent visible, the rest behind a collapsed `<details>` | The site never mentioned *The Sun Will Rise* (2024-11-15), *Waiting for You* (2025-02-21) or *Keep Away (Acoustic)* (2025-05-09). 18 single cards at once would bury the albums. |
| Data source | `_data/discography.json`, rendered with Liquid | Same pattern as `_data/videos.json`; adding a single becomes a data edit, not an HTML copy-paste. |

## Platform links

| Decision | Choice | Rationale |
| --- | --- | --- |
| Granularity | Deep link per release, not per artist | "Leva a pessoa fácil pro Spotify/Apple Music" means landing on the record, not on a profile. |
| Platform set | 8: Spotify, Apple Music, YouTube Music, Deezer, Tidal, Amazon Music, Pandora, Bandcamp | The band page lists 9; plain YouTube is dropped because for an album it duplicates YT Music, and the channel already lives on band/videos. |
| Hierarchy | Spotify + Apple Music rendered large at the top, remaining six in a compact grid | Concentrates the two highest-traffic destinations. |
| Missing release on a platform | Button omitted entirely | A button promising the album and delivering an artist profile is friction exactly where fluidity matters. `null` in the JSON, template skips. |
| Smart link (ffm.to / Linkfire) | Rejected | Adds a hop and a third-party tracker; the band's old `ffm.to/silicon-fortress-single` stays unused here. |
| Physical CTA | Silicon Fortress -> `/preorder`, Insane Driver 2016 -> `/store`, deluxe none | `/preorder` sells the SF CD (US$25 / US$35 combo), `/store` sells the 2016 debut CD (US$22). Label reads "Buy CD", not "Pre-order", because the record shipped in 2021. |
| Click tracking | `dataLayer.push` per platform click | GTM (`GTM-WW9HZGP`) is already on every page; without an event there is no way to tell whether Apple Music earned its slot. Tag configuration stays in GTM. |

## Visual

| Decision | Choice | Rationale |
| --- | --- | --- |
| Theme | `.cyber-zone` / `.cyber-panel` shell with `cyber-panel-tab`, `data-hud`, corner accents | Matches band, photos, videos and newsletter. |
| Page top | `DISC::INDEX` panel with release/single counters and anchor shortcuts (`#silicon-fortress`) | Carries the HUD language and makes a single release shareable. |
| Release card | Two columns on desktop (cover left, meta + links right), stacked on mobile with cover above links | Keeps the CTA above the fold on phones. |
| Shared CSS | `.cyber-link-btn` and per-platform hover colors extracted from `less/band.less` into a shared LESS file consumed by band and discography | Stops the duplication before it starts; band is refactored to consume it. |
| Legacy CSS | Drop `#page_discography .player`; keep `less/player.less` untouched | `index.html:46` (home) still uses `.player-art` and the `#player-sf` background. |
| Cover art | Download 1000px covers into the repo for every release | Repo art is only ~325px, too small for retina cards; the page is the band's commercial shopfront and should not depend on someone else's CDN. |

## Behavior

| Decision | Choice | Rationale |
| --- | --- | --- |
| Spotify embed | Kept, but lazy: hidden until the visitor clicks `PREVIEW`, rendered below the link grid, albums only | The white iframe fights the theme and costs bandwidth; the link grid is the primary CTA. |
| Multiple previews | Opening one closes the other | Avoids three live Spotify iframes at once. |
| Without JavaScript | Platform links are plain anchors and keep working; singles use native `<details>` so "load more" survives; preview stays hidden | Progressive enhancement, same posture as the photos page fallback. |
| Tracklist | Collapsed `<details>` with track number, title and duration | Keeps the platform buttons high on the card; feeds `MusicRecording.duration` in JSON-LD. |
| Structured data | `MusicAlbum` JSON-LD per album | Nearly free once the data is structured. |

## Process

| Decision | Choice |
| --- | --- |
| Branch | `feature/discography-cyberpunk`, atomic Conventional Commits, PR opened at the end, no self-merge, no push without an explicit go-ahead |
| Tests | Unit + Playwright e2e following `tests/videos` |
| Home page | Out of scope - it carries the same pre-cyberpunk player block and deserves its own grilling round |
