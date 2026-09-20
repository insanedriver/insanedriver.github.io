const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const platforms = require('../../_data/platforms.json');

const albums = catalog.albums;
const mmss = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const iso = s => `PT${Math.floor(s / 60)}M${s % 60}S`;

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('DISC-29: every album ships a tracklist disclosure that starts closed', async ({ page }) => {
    await page.goto('/discography/');
    const details = page.locator('[data-disc-tracklist]');
    await expect(details).toHaveCount(albums.length);
    expect(await details.evaluateAll(els => els.map(el => el.open))).toEqual(albums.map(() => false));
  });

  test('DISC-30: each tracklist lists every track with position and m:ss duration', async ({ page }) => {
    await page.goto('/discography/');
    for (const album of albums) {
      const rows = page.locator(`[data-disc-tracklist="${album.slug}"] [data-disc-track]`);
      await expect(rows).toHaveCount(album.tracks.length);
      const got = await rows.evaluateAll(els => els.map(el => [
        el.querySelector('.disc-track-pos').textContent.trim(),
        el.querySelector('.disc-track-title').textContent.trim(),
        el.querySelector('.disc-track-time').textContent.trim(),
      ]));
      expect(got).toEqual(album.tracks.map(t => [
        String(t.position).padStart(2, '0'), t.title, mmss(t.duration),
      ]));
    }
  });

  test('DISC-29: the disclosure opens without JavaScript', async ({ page }) => {
    await page.goto('/discography/');
    const details = page.locator('[data-disc-tracklist="silicon-fortress"]');
    await expect(details.locator('[data-disc-track]').first()).toBeHidden();
    await details.locator('summary').click();
    await expect(details).toHaveJSProperty('open', true);
    await expect(details.locator('[data-disc-track]').first()).toBeVisible();
  });

  test('DISC-31: one MusicAlbum block per album, each valid JSON with the album facts', async ({ page }) => {
    await page.goto('/discography/');
    const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll(els => els.map(el => el.textContent));
    expect(blocks).toHaveLength(albums.length);
    blocks.forEach((raw, i) => {
      const data = JSON.parse(raw);
      const album = albums[i];
      expect(data['@type']).toBe('MusicAlbum');
      expect(data.name).toBe(album.title);
      expect(data.datePublished).toBe(album.releaseDate);
      expect(data.numTracks).toBe(album.tracks.length);
      expect(data.byArtist.name).toBe('Insane Driver');
      expect(data.image).toBe(`https://insanedriver.com.br/assets/images/releases/${album.cover}`);
    });
  });

  test('DISC-32: sameAs lists exactly the album platform URLs that exist', async ({ page }) => {
    await page.goto('/discography/');
    const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll(els => els.map(el => el.textContent));
    blocks.forEach((raw, i) => {
      const expected = platforms.map(p => albums[i].links[p.key]).filter(Boolean);
      expect(JSON.parse(raw).sameAs).toEqual(expected);
    });
  });

  test('DISC-31: every track is a MusicRecording with position and ISO 8601 duration', async ({ page }) => {
    await page.goto('/discography/');
    const blocks = await page.locator('script[type="application/ld+json"]').evaluateAll(els => els.map(el => el.textContent));
    blocks.forEach((raw, i) => {
      const tracks = JSON.parse(raw).track;
      expect(tracks.map(t => [t['@type'], t.name, t.position, t.duration]))
        .toEqual(albums[i].tracks.map(t => ['MusicRecording', t.title, t.position, iso(t.duration)]));
    });
  });

  test('DISC-33: every cover is served from the repo, never a third-party CDN', async ({ page }) => {
    await page.goto('/discography/');
    const srcs = await page.locator('.disc-release-art img').evaluateAll(els => els.map(el => el.getAttribute('src')));
    expect(srcs).toEqual(albums.map(a => `/assets/images/releases/${a.cover}`));
  });

  test('DISC-34: covers declare their intrinsic size and lazy-load below the first', async ({ page }) => {
    await page.goto('/discography/');
    const attrs = await page.locator('.disc-release-art img')
      .evaluateAll(els => els.map(el => [el.getAttribute('width'), el.getAttribute('height'), el.getAttribute('loading')]));
    expect(attrs[0]).toEqual(['600', '600', null]);
    for (const a of attrs.slice(1)) expect(a).toEqual(['600', '600', 'lazy']);
  });
});
