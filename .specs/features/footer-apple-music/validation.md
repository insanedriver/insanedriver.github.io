# Footer Apple Music Validation

**Date**: 2026-10-25
**Spec**: `.specs/features/footer-apple-music/spec.md`
**Diff range**: `master..feature/footer-apple-music` (13a2ee5..817b46c, 1 commit)
**Verifier**: independent sub-agent (author ≠ verifier)

**Verdict**: PASS ✅

---

## Task Completion

No `tasks.md` (Small feature, Tasks phase skipped; spec maps all 5 ACs to a single Execute step).

| Step | Status | Notes |
| ---- | ------ | ----- |
| Execute | ✅ Done | 817b46c - Apple Music link in `_includes/footer/social.liquid:7-11`, `sameAs` entry in `_includes/seo/music-group.liquid:14`, tests updated |

---

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| FOOT-01 | 7 footer links, order Spotify, Apple Music, YouTube, Instagram, Facebook, Twitter, Bandcamp | `tests/seo/identity.e2e.cjs:35` - `expect(hrefs).toEqual(SAME_AS)` with `SAME_AS` the exact 7-URL ordered list (`:3-11`), on `/` and `/band/`; `tests/home/seo.e2e.cjs:21` - `expect(footerUrls).toHaveLength(7)` | ✅ PASS |
| FOOT-02 | href `https://music.apple.com/br/artist/insane-driver/1058331029?l=en`, `target="_blank"`, `title="Insane Driver on Apple Music"` | href: `tests/seo/identity.e2e.cjs:35` (2nd element of `SAME_AS`, `:5`); target: `:41` - `toHaveAttribute('target', '_blank')`; title: `:42` - `toHaveAttribute('title', 'Insane Driver on Apple Music')` on `.footer-social a` nth(1) | ✅ PASS |
| FOOT-03 | visible `fa-apple` icon | `tests/seo/identity.e2e.cjs:43` - `expect(apple.locator('i.fa-apple')).toBeVisible()` | ✅ PASS |
| FOOT-04 | `sameAs` equals the footer list, Apple Music included, in footer order | `tests/home/seo.e2e.cjs:22` - `expect(data.sameAs).toEqual(footerUrls)` (footer URLs parsed from `social.liquid`, order-sensitive, on `/`); `tests/seo/identity.e2e.cjs:28` - `expect(group.sameAs).toContain(profile)` for all 7 on `/` and `/band/` (same include) | ✅ PASS |
| FOOT-05 | 320px viewport: footer adds no horizontal overflow with 7 links | `tests/seo/identity.e2e.cjs:32` 320px viewport; `:55` - `expect(fit).toEqual({ footer: 0, footerRight: expect.any(Number), links: [] })`; `:56` - `expect(fit.footerRight).toBeLessThanOrEqual(0.5)` | ✅ PASS |

**Status**: ✅ 5/5 ACs covered, asserted values match spec outcomes. One non-blocking spec-precision note (hidden text, see below).

---

## Discrimination Sensor

Scratch: `git worktree add --detach <scratchpad>/wt 817b46c`, `node_modules` symlinked, `npm run less:build` once, one mutant at a time with `git checkout -- .` between mutants, then `git worktree remove --force` + `git worktree prune`. Command: `npx playwright test tests/seo/identity.e2e.cjs tests/home/seo.e2e.cjs`. Scratch baseline: 9/9 pass.

