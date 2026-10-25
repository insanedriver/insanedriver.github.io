# Single Lyrics Validation

**Date**: 2026-10-25
**Spec**: `.specs/features/single-lyrics/spec.md`
**Diff range**: `master..feature/single-lyrics` (b959dd7..4252510, 6 commits)
**Verifier**: independent sub-agent (author ≠ verifier)

**Verdict**: PASS ✅

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | fcbf7e3 - 4 lyrics files + data tests |
| T2 | ✅ Done | 5ff431f - `lib/catalog.js` single songs |
| T3 | ✅ Done | 9dbdbf5 - `songs.json` entries, permalink from `song.url`; documented deviation (SLYR-16 moved here) |
| T4 | ✅ Done | 519eda0 - meta panel single wording |
| T5 | ✅ Done | 4252510 - description fallback, JSON-LD without album, 2-item breadcrumbs |

---

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| SLYR-01 | song `url` = `/discography/<slug>/`, page rendered there | `tests/seo/catalog.test.cjs:369` - `assert.equal(s.url, '/discography/waiting-for-you/')`, `s.single === true`; `tests/seo/catalog.test.cjs:31-32` real data both URLs; `tests/discography/single-lyrics.e2e.cjs:36` - `expect(res.status()).toBe(200)` on both URLs | ✅ PASS |
| SLYR-02 | sections in file order with the two exact label lists | `tests/seo/lyrics-data.test.cjs:82` - `deepEqual(labels('singles/waiting-for-you.txt'), ['Verse 1','Pre-Chorus','Chorus','Verse 2','Pre-Chorus','Chorus'])` and TSWR 10-item list; `tests/discography/single-lyrics.e2e.cjs:41` - `expect(labels).toEqual(s.sections)` + `:46` every file line on page; `tests/seo/catalog.test.cjs:380` reads `singles/<slug>` key | ✅ PASS |
| SLYR-03 | throws `seo-discovery: <slug> has no lyrics file and is not instrumental` | `tests/seo/catalog.test.cjs:387-391` - `assert.throws(..., { message: 'seo-discovery: waiting-for-you has no lyrics file and is not instrumental' })` | ✅ PASS |
| SLYR-04 | throws `seo-discovery: <slug> references unknown single` | `tests/seo/catalog.test.cjs:394-397` - `{ message: 'seo-discovery: no-such-single references unknown single' }` | ✅ PASS |
| SLYR-05 | no release page; `links[slug].page` = song URL | `tests/seo/catalog.test.cjs:402-403` - `releases.some(slug==='waiting-for-you') === false`, `links['waiting-for-you'].page === '/discography/waiting-for-you/'`; `:49` + `tests/seo/catalog-data.test.cjs:9` exact 6-release list | ✅ PASS |
| SLYR-06 | `.song-bento--lyrics` | `tests/discography/single-lyrics.e2e.cjs:37` - `toHaveCount(1)`; `tests/seo/catalog.test.cjs:337-340` layout `lyrics` | ✅ PASS |
| SLYR-07 | tab `SINGLE::<year>`, eyebrow `Single // <year>`, `Runtime 3:38`/`4:41`, `Single · Released <year>`, no `[data-song-album]` | `tests/discography/single-lyrics.e2e.cjs:52` - `toHaveText('SINGLE::'+year)`; `:54-56` `toContain` eyebrow/runtime/release line; `:59` `[data-song-album]` `toHaveCount(0)` | ✅ PASS |
| SLYR-08 | `CATALOG: WFY-SINGLE // ALL EDITIONS LISTED` (TSWR) | `tests/discography/single-lyrics.e2e.cjs:68` - `toHaveText('CATALOG: '+code+' // ALL EDITIONS LISTED')`; `tests/seo/catalog.test.cjs:411-412` | ✅ PASS |
| SLYR-09 | cover `/assets/images/releases/<cover>`, alt `<title> single cover` | `tests/discography/single-lyrics.e2e.cjs:61-62` - `toHaveAttribute('src', ...)`, `toHaveAttribute('alt', title+' single cover')`; `tests/seo/catalog.test.cjs:416` | ✅ PASS |
| SLYR-10 | About text = `songs.json` `about` | `tests/discography/single-lyrics.e2e.cjs:67` - `toHaveText(about(s.slug))` | ✅ PASS |
| SLYR-11 | single links overridden by song links (Apple `?i=` track, sub `Play the track`); every uplink + LISTEN NOW `data-disc-slug=<single slug>` | `tests/discography/single-lyrics.e2e.cjs:76` - `expect(shown).toEqual(s.uplink)` (exact key/href/sub); `:79` every `a[data-disc-link]` (incl. LISTEN NOW, which carries `data-disc-link="spotify"`) slug `toBe(s.slug)`; `:80` LISTEN NOW href | ✅ PASS |
| SLYR-12 | no `.song-nav` | `tests/discography/single-lyrics.e2e.cjs:85` - `toHaveCount(0)`; `tests/seo/catalog.test.cjs:430` prev/next null | ✅ PASS |
| SLYR-13 | title `<title> Lyrics – Insane Driver`; description = `metaDescription(about)` | `tests/seo/single-song.e2e.cjs:25-26` - `toHaveTitle(...)`, `toHaveAttribute('content', metaDescription(about))`; `tests/seo/song-template.test.cjs:22` | ✅ PASS |
| SLYR-14 | fallback `Lyrics of "<title>", Insane Driver's <year> single – hard rock, heavy metal and metalcore from São Paulo, Brazil.` | `tests/seo/song-template.test.cjs:16-19` - renders the real front-matter expression, `assert.equal(..., exact string)` | ✅ PASS |
| SLYR-15 | one MusicRecording; url, `PT3M38S`/`PT4M41S`, image, trimmed lyrics, no `inAlbum`/`position` | `tests/seo/single-song.e2e.cjs:32-41` - `toHaveLength(1)`, `rec.url`, `rec.duration`, `rec.image`, `rec.recordingOf.lyrics.text === trimmed file`, `not.toHaveProperty('inAlbum'/'position')` | ✅ PASS |
| SLYR-16 | BreadcrumbList of exactly 2: Discography → title at page URL | `tests/seo/single-song.e2e.cjs:48` - `toEqual([[1,'Discography',...],[2,title,ORIGIN+url]])`; `tests/seo/breadcrumbs.e2e.cjs:37` CRUMB-01 same on both URLs | ✅ PASS |
| SLYR-17 | sitemap lists each URL exactly once | `tests/seo/output.test.cjs:50` - `deepEqual(sorted locs, sorted expected incl. both URLs)` (duplicates would fail) | ✅ PASS |
| SLYR-18 | hub cards link to `/discography/<slug>/` | `tests/discography/single-lyrics.e2e.cjs:102` - `toHaveAttribute('href', '/discography/'+slug+'/')` | ✅ PASS |
| SLYR-19 | `.txt` + `.pt.txt` per single; same section count | `tests/seo/lyrics-data.test.cjs:40-41` - exact file lists include `singles/<slug>`; `:91` section count equal | ✅ PASS |
| SLYR-20 | no `'`, no `...` | `tests/seo/lyrics-data.test.cjs:98-99` - `!read(f).includes("'")`, `!includes('...')` on all 4 files | ✅ PASS |
| SLYR-21 | no `.pt.txt` text rendered | `tests/discography/single-lyrics.e2e.cjs:94-95` - non-empty PT-only line set, each `not.toContain` in body | ✅ PASS |

