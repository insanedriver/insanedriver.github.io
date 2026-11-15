const { test, expect } = require('../photos/browser.cjs');

// REF-01..04: body copy on Band, Contact and Newsletter. The Band pull-quote (.cyber-bio-quote)
// is a display line in the band font, not body copy, so it is left out.
const TARGETS = {
  '/band/': '.cyber-bio-text p:not(.cyber-bio-quote)',
  '/contact/': '.cyber-panel-body p.cyber-desc-text',
  '/newsletter/': 'p.cyber-intro, p.cyber-form-intro',
};

// Text colour against the panel: composite translucent backgrounds upward; if nothing opaque is
// found, assume a white backdrop (worst case for light text).
const measure = (els) => els.map(el => {
  const rgba = s => { const m = s.match(/[\d.]+/g).map(Number); return { r: m[0], g: m[1], b: m[2], a: m.length > 3 ? m[3] : 1 }; };
  const lum = ({ r, g, b }) => {
    const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const layers = [];
  for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
    const bg = rgba(getComputedStyle(n).backgroundColor);
    if (bg.a > 0) layers.push(bg);
    if (bg.a >= 1) break;
  }
  let base = { r: 255, g: 255, b: 255 };
  for (const l of layers.reverse()) base = { r: l.r * l.a + base.r * (1 - l.a), g: l.g * l.a + base.g * (1 - l.a), b: l.b * l.a + base.b * (1 - l.a) };
  const cs = getComputedStyle(el);
  const fg = rgba(cs.color);
  const text = { r: fg.r * fg.a + base.r * (1 - fg.a), g: fg.g * fg.a + base.g * (1 - fg.a), b: fg.b * fg.a + base.b * (1 - fg.a) };
  const [hi, lo] = [lum(text), lum(base)].sort((a, b) => b - a);
  return { family: cs.fontFamily, align: cs.textAlign, size: parseFloat(cs.fontSize), contrast: (hi + 0.05) / (lo + 0.05), text: el.textContent.trim().slice(0, 30) };
});

for (const [path, selector] of Object.entries(TARGETS)) {
  for (const width of [390, 1440]) {
    test(`REF-01/03: at ${width}px body paragraphs on ${path} use Rajdhani, align left and reach 4.5:1 contrast`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: 'load' });
      const rows = await page.locator(selector).evaluateAll(measure);
      expect(rows.length).toBeGreaterThan(0);
      for (const r of rows) {
        expect(r.family, r.text).toMatch(/^"?Rajdhani"?/);
        expect(r.align, r.text).toBe('left');
        expect(r.contrast, r.text).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test(`REF-02: at 390px body paragraphs on ${path} are at least 16px`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.goto(path, { waitUntil: 'load' });
    const rows = await page.locator(selector).evaluateAll(measure);
    for (const r of rows) expect(r.size, r.text).toBeGreaterThanOrEqual(16);
  });

  // REF-04: "current font" captured on master before this change (2026-11-15): tabs use the band
  // display font, data-hud labels use Share Tech Mono.
  test(`REF-04: on ${path} panel tabs and data-hud labels keep their current fonts`, async ({ page }) => {
    await page.goto(path, { waitUntil: 'load' });
    const { tabs, hud } = await page.evaluate(() => ({
      tabs: [...document.querySelectorAll('.cyber-panel-tab')].map(el => getComputedStyle(el).fontFamily),
      hud: [...document.querySelectorAll('[data-hud]')].map(el => getComputedStyle(el, '::after').fontFamily),
    }));
    expect(tabs.length).toBeGreaterThan(0);
    expect(hud.length).toBeGreaterThan(0);
    for (const f of tabs) expect(f).toBe('SiliconFont, Rajdhani, sans-serif');
    for (const f of hud) expect(f).toBe('"Share Tech Mono", monospace');
  });

  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    test(`edge: at ${width}px ${path} has no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(path, { waitUntil: 'load' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    });
  }
}
