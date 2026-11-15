# Site refresh Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Spec**: `.specs/features/site-refresh/spec.md`
**Design**: none (incremental changes on existing patterns; visual references are the approved Stitch screens in `.stitch/designs/v2/{footer,dates,press}-{desktop,mobile}.png`, approved 2026-11-15 with the corrections listed below)
**Status**: Approved

### Corrections to the approved Stitch screens (apply during implementation)

- Keep the current header, banner (`header-img`) and fonts; Stitch's header/nav is not implemented.
- No invented copy: drop "Aggressive groove metal… telemetry", STATUS/FREQ/ENCRYPTION/PROTOCOL lines, "300 DPI CMYK", "Direct media relations…", "Stage telemetry standby…".
- No Terms/Privacy/Management links and no extra "Bandsintown" nav item or 8th icon in the footer.
- Dates and Press stay out of the header menu (Press only appears in the footer as "Press kit").
- Press uses the real 2020 PROMO photos and the real logo PNGs, not Stitch placeholders.
- The Dates list is drawn by the Bandsintown widget; the designed empty state is the fallback panel content.

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: none (no AGENTS.md/CONTRIBUTING; CI in `.github/workflows/main.yml` runs build then `npm run test:unit`) - strong defaults applied. Samples: `tests/seo/output.test.cjs`, `tests/seo/sitemap.test.cjs`, `tests/newsletter/theme.e2e.cjs`, `tests/site/header.e2e.cjs`, `tests/photos/browser.cjs` (blocks external hosts).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Liquid templates / page markup (built HTML) | unit (built-output inspection) | Every AC about markup, links, URLs, head tags, sitemap: 1:1 to REF IDs | `tests/<area>/*.test.cjs` | `npm run build && npm run test:unit` |
| LESS styles / rendered layout | e2e (Playwright computed styles + bounding boxes) | Every AC about layout/typography/hit areas at the spec'd widths + overflow and reduced-motion edge cases | `tests/<area>/*.e2e.cjs` | `npx playwright test <files>` (after `npm run less:build`) |
| Data (`_data/*.json`) | none | unchanged | - | build gate only |

## Gate Check Commands

| Gate Level | When to Use | Command |
| ---------- | ----------- | ------- |
| Quick | Tasks with built-output unit tests only | `npm run build && npm run test:unit` |
| Full | Tasks with e2e tests | `npm run build && npm run test:unit && npx playwright test <task e2e files> tests/site tests/desktop` |
| Build | After the last task | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Small fixes

Independent, low-risk changes on existing pages.

```
T1 → T2 → T3 → T4 → T5
```

### Phase 2: Footer

```
T6 → T7
```

### Phase 3: New and rebuilt pages

```
T8 → T9 → T10
```

---

## Task Breakdown

### T1: Declare charset first in every page head

**What**: Move `<meta charset="utf-8">` before the trackers include in both layouts so it lands in the first 1024 bytes.
**Where**: `_layouts/base.html` (and the same one-line move in `_layouts/home.html`; `_includes/head/metatags.liquid` drops its copy)
**Depends on**: None
**Reuses**: `_includes/head/metatags.liquid`
**Requirement**: REF-25

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/site/charset.test.cjs` asserts every `docs/**/*.html` (except redirect stubs without `<head>`) has `<meta charset="utf-8">` within its first 1024 bytes, and exactly one charset meta
- [x] Gate check passes: `npm run build && npm run test:unit`

**Tests**: unit
**Gate**: quick

---

### T2: Readable body paragraphs

**What**: Band bio, Contact panel and Newsletter description paragraphs use Rajdhani, left-aligned, ≥16px at 390px, contrast ≥4.5:1; `data-hud` and panel tabs untouched.
**Where**: `less/cyber-global.less`
**Deviation**: the three rules live in different files, so each was edited in place (`less/band.less`, `less/newsletter.less`, `less/cyber-global.less`) instead of overriding them from one file. REF-04 says "current monospace font" but panel tabs use `SiliconFont, Rajdhani, sans-serif`; the test pins both tab and `data-hud` fonts to their values captured before the change (spec-precision gap).
**Depends on**: T1
**Reuses**: existing `.cyber-panel-body` rules
**Requirement**: REF-01, REF-02, REF-03, REF-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/site/readability.e2e.cjs` checks font-family, text-align at 390/1440, font-size ≥16px at 390, computed contrast ≥4.5:1 (text color vs nearest opaque background), and that `.cyber-panel-tab` / `[data-hud]` keep a monospace family
- [x] No horizontal overflow at 320/390/768/1024/1440/1920 on Band, Contact, Newsletter
- [x] Gate check passes (full)

