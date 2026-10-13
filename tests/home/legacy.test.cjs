const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..', '..');
const LEGACY = ['assets/js/please-wait.min.js', 'less/please-wait.less', 'less/sk-wave.less', 'less/player.less'];

test('HOME-70: the legacy loader and player files are gone', () => {
  for (const file of LEGACY) assert.equal(fs.existsSync(path.join(ROOT, file)), false, file);
});

test('HOME-70: style.less imports none of them', () => {
  const imports = [...fs.readFileSync(path.join(ROOT, 'less/style.less'), 'utf8').matchAll(/@import\s+"([^"]+)"/g)].map(m => m[1]);
  for (const name of ['please-wait.less', 'sk-wave.less', 'player.less']) assert.ok(!imports.includes(name), name);
});

test('HOME-70: the compiled stylesheet carries none of their rules', () => {
  const css = fs.readFileSync(path.join(ROOT, 'assets/css/style.min.css'), 'utf8');
  for (const selector of ['.pg-loading', '.sk-wave', '#player-sf', '#player-id', '.player-art', '.iframe-spotify', '.buy-resources', '.follow-button-spotify']) {
    assert.ok(!css.includes(selector), selector);
  }
});
