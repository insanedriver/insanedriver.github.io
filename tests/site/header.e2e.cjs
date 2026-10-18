const { test, expect } = require('../photos/browser.cjs');

// Every page that renders the shared header menu.
const PAGES = ['/', '/band/', '/contact/', '/discography/', '/newsletter/', '/photos/', '/pre-save/', '/store/', '/videos/'];

for (const width of [768, 991]) {
  for (const path of PAGES) {
    test(`header: at ${width}px the menu on ${path} stays inside the viewport`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: 'load' });
      const right = await page.locator('.menu-center').first().evaluate(el => el.getBoundingClientRect().right);
      expect(right).toBeLessThanOrEqual(width);
    });
  }
}
