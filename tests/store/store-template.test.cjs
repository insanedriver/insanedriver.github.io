const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const Liquid = require('liquidjs'); // liquidjs 6 (bundled with Eleventy 0.12) exports a factory

const root = path.join(__dirname, '..', '..');
const catalog = require('../../_data/discography.json');

const render = discography => {
  const page = matter(fs.readFileSync(path.join(root, 'store/index.html'), 'utf8'));
  return Liquid().parseAndRender(page.content, { ...page.data, discography });
};

test('edge case: an album with no tracks renders no tracklist, the other album still does', async () => {
  const albums = catalog.albums.map(a => (a.slug === 'insane-driver' ? { ...a, tracks: [] } : a));
  const html = await render({ ...catalog, albums });
  assert.equal((html.match(/data-store-tracklist="insane-driver"/g) || []).length, 0);
  // Silicon Fortress keeps its tracklist on both the combo and its own card.
  assert.equal((html.match(/data-store-tracklist="silicon-fortress"/g) || []).length, 2);
});
