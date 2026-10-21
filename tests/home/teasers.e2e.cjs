const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const videos = require('../../_data/videos.json');
const highlights = require('../../_data/highlights.js')();
const { panelByTab, loaderGone } = require('./helpers.cjs');

const video = videos[0];

async function assertTeasers(page) {
  const vid = panelByTab(page, 'ID-TV::LATEST').locator('[data-home-teaser="video"]');
  await expect(vid).toHaveCount(1);
  await expect(vid).toHaveAttribute('href', '/videos/#keep-away');
  await expect(vid).toHaveAttribute('data-home-slug', video.slug);
  const poster = vid.locator('img');
  await expect(poster).toHaveAttribute('src', `https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`);
  await expect(poster).toHaveAttribute('loading', 'lazy');
  await expect(vid.locator('.home-video-title')).toHaveText('Keep Away [Official Music Video]');

  const albums = panelByTab(page, 'DISC::ARCHIVE').locator('[data-home-teaser="album"]');
  await expect(albums).toHaveCount(3);
  expect(await albums.evaluateAll(els => els.map(el => el.getAttribute('href'))))
    .toEqual(['/discography/silicon-fortress/', '/discography/insane-driver-deluxe/', '/discography/insane-driver/']);
  for (let i = 0; i < catalog.albums.length; i++) {
    const a = catalog.albums[i];
    const item = albums.nth(i);
    await expect(item.locator('img')).toHaveAttribute('src', `/assets/images/releases/${a.cover}`);
    await expect(item.locator('.home-archive-title')).toHaveText(a.title);
    await expect(item.locator('.home-archive-year')).toHaveText(String(a.year));
  }

  const visual = panelByTab(page, 'VISUAL::FEED');
  const thumbs = visual.locator('img');
  await expect(thumbs).toHaveCount(6);
  expect(await thumbs.evaluateAll(els => els.map(el => [el.getAttribute('src'), el.getAttribute('alt'), el.getAttribute('loading')])))
    .toEqual(highlights.map(p => [p.thumbnail, p.alt, 'lazy']));
  await expect(visual.locator('a[href="/photos/"][data-home-teaser="photos"]')).toHaveCount(1);
}

test('HOME-40/41/42: the video, album and photo teasers render from the data files', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await assertTeasers(page);
});

test('HOME-40: the video teaser opens ID-TV on that video', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await loaderGone(page);
  await panelByTab(page, 'ID-TV::LATEST').locator('[data-home-teaser="video"]').click();
  await expect(page).toHaveURL(/\/videos\/#keep-away$/);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('HOME-43: every teaser is a plain anchor that exists without JavaScript', async ({ page }) => {
    await page.goto('/');
    await assertTeasers(page);
  });
});
