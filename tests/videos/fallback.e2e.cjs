const { test, expect } = require('../photos/browser.cjs');
const { stubYouTube } = require('./yt-stub.cjs');
const videos = require('../../_data/videos.json');

const fallback = page => page.locator('[data-idtv-fallback]');
const link = page => page.locator('[data-idtv-fallback-link]');
const cardAt = (page, i) => page.locator('[data-idtv-card]').nth(i);

test('VPLR-14: a blocked IFrame API shows the message and a watch link to the current video', async ({ page }) => {
  await stubYouTube(page, { mode: 'abort' });
  await page.goto('/videos/');
  await expect(fallback(page)).toBeHidden();
  await page.locator('[data-idtv-play]').click();
  await expect(fallback(page)).toBeVisible();
  await expect(fallback(page)).toContainText('YouTube unavailable');
  await expect(link(page)).toHaveText('Watch on YouTube');
  await expect(link(page)).toHaveAttribute('href', `https://www.youtube.com/watch?v=${videos[0].id}`);
  await expect(page.locator('[data-idtv-poster]')).toBeVisible();
  await expect(page.locator('.videos-shell iframe')).toHaveCount(0);
});

test('VPLR-14: an API that never becomes ready fails after 8 seconds, not before', async ({ page }) => {
  await page.clock.install();
  await stubYouTube(page, { mode: 'never' });
  await page.goto('/videos/');
  await page.locator('[data-idtv-play]').click();
  await page.clock.runFor(7900);
  await expect(fallback(page)).toBeHidden();
  await page.clock.runFor(200);
  await expect(fallback(page)).toBeVisible();
  await expect(link(page)).toHaveAttribute('href', `https://www.youtube.com/watch?v=${videos[0].id}`);
});

test('VPLR-15: while the message shows, the feed stays interactive and the link follows the selection', async ({ page }) => {
  await stubYouTube(page, { mode: 'abort' });
  await page.goto('/videos/');
  await page.locator('[data-idtv-play]').click();
  await expect(fallback(page)).toBeVisible();
  await cardAt(page, 3).click();
  await expect(page.locator('[data-idtv-counter]')).toHaveText('04 / 10');
  await expect(fallback(page)).toBeVisible();
  await expect(link(page)).toHaveAttribute('href', `https://www.youtube.com/watch?v=${videos[3].id}`);
  await page.getByRole('button', { name: 'Next video', exact: true }).click();
  await expect(link(page)).toHaveAttribute('href', `https://www.youtube.com/watch?v=${videos[4].id}`);
});

test('VPLR-14/15: a player error shows the message for that video and selecting another retries', async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/');
  await page.locator('[data-idtv-play]').click();
  await expect(page.locator('.videos-shell iframe')).toHaveCount(1);
  await page.evaluate(() => window.__ytError());
  await expect(fallback(page)).toBeVisible();
  await expect(page.locator('[data-idtv-poster]')).toBeVisible();
  await expect(link(page)).toHaveAttribute('href', `https://www.youtube.com/watch?v=${videos[0].id}`);
  await cardAt(page, 2).click();
  await expect(fallback(page)).toBeHidden();
  await expect(page.locator('.videos-shell iframe')).toHaveAttribute('data-video-id', videos[2].id);
});
