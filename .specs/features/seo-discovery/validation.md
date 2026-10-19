# SEO Discovery Validation

**Verdict: FAIL** — 48/48 acceptance criteria have `file:line` evidence that asserts the spec-defined outcome, and the build gate is green (142 unit, 542 e2e, 0 failed). The verdict is FAIL because 3 of 18 sensor mutants survived. All three are in confirmed spec decisions or hardening that no AC names, so the fixes are small additions to existing tests.

**Date**: 2026-10-18
**Spec**: `.specs/features/seo-discovery/spec.md`
**Diff range**: `master..HEAD` (`465e649..c4f2b21`), 23 commits, branch `feature/seo-discovery`
**Verifier**: independent sub-agent (author ≠ verifier). It ran read-only over the real tree. Mutations ran only in a throwaway `git worktree`.

---

## Task Completion

All 22 tasks are ticked in `tasks.md`. Each task landed as one Conventional Commit, after the spec commit `1baa2d8`.

| Phase | Tasks | Commits | Status |
| --- | --- | --- | --- |
| 1 Crawl foundation | T1–T6 | `b55d299`, `bd5e431`, `7743d17`, `57db81b`, `8adb0ca`, `1809fb9` | ✅ Done |
| 2 Copy and identity | T7–T9 | `ef54849`, `99d5fd4`, `d82e477` | ✅ Done |
| 3 Song data | T10–T14, T22 | `8e49789` (T10), `ce03b86` (T11), `bad168d` (T12), `3153cf0` (T13), `faa1e20` (T14), `2920f28` (T22) | ✅ Done (T13 was committed before T10; T13's unit tests use stand-in lyrics, so the order has no effect) |
| 4 Release and song pages | T15–T19 | `84c833b`, `fd05453`, `6b6f313`, `479f1c8`, `5698f3b` | ✅ Done |
| 5 Linking | T20–T21 | `1f26297`, `c4f2b21` | ✅ Done |

---

## Spec-Anchored Acceptance Criteria

### P1: Crawl and understand

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| SEO-01 | `/sitemap.xml` is valid; every `<loc>` is an absolute `https://insanedriver.com.br/...` URL ending in `/` | `tests/seo/output.test.cjs:33-34` - `assert.match(xml, shape)` (declaration + urlset namespace); `:42-43` - `loc.startsWith(ORIGIN + '/')`, `loc.endsWith('/')` | ✅ PASS |
| SEO-02 | All indexable pages and nothing else: no noindex/nofollow pages, `/preorder/`, `/reward/*`, `/pre-save/` or `google*.html` | `tests/seo/output.test.cjs:49` - `deepEqual(sitemapLocs().sort(), [...INDEXABLE, ...RELEASES, ...SONGS])`; `:56-63` exclusions; `tests/seo/sitemap.test.cjs:16-31` - unit tests for `sitemap:false`, noindex and nofollow | ✅ PASS |
| SEO-03 | `robots.txt` has `User-agent: *`, `Allow: /` and `Sitemap: https://insanedriver.com.br/sitemap.xml` | `tests/seo/output.test.cjs:12-14` - `lines.includes(...)` for each exact line | ✅ PASS |
| SEO-04 | One canonical per sitemap page, equal to its `<loc>` | `tests/seo/head.e2e.cjs:41` - `expect(h.canonical).toEqual([loc])` (all 38 URLs) | ✅ PASS |
| SEO-05 | og:type/title/description present; og:url equals the canonical; og:image is absolute; twitter:card is `summary_large_image`; twitter:site is `@insanedriverid` | `tests/seo/head.e2e.cjs:44-52` - `toHaveLength(1)`, `ogUrl toEqual([loc])`, `ogImage toMatch(/^https:\/\/…/)`, the twitter values exact | ✅ PASS |
| SEO-06 | Exactly one `meta[name=description]` | `tests/seo/head.e2e.cjs:55` - `toHaveLength(1)` | ✅ PASS |
| SEO-07 | Every description is 50–160 characters | `tests/seo/head.e2e.cjs:80-81` - `>= 50`, `<= 160` across the sitemap | ✅ PASS |
| SEO-08 | No two sitemap pages share a description | `tests/seo/head.e2e.cjs:84` - `dupes(descriptions) toEqual([])` | ✅ PASS |
| SEO-09 | No two sitemap pages share a `<title>` | `tests/seo/head.e2e.cjs:85` - `dupes(titles) toEqual([])` | ✅ PASS |
| SEO-10 | `/pre-save/` has one doctype, one `<html>` and robots `noindex, follow` | `tests/seo/pre-save.e2e.cjs:7-9` - counts of 1; `:18` - `toEqual(['noindex, follow'])` | ✅ PASS |
| SEO-11 | Home title is `Insane Driver – Hard Rock & Heavy Metal Band from Brazil` | `tests/seo/head.e2e.cjs:90` - `toHaveTitle(<exact>)` | ✅ PASS |

### P1: Genre and audience

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| GEN-01 | `genre` equals `["Hard Rock","Heavy Metal","Metalcore"]` on `/` and `/band/` | `tests/seo/identity.e2e.cjs:25` - `toEqual([...])`, order included | ✅ PASS |
| GEN-02 | `foundingLocation` is a `Place` named `São Paulo, Brazil` | `tests/seo/identity.e2e.cjs:26` - `toEqual({'@type':'Place', name})` | ✅ PASS |
| GEN-03 | `sameAs` contains the 6 profile URLs | `tests/seo/identity.e2e.cjs:27` - `toContain(profile)` for each of `SAME_AS` (`:3-10`) | ✅ PASS |
| GEN-04 | The `/band/` bio contains hard rock, heavy metal, metalcore and São Paulo, Brazil | `tests/seo/identity.e2e.cjs:63-64` - `toContain(words)` on `.cyber-bio-text` | ✅ PASS |
| GEN-05 | The "For fans of …" line is visible on `/`, `/band/`, every release page and every song page | `tests/seo/identity.e2e.cjs:70-73`; `tests/seo/release.e2e.cjs:64` (7 pages); `tests/seo/song.e2e.cjs:182` (22 pages) - `getByText(FANS_OF, {exact}) toBeVisible()` | ✅ PASS |
| GEN-06 | The `/` and `/band/` descriptions contain `hard rock` and `Brazil` | `tests/seo/head.e2e.cjs:96-98` - `toContain` | ✅ PASS |

### P1: Song pages

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| SONG-01 | 22 pages at `/discography/<album>/<song>/` | `tests/seo/song.e2e.cjs:53-54` - the built dirs `toEqual(SONGS urls)` and `toHaveLength(22)`; `tests/seo/catalog.test.cjs:24-31` | ✅ PASS |
| SONG-02 | One page per song; no version gets a page | `tests/seo/song.e2e.cjs:62-73` - 7 version URLs `toBe(404)`; `tests/seo/catalog.test.cjs:25` - URLs are unique | ✅ PASS |
| SONG-03 | One `<h1>` with the song title, plus a link to the album page | `tests/seo/song.e2e.cjs:83-86` - `toHaveCount(1)`, `toHaveText(track.title)`, album link visible | ✅ PASS |
| SONG-04 | Full lyrics, one heading per label, source line breaks | `tests/seo/song.e2e.cjs:95-117` - the rendered label/line sequence `toEqual(expectedSequence(file))` for all 20 songs | ✅ PASS |
| SONG-05 | Instrumentals show `Instrumental` | `tests/seo/song.e2e.cjs:91-92` - `h2 toHaveText('Instrumental')`, no `h3` | ✅ PASS |
| SONG-06 | About text under `About the song`, and no heading without one | `tests/seo/song.e2e.cjs:123-127` - visible + `toHaveText(data.about)` / `toHaveCount(0)` | ✅ PASS |
| SONG-07 | The album's platform links that have a URL | `tests/seo/song.e2e.cjs:131-132` - hrefs `toEqual(linksOf(album))` | ✅ PASS |
| SONG-08 | "Also released as" with title, year, and links or a page link | `tests/seo/song.e2e.cjs:136-144` - rows `toEqual(alsoReleasedAs(s))`, recomputed from the spec mapping; `tests/seo/catalog.test.cjs:85-121` | ✅ PASS |
| SONG-09 | One `MusicRecording` with name, byArtist, inAlbum name+URL, ISO duration and `recordingOf.lyrics.text` equal to the lyrics | `tests/seo/song.e2e.cjs:151-165` - `toHaveLength(1)`, the fields exact, `lyrics.text toBe(file.trim())` | ✅ PASS |
| SONG-10 | Prev/next links to the album's tracks; first and last omit theirs | `tests/seo/song.e2e.cjs:168-179` - href and text, or `toHaveCount(0)`; `tests/seo/catalog.test.cjs:123-132` | ✅ PASS |
| SONG-11 | Facade with `i.ytimg.com/vi/<id>/hqdefault.jpg` and an accessible name containing the title | `tests/seo/video.e2e.cjs:36-39` - img `src` exact; `getByRole('link', {name: title}) toHaveCount(1)` | ✅ PASS |
| SONG-12 | Before activation: no iframe and no youtube(-nocookie) request | `tests/seo/video.e2e.cjs:71-72` - `iframe toHaveCount(0)`, `hits toEqual([])` | ✅ PASS |
| SONG-13 | Activation replaces the facade with an autoplay embed iframe for that id | `tests/seo/video.e2e.cjs:82-85` - `src` = `…youtube-nocookie.com/embed/<id>?autoplay=1`, facade count 0 | ✅ PASS |
| SONG-14 | Without JS the facade is a link to `youtube.com/watch?v=<id>` | `tests/seo/video.e2e.cjs:41-42` - `href` exact, tag `A` | ✅ PASS |
| SONG-15 | `VideoObject` with name, thumbnailUrl, uploadDate and embedUrl | `tests/seo/video.e2e.cjs:47-53` - `toHaveLength(1)` + `toMatchObject` exact values; `tests/seo/videos-data.test.cjs:10-11` - the date format | ✅ PASS (every video has an `uploadDate`, so the "no date, no block" branch is never exercised) |

### P1: Lyrics data

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| LYR-01 | 20 English `.txt` files equal to the docx English part, with no title or `Tema:` line and labels normalized; `.pt.txt` stored and never shown | `tests/seo/lyrics-data.test.cjs:34-37` (20 + 20 files), `:41-46` (no Portuguese), `:50-53` (no title or Tema line), `:58-63` (labels); `tests/seo/catalog-data.test.cjs:28-35` (no `.pt` text in any song) | ⚠️ Spec-precision gap: the clause "equals the English part of the source docx" cannot be tested in the repo, because the originals are deliberately kept out of it (`../lyrics-originals/`). The Verifier checked it by hand: re-running `scripts/convert-lyrics.py ../lyrics-originals _data/discography.json <scratch>` and running `diff -r` against `_data/lyrics` gave **identical** output. |
| LYR-02 | No `assets/lyrics/` in the repo or the build | `tests/seo/lyrics-data.test.cjs:77-78` - `existsSync === false` for both | ✅ PASS |
| LYR-03 | No `~$` file | `tests/seo/lyrics-data.test.cjs:85` - `deepEqual([], …)` | ✅ PASS |
| LYR-04 | Every song resolves to an album and track in `discography.json` | `tests/seo/songs-data.test.cjs:30-35`; `tests/seo/catalog.test.cjs:188-191` - an exact error message | ✅ PASS |
| LYR-05 | A song that is neither instrumental nor has lyrics fails the build, naming the song | `tests/seo/catalog.test.cjs:183` - `throws {message: 'seo-discovery: ghosts has no lyrics file and is not instrumental'}` | ✅ PASS |

### P1: Release pages

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| REL-01 | Pages for exactly the 7 listed releases | `tests/seo/release.e2e.cjs:30-34` - the other releases return `404`; `:43` - the 7 return `200`; `tests/seo/catalog.test.cjs:48-51` | ✅ PASS |
| REL-02 | h1 title, cover with `alt="<title> cover"`, year and type, description paragraph | `tests/seo/release.e2e.cjs:46-57` - h1, `img[alt]` + `src`, `[data-release-meta] toHaveText('<Type> // <year>')`, description `toHaveText(copy)` | ✅ PASS |
| REL-03 | Album pages list every track in order, each linked to its song page | `tests/seo/release.e2e.cjs:70-74` - rows `toEqual(tracks → songUrl)`, deluxe included | ✅ PASS |
| REL-04 | The release's streaming links that have a URL | `tests/seo/release.e2e.cjs:60-61` - `[key, href]` `toEqual` the non-null platforms | ✅ PASS |
| REL-05 | One `MusicAlbum` with name, datePublished, numTracks, byArtist, image, genre, and track URLs pointing to song pages | `tests/seo/release.e2e.cjs:76-87` - the fields exact, `track[].url` = `ORIGIN + songUrl` | ✅ PASS |
| REL-06 | The Eder Franco and live pages link to the Today Is Sunday and Change songs | `tests/seo/release.e2e.cjs:104-106` - `a[href]` count 1 with the song text; `tests/seo/catalog.test.cjs:70-71` | ✅ PASS |

### P2: Discography index

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| IDX-01 | Album title and cover link to the release page | `tests/seo/index-links.e2e.cjs:21-25` | ✅ PASS |
| IDX-02 | A single links to its own page, otherwise to its song page | `tests/seo/index-links.e2e.cjs:32-35` | ✅ PASS |
| IDX-03 | Every tracklist row links to its song page | `tests/seo/index-links.e2e.cjs:44` | ✅ PASS |
| IDX-04 | The DISC-* tests still pass | Gate: all of `tests/discography/*` are green in the 542-test e2e run; the e2e count grew by exactly the 153 new SEO tests (389 → 542), so no existing test was removed | ✅ PASS |

### P3: Breadcrumbs

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| CRUMB-01 | `BreadcrumbList` Discography → album → song with absolute URLs, on release and song pages | `tests/seo/breadcrumbs.e2e.cjs:30` (7 releases), `:37-41` (22 songs) - the full `[type, position, name, item]` lists `toEqual` | ✅ PASS |

**Status**: all 48 ACs are covered. One spec-precision gap (LYR-01's source-equality clause) was verified by hand.

### Extensions beyond the spec (checked for contradictions)

| Extension | Verdict |
| --- | --- |
| `VideoObject.description` and `contentUrl` | Additive. They do not contradict SONG-15, which still asserts its four fields exactly. |
| `MusicAlbum.url`, `description`, `sameAs`, and `track[].url` | REL-05 itself requires `track[].url`. The other fields are additive. `url` is the release page, which the design names as the canonical entity. |
| `MusicRecording.url`, `position`, `image`, `genre` | Additive. `genre` uses the spec's order. |
| Singles have no `MusicAlbum` | Consistent: REL-05 applies only to "album release pages". |
| Instrumentals keep the title `<Song> Lyrics – Insane Driver` | Consistent with the spec's Page titles row, which has no instrumental exception. A product call for the band only: "Lyrics" on a song without words is odd, but changing it is a spec change, not a defect. |

### Data quirk: Firstly My Breakfast

`lib/catalog.js:19-40` (`parseSections`) keeps blank lines inside a section. At `_data/lyrics/insane-driver/firstly-my-breakfast.txt:27-33`, a cue-only `[Chorus]` is followed by a blank line and then a spoken Rimbaud quotation, so the page shows the quotation under the "Chorus" heading.

- **LYR-01: not violated.** The `.txt` matches the source sheet byte for byte; the converter reproduces it.
- **SONG-04: not violated.** Every label has its heading, and the lines and their order match the source.

This is a presentation ambiguity in the source text, not a code defect. Optional fix: add a label such as `[Speech]` before the quotation in the `.txt` and the source sheet, with the band's sign-off.

---

## Discrimination Sensor

Each mutant ran in an isolated `git worktree` at `HEAD` (`node_modules` was symlinked). For every mutant, the Verifier ran a clean `docs/`, `npx @11ty/eleventy`, then the relevant unit and/or e2e files.

The baseline in the worktree was green: 142 unit tests and 153 `tests/seo` e2e tests. The real tree's `git status --porcelain` matched the baseline after both worktree sessions.

| # | File:line | Mutation | Tests run | Killed? |
| --- | --- | --- | --- | --- |
| M1 | `lib/sitemap.js:7` | Robots filter `(noindex\|nofollow)` → `(noindex)` | unit | ✅ Killed (4 failed) |
| M2 | `_includes/head/seo.liquid:11` | Canonical/og:url made relative (`page.url`) | head.e2e | ✅ Killed (38 failed) |
| M3 | `.eleventy.js:68` | `metaDescription` `MAX = 160` → `170` | unit + head.e2e | ✅ Killed (SEO-07) |
| M4 | `preorder/index.html:2` | `sitemap: false` removed (URL count) | unit | ✅ Killed (3 failed) |
| M5 | `_includes/seo/music-group.liquid:9` | Genre order swapped | identity.e2e | ✅ Killed (2 failed) |
| M6 | `_includes/seo/music-group.liquid:18` | Bandcamp dropped from `sameAs` | identity.e2e | ✅ Killed (2 failed) |
| M7 | `lib/catalog.js:61` | Song URL `/discography/<album>/<song>/` → `/discography/<song>/` | unit + song.e2e | ✅ Killed (5 unit, 22 e2e) |
| M8 | `discography/song.liquid:150` | `lyrics.text` truncated to 300 characters | song.e2e | ✅ Killed (19 failed) |
| M9 | `lib/catalog.js:65` | `instrumental` forced to `false` | unit + song.e2e | ✅ Killed (1 unit, 2 e2e) |
| M10 | `assets/js/song.js:5` | Embed host `youtube-nocookie.com` → `youtube.com` | video.e2e | ✅ Killed (SONG-13) |
| M11 | `lib/catalog.js:118` | Deluxe track links point at `/discography/insane-driver-deluxe/<song>/` instead of the base album song | unit + release + index-links | ✅ Killed (2 unit, 2 e2e) |
| M12 | `_includes/seo/breadcrumbs.liquid:12` | Song crumb `item` uses the album URL | breadcrumbs.e2e | ✅ Killed (22 failed) |
| M13 | `.eleventy.js:63` | `jsonify` no longer escapes `<` as `<` | unit + song/release/breadcrumbs/video e2e | ❌ **Survived** (92 passed). No test feeds a `<` through the filter, and current data has none, so a `</script>` in future copy would break the JSON-LD silently. |
| M14 | `discography/song.liquid:17` | Songs with an About text share one album-level description | head.e2e | ✅ Killed (SEO-08) |
| M15 | `discography/song.liquid:64` | YouTube iframe rendered eagerly next to the facade | video.e2e | ✅ Killed (12 failed) |
| M16 | `lib/catalog.js:80` | `next` = position + 2 (off by one) | unit + song.e2e | ✅ Killed (1 unit, 20 e2e) |
| M17 | `discography/song.liquid:16` | Song title `<Song> Lyrics – Insane Driver` → `<Song> – Insane Driver` | head + song e2e | ❌ **Survived** (67 passed). No test asserts the song, album or single title formats from the spec's Page titles row; only SEO-11 (home) is pinned. |
| M18 | `discography/release.liquid:18` | Release `og_image` dropped, so the page falls back to the home hero | head + release e2e | ❌ **Survived** (57 passed). SEO-05 only checks that `og:image` is absolute; the confirmed `og:image` = release cover rule is untested. |

One mutant was discarded as invalid: `lyrics.text` set to the first section joined with `"\n"`. It did not build, because `jsonify` throws on `undefined` (an instrumental has no first section). It is not counted.

**Sensor depth**: expanded, with 18 behaviour-level mutants across the sitemap, head, identity, catalog, templates and facade JS.
**Result**: 15/18 killed, so the sensor gives FAIL.

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code | ✅ Logic sits in two pure modules (`lib/catalog.js`, `lib/sitemap.js`); templates only render |
| Surgical changes | ✅ `discography/index.html` changes only add links; DISC-* tests unchanged and green |
| No scope creep | ✅ The JSON-LD extensions are additive and match schema.org (see above) |
| Matches patterns | ✅ `_data/catalog.js` follows the `homeRelease.js` pattern; all e2e tests use the hermetic `tests/photos/browser.cjs` fixture |
| Spec-anchored outcome check | ✅ Every AC asserts exact values (one spec-precision gap, verified by hand) |
| Per-layer coverage | ⚠️ `jsonify` and `metaDescription` live inline in `.eleventy.js` and have no unit tests. `metaDescription` is covered only through SEO-07; its ellipsis fallback branch is never reached by current data. |
| Every test maps to a requirement | ✅ The footer and Bandcamp tests map to the T8 spec decision; the `/band/` overflow test maps to the T22 decision |
| Documented guidelines | None found (no AGENTS.md or CONTRIBUTING.md); strong defaults applied |

---

## Edge Cases

- [x] No About text, so no heading: `tests/seo/song.e2e.cjs:127`
- [x] First and last track omit prev/next: `tests/seo/song.e2e.cjs:177`, `tests/seo/catalog.test.cjs:125-131`
- [x] A null platform is omitted: `tests/seo/release.e2e.cjs:61`, `tests/seo/song.e2e.cjs:132`
- [x] No matching video, so no facade and no `VideoObject`: `tests/seo/video.e2e.cjs:56-60` (12 songs)
- [x] No overflow at 320px: `tests/seo/layout.e2e.cjs:4-12` (one release page and two song pages; not all 29), `tests/seo/band-overflow.e2e.cjs:4-11`

---

## Gate Check

- **Gate command**: `npm run build && npm test`, run on the real tree
- **Result**: build exit 0; unit 142 passed, 0 failed; e2e 542 passed, 0 failed, 0 skipped, 0 flaky (6.6 min). In total, 684 passed.
- **Test count before the feature** (`master`): 95 unit + 389 e2e = 484
- **Test count after the feature**: 142 unit + 542 e2e = 684
- **Delta**: +200 (+47 unit, +153 e2e). No existing test was removed.
- **Skipped tests**: none
- **Failures**: none. The known-flaky HOME-23, HOME-24 and HOME-29 tests passed first time.

---

## Fix Plans

### Fix 1 (Minor): Pin the release and song page title formats (M17)

- **Root cause**: Only SEO-11 (home) asserts a title. The confirmed Page titles row (`<Song> Lyrics – Insane Driver`, `<Album> (<year>) – Insane Driver Album`, `<Single> (<year>) – Insane Driver Single`) has no AC id and no test.
- **Fix task**: In `tests/seo/song.e2e.cjs` (per song), add `await expect(page).toHaveTitle(\`${s.track.title} Lyrics – Insane Driver\`)`. In `tests/seo/release.e2e.cjs` (per release), add `toHaveTitle(\`${r.title} (${r.year}) – Insane Driver ${r.type === 'SINGLE' ? 'Single' : 'Album'}\`)`.
- **Done when**: M17 is killed.

### Fix 2 (Minor): Pin og:image = release cover on release and song pages (M18)

- **Root cause**: SEO-05 checks only that `og:image` is absolute. The confirmed `og:image` row (release and song pages use `/assets/images/releases/<cover>`) is untested.
- **Fix task**: In `tests/seo/release.e2e.cjs` and `tests/seo/song.e2e.cjs`, assert `meta[property="og:image"]` content equals `https://insanedriver.com.br/assets/images/releases/<cover>` (for songs, the album cover).
- **Done when**: M18 is killed.

### Fix 3 (Minor): Unit-test the `jsonify` filter's `<` escaping (M13)

- **Root cause**: `jsonify` and `metaDescription` are inline in `.eleventy.js`, and no test feeds them edge input.
- **Fix task**:
  - Move both filters into a pure `lib/filters.js` and register them from `.eleventy.js`.
  - In `tests/seo/filters.test.cjs`, assert that `jsonify('</script>')` returns `"</script>"`.
  - In the same file, assert `metaDescription` behaviour: ≤160 is unchanged; multi-sentence text is cut at a sentence boundary; a single sentence over 160 is cut at a word boundary ending in `…` with length ≤160.
- **Done when**: M13 is killed and the ellipsis branch is covered.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| SEO-01 … SEO-11 | Implementing | ✅ Verified |
| GEN-01 … GEN-06 | Implementing | ✅ Verified |
| SONG-01 … SONG-15 | Implementing | ✅ Verified |
| LYR-01 | Implementing | ✅ Verified (source equality checked by hand; spec-precision gap) |
| LYR-02 … LYR-05 | Implementing | ✅ Verified |
| REL-01 … REL-06 | Implementing | ✅ Verified |
| IDX-01 … IDX-04 | Implementing | ✅ Verified |
| CRUMB-01 | Implementing | ✅ Verified |

The ACs are verified. The feature stays open only for the three sensor fix tasks, which harden tests around confirmed spec decisions and do not change behaviour.

---

## Summary

**Overall**: ⚠️ Issues. The verdict is FAIL until Fixes 1–3 kill M13, M17 and M18, followed by a re-verify.

**Spec-anchored check**: 48/48 ACs match the spec outcome; 1 spec-precision gap (LYR-01 source equality, verified by hand).
**Sensor**: 15/18 mutants killed. M13, M17 and M18 survived.
**Gate**: 684 passed (142 unit + 542 e2e), 0 failed.

**What works**:
- The sitemap (38 URLs, exactly the spec's list), robots, absolute canonicals and OG/Twitter tags on every page.
- Unique, length-bounded descriptions and titles.
- The MusicGroup identity on `/` and `/band/`.
- 22 song pages with lyrics matching the source sheets, MusicRecording and lyrics JSON-LD.
- 7 release pages with MusicAlbum.
- A click-only, nocookie video facade with a no-JS fallback.
- Index links and breadcrumbs.

**Issues found**: three surviving mutants, all of them assertions missing around confirmed spec decisions (title formats, cover `og:image`) and around the `jsonify` hardening. See Fix Plans.

**Next steps**:
1. An implementer applies Fixes 1–3. These are test-only, apart from moving the filters into `lib/filters.js`.
2. Re-run the Verifier (iteration 1 of 3).
