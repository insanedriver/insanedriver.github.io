const { test, expect } = require('../photos/browser.cjs');

// Every same-origin image the page requests, by path.
const imageRequests = page => {
  const seen = [];
  page.on('request', req => { if (req.resourceType() === 'image') seen.push(new URL(req.url()).pathname); });
  return seen;
};

test('PERF-26: /band/ at 375 px fetches the 768 px WebP header, not the JPEG', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  const seen = imageRequests(page);
  await page.goto('/band/', { waitUntil: 'load' });
  const header = page.locator('.header-img img');
  await expect(header).toHaveJSProperty('complete', true);
  expect(await header.evaluate(img => new URL(img.currentSrc).pathname)).toBe('/assets/images/header_3-768.webp');
  expect(seen).toContain('/assets/images/header_3-768.webp');
  expect(seen).not.toContain('/assets/images/header_3.jpg');
  // Same box as the JPEG: full width, 1920:320 aspect.
  const box = await header.boundingBox();
  expect(box.width).toBe(375);
  expect(box.height).toBeCloseTo(375 * 320 / 1920, 0);
});
