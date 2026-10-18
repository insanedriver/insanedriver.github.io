const { test } = require('node:test');
const assert = require('node:assert/strict');
const { selectSitemapEntries } = require('../../lib/sitemap.js');

const item = (url, data = {}, outputPath = `docs${url}index.html`) => ({ url, outputPath, data });
const urls = items => selectSitemapEntries(items).map(i => i.url);

test('SEO-02: an HTML page with index, follow is kept', () => {
  assert.deepEqual(urls([item('/band/', { page_robots: 'index, follow' })]), ['/band/']);
});

test('SEO-02: a page without page_robots is kept', () => {
  assert.deepEqual(urls([item('/dates/', {})]), ['/dates/']);
});

test('SEO-02: a page with sitemap: false is left out', () => {
  assert.deepEqual(urls([item('/preorder/', { sitemap: false })]), []);
});

test('SEO-02: a page whose robots value contains noindex is left out', () => {
  assert.deepEqual(urls([
    item('/a/', { page_robots: 'noindex' }),
    item('/b/', { page_robots: 'noindex, follow' }),
  ]), []);
});

test('SEO-02: a page whose robots value contains nofollow is left out', () => {
  assert.deepEqual(urls([
    item('/reward/x/', { page_robots: 'nofollow' }),
    item('/c/', { page_robots: 'index, nofollow' }),
  ]), []);
});

test('SEO-02: a non-HTML output is left out', () => {
  assert.deepEqual(urls([
    item('/sitemap.xml', {}, 'docs/sitemap.xml'),
    item('/feed/', {}, false),
  ]), []);
});

test('SEO-02: kept pages come back sorted by URL', () => {
  assert.deepEqual(urls([
    item('/videos/', {}),
    item('/', {}),
    item('/band/', {}),
  ]), ['/', '/band/', '/videos/']);
});
