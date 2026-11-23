const { test, expect } = require('../photos/browser.cjs');

for (const width of [320, 390, 768, 1440]) {
  test(`REV-22: at ${width}px /press/reviews/ has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/press/reviews/', { waitUntil: 'load' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}

test('REV-23: at 390px review quotes and summaries use Rajdhani at 16px or more', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/press/reviews/', { waitUntil: 'load' });
  const styles = await page.evaluate(() => [...document.querySelectorAll('.review-quote, .review-summary')].map(el => {
    const cs = getComputedStyle(el);
    return { cls: el.className, family: cs.fontFamily, size: parseFloat(cs.fontSize) };
  }));
  expect(styles.length).toBe(2 * reviewCount());
  for (const s of styles) {
    expect(s.family.split(',')[0].replace(/["']/g, '').trim(), s.cls).toBe('Rajdhani');
    expect(s.size, s.cls).toBeGreaterThanOrEqual(16);
  }
});

test('REV-01: /press/reviews/ links its own press-reviews CSS bundle and styles the cards', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/press/reviews/', { waitUntil: 'load' });
  await expect(page.locator('link[rel="stylesheet"][href^="/assets/css/press-reviews.min.css"]')).toHaveCount(1);
  // The card is framed, not raw browser defaults.
  const border = await page.locator('.review-card').first().evaluate(el => getComputedStyle(el).borderTopStyle);
  expect(border).toBe('solid');
});

function reviewCount() {
  return require('../../_data/reviews.json').reviews.length;
}
