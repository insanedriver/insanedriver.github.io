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

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

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

