# Desktop layout standard

## Problem Statement

At 1920×1080, active pages alternate between 560px, 1180px, 1600px and almost full viewport width. Shared alignment and bounded components give the site a consistent desktop composition.

## Out of Scope

Campaigns, pre-sales and the legacy Dates page; new content, typography redesign, integrations, deployment and changes to mobile composition. The pre-existing Contact Bootstrap row overflow is corrected without changing its inner composition.

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
| --- | --- | --- | --- |
| Scope | Home, Band, Discography including release/song details, Photos, Videos, Store, Contact, Newsletter | Confirmed after grilling | y |
| Desktop activation | At least 1200px viewport width; usable width min(1360px, viewport minus 64px) | Keeps existing tablet/mobile rules and 32px minimum desktop gutters | y, implementation detail |
| Shared guides | Centered 1360px useful width, backgrounds full viewport | User confirmed Q1–Q4 | y |
| Component sizing | Text, forms and featured media retain smaller internal limits | User confirmed Q5–Q6 | y |
| Grids and spacing | Distribution and 24/32/48–64px scale below | User confirmed Q7–Q9 | y |
| Remote operations | Local implementation only | No publication requested | y |

Open questions: none.

## User Stories

### P1: Consistent desktop composition

As a visitor on a desktop monitor, I want consistent page boundaries and proportionate content.

**Acceptance Criteria**:

1. **DESK-01** — WHILE the viewport is at least 1200px wide, active pages SHALL center their outer content guides, navbar wrapper, page title where present, hero content where present, and footer wrapper at min(1360px, viewport width minus 64px), with a tolerance of 1px; at 1920px the left guide SHALL be 280px. Background sections SHALL remain full width.
2. **DESK-02** — WHILE the viewport is at least 1200px wide, the site SHALL display 3 columns for products, albums and home album/photo highlights, 4 archive photo columns, 5 members and 6 singles; videos SHALL retain one player and a horizontally scrollable feed; album details and newsletter SHALL retain two main columns.
3. **DESK-03** — WHILE the viewport is at least 1200px wide, card grids SHALL use 24px gaps, main paired panels SHALL use 32px gaps, and major section divisions SHALL use 48–64px spacing including decorative separators.
4. **DESK-04** — WHILE the viewport is at least 1200px wide, the Band biography SHALL have a maximum width of 760px, Contact's content panels SHALL have a maximum width of 760px inside the common frame, and newsletter embeds SHALL remain within their panel without changing integration contracts.
5. **DESK-05** — WHILE the viewport is at least 1200px wide, standalone video screens SHALL preserve 16:9 proportions and stay within 60vh, featured gallery images and the Band photo SHALL fit within 60vh with their full image visible, and release/streaming covers SHALL not exceed 360px wide; gallery/player controls SHALL remain visible and usable.
6. **DESK-06** — WHILE the viewport is 320, 390, 768, 1024, 1200, 1366, 1440, 1920 or 2560px wide, all active page types SHALL have no horizontal document overflow; below 1200px the new desktop rules SHALL leave existing component widths and grid composition unchanged.
7. **DESK-07** — The site SHALL preserve navigation destinations, signup integration attributes, gallery/video controls and existing text; excluded pages SHALL receive no desktop layout overrides.

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| DESK-01 | P1 | Execute step 1 | Verified |
| DESK-02 | P1 | Execute step 2 | Verified |
| DESK-03 | P1 | Execute step 2 | Verified |
| DESK-04 | P1 | Execute step 2 | Verified |
| DESK-05 | P1 | Execute step 2 | Verified |
| DESK-06 | P1 | Both steps | Verified |
| DESK-07 | P1 | Both steps | Verified |
| DESK-08 | P1 | Execute step 3 | Verified |
| DESK-09 | P1 | Execute step 4 | Verified |
| DESK-10 | P1 | Final verification | Verified |
| DESK-11 | P1 | Execute step 5 | Verified |
| DESK-12 | P1 | PR readiness T5 | Verified |
| DESK-13 | P1 | PR readiness T6 | Verified |

