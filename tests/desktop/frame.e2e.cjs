const { test, expect } = require('../photos/browser.cjs');
test.setTimeout(60000);

const pages = [
  ['/', '.home-shell'], ['/band/', '.band-container'],
  ['/discography/', '.disc-shell'], ['/discography/silicon-fortress/', '.disc-shell'],
  ['/discography/silicon-fortress/ghosts/', '.disc-shell'],
  ['/photos/', '.photos-shell'], ['/videos/', '.videos-shell'],
  ['/store/', '.store-shell'], ['/contact/', '.contact-container'], ['/dates/', '.dates-container'],
  ['/newsletter/', '.newsletter-container'],
];

for (const width of [1200, 1366, 1440, 1920, 2560]) {
  test(`DESK-01/06: common desktop guides at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1080 });
    const expectedWidth = Math.min(1360, width - 64);
    const expectedLeft = (width - expectedWidth) / 2;
    for (const [url, shell] of pages) {
      await page.goto(url, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      for (const selector of [`${shell} .cyber-zone-inner`, '.navbar > .container-fluid', 'footer > .container',
        url === '/' ? '.home-hero-content' : '.page-header']) {
        const box = await page.locator(selector).boundingBox();
        expect(box, `${url} ${selector}`).not.toBeNull();
        expect(Math.abs(box.width - expectedWidth), `${url} ${selector} width`).toBeLessThanOrEqual(1);
        expect(Math.abs(box.x - expectedLeft), `${url} ${selector} left`).toBeLessThanOrEqual(1);
      }
      const background = await page.locator(`${shell}.cyber-zone, ${shell} .cyber-zone`).boundingBox();
      expect(Math.abs(background.width - width), `${url} background`).toBeLessThanOrEqual(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth), url).toBeLessThanOrEqual(width);
      // Links and logo must fit the frame, including the narrow desktop breakpoint.
      for (const link of await page.locator('.navbar a:visible').all()) {
        const box = await link.boundingBox();
        expect(box.x, `${url} nav left`).toBeGreaterThanOrEqual(expectedLeft - 1);
        expect(box.x + box.width, `${url} nav right`).toBeLessThanOrEqual(width - expectedLeft + 1);
      }
    }
  });
}

for (const width of [320, 390, 768, 1024]) {
  test(`DESK-06: responsive pages fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const [url] of pages) {
      await page.goto(url, { waitUntil: 'load' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth), url).toBeLessThanOrEqual(width);
    }
  });
}

test('DESK-07: excluded campaigns retain their original frame', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/pre-save/', { waitUntil: 'load' });
  expect(await page.locator('body').evaluate(el => getComputedStyle(el).getPropertyValue('--site-content-max'))).toBe('');
});
