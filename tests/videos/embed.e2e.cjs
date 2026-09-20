const { test, expect } = require('../photos/browser.cjs');
const { stubYouTube } = require('./yt-stub.cjs');
const videos = require('../../_data/videos.json');

const iframes = page => page.locator('.videos-shell iframe');
const cardAt = (page, i) => page.locator('[data-idtv-card]').nth(i);

test('VPLR-07: play loads one nocookie iframe for the selected video and autoplays', async ({ page }) => {
  const api = await stubYouTube(page);
  await page.goto('/videos/');
  expect(api.requests).toBe(0);
  await page.locator('[data-idtv-play]').click();
  await expect(iframes(page)).toHaveCount(1);
  await expect(iframes(page)).toHaveAttribute('src', new RegExp(`^https://www\\.youtube-nocookie\\.com/embed/${videos[0].id}`));
  expect(await page.evaluate(() => window.__yt.configs[0].playerVars.autoplay)).toBe(1);
  await expect(page.locator('[data-idtv-poster]')).toBeHidden();
  expect(api.requests).toBe(1);
});

test('VPLR-08: clicking a card before any play embeds that video and starts it', async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/');
  await cardAt(page, 2).click();
  await expect(iframes(page)).toHaveCount(1);
  await expect(iframes(page)).toHaveAttribute('data-video-id', videos[2].id);
});

test('VPLR-07/08: clicking another card reuses the player and loads the new video', async ({ page }) => {
  const api = await stubYouTube(page);
  await page.goto('/videos/');
  await page.locator('[data-idtv-play]').click();
  await expect(iframes(page)).toHaveCount(1);
  await cardAt(page, 4).click();
  await expect(iframes(page)).toHaveAttribute('data-video-id', videos[4].id);
  await expect(iframes(page)).toHaveCount(1);
  expect(await page.evaluate(() => window.__yt.loads)).toEqual([videos[4].id]);
  expect(await page.evaluate(() => window.__yt.players.length)).toBe(1);
  expect(api.requests).toBe(1);
});

test('VPLR-10: rapid selections while the API is still loading end on the last card with one iframe', async ({ page }) => {
  await stubYouTube(page, { delayMs: 400 });
  await page.goto('/videos/');
  await page.evaluate(() => {
    for (const i of [1, 2, 3, 4, 5]) document.querySelectorAll('[data-idtv-card]')[i].click();
  });
  await expect(iframes(page)).toHaveCount(1);
  await expect(iframes(page)).toHaveAttribute('data-video-id', videos[5].id);
  await expect(page.locator('[data-idtv-counter]')).toHaveText('06 / 10');
  expect(await page.evaluate(() => window.__yt.players.length)).toBe(1);
});

test('VPLR-10: rapid selections after the player exists end on the last card with one iframe', async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/');
  await page.locator('[data-idtv-play]').click();
  await expect(iframes(page)).toHaveCount(1);
  await page.evaluate(() => {
    for (const i of [1, 2, 3, 4, 5]) document.querySelectorAll('[data-idtv-card]')[i].click();
  });
  await expect(iframes(page)).toHaveAttribute('data-video-id', videos[5].id);
  await expect(iframes(page)).toHaveCount(1);
});
