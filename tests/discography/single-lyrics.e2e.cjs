const fs = require('node:fs');
const path = require('node:path');
const { test, expect } = require('../photos/browser.cjs');

// single-lyrics: the songs released only as singles are lyrics bento pages at the single URL.
const LYRICS = path.join(__dirname, '../../_data/lyrics/singles');
const SINGLES = [
  {
    slug: 'waiting-for-you', title: 'Waiting for You', year: 2025, runtime: '3:38', code: 'WFY-SINGLE',
    sections: ['Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus'],
    uplink: [
      ['spotify', 'https://open.spotify.com/album/33TY4424uWL5jgwvlMPn2S', 'Stream the album'],
      ['apple', 'https://music.apple.com/us/album/waiting-for-you/1793471043?i=1793471044', 'Play the track'],
    ],
  },
  {
    slug: 'the-sun-will-rise', title: 'The Sun Will Rise', year: 2024, runtime: '4:41', code: 'TSWR-SINGLE',
    sections: ['Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus 2', 'Bridge', 'Pre-Chorus', 'Outro', 'Chorus 3'],
    uplink: [
      ['spotify', 'https://open.spotify.com/album/6ktUilpGxgR8CGrNTuQ8Y7', 'Stream the album'],
      ['apple', 'https://music.apple.com/us/album/the-sun-will-rise/1775076726?i=1775076727', 'Play the track'],
    ],
  },
];
const about = slug => require('../../_data/songs.json').songs.find(s => s.slug === slug).about;
const norm = t => t.replace(/\s+/g, ' ').trim();

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const s of SINGLES) {
    const url = `/discography/${s.slug}/`;

    test(`SLYR-01/02/06: ${url} is a lyrics bento page with the agreed sections`, async ({ page }) => {
      const res = await page.goto(url);
      expect(res.status()).toBe(200);
      await expect(page.locator('.song-bento--lyrics')).toHaveCount(1);
      await expect(page.locator('h1')).toHaveText(s.title);
      const labels = await page.locator('[data-song-lyrics] .song-lyrics-section').evaluateAll(els =>
        els.map(el => (el.querySelector('h3') ? el.querySelector('h3').textContent.trim() : null)));
      expect(labels).toEqual(s.sections);
      // Every lyric line of the file is on the page.
      const text = norm(await page.locator('[data-song-lyrics]').textContent());
      const lines = fs.readFileSync(path.join(LYRICS, `${s.slug}.txt`), 'utf8').split('\n').map(norm)
        .filter(l => l && !/^\[.+\]$/.test(l));
      for (const line of lines) expect(text, line).toContain(line);
    });

    test(`SLYR-07/09: ${url} meta panel names the single, not an album`, async ({ page }) => {
      await page.goto(url);
      const meta = page.locator('[data-song-meta]');
      await expect(meta.locator('.cyber-panel-tab')).toHaveText(`SINGLE::${s.year}`);
      const metaText = norm(await meta.textContent());
      expect(metaText).toContain(`Single // ${s.year}`);
      expect(metaText).toContain(`Runtime ${s.runtime}`);
      expect(metaText).toContain(`Single · Released ${s.year}`);
      expect(metaText).not.toContain('From the album');
      expect(metaText).not.toContain('Track 01');
      await expect(page.locator('[data-song-album]')).toHaveCount(0);
      const cover = meta.locator('.disc-release-art img');
      await expect(cover).toHaveAttribute('src', `/assets/images/releases/${s.slug}.jpg`);
      await expect(cover).toHaveAttribute('alt', `${s.title} single cover`);
    });

    test(`SLYR-08/10: ${url} dossier carries the about text and the single catalog code`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('[data-song-about] p')).toHaveText(about(s.slug));
      await expect(page.locator('.song-bento-panel--d .song-bento-foot')).toHaveText(`CATALOG: ${s.code} // ALL EDITIONS LISTED`);
    });

    test(`SLYR-11: ${url} uplink lists the single links with the Apple track, under the single slug`, async ({ page }) => {
      await page.goto(url);
      const shown = await page.locator('.song-bento-panel--b a[data-disc-link]').evaluateAll(els => els.map(el => [
        el.getAttribute('data-disc-link'), el.getAttribute('href'), el.querySelector('.cyber-link-sub').textContent.trim(),
      ]));
      expect(shown).toEqual(s.uplink);
      const slugs = await page.locator('a[data-disc-link]').evaluateAll(els => els.map(el => el.getAttribute('data-disc-slug')));
      expect(slugs.length).toBeGreaterThan(0);
      for (const slug of slugs) expect(slug).toBe(s.slug);
      await expect(page.locator('[data-song-listen]')).toHaveAttribute('href', s.uplink[0][1]);
    });

    test(`SLYR-12: ${url} has no previous or next track`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('.song-nav')).toHaveCount(0);
    });

    test(`SLYR-21: ${url} shows none of the Portuguese translation`, async ({ page }) => {
      await page.goto(url);
      const body = norm(await page.locator('body').textContent());
      const english = new Set(fs.readFileSync(path.join(LYRICS, `${s.slug}.txt`), 'utf8').split('\n').map(norm));
      const pt = fs.readFileSync(path.join(LYRICS, `${s.slug}.pt.txt`), 'utf8').split('\n').map(norm)
        .filter(l => l && !/^\[.+\]$/.test(l) && !english.has(l));
      expect(pt.length).toBeGreaterThan(0);
      for (const line of pt) expect(body, line).not.toContain(line);
    });
  }

  test('SLYR-18: the hub cards of both singles link to their lyrics page', async ({ page }) => {
    await page.goto('/discography/');
    for (const s of SINGLES) {
      await expect(page.locator(`[data-disc-single="${s.slug}"]`)).toHaveAttribute('href', `/discography/${s.slug}/`);
    }
  });
});
