const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

// Spec Assumptions: the release pages (REL-01), and where a single without one folds:
// into the song whose title is the single title without a trailing "(Acoustic)".
const SINGLE_PAGES = ['waiting-for-you', 'the-sun-will-rise', 'today-is-sunday-eder-franco', 'change-live', 'fallen-dreams-acoustic'];
const kebab = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const songSlug = t => kebab(t.replace(/\s*\((Deluxe Version|Acoustic Version|Acoustic)\)\s*$/i, ''));
const songAlbum = slug => (catalog.albums.find(a => a.slug === 'silicon-fortress').tracks.some(t => songSlug(t.title) === slug)
  ? 'silicon-fortress' : 'insane-driver');
const songUrl = title => `/discography/${songAlbum(songSlug(title))}/${songSlug(title)}/`;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('IDX-01: every album card links to the album release page', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of catalog.albums) {
      const card = page.locator(`[data-disc-album="${album.slug}"]`);
      await expect(card).toHaveAttribute('href', `/discography/${album.slug}/`);
      await expect(card.locator('[data-disc-album-title]')).toHaveText(album.title);
      await expect(card.locator(`img[alt="${album.title} cover"]`)).toHaveCount(1);
    }
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

  // IDX-03 (tracklist rows link to song pages) moved with the tracklist to the
  // release pages; REL-03 in release.e2e.cjs covers it there.
  test('IDX-01/03: following a card reaches the release page, and its tracklist the song page', async ({ page }) => {
    await page.goto('/discography/');
    await page.locator('[data-disc-album="insane-driver"]').click();
    await expect(page).toHaveURL(/\/discography\/insane-driver\/$/);
    await expect(page.locator('h1')).toHaveText('Insane Driver');
    await page.locator('[data-release-tracks] a', { hasText: 'Buried Thoughts' }).click();
    await expect(page).toHaveURL(/\/discography\/insane-driver\/buried-thoughts\/$/);
    await expect(page.locator('h1')).toHaveText('Buried Thoughts');
  });
});
