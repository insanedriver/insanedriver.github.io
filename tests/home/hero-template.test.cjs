const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Liquid = require('liquidjs'); // v6, the version Eleventy 0.12 renders with
const homeRelease = require('../../_data/homeRelease.js');

const ROOT = path.join(__dirname, '..', '..');

// Renders the real index.html body the way Eleventy does, with _data/ plus a
// release we can bend to reach branches today's catalog never takes.
async function render(release) {
  const source = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/^---[\s\S]*?---\n/, '');
  const engine = Liquid({ root: [path.join(ROOT, '_includes')], extname: '.liquid', dynamicPartials: true });
  return engine.parseAndRender(source, {
    homeRelease: release,
    platforms: require('../../_data/platforms.json'),
    videos: require('../../_data/videos.json'),
    discography: require('../../_data/discography.json'),
    highlights: require('../../_data/highlights.js')()
  });
}

const links = (html, placement) => [...html.matchAll(/data-home-link="([^"]+)" data-home-placement="([^"]+)"/g)]
  .filter(m => m[2] === placement).map(m => m[1]);

const withLinks = patch => { const r = homeRelease(); return Object.assign({}, r, { links: Object.assign({}, r.links, patch) }); };

test('HOME-11: with both URLs the hero card shows Spotify and Apple Music', async () => {
  assert.deepEqual(links(await render(homeRelease()), 'hero'), ['spotify', 'apple']);
});

test('HOME-12: a release with no Apple Music URL renders no Apple Music anchor', async () => {
  const html = await render(withLinks({ apple: null }));
  assert.deepEqual(links(html, 'hero'), ['spotify']);
  assert.ok(!links(html, 'streaming').includes('apple'));
});

test('HOME-12: a release with no Spotify URL renders no Spotify anchor', async () => {
  const html = await render(withLinks({ spotify: null }));
  assert.deepEqual(links(html, 'hero'), ['apple']);
  assert.ok(!links(html, 'streaming').includes('spotify'));
});

test('HOME-18: a release with no Spotify album id renders no PREVIEW button', async () => {
  assert.match(await render(homeRelease()), /data-home-preview-btn="14HkhB5FwTGesQECbSBSML"/);
  assert.doesNotMatch(await render(Object.assign({}, homeRelease(), { embedId: null })), /data-home-preview-btn/);
});
