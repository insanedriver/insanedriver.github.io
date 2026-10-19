const { test } = require('node:test');
const assert = require('node:assert/strict');
const { builtPages, layoutPages } = require('./built.cjs');

test('PERF-01: no built page references the Universal Analytics script or property', () => {
  const pages = builtPages();
  assert.ok(pages.length > 40, `found ${pages.length} pages`);
  for (const [url, html] of pages) {
    assert.ok(!html.includes('google-analytics.com/analytics.js'), `${url} loads analytics.js`);
    assert.ok(!html.includes('UA-60390716-1'), `${url} references UA-60390716-1`);
  }
});

test('PERF-06: every layout page keeps the GTM <noscript> iframe and the Pixel <noscript> image', () => {
  const pages = layoutPages();
  assert.ok(pages.length > 40, `found ${pages.length} layout pages`);
  for (const [url, html] of pages) {
    assert.match(html, /<noscript><iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-WW9HZGP"[^>]*><\/iframe><\/noscript>/, `${url} GTM noscript`);
    assert.match(html, /<noscript><img [^>]*src="https:\/\/www\.facebook\.com\/tr\?id=379421529852933&(amp;)?ev=PageView&(amp;)?noscript=1"[^>]*><\/noscript>/, `${url} Pixel noscript`);
  }
});
