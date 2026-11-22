const { test, expect } = require('../photos/browser.cjs');

const grids = [
  ['/store/', [['.store-grid', 3]]],
  ['/discography/', [['.disc-album-grid', 3], ['.disc-single-grid', 6]]],
  ['/photos/', [['.photos-archive', 4], ['.photos-thumbnails', 6]]],
  ['/band/', [['.cyber-member-grid', 5], ['.cyber-links-grid:not(.cyber-links-grid--social)', 4]]],
  ['/', [['.home-archive-list', 3]]],
];

for (const width of [1200, 1366, 1920, 2560]) {
  for (const [url, selectors] of grids) {
    test(`DESK-02/03: ${url} column distribution at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 1080 });
      await page.goto(url, { waitUntil: 'load' });
      for (const [selector, columns] of selectors) {
        const style = await page.locator(selector).evaluate(el => {
          const s = getComputedStyle(el);
          return { columns: s.gridTemplateColumns.split(' ').length, gap: s.columnGap };
        });
        expect(style.columns, selector).toBe(columns);
        expect(style.gap, selector).toBe('24px');
      }
      const division = await page.locator('.cyber-separator').first().evaluate(el => {
        const s = getComputedStyle(el);
        return el.getBoundingClientRect().height + parseFloat(s.marginTop) + parseFloat(s.marginBottom);
      });
      expect(division).toBe(48);
      if (width === 1920) {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        if (url === '/') await page.evaluate(() => window.IDHomeRelease());
        await page.locator(selectors[0][0]).scrollIntoViewIfNeeded();
        await page.locator(`${selectors[0][0]} img`).evaluateAll(images => Promise.all(images.filter(img => {
          const r = img.getBoundingClientRect();
          return r.bottom > 0 && r.top < innerHeight;
        }).map(img => img.decode())));
        await page.screenshot({ path: `/tmp/desktop-layout-${url.split('/')[1] || 'home'}-1920.png` });
      }
    });
  }
}

for (const [width, height] of [[1200, 720], [1920, 720], [1920, 1080]]) {
  test(`DESK-04/05: readable text and complete Band photo at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/band/', { waitUntil: 'load' });
    const bio = await page.locator('.cyber-bio-text').boundingBox();
    expect(bio.width).toBe(760);
    const photo = await page.locator('.cyber-band-photo').boundingBox();
    expect(photo.height).toBeLessThanOrEqual(height * .6 + 1);
    await expect(page.locator('.cyber-band-photo')).toHaveCSS('object-fit', 'contain');
  });

  for (const [url, selector] of [['/videos/', '.videos-screen'], ['/', '.home-video-media'],
    ['/discography/silicon-fortress/ghosts/', '.song-video-frame-box']]) {
    test(`DESK-05: proportional video on ${url} at ${width}×${height}`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(url, { waitUntil: 'load' });
      const box = await page.locator(selector).boundingBox();
      expect(box.height).toBeLessThanOrEqual(height * .6 + 1);
      expect(Math.abs(box.width / box.height - 16 / 9)).toBeLessThan(.01);
    });
  }

  test(`DESK-05/07: gallery media and controls at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('/photos/', { waitUntil: 'load' });
    const image = await page.locator('.photos-slide:not([hidden]) .photos-open img').boundingBox();
    expect(image.height).toBeLessThanOrEqual(height * .6 + 1);
    await expect(page.locator('.photos-open img').first()).toHaveCSS('object-fit', 'contain');
    const stage = page.locator('.photos-stage');
    await stage.scrollIntoViewIfNeeded();
    const box = await stage.boundingBox();
    expect(box.height).toBeLessThan(height - 72);
    for (const selector of ['[data-photo-next]', '[data-photo-prev]']) {
      const control = page.locator(selector);
      await expect(control).toBeVisible();
      const b = await control.boundingBox();
      expect(b.y).toBeGreaterThanOrEqual(box.y);
      expect(b.y + b.height).toBeLessThanOrEqual(box.y + box.height);
    }
    const before = await page.locator('[data-photo-counter]').textContent();
    await page.locator('[data-photo-next]').click();
    await expect(page.locator('[data-photo-counter]')).not.toHaveText(before);
  });
}

for (const width of [1200, 1920]) {
test(`DESK-02/04/05: paired panels, readable Contact and contained newsletter at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1080 });
  for (const [url, selector] of [['/discography/silicon-fortress/', '.disc-release'], ['/', '.home-streaming'],
    ['/newsletter/', '.cyber-zone-inner']]) {
    await page.goto(url, { waitUntil: 'load' });
    const grid = page.locator(selector);
    const s = await grid.evaluate(el => ({ cols: getComputedStyle(el).gridTemplateColumns.split(' ').length,
      gap: getComputedStyle(el).columnGap }));
    expect(s.cols).toBe(2);
    expect(s.gap).toBe('32px');
    if (url === '/newsletter/') {
      const embed = await page.locator('.newsletter-embed-frame').boundingBox();
      const panel = await page.locator('.cyber-panel--signup .cyber-panel-body').boundingBox();
      expect(embed.x).toBeGreaterThanOrEqual(panel.x);
      expect(embed.x + embed.width).toBeLessThanOrEqual(panel.x + panel.width);
      await expect(page.locator('.newsletter-embed-frame')).toHaveAttribute('src', /bandsintown.com\/artist\/10752930\/email_signup_form/);
      await page.locator('.cyber-panel--signup').scrollIntoViewIfNeeded();
      if (width === 1920) await page.screenshot({ path: '/tmp/desktop-layout-newsletter-1920.png' });
    }
    if (selector === '.disc-release' || selector === '.home-streaming') {
      const cover = await page.locator(selector === '.disc-release' ? '.disc-release-art' : '.home-streaming-art').boundingBox();
      expect(cover.width).toBeLessThanOrEqual(360);
    }
    if (selector === '.home-streaming') {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.evaluate(() => window.IDHomeRelease());
      await page.locator('#home-loader').waitFor({ state: 'hidden' });
      if (width === 1920) await page.screenshot({ path: '/tmp/desktop-layout-hero-1920.png' });
    }
  }
  await page.goto('/contact/', { waitUntil: 'load' });
  for (const panel of await page.locator('.contact-container .cyber-panel').all()) {
    expect((await panel.boundingBox()).width).toBe(760);
  }
});

test(`DESK-02/07: video feed keeps horizontal navigation and usable controls at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: 1080 });
  await page.goto('/videos/', { waitUntil: 'load' });
  const feed = page.locator('.videos-feed');
  await expect(feed).toHaveCSS('display', 'flex');
  await expect(feed).toHaveCSS('overflow-x', 'auto');
  expect(await feed.evaluate(el => el.scrollWidth)).toBeGreaterThan(await feed.evaluate(el => el.clientWidth));
  await page.locator('[data-idtv-next]').click();
  await expect(page.locator('[data-idtv-counter]')).toHaveText('02 / 10');
});
}
