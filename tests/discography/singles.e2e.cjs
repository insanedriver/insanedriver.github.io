const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

const singles = catalog.singles;
const VISIBLE = 6;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('DISC-15: every single renders, newest first', async ({ page }) => {
    await page.goto('/discography/');
    const cards = page.locator('[data-disc-single]');
    await expect(cards).toHaveCount(singles.length);
    expect(await cards.evaluateAll(els => els.map(el => el.dataset.discSingle)))
      .toEqual(singles.map(s => s.slug));
  });

  test('DISC-16/17: six singles show outside the disclosure, the rest inside it, closed', async ({ page }) => {
    await page.goto('/discography/');
    const more = page.locator('[data-disc-singles-more]');
    await expect(more).toHaveJSProperty('open', false);
    await expect(page.locator('.disc-singles > .disc-single-grid > [data-disc-single]')).toHaveCount(VISIBLE);
    await expect(more.locator('[data-disc-single]')).toHaveCount(singles.length - VISIBLE);
    const visible = await page.locator('.disc-singles > .disc-single-grid > [data-disc-single]')
      .evaluateAll(els => els.map(el => el.dataset.discSingle));
    expect(visible).toEqual(singles.slice(0, VISIBLE).map(s => s.slug));
  });

  test('DISC-18: the disclosure reveals the archived singles without JavaScript', async ({ page }) => {
    await page.goto('/discography/');
    const more = page.locator('[data-disc-singles-more]');
    const seventh = more.locator('[data-disc-single]').first();
    await expect(seventh).toBeHidden();
    await more.locator('summary').click();
    await expect(more).toHaveJSProperty('open', true);
    await expect(seventh).toBeVisible();
    await expect(seventh.locator('[data-disc-link="spotify"]')).toHaveAttribute('href', singles[VISIBLE].links.spotify);
  });

  test('DISC-19: each single shows cover, title, year and its Spotify and Apple links', async ({ page }) => {
    await page.goto('/discography/');
    for (const single of singles) {
      const card = page.locator(`[data-disc-single="${single.slug}"]`);
      await expect(card.locator('.disc-single-art')).toHaveAttribute('src', `/assets/images/releases/${single.cover}`);
      await expect(card.locator('.disc-single-title')).toHaveText(single.title);
      await expect(card.locator('.disc-single-year')).toHaveText(String(single.year));
      for (const key of ['spotify', 'apple']) {
        await expect(card.locator(`[data-disc-link="${key}"]`)).toHaveAttribute('href', single.links[key]);
      }
      await expect(card.locator('[data-disc-link]')).toHaveCount(2);
    }
  });

  test('DISC-20: a single never carries a preview button or an embed', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('[data-disc-single] [data-disc-preview-btn]')).toHaveCount(0);
    await expect(page.locator('[data-disc-single] iframe')).toHaveCount(0);
  });

  test('DISC-09: the index counter matches the rendered singles', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('[data-disc-counter]'))
      .toHaveText(`03 RELEASES // ${singles.length} SINGLES`);
    await expect(page.locator('[data-disc-single]')).toHaveCount(singles.length);
  });
});
