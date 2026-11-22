# Press reviews Validation

**Date**: 2026-11-22
**Spec**: `.specs/features/press-reviews/spec.md`
**Diff range**: `master..61e37e0` (8d7dac1..61e37e0, 9 commits)
**Verifier**: independent sub-agent (author ≠ verifier)
**Iteration**: re-verify 1 of 3 (iteration 0 FAILED on surviving mutant M7; fixed in 61e37e0)

**Verdict**: PASS ✅ - 25/25 ACs match their spec outcome, every non-equivalent mutant is killed (14/14), gate green.

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1 | ✅ Done | 8d7dac1; Terrorizer dropped in 00005d0; recognition count in tasks.md corrected to 3 in 61e37e0 |
| T2 | ✅ Done | 066ede9; meta description fixed in 2918f29 |
| T3 | ✅ Done | 0b95da0 |
| T4 | ✅ Done | 12e3671 |
| T5 | ✅ Done | 41e36e2 |
| T6 | ✅ Done | cb93b85 |
| Fix 1 | ✅ Done | 61e37e0 - visible-date test, partial-date order test, REV-03/REV-04 sharpened |

---

## Spec-Anchored Acceptance Criteria

| AC | Spec-defined outcome | `file:line` + assertion | Result |
| -- | -------------------- | ----------------------- | ------ |
| REV-01 | `/press/reviews/` on base layout, title "Press Reviews", page_id `press-reviews` | `tests/press/reviews-page.test.cjs:31` - `assert.match(html, /<body id="page_press-reviews">/)`; `:32` `<title>Press Reviews`; `:33` h1; `:34` footer; `tests/press/reviews.e2e.cjs:28` own CSS bundle `toHaveCount(1)` | ✅ PASS |
| REV-02 | One section per album, Silicon Fortress first, heading "title (year)" | `tests/press/reviews-page.test.cjs:39` - `assert.deepEqual(found.map(s => s.slug), ['silicon-fortress', 'insane-driver'])`; `:44` `assert.equal(text(h2[1]), \`${album.title} (${album.year})\`)` | ✅ PASS |
| REV-03 | One card per entry in its section, newest first; partial date sorts below fuller dates sharing its prefix (2016-12-05, 2016-12, 2016) | `tests/press/reviews-page.test.cjs:58` count per section; `:60` card url in date-descending order; `:65` total = reviews; `:173` `at('Gaveta de Bagunças') < at('Cangaço Rádio Rock')`; `:174` `at('Cangaço Rádio Rock') < at('Metal na Lata')`; `:175` `assert.equal(order[order.length - 1], 'Metal na Lata')` | ✅ PASS |
| REV-04 | Outlet, author when present, date as "Aug 18, 2016" / "Apr 2016" / "2016" by precision, quote, summary | `tests/press/reviews-page.test.cjs:75` outlet; `:77-78` author or `null`; `:79` quote; `:80` summary; `:162` `'Aug 18, 2016'`; `:163` `'Nov 17, 2022'`; `:164` `'Apr 2016'`; `:165` `'Dec 2016'`; `:166` `'2016'` (pinned literals, independent of `dateLabel`) | ✅ PASS |
| REV-05 | Score exactly as stored; none → no element | `tests/press/reviews-page.test.cjs:93` `assert.equal(text(score[1]), review.score)`; `:94` `assert.equal(score, null)`; `:96` both branches exercised | ✅ PASS |
| REV-06 | Link to `url`, `target="_blank"`, `rel="noopener"` | `tests/press/reviews-page.test.cjs:101-103` | ✅ PASS |
| REV-07 | `language: pt` → "Translated from Portuguese" | `tests/press/reviews-page.test.cjs:110` - `assert.equal(labeled, review.language === 'pt')` | ✅ PASS |
| REV-08 | `archived` → "Archived copy" + `web.archive.org` link | `tests/press/reviews-page.test.cjs:117` `assert.equal(labeled, review.archived === true)`; `:118` href prefix | ✅ PASS |
| REV-09 | print / press-release → "Print" / "Via press release" | `tests/press/reviews-page.test.cjs:126-127` | ✅ PASS |
| REV-10 | Intro: originally Brazilian Portuguese, band translated | `tests/press/reviews-page.test.cjs:134-135` | ✅ PASS |
| REV-11 | One linked Recognition item per entry | `tests/press/reviews-page.test.cjs:142` count; `:144` href; `:145-146` outlet + title; `tests/press/reviews-data.test.cjs:54` `assert.equal(data.recognitions.length, 3)` | ✅ PASS |
| REV-12 | Sitemap lists `/press/reviews/`; header menu does not | `tests/press/reviews-page.test.cjs:151` sitemap `<loc>`; `:154` `assert.doesNotMatch(nav[0], /href="\/press\/reviews\/"/)`; `tests/seo/output.test.cjs:19` INDEXABLE | ✅ PASS |
| REV-13 | Required non-empty fields, album slug, ISO date | `tests/press/reviews-data.test.cjs:14-15`; `:17` slug; `:18` `assert.match(r.date, ISO_DATE)`; `:25-27` 12 / 6 / 18 | ✅ PASS |
| REV-14 | archived → Wayback url + `originalUrl` | `tests/press/reviews-data.test.cjs:34-36` | ✅ PASS |
| REV-15 | Exactly Roadie Crew, Whiplash.Net, Heavy And Hell (SF) featured | `tests/press/reviews-data.test.cjs:45` - `assert.deepEqual(featured, ['Roadie Crew|insane-driver', 'Whiplash.Net|insane-driver', 'Heavy And Hell|silicon-fortress'])` | ✅ PASS |
| REV-16 | No duplicate `url` | `tests/press/reviews-data.test.cjs:50` | ✅ PASS |
| REV-17 | `EPK::REVIEWS` directly after `EPK::FACTS` | `tests/press/press.test.cjs:129` | ✅ PASS |
| REV-18 | 3 featured quote + outlet + score, data order | `tests/press/press.test.cjs:134` - deepEqual `{quote, outlet, score}` list | ✅ PASS |
| REV-19 | "Read all N reviews" → `/press/reviews/` | `tests/press/press.test.cjs:141` - `assert.equal(text(link[1]), \`Read all ${reviewData.length} reviews\`)` | ✅ PASS |
| REV-20 | `/band/` `PRESS::SIGNAL` after `BIO::ORIGIN`, same quotes + link | `tests/band/band-reviews.test.cjs:27` position; `:33` quotes; `:36` link text | ✅ PASS |
| REV-21 | One shared include | `tests/band/band-reviews.test.cjs:40` - identical featured block on `/band/` and `/press/` (behavioral proxy) | ✅ PASS |
| REV-22 | No horizontal scroll at 390px | `tests/press/reviews.e2e.cjs:7` - `toBe(0)` at 320/390/768/1440 | ✅ PASS |
| REV-23 | Quote + summary Rajdhani ≥16px at 390px | `tests/press/reviews.e2e.cjs:18` count; `:20` `toBe('Rajdhani')`; `:21` `toBeGreaterThanOrEqual(16)` | ✅ PASS |
| REV-24 | Requests every review + recognition url; prints non-2xx/3xx with status | `tests/press/check-review-links.test.cjs:23` requested set; `:36` failures deepEqual (404, 503, network error; 200/301 pass); `:45-47` report text | ✅ PASS |
| REV-25 | Not in `npm test` / `npm run build` | `tests/press/check-review-links.test.cjs:56-57` | ✅ PASS |

