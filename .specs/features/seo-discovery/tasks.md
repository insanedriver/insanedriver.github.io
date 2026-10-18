# SEO Discovery Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user - do not proceed without it.**

---

**Design**: `.specs/features/seo-discovery/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec - confirm before Execute. Guidelines found: none (no `AGENTS.md`, `CONTRIBUTING.md`, coverage or lint config) - strong defaults applied. Conventions sampled from `tests/discography/discography-data.test.cjs`, `tests/discography/seo.e2e.cjs`, `tests/home/home-release.test.cjs`, `tests/photos/browser.cjs` (hermetic fixture: aborts every non-local request), `playwright.config.cjs` (Eleventy dev server on :4178), `package.json`. Compiled `assets/css/style.min.css` is committed with every `.less` change. Build output in `docs/` is never committed (gitlink quirk).

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| --- | --- | --- | --- | --- |
| Build-time logic (`lib/catalog.js`, `lib/sitemap.js`) | unit | All branches; 1:1 to SEO-02, LYR-04, LYR-05, REL-01 and the song/single mapping; every listed edge case (first/last track, null links, no video, no about) | `tests/seo/*.test.cjs` | `npm run test:unit` |
| Data files (`_data/songs.json`, `_data/lyrics/`, `_data/videos.json`) | unit | Schema and integrity: every song resolves, every lyrics file matches LYR-01, every `uploadDate` is `YYYY-MM-DD` | `tests/seo/*-data.test.cjs` | `npm run test:unit` |
| Built static output (`sitemap.xml`, `robots.txt`) | unit | Parse the built file after `npm run build`; SEO-01..03 | `tests/seo/output.test.cjs` | `npm run build && npm run test:unit` |
| Page templates and includes | e2e | Every markup AC of the task on every affected URL, without JavaScript where the AC is static; SEO-04..09 iterate every sitemap URL | `tests/seo/*.e2e.cjs` | `npm test` |
| Browser JS (`assets/js/song.js`) | e2e | Facade before click (no iframe, no YouTube request), after click (iframe, autoplay), no-JS link | `tests/seo/video.e2e.cjs` | `npm test` |
| Styles (`less/discography.less`, compiled CSS) | e2e | No horizontal overflow at 320px on a release and a song page | `tests/seo/layout.e2e.cjs` | `npm test` |
| Spec docs | none | - (build gate only) | - | build gate only |

## Gate Check Commands

> No linter or formatter is configured, so the Build gate is build + the full test suite.

| Gate Level | When to Use | Command |
| --- | --- | --- |
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with e2e tests | `npm test` |
| Build | After phase completion or output-file tasks | `npm run build && npm test` |

---

## Execution Plan

Phases run in order; tasks inside a phase run in order.

### Phase 1: Crawl foundation

```
T1 → T2 → T3
T1 → T3
T3 → T4 → T5 → T6
```

### Phase 2: Copy and identity

```
T7 → T8 → T9
```

### Phase 3: Song data

```
T10 → T11 → T13
T12 → T13 → T14
```

### Phase 4: Release and song pages

```
T15 → T16 → T17 → T18 → T19
```

### Phase 5: Linking

```
T20 → T21
```

---

## Task Breakdown

### T1: Sitemap selection rule

**What**: Pure `selectSitemapEntries(items)` in `lib/sitemap.js` that keeps `.html` outputs whose data has no `sitemap: false` and whose `page_robots` contains neither `noindex` nor `nofollow`, sorted by URL; add `lib/` to `.eleventyignore`.
**Where**: `lib/sitemap.js`
**Depends on**: None
**Reuses**: none
**Requirement**: SEO-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] Unit tests cover: kept page, `sitemap: false`, `noindex`, `nofollow`, non-HTML output, missing `page_robots` (kept).
- [x] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(seo): add the sitemap selection rule`

---

### T2: Publish robots.txt

**What**: Write `robots.txt` with `User-agent: *`, `Allow: /`, `Sitemap: https://insanedriver.com.br/sitemap.xml` and add it to the passthrough copy.
**Where**: `robots.txt` (and `.eleventy.js` passthrough line)
**Depends on**: T1
**Reuses**: existing `addPassthroughCopy` calls
**Requirement**: SEO-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [x] A unit test reads the built `docs/robots.txt` and asserts the three lines.
- [x] Gate check passes: `npm run build && npm test`

**Tests**: unit
**Gate**: build

**Commit**: `feat(seo): publish robots.txt with the sitemap`

---

### T3: Generate sitemap.xml

**What**: `sitemap.liquid` (permalink `sitemap.xml`) rendering `collections.all | sitemapEntries` with absolute `https://insanedriver.com.br` URLs; register the filter; set `sitemap: false` on `/preorder/`, `/pre-save/` and the four `/reward/*` pages.
**Where**: `sitemap.liquid` (and `.eleventy.js`, front matter of `preorder/`, `pre-save/`, `reward/*/index.html`)
**Depends on**: T1, T2
**Reuses**: `lib/sitemap.js`
**Requirement**: SEO-01, SEO-02

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A unit test parses built `docs/sitemap.xml`: valid XML, absolute `<loc>` ending in `/`, exactly the 9 current indexable URLs, none of the excluded ones.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: unit
**Gate**: build

**Commit**: `feat(seo): generate sitemap.xml from the indexable pages`

---

### T4: Shared SEO head include

**What**: `_includes/head/seo.liquid` with title, description, robots, absolute canonical, OG and Twitter tags (defaults: hero image, `website`); `base.html` and `home.html` use it instead of `head/title`, the description/robots lines of `head/metatags` and their inline canonical/OG; drop the fixed description prefix.
**Where**: `_includes/head/seo.liquid` (and `_layouts/base.html`, `_layouts/home.html`, `_includes/head/metatags.liquid`)
**Depends on**: T3
**Reuses**: current OG block in `_layouts/home.html:15-23`
**Requirement**: SEO-04, SEO-05, SEO-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/head.e2e.cjs` reads every URL from `docs/sitemap.xml` and asserts SEO-04, SEO-05, SEO-06 on each (without JavaScript).
- [ ] Existing home and discography e2e tests still pass.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(seo): share one head include with absolute canonicals and OG`

---

### T5: Fix the /dates/ head

**What**: Give `/dates/` front matter (`page_title`, `page_description`, `page_robots`) and replace its hand-written title/meta/canonical with `{% include 'head/seo' %}`; body untouched.
**Where**: `dates/index.html`
**Depends on**: T4
**Reuses**: `_includes/head/seo.liquid`
**Requirement**: SEO-04, SEO-05, SEO-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `/dates/` is in the sitemap and passes the T4 head test.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `fix(dates): use the shared SEO head`

---

### T6: Repair /pre-save/

**What**: Remove the nested `<!DOCTYPE>`/`<html>` from `pre-save/index.html` and set `page_robots: noindex, follow` with its own description.
**Where**: `pre-save/index.html`
**Depends on**: T5
**Reuses**: none
**Requirement**: SEO-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] An e2e test asserts one doctype, one `<html>` and the robots meta on `/pre-save/`.
- [ ] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `fix(pre-save): drop the nested document and keep it out of the index`

---

### T7: Unique titles and descriptions

**What**: Rewrite `page_description` of every indexable page (50–160 chars, genre-led on `/` and `/band/`), set the home `seo_title` to `Insane Driver – Hard Rock & Heavy Metal Band from Brazil`, and fix the videos/contact/newsletter copy.
**Where**: front matter of `index.html`, `band/`, `contact/`, `discography/`, `newsletter/`, `photos/`, `store/`, `videos/` index files
**Depends on**: None
**Reuses**: `_includes/head/seo.liquid`
**Requirement**: SEO-07, SEO-08, SEO-09, SEO-11, GEN-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/head.e2e.cjs` asserts SEO-07, SEO-08, SEO-09 across all sitemap URLs, SEO-11 and GEN-06.
- [ ] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(seo): give every page a unique genre-aware description`

---

### T8: MusicGroup JSON-LD include

**What**: Move the home `MusicGroup` block into `_includes/seo/music-group.liquid` with genres `Hard Rock, Heavy Metal, Metalcore`, `Place` `São Paulo, Brazil`, the `open.spotify.com` artist URL and Bandcamp in `sameAs`; include it on `/` and `/band/`.
**Where**: `_includes/seo/music-group.liquid` (and `index.html`, `band/index.html`)
**Depends on**: T7
**Reuses**: current block at `index.html:222-240`
**Requirement**: GEN-01, GEN-02, GEN-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/identity.e2e.cjs` parses the block on both pages and asserts GEN-01..03.
- [ ] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(seo): describe the band as hard rock, heavy metal and metalcore from São Paulo`

---

### T9: Bio copy and "For fans of" line

**What**: Rework the `/band/` bio to name hard rock, heavy metal, metalcore and São Paulo, Brazil; add `_includes/seo/fans-of.liquid` and include it on `/` and `/band/`, styled in the page's existing eyebrow style.
**Where**: `_includes/seo/fans-of.liquid` (and `band/index.html`, `index.html`, `less/band.less`, `less/home.less`)
**Depends on**: T8
**Reuses**: `.disc-eyebrow` look
**Requirement**: GEN-04, GEN-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/identity.e2e.cjs` asserts GEN-04 and the visible GEN-05 line on `/` and `/band/`.
- [ ] Existing band and home layout tests still pass.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: build

