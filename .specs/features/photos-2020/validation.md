# Validation: photos-2020 - PASS

**Date**: 2026-09-19
**Spec**: `.specs/features/photos-2020/spec.md`
**Diff range**: `223a983..HEAD`
**Verifier**: independent sub-agent (author ≠ verifier)

---

## Task Completion

| Task | Status | Notes |
| ---- | ------ | ----- |
| T1: Ingest 2020 photoshoot assets and generate thumbnails | ✅ Done | 6 photos and 6 thumbnails added to `assets/gallery/promo2020/` (`bcfb92b`) |
| T2: Register 2020 photos in data catalog | ✅ Done | 23 photos configured in `_data/photos.json` with 2020 photos at positions 1-6 (`0a70a80`) |
| T3: Implement client-side carousel randomization | ✅ Done | Fisher-Yates randomization on PROMO/LIVE items in `assets/js/photos.js` (`2d81a5e`) |
| T4: Update test suite for 23 photos and random highlights | ✅ Done | Unit tests and Playwright E2E suites updated to cover 23 photos and randomization (`cbac194`) |

---

## Spec-Anchored Acceptance Criteria

### P1: 2020 Photoshoot Archive Display

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| P2020-01: Display all 6 photoshoot 2020 photos at top of archive grid, photo 274 first | Photos 274, 113, 133, 36, 140, 20 at indices 0-5 in archive starting with 274 | `tests/photos/gallery.test.cjs:36` - `assert.deepEqual(photos.map(p => p.src), expected)` | ✅ PASS |
| P2020-02: Display all 23 local archive photos with full-size links and thumbnails | Archive length is 23; all files exist on disk; 23 figure elements rendered | `tests/photos/gallery.test.cjs:35` - `assert.equal(photos.length, 23);`<br>`tests/photos/gallery.test.cjs:38` - `assert.ok(fs.existsSync('.' + p.src));`<br>`tests/photos/gallery.test.cjs:39` - `assert.ok(fs.existsSync('.' + p.thumbnail));`<br>`tests/photos/gallery.e2e.cjs:5` - `await expect(page.locator('.photos-archive figure')).toHaveCount(23);` | ✅ PASS |
| P2020-03: Descriptive alt text, dimensions, category PROMO, caption "Promo Picture 2020" for each 2020 photo | Positive integer width/height, alt > 20 chars with band name, category `PROMO`, caption `Promo Picture 2020` | `tests/photos/gallery.test.cjs:54` - `assert.match(p.alt, /Insane Driver/);`<br>`tests/photos/gallery.test.cjs:55` - `assert.ok(p.alt.length > 20);`<br>`tests/photos/gallery.test.cjs:56` - `assert.ok(Number.isInteger(p.width) && p.width > 0);`<br>`tests/photos/gallery.test.cjs:57` - `assert.ok(Number.isInteger(p.height) && p.height > 0);`<br>`tests/photos/gallery.test.cjs:59` - `assert.equal(p.category, 'PROMO');`<br>`tests/photos/gallery.test.cjs:60` - `assert.equal(p.caption, 'Promo Picture 2020');` | ✅ PASS |
| P2020-04: Working full-size links when JavaScript is disabled | 23 archive links return HTTP 200 with image MIME content-type | `tests/photos/gallery.e2e.cjs:14` - `await expect(links).toHaveCount(23);`<br>`tests/photos/gallery.e2e.cjs:17` - `expect(response.status()).toBe(200);`<br>`tests/photos/gallery.e2e.cjs:18` - `expect(response.headers()['content-type']).toMatch(/^image\\//);` | ✅ PASS |

### P1: Static Fallback and Dynamic Carousel Randomization

