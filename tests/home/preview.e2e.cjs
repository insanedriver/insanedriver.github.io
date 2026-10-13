const { test, expect } = require('../photos/browser.cjs');
const { panelByTab, loaderGone } = require('./helpers.cjs');

// Math.random is pinned to 0, so NOW::STREAMING draws pool[0]: Waiting for You.
const EMBED = 'https://open.spotify.com/embed/album/33TY4424uWL5jgwvlMPn2S';

const panel = page => panelByTab(page, 'NOW::STREAMING');
const button = page => panel(page).getByRole('button', { name: 'PREVIEW' });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => { Math.random = () => 0; });
  await page.route(/open\.spotify\.com\/embed\//, route => route.fulfill({ contentType: 'text/html', body: '<!doctype html><title>stub</title>' }));
  await page.goto('/', { waitUntil: 'load' });
  await loaderGone(page);
});

test('HOME-15: the page loads with no iframe and a visible PREVIEW button', async ({ page }) => {
  await expect(button(page)).toBeVisible();
  await expect(button(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('iframe')).toHaveCount(0);
});

test('HOME-16/17: PREVIEW opens exactly one Spotify embed and closes it again', async ({ page }) => {
  const slot = page.locator('[data-home-preview]');

  await button(page).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  await expect(slot.locator('iframe')).toHaveAttribute('src', EMBED);
  await expect(button(page)).toHaveAttribute('aria-expanded', 'true');

  await button(page).click();
  await expect(page.locator('iframe')).toHaveCount(0);
  await expect(button(page)).toHaveAttribute('aria-expanded', 'false');

  await button(page).click();
  await expect(page.locator('iframe')).toHaveCount(1);
});

test('HOME-16: the platform anchors stay visible while the preview is open', async ({ page }) => {
  const anchors = panel(page).locator('[data-home-link]');
  const count = await anchors.count();
  expect(count).toBeGreaterThan(0);
  await button(page).click();
  await expect(page.locator('iframe')).toHaveCount(1);
  for (let i = 0; i < count; i++) await expect(anchors.nth(i)).toBeVisible();
});