**Status**: ✅ All ACs covered with spec-anchored assertions. The iteration-0 spec-precision gap (REV-03 partial-date order) is closed: the spec now states the rule and `:173-175` assert it with named entries.

---

## Discrimination Sensor

Scratch: `git worktree add --detach` under the session scratchpad, `node_modules` symlinked, eleventy rebuilt per mutant, feature unit files run (`tests/press/{reviews-data,reviews-page,press,check-review-links}.test.cjs`, `tests/band/band-reviews.test.cjs`); M11 ran `tests/press/reviews.e2e.cjs` after `node scripts/build-css.cjs`. Iteration 0 ran M1-M11 on cb93b85; iteration 1 ran M7, M12-M14 and M2 on 61e37e0 (unmutated baseline in the same worktree: 42/42 green).

| # | File:line | Mutation | Killed? |
| - | --------- | -------- | ------- |
| M1 | `_includes/press/featured-reviews.liquid:3` | Featured filter `review.featured` → `review.outlet` | ✅ Killed (REV-18, REV-20) |
| M2 | `_data/reviewGroups.js:23` | Sort oldest first (re-run on 61e37e0) | ✅ Killed (REV-03 ×2, REV-04 ×2, edges) |
| M3 | `press/reviews/index.html:55` | "Archived copy" condition → `review.source` | ✅ Killed (REV-08) |
| M4 | `press/reviews/index.html:50` | Score `<span>` unconditional | ✅ Killed (REV-05) |
| M5 | `scripts/check-review-links.cjs:14` | Threshold `>= 400` → `>= 500` | ✅ Killed (REV-24) |
| M6 | `_data/reviewGroups.js:26` | Empty-album filter `> 0` → `>= 0` | ✅ Killed (REV-02, Deluxe edge) |
| M7 | `_data/reviewGroups.js:11` | Visible date year-only | ✅ Killed on 61e37e0 (REV-04 visible date, `:157`); survived on cb93b85 |
| M8 | `press/reviews/index.html:52` | Author separator outside author condition | ✅ Killed (Morticínio edge) |
| M9 | `scripts/check-review-links.cjs:14` | Drop `status < 200` | ⚪ Equivalent (fetch never resolves 1xx) - excluded |
| M10 | `_includes/press/featured-reviews.liquid:5` | Featured score removed | ✅ Killed (REV-18) |
| M11 | `less/press-reviews.less:117` | Summary 1.6rem → 1.5rem | ✅ Killed (REV-23 e2e) |
| M12 | `_data/reviewGroups.js:12` | Wrong month: `MONTHS[Number(month) - 1]` → `MONTHS[Number(month) % 12]` | ✅ Killed (REV-04 visible date) |
| M13 | `_data/reviewGroups.js:13` | Day dropped from full dates | ✅ Killed (REV-04 visible date) |
| M14 | `_data/reviewGroups.js:23` | Partial dates sort above fuller dates (`padEnd(10, '~')` key) | ✅ Killed (REV-03 partial-date order, REV-03, REV-04) |

