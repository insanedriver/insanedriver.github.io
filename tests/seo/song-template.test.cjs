const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const Liquid = require('liquidjs'); // v6, the version Eleventy 0.12 renders with
const { metaDescription } = require('../../lib/filters');

// The song page's page_description front-matter expression, rendered the way Eleventy does.
const source = fs.readFileSync(path.join(__dirname, '../../discography/song.liquid'), 'utf8');
const expression = matter(source).data.eleventyComputed.page_description;
const engine = Liquid();
engine.registerFilter('metaDescription', metaDescription);
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
