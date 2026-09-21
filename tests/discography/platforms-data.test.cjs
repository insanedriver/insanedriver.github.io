const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const platforms = require('../../_data/platforms.json');

const fontAwesome = fs.readFileSync(path.join(__dirname, '../../less/font-awesome.less'), 'utf8');

test('DISC-02: the registry lists exactly the eight supported platforms', () => {
  assert.deepEqual(platforms.map(p => p.key), [
    'spotify', 'apple', 'ytmusic', 'deezer', 'tidal', 'amazon', 'pandora', 'bandcamp'
  ]);
});

test('DISC-04: spotify and apple are the only primaries and lead the order', () => {
  assert.deepEqual(platforms.filter(p => p.primary).map(p => p.key), ['spotify', 'apple']);
  assert.deepEqual(platforms.slice(0, 2).map(p => p.key), ['spotify', 'apple']);
});

test('DISC-02: every platform carries a name, a sub-label and a boolean primary flag', () => {
  for (const p of platforms) {
    assert.ok(p.name && p.name.trim().length > 0, p.key);
    assert.ok(p.sub && p.sub.trim().length > 0, p.key);
    assert.equal(typeof p.primary, 'boolean', p.key);
  }
});

test('DISC-02: every icon class is defined in the bundled Font Awesome', () => {
  for (const p of platforms) {
    assert.match(p.icon, /^fa-[a-z-]+$/, p.key);
    assert.ok(fontAwesome.includes(`.${p.icon}:before`), `${p.key}: ${p.icon} is not in less/font-awesome.less`);
  }
});