**Status**: ✅ 21/21 ACs covered, asserted values match spec outcomes; 0 spec-precision gaps.

---

## Discrimination Sensor

Scratch: `git worktree add --detach /tmp/claude-1000/slyr-sensor HEAD` (node_modules symlinked), one mutant at a time, `git checkout -- .` between mutants, worktree removed with `git worktree remove --force`. Unit baseline in scratch: 64/64 pass (5 scoped files); e2e baseline: 19/19 pass (`single-lyrics.e2e.cjs`, `single-song.e2e.cjs`).

| # | File:line | Mutation | Killed by | Killed? |
| - | --------- | -------- | --------- | ------- |
| M1 | `lib/catalog.js:201-204` | removed SLYR-05 `folded.single` early-continue | catalog SLYR-05, REL-01, REL-06, catalog-data (4 fail) | ✅ Killed |
| M2 | `lib/catalog.js:121` | `-SINGLE` → `-TRACK-01` | catalog SLYR-08 | ✅ Killed |
| M3 | `lib/catalog.js:108` | lyrics key `singles` → `single` | 6+ unit tests (build throws) | ✅ Killed |
| M4 | `discography/song.liquid:88` | `unless song.single` → `unless false` around `inAlbum` | single-song SLYR-15 ×2 | ✅ Killed |
| M5 | `_includes/discography/song-bento-meta.liquid:20` | single release line → album link | single-lyrics SLYR-07/09 ×2 | ✅ Killed |
| M6 | `discography/song.liquid:18` | fallback ` single –` → ` album –` | song-template SLYR-14 | ✅ Killed |
| M7 | `discography/song.liquid:116` | single breadcrumbs → album + song (3 items) | single-song SLYR-16 ×2 | ✅ Killed |
| M8 | `lib/catalog.js:133` | single cover alt drops `single` | none | ⚪ Equivalent - `lib/catalog.js:197-198` overwrites the cover with the same `single cover` value for every single whose title kebab equals the song slug (true for both songs); not a test weakness |
| M9 | `_includes/discography/song-bento-meta.liquid:3` | tab `SINGLE::<year>` → `TRACK::<n>` | single-lyrics SLYR-07/09 ×2 | ✅ Killed |
| M10 | `discography/song.liquid:90-91` | `unless song.single` → `unless false` around `position` | single-song SLYR-15 ×2 | ✅ Killed |
| M11 | `lib/catalog.js:98` | unknown-single guard disabled | catalog SLYR-04 | ✅ Killed |
| M12 | `lib/catalog.js:116` | single URL → `/discography/singles/<slug>/` | catalog SLYR-01, SLYR-05, SONG-01/02, IDX-01..03 | ✅ Killed |

