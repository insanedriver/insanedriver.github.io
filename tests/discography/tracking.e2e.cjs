const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

const album = catalog.albums[0];
const single = catalog.singles[0];

// The anchors target _blank; blocking the navigation keeps the assertions about
// the pushed event, not about a new tab.
const stopNavigation = page => page.evaluate(() => {
  document.addEventListener('click', e => { const a = e.target.closest('a'); if (a) e.preventDefault(); });
});

test('DISC-39: clicking a platform anchor records the platform and the release', async ({ page }) => {
  await page.goto('/discography/');
  await stopNavigation(page);
  await page.locator(`#${album.slug} [data-disc-link="apple"]`).click();
  expect(await page.evaluate(() => window.dataLayer.filter(e => e.event === 'release_click'))).toEqual([
    { event: 'release_click', platform: 'apple', release: album.slug }
  ]);
});

test('DISC-39: a single card reports its own slug', async ({ page }) => {
  await page.goto('/discography/');
  await stopNavigation(page);
  await page.locator(`[data-disc-single="${single.slug}"] [data-disc-link="spotify"]`).click();
  expect(await page.evaluate(() => window.dataLayer.filter(e => e.event === 'release_click'))).toEqual([
    { event: 'release_click', platform: 'spotify', release: single.slug }
  ]);
});

test('DISC-40: the handler does not cancel the anchor default', async ({ page }) => {
  await page.goto('/discography/');
  const defaultPrevented = await page.evaluate(() => {
    const anchor = document.querySelector('[data-disc-link]');
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor.dispatchEvent(event);
    return event.defaultPrevented;
  });
  expect(defaultPrevented).toBe(false);
  expect(await page.evaluate(() => window.dataLayer.filter(e => e.event === 'release_click').length)).toBe(1);
});

test('DISC-41: a missing dataLayer is created rather than throwing', async ({ page }) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('/discography/');
  await stopNavigation(page);
  await page.evaluate(() => { delete window.dataLayer; });
  await page.locator(`#${album.slug} [data-disc-link="spotify"]`).click();
  expect(await page.evaluate(() => Array.isArray(window.dataLayer))).toBe(true);
  expect(await page.evaluate(() => window.dataLayer)).toEqual([
    { event: 'release_click', platform: 'spotify', release: album.slug }
  ]);
  expect(errors).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('DISC-42: anchors still navigate when the tracker never runs', async ({ page }) => {
    await page.goto('/discography/');
    const anchor = page.locator(`#${album.slug} [data-disc-link="spotify"]`);
    await expect(anchor).toHaveAttribute('href', album.links.spotify);
    await expect(anchor).toHaveAttribute('target', '_blank');
  });
});
