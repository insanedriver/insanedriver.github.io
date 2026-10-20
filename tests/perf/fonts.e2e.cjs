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

// Computed font-family of the first .cyber-panel-tab before self-hosting.
const PANEL_TAB_FAMILY = { '/band/': 'SiliconFont, Rajdhani, sans-serif', '/': 'Rajdhani, sans-serif' };
const FACES = [['Rajdhani', '500', 'rajdhani-500.woff2'], ['Rajdhani', '600', 'rajdhani-600.woff2'],
  ['Rajdhani', '700', 'rajdhani-700.woff2'], ['Share Tech Mono', '400', 'share-tech-mono-400.woff2']];

for (const path of ['/band/', '/']) {
  test(`PERF-20/21: ${path} loads Rajdhani and Share Tech Mono from same-origin woff2 files`, async ({ page }) => {
    const external = [];
    page.on('request', req => { if (/fonts\.(googleapis|gstatic)\.com/.test(req.url())) external.push(req.url()); });
    await page.goto(path, { waitUntil: 'load' });
    const result = await page.evaluate(async faces => {
      await document.fonts.ready;
      const out = [];
      for (const [family, weight, file] of faces) {
        const loaded = await document.fonts.load(`${weight} 16px "${family}"`);
        const entry = performance.getEntriesByType('resource').find(e => e.name.includes(`/assets/fonts/${file}`));
        out.push({
          family, weight,
          faces: loaded.filter(f => f.family.replace(/"/g, '') === family && f.weight === weight && f.status === 'loaded').length,
          origin: entry ? new URL(entry.name).origin : null,
        });
      }
      return { out, origin: location.origin, tab: getComputedStyle(document.querySelector('.cyber-panel-tab')).fontFamily };
    }, FACES);
    for (const face of result.out) {
      expect(face.faces, `${face.family} ${face.weight} loaded`).toBeGreaterThan(0);
      expect(face.origin, `${face.family} ${face.weight} origin`).toBe(result.origin);
    }
    expect(result.tab).toBe(PANEL_TAB_FAMILY[path]);
    expect(external).toEqual([]);
  });
}