## Edge Cases

- 2560px screens keep the same 1360px useful width.
- 1920×720 screens shrink standalone media without distorting it.
- The Home fixed menu and photo composition remain usable with its smaller content frame.
- Song pages use the Discography frame and retain their existing internal bento hierarchy.

## Execution Plan

1. Shared desktop frame → the eight active `less/pages/*.less` entries, `less/desktop-layout.less`, `less/contact.less` (existing row overflow), `tests/desktop/frame.e2e.cjs`, two superseded width assertions in `tests/{discography/theme,photos/visual}.e2e.cjs`, compiled page CSS and this spec → build, unit tests, browser frame checks → `fix(layout): align desktop page frames to common guides`.
2. Bounded grids and media → `less/desktop-layout.less`, `tests/desktop/{content,preservation}.e2e.cjs`, compiled page CSS and this spec → build, unit tests, desktop browser checks and existing affected E2E tests → `fix(layout): standardize desktop grids and media proportions`.
3. Reconcile song regression expectations with approved per-track SEO → `tests/discography/song-bento.e2e.cjs` and this spec → exact per-track metadata checks and unit suite → `test(song): align bento expectations with per-track similar bands`.
4. Restore split dossier composition with Sonic DNA and align old image-size assertions with the approved desktop frame/media limits → `less/song-bento.less`, `assets/css/discography.min.css`, `tests/discography/song-bento.e2e.cjs`, `tests/perf/images.e2e.cjs` and this spec → existing alignment assertions plus Sonic DNA placement, responsive image checks, build and unit suite → `fix(song): preserve split dossier layout with sonic dna`.
5. Reconcile remaining SEO/image regression contracts and complete the full gate → `tests/seo/{song,release,single-song}.e2e.cjs`, `tests/perf/images.e2e.cjs`, any shared test fixture needed for independent expected values, and this spec → build, unit suite and complete browser suite → `test(site): reconcile seo and image regression contracts`.

The additional mobile cover race expands the follow-up beyond five implicit steps. `tasks.md` now owns the remaining atomic test-contract, mobile-cover and final-verification tasks. The original steps above remain the historical implementation outline; the remaining contracts are committed individually according to that task file.

The original layout used two implicit implementation steps and no design phase. Subsequent PR-readiness work is tracked in `tasks.md`. The shared desktop Less mixin compiles under each active page ID and uses a 1200px media boundary, keeping the existing CSS bundles and mobile cascade.

### PR readiness follow-up (2026-11-14)

The user authorized resolving all remaining points before opening the layout PR, including the previously recorded song regression failures. Steps 3 and 4 extend the original two layout steps. Existing exact layout assertions remain in force; incorrect global fans-of expectations are replaced with exact per-track expectations, without deleting or skipping tests. No content, integration or mobile DOM reorder is required.

