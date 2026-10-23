# Song Video Bento Validation

## Validation: song-video-bento - PASS ✅ (iteration 2 of max 3, final)

**Result**: PASS. Fix commits `42a9930` (tests) and `d7973f0` (spec) close every iteration-1 gap. Re-run in a fresh scratch worktree at `d7973f0`, the two mutants that survived iteration 1 (M3, M5) are now killed, and so is an extra compact-anchor variant (M5b). The gate is green: 214/214 unit, 275/275 e2e.

**Date**: 2026-10-23
**Spec**: `.specs/features/song-video-bento/spec.md`
**Diff range**: `6b06e2c^..d7973f0` (`be39a18..d7973f0`, 14 commits)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

### Fix commits reviewed

| Commit | Change | Judgement |
| ------ | ------ | --------- |
| `42a9930` | `tests/discography/song-bento.e2e.cjs:427` and `:446`: `expect(new URL(page.url()).hash).toBe('')` after the QUICK PLAY click (BENTO-10) and after the second click (BENTO-12). New test `:468-480`: with navigation blocked, it clicks Keep Away's primary Spotify and compact Deezer buttons and `toEqual`s both `release_click` payloads (`platform`, `release: 'silicon-fortress'`) | ✅ Test-only. No assertion weakened, +1 e2e case |
| `d7973f0` | `spec.md` BENTO-20 now applies the sub-label rules to primary anchors and says compact anchors carry no sub label | ✅ Matches the implementation (`_includes/discography/song-bento.liquid:75`) and `tests/seo/song.e2e.cjs:201` (per L-004) |

No source file (`lib/`, `assets/`, `_includes/`, `discography/`, `less/`) changed since iteration 1, so the iteration-1 evidence for the other 38 ACs still applies (see below).

### Re-checked ACs (iteration 2)

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| BENTO-10 | scroll Panel A into view, iframe `…/embed/{id}?autoplay=1`, staying on the same URL | `tests/discography/song-bento.e2e.cjs:421-428`: iframe `src` exact, facade gone, Panel A in view, `pathname` equal (`:426`) **and** `hash` `toBe('')` (`:427`), one page | ✅ PASS (M3 killed) |
| BENTO-12 | already playing → scroll back, exactly one iframe | `tests/discography/song-bento.e2e.cjs:442-446`: in view, `iframe` count 1, `src` exact, `hash` `toBe('')` | ✅ PASS (M3 killed here too) |
| BENTO-20 | primary: track-URL sub labels per platform, else `platforms.json` `sub`; compact: no sub label | `tests/discography/song-bento.e2e.cjs:115` (primary, all 10 video songs); `tests/seo/song.e2e.cjs:201` (compact → `null`); `tests/seo/catalog.test.cjs` BENTO-19/20 (each platform in both states) | ✅ PASS (spec-precision gap closed by `d7973f0`; M1 killed in iteration 1) |
| BENTO-21 | `target=_blank`, `rel=noopener`, `data-disc-link={key}`, `data-disc-slug`; WHEN clicked THEN `release_click` pushed | Attributes `tests/discography/song-bento.e2e.cjs:111,116,117`; click → event `:477-480` `toEqual([{event:'release_click',platform:'spotify',release:'silicon-fortress'},{event:'release_click',platform:'deezer',release:'silicon-fortress'}])` | ✅ PASS (M5 and M5b killed) |

**Status**: ✅ All 42 ACs covered with a spec-anchored `file:line` assertion; no spec-precision gaps open.

### Payload / conjunction rule (iteration 2)

- `release_click` on song pages: all three payload fields are asserted by value for one primary and one compact anchor (`tests/discography/song-bento.e2e.cjs:477-480`). ✅
- BENTO-10's three conjuncts (scroll, iframe, same URL) are each asserted; "same URL" now covers path and hash. ✅
- `song_quick_play`: unchanged, exact `toEqual` (`tests/discography/song-bento.e2e.cjs:432`). ✅

