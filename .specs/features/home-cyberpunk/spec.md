# Home Cyberpunk Specification

## Problem Statement

The home page (`/`) is the site's highest-traffic page and the last major one still wearing the pre-2026 skin. It opens behind a `please-wait` loader that waits for `window.load`, which means waiting for five YouTube iframes and a Spotify playlist iframe, then shows a one-image Owl carousel and a vertical stack of embeds. It announces nothing new: the latest release (Keep Away (Acoustic), 2025-05-09) is absent, and none of the rebuilt pages (discography, ID-TV, photos, newsletter) are presented. A visitor lands on the slowest, least current page of the site.

## Goals

- [ ] The home reads as the flagship of the cyberpunk system: a full-screen hero plus `.cyber-panel` teasers for every rebuilt page.
- [ ] The latest release is one click from Spotify or Apple Music above the fold, derived from `_data/discography.json` with no manual edit.
- [ ] No iframe is created during initial page load (down from six).
- [ ] The loader gives a branded boot feeling and releases the page within 3.5s in every case.
- [ ] Home CTAs are measurable in GTM through `dataLayer` events.
- [ ] Everything a visitor needs (links, newsletter form, content) works without JavaScript.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Restyling the navbar on pages other than `/` | The transparent-over-hero navbar is a home-only decision. |
| Deleting `please-wait.min.js`, `please-wait.less`, `sk-wave.less`, `owl.carousel.min.js`, `owl.less` | Still used by `dates/`, `pre-save/spotify-select-playlist/` and the site-wide `js/pack` / `insane.js`. |
| Deleting `less/player.less` or other pages' legacy CSS | Only the `#page_home` rules and `home.js` belong to this feature. |
| Band teaser panel | Offered during grilling and declined to keep the page tight. |
| Extracting a shared `.cyber-zone` / `.cyber-panel` stylesheet | Confirmed project convention: each page owns its copy with a page-specific keyframe prefix. |
| Fixing `overflow: hidden` / reduced-motion gaps on band, contact, photos, videos, newsletter | Known follow-ups, separate changes. |
| Tour dates section | `/dates/` is disabled in the menu; no data source. |
| Configuring the GTM tags that consume the new events | The tag setup lives in GTM, outside the repo. |
| Replacing Universal Analytics | Site-wide cleanup, not this feature. |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Latest release | The entry with the greatest `releaseDate` across `albums` and `singles`; ties go to the album | A new single becomes a data edit; albums outrank singles on the same day. | y |
| Latest video | `videos[0]` in `_data/videos.json` | The file has no dates; ID-TV already treats the first entry as the featured one. | y |
| Spotify preview for a single | Embed id parsed from the release's `links.spotify` URL (`/album/<id>`) when `spotifyId` is null | Singles carry `spotifyId: null` but their Spotify URL holds the album id. | n |
| Hero photo | `band.jpg`, plus 768w and 1280w WebP and JPG derivatives committed to the repo | The source is 1920x1280; phones should not download it. | y |
| Loader end | Loader leaves at max(1.2s, hero image + `document.fonts.ready`), capped at 3.5s | Boot feeling without trapping anyone. | y |
| Loader repeat views | `sessionStorage` flag; later views in the same session play a ~0.4s version | Menu round-trips should not replay the full boot. | y |
| Loader when storage throws | Treat as first view (full boot) | Private modes may block `sessionStorage`; the cap still bounds the wait. | n |
| Navbar threshold | Solid once the page has scrolled more than 40px | Small enough to react immediately, large enough to ignore jitter. | n |
| Newsletter fields on the home | `EMAIL` and `COUNTRY`, the same required fields as `/newsletter/`, plus Mailchimp's honeypot | The audience requires `COUNTRY`; an email-only form would be rejected. | n |
| Country list | Moved into a shared Liquid include rendered by both `/newsletter/` and the home; `/newsletter/` output stays identical | Avoids copying ~250 `<option>` lines. | n |
| Album covers in DISC::ARCHIVE | The 3 albums, newest first, linking to `/discography/#<slug>` | Anchors already exist on the discography page. | y |
| Photos in VISUAL::FEED | The 6 `featured` photos from `_data/highlights.js`, thumbnails, linking to `/photos/` | Same curated set as the photos carousel; thumbnails keep the page light. | y |
| Tagline | `BRAZILIAN METAL // SINCE 2013` | Band active since 2013 (user). | y |
| Page language | English | Whole site is in English. | y |
| Canonical URL | `/` (unchanged) | The home layout already emits it. | y |
| Observability | `dataLayer.push` events only; no console logging | GTM is the site's only telemetry. | y |
| Auth, rate limits, concurrency, idempotency of writes, data lifecycle | N/A - static page; the only write is the Mailchimp form post, handled by Mailchimp | Nothing to authorize, throttle, serialize or expire on our side. | y |

