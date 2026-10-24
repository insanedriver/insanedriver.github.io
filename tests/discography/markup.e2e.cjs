const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const copy = require('../../_data/songs.json').releases;

const albums = catalog.albums;
const card = (page, album) => page.locator(`[data-disc-album="${album.slug}"]`);

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('HUB-01: one album card per album, in catalog order', async ({ page }) => {
    await page.goto('/discography/');
    const cards = page.locator('[data-disc-album]');
    await expect(cards).toHaveCount(albums.length);
    expect(await cards.evaluateAll(els => els.map(el => el.dataset.discAlbum)))
      .toEqual(['silicon-fortress', 'insane-driver-deluxe', 'insane-driver']);
  });

  test('HUB-02: each album card is one anchor to its release page with no other link or button inside', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of albums) {
      const a = card(page, album);
      await expect(a).toHaveJSProperty('tagName', 'A');
      await expect(a).toHaveAttribute('href', `/discography/${album.slug}/`);
      await expect(a.locator('a, button')).toHaveCount(0);
    }
  });

  test('HUB-03: each album card shows cover, type and year, title, track count, description and the CTA', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of albums) {
      const a = card(page, album);
      await expect(a.locator(`img[alt="${album.title} cover"]`)).toHaveCount(1);
      const type = album.type === 'DELUXE' ? 'DELUXE EDITION' : 'ALBUM';
      await expect(a.locator('[data-disc-album-type]')).toHaveText(`${type} // ${album.year}`);
      await expect(a.locator('[data-disc-album-title]')).toHaveText(album.title);
      await expect(a.locator('[data-disc-album-tracks]')).toHaveText(`${album.tracks.length} tracks`);
      await expect(a.locator('.disc-album-cta')).toHaveText(/^OPEN RELEASE/);
    }
  });

  test('HUB-04: the card carries the full release description', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of albums) {
      await expect(card(page, album).locator('[data-disc-album-description]')).toHaveText(copy[album.slug]);
    }
  });

  test('HUB-10: the hero shows the heading and counts the catalog', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('#disc-index-title')).toHaveText('Discography.');
    await expect(page.locator('[data-disc-counter]')).toHaveText('03 RELEASES // 18 SINGLES');
  });

  test('HUB-11: the hub shell has no in-page anchor links', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('.disc-shell a[href^="#"]')).toHaveCount(0);
  });

  test('HUB-23: an album card navigates to its release page without JavaScript', async ({ page }) => {
    await page.goto('/discography/');
    await card(page, albums[0]).click();
    await expect(page).toHaveURL(/\/discography\/silicon-fortress\/$/);
    await expect(page.locator('h1')).toHaveText('Silicon Fortress');
  });

  test('HUB-24: the shell uses the cyber panel vocabulary', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('.disc-shell.cyber-zone > .cyber-zone-inner')).toHaveCount(1);
    const panelCount = 3; // hero + albums + singles
    await expect(page.locator('.cyber-panel')).toHaveCount(panelCount);
    for (const sel of ['.cyber-panel-tab', '.top-accent', '.corner-tl', '.corner-tr', '.corner-bl']) {
      await expect(page.locator(sel)).toHaveCount(panelCount);
    }
    const tabs = await page.locator('.cyber-panel-tab').evaluateAll(els => els.map(el => el.textContent.trim()));
    expect(tabs).toEqual(['DISC::INDEX', 'DISC::ALBUMS', 'DISC::SINGLES']);
  });

  // DISC-05/06 now hold on the release pages, where the platform anchors live.
  test('DISC-05/06: release-page platform anchors open in a new tab and never point at a profile or search', async ({ page }) => {
    for (const slug of [...albums.map(a => a.slug), 'change-live']) {
      await page.goto(`/discography/${slug}/`);
      const anchors = await page.locator('.disc-release [data-disc-link]')
        .evaluateAll(els => els.map(el => [el.getAttribute('target'), el.getAttribute('rel'), el.href]));
      expect(anchors.length).toBeGreaterThan(0);
      for (const [target, rel, href] of anchors) {
        expect(target).toBe('_blank');
        expect(rel).toBe('noopener');
        expect(href).not.toMatch(/\/artist\/|\/artists\/|\/search|\/user\//);
      }
    }
  });
});
