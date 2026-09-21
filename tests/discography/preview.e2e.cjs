const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

const albums = catalog.albums;
const withSpotify = albums.filter(a => a.spotifyId);

test('DISC-22: no Spotify request and no iframe before the visitor asks', async ({ page }) => {
  const spotifyRequests = [];
  page.on('request', r => { if (r.url().includes('open.spotify.com')) spotifyRequests.push(r.url()); });
  await page.goto('/discography/');
  await expect(page.locator('[data-disc-preview-btn]').first()).toBeVisible();
  await expect(page.locator('[data-disc] iframe')).toHaveCount(0);
  expect(spotifyRequests).toEqual([]);

  const html = await (await page.request.get('/discography/')).text();
  expect(html.slice(html.indexOf('disc-shell'))).not.toMatch(/<iframe/i);
});

test('DISC-21/28: a preview button exists for every album with a Spotify id, and only those', async ({ page }) => {
  await page.goto('/discography/');
  const slugs = await page.locator('[data-disc-preview-btn]')
    .evaluateAll(els => els.map(el => el.getAttribute('data-disc-preview-btn')));
  expect(slugs).toEqual(withSpotify.map(a => a.slug));
  for (const album of withSpotify) {
    await expect(page.locator(`[data-disc-preview="${album.slug}"]`)).toHaveCount(1);
  }
});

test('DISC-23: clicking PREVIEW injects the embed for that album', async ({ page }) => {
  await page.goto('/discography/');
  const album = withSpotify[0];
  await page.locator(`[data-disc-preview-btn="${album.slug}"]`).click();
  const frame = page.locator(`[data-disc-preview="${album.slug}"] iframe`);
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute('src', `https://open.spotify.com/embed/album/${album.spotifyId}`);
});

test('DISC-24: opening a second preview leaves exactly one iframe in the page', async ({ page }) => {
  await page.goto('/discography/');
  const [first, second] = withSpotify;
  await page.locator(`[data-disc-preview-btn="${first.slug}"]`).click();
  await expect(page.locator('[data-disc] iframe')).toHaveCount(1);
  await page.locator(`[data-disc-preview-btn="${second.slug}"]`).click();
  await expect(page.locator('[data-disc] iframe')).toHaveCount(1);
  await expect(page.locator(`[data-disc-preview="${second.slug}"] iframe`)).toHaveCount(1);
  await expect(page.locator(`[data-disc-preview="${first.slug}"] iframe`)).toHaveCount(0);
});

test('DISC-25/27: re-clicking the open album closes it and resets aria-expanded', async ({ page }) => {
  await page.goto('/discography/');
  const album = withSpotify[0];
  const button = page.locator(`[data-disc-preview-btn="${album.slug}"]`);
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-disc] iframe')).toHaveCount(0);
});

test('DISC-26: the cover and the platform links stay usable while a preview is open', async ({ page }) => {
  await page.goto('/discography/');
  const album = withSpotify[0];
  await page.locator(`[data-disc-preview-btn="${album.slug}"]`).click();
  await expect(page.locator(`#${album.slug} .disc-release-art img`)).toBeVisible();
  const spotify = page.locator(`#${album.slug} [data-disc-link="spotify"]`);
  await expect(spotify).toBeVisible();
  await expect(spotify).toHaveAttribute('href', album.links.spotify);
});

test('DISC-44: a preview that fails to load leaves the listening routes intact', async ({ page }) => {
  await page.route('**/open.spotify.com/**', route => route.abort());
  await page.goto('/discography/');
  const album = withSpotify[0];
  await page.locator(`[data-disc-preview-btn="${album.slug}"]`).click();
  await expect(page.locator(`#${album.slug} [data-disc-link="spotify"]`)).toBeVisible();
  await expect(page.locator(`#${album.slug} .disc-release-art img`)).toBeVisible();
  await expect(page.locator(`[data-disc-tracklist="${album.slug}"]`)).toHaveCount(1);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('DISC-27: the preview button stays hidden and the links still work', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('[data-disc-preview-btn]')).toHaveCount(withSpotify.length);
    for (const album of withSpotify) {
      await expect(page.locator(`[data-disc-preview-btn="${album.slug}"]`)).toBeHidden();
    }
    await expect(page.locator('[data-disc] iframe')).toHaveCount(0);
    await expect(page.locator('#silicon-fortress [data-disc-link="apple"]')).toBeVisible();
  });
});
