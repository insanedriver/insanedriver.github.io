# Perf PageSpeed Specification

## Problem Statement

Lighthouse 12.6 (mobile, 2026-10-19) scores the home 56 (LCP 9.4 s) and `/band/` 48 (LCP 11.0 s); desktop is 97 and 93. The same causes appear on both pages: a 461 KB render-blocking `style.min.css`, render-blocking Google Fonts, fonts without `font-display`, ~600 ms of main-thread time from GTM, the Facebook Pixel and the dead Universal Analytics tag, jQuery/Bootstrap/Owl loaded without `defer`, and JPEG-only images without `srcset` or dimensions. On the home, the boot loader adds up to 4 s of render delay over an already-loaded hero.

## Goals

- [ ] `/band/` Lighthouse performance ≥ 80 mobile and ≥ 98 desktop
- [ ] Home Lighthouse performance ≥ 75 mobile and ≥ 98 desktop
- [ ] Every page on `base.html` and `home.html` ships the shared improvements (CSS, fonts, trackers, JS, images) with no intentional visual change outside the home loader timing

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| `/band` → `/band/` redirect | GitHub Pages behavior; internal links and the sitemap already use the trailing slash |
| Cache TTL (`max-age=600`) | Fixed by GitHub Pages; needs a CDN in front, not code |
| `dates/index.html` | Legacy static HTML outside the layouts |
| Critical CSS inlining | Second round, only if the goals are missed |
| Font Awesome subsetting | Declined (Q7): no subset tooling |
| Removing the home loader or changing its look | Q5 keeps the loader; only its timing changes |
| Partytown / worker-hosted trackers | Declined (Q2) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Measurement method | Local `npx lighthouse@12.6.0`, `--only-categories=performance`, mobile default and `--preset=desktop`, against the deployed URL | PageSpeed API quota was exhausted; same engine | y |
| Goal scores vs. CI gate | Scores are success criteria checked after deploy, not a test gate | Lighthouse runs against production and varies run to run | y |
| Tracker trigger | After `load`, in `requestIdleCallback` (2 s timeout; `setTimeout` 2 s fallback without it), or on the first `pointerdown`/`keydown`/`scroll`/`touchstart`, whichever comes first, at most once | Q10 = b | y |
| Loader timings | min 600 ms, max 1500 ms, CSS/inline failsafe 2000 ms, repeat 400 ms | Q9 | y |
| jQuery on `spotify-select-playlist` | Keeps jQuery; drops Bootstrap JS and Owl | Its script uses `$` | y |
| Image tooling | `sharp` devDependency, `npm run images`, outputs committed | Q11 = a | y |
| Header image widths | 768 / 1280 / 1920 WebP, JPEG kept as the `<img>` fallback | Matches the home hero pipeline | y |
| Self-hosted Google fonts | Rajdhani 500/600/700 and Share Tech Mono 400, `latin` subset, woff2 under `/assets/fonts/` | Q12 | y |
| Preloads | Only fonts used above the fold on every page are preloaded; Glyphicons and Mars-Mission are not | Q7 | y |
| Per-page CSS | `core.css` on every page plus one page bundle selected in front matter | Q4 = a | y |
| Pages without a page bundle | Get `core.css` only | Pages that need no page-specific CSS | y |
| Visual parity check | Existing Playwright theme/style suites stay green; no screenshot diffing added | They already pin computed styles of the cyber themes | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Trackers stop blocking the first render ⭐ MVP

**User Story**: As a visitor on a phone, I want analytics to load after the page is usable so that the content paints sooner.

**Why P1**: Third-party scripts are the biggest main-thread cost on both pages.

**Acceptance Criteria**:

1. The built HTML of every page SHALL NOT reference `google-analytics.com/analytics.js` or `UA-60390716-1`.  <!-- PERF-01 -->
2. WHEN a page has parsed THEN the system SHALL NOT request `googletagmanager.com/gtm.js` or `connect.facebook.net/en_US/fbevents.js` before the window `load` event.  <!-- PERF-02 -->
3. WHEN the window `load` event has fired and the browser is idle (or 2 s have passed) THEN the system SHALL request `gtm.js?id=GTM-WW9HZGP` and `fbevents.js` exactly once each.  <!-- PERF-03 -->
4. WHEN the first `pointerdown`, `keydown`, `scroll` or `touchstart` happens before that THEN the system SHALL request both scripts at that moment, and SHALL NOT request them again later.  <!-- PERF-04 -->
5. The system SHALL queue `fbq('init', '379421529852933')` and `fbq('track', 'PageView')` and the `gtm.start` dataLayer entry at parse time, so they are sent once the scripts load.  <!-- PERF-05 -->
6. The built HTML SHALL keep the GTM `<noscript>` iframe and the Pixel `<noscript>` image.  <!-- PERF-06 -->