### Gate (iteration 2)

- **Command**: `npm run build && npm run test:unit && npx playwright test tests/seo tests/discography` (real tree)
- **Result**: exit 0. Unit 214/214, e2e 275/275 (3.3 min). 0 failed, 0 skipped, 0 flaky, no retries.
- **Test count**: 214 unit + 275 e2e, up from 214 + 274 in iteration 1 (+1, the new BENTO-21 test). None removed or weakened.

### Discrimination sensor (iteration 2)

Scratch: a fresh `git worktree add --detach` at `d7973f0` under the session scratchpad, with `node_modules` symlinked; `less:build` and `eleventy` were run there. `git stash` was never used. The real-tree gate finished before any e2e mutant ran (fixed port 4178). On the unmutated worktree, the BENTO-10..13 and BENTO-21 tests passed 4/4.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M3 (re-run) | `assets/js/song.js:31` | remove `event.preventDefault()` from the QUICK PLAY handler | ✅ Killed. 2 failed: BENTO-10/11/43 (`song-bento.e2e.cjs:410`) and BENTO-12 (`:435`), at the hash assertions |
| M5 (re-run) | `discography/song.liquid:22` | drop `data-disc` from the song shell | ✅ Killed. 1 failed in `tests/seo` + `tests/discography`: BENTO-21 (`song-bento.e2e.cjs:468`) |
| M5b (new) | `_includes/discography/song-bento.liquid:75` | compact anchors lose `data-disc-link` | ✅ Killed (BENTO-18..21 on all 10 video songs, BENTO-38, BENTO-21 click test) |

Iteration 1's M1, M2, M4 and M6 were killed, and no source changed since, so they were not re-run.

**Sensor outcome (cumulative)**: 7 injected, 7 killed, 0 survived.
**Isolation**: the worktree was removed with `git worktree remove --force` and pruned (`git worktree list` shows only the main tree at `d7973f0`). The real tree's `git status --porcelain` matches the iteration-2 baseline (` M .specs/LESSONS.md`, ` M .specs/lessons.json`, `?? .specs/features/song-video-bento/validation.md` plus the pre-existing untracked tool folders and `skills-lock.json`), including after the gate build.

### Lessons (iteration 2)

L-045, L-046 and L-047 (recorded in iteration 1) stay as candidates. The fixes applied them; they were not loaded as confirmed guidance that then failed, so `penalize` does not apply. No new signal in iteration 2, so no new lesson.

### Ranked gaps (iteration 2)

None. One non-blocking note remains from iteration 1: the "video song without About and Also" edge case has no fixture test. No real song is in that state, and the Panel D footer sits outside both guards, so it holds by construction.

### Requirement traceability (iteration 2)

BENTO-01..43 (excluding the unused BENTO-29) are verified. The `spec.md` traceability table is left for the orchestrator to update to `Verified`; the Verifier does not edit the spec.

---

## Iteration 1 report (kept for history): gaps found, routed to fix tasks F1-F3

**Iteration 1 outcome**: not passed. All 42 ACs have a `file:line` assertion, and the gate is green (214/214 unit, 274/274 e2e). However, two of the six sensor mutants survived, and a probe confirmed that each one breaks a spec outcome:

- **M3**: QUICK PLAY without `preventDefault()` changes the URL to `…/keep-away/#song-video`. That breaks BENTO-10 ("staying on the same URL"), but the test checks only `pathname`.
- **M5**: the song shell without `data-disc` stops `release_click` from firing on Panel B. That breaks BENTO-21, but no test clicks a song-page uplink anchor.

There is also one minor spec-precision gap: the BENTO-20 sub-label rule for the compact anchors.

**Date**: 2026-10-23
**Spec**: `.specs/features/song-video-bento/spec.md`
**Diff range (iteration 1)**: `6b06e2c^..21f75ff` (`be39a18..21f75ff`, 12 commits)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

---

### Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1-T3 (catalog data) | ✅ Done | `lib/catalog.js` `sectionFamily`, `albumCode`, `uplink`, `number`, `catalogCode`, prev/next `number` |
| T4-T7 (markup) | ✅ Done | Partials `song-lyrics`, `song-dossier`, `song-nav`, `song-bento`; `page_header_class` hook |
| T8-T9 (styles) | ✅ Done | `less/song-bento.less`. The finish ACs 38/40/41 and the reduced-motion half of 39 come from existing `less/discography.less` rules, which the e2e tests assert as computed values. Commit `5eb1729` rebuilds the bundle; a scratch `less:build` reproduces `assets/css/discography.min.css` byte-for-byte |
| T10 (QUICK PLAY) | ✅ Done (tests weak, see M3) | `assets/js/song.js:23-38` |

---

### Spec-Anchored Acceptance Criteria

All test paths are relative to the repo root. `SB` = `tests/discography/song-bento.e2e.cjs`, `SE` = `tests/seo/song.e2e.cjs`, `VE` = `tests/seo/video.e2e.cjs`, `CT` = `tests/seo/catalog.test.cjs`.

### P1: Watch and listen side by side

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| BENTO-01 | one `[data-song-bento]`; tabs A, B, D, C exact text, DOM order | `tests/discography/song-bento.e2e.cjs:68` `toHaveCount(1)`; `:69` `allTextContents().map(norm)).toEqual(TABS)` (all 10 video songs) | ✅ |
| BENTO-02 | no grid, no `PANEL A` tab without a video | `tests/discography/song-bento.e2e.cjs:142,144` `toHaveCount(0)` (faceless-demons, endless-path) | ✅ |
| BENTO-03 | ≥992: A/B same row, A left, ratio 0.64-0.69 | `tests/discography/song-bento.e2e.cjs:227-231` (1280 and 992, two songs) | ✅ (M6 killed) |
| BENTO-04 | C/D same row below A/B, C left, widths ±2px | `tests/discography/song-bento.e2e.cjs:233-236` | ✅ (M6 killed) |
| BENTO-05 | <992: full width, order A, B, D, C top to bottom | `tests/discography/song-bento.e2e.cjs:248-251` (991/768/375) | ✅ |
| BENTO-06 | `scrollWidth === clientWidth` at 375/768/992/1280 | `tests/discography/song-bento.e2e.cjs:266` `expect(scroll).toBe(client)` (all 22 songs) | ✅ |
| BENTO-14 | facade inside a 16:9 ±1% frame | `tests/discography/song-bento.e2e.cjs:276` ratio `<= 0.01`; `:94` facade href inside Panel A | ✅ |
| BENTO-15 | `● OFFICIAL {type}`, `REC::{id} // {type}`, `SOURCE: YOUTUBE // {id}` | `tests/discography/song-bento.e2e.cjs:93` `toContain` per string, from `videos.json` | ✅ |
| BENTO-16 | title as plain text below the frame; exactly one link named after it | `tests/discography/song-bento.e2e.cjs:96-97` `toHaveText(title)`, `tagName === 'P' && !closest('a')`; `tests/seo/video.e2e.cjs:39` `getByRole('link',{name:title})).toHaveCount(1)` | ✅ |
| BENTO-17 | none of 1080P/24-Bit/High-Res/Bitrate (case-insensitive) | `tests/discography/song-bento.e2e.cjs:100` `not.toMatch(/1080P\|24-Bit\|High-Res\|Bitrate/i)` | ✅ |
| BENTO-18 | order Spotify, Apple, YT Music, Bandcamp `--primary`, then Deezer, Tidal, Amazon, Pandora `--compact` | `tests/discography/song-bento.e2e.cjs:111,114`; `tests/seo/catalog.test.cjs` BENTO-18 tests (order, primary flag, no-URL edge) | ✅ |
| BENTO-19 | track URL else album URL | `tests/discography/song-bento.e2e.cjs:113` `toBe(want.url)` (want from `songs.json` / `discography.json`); `tests/seo/catalog.test.cjs` BENTO-19/20 test | ✅ |
| BENTO-20 | track-URL subs per platform; album fallback → `platforms.json` `sub` | `tests/discography/song-bento.e2e.cjs:115` (primary only); `tests/seo/song.e2e.cjs:201` (compact → `null`); unit tests check every platform in both states (M1 killed) | ⚠️ Spec-precision gap: the spec's fallback clause covers "the anchor", so it includes the compact anchors (Tidal and Amazon always fall back to the album URL). The template renders no sub label on compact anchors (`_includes/discography/song-bento.liquid:75`), and `tests/seo/song.e2e.cjs:201` asserts `null`. The spec does not say whether compact anchors carry a sub label |
| BENTO-21 | `target=_blank`, `rel=noopener`, `data-disc-link={key}`, `data-disc-slug`; **WHEN clicked THEN `release_click` pushed** | Attributes: `tests/discography/song-bento.e2e.cjs:111,116,117`. Click → event: **no evidence on any song page** (`tests/discography/tracking.e2e.cjs:13-29` covers only `/discography/`) | ❌ GAP (M5 survived) |
| BENTO-22 | `STATUS: ONLINE // ALL NODES ACTIVE` | `tests/discography/song-bento.e2e.cjs:120` | ✅ |
| BENTO-23 | hovered Spotify border `rgb(29, 185, 84)` | `tests/discography/song-bento.e2e.cjs:302` | ✅ |
| BENTO-24 | <992: primary anchors in 2 equal columns | `tests/discography/song-bento.e2e.cjs:255-256` | ✅ |

