const { test, expect } = require('../photos/browser.cjs');
const { loaderGone, panelByTab } = require('./helpers.cjs');

test('HOME-05/06: the home loads its own scripts, not the legacy player bundle, and throws nothing', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/', { waitUntil: 'load' });
  const srcs = await page.locator('script[src]').evaluateAll(els => els.map(el => new URL(el.src).pathname));
  expect(srcs).toContain('/assets/js/home-core.js');
  expect(srcs).toContain('/assets/js/home.js');
  expect(srcs).not.toContain('/assets/js/insane.js');
  expect(srcs).not.toContain('/assets/js/videos.js');
  expect(srcs).not.toContain('/assets/js/please-wait.min.js');
  expect(srcs.indexOf('/assets/js/home-core.js')).toBeLessThan(srcs.indexOf('/assets/js/home.js'));
  await page.waitForTimeout(200);
  expect(errors).toEqual([]);
});

test('HOME-08: the collapsed mobile menu still opens', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
  await expect(page.locator('#navbar')).toBeHidden();
  await page.locator('.navbar-toggle').click();
  await expect(page.locator('#navbar')).toBeVisible();
  await expect(page.locator('#navbar a[href="/band/"]')).toBeVisible();
});

// The navbar is the second module; a throw there must not take shuffle,
// preview or tracking down with it, and must still be reported.
test('HOME-62: a throwing navbar leaves shuffle, PREVIEW and tracking running and still reports the error', async ({ page }) => {
  const { pool } = require('../../_data/homeShuffle.js')();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(draw => {
    // Only the first call throws (navbar's synchronous check), so the error
    // can only surface through home.js reporting it, not a later scroll.
    const toggle = DOMTokenList.prototype.toggle;
    let thrown = false;
    DOMTokenList.prototype.toggle = function () {
      if (!thrown) { thrown = true; throw new Error('navbar boom'); }
      return toggle.apply(this, arguments);
    };
    Math.random = () => draw;
  }, 5.5 / pool.length);
  await page.route(/open\.spotify\.com\/embed\//, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));
  await page.context().route(/music\.apple\.com/, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));
  await page.goto('/', { waitUntil: 'load' });
  const panel = panelByTab(page, 'NOW::STREAMING');
  await expect(panel.locator('[data-home-streaming]')).toHaveAttribute('data-home-streaming', pool[5].slug);
  await loaderGone(page);
  await panel.getByRole('button', { name: 'PREVIEW' }).click();
  await expect(page.locator('[data-home-preview] iframe')).toHaveAttribute('src', `https://open.spotify.com/embed/album/${pool[5].embedId}`);
  const popup = page.context().waitForEvent('page');
  await panel.locator('[data-home-link="apple"]').click();
  await popup;
  expect(await page.evaluate(() => (window.dataLayer || []).filter(e => e.event === 'home_release_click'))).toEqual([
    { event: 'home_release_click', platform: 'apple', release: pool[5].slug, placement: 'streaming' }
  ]);
  expect(errors).toContain('navbar boom');
});
