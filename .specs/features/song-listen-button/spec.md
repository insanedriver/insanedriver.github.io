# Song Listen Now & Quick Play Button Contrast Specification

## Problem Statement

Adding `:not(.disc-buy)` to `#page_discography .disc-page a:not(.cyber-link-btn):not(.disc-single-link):not(.disc-buy)` in `less/discography.less` raised that rule's specificity to `(1, 4, 1)`, beating `#page_discography .song-page--bento a.song-bento-quickplay.song-bento-quickplay` (`(1, 3, 1)` in `less/song-bento.less`). Both `Listen now` (`[data-song-listen]`) and `Quick play` (`[data-song-quickplay]`) share `.song-bento-quickplay`, so at rest their text and icon take `color: #00f3ff` over `background: #00f3ff` (rendering solid cyan with invisible label/icon), and on hover/focus their text takes `color: #ff00ea` instead of `#03080e`.

## Goals

- [x] `Listen now` (`[data-song-listen]`) and `Quick play` (`[data-song-quickplay]`) render dark text (`#03080e`, `rgb(3, 8, 14)`) over cyan (`#00f3ff`, `rgb(0, 243, 255)`) at rest and over yellow (`#fcee0a`, `rgb(252, 238, 10)`) on hover and focus.
- [x] E2E tests assert the exact computed `color` and `background-color` at rest and on hover across video, album-lyrics, and single-lyrics song pages.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Changing button shape, typography, or layout | Only the overridden text color is broken. |
| Panel B `.cyber-link-btn` buttons | Already excluded by `:not(.cyber-link-btn)` and styled via `less/cyber-links.less`. |
| Instrumental stacked song pages | They do not render `.song-bento-meta` or `.song-bento-quickplay`. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Scope includes `Quick play` (`[data-song-quickplay]`) as well as `Listen now` (`[data-song-listen]`) | Fix both via `.song-bento-quickplay` | Both buttons use `.song-bento-quickplay` in `_includes/discography/song-bento-meta.liquid` and suffer the exact same specificity override | y |
| CSS fix mechanism | Exclude `:not(.song-bento-quickplay)` in `less/discography.less` and drop the obsolete doubled-class hack in `less/song-bento.less` | `.song-bento-quickplay` is a button component like `.cyber-link-btn`, `.disc-single-link`, and `.disc-buy`, not a prose link | y |
| All three bento song page kinds (video, album lyrics, single lyrics) | Verify on all three layouts (L-037) | `_includes/discography/song-bento-meta.liquid` is shared by video bento, album lyrics bento, and single lyrics bento pages | y |
| Remaining implicit-requirement dimensions | N/A because this is a static CSS selector fix with no input, state, network, or persistence | Static styling | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Readable Listen Now and Quick Play buttons ⭐ MVP

**User Story**: As a visitor on a song page, I want the `Listen now` / `Quick play` button in the metadata bar to show dark text and icon over its cyan background at rest and over its yellow background on hover so that I can read the call to action immediately without hovering first.

**Why P1**: Primary call to action in the song metadata bar.

**Acceptance Criteria**:

1. SLBTN-01: The `[data-song-listen]` anchor on lyrics-bento song pages (both album tracks and singles) and the `[data-song-quickplay]` anchor on video-bento song pages SHALL have computed `background-color: rgb(0, 243, 255)` and `color: rgb(3, 8, 14)` at rest.  <!-- ubiquitous -->
2. SLBTN-02: WHEN `[data-song-listen]` or `[data-song-quickplay]` is hovered or focused THEN it SHALL have computed `background-color: rgb(252, 238, 10)` and `color: rgb(3, 8, 14)`.  <!-- event-driven -->
3. SLBTN-03: Prose links inside `.disc-page` that are not `.cyber-link-btn`, `.disc-single-link`, `.disc-buy`, or `.song-bento-quickplay` (such as `[data-song-album]`) SHALL keep computed `color: rgb(0, 243, 255)` at rest and `color: rgb(255, 0, 234)` when hovered.  <!-- ubiquitous -->

**Independent Test**: Open `/discography/silicon-fortress/faceless-demons/`, `/discography/waiting-for-you/`, and `/discography/silicon-fortress/keep-away/`; verify `Listen now` and `Quick play` display dark `#03080e` text on `#00f3ff` cyan before hovering, and `#03080e` text on `#fcee0a` yellow when hovered.

---

## Edge Cases

- WHEN a single-lyrics song page (`/discography/waiting-for-you/`, `/discography/the-sun-will-rise/`) renders `[data-song-listen]` without a `[data-song-album]` link THEN `[data-song-listen]` SHALL still have computed `color: rgb(3, 8, 14)` at rest and on hover (SLBTN-01, SLBTN-02).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| SLBTN-01 | P1: Readable Listen Now and Quick Play buttons | Execute | Verified |
| SLBTN-02 | P1: Readable Listen Now and Quick Play buttons | Execute | Verified |
| SLBTN-03 | P1: Readable Listen Now and Quick Play buttons | Execute | Verified |

**Coverage:** 3 total, 3 mapped to Execute, 0 unmapped

---

## Success Criteria

- [x] `Listen now` and `Quick play` show `rgb(3, 8, 14)` text/icon at rest and on hover across all bento song pages.
- [x] `assets/css/discography.min.css` is rebuilt and all unit and discography e2e tests pass.
