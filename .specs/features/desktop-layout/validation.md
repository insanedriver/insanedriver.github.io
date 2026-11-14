# Desktop layout validation

**Verdict: PASS for the desktop-layout feature.** The independent build and all 56 desktop tests passed. The broader repository gate remains failing: 238 passed and 22 failed. This is not a clean full-repository verdict.

**Date:** 2026-11-14  
**Spec:** `.specs/features/desktop-layout/spec.md`  
**Diff:** `b0a9d7f..99c213583aa6db222c1df09d71fcfaf5f3f0e282`  
**Verifier:** fresh independent sub-agent; author differs from verifier

## Acceptance evidence

| Requirement | Spec outcome | Test evidence and assertion | Result |
| --- | --- | --- | --- |
| DESK-01 | Centered min(1360px, viewport minus 64px) frame, 1px tolerance, full-width backgrounds | `tests/desktop/frame.e2e.cjs:25` checks `Math.abs(box.width - expectedWidth) <= 1`; `:26` checks expected centered x; `:29` checks background width. Expected values are derived explicitly at `:16–17`. Tests include 1200, 1366, 1440, 1920 and 2560px. | PASS |
| DESK-02 | Products/albums/Home highlights 3 columns; archive 4; members 5; singles 6; paired release/newsletter panels; horizontal video feed | `tests/desktop/content.e2e.cjs:21` asserts exact column counts from `:3–8`; `:97` asserts paired columns equal 2; `:129–131` assert flex, overflow-x auto, and scrollWidth greater than clientWidth. | PASS |
| DESK-03 | Cards 24px, paired panels 32px, major divisions 48–64px including separators | `tests/desktop/content.e2e.cjs:22` asserts gap `24px`; `:98` asserts `32px`; `:28` asserts separator total height plus margins equals 48. `less/desktop-layout.less:25` sets section padding to 48px/64px, `:96` sets the 48px decorative division, and `:98` sets the ticker division to 48px. | PASS |
| DESK-04 | Biography and Contact panels at most 760px; signup embed remains within its panel with integration preserved | `tests/desktop/content.e2e.cjs:48` and `:121` assert 760px; `:102–103` assert embed left/right containment; `:104` asserts the artist signup endpoint. | PASS |
| DESK-05 | Standalone video 16:9 and at most 60vh; full gallery/Band images at most 60vh; covers at most 360px; usable controls | `tests/desktop/content.e2e.cjs:60–61` assert video height and aspect ratio; `:50–51` and `:69–70` assert image height and contain fit; `:110` asserts cover width <=360; `:77–84` assert visible, bounded gallery controls and successful next navigation. | PASS |
| DESK-06 | No document overflow at all nine specified widths; preserve existing below-1200 component widths/composition | `tests/desktop/frame.e2e.cjs:30` and `:46` assert document scrollWidth <= viewport width across all specified widths and ten active page types. `tests/desktop/preservation.e2e.cjs:80` asserts exact equality of widths, display, columns and gaps against the same source with only the desktop mixin invocation removed, at 320, 390, 768 and 1024px. | PASS |
| DESK-07 | Preserve content, navigation, integration and usable controls; no excluded-page desktop overrides | `tests/desktop/content.e2e.cjs:104` checks signup src; `:84` checks gallery navigation; `:133` checks video counter becomes `02 / 10`. `tests/desktop/preservation.e2e.cjs:130` requires zero matching mixin selectors, zero leaked token rules, and empty body token on pre-save, preorder and Dates. `git diff b0a9d7f -- '*.html' '*.liquid' '_data' 'assets/js'` is empty, supporting exact preservation of existing text, destinations, integration attributes and control code. Existing `tests/newsletter/markup.e2e.cjs:47` asserts complete signup parameter values and `:73` asserts the fallback destination. | PASS |

All 7 acceptance criteria have evidence matching their defined outcomes. No spec-precision gap was found. Preservation claims about unchanged content use the diff as well as behavior assertions; the feature does not change templates, data or JavaScript.

## Gates and integrity

