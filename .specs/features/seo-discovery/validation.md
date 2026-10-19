# SEO Discovery Validation

## Validation: seo-discovery - FAIL

**Overall verdict: FAIL** (pass 3, T24). Passes 1–2 were PASS at `2746fba`. T24 (`c05356f`) adds per-track links, and its implementation, data and gate are sound, but 3 of 10 sensor mutants survive. Two are data swaps in `_data/songs.json` and one is a release-page subtitle regression. See "Pass 3 (T24)" below. Fix tasks A and B are open.


**Pass 2 verdict: PASS** (re-verification pass 2 of at most 3, superseded by pass 3). All 50 acceptance criteria have `file:line` evidence that asserts the outcome the spec defines. The build gate is green: 147 unit and 542 e2e. The only e2e failure was HOME-23, a known flaky timing test outside the feature, and it passed on re-run. The discrimination sensor killed 15 of 15 mutants. These were the 3 survivors from pass 1, M18 on song pages, and 11 new mutants on surfaces pass 1 did not try. One spec-precision gap is still open: the LYR-01 source-equality clause. It was checked by hand again and the output is identical, so it does not block.

**Date**: 2026-10-18
**Spec**: `.specs/features/seo-discovery/spec.md`
**Diff range**: `master..HEAD` (`465e649..db6bdf7`), 25 commits, branch `feature/seo-discovery`. This pass also inspected the fix commit on its own: `git show db6bdf7` (T23).
**Verifier**: independent sub-agent (author ≠ verifier). It ran read-only over the real tree. Mutations ran only in a throwaway `git worktree`.

**History**: Pass 1 (`eaad593`) returned FAIL. All 48 ACs it counted were covered, the gate was green at 684 tests, but 3 of 18 mutants survived:
- M13: `jsonify` no longer escaped `<`.
- M17: the song title dropped "Lyrics".
- M18: the release `og:image` fell back to the hero image.

Fix task T23 (`db6bdf7`) did three things:
- It added SEO-12 and SEO-13.
- It pinned both in the song and release e2e tests.
- It moved the filters into `lib/filters.js`, with unit tests.

---

## Pass 3 (T24)

**Verdict: FAIL** (T24 fix loop, iteration 1 of at most 3). SONG-07 as reworded by T24 has `file:line` evidence for every clause, the live data is correct for all 22 songs, and the build gate is green: 149 unit and 543 e2e, 0 failures. But the discrimination sensor killed only 7 of 10 mutants. Three survived: two data swaps inside `_data/songs.json` and one release-page subtitle regression in the shared links include.

**Date**: 2026-10-19
**Diff range**: `2746fba..c05356f`. The feature code is the single commit `c05356f` (T24); `9eaad55` only touches the spec docs.
**Verifier**: independent sub-agent (author ≠ verifier). Read-only over the real tree; mutations ran only in a throwaway `git worktree`.

### SONG-07 spec-anchored check

SONG-07 now reads: one link per platform in `_data/platforms.json` that has a URL for the album; the song's own track URL from `_data/songs.json` where it has one (button subtitle `Play the track`), otherwise the album URL; and `MusicRecording.sameAs` lists the song's track URLs.

| Clause | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| Track URL, else album URL | `href` = `songs.json` track URL, or the album URL when there is none | `tests/seo/song.e2e.cjs:156-158` - `expect(links).toEqual(platforms.filter(...).map(p => [p.key, track[p.key] \|\| s.album.links[p.key], ...]))` on all 22 pages; `tests/seo/catalog.test.cjs:208-210` - Ghosts Spotify equals its own URL and differs from the album's, Tidal equals the album's; `:220` - with no track links, `listen.links` deepEqual the album links | ✅ PASS |
| Subtitle | `Play the track` on a primary button with a track URL; otherwise the platform's own `sub` | `tests/seo/song.e2e.cjs:157` - third tuple element `p.primary ? (track[p.key] ? 'Play the track' : p.sub) : null`, read from `.cyber-link-sub` (`:153`) | ✅ PASS for song pages. Every song has Spotify and Apple, so the `p.sub` fallback on a song page is never reached, and no test asserts the release-page subtitle (mutant S6 survived). |
| `sameAs` | The song's track URLs | `tests/seo/song.e2e.cjs:181` - `expect(rec.sameAs).toEqual(platforms.filter(p => data.links[p.key]).map(...))`; `tests/seo/catalog.test.cjs:213` - `deepEqual(s.sameAs, Object.values(own))`; `:222` - `deepEqual(s.sameAs, [])` with no track links; `discography/song.liquid:146-147` omits the key when empty | ✅ PASS |
| Only album platforms | No link for a platform whose album URL is null, even when the song has a track URL | `tests/seo/song.e2e.cjs:156` - expected list is `platforms.filter(p => s.album.links[p.key])`; `tests/seo/catalog.test.cjs:211` - `listen.links.pandora` equals `null`. Mutant S8 (a Pandora track URL on Ghosts) was killed by both. | ✅ PASS |
| Data completeness | Spotify, Apple, YT Music and Deezer track URLs for every song; Bandcamp for Silicon Fortress | `tests/seo/song.e2e.cjs:159` - each of the 4 keys `toBeTruthy()`; `:50-55` - URL shape per platform; `:57` - Spotify ids unique; `:48-49` - Ghosts Spotify and Bandcamp pinned | ✅ PASS for presence and shape. Only Ghosts is pinned to real ids; a swap between two other songs passes (S4, S10). |