**Sensor depth**: lightweight, expanded to 14 mutations
**Result**: 13/13 non-equivalent mutants killed on the final tree (M7 re-run killed; M9 equivalent). PASS ✅
**Isolation**: both worktrees removed and pruned; real-tree `git status --porcelain` matched each pre-sensor baseline exactly (iteration 1 baseline: 14 lines, the earlier 13 plus this untracked `validation.md`).

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ Feature files plus justified inventory counts in `tests/perf/scripts.test.cjs`, `tests/seo/output.test.cjs` |
| No scope creep | ✅ No JSON-LD, menu entry or album-page reviews |
| Matches patterns | ✅ `cyber-panel`, `less/pages/<page_id>.less`, `node:test` over `docs/` |
| Spec-anchored outcome check | ✅ Visible date now pinned to literals |
| Per-layer Coverage Expectation met | ✅ |
| Every test maps to a spec requirement | ✅ |
| Documented guidelines followed: `.specs/features/press-reviews/tasks.md` Test Coverage Matrix, `package.json` scripts | ✅ |

---

## Edge Cases

- [x] No author (Morticínio): no author element, no separator - `tests/press/reviews-page.test.cjs:86`; M8 killed.
- [x] Review predates release (Pólvora Zine, 2021-08-21): real date kept - `tests/press/reviews-page.test.cjs:70`; visible label format pinned by `:162-166`.
- [x] Album with no reviews (Deluxe Edition): no section - `tests/press/reviews-page.test.cjs:49`; M6 killed.

---

## Gate Check

- **Gate command**: `npm run build && npm test`
- **Result**: Verifier ran `npm run build && npm run test:unit` on a clean 61e37e0 worktree → 368/368. Browser suite: 863/863 on cb93b85 (orchestrator `full-gate-2.log`); 61e37e0 changes only a unit test file and spec/tasks text, so no browser-facing code changed since. Iteration 0 also reran `tests/press/reviews.e2e.cjs` → 6/6.
- **Delta**: +33 unit tests in feature files (`reviews-data` 6, `reviews-page` 17, `press` +3, `band-reviews` 3, `check-review-links` 4) and +6 e2e.
- **Skipped tests**: none
- **Failures**: none
- **Test integrity**: inventory edits only raise counts for the new page; no assertion weakened.

---

## Fix Plans

None open. Fix 1 (visible date, M7) closed by 61e37e0.

**Non-blocking note**: `tests/press/reviews-page.test.cjs:173-174` use `indexOf`, which returns -1 for a renamed outlet and would pass vacuously; `:175` and the main REV-03 test (`:60`) still catch a wrong order, so no fix task.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| REV-01..REV-25 | Implementing | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready

**Spec-anchored check**: 25/25 ACs matched spec outcome; 0 open spec-precision gaps
**Sensor**: 13/13 non-equivalent mutants killed (14 injected, 1 equivalent)
**Gate**: 368 unit + 863 browser passed, 0 failed

**What works**: data validation, album grouping and order including partial dates, visible date format, score and label conditions, featured filtering and shared include on `/press/` and `/band/`, sitemap and menu exclusion, layout at 320-1440px, typography, link checker thresholds and its isolation from `npm test`/build.

**Next steps**: orchestrator updates `spec.md` statuses to Verified; user reviews the English translations (Success Criteria); push/PR need an explicit go-ahead.
