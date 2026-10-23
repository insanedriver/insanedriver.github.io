# Song Video Bento Specification

## Problem Statement

A song page with an official video (`/discography/<album>/<song>/`, `song.video` set) is a single long column: cover and links, then the video, then lyrics, About, "Also released as" and the track navigation stacked inside one panel. The video sits far from the streaming buttons that convert a YouTube visitor into a listener, the lyrics push the dossier and the track navigation out of sight, and the page carries none of the HUD vocabulary the band's PRD ("Bento Grid HUD", Insane Driver Web Experience) asks for. Ten pages are affected: six from Silicon Fortress, four from Insane Driver.

## Goals

- [ ] On desktop (≥ 992px) the video and the streaming matrix share the first screen row, and lyrics and dossier share the next.
- [ ] One click from the metadata bar starts the video (QUICK PLAY).
- [ ] No lyrics, link, structured-data or no-JS behavior lost against the current song page (existing SONG-* tests stay green).
- [ ] No horizontal overflow at 375, 768, 992 and 1280px.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Bento layout for the 12 songs without a video | Grilling Q1: separate feature; they keep today's stack (only the new track navigation reaches them). |
| Per-album hero art (band members in VR) | Grilling Q2: the existing page header stays; four of the ten pages belong to the Insane Driver album. |
| Changing `primary` flags in `_data/platforms.json` | Grilling Q4: would change album pages and home; Panel B uses its own ordering. |
| Self-hosted HTML5 `<video>` fallback (PRD FR-02.1) | Every video is on YouTube; there is no self-hosted file to fall back to. |
| Fabricated telemetry (`1080P`, `High-Res 24-Bit`, bitrate) | Grilling Q3: factual claims the band cannot back. |
| Internal lyrics scroll (PRD FR-04.4) and mobile accordion | Grilling Q6/Q7: full lyrics stay in the page flow. |
| JSON-LD, titles, meta, sitemap | Unchanged; covered by existing SEO tests. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Which pages get the Bento | Songs whose catalog entry has `video` (10 today) | Grilling Q1 | y |
| Title banner | Existing single `<h1>` restyled as a holographic badge in War is Over; header image unchanged | Grilling Q2 | y |
| Telemetry strings | Only values derived from data: `REC::{video.id} // {video.type}`, `SOURCE: YOUTUBE // {video.id}`, `[N SECTIONS]`, `HUD.LOG::LYR_NN`, `CATALOG: {CODE}-TRACK-NN`; plus decorative non-factual `STATUS: ONLINE // ALL NODES ACTIVE` | Grilling Q3 | y |
| Album code in CATALOG | Uppercase initials of the album title words (Silicon Fortress → SF, Insane Driver → ID) | Deterministic, no new data field | y |
| Panel B platform order | Primary: Spotify, Apple Music, YT Music, Bandcamp; compact: Deezer, Tidal, Amazon Music, Pandora | Grilling Q4 (b): PRD order plus Pandora so no existing link is lost | y |
| Panel B URL per platform | Same rule as SONG-07: the track URL from `songs.json`, else the album URL; no URL → no button | Keeps the existing, live-checked links | y |
| Panel B sub labels | With a track URL: Spotify/Apple "Play the track", YT Music "Audio stream", Bandcamp "Lossless download"; falling back to the album URL: the platform's `sub` | PRD FR-03.1, without promising a track that is not linked | y |
| `rel` on external links | `rel="noopener"` (site convention) rather than the PRD's `noopener noreferrer` | `noreferrer` strips the referrer the platforms use to credit the band's traffic; `noopener` already gives the security guarantee | y |
| QUICK PLAY | Scrolls to Panel A and activates the facade (same embed as SONG-13); instant scroll under reduced motion; no-JS = anchor `#song-video` | Grilling Q5 | y |
| QUICK PLAY tracking | `dataLayer.push({event: 'song_quick_play', song: <slug>})` | Same channel as `release_click`; tag config in GTM is out of band | y |
| Panels C/D height | Natural height, no inner scroll; Panel D content sticky on ≥ 992px | Grilling Q6 | y |
| Tablet (768–991) | Single column: A, B, D, C; Panel B primary buttons in 2 columns | Grilling Q13 | y |
| Mobile (< 768) | Single column: meta bar, A, B (2-col buttons), D, C; full lyrics | Grilling Q7/Q8 of PRD §6 | y |
| Lyrics markers | Verse*/Prayer/other → cyan; Bridge*/Interlude → magenta; Chorus* → yellow with italic lines; unlabeled → no marker; cue sections keep the dimmed cue style | Grilling Q11 | y |
| Panel A badge | `● OFFICIAL {video.type}` (e.g. `● OFFICIAL LYRIC VIDEO`), pulsing dot | Grilling Q12: video types vary | y |
| Panel tab font | `Mars Mission` (7.4 KB woff2, `font-display: swap`), declared only in the discography bundle | Grilling Q8 | y |
| Track navigation | New full-width bar after the panels, on every song page (video or not) | Grilling Q9 | y |
| Input validation, failure states, idempotency, auth, concurrency, data lifecycle, external-dependency failure | N/A because the page is static HTML built from frozen JSON, takes no input and writes nothing; the only external dependency (YouTube) is behind the existing facade, which degrades to a watch-page link | Static site | y |
| Observability | Covered by BENTO-11 (QUICK PLAY event) and BENTO-21 (existing `release_click`) | Existing GTM channel | y |
| State-transition integrity | The facade → iframe transition happens at most once per page (BENTO-12) | Only state change on the page | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Watch and listen side by side ⭐ MVP

