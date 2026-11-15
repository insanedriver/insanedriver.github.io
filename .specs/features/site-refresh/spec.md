# Site refresh (incremental improvements)

## Problem Statement

The user rejected a full redesign (three Stitch Home directions, 2026-11-15) and chose small improvements to the current cyberpunk site instead. A 390px/1440px audit of the 11 active pages found: hard-to-read monospace body copy, a footer outside the theme, a Twitter bird icon after the rebrand to X, a late charset declaration, a legacy Dates page whose Bandsintown widget is blocked as mixed content in production, stacked full-width button lists on mobile Band/Release pages, and no press kit for booking/press contacts.

## Goals

- [ ] Body copy on Band, Contact and Newsletter is readable (body font, left-aligned, ≥16px, ≥4.5:1 contrast).
- [ ] Footer, Dates and the new Press page match the current theme, each approved as a Stitch variation before implementation.
- [ ] Dates shows Bandsintown events in production again.
- [ ] Band and Release mobile button lists are compact grids.

## Out of Scope

| Feature | Reason |
| --- | --- |
| New visual direction / redesign | Rejected by user; see Problem Statement |
| Astro or other stack migration | No redesign, so no rewrite justification (decision 2026-11-15) |
| Eleventy 0.12 → 3.x upgrade | Separate follow-up feature |
| Inner page header height (G3), Photos 2-col archive, Home duplicate release cards, Contact enrichment beyond the Press link, Discography cover check | Second round, per user choice |
| Build leak of `/.agent/`, `/.gemini/`, `/less/README/` | Stale local `docs/` files only; production returns 404 |
| Dates and Press in the header menu | Both stay out of the menu (decision below) |
| Rider / stage plot | No such files exist in the repo |
| Push, PR, merge, deploy | Each needs its own explicit go-ahead |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Scope | G1 readability, G2 footer, G4 X icon, G5 charset, Dates, Band mobile grid, Release mobile grid, Press/EPK | User accepted recommendation after audit | y |
| Stitch role | Upload current-page screenshots and make light edits for Footer, Dates and Press; small fixes go straight to code with before/after screenshots | User accepted recommendation | y |
| Dates in menu | Stays out of header/footer menu; keeps URL and sitemap entry | No shows known; an empty dates page in the menu reads as an inactive band. One-line change to revert | y, default when user deferred |
| Press in menu | Not in header menu; linked from footer ("Press kit") and Contact | EPK is sent to bookers/press, not browsed by fans | y |
| Short / long bio | Short = first two Band bio paragraphs; long = all Band bio paragraphs including the quote | Only one bio exists; single source avoids drift | y, agent default |
| Press photos | `_data/photos.json` entries with `category: PROMO` from the 2020 shoot, linking to the full-resolution `src` | Highest-resolution official photos available | y, agent default |
| Logos | `assets/images/logo_horizontal.png` and `assets/images/logo_loading.png` | Only logo files in the repo | y, fact |
| Highlights | From existing data: origin (São Paulo, Brazil), active since 2013, album and single counts from `_data/discography.json`, "for fans of" line from Band page | No invented claims | y, agent default |
| Copy on new pages | English, written from existing site copy | English only | y |
| Readability targets | Paragraph text: Rajdhani, left-aligned, ≥16px computed size at 390px, contrast ≥4.5:1 against its panel background | WCAG AA body text | y, agent default |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Readable body copy ⭐ MVP

**User Story**: As a visitor, I want long text to be easy to read on my phone.

**Acceptance Criteria**:

1. **REF-01** — The Band bio paragraphs, Contact panel paragraphs and Newsletter description paragraphs SHALL compute `font-family` starting with `Rajdhani` and `text-align: left` at 390px and 1440px.
2. **REF-02** — WHILE the viewport is 390px wide those paragraphs SHALL compute a font size of at least 16px.
3. **REF-03** — Those paragraphs SHALL have a text/background contrast ratio of at least 4.5:1.
4. **REF-04** — Elements marked `data-hud` and panel tab labels SHALL keep their current monospace font.

**Independent Test**: Playwright reads computed styles of the listed paragraphs at both widths.

### P1: Themed footer with X icon ⭐ MVP

**User Story**: As a visitor, I want the footer to look like the rest of the site and point to current profiles.

**Acceptance Criteria**:

1. **REF-05** — WHEN the user approves the Stitch footer variation THEN the footer partial SHALL implement that approved layout on every page using the base layout.
2. **REF-06** — The footer SHALL render its navigation as a list of links with the same destinations as the header menu, plus a "Press kit" link to `/press/`, and SHALL contain no `|` separator characters.
3. **REF-07** — WHILE the viewport is 390px wide each footer link and icon SHALL have a hit area of at least 44×44px.
4. **REF-08** — The header and footer SHALL show the X logo for `https://twitter.com/insanedriverid` with the accessible name `Insane Driver on X`, and SHALL NOT render the `fa-twitter` bird icon.
5. **REF-09** — The footer copyright SHALL read `© 2013-<build year> Insane Driver`.

**Independent Test**: Playwright on Home and one inner page checks footer structure, link targets, hit areas and icon.

### P1: Working, themed Dates page ⭐ MVP

**User Story**: As a fan, I want to see upcoming shows.

**Acceptance Criteria**:

1. **REF-10** — `/dates/` SHALL use the base layout (shared head, header and footer) and present the widget inside a cyber panel matching the approved Stitch Dates variation.
2. **REF-11** — `/dates/` SHALL load the Bandsintown widget script over `https://`, and the built page SHALL contain no `http://` script or iframe URLs.
3. **REF-12** — `/dates/` SHALL always render a visible link to `https://www.bandsintown.com/Insane%20Driver` labelled `Follow on Bandsintown`.
4. **REF-13** — `/dates/` SHALL keep its current title, meta description, robots directive and sitemap entry, and SHALL NOT appear in the header or footer menu.

