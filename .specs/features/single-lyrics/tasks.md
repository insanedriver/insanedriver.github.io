# Single Lyrics Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/single-lyrics/design.md`
**Status**: In Progress

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: `package.json` scripts, `playwright.config.cjs`, `.specs/LESSONS.md` (L-004, L-024, L-037); no coverage threshold configured - strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Lyrics / JSON data files | unit | Every data AC (SLYR-02 labels, SLYR-19, SLYR-20) on both singles | `tests/seo/*-data.test.cjs` | `npm run test:unit` |
| Catalog builder (`lib/catalog.js`) | unit | 1:1 to SLYR-01/03/04/05/08/09/12 with fixtures, each error path alone (L-024) | `tests/seo/catalog.test.cjs` | `npm run test:unit` |
| Liquid templates (markup, JSON-LD, meta) | e2e | Every page AC on both single pages; album song pages keep passing their suites (L-037) | `tests/discography/*.e2e.cjs`, `tests/seo/*.e2e.cjs` | `npx playwright test <file>` |
| Liquid front-matter strings with no real data case (SLYR-14) | unit | Render the `page_description` expression with liquidjs | `tests/seo/*.test.cjs` | `npm run test:unit` |
| Spec documents | none | - (build gate only) | `.specs/features/*/spec.md` | build gate only |

## Gate Check Commands

> Generated from codebase - confirm before Execute.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm run build && npm run test:unit && npx playwright test tests/discography tests/seo` |
| Build | After the last task | `npm run build && npm test` |

---

## Execution Plan

### Phase 1: Data, builder and pages

```
T1 → T2 → T3 → T4 → T5
```

---

## Task Breakdown

### T1: Add the single lyrics files

**What**: Write `waiting-for-you.txt`/`.pt.txt` and `the-sun-will-rise.txt`/`.pt.txt` with the grilling edits, plus a data test.
**Where**: `_data/lyrics/singles/`
**Depends on**: None
**Reuses**: `[Label]` format of `_data/lyrics/silicon-fortress/*.txt`
**Requirement**: SLYR-02, SLYR-19, SLYR-20

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Section labels equal SLYR-02's two lists, read with `parseSections`
- [x] `.pt.txt` has the same section count; no `'` and no `...` in the four files
- [x] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(lyrics): add the Waiting for You and The Sun Will Rise lyrics`

---

### T2: Build songs from singles in the catalog

**What**: `lib/catalog.js` accepts `songs.json` entries with `single`, per the design.
**Where**: `lib/catalog.js`
**Depends on**: T1
**Reuses**: `albumCode`, `releaseUrl`, the existing song shell and singles loop
**Requirement**: SLYR-01, SLYR-03, SLYR-04, SLYR-05, SLYR-08, SLYR-09, SLYR-12

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Fixture-based tests: URL `/discography/<single>/`, `single: true`, catalog code `<initials>-SINGLE`, cover/alt, prev/next null, no release page, `links[slug].page` = song URL
- [x] Each error alone throws its message (unknown single; missing lyrics)
- [x] Album songs unchanged (existing tests pass untouched)
- [x] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick
**Commit**: `feat(catalog): build a song page for a single that has its own lyrics`

---

### T3: Publish the two single songs at their single URL

**What**: Add both `songs.json` entries (about, duration, Apple track link), derive the song permalink from `song.url`, and amend the tests and specs that pinned the old release list.
**Where**: `_data/songs.json`
**Depends on**: T2
**Reuses**: `discography/song.liquid` pagination
**Requirement**: SLYR-01, SLYR-05, SLYR-10, SLYR-17, SLYR-18

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] `discography/song.liquid` permalink is `{{ song.url | remove_first: '/' }}index.html`
- [x] Release lists in `catalog-data`, `catalog`, `songs-data`, `release.e2e`, `index-links.e2e`, `output` tests drop the two singles; song counts become 24 where they count all songs; sitemap test lists both URLs once
- [x] `seo-discovery` SONG-01/REL-01 amended to point at this spec (L-004)
- [x] Gate check passes: full gate

**Deviation**: the two-item breadcrumbs (SLYR-16) moved here from T5, because the existing CRUMB-01 test pins them on these URLs. The SONG-07 track-URL tests are now scoped to album songs; the singles carry only an Apple track URL (spec Out of Scope). The Waiting for You `about` was reworded so its first sentence is a valid 50-160 character meta description (SEO-07).

**Tests**: e2e
**Gate**: full
**Commit**: `feat(discography): serve Waiting for You and The Sun Will Rise as lyrics pages`

---

### T4: Show single wording in the song meta panel

**What**: `song.single` branches in the meta panel (tab, eyebrow, release line, no album link) plus the single page e2e suite.
**Where**: `_includes/discography/song-bento-meta.liquid`
**Depends on**: T3
**Reuses**: lyrics bento includes
**Requirement**: SLYR-02, SLYR-06, SLYR-07, SLYR-08, SLYR-09, SLYR-10, SLYR-11, SLYR-12, SLYR-21

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] New `tests/discography/single-lyrics.e2e.cjs` covers every listed AC on both pages
- [x] `song-bento.e2e.cjs` still passes on album songs (L-037)
- [x] Gate check passes: full gate

**Tests**: e2e
**Gate**: full
**Commit**: `feat(discography): label a single's song page as a single`

---

### T5: Single SEO on the song page

**What**: `page_description` fallback, `MusicRecording` without `inAlbum`/`position`, two-item breadcrumbs for single songs.
**Where**: `discography/song.liquid`
**Depends on**: T4
**Reuses**: `_includes/seo/breadcrumbs.liquid`, `metaDescription`
**Requirement**: SLYR-13, SLYR-14, SLYR-15, SLYR-16

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] New `tests/seo/single-song.e2e.cjs` covers SLYR-13/15/16 on both pages
- [ ] Unit test renders the `page_description` expression for a single without `about` (SLYR-14)
- [ ] `song.e2e.cjs` and `breadcrumbs.e2e.cjs` still pass
- [ ] Gate check passes: build gate

**Tests**: e2e
**Gate**: build
**Commit**: `feat(seo): describe single songs without an album`

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | 4 data files of one kind + 1 test | ✅ Cohesive |
| T2 | 1 module | ✅ Granular |
| T3 | 1 data file + permalink line + amended tests | ⚠️ Cohesive: the URL switch must land atomically or the suite breaks |
| T4 | 1 include | ✅ Granular |
| T5 | 1 template | ✅ Granular |

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | T2 → T3 | ✅ Match |
| T4 | T3 | T3 → T4 | ✅ Match |
| T5 | T4 | T4 → T5 | ✅ Match |

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | Lyrics data | unit | unit | ✅ OK |
| T2 | Catalog builder | unit | unit | ✅ OK |
| T3 | JSON data + Liquid permalink | e2e | e2e | ✅ OK |
| T4 | Liquid include | e2e | e2e | ✅ OK |
| T5 | Liquid template + front matter | e2e + unit | e2e | ✅ OK |
