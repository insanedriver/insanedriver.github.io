# Song Bento Without Video Specification

## Problem Statement

The ten song pages that have lyrics but no official video (`song.video` unset, `song.instrumental` false) still use the old single-column stack: cover and links in one panel, then lyrics, About and "Also released as" in another. Next to the ten video songs, which now use the HUD bento grid (`song-video-bento`), they look like a different site, and on a wide screen the lyrics run down a narrow column while the streaming buttons scroll out of sight. Pages affected: The Edge of Life, Firstly My Breakfast, Fallen Dreams, Faithless Breath, Make Decisions, Tears of Blood (Insane Driver); Faceless Demons, Age of Lies, Insane Driver, Invisible Chains (Silicon Fortress).

## Goals

- [ ] On desktop (≥ 992px) the lyrics take the place of the video next to the streaming matrix, and the dossier runs full width below them.
- [ ] One click from the metadata bar opens the song on Spotify (LISTEN NOW).
- [ ] The same HUD finish as the video songs (badge h1, tabs, grid background, lyrics markers).
- [ ] No lyrics, link, structured-data or no-JS behavior lost (existing SONG-* tests stay green); no horizontal overflow at 375, 768, 992 and 1280px.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Instrumental songs (Endless Path, Back to 1994) | Grilling Q2: no lyrics and no About would leave the main panel empty; they keep today's stack. |
| Changing the video-song bento | Closed and verified in `song-video-bento`. |
| A separate tracking event for LISTEN NOW | Grilling Q10: it reuses `release_click`. |
| Internal lyrics scroll and mobile accordion | Same decision as `song-video-bento`: full lyrics stay in the page flow. |
| JSON-LD, titles, meta, sitemap | Unchanged; covered by existing SEO tests. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Which pages get the bento | Songs with no `video` and `instrumental` false (10 today) | Grilling Q2 | y |
| Widths | One bento markup at every width; the new grid applies from 992px, panels stack below | Grilling Q1 | y |
| Desktop grid | Row 1: Panel C (lyrics) 4/6 left, Panel B 2/6 right; row 2: Panel D across the full grid width | Grilling Q3 (a) | y |
| Panel names | Each panel keeps its content-bound tab: `PANEL C // LYRICS TERMINAL`, `PANEL B // AUDIO UPLINK`, `PANEL D // SONG DOSSIER` | Grilling Q5 | y |
| HUD finish | Same as the video songs (badge h1, SiliconFont tabs, panel grid background, section markers, italic chorus, zero radius, focus ring, reduced motion) | Grilling Q6 | y |
| Stack order below 992px | Meta bar, C, B, D (also the DOM order) | Grilling Q8 | y |
| Panel D on desktop | About and "Also released as" side by side, About on the 4/6 side; without "Also", About alone with its text capped at 70ch | Grilling Q9 | y |
| Metadata bar CTA | `LISTEN NOW` (Spotify icon) replaces QUICK PLAY: an external link to the song's Spotify URL from `song.uplink`, same cyan clipped style | Grilling Q4 (b) / Q10 | y |
| LISTEN NOW tracking | `data-disc-link="spotify"` + `data-disc-slug` so the existing `release_click` fires | Grilling Q10 | y |
| Sticky | Panel B content sticky at ≥ 992px with `top: 2rem`; Panel D not sticky | Grilling Q11 | y |
| BENTO-02 | Narrowed: "no bento" now holds only for instrumental songs without a video; the AC text in `song-video-bento/spec.md` is amended (L-004) | Follows from the scope | y |
| Song with no Spotify URL | No LISTEN NOW anchor rendered; none of the 10 songs is in that case today | Never link to a missing URL | y |
| Input validation, failure states, idempotency, auth, concurrency, data lifecycle, external-dependency failure, state transitions | N/A because the page is static HTML built from frozen JSON, takes no input, writes nothing and loads no third-party embed | Static site | y |
| Observability | Covered by NOVID-08 (`release_click` from LISTEN NOW) and NOVID-15 (Panel B) | Existing GTM channel | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Lyrics beside the streaming matrix ⭐ MVP

**User Story**: As a fan arriving from search for the lyrics of a song with no video, I want the lyrics front and centre with the streaming buttons beside them so that I can read along and add the song to my playlist without scrolling back up.

**Why P1**: Lyrics are these pages' search entry point ("… Lyrics" title); this is the layout the feature exists for.

**Acceptance Criteria**:

