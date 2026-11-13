const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const Liquid = require('liquidjs'); // v6, the version Eleventy 0.12 renders with
const { metaDescription, songMetaDescription } = require('../../lib/filters');

// The song page's page_description front-matter expression, rendered the way Eleventy does.
const source = fs.readFileSync(path.join(__dirname, '../../discography/song.liquid'), 'utf8');
const expression = matter(source).data.eleventyComputed.page_description;
const engine = Liquid();
engine.registerFilter('metaDescription', metaDescription);
engine.registerFilter('songMetaDescription', songMetaDescription);
const describe = song => engine.parseAndRender(expression, { song });

test('SLYR-14: a single song without about text gets the single lyrics description', async () => {
  const song = { title: 'Waiting for You', single: true, instrumental: false, about: null, album: { year: 2025, title: 'Waiting for You' } };
  assert.equal(await describe(song),
    'Lyrics of "Waiting for You", Insane Driver\'s 2025 single – hard rock, heavy metal and metalcore from São Paulo, Brazil.');
});

test('SLYR-13: a single song with about text is described by it', async () => {
  const song = { title: 'Waiting for You', single: true, instrumental: false, about: 'About the song, long enough to stand alone.', album: { year: 2025 } };
  assert.equal(await describe(song), 'About the song, long enough to stand alone.');
});

test('BANDSEO-04: songMetaDescription keeps both summary and For fans of within 160 chars', async () => {
  const song = {
    title: 'The Edge of Life',
    single: false,
    instrumental: false,
    about: 'The Edge of Life follows someone caught between life and death, watching their whole life pass before their eyes as something pulls them through the veil. In the end it matters.',
    album: { year: 2016, title: 'Insane Driver' },
    seo: { fansOf: 'For fans of Killswitch Engage and Alter Bridge' },
  };
  const out = await describe(song);
  assert.ok(out.length >= 50 && out.length <= 160, `unexpected length ${out.length}`);
  assert.ok(out.includes('The Edge of Life follows someone'), 'summary missing');
  assert.ok(out.endsWith('For fans of Killswitch Engage and Alter Bridge.'), 'fansOf suffix missing');
});
