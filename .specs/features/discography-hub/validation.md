# Discography Hub Validation

**Date**: 2026-10-23
**Spec**: `.specs/features/discography-hub/spec.md`
**Diff range**: `master..feature/discography-hub` (9215a4e..fd57656, HEAD `fd57656`)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: 2 of max 3 (iteration 1 FAIL at `ecdc57e`: HUB-20 surviving mutant M10, HUB-07 spec-precision gap M6b)

## Validation Verdict

**Result**: PASS - 24/24 ACs have spec-anchored evidence; all 6 re-run mutants killed, including the two iteration-1 survivors; gate green.

---

## Iteration 2 changes verified (`fd57656`)

| Iteration-1 gap | Fix | Verified by |
| --- | --- | --- |
| HUB-20 regex missed "YT Music" (M10 survived) | `tests/discography/seo.e2e.cjs:46-48` loops `_data/platforms.json` and asserts the lowercased description does not contain any `key` or `name` | M10 re-run: killed |
| HUB-07 did not encode "no platform icons" (M6b survived) | AC text at `.specs/features/discography-hub/spec.md:79` now says "with no platform icon (`.fa`) inside it"; `tests/discography/singles.e2e.cjs:29` - `card.locator('.fa')).toHaveCount(0)` | M6b re-run: killed |
| `description` could leak between album cards | `discography/index.html:46` resets `description` to `''` before the lookup | M15 (wrong lookup slug) killed by HUB-04; reset is defensive, every album is in `catalog.releases` |

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | BUY CD + PREVIEW in `discography/release.liquid:53-62` |
| T2 | ✅ Done | Hero + album cards `discography/index.html:24,49-57` |
| T3 | ✅ Done | `_includes/discography/single-card.liquid` |
| T4 | ✅ Done | CollectionPage `discography/index.html:90-105`, meta `discography/index.html:5` |
| T5 | ✅ Done | `less/discography.less:259-330` |
| T6 | ✅ Done | A5 amendment in `discography-cyberpunk/spec.md`, IDX note in `seo-discovery/spec.md` |
| Fix (iter 2) | ✅ Done | `fd57656` |