**User Story**: As a casual listener arriving from YouTube or social media, I want the video and the streaming buttons next to each other so that I can watch and add the song to my playlist without scrolling.

**Why P1**: This is the conversion path the PRD exists for.

**Acceptance Criteria**:

1. WHERE the song has a video the page SHALL render one `[data-song-bento]` grid holding four panels whose tabs read `PANEL A // VIDEO TRANSMISSION`, `PANEL B // AUDIO UPLINK`, `PANEL D // SONG DOSSIER`, `PANEL C // LYRICS TERMINAL`, in that DOM order. <!-- BENTO-01 -->
2. IF the song has no video THEN the page SHALL render no `[data-song-bento]` element and no element with a `PANEL A` tab. <!-- BENTO-02 -->
3. WHILE the viewport is at least 992px wide the page SHALL place Panels A and B on the same row with A to the left, and A's width divided by the sum of both widths SHALL be between 0.64 and 0.69. <!-- BENTO-03 -->
4. WHILE the viewport is at least 992px wide the page SHALL place Panels C and D on the same row below A/B, C to the left, with widths differing by at most 2px. <!-- BENTO-04 -->
5. WHILE the viewport is narrower than 992px the page SHALL stack the panels at full grid width in the order A, B, D, C from top to bottom. <!-- BENTO-05 -->
6. The page SHALL have `document.documentElement.scrollWidth` equal to its `clientWidth` at viewport widths 375, 768, 992 and 1280px. <!-- BENTO-06 -->
7. Panel A SHALL contain the existing video facade (`[data-song-video]`, behavior SONG-11..14 unchanged) inside a frame whose width/height ratio is 16/9 within ±1%. <!-- BENTO-14 -->
8. Panel A SHALL show the text `● OFFICIAL {video.type}`, the text `REC::{video.id} // {video.type}` and the text `SOURCE: YOUTUBE // {video.id}`. <!-- BENTO-15 -->
9. Panel A SHALL show `video.title` as plain text below the frame, and the page SHALL keep exactly one link whose accessible name contains the video title. <!-- BENTO-16 -->
10. The page SHALL contain none of the strings `1080P`, `24-Bit`, `High-Res` or `Bitrate` (case-insensitive). <!-- BENTO-17 -->
11. Panel B SHALL render one anchor per platform that has a URL, in the order Spotify, Apple Music, YT Music, Bandcamp with the `cyber-link-btn--primary` modifier, then Deezer, Tidal, Amazon Music, Pandora with the `cyber-link-btn--compact` modifier. <!-- BENTO-18 -->
12. Panel B SHALL point each anchor at the song's track URL in `songs.json` when present, otherwise at the album URL for that platform. <!-- BENTO-19 -->
13. WHERE the anchor uses the track URL its sub label SHALL be `Play the track` for Spotify and Apple Music, `Audio stream` for YT Music and `Lossless download` for Bandcamp; WHERE it falls back to the album URL the sub label SHALL be that platform's `sub` from `platforms.json`. <!-- BENTO-20 -->
14. Every Panel B anchor SHALL carry `target="_blank"`, `rel="noopener"`, `data-disc-link="{platform key}"` and `data-disc-slug`, so that WHEN it is clicked THEN the existing `release_click` event SHALL be pushed. <!-- BENTO-21 -->
15. Panel B SHALL show the text `STATUS: ONLINE // ALL NODES ACTIVE`. <!-- BENTO-22 -->
16. WHEN a Panel B anchor is hovered THEN its border color SHALL be its platform's brand color from `less/cyber-links.less` (Spotify `rgb(29, 185, 84)`). <!-- BENTO-23 -->
17. WHILE the viewport is narrower than 992px Panel B SHALL lay its primary anchors out in 2 columns of equal width. <!-- BENTO-24 -->

