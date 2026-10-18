const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const platforms = require('../../_data/platforms.json');
const copy = require('../../_data/songs.json').releases;

const ORIGIN = 'https://insanedriver.com.br';
const FANS_OF = 'For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold';

// REL-01: the release pages, and no others.
const PAGES = ['silicon-fortress', 'insane-driver', 'insane-driver-deluxe', 'waiting-for-you',
  'the-sun-will-rise', 'today-is-sunday-eder-franco', 'change-live'];
const all = [...catalog.albums, ...catalog.singles];
const release = slug => all.find(r => r.slug === slug);
const isAlbum = r => r.type !== 'SINGLE';

// Song pages live under the studio album the song first appeared on (spec Assumptions):
// a Silicon Fortress track under silicon-fortress, a 2016 or deluxe track under insane-driver.
// Version suffixes are stripped to find the song.
const kebab = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const songSlug = t => kebab(t.replace(/\s*\((Deluxe Version|Acoustic Version|Acoustic)\)\s*$/i, ''));
const songUrl = (album, title) => `/discography/${album.slug === 'silicon-fortress' ? 'silicon-fortress' : 'insane-driver'}/${songSlug(title)}/`;
const iso = s => `PT${Math.floor(s / 60)}M${s % 60}S`;

const jsonLd = page => page.locator('script[type="application/ld+json"]')
  .evaluateAll(els => els.map(el => JSON.parse(el.textContent)));

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('REL-01: no release outside the list gets a page', async ({ page }) => {
    for (const r of all.filter(r => !PAGES.includes(r.slug))) {
      const res = await page.goto(`/discography/${r.slug}/`);
      expect(res.status(), r.slug).toBe(404);
    }
  });

  for (const slug of PAGES) {
    const r = release(slug);
    const url = `/discography/${slug}/`;

    test(`REL-01/02/04, GEN-05: ${url} shows the release, its cover, year, type, description and links`, async ({ page }) => {
      const res = await page.goto(url);
      expect(res.status()).toBe(200);

      // REL-02: one h1 with the release title, the cover, year and type, a description paragraph.
      const h1 = page.locator('h1');
      await expect(h1).toHaveCount(1);
      await expect(h1).toHaveText(r.title);
      const cover = page.locator(`img[alt="${r.title} cover"]`);
      await expect(cover).toHaveCount(1);
      await expect(cover).toHaveAttribute('src', `/assets/images/releases/${r.cover}`);
      await expect(cover).toBeVisible();
      const type = { ALBUM: 'Album', DELUXE: 'Deluxe edition', SINGLE: 'Single' }[r.type];
      await expect(page.locator('[data-release-meta]')).toHaveText(`${type} // ${r.year}`);
      const description = page.locator('p[data-release-description]');
      await expect(description).toHaveText(copy[slug]);
      await expect(description).toBeVisible();

      // REL-04 + edge case: every platform with a URL, none for a null one.
      const linkKeys = await page.locator('[data-disc-link]').evaluateAll(els => els.map(el => [el.dataset.discLink, el.getAttribute('href')]));
      expect(linkKeys).toEqual(platforms.filter(p => r.links[p.key]).sort((a, b) => b.primary - a.primary).map(p => [p.key, r.links[p.key]]));

      // GEN-05
      await expect(page.getByText(FANS_OF, { exact: true })).toBeVisible();
    });

    if (isAlbum(r)) {
      test(`REL-03/05: ${url} lists every track in order, linked to its song page, and has one MusicAlbum`, async ({ page }) => {
        await page.goto(url);
        const rows = await page.locator('[data-release-tracks] li').evaluateAll(els => els.map(el => {
          const a = el.querySelector('a');
          return [a.textContent.trim(), a.getAttribute('href')];
        }));
        expect(rows).toEqual(r.tracks.map(t => [t.title, songUrl(r, t.title)]));

        const albums = (await jsonLd(page)).filter(d => d['@type'] === 'MusicAlbum');
        expect(albums).toHaveLength(1);
        const [a] = albums;
        expect(a.name).toBe(r.title);
        expect(a.url).toBe(ORIGIN + url);
        expect(a.datePublished).toBe(r.releaseDate);
        expect(a.numTracks).toBe(r.tracks.length);
        expect(a.byArtist).toMatchObject({ '@type': 'MusicGroup', name: 'Insane Driver' });
        expect(a.image).toBe(`${ORIGIN}/assets/images/releases/${r.cover}`);
        expect(a.genre).toEqual(['Hard Rock', 'Heavy Metal', 'Metalcore']);
        expect(a.track.map(t => [t['@type'], t.name, t.position, t.duration, t.url]))
          .toEqual(r.tracks.map(t => ['MusicRecording', t.title, t.position, iso(t.duration), ORIGIN + songUrl(r, t.title)]));
      });
    }
  }

  test('REL-03: a track link opens its song page', async ({ page }) => {
    await page.goto('/discography/silicon-fortress/');
    await page.locator('[data-release-tracks] a', { hasText: 'Faceless Demons' }).click();
    await expect(page).toHaveURL(/\/discography\/silicon-fortress\/faceless-demons\/$/);
  });

  for (const [slug, song, href] of [
    ['today-is-sunday-eder-franco', 'Today Is Sunday', '/discography/insane-driver/today-is-sunday/'],
    ['change-live', 'Change', '/discography/insane-driver/change/'],
  ]) {
    test(`REL-06: /discography/${slug}/ links to the ${song} song page`, async ({ page }) => {
      await page.goto(`/discography/${slug}/`);
      const link = page.locator(`a[href="${href}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toHaveText(song);
    });
  }
});