---

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| --- | --- | --- | --- |
| HUB-01 | 3 album cards in order SF, Deluxe, ID | `tests/discography/markup.e2e.cjs:14-16` - `toHaveCount(albums.length)`; `toEqual(['silicon-fortress','insane-driver-deluxe','insane-driver'])` | ✅ PASS |
| HUB-02 | one `<a>`, href = `/discography/<slug>/`, no inner link/button | `tests/discography/markup.e2e.cjs:23-25` - tagName `A`, `toHaveAttribute('href', `/discography/${slug}/`)`, `a.locator('a, button')).toHaveCount(0)`; `tests/seo/index-links.e2e.cjs:20` | ✅ PASS |
| HUB-03 | cover alt, `ALBUM`/`DELUXE EDITION // year`, title, `<n> tracks`, description, `OPEN RELEASE` | `tests/discography/markup.e2e.cjs:33-38`; description `markup.e2e.cjs:45` | ✅ PASS |
| HUB-04 | full description; `-webkit-line-clamp: 3` | `tests/discography/markup.e2e.cjs:45` - `toHaveText(copy[slug])`; `tests/discography/theme.e2e.cjs:96-103` - clamp `'3'`, `overflow hidden`, overflowing text renders 3 lines | ✅ PASS |
| HUB-05 | ≥992px one row; <992px one column | `tests/discography/theme.e2e.cjs:70-77` (992, 1280), `theme.e2e.cjs:82-88` (375, 991) | ✅ PASS |
| HUB-06 | 18 singles in catalog order, no `<details>` | `tests/discography/singles.e2e.cjs:12-16` | ✅ PASS |
| HUB-07 | one `<a>`, href = `catalog.links[slug].page`, cover/title/year, no `.fa` | `tests/discography/singles.e2e.cjs:23-29` (tagName, no inner `a, button`, src, alt, title, year, `.fa` count 0); href `tests/seo/index-links.e2e.cjs:29-31` (independently derived page) | ✅ PASS |
| HUB-08 | no `[data-disc-link]` on hub | `tests/discography/singles.e2e.cjs:35`; `tests/discography/seo.e2e.cjs:20-21` | ✅ PASS |
| HUB-09 | 375px ≥2 singles per row | `tests/discography/theme.e2e.cjs:107-110` | ✅ PASS |
| HUB-10 | `Discography.`, `03 RELEASES // 18 SINGLES` | `tests/discography/markup.e2e.cjs:51-52` - exact `toHaveText` | ✅ PASS |
| HUB-11 | no `.disc-shell a[href^="#"]` | `tests/discography/markup.e2e.cjs:57` | ✅ PASS |
| HUB-12 | one `a.disc-buy` = buyCd, after links, before tracklist | `tests/discography/preview.e2e.cjs:57-58`; order `preview.e2e.cjs:44-50` | ✅ PASS |
| HUB-13 | one PREVIEW with slug + spotifyId, after BUY CD, before tracklist | `tests/discography/preview.e2e.cjs:27-30`; order `preview.e2e.cjs:44-50` | ✅ PASS |
| HUB-14 | no buyCd → no `.disc-buy`; no spotifyId → no preview | `tests/discography/preview.e2e.cjs:64-68` (Deluxe), `preview.e2e.cjs:73-81` (change-live) | ✅ PASS |
| HUB-15 | one iframe `open.spotify.com/embed/album/<id>`, aria-expanded toggles, removed on re-click, no request before click | `tests/discography/preview.e2e.cjs:16-20`, `:88-89`, `:95-100`; failure `:114-119`; no-JS `:127-130` | ✅ PASS |
| HUB-16 | `{event:'release_click', platform, release}`, default not prevented | `tests/discography/tracking.e2e.cjs:21-23`, `:30-32`, `:43`, `:54-58` | ✅ PASS |
| HUB-17 | no `MusicAlbum` on hub | `tests/discography/seo.e2e.cjs:14` - `not.toContain('MusicAlbum')` (control `:16`) | ✅ PASS |
| HUB-18 | one CollectionPage, ItemList of 21, positions 1..21 in DOM order, url = origin + href, name = title | `tests/discography/seo.e2e.cjs:30-38` - `itemListElement` `toEqual` the list built from DOM hrefs | ✅ PASS |
| HUB-19 | covers from `/assets/images/releases/`, w/h, lazy except first album | `tests/discography/seo.e2e.cjs:55-57`; `tests/discography/singles.e2e.cjs:42` + src `singles.e2e.cjs:25` | ✅ PASS |
| HUB-20 | meta description names no streaming platform | `tests/discography/seo.e2e.cjs:46-48` - for every `platforms.json` key and name, `not.toContain(word.toLowerCase())` | ✅ PASS |
| HUB-21 | no horizontal overflow at 375/768/992/1280 | `tests/discography/theme.e2e.cjs:56-60` | ✅ PASS |
| HUB-22 | focus outline not `none`, negative offset | `tests/discography/theme.e2e.cjs:115-124` | ✅ PASS |
| HUB-23 | cards navigate with JS off | `tests/discography/markup.e2e.cjs:62-64`; `tests/discography/singles.e2e.cjs:47-48` | ✅ PASS |
| HUB-24 | transparent `.cyber-zone`, `.cyber-panel` panels | `tests/discography/markup.e2e.cjs:69-76`; `tests/discography/theme.e2e.cjs:7` | ✅ PASS |

**Status**: ✅ All ACs covered; no spec-precision gaps remaining.

### Retired / relocated coverage check (unchanged from iteration 1)

Old-index behaviors that still apply are covered on the release pages:
- Listening links: `tests/seo/release.e2e.cjs:64-65` (REL-04), `tests/discography/markup.e2e.cjs:80-91` (DISC-05/06).
- Preview: HUB-13/15. BUY CD: HUB-12/14, DISC-38 at `tests/discography/theme.e2e.cjs:128-136`. Tracking: HUB-16 (album + single).
- Tracklist / MusicAlbum: `tests/seo/release.e2e.cjs:76` (REL-03/05), `tests/seo/index-links.e2e.cjs:38-46`.
- DISC-11: `tests/band/cyber-links.e2e.cjs:45`. HOME-11/32: `tests/home/panels-style.e2e.cjs:63-68`.
- DISC-24 (two previews, one iframe) was retired, which is correct: a release page has one preview.

---

## Discrimination Sensor

Iteration 2 ran in a fresh detached `git worktree` at `fd57656` under the session scratchpad (node_modules symlinked), one mutant at a time, restored with `git checkout -- .` + `less:build` between mutants, then removed with `git worktree remove --force`.

