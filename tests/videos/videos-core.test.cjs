const { test } = require('node:test');
const assert = require('node:assert/strict');
const core = require('../../assets/js/videos-core.js');
const slugs = require('../../_data/videos.json').map(v => v.slug);

test('VPLR-02: shortTitle removes only the "Insane Driver - " prefix', () => {
  assert.equal(core.shortTitle('Insane Driver - Ghosts [Official Lyric Video]'), 'Ghosts [Official Lyric Video]');
  assert.equal(core.shortTitle('Ghosts - Insane Driver - remix'), 'Ghosts - Insane Driver - remix');
});

test('VPLR-03: watchUrl and posterUrl build the exact YouTube URLs', () => {
  assert.equal(core.watchUrl('0Hx9LmWjxQo'), 'https://www.youtube.com/watch?v=0Hx9LmWjxQo');
  assert.equal(core.posterUrl('0Hx9LmWjxQo'), 'https://i.ytimg.com/vi/0Hx9LmWjxQo/hqdefault.jpg');
});

test('VPLR-16: formatCounter zero-pads to two digits over the total', () => {
  assert.equal(core.formatCounter(0, 10), '01 / 10');
  assert.equal(core.formatCounter(2, 10), '03 / 10');
  assert.equal(core.formatCounter(9, 10), '10 / 10');
});

test('VPLR-12: step moves by delta and wraps in both directions', () => {
  assert.equal(core.step(3, 1, 10), 4);
  assert.equal(core.step(3, -1, 10), 2);
  assert.equal(core.step(9, 1, 10), 0);
  assert.equal(core.step(0, -1, 10), 9);
});

test('VPLR-13: step wraps last to first, as used by auto-advance', () => {
  assert.equal(core.step(slugs.length - 1, 1, slugs.length), 0);
});

test('VPLR-28/29: indexFromHash resolves an exact slug with or without "#"', () => {
  assert.equal(core.indexFromHash('#tide-of-fears', slugs), 8);
  assert.equal(core.indexFromHash('change', slugs), 9);
  assert.equal(core.indexFromHash('#keep-away', slugs), 0);
});

test('VPLR-11: indexFromHash returns 0 for empty, unknown and wrong-case hashes', () => {
  assert.equal(core.indexFromHash('', slugs), 0);
  assert.equal(core.indexFromHash('#', slugs), 0);
  assert.equal(core.indexFromHash('#nope', slugs), 0);
  assert.equal(core.indexFromHash('#Ghosts', slugs), 0);
  assert.equal(core.indexFromHash(undefined, slugs), 0);
});