**Open questions:** none - all resolved or logged above. Rows marked `n` are defaults chosen during Specify and are confirmed by approving this spec.

---

## User Stories

### P1: Land on the flagship ⭐ MVP

**User Story**: As a first-time visitor, I want the home to open on a striking full-screen hero that says who the band is so that I immediately know where I am and that the band is active.

**Why P1**: This is the page's identity and the frame every other section hangs on.

**Acceptance Criteria**:

1. The system SHALL render `/` with `_layouts/home.html` containing a hero section whose height is 100svh (100vh where `svh` is unsupported).
2. The system SHALL render exactly one `h1` on `/`, inside the hero, with the accessible name "Insane Driver", showing the logo image `logo_loading.png` with `alt="Insane Driver"`.
3. The system SHALL render the tagline text `BRAZILIAN METAL // SINCE 2013` inside the hero.
4. The system SHALL render the hero photo from `band.jpg` derivatives through `srcset` with 768w, 1280w and 1920w candidates in WebP and JPG, and the image SHALL NOT be lazy-loaded.
5. The system SHALL NOT include the Owl carousel markup (`#owl-demo`), the `.header-img` block, the `please-wait` script, `home.js`, `#player-sf`, `#player_spotify` or any `#player*` YouTube container on `/`.
6. The system SHALL NOT create any `iframe` element during initial page load of `/`.
7. The system SHALL render the hero overlays (scanlines, grid, glitch on the logo) as decorative layers marked `aria-hidden="true"`, stacked above the photo and below the hero text.
8. The system SHALL keep the shared menu and footer includes on `/`.

**Independent Test**: Load `/`; the hero fills the viewport, the `h1` reads "Insane Driver", the tagline is visible, and the network panel shows zero iframe requests.

---

### P1: Play the latest release ⭐ MVP

**User Story**: As a listener, I want the newest release front and centre with my platform one click away so that I can play it without searching.

**Why P1**: The home's commercial job; the site currently never mentions the latest single.

**Acceptance Criteria**:

1. The system SHALL select the latest release as the entry with the greatest `releaseDate` across `albums` and `singles` in `_data/discography.json`, preferring an album on a tie.
2. The system SHALL render, inside the hero, a latest-release card with that release's cover, title, type label (`ALBUM`, `DELUXE EDITION` or `SINGLE`) and release year.
3. The system SHALL render in that card a Spotify anchor and an Apple Music anchor pointing at the release's `links.spotify` and `links.apple`, each with `target="_blank"`, `rel="noopener"` and the `cyber-link-btn--primary` modifier.
4. IF the latest release has no URL for Spotify or Apple Music THEN the system SHALL render no anchor for that platform.
5. WHILE the viewport is narrower than 768px the system SHALL place the latest-release card inside the hero, below the heading, fully visible within the first viewport height at 375x667.
6. The system SHALL render a `NOW::STREAMING` panel for the same release containing its cover, title, the remaining platform anchors present in its data, a link to `/discography/#<slug>` when the release is an album, or `/discography/` when it is a single, and a `PREVIEW` button.
7. The system SHALL NOT create the Spotify iframe during initial page load.
8. WHEN the visitor activates `PREVIEW` THEN the system SHALL insert one Spotify embed iframe for the release into the panel's preview container and set `aria-expanded="true"` on the button.
9. WHEN the visitor activates `PREVIEW` while the preview is open THEN the system SHALL remove the iframe and set `aria-expanded="false"`.
10. IF the release has neither `spotifyId` nor a parseable `open.spotify.com/album/<id>` URL THEN the system SHALL render no `PREVIEW` button.
11. WHILE JavaScript has not run the system SHALL keep the `PREVIEW` button hidden and every platform anchor clickable.

**Independent Test**: With today's data the hero card shows Keep Away (Acoustic), 2025, with Spotify and Apple Music buttons; clicking `PREVIEW` inserts exactly one Spotify iframe and clicking again removes it.

---

### P1: Branded boot loader ⭐ MVP

**User Story**: As a visitor, I want a short cyberpunk boot sequence with the band logo while the page gets ready so that entering the site feels like an event without ever blocking me.

**Why P1**: The user explicitly wants the loading feeling back, done right.

**Acceptance Criteria**:

1. WHILE JavaScript is enabled the system SHALL show a full-screen loader overlay on `/` before first paint, containing the logo `logo_loading.png`, at least three boot-log lines in `Share Tech Mono`, and a progress bar.
2. The system SHALL NOT render the loader overlay visibly when JavaScript is disabled.
3. WHEN the loader starts on the first home view of the session THEN the system SHALL dismiss it at the later of 1.2s after start and the moment both the hero image has loaded and `document.fonts.ready` has resolved.
4. The system SHALL dismiss the loader no later than 3.5s after it starts, regardless of image or font state.
5. WHEN the home is viewed again in the same browser session THEN the system SHALL dismiss the loader within 0.4s after start.
6. IF `sessionStorage` is unavailable or throws THEN the system SHALL treat the view as the first of the session.
7. WHEN the visitor clicks the loader or presses `Esc` while it is visible THEN the system SHALL dismiss it immediately and push `{event: 'home_loader_skip'}` to `dataLayer`.
8. WHEN the loader is dismissed THEN the system SHALL remove it from the accessibility tree and from pointer hit-testing, and page content SHALL be scrollable.
9. WHILE the loader is visible the system SHALL expose it as `role="status"` with an accessible label, and the page content beneath SHALL be `inert` or `aria-hidden="true"`.
10. WHILE `prefers-reduced-motion: reduce` matches the system SHALL render the loader without the glitch, scanline and progress-bar animations and dismiss it with an opacity fade of at most 200ms.

**Independent Test**: First visit shows the boot for ~1.2-3.5s; reload in the same tab shows a ~0.4s flash; `Esc` dismisses instantly; with JS disabled the hero is visible immediately.

---

### P1: One system, one look ⭐ MVP

**User Story**: As a visitor moving between pages, I want the home to share the cyberpunk vocabulary of the rebuilt pages so that the site feels like one thing.

**Why P1**: Consistency is the premise of the refresh.

**Acceptance Criteria**:

1. The system SHALL wrap every section below the hero in a `.cyber-zone` > `.cyber-zone-inner` shell whose sections are `.cyber-panel` blocks with `.cyber-panel-tab`, `.cyber-panel-body`, a `data-hud` attribute and the `top-accent` / `corner-tl` / `corner-tr` / `corner-bl` spans.
2. The system SHALL render, in DOM order, panels tabbed `NOW::STREAMING`, `ID-TV::LATEST`, `DISC::ARCHIVE`, `VISUAL::FEED` and `SIGNAL::NEWSLETTER`.
3. The system SHALL use `Rajdhani` for panel body text and `Share Tech Mono` for HUD text, with the palette `#00f3ff`, `#005f8c`, `#ff00ea`, `#fcee0a`.
4. The system SHALL define the home's styles in `less/home.less` scoped under `#page_home`, with keyframe names prefixed `home-`.
5. The system SHALL let the zone span the full viewport width and SHALL NOT make it a scroll container (`overflow` on the zone is neither `hidden`, `auto` nor `scroll` on the y axis).
6. WHILE `prefers-reduced-motion: reduce` matches the system SHALL disable every `home-` motion animation on the page; the zero-duration loader failsafe (HOME-23 safety net, no movement) stays active.
7. WHILE the page scroll position is at most 40px the system SHALL render the navbar on `/` with a transparent background overlaying the hero.
8. WHEN the page scroll position exceeds 40px THEN the system SHALL give the navbar on `/` an opaque background.
9. The system SHALL leave the navbar on every page other than `/` unchanged.
10. The system SHALL show the page with no horizontal scroll at 375px, 768px and 1440px viewport widths.

**Independent Test**: `/` and `/discography/` screenshots share the panel vocabulary; scrolling 41px turns the navbar solid; `/band/` navbar is unchanged.

---

### P2: Discover the rest of the site

**User Story**: As a fan, I want previews of the latest video, the albums and the photos so that I can jump straight into the part of the site I care about.

**Why P2**: High value for navigation depth, but the hero and latest release are the MVP.

**Acceptance Criteria**:

1. The system SHALL render in `ID-TV::LATEST` the poster `https://i.ytimg.com/vi/<id>/hqdefault.jpg` and the title of `videos[0]`, wrapped in an anchor to `/videos/#<slug>`, with `loading="lazy"` on the image.
2. The system SHALL render in `DISC::ARCHIVE` one anchor per album in `_data/discography.json`, newest first, each with the album cover, title and year, linking to `/discography/#<slug>`.
3. The system SHALL render in `VISUAL::FEED` the thumbnails of the photos returned by `_data/highlights.js`, in that order, with their `alt` text and `loading="lazy"`, plus an anchor to `/photos/`.
4. The system SHALL render every teaser link as a plain anchor that works without JavaScript.

