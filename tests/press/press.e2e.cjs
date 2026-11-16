const { test, expect } = require('../photos/browser.cjs');

test('edge: with reduced motion, /press/ runs no animation or transition longer than 0.01s', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/press/', { waitUntil: 'load' });
  const long = await page.evaluate(() => {
    const secs = v => v.split(',').map(s => s.trim().endsWith('ms') ? parseFloat(s) / 1000 : parseFloat(s) || 0);
    const out = [];
    for (const el of document.querySelectorAll('body, body *')) {
      for (const pseudo of [null, '::before', '::after']) {
        const cs = getComputedStyle(el, pseudo);
        const anim = cs.animationName !== 'none' ? Math.max(...secs(cs.animationDuration)) : 0;
        const trans = Math.max(...secs(cs.transitionDuration));
        if (anim > 0.01 || trans > 0.01) out.push(`${el.className || el.tagName}${pseudo || ''} anim=${anim} trans=${trans}`);
      }
    }
    return out;
  });
  expect(long).toEqual([]);
});

test('REF-18: the Copy buttons put each bio on the clipboard', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4178' });
  await page.goto('/press/', { waitUntil: 'load' });
  const copy = page.locator('[data-press-copy="short"]');
  await expect(copy).toBeVisible();
  await copy.click();
  const clip = await page.evaluate(() => navigator.clipboard.readText());
  expect(clip.startsWith('Hard Rock. Heavy Metal. Metalcore.')).toBe(true);
  expect(clip).toContain('Insane Driver was forged');
  await expect(copy).toHaveText(/Copied/i);
});

for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`edge: at ${width}px /press/ has no horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/press/', { waitUntil: 'load' });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  });
}