### P1: Metadata bar and QUICK PLAY

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| BENTO-07 | cover (existing src), `Track NN // YYYY`, `Runtime M:SS`, album link, `Recommended intel`, exact fans-of text | `tests/discography/song-bento.e2e.cjs:75-81`; exact cover src `tests/seo/song.e2e.cjs:144` | ✅ |
| BENTO-08 | single h1, song title, `song-title-badge`, `insaneFont` | `tests/discography/song-bento.e2e.cjs:174,178` (class list plus negatives on non-video and non-song pages); `:292` font | ✅ |
| BENTO-09 | `[data-song-quickplay]` "Quick play" `href="#song-video"`; Panel A `id="song-video"` | `tests/discography/song-bento.e2e.cjs:85-88` | ✅ |
| BENTO-10 | scroll Panel A into view, iframe `…/embed/{id}?autoplay=1`, **staying on the same URL** | `tests/discography/song-bento.e2e.cjs:421-427`. The URL check is `:425` `new URL(page.url()).pathname` only, so a `#song-video` hash change passes | ❌ GAP (M3 survived) |
| BENTO-11 | push `{event:'song_quick_play', song:'<slug>'}` | `tests/discography/song-bento.e2e.cjs:430` `toEqual([{ event: 'song_quick_play', song: 'keep-away' }])`. Exact payload, both fields, exactly once | ✅ |
| BENTO-12 | already playing → scroll and exactly one iframe | `tests/discography/song-bento.e2e.cjs:440,442-443` | ✅ |
| BENTO-13 | reduced motion → `behavior:'auto'`, Panel A in view right after the click | `tests/discography/song-bento.e2e.cjs:454-459` (same-task measurement) | ✅ (M4 killed) |

