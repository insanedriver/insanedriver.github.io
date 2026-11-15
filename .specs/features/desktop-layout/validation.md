# Desktop layout validation

## Validation: PASS

Independent verification passed 195 selected browser cases and killed three isolated mutations at `d5cf92c`. A fresh independent review at `4cdb91a` passed all 30 loader cases and killed a CSS failsafe-delay mutation after T6 stabilized transient-state sampling. The final complete `npm test` passed at `4cdb91a`: 240 unit and 768 browser cases, zero failures; normal build also passed. Independent evidence totals 225 selected browser cases and four killed isolated regressions. All DESK-01–13 requirements and T1–T7 validation now pass.

**Date:** 2026-11-14

**Spec:** `.specs/features/desktop-layout/spec.md`

**Diff range:** `b0a9d7f33bb48ec6ed5ef586ed67953ce7971f02..4cdb91a48263b3302dc8c0a8159e707b135a14c1` (`origin/master..fix/desktop-layout-standard`; original 195-case review at `d5cf92c`, fresh loader delta review at `4cdb91a`).

**Verifier:** fresh independent sub-agent; implementation and tests authored by a different agent. The verifier changed only this report in the real tree.

## Task completion

| Task | Status | Evidence |
| --- | --- | --- |
| Original steps 1–2 | Complete | All 56 desktop frame/content/preservation cases independently repeated. |
| Original steps 3–4 | Complete | All 20 exact metadata cases and 10 dossier/stack/fixture cases independently repeated. |
| T1–T4 | Complete | All 59 SEO/image cases repeated; album/single fixture audited from raw data. |
| T5 | Complete | All 40 phone-fit cases passed, including blocked images; removed-width mutant failed. |
| T6 | Complete | Fresh independent 30/30 loader cases; exact-deadline/assertion review and killed CSS failsafe mutant. Author 240/240 unit evidence recorded in spec. |
| T7 | Complete | Normal build exit 0; complete `npm test` exit 0, 240 unit + 768 browser; independent 225 selected cases and four killed mutations; state validator passes. |

## Spec-anchored acceptance evidence

