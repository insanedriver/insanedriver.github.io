const { test, expect } = require('../photos/browser.cjs');

test('SEO-10: /pre-save/ is one document with one doctype and one <html>', async ({ page }) => {
  const res = await page.request.get('/pre-save/');
  expect(res.status()).toBe(200);
  const html = await res.text();
  expect(html.match(/<!doctype/gi) || []).toHaveLength(1);
  expect(html.match(/<html[\s>]/gi) || []).toHaveLength(1);
  expect(html.match(/<\/html>/gi) || []).toHaveLength(1);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('SEO-10: /pre-save/ stays out of the index but lets crawlers follow its links', async ({ page }) => {
    await page.goto('/pre-save/');
    const robots = await page.locator('meta[name="robots"]').evaluateAll(els => els.map(el => el.getAttribute('content')));
    expect(robots).toEqual(['noindex, follow']);
  });
});