### P1: Lyrics terminal and dossier

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| BENTO-25 | Panel C holds the SONG-04 sequence | `tests/discography/song-bento.e2e.cjs:124` (`[data-song-lyrics]` in Panel C); sequence `tests/seo/song.e2e.cjs:173` `toEqual(expectedSequence(text))` | ✅ |
| BENTO-26 | `[N SECTIONS]`, `HUD.LOG::LYR_NN` | `tests/discography/song-bento.e2e.cjs:126-127` (N recounted from the lyrics file) | ✅ |
| BENTO-27 | exactly one family class per labelled section; none when unlabelled | `tests/discography/song-bento.e2e.cjs:190,204`; `tests/seo/catalog.test.cjs` BENTO-27 (each OR branch alone, per L-024) | ✅ (M2 killed) |
| BENTO-28 | marker colors per family; chorus italic | `tests/discography/song-bento.e2e.cjs:317-318,324` | ✅ |
| BENTO-30 | `overflow-y: visible`, `scrollHeight === clientHeight` | `tests/discography/song-bento.e2e.cjs:279-280` | ✅ |
| BENTO-31 | About and Also in Panel D, same conditions as SONG-06/08 | `tests/discography/song-bento.e2e.cjs:132-134`; content `tests/seo/song.e2e.cjs:179-223` | ✅ |
| BENTO-32 | `CATALOG: {CODE}-TRACK-NN // ALL EDITIONS LISTED` | `tests/discography/song-bento.e2e.cjs:135` (initials recomputed); `tests/seo/catalog.test.cjs` BENTO-32 tests | ✅ |
| BENTO-33 | ≥992 Panel D content `position: sticky` | `tests/discography/song-bento.e2e.cjs:238` | ✅ |

### P2: Track sequencer

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| BENTO-34 | `.song-nav` outside every `.cyber-panel`, after the last panel, on every song page | `tests/discography/song-bento.e2e.cjs:159` `toEqual({ insidePanel: false, afterLast: true })` (22 songs) | ✅ |
| BENTO-35 | `← Previous track // NN Title` / `Next track → // NN Title`; rel/href/omission per SONG-10 | `tests/discography/song-bento.e2e.cjs:163-166`; href `tests/seo/song.e2e.cjs:252` | ✅ |

### P2: Neon HUD finish and accessibility

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| BENTO-36 | radius 0 on all corners in scope (incl. pseudo) | `tests/discography/song-bento.e2e.cjs:343` `toEqual([])` | ✅ |
| BENTO-37 | tabs `SiliconFont` | `tests/discography/song-bento.e2e.cjs:294-295` | ✅ |
| BENTO-38 | focus ring `3px solid rgb(252,238,10)`, offset 4px on 4 element kinds | `tests/discography/song-bento.e2e.cjs:356` | ✅ |
| BENTO-39 | reduced motion → `animation-name: none` everywhere in scope | `tests/discography/song-bento.e2e.cjs:376`; positive control `:382` | ✅ |
| BENTO-40 | bodies `rgba(10,10,10,0.85)` + 25px grid | `tests/discography/song-bento.e2e.cjs:392` | ✅ |
| BENTO-41 | lyrics and About text `rgb(233,237,242)` | `tests/discography/song-bento.e2e.cjs:395` | ✅ |
| BENTO-42 | no-JS: Panel B, QUICK PLAY, facade are plain links | `tests/discography/song-bento.e2e.cjs:58` (JS off) with hrefs `:87,:94,:113`; `tests/seo/video.e2e.cjs:41-42` | ✅ |
| BENTO-43 | no YouTube request before activation | `tests/discography/song-bento.e2e.cjs:416`; `tests/seo/video.e2e.cjs:74` | ✅ |

**Status**: ❌ Gaps present: BENTO-10 (URL part) and BENTO-21 (click → `release_click`). ⚠️ One spec-precision gap: BENTO-20 for the compact anchors.

### Payload / conjunction rule

- `song_quick_play` (BENTO-11): `tests/discography/song-bento.e2e.cjs:430` asserts the full object with `toEqual` (both `event` and `song`) and that it is the only one. ✅
- Uplink entries (BENTO-18..21): `key`, `url`, primary/compact modifier, `sub` (primary), `target`, `rel` are asserted on value per anchor (`:111-117`); `name` and `icon` are asserted in the unit tests. `data-disc-slug` is asserted only as truthy (`:117`). The spec gives no value for it, so this is acceptable. But the conjunct "WHEN clicked THEN `release_click`" is never exercised on a song page. ❌ (see M5)
- BENTO-10 conjunction (scroll AND iframe AND same URL): scroll and iframe are asserted; "same URL" is reduced to `pathname`. ❌ (see M3)

