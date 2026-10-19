const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

// Spec Assumptions: the release pages (REL-01), and where a single without one folds:
// into the song whose title is the single title without a trailing "(Acoustic)".
const SINGLE_PAGES = ['waiting-for-you', 'the-sun-will-rise', 'today-is-sunday-eder-franco', 'change-live'];
const kebab = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const songSlug = t => kebab(t.replace(/\s*\((Deluxe Version|Acoustic Version|Acoustic)\)\s*$/i, ''));
const songAlbum = slug => (catalog.albums.find(a => a.slug === 'silicon-fortress').tracks.some(t => songSlug(t.title) === slug)
  ? 'silicon-fortress' : 'insane-driver');
const songUrl = title => `/discography/${songAlbum(songSlug(title))}/${songSlug(title)}/`;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('IDX-01: every album title and cover links to the album release page', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of catalog.albums) {
      const card = page.locator(`#${album.slug}`);
      const title = card.locator(`#disc-title-${album.slug} a`);
      await expect(title).toHaveAttribute('href', `/discography/${album.slug}/`);
      await expect(title).toHaveText(album.title);
      const cover = card.locator('.disc-release-art a');
      await expect(cover).toHaveAttribute('href', `/discography/${album.slug}/`);
      await expect(cover.locator(`img[alt="${album.title} cover"]`)).toHaveCount(1);
    }
  });

  test('IDX-04 / SONG-07 counterpart: the index platform buttons keep their own subtitles', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('.cyber-link-sub', { hasText: 'Play the track' })).toHaveCount(0);
    await expect(page.locator('.cyber-link-sub').first()).toBeVisible();
  });

  test('IDX-02: every single links to its release page, otherwise to its song page', async ({ page }) => {
    await page.goto('/discography/');
    for (const single of catalog.singles) {
      const expected = SINGLE_PAGES.includes(single.slug) ? `/discography/${single.slug}/` : songUrl(single.title);
      const link = page.locator(`[data-disc-single="${single.slug}"] .disc-single-title a`);
      await expect(link, single.slug).toHaveAttribute('href', expected);
      await expect(link).toHaveText(single.title);
    }
  });

  test('IDX-03: every tracklist row links to its song page', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of catalog.albums) {
      const hrefs = await page.locator(`[data-disc-tracklist="${album.slug}"] [data-disc-track] a`)
        .evaluateAll(els => els.map(el => el.getAttribute('href')));
      expect(hrefs).toEqual(album.tracks.map(t => songUrl(t.title)));
    }
  });

  test('IDX-01/03: following the links reaches the release and song pages', async ({ page }) => {
    await page.goto('/discography/');
    await page.locator('#disc-title-silicon-fortress a').click();
    await expect(page).toHaveURL(/\/discography\/silicon-fortress\/$/);
    await expect(page.locator('h1')).toHaveText('Silicon Fortress');
    await page.goto('/discography/');
    const details = page.locator('[data-disc-tracklist="insane-driver"]');
    await details.locator('summary').click();
    await details.locator('a', { hasText: 'Buried Thoughts' }).click();
    await expect(page).toHaveURL(/\/discography\/insane-driver\/buried-thoughts\/$/);
    await expect(page.locator('h1')).toHaveText('Buried Thoughts');
  });
});