**Tests**: e2e
**Gate**: full

---

### T3: X logo in the header

**What**: Replace the `fa-twitter` bird in the header with an inline X SVG; accessible name `Insane Driver on X`; same for the Band page "Connect" X button for consistency.
**Where**: `_includes/header/menu.liquid`
**Deviation**: the logo is a shared partial `_includes/icons/x.liquid` (reused by T6) with its sizing in `less/cyber-global.less` and `less/cyber-links.less`.
**Depends on**: T2
**Reuses**: header social button markup
**Requirement**: REF-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/site/x-icon.test.cjs` asserts no built page using the base/home layout contains `fa-twitter` in the header, and the header link to `https://twitter.com/insanedriverid` has accessible name `Insane Driver on X`
- [x] Gate check passes: `npm run build && npm run test:unit`

**Tests**: unit
**Gate**: quick

---

### T4: Band mobile button grid

**What**: At 390px the Band "Listen now" and "Connect" buttons lay out in ≥2 columns, each ≥44px tall.
**Where**: `less/band.less` (imported by `less/pages/band.less`)
**Depends on**: T3
**Reuses**: `less/cyber-links.less`
**Requirement**: REF-14

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/band/mobile-grid.e2e.cjs` measures button boxes at 390px (≥2 distinct x positions per group, every height ≥44) and no overflow at 320/390
- [x] Existing `tests/band/cyber-links.e2e.cjs` and `tests/seo/band-overflow.e2e.cjs` still pass
- [x] Gate check passes (full)

**Tests**: e2e
**Gate**: full

---

### T5: Release mobile button grid

**What**: At 390px Release streaming buttons lay out in ≥2 columns (≥44px tall), and "Buy CD" / "Preview" share left edge and height (±1px).
**Where**: `less/discography.less` (imported by `less/pages/discography.less`)
**Depends on**: T4
**Reuses**: `.disc-links`, `.disc-buy`, `.disc-preview-btn`
**Requirement**: REF-15, REF-16

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/discography/mobile-grid.e2e.cjs` on `/discography/silicon-fortress/` at 390px checks columns, heights and Buy/Preview alignment (Preview forced visible), plus no overflow at 320/390
- [x] Existing discography e2e tests still pass
- [x] Gate check passes (full)

**Tests**: e2e
**Gate**: full

---

### T6: Themed footer markup

**What**: Rewrite the footer partials to the approved layout: logo zone, social icons (X SVG, no bird), `NAV::INDEX` link list with header destinations + "Press kit" `/press/`, no `|`, copyright `© 2013-<build year> Insane Driver`, back-to-top.
**Where**: `_includes/footer/footer.liquid` (with `menu.liquid`, `social.liquid`, `copyright.liquid` folded into it or rewritten as its sub-partials)
**Deviation**: kept the four sub-partials (`social.liquid` stays the source of the JSON-LD `sameAs` check in `tests/home/seo.e2e.cjs`), added `_includes/footer/logo.liquid` and `_data/build.js` (build year). Tagline uses existing site copy only (genres, São Paulo).
**Depends on**: None (Phase 1 complete)
**Reuses**: `_includes/header/menu.liquid` destinations
**Requirement**: REF-05, REF-06, REF-08, REF-09

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/site/footer.test.cjs` on built `/` and `/band/`: footer nav is a `<ul>` whose hrefs equal the header menu hrefs plus `/press/`; footer text has no `|`; X link has accessible name `Insane Driver on X`; no `fa-twitter`; copyright matches `© 2013-${new Date().getFullYear()} Insane Driver`
- [x] Gate check passes: `npm run build && npm run test:unit`

**Tests**: unit
**Gate**: quick

---

### T7: Themed footer styles

**What**: Style the footer per the approved Stitch screens (cyan top rule, chamfered icon tiles, 2-col list on desktop, 44px tiles on mobile).
**Where**: `less/footer.less`
**Deviation**: `footer.liquid` wraps grid and bottom bar in one `.container`, because `tests/desktop/frame.e2e.cjs` expects a single `footer > .container` guide. The seven icons stay on one row at 320px (existing `tests/seo/identity.e2e.cjs`) by narrowing the footer gutter to 6px below 360px. Before shots: `.stitch/designs/v2/current-footer-*.png`; after shots captured at 390/1440.
**Depends on**: T6
**Reuses**: `less/cyber-global.less` tokens
**Requirement**: REF-05, REF-07

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/site/footer.e2e.cjs`: at 390px every footer link/icon box is ≥44×44; no overflow on Home and Band at 320/390/768/1024/1440/1920
- [x] Before/after screenshots captured for the user
- [x] Gate check passes (full)

