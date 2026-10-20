const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.join(__dirname, '..', '..');

test('STORE-24: the pre-order styles, script and script include are gone', () => {
  for (const file of ['less/preorder.less', 'assets/js/preorder.js', '_includes/js/preorder.liquid']) {
    assert.equal(fs.existsSync(path.join(root, file)), false, file);
  }
});

// The Less entries: core.less and every page bundle (they replaced style.less).
const ENTRIES = ['less/core.less', ...fs.readdirSync(path.join(root, 'less/pages')).map(f => `less/pages/${f}`)];

test('STORE-24: no Less entry imports preorder.less', () => {
  for (const file of ENTRIES) {
    const style = fs.readFileSync(path.join(root, file), 'utf8');
    assert.doesNotMatch(style, /@import\s+(?:\([^)]*\)\s*)?["'](?:\.\.\/)?preorder\.less["']/, file);
  }
});

test('STORE-23: Silicon Fortress buyers are sent to the store', () => {
  const catalog = JSON.parse(fs.readFileSync(path.join(root, '_data/discography.json'), 'utf8'));
  assert.equal(catalog.albums.find(a => a.slug === 'silicon-fortress').buyCd, '/store/');
});
