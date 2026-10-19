const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const platforms = require('../../_data/platforms.json');
const songData = require('../../_data/songs.json').songs;

const ORIGIN = 'https://insanedriver.com.br';
const DOCS = path.join(__dirname, '../../docs');
const FANS_OF = 'For fans of Alter Bridge, Killswitch Engage and Avenged Sevenfold';

// SONG-01: one page per track of the two studio albums, at /discography/<album>/<kebab title>/.
const kebab = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const songSlug = t => kebab(t.replace(/\s*\((Deluxe Version|Acoustic Version|Acoustic)\)\s*$/i, ''));
const album = slug => catalog.albums.find(a => a.slug === slug);
const SONGS = ['insane-driver', 'silicon-fortress'].flatMap(a => album(a).tracks.map(t => ({
  album: album(a), track: t, slug: songSlug(t.title), url: `/discography/${a}/${songSlug(t.title)}/`,
})));
const iso = s => `PT${Math.floor(s / 60)}M${s % 60}S`;
// The song's own single (same title) lends its cover; otherwise the album's.
const coverOf = s => (catalog.singles.find(x => kebab(x.title) === s.slug) || s.album).cover;
const norm = line => line.replace(/\s+/g, ' ').trim();
const linksOf = release => platforms.filter(p => release.links[p.key]).map(p => release.links[p.key]);

// The lyrics file read as the page should show it: labels without brackets, then the lines.
const lyricsFile = s => path.join(__dirname, '../../_data/lyrics', s.album.slug, `${s.slug}.txt`);
const expectedSequence = text => text.split('\n').map(norm).filter(Boolean)
  .map(line => (/^\[.+\]$/.test(line) ? { label: line.slice(1, -1) } : { line }));

// SONG-08: the spec's single-to-song mapping, recomputed here from discography.json.
const DISTINCT = { 'today-is-sunday-eder-franco': 'today-is-sunday', 'change-live': 'change', 'fallen-dreams-acoustic': 'fallen-dreams' };
const alsoReleasedAs = s => {
  const out = [];
  for (const single of catalog.singles) {
    if (DISTINCT[single.slug] === s.slug) out.push([single.title, String(single.year), `/discography/${single.slug}/`, []]);
    else if (!DISTINCT[single.slug] && kebab(single.title.replace(/\s*\(Acoustic\)\s*$/, '')) === s.slug) {
      out.push([single.title, String(single.year), null, linksOf(single)]);
    }
  }
  const deluxe = album('insane-driver-deluxe');
  if (s.album.slug === 'insane-driver') out.push([deluxe.title, String(deluxe.year), '/discography/insane-driver-deluxe/', []]);
  return out.sort();
};

const jsonLd = page => page.locator('script[type="application/ld+json"]')
  .evaluateAll(els => els.map(el => JSON.parse(el.textContent)));

test('SONG-07: songs.json holds real track URLs, not album URLs', () => {
  const ghosts = songData.find(d => d.slug === 'ghosts');
  expect(ghosts.links.spotify).toBe('https://open.spotify.com/track/59ejGVxNkLEPF4jT2CU7Tu');
  expect(ghosts.links.bandcamp).toBe('https://insanedriverid.bandcamp.com/track/ghosts-2');
  for (const d of songData) {
    expect(d.links.spotify, d.slug).toMatch(/^https:\/\/open\.spotify\.com\/track\/[A-Za-z0-9]{22}$/);
    expect(d.links.apple, d.slug).toMatch(/^https:\/\/music\.apple\.com\/us\/album\/[^?]+\?i=\d+$/);
    expect(d.links.deezer, d.slug).toMatch(/^https:\/\/www\.deezer\.com\/track\/\d+$/);
    expect(d.links.ytmusic, d.slug).toMatch(/^https:\/\/music\.youtube\.com\/watch\?v=[\w-]{11}&list=/);
  }
  for (const key of ['spotify', 'apple', 'ytmusic', 'deezer', 'bandcamp']) {
    const urls = songData.map(d => d.links[key]).filter(Boolean);
    expect(new Set(urls).size, key).toBe(urls.length);
  }
});

// Every track URL is pinned to the set checked against the live platforms (validation.md,
// passes 3 and 4): a swapped, shifted or re-pointed id on any platform fails here.
test('SONG-07: every track URL matches the live-checked fixture', () => {
  const fixture = require('./track-ids.fixture.json');
  expect(Object.keys(fixture).sort()).toEqual(songData.map(d => d.slug).sort());
  for (const d of songData) expect(d.links, d.slug).toEqual(fixture[d.slug]);
});