**Tests**: e2e
**Gate**: full

---

### T8: Dates page on the base layout

**What**: Rebuild `/dates/` on `base.html` with `TOUR::DATES` and `FEED::BANDSINTOWN` cyber panels, https widget script, always-visible "Follow on Bandsintown" link, same SEO front matter, no own trackers.
**Where**: `dates/index.html` (page styles in `less/pages/dates.less`, wired through the existing per-page CSS mechanism)
**Deviation**: the legacy `widget.bandsintown.com/javascripts/bit_widget.js` now answers 403, so the page uses the current widget `https://widgetv3.bandsintown.com/main.min.js` (`data-artist-name`; verified rendering "No Upcoming Shows" for artist id 10752930 on 2026-11-15). Dates now gets the desktop layout like Contact: `tests/desktop/preservation.e2e.cjs` moves `/dates/` from the DESK-07 exclusion list into the covered areas, and `tests/desktop/frame.e2e.cjs` adds it to the guide checks (coverage added, none removed).
**Depends on**: None (Phase 2 complete)
**Reuses**: `contact/index.html` panel structure, `less/pages/contact.less`
**Requirement**: REF-10, REF-11, REF-12, REF-13

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `tests/dates/dates.test.cjs` on built `docs/dates/index.html`: base layout markers present, no `http://` in any `<script src>` or `<iframe src>`, Bandsintown script is `https://`, link `https://www.bandsintown.com/Insane%20Driver` labelled `Follow on Bandsintown`, same title/description/robots, `/dates/` in sitemap, not in header/footer menus
- [x] `tests/dates/dates.e2e.cjs` with widget blocked: panel and link visible; reduced-motion has no animation/transition >0.01s; no overflow at the six widths
- [x] Gate check passes (full)

**Tests**: e2e
**Gate**: full

---

### T9: Press kit page

**What**: Create `/press/` on `base.html` with `EPK::BIO` (short + long), `EPK::FACTS` (counts from `_data/discography.json`), `EPK::PHOTOS` (all 2020 PROMO photos with download links), `EPK::LOGOS`, `EPK::CONTACT`, own SEO head, `index, follow`.
**Where**: `press/index.html` (page styles in `less/pages/press.less`)
**Depends on**: T8
**Reuses**: `band/index.html` bio copy, `_data/photos.json`, `_data/discography.json`, contact panel pattern
**Requirement**: REF-17, REF-18, REF-19, REF-20, REF-21, REF-22, REF-23

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/press/press.test.cjs` on built `docs/press/index.html`: short bio = first two Band bio paragraphs, long bio = all paragraphs + quote; one download link per 2020 PROMO photo to its `src`; logo downloads; album/single counts equal data; mailto; title/description/canonical/robots; `/press/` in sitemap; not in header menu
- [ ] `tests/press/press.e2e.cjs`: reduced motion, no overflow at the six widths
- [ ] Gate check passes (full)

**Tests**: e2e
**Gate**: full

---

### T10: Link Contact to the press kit

**What**: Add a "Press kit" link to `/press/` on the Contact page.
**Where**: `contact/index.html`
**Depends on**: T9
**Reuses**: contact panel link styles
**Requirement**: REF-24

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/site/contact-press.test.cjs` asserts built `/contact/` contains a link to `/press/`
- [ ] Build gate passes: `npm run build && npm test`

**Tests**: unit
**Gate**: build

---

## Requirement coverage

| Requirement | Task |
| --- | --- |
| REF-01..04 | T2 |
| REF-05 | T6, T7 |
| REF-06 | T6 |
| REF-07 | T7 |
| REF-08 | T3, T6 |
| REF-09 | T6 |
| REF-10..13 | T8 |
| REF-14 | T4 |
| REF-15, REF-16 | T5 |
| REF-17..23 | T9 |
| REF-24 | T10 |
| REF-25 | T1 |
