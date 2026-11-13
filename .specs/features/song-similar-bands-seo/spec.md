# Song Similar Bands & SEO Enrichment Specification

## Problem Statement

Currently, every song and release page on Insane Driver's website renders the exact same hardcoded line (`For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold`) and uses generic `MusicRecording` / `MusicAlbum` genres (`["Hard Rock", "Heavy Metal", "Metalcore"]`). This misses high-intent search queries from fans of specific bands (e.g., *"bands like Dream Theater"*, *"songs similar to Pull Me Under"*) and leaves the sonic classification data from `/home/deivid/Projects/InsaneDriver/classifier-agent/data/seo_catalog_local.md` unused.

## Goals

- [ ] Replace the generic `For fans of...` line on all 24 song pages and 2 album pages with track-specific and album-aggregated `✅`-verified similar bands.
- [ ] Surface each track's sonic classification (primary/secondary styles), `✅`-verified similar bands, reference tracks, and editorial sonic justification in English on song pages across all 3 song layouts (`video`, `lyrics`, `stack`).
- [ ] Enrich `<meta name="description">` and Schema.org `MusicRecording` / `MusicAlbum` JSON-LD (`genre`, `keywords`, `description`) using only `✅`-verified bands for full consistency between visible text and structured data.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Modifying `For fans of...` on Home (`/`) or Band (`/band/`) pages | Kept as band-level summary per user decision (Q1). |
| Including `⚠️` (below-threshold) bands in visible UI, meta tags, or JSON-LD | User requested strict `✅`-only filtering until the classifier agent is improved (Q3, Q7). |
| Displaying raw ML metrics (MERT Layer 5/23 scores, CLAP weights, acousticness) | Excluded to keep copy editorial and natural for listeners and search engines (Q9). |
| Runtime/CI dependency on the external `classifier-agent` repository | `seo_catalog_local.md` does not exist on the remote repo; parsed data will live in `_data/` (Q5). |
| Live external API calls or dynamic client-side band fetching | Site is static Eleventy; all data is resolved at build time. |

---

## Assumptions & Open Questions

Every ambiguity is resolved or recorded here - nothing is left silently unclear.

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Page scope (Q1) | All 24 song pages + 2 studio album pages (`insane-driver`, `silicon-fortress`); home and `/band/` unchanged. | Song pages get track-level precision; album pages aggregate top recurring `✅` bands from their tracks. | y |
| Visible content depth (Q2, Q9) | Show `For fans of <✅ bands>` in top `Recommended intel` + a new `Sonic DNA & Similar Artists` section in `song-dossier` with styles, `✅` bands, reference tracks, and clean editorial justification (first sentence, no MERT scores). | Gives search engines and visitors rich semantic context without ML jargon, and works across all 3 song layouts (`video`, `lyrics`, `stack`). | y |
| Threshold filtering (Q3, Q7) | Strictly include only `✅` bands everywhere (headline, dossier, meta description, JSON-LD `keywords`). | Prevents weak associations (`⚠️`) and keeps visible HTML 100% consistent with JSON-LD. (21 tracks have 2 `✅` bands; 3 tracks have 1 `✅` band.) | y |
| Technical SEO (Q4) | Combine `song.about` (when present) with `For fans of <✅ bands>` in `page_description` (bounded by existing `metaDescription` filter), and enrich `MusicRecording` JSON-LD with track `genre`, `keywords`, and `description`. | Preserves existing lyrical summary while adding band-discovery signals. | y |
| Data source integration (Q5) | Store parsed data in `_data/seo-catalog.json` inside this repository, accompanied by a local import script in `scripts/` that can re-sync from `seo_catalog_local.md` when run locally. | Build works on GitHub Actions / remote without external repo access, while remaining reproducible locally. | y |
| Album aggregation (Q8) | Rank `✅` bands across an album's tracks by frequency (tie-breaker: highest MERT overall score) and take top 4 for `For fans of...`; aggregate unique primary/secondary genres for `MusicAlbum` JSON-LD `genre`. | Keeps album `For fans of...` concise and representative of the record. | y |
| Non-album / variant releases (e.g. `insane-driver-deluxe`, `change-live`, `fallen-dreams-acoustic`, `today-is-sunday-eder-franco`) | Fall back to the existing `For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold` when a release has no direct track aggregation, or aggregate from matching base tracks if studio album. | Safe default: `insane-driver-deluxe` shares the debut album's tracks; live/acoustic/solo releases without catalog entries fall back cleanly. | n |

