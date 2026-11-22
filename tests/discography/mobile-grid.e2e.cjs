const { test, expect } = require('../photos/browser.cjs');

const RELEASE = '/discography/silicon-fortress/';
const boxesOf = (page, selector) => page.locator(selector).evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()));

test('REF-15: at 390px the Release streaming buttons lay out in at least 2 columns, each at least 44px tall', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(RELEASE, { waitUntil: 'load' });
  for (const group of ['.disc-release .disc-links:not(.disc-links--secondary)', '.disc-release .disc-links--secondary']) {
    const boxes = await boxesOf(page, `${group} .cyber-link-btn`);
    expect(boxes.length, group).toBeGreaterThan(1);
    expect(new Set(boxes.map(b => Math.round(b.x))).size, group).toBeGreaterThanOrEqual(2);
    for (const b of boxes) expect(b.height, group).toBeGreaterThanOrEqual(44);
  }
});

test('REF-16: at 390px "Buy CD" and "Preview" share the same left edge and height (±1px)', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(RELEASE, { waitUntil: 'load' });
  // Preview is revealed by script only when previews are available; show it to measure the layout.
  await page.locator('.disc-preview-btn').evaluate(el => { el.hidden = false; });
  const buy = await page.locator('.disc-buy').boundingBox();
  const preview = await page.locator('.disc-preview-btn').boundingBox();
  expect(Math.abs(buy.x - preview.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(buy.height - preview.height)).toBeLessThanOrEqual(1);
});

for (const width of [320, 390]) {
  test(`edge: at ${width}px the Release page has no horizontal overflow and button labels fit`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto(RELEASE, { waitUntil: 'load' });
    await page.locator('.disc-preview-btn').evaluate(el => { el.hidden = false; });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    const clipped = await page.locator('.disc-release .cyber-link-btn').evaluateAll(els => els
      .filter(el => [...el.children].some(c => c.scrollWidth > el.clientWidth))
      .map(el => el.textContent.trim().replace(/\s+/g, ' ')));
    expect(clipped).toEqual([]);
  });
}
