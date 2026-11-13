const { test, expect } = require('../photos/browser.cjs');

test.describe('BANDSEO: song and album similar-band SEO', () => {
  test.use({ javaScriptEnabled: false });

  test('video layout renders checked-only bands, Sonic DNA, meta description, and MusicRecording JSON-LD', async ({ page }) => {
    await page.goto('/discography/insane-driver/the-edge-of-life/');
    await expect(page.locator('.fans-of')).toHaveText('For fans of Killswitch Engage and Alter Bridge');

    const dna = page.locator('[data-song-sonic-dna]');
    await expect(dna).toBeVisible();
    await expect(dna.locator('.song-genre-tag')).toHaveText(['Metalcore', 'Post-Grunge']);
    await expect(dna.locator('.song-similar-band')).toHaveText(['Killswitch Engage', 'Alter Bridge']);
    await expect(dna).toContainText('The End of Heartache, My Curse');
    await expect(dna).not.toContainText('Trivium');
    await expect(dna).not.toContainText('MERT');

    const desc = await page.locator('meta[name="description"]').getAttribute('content');
    expect(desc).toContain('For fans of Killswitch Engage and Alter Bridge.');

    const ld = await page.locator('script[type="application/ld+json"]')
      .evaluateAll(els => els.map(el => JSON.parse(el.textContent)).find(d => d['@type'] === 'MusicRecording'));
    expect(ld.genre).toEqual(['Metalcore', 'Post-Grunge']);
    expect(ld.keywords).toContain('bands like Killswitch Engage');
    expect(ld.keywords).not.toContain('Trivium');
  });

  test('lyrics layout with 1 checked band formats without trailing comma or "and"', async ({ page }) => {
    await page.goto('/discography/silicon-fortress/age-of-lies/');
    await expect(page.locator('.fans-of')).toHaveText('For fans of Avenged Sevenfold');
    const dna = page.locator('[data-song-sonic-dna]');
    await expect(dna).toBeVisible();
    await expect(dna.locator('.song-similar-band')).toHaveText(['Avenged Sevenfold']);
    await expect(dna).not.toContainText('Symphony X');
  });

  test('stack layout (instrumental) renders checked bands and Sonic DNA', async ({ page }) => {
    await page.goto('/discography/insane-driver/endless-path/');
    await expect(page.locator('.fans-of')).toHaveText('For fans of Dream Theater and Metallica');
    const dna = page.locator('[data-song-sonic-dna]');
    await expect(dna).toBeVisible();
    await expect(dna.locator('.song-similar-band')).toHaveText(['Dream Theater', 'Metallica']);
    await expect(dna).not.toContainText('Symphony X');
  });

  test('studio album pages aggregate top 4 checked bands and track genres', async ({ page }) => {
    await page.goto('/discography/silicon-fortress/');
    const fansText = await page.locator('.fans-of').textContent();
    expect(fansText).toMatch(/^For fans of Alter Bridge, .+ and .+/);

    const ld = await page.locator('script[type="application/ld+json"]')
      .evaluateAll(els => els.map(el => JSON.parse(el.textContent)).find(d => d['@type'] === 'MusicAlbum'));
    expect(ld.genre).toContain('Metalcore');
    expect(ld.genre).toContain('Post-Grunge');
  });

  test('home, band, and live release pages keep the default fallback', async ({ page }) => {
    for (const url of ['/', '/band/', '/discography/change-live/']) {
      await page.goto(url);
      await expect(page.locator('.fans-of')).toHaveText('For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold');
    }
  });
});

test('BANDSEO: Sonic DNA section has no horizontal overflow on mobile or desktop', async ({ page }) => {
  for (const viewport of [{ width: 375, height: 812 }, { width: 1280, height: 800 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/discography/insane-driver/the-edge-of-life/');
    await expect(page.locator('[data-song-sonic-dna]')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    expect(overflow, `overflow at ${viewport.width}px`).toBe(false);
  }
});
