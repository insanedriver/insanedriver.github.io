const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

const singles = catalog.singles;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('HUB-06: every single renders as a card, newest first, with no disclosure', async ({ page }) => {
    await page.goto('/discography/');
    const cards = page.locator('[data-disc-single]');
    await expect(cards).toHaveCount(18);
    expect(await cards.evaluateAll(els => els.map(el => el.dataset.discSingle)))
      .toEqual(singles.map(s => s.slug));
    await expect(page.locator('details')).toHaveCount(0);
    for (const single of singles) await expect(page.locator(`[data-disc-single="${single.slug}"]`)).toBeVisible();
  });

  test('HUB-07: each single card is one anchor with cover, title and year and no platform icon', async ({ page }) => {
    await page.goto('/discography/');
    for (const single of singles) {
      const card = page.locator(`[data-disc-single="${single.slug}"]`);
      await expect(card).toHaveJSProperty('tagName', 'A');
      await expect(card.locator('a, button')).toHaveCount(0);
      await expect(card.locator('.disc-single-art')).toHaveAttribute('src', `/assets/images/releases/${single.cover}`);
      await expect(card.locator('.disc-single-art')).toHaveAttribute('alt', `${single.title} cover`);
      await expect(card.locator('.disc-single-title')).toHaveText(single.title);
      await expect(card.locator('.disc-single-year')).toHaveText(String(single.year));
      await expect(card.locator('.fa')).toHaveCount(0);
    }
  });

  test('HUB-08: no platform anchor is left on the hub', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('[data-disc-link]')).toHaveCount(0);
  });

  test('HUB-19: single covers declare their intrinsic size and lazy-load', async ({ page }) => {
    await page.goto('/discography/');
    const attrs = await page.locator('.disc-single-art')
      .evaluateAll(els => els.map(el => [el.getAttribute('width'), el.getAttribute('height'), el.getAttribute('loading')]));
    expect(attrs).toEqual(singles.map(s => [String(s.coverWidth), String(s.coverHeight), 'lazy']));
  });

  test('HUB-23: a single card navigates without JavaScript', async ({ page }) => {
    await page.goto('/discography/');
    await page.locator('[data-disc-single="change-live"]').click();
    await expect(page).toHaveURL(/\/discography\/change-live\/$/);
  });
});
