const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Liquid = require('liquidjs'); // v6, the version Eleventy 0.12 renders with
const homeRelease = require('../../_data/homeRelease.js');
const homeShuffle = require('../../_data/homeShuffle.js');

const ROOT = path.join(__dirname, '..', '..');

// Renders the real index.html body the way Eleventy does, with _data/ plus a
// release and shuffle pool we can bend to reach branches today's catalog never takes.
async function render(release, shuffle) {
  const source = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/^---[\s\S]*?---\n/, '');
  const engine = Liquid({ root: [path.join(ROOT, '_includes')], extname: '.liquid', dynamicPartials: true });
  return engine.parseAndRender(source, {
    homeRelease: release,
    homeShuffle: shuffle ? { pool: shuffle, json: JSON.stringify(shuffle).replace(/</g, '\\u003c') } : homeShuffle(),
    platforms: require('../../_data/platforms.json'),
    videos: require('../../_data/videos.json'),
    discography: require('../../_data/discography.json'),
    highlights: require('../../_data/highlights.js')()
  });
}

// The inert <template> of spare anchors is not part of the rendered panel.
const links = (html, placement) => [...html.replace(/<template[\s\S]*?<\/template>/g, '').matchAll(/data-home-link="([^"]+)" data-home-placement="([^"]+)"/g)]
  .filter(m => m[2] === placement).map(m => m[1]);

const withLinks = patch => { const r = homeRelease(); return Object.assign({}, r, { links: Object.assign({}, r.links, patch) }); };
const single = patch => Object.assign({}, homeShuffle().pool[0], patch);
const streamingPanel = html => html.slice(html.indexOf('cyber-panel--home-streaming'), html.indexOf('cyber-panel--home-video'));

test('HOME-11: with both URLs the hero card shows Spotify and Apple Music', async () => {
  assert.deepEqual(links(await render(homeRelease()), 'hero'), ['spotify', 'apple']);
});

test('HOME-12: a release with no Apple Music URL renders no Apple Music anchor', async () => {
  const html = await render(withLinks({ apple: null }));
  assert.deepEqual(links(html, 'hero'), ['spotify']);
});

test('HOME-12: a release with no Spotify URL renders no Spotify anchor', async () => {
  const html = await render(withLinks({ spotify: null }));
  assert.deepEqual(links(html, 'hero'), ['apple']);
});

test('HOME-12/14: NOW::STREAMING renders an anchor only for the platforms the single is on, in platform order', async () => {
  const html = await render(homeRelease(), [single({ links: { deezer: 'https://d', spotify: 'https://s' } })]);
  assert.deepEqual(links(html, 'streaming'), ['spotify', 'deezer']);
  assert.match(html, /href="https:\/\/d" target="_blank" rel="noopener" data-home-link="deezer"/);
});

test('HOME-18: a single with no Spotify album id keeps PREVIEW hidden with no id', async () => {
  const panel = streamingPanel(await render(homeRelease()));
  assert.match(panel, /data-home-preview-btn="33TY4424uWL5jgwvlMPn2S" aria-expanded="false" aria-controls="home-preview" hidden>/);
  const none = streamingPanel(await render(homeRelease(), [single({ embedId: null })]));
  assert.match(none, /data-home-preview-btn="" aria-expanded="false" aria-controls="home-preview" hidden>/);
});

test('HOME-14/57: NOW::STREAMING renders the first pool single with the shuffle copy and a discography link', async () => {
  const panel = streamingPanel(await render(homeRelease()));
  assert.match(panel, /data-hud="SIGNAL\.WAITING-FOR-YOU \/\/ STREAMING_"/);
  assert.match(panel, /data-home-streaming="waiting-for-you"/);
  assert.match(panel, /<img src="\/assets\/images\/releases\/waiting-for-you\.jpg" width="600" height="600" alt="Waiting for You cover"/);
  assert.match(panel, /SHUFFLE \/\/ SINGLE \/\/ <span data-home-streaming-date>2025\.02\.21<\/span>/);
  assert.match(panel, /<span data-home-streaming-title>Waiting for You<\/span><span class="home-accent">\.<\/span>/);
  assert.match(panel, /From the archive\. Pick your platform and turn it up\./);
  assert.match(panel, /<a class="home-more" href="\/discography\/">/);
  assert.doesNotMatch(panel, /Keep Away \(Acoustic\)/);
});

test('HOME-56: the page ships the whole pool as inline JSON', async () => {
  const html = await render(homeRelease());
  const json = /<script type="application\/json" data-home-shuffle>([\s\S]*?)<\/script>/.exec(html)[1];
  assert.deepEqual(JSON.parse(json), homeShuffle().pool);
});


test('HOME-58: an empty pool renders no NOW::STREAMING panel and no shuffle data', async () => {
  const html = await render(homeRelease(), []);
  assert.doesNotMatch(html, /NOW::STREAMING/);
  assert.doesNotMatch(html, /data-home-shuffle/);
});