**Independent Test**: Open `/discography/silicon-fortress/keep-away/` at 1280px: video at left two-thirds, eight platform buttons at right; at 375px the same content stacks with no sideways scroll.

---

### P1: Metadata bar and QUICK PLAY ⭐ MVP

**User Story**: As a visitor landing on a song page, I want the essentials and a single play button at the top so that I know what I am on and can start it at once.

**Why P1**: The PRD's primary action.

**Acceptance Criteria**:

1. WHERE the song has a video the page SHALL render a `[data-song-meta]` bar containing the cover image (`.disc-release-art img`, existing src), the text `Track NN // YYYY`, the text `Runtime M:SS`, a link to the album page with the album title, the label `Recommended intel` and the exact text `For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold`. <!-- BENTO-07 -->
2. WHERE the song has a video the single `<h1>` SHALL keep the song title as its text, carry the class `song-title-badge` and render in the `insaneFont` family. <!-- BENTO-08 -->
3. The metadata bar SHALL contain an anchor `[data-song-quickplay]` with text `Quick play` and `href="#song-video"`, and Panel A SHALL carry `id="song-video"`. <!-- BENTO-09 -->
4. WHEN `[data-song-quickplay]` is clicked with JavaScript enabled THEN the page SHALL scroll Panel A into the viewport and replace the facade with the `https://www.youtube-nocookie.com/embed/{id}?autoplay=1` iframe, staying on the same URL. <!-- BENTO-10 -->
5. WHEN `[data-song-quickplay]` is clicked THEN the page SHALL push `{event: 'song_quick_play', song: '<song slug>'}` to `window.dataLayer`. <!-- BENTO-11 -->
6. IF the video is already playing WHEN `[data-song-quickplay]` is clicked THEN the page SHALL scroll to Panel A and SHALL keep exactly one iframe. <!-- BENTO-12 -->
7. WHILE `prefers-reduced-motion: reduce` is set, WHEN `[data-song-quickplay]` is clicked THEN the page SHALL scroll with `behavior: 'auto'`, so Panel A's top is in the viewport immediately after the click. <!-- BENTO-13 -->

**Independent Test**: Click QUICK PLAY at 1280px: page scrolls to Panel A, the iframe replaces the thumbnail, `dataLayer` holds a `song_quick_play` entry.

---

### P1: Lyrics terminal and dossier ⭐ MVP

**User Story**: As a dedicated fan, I want the lyrics marked by section beside the song's story so that I can follow along and understand it.