**Independent Test**: build output inspection plus Playwright render of `/dates/` with the widget request stubbed to fail.

### P1: Compact mobile button grids ⭐ MVP

**User Story**: As a mobile visitor, I want platform buttons without endless scrolling.

**Acceptance Criteria**:

1. **REF-14** — WHILE the viewport is 390px wide the Band page "Listen now" and "Connect" buttons SHALL lay out in at least 2 columns, each at least 44px tall.
2. **REF-15** — WHILE the viewport is 390px wide the Release page streaming buttons SHALL lay out in at least 2 columns, each at least 44px tall.
3. **REF-16** — WHILE the viewport is 390px wide the Release page "Buy CD" and "Preview" buttons SHALL share the same left edge (±1px) and the same height (±1px).

**Independent Test**: Playwright measures bounding boxes at 390px.

### P1: Press kit page ⭐ MVP

**User Story**: As a booker or journalist, I want official bio, photos, logos and contact in one place.

**Acceptance Criteria**:

1. **REF-17** — The build SHALL emit `/press/` using the base layout, implementing the approved Stitch Press variation.
2. **REF-18** — `/press/` SHALL contain a short bio and a long bio sourced from the Band bio (per Assumptions).
3. **REF-19** — `/press/` SHALL list every 2020 PROMO photo from `_data/photos.json` with a thumbnail and a download link to its full-resolution `src`.
4. **REF-20** — `/press/` SHALL offer download links to `logo_horizontal.png` and `logo_loading.png`.
5. **REF-21** — `/press/` SHALL show highlights whose album and single counts equal the counts in `_data/discography.json`.
6. **REF-22** — `/press/` SHALL show `contact@insanedriver.com.br` as a `mailto:` link.
7. **REF-23** — `/press/` SHALL have its own title, meta description, canonical URL, `index, follow` robots directive and a sitemap entry, and SHALL NOT appear in the header menu.
8. **REF-24** — The Contact page SHALL link to `/press/`.

**Independent Test**: build + Playwright on `/press/`; unit test on sitemap.

### P2: Early charset declaration

**User Story**: As a maintainer, I want pages to decode correctly regardless of server headers.

**Acceptance Criteria**:

1. **REF-25** — Every built HTML page SHALL contain `<meta charset="utf-8">` within its first 1024 bytes.

**Independent Test**: unit test over `docs/**/*.html`.

---

## Edge Cases

- IF the Bandsintown script fails to load THEN `/dates/` SHALL still show the panel and the `Follow on Bandsintown` link (REF-12).
- WHILE `prefers-reduced-motion: reduce` is set, `/dates/` and `/press/` SHALL run no animation or transition longer than 0.01s.
- WHILE the viewport is 320, 390, 768, 1024, 1440 or 1920px wide, changed pages (Band, Release, Contact, Newsletter, Dates, Press, and Home for the footer) SHALL have no horizontal document overflow.

---

## Implicit-requirement sweep

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | N/A because no new inputs; Newsletter form unchanged |
| Failure / partial-failure | Bandsintown load failure (REF-12, edge case) |
| Idempotency / retry | N/A because the site is static |
| Auth & rate limits | N/A because no authenticated areas |
| Concurrency / ordering | N/A because there is no runtime state |
| Data lifecycle | Press content derives from versioned `_data/` (REF-19, REF-21) |
| Observability | Dates moves onto the base layout's shared trackers; drops its own dead UA snippet |
| External-dependency failure | REF-11, REF-12 |
| State-transition integrity | N/A because no state machine |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| REF-01 | P1: Readable body copy | T2 | Done |
| REF-02 | P1: Readable body copy | T2 | Done |
| REF-03 | P1: Readable body copy | T2 | Done |
| REF-04 | P1: Readable body copy | T2 | Done |
| REF-05 | P1: Footer | Tasks | Pending |
| REF-06 | P1: Footer | Tasks | Pending |
| REF-07 | P1: Footer | Tasks | Pending |
| REF-08 | P1: Footer | Tasks | Pending |
| REF-09 | P1: Footer | Tasks | Pending |
| REF-10 | P1: Dates | Tasks | Pending |
| REF-11 | P1: Dates | Tasks | Pending |
| REF-12 | P1: Dates | Tasks | Pending |
| REF-13 | P1: Dates | Tasks | Pending |
| REF-14 | P1: Mobile grids | T4 | Done |
| REF-15 | P1: Mobile grids | Tasks | Pending |
| REF-16 | P1: Mobile grids | Tasks | Pending |
| REF-17 | P1: Press kit | Tasks | Pending |
| REF-18 | P1: Press kit | Tasks | Pending |
| REF-19 | P1: Press kit | Tasks | Pending |
| REF-20 | P1: Press kit | Tasks | Pending |
| REF-21 | P1: Press kit | Tasks | Pending |
| REF-22 | P1: Press kit | Tasks | Pending |
| REF-23 | P1: Press kit | Tasks | Pending |
| REF-24 | P1: Press kit | Tasks | Pending |
| REF-25 | P2: Charset | T1 | Done |

**Coverage:** 25 total, 0 mapped to tasks, 25 unmapped ⚠️ (mapped when `tasks.md` is written)

---

## Success Criteria

- [ ] User approves Stitch variations for Footer, Dates and Press.
- [ ] `npm test` passes with new tests for REF-01..25.
- [ ] Production Dates page shows the Bandsintown widget after deploy (verified after an approved deploy).