// Independent rules on top of the fixture, so it cannot drift on its own.
test('SONG-07: YT Music tracks play inside their album playlist, Bandcamp tracks carry the song slug', () => {
  for (const s of SONGS) {
    const d = songData.find(x => x.slug === s.slug);
    expect(new URL(d.links.ytmusic).searchParams.get('list'), s.slug).toBe(new URL(s.album.links.ytmusic).searchParams.get('list'));
    if (d.links.bandcamp) expect(d.links.bandcamp, s.slug).toMatch(new RegExp(`^https://insanedriverid\\.bandcamp\\.com/track/${s.slug}(-2)?$`));
  }
});

// Apple and Deezer number an album's tracks in order, and Apple's URL carries the song name.
test('SONG-07: Apple and Deezer track URLs belong to their song', () => {
  for (const a of ['insane-driver', 'silicon-fortress']) {
    const inOrder = SONGS.filter(s => s.album.slug === a).sort((x, y) => x.track.position - y.track.position)
      .map(s => songData.find(d => d.slug === s.slug));
    for (const d of inOrder) {
      expect(d.links.apple.split('/')[5], d.slug).toBe(d.slug);
      expect(d.links.apple, d.slug).toContain(`/${album(a).links.apple.split('/').pop()}?i=`);
    }
    for (const key of ['apple', 'deezer']) {
      const ids = inOrder.map(d => Number(d.links[key].match(/(\d+)$/)[1]));
      for (let i = 1; i < ids.length; i++) expect(ids[i], `${a} ${key} #${i + 1}`).toBeGreaterThan(ids[i - 1]);
    }
  }
});