| Requirement | Spec outcome | `file:line` and assertion expression | Result |
| --- | --- | --- | --- |
| DESK-01 | Centered min(1360px, viewport minus 64px), 1px tolerance, full-width backgrounds; 280px left at 1920px | `tests/desktop/frame.e2e.cjs:25` `expect(Math.abs(box.width - expectedWidth)).toBeLessThanOrEqual(1)`; line 26 checks centered x; line 29 checks background width. Lines 16–17 derive exact width/x for 1200/1366/1440/1920/2560px. | PASS |
| DESK-02 | 3 product/album/Home highlight columns; 4 photo archive; 5 members; 6 singles; two release/newsletter columns; horizontal video feed | `tests/desktop/content.e2e.cjs:21` `expect(style.columns).toBe(columns)` against explicit selectors/counts at lines 3–8; line 97 `expect(s.cols).toBe(2)`; lines 129–131 require flex, horizontal auto scrolling and overflowing feed content. | PASS |
| DESK-03 | 24px card gaps, 32px panel gaps, 48–64px major divisions including separators | `tests/desktop/content.e2e.cjs:22` `expect(style.gap).toBe('24px')`; line 98 `expect(s.gap).toBe('32px')`; line 28 `expect(division).toBe(48)` measures separator height plus margins. `less/desktop-layout.less:25` sets 48px/64px section padding; line 98 sets ticker division 48px. | PASS |
| DESK-04 | Biography/Contact maximum 760px; newsletter contained without integration changes | `tests/desktop/content.e2e.cjs:48` `expect(bio.width).toBe(760)`; line 121 checks Contact panels 760px; lines 102–103 assert embed bounds inside panel; line 104 asserts Bandsintown artist signup source. | PASS |
| DESK-05 | Video 16:9, maximum 60vh; full Band/gallery images maximum 60vh; covers maximum 360px; working controls | `tests/desktop/content.e2e.cjs:60` height<=60vh+1; line 61 aspect error<.01; lines 50–51 and 69–70 image height/contain; line 110 cover width<=360; lines 77–84 visible bounded controls and changed photo counter. `tests/perf/images.e2e.cjs:40` desktop image height<=420 at 700px viewport; lines 41–42 require 3:2 ratio/contain. | PASS |
| DESK-06 | No horizontal overflow at nine specified widths; desktop mixin preserves below 1200 widths/composition | `tests/desktop/frame.e2e.cjs:30` and line 46 require scrollWidth<=viewport across ten active page types/all specified widths. `tests/desktop/preservation.e2e.cjs:80` `expect(actual).toEqual(await composition(page, selectors))` compares widths/display/tracks/gaps against source with only the mixin invocation removed, at 320/390/768/1024px. Authorized dossier/cover repairs remain in both versions. | PASS |
| DESK-07 | Preserve navigation/text/signup attributes/controls; excluded pages receive no overrides | `tests/desktop/content.e2e.cjs:84` requires changed photo counter; line 133 video counter `02 / 10`; `tests/desktop/preservation.e2e.cjs:130` requires `{matched: [], leaked: [], token: ''}` on pre-save/preorder/Dates. `tests/newsletter/markup.e2e.cjs:47` asserts exact embed parameters; line 73 exact fallback destination; lines 80–82 blocked-embed visibility. No HTML/Liquid/data/JavaScript changes in diff, supporting other copy/destination preservation. | PASS |
| DESK-08 | Exact natural-English curated per-track fans-of sentence | `tests/discography/song-bento.e2e.cjs:112` and line 189 `expect(meta.locator('.fans-of')).toHaveText(expectedFansOf(s))`. Expectations use curated band names and `Intl.ListFormat('en-GB')`, independently of production formatting. All 20 video/lyrics cases passed without JavaScript. | PASS |
| DESK-09 | At >=992px About/Also same row, 4:2 split; DNA follows both; catalog follows dossier; below 992 About→DNA→Also | `tests/discography/song-bento.e2e.cjs:399` top difference<=2px; lines 402–403 split .64–.69; line 405 `expect(r.dna.top).toBeGreaterThanOrEqual(Math.max(r.about.bottom, r.also.bottom))`; line 408 catalog below all sections; lines 432–433 mobile order. Six desktop cases cover 1920/1280/992px; three stacked cases cover 991/768/375px, plus presence/absence fixture. | PASS |
| DESK-10 | Build, unit and entire browser suite green; independent verification/mutation sensitivity | Normal build exit 0; `/tmp/desktop-pr-final-all.log:250` unit 240, line 253 zero failures, line 1055 browser `768 passed (17.1m)`. Independent 225 selected cases passed and 4/4 isolated regressions killed; state validator exit 0. | PASS |
| DESK-11 | Exact song copy, album top 4/ordered unique genres, bounded summary+bands descriptions; exact WebP viewer placeholders including lazy neighbour, real full image, no JPEG thumbnail | `tests/seo/song.e2e.cjs:265` `toHaveText(fansOf(s))`; `tests/seo/release.e2e.cjs:76` exact fans-of; line 98 `expect(a.genre).toEqual(seoOf(r).genres)`; `tests/seo/single-song.e2e.cjs:24` exact literal description; line 25 length<=160. `tests/perf/images.e2e.cjs:139` lazy neighbour `currentSrc === ''`; lines 148–149 capture real constructor items and forward `Reflect.construct`; line 157 complete exact WebP array; line 160 actual loaded full image; line 161 zero JPEG thumbnail requests. | PASS |
| DESK-12 | Below 860 cover fills panel up to 420px, centered before natural image width exists | `tests/home/phone-fit.e2e.cjs:14` requires `naturalWidth === 0` with release requests aborted; line 19 width error<=1px against `Math.min(column.width,420)`; line 20 center error<=1px. Six existing mobile widths and desktop cover/button cases remain. | PASS |
| DESK-13 | Controlled transient JS clock, explicit held late script, actual CSS animation checkpoints; deadlines/accessibility/listener cleanup retained, production unchanged | `tests/home/loader.e2e.cjs:24` installs/pauses clock; lines 119–138 hold route until after release/accessibility assertions and release in finally; lines 105–108 assert unfinished at 399ms and dismissed exactly 400ms; line 182 skip<600ms; lines 197–200 visible labelled status/inert; line 354 zero listeners. `tests/home/loader-style.e2e.cjs:44–56` sets/reads actual animation currentTime 1500/2500ms, directly checks visible/hidden and pre-release state; line 78 exact 2s computed delay. `git diff d5cf92c..4cdb91a` has no production changes. | PASS |