Implementation: `lib/catalog.js:71-72` (`listen.links = Object.assign({}, album.links, song.links)`, `sameAs = Object.values(song.links)`), `_includes/discography/links.liquid:6` (subtitle), `discography/song.liquid:44` (passes `song.listen` as `release`), `discography/song.liquid:146-147` (`sameAs`).

### Data spot-check against the live platforms (2026-10-19)

Checked all 22 songs (11 per album), not just 4. The Verifier ran a throwaway script (not committed). For each song it queried:
- the Spotify oEmbed (title),
- the iTunes lookup `?id=<i>` (track name, album, track number),
- the Deezer API `/track/<id>` (title, album, position),
- the YouTube oEmbed for the YT Music `v` id (title).

| Album | Songs | Spotify | Apple | Deezer | YT Music |
| --- | --- | --- | --- | --- | --- |
| Insane Driver | 11/11 | ✅ title matches | ✅ title, album `Insane Driver`, track # = position | ✅ title, album `Insane Driver`, position = tracklist | ✅ title matches |
| Silicon Fortress | 11/11 | ✅ title matches | ✅ title, album `Silicon Fortress`, track # = position | ✅ title, album `Silicon Fortress`, position = tracklist | ✅ title matches |

- **Mismatched songs: none.**
- Spotify oEmbed returns no album, so the Verifier also read the embed page `releaseDate` for 4 tracks: Endless Path and Today Is Sunday are `2016-02-02`, Ghosts and Faceless Demons are `2021-08-27`. These are the base-album dates, not the 2018 deluxe.
- Observation, not a defect: 9 YT Music ids are the official music or lyric videos, titled for example `Insane Driver - Ghosts [Official Lyric Video]`, not the plain art tracks. They play the right song inside the album playlist.
- **Bandcamp could not be checked.** `insanedriverid.bandcamp.com/track/{ghosts-2,faceless-demons-2,back-to-1994}` returned HTTP 200 with a JS `Client Challenge` page, and the archive.org availability API returned 429. Only the URL shape and the Ghosts pin (`song.e2e.cjs:49`) back those 11 URLs.

### Discrimination sensor

**Isolation**:
- **Scratch**: `git worktree add --detach <scratchpad>/verify-wt3 HEAD`, with `node_modules` symlinked.
- **Per mutant**: `git checkout -- .`, apply the edit (each target asserted to occur once), `rm -rf docs`, `npm run build`, `npm run test:unit`, then `playwright test` on `song`, `release`, `index-links` and `head` e2e files.
- **Baseline in the scratch**: 149/149 unit, 86/86 targeted e2e.
- **Real tree**: `git status --porcelain` was recorded before and matched after `git worktree remove --force` and `git worktree prune`. No stash was used.

