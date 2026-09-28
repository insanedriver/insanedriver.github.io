const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../../assets/js/home-core.js');
const catalog = require('../../_data/discography.json');

function release(slug, releaseDate, type) {
  return { slug: slug, releaseDate: releaseDate, type: type || 'SINGLE', links: {} };
}

test('HOME-09: the latest release of the real catalog is Keep Away (Acoustic)', () => {
  assert.equal(core.latestRelease(catalog).slug, 'keep-away-acoustic');
});

test('HOME-09: the newest releaseDate wins across albums and singles', () => {
  const picked = core.latestRelease({
    albums: [release('old-album', '2021-08-27', 'ALBUM')],
    singles: [release('older-single', '2019-01-01'), release('new-single', '2024-11-15')]
  });
  assert.equal(picked.slug, 'new-single');
  const albumFirst = core.latestRelease({
    albums: [release('new-album', '2026-01-01', 'ALBUM')],
    singles: [release('old-single', '2024-11-15')]
  });
  assert.equal(albumFirst.slug, 'new-album');
});

test('HOME-09: an album beats a single released the same day', () => {
  const picked = core.latestRelease({
    albums: [release('same-day-album', '2025-05-09', 'ALBUM')],
    singles: [release('same-day-single', '2025-05-09')]
  });
  assert.equal(picked.slug, 'same-day-album');
  const singlesFirst = core.latestRelease({
    singles: [release('same-day-single', '2025-05-09')],
    albums: [release('same-day-album', '2025-05-09', 'ALBUM')]
  });
  assert.equal(singlesFirst.slug, 'same-day-album');
});

test('Edge: without singles the latest release is the newest album', () => {
  assert.equal(core.latestRelease({ albums: catalog.albums, singles: [] }).slug, 'silicon-fortress');
  assert.equal(core.latestRelease({ albums: catalog.albums }).slug, 'silicon-fortress');
});

test('HOME-09: an empty catalog has no latest release', () => {
  assert.equal(core.latestRelease({ albums: [], singles: [] }), null);
  assert.equal(core.latestRelease(null), null);
});

test('HOME-10: the type label reads ALBUM, DELUXE EDITION or SINGLE', () => {
  assert.equal(core.releaseTypeLabel({ type: 'ALBUM' }), 'ALBUM');
  assert.equal(core.releaseTypeLabel({ type: 'DELUXE' }), 'DELUXE EDITION');
  assert.equal(core.releaseTypeLabel({ type: 'SINGLE' }), 'SINGLE');
});

test('HOME-18: a release spotifyId is preferred over its link', () => {
  assert.equal(core.spotifyAlbumId({ spotifyId: 'ID1', links: { spotify: 'https://open.spotify.com/album/OTHER' } }), 'ID1');
});

test('HOME-18: the album id is parsed from the Spotify link when spotifyId is null', () => {
  assert.equal(core.spotifyAlbumId({ spotifyId: null, links: { spotify: 'https://open.spotify.com/album/14HkhB5FwTGesQECbSBSML' } }), '14HkhB5FwTGesQECbSBSML');
  assert.equal(core.spotifyAlbumId({ spotifyId: null, links: { spotify: 'https://open.spotify.com/album/14HkhB5FwTGesQECbSBSML?si=abc' } }), '14HkhB5FwTGesQECbSBSML');
});

test('HOME-18: no id comes from a missing or non-album Spotify link', () => {
  assert.equal(core.spotifyAlbumId({ spotifyId: null, links: { spotify: null } }), null);
  assert.equal(core.spotifyAlbumId({ spotifyId: null, links: {} }), null);
  assert.equal(core.spotifyAlbumId({ spotifyId: null, links: { spotify: 'https://open.spotify.com/artist/2ye4AQnKI7zNyOnuLGHaaE' } }), null);
  assert.equal(core.spotifyAlbumId(null), null);
});

test('HOME-16: the embed url targets the Spotify album embed', () => {
  assert.equal(core.spotifyEmbedUrl('14HkhB5FwTGesQECbSBSML'), 'https://open.spotify.com/embed/album/14HkhB5FwTGesQECbSBSML');
  assert.equal(core.spotifyEmbedUrl(null), null);
});

test('HOME-24: a repeat view dismisses 400ms after start', () => {
  assert.equal(core.loaderDismissAt({ startedAt: 1000, readyAt: 9000, repeat: true }), 1400);
  assert.equal(core.loaderDismissAt({ startedAt: 1000, readyAt: null, repeat: true }), 1400);
});

test('HOME-22: a first view never dismisses before 1.2s, even when ready early', () => {
  assert.equal(core.loaderDismissAt({ startedAt: 1000, readyAt: 1300, repeat: false }), 2200);
});

test('HOME-22: a first view dismisses when ready if that falls between 1.2s and 3.5s', () => {
  assert.equal(core.loaderDismissAt({ startedAt: 1000, readyAt: 3000, repeat: false }), 3000);
});

test('HOME-23: a first view dismisses at 3.5s when ready comes late or never', () => {
  assert.equal(core.loaderDismissAt({ startedAt: 1000, readyAt: 6000, repeat: false }), 4500);
  assert.equal(core.loaderDismissAt({ startedAt: 1000, readyAt: null, repeat: false }), 4500);
});

test('HOME-24: a stored boot flag marks a repeat view', () => {
  const store = {};
  const storage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } };
  assert.equal(core.isRepeatVisit(storage), false);
  core.markVisited(storage);
  assert.equal(core.isRepeatVisit(storage), true);
});

test('HOME-25: missing or throwing storage counts as a first view', () => {
  const throwing = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  assert.equal(core.isRepeatVisit(null), false);
  assert.equal(core.isRepeatVisit(undefined), false);
  assert.equal(core.isRepeatVisit(throwing), false);
  assert.doesNotThrow(() => core.markVisited(throwing));
  assert.doesNotThrow(() => core.markVisited(null));
});

test('HOME-36/37: the navbar turns solid only past 40px', () => {
  assert.equal(core.navIsSolid(0), false);
  assert.equal(core.navIsSolid(40), false);
  assert.equal(core.navIsSolid(41), true);
});

test('HOME-49: release click event shape', () => {
  assert.deepEqual(core.releaseClickEvent('spotify', 'keep-away-acoustic', 'hero'),
    { event: 'home_release_click', platform: 'spotify', release: 'keep-away-acoustic', placement: 'hero' });
  assert.deepEqual(core.releaseClickEvent('deezer', 'keep-away-acoustic', 'streaming'),
    { event: 'home_release_click', platform: 'deezer', release: 'keep-away-acoustic', placement: 'streaming' });
});

test('HOME-50: teaser click event shapes', () => {
  assert.deepEqual(core.teaserClickEvent('video', 'keep-away'), { event: 'home_teaser_click', target: 'video', slug: 'keep-away' });
  assert.deepEqual(core.teaserClickEvent('album', 'silicon-fortress'), { event: 'home_teaser_click', target: 'album', slug: 'silicon-fortress' });
  assert.deepEqual(core.teaserClickEvent('photos'), { event: 'home_teaser_click', target: 'photos' });
});

test('HOME-47/26: newsletter and loader skip event shapes', () => {
  assert.deepEqual(core.newsletterEvent(), { event: 'home_newsletter_submit' });
  assert.deepEqual(core.loaderSkipEvent(), { event: 'home_loader_skip' });
});