- Independent `npm run build`: exit 0, `/tmp/desktop-verifier-build.log`.
- Final commit confirmation: HEAD is `99c213583aa6db222c1df09d71fcfaf5f3f0e282`. Forty-three byte comparisons passed: all copied Less sources (using the saved original for the mutated mixin), all desktop test files, and the eight committed CSS bundles against the independently built `docs` bundles. No implementation or desktop-test change occurred after the successful independent gate. The spec's completion prose/status update does not change tested behavior.
- Independent browser gate: `npx playwright test --config=/tmp/desktop-independent-verifier/playwright.config.cjs`, exit 0, **56 passed, 0 failed, 0 skipped (1.7m)**, `/tmp/desktop-verifier-focused.log`. This runs exact copies of all three desktop test files against a copied `docs` build on port 4181, with copied Less for the preservation baseline. The server is released.
- Supplied author unit evidence: 33 test files passed, `/tmp/desktop-unit-final.log`. This was not independently rerun.
- Supplied broader affected-suite evidence: **238 passed, 22 failed**, `/tmp/desktop-regression.log`. Twenty failures concern old hardcoded FANS_OF copy; two concern Age Of Lies About/Also top-position expectations at 1280/992px. These are unresolved. Static inspection shows their relevant tests/templates/data and `less/song-bento.less` are unchanged from `b0a9d7f`; the baseline already places Sonic DNA between About and Also. No runtime baseline run was obtained, so this report does not claim runtime proof of inherited failures or attribute them to this layout change.
- No formal `tasks.md` exists: the spec explicitly selects two implementation steps and defines their gate checks. Both implementation steps have feature evidence; the broader gate remains red as described above.
- The broader affected-suite run has 260 cases and excludes the desktop directory. The feature adds 56 desktop cases where there were none before this feature. No old tests were deleted or skipped. The two changed legacy width assertions now assert the approved exact 1360px outcome instead of their superseded full-width expectations. The broader run retains its existing case count; this report does not infer a full-repository before/after count from that selected run.

## Discrimination sensor

**Depth:** lightweight, one completed behavior mutation, satisfying the required 1–3 range.

| Mutation | Location | Result |
| --- | --- | --- |
| Change the new product grid from 3 columns to 2, compile the scratch Store bundle, and run its 1920px distribution case | `less/desktop-layout.less:68`, scratch copy only | **Killed.** Exit 1, one failed test. `tests/desktop/content.e2e.cjs:21` expected 3 and received 2. Evidence: `/tmp/desktop-verifier-mutant-grid.log`. |

The sensor used `/tmp/desktop-independent-verifier`, copied build/source/tests, and a symlink to installed dependencies. It never mutated real source or tests and never used stash. After the sensor, real `git status --porcelain=v1` was byte-for-byte equal to `/tmp/desktop-independent-verifier/porcelain-before.txt`. The check ran before this report was created. The grid mutant has no running server. The inactive scratch remains in `/tmp` for evidence inspection; it is not a production source.

An optional media mutation was prepared only in scratch, but its browser command was interrupted during pending approval before execution. No media log exists and it is **not counted** as an executed or killed mutation. No breakpoint mutation was run.

## Edge cases and quality

- 2560px retains the 1360px frame through the exact guide assertions.
- 1920×720 media shrinks through the height/aspect/contain assertions.
- Home menu bounds are checked at `tests/desktop/frame.e2e.cjs:34–35`; the Home grid screenshot was inspected and shows aligned, uncropped cards within the shared guides.
- Song page frame, overflow, mobile composition and video sizing are included. The existing bento structure is unchanged.
- Scope is surgical: one shared scoped Less mixin, eight existing entry points/bundles, the approved Contact gutter repair, focused tests, and spec evidence. Existing page IDs prevent excluded pages from matching the mixin.
- No added application abstractions or integration changes. The compiled bundles match the existing build pattern. Test assertions measure exact spec dimensions and actual interaction outcomes, and the completed sensor confirms the grid check discriminates a regression.
- All new tests map to DESK-01–07 or the listed short-screen/Home/song edge cases. The extra thumbnail/link grid checks support desktop gap/layout preservation; no unrelated feature tests were added.
- Guidelines reviewed: `.codex/skills/tlc-spec-driven/references/coding-principles.md`. No source/test fixes were made by the verifier. Interactive human UAT was not performed and is not claimed.

## Outstanding work outside the scoped PASS

The broader 22 failures require a separate, authorized test/content/layout-baseline reconciliation before anyone claims the full repository gate passes. Keep those failures visible; do not weaken or skip assertions to clear them. No desktop acceptance fix task was identified.

No new feature-specific failure, surviving mutant or spec-precision gap requires lesson distillation. The general signal from the broad failures is to reconcile a changed content baseline with exact-copy and positional regression expectations. Per the parent instruction, `.specs/LESSONS.md` and `.specs/lessons.json` were left untouched because they contain pre-existing user changes.
