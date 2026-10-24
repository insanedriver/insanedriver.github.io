const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');

// The preview lives on the release pages since the index became a hub
// (discography-hub HUB-13/15).
const albums = catalog.albums;
const withSpotify = albums.filter(a => a.spotifyId);
const album = withSpotify[0];
const pageOf = r => `/discography/${r.slug}/`;

test('HUB-15: no Spotify request and no iframe before the visitor asks', async ({ page }) => {
  const spotifyRequests = [];
  page.on('request', r => { if (r.url().includes('open.spotify.com')) spotifyRequests.push(r.url()); });
  await page.goto(pageOf(album));
  await expect(page.locator('[data-disc-preview-btn]')).toBeVisible();
  await expect(page.locator('[data-disc] iframe')).toHaveCount(0);
  expect(spotifyRequests).toEqual([]);

  const html = await (await page.request.get(pageOf(album))).text();
  expect(html.slice(html.indexOf('disc-shell'))).not.toMatch(/<iframe/i);
});

test('HUB-13: every album page carries one preview button with its own Spotify id', async ({ page }) => {
  for (const a of withSpotify) {
    await page.goto(pageOf(a));
    const button = page.locator('[data-disc-preview-btn]');
    await expect(button).toHaveCount(1);
    await expect(button).toHaveAttribute('data-disc-preview-btn', a.slug);
    await expect(button).toHaveAttribute('data-disc-spotify-id', a.spotifyId);
    await expect(page.locator(`[data-disc-preview="${a.slug}"]`)).toHaveCount(1);
  }
});

test('HUB-12/13: BUY CD follows the platform links and PREVIEW follows BUY CD, both before the tracklist', async ({ page }) => {
  for (const a of withSpotify) {
    await page.goto(pageOf(a));
    const order = await page.evaluate(() => {
      const q = s => document.querySelector(s);
      const before = (x, y) => !!(x && y && (x.compareDocumentPosition(y) & Node.DOCUMENT_POSITION_FOLLOWING));
      const links = q('.disc-links--secondary'), buy = q('.disc-buy'), btn = q('[data-disc-preview-btn]'), tracks = q('[data-release-tracks]');
      return { linksBeforeBtn: before(links, btn), btnBeforeTracks: before(btn, tracks), hasBuy: !!buy,
        linksBeforeBuy: buy ? before(links, buy) : null, buyBeforeBtn: buy ? before(buy, btn) : null };
    });
    expect(order.linksBeforeBtn).toBe(true);
    expect(order.btnBeforeTracks).toBe(true);
    expect(order.hasBuy).toBe(!!a.buyCd);
    if (a.buyCd) {
      expect(order.linksBeforeBuy).toBe(true);
      expect(order.buyBeforeBtn).toBe(true);
    }
  }
});

test('HUB-12: BUY CD points at the page that sells that record', async ({ page }) => {
  for (const a of albums.filter(x => x.buyCd)) {
    await page.goto(pageOf(a));
    await expect(page.locator('.disc-buy')).toHaveCount(1);
    await expect(page.locator('.disc-buy')).toHaveAttribute('href', a.buyCd);
  }
});

test('HUB-14: a release without buyCd renders no BUY CD', async ({ page }) => {
  const deluxe = albums.find(a => a.slug === 'insane-driver-deluxe');
  expect(deluxe.buyCd).toBeFalsy();
  expect(deluxe.spotifyId).toBeTruthy();
  await page.goto(pageOf(deluxe));
  await expect(page.locator('.disc-buy')).toHaveCount(0);
  await expect(page.locator('[data-disc-preview-btn]')).toHaveCount(1);
});

test('HUB-14: a release without spotifyId renders no preview button', async ({ page }) => {
  // change-live is a single with its own release page (no Spotify id, no BUY CD).
  const single = catalog.singles.find(s => s.slug === 'change-live');
  expect(single.spotifyId).toBeFalsy();
  expect(single.buyCd).toBeFalsy();
  const res = await page.goto(pageOf(single));
  expect(res.status()).toBe(200);
  await expect(page.locator('[data-release]')).toHaveCount(1);
  await expect(page.locator('[data-disc-preview-btn]')).toHaveCount(0);
  await expect(page.locator('[data-disc-preview]')).toHaveCount(0);
  await expect(page.locator('.disc-buy')).toHaveCount(0);
});

test('HUB-15: clicking PREVIEW injects the embed for that album', async ({ page }) => {
  await page.goto(pageOf(album));
  await page.locator('[data-disc-preview-btn]').click();
  const frame = page.locator(`[data-disc-preview="${album.slug}"] iframe`);
  await expect(page.locator('[data-disc] iframe')).toHaveCount(1);
  await expect(frame).toHaveAttribute('src', `https://open.spotify.com/embed/album/${album.spotifyId}`);
});

test('HUB-15: re-clicking PREVIEW closes it and resets aria-expanded', async ({ page }) => {
  await page.goto(pageOf(album));
  const button = page.locator('[data-disc-preview-btn]');
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'false');
  await expect(page.locator('[data-disc] iframe')).toHaveCount(0);
});

test('HUB-15: the cover, platform links and BUY CD stay usable while a preview is open', async ({ page }) => {
  await page.goto(pageOf(album));
  await page.locator('[data-disc-preview-btn]').click();
  await expect(page.locator('.disc-release-art img')).toBeVisible();
  const spotify = page.locator('[data-disc-link="spotify"]').first();
  await expect(spotify).toBeVisible();
  await expect(spotify).toHaveAttribute('href', album.links.spotify);
  await expect(page.locator('.disc-buy')).toBeVisible();
});

test('HUB-15: a preview that fails to load leaves the listening routes intact', async ({ page }) => {
  await page.route('**/open.spotify.com/**', route => route.abort());
  await page.goto(pageOf(album));
  await page.locator('[data-disc-preview-btn]').click();
  await expect(page.locator('[data-disc-link="spotify"]').first()).toBeVisible();
  await expect(page.locator('.disc-buy')).toBeVisible();
  await expect(page.locator('[data-release-tracks]')).toBeVisible();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('HUB-15: the preview button stays hidden and the links still work', async ({ page }) => {
    await page.goto(pageOf(album));
    await expect(page.locator('[data-disc-preview-btn]')).toHaveCount(1);
    await expect(page.locator('[data-disc-preview-btn]')).toBeHidden();
    await expect(page.locator('[data-disc] iframe')).toHaveCount(0);
    await expect(page.locator('[data-disc-link="apple"]').first()).toBeVisible();
  });
});