**Independent Test**: Load `/band/` in Playwright with tracker hosts routed; assert no tracker request before `load`, one of each after, and the queued `PageView`.

---

### P1: No jQuery, Bootstrap JS or Owl on layout pages ⭐ MVP

**User Story**: As a visitor, I want only the JavaScript the page uses so that the page becomes interactive sooner.

**Why P1**: ~150 KB of unused script runs on every page.

**Acceptance Criteria**:

1. The built HTML of every page on `base.html` or `home.html`, except `/pre-save/spotify-select-playlist/`, SHALL NOT reference `jquery.min.js`, `bootstrap.min.js`, `owl.carousel.min.js` or `insane.js`.  <!-- PERF-07 -->
2. The built HTML of `/pre-save/spotify-select-playlist/` SHALL reference `jquery.min.js` and SHALL NOT reference `bootstrap.min.js` or `owl.carousel.min.js`.  <!-- PERF-08 -->
3. WHILE the viewport is narrower than 768 px, WHEN the visitor activates the `.navbar-toggle` button THEN the system SHALL show `#navbar` and set the button's `aria-expanded` to `true`.  <!-- PERF-09 -->
4. WHILE `#navbar` is open on a viewport narrower than 768 px, WHEN the visitor activates `.navbar-toggle` again THEN the system SHALL hide `#navbar` and set `aria-expanded` to `false`.  <!-- PERF-10 -->
5. Every local `<script src>` in the built HTML of layout pages SHALL carry `defer` or `async`.  <!-- PERF-11 -->
6. IF a page script throws THEN the menu toggle SHALL still work.  <!-- PERF-12 -->

**Independent Test**: Build, grep `docs/**/*.html` for the removed scripts; drive the mobile menu on `/band/` and `/` in Playwright.

---

### P1: Split, smaller CSS ⭐ MVP

**User Story**: As a visitor, I want each page to download only its own CSS so that the first render is not blocked by other pages' styles.

**Why P1**: The 461 KB stylesheet is the largest render-blocking resource on both pages.

**Acceptance Criteria**:

1. The build SHALL emit `/assets/css/core.min.css` containing the shared styles (Bootstrap, Font Awesome, font faces, typography, general, header, footer) and no rules from `owl.less`, `blog.less`, Glyphicons or any `#page_<id>` block.  <!-- PERF-13 -->
2. The build SHALL emit one page bundle per page area (`home`, `band`, `discography`, `photos`, `pre-save`, `contact`, `videos`, `store`, `newsletter`) under `/assets/css/`, each holding only that area's `#page_<id>` styles (plus PhotoSwipe in `photos`).  <!-- PERF-14 -->
3. The built HTML of every layout page SHALL link `core.min.css` plus at most one page bundle, and SHALL NOT link `style.min.css`.  <!-- PERF-15 -->
4. The built HTML of `/` SHALL link the `home` bundle and the built HTML of `/band/` SHALL link the `band` bundle.  <!-- PERF-16 -->
5. `core.min.css` SHALL be at most 200 KB uncompressed.  <!-- PERF-17 -->
6. The CSS files SHALL be minified (no comments, no indentation).  <!-- PERF-18 -->

**Independent Test**: Build and check sizes and `<link>` tags; run the existing theme/style Playwright suites green.

---

### P1: Fonts that do not block or hide text ⭐ MVP

**User Story**: As a visitor, I want text to render with a fallback while web fonts load so that I see content immediately.

**Why P1**: Google Fonts is render-blocking and three `@font-face` rules lack `font-display`.

**Acceptance Criteria**:

1. Every `@font-face` rule in the emitted CSS SHALL declare `font-display: swap`.  <!-- PERF-19 -->
2. The built HTML SHALL NOT reference `fonts.googleapis.com` or `fonts.gstatic.com`.  <!-- PERF-20 -->
3. The site SHALL serve Rajdhani 500, 600, 700 and Share Tech Mono 400 as woff2 from `/assets/fonts/`, and the computed `font-family` of elements styled with them SHALL keep resolving to those families.  <!-- PERF-21 -->
4. The `SiliconFont` face SHALL load from a woff2 file, with the `.ttf` kept only as a second `src`.  <!-- PERF-22 -->
5. The emitted CSS and built HTML SHALL NOT reference `glyphicons-halflings-regular` files, and the footer back-to-top link SHALL use `fa fa-chevron-up`.  <!-- PERF-23 -->
6. The built HTML SHALL NOT preload `glyphicons-halflings-regular.woff2` or `Mars-Mission.ttf`.  <!-- PERF-24 -->

**Independent Test**: Grep emitted CSS and HTML; Playwright asserts `document.fonts` has Rajdhani/Share Tech Mono loaded from same-origin URLs.

---

### P1: Responsive, modern images ⭐ MVP

**User Story**: As a visitor on a phone, I want images sized for my screen in a modern format so that the page loads less data.

**Why P1**: Image savings are ~360 KB on `/band/` and ~165 KB on the home.

**Acceptance Criteria**:

1. `npm run images` SHALL generate, from the source JPEG/PNG, WebP variants for every `header_N.jpg` (768/1280/1920 w), `bodybg.jpg`, `footer.jpg`, `band.jpg` and the release covers shown on the home, and SHALL be idempotent (re-running produces byte-identical files).  <!-- PERF-25 -->
2. The `base.html` header image SHALL render as `<picture>` with a WebP `<source srcset>` of the three widths, a JPEG `<img>` fallback, `width`, `height`, `sizes="100vw"`, `fetchpriority="high"` and no `loading="lazy"`.  <!-- PERF-26 -->
3. The `#content` background and the footer background SHALL use WebP via `image-set()` with the JPEG as fallback.  <!-- PERF-27 -->
4. `band.jpg` on `/band/` SHALL render as `<picture>` with a WebP source, `width`, `height`, `loading="lazy"` and `decoding="async"`.  <!-- PERF-28 -->
5. The release covers on the home SHALL be served as WebP with `width`, `height` and `loading="lazy"`.  <!-- PERF-29 -->
6. Every `<img>` in the built HTML of `/` and `/band/` SHALL have `width` and `height` attributes.  <!-- PERF-30 -->
7. IF a WebP variant is missing for an image referenced by these rules THEN the unit test SHALL fail.  <!-- PERF-31 -->

**Independent Test**: Run `npm run images` twice and diff; build and inspect `/band/` markup; Playwright confirms the WebP source is the one fetched in Chromium.

---

### P2: Faster home loader

**User Story**: As a first-time home visitor, I want the boot loader to leave quickly so that I reach the content without waiting.

**Why P2**: The loader's 4 s worst case dominates home LCP, but the loader is a deliberate brand moment.

**Acceptance Criteria**:

1. On a first view, the loader SHALL be dismissed no sooner than 600 ms after it started.  <!-- PERF-32 -->
2. On a first view, WHEN the hero image and fonts are ready after 600 ms THEN the loader SHALL be dismissed at that moment.  <!-- PERF-33 -->
3. On a first view, IF readiness has not happened by 1500 ms THEN the loader SHALL be dismissed at 1500 ms.  <!-- PERF-34 -->
4. IF `home.js` never runs THEN the CSS failsafe and the inline body script SHALL release the page at 2000 ms.  <!-- PERF-35 -->
5. On a repeat view in the same session, the loader SHALL be dismissed at 400 ms.  <!-- PERF-36 -->

**Independent Test**: Existing `tests/home/loader*.e2e.cjs` and `home-core.test.cjs` updated to the new bounds.

---

### P3: Regression guard

**User Story**: As the maintainer, I want tests that fail if the removed weight comes back so that the gains stick.

**Why P3**: Prevents silent regressions; the gains themselves are P1.

**Acceptance Criteria**:

1. The unit suite SHALL fail if any built layout page references a removed script (PERF-01, PERF-07), `style.min.css`, Google Fonts, or Glyphicons.  <!-- PERF-37 -->
2. The unit suite SHALL fail if `core.min.css` exceeds 200 KB.  <!-- PERF-38 -->

---

## Edge Cases

