const { test } = require('node:test');
const assert = require('node:assert/strict');
const videos = require('../../_data/videos.json');

// SONG-15: a video's uploadDate, when present, is a real YYYY-MM-DD date.
test('SONG-15: every present uploadDate is a valid YYYY-MM-DD date', () => {
  const dated = videos.filter(v => 'uploadDate' in v);
  assert.ok(dated.length > 0, 'at least one video carries an uploadDate');
  for (const v of dated) {
    assert.match(v.uploadDate, /^\d{4}-\d{2}-\d{2}$/, v.slug);
    assert.equal(new Date(`${v.uploadDate}T00:00:00Z`).toISOString().slice(0, 10), v.uploadDate, v.slug);
  }
});