**Open questions:** none - all resolved or logged above.

---

## Implicit-Requirement Dimensions

| Dimension | Coverage |
| --- | --- |
| Input validation & bounds | Covered by `BANDSEO-01` and `BANDSEO-06`: parser validates all 24 track slugs exist, every `✅` band has non-empty reference tracks and editorial justification, and `page_description` respects the `metaDescription` length bound. |
| Failure / partial-failure states | Covered by `BANDSEO-07`: if a page/release has no entry in `seo-catalog.json` (e.g., Home, `/band/`, or standalone variant releases), templates fall back to the default `For fans of...` copy without build errors. |
| Idempotency / retry / duplicate handling | Covered by `BANDSEO-01`: running the local import script multiple times produces identical deterministic JSON output. |
| Auth boundaries & rate limits | N/A because this is a static build-time data integration with no runtime auth or external API calls. |
| Concurrency / ordering | Covered by `BANDSEO-05`: album band ranking uses a deterministic sort (frequency descending, then max MERT score descending, then alphabetical). |
| Data lifecycle / expiry | N/A because catalog data is static versioned JSON updated manually via the import script. |
| Observability | N/A because there is no runtime backend service; build-time validation throws descriptive errors on malformed data. |
| External-dependency failure | Covered by `BANDSEO-01`: Eleventy build reads only local `_data/seo-catalog.json` and never depends on the external `classifier-agent` directory at build time. |
| State-transition integrity | N/A because song and album pages are stateless static HTML documents. |

---

## User Stories

### P1: Track-Level Similar Bands & Sonic Dossier ⭐ MVP

**User Story**: As a rock/metal listener searching Google for bands like Dream Theater, Killswitch Engage, or Alter Bridge, I want each Insane Driver song page to clearly state which `✅`-verified bands it sounds like, which reference tracks it resembles, and why, so that I can discover Insane Driver through search and immediately understand the track's sound.

**Why P1**: Core value of the feature — replaces generic copy with track-accurate band discovery and SEO signals on all 24 song pages.

**Acceptance Criteria** (EARS):

1. WHEN `lib/catalog.js` builds the catalog THEN the system SHALL attach `seo` data (primary genre, secondary genre, `✅`-only similar bands with reference tracks and clean editorial justification, and `✅`-filtered keywords) from `_data/seo-catalog.json` to each of the 24 songs in `catalog.songs`.
2. WHERE a song has `✅`-verified similar bands THEN `_includes/seo/fans-of.liquid` SHALL render `For fans of <band list>` listing only that song's `✅` bands (formatted with commas and `and` for 2+ bands, or single band name for 1 band).
3. WHERE a song has `seo` data THEN `_includes/discography/song-dossier.liquid` SHALL render a `Sonic DNA & Similar Artists` section displaying the song's primary and secondary styles and each `✅` band's name, reference tracks, and clean editorial justification (excluding MERT layer/score boilerplate).
4. The `Sonic DNA & Similar Artists` section SHALL render consistently across all three song page layouts (`song-bento`, `song-bento-lyrics`, and `stack`).

**Independent Test**: Build the site and inspect `/discography/insane-driver/endless-path/` (`stack` layout), `/discography/insane-driver/the-edge-of-life/` (`video` layout), and `/discography/silicon-fortress/age-of-lies/` (`lyrics` layout, 1 `✅` band) to verify `For fans of...` and `Sonic DNA & Similar Artists` show only `✅` bands and clean editorial text.

---

### P1: Technical SEO (`meta description` & `MusicRecording` JSON-LD) ⭐ MVP

**User Story**: As a site owner, I want each song page's `<meta name="description">` and `MusicRecording` JSON-LD to include the track's actual genres, `✅` similar bands, and `"bands like <Band>"` keywords so that search engines index each song for its specific sonic niche.

**Why P1**: Directly drives Google discoverability for band-similarity queries.

**Acceptance Criteria** (EARS):

