const { test } = require('node:test');
const assert = require('node:assert/strict');
const { songKey, build } = require('../../lib/catalog.js');
const discography = require('../../_data/discography.json');
const songs = require('../../_data/songs.json');
const videos = require('../../_data/videos.json');

// Real catalog data; stand-in lyrics for every song that has words.
const fakeLyrics = () => Object.fromEntries(songs.songs.filter(s => !s.instrumental)
  .map(s => [`${s.album}/${s.slug}`, `[Verse 1]\n${s.slug} line one\n${s.slug} line two\n`]));
const catalog = (overrides = {}) => build(Object.assign({ discography, songs, lyrics: fakeLyrics(), videos }, overrides));
const song = (c, slug) => c.songs.find(s => s.slug === slug);

test('songKey strips the deluxe and acoustic suffixes and kebab-cases', () => {
  assert.equal(songKey('Tide of Fears (Acoustic Version)'), 'tide-of-fears');
  assert.equal(songKey('Buried Thoughts (Deluxe Version)'), 'buried-thoughts');
  assert.equal(songKey('Keep Away (Acoustic)'), 'keep-away');
  assert.equal(songKey('Back To 1994'), 'back-to-1994');
  assert.equal(songKey('Today Is Sunday (Eder Franco)'), 'today-is-sunday-eder-franco');
});

test('SONG-01/02: 22 song pages, one per song, at /discography/<album>/<song>/', () => {
  const c = catalog();
  assert.equal(c.songs.length, 22);
  assert.equal(new Set(c.songs.map(s => s.url)).size, 22);
  assert.equal(song(c, 'faceless-demons').url, '/discography/silicon-fortress/faceless-demons/');
  assert.equal(song(c, 'back-to-1994').url, '/discography/silicon-fortress/back-to-1994/');
  assert.equal(song(c, 'endless-path').url, '/discography/insane-driver/endless-path/');
  for (const s of c.songs) assert.equal(s.url, `/discography/${s.album.slug}/${s.slug}/`);
  assert.deepEqual(c.songs.filter(s => s.album.slug === 'insane-driver').length, 11);
  assert.deepEqual(c.songs.filter(s => s.album.slug === 'silicon-fortress').length, 11);
});

test('SONG-01: a song carries its title, album, position and duration from discography.json', () => {
  const s = song(catalog(), 'faceless-demons');
  const track = discography.albums.find(a => a.slug === 'silicon-fortress').tracks[1];
  assert.equal(s.title, 'Faceless Demons');
  assert.equal(s.position, 2);
  assert.equal(s.duration, track.duration);
  assert.deepEqual(s.album, {
    slug: 'silicon-fortress', title: 'Silicon Fortress', year: 2021, url: '/discography/silicon-fortress/',
    cover: discography.albums[0].cover, links: discography.albums[0].links,
  });
});

test('REL-01: release pages exactly for the 3 albums and the 4 singles that fold into no song', () => {
  const c = catalog();
  assert.deepEqual(c.releases.map(r => r.slug).sort(), [
    'change-live', 'insane-driver', 'insane-driver-deluxe', 'silicon-fortress',
    'the-sun-will-rise', 'today-is-sunday-eder-franco', 'waiting-for-you',
  ]);
  for (const r of c.releases) assert.equal(r.url, `/discography/${r.slug}/`);
  assert.equal(c.releases.find(r => r.slug === 'silicon-fortress').description, songs.releases['silicon-fortress']);
});

