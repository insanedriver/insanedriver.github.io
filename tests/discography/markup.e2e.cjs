const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const platforms = require('../../_data/platforms.json');

const albums = catalog.albums;
const linked = album => platforms.filter(p => album.links[p.key]);

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('DISC-01: one release card per album, in catalog order, anchored by slug', async ({ page }) => {
    await page.goto('/discography/');
    const cards = page.locator('[data-disc-release]');
    await expect(cards).toHaveCount(albums.length);
    expect(await cards.evaluateAll(els => els.map(el => el.id))).toEqual(albums.map(a => a.slug));
  });

  test('DISC-02/03: every non-null platform link renders and every null one does not', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of albums) {
      const card = page.locator(`#${album.slug}`);
      for (const p of platforms) {
        const anchor = card.locator(`[data-disc-link="${p.key}"]`);
        if (album.links[p.key]) {
          await expect(anchor).toHaveCount(1);
          await expect(anchor).toHaveAttribute('href', album.links[p.key]);
        } else {
          await expect(anchor).toHaveCount(0);
        }
      }
    }
  });

  test('DISC-03: the page renders exactly as many platform anchors as the catalog has links', async ({ page }) => {
    await page.goto('/discography/');
    const expected = albums.reduce((n, a) => n + linked(a).length, 0);
    await expect(page.locator('[data-disc-link]')).toHaveCount(expected);
  });

  test('DISC-04: Spotify and Apple Music come first and carry the primary modifier', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of albums) {
      const keys = await page.locator(`#${album.slug} [data-disc-link]`)
        .evaluateAll(els => els.map(el => el.dataset.discLink));
      expect(keys.slice(0, 2)).toEqual(['spotify', 'apple']);
      for (const key of ['spotify', 'apple']) {
        await expect(page.locator(`#${album.slug} [data-disc-link="${key}"]`)).toHaveClass(/cyber-link-btn--primary/);
      }
      for (const key of keys.slice(2)) {
        await expect(page.locator(`#${album.slug} [data-disc-link="${key}"]`)).toHaveClass(/cyber-link-btn--compact/);
      }
    }
  });

  test('DISC-05: every platform anchor opens in a new tab with rel=noopener', async ({ page }) => {
    await page.goto('/discography/');
    const attrs = await page.locator('[data-disc-link]')
      .evaluateAll(els => els.map(el => [el.getAttribute('target'), el.getAttribute('rel')]));
    expect(attrs.length).toBeGreaterThan(0);
    for (const [target, rel] of attrs) {
      expect(target).toBe('_blank');
      expect(rel).toBe('noopener');
    }
  });

  test('DISC-06: no platform anchor points at an artist profile or a search page', async ({ page }) => {
    await page.goto('/discography/');
    const hrefs = await page.locator('[data-disc-link]').evaluateAll(els => els.map(el => el.href));
    for (const href of hrefs) {
      expect(href).not.toMatch(/\/artist\/|\/artists\/|\/search|\/user\//);
    }
  });

  test('DISC-07: the listening links work with JavaScript disabled', async ({ page }) => {
    await page.goto('/discography/');
    const spotify = page.locator('#silicon-fortress [data-disc-link="spotify"]');
    await expect(spotify).toBeVisible();
    await expect(spotify).toHaveAttribute('href', catalog.albums[0].links.spotify);
  });

  test('DISC-08: the shell uses the cyber panel vocabulary', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('.disc-shell.cyber-zone > .cyber-zone-inner')).toHaveCount(1);
    await expect(page.locator('.cyber-panel')).toHaveCount(albums.length + 1);
    for (const sel of ['.cyber-panel-tab', '.top-accent', '.corner-tl', '.corner-tr', '.corner-bl']) {
      await expect(page.locator(sel)).toHaveCount(albums.length + 1);
    }
    const tabs = await page.locator('.cyber-panel-tab').evaluateAll(els => els.map(el => el.textContent.trim()));
    expect(tabs).toEqual(['DISC::INDEX', 'REL::2021', 'REL::2018', 'REL::2016']);
    const huds = await page.locator('.cyber-panel-body').evaluateAll(els => els.map(el => el.dataset.hud));
    expect(huds[1]).toBe('RELEASE.SILICON-FORTRESS // 11 TRACKS_');
  });

  test('DISC-09/10: the index panel counts the catalog and anchors each album', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('[data-disc-counter]')).toHaveText('03 RELEASES // 18 SINGLES');
    const links = page.locator('[data-disc-index-link]');
    await expect(links).toHaveCount(albums.length);
    expect(await links.evaluateAll(els => els.map(el => el.getAttribute('href'))))
      .toEqual(albums.map(a => `#${a.slug}`));
  });

  test('DISC-35/36/37: BUY CD points at the page that sells that record, and only there', async ({ page }) => {
    await page.goto('/discography/');
    await expect(page.locator('#silicon-fortress [data-disc-buy]')).toHaveAttribute('href', '/preorder/');
    await expect(page.locator('#insane-driver [data-disc-buy]')).toHaveAttribute('href', '/store/');
    await expect(page.locator('#insane-driver-deluxe [data-disc-buy]')).toHaveCount(0);
    await expect(page.locator('[data-disc-buy]')).toHaveCount(2);
  });

  test('DISC-45: a release with fewer links renders no empty button slots', async ({ page }) => {
    await page.goto('/discography/');
    const deluxe = page.locator('#insane-driver-deluxe [data-disc-link]');
    await expect(deluxe).toHaveCount(linked(catalog.albums[1]).length);
    const emptyHrefs = await deluxe.evaluateAll(els => els.filter(el => !el.getAttribute('href')).length);
    expect(emptyHrefs).toBe(0);
  });
});