test('SONG-01/02: the build has exactly the 22 song pages and the sitemap lists them', () => {
  const built = fs.readdirSync(path.join(DOCS, 'discography')).flatMap(dir => {
    const full = path.join(DOCS, 'discography', dir);
    return fs.statSync(full).isDirectory()
      ? fs.readdirSync(full).filter(sub => fs.existsSync(path.join(full, sub, 'index.html'))).map(sub => `/discography/${dir}/${sub}/`)
      : [];
  });
  expect(built.sort()).toEqual(SONGS.map(s => s.url).sort());
  expect(SONGS).toHaveLength(22);
  const locs = [...fs.readFileSync(path.join(DOCS, 'sitemap.xml'), 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  for (const s of SONGS) expect(locs).toContain(ORIGIN + s.url);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('SONG-02: versions, deluxe tracks and singles get no song page', async ({ page }) => {
    for (const url of [
      '/discography/insane-driver/tide-of-fears-acoustic/',
      '/discography/insane-driver/fallen-dreams-acoustic/',
      '/discography/silicon-fortress/keep-away-acoustic/',
      '/discography/insane-driver-deluxe/firstly-my-breakfast/',
      '/discography/insane-driver/today-is-sunday-eder-franco/',
      '/discography/insane-driver/change-live/',
      '/discography/keep-away/',
    ]) {
      expect((await page.goto(url)).status(), url).toBe(404);
    }
  });

  for (const s of SONGS) {
    const data = songData.find(d => d.slug === s.slug);

    test(`SONG-03..10, GEN-05: ${s.url}`, async ({ page }) => {
      expect((await page.goto(s.url)).status()).toBe(200);

      // SONG-03: one h1 with the song title and a link to the album's release page.
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(s.track.title);
      const albumLink = page.locator(`a[href="/discography/${s.album.slug}/"]`, { hasText: s.album.title });
      await expect(albumLink.first()).toBeVisible();

      // SEO-12 / SEO-13: the song title format and the page cover as og:image.
      await expect(page).toHaveTitle(`${s.track.title.replace(/\s*\((Deluxe Version|Acoustic Version|Acoustic)\)\s*$/i, '')} Lyrics – Insane Driver`);
      await expect(page.locator('meta[property="og:image"]'))
        .toHaveAttribute('content', `${ORIGIN}/assets/images/releases/${coverOf(s)}`);
      await expect(page.locator('.disc-release-art img')).toHaveAttribute('src', `/assets/images/releases/${coverOf(s)}`);

      // SONG-04 / SONG-05: the lyrics, section by section with the source line breaks, or "Instrumental".
      const lyrics = page.locator('[data-song-lyrics]');
      if (data.instrumental) {
        await expect(lyrics.locator('h2')).toHaveText('Instrumental');
        await expect(lyrics.locator('h3')).toHaveCount(0);
      } else {
        const text = fs.readFileSync(lyricsFile(s), 'utf8');
        const shown = await lyrics.evaluate(root => {
          const seq = [];
          for (const section of root.querySelectorAll('.song-lyrics-section')) {
            for (const el of section.children) {
              if (el.tagName === 'H3') seq.push({ label: el.textContent });
              if (el.tagName === 'P') {
                let cur = '';
                for (const node of el.childNodes) {
                  if (node.nodeName === 'BR') { seq.push({ line: cur }); cur = ''; } else cur += node.textContent;
                }
                seq.push({ line: cur });
              }
            }
          }
          return seq;
        });
        const clean = shown.map(e => (e.label !== undefined ? { label: norm(e.label) } : { line: norm(e.line) }))
          .filter(e => e.label !== undefined || e.line);
        expect(clean).toEqual(expectedSequence(text));
        // A sheet with no labels (Tears of Blood) renders no heading at all.
        if (expectedSequence(text).some(e => e.label)) await expect(lyrics.locator('h3').first()).toBeVisible();
        else await expect(lyrics.locator('h3')).toHaveCount(0);
        await expect(lyrics.locator('p:empty')).toHaveCount(0);
        await expect(lyrics).not.toContainText('Instrumental');
      }

      // SONG-06 + edge case: "About the song" only when the song has an About text.
      const aboutHeading = page.getByRole('heading', { name: 'About the song' });
      if (data.about) {
        await expect(aboutHeading).toBeVisible();
        await expect(page.locator('[data-song-about] p')).toHaveText(data.about);
      } else {
        await expect(aboutHeading).toHaveCount(0);
      }

      // SONG-07 + null-platform edge case: one link per album platform with a URL,
      // the track's own URL where songs.json has one, otherwise the album's.
      const links = await page.locator('[data-disc-link]').evaluateAll(els => els.map(el => [
        el.getAttribute('data-disc-link'), el.getAttribute('href'),
        el.querySelector('.cyber-link-sub') ? el.querySelector('.cyber-link-sub').textContent.trim() : null,
      ]));
      const track = data.links || {};
      expect(links).toEqual(platforms.filter(p => s.album.links[p.key]).map(p => [
        p.key, track[p.key] || s.album.links[p.key], p.primary ? (track[p.key] ? 'Play the track' : p.sub) : null,
      ]));
      for (const key of ['spotify', 'apple', 'ytmusic', 'deezer']) expect(track[key], `${s.slug} ${key}`).toBeTruthy();

      // SONG-08: "Also released as" with title, year and the release's own links or page.
      const also = alsoReleasedAs(s);
      if (also.length) {
        await expect(page.getByRole('heading', { name: 'Also released as' })).toBeVisible();
        const rows = await page.locator('[data-song-also] li').evaluateAll(els => els.map(el => [
          el.querySelector('.song-also-title').textContent.trim(),
          el.querySelector('.song-also-year').textContent.trim(),
          el.querySelector('.song-also-title a') ? el.querySelector('.song-also-title a').getAttribute('href') : null,
          [...el.querySelectorAll('.disc-single-links a')].map(a => a.getAttribute('href')),
        ]));
        expect(rows.sort()).toEqual(also);
      } else {
        await expect(page.getByRole('heading', { name: 'Also released as' })).toHaveCount(0);
      }

      // SONG-09: one MusicRecording; lyrics.text is the page's lyrics text.
      const blocks = (await jsonLd(page)).filter(d => d['@type'] === 'MusicRecording');
      expect(blocks).toHaveLength(1);
      const [rec] = blocks;
      expect(rec.name).toBe(s.track.title);
      expect([...rec.sameAs].sort()).toEqual(Object.values(data.links || {}).sort());
      expect(rec.byArtist).toMatchObject({ '@type': 'MusicGroup', name: 'Insane Driver' });
      expect(rec.inAlbum).toMatchObject({ '@type': 'MusicAlbum', name: s.album.title, url: `${ORIGIN}/discography/${s.album.slug}/` });
      expect(rec.duration).toBe(iso(s.track.duration));
      expect(rec.recordingOf['@type']).toBe('MusicComposition');
      if (data.instrumental) {
        expect(rec.recordingOf.lyrics).toBeUndefined();
      } else {
        const text = fs.readFileSync(lyricsFile(s), 'utf8').trim();
        expect(rec.recordingOf.lyrics.text).toBe(text);
        // ...and the visible lyrics are that same text.
        expect(expectedSequence(rec.recordingOf.lyrics.text)).toEqual(expectedSequence(text));
      }

      // SONG-10 + first/last edge cases: previous and next track of the album, when they exist.
      const prev = s.album.tracks.find(t => t.position === s.track.position - 1);
      const next = s.album.tracks.find(t => t.position === s.track.position + 1);
      for (const [rel, track] of [['prev', prev], ['next', next]]) {
        const link = page.locator(`a[rel="${rel}"]`);
        if (track) {
          await expect(link).toHaveCount(1);
          await expect(link).toHaveAttribute('href', `/discography/${s.album.slug}/${songSlug(track.title)}/`);
          await expect(link).toContainText(track.title);
        } else {
          await expect(link).toHaveCount(0);
        }
      }

      // GEN-05
      await expect(page.getByText(FANS_OF, { exact: true })).toBeVisible();
    });
  }
});