test('REL-03: album tracks are in order and link to the song pages; deluxe versions resolve to the base songs', () => {
  const c = catalog();
  const sf = c.releases.find(r => r.slug === 'silicon-fortress');
  assert.deepEqual(sf.tracks.map(t => t.position), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
  assert.equal(sf.tracks[1].url, '/discography/silicon-fortress/faceless-demons/');
  const deluxe = c.releases.find(r => r.slug === 'insane-driver-deluxe');
  assert.equal(deluxe.tracks.length, 15);
  assert.equal(deluxe.tracks.find(t => t.title === 'Buried Thoughts (Deluxe Version)').url, '/discography/insane-driver/buried-thoughts/');
  assert.equal(deluxe.tracks.find(t => t.title === 'Tide of Fears (Acoustic Version)').url, '/discography/insane-driver/tide-of-fears/');
  assert.equal(deluxe.tracks.find(t => t.title === 'Today Is Sunday (Deluxe Version)').url, '/discography/insane-driver/today-is-sunday/');
});

test('REL-06: the Eder Franco and live releases link to the Today Is Sunday and Change songs', () => {
  const c = catalog();
  assert.equal(c.releases.find(r => r.slug === 'today-is-sunday-eder-franco').songUrl, '/discography/insane-driver/today-is-sunday/');
  assert.equal(c.releases.find(r => r.slug === 'change-live').songUrl, '/discography/insane-driver/change/');
  assert.equal(c.releases.find(r => r.slug === 'waiting-for-you').songUrl, null);
});

// Spec mapping: single slug -> song it folds into (Also released as, no page of its own).
const FOLDS = {
  'keep-away': 'keep-away', 'keep-away-acoustic': 'keep-away', 'fallen-dreams-acoustic': 'fallen-dreams',
  'tide-of-fears': 'tide-of-fears', 'tide-of-fears-acoustic': 'tide-of-fears',
  'insane-driver-single': 'insane-driver', 'silicon-fortress-single': 'silicon-fortress',
  'invisible-chains': 'invisible-chains', 'age-of-lies': 'age-of-lies', 'ghosts': 'ghosts',
  'distant-hearts': 'distant-hearts', 'desperate-prayer': 'desperate-prayer',
  'imagined-realities': 'imagined-realities', 'firstly-my-breakfast': 'firstly-my-breakfast',
};

test('SONG-08: every single folds into its song per the spec mapping, with its year and links and no page', () => {
  const c = catalog();
  for (const [singleSlug, songSlug] of Object.entries(FOLDS)) {
    const single = discography.singles.find(s => s.slug === singleSlug);
    const entry = song(c, songSlug).alsoReleasedAs.find(e => e.title === single.title && e.year === single.year);
    assert.ok(entry, `${singleSlug} under ${songSlug}`);
    assert.deepEqual(entry.links, single.links, singleSlug);
    assert.equal(entry.url, null, singleSlug);
    assert.deepEqual(c.links[singleSlug], { page: song(c, songSlug).url, tracks: {} }, singleSlug);
  }
  assert.deepEqual(song(c, 'keep-away').alsoReleasedAs.map(e => e.title), ['Keep Away', 'Keep Away (Acoustic)']);
});

test('SONG-08: the Eder Franco and live versions appear under their songs with their page URL', () => {
  const c = catalog();
  const sunday = song(c, 'today-is-sunday').alsoReleasedAs;
  const deluxeTitle = discography.albums.find(a => a.slug === 'insane-driver-deluxe').title;
  assert.deepEqual(sunday.map(e => [e.title, e.year, e.url]), [
    ['Today Is Sunday (Eder Franco)', 2017, '/discography/today-is-sunday-eder-franco/'],
    [deluxeTitle, 2018, '/discography/insane-driver-deluxe/'],
  ]);
  const change = song(c, 'change').alsoReleasedAs;
  assert.deepEqual(change[0], {
    title: 'Change (Live)', year: 2015, releaseDate: '2015-12-17',
    links: discography.singles.find(s => s.slug === 'change-live').links, url: '/discography/change-live/',
  });
});

test('SONG-08: the deluxe edition is listed on each of the 11 debut songs and on no Silicon Fortress song', () => {
  const c = catalog();
  const deluxe = discography.albums.find(a => a.slug === 'insane-driver-deluxe');
  for (const s of c.songs) {
    const listed = s.alsoReleasedAs.some(e => e.url === '/discography/insane-driver-deluxe/' && e.title === deluxe.title && e.year === 2018);
    assert.equal(listed, s.album.slug === 'insane-driver', s.slug);
  }
  assert.deepEqual(song(c, 'back-to-1994').alsoReleasedAs, []);
});

test('SONG-10: previous and next tracks of the album, omitted on the first and last track', () => {
  const c = catalog();
  assert.equal(song(c, 'back-to-1994').prev, null);
  assert.deepEqual(song(c, 'back-to-1994').next, { title: 'Faceless Demons', url: '/discography/silicon-fortress/faceless-demons/' });
  assert.deepEqual(song(c, 'faceless-demons').prev, { title: 'Back To 1994', url: '/discography/silicon-fortress/back-to-1994/' });
  assert.deepEqual(song(c, 'distant-hearts').prev, { title: 'Invisible Chains', url: '/discography/silicon-fortress/invisible-chains/' });
  assert.equal(song(c, 'distant-hearts').next, null);
  assert.equal(song(c, 'endless-path').prev, null);
  assert.equal(song(c, 'tears-of-blood').next, null);
});

test('SONG-04: labelled sections become label + lines, blank lines inside a section are kept', () => {
  const lyrics = fakeLyrics();
  lyrics['silicon-fortress/ghosts'] = '[Verse 1]\nSearching for\nSomething\n\n[Chorus]\nYou know\n\nDon\'t leave me\n';
  const s = song(catalog({ lyrics }), 'ghosts');
  assert.deepEqual(s.sections, [
    { label: 'Verse 1', lines: ['Searching for', 'Something'] },
    { label: 'Chorus', lines: ['You know', '', 'Don\'t leave me'] },
  ]);
  assert.equal(s.lyricsText, '[Verse 1]\nSearching for\nSomething\n\n[Chorus]\nYou know\n\nDon\'t leave me');
  assert.equal(s.instrumental, false);
});

test('SONG-04: lines before the first label, or a file with no labels, form an unlabelled section', () => {
  const lyrics = fakeLyrics();
  lyrics['insane-driver/change'] = 'When you see yourself\nWhat do you seek?\n\nChorus I\nLine\n';
  lyrics['insane-driver/fallen-dreams'] = 'Intro line\n\n[Chorus]\nHow could I know?\n';
  const c = catalog({ lyrics });
  assert.deepEqual(song(c, 'change').sections, [{ label: null, lines: ['When you see yourself', 'What do you seek?', '', 'Chorus I', 'Line'] }]);
  assert.deepEqual(song(c, 'fallen-dreams').sections, [
    { label: null, lines: ['Intro line'] },
    { label: 'Chorus', lines: ['How could I know?'] },
  ]);
});

test('SONG-05: instrumentals have no sections and no lyrics text', () => {
  const c = catalog();
  for (const slug of ['endless-path', 'back-to-1994']) {
    assert.equal(song(c, slug).instrumental, true);
    assert.deepEqual(song(c, slug).sections, []);
    assert.equal(song(c, slug).lyricsText, '');
  }
});

test('SONG-06: About text when songs.json has one, null otherwise', () => {
  const c = catalog();
  assert.equal(song(c, 'faceless-demons').about, songs.songs.find(s => s.slug === 'faceless-demons').about);
  assert.equal(song(c, 'endless-path').about, null);
  assert.equal(song(c, 'back-to-1994').about, null);
});

test('SONG-11: a song gets the video whose slug equals its own, or null', () => {
  const c = catalog();
  assert.deepEqual(song(c, 'ghosts').video, videos.find(v => v.id === '0Hx9LmWjxQo'));
  assert.equal(song(c, 'faceless-demons').video, null);
});

test('LYR-05: a song with no lyrics file that is not instrumental fails the build, naming the song', () => {
  const lyrics = fakeLyrics();
  delete lyrics['silicon-fortress/ghosts'];
  assert.throws(() => catalog({ lyrics }), { message: 'seo-discovery: ghosts has no lyrics file and is not instrumental' });
});

test('LYR-04: a song referencing an unknown track or album fails the build', () => {
  const withSong = extra => Object.assign({}, songs, { songs: [...songs.songs, extra] });
  assert.throws(() => catalog({ songs: withSong({ slug: 'no-such-song', album: 'silicon-fortress' }) }),
    { message: 'seo-discovery: no-such-song references unknown album/track' });
  assert.throws(() => catalog({ songs: withSong({ slug: 'ghosts', album: 'no-such-album' }) }),
    { message: 'seo-discovery: ghosts references unknown album/track' });
});

test('IDX-01..03 data: links give each album its page and track URLs, and each single its page', () => {
  const c = catalog();
  assert.equal(c.links['silicon-fortress'].page, '/discography/silicon-fortress/');
  assert.equal(c.links['silicon-fortress'].tracks[2], '/discography/silicon-fortress/faceless-demons/');
  assert.equal(c.links['insane-driver-deluxe'].tracks[13], '/discography/insane-driver/buried-thoughts/');
  assert.equal(c.links['waiting-for-you'].page, '/discography/waiting-for-you/');
  assert.equal(c.links['change-live'].page, '/discography/change-live/');
  assert.equal(Object.keys(c.links).length, discography.albums.length + discography.singles.length);
});

test('SONG-07 data: a song links to its own track per platform and falls back to the album', () => {
  const s = song(catalog(), 'ghosts');
  const album = discography.albums.find(a => a.slug === 'silicon-fortress');
  const own = songs.songs.find(x => x.slug === 'ghosts').links;
  assert.equal(s.listen.links.spotify, own.spotify);
  assert.notEqual(s.listen.links.spotify, album.links.spotify);
  assert.equal(s.listen.links.tidal, album.links.tidal);
  assert.equal(s.listen.links.pandora, null);
  assert.deepEqual(s.listen.track, own);
  assert.deepEqual(s.sameAs, Object.values(own));
});

test('SONG-07 data: a song without track links uses the album links and has no sameAs', () => {
  const bare = Object.assign({}, songs, { songs: songs.songs.map(x => (x.slug === 'ghosts' ? Object.assign({}, x, { links: undefined }) : x)) });
  const s = song(catalog({ songs: bare }), 'ghosts');
  const album = discography.albums.find(a => a.slug === 'silicon-fortress');
  assert.deepEqual(s.listen.links, album.links);
  assert.deepEqual(s.listen.track, {});
  assert.deepEqual(s.sameAs, []);
});