**Outcome coverage:**13/13 requirements match specified outcomes, including DESK-10 complete-gate closure. No spec-precision gap or uncovered behavioral criterion found. Changed tests map to DESK-01–13, listed responsive/short-screen/Home/song edges, or explicitly authorized regression closure. No unclaimed new feature tests found.

## Independent gates and raw-data audit

- Independent Eleventy: `node node_modules/@11ty/eleventy/cmd.js --output=/tmp/desktop-final-verifier-site`, exit 0. Its actual terminal summary was `Copied 291 files / Wrote 123 files`. The custom output path also caused existing generated `docs/` HTML to be read as nested input; those duplicate nested routes are not additional product pages. Tests used the correct root routes. This count is not compared with the normal build's 47 written pages.
- Independently compiled eight changed page Less entries in memory with existing compressed/comment-stripped contract. **8/8 byte-match committed bundles.** Copies: `/tmp/desktop-verifier-{home,band,discography,photos,videos,store,contact,newsletter}.css`.
- `npx playwright test --config=/tmp/desktop-verifier.config.cjs tests/desktop tests/seo/song.e2e.cjs tests/seo/release.e2e.cjs tests/seo/single-song.e2e.cjs tests/perf/images.e2e.cjs tests/home/phone-fit.e2e.cjs`: **155 passed, 0 failed, 0 skipped, 0 flaky**, exit 0, 3.9m. Complete JSON `/tmp/desktop-final-verifier-results.json`.
- `npx playwright test --config=/tmp/desktop-verifier-dossier.config.cjs tests/discography/song-bento.e2e.cjs tests/newsletter/markup.e2e.cjs --grep 'renders the bento|renders the lyrics bento|NOVID-04/05|NOVID-06/15|NOVID-18 fixture|BIT-'`: **40 passed, 0 failed, 0 skipped, 0 flaky**, exit 0, 41.1s. Complete JSON `/tmp/desktop-verifier-dossier.json`.
- Repository tests/fixtures ran on isolated port 4183, explicit UTF-8 HTML static responses, external hosts blocked by existing fixture. Complete suite was not duplicated by verifier. The initial 195-case independent browser work ended at 21:11:21 UTC; the later 30-case loader delta review is documented below and ended before the final complete gate.
- `/tmp/desktop-verifier-raw-audit.cjs`, exit 0: reads raw `_data/{discography,seo-catalog,songs}.json` and literal fixture without production catalog/filters. Output `/tmp/desktop-verifier-raw-audit.json`.
- Silicon Fortress audited top 4 `(count,maxScore)`: Alter Bridge `(4,.81)`, Dream Theater `(2,.79)`, Breaking Benjamin `(1,.83)`, Killswitch Engage `(1,.83)`, including alphabetical tie order. All seven ordered unique genres match fixture.
- Insane Driver and deluxe, deduplicated version tracks: Alter Bridge `(5,.83)`, Pantera `(2,.83)`, Black Label Society `(2,.80)`, Metallica `(2,.77)`. Both seven-entry ordered genre arrays match fixture.
- Both single literals equal source summary's first sentence plus curated band sentence; lengths **140** and **137**. Existing JSON-LD checks remain; expected descriptions no longer call production filters.

## Discrimination sensor

**Depth:** three behavior-level mutations in scratch rendered output only. No real source/test mutation, stash or worktree operation. Unmutated focused gates passed first.

| Mutation | Source and isolated target | Observed failure | Outcome |
| --- | --- | --- | --- |
| Remove mobile cover `width:100%`, retain cap/centering | `less/home.less:925`, corresponding rule in scratch `/tmp/desktop-final-verifier-site/index.html` only | `tests/home/phone-fit.e2e.cjs:19`: width error expected<=1px, received **50.515625px**, naturalWidth 0. One failed/exit 1. `/tmp/desktop-verifier-sensor-mobile.json`. | Killed |
| Remove Also `grid-row:1`, retain column 2 | `less/song-bento.less:69`, corresponding scratch CSS rule only | `tests/discography/song-bento.e2e.cjs:399`: About/Also top difference expected<=2px, received **433.296875px**, Age of Lies at 1920px. One failed/exit 1. `/tmp/desktop-verifier-sensor-dossier.json`. | Killed |
| Restore obsolete global fans-of sentence on Silicon Fortress | Scratch `/discography/silicon-fortress/index.html` only; DESK-11 rendered-contract regression | `tests/seo/release.e2e.cjs:76`: exact audited four-band sentence expected, obsolete Alter Bridge/Killswitch Engage/Avenged Sevenfold copy received. One failed/exit 1. `/tmp/desktop-verifier-sensor-seo.json`. | Killed |

