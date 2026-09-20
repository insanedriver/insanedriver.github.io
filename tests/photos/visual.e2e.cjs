const { test, expect } = require('./browser.cjs');
for (const width of [320, 390, 768, 1440]) {
  test(`PHOTO-03/14: cyberpunk gallery fits ${width}px`, async ({page}) => {
    await page.setViewportSize({width, height: 900});
    await page.goto('/photos/');
    await expect(page.locator('.photos-stage')).toHaveCSS('border-top-color', 'rgb(0, 243, 255)');
    await expect(page.locator('.photos-accent').first()).toHaveCSS('color', 'rgb(255, 0, 234)');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(page.locator('.photos-archive')).toHaveCSS('display', 'grid');
    await page.locator('.photos-stage img').first().evaluate(img => img.decode());
    await page.screenshot({path: `/tmp/photos-${width}.png`, fullPage: true});
  });
}
test('PHOTO-11: gallery links and controls expose visible keyboard focus and names', async ({page}) => {
  await page.goto('/photos/');
  // Check control styling before T3 adds initialization.
  await page.locator('[data-photo-controls]').evaluateAll(nodes => nodes.forEach(n => n.hidden = false));
  for (const control of await page.locator('.photos-shell a, .photos-shell button').all()) {
    if (!await control.isVisible()) continue;
    await control.focus();
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS('outline-style', 'solid');
    expect(await control.getAttribute('aria-label')).toBeTruthy();
  }
});
test('PHOTO-15: reduced motion disables decorative animation and transitions', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/photos/');
  expect(await page.locator('.photos-shell, .photos-shell *').evaluateAll(nodes => nodes.every(n => {
    const css = getComputedStyle(n);
    return css.animationName === 'none' && css.transitionDuration === '0s';
  }))).toBe(true);
});
