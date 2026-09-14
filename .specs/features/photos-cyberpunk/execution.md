# Execution evidence

Tests derive from the approved specification. No tests skipped, deleted or weakened.

## T1

Gate: 3 unit tests and 2 browser tests passed.

| Criterion / test | Evidence | Assertion |
| --- | --- | --- |
| test('PHOTO-02: original archive retains all 17 unique full-size links', () => { | tests/photos/gallery.test.cjs:7 | assert.deepEqual(photos.map(p => p.src), expected); |
| test('PHOTO-02: original archive retains all 17 unique full-size links', () => { | tests/photos/gallery.test.cjs:8 | for (const p of photos) { assert.ok(fs.existsSync('.' + p.src)); assert.ok(fs.existsSync('.' + p.thumbnail)); } |
| test('PHOTO-01: exactly six unique ordered highlights come from archive', () => { | tests/photos/gallery.test.cjs:12 | assert.deepEqual(selected.map(p => p.highlightOrder), [1,2,3,4,5,6]); |
| test('PHOTO-01: exactly six unique ordered highlights come from archive', () => { | tests/photos/gallery.test.cjs:13 | assert.equal(new Set(selected.map(p => p.id)).size, 6); |
| test('PHOTO-17: every image has descriptive alt text and real dimensions', () => { | tests/photos/gallery.test.cjs:17 | assert.match(p.alt, /Insane Driver/); |
| test('PHOTO-17: every image has descriptive alt text and real dimensions', () => { | tests/photos/gallery.test.cjs:18 | assert.ok(p.alt.length > 20); |
| test('PHOTO-17: every image has descriptive alt text and real dimensions', () => { | tests/photos/gallery.test.cjs:19 | assert.ok(Number.isInteger(p.width) && p.width > 0); |
| test('PHOTO-17: every image has descriptive alt text and real dimensions', () => { | tests/photos/gallery.test.cjs:20 | assert.ok(Number.isInteger(p.height) && p.height > 0); |
| test('PHOTO-01/02: generated page has six highlights and complete archive', async ({page}) => { | tests/photos/gallery.e2e.cjs:4 | await expect(page.locator('[data-photo-slide]')).toHaveCount(6); |
| test('PHOTO-01/02: generated page has six highlights and complete archive', async ({page}) => { | tests/photos/gallery.e2e.cjs:5 | await expect(page.locator('.photos-archive figure')).toHaveCount(17); |
| test('PHOTO-01/02: generated page has six highlights and complete archive', async ({page}) => { | tests/photos/gallery.e2e.cjs:6 | await expect(page.locator('.photos-archive img[alt="Image description"]')).toHaveCount(0); |
| test('PHOTO-16: archive links work with JavaScript disabled', async ({browser}) => { | tests/photos/gallery.e2e.cjs:14 | await expect(links).toHaveCount(17); |
| test('PHOTO-16: archive links work with JavaScript disabled', async ({browser}) => { | tests/photos/gallery.e2e.cjs:17 | expect(response.status()).toBe(200); |
| test('PHOTO-16: archive links work with JavaScript disabled', async ({browser}) => { | tests/photos/gallery.e2e.cjs:18 | expect(response.headers()['content-type']).toMatch(/^image\//); |

Adequacy: assertions checked against the task criteria; tests map to the PHOTO identifiers and approved design bounds. No speculative coverage.
