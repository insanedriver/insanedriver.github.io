const { test } = require('node:test');
const assert = require('node:assert/strict');
const homeRelease = require('../../_data/homeRelease.js');

test('HOME-09/10/14: today the home features Keep Away (Acoustic) as a single', () => {
  const r = homeRelease();
  assert.equal(r.slug, 'keep-away-acoustic');
  assert.equal(r.title, 'Keep Away (Acoustic)');
  assert.equal(r.year, 2025);
  assert.equal(r.typeLabel, 'SINGLE');
  assert.equal(r.embedId, '14HkhB5FwTGesQECbSBSML');
  assert.equal(r.detailUrl, '/discography/');
  assert.equal(r.links.spotify, 'https://open.spotify.com/album/14HkhB5FwTGesQECbSBSML');
});

test('HOME-14: an album links to its own discography card', () => {
  const r = homeRelease.build({
    albums: [{ slug: 'silicon-fortress', releaseDate: '2021-08-27', type: 'ALBUM', spotifyId: '0PCziCYnitLM17g75Vpvba', links: {} }],
    singles: []
  });
  assert.equal(r.detailUrl, '/discography/#silicon-fortress');
  assert.equal(r.typeLabel, 'ALBUM');
  assert.equal(r.embedId, '0PCziCYnitLM17g75Vpvba');
});

test('HOME-09: an empty catalog yields no release', () => {
  assert.equal(homeRelease.build({ albums: [], singles: [] }), null);
});