**Sensor depth**: expanded (12 mutants, all branches of the new code)
**Result**: 11/11 non-equivalent killed, 1 equivalent - PASS ✅
**Isolation**: `git status --porcelain` after cleanup identical to the pre-sensor baseline (untracked tool dirs only).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ - single branch reuses album shell, `releaseUrl`, `albumCode` |
| Surgical changes | ✅ - 4 implementation files, all required |
| No scope creep | ✅ - no PT rendering, no nav, no Spotify track links |
| Matches patterns | ✅ - same error-message style, same Liquid branching style |
| Spec-anchored outcome check | ✅ |
| Per-layer Coverage Expectation met | ✅ - catalog 1:1 unit per SLYR-01/03/04/05/08/09/12; e2e on both single pages; album suites unchanged and green |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed: `.specs/LESSONS.md` (L-004, L-024, L-037), `tasks.md` Test Coverage Matrix | ✅ |

Minor non-blocking notes:
- `lib/catalog.js:133` single-cover branch is redundant with `lib/catalog.js:197-198` (see M8); harmless, kept for a future single whose slug differs from its title.
- `lib/catalog.js:2-3` header comment still says song pages live at `/discography/<album>/<song>/` only.
- `tests/seo/output.test.cjs:53` test name still reads "8 releases, 22 songs" (the count 39 = 9 + 6 + 24 is correct).

---

## Edge Cases

- [x] A single with no song keeps its release page: `tests/seo/catalog.test.cjs:406` (TSWR without song → release page), `tests/seo/catalog.test.cjs:49` (3 version singles keep pages), `tests/seo/release.e2e.cjs` green.
- [x] The 22 album songs keep URL, layout, navigation, catalog code: `tests/seo/catalog.test.cjs:30` (album URLs), `song.e2e.cjs`, `song-bento.e2e.cjs` green.
- [x] No duplicate permalink / no release page at the two URLs: `npm run build` exit 0 writes `docs/discography/{waiting-for-you,the-sun-will-rise}/index.html` from `./discography/song.liquid` only.

---

## Gate Check

- **Gate command**: `npm run build && npm run test:unit && npx playwright test tests/discography tests/seo` (Full gate; whole-suite `npm test` not run - known unrelated PS2-23 / HOME-24/26/28 flakes are outside the diff surface)
- **Result**: build exit 0; unit 232 passed, 0 failed, 0 skipped; e2e 329 passed, 0 failed, 0 skipped
- **Test count before feature** (unit, `test(` declarations on master): 218
- **Test count after feature**: 232
- **Delta**: +14 unit tests (+9 catalog, +3 lyrics-data, +2 song-template); +2 new e2e files (19 tests)
- **Skipped tests**: none
- **Failures**: none
- **Weakened assertions**: none - amended tests (`song.e2e.cjs` SONG-07 scoped to album songs, `release.e2e.cjs` 404 list, LYR-04) narrow to album songs with the singles covered by the new SLYR tests.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| SLYR-01 .. SLYR-21 | Implementing | ✅ Verified |

(`spec.md` statuses left for the orchestrator to update; the Verifier does not edit sources.)

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 21/21 ACs matched spec outcome, 0 spec-precision gaps
**Sensor**: 11/11 non-equivalent mutants killed (1 equivalent)
**Gate**: build OK, 232 unit + 329 e2e passed

**What works**: both single pages are lyrics bento pages at their single URL with exact sections, single meta wording, `-SINGLE` catalog codes, single covers, overridden Apple track links, album-free JSON-LD, 2-item breadcrumbs, sitemap and hub links unchanged.

**Issues found**: none blocking.

**Next steps**: update `spec.md` traceability to Verified; optionally fix the three cosmetic notes above.
