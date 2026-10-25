const { test, expect } = require('../photos/browser.cjs');
const songs = require('../../_data/songs.json').songs;
const { metaDescription } = require('../../lib/filters');
const fs = require('node:fs');
const path = require('node:path');

// single-lyrics SEO: the songs released only as singles describe themselves without an album.
const ORIGIN = 'https://insanedriver.com.br';
const SINGLES = [
  { slug: 'waiting-for-you', title: 'Waiting for You', duration: 'PT3M38S' },
  { slug: 'the-sun-will-rise', title: 'The Sun Will Rise', duration: 'PT4M41S' },
];
const jsonLd = page => page.locator('script[type="application/ld+json"]')
  .evaluateAll(els => els.map(el => JSON.parse(el.textContent)));

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const s of SINGLES) {
    const url = `/discography/${s.slug}/`;
    const about = songs.find(x => x.slug === s.slug).about;

    test(`SLYR-13: ${url} title and description are the lyrics title and the about text`, async ({ page }) => {
      await page.goto(url);
      await expect(page).toHaveTitle(`${s.title} Lyrics – Insane Driver`);
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', metaDescription(about));
    });

    test(`SLYR-15: ${url} publishes a MusicRecording without an album`, async ({ page }) => {
      await page.goto(url);
      const recs = (await jsonLd(page)).filter(x => x['@type'] === 'MusicRecording');
      expect(recs).toHaveLength(1);
      const rec = recs[0];
      expect(rec.name).toBe(s.title);
      expect(rec.url).toBe(`${ORIGIN}${url}`);
      expect(rec.duration).toBe(s.duration);
      expect(rec.image).toBe(`${ORIGIN}/assets/images/releases/${s.slug}.jpg`);
      const text = fs.readFileSync(path.join(__dirname, '../../_data/lyrics/singles', `${s.slug}.txt`), 'utf8').trim();
      expect(rec.recordingOf.lyrics.text).toBe(text);
      expect(rec).not.toHaveProperty('inAlbum');
      expect(rec).not.toHaveProperty('position');
    });

    test(`SLYR-16: ${url} breadcrumbs are Discography then the song`, async ({ page }) => {
      await page.goto(url);
      const lists = (await jsonLd(page)).filter(x => x['@type'] === 'BreadcrumbList');
      expect(lists).toHaveLength(1);
      expect(lists[0].itemListElement.map(i => [i.position, i.name, i.item])).toEqual([
        [1, 'Discography', `${ORIGIN}/discography/`],
        [2, s.title, `${ORIGIN}${url}`],
      ]);
    });
  }
});
