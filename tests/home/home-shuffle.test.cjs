const { test } = require('node:test');
const assert = require('node:assert/strict');
const homeShuffle = require('../../_data/homeShuffle.js');

test('HOME-55/57: the pool data starts with Waiting for You and carries what the panel needs', () => {
  const pool = homeShuffle().pool;
  assert.equal(pool.length, 17);
  assert.deepEqual(pool[0], {
    slug: 'waiting-for-you',
    title: 'Waiting for You',
    releaseDate: '2025-02-21',
    cover: 'waiting-for-you.jpg',
    coverWidth: 600,
    coverHeight: 600,
    embedId: '33TY4424uWL5jgwvlMPn2S',
    links: {
      spotify: 'https://open.spotify.com/album/33TY4424uWL5jgwvlMPn2S',
      apple: 'https://music.apple.com/us/album/waiting-for-you-single/1793471043'
    }
  });
});

test('HOME-18: a single with no Spotify album id carries a null embedId', () => {
  const pool = homeShuffle.build({ albums: [], singles: [
    { slug: 'hero', releaseDate: '2025-01-01', type: 'SINGLE', links: {} },
    { slug: 'x', title: 'X', releaseDate: '2020-01-01', type: 'SINGLE', cover: 'x.jpg', coverWidth: 1, coverHeight: 1, links: { apple: 'https://a' } }
  ] }).pool;
  assert.equal(pool.length, 1);
  assert.equal(pool[0].embedId, null);
  assert.deepEqual(pool[0].links, { apple: 'https://a' });
});

test('HOME-56: json is the pool, with every "<" escaped', () => {
  const data = homeShuffle.build({ albums: [], singles: [
    { slug: 'hero', releaseDate: '2025-01-01', type: 'SINGLE', links: {} },
    { slug: 'x', title: '</script><b>', releaseDate: '2020-01-01', type: 'SINGLE', cover: 'x.jpg', coverWidth: 1, coverHeight: 1, links: {} }
  ] });
  assert.ok(!data.json.includes('<'));
  assert.deepEqual(JSON.parse(data.json), data.pool);
});
