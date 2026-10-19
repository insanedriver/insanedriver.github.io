const { test, expect } = require('../photos/browser.cjs');

// Edge case: WHILE the viewport is 320px wide, release and song pages have no horizontal overflow.
for (const url of ['/discography/silicon-fortress/', '/discography/silicon-fortress/faceless-demons/', '/discography/silicon-fortress/ghosts/']) {
  test(`${url} has no horizontal overflow at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(url, { waitUntil: 'load' });
    const { scrollWidth, innerWidth } = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth,
    }));
    expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
  });
}