- **DESK-08** — WHEN a song has curated similar-band data, its bento metadata SHALL render exactly that track's band names in the agreed natural-English fans-of sentence. Status: Verified (step 3).
- **DESK-09** — WHILE the viewport is at least 992px wide and a lyrics dossier has About and Also released as, those sections SHALL retain the existing 4:2 side-by-side split, Sonic DNA SHALL occupy a following row below both sections, and the catalog line SHALL follow the whole dossier. Below 992px, the existing About → Sonic DNA → Also DOM reading order SHALL remain stacked. Status: Verified (step 4).
- **DESK-10** — Before the branch is declared PR-ready, the build, unit suite and complete browser suite SHALL pass without disabled tests or weakened assertions; an independent Verifier SHALL validate the fixes and their regression sensitivity. Status: Verified (final verification).
- **DESK-11** — WHEN existing SEO regression checks run, song fans-of text SHALL match the curated per-track bands, album fans-of text SHALL match the approved frequency/score-ranked top four and genres SHALL match the unique track genres in order, and single-song descriptions SHALL preserve the track summary and band recommendation within 160 characters. WHEN the photo viewer opens an archive image, every placeholder source SHALL use its WebP thumbnail including an unrendered lazy neighbour, and no JPEG thumbnail SHALL be requested; verification SHALL observe stable viewer item state instead of assuming global network idleness or transient placeholder lifetime. Status: Verified (step 5).
- **DESK-12** — WHILE the viewport is below 860px, the Now Streaming cover SHALL fill its panel's content width up to its existing 420px cap and remain centered, including before its image has a natural width. Status: Verified (PR readiness T5).
- **DESK-13** — WHEN loader regression tests inspect a transient boot state, they SHALL control the JS clock so interactions precede automatic dismissal, explicitly hold late script delivery until the 400ms release assertions finish, and inspect CSS visibility at 1500ms and 2500ms of the actual failsafe animation. The 2s CSS delay, exact 400ms repeat release, less-than-600ms skip bound, accessibility/inert checks and listener cleanup SHALL remain asserted; production timer code SHALL remain unchanged. Status: Verified (PR readiness T6).

### Step 3 complete

The two stale global fans-of assertions now assert exact metadata text for each track against the curated SEO catalog. Expected sentences use the platform's English list formatter independently of production `lib/catalog.js`; assertions still compare complete text, including one-band and two-band cases. No application content or templates changed. Gate: all 20 video/lyrics metadata cases passed, and all 240 unit cases passed. Coverage: `tests/discography/song-bento.e2e.cjs:112` and `:189` `expect(meta.locator('.fans-of')).toHaveText(expectedFansOf(s))` map to DESK-08. The other assertions in those cases retain their existing metadata/layout requirements. No assertions were weakened, removed or skipped.

### Step 4 complete

The split lyrics dossier now explicitly places About and Also in row 1 and lets Sonic DNA span the next row. Existing 4:2 geometry assertions remain intact; added assertions require Sonic DNA below both sections and the catalog below the complete dossier, with the mobile About → Sonic DNA → Also order preserved. This separately authorized inherited layout repair applies from 992px, including 992–1199px; DESK-06's preservation statement continues to concern the new desktop mixin, which still activates only at 1200px.

The full-suite diagnostic exposed two superseded performance baselines: an uncapped Band photo and the old footer container. Their tests now assert DESK-05's proportional, contained 60vh photo and DESK-01's 30%-of-guide footer logo with its existing aspect ratio/padding. Mobile pixel baselines remain exact. Build and all 240 unit cases passed. A combined isolated gate passed 13/13 dossier/mobile/image cases. Visual inspection of the 1920px Age of Lies dossier confirmed the intended two-column first row and following Sonic DNA row. The complete browser gate remains pending step 5.

### Step 5 contract repairs complete

The complete diagnostic run exposed 33 additional failures beyond the original song-bento set: old Band/footer dimensions, transient/global-network PhotoSwipe synchronization, fixed album/song recommendations and genres, and old single descriptions. Dimensions were reconciled in step 4. Follow-up T1–T4 now assert exact curated track copy, independently audited album rankings/genres, literal bounded single descriptions and each real viewer item's exact WebP source, including the unrendered neighbour. The proxy forwards the original PhotoSwipe constructor; the test also waits for an actual full image and retains the no-JPEG-request assertion.

Gate: 59/59 affected browser cases passed on a UTF-8 server; the strengthened exact WebP mapping passed in the complete run; unit suite 240/240 passed. A first plain-Python server probe was discarded because its missing UTF-8 HTTP charset corrupted Unicode expectations; no product content was changed for that probe. Independent raw-data review confirmed the album fixture rankings and ordered genres and both single summaries. All new assertions map to DESK-11, while existing page/link/JSON-LD assertions remain in place. T5 repairs the subsequently exposed image-loading width race; T6 still owns the final complete green gate and independent verification.

