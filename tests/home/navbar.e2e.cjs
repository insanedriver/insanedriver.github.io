const { test, expect } = require('../photos/browser.cjs');
const { loaderGone } = require('./helpers.cjs');

const nav = page => page.locator('nav.navbar');
const scrollTo = (page, y) => page.evaluate(y => window.scrollTo(0, y), y);

test('HOME-36/37: the navbar turns solid past 40px of scroll and clears again at the top', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
  await expect(nav(page)).not.toHaveClass(/\bis-solid\b/);

  await scrollTo(page, 41);
  await expect(nav(page)).toHaveClass(/\bis-solid\b/);

  await scrollTo(page, 40);
  await expect(nav(page)).not.toHaveClass(/\bis-solid\b/);

  await scrollTo(page, 41);
  await expect(nav(page)).toHaveClass(/\bis-solid\b/);

  await scrollTo(page, 0);
  await expect(nav(page)).not.toHaveClass(/\bis-solid\b/);
});

test('HOME-37: landing on / with a hash deep in the page shows the navbar solid without any scroll', async ({ page }) => {
  await page.goto('/#home-signal-title', { waitUntil: 'load' });
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(40);
  await expect(nav(page)).toHaveClass(/\bis-solid\b/);
});

test('HOME-37: a reload that restores the scroll position shows the navbar solid', async ({ page }) => {
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
  await scrollTo(page, 800);
  await page.reload({ waitUntil: 'load' });
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(40);
  await expect(nav(page)).toHaveClass(/\bis-solid\b/);
});
