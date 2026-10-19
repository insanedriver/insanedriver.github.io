const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const LEGACY = ['assets/js/please-wait.min.js', 'less/please-wait.less', 'less/sk-wave.less', 'less/player.less'];

test('HOME-70: the legacy loader and player files are gone', () => {
  for (const file of LEGACY) assert.equal(fs.existsSync(path.join(ROOT, file)), false, file);
});

// The Less entries: core.less and every page bundle (they replaced style.less).
const ENTRIES = ['less/core.less', ...fs.readdirSync(path.join(ROOT, 'less/pages')).map(f => `less/pages/${f}`)];

test('HOME-70: the Less entries import none of them', () => {
  const imports = ENTRIES.flatMap(file => [...fs.readFileSync(path.join(ROOT, file), 'utf8').matchAll(/@import\s+(?:\([^)]*\)\s*)?"([^"]+)"/g)].map(m => path.basename(m[1])));
  assert.ok(imports.includes('home.less'), 'the entries were read');
  for (const name of ['please-wait.less', 'sk-wave.less', 'player.less']) assert.ok(!imports.includes(name), name);
});

test('HOME-70: the compiled stylesheet carries none of their rules', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/css/style.min.css'), 'utf8');
  for (const selector of ['.pg-loading', '.sk-wave', '#player-sf', '#player-id', '.player-art', '.iframe-spotify', '.buy-resources', '.follow-button-spotify']) {
    assert.ok(!css.includes(selector), selector);
  }
});