**Commit**: `feat(band): name the genres and the bands fans will know`

---

### T10: Convert the lyrics

**What**: `scripts/convert-lyrics.py` converts the 21 docx files to `_data/lyrics/<album>/<song>.txt` (title and `Tema:` lines dropped, trailing spaces trimmed, blank-line runs collapsed); run it, move `assets/lyrics/` docx/pdf to `../lyrics-originals/`, delete the `~$` lock files.
**Where**: `scripts/convert-lyrics.py` (and generated `_data/lyrics/**/*.txt`)
**Depends on**: None
**Reuses**: stdlib `zipfile`
**Requirement**: LYR-01, LYR-02, LYR-03

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/lyrics-data.test.cjs` asserts 20 `.txt` files, no `Tema:` line, no title line, and no `assets/lyrics/` or `~$` file in the repo.
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(lyrics): convert the band's lyric sheets to text`

---

### T11: Song metadata

**What**: `_data/songs.json` with the 22 songs (`slug`, `album`, `instrumental`, `about`) and `releases` copy for the 3 albums and the 4 single pages; About texts rewritten from Bandcamp + `Tema:` (never verbatim).
**Where**: `_data/songs.json`
**Depends on**: T10
**Reuses**: Bandcamp texts in the session scratchpad
**Requirement**: LYR-04, SONG-06

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/songs-data.test.cjs` asserts 22 songs, slugs unique, every song resolves to a track of its album, instrumental exactly for `endless-path` and `back-to-1994`, `about` present for the 11 agreed songs, copy present for the 7 release pages.
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(discography): add song metadata and release copy`

