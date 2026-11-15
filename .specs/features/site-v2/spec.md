# Insane Driver v2 (Stitch redesign + Astro stack)

## Problem Statement

The site runs on Eleventy 0.12 (2021), Liquid, LESS and Bootstrap 3, with a cyberpunk theme duplicated page by page. v2 redesigns every active page in Stitch first, then reimplements the site on Astro 5 + Tailwind v4 from those screens, keeping every public URL, SEO contract and integration intact.

## Goals

- [ ] 3 Home directions in Stitch (mobile + desktop) and a user-chosen direction recorded as the Stitch design system.
- [ ] 12 redesigned pages in Stitch, each with a mobile and a desktop screen.
- [ ] Astro 5 + Tailwind v4 static site that publishes every current public URL plus `/press/`, cut over in one switch.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Redesign of campaign pages (pre-save, preorder, reward) | Ported functional in the new base layout only (grilling Q11) |
| Portuguese / multi-language | English only in v2 (Q7) |
| Consulting older Stitch projects | Base is `.stitch/DESIGN.md` only (Q4) |
| New integrations or store/checkout changes | Bandsintown, Mailchimp, Spotify pre-save and PayPal keep their current contracts |
| Pushing, merging, deploying, cutover | Each remote/production action needs its own explicit go-ahead |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Delivery order | Stitch screens first, then implementation | Grilling Q1 | y |
| Home directions | A Neon HUD evolved, B dark minimal editorial with neon accents, C industrial/brutalist | Grilling Q2/Q12 | y |
| Pages | Home, Band, Discography, Release, Song, Dates, Videos, Photos, Store, Newsletter, Contact, Press/EPK | Grilling Q3/Q6 | y |
| Stack | Astro 5 + Tailwind v4, static output in `dist/` | Grilling Q8/Q13 | y |
| Migration | Parallel branch `feat/site-v2`, big-bang cutover after preview | Grilling Q9 | y |
| URL inventory | The 52 public URLs the current build emits (sitemap pages, release/song pages, `/dates/`, campaign pages) plus `/press/`; `/.agent/`, `/.gemini/`, `/less/README/` are build leaks, not public URLs | Found in current `docs/` output | y, fact |
| Content source | Existing `_data/` files and page front matter are the content source; copy is not rewritten unless a Stitch screen requires a new label | Keeps content identical | y |
| EPK assets | Bio, press photos, logos, highlights, Contact page email; rider/stage plot only if PDFs exist in the repo (none found today) | Grilling Q15 | y |
| Hosting | GitHub Pages via Actions to `release` branch, CNAME `insanedriver.com.br`; `docs/` gitlink removed | Grilling Q13 | y |
| Tests | Keep layout-independent contracts (URLs, SEO head, sitemap, robots, perf budgets); rewrite UI tests per page | Grilling Q14 | y |
| Stitch screen naming | `<Page> — Mobile` / `<Page> — Desktop`; mobile 390px wide, desktop 1440px wide | Unambiguous review in Stitch | y, agent default |

**Open questions:** none - all resolved or logged above.

---

## User Stories

### P1: Home directions in Stitch ⭐ MVP

**User Story**: As the band owner, I want three distinct Home directions so I can pick the look before every other page is drawn.

**Acceptance Criteria**:

1. **STD-01** — The Stitch project `12397005399000624698` SHALL contain the current `.stitch/DESIGN.md` uploaded as its design system before any screen is generated.
2. **STD-02** — The Stitch project SHALL contain 6 Home screens: directions A, B and C, each as one mobile (390px) and one desktop (1440px) screen, named `Home <A|B|C> — <Mobile|Desktop>`.
3. **STD-03** — Each Home screen SHALL show the logo, primary navigation to all 11 other pages, the latest release with listen links, upcoming dates, a newsletter call-to-action and footer social links, using real Insane Driver content from `_data/`.
4. **STD-04** — WHEN the user picks a direction (or a mix) THEN the Stitch design system SHALL be updated to that direction and `.stitch/DESIGN.md` SHALL be rewritten to match it.

**Independent Test**: `list_screens` returns the 6 named Home screens; screenshots show three visibly different directions.

### P1: Full screen set in Stitch ⭐ MVP

**User Story**: As the band owner, I want every page redesigned in the chosen direction so implementation has a complete visual reference.

**Acceptance Criteria**:

1. **STD-05** — WHILE the direction from STD-04 is not chosen the system SHALL NOT generate the remaining 11 pages.
2. **STD-06** — The Stitch project SHALL contain a mobile and a desktop screen for Band, Discography, Release, Song, Dates, Videos, Photos, Store, Newsletter, Contact and Press, named `<Page> — <Mobile|Desktop>`, with the chosen design system applied.
3. **STD-07** — Each screen SHALL contain the content blocks its current page has (e.g. Store's 3 products with prices, Song's lyrics and listen links, Release's tracklist), and the Press screen SHALL contain short bio, long bio, press photo downloads, logo downloads, highlights and the Contact email.
4. **STD-08** — WHEN the user approves the full set THEN each screen's HTML SHALL be downloaded to `.stitch/designs/v2/<page>-<mobile|desktop>.html`.

**Independent Test**: 22 named screens in `list_screens`; 22 HTML files on disk.

### P1: Astro site with URL and SEO parity ⭐ MVP

**User Story**: As a visitor or search engine, I want every existing link to keep working on the new site.

**Acceptance Criteria**:

1. **V2-01** — The Astro build SHALL emit `dist/<path>/index.html` for each of the 52 inventoried public URLs and for `/press/`.
2. **V2-02** — The Astro build SHALL NOT emit `/.agent/`, `/.gemini/`, `/less/` or any path outside the inventory plus `/press/`, sitemap, robots, CNAME, verification files and assets.
3. **V2-03** — Each page SHALL keep its current `<title>`, meta description, canonical URL, robots directive and JSON-LD type as asserted by the existing SEO fixtures (`tests/seo/seo-regression.fixture.json`).
4. **V2-04** — `dist/sitemap.xml` SHALL list the same URLs as the current sitemap plus `/press/`; `dist/robots.txt` and `dist/CNAME` (`insanedriver.com.br`) SHALL match the current files.
5. **V2-05** — The site SHALL be built with Astro 5 and Tailwind v4 whose theme tokens (colors, fonts, spacing) come from the chosen `.stitch/DESIGN.md`, and SHALL contain no Bootstrap, LESS or Eleventy dependency.

**Independent Test**: build, then a URL-inventory test and the ported SEO tests pass against `dist/`.

### P1: Pages implemented from Stitch screens ⭐ MVP

**User Story**: As a visitor, I want the redesigned pages on phone and desktop.

**Acceptance Criteria**:

1. **V2-06** — Each of the 12 pages SHALL render the content blocks of its approved Stitch screen at 390px and 1440px, sourced from `_data/` / page data rather than hard-coded copies.
2. **V2-07** — WHILE the viewport is 320, 390, 768, 1024, 1440 or 1920px wide every page SHALL have no horizontal document overflow.
3. **V2-08** — WHILE `prefers-reduced-motion: reduce` is set, every page SHALL run no CSS animation or transition longer than 0.01s.
4. **V2-09** — Dates SHALL load the Bandsintown widget for artist `Insane Driver`; Newsletter SHALL post to the current Mailchimp form action; Store SHALL keep the current PayPal buy links per product; pre-save SHALL keep the Spotify playlist-select flow.
5. **V2-10** — IF the Bandsintown script fails to load THEN Dates SHALL show a link to the current Bandsintown artist page (`https://www.bandsintown.com/Insane%20Driver`).
6. **V2-11** — Campaign pages (`/pre-save/`, `/pre-save/spotify-select-playlist/`, `/preorder/`, `/reward/*`) SHALL render in the v2 base layout with their current copy and links.

**Independent Test**: per-page Playwright tests at 390px and 1440px pass.

### P2: Deployment pipeline and cutover readiness

**User Story**: As the maintainer, I want the same hosting with a cleaner build.

**Acceptance Criteria**:

1. **V2-12** — The GitHub Actions workflow SHALL build Astro, run the test suite and deploy `dist/` to the `release` branch.
2. **V2-13** — The repository SHALL contain no `docs/` gitlink after the v2 branch is merged.
3. **V2-14** — Each page SHALL meet the current perf budgets enforced by `tests/perf` (image, font, script and tracker guards), with images served through Astro image optimization.

**Independent Test**: CI run on the branch is green; `git ls-files -s docs` is empty.

---

## Edge Cases

- IF a song has no lyrics in `_data/lyrics` THEN the Song page SHALL omit the lyrics block without an empty container.
- IF a release has no video THEN Release/Song pages SHALL render without the video block (current `song-bento-no-video` behavior).
- IF a Stitch generation fails or times out THEN the screen SHALL be regenerated, never left as a partial screen with the final name.

---

## Implicit-requirement sweep

| Dimension | Resolution |
| --- | --- |
| Input validation & bounds | Newsletter form keeps Mailchimp's validation (V2-09) |
| Failure / partial-failure | Bandsintown fallback (V2-10); Stitch failed generation (edge case) |
| Idempotency / retry | N/A because the site is static |
| Auth & rate limits | N/A because there are no authenticated areas |
| Concurrency / ordering | STD-05 gates page generation on the chosen direction |
| Data lifecycle | N/A because content stays in versioned `_data/` |
| Observability | Existing trackers preserved and budgeted by `tests/perf` (V2-14) |
| External-dependency failure | V2-10; other embeds keep current behavior (V2-09) |
| State-transition integrity | Cutover is one switch (V2-12/13), gated on explicit go-ahead |

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| STD-01 | P1: Home directions | Execute | Pending |
| STD-02 | P1: Home directions | Execute | Pending |
| STD-03 | P1: Home directions | Execute | Pending |
| STD-04 | P1: Home directions | Execute | Pending |
| STD-05 | P1: Full screen set | Execute | Pending |
| STD-06 | P1: Full screen set | Execute | Pending |
| STD-07 | P1: Full screen set | Execute | Pending |
| STD-08 | P1: Full screen set | Execute | Pending |
| V2-01 | P1: URL/SEO parity | Design | Pending |
| V2-02 | P1: URL/SEO parity | Design | Pending |
| V2-03 | P1: URL/SEO parity | Design | Pending |
| V2-04 | P1: URL/SEO parity | Design | Pending |
| V2-05 | P1: URL/SEO parity | Design | Pending |
| V2-06 | P1: Pages | Design | Pending |
| V2-07 | P1: Pages | Design | Pending |
| V2-08 | P1: Pages | Design | Pending |
| V2-09 | P1: Pages | Design | Pending |
| V2-10 | P1: Pages | Design | Pending |
| V2-11 | P1: Pages | Design | Pending |
| V2-12 | P2: Deployment | Design | Pending |
| V2-13 | P2: Deployment | Design | Pending |
| V2-14 | P2: Deployment | Design | Pending |

**Coverage:** 22 total, 0 mapped to tasks, 22 unmapped ⚠️ (STD tasks follow now; V2 design/tasks are written after STD-08, once screens exist)

---

## Success Criteria

- [ ] User picks a Home direction from 6 Stitch screens.
- [ ] 24 approved Stitch screens (Home + 11 pages, mobile + desktop).
- [ ] Astro build passes URL-inventory, SEO and per-page tests; CI green on `feat/site-v2`.