| # | File:line | Mutation | Killed by | Killed? |
| --- | --- | --- | --- | --- |
| S1 | `lib/catalog.js:71` | Merge order reversed, so the album URL wins | `song.e2e.cjs:156` (22 failed); `catalog.test.cjs:208` | ✅ Killed |
| S2 | `_includes/discography/links.liquid:6` | Subtitle always `p.sub` | `song.e2e.cjs:156` (22 failed) | ✅ Killed |
| S3 | `discography/song.liquid:146-147` | `sameAs` dropped from MusicRecording | `song.e2e.cjs:181` (22 failed) | ✅ Killed |
| S4 | `_data/songs.json:16,18` | Keep Away and Age of Lies Spotify URLs swapped | none: 149 unit and 86 e2e passed | ❌ Survived |
| S5 | `lib/catalog.js:71` | Fallback removed (`Object.assign({}, song.links)`), so Tidal and Amazon vanish | `song.e2e.cjs:156` (22 failed); `catalog.test.cjs:210`, `:220` | ✅ Killed |
| S6 | `_includes/discography/links.liquid:6` | Guard widened to `release.track[p.key] or release.links[p.key]`, so release pages and the index say `Play the track` | none: 149 unit and the **full** 543 e2e passed | ❌ Survived |
| S7 | `lib/catalog.js:72` | `sameAs` also lists the album URLs | `song.e2e.cjs:181` (22 failed); `catalog.test.cjs:213`, `:222` | ✅ Killed |
| S8 | `_data/songs.json` | Ghosts gets a Pandora track URL while the album's Pandora is null | `song.e2e.cjs:156` (1 failed); `catalog.test.cjs:211` | ✅ Killed |
| S9 | `discography/song.liquid:44` | Song page passes `song.album` instead of `song.listen` (the pre-T24 behaviour) | `song.e2e.cjs:156` (22 failed) | ✅ Killed |
| S10 | `_data/songs.json` | Tide of Fears Deezer id set to Buried Thoughts' (`118251268` → `118251270`) | none: 149 unit and 86 e2e passed | ❌ Survived |

**Why they survive**:
- **S4, S10**: `song.e2e.cjs:156-158` and `:181` take their expected values from `songs.json` itself, so cross-wiring between songs is invisible. Only Ghosts is pinned (`:48-49`), and only Spotify ids are checked for uniqueness (`:57`), so a duplicated Deezer id passes.
- **S6**: T24 put a new branch into an include shared with `discography/release.liquid:49` and `discography/index.html:57`, but `release.e2e.cjs:65` reads only `[data-disc-link, href]`, never `.cyber-link-sub`.

**Sensor depth**: expanded, 10 mutants over every T24 branch plus two data faults.
**Result**: 7/10 killed, sensor **FAIL**.

### Gate (real tree)

- `npm run build`: exit 0.
- `npm test`: exit 0. Unit 149 passed, 0 failed, 0 skipped. E2e 543 passed, 0 failed, 0 skipped (6.2 min). HOME-23, HOME-24 and HOME-29 passed on the first run, so nothing needed a re-run.
- **Count**: 692, against 689 at pass 2. T24 added 2 unit tests (`catalog.test.cjs:204`, `:216`) and 1 e2e test (`song.e2e.cjs:46`), and extended the existing per-song test. No test was removed or weakened. The old SONG-07 assertion (`toEqual(linksOf(s.album))`) became the stricter tuple comparison.

### Code quality

| Check | Status |
| --- | --- |
| Minimum code / surgical | ✅ 3 lines in `lib/catalog.js`, one guard in the include, 2 template lines; data limited to `links` |
| Matches patterns | ✅ Reuses the shared include by rebinding `release`, the same way `discography/index.html:57` does |
| Every test maps to a requirement | ✅ All new tests are named and commented SONG-07 |
| Order coupling | ⚠️ Cosmetic. `sameAs` follows the `songs.json` key order (`lib/catalog.js:72`), while `song.e2e.cjs:181` expects the `platforms.json` order. They agree today only because the data was written in platform order. |

### Fix plan

1. **Fix A (Major, S4/S10)**: pin every song's track ids to an independent source. Two options:
   - a checked-in fixture of the 22 × 4 ids verified live in this pass;
   - derived invariants: the Apple URL slug equals the song slug, and the Apple `i=` and Deezer ids increase with tracklist position within an album.

   Also extend the uniqueness check to the Apple, Deezer, YT Music and Bandcamp URLs. Where: `tests/seo/song.e2e.cjs:46-58` or a `tests/seo/songs-data.test.cjs` unit test.
2. **Fix B (Minor, S6)**: on every release page, assert that each primary `.cyber-link-sub` equals the platform's `sub` and that no page outside `/discography/<album>/<song>/` contains `Play the track`. Where: `tests/seo/release.e2e.cjs:65`.

### Pass 3 summary

- **Spec-anchored check**: SONG-07 5/5 clauses evidenced. The 50 other ACs are unchanged since pass 2; T24 touched none of their files except `song.e2e.cjs`, so pass 2's `song.e2e.cjs` line citations after `:45` have shifted. The assertions are unchanged. Re-cite them on the next pass.
- **Data**: 88/88 Spotify, Apple, Deezer and YT Music track URLs open the right song. The 11 Bandcamp URLs could not be checked.
- **Sensor**: 7/10 killed; S4, S6 and S10 survived.
- **Gate**: 149 unit + 543 e2e = 692, 0 failed.

---

## Task Completion

All 23 tasks are ticked in `tasks.md`: 0 open checkboxes, 51 checked. Each task is one Conventional Commit after the spec commit `1baa2d8`.

