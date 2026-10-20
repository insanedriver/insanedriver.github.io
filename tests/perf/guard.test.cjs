// Regression guard (PERF-37/38): fails if the weight this feature removed comes back.
// Reads the built site and the compiled CSS: run `npm run build` first.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { layoutPages } = require('./built.cjs');

const PLAYLIST_PICKER = '/pre-save/spotify-select-playlist/';
// [label, pattern] for every reference no layout page may carry.
const BANNED = [
  ['jquery.min.js', /jquery\.min\.js/],
  ['bootstrap.min.js', /bootstrap\.min\.js/],
  ['owl.carousel.min.js', /owl\.carousel\.min\.js/],
  ['insane.js', /\binsane\.js\b/],
  ['analytics.js', /google-analytics\.com\/analytics\.js/],
  ['UA-60390716-1', /UA-60390716-1/],
  ['style.min.css', /style\.min\.css/],
  ['Google Fonts', /fonts\.(googleapis|gstatic)\.com/],
  ['Glyphicons', /glyphicon/i],
];

// The banned references in one built page; the playlist picker may keep jQuery (PERF-08).
function violations(url, html) {
  return BANNED.filter(([label, pattern]) => pattern.test(html) && !(url === PLAYLIST_PICKER && label === 'jquery.min.js'))
    .map(([label]) => label);
}

const CORE_CSS = path.join(__dirname, '../../assets/css/core.min.css');
const CORE_LIMIT = 200 * 1024;

test('PERF-37: no built layout page references a removed script, style.min.css, Google Fonts or Glyphicons', () => {
  const pages = layoutPages();
  assert.ok(pages.length > 20, `only ${pages.length} layout pages found`);
  assert.ok(pages.some(([url]) => url === PLAYLIST_PICKER), 'the playlist picker was checked');
  for (const [url, html] of pages) assert.deepEqual(violations(url, html), [], url);
});

test('PERF-38: core.min.css is at most 200 KB', () => {
  const size = fs.statSync(CORE_CSS).size;
  assert.ok(size <= CORE_LIMIT, `core.min.css is ${size} bytes`);
});

module.exports = { violations, CORE_LIMIT };
