# Perf PageSpeed 2 Specification

## Problem Statement

After `perf-pagespeed` (PR #46), PageSpeed still flags the home. Images are oversized: the 600×600 covers are shown at 74–328 px, the gallery thumbnails and both logos are JPEG/PNG only. `core.min.css` and `home.min.css` block the first render for ~800 ms. The fonts are found only after `core.min.css` arrives. The hero preload has no `fetchpriority`. `home.js:137` forces a reflow on init.

## Goals

- [ ] Home Lighthouse 12.6 performance ≥ 90 mobile and ≥ 98 desktop, run locally against production after deploy
- [ ] PageSpeed's "improve image delivery" saving on the home drops below 100 KiB (was 449 KiB)
- [ ] No intentional visual change on any page

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| Cache TTL (`max-age=600`) | Fixed by GitHub Pages; needs a CDN in front, not code (grilling Q2) |
| Facebook Pixel "legacy JavaScript" | Third-party `fbevents.js`; Meta ships no modern build; the Pixel keeps its current deferred loading (Q3 = a) |
| YouTube thumbnail (`hqdefault.jpg`) | The flagged 6 KiB are the letterbox bars; `mqdefault` is too small at high DPR (Q9) |
| Critical CSS extraction / async `core.min.css` | Only if the goal is missed after this round (Q7) |
| Font preloads on non-home pages | Q8: home only |
| Lighthouse as a CI gate | Production-only and noisy; checked by hand after deploy |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --------------------- | -------------- | --------- | ---------- |
| Cover widths | WebP 160, 320 and 600 px (600 = native), quality 78 | Q4 | y |
| Cover file names | `<cover>-160.webp`, `<cover>-320.webp`, and the existing `<cover>.webp` as the 600 w file | Keeps the current 600 w URLs (and anything linking them) valid | y |
| Loader logo width | WebP at the native 300 px, not ~400 px | The PNG source is only 300 × 204; upscaling adds bytes and no detail. Supersedes the ~400 w figure from Q6 (L-004) | y |
| Footer logo widths | WebP 300 and 600 px with `srcset`; `sizes` follows the footer CSS (150 px below 769 px, 30 % of the footer column above) | 300 w alone blurs the 30 %-wide desktop logo; supersedes the "~300 w" from Q6 | y |
| Gallery thumbnails | WebP at native size (285 px wide), one `<source>` per `<picture>`, JPEG `<img>` kept | Q5: the format accounts for ~80 % of the flagged saving | y |
| Thumbnail scope | Every `thumbnail` in `_data/photos.json`, used on `/` and `/photos/` | Q5 = b | y |
| CSS inlining | Home inlines `home.min.css` in a `<style>` in `<head>`; `core.min.css` stays a blocking `<link>` | Q7 = a | y |
| Inlined CSS URLs | `url(../…)` in the inlined CSS is rewritten to root-absolute `/assets/…` | Inlined at `/`, relative URLs would resolve against the page instead of `/assets/css/` | y |
| Font preloads | Home only: `rajdhani-500`, `rajdhani-700`, `share-tech-mono-400` woff2 with `crossorigin` | Q8; these are the three fonts in the critical chain | y |
| Logo mask in `home.less` | `mask` / `-webkit-mask` use `image-set()` with WebP first and the PNG fallback | Q6 | y |
| Visual parity check | Existing Playwright theme/style suites stay green; no screenshot diffing | Same as round 1 | y |
| Measurement | `npx lighthouse@12.6.0 --only-categories=performance`, mobile default and `--preset=desktop`, against production | Same as round 1 | y |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Covers sized for where they are shown ⭐ MVP

**User Story**: As a visitor on a phone, I want each album cover downloaded at about the size it is drawn so that the home loads less data.

**Why P1**: The covers account for ~260 KiB of the 449 KiB image saving.

**Acceptance Criteria**:

1. `npm run images` SHALL generate, for every home cover, `<cover>-160.webp` (160 px wide), `<cover>-320.webp` (320 px wide) and `<cover>.webp` (600 px wide).  <!-- PS2-01 -->
2. Every cover `<source>` on the built home (release card, NOW::STREAMING, archive) SHALL carry a `srcset` listing the three files with `160w`, `320w` and `600w` descriptors and a non-empty `sizes`.  <!-- PS2-02 -->
3. WHEN the home is rendered in Chromium at 412 × 915 CSS px and DPR 1.75 THEN the release card and archive covers SHALL NOT fetch any 600 w cover.  <!-- PS2-03 -->
4. WHEN `home.js` swaps the NOW::STREAMING single THEN the system SHALL set the `<source>` `srcset` to the new cover's three widths with the same descriptors.  <!-- PS2-04 -->
5. IF a cover variant listed in the manifest is missing or has the wrong width THEN the images unit test SHALL fail.  <!-- PS2-05 -->

**Independent Test**: Run `npm run images`, build, inspect the home `<source>` tags; load the home at the phone viewport in Playwright and list the fetched cover URLs.

---

### P1: Gallery thumbnails in WebP ⭐ MVP

**User Story**: As a visitor, I want gallery thumbnails in a modern format so that the home and `/photos/` load less data.

**Why P1**: ~110 KiB of the home saving, more on `/photos/`.

**Acceptance Criteria**:

1. `npm run images` SHALL generate a WebP with the same pixel size next to every `thumbnail` file referenced in `_data/photos.json` (`tn_X.jpg` → `tn_X.webp`).  <!-- PS2-06 -->
2. Every thumbnail `<img>` on the built `/` and `/photos/` SHALL sit in a `<picture>` whose `<source type="image/webp">` points to that WebP, with the JPEG kept as the `<img src>`.  <!-- PS2-07 -->
3. WHEN `/photos/` is loaded in Chromium THEN the grid thumbnails SHALL be fetched as `.webp` and no `tn_*.jpg` SHALL be requested.  <!-- PS2-08 -->

**Independent Test**: Build, grep the two pages; load `/photos/` in Playwright and inspect requests.

---

### P1: Logos in WebP ⭐ MVP

**User Story**: As a visitor, I want the band logos in WebP so that every page downloads fewer bytes for them.

**Why P1**: The two PNGs are fetched on every page (footer) and three times on the home (loader, hero title, CSS mask).

**Acceptance Criteria**:

1. `npm run images` SHALL generate `logo_loading.webp` (300 px wide), `logo_horizontal-300.webp` (300 px wide) and `logo_horizontal-600.webp` (600 px wide), keeping the alpha channel.  <!-- PS2-09 -->
2. The loader and hero-title logos on the built home SHALL render as `<picture>` with a `logo_loading.webp` `<source>` and the PNG as the `<img src>`.  <!-- PS2-10 -->
3. The footer logo on every layout page SHALL render as `<picture>` with a WebP `<source srcset>` of the 300 w and 600 w files, a `sizes` attribute, and the PNG as the `<img src>`.  <!-- PS2-11 -->
4. Every `mask` / `-webkit-mask` that uses `logo_loading` in the emitted `home.min.css` SHALL use `image-set()` listing `logo_loading.webp` before `logo_loading.png`.  <!-- PS2-12 -->
5. WHEN the home is loaded in Chromium THEN the system SHALL NOT request `logo_loading.png` or `logo_horizontal.png`.  <!-- PS2-13 -->

**Independent Test**: Build, grep the markup and `home.min.css`; load `/` in Playwright and list the image requests.

---

### P1: Home first render not blocked by its page CSS ⭐ MVP

**User Story**: As a first-time home visitor, I want the first paint to wait on as few requests as possible so that the loader and hero show sooner.

**Why P1**: The two stylesheets add ~930 ms of render blocking.

**Acceptance Criteria**:

1. The built home SHALL contain the full emitted `home.min.css` in a `<style>` element inside `<head>`, and SHALL NOT link `/assets/css/home.min.css`.  <!-- PS2-14 -->
2. The inlined home CSS SHALL NOT contain `url(` values starting with `../`; every such value SHALL resolve to the same `/assets/…` file as in the external stylesheet.  <!-- PS2-15 -->
3. Every other layout page with a page bundle SHALL keep linking it with `<link rel="stylesheet">`.  <!-- PS2-16 -->
4. The built home SHALL preload `/assets/fonts/rajdhani-500.woff2`, `/assets/fonts/rajdhani-700.woff2` and `/assets/fonts/share-tech-mono-400.woff2` with `as="font"`, `type="font/woff2"` and `crossorigin`.  <!-- PS2-17 -->
5. Pages other than the home SHALL NOT preload those three fonts.  <!-- PS2-18 -->
6. The home hero image preload SHALL carry `fetchpriority="high"`.  <!-- PS2-19 -->
7. IF `home.min.css` is missing when the site builds THEN the build SHALL fail with an error naming the file.  <!-- PS2-20 -->

**Independent Test**: Build and inspect `docs/index.html`; run the existing home style suites green against the inlined CSS.

---

### P2: No forced reflow from the navbar on init

**User Story**: As a visitor, I want home scripts not to force layout on startup so that the main thread stays free.

**Why P2**: 39 ms of forced reflow; reported outside the score.

**Acceptance Criteria**:

1. WHEN `home.js` initialises the navbar THEN the system SHALL read the scroll offset inside a `requestAnimationFrame` callback, not synchronously during init.  <!-- PS2-21 -->
2. WHEN the home loads with the page already scrolled past `core.navIsSolid`'s threshold THEN `nav.navbar` SHALL carry `is-solid` by the first frame after init.  <!-- PS2-22 -->

**Independent Test**: Existing `navbar.e2e.cjs` plus a check that `pageYOffset` is not read before the first animation frame.

---

## Edge Cases

- IF a cover in `_data` has no `-160`/`-320` variant THEN the images unit test SHALL fail (PS2-05).
- IF a browser does not support WebP THEN it SHALL load the JPEG/PNG `<img src>` (covered by the `<picture>` structure, PS2-07/10/11).
- IF a browser does not support `image-set()` in `mask` THEN the PNG mask SHALL apply. The plain `url()` declaration is kept before the `image-set()` one (PS2-12).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| PS2-01 | P1: Covers | Tasks | Implementing |
| PS2-02 | P1: Covers | Tasks | Implementing |
| PS2-03 | P1: Covers | Tasks | Implementing |
| PS2-04 | P1: Covers | Tasks | Implementing |
| PS2-05 | P1: Covers | Tasks | Implementing |
| PS2-06 | P1: Thumbnails | Tasks | Implementing |
| PS2-07 | P1: Thumbnails | Tasks | Pending |
| PS2-08 | P1: Thumbnails | Tasks | Pending |
| PS2-09 | P1: Logos | Tasks | Implementing |
| PS2-10 | P1: Logos | Tasks | Pending |
| PS2-11 | P1: Logos | Tasks | Pending |
| PS2-12 | P1: Logos | Tasks | Pending |
| PS2-13 | P1: Logos | Tasks | Pending |
| PS2-14 | P1: Home CSS | Tasks | Pending |
| PS2-15 | P1: Home CSS | Tasks | Pending |
| PS2-16 | P1: Home CSS | Tasks | Pending |
| PS2-17 | P1: Home CSS | Tasks | Pending |
| PS2-18 | P1: Home CSS | Tasks | Pending |
| PS2-19 | P1: Home CSS | Tasks | Pending |
| PS2-20 | P1: Home CSS | Tasks | Pending |
| PS2-21 | P2: Reflow | Tasks | Pending |
| PS2-22 | P2: Reflow | Tasks | Pending |

**Coverage:** 22 total, 0 mapped to tasks, 22 unmapped ⚠️

---

## Success Criteria

- [ ] Home Lighthouse 12.6 performance ≥ 90 mobile and ≥ 98 desktop (production, after deploy)
- [ ] The "improve image delivery" saving on the home is below 100 KiB
- [ ] `npm test` passes
