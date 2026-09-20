const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalog = require('../../_data/discography.json');
const platforms = require('../../_data/platforms.json');

const coversDir = path.join(__dirname, '../../assets/images/releases');
const platformKeys = platforms.map(p => p.key);
const releases = () => [...catalog.albums, ...catalog.singles];

test('DISC-01: the catalog holds the three albums, newest first', () => {
  assert.deepEqual(catalog.albums.map(a => a.slug), [
    'silicon-fortress', 'insane-driver-deluxe', 'insane-driver'
  ]);
  assert.deepEqual(catalog.albums.map(a => a.year), [2021, 2018, 2016]);
});

test('DISC-43: every release carries slug, title, year, releaseDate, cover and type', () => {
  for (const r of releases()) {
    assert.match(r.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/, `slug: ${r.slug}`);
    assert.ok(r.title && r.title.trim().length > 0, r.slug);
    assert.equal(typeof r.year, 'number', r.slug);
    assert.match(r.releaseDate, /^\d{4}-\d{2}-\d{2}$/, r.slug);
    assert.equal(r.year, Number(r.releaseDate.slice(0, 4)), r.slug);
    assert.ok(['ALBUM', 'DELUXE', 'SINGLE'].includes(r.type), `${r.slug}: ${r.type}`);
  }
});

test('DISC-43: slugs are unique across albums and singles', () => {
  const slugs = releases().map(r => r.slug);
  assert.equal(new Set(slugs).size, slugs.length);
});

test('DISC-43: every cover names a file that exists at the declared size', () => {
  for (const r of releases()) {
    assert.match(r.cover, /^[a-z0-9-]+\.jpg$/, r.slug);
    assert.ok(fs.existsSync(path.join(coversDir, r.cover)), `${r.slug}: missing ${r.cover}`);
    assert.equal(r.coverWidth, 600, r.slug);
    assert.equal(r.coverHeight, 600, r.slug);
  }
});

test('DISC-43: links use only the eight known platform keys', () => {
  for (const r of releases()) {
    assert.deepEqual(Object.keys(r.links).sort(), [...platformKeys].sort(), r.slug);
  }
});

test('DISC-46: every non-null link is an absolute https URL', () => {
  for (const r of releases()) {
    for (const [key, url] of Object.entries(r.links)) {
      if (url === null) continue;
      assert.match(url, /^https:\/\/\S+$/, `${r.slug}.${key}`);
    }
  }
});

test('DISC-30: album tracks carry a sequential position, a title and a positive integer duration', () => {
  for (const a of catalog.albums) {
    assert.ok(a.tracks.length > 0, a.slug);
    a.tracks.forEach((t, i) => {
      assert.equal(t.position, i + 1, `${a.slug} track ${i + 1}`);
      assert.ok(t.title && t.title.trim().length > 0, `${a.slug} track ${i + 1}`);
      assert.ok(Number.isInteger(t.duration) && t.duration > 0, `${a.slug} track ${i + 1}: ${t.duration}`);
    });
  }
  assert.deepEqual(catalog.albums.map(a => a.tracks.length), [11, 15, 11]);
});

test('DISC-37: buyCd is an internal path only where a CD is sold', () => {
  const byCd = Object.fromEntries(catalog.albums.map(a => [a.slug, a.buyCd]));
  assert.equal(byCd['silicon-fortress'], '/preorder/');
  assert.equal(byCd['insane-driver'], '/store/');
  assert.equal(byCd['insane-driver-deluxe'], null);
  for (const r of releases()) {
    if (r.buyCd !== null) assert.match(r.buyCd, /^\/[a-z-]+\/$/, r.slug);
  }
});

test('DISC-21: an album exposes a Spotify id exactly when it links to Spotify', () => {
  for (const a of catalog.albums) {
    assert.equal(a.spotifyId === null, a.links.spotify === null, a.slug);
    if (a.spotifyId) assert.ok(a.links.spotify.endsWith(a.spotifyId), a.slug);
  }
});
