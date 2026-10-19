const { test } = require('node:test');
const assert = require('node:assert/strict');
const { layoutPages } = require('./built.cjs');

const REMOVED = ['jquery.min.js', 'bootstrap.min.js', 'owl.carousel.min.js', 'insane.js'];

// Every <script> tag that has a src, as { src, tag }.
const scriptTags = html => [...html.matchAll(/<script\b[^>]*>/g)]
  .map(m => ({ tag: m[0], src: (m[0].match(/\bsrc="([^"]+)"/) || [])[1] }))
  .filter(s => s.src);
const isLocal = src => src.startsWith('/') && !src.startsWith('//');
const removedIn = html => REMOVED.filter(name => html.includes(name));

const assertDeferred = (url, html) => {
  for (const s of scriptTags(html).filter(s => isLocal(s.src))) {
    assert.match(s.tag, /\s(defer|async)(\s|=|>)/, `${url}: ${s.src} is neither defer nor async`);
  }
};

// Pages whose jspath is one of the page-script includes (home, photos, videos, discography, song).
const PAGE_SCRIPT = /\/assets\/js\/(home|photos|videos|discography|song)\.js/;
const scriptPages = () => layoutPages().filter(([, html]) => PAGE_SCRIPT.test(html));

test('PERF-07/11: pages on the page-script includes load no jQuery, Bootstrap, Owl or insane.js, and defer every local script', () => {
  const pages = scriptPages();
  const urls = pages.map(([url]) => url);
  // home, photos, videos, 4 reward pages, discography, 8 releases, 22 songs
  assert.equal(pages.length, 38, urls.join(' '));
  for (const url of ['/', '/photos/', '/videos/', '/discography/', '/discography/silicon-fortress/',
    '/discography/silicon-fortress/faceless-demons/', '/reward/pre-save-silicon-single/']) {
    assert.ok(urls.includes(url), url);
  }
  for (const [url, html] of pages) {
    assert.deepEqual(removedIn(html), [], url);
    assert.ok(scriptTags(html).some(s => isLocal(s.src)), `${url} has local scripts`);
    assertDeferred(url, html);
  }
});
