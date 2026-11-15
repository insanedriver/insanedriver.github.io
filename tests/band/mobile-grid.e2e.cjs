const { test, expect } = require('../photos/browser.cjs');

// REF-14: at 390px the Band "Listen Now" and "Connect" buttons sit in at least two columns, each at least 44px tall.
const GROUPS = { 'Listen Now': '.cyber-links-grid:not(.cyber-links-grid--social)', Connect: '.cyber-links-grid--social' };

for (const [name, grid] of Object.entries(GROUPS)) {
  test(`REF-14: at 390px the Band "${name}" buttons lay out in at least 2 columns, each at least 44px tall`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/band/', { waitUntil: 'load' });
    const boxes = await page.locator(`${grid} .cyber-link-btn`).evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()));
    expect(boxes.length).toBeGreaterThan(1);
    const columns = new Set(boxes.map(b => Math.round(b.x)));
    expect(columns.size).toBeGreaterThanOrEqual(2);
    for (const b of boxes) {
      expect(b.height).toBeGreaterThanOrEqual(44);
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width).toBeLessThanOrEqual(390);
    }
  });
}

for (const width of [320, 390]) {
  test(`edge: at ${width}px the Band page has no horizontal overflow and button labels fit their buttons`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/band/', { waitUntil: 'load' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    const clipped = await page.locator('.cyber-link-btn').evaluateAll(els => els
      .filter(el => [...el.children].some(c => c.scrollWidth > el.clientWidth))
      .map(el => el.textContent.trim().replace(/\s+/g, ' ')));
    expect(clipped).toEqual([]);
  });
}
