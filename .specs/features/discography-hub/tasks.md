# Discography Hub Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/discography-hub/design.md`
**Status**: Done

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `package.json` scripts, `playwright.config.cjs`, `.specs/LESSONS.md` (L-004, L-024, L-037); no coverage threshold configured - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Liquid templates (markup, JSON-LD) | e2e | Every album and single for markup ACs; Deluxe and one single for the missing-field negatives (L-024, L-037) | `tests/discography/*.e2e.cjs`, `tests/seo/index-links.e2e.cjs` | `npx playwright test <file>` |
| Less (layout / finish) | e2e (computed styles) | Each layout AC at the named widths; each style AC on computed values | `tests/discography/theme.e2e.cjs` | `npx playwright test <file>` |
| Existing JS (preview, tracking) | e2e | Happy path, re-click, failure, no-JS, payload + navigation not cancelled | `tests/discography/preview.e2e.cjs`, `tests/discography/tracking.e2e.cjs` | `npx playwright test <file>` |
| Spec documents | none | - (build gate only) | `.specs/features/*/spec.md` | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm run build && npm run test:unit && npx playwright test tests/discography tests/seo tests/home/panels-style.e2e.cjs` |
| Build | After the last task | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Markup (release page, then hub)

```
T1 → T2 → T3 → T4
```

### Phase 2: Hub styles and spec upkeep

```
T5 → T6
```

---

## Task Breakdown

### T1: BUY CD and PREVIEW on the release page ✅

**What**: Render `a.disc-buy` (when `buyCd`) and the hidden PREVIEW button + `div.disc-preview` (when `spotifyId`) after the platform links and before the tracklist; point `preview.e2e.cjs` and `tracking.e2e.cjs` at `/discography/silicon-fortress/` and add the BUY CD placement and negatives.
**Where**: `discography/release.liquid`
**Depends on**: None
**Reuses**: `discography/index.html` BUY CD / PREVIEW markup, `assets/js/discography.js`
**Requirement**: HUB-12, HUB-13, HUB-14, HUB-15, HUB-16

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Silicon Fortress and Insane Driver pages: one `.disc-buy` whose `href` equals `buyCd`, after `.disc-links--secondary`, before the tracklist
- [ ] Each album page: one `[data-disc-preview-btn]` with the album's `spotifyId`, after BUY CD when present, before the tracklist
- [ ] Deluxe page: PREVIEW but no `.disc-buy`; a single page: neither (HUB-14, one test per missing field)
- [ ] Preview tests on the release page: no Spotify request before click, inject one iframe, re-click closes, failure leaves links, no-JS keeps the button hidden
- [ ] Tracking tests on the release page: payload `{release_click, platform, release}`, default not cancelled, missing `dataLayer` created
- [ ] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): move buy cd and preview onto the release pages`

**Notes**: `buyCd`/`spotifyId` are not on the `catalog` release object, so `release.liquid` looks the source entry up in `discography.json` by slug. `.disc-page a` link colour now skips `.disc-buy` (it turned BUY CD text cyan on yellow). DISC-24 (two previews, one iframe) is retired: a release page has one preview; HUB-15 asserts exactly one iframe. Gate: unit 218/218, e2e 326/326.

---

### T2: Hub hero and album cards ✅

**What**: Replace the `DISC::INDEX` anchor list with the hero and the per-album panels with one `DISC::ALBUMS` panel of card anchors (cover, type/year, title, tracks, description looked up from `catalog.releases`, `OPEN RELEASE →`); drop the per-album `MusicAlbum` JSON-LD; rewrite `markup.e2e.cjs`, the album parts of `seo.e2e.cjs` and `index-links.e2e.cjs`; move HOME-11/32's reference button to a release page.
**Where**: `discography/index.html`
**Depends on**: T1
**Reuses**: `catalog.links`, `catalog.releases`, `.disc-section-heading`
**Requirement**: HUB-01, HUB-02, HUB-03, HUB-10, HUB-11, HUB-17, HUB-23

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Three `[data-disc-album]` anchors in catalog order, `href` = release page, no nested link/button
- [ ] Each card shows cover alt, `ALBUM`/`DELUXE EDITION // year`, title, `<n> tracks`, the full catalog description, `OPEN RELEASE`
- [ ] Counter reads `03 RELEASES // 18 SINGLES`; no `a[href^="#"]` on the page
- [ ] No `MusicAlbum` JSON-LD on the hub
- [ ] Cards navigate with JavaScript disabled
- [ ] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): turn the index into a hub of album cards`

**Notes**: HUB-11 narrowed to `.disc-shell` (the base layout's scroll-to-top `href="#"` sits outside it); AC text amended. Retired with the old index: DISC-01..04/07/09/10 anchor checks, DISC-29..32 hub tracklist/MusicAlbum, IDX-03/IDX-04 (REL-03/REL-04 cover them on the release pages). DISC-05/06 and DISC-14 cover stacking now run on the release pages. Gate: unit 218/218, e2e 316/316.

---

### T3: Single cards without the disclosure ✅

**What**: Rewrite the single card as one anchor (cover, title, year, no platform icons) and loop all singles in one grid without `LOAD MORE`; rewrite `singles.e2e.cjs` and IDX-02.
**Where**: `_includes/discography/single-card.liquid`
**Depends on**: T2
**Reuses**: `catalog.links[slug].page`
**Requirement**: HUB-06, HUB-07, HUB-08

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] 18 `[data-disc-single]` anchors in catalog order, each `href` = `catalog.links[slug].page`, showing cover, title, year
- [ ] No `<details>` and no `[data-disc-link]` on the hub
- [ ] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): show every single as one card link`

