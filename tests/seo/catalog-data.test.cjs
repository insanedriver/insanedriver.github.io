const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const catalogData = require('../../_data/catalog.js');

const LYRICS = path.join(__dirname, '../../_data/lyrics');

test('SONG-01/REL-01: the catalog data loads 22 songs and the 8 release pages from the real files', () => {
  const c = catalogData();
  assert.equal(c.songs.length, 22);
  assert.deepEqual(c.releases.map(r => r.slug).sort(), [
    'change-live', 'fallen-dreams-acoustic', 'insane-driver', 'insane-driver-deluxe', 'silicon-fortress',
    'the-sun-will-rise', 'today-is-sunday-eder-franco', 'waiting-for-you',
  ]);
  assert.equal(typeof catalogData.build, 'function');
});

test('SONG-04: a song page carries the English lyrics file text, in labelled sections', () => {
  const s = catalogData().songs.find(x => x.slug === 'faceless-demons');
  assert.equal(s.lyricsText, fs.readFileSync(path.join(LYRICS, 'silicon-fortress/faceless-demons.txt'), 'utf8').trim());
  assert.deepEqual(s.sections[0].label, 'Verse 1');
  assert.equal(s.sections[0].lines[0], 'I hear their voices come to me');
});

test('LYR-01: the Portuguese .pt.txt translations are never used by the catalog', () => {
  const keys = Object.keys(catalogData.readLyrics(LYRICS));
  assert.equal(keys.length, 20);
  assert.ok(keys.every(k => !k.endsWith('.pt')), 'no .pt key');
  const c = catalogData();
  for (const album of fs.readdirSync(LYRICS)) {
    for (const file of fs.readdirSync(path.join(LYRICS, album)).filter(f => f.endsWith('.pt.txt'))) {
      const firstLine = fs.readFileSync(path.join(LYRICS, album, file), 'utf8').split('\n').find(l => l.trim() && !l.startsWith('['));
      for (const s of c.songs) assert.ok(!s.lyricsText.includes(firstLine), `${album}/${file} leaked into ${s.slug}`);
    }
  }
});
