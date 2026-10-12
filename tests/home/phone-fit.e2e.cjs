const { test, expect } = require('../photos/browser.cjs');
const { serveFonts, fontsLoaded } = require('./helpers.cjs');

test.beforeEach(({ page }) => serveFonts(page));

// Fails if either face is missing, so no measurement can silently run on a
// fallback font.
const realFonts = async page => expect(await fontsLoaded(page)).toEqual([1, 1]);

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

// One rect per line box of the element's text, against its button's edges.
const textFit = (page, selector, part) => page.evaluate(([selector, part]) => [...document.querySelectorAll(selector)].map(btn => {
  const el = btn.querySelector(part);
  const range = document.createRange();
  range.selectNodeContents(el);
  const lines = [...range.getClientRects()].filter(r => r.width > 0);
  const text = range.getBoundingClientRect();
  const b = btn.getBoundingClientRect();
  return { text: el.textContent.trim(), lines: lines.length, left: text.left - b.left, right: b.right - text.right, btnLeft: b.left, btnRight: b.right, center: (text.left + text.right) / 2 - (b.left + b.right) / 2 };
}), [selector, part]);

// Phone sizes, then each side of every layout breakpoint up to 1440px.
const WIDTHS = [320, 360, 375, 390, 414, 430, 559, 560, 767, 768, 859, 860, 1024, 1199, 1200, 1440];

for (const width of WIDTHS) {
  test(`HOME-72: at ${width}px each hero button sits inside the card with its text on one line`, async ({ page }) => {
    await page.setViewportSize({ width, height: 896 });
    await page.goto('/', { waitUntil: 'load' });
    await realFonts(page);
    const card = await page.locator('.home-release-card').evaluate(el => { const r = el.getBoundingClientRect(); return { left: r.left, right: r.right }; });
    for (const part of ['.cyber-link-name', '.cyber-link-sub']) {
      const fits = await textFit(page, '.home-release-links .cyber-link-btn', part);
      expect(fits.length).toBe(2);
      for (const f of fits) {
        expect(f.btnLeft, f.text).toBeGreaterThanOrEqual(card.left);
        expect(f.btnRight, f.text).toBeLessThanOrEqual(card.right);
        expect(f.lines, f.text).toBe(1);
        expect(f.left, f.text).toBeGreaterThanOrEqual(16);
        expect(f.right, f.text).toBeGreaterThanOrEqual(16);
      }
    }
  });
}

for (const width of WIDTHS) {
  test(`HOME-73: at ${width}px every NOW::STREAMING platform name is one centered line`, async ({ page }) => {
    await page.setViewportSize({ width, height: 896 });
    await page.goto('/', { waitUntil: 'load' });
    await realFonts(page);
    // Show every platform a shuffled single can carry, primary and compact.
    const count = await page.evaluate(() => {
      const list = document.querySelector('[data-home-streaming-links]');
      list.replaceChildren(document.querySelector('[data-home-streaming-anchors]').content.cloneNode(true));
      return list.querySelectorAll('.cyber-link-btn').length;
    });
    expect(count).toBe(8);
    const fits = await textFit(page, '[data-home-streaming-links] .cyber-link-btn', '.cyber-link-name');
    expect(fits.length).toBe(8);
    for (const f of fits) {
      expect(f.lines, f.text).toBe(1);
      expect(Math.abs(f.center), f.text).toBeLessThanOrEqual(1);
      expect(f.left, f.text).toBeGreaterThanOrEqual(16);
      expect(f.right, f.text).toBeGreaterThanOrEqual(16);
    }
  });
}
