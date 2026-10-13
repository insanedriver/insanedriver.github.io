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

test('STORE-24: style.less no longer imports preorder.less', () => {
  const style = fs.readFileSync(path.join(root, 'less/style.less'), 'utf8');
  assert.doesNotMatch(style, /@import\s+["']preorder\.less["']/);
});
