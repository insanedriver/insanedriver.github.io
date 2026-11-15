const { test, expect } = require('../photos/browser.cjs');

const TARGETS = 'footer .footer-links a, footer .footer-social a, footer .top-link';

for (const path of ['/', '/band/']) {
  test(`REF-07: at 390px every footer link and icon on ${path} has a hit area of at least 44x44`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path, { waitUntil: 'load' });
    const boxes = await page.locator(TARGETS).evaluateAll(els => els.map(el => {
      const r = el.getBoundingClientRect();
      return { name: (el.getAttribute('title') || el.textContent).trim().replace(/\s+/g, ' '), w: r.width, h: r.height };
    }));
    expect(boxes.length).toBe(9 + 7 + 1);
    for (const b of boxes) {
      expect(b.w, b.name).toBeGreaterThanOrEqual(44);
      expect(b.h, b.name).toBeGreaterThanOrEqual(44);
    }
  });

  test(`REF-05: at 390px the footer nav on ${path} is two columns and at 1440px the three zones sit side by side`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path, { waitUntil: 'load' });
    const xs = await page.locator('footer .footer-links a').evaluateAll(els => els.map(el => Math.round(el.getBoundingClientRect().x)));
    expect(new Set(xs).size).toBe(2);
    await page.setViewportSize({ width: 1440, height: 900 });
    const zones = await page.locator('footer .footer-grid > *').evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()));
    expect(zones).toHaveLength(3);
    expect(zones[0].x + zones[0].width).toBeLessThanOrEqual(zones[1].x);
    expect(zones[1].x + zones[1].width).toBeLessThanOrEqual(zones[2].x);
    expect(Math.abs(zones[0].y - zones[2].y)).toBeLessThan(2);
  });

  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    test(`edge: at ${width}px ${path} has no horizontal overflow with the new footer`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: 'load' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });
  }
}
