# Song Similar Bands & SEO Enrichment — Verification Report

**Verdict**: `PASS`
**Diff Range**: `master..HEAD` (base `master`, head `c4458e6`)
**Verifier**: Independent Verifier (author != verifier, evidence-or-zero)

---

## Per-AC Evidence (`BANDSEO-01` – `BANDSEO-07`)

| AC | Requirement | Implementation & Test Evidence (`file:line`) | Status |
| --- | --- | --- | --- |
| `BANDSEO-01` | Local importer generates `_data/seo-catalog.json` with 24 tracks, `✅`-only bands, and `lib/catalog.js` attaches `song.seo` | `scripts/import-seo-catalog.cjs:15-63,37` (`threshold !== '✅'`), `_data/catalog.js:24` (`seoCatalog: require('./seo-catalog.json')`), `lib/catalog.js:108-129,206` (`buildSongSeo`), `tests/seo/seo-catalog-data.test.cjs:9-13`, `tests/seo/catalog.test.cjs:444-460` | PASS |
| `BANDSEO-02` | `_includes/seo/fans-of.liquid` renders `For fans of <band list>` with `✅` bands (1-band, 2-band, 3+ formatting) | `lib/catalog.js:91-95` (`formatFansOf`), `_includes/seo/fans-of.liquid:1` (`song.seo.fansOf`), `_includes/discography/song-bento-meta.liquid:26`, `discography/song.liquid:53`, `tests/seo/catalog.test.cjs:436-442`, `tests/discography/seo-similar-bands.e2e.cjs:8,30,39` | PASS |
| `BANDSEO-03` | `Sonic DNA & Similar Artists` section renders styles, `✅` bands, reference tracks, and clean editorial justification across all 3 song layouts (`video`, `lyrics`, `stack`) | `scripts/import-seo-catalog.cjs:10-13` (`cleanJustification`), `_includes/discography/song-dossier.liquid:8-28`, `_includes/discography/song-panel-dossier.liquid:10`, `discography/song.liquid:70`, `less/discography.less:653-708`, `tests/seo/seo-catalog-data.test.cjs:15-34`, `tests/discography/seo-similar-bands.e2e.cjs:10-16,31-34,40-43,65-73` | PASS |
| `BANDSEO-04` | `discography/song.liquid` `page_description` includes `For fans of <✅ bands>` alongside `song.about` (or instrumental/single summary) within `metaDescription` limit | `discography/song.liquid:18` (`page_description`), `tests/seo/output.test.cjs:67-70`, `tests/discography/seo-similar-bands.e2e.cjs:18-19`, `tests/seo/head.e2e.cjs` (55/55 pass including 50-160 char check) | PASS |
| `BANDSEO-05` | `lib/catalog.js` aggregates top-4 recurring `✅` bands (frequency DESC, max MERT score DESC, name ASC) and unique genres onto studio album models; `discography/release.liquid` renders `For fans of...` and `MusicAlbum` JSON-LD `genre` | `lib/catalog.js:131-159,260` (`aggregateAlbumSeo`), `discography/release.liquid:79,99`, `tests/seo/catalog.test.cjs:465-470`, `tests/discography/seo-similar-bands.e2e.cjs:46-55` | PASS |
| `BANDSEO-06` | `MusicRecording` JSON-LD includes deduplicated `genre`, `✅`-only `keywords`, and enriched `description`, with zero `⚠️` band leakage | `lib/catalog.js:110,114-120`, `discography/song.liquid:87-88,95`, `tests/seo/output.test.cjs:71-77`, `tests/discography/seo-similar-bands.e2e.cjs:21-25` | PASS |
| `BANDSEO-07` | Pages/releases without `seo` data (Home, `/band/`, live/acoustic/solo releases, missing `seoCatalog`) fall back to `For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold` | `lib/catalog.js:206,245,285`, `_includes/seo/fans-of.liquid:1`, `index.html:165`, `band/index.html:53`, `tests/seo/catalog.test.cjs:441,471-472`, `tests/discography/seo-similar-bands.e2e.cjs:57-62` | PASS |

---

## Test Results

- **`npm run build`**: Passed (`less:build` + Eleventy wrote 47 files in 0.81s).
- **`npm run test:unit`**: Passed — `239` tests, `239` pass, `0` fail, `0` skipped.
- **`npx playwright test tests/discography/seo-similar-bands.e2e.cjs tests/discography/seo.e2e.cjs tests/seo/head.e2e.cjs`**: Passed — `55` tests, `55` pass, `0` fail (32.6s).

---

## Discrimination Sensor Results (Isolated Worktree `/tmp/verify-bandseo`)

All mutants were injected in `/tmp/verify-bandseo` (detached HEAD `c4458e6`), tested, reverted, and the worktree was removed via `git worktree remove --force /tmp/verify-bandseo`.

| Mutant | Fault Injected | Verification Command | Outcome |
| --- | --- | --- | --- |
| **(a)** Threshold filter bypass | Commented out `if (threshold !== '✅') continue;` in `scripts/import-seo-catalog.cjs` and regenerated `_data/seo-catalog.json` | `npm run build && node --test tests/seo/output.test.cjs` | **CAUGHT (`exit 1`)** — `BANDSEO-04/06` failed as `Symphony X and Stone Sour` leaked into `endless-path` meta description. |
| **(b)** `formatFansOf` 1-band bug | Changed 1-band return in `lib/catalog.js` to append a trailing comma (`For fans of ${names[0]},`) | `node --test tests/seo/catalog.test.cjs` | **CAUGHT (`exit 1`)** — 3 tests failed (`BANDSEO-01/07`, `BANDSEO-01`, `BANDSEO-01/05`). |
| **(c)** `fans-of.liquid` song-level branch removed | Removed `song.seo.fansOf` branch from `_includes/seo/fans-of.liquid` (leaving `release.seo.fansOf` and fallback) | `npm run build && npx playwright test tests/discography/seo-similar-bands.e2e.cjs` | **CAUGHT (`exit 1`)** — 3 E2E tests failed (`video`, `lyrics`, `stack` song pages rendered the default fallback instead of track-specific bands). *(Note: simply swapping `release.seo.fansOf` before `song.seo.fansOf` in `fans-of.liquid` does not fail on `song.liquid` because `song.liquid` sets `release = song.album`, which is a shallow album summary without `.seo`.)* |
| **(d)** Omit `keywords` in `MusicRecording` JSON-LD | Removed `{% if song.seo.keywords %} "keywords": ... {% endif %}` from `discography/song.liquid` | `npm run build && node --test tests/seo/output.test.cjs` | **CAUGHT (`exit 1`)** — `BANDSEO-04/06` failed with `TypeError: Cannot read properties of undefined (reading 'includes')` on `ld.keywords`. |