1. WHEN `discography/song.liquid` computes `page_description` for a song with `seo` data THEN the system SHALL include `For fans of <✅ bands>` alongside `song.about` (or the track summary when `song.about` is absent, such as instrumentals) within the `metaDescription` filter limit.
2. WHEN `discography/song.liquid` renders the `MusicRecording` JSON-LD script THEN the system SHALL populate `"genre"` with the song's primary and secondary styles (deduplicated), `"keywords"` with the `✅`-filtered keywords string, and `"description"` with the song's enriched description.
3. The system SHALL NOT include any `⚠️`-marked (below-threshold) band names in rendered HTML text, `<meta name="description">`, or JSON-LD output on song pages.

**Independent Test**: Parse the rendered `<meta name="description">` and `<script type="application/ld+json">` on song pages in unit/E2E tests and assert `✅` bands are present and `⚠️` bands (e.g. `Symphony X` on `endless-path`, `Trivium` on `the-edge-of-life`) are absent.

---

### P2: Album-Level Aggregation & Fallback Safety

**User Story**: As a visitor landing on an album page (`/discography/insane-driver/` or `/discography/silicon-fortress/`), I want the `For fans of...` line and `MusicAlbum` JSON-LD genres to reflect the top recurring `✅` bands and genres of that album's tracks.

**Why P2**: Keeps album pages aligned with their tracklists while preserving fallback behavior for Home, `/band/`, and live/acoustic releases.

**Acceptance Criteria** (EARS):

1. WHEN `lib/catalog.js` builds album models THEN the system SHALL aggregate `✅` bands across each album's tracks ranked by frequency (tie-breaking by highest MERT overall score, then alphabetically) and attach the top 4 bands and unique track genres to the album model.
2. WHERE a release has aggregated `✅` bands THEN `discography/release.liquid` SHALL render `For fans of <top 4 ✅ bands>` via `_includes/seo/fans-of.liquid` and populate `MusicAlbum` JSON-LD `"genre"` with the album's aggregated genres.
3. IF a page or release has no `seo` band data (such as Home, `/band/`, or standalone variant releases without track matches) THEN `_includes/seo/fans-of.liquid` SHALL fall back to rendering `For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold`.

**Independent Test**: Inspect `/discography/insane-driver/`, `/discography/silicon-fortress/`, `/band/`, and `/` to verify album-specific aggregation and default fallback.

---

## Edge Cases

- **Single `✅` band**: WHEN a track has only 1 `✅` band (`age-of-lies`, `imagined-realities`, `invisible-chains`) THEN `For fans of <Band>` SHALL render without trailing commas or `"and"`.
- **Instrumental tracks**: WHEN an instrumental track (`endless-path`, `back-to-1994`) has no `song.about` THEN `page_description` SHALL still include the track context and `For fans of <✅ bands>`.
- **Duplicate genre names**: WHEN primary and secondary styles or album track genres contain duplicates THEN JSON-LD `"genre"` SHALL emit unique values only.
- **Reproducible local import**: WHEN `scripts/import-seo-catalog.cjs` is executed locally against `seo_catalog_local.md` THEN it SHALL deterministically regenerate `_data/seo-catalog.json` with all 24 tracks.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| BANDSEO-01 | P1: Track-Level Similar Bands | Design | Pending |
| BANDSEO-02 | P1: Track-Level Similar Bands | Design | Pending |
| BANDSEO-03 | P1: Track-Level Similar Bands | Design | Pending |
| BANDSEO-04 | P1: Technical SEO | Design | Pending |
| BANDSEO-05 | P2: Album-Level Aggregation | Design | Pending |
| BANDSEO-06 | P1: Technical SEO | Design | Pending |
| BANDSEO-07 | P2: Album-Level Aggregation | Design | Pending |

---

## Success Criteria

- [ ] All 24 song pages display track-specific `✅`-only `For fans of...` and `Sonic DNA & Similar Artists` with reference tracks and editorial justification.
- [ ] Zero `⚠️` bands appear in visible HTML, `<meta name="description">`, or JSON-LD on any song or album page.
- [ ] Both studio album pages display top-4 aggregated `✅` bands and aggregated `MusicAlbum` genres; Home and `/band/` retain the default fallback.
- [ ] `npm run build`, all unit tests (`npm run test:unit`), and scoped Playwright E2E tests across all song layouts and release pages pass.