**Notes**: Retired DISC-16/17/18/45 (disclosure), DISC-19 icons, DISC-20/09 (folded into HUB-06/08/10). Gate: unit 218/218, e2e 313/313.

---

### T4: Hub CollectionPage and meta description ✅

**What**: Add the `CollectionPage` / `ItemList` JSON-LD for the 21 cards and reword the hub `page_description`; cover-loading checks for the hub.
**Where**: `discography/index.html`
**Depends on**: T3
**Reuses**: `jsonify` filter as in `release.liquid`
**Requirement**: HUB-18, HUB-19, HUB-20

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] One `CollectionPage`, `mainEntity.itemListElement` has 21 items, positions 1..21 match card DOM order, `url` = origin + card `href`, `name` = title
- [ ] Every hub cover from `/assets/images/releases/` with width/height; only the first album cover lacks `loading="lazy"`
- [ ] Meta description names no streaming platform
- [ ] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): describe the hub as a collection of release pages`

**Notes**: HUB-19 cover checks landed with T2 (albums) and T3 (singles). Gate: unit 218/218, e2e 315/315.

---

### T5: Hub card styles ✅

**What**: Album grid (1 column, 3 from 992px), card finish, 3-line description clamp, single anchor card, removal of the dead index / singles-more / single-link rules; rewrite `theme.e2e.cjs` for the hub.
**Where**: `less/discography.less`
**Depends on**: None (Phase 1 complete)
**Reuses**: `.disc-single` / `.song-nav-link` card finish, `.disc-shell a:focus-visible`
**Requirement**: HUB-04, HUB-05, HUB-09, HUB-21, HUB-22, HUB-24

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] At 1280 and 992px the three album cards share one row; at 991 and 375px they stack
- [ ] Description computed `-webkit-line-clamp` is `3` with `overflow: hidden`
- [ ] At 375px at least two singles per row
- [ ] No horizontal overflow at 375, 768, 992, 1280px
- [ ] Focused card shows an outline; zone transparent, panels use the cyber vocabulary
- [ ] Full gate passes

**Tests**: e2e
**Gate**: full

**Commit**: `style(discography): lay out the hub album and single cards`

**Notes**: The cards' `clip-path` cut the shell's outside focus ring (`outline-offset: 4px`), so the cards draw it inside (`-3px`); HUB-22 text amended to require that. `.disc-single-links`/`.disc-single-link` stay: the song dossier still uses them. Gate: unit 218/218, e2e 320/320.

---

### T6: Amend superseded index ACs ✅

**What**: Mark the DISC-* and IDX-* criteria that describe the old index as superseded by `discography-hub` (L-004), naming the replacing HUB-* IDs.
**Where**: `.specs/features/discography-cyberpunk/spec.md`
**Depends on**: T5
**Reuses**: Amendment table format already in that spec
**Requirement**: HUB-01..HUB-24 (traceability upkeep)

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] Every DISC-* AC asserting the old hub (index anchors, per-album links/preview/BUY CD/tracklist/JSON-LD on the index, singles disclosure, single icons) is marked superseded; the same note in `seo-discovery/spec.md` for IDX-01..04
- [ ] Build gate passes

**Tests**: none
**Gate**: build

**Commit**: `docs(spec): mark the old discography index criteria as superseded`

**Notes**: The build gate caught DISC-11 in `tests/band/cyber-links.e2e.cjs` still reading hub buttons; relocated to the release page in `0b4c9bf`. Build gate: unit 218/218, e2e 685/686; the one failure is PS2-23 (`/photos/` viewer), a known pre-existing flake in this environment.

---

## Phase Execution Map

```
Phase 1 → Phase 2

Phase 1:  T1 ------→ T2 ------→ T3 ------→ T4
Phase 2:  T5 ------→ T6
```

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | release template + its tests | ✅ Granular |
| T2 | hub hero + album section | ✅ Cohesive (one file) |
| T3 | single card partial | ✅ Granular |
| T4 | hub JSON-LD + front matter | ✅ Cohesive (one file) |
| T5 | hub styles | ✅ Granular |
| T6 | spec amendments | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | - | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | None (Phase 1 complete) | - | ✅ Match |
| T6 | T5 | T5 → T6 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Liquid template + existing JS paths | e2e | e2e | ✅ OK |
| T2 | Liquid template | e2e | e2e | ✅ OK |
| T3 | Liquid template | e2e | e2e | ✅ OK |
| T4 | Liquid template (JSON-LD) | e2e | e2e | ✅ OK |
| T5 | Less | e2e | e2e | ✅ OK |
| T6 | Spec documents | none | none | ✅ OK |