1. WHERE the song has no video and is not instrumental the page SHALL render one `[data-song-bento]` grid holding three panels whose tabs read `PANEL C // LYRICS TERMINAL`, `PANEL B // AUDIO UPLINK`, `PANEL D // SONG DOSSIER`, in that DOM order. <!-- NOVID-01 -->
2. WHERE the song has no video the page SHALL contain no element with a `PANEL A` tab, no `#song-video` element and no `[data-song-quickplay]` element. <!-- NOVID-02 -->
3. IF the song is instrumental and has no video THEN the page SHALL render no `[data-song-bento]` and no `[data-song-meta]` element, and its `<h1>` SHALL NOT carry `song-title-badge`. <!-- NOVID-03 -->
4. WHILE the viewport is at least 992px wide the page SHALL place Panels C and B on the same row with C to the left, and C's width divided by the sum of both widths SHALL be between 0.64 and 0.69. <!-- NOVID-04 -->
5. WHILE the viewport is at least 992px wide Panel D SHALL sit below Panels C and B, with its left edge within 2px of C's left edge and its right edge within 2px of B's right edge. <!-- NOVID-05 -->
6. WHILE the viewport is narrower than 992px the page SHALL stack the panels at full grid width in the order C, B, D from top to bottom. <!-- NOVID-06 -->
7. WHILE the viewport is at least 992px wide Panel B's content SHALL have computed `position: sticky` and `top: 20px`, and Panel D's content SHALL have computed `position: static`. <!-- NOVID-07 -->
8. Panel B SHALL satisfy BENTO-18..22 and BENTO-24 for the song (same platforms, order, URLs, sub labels, attributes, `release_click` on click, status line, 2-column primaries below 992px). <!-- NOVID-15 -->
9. The page SHALL have `document.documentElement.scrollWidth` equal to its `clientWidth` at viewport widths 375, 768, 992 and 1280px. <!-- NOVID-09 -->

**Independent Test**: Open `/discography/silicon-fortress/faceless-demons/` at 1280px: lyrics on the left two-thirds, eight platform buttons at right staying in view while scrolling the lyrics, About full width below; at 375px the same content stacks C, B, D with no sideways scroll.

---

### P1: Metadata bar and LISTEN NOW ⭐ MVP

**User Story**: As a visitor landing on a song page without a video, I want the essentials and one button to hear the song so that I can start it at once.

**Why P1**: The page's primary action.

**Acceptance Criteria**:

1. WHERE the song has no video and is not instrumental the page SHALL render a `[data-song-meta]` bar with the same content as BENTO-07 (cover, `Track NN // YYYY`, `Runtime M:SS`, album link, `Recommended intel`, fans-of line). <!-- NOVID-10 -->
2. WHERE the song has no video and is not instrumental the single `<h1>` SHALL keep the song title as its text, carry the class `song-title-badge` and render in the `insaneFont` family. <!-- NOVID-11 -->
3. WHERE the song has a Spotify URL in `song.uplink` the metadata bar SHALL contain one anchor `[data-song-listen]` whose text is `Listen now`, with a Spotify icon, `href` equal to that URL, `target="_blank"`, `rel="noopener"`, `data-disc-link="spotify"` and `data-disc-slug` equal to the album slug. <!-- NOVID-12 -->
4. WHEN `[data-song-listen]` is clicked THEN the page SHALL push exactly one `{event: 'release_click', platform: 'spotify', release: '<album slug>'}` to `window.dataLayer`. <!-- NOVID-08 -->
5. IF the song has no Spotify URL THEN the metadata bar SHALL contain no `[data-song-listen]` element. <!-- NOVID-13 -->
6. The `[data-song-listen]` anchor SHALL have the same computed background color, text color and `clip-path` as the QUICK PLAY anchor of a video song. <!-- NOVID-14 -->

**Independent Test**: On Faceless Demons, the bar reads `Track 02 // …` and `Listen now` opens `https://open.spotify.com/track/5N0rDJGWRcp3LsWSD82Flk` in a new tab; `dataLayer` holds one `release_click` for `spotify` / `silicon-fortress`.

---

### P1: Lyrics terminal and dossier ⭐ MVP

**User Story**: As a dedicated fan, I want the lyrics marked by section and the song's story laid out across the page so that both are easy to read.

**Why P1**: The page's main content.

**Acceptance Criteria**:

1. Panel C SHALL satisfy BENTO-25..28 and BENTO-30 for the song (lyrics sequence, `[N SECTIONS]` / `HUD.LOG::LYR_NN`, family classes, colored markers, italic chorus, no clipping). <!-- NOVID-16 -->
2. Panel D SHALL contain "About the song" and "Also released as" with the same content and conditions as SONG-06 and SONG-08, and the text `CATALOG: {CODE}-TRACK-NN // ALL EDITIONS LISTED`. <!-- NOVID-17 -->
3. WHILE the viewport is at least 992px wide, WHERE the song has an "Also released as" section, Panel D SHALL place About and "Also released as" on the same row with About to the left, and About's width divided by the sum of both widths SHALL be between 0.64 and 0.69. <!-- NOVID-18 -->
4. IF the song has no "Also released as" section THEN the About paragraph SHALL have a rendered width of at most 70 times the width of the `0` glyph in its font. <!-- NOVID-19 -->
5. WHILE the viewport is at least 992px wide the `CATALOG:` line SHALL sit below both About and "Also released as". <!-- NOVID-20 -->