---

### Discrimination Sensor

Scratch: `git worktree add --detach` under the session scratchpad, with `node_modules` symlinked; `less:build` and `eleventy` were run there. `git stash` was never used. The real-tree gate had finished before any e2e mutant ran, because the port is fixed at 4178 and `reuseExistingServer: false`. The unmutated worktree passed 214/214 unit.

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| M1 | `lib/catalog.js:34` | `sub = UPLINK_SUB[key] \|\| p.sub` (track-specific label even on album fallback) | ✅ Killed (unit BENTO-19/20) |
| M2 | `lib/catalog.js:47` | drop the `/^interlude$/i` OR branch (Interlude → other) | ✅ Killed (unit BENTO-27 ×2) |
| M3 | `assets/js/song.js:31` | remove `event.preventDefault()` from the QUICK PLAY handler | ❌ Survived (86/86 in `song-bento` + `video` e2e). Probe: the URL becomes `…/keep-away/#song-video` (BENTO-10 "staying on the same URL" broken) |
| M4 | `assets/js/song.js:35` | always `behavior: 'smooth'` (ignore reduced motion) | ✅ Killed (BENTO-13) |
| M5 | `discography/song.liquid:22` | drop `data-disc` from the song shell | ❌ Survived (274/274 in `tests/seo` + `tests/discography`). Probe: clicking Panel B Spotify pushes `[]` instead of `[{event:'release_click',platform:'spotify',release:'silicon-fortress'}]` (BENTO-21 broken) |
| M6 | `less/song-bento.less:16` | desktop grid breakpoint `992px` → `993px` (off-by-one) | ✅ Killed (BENTO-03/04 at 992px, 2 failures) |

**Sensor depth**: lightweight-to-moderate (6 behaviour-level mutants across `lib/catalog.js`, `assets/js/song.js`, `discography/song.liquid`, `less/song-bento.less`)
**Sensor outcome (iteration 1)**: 4/6 killed, 2 survived (M3, M5), so the sensor did not pass

**Isolation**: the worktree was removed with `git worktree remove --force` and pruned (`git worktree list` shows only the main tree). The real tree's `git status --porcelain` is identical to the baseline taken before any work (only the pre-existing untracked agent folders and `skills-lock.json`). This holds after the real-tree gate build too.

---

### Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ (`.eleventyignore` change in `db31230` is a build hygiene chore for `.stitch/`, harmless) |
| No scope creep | ✅ |
| Matches patterns | ✅ (`.cyber-panel` vocabulary, `[data-disc]` delegation, existing facade) |
| Spec-anchored outcome check (asserted values match spec) | ❌ BENTO-10 asserts `pathname`, not the URL |
| Per-layer Coverage Expectation met | ⚠️ Browser JS: the happy, already-playing, reduced-motion and no-JS paths are covered, but the click-tracking path on the new Panel B anchors is not |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: `tasks.md` Test Coverage Matrix, `.specs/LESSONS.md` (L-024 applied to `sectionFamily`) | ✅ |

---

### Edge Cases

- [x] Platform without any URL → no button: `tests/seo/catalog.test.cjs` BENTO-18 edge (bandcamp/pandora null)
- [x] First/last track → missing side omitted: `tests/discography/song-bento.e2e.cjs:164,166` (22 songs)
- [x] Lyrics sheet with no labels → no markers or family class: `tests/discography/song-bento.e2e.cjs:204` (Tears of Blood)
- [~] Video song with no About and no Also → Panel D still renders with its footer. No real song is in this state (all 10 have both), so no test runs it. The footer sits outside both guards (`_includes/discography/song-bento.liquid` Panel D, after the dossier include), so it holds by construction. Not blocking (cf. L-026)

---

### Gate Check

