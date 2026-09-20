const { test, expect } = require('../photos/browser.cjs');
const videos = require('../../_data/videos.json');

const short = title => title.replace('Insane Driver - ', '');

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('VPLR-01: one card per catalog entry, in file order', async ({ page }) => {
    await page.goto('/videos/');
    const cards = page.locator('[data-idtv-card]');
    await expect(cards).toHaveCount(10);
    expect(await cards.evaluateAll(els => els.map(el => el.dataset.slug))).toEqual(videos.map(v => v.slug));
  });

  test('VPLR-02: each card shows the short title, its type and the ytimg thumbnail', async ({ page }) => {
    await page.goto('/videos/');
    for (const [i, v] of videos.entries()) {
      const card = page.locator('[data-idtv-card]').nth(i);
      await expect(card.locator('.videos-card-title')).toHaveText(short(v.title));
      await expect(card.locator('.videos-eyebrow')).toHaveText(v.type);
      await expect(card.locator('img')).toHaveAttribute('src', `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`);
    }
  });

  test('VPLR-03: each card is a link to its YouTube watch page', async ({ page }) => {
    await page.goto('/videos/');
    for (const [i, v] of videos.entries()) {
      const card = page.locator('[data-idtv-card]').nth(i);
      expect(await card.evaluate(el => el.tagName)).toBe('A');
      await expect(card).toHaveAttribute('href', `https://www.youtube.com/watch?v=${v.id}`);
    }
  });

  test('VPLR-04: the served page content contains no iframe', async ({ page }) => {
    const response = await page.request.get('/videos/');
    const html = await response.text();
    const shell = html.slice(html.indexOf('videos-shell'));
    expect(shell).not.toMatch(/<iframe/i);
    await page.goto('/videos/');
    await expect(page.locator('.videos-shell iframe')).toHaveCount(0);
  });

  test('VPLR-16: server-rendered counter and card indexes are zero-padded', async ({ page }) => {
    await page.goto('/videos/');
    await expect(page.locator('[data-idtv-counter]')).toHaveText('01 / 10');
    await expect(page.locator('.videos-card-index').nth(9)).toHaveText('10');
    await expect(page.locator('.videos-card-index').first()).toHaveText('01');
  });

  test('VPLR-19: content is wrapped in cyber-zone panels with tabs and corner accents', async ({ page }) => {
    await page.goto('/videos/');
    await expect(page.locator('.videos-shell.cyber-zone > .cyber-zone-inner')).toHaveCount(1);
    const panels = page.locator('.cyber-panel');
    await expect(panels).toHaveCount(2);
    for (let i = 0; i < 2; i++) {
      const panel = panels.nth(i);
      await expect(panel.locator('.cyber-panel-tab')).toHaveCount(1);
      await expect(panel.locator('.corner-tl')).toHaveCount(1);
      await expect(panel.locator('.corner-tr')).toHaveCount(1);
      await expect(panel.locator('.corner-bl')).toHaveCount(1);
    }
  });
});
