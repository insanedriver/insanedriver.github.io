const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

const albums = catalog.albums;
const ldTypes = page => page.locator('script[type="application/ld+json"]')
  .evaluateAll(els => els.map(el => JSON.parse(el.textContent)['@type']));

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('HUB-17: the hub publishes no MusicAlbum block (the release pages do)', async ({ page }) => {
    await page.goto('/discography/');
    expect(await ldTypes(page)).not.toContain('MusicAlbum');
    await page.goto(`/discography/${albums[0].slug}/`);
    expect(await ldTypes(page)).toContain('MusicAlbum');
  });

  test('HUB-08: the hub carries no tracklist, platform anchor, BUY CD or preview', async ({ page }) => {
    await page.goto('/discography/');
    for (const sel of ['[data-disc-tracklist]', '.disc-tracks', '[data-disc-buy]', '[data-disc-preview-btn]', '[data-disc-preview]']) {
      await expect(page.locator(sel), sel).toHaveCount(0);
    }
  });

  test('HUB-19: album covers are served from the repo with their intrinsic size, lazy below the first', async ({ page }) => {
    await page.goto('/discography/');
    const attrs = await page.locator('.disc-album-art')
      .evaluateAll(els => els.map(el => [el.getAttribute('src'), el.getAttribute('width'), el.getAttribute('height'), el.getAttribute('loading')]));
    expect(attrs).toEqual(albums.map((a, i) => [
      `/assets/images/releases/${a.cover}`, String(a.coverWidth), String(a.coverHeight), i === 0 ? null : 'lazy',
    ]));
  });
});
