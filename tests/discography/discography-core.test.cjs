const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../../assets/js/discography-core.js');
const catalog = require('../../_data/discography.json');

test('DISC-22: the embed url points at the album embed of that Spotify id', () => {
  assert.equal(
    core.spotifyEmbedUrl('0PCziCYnitLM17g75Vpvba'),
    'https://open.spotify.com/embed/album/0PCziCYnitLM17g75Vpvba'
  );
  for (const album of catalog.albums) {
    if (!album.spotifyId) continue;
    assert.equal(core.spotifyEmbedUrl(album.spotifyId), 'https://open.spotify.com/embed/album/' + album.spotifyId);
  }
});

test('DISC-28: an album without a Spotify id yields no embed url', () => {
  assert.equal(core.spotifyEmbedUrl(null), null);
  assert.equal(core.spotifyEmbedUrl(''), null);
  assert.equal(core.spotifyEmbedUrl(undefined), null);
});

test('DISC-23: opening a preview from the closed state selects it', () => {
  assert.deepEqual(core.nextPreviewState(null, 'silicon-fortress'), { open: 'silicon-fortress' });
});

test('DISC-24: opening another album switches the open preview', () => {
  assert.deepEqual(core.nextPreviewState('silicon-fortress', 'insane-driver'), { open: 'insane-driver' });
});

test('DISC-25: requesting the album that is already open closes it', () => {
  assert.deepEqual(core.nextPreviewState('silicon-fortress', 'silicon-fortress'), { open: null });
});

test('DISC-25: an empty request leaves the current state untouched', () => {
  assert.deepEqual(core.nextPreviewState('silicon-fortress', null), { open: 'silicon-fortress' });
  assert.deepEqual(core.nextPreviewState(null, null), { open: null });
});

test('DISC-39/41: the click event carries the platform key and the release slug', () => {
  assert.deepEqual(core.clickEvent('apple', 'silicon-fortress'), {
    event: 'release_click', platform: 'apple', release: 'silicon-fortress'
  });
  assert.deepEqual(Object.keys(core.clickEvent('spotify', 'ghosts')), ['event', 'platform', 'release']);
});
