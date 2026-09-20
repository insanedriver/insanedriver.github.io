const { test } = require('node:test');
const assert = require('node:assert/strict');
const videos = require('../../_data/videos.json');

test('VPLR-05: catalog has 10 entries in the spec order with the original YouTube ids', () => {
  assert.deepEqual(videos.map(v => v.slug), [
    'keep-away', 'ghosts', 'distant-hearts', 'desperate-prayer', 'imagined-realities',
    'silicon-fortress', 'today-is-sunday', 'buried-thoughts', 'tide-of-fears', 'change'
  ]);
  assert.deepEqual(videos.map(v => v.id), [
    'PTT5D9qFKcg', '0Hx9LmWjxQo', 'dvFAJez2xEw', 'vJl7VaET5QU', 'QhPJuVkPNNY',
    '_2zR4uHhIBk', '9vjR56iVLq8', 'gV4XZMaa9wQ', 'vif1ku9btbM', 'iR7k_6wKnxE'
  ]);
});

test('VPLR-05: ids and slugs are unique and slugs are lowercase kebab-case', () => {
  assert.equal(new Set(videos.map(v => v.id)).size, 10);
  assert.equal(new Set(videos.map(v => v.slug)).size, 10);
  for (const v of videos) assert.match(v.slug, /^[a-z0-9]+(-[a-z0-9]+)*$/);
});

test('VPLR-02/05: every entry has a type from the allowed set and an "Insane Driver - " title', () => {
  const allowed = ['MUSIC VIDEO', 'LYRIC VIDEO', 'ACOUSTIC', 'LIVE'];
  for (const v of videos) {
    assert.ok(allowed.includes(v.type), `${v.slug}: ${v.type}`);
    assert.ok(v.title.startsWith('Insane Driver - '), v.slug);
  }
});