### PR readiness T5 complete

The next complete run passed 766/767 browser cases and exposed an intermittent existing mobile cover collapse before image data arrived (414px case, 330px width shortfall). The cover now has explicit `width: 100%` only below 860px, keeping the existing 420px cap and automatic centering. This is a separately authorized inherited mobile sizing repair, not an extension of the desktop mixin below 1200px.

The new regression case blocks release images, proves the streaming image has naturalWidth 0, and applies the same exact fill/centering assertions. All 40 phone-fit cases, all 240 unit cases and the build passed. No existing case or assertion was removed or relaxed. The final complete gate now includes this added case (768 browser cases expected), followed by independent verification under T6.

### PR readiness T6 complete

Subsequent complete runs exposed loader sampling races, including without a second browser process: input could arrive after the 600ms automatic release; a 700ms host delay did not guarantee script delivery remained pending while a fake clock advanced; and CSS animation delay starts when styles apply, after the earlier head timestamp. These are now explicit controlled preconditions. Interaction cases pause JS time and the CSS failsafe, act at logical 100ms, and retain the less-than-600ms skip/event/accessibility/cleanup assertions. The late script remains held until the exact 400ms assertions complete and is released in a finally block. CSS cases seek the real animation to exactly 1500ms and 2500ms with JS time advanced separately, retaining visibility and release-state assertions and the existing exact 2s delay checks.

All 30 loader/style cases and 240 unit cases passed; the late-script cleanup case also passed independently after the final cleanup adjustment. No production timer, time bound, case count or skip setting changed. Coverage maps to DESK-13: `tests/home/loader-style.e2e.cjs` asserts exact animation time/visibility at both checkpoints; `tests/home/loader.e2e.cjs` preserves the existing repeat, skip, inert, accessibility and listener assertions. T7 now owns the complete green gate and refreshed independent verification.

### Final PR readiness: complete

Normal build passed (47 pages written, 291 files copied). Final `npm test` exited 0: **240 unit cases and all 768 browser cases passed**, with no skipped cases. The complete captured gate is `/tmp/desktop-pr-final-all.log`. Earlier failed/pending execution notes above are historical diagnostics, superseded by this final result.

Independent verification confirms **13/13 requirements**, **225 selected browser cases passed**, and **4/4 isolated behavior mutations killed**, with real-tree isolation and scratch restoration verified. The final report is `validation.md`; the completion validator passed with zero errors. The source/test range ends at `4cdb91a`; subsequent changes only close this spec, tasks, report and handoff. All implementation and validation tasks are complete and the branch is ready for PR publication.

### Step 1 complete

Build passed. Unit gate passed (33 test files). Browser gate: all 10 frame tests passed across the initial desktop/exclusion run and responsive rerun, plus both revised legacy width assertions (6 + 6 successful checks total). Existing Contact row overflow fixed with the same row/column gutter reset already used by the adjacent page wrappers.

| Criterion | Evidence and assertion | Expected outcome | Covered |
| --- | --- | --- | --- |
| DESK-01 | `tests/desktop/frame.e2e.cjs:25` `expect(Math.abs(box.width - expectedWidth)).toBeLessThanOrEqual(1)`; line 26 checks x, line 29 background width | min(1360, viewport − 64), centered; full background | Yes |
| DESK-06 | `tests/desktop/frame.e2e.cjs:30` and `:46` `expect(scrollWidth).toBeLessThanOrEqual(width)` | No document overflow at nine viewport widths | Yes |
| DESK-07 exclusion | `tests/desktop/frame.e2e.cjs:54` `expect(customProperty).toBe('')` | Campaign does not receive desktop layout tokens | Yes |
| Menu within frame | `tests/desktop/frame.e2e.cjs:34` / `:35` bounds assertions | Visible navigation fits common guides | Yes |

