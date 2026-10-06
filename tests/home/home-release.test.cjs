const { test } = require('node:test');
const assert = require('node:assert/strict');
const homeRelease = require('../../_data/homeRelease.js');

test('HOME-09/10/14: today the home features Keep Away (Acoustic) as a single', () => {
  const r = homeRelease();
  assert.equal(r.slug, 'keep-away-acoustic');
  assert.equal(r.title, 'Keep Away (Acoustic)');
  assert.equal(r.year, 2025);
  assert.equal(r.typeLabel, 'SINGLE');
  // HOME-69: nothing reads an embed id or a detail URL from the hero release.
  assert.ok(!('embedId' in r));
  assert.ok(!('detailUrl' in r));
  assert.equal(r.links.spotify, 'https://open.spotify.com/album/14HkhB5FwTGesQECbSBSML');
});

test('HOME-10/69: an album gets the ALBUM label and no embed or detail fields', () => {
  const r = homeRelease.build({
    albums: [{ slug: 'silicon-fortress', releaseDate: '2021-08-27', type: 'ALBUM', spotifyId: '0PCziCYnitLM17g75Vpvba', links: {} }],
    singles: []
  });
  assert.equal(r.typeLabel, 'ALBUM');
  assert.ok(!('embedId' in r));
  assert.ok(!('detailUrl' in r));
});

test('HOME-09: an empty catalog yields no release', () => {
  assert.equal(homeRelease.build({ albums: [], singles: [] }), null);
});