| # | File:line | Mutation | Iter 1 | Iter 2 |
| --- | --- | --- | --- | --- |
| M10 | `discography/index.html:5` | meta description "...where to listen on YT Music." | ❌ Survived | ✅ Killed (HUB-20) |
| M6b | `_includes/discography/single-card.liquid:6` | decorative `<i class="fa fa-spotify">` in the single card | ⚠️ Survived | ✅ Killed (HUB-07) |
| M1 | `discography/release.liquid:53` | `{% if source.buyCd %}` → `{% if true %}` | ✅ Killed | ✅ Killed (HUB-12/13 order, HUB-14 ×2) |
| M5 | `less/discography.less:297` | removed card `outline-offset: -3px` | ✅ Killed | ✅ Killed (HUB-22) |
| M8 | `discography/index.html:49` | album card `href` → `#<slug>` | ✅ Killed | ✅ Killed (HUB-02, HUB-11, HUB-23) |
| M15 | `discography/index.html:47` | description lookup always matches `silicon-fortress` | - | ✅ Killed (HUB-04) |

Also killed in iteration 1 at `ecdc57e`. Iteration 2 changed none of these lines' behavior.

| # | File:line (at `ecdc57e`) | Mutation | Killed by |
| --- | --- | --- | --- |
| M2 | `discography/release.liquid:57-62` | PREVIEW moved after the tracklist | HUB-12/13 order |
| M3 | `less/discography.less:313` | no line-clamp | HUB-04 |
| M4 | `less/discography.less:269` | breakpoint 992 → 900px | HUB-05 |
| M6 | `_includes/discography/single-card.liquid:6` | `data-disc-link` icon added | HUB-08 |
| M7 | `discography/index.html:100` | singles positions lose the offset | HUB-18 |
| M9 | `discography/index.html:24` | no zero-pad | HUB-10 |
| M11 | `discography/index.html:49` | first cover lazy | HUB-19 |
| M12 | `discography/release.liquid:58` | wrong spotify id | HUB-13/15 |
| M13 | `discography/release.liquid:58` | PREVIEW not `hidden` | HUB-15 no-JS |
| M14 | `discography/index.html:100` | ItemList url built from the slug | HUB-18 |

**Sensor depth**: expanded (15 distinct mutants across both iterations; 6 re-run in iteration 2)
**Result**: iteration 2 6/6 killed; every distinct mutant is now killed - PASS ✅

**Isolation**: the real-tree `git status --porcelain` baseline for iteration 2 was taken before the sensor run. It held this verifier's uncommitted `.specs/LESSONS.md`, `.specs/lessons.json` and `validation.md` plus the untracked tooling dirs. The status was identical after the worktree was removed, and `git worktree list` shows only the main tree.

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code | ✅ |
| Surgical changes | ✅ (fix commit touches only the spec line, 1 template line, 2 tests) |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check | ✅ |
| Per-layer coverage expectation | ✅ every album/single; Deluxe + single for negatives (L-024, L-037) |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed: `.specs/LESSONS.md` (L-004, L-024, L-037, now L-049/L-050 applied), `package.json`, `playwright.config.cjs` | ✅ |

---

## Edge Cases

- [x] An over-long description is clipped (`tests/discography/theme.e2e.cjs:102-103`). The "does not grow past its siblings' row" half holds through grid stretch and is not asserted directly. Low risk.
- [x] Album count < 10 is zero-padded (`tests/discography/markup.e2e.cjs:52`).
- [x] A failed Spotify embed leaves the links and BUY CD usable (`tests/discography/preview.e2e.cjs:114-119`).

---

## Gate Check

- **Build**: `npm run build` - exit 0
- **Unit**: `npm run test:unit` - 218 passed, 0 failed, 0 skipped
- **E2E (Full gate set)**: `npx playwright test tests/discography tests/seo tests/home/panels-style.e2e.cjs tests/band/cyber-links.e2e.cjs` - 324 passed, 0 failed, 0 skipped (4.0m)
- **Test count before feature** (same set, `master`): 327; full suite 689
- **Test count after feature**: 324; full suite 686
- **Delta**: -3, justified by the old-index tests retired or merged per tasks.md notes and A5. Each behavior that still applies has a replacement (see the retired / relocated coverage check above).
- **Skipped tests**: none
- **Failures**: none. The Verifier did not re-run the full `npm test`. The author's build gate reported 685/686, the one failure being the known PS2-23 `/photos/` flake outside this diff.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| HUB-01..HUB-24 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 24/24 ACs match the spec outcome; 0 spec-precision gaps
**Sensor**: iteration 2 6/6 killed (all 15 distinct mutants killed)
**Gate**: build OK, unit 218/218, e2e 324/324

**What works**: the hub's album and single cards are single anchors with correct destinations, order and content, with no platform icons. Also correct: the hero counter, the CollectionPage/ItemList, cover loading, the meta description, the layout at every tested width, and the inside focus ring. BUY CD and PREVIEW now live on the release pages, with the right order, negatives, preview behavior and tracking.

**Issues found**: none.

**Next steps**: update the `spec.md` traceability statuses to Verified; merge when ready.
