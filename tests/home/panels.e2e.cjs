const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const platforms = require('../../_data/platforms.json');
const { panelByTab } = require('./helpers.cjs');

// Without JavaScript NOW::STREAMING shows the newest single after the hero's.
const fallback = catalog.singles.find(s => s.slug === 'waiting-for-you');
const fallbackKeys = platforms.filter(p => fallback.links[p.key]).map(p => p.key);


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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('HOME-14/57: NOW::STREAMING shows Waiting for You with every platform it is on and a discography link', async ({ page }) => {
    await page.goto('/');
    const panel = panelByTab(page, 'NOW::STREAMING');
    await expect(panel).toHaveCount(1);
    await expect(panel.locator('.cyber-panel-body')).toHaveAttribute('data-hud', 'SIGNAL.WAITING-FOR-YOU // STREAMING_');
    await expect(panel.locator('.home-eyebrow')).toHaveText('SHUFFLE // SINGLE // 2025.02.21');
    await expect(panel.locator('h2')).toHaveText('Waiting for You.');
    await expect(panel.locator('.home-streaming-lead')).toHaveText('From the archive. Pick your platform and turn it up.');
    await expect(panel.locator('img').first()).toHaveAttribute('src', '/assets/images/releases/waiting-for-you.jpg');
    await expect(panel.locator('img').first()).toHaveAttribute('alt', 'Waiting for You cover');
    const links = panel.locator('[data-home-link]');
    expect(await links.evaluateAll(els => els.map(el => el.getAttribute('data-home-link')))).toEqual(fallbackKeys);
    for (const key of fallbackKeys) {
      const a = panel.locator(`[data-home-link="${key}"]`);
      await expect(a).toHaveAttribute('href', fallback.links[key]);
      await expect(a).toHaveAttribute('data-home-placement', 'streaming');
      await expect(a).toHaveAttribute('target', '_blank');
      await expect(a).toHaveAttribute('rel', 'noopener');
    }
    await expect(panel.locator('a.home-more')).toHaveAttribute('href', '/discography/');
    await expect(panel.locator('[data-home-preview-btn]')).toHaveAttribute('data-home-preview-btn', '33TY4424uWL5jgwvlMPn2S');
    await expect(panel.locator('[data-home-preview]')).toBeEmpty();
  });

  test('HOME-19: PREVIEW stays hidden and every platform anchor stays clickable', async ({ page }) => {
    await page.goto('/');
    const panel = panelByTab(page, 'NOW::STREAMING');
    await expect(panel.locator('[data-home-preview-btn]')).toBeHidden();
    await expect(panel.locator('[data-home-link]')).toHaveCount(fallbackKeys.length);
    for (let i = 0; i < fallbackKeys.length; i++) await expect(panel.locator('[data-home-link]').nth(i)).toBeVisible();
    await expect(page.locator('[data-home-hero] [data-home-link]')).toHaveCount(2);
  });
});
