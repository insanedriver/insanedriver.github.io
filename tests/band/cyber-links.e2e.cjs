const { test, expect } = require('../photos/browser.cjs');

// DISC-12: the button system moved out of band.less into a shared mixin. The
// band page is not the subject of this feature, so it must render identically.
// These assertions pin the values the old band.less declared.

test('DISC-12: band platform buttons keep their layout and typography', async ({ page }) => {
  await page.goto('/band/');
  const spotify = page.locator('.cyber-link--spotify').first();
  await expect(spotify).toHaveCSS('display', 'flex');
  await expect(spotify).toHaveCSS('flex-direction', 'column');
  await expect(spotify).toHaveCSS('background-color', 'rgba(10, 10, 10, 0.7)');
  await expect(spotify).toHaveCSS('border-top-color', 'rgba(0, 243, 255, 0.2)');
  await expect(spotify).toHaveCSS('letter-spacing', '2px');
  await expect(spotify).toHaveCSS('text-transform', 'uppercase');
});

test('DISC-12: band button name and sub-label keep their fonts and colors', async ({ page }) => {
  await page.goto('/band/');
  const name = page.locator('.cyber-link--spotify .cyber-link-name').first();
  const sub = page.locator('.cyber-link--spotify .cyber-link-sub').first();
  await expect(name).toHaveCSS('color', 'rgb(255, 255, 255)');
  await expect(name).toHaveCSS('font-weight', '700');
  expect(await name.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Rajdhani');
  await expect(sub).toHaveCSS('color', 'rgba(0, 243, 255, 0.45)');
  expect(await sub.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Share Tech Mono');
});

test('DISC-12: per-platform hover colors survive the move', async ({ page }) => {
  await page.goto('/band/');
  const cases = [
    ['.cyber-link--spotify', 'rgb(29, 185, 84)'],
    ['.cyber-link--apple', 'rgb(252, 60, 68)'],
    ['.cyber-link--tidal', 'rgb(0, 243, 255)'],
    ['.cyber-link--amazon', 'rgb(255, 153, 0)'],
  ];
  for (const [selector, color] of cases) {
    const button = page.locator(selector).first();
    await button.hover();
    await expect(button).toHaveCSS('border-top-color', color);
    await expect(button.locator('i')).toHaveCSS('color', color);
  }
});

test('DISC-11: the discography page renders the same button system', async ({ page }) => {
  await page.goto('/discography/');
  const spotify = page.locator('#silicon-fortress [data-disc-link="spotify"]');
  await expect(spotify).toHaveCSS('display', 'flex');
  await expect(spotify).toHaveCSS('background-color', 'rgba(10, 10, 10, 0.7)');
  await spotify.hover();
  await expect(spotify).toHaveCSS('border-top-color', 'rgb(29, 185, 84)');
});
