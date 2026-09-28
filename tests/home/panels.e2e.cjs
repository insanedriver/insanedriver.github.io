const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const platforms = require('../../_data/platforms.json');
const { panelByTab } = require('./helpers.cjs');

const latest = catalog.singles.find(s => s.slug === 'keep-away-acoustic');
const latestKeys = platforms.filter(p => latest.links[p.key]).map(p => p.key);


test('HOME-30: sections below the hero live in a cyber zone of fully decorated panels', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await expect(page.locator('.cyber-zone > .cyber-zone-inner')).toHaveCount(1);
  const panels = page.locator('.cyber-zone > .cyber-zone-inner > .cyber-panel');
  const n = await panels.count();
  expect(n).toBeGreaterThan(0);
  for (let i = 0; i < n; i++) {
    const panel = panels.nth(i);
    await expect(panel.locator('> .cyber-panel-tab')).toHaveCount(1);
    const body = panel.locator('> .cyber-panel-body');
    await expect(body).toHaveCount(1);
    expect(await body.getAttribute('data-hud')).toBeTruthy();
    for (const cls of ['top-accent', 'corner-tl', 'corner-tr', 'corner-bl']) {
      await expect(body.locator(`> span.${cls}`)).toHaveCount(1);
    }
  }
  // The hero stays outside the zone.
  await expect(page.locator('.cyber-zone [data-home-hero]')).toHaveCount(0);
});

test('HOME-14: NOW::STREAMING shows the latest release with every platform it is on and a discography link', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const panel = panelByTab(page, 'NOW::STREAMING');
  await expect(panel).toHaveCount(1);
  await expect(panel.locator('h2')).toHaveText('Keep Away (Acoustic).');
  await expect(panel.locator('img').first()).toHaveAttribute('src', '/assets/images/releases/keep-away-acoustic.jpg');
  const links = panel.locator('[data-home-link]');
  expect(await links.evaluateAll(els => els.map(el => el.getAttribute('data-home-link')))).toEqual(latestKeys);
  for (const key of latestKeys) {
    const a = panel.locator(`[data-home-link="${key}"]`);
    await expect(a).toHaveAttribute('href', latest.links[key]);
    await expect(a).toHaveAttribute('data-home-placement', 'streaming');
    await expect(a).toHaveAttribute('target', '_blank');
    await expect(a).toHaveAttribute('rel', 'noopener');
  }
  await expect(panel.locator('a.home-more')).toHaveAttribute('href', '/discography/');
  await expect(panel.locator('[data-home-preview-btn]')).toHaveAttribute('data-home-preview-btn', '14HkhB5FwTGesQECbSBSML');
  await expect(panel.locator('[data-home-preview]')).toBeEmpty();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('HOME-19: PREVIEW stays hidden and every platform anchor stays clickable', async ({ page }) => {
    await page.goto('/');
    const panel = panelByTab(page, 'NOW::STREAMING');
    await expect(panel.locator('[data-home-preview-btn]')).toBeHidden();
    await expect(panel.locator('[data-home-link]')).toHaveCount(latestKeys.length);
    await expect(page.locator('[data-home-hero] [data-home-link]')).toHaveCount(2);
  });
});