**Sensor:**3 injected, 3 killed, 0 survived. Historical original product-grid 3→2 sensor also failed as intended; it is not counted among these fresh sensors.

Each scratch artifact was restored byte-for-byte after use. Real `git status --porcelain=v1` was saved to `/tmp/desktop-verifier-porcelain-before`; after all sensors/restore its complete output was **byte-string equal**. Comparison happened before this report was written. Baseline contains existing `.specs/LESSONS.md`, `.specs/lessons.json`, `.specs/STATE.md` edits and untracked tool directories; verifier touched none. All independent servers exited. Restored scratch/logs remain in `/tmp` for inspection.

## Complete gate and honest history

| Gate | Result | Provenance |
| --- | --- | --- |
| `npm run build` | Passed at `d5cf92c`, exit 0, 47 written pages and 291 copied files | Author-confirmed build; independent Eleventy/byte-matched Less also passed. |
| Final `npm test`, unit phase | 240 passed, 0 failed/skipped, exit 0 overall | Author `/tmp/desktop-pr-final-all.log:250–257`; complete captured log independently read and totals confirmed. |
| Third complete browser phase | 763 passed, 5 failed | Author `/tmp/desktop-pr-diagnostic-3.log`; PERF-35 CSS failsafe and HOME-24/26/28 late repeat/Escape/click/inert paths. This run overlapped the independent browser work. |
| Serial loader diagnosis | 30 passed, 0 failed, 41.2 seconds | Author `/tmp/desktop-pr-loader-serial.log`; no source/test changes, no concurrent browser work. |
| Complete browser phase after T6 | 768 passed, 0 failed, 17.1m; `npm test` exit 0 | Author `/tmp/desktop-pr-final-all.log:1055`; verifier independently counted all 768 successful browser case lines. Fully serial, after isolated verifier browser work ended; no source/test changes after `4cdb91a`. |
| Fresh T6 loader browser review | 30 passed, 0 failed/skipped/flaky, exit 0, 33.9s | `/tmp/desktop-verifier-loader.json`, at `4cdb91a`. |
| Independent selected browser, combined | 225 passed, 0 failed/skipped/flaky | Prior independent verifier 195 at `d5cf92c` plus fresh independent loader verifier 30 at `4cdb91a`; JSON reports above/below. |
| `validate_state.py desktop-layout` | Passed, exit 0, zero errors | Fresh independent verifier ran `.codex/skills/tlc-spec-driven/scripts/validate_state.py desktop-layout`; output `/tmp/desktop-pr-final-validate-state.log`. |

Earlier scoped report passed original 56 desktop cases while an affected-page run had 238 passed/22 failed. It never established full-repository green. Subsequent complete diagnostic: 734 passed/33 failed (`/tmp/desktop-pr-diagnostic-1.log`), driving authorized exact SEO/image and dossier repairs. Next complete run: 766 passed/1 failed (`/tmp/desktop-pr-diagnostic-2.log`), exposing the unavailable-image mobile cover race. T5 repaired behavior and added a blocked-image case; count is now 768. The third run overlapped the independent browser work and finished 763 passed/5 loader timing failures. Both loader files then passed all 30 cases serially without any source/test change. Resource contention remains a hypothesis; the successful scoped rerun does not replace a complete green gate. T6 subsequently corrected transient clock/script-delivery preconditions in only loader tests plus spec/tasks at `4cdb91a`, preserving exact assertions and production timing. Its fresh independent 30-case gate and failsafe sensor passed. The final complete post-T6 `npm test` then passed 240 unit and all 768 browser cases; earlier failures remain recorded rather than attributed conclusively to resource contention. The prior plain-Python Unicode probe was invalid without UTF-8 response charset; no product content was changed for it.

