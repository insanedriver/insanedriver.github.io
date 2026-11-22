const { test } = require('node:test');
const assert = require('node:assert/strict');

const data = require('../../_data/reviews.json');
const albums = require('../../_data/discography.json').albums.map(a => a.slug);

const REQUIRED = ['album', 'outlet', 'date', 'language', 'quote', 'quoteOriginal', 'summary', 'url'];
const ISO_DATE = /^\d{4}(-\d{2}(-\d{2})?)?$/;

test('REV-13: every review has the required non-empty fields, a discography album slug and an ISO date', () => {
  assert.ok(data.reviews.length > 0);
  for (const r of data.reviews) {
    for (const field of REQUIRED) {
      assert.equal(typeof r[field], 'string', `${r.outlet} ${field} is a string`);
      assert.notEqual(r[field].trim(), '', `${r.outlet} ${field} is non-empty`);
    }
    assert.ok(albums.includes(r.album), `${r.outlet} album "${r.album}" is a discography slug`);
    assert.match(r.date, ISO_DATE, `${r.outlet} date`);
    assert.match(r.url, /^https?:\/\//, `${r.outlet} url`);
  }
});

test('REV-13: the sweep found 12 Insane Driver and 6 Silicon Fortress reviews', () => {
  const count = slug => data.reviews.filter(r => r.album === slug).length;
  assert.equal(count('insane-driver'), 12);
  assert.equal(count('silicon-fortress'), 6);
  assert.equal(data.reviews.length, 18);
});

test('REV-14: an archived review links to web.archive.org and keeps its originalUrl', () => {
  const archived = data.reviews.filter(r => r.archived);
  assert.equal(archived.length, 3, 'Hard\'n Heavy, Gaveta de Bagunças, Cangaço Rádio Rock');
  for (const r of archived) {
    assert.ok(r.url.startsWith('https://web.archive.org/'), `${r.outlet} url is a Wayback URL`);
    assert.equal(typeof r.originalUrl, 'string', `${r.outlet} has originalUrl`);
    assert.ok(r.url.endsWith(r.originalUrl), `${r.outlet} snapshot is of its originalUrl`);
  }
  for (const r of data.reviews.filter(r => !r.archived)) {
    assert.ok(!r.url.startsWith('https://web.archive.org/'), `${r.outlet} is not archived but links to Wayback`);
  }
});

test('REV-15: exactly Roadie Crew, Whiplash.Net and Heavy And Hell (Silicon Fortress) are featured, in that order', () => {
  const featured = data.reviews.filter(r => r.featured === true).map(r => `${r.outlet}|${r.album}`);
  assert.deepEqual(featured, ['Roadie Crew|insane-driver', 'Whiplash.Net|insane-driver', 'Heavy And Hell|silicon-fortress']);
});

test('REV-16: no two reviews share a url', () => {
  const urls = data.reviews.map(r => r.url);
  assert.equal(new Set(urls).size, urls.length);
});

test('REV-11: every recognition has a title, an outlet, a year and a url', () => {
  assert.equal(data.recognitions.length, 3);
  for (const r of data.recognitions) {
    for (const field of ['title', 'outlet', 'year', 'url']) {
      assert.notEqual(String(r[field] || '').trim(), '', `${r.outlet} ${field}`);
    }
    assert.match(r.url, /^https?:\/\//);
  }
});