- **Gate command**: `npm run build && npm run test:unit && npx playwright test tests/seo tests/discography` (real tree)
- **Result**: exit 0. Unit 214/214, e2e 274/274 (3.3 min). 0 failed, 0 skipped, 0 flaky, no retries.
- **Test count before feature**: 205 unit + 213 e2e in scope (derived: this diff adds 9 unit tests to `catalog.test.cjs` and 61 e2e cases in the new `song-bento.e2e.cjs`; `song.e2e.cjs` changes an assertion and adds no case)
- **Test count after feature**: 214 unit + 274 e2e
- **Delta**: +70, none removed. SONG-10 and SONG-04 `deepEqual` expectations gained the new `number`/`family` fields; the SONG-07 e2e branches for video songs. None of these is weaker.
- **Known unrelated flakes** (HOME-24/26/28, HOME-71, PERF-35, PS2-23): outside this gate's scope; not run.

---

### Fix Plans

### Fix F1: BENTO-10 "same URL" is asserted only on the pathname (M3)

- **Root cause**: `tests/discography/song-bento.e2e.cjs:425` compares `new URL(page.url()).pathname`. Without `preventDefault()` (`assets/js/song.js:31`) the anchor's default adds `#song-video` to the URL, and the test still passes.
- **Fix task**: assert the full URL, for example `expect(page.url()).toBe(new URL(KEEP_AWAY.url, page.url()).href)`, or `expect(new URL(page.url()).hash).toBe('')`, after the QUICK PLAY click (and in the BENTO-12 test after the second click).
- **Verify**: passes on HEAD; fails with `event.preventDefault();` removed from the QUICK PLAY handler.
- **Priority**: Minor (test-only).

### Fix F2: BENTO-21 click → `release_click` untested on song pages (M5)

- **Root cause**: the Panel B anchors rely on the `[data-disc]` delegation in `assets/js/discography.js:47-55`, so the bento must stay inside `.disc-shell[data-disc]` (`discography/song.liquid:22`; design.md lists this as a risk). The only `release_click` tests (`tests/discography/tracking.e2e.cjs:13-29`) are on `/discography/`.
- **Fix task**: add an e2e in `tests/discography/song-bento.e2e.cjs`. On a video song, block navigation, click a Panel B primary anchor and a compact anchor, and assert `dataLayer` holds `{event:'release_click', platform:<key>, release:<data-disc-slug>}` for each.
- **Verify**: passes on HEAD; fails with `data-disc` removed from `discography/song.liquid:22`.
- **Priority**: Major (silent loss of the band's conversion telemetry).

### Fix F3: BENTO-20 wording for compact anchors (spec-precision gap)

- **Fix task**: amend BENTO-20 to say that the sub-label rules apply to the primary anchors and that compact anchors carry no sub label (per L-004: update the AC to match the implemented and tested decision, `tests/seo/song.e2e.cjs:201`). If the spec is amended, no code change.
- **Priority**: Cosmetic / spec-writing.

---

### Requirement Traceability Update

No change. The feature is not done until F1 and F2 are fixed (and F3 is resolved) and then re-verified. The spec rows stay as they are.

---

### Summary

**Overall**: ❌ Not Ready (test gaps only; the implementation behaves as specified on HEAD)

**Spec-anchored check**: 40/42 ACs fully matched to the spec outcome; 2 ACs only partly evidenced (BENTO-10 URL, BENTO-21 click event); 1 spec-precision gap (BENTO-20, compact anchors)
**Sensor**: 4/6 mutations killed (M3, M5 survived)
**Gate**: 214 unit + 274 e2e passed, 0 failed

**What works**: the grid layout at every breakpoint, the uplink order, URLs and labels, the metadata bar, the lyrics families and markers, the dossier, the sequencer, the HUD finish, reduced motion, the no-JS fallbacks, and the QUICK PLAY scroll, embed and event payload.

**Issues found**: M3 (F1), M5 (F2), BENTO-20 wording (F3).

**Next steps**: route F1 and F2 (test-only) and F3 (spec edit) to an implementer, then re-verify.