| Criterion (WHEN X THEN Y) | Spec-defined outcome | `file:line` + assertion | Result |
| ------------------------- | -------------------- | ----------------------- | ------ |
| P2020-05: 6 photoshoot 2020 photos as static HTML fallback in carousel with photo 274 first | 6 static featured slides ordered 1-6 from promo2020 with 274 first | `tests/photos/gallery.test.cjs:45` - `assert.equal(selected.length, 6);`<br>`tests/photos/gallery.test.cjs:46` - `assert.deepEqual(selected.map(p => p.highlightOrder), [1, 2, 3, 4, 5, 6]);`<br>`tests/photos/gallery.test.cjs:47` - `assert.equal(selected[0].src, '/assets/gallery/promo2020/274.jpg');`<br>`tests/photos/gallery.test.cjs:48` - `assert.ok(selected.every(p => p.src.startsWith('/assets/gallery/promo2020/')));`<br>`tests/photos/gallery.e2e.cjs:4` - `await expect(page.locator('[data-photo-slide]')).toHaveCount(6);` | ✅ PASS |
| P2020-06: Carousel dynamically selects 6 distinct photos from eligible PROMO and LIVE items | 6 unique slides with IDs mapped to archive entries with category PROMO or LIVE | `tests/photos/carousel.e2e.cjs:50` - `await expect(slides).toHaveCount(6);`<br>`tests/photos/carousel.e2e.cjs:52` - `expect(new Set(ids).size).toBe(6);`<br>`tests/photos/carousel.e2e.cjs:55` - `await expect(archiveFigure).toHaveCount(1);`<br>`tests/photos/carousel.e2e.cjs:57` - `expect(['PROMO', 'LIVE']).toContain(category);` | ✅ PASS |
| P2020-07: Next, prev, thumbnail, arrow keys, and swipe gestures update visible slide, counter, and active thumbnail | Active slide visible, counter text `0X / 06`, thumbnail `aria-pressed="true"` synchronized | `tests/photos/carousel.e2e.cjs:5` - `await expect(counter(page)).toHaveText(\`0\${n} / 06\`);`<br>`tests/photos/carousel.e2e.cjs:7` - `await expect(counter(page)).toHaveText('01 / 06');`<br>`tests/photos/carousel.e2e.cjs:11` - `await expect(counter(page)).toHaveText('06 / 06');`<br>`tests/photos/carousel.e2e.cjs:15` - `await expect(counter(page)).toHaveText('04 / 06');`<br>`tests/photos/carousel.e2e.cjs:16` - `await expect(page.locator('[data-photo-slide]').nth(3)).toBeVisible();`<br>`tests/photos/carousel.e2e.cjs:17` - `await expect(page.locator('[data-photo-select="3"]')).toHaveAttribute('aria-pressed','true');`<br>`tests/photos/carousel.e2e.cjs:22` - `await expect(counter(page)).toHaveText('02 / 06');`<br>`tests/photos/carousel.e2e.cjs:33` - `await expect(counter(page)).toHaveText('02 / 06');` | ✅ PASS |
| P2020-08: Activating any carousel slide opens corresponding full-size image in PhotoSwipe | PhotoSwipe viewer opens `.pswp--open` with `img.pswp__img` matching the active slide URL | `tests/photos/viewer.e2e.cjs:4` - `await expect(page.locator('.pswp')).toHaveClass(/pswp--open/);`<br>`tests/photos/viewer.e2e.cjs:5` - `await expect(page.locator('.pswp__item').nth(1).locator('img.pswp__img').last()).toHaveAttribute('src',src);`<br>`tests/photos/viewer.e2e.cjs:12` - `await link.click(); await current(page,src);` | ✅ PASS |
| P2020-09: Zero-JS renders 6 static 2020 slides and functional links | 6 slide containers rendered in HTML markup and functional direct image links | `tests/photos/gallery.e2e.cjs:4` - `await expect(page.locator('[data-photo-slide]')).toHaveCount(6);`<br>`tests/photos/gallery.e2e.cjs:14` - `await expect(links).toHaveCount(23);`<br>`tests/photos/gallery.test.cjs:45` - `assert.equal(selected.length, 6);`<br>`photos/index.html:15` - `{% for photo in photos %}{% if photo.featured %}` | ✅ PASS |