| Phase | Tasks | Commits | Status |
| --- | --- | --- | --- |
| 1 Crawl foundation | T1–T6 | `b55d299`, `bd5e431`, `7743d17`, `57db81b`, `8adb0ca`, `1809fb9` | ✅ Done |
| 2 Copy and identity | T7–T9 | `ef54849`, `99d5fd4`, `d82e477` | ✅ Done |
| 3 Song data | T10–T14, T22 | `8e49789`, `ce03b86`, `bad168d`, `3153cf0`, `faa1e20`, `2920f28` | ✅ Done |
| 4 Release and song pages | T15–T19 | `84c833b`, `fd05453`, `6b6f313`, `479f1c8`, `5698f3b` | ✅ Done |
| 5 Linking and fix | T20, T21, T23 | `1f26297`, `c4f2b21`, `db6bdf7` | ✅ Done |

---

## Spec-anchored check of the T23 fix

| Item | Spec-defined outcome | Evidence | Result |
| --- | --- | --- | --- |
| SEO-12 song | `<Song> Lyrics – Insane Driver` | `tests/seo/song.e2e.cjs:89` - `toHaveTitle(\`${title} Lyrics – Insane Driver\`)` on all 22 song pages. The suffix strip has no effect on base-album titles. | ✅ |
| SEO-12 album | `<Album> (<year>) – Insane Driver Album` | `tests/seo/release.e2e.cjs:54` - `toHaveTitle(\`${r.title} (${r.year}) – Insane Driver Album\`)` for the 3 albums. The deluxe edition counts as an album (`isAlbum` = type ≠ SINGLE, `:14`), as REL-05 does. | ✅ |
| SEO-12 single | `<Single> (<year>) – Insane Driver Single` | `tests/seo/release.e2e.cjs:54`, same expression, for the 4 single pages. N1 shows the Album/Single branch is checked. | ✅ |
| SEO-13 release | `og:image` = `https://insanedriver.com.br/assets/images/releases/<cover>` | `tests/seo/release.e2e.cjs:55-56` - `toHaveAttribute('content', \`${ORIGIN}/assets/images/releases/${r.cover}\`)` | ✅ |
| SEO-13 song | `og:image` = the album cover | `tests/seo/song.e2e.cjs:90-91` - `toHaveAttribute('content', \`${ORIGIN}/assets/images/releases/${s.album.cover}\`)` | ✅ |
| Filter move | Behaviour unchanged | The `lib/filters.js:2-23` bodies are byte-identical to the removed inline filters in `.eleventy.js`. `.eleventy.js:6,64,67` register them. | ✅ |
| `jsonify` | `<` is escaped and the value round-trips | `tests/seo/filters.test.cjs:5-9` - `!out.includes('<')` and `JSON.parse` deepEqual | ✅ |
| `metaDescription` | ≤160 kept; cut at the last sentence that fits; ellipsis fallback | `tests/seo/filters.test.cjs:15-32` - exact `equal` on the 160-character boundary and the sentence cut; `length <= 160` and `endsWith('word…')` | ✅ |

---

## Spec-Anchored Acceptance Criteria

Pass 2 re-cited every line. Only `release.e2e.cjs` (after `:52`) and `song.e2e.cjs` (after `:87`) shifted, each by +5 lines because of the T23 insertions.

