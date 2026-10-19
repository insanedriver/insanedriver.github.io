const { test } = require('node:test');
const assert = require('node:assert/strict');
const { builtPages } = require('./built.cjs');

test('PERF-01: no built page references the Universal Analytics script or property', () => {
  const pages = builtPages();
  assert.ok(pages.length > 40, `found ${pages.length} pages`);
  for (const [url, html] of pages) {
    assert.ok(!html.includes('google-analytics.com/analytics.js'), `${url} loads analytics.js`);
    assert.ok(!html.includes('UA-60390716-1'), `${url} references UA-60390716-1`);
  }
});