- IF `requestIdleCallback` is unavailable THEN the system SHALL load the trackers 2 s after `load`.  <!-- PERF-39 -->
- IF the visitor interacts and the `load` event fires afterwards THEN the system SHALL NOT load the trackers a second time.  (covered by PERF-04)
- IF the browser does not support WebP THEN the `<img>` and `image-set()` JPEG fallback SHALL be used.  (covered by PERF-26/27)
- WHEN the viewport is 768 px or wider THEN `#navbar` SHALL be visible regardless of the toggle state.  <!-- PERF-40 -->

### Implicit-requirement dimensions sweep

| Dimension | Resolution |
| --------- | ---------- |
| Input validation & bounds | N/A because there is no user input; size bound in PERF-17 |
| Failure / partial-failure states | PERF-12 (menu survives script errors), PERF-35 (loader failsafe), PERF-31 (missing variant) |
| Idempotency / retry / duplicate handling | PERF-04 (trackers load once), PERF-25 (image generation is idempotent) |
| Auth boundaries & rate limits | N/A because the site is static and public |
| Concurrency / ordering | PERF-05 (events queued before scripts load), PERF-04 (interaction vs. idle race) |
| Data lifecycle / expiry | N/A because cache TTL is fixed by GitHub Pages (Out of Scope) |
| Observability | PERF-03/05: PageView and GTM still fire; analytics loss limited to sub-2 s bounces (accepted in Q2) |
| External-dependency failure | PERF-39 (no `requestIdleCallback`); tracker hosts failing to load do not affect the page because they load after `load` |
| State-transition integrity | PERF-09/10/40 (menu open/closed), PERF-32..36 (loader) |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| PERF-01 | P1: Trackers | Design | Pending |
| PERF-02 | P1: Trackers | Design | Pending |
| PERF-03 | P1: Trackers | Design | Pending |
| PERF-04 | P1: Trackers | Design | Pending |
| PERF-05 | P1: Trackers | Design | Pending |
| PERF-06 | P1: Trackers | Design | Pending |
| PERF-07 | P1: JS | Design | Pending |
| PERF-08 | P1: JS | Design | Pending |
| PERF-09 | P1: JS | Design | Pending |
| PERF-10 | P1: JS | Design | Pending |
| PERF-11 | P1: JS | Design | Pending |
| PERF-12 | P1: JS | Design | Pending |
| PERF-13 | P1: CSS | Design | Pending |
| PERF-14 | P1: CSS | Design | Pending |
| PERF-15 | P1: CSS | Design | Pending |
| PERF-16 | P1: CSS | Design | Pending |
| PERF-17 | P1: CSS | Design | Pending |
| PERF-18 | P1: CSS | Design | Pending |
| PERF-19 | P1: Fonts | Design | Pending |
| PERF-20 | P1: Fonts | Design | Pending |
| PERF-21 | P1: Fonts | Design | Pending |
| PERF-22 | P1: Fonts | Design | Pending |
| PERF-23 | P1: Fonts | Design | Pending |
| PERF-24 | P1: Fonts | Design | Pending |
| PERF-25 | P1: Images | Design | Pending |
| PERF-26 | P1: Images | Design | Pending |
| PERF-27 | P1: Images | Design | Pending |
| PERF-28 | P1: Images | Design | Pending |
| PERF-29 | P1: Images | Design | Pending |
| PERF-30 | P1: Images | Design | Pending |
| PERF-31 | P1: Images | Design | Pending |
| PERF-32 | P2: Loader | Design | Pending |
| PERF-33 | P2: Loader | Design | Pending |
| PERF-34 | P2: Loader | Design | Pending |
| PERF-35 | P2: Loader | Design | Pending |
| PERF-36 | P2: Loader | Design | Pending |
| PERF-37 | P3: Guard | Design | Pending |
| PERF-38 | P3: Guard | Design | Pending |
| PERF-39 | P1: Trackers (edge) | Design | Pending |
| PERF-40 | P1: JS (edge) | Design | Pending |

**Coverage:** 40 total, 0 mapped to tasks, 40 unmapped ⚠️ (mapped in Tasks)

---

## Success Criteria

- [ ] `/band/` Lighthouse performance ≥ 80 mobile, ≥ 98 desktop (post-deploy, local Lighthouse 12.6)
- [ ] Home Lighthouse performance ≥ 75 mobile, ≥ 98 desktop (post-deploy)
- [ ] `npm test` green (unit + Playwright), with the loader suites updated to the new bounds only
- [ ] Baseline for comparison: home 56/97, `/band/` 48/93 (2026-10-19)