Integrity review of `b0a9d7f..d5cf92c` found **59 additional browser cases**: 56 desktop, two 1920px dossier, one blocked-image. Existing cases retained. No changed test uses skip/fixme/only. Assertions were not weakened to bypass failures: desktop sizes target approved frame/media limits; stale fixed SEO copy became exact curated values; PhotoSwipe asserts every exact real item source plus full image/no JPEG instead of transient DOM lifetime. Final 768 implies 709 pre-feature cases from additive diff; this is a count inference, not a historical execution claim.

## Edge cases, quality and remaining work

- Guide tests cover 2560px and nine overflow widths. 1200×720/1920×720 media tests require undistorted bounded media; Home menu/control usability is asserted.
- Below 1200 mixin preservation is differential. Authorized dossier/cover repairs have separate 992/991 and 859/860 boundaries with focused regression evidence.
- Verifier inspected this run's1920px Home/Band screenshots: aligned cards and outer guides. This is visual QA, not interactive human UAT; no human UAT claimed.
- Quality: one page-scoped Less mixin, eight existing entries/bundles, approved Contact gutter repair, narrow dossier/mobile cover repairs and exact tests. No unrelated content/integration/deployment/runtime abstraction. Existing build/test patterns retained. No additional project testing guidelines found; `.codex/skills/tlc-spec-driven/references/coding-principles.md` applied.
- **Ranked gaps:** None. DESK-10 is closed by the final complete green gate, independent evidence and state validation.
- Lesson signal: independently audit exact content oracles, observe stable viewer item state, test sizing before image availability. Protected lesson files with pre-existing user edits stayed untouched per orchestrator instruction. Signal is recorded here for later distillation; no lesson-script write is claimed.

## Requirement traceability

DESK-01–13 have matching evidence. T1–T7 validation is complete; overall PASS is backed by normal build success, the final complete 240-unit/768-browser gate, 225 independently repeated browser cases, four killed isolated mutations and the passing state validator.

## Fresh independent loader delta review at 4cdb91a

Read DESK-13, T6/T7, the validation instructions and the complete two-file test delta. No production timer source changed. Frozen JS and paused CSS isolate interaction sampling from browser-control latency; the Promise-held script cannot arrive before the exact 400ms and accessibility/inert assertions. CSS checkpoints seek the actual animation, preserving its real CSS delay rather than substituting a test delay. The visible/hidden checks are direct and do not retry beyond the checkpoint. Existing 600ms first-boot, 1500ms cap, 400ms repeat, skip<600ms, 2s CSS delay, reduced motion, inert, accessibility and listener assertions remain. No cases were removed, skipped, or weakened.

- Independent command: `npx playwright test --config=/tmp/desktop-verifier-loader.config.cjs tests/home/loader.e2e.cjs tests/home/loader-style.e2e.cjs`; **30 passed, 0 failed, 0 skipped, 0 flaky**, exit 0, 33.9s. Full JSON: `/tmp/desktop-verifier-loader.json`. UTF-8 isolated scratch server on 4183; unchanged production rendered output reused from prior verifier build.
- Discrimination: replaced both `home-loader-failsafe 0s linear 2s forwards` declarations with `3s` in scratch `/tmp/desktop-final-verifier-site/index.html` only. Ran only the CSS-alone case with `--grep 'with home.js and the inline release both gone'`. **Killed**, exit 1: `tests/home/loader-style.e2e.cjs:55` `expect(await loader.isHidden()).toBe(true)` received false at actual animation 2500ms. Full JSON: `/tmp/desktop-verifier-sensor-loader.json`.
- Scratch restored byte-for-byte from `/tmp/desktop-loader-final-original.html`. Real porcelain before/after was byte-identical before this report edit: `/tmp/desktop-loader-final-porcelain-before` and `/tmp/desktop-loader-final-porcelain-after`. Protected lessons and untracked tool directories untouched. Browser work/server isolation ended after 01:31:37 UTC on 2026-11-15; orchestrator notified before its complete gate could start.
- Fresh scope verdict: **PASS for DESK-13/T6**, 1 mutation injected/killed, 0 survived. Combined independent selected baseline cases: 225 passed across two commits/scopes; combined sensors: 4/4 killed. These selected runs are distinct from the author's final complete 768-case gate, which is now green and independently audited from its captured log. T7 closes with the state validator. The prior 195-case verifier and this fresh 30-case verifier are independent of the implementation/test author.