**Independent Test**: Clicking the video poster opens `/videos/#keep-away` with that video selected; each album cover lands on its discography card.

---

### P2: Join the newsletter from the home

**User Story**: As a fan, I want to subscribe right on the home so that I do not need an extra page to stay in touch.

**Why P2**: Conversion shortcut; `/newsletter/` already works.

**Acceptance Criteria**:

1. The system SHALL render in `SIGNAL::NEWSLETTER` a form posting to the same Mailchimp `action` URL as `/newsletter/`, with `method="post"` and `target="_blank"`.
2. The system SHALL include a required `type="email"` input named `EMAIL`, a required `select` named `COUNTRY`, Mailchimp's hidden honeypot input, and a submit button, each with an associated `label` or accessible name.
3. The system SHALL render the `COUNTRY` options from one shared include that `/newsletter/` also renders, and the `/newsletter/` form markup SHALL keep the same option values in the same order.
4. WHEN the newsletter form is submitted with valid fields THEN the system SHALL push `{event: 'home_newsletter_submit'}` to `dataLayer`.
5. IF the email field is empty or not an email THEN the browser's native validation SHALL block submission.

**Independent Test**: Submit with an empty email - blocked; with a valid email and country - a Mailchimp tab opens and `dataLayer` holds `home_newsletter_submit`.

---

### P2: Measure and share

**User Story**: As the band, I want home clicks tracked and the page to preview well when shared so that we know what converts and links look good on WhatsApp and Instagram.

**Why P2**: Business value, no visitor-facing behavior.

**Acceptance Criteria**:

1. WHEN a platform anchor on `/` is clicked THEN the system SHALL push `{event: 'home_release_click', platform: <key>, release: <slug>, placement: 'hero' | 'streaming'}` to `dataLayer`.
2. WHEN the ID-TV teaser is clicked THEN the system SHALL push `{event: 'home_teaser_click', target: 'video', slug: <slug>}`; WHEN an album cover is clicked THEN it SHALL push `{event: 'home_teaser_click', target: 'album', slug: <slug>}`; WHEN the photos link is clicked THEN it SHALL push `{event: 'home_teaser_click', target: 'photos'}`.
3. IF `window.dataLayer` is undefined THEN the system SHALL create it as an array before pushing, and the click SHALL navigate normally.
4. The system SHALL emit one `application/ld+json` script on `/` containing a schema.org `MusicGroup` with `name` "Insane Driver", `url`, `foundingDate` "2013", `genre`, `image` and a `sameAs` list of the Spotify, YouTube, Instagram, Facebook and Twitter URLs used in the footer.
5. The system SHALL emit `og:title`, `og:description`, `og:type` (`website`), `og:url`, `og:image` (absolute URL of the 1280w hero JPG) and `twitter:card` (`summary_large_image`) meta tags on `/`.

**Independent Test**: Clicking the hero Spotify button leaves `{event:'home_release_click', platform:'spotify', release:'keep-away-acoustic', placement:'hero'}` in `dataLayer`; the JSON-LD parses and validates as `MusicGroup`.

---

## Edge Cases