**Why P1**: Lyrics are the page's search entry point (SEO title "… Lyrics").

**Acceptance Criteria**:

1. Panel C SHALL render the same lyrics sequence as SONG-04 (labels and lines from `_data/lyrics`, in order, with source line breaks). <!-- BENTO-25 -->
2. Panel C SHALL show `[N SECTIONS]` where N is the number of sections in the song's lyrics data, and `HUD.LOG::LYR_NN` where NN is the two-digit track position. <!-- BENTO-26 -->
3. Panel C SHALL give each labelled lyrics section exactly one family class: `song-lyrics-section--verse` for labels starting `Verse`, `--chorus` for labels starting `Chorus`, `--bridge` for labels starting `Bridge` or equal to `Interlude`, `--other` for any other label; an unlabeled section SHALL carry none of them. <!-- BENTO-27 -->
4. Panel C SHALL draw a square marker before each section label, colored `rgb(0, 243, 255)` for verse and other, `rgb(255, 0, 234)` for bridge and `rgb(252, 238, 10)` for chorus, and SHALL render chorus lines in italic. <!-- BENTO-28 -->
5. Panel C SHALL keep a computed `overflow-y` of `visible` and SHALL NOT clip the lyrics (`scrollHeight` equals `clientHeight`). <!-- BENTO-30 -->
6. Panel D SHALL contain "About the song" and "Also released as" with the same content and conditions as SONG-06 and SONG-08. <!-- BENTO-31 -->
7. Panel D SHALL show `CATALOG: {CODE}-TRACK-NN // ALL EDITIONS LISTED`, where CODE is the uppercase initials of the album title words and NN the two-digit track position. <!-- BENTO-32 -->
8. WHILE the viewport is at least 992px wide Panel D's content SHALL have computed `position: sticky`. <!-- BENTO-33 -->

**Independent Test**: On `/discography/silicon-fortress/keep-away/`, Verse headings show cyan squares, Bridge magenta, Chorus yellow with italic lines; Panel D reads `CATALOG: SF-TRACK-03`.

---

### P2: Track sequencer

**User Story**: As a listener exploring an album, I want a clear previous/next bar so that I can walk the record in order.

**Why P2**: The links exist today; this changes their placement and labelling.

**Acceptance Criteria**:

1. The system SHALL render the previous/next navigation of every song page (with or without video) as a `.song-nav` element outside every `.cyber-panel`, after the last panel. <!-- BENTO-34 -->
2. The previous link SHALL read `← Previous track // NN` followed by the title, and the next link `Next track → // NN` followed by the title, NN being that track's two-digit position; `rel`, href and first/last omission SHALL stay as in SONG-10. <!-- BENTO-35 -->

**Independent Test**: Keep Away shows `← Previous track // 02 Faceless Demons` and `Next track → // 04 Silicon Fortress`; Back to 1994 has no previous link.

---

### P2: Neon HUD finish and accessibility

**User Story**: As a fan of the band's visual identity, I want the page to read as the Silicon Fortress HUD while staying usable by keyboard and for people sensitive to motion.

**Why P2**: Identity and a11y on top of a working layout.

**Acceptance Criteria**:

1. WHERE the song has a video every element inside `[data-song-bento]`, `[data-song-meta]` and `.song-nav` SHALL have a computed `border-radius` of `0px` on all corners. <!-- BENTO-36 -->
2. The panel tabs inside `[data-song-bento]` SHALL use the `Mars Mission` font family, declared with `font-display: swap` from `/assets/fonts/Mars-Mission.woff2`. <!-- BENTO-37 -->
3. WHEN a Panel B anchor, the QUICK PLAY anchor, the video facade or a `.song-nav` link receives keyboard focus THEN it SHALL show `outline: 3px solid rgb(252, 238, 10)` with `outline-offset: 4px`. <!-- BENTO-38 -->
4. WHILE `prefers-reduced-motion: reduce` is set every element inside `[data-song-bento]` and `[data-song-meta]` SHALL have computed `animation-name: none`. <!-- BENTO-39 -->
5. The panel bodies inside `[data-song-bento]` SHALL have background color `rgba(10, 10, 10, 0.85)` and a background image with a 25px grid. <!-- BENTO-40 -->
6. The lyrics lines and the About text SHALL have color `rgb(233, 237, 242)`. <!-- BENTO-41 -->
7. IF JavaScript is disabled THEN every Panel B anchor, the QUICK PLAY anchor and the facade SHALL remain plain working links. <!-- BENTO-42 -->
8. The page SHALL make no request to YouTube before the facade or QUICK PLAY is activated (SONG-12 preserved). <!-- BENTO-43 -->

---

## Edge Cases

- IF a video song has no About text and no alternative release THEN Panel D SHALL still render with its catalog footer.
- IF a platform has neither a track nor an album URL THEN Panel B SHALL omit that button (BENTO-18).
- WHEN the song is the album's first or last track THEN the sequencer SHALL omit the missing side (BENTO-35).
- IF a lyrics sheet has no labels THEN Panel C SHALL render no markers (BENTO-27).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| BENTO-01 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-02 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-03 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-04 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-05 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-06 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-07 | P1: Metadata bar | Tasks | In Tasks |
| BENTO-08 | P1: Metadata bar | Tasks | In Tasks |
| BENTO-09 | P1: Metadata bar | Tasks | In Tasks |
| BENTO-10 | P1: Metadata bar | Tasks | In Tasks |
| BENTO-11 | P1: Metadata bar | Tasks | In Tasks |
| BENTO-12 | P1: Metadata bar | Tasks | In Tasks |
| BENTO-13 | P1: Metadata bar | Tasks | In Tasks |
| BENTO-14 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-15 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-16 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-17 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-18 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-19 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-20 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-21 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-22 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-23 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-24 | P1: Watch and listen | Tasks | In Tasks |
| BENTO-25 | P1: Lyrics and dossier | Tasks | In Tasks |
| BENTO-26 | P1: Lyrics and dossier | Tasks | In Tasks |
| BENTO-27 | P1: Lyrics and dossier | T1, T4 | Implementing |
| BENTO-28 | P1: Lyrics and dossier | Tasks | In Tasks |
| BENTO-30 | P1: Lyrics and dossier | Tasks | In Tasks |
| BENTO-31 | P1: Lyrics and dossier | Tasks | In Tasks |
| BENTO-32 | P1: Lyrics and dossier | Tasks | In Tasks |
| BENTO-33 | P1: Lyrics and dossier | Tasks | In Tasks |
| BENTO-34 | P2: Track sequencer | Tasks | In Tasks |
| BENTO-35 | P2: Track sequencer | Tasks | In Tasks |
| BENTO-36 | P2: HUD finish | Tasks | In Tasks |
| BENTO-37 | P2: HUD finish | Tasks | In Tasks |
| BENTO-38 | P2: HUD finish | Tasks | In Tasks |
| BENTO-39 | P2: HUD finish | Tasks | In Tasks |
| BENTO-40 | P2: HUD finish | Tasks | In Tasks |
| BENTO-41 | P2: HUD finish | Tasks | In Tasks |
| BENTO-42 | P2: HUD finish | Tasks | In Tasks |
| BENTO-43 | P2: HUD finish | Tasks | In Tasks |

**ID format:** `BENTO-NN`. BENTO-29 is unused (cue sections keep their current style, covered by SONG-04).

**Coverage:** 42 total, 42 mapped to tasks (T1-T10).

---

## Success Criteria

- [ ] All 10 video song pages render the Bento grid; all 12 others keep today's stack plus the new sequencer.
- [ ] Unit and e2e suites green, including every pre-existing SONG-* and SEO test.
- [ ] Zero horizontal overflow at 375/768/992/1280px on all 22 song pages.
