const { test, expect } = require('../photos/browser.cjs');

for (const width of [320, 375, 414, 768]) {
  test(`HOME-71: at ${width}px the NOW::STREAMING cover fills the panel content, up to 420px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 896 });
    await page.goto('/', { waitUntil: 'load' });
    const { art, column } = await page.evaluate(() => {
      const box = el => { const r = el.getBoundingClientRect(); return { left: r.left, width: r.width }; };
      return { art: box(document.querySelector('.home-streaming-art')), column: box(document.querySelector('.home-streaming')) };
    });
    expect(Math.abs(art.width - Math.min(column.width, 420))).toBeLessThanOrEqual(1);
    expect(Math.abs(art.left - column.left)).toBeLessThanOrEqual(1);
  });
}

test('HOME-71: at 1280px the cover keeps its desktop column beside the text', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/', { waitUntil: 'load' });
  const { art, body } = await page.evaluate(() => {
    const box = el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right, width: r.width, top: r.top }; };
    return { art: box(document.querySelector('.home-streaming-art')), body: box(document.querySelector('.home-streaming-body')) };
  });
  expect(art.width).toBeGreaterThanOrEqual(240);
  expect(art.width).toBeLessThanOrEqual(340);
  expect(body.left).toBeGreaterThan(art.right);
});