### P1: Crawl and understand

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| SEO-01 | `/sitemap.xml` is valid; every `<loc>` is an absolute `https://insanedriver.com.br/...` URL ending in `/` | `tests/seo/output.test.cjs:33-34` - `assert.match(xml, shape)`; `:42-43` - `startsWith(ORIGIN + '/')`, `endsWith('/')` | ✅ PASS |
| SEO-02 | Exactly the indexable pages, with the listed exclusions | `tests/seo/output.test.cjs:49` - `deepEqual(sorted locs, [...INDEXABLE, ...RELEASES, ...SONGS])`; `:58-62` - exclusions; `tests/seo/sitemap.test.cjs:16-31` - `sitemap:false`, noindex, nofollow | ✅ PASS |
| SEO-03 | `User-agent: *`, `Allow: /`, `Sitemap: https://insanedriver.com.br/sitemap.xml` | `tests/seo/output.test.cjs:12-14` - `lines.includes(<exact line>)` | ✅ PASS |
| SEO-04 | One canonical, equal to the `<loc>` | `tests/seo/head.e2e.cjs:41` - `expect(h.canonical).toEqual([loc])` (38 URLs) | ✅ PASS |
| SEO-05 | OG type/title/description; og:url = canonical; absolute og:image; twitter card/site exact | `tests/seo/head.e2e.cjs:44-52` - `toHaveLength(1)`, `ogUrl toEqual([loc])`, `ogImage toMatch(/^https:\/\/…/)`, `toEqual(['summary_large_image'])`, `toEqual(['@insanedriverid'])` | ✅ PASS |
| SEO-06 | Exactly one description | `tests/seo/head.e2e.cjs:55` - `toHaveLength(1)` | ✅ PASS |
| SEO-07 | 50–160 characters | `tests/seo/head.e2e.cjs:80-81` - `>= 50`, `<= 160`; `tests/seo/filters.test.cjs:15-32` - the truncation branches | ✅ PASS |
| SEO-08 | Unique descriptions | `tests/seo/head.e2e.cjs:84` - `dupes(descriptions) toEqual([])` | ✅ PASS |
| SEO-09 | Unique titles | `tests/seo/head.e2e.cjs:85` - `dupes(titles) toEqual([])` | ✅ PASS |
| SEO-10 | `/pre-save/`: one doctype, one `<html>`, robots `noindex, follow` | `tests/seo/pre-save.e2e.cjs:7-9` - counts of 1; `:18` - `toEqual(['noindex, follow'])` | ✅ PASS |
| SEO-11 | Home title exact | `tests/seo/head.e2e.cjs:90` - `toHaveTitle('Insane Driver – Hard Rock & Heavy Metal Band from Brazil')` | ✅ PASS |
| SEO-12 | Song, album and single title formats | `tests/seo/song.e2e.cjs:89`; `tests/seo/release.e2e.cjs:54` (see the T23 table) | ✅ PASS |
| SEO-13 | og:image = the release cover (for a song, its album's cover) | `tests/seo/release.e2e.cjs:55-56`; `tests/seo/song.e2e.cjs:90-91` | ✅ PASS |

### P1: Genre and audience

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| GEN-01 | `genre` = `["Hard Rock","Heavy Metal","Metalcore"]` on `/` and `/band/` | `tests/seo/identity.e2e.cjs:25` - `toEqual([...])` | ✅ PASS |
| GEN-02 | `foundingLocation` = Place `São Paulo, Brazil` | `tests/seo/identity.e2e.cjs:26` - `toEqual({'@type':'Place', name})` | ✅ PASS |
| GEN-03 | `sameAs` has the 6 profiles | `tests/seo/identity.e2e.cjs:27` - `toContain(profile)` for `SAME_AS` (`:3-10`) | ✅ PASS |
| GEN-04 | The bio names hard rock, heavy metal, metalcore and São Paulo, Brazil | `tests/seo/identity.e2e.cjs:63-64` - `toContain(words)` | ✅ PASS |
| GEN-05 | The "For fans of" line is visible on `/`, `/band/`, release and song pages | `tests/seo/identity.e2e.cjs:70-73`; `tests/seo/release.e2e.cjs:69`; `tests/seo/song.e2e.cjs:187` - `getByText(FANS_OF, {exact}) toBeVisible()` | ✅ PASS |
| GEN-06 | The `/` and `/band/` descriptions contain `hard rock` and `Brazil` | `tests/seo/head.e2e.cjs:96-98` - `toContain` | ✅ PASS |

### P1: Song pages

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| SONG-01 | 22 pages at `/discography/<album>/<song>/` | `tests/seo/song.e2e.cjs:53-54` - built dirs `toEqual(SONGS urls)`, `toHaveLength(22)`; `tests/seo/catalog.test.cjs:24-31` | ✅ PASS |
| SONG-02 | No version page | `tests/seo/song.e2e.cjs:62-72` - 7 version URLs `toBe(404)`; `tests/seo/catalog.test.cjs:25` | ✅ PASS |
| SONG-03 | One h1 with the title, plus an album link | `tests/seo/song.e2e.cjs:83-86` | ✅ PASS |
| SONG-04 | Full lyrics, one heading per label, source line breaks | `tests/seo/song.e2e.cjs:118` - `expect(clean).toEqual(expectedSequence(text))` (20 songs) | ✅ PASS |
| SONG-05 | Instrumentals show `Instrumental` | `tests/seo/song.e2e.cjs:96-97` - `h2 toHaveText('Instrumental')`, `h3 toHaveCount(0)` | ✅ PASS |
| SONG-06 | About text under `About the song` | `tests/seo/song.e2e.cjs:129-130` - visible + `toHaveText(data.about)`; `:132` - `toHaveCount(0)` | ✅ PASS |
| SONG-07 | (Reworded by T24) one link per album platform; track URL else album URL; `Play the track`; `sameAs` | `tests/seo/song.e2e.cjs:156-158`, `:181`; `tests/seo/catalog.test.cjs:204-222` (see Pass 3) | ✅ PASS (sensor gaps S4, S6, S10) |
| SONG-08 | "Also released as" with title, year and links or page | `tests/seo/song.e2e.cjs:149` - `rows toEqual(alsoReleasedAs(s))`; `tests/seo/catalog.test.cjs:85-121` | ✅ PASS |
| SONG-09 | One MusicRecording; name, byArtist, inAlbum, ISO duration, `lyrics.text` | `tests/seo/song.e2e.cjs:156-169` - `toHaveLength(1)`, fields exact, `lyrics.text toBe(file.trim())` | ✅ PASS |
| SONG-10 | Prev/next links, omitted at the ends | `tests/seo/song.e2e.cjs:173-183` - href/text or `toHaveCount(0)`; `tests/seo/catalog.test.cjs:123-132` | ✅ PASS |
| SONG-11 | Facade with the `hqdefault.jpg` thumbnail and the title in its accessible name | `tests/seo/video.e2e.cjs:36-39` | ✅ PASS |
| SONG-12 | No iframe and no YouTube request before activation | `tests/seo/video.e2e.cjs:71-72` | ✅ PASS |
| SONG-13 | Activation gives an autoplay embed for the id | `tests/seo/video.e2e.cjs:82-85` | ✅ PASS |
| SONG-14 | Without JS the facade links to `watch?v=<id>` | `tests/seo/video.e2e.cjs:41-42` | ✅ PASS |
| SONG-15 | VideoObject with name, thumbnailUrl, uploadDate, embedUrl | `tests/seo/video.e2e.cjs:47-53` - `toMatchObject` exact (N10 killed); `tests/seo/videos-data.test.cjs:10-11` | ✅ PASS. Every video has a date, so the "no date, no block" branch is never exercised. |

### P1: Lyrics data

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| LYR-01 | 20 English `.txt` files equal to the docx English part; `.pt.txt` stored and never shown | `tests/seo/lyrics-data.test.cjs:34-37`, `:41-46`, `:50-53`, `:58-63`; `tests/seo/catalog-data.test.cjs:28-35` | ⚠️ Spec-precision gap, the same one as in pass 1. The "equals the source docx" clause cannot be tested in the repo, because the originals are out of the repo by design. Pass 2 checked it by hand again: `python3 -I scripts/convert-lyrics.py ../lyrics-originals _data/discography.json <scratch>`, then `diff -r` against `_data/lyrics`. All 40 files are **identical**. |
| LYR-02 | No `assets/lyrics/` in the repo or the build | `tests/seo/lyrics-data.test.cjs:77-78` | ✅ PASS |
| LYR-03 | No `~$` file | `tests/seo/lyrics-data.test.cjs:85` | ✅ PASS |
| LYR-04 | Songs resolve to an album and track | `tests/seo/songs-data.test.cjs:30-35`; `tests/seo/catalog.test.cjs:188-191` - exact error | ✅ PASS |
| LYR-05 | A song with neither lyrics nor the instrumental mark fails the build, naming the song | `tests/seo/catalog.test.cjs:183` - `throws {message: 'seo-discovery: ghosts has no lyrics file and is not instrumental'}` | ✅ PASS |

### P1: Release pages

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| REL-01 | Exactly the 7 release pages | `tests/seo/release.e2e.cjs:30-34` - others `404`; `:43` - `200`; `tests/seo/catalog.test.cjs:48-51` | ✅ PASS |
| REL-02 | h1, cover with `alt`, year and type, description | `tests/seo/release.e2e.cjs:46-51`, `:58-62` | ✅ PASS |
| REL-03 | Album tracks in order, linked to the song pages | `tests/seo/release.e2e.cjs:75-79` | ✅ PASS |
| REL-04 | The streaming links that have a URL | `tests/seo/release.e2e.cjs:65-66` | ✅ PASS |
| REL-05 | One MusicAlbum with the fields and track URLs | `tests/seo/release.e2e.cjs:81-92` | ✅ PASS |
| REL-06 | The Eder Franco and live pages link to their songs | `tests/seo/release.e2e.cjs:109-111`; `tests/seo/catalog.test.cjs:70-71` | ✅ PASS |

### P2: Discography index

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| IDX-01 | Album title and cover link to the release page | `tests/seo/index-links.e2e.cjs:21-25` | ✅ PASS |
| IDX-02 | A single links to its page, otherwise to its song | `tests/seo/index-links.e2e.cjs:32-35` (N9 killed) | ✅ PASS |
| IDX-03 | Every tracklist row links to its song | `tests/seo/index-links.e2e.cjs:44` (N11 killed) | ✅ PASS |
| IDX-04 | The DISC-* tests still pass | Gate: every test in `tests/discography/*` is green. The e2e count went from 389 on `master` to 542; no test was removed. | ✅ PASS |

### P3: Breadcrumbs

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| CRUMB-01 | `BreadcrumbList` Discography → album → song, with absolute URLs | `tests/seo/breadcrumbs.e2e.cjs:30` (7 releases), `:37-41` (22 songs) | ✅ PASS |

**Status**: all 50 ACs are covered with spec-anchored evidence. One spec-precision gap is flagged, LYR-01's source-equality clause. It was verified by hand and is already recorded as lesson L-033.

The pass 1 notes on extensions beyond the spec and on the Firstly My Breakfast data quirk still apply unchanged. T23 did not touch those surfaces.

---

## Discrimination Sensor

**Isolation**:
- **Scratch**: `git worktree add --detach <scratchpad>/verify-wt2 HEAD`, with `node_modules` symlinked.
- **Per mutant**: `git checkout -- .`, apply the edit (each target must occur exactly once), `rm -rf docs`, `npm run build`, `npm run test:unit`, then the targeted `playwright test` files.
- **Baseline in the scratch**: 147/147 unit tests passed after a clean build.
- **Real tree**: `git status --porcelain` was recorded before the sensor and matched after `git worktree remove --force` and `git worktree prune`. No stash was used.

| # | File:line | Mutation | Killed by | Killed? |
| --- | --- | --- | --- | --- |
| M13 | `lib/filters.js:3` | `jsonify` no longer escapes `<` | `filters.test.cjs:5` (unit) | ✅ Killed |
| M17 | `discography/song.liquid:16` | Song title drops "Lyrics" | `song.e2e.cjs:89`; 22 failed | ✅ Killed |
| M18 | `discography/release.liquid:18` | Release `og_image` removed, so the hero fallback is used | `release.e2e.cjs:55`; 7 failed | ✅ Killed |
| M18s | `discography/song.liquid:18` | Song `og_image` removed, so the hero fallback is used | `song.e2e.cjs:90`; 22 failed | ✅ Killed |
| N1 | `discography/release.liquid:16` | Album/Single type always `Album` | `release.e2e.cjs:54`; the 4 single pages failed | ✅ Killed |
| N2 | `discography/release.liquid:16` | `(<year>)` removed from the release title | `release.e2e.cjs:54`; 7 failed | ✅ Killed |
| N3 | `lib/filters.js:17` | Sentence-cut bound `> MAX` → `> MAX + 40` | `filters.test.cjs:21` (unit) | ✅ Killed |
| N4 | `lib/filters.js:22` | Ellipsis cut `slice(0, MAX - 1)` → `slice(0, MAX + 5)` | `filters.test.cjs:28` (unit) | ✅ Killed |
| N5 | `robots.txt:4` | `Sitemap:` made relative (`/sitemap.xml`) | `output.test.cjs:14` (unit) | ✅ Killed |
| N6 | `pre-save/index.html:7` | robots `noindex, follow` → `noindex, nofollow` | `pre-save.e2e.cjs:18` | ✅ Killed |
| N7 | `band/index.html:5` | "Brazil" removed from the `/band/` description (GEN-06) | `head.e2e.cjs:98` | ✅ Killed |
| N8 | `_includes/seo/fans-of.liquid:1` | "and Avenged Sevenfold" → "& Avenged Sevenfold" | `identity.e2e.cjs:70`, `release.e2e.cjs:69`; 10 failed | ✅ Killed |
| N9 | `lib/catalog.js:134` | A folded single links to `/discography/<single>/` instead of its song | `index-links.e2e.cjs:34`, `catalog.test.cjs:93` | ✅ Killed |
| N10 | `discography/song.liquid:163` | VideoObject `uploadDate` → `<album year>-01-01` | `video.e2e.cjs:48`; 10 failed | ✅ Killed |
| N11 | `discography/index.html:76` | Every tracklist row links to track 1 | `index-links.e2e.cjs:44`, `:56`; 2 failed | ✅ Killed |

The Verifier checked the failure messages for each kill. Each mutant failed on the targeted assertion. Examples:
- M17: Expected `Invisible Chains Lyrics – Insane Driver`, Received `Invisible Chains – Insane Driver`.
- M18: Expected `…/releases/today-is-sunday-eder-franco.jpg`, Received `…/home/hero-1280.jpg`.
- N1: Expected `… Insane Driver Single`, Received `… Album`.

**Sensor depth**: expanded. 4 mutants re-run the pass 1 survivors and their song-page twin, and 11 hit new surfaces: title type and year, the description cut bounds, robots, pre-save, GEN-06, GEN-05, IDX-02, IDX-03 and uploadDate.
**Result (pass 2, historical)**: 15/15 killed, sensor PASS.

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code | ✅ T23 only moves two existing filters into `lib/filters.js` and adds tests |
| Surgical changes | ✅ The fix touches only the files its task lists, plus the spec, tasks and lessons bookkeeping |
| No scope creep | ✅ |
| Matches patterns | ✅ `lib/filters.js` follows `lib/sitemap.js` and `lib/catalog.js`, which are pure modules registered from `.eleventy.js` |
| Spec-anchored outcome check | ✅ (one spec-precision gap, verified by hand) |
| Per-layer coverage | ✅ The pass 1 gap is closed: `jsonify` and `metaDescription` now have unit tests for every branch |
| Every test maps to a requirement | ✅ `filters.test.cjs` maps to SEO-07 and to T23's `<` hardening |
| Documented guidelines | None found; strong defaults applied |

Cosmetic: `tests/seo/song.e2e.cjs:89` repeats the suffix-strip regex inline instead of reusing the file's own `songSlug` helper (`:14`). It has no effect on correctness.

---

## Edge Cases

- [x] No About text, so no heading: `tests/seo/song.e2e.cjs:132`
- [x] First and last tracks omit prev/next: `tests/seo/song.e2e.cjs:182`, `tests/seo/catalog.test.cjs:125-131`
- [x] A null platform is omitted: `tests/seo/release.e2e.cjs:66`, `tests/seo/song.e2e.cjs:137`
- [x] No video, so no facade and no VideoObject: `tests/seo/video.e2e.cjs:56-60`
- [x] No overflow at 320px: `tests/seo/layout.e2e.cjs:4-12` covers 3 sample pages, `tests/seo/band-overflow.e2e.cjs:4-11` covers `/band/`

---

## Gate Check

- **Gate command**: `npm run build && npm test`, run on the real tree
- **Build**: exit 0.
- **Unit**: 147 passed, 0 failed, 0 skipped.
- **E2e**: the first run had 541 passed and 1 failed (7.2 min). The failure was **HOME-23** (`tests/home/loader-style.e2e.cjs:31`), a known flaky timing test. The feature diff does not touch the loader: `less/home.less` and `_layouts/home.html` change only around it. `npx playwright test tests/home/loader` was then run 3 times. It gave 27/27, 27/27, and 26/27 (HOME-23 again), so the test is intermittent rather than broken. HOME-24 and HOME-29 passed every time.
- **Gate result**: 689 tests; 0 deterministic failures.
- **Test count before the feature** (`master`): 95 unit + 389 e2e = 484
- **Test count after the feature**: 147 unit + 542 e2e = 689. Pass 1 counted 684; T23 added the 5 `filters.test.cjs` unit tests, and its e2e assertions went into existing tests.
- **Delta**: +205 (+52 unit, +153 e2e). No test was removed or weakened.
- **Skipped tests**: none

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| SEO-01 … SEO-13 | Implementing | ✅ Verified |
| GEN-01 … GEN-06 | Implementing | ✅ Verified |
| SONG-01 … SONG-15 | Implementing | ✅ Verified |
| LYR-01 | Implementing | ✅ Verified (source equality checked by hand; spec-precision gap) |
| LYR-02 … LYR-05 | Implementing | ✅ Verified |
| REL-01 … REL-06 | Implementing | ✅ Verified |
| IDX-01 … IDX-04 | Implementing | ✅ Verified |
| CRUMB-01 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ❌ Not ready. Pass 3 (T24) sensor FAIL: fix tasks A and B. The pass 2 summary below is kept as history.

**Spec-anchored check**: 50/50 ACs match the spec outcome; 1 spec-precision gap (LYR-01 source equality, verified by hand).
**Sensor**: 15/15 mutants killed (M13, M17, M18, M18s, and N1–N11).
**Gate**: 147 unit + 542 e2e. The only failure was the known-flaky HOME-23, outside the feature diff.

**Issues found**: none blocking. Non-blocking items:
1. LYR-01's source-equality clause is still a hand check, as lesson L-033 records.
2. HOME-23 is intermittent outside this feature and is worth its own fix.
3. A cosmetic duplicated regex at `tests/seo/song.e2e.cjs:89`.

**Next steps**: The feature is done. The off-site checklist and the manual Rich Results check remain, as the spec defines them.