| # | File:line | Mutation | Killed by | Killed? |
| - | --------- | -------- | --------- | ------- |
| M1 | `_includes/footer/social.liquid:7-11` | dropped the Apple Music link | HOME-52, footer `/`, footer `/band/` (3 fail) | ✅ Killed |
| M2 | `_includes/footer/social.liquid:7-11` | moved Apple link after YouTube | HOME-52, footer `/`, `/band/` (3 fail) | ✅ Killed |
| M3 | `_includes/footer/social.liquid:8` | href → `https://music.apple.com/us/artist/insane-driver/1058331029` | HOME-52, footer `/`, `/band/` (3 fail) | ✅ Killed |
| M4 | `_includes/footer/social.liquid:8` | title → `Insane Driver on iTunes` | footer `/`, `/band/` (2 fail) | ✅ Killed |
| M5 | `_includes/footer/social.liquid:9` | removed the `<i class="fa fa-apple">` icon | footer `/`, `/band/` (2 fail) | ✅ Killed |
| M6 | `_includes/footer/social.liquid:9` | icon `fa-apple` → `fa-music` | footer `/`, `/band/` (2 fail) | ✅ Killed |
| M7 | `_includes/footer/social.liquid:7` | removed `target="_blank"` | footer `/`, `/band/` (2 fail) | ✅ Killed |
| M8 | `_includes/footer/social.liquid:9` | icon kept but `style="display:none"` | footer `/`, `/band/` (2 fail) | ✅ Killed |
| M9 | `_includes/footer/social.liquid:7` | Apple link `width:400px` (overflow at 320px) | footer `/`, `/band/` (2 fail) | ✅ Killed |
| M10 | `_includes/seo/music-group.liquid:14` | removed Apple Music from `sameAs` | HOME-52, GEN-01/02/03 `/`, `/band/` (3 fail) | ✅ Killed |
| M11 | `_includes/seo/music-group.liquid:14-15` | swapped Apple Music and YouTube in `sameAs` | HOME-52 (1 fail) | ✅ Killed |
| M12 | `_includes/footer/social.liquid:10` | removed hidden `<span class="social-text">Insane Driver on Apple Music</span>` | none (9 pass) | ⚠️ Survived in pass 1. Fixed: FOOT-02 now names the hidden text, and `tests/seo/identity.e2e.cjs:43` `expect(apple.locator('.social-text')).toHaveText('Insane Driver on Apple Music')`. Re-run: ✅ Killed (2 fail) |

**Sensor depth**: lightweight+ (12 mutations; feature is not P0)
**Result**: 12/12 killed after the M12 fix - PASS ✅

Isolation: real tree `git status --porcelain` captured before the sensor and diffed after worktree removal - identical (only the pre-existing untracked tool dirs). `git worktree list` shows only the main tree.

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ 5-line footer block + 1 JSON-LD line |
| Surgical changes | ✅ only the two includes + the two in-scope tests |
| No scope creep | ✅ no navbar change, no custom SVG, no new hover style (all Out of Scope) |
| Matches patterns | ✅ same markup shape as the other footer links (`btn btn-social-icon btn-<x> social-footer`, `fa-3x`, `social-text` span) |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met | ✅ e2e covers `/` and `/band/`, order, attributes, icon, JSON-LD, 320px |
| Every test maps to a spec requirement - no unclaimed tests | ✅ changed assertions map to FOOT-01..05 |
| Documented guidelines followed: none - strong defaults applied | ✅ |

---

## Edge Cases

- [x] 320px viewport: footer fits (FOOT-05, `tests/seo/identity.e2e.cjs:55-56`; M9 killed)

---

## Gate Check

- **Gate command**: `npm run test:unit` + `npx playwright test` (no tasks.md; project gate)
- **Unit**: 232/232 pass (re-confirmed by Verifier)
- **E2E (author run)**: 702 passed, 1 failed - `tests/perf/images.e2e.cjs` PS2-23 (networkidle timeout on `/photos/`); author reports it also fails on a clean master worktree, so it is pre-existing and unrelated to this diff (the diff touches no `/photos/` code). Targeted in-scope e2e re-run by Verifier: 9/9 pass.
- **Test count**: unchanged (assertions added to the existing footer test; `toHaveLength(6)` → `toHaveLength(7)` reflects the new link, not a weakening)
- **Skipped tests**: none

---

## Spec-Precision Note (non-blocking)

- **Hidden text**: the spec's Assumptions table fixes the hidden text as `Insane Driver on Apple Music`, but no AC states it, so M12 (span removed) survives. FOOT-02 could add the hidden `.social-text` value, and the footer test could assert `apple.locator('.social-text')` `toHaveText('Insane Driver on Apple Music')`. Fixed after pass 1: FOOT-02 amended and the assertion added; M12 is now killed.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| FOOT-01 | Implemented | ✅ Verified |
| FOOT-02 | Implemented | ✅ Verified |
| FOOT-03 | Implemented | ✅ Verified |
| FOOT-04 | Implemented | ✅ Verified |
| FOOT-05 | Implemented | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 5/5 ACs matched spec outcome; 1 non-blocking spec-precision note (hidden text not in any AC)
**Sensor**: 12 injected, 12 killed (M12 killed after the fix)
**Gate**: unit 232/232; in-scope e2e 9/9; full e2e 702/703 with 1 pre-existing unrelated failure (PS2-23)
