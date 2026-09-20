# Tasks: Photos 2020 and Random Highlights

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Floor established by existing 3 unit tests and 20 Playwright e2e tests.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
| ---------- | ------------------ | -------------------- | ---------------- | ----------- |
| Assets / Media | none | - (build gate only) | `assets/gallery/promo2020` | `npm run build` |
| Data Catalog | unit | 1:1 to spec ACs (23 photos total, 6 2020 photos first, 274 first, valid metadata and alt text) | `tests/photos/gallery.test.cjs` | `npm run test:unit` |
| Carousel Client Logic | e2e | Happy path randomization + navigation + PhotoSwipe integration + touch & keyboard | `tests/photos/carousel.e2e.cjs`, `tests/photos/viewer.e2e.cjs` | `npx playwright test` |
| Zero-JS Fallback | e2e | 6 static 2020 highlights and 23 archive links working without JS | `tests/photos/gallery.e2e.cjs` | `npx playwright test tests/photos/gallery.e2e.cjs` |
| Static Build | build | Site generation with Eleventy and Less compilation | `assets/`, `photos/` | `npm run build` |

---

## Gate Check Commands

- **Quick**: `npm run test:unit`
- **Full**: `npm test`
- **Build**: `npm run build && npm test`

---

## Execution Plan

```
T1 -> T2 -> T3 -> T4
```

### Phase 1: Ingestion and Catalog

T1 and T2 establish local assets and data catalog.

### Phase 2: Dynamic Randomization

T3 adds dynamic client-side selection to carousel.

### Phase 3: Verification

T4 aligns unit and e2e test suite with updated catalog and behavior.

---

## Task Breakdown

### Phase 1: Assets & Data

### T1: Ingest 2020 photoshoot assets and generate thumbnails [x]
Where: `assets/gallery/promo2020`
Tests: none
Gate: Build
Depends on: none
Done when:
- `assets/gallery/promo2020/` directory is created.
- The 6 original photos from `/home/deivid/Downloads/2020-photoshoot-insane` are copied as `274.jpg`, `113.jpg`, `133.jpg`, `36.jpg`, `140.jpg`, and `20.jpg`.
- Proportional thumbnails are generated as `tn_274.jpg`, `tn_113.jpg`, `tn_133.jpg`, `tn_36.jpg`, `tn_140.jpg`, and `tn_20.jpg` with standard width 285px.

### T2: Register 2020 photos in data catalog
Where: `_data/photos.json`
Tests: unit
Gate: Quick
Depends on: T1
Done when:
- `_data/photos.json` contains 23 photos with the 6 2020 photos placed first in order: 274, 113, 133, 36, 140, 20.
- Each 2020 entry has correct `width`, `height`, `category`: "PROMO", `caption`: "Promo Picture 2020", and descriptive `alt`.
- The 6 2020 entries have `featured: true` and `highlightOrder` 1 through 6 (with 274 as 1).
- Previous photos have `featured: false` and `highlightOrder: 0`.

### Phase 2: Client-side Dynamic Randomization

### T3: Implement client-side carousel randomization
Where: `assets/js/photos.js`
Tests: e2e
Gate: Full
Depends on: T2
Done when:
- `photos.js` dynamically queries the archive for eligible entries (`PROMO` and `LIVE`).
- On page initialization, it selects 6 distinct photos at random and repopulates carousel slides and thumbnails.
- Controls, counter, active thumbnail state, PhotoSwipe trigger integration, and touch/keyboard navigation work flawlessly with the randomized set.

### Phase 3: Test Suite Updates & Validation

### T4: Update test suite for 23 photos and random highlights
Where: `tests/photos/gallery.test.cjs`
Tests: unit + e2e
Gate: Full
Depends on: T3
Done when:
- Unit tests verify 23 photos, 6 2020 photos at start with 274 first, and accurate metadata.
- E2E tests confirm carousel randomization selects 6 unique photos and retains all interactive requirements.
- All unit and E2E tests pass cleanly.
