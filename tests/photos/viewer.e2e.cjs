const { test, expect } = require('./browser.cjs');
const photos = require('../../_data/photos.json');
async function current(page, src) {
  await expect(page.locator('.pswp')).toHaveClass(/pswp--open/);
  await expect(page.locator('.pswp__item').nth(1).locator('img.pswp__img').last()).toHaveAttribute('src',src);
}
test('PHOTO-09: selected highlight opens its corresponding full-size image', async ({page}) => {
  await page.goto('/photos/');
  await page.locator('[data-photo-select="4"]').click();
  const link=page.locator('[data-photo-slide]:not([hidden]) a');
  const src=await link.getAttribute('href');
  await link.click(); await current(page,src);
});
test('PHOTO-09: archive opens matching photo, keeps navigation and zoom', async ({page}) => {
  await page.goto('/photos/');
  await page.locator('.photos-archive a').nth(7).click(); await current(page,photos[7].src);
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.pswp__counter')).toHaveText('9 / 17');
  await expect(page.locator('.pswp__button--zoom')).toBeVisible();
  await page.locator('.pswp__button--zoom').click();
  await expect(page.locator('.pswp')).toHaveClass(/pswp--zoomed-in/);
});
test('PHOTO-10/13: Escape and close button restore the exact trigger focus', async ({page}) => {
  await page.goto('/photos/');
  for (const selector of ['.photos-open','.photos-archive a']) {
    const link=page.locator(selector).first();
    await link.click(); await expect(page.locator('.pswp')).toHaveClass(/pswp--open/);
    await page.keyboard.press('Escape');
    await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);
    await expect(link).toBeFocused();
    await link.click(); await page.locator('.pswp__button--close').click();
    await expect(link).toBeFocused();
  }
});
test('PHOTO-15: reduced motion removes viewer opening/closing transitions', async ({page}) => {
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/photos/');
  // Capture actual PhotoSwipe options while retaining the real viewer.
  await page.evaluate(() => { const Original=window.PhotoSwipe; window.PhotoSwipe=function(...args) { window.viewerOptions=args[3]; return new Original(...args); }; });
  await page.locator('.photos-archive a').first().click();
  await current(page,photos[0].src);
  expect(await page.evaluate(() => [viewerOptions.showAnimationDuration,viewerOptions.hideAnimationDuration])).toEqual([0,0]);
  await page.keyboard.press('Escape');
  await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);
});
test('PHOTO-09: legacy uppercase dimensions are normalized', async ({page}) => {
  await page.goto('/photos/');
  await page.locator('.photos-archive a').first().evaluate(a => a.dataset.size=a.dataset.size.replace('x','X'));
  await page.evaluate(() => { const Original=window.PhotoSwipe; window.PhotoSwipe=function(...args) { window.viewerItem=args[2][0]; return new Original(...args); }; });
  await page.locator('.photos-archive a').first().click();
  expect(await page.evaluate(() => [viewerItem.w,viewerItem.h])).toEqual([photos[0].width,photos[0].height]);
});
