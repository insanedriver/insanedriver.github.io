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

## T2

Gate: 3 unit tests and 8 browser tests passed. Visual review: /tmp/photos-review-{320,390,768,1440}.jpg. Dark surfaces, natural-color photography and angular cyan/magenta frame confirmed. Below-fold thumbnails are lazy-loaded. Tablet menu overflow corrected only within Photos. PHOTO-15 remains partially verified until viewer transitions in T4.

| Criterion | Evidence and assertion | Expected outcome / reverse mapping |
| --- | --- | --- |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:6: `await expect(page.locator('.photos-stage')).toHaveCSS('border-top-color', 'rgb(0, 243, 255)');` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:7: `await expect(page.locator('.photos-accent').first()).toHaveCSS('color', 'rgb(255, 0, 234)');` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:8: `expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:9: `await expect(page.locator('.photos-archive')).toHaveCSS('display', 'grid');` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:21: `await expect(control).toBeFocused();` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:22: `await expect(control).toHaveCSS('outline-style', 'solid');` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:23: `expect(await control.getAttribute('aria-label')).toBeTruthy();` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:29: `expect(await page.locator('.photos-shell, .photos-shell *').evaluateAll(nodes => nodes.every(n => {` | PHOTO-03/11/14/15; keep |
| T2 visual, focus, motion | tests/photos/visual.e2e.cjs:31: `return css.animationName === 'none' && css.transitionDuration === '0s';` | PHOTO-03/11/14/15; keep |

Adequacy: all six planned cases pass; each assertion maps to T2 criteria. No test was weakened or removed. No extra guidelines.

## T3

Gate: 3 unit + 15 browser tests passed. No tests skipped, deleted or weakened.

| Requirement / criterion | Assertion evidence | Reverse mapping |
| --- | --- | --- |
| test('PHOTO-04: next wraps from sixth to first', async ({page}) => { | tests/photos/carousel.e2e.cjs:5: `for (let n=2;n<=6;n++) { await page.getByRole('button',{name:'Next highlight',exact:true}).click(); await expect(counter(page)).toHaveText(`0${n} / 06`); }` | Keep: T3 criteria |
| test('PHOTO-04: next wraps from sixth to first', async ({page}) => { | tests/photos/carousel.e2e.cjs:7: `await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-05: previous wraps from first to sixth', async ({page}) => { | tests/photos/carousel.e2e.cjs:11: `await expect(counter(page)).toHaveText('06 / 06');` | Keep: T3 criteria |
| test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => { | tests/photos/carousel.e2e.cjs:15: `await expect(counter(page)).toHaveText('04 / 06');` | Keep: T3 criteria |
| test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => { | tests/photos/carousel.e2e.cjs:16: `await expect(page.locator('[data-photo-slide]').nth(3)).toBeVisible();` | Keep: T3 criteria |
| test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => { | tests/photos/carousel.e2e.cjs:17: `await expect(page.locator('[data-photo-select="3"]')).toHaveAttribute('aria-pressed','true');` | Keep: T3 criteria |
| test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => { | tests/photos/carousel.e2e.cjs:18: `await expect(page.locator('[data-photo-select][aria-pressed="true"]')).toHaveCount(1);` | Keep: T3 criteria |
| test('PHOTO-12: arrow keys operate only with carousel focus', async ({page}) => { | tests/photos/carousel.e2e.cjs:22: `await page.keyboard.press('ArrowRight'); await expect(counter(page)).toHaveText('02 / 06');` | Keep: T3 criteria |
| test('PHOTO-12: arrow keys operate only with carousel focus', async ({page}) => { | tests/photos/carousel.e2e.cjs:23: `await page.keyboard.press('ArrowLeft'); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-12: arrow keys operate only with carousel focus', async ({page}) => { | tests/photos/carousel.e2e.cjs:25: `await page.keyboard.press('ArrowRight'); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => { | tests/photos/carousel.e2e.cjs:33: `await gesture(page,-40,0); await expect(counter(page)).toHaveText('02 / 06');` | Keep: T3 criteria |
| test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => { | tests/photos/carousel.e2e.cjs:35: `await expect(page).toHaveURL(/\/photos\/$/);` | Keep: T3 criteria |
| test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => { | tests/photos/carousel.e2e.cjs:36: `await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);` | Keep: T3 criteria |
| test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => { | tests/photos/carousel.e2e.cjs:37: `await gesture(page,40,0); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-07: vertical and short gestures retain selection', async ({page}) => { | tests/photos/carousel.e2e.cjs:40: `await gesture(page,-50,80); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-07: vertical and short gestures retain selection', async ({page}) => { | tests/photos/carousel.e2e.cjs:41: `await gesture(page,-39,0); await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |
| test('PHOTO-08: no automatic advancement while idle', async ({page}) => { | tests/photos/carousel.e2e.cjs:46: `await expect(counter(page)).toHaveText('01 / 06');` | Keep: T3 criteria |

Adequacy: asserted outcomes reviewed against the approved task and PHOTO requirements. All planned cases present; no speculative cases. Project has no additional test guidelines.

## T4

Gate: build, 3 unit + 20 browser tests, diff check passed. No tests skipped, deleted or weakened.

| Requirement / criterion | Assertion evidence | Reverse mapping |
| --- | --- | --- |
| Task criteria | tests/photos/viewer.e2e.cjs:4: `await expect(page.locator('.pswp')).toHaveClass(/pswp--open/);` | Keep: T4 criteria |
| Task criteria | tests/photos/viewer.e2e.cjs:5: `await expect(page.locator('.pswp__item').nth(1).locator('img.pswp__img').last()).toHaveAttribute('src',src);` | Keep: T4 criteria |
| test('PHOTO-09: archive opens matching photo, keeps navigation and zoom', async ({page}) => { | tests/photos/viewer.e2e.cjs:18: `await expect(page.locator('.pswp__counter')).toHaveText('9 / 17');` | Keep: T4 criteria |
| test('PHOTO-09: archive opens matching photo, keeps navigation and zoom', async ({page}) => { | tests/photos/viewer.e2e.cjs:19: `await expect(page.locator('.pswp__button--zoom')).toBeVisible();` | Keep: T4 criteria |
| test('PHOTO-09: archive opens matching photo, keeps navigation and zoom', async ({page}) => { | tests/photos/viewer.e2e.cjs:21: `await expect(page.locator('.pswp')).toHaveClass(/pswp--zoomed-in/);` | Keep: T4 criteria |
| test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => { | tests/photos/viewer.e2e.cjs:27: `await link.click(); await expect(page.locator('.pswp')).toHaveClass(/pswp--open/);` | Keep: T4 criteria |
| test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => { | tests/photos/viewer.e2e.cjs:29: `await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);` | Keep: T4 criteria |
| test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => { | tests/photos/viewer.e2e.cjs:30: `await expect(link).toBeFocused();` | Keep: T4 criteria |
| test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => { | tests/photos/viewer.e2e.cjs:32: `await expect(link).toBeFocused();` | Keep: T4 criteria |
| test('PHOTO-15: reduced motion removes viewer opening/closing transitions', async ({page}) => { | tests/photos/viewer.e2e.cjs:42: `expect(await page.evaluate(() => [viewerOptions.showAnimationDuration,viewerOptions.hideAnimationDuration])).toEqual([0,0]);` | Keep: T4 criteria |
| test('PHOTO-15: reduced motion removes viewer opening/closing transitions', async ({page}) => { | tests/photos/viewer.e2e.cjs:44: `await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);` | Keep: T4 criteria |
| test('PHOTO-09: legacy uppercase dimensions are normalized', async ({page}) => { | tests/photos/viewer.e2e.cjs:51: `expect(await page.evaluate(() => [viewerItem.w,viewerItem.h])).toEqual([photos[0].width,photos[0].height]);` | Keep: T4 criteria |

Adequacy: asserted outcomes reviewed against the approved task and PHOTO requirements. All planned cases present; no speculative cases. Project has no additional test guidelines.
