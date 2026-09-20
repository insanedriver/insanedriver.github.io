const { test, expect } = require('./browser.cjs');
const counter = page => page.locator('[data-photo-counter]');
test.beforeEach(async ({page}) => { await page.goto('/photos/'); });
test('PHOTO-04: next wraps from sixth to first', async ({page}) => {
  for (let n=2;n<=6;n++) { await page.getByRole('button',{name:'Next highlight',exact:true}).click(); await expect(counter(page)).toHaveText(`0${n} / 06`); }
  await page.getByRole('button',{name:'Next highlight',exact:true}).click();
  await expect(counter(page)).toHaveText('01 / 06');
});
test('PHOTO-05: previous wraps from first to sixth', async ({page}) => {
  await page.getByRole('button',{name:'Previous highlight',exact:true}).click();
  await expect(counter(page)).toHaveText('06 / 06');
});
test('PHOTO-06: thumbnail selects matching image and accessible state', async ({page}) => {
  await page.locator('[data-photo-select="3"]').click();
  await expect(counter(page)).toHaveText('04 / 06');
  await expect(page.locator('[data-photo-slide]').nth(3)).toBeVisible();
  await expect(page.locator('[data-photo-select="3"]')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('[data-photo-select][aria-pressed="true"]')).toHaveCount(1);
});
test('PHOTO-12: arrow keys operate only with carousel focus', async ({page}) => {
  await page.locator('[data-photo-next]').focus();
  await page.keyboard.press('ArrowRight'); await expect(counter(page)).toHaveText('02 / 06');
  await page.keyboard.press('ArrowLeft'); await expect(counter(page)).toHaveText('01 / 06');
  await page.locator('.photos-archive a').first().focus();
  await page.keyboard.press('ArrowRight'); await expect(counter(page)).toHaveText('01 / 06');
});
async function gesture(page, dx, dy) {
  const stage=page.locator('[data-photo-stage]');
  await stage.dispatchEvent('pointerdown',{pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:150,clientY:200});
  await stage.dispatchEvent('pointerup',{pointerId:1,pointerType:'touch',isPrimary:true,button:0,clientX:150+dx,clientY:200+dy});
}
test('PHOTO-07: horizontal swipe of 40px selects once and suppresses opening', async ({page}) => {
  await gesture(page,-40,0); await expect(counter(page)).toHaveText('02 / 06');
  await page.locator('[data-photo-slide]:not([hidden]) a').dispatchEvent('click');
  await expect(page).toHaveURL(/\/photos\/$/);
  await expect(page.locator('.pswp')).not.toHaveClass(/pswp--open/);
  await gesture(page,40,0); await expect(counter(page)).toHaveText('01 / 06');
});
test('PHOTO-07: vertical and short gestures retain selection', async ({page}) => {
  await gesture(page,-50,80); await expect(counter(page)).toHaveText('01 / 06');
  await gesture(page,-39,0); await expect(counter(page)).toHaveText('01 / 06');
});
test('PHOTO-08: no automatic advancement while idle', async ({page}) => {
  await page.clock.install();
  await page.clock.fastForward(120000);
  await expect(counter(page)).toHaveText('01 / 06');
});
