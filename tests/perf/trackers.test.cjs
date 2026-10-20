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

// Every <script> tag of a page: [opening tag, inline body].
const scripts = html => [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)].map(m => [m[1], m[2]]);
const occurrences = (text, needle) => text.split(needle).length - 1;

test('PERF-02/03: on every layout page gtm.js and fbevents.js are named once, only inside the deferred loader', () => {
  const pages = layoutPages();
  assert.ok(pages.length > 40, `found ${pages.length} layout pages`);
  for (const [url, html] of pages) {
    for (const src of ['https://www.googletagmanager.com/gtm.js?id=GTM-WW9HZGP', 'https://connect.facebook.net/en_US/fbevents.js']) {
      const name = src.slice(src.lastIndexOf('/') + 1);
      assert.equal(occurrences(html, name), 1, `${url} names ${name} more than once`);
      const holders = scripts(html).filter(([, body]) => body.includes(name));
      assert.equal(holders.length, 1, `${url} ${name} outside a <script> body`);
      const [attrs, body] = holders[0];
      assert.ok(!/\bsrc=/.test(attrs), `${url} ${name} in an external script`);
      // Injected by the loader that waits for load + idle (or the first interaction).
      assert.ok(body.includes(`inject('${src}')`), `${url} ${name} not injected by the loader`);
      assert.match(body, /addEventListener\('load', function \(\) \{\s*if \(w\.requestIdleCallback\)/, `${url} loader not deferred to load`);
    }
  }
});