- IF the hero image fails to load THEN the loader SHALL still dismiss by the 3.5s cap and the hero SHALL show its dark background with text readable.
- IF `document.fonts` is unsupported THEN the loader SHALL treat fonts as ready.
- IF the Spotify embed fails to load THEN the platform anchors SHALL remain visible and clickable.
- WHEN the visitor lands on `/` with a hash or restores scroll mid-page THEN the navbar state SHALL match the scroll position on load.
- IF `_data/discography.json` has no singles THEN the latest release SHALL be the newest album.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| HOME-01 | P1: Land on the flagship - hero layout 100svh | T12 | Implemented |
| HOME-02 | P1: Land on the flagship - single `h1` with logo | T6 | Implemented |
| HOME-03 | P1: Land on the flagship - tagline | T6 | Implemented |
| HOME-04 | P1: Land on the flagship - responsive hero photo | T3, T6 | Implemented |
| HOME-05 | P1: Land on the flagship - legacy markup removed | T5, T6, T11 | Implemented |
| HOME-06 | P1: Land on the flagship - zero iframes on load | T6, T11 | Implemented |
| HOME-07 | P1: Land on the flagship - decorative overlays layering | T12 | Implemented |
| HOME-08 | P1: Land on the flagship - shared menu and footer | T5 | Implemented |
| HOME-09 | P1: Play the latest release - selection rule | T1, T2 | Implemented |
| HOME-10 | P1: Play the latest release - hero card content | T2, T6 | Implemented |
| HOME-11 | P1: Play the latest release - primary platform anchors | T6, T14 | Implemented |
| HOME-12 | P1: Play the latest release - missing platform omitted | T6 | Implemented |
| HOME-13 | P1: Play the latest release - card above the fold on mobile | T12 | Implemented |
| HOME-14 | P1: Play the latest release - NOW::STREAMING panel | T2, T7 | Implemented |
| HOME-15 | P1: Play the latest release - no iframe before PREVIEW | T19 | Implemented |
| HOME-16 | P1: Play the latest release - PREVIEW opens | T19 | Implemented |
| HOME-17 | P1: Play the latest release - PREVIEW closes | T19 | Implemented |
| HOME-18 | P1: Play the latest release - no PREVIEW without id | T1, T7 | Implemented |
| HOME-19 | P1: Play the latest release - no-JS behavior | T7, T19 | Implemented |
| HOME-20 | P1: Branded boot loader - overlay content | T5, T15 | Implemented |
| HOME-21 | P1: Branded boot loader - absent without JS | T5, T15 | Implemented |
| HOME-22 | P1: Branded boot loader - first-view dismissal timing | T1, T17 | Implemented |
| HOME-23 | P1: Branded boot loader - 3.5s cap | T1, T17 | Implemented |
| HOME-24 | P1: Branded boot loader - repeat-view 0.4s | T1, T17 | Verified (user-approved fix, round 4) |
| HOME-25 | P1: Branded boot loader - storage failure | T1, T17 | Implemented |
| HOME-26 | P1: Branded boot loader - skip by click/Esc | T1, T17 | Implemented |
| HOME-27 | P1: Branded boot loader - released after dismiss | T17 | Verified (user-approved fix, round 4) |
| HOME-28 | P1: Branded boot loader - accessibility while visible | T17 | Verified (user-approved fix, round 4) |
| HOME-29 | P1: Branded boot loader - reduced motion | T15 | Implemented |
| HOME-30 | P1: One system, one look - cyber panel shell | T7, T13 | Implemented |
| HOME-31 | P1: One system, one look - panel order | T9 | Implemented |
| HOME-32 | P1: One system, one look - fonts and palette | T12, T13, T14 | Implemented |
| HOME-33 | P1: One system, one look - scoped LESS, `home-` keyframes | T12 | Implemented |
| HOME-34 | P1: One system, one look - full width, not a scroll container | T13 | Implemented |
| HOME-35 | P1: One system, one look - reduced motion page-wide | T12, T13 | Implemented |
| HOME-36 | P1: One system, one look - transparent navbar at top | T1, T16, T18 | Implemented |
| HOME-37 | P1: One system, one look - solid navbar after 40px | T1, T16, T18 | Implemented |
| HOME-38 | P1: One system, one look - other pages' navbar unchanged | T16 | Implemented |
| HOME-39 | P1: One system, one look - no horizontal scroll | T13 | Implemented |
| HOME-40 | P2: Discover - ID-TV teaser | T8 | Implemented |
| HOME-41 | P2: Discover - album covers | T8 | Implemented |
| HOME-42 | P2: Discover - photo feed | T8 | Implemented |
| HOME-43 | P2: Discover - plain anchors | T8 | Implemented |
| HOME-44 | P2: Newsletter - form action | T9 | Implemented |
| HOME-45 | P2: Newsletter - fields | T9 | Implemented |
| HOME-46 | P2: Newsletter - shared country include | T4, T9 | Implemented |
| HOME-47 | P2: Newsletter - submit event | T1, T20 | Implemented |
| HOME-48 | P2: Newsletter - native validation | T9 | Implemented |
| HOME-49 | P2: Measure and share - release click event | T1, T20 | Implemented |
| HOME-50 | P2: Measure and share - teaser click events | T1, T20 | Implemented |
| HOME-51 | P2: Measure and share - missing dataLayer | T20 | Implemented |
| HOME-52 | P2: Measure and share - MusicGroup JSON-LD | T10 | Implemented |
| HOME-53 | P2: Measure and share - Open Graph and Twitter card | T5 | Implemented |

**Coverage:** 53 total, 0 mapped to tasks, 53 unmapped (Design pending).

---

## Success Criteria

- [ ] Zero iframes on the initial load of `/` (was six).
- [ ] The loader never stays visible longer than 3.5s.
- [ ] The latest release reaches Spotify or Apple Music in one click from the first viewport on a 375x667 phone.
- [ ] All `.e2e.cjs` and `.test.cjs` suites pass, including the existing ones for band, discography, photos and videos.
- [ ] `/newsletter/` form options are unchanged after the country-list extraction.
