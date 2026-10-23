const { test, expect } = require('../photos/browser.cjs');
const catalog = require('../../_data/discography.json');
const videos = require('../../_data/videos.json');

// Every song page, with its video (SONG-11) and its neighbours in the album.
const kebab = t => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const SONGS = ['insane-driver', 'silicon-fortress'].flatMap(a => {
  const album = catalog.albums.find(x => x.slug === a);
  return album.tracks.map(t => ({
    album, track: t, slug: kebab(t.title), url: `/discography/${a}/${kebab(t.title)}/`,
    video: videos.find(v => v.slug === kebab(t.title)) || null,
  }));
});
const KEEP_AWAY = SONGS.find(s => s.slug === 'keep-away');
const TEARS = SONGS.find(s => s.slug === 'tears-of-blood');
const FAMILY_CLASSES = ['song-lyrics-section--verse', 'song-lyrics-section--chorus', 'song-lyrics-section--bridge', 'song-lyrics-section--other'];

// Classes of each labelled / unlabelled lyrics section, in page order.
const sectionFamilies = page => page.locator('[data-song-lyrics] .song-lyrics-section').evaluateAll((els, names) => els.map(el => ({
  label: el.querySelector('h3') ? el.querySelector('h3').textContent.trim() : null,
  families: names.filter(n => el.classList.contains(n)),
})), FAMILY_CLASSES);

const two = n => String(n).padStart(2, '0');
const neighbour = (s, delta) => s.album.tracks.find(t => t.position === s.track.position + delta);

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const s of SONGS) {
    test(`BENTO-34/35: ${s.url} has a full-width sequencer after the last panel`, async ({ page }) => {
      await page.goto(s.url);
      const nav = page.locator('.song-nav');
      await expect(nav).toHaveCount(1);
      const placement = await nav.evaluate(el => {
        const panels = [...document.querySelectorAll('.cyber-panel')];
        const last = panels[panels.length - 1];
        return { insidePanel: !!el.closest('.cyber-panel'), afterLast: !!(last.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING) };
      });
      expect(placement).toEqual({ insidePanel: false, afterLast: true });
      const text = async rel => (await page.locator(`.song-nav a[rel="${rel}"]`).textContent()).replace(/\s+/g, ' ').trim();
      const prev = neighbour(s, -1);
      const next = neighbour(s, 1);
      if (prev) expect(await text('prev')).toBe(`← Previous track // ${two(prev.position)} ${prev.title}`);
      else await expect(page.locator('.song-nav a[rel="prev"]')).toHaveCount(0);
      if (next) expect(await text('next')).toBe(`Next track → // ${two(next.position)} ${next.title}`);
      else await expect(page.locator('.song-nav a[rel="next"]')).toHaveCount(0);
    });
  }

  test('BENTO-08: a video song h1 is the title badge; other h1s keep their classes', async ({ page }) => {
    const BASE = ['text-center', 'subtitle-font', 'page-header'];
    const h1 = async url => {
      await page.goto(url);
      await expect(page.locator('h1')).toHaveCount(1);
      return page.locator('h1').evaluate(el => ({ text: el.textContent.trim(), classes: [...el.classList] }));
    };
    for (const s of SONGS.filter(x => x.video)) {
      expect(await h1(s.url), s.url).toEqual({ text: s.track.title, classes: [...BASE, 'song-title-badge'] });
    }
    for (const s of SONGS.filter(x => !x.video)) {
      expect((await h1(s.url)).classes, s.url).toEqual(BASE);
    }
    for (const url of ['/band/', '/discography/', '/discography/silicon-fortress/']) {
      expect((await h1(url)).classes, url).toEqual(BASE);
    }
  });

  test('BENTO-27: each labelled lyrics section carries exactly one family class', async ({ page }) => {
    await page.goto(KEEP_AWAY.url);
    expect(await sectionFamilies(page)).toEqual([
      { label: 'Verse 1', families: ['song-lyrics-section--verse'] },
      { label: 'Bridge', families: ['song-lyrics-section--bridge'] },
      { label: 'Chorus', families: ['song-lyrics-section--chorus'] },
      { label: 'Verse 2', families: ['song-lyrics-section--verse'] },
      { label: 'Bridge', families: ['song-lyrics-section--bridge'] },
      { label: 'Chorus', families: ['song-lyrics-section--chorus'] },
    ]);
  });

  test('BENTO-27 edge: a lyrics sheet with no labels gets no family class', async ({ page }) => {
    await page.goto(TEARS.url);
    const sections = await sectionFamilies(page);
    expect(sections.length).toBeGreaterThan(0);
    for (const s of sections) expect(s).toEqual({ label: null, families: [] });
  });
});

