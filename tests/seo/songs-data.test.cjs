const { test } = require('node:test');
const assert = require('node:assert/strict');
const { songs, releases } = require('../../_data/songs.json');
const discography = require('../../_data/discography.json');

const kebab = title => title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const album = slug => discography.albums.find(a => a.slug === slug);
const sentences = text => text.split(/(?<=[.!?])\s+/).filter(Boolean).length;

const WITH_ABOUT = [
  'faceless-demons', 'keep-away', 'silicon-fortress', 'age-of-lies', 'insane-driver', 'desperate-prayer',
  'ghosts', 'imagined-realities', 'invisible-chains', 'distant-hearts', 'buried-thoughts',
  'the-edge-of-life', 'firstly-my-breakfast', 'tide-of-fears', 'fallen-dreams', 'change', 'today-is-sunday',
  'faithless-breath', 'make-decisions', 'tears-of-blood',
];
const RELEASE_PAGES = [
  'silicon-fortress', 'insane-driver', 'insane-driver-deluxe', 'waiting-for-you',
  'the-sun-will-rise', 'today-is-sunday-eder-franco', 'change-live',
];

test('SONG-01: 22 songs, one per track of the two studio albums, in tracklist order', () => {
  assert.equal(songs.length, 22);
  for (const slug of ['insane-driver', 'silicon-fortress']) {
    assert.deepEqual(songs.filter(s => s.album === slug).map(s => s.slug), album(slug).tracks.map(t => kebab(t.title)), slug);
  }
});

test('SONG-02: no song slug repeats', () => {
  assert.equal(new Set(songs.map(s => s.slug)).size, songs.length);
});

test('LYR-04: every song references an existing album slug and a track title of that album', () => {
  for (const s of songs) {
    const a = album(s.album);
    assert.ok(a, `${s.slug}: unknown album ${s.album}`);
    assert.ok(a.tracks.some(t => kebab(t.title) === s.slug), `${s.slug}: no such track on ${s.album}`);
  }
});

test('SONG-05: exactly Endless Path and Back to 1994 are instrumental', () => {
  assert.deepEqual(songs.filter(s => s.instrumental === true).map(s => s.slug).sort(), ['back-to-1994', 'endless-path']);
  for (const s of songs) assert.ok(s.instrumental === undefined || s.instrumental === true, s.slug);
});

test('SONG-06: About text, 2-3 sentences, exactly for the 20 agreed songs', () => {
  assert.deepEqual(songs.filter(s => 'about' in s).map(s => s.slug).sort(), [...WITH_ABOUT].sort());
  for (const s of songs.filter(s => s.about)) {
    const n = sentences(s.about);
    assert.ok(n >= 2 && n <= 3, `${s.slug}: ${n} sentences`);
  }
});

test('REL-02: description copy for exactly the 7 release pages; album copy is 2-4 sentences naming the year', () => {
  assert.deepEqual(Object.keys(releases).sort(), [...RELEASE_PAGES].sort());
  for (const [slug, text] of Object.entries(releases)) {
    assert.ok(text.trim().length > 0, slug);
    const release = [...discography.albums, ...discography.singles].find(r => r.slug === slug);
    assert.ok(text.includes(String(release.year)), `${slug}: names ${release.year}`);
  }
  for (const slug of ['silicon-fortress', 'insane-driver', 'insane-driver-deluxe']) {
    const n = sentences(releases[slug]);
    assert.ok(n >= 2 && n <= 4, `${slug}: ${n} sentences`);
    assert.match(releases[slug].toLowerCase(), /hard rock|heavy metal|metalcore/, `${slug}: names the genre`);
  }
});
