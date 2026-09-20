const { test, expect } = require('../photos/browser.cjs');
const { stubYouTube } = require('./yt-stub.cjs');
const videos = require('../../_data/videos.json');

const counter = page => page.locator('[data-idtv-counter]');
const cardAt = (page, i) => page.locator('[data-idtv-card]').nth(i);

test('VPLR-29: a matching #slug shows that video as a poster without embedding or autoplay', async ({ page }) => {
  const api = await stubYouTube(page);
  await page.goto('/videos/#tide-of-fears');
  await expect(counter(page)).toHaveText('09 / 10');
  await expect(page.locator('[data-idtv-now]')).toHaveText('Tide Of Fears (Acoustic Version)');
  await expect(cardAt(page, 8)).toHaveAttribute('aria-current', 'true');
  await expect(page.locator('[data-idtv-card][aria-current="true"]')).toHaveCount(1);
  await expect(page.locator('[data-idtv-poster-img]')).toHaveAttribute('src', `https://i.ytimg.com/vi/${videos[8].id}/hqdefault.jpg`);
  await expect(page.locator('.videos-shell iframe')).toHaveCount(0);
  expect(api.requests).toBe(0);
});

for (const hash of ['', '#', '#nope', '#Ghosts']) {
  test(`VPLR-11: hash "${hash}" shows the first video and leaves the URL as loaded`, async ({ page }) => {
    await page.goto('/videos/' + hash);
    const loaded = page.url();
    await expect(counter(page)).toHaveText('01 / 10');
    await expect(cardAt(page, 0)).toHaveAttribute('aria-current', 'true');
    expect(page.url()).toBe(loaded);
  });
}

test('VPLR-28: selecting a video writes #slug with replaceState and adds no history entry', async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/');
  const before = await page.evaluate(() => history.length);
  await cardAt(page, 1).click();
  await expect.poll(() => new URL(page.url()).hash).toBe('#ghosts');
  await page.getByRole('button', { name: 'Next video', exact: true }).click();
  await expect.poll(() => new URL(page.url()).hash).toBe('#distant-hearts');
  expect(await page.evaluate(() => history.length)).toBe(before);
});

test('VPLR-28/12: NEXT from #tide-of-fears walks to #change then wraps to #keep-away', async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/#tide-of-fears');
  const nextButton = page.getByRole('button', { name: 'Next video', exact: true });
  await nextButton.click();
  await expect.poll(() => new URL(page.url()).hash).toBe('#change');
  await nextButton.click();
  await expect.poll(() => new URL(page.url()).hash).toBe('#keep-away');
  await expect(counter(page)).toHaveText('01 / 10');
});

test('VPLR-27: ArrowRight and ArrowLeft act as NEXT and PREV with focus on a player control', async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/');
  await page.locator('[data-idtv-next]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('02 / 10');
  await page.keyboard.press('ArrowLeft');
  await expect(counter(page)).toHaveText('01 / 10');
});

test('VPLR-27: arrow keys also work with focus on a feed card', async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/');
  await cardAt(page, 0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(counter(page)).toHaveText('02 / 10');
});

test('VPLR-27: arrow keys do nothing with focus outside the player section', async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/');
  await page.locator('.menu-font').first().focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowLeft');
  await expect(counter(page)).toHaveText('01 / 10');
  await expect(page.locator('.videos-shell iframe')).toHaveCount(0);
});
