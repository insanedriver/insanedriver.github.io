const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { songs } = require('../../_data/songs.json');
const discography = require('../../_data/discography.json');

const ROOT = path.join(__dirname, '../..');
const LYRICS = path.join(ROOT, '_data/lyrics');
const files = suffix => fs.readdirSync(LYRICS).flatMap(album =>
  fs.readdirSync(path.join(LYRICS, album)).filter(f => f.endsWith(suffix)).map(f => `${album}/${f}`));
const english = files('.txt').filter(f => !f.endsWith('.pt.txt'));
const portuguese = files('.pt.txt');
const read = f => fs.readFileSync(path.join(LYRICS, f), 'utf8');
// SLYR-19: the original songs released only as singles keep their lyrics in singles/.
const SINGLE_SONGS = ['the-sun-will-rise', 'waiting-for-you'];
const withLyrics = songs.filter(s => !s.instrumental && s.album).map(s => `${s.album}/${s.slug}`)
  .concat(SINGLE_SONGS.map(slug => `singles/${slug}`)).sort();

// Translated titles that open the Portuguese part of each source sheet.
const TRANSLATED_TITLES = [
  'Pensamentos Enterrados', 'Mudança', 'Respiração Infiel', 'Sonhos Caídos', 'Primeiro Meu Café da Manhã',
  'Tome Decisões', 'Lágrimas De Sangue', 'O Limite da vida', 'Maré de Medos', 'Hoje É Domingo',
  'Era de Mentiras', 'Oração Desesperada', 'Corações Distantes', 'Demônios sem rosto', 'Fantasmas',
  'Realidades Imaginadas', 'Motorista Insano', 'Correntes Invisíveis', 'Mantenha Distância', 'Fortaleza de Silício',
];
const PORTUGUESE_LABELS = ['[Verso', '[Refrão', '[Refrao', '[Ponte', '[Interlúdio', '[Oração', '[Sussuros'];
const PLAIN_LABEL = /^\s*(verse|chorus|bridge|speech|interlude|prayer|whispers|intro|outro|verso|refrão|refrao|ponte|interlúdio|oração|sussuros)( \S+)?:?\s*$/i;
const trackTitle = f => {
  const [album, file] = f.split('/');
  const slug = file.replace(/(\.pt)?\.txt$/, '');
  if (album === 'singles') return discography.singles.find(s => s.slug === slug).title;
  return discography.albums.find(a => a.slug === album).tracks
    .find(t => t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') === slug).title;
};

test('LYR-01: one English .txt and one Portuguese .pt.txt per song with lyrics (22 each)', () => {
  assert.equal(english.length, 22);
  assert.equal(portuguese.length, 22);
  assert.deepEqual(english.map(f => f.replace(/\.txt$/, '')).sort(), withLyrics);
  assert.deepEqual(portuguese.map(f => f.replace(/\.pt\.txt$/, '')).sort(), withLyrics);
});

test('LYR-01: the English files hold no part of the Portuguese translation', () => {
  for (const f of english) {
    const text = read(f);
    for (const marker of PORTUGUESE_LABELS) assert.ok(!text.includes(marker), `${f}: ${marker}`);
    const lines = text.split('\n').map(l => l.trim());
    for (const title of TRANSLATED_TITLES) assert.ok(!lines.includes(title), `${f}: ${title}`);
  }
});

test('LYR-01: no file keeps the title line or a Tema: line', () => {
  for (const f of [...english, ...portuguese]) {
    const lines = read(f).split('\n');
    assert.ok(!lines.some(l => /^\s*tema:/i.test(l)), `${f}: Tema line`);
    assert.notEqual(lines[0].trim().toLowerCase(), trackTitle(f).toLowerCase(), `${f}: title line`);
  }
});

test('LYR-01: section labels are normalized to [Label N] in both languages', () => {
  for (const f of [...english, ...portuguese]) {
    for (const line of read(f).split('\n')) {
      assert.ok(!PLAIN_LABEL.test(line), `${f}: plain label "${line}"`);
      if (line.startsWith('[')) assert.match(line, /^\[[^\][]+\]$/, `${f}: "${line}"`);
      assert.ok(!/\[[^\]]*\b(I|II|III|IV)\]/.test(line), `${f}: roman numeral in "${line}"`);
    }
  }
});

test('LYR-01: trailing spaces trimmed and blank-line runs collapsed', () => {
  for (const f of [...english, ...portuguese]) {
    const text = read(f);
    assert.ok(!/[ \t]+$/m.test(text), `${f}: trailing whitespace`);
    assert.ok(!/\n\n\n/.test(text), `${f}: blank-line run`);
    assert.ok(text.trim().length > 0, `${f}: empty`);
  }
});

const labels = f => read(f).split('\n').filter(l => /^\[.+\]$/.test(l)).map(l => l.slice(1, -1));

test('SLYR-02: the single lyrics carry the agreed sections, in order', () => {
  assert.deepEqual(labels('singles/waiting-for-you.txt'),
    ['Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus']);
  assert.deepEqual(labels('singles/the-sun-will-rise.txt'),
    ['Verse 1', 'Pre-Chorus', 'Chorus', 'Verse 2', 'Pre-Chorus', 'Chorus 2', 'Bridge', 'Pre-Chorus', 'Outro', 'Chorus 3']);
});

test('SLYR-19: each single translation has as many sections as its English file', () => {
  for (const slug of SINGLE_SONGS) {
    assert.equal(labels(`singles/${slug}.pt.txt`).length, labels(`singles/${slug}.txt`).length, slug);
  }
});

test('SLYR-20: the single lyrics use typographic apostrophes and ellipses', () => {
  for (const slug of SINGLE_SONGS) {
    for (const f of [`singles/${slug}.txt`, `singles/${slug}.pt.txt`]) {
      assert.ok(!read(f).includes("'"), `${f}: straight apostrophe`);
      assert.ok(!read(f).includes('...'), `${f}: three dots`);
    }
  }
});

test('LYR-02: the repository has no assets/lyrics directory and the build publishes no lyric sheet', () => {
  assert.equal(fs.existsSync(path.join(ROOT, 'assets/lyrics')), false);
  assert.equal(fs.existsSync(path.join(ROOT, 'docs/assets/lyrics')), false);
});

test('LYR-03: no file name starts with ~$', () => {
  const skip = new Set(['.git', 'node_modules', 'docs']);
  const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? (skip.has(e.name) ? [] : walk(path.join(dir, e.name))) : [path.join(dir, e.name)]);
  assert.deepEqual(walk(ROOT).filter(f => path.basename(f).startsWith('~$')), []);
});
