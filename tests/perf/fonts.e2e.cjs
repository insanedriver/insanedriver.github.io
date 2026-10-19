const { test, expect } = require('../photos/browser.cjs');

test('PERF-23: the footer back-to-top icon is the Font Awesome chevron and renders', async ({ page }) => {
  await page.goto('/band/', { waitUntil: 'load' });
  const icon = page.locator('footer .scroll-top i');
  await expect(icon).toHaveClass('fa fa-chevron-up');
  await icon.scrollIntoViewIfNeeded();
  const glyph = await icon.evaluate(el => ({
    width: el.getBoundingClientRect().width,
    family: getComputedStyle(el).fontFamily,
    content: getComputedStyle(el, '::before').content,
  }));
  expect(glyph.width).toBeGreaterThan(0);
  expect(glyph.family).toContain('FontAwesome');
  expect(glyph.content).not.toBe('none');
  // The chevron glyph (U+F077) comes from a loaded FontAwesome face, not a fallback.
  expect(await page.evaluate(async () => (await document.fonts.load('14px FontAwesome', String.fromCharCode(0xf077))).length)).toBeGreaterThan(0);
});
