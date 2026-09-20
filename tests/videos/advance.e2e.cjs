const { test, expect } = require('../photos/browser.cjs');
const { stubYouTube } = require('./yt-stub.cjs');
const videos = require('../../_data/videos.json');

const counter = page => page.locator('[data-idtv-counter]');
const iframe = page => page.locator('.videos-shell iframe');
const cardAt = (page, i) => page.locator('[data-idtv-card]').nth(i);
const next = page => page.getByRole('button', { name: 'Next video', exact: true });
const prev = page => page.getByRole('button', { name: 'Previous video', exact: true });
const auto = page => page.locator('[data-idtv-auto]');

test.beforeEach(async ({ page }) => {
  await stubYouTube(page);
  await page.goto('/videos/');
});

test('VPLR-12: NEXT selects the following video and starts it', async ({ page }) => {
  await next(page).click();
  await expect(counter(page)).toHaveText('02 / 10');
  await expect(iframe(page)).toHaveAttribute('data-video-id', videos[1].id);
});

test('VPLR-12: NEXT wraps from the last video to the first', async ({ page }) => {
  await cardAt(page, 9).click();
  await expect(counter(page)).toHaveText('10 / 10');
  await next(page).click();
  await expect(counter(page)).toHaveText('01 / 10');
  await expect(iframe(page)).toHaveAttribute('data-video-id', videos[0].id);
});

test('VPLR-12: PREV wraps from the first video to the last and starts it', async ({ page }) => {
  await prev(page).click();
  await expect(counter(page)).toHaveText('10 / 10');
  await expect(iframe(page)).toHaveAttribute('data-video-id', videos[9].id);
});

test('VPLR-12: PREV moves back one video', async ({ page }) => {
  await cardAt(page, 4).click();
  await prev(page).click();
  await expect(counter(page)).toHaveText('04 / 10');
  await expect(iframe(page)).toHaveAttribute('data-video-id', videos[3].id);
});

test('VPLR-26: AUTO is pressed on load and flips on each activation', async ({ page }) => {
  await expect(auto(page)).toHaveAttribute('aria-pressed', 'true');
  await auto(page).click();
  await expect(auto(page)).toHaveAttribute('aria-pressed', 'false');
  await auto(page).click();
  await expect(auto(page)).toHaveAttribute('aria-pressed', 'true');
});

test('VPLR-13: with AUTO on, the end of a video selects and starts the next one', async ({ page }) => {
  await page.locator('[data-idtv-play]').click();
  await expect(iframe(page)).toHaveCount(1);
  await page.evaluate(() => window.__ytEnd());
  await expect(counter(page)).toHaveText('02 / 10');
  await expect(iframe(page)).toHaveAttribute('data-video-id', videos[1].id);
  await expect(cardAt(page, 1)).toHaveAttribute('aria-current', 'true');
});

test('VPLR-13: with AUTO on, the end of the last video wraps to the first', async ({ page }) => {
  await cardAt(page, 9).click();
  await expect(iframe(page)).toHaveCount(1);
  await page.evaluate(() => window.__ytEnd());
  await expect(counter(page)).toHaveText('01 / 10');
  await expect(iframe(page)).toHaveAttribute('data-video-id', videos[0].id);
});

test('VPLR-25: with AUTO off, the end of a video changes nothing and loads nothing', async ({ page }) => {
  await page.locator('[data-idtv-play]').click();
  await expect(iframe(page)).toHaveCount(1);
  await auto(page).click();
  await page.evaluate(() => window.__ytEnd());
  await page.waitForTimeout(300);
  await expect(counter(page)).toHaveText('01 / 10');
  await expect(iframe(page)).toHaveAttribute('data-video-id', videos[0].id);
  expect(await page.evaluate(() => window.__yt.loads)).toEqual([]);
});