**Status**: ✅ All ACs covered

---

## Discrimination Sensor

| Mutation | File:line | Description | Killed? |
| -------- | --------- | ----------- | ------- |
| 1 | `_data/photos.json:12` | Changed photo 274 `highlightOrder` from `1` to `7` | ✅ Killed at `tests/photos/gallery.test.cjs:46` (`ERR_ASSERTION`: expected `[1,2,3,4,5,6]`, got `[2,3,4,5,6,7]`) |
| 2 | `assets/js/photos.js:76` | Injected duplicate highlights `chosen = [shuffled[0], ... x6]` into carousel | ✅ Killed at `tests/photos/carousel.e2e.cjs:52` (`expect(new Set(ids).size).toBe(6)`: expected 6, received 1) |

**Sensor depth**: lightweight (2 targeted behavior-level mutations)
**Result**: 2/2 killed - PASS

---

## Code Quality

| Principle | Status |
| --------- | ------ |
| Minimum code | ✅ |
| Surgical changes | ✅ |
| No scope creep | ✅ |
| Matches patterns | ✅ |
| Spec-anchored outcome check (asserted values match spec) | ✅ |
| Per-layer Coverage Expectation met (catalog unit tests 1:1; e2e routes happy+edge+error) | ✅ |
| Every test maps to a spec requirement - no unclaimed tests | ✅ |
| Documented guidelines followed: `.agent/skills/tlc-spec-driven/references/coding-principles.md` | ✅ |

---

## Edge Cases

- [x] JavaScript disabled preserves static 2020 highlights without layout breakage (`tests/photos/gallery.e2e.cjs:8`)
- [x] BACKSTAGE archive entries are excluded from carousel dynamic randomization (`assets/js/photos.js:64`, `tests/photos/carousel.e2e.cjs:48`)
- [x] All 6 dynamically randomized photos are guaranteed unique (`assets/js/photos.js:69-76`, `tests/photos/carousel.e2e.cjs:52`)

---

## Gate Check

- **Gate command**: `npm run build && npm test`
- **Result**: 24 passed (3 unit, 21 e2e), 0 failed, 0 skipped
- **Test count before feature**: 23 (3 unit, 20 e2e)
- **Test count after feature**: 24 (3 unit, 21 e2e)
- **Delta**: +1 new test (`carousel.e2e.cjs:48`) + strengthened assertions across 3 existing test files
- **Skipped tests**: none
- **Failures**: none

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| ----------- | --------------- | ---------- |
| P2020-01 | Tasks | ✅ Verified |
| P2020-02 | Tasks | ✅ Verified |
| P2020-03 | Tasks | ✅ Verified |
| P2020-04 | Tasks | ✅ Verified |
| P2020-05 | Tasks | ✅ Verified |
| P2020-06 | Tasks | ✅ Verified |
| P2020-07 | Tasks | ✅ Verified |
| P2020-08 | Tasks | ✅ Verified |
| P2020-09 | Tasks | ✅ Verified |

---

## Summary

**Overall**: ✅ Ready
**Verdict**: PASS
**Spec-anchored check**: 9/9 ACs matched spec outcome | 0 spec-precision gaps
**Sensor**: 2/2 mutations killed - PASS
**Gate**: 24 passed (3 unit, 21 e2e), 0 failed

**What works**:
- All 6 photoshoot 2020 photos ingested with 285px thumbnails.
- Complete archive of 23 photos rendered with photo 274 first.
- Static carousel fallback renders 6 photoshoot 2020 photos starting with photo 274.
- Client-side carousel dynamically selects 6 unique PROMO or LIVE photos on page load.
- Carousel navigation (controls, counter, thumbnails, keyboard, swipe) and PhotoSwipe opening function seamlessly.
- Zero-JS fallback maintains 23 functional full-size image links and 6 static highlight slides.

**Issues found**: none
**Next steps**: Ready for merge.
