const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const platforms = require('../../_data/platforms.json');

const albums = catalog.albums;
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const iso = s => `PT${Math.floor(s / 60)}M${s % 60}S`;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('DISC-29: every album ships a tracklist disclosure that starts closed', async ({ page }) => {
    await page.goto('/discography/');
    const details = page.locator('[data-disc-tracklist]');
    await expect(details).toHaveCount(albums.length);
    expect(await details.evaluateAll(els => els.map(el => el.open))).toEqual(albums.map(() => false));
  });

  test('DISC-30: each tracklist lists every track with position and m:ss duration', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of albums) {
      const rows = page.locator(`[data-disc-tracklist="${album.slug}"] [data-disc-track]`);
      await expect(rows).toHaveCount(album.tracks.length);
      const got = await rows.evaluateAll(els => els.map(el => [
        el.querySelector('.disc-track-pos').textContent.trim(),
        el.querySelector('.disc-track-title').textContent.trim(),
        el.querySelector('.disc-track-time').textContent.trim(),
      ]));
      expect(got).toEqual(album.tracks.map(t => [
        String(t.position).padStart(2, '0'), t.title, mmss(t.duration),
      ]));
    }
  });

  test('DISC-29: the disclosure opens without JavaScript', async ({ page }) => {
    await page.goto('/discography/');
    const details = page.locator('[data-disc-tracklist="silicon-fortress"]');
    await expect(details.locator('[data-disc-track]').first()).toBeHidden();
    await details.locator('summary').click();
    await expect(details).toHaveJSProperty('open', true);
    await expect(details.locator('[data-disc-track]').first()).toBeVisible();
  });
});