**Independent Test**: Faceless Demons (no "Also") shows About in a readable column below the lyrics; Age of Lies shows About on the left and "Also released as" on the right.

---

### P2: Neon HUD finish and accessibility

**User Story**: As a fan of the band's visual identity, I want these pages to share the video songs' HUD look while staying usable by keyboard and for people sensitive to motion.

**Why P2**: Identity and a11y on top of a working layout.

**Acceptance Criteria**:

1. WHERE the song has no video and is not instrumental the page SHALL satisfy BENTO-36, BENTO-37, BENTO-39, BENTO-40 and BENTO-41 (zero radius, SiliconFont tabs, no animation under reduced motion, panel background and grid, text colors). <!-- NOVID-21 -->
2. WHEN a Panel B anchor, the `[data-song-listen]` anchor or a `.song-nav` link receives keyboard focus THEN it SHALL show `outline: 3px solid rgb(252, 238, 10)` with `outline-offset: 4px`. <!-- NOVID-22 -->
3. IF JavaScript is disabled THEN every Panel B anchor and the `[data-song-listen]` anchor SHALL remain plain working links. <!-- NOVID-23 -->

---

## Edge Cases

- IF a lyrics sheet has no labels (Tears of Blood) THEN Panel C SHALL render no markers (NOVID-16 via BENTO-27).
- IF the song has no "Also released as" (Faceless Demons) THEN About SHALL stand alone within 70ch (NOVID-19).
- IF the song has no Spotify URL THEN no LISTEN NOW anchor (NOVID-13).
- WHEN the song is instrumental THEN the old layout stays (NOVID-03).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| NOVID-01 | P1: Lyrics beside the streaming matrix | T3 | Verified |
| NOVID-02 | P1: Lyrics beside the streaming matrix | T3 | Verified |
| NOVID-03 | P1: Lyrics beside the streaming matrix | T3 | Verified |
| NOVID-04 | P1: Lyrics beside the streaming matrix | T5 | Verified |
| NOVID-05 | P1: Lyrics beside the streaming matrix | T5 | Verified |
| NOVID-06 | P1: Lyrics beside the streaming matrix | T5 | Verified |
| NOVID-07 | P1: Lyrics beside the streaming matrix | T5 | Verified |
| NOVID-08 | P1: Metadata bar and LISTEN NOW | T4 | Verified |
| NOVID-09 | P1: Lyrics beside the streaming matrix | T5 | Verified |
| NOVID-10 | P1: Metadata bar and LISTEN NOW | T3 | Verified |
| NOVID-11 | P1: Metadata bar and LISTEN NOW | T3 | Verified |
| NOVID-12 | P1: Metadata bar and LISTEN NOW | T1, T4 | Verified |
| NOVID-13 | P1: Metadata bar and LISTEN NOW | T1, T4 | Verified |
| NOVID-14 | P1: Metadata bar and LISTEN NOW | T6 | Verified |
| NOVID-15 | P1: Lyrics beside the streaming matrix | T3 | Verified |
| NOVID-16 | P1: Lyrics terminal and dossier | T3 | Verified |
| NOVID-17 | P1: Lyrics terminal and dossier | T3 | Verified |
| NOVID-18 | P1: Lyrics terminal and dossier | T5 | Verified |
| NOVID-19 | P1: Lyrics terminal and dossier | T5 | Verified |
| NOVID-20 | P1: Lyrics terminal and dossier | T5 | Verified |
| NOVID-21 | P2: Neon HUD finish and accessibility | T6 | Verified |
| NOVID-22 | P2: Neon HUD finish and accessibility | T6 | Verified |
| NOVID-23 | P2: Neon HUD finish and accessibility | T4 | Verified |

**ID format:** `NOVID-NN`.

**Coverage:** 23 total, 23 mapped to tasks (T1-T6), 23 verified.

---

## Success Criteria

- [ ] All 10 in-scope pages render the bento with lyrics left and Panel B right at 1280px.
- [ ] Every existing SONG-* and BENTO-* test stays green, with BENTO-02 narrowed to instrumental songs.
- [ ] Zero horizontal overflow at 375, 768, 992 and 1280px on all 22 song pages.
