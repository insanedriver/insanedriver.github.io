const { test, expect } = require('../photos/browser.cjs');

// Edge case "no horizontal overflow at 320px", extended to /band/ (user decision, T22).
test('/band/ has no horizontal overflow at 320px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/band/', { waitUntil: 'load' });
  const { scrollWidth, innerWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth,
  }));
  expect(scrollWidth).toBeLessThanOrEqual(innerWidth);
});