---

### T12: Video upload dates

**What**: Add `uploadDate` (`YYYY-MM-DD`, read from each public YouTube watch page) to `_data/videos.json`; leave it out where the date cannot be found.
**Where**: `_data/videos.json`
**Depends on**: None
**Reuses**: none
**Requirement**: SONG-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A unit test asserts every present `uploadDate` matches `YYYY-MM-DD`; existing videos tests still pass.
- [ ] Gate check passes: `npm test`

**Tests**: unit
**Gate**: full

**Commit**: `feat(videos): record each video's upload date`

---

### T13: Catalog builder

**What**: `lib/catalog.js` with `songKey()` and `build()` producing `SongPage[]` and `ReleasePage[]` per the design, throwing the LYR-04/LYR-05 errors.
**Where**: `lib/catalog.js`
**Depends on**: T11, T12
**Reuses**: slug style of `discography.json`
**Requirement**: LYR-04, LYR-05, REL-01, SONG-01, SONG-02, SONG-08, SONG-10

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/catalog.test.cjs` covers: 22 songs with URLs, the exact REL-01 release list, every single folded per the spec mapping, deluxe tracks resolving to base-album songs, prev/next (first/last omitted), sections parsing (labelled and unlabelled), instrumental, missing lyrics error, unknown track error, video match and no-match.
- [ ] Gate check passes: `npm run test:unit`

**Tests**: unit
**Gate**: quick

**Commit**: `feat(discography): build release and song page models`

---

### T14: Catalog global data

**What**: `_data/catalog.js` loads discography, songs, lyrics and videos from disk and returns `build()`; exports `build` for tests.
**Where**: `_data/catalog.js`
**Depends on**: T13
**Reuses**: `_data/homeRelease.js` pattern
**Requirement**: SONG-01, REL-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] A unit test calls the data function and gets 22 songs and 7 releases from the real files.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: unit
**Gate**: build

**Commit**: `feat(discography): expose the catalog to templates`

---

### T15: Extract the platform links include

**What**: Move the primary/secondary platform buttons of `discography/index.html` into `_includes/discography/links.liquid` (parameterised by a `release` variable) with identical output.
**Where**: `_includes/discography/links.liquid` (and `discography/index.html`)
**Depends on**: None
**Reuses**: `discography/index.html:43-61`
**Requirement**: IDX-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] All existing `tests/discography/*` pass unchanged.
- [ ] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `refactor(discography): share the platform links markup`

---

### T16: Release pages

**What**: `discography/release.liquid` paginating `catalog.releases` to `/discography/<slug>/` with cover, h1, year/type, description, tracklist links, platform links, fans-of line, `MusicAlbum` JSON-LD and computed `page_title`/`page_description`/`og_image`.
**Where**: `discography/release.liquid`
**Depends on**: T15
**Reuses**: `_includes/discography/links.liquid`, `.cyber-panel` frame, album JSON-LD shape
**Requirement**: REL-01, REL-02, REL-03, REL-04, REL-05, REL-06, GEN-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/release.e2e.cjs` asserts every REL AC on all 7 pages and that no other release URL exists; T4/T7 head tests pass on the new URLs.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): give every album its own page`

---

### T17: Song pages

**What**: `discography/song.liquid` paginating `catalog.songs` to `/discography/<album>/<song>/` with h1, album link, lyrics sections or `Instrumental`, About, platform links, Also released as, prev/next, fans-of line, `MusicRecording` JSON-LD with `lyrics.text`.
**Where**: `discography/song.liquid`
**Depends on**: T16
**Reuses**: `_includes/discography/links.liquid`, `.cyber-panel` frame
**Requirement**: SONG-01, SONG-02, SONG-03, SONG-04, SONG-05, SONG-06, SONG-07, SONG-08, SONG-09, SONG-10, GEN-05

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/song.e2e.cjs` asserts every listed AC on all 22 pages plus the edge cases (no About heading, first/last track, null platform).
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): publish a lyrics page for every song`

---

### T18: Video facade

**What**: Song page facade link (thumbnail, title, watch URL) plus `assets/js/song.js` that swaps it for a `youtube-nocookie` autoplay iframe on click, and the `VideoObject` JSON-LD when `uploadDate` exists.
**Where**: `assets/js/song.js` (and the video block of `discography/song.liquid`)
**Depends on**: T17
**Reuses**: `posterUrl`/`watchUrl` from `assets/js/videos-core.js`, embed host from `assets/js/videos.js:23`
**Requirement**: SONG-11, SONG-12, SONG-13, SONG-14, SONG-15

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/video.e2e.cjs` asserts the facade on a song with video, none on a song without, no iframe and no YouTube request before click, the iframe after click, the plain link without JS, and the `VideoObject` fields.
- [ ] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): play song videos only on demand`

---

### T19: Release and song page styles

**What**: Styles for the release and song page blocks (lyrics sections, About, Also released as, prev/next, facade) in `less/discography.less`; recompile.
**Where**: `less/discography.less` (and compiled `assets/css/style.min.css`)
**Depends on**: T18
**Reuses**: existing `.disc-*` rules and cyberpunk palette
**Requirement**: Edge case: 320px overflow

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/layout.e2e.cjs` asserts no horizontal overflow at 320px on `/discography/silicon-fortress/` and `/discography/silicon-fortress/faceless-demons/`.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: build

**Commit**: `style(discography): style the release and song pages`

---

### T20: Link the discography index

**What**: On `/discography/`, album titles and covers link to their release page, singles link to their release or song page, tracklist rows link to song pages.
**Where**: `discography/index.html` (and `_includes/discography/single-card.liquid`)
**Depends on**: None
**Reuses**: `catalog.links` from T14
**Requirement**: IDX-01, IDX-02, IDX-03, IDX-04

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] `tests/seo/index-links.e2e.cjs` asserts IDX-01..03; all existing `tests/discography/*` pass.
- [ ] Gate check passes: `npm test`

**Tests**: e2e
**Gate**: full

**Commit**: `feat(discography): link the index to release and song pages`

---

### T21: Breadcrumbs

**What**: `BreadcrumbList` JSON-LD (`Discography` → album → song) on release and song pages via `_includes/seo/breadcrumbs.liquid`.
**Where**: `_includes/seo/breadcrumbs.liquid`
**Depends on**: T20
**Reuses**: none
**Requirement**: CRUMB-01

**Tools**:

- MCP: NONE
- Skill: NONE

**Done when**:

- [ ] An e2e test parses the block on one release and one song page and asserts names and absolute URLs.
- [ ] Final sitemap test asserts 38 URLs.
- [ ] Gate check passes: `npm run build && npm test`

**Tests**: e2e
**Gate**: build

**Commit**: `feat(seo): add breadcrumbs to release and song pages`

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5

Phase 1:  T1 → T2 → T3 → T4 → T5 → T6
Phase 2:  T7 → T8 → T9
Phase 3:  T10 → T11 → T13 → T14
          T12 → T13
Phase 4:  T15 → T16 → T17 → T18 → T19
Phase 5:  T20 → T21
```

Execution is strictly sequential.

`validate_tasks.py` warns on multi-file `Where` for T2–T4, T8, T9, T15, T18–T20. Each pairs a new include, filter or script with the one place that consumes it, or a `.less` file with its compiled CSS; split apart, neither half would be testable on its own (merge-backward rule).

---

## Validation

### Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | 1 function | ✅ |
| T2 | 1 file + 1 config line | ✅ |
| T3 | 1 template + filter wiring + exclusion flags | ⚠️ cohesive (one sitemap) |
| T4 | 1 include wired into 2 layouts | ⚠️ cohesive (one head) |
| T5 | 1 file | ✅ |
| T6 | 1 file | ✅ |
| T7 | front matter copy across 8 pages | ⚠️ cohesive (uniqueness only testable as a set) |
| T8 | 1 include + 2 includes-in | ✅ |
| T9 | 1 include + bio copy + styles | ⚠️ cohesive |
| T10 | 1 script + its output | ✅ |
| T11 | 1 data file | ✅ |
| T12 | 1 data file | ✅ |
| T13 | 1 module | ✅ |
| T14 | 1 data module | ✅ |
| T15 | 1 include extraction | ✅ |
| T16 | 1 template | ✅ |
| T17 | 1 template | ✅ |
| T18 | 1 script + its markup block | ✅ |
| T19 | 1 stylesheet | ✅ |
| T20 | 1 template + 1 include | ✅ |
| T21 | 1 include | ✅ |

### Diagram-Definition Cross-Check

| Task | Depends On (body) | Diagram Shows | Status |
| --- | --- | --- | --- |
| T1 | None | - | ✅ |
| T2 | T1 | T1 → T2 | ✅ |
| T3 | T1, T2 | T1 → T3, T2 → T3 | ✅ |
| T4 | T3 | T3 → T4 | ✅ |
| T5 | T4 | T4 → T5 | ✅ |
| T6 | T5 | T5 → T6 | ✅ |
| T7 | None (phase 1 done) | - | ✅ |
| T8 | T7 | T7 → T8 | ✅ |
| T9 | T8 | T8 → T9 | ✅ |
| T10 | None | - | ✅ |
| T11 | T10 | T10 → T11 | ✅ |
| T12 | None | - | ✅ |
| T13 | T11, T12 | T11 → T13, T12 → T13 | ✅ |
| T14 | T13 | T13 → T14 | ✅ |
| T15 | None (phase 3 done) | - | ✅ |
| T16 | T15 | T15 → T16 | ✅ |
| T17 | T16 | T16 → T17 | ✅ |
| T18 | T17 | T17 → T18 | ✅ |
| T19 | T18 | T18 → T19 | ✅ |
| T20 | None (phase 4 done) | - | ✅ |
| T21 | T20 | T20 → T21 | ✅ |

### Test Co-location Validation

| Task | Code Layer | Matrix Requires | Task Says | Status |
| --- | --- | --- | --- | --- |
| T1 | build-time logic | unit | unit | ✅ |
| T2 | built static output | unit | unit | ✅ |
| T3 | built static output | unit | unit | ✅ |
| T4 | templates/includes | e2e | e2e | ✅ |
| T5 | templates | e2e | e2e | ✅ |
| T6 | templates | e2e | e2e | ✅ |
| T7 | templates | e2e | e2e | ✅ |
| T8 | includes | e2e | e2e | ✅ |
| T9 | includes + styles | e2e | e2e | ✅ |
| T10 | data files | unit | unit | ✅ |
| T11 | data files | unit | unit | ✅ |
| T12 | data files | unit | unit | ✅ |
| T13 | build-time logic | unit | unit | ✅ |
| T14 | build-time logic | unit | unit | ✅ |
| T15 | includes | e2e | e2e | ✅ |
| T16 | templates | e2e | e2e | ✅ |
| T17 | templates | e2e | e2e | ✅ |
| T18 | browser JS | e2e | e2e | ✅ |
| T19 | styles | e2e | e2e | ✅ |
| T20 | templates | e2e | e2e | ✅ |
| T21 | includes | e2e | e2e | ✅ |