Reverse mapping: all frame assertions map to DESK-01, DESK-06, DESK-07; the two updated legacy assertions encode DESK-01's confirmed width. No unclaimed tests. Existing `tests/photos/browser.cjs` fixture and repository Playwright configuration are used. Adequacy: exact dimensions, background breadth, navigation bounds and mobile overflow are covered; no tests removed or skipped. Remaining content criteria belong to step 2.

### Step 2 complete

Grids now use the confirmed desktop column counts and 24px card gaps; paired panels use 32px gaps and decorative divisions total 48px. Biography and Contact panels are bounded to 760px, covers to 360px, and featured media to 60vh while preserving proportions. All new composition rules remain inside the 1200px desktop boundary.

Build passed. The unit suite passed (33 test files). Desktop gates passed: 39 content checks, 10 frame checks and 7 preservation checks; the independent Verifier repeated all 56 successfully. The preservation checks compare computed widths, grid tracks and gaps with the same source compiled without the desktop mixin at 320/390/768/1024px. Exclusion checks cover pre-save, preorder and Dates, including the original preorder redirect contract.

| Criterion | Evidence and assertion | Expected outcome | Covered |
| --- | --- | --- | --- |
| DESK-02 | `tests/desktop/content.e2e.cjs:21` `expect(style.columns, selector).toBe(columns)`; `:97` `expect(s.cols).toBe(2)`; `:129` feed display assertion | Confirmed grid counts at 1200/1366/1920/2560px, two-column panels, horizontal video feed | Yes |
| DESK-03 | `tests/desktop/content.e2e.cjs:22` `expect(style.gap, selector).toBe('24px')`; `:28` `expect(division).toBe(48)`; `:98` `expect(s.gap).toBe('32px')` | 24px cards, 32px panels, 48px decorative divisions | Yes |
| DESK-04 | `tests/desktop/content.e2e.cjs:48` `expect(bio.width).toBe(760)`; `:102`/`:103` embed bounds; `:121` panel width | Readable 760px text/panels and contained signup embed | Yes |
| DESK-05 | `tests/desktop/content.e2e.cjs:50`/`:60`/`:69` height limits, `:61` 16:9 ratio, `:51`/`:70` object-fit, `:110` cover limit | Complete images and proportional video within 60vh, covers at most 360px | Yes |
| DESK-06 | `tests/desktop/frame.e2e.cjs:30`/`:46` overflow assertions; `tests/desktop/preservation.e2e.cjs:80` `expect(actual).toEqual(await composition(page, selectors))` | No overflow at nine widths; unchanged mobile widths and grid composition | Yes |
| DESK-07 | `tests/desktop/content.e2e.cjs:84` changed gallery counter and `:133` video counter; `tests/desktop/preservation.e2e.cjs:130` no matching desktop overrides; `tests/newsletter/markup.e2e.cjs:15`–`:81` signup contract | Controls, signup attributes and excluded pages preserved | Yes |

Reverse mapping: content assertions cover DESK-02–05 and control preservation in DESK-07; preservation assertions cover DESK-06 and exclusions in DESK-07. Existing frame tests cover DESK-01 and overflow. All new assertions map to the confirmed scope, including the 1200px activation boundary and 1920×720 short desktop case. No existing tests were removed, skipped or weakened.

The broader affected-page regression run completed with **238 passed and 22 failed**. Twenty failures assert the obsolete global fans-of text in `tests/discography/song-bento.e2e.cjs:108`/`:185`; two assert About/Also alignment at `:394` despite the existing intervening Sonic DNA section. Relevant tests, templates, data and existing song styles are unchanged from `b0a9d7f`; the 992px failure is below the new desktop boundary. A runtime probe with the old CSS could not complete because execution permission was unavailable. These inherited failures remain recorded and unchanged; this completion refers to the scoped desktop feature, not a clean full-repository regression run. See `validation.md` for the independent verdict and isolated mutation evidence.
