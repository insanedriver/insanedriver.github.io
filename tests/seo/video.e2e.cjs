const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const videos = require('../../_data/videos.json');

// Every song page, with the video whose slug equals the song slug (SONG-11), if any.
const kebab = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SONGS = ['insane-driver', 'silicon-fortress'].flatMap(a => catalog.albums.find(x => x.slug === a).tracks.map(t => {
  const slug = kebab(t.title);
  return { url: `/discography/${a}/${slug}/`, video: videos.find(v => v.slug === slug) || null };
}));
const withVideo = SONGS.filter(s => s.video);
const GHOSTS = SONGS.find(s => s.url === '/discography/silicon-fortress/ghosts/');
const YOUTUBE = /(^|\.)(youtube\.com|youtube-nocookie\.com)$/;

const videoObjects = page => page.locator('script[type="application/ld+json"]')
  .evaluateAll(els => els.map(el => JSON.parse(el.textContent)).filter(d => d['@type'] === 'VideoObject'));

test('the catalog has songs with and without a video', () => {
  expect(withVideo.length).toBeGreaterThan(0);
  expect(SONGS.length - withVideo.length).toBeGreaterThan(0);
  expect(GHOSTS.video).not.toBeNull();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const s of SONGS) {
    if (s.video) {
      test(`SONG-11/14/15: ${s.url} shows a facade linking to the watch page, and a VideoObject`, async ({ page }) => {
        await page.goto(s.url);
        const { id, title, uploadDate } = s.video;
        // SONG-11: thumbnail and an accessible name containing the video title.
        const facade = page.locator('[data-song-video]');
        await expect(facade).toHaveCount(1);
        await expect(facade).toBeVisible();
        await expect(facade.locator('img')).toHaveAttribute('src', `https://i.ytimg.com/vi/${id}/hqdefault.jpg`);
        const name = await facade.evaluate(el => el.textContent.replace(/\s+/g, ' ').trim());
        expect(name).toContain(title);
        await expect(page.getByRole('link', { name: title })).toHaveCount(1);
        // SONG-14: without JavaScript it is a link to the YouTube watch page.
        await expect(facade).toHaveAttribute('href', `https://www.youtube.com/watch?v=${id}`);
        expect(await facade.evaluate(el => el.tagName)).toBe('A');
        // (The GTM <noscript> iframe is the only one without JavaScript.)
        await expect(page.locator('iframe[src*="youtube"]')).toHaveCount(0);
        // SONG-15: VideoObject with name, thumbnailUrl, uploadDate and embedUrl.
        const blocks = await videoObjects(page);
        expect(blocks).toHaveLength(1);
        expect(blocks[0]).toMatchObject({
          name: title,
          thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          uploadDate,
          embedUrl: `https://www.youtube-nocookie.com/embed/${id}`,
        });
      });
    } else {
      test(`edge case: ${s.url} has no video facade and no VideoObject`, async ({ page }) => {
        await page.goto(s.url);
        await expect(page.locator('[data-song-video]')).toHaveCount(0);
        expect(await videoObjects(page)).toEqual([]);
      });
    }
  }
});

test('SONG-12: before activation there is no iframe and no request to YouTube', async ({ page }) => {
  const hits = [];
  page.on('request', req => { if (YOUTUBE.test(new URL(req.url()).hostname)) hits.push(req.url()); });
  await page.goto(GHOSTS.url, { waitUntil: 'load' });
  await page.waitForTimeout(500);
  await expect(page.locator('[data-song-video]')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
  expect(hits).toEqual([]);
});

test('SONG-13: activating the facade replaces it with an autoplay youtube-nocookie embed', async ({ page }) => {
  const hits = [];
  page.on('request', req => { if (YOUTUBE.test(new URL(req.url()).hostname)) hits.push(req.url()); });
  await page.goto(GHOSTS.url, { waitUntil: 'load' });
  await page.locator('[data-song-video]').click();
  const frame = page.locator('iframe');
  await expect(frame).toHaveCount(1);
  await expect(frame).toHaveAttribute('src', `https://www.youtube-nocookie.com/embed/${GHOSTS.video.id}?autoplay=1`);
  await expect(frame).toHaveAttribute('allow', /autoplay/);
  await expect(frame).toHaveAttribute('title', GHOSTS.video.title);
  await expect(page.locator('[data-song-video]')).toHaveCount(0);
  // The click did not navigate away (no new page, same URL).
  expect(new URL(page.url()).pathname).toBe(GHOSTS.url);
  expect(page.context().pages()).toHaveLength(1);
  expect(hits.some(u => u.startsWith(`https://www.youtube-nocookie.com/embed/${GHOSTS.video.id}`))).toBe(true);
});
