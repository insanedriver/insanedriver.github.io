const { test, expect } = require('../photos/browser.cjs');
const fs = require('node:fs');
const path = require('node:path');

// The shared fixture blocks every outside host, so Google Fonts never load and
// text would be measured in a fallback face. Serve the latin Rajdhani and
// Share Tech Mono files the site asks for from tests/home/fonts instead.
const FACES = [
  ['Rajdhani', 500, 'rajdhani-500'],
  ['Rajdhani', 600, 'rajdhani-600'],
  ['Rajdhani', 700, 'rajdhani-700'],
  ['Share Tech Mono', 400, 'share-tech-mono-400']
];
const FONT_CSS = FACES.map(([family, weight, file]) =>
  `@font-face { font-family: '${family}'; font-style: normal; font-weight: ${weight}; font-display: swap; src: url(https://fonts.gstatic.com/local/${file}.woff2) format('woff2'); }`).join('\n');

test.beforeEach(async ({ page }) => {
  await page.route(/^https:\/\/fonts\.googleapis\.com\/css2/, route => route.fulfill({ contentType: 'text/css', body: FONT_CSS }));
  await page.route(/^https:\/\/fonts\.gstatic\.com\/local\//, route => route.fulfill({
    contentType: 'font/woff2',
    body: fs.readFileSync(path.join(__dirname, 'fonts', path.basename(new URL(route.request().url()).pathname)))
  }));
});

// Loads both faces and fails if either is missing, so no measurement can
// silently run on a fallback font.
const realFonts = async page => {
  const loaded = await page.evaluate(async () => [
    (await document.fonts.load("700 15px 'Rajdhani'")).length,
    (await document.fonts.load("10px 'Share Tech Mono'")).length
  ]);
  expect(loaded).toEqual([1, 1]);
};

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

const WIDTHS = [320, 360, 375, 390, 414, 430, 768, 1024, 1440];

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
