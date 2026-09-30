const { test, expect } = require('../photos/browser.cjs');
const { loaderGone } = require('./helpers.cjs');

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
