const { test } = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const { reviewLinks, checkLinks, report } = require('../../scripts/check-review-links.cjs');
const data = require('../../_data/reviews.json');

const stubFetch = statuses => {
  const requested = [];
  const fetch = async url => {
    requested.push(url);
    const status = statuses[url];
    if (status instanceof Error) throw status;
    return { status: status === undefined ? 200 : status };
  };
  return { fetch, requested };
};

test('REV-24: the checker requests every review url and every recognition url', async () => {
  const { fetch, requested } = stubFetch({});
  await checkLinks(reviewLinks(data), fetch);
  const expected = [...data.reviews.map(r => r.url), ...data.recognitions.map(r => r.url)];
  assert.deepEqual([...requested].sort(), [...expected].sort());
});

test('REV-24: 2xx and 3xx pass; 4xx, 5xx and network errors are reported with their status', async () => {
  const links = ['https://a.test/ok', 'https://a.test/moved', 'https://a.test/gone', 'https://a.test/down', 'https://a.test/dns'];
  const { fetch } = stubFetch({
    'https://a.test/ok': 200,
    'https://a.test/moved': 301,
    'https://a.test/gone': 404,
    'https://a.test/down': 503,
    'https://a.test/dns': new Error('getaddrinfo ENOTFOUND a.test'),
  });
  const failures = await checkLinks(links, fetch);
  assert.deepEqual(failures, [
    { url: 'https://a.test/gone', status: 404 },
    { url: 'https://a.test/down', status: 503 },
    { url: 'https://a.test/dns', status: 'getaddrinfo ENOTFOUND a.test' },
  ]);
});

test('REV-24: the report prints each failing url with its status, and says so when every link is fine', () => {
  const out = report([{ url: 'https://a.test/gone', status: 404 }], 3);
  assert.match(out, /404\s+https:\/\/a\.test\/gone/);
  assert.match(out, /1 of 3 links failed/);
  assert.match(report([], 3), /All 3 links answered 2xx or 3xx/);
});

test('REV-25: the link check is not part of npm test or npm run build', () => {
  const { scripts } = require(path.join(__dirname, '../../package.json'));
  const chain = name => {
    const cmd = scripts[name] || '';
    return [cmd, ...[...cmd.matchAll(/npm run ([\w:]+)/g)].map(m => chain(m[1]))].join(' ');
  };
  assert.doesNotMatch(chain('test'), /check-review-links/);
  assert.doesNotMatch(chain('build'), /check-review-links/);
});
