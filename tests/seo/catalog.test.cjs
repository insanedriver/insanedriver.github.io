const { test } = require('node:test');
const assert = require('node:assert/strict');
const { songKey, sectionFamily, albumCode, uplink, songLayout, listenUrl, build } = require('../../lib/catalog.js');
const discography = require('../../_data/discography.json');
const songs = require('../../_data/songs.json');
const videos = require('../../_data/videos.json');
const platforms = require('../../_data/platforms.json');

// Real catalog data; stand-in lyrics for every song that has words.
const fakeLyrics = () => Object.fromEntries(songs.songs.filter(s => !s.instrumental)
  .map(s => [`${s.single ? 'singles' : s.album}/${s.slug}`, `[Verse 1]\n${s.slug} line one\n${s.slug} line two\n`]));
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
  assert.equal(c.songs.length, 24);
  assert.equal(new Set(c.songs.map(s => s.url)).size, 24);
  assert.equal(song(c, 'faceless-demons').url, '/discography/silicon-fortress/faceless-demons/');
  assert.equal(song(c, 'back-to-1994').url, '/discography/silicon-fortress/back-to-1994/');
  assert.equal(song(c, 'endless-path').url, '/discography/insane-driver/endless-path/');
  for (const s of c.songs.filter(x => !x.single)) assert.equal(s.url, `/discography/${s.album.slug}/${s.slug}/`);
  assert.equal(song(c, 'waiting-for-you').url, '/discography/waiting-for-you/');
  assert.equal(song(c, 'the-sun-will-rise').url, '/discography/the-sun-will-rise/');
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

test('REL-01/SLYR-05: release pages exactly for the 3 albums and the 3 singles that fold into no song and own none', () => {
  const c = catalog();
  assert.deepEqual(c.releases.map(r => r.slug).sort(), [
    'change-live', 'fallen-dreams-acoustic', 'insane-driver', 'insane-driver-deluxe', 'silicon-fortress',
    'today-is-sunday-eder-franco',
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
  assert.equal(c.releases.some(r => r.slug === 'waiting-for-you'), false);
  assert.equal(c.releases.find(r => r.slug === 'fallen-dreams-acoustic').songUrl, '/discography/insane-driver/fallen-dreams/');
  assert.equal(song(c, 'fallen-dreams').alsoReleasedAs.find(e => e.title === 'Fallen Dreams (Acoustic)').url, '/discography/fallen-dreams-acoustic/');
});

test('the song page shows the cover of the single named after the song, else the album cover', () => {
  const c = catalog();
  assert.deepEqual(song(c, 'keep-away').cover, { file: 'keep-away.jpg', alt: 'Keep Away single cover' });
  assert.deepEqual(song(c, 'silicon-fortress').cover, { file: 'silicon-fortress-single.jpg', alt: 'Silicon Fortress single cover' });
  assert.deepEqual(song(c, 'tide-of-fears').cover, { file: 'tide-of-fears.jpg', alt: 'Tide of Fears single cover' });
  assert.deepEqual(song(c, 'fallen-dreams').cover, { file: 'insane-driver.jpg', alt: 'Insane Driver cover' });
  assert.deepEqual(song(c, 'faceless-demons').cover, { file: 'silicon-fortress.jpg', alt: 'Silicon Fortress cover' });
});

// Spec mapping: single slug -> song it folds into (Also released as, no page of its own).
const FOLDS = {
  'keep-away': 'keep-away', 'keep-away-acoustic': 'keep-away',
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
  assert.deepEqual(song(c, 'back-to-1994').next, { title: 'Faceless Demons', url: '/discography/silicon-fortress/faceless-demons/', number: '02' });
  assert.deepEqual(song(c, 'faceless-demons').prev, { title: 'Back To 1994', url: '/discography/silicon-fortress/back-to-1994/', number: '01' });
  assert.deepEqual(song(c, 'distant-hearts').prev, { title: 'Invisible Chains', url: '/discography/silicon-fortress/invisible-chains/', number: '10' });
  assert.equal(song(c, 'distant-hearts').next, null);
  assert.equal(song(c, 'endless-path').prev, null);
  assert.equal(song(c, 'tears-of-blood').next, null);
});

test('SONG-04: labelled sections become label + lines, blank lines inside a section are kept', () => {
  const lyrics = fakeLyrics();
  lyrics['silicon-fortress/ghosts'] = '[Verse 1]\nSearching for\nSomething\n\n[Chorus]\nYou know\n\nDon\'t leave me\n';
  const s = song(catalog({ lyrics }), 'ghosts');
  assert.deepEqual(s.sections, [
    { label: 'Verse 1', lines: ['Searching for', 'Something'], family: 'verse' },
    { label: 'Chorus', lines: ['You know', '', 'Don\'t leave me'], family: 'chorus' },
  ]);
  assert.equal(s.lyricsText, '[Verse 1]\nSearching for\nSomething\n\n[Chorus]\nYou know\n\nDon\'t leave me');
  assert.equal(s.instrumental, false);
});

test('SONG-04: lines before the first label, or a file with no labels, form an unlabelled section', () => {
  const lyrics = fakeLyrics();
  lyrics['insane-driver/change'] = 'When you see yourself\nWhat do you seek?\n\nChorus I\nLine\n';
  lyrics['insane-driver/fallen-dreams'] = 'Intro line\n\n[Chorus]\nHow could I know?\n';
  const c = catalog({ lyrics });
  assert.deepEqual(song(c, 'change').sections, [{ label: null, lines: ['When you see yourself', 'What do you seek?', '', 'Chorus I', 'Line'], family: null }]);
  assert.deepEqual(song(c, 'fallen-dreams').sections, [
    { label: null, lines: ['Intro line'], family: null },
    { label: 'Chorus', lines: ['How could I know?'], family: 'chorus' },
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

// BENTO-27: each label family on its own, so no branch masks another (L-024).
test('BENTO-27: sectionFamily maps a label to verse, chorus, bridge or other, and no label to null', () => {
  for (const label of ['Verse', 'Verse 1', 'Verse 2']) assert.equal(sectionFamily(label), 'verse', label);
  for (const label of ['Chorus', 'Chorus 1', 'Chorus 2']) assert.equal(sectionFamily(label), 'chorus', label);
  for (const label of ['Bridge', 'Bridge 1', 'Bridge 3']) assert.equal(sectionFamily(label), 'bridge', label);
  assert.equal(sectionFamily('Interlude'), 'bridge');
  assert.equal(sectionFamily('Prayer'), 'other');
  assert.equal(sectionFamily('Outro'), 'other');
  assert.equal(sectionFamily(null), null);
});

test('BENTO-27: built sections carry their family', () => {
  const lyrics = Object.assign(fakeLyrics(), { 'silicon-fortress/keep-away': 'intro line\n[Verse 1]\na\n[Bridge]\nb\n[Chorus]\nc\n[Interlude]\n[Prayer]\nd\n' });
  const s = song(catalog({ lyrics }), 'keep-away');
  assert.deepEqual(s.sections.map(x => [x.label, x.family]), [
    [null, null], ['Verse 1', 'verse'], ['Bridge', 'bridge'], ['Chorus', 'chorus'], ['Interlude', 'bridge'], ['Prayer', 'other'],
  ]);
});

test('BENTO-32: albumCode is the uppercase initials of the album title words', () => {
  assert.equal(albumCode('Silicon Fortress'), 'SF');
  assert.equal(albumCode('Insane Driver'), 'ID');
  assert.equal(albumCode('insane driver deluxe'), 'IDD');
});

test('BENTO-26/32/35: a song carries its two-digit number and catalog code', () => {
  const c = catalog();
  assert.equal(song(c, 'keep-away').number, '03');
  assert.equal(song(c, 'keep-away').catalogCode, 'SF-TRACK-03');
  assert.equal(song(c, 'today-is-sunday').catalogCode, 'ID-TRACK-08');
  assert.equal(song(c, 'distant-hearts').number, '11');
  assert.equal(song(c, 'distant-hearts').catalogCode, 'SF-TRACK-11');
  assert.equal(song(c, 'keep-away').prev.number, '02');
  assert.equal(song(c, 'keep-away').next.number, '04');
});

const UPLINK_ORDER = ['spotify', 'apple', 'ytmusic', 'bandcamp', 'deezer', 'tidal', 'amazon', 'pandora'];
const TRACK_SUB = { spotify: 'Play the track', apple: 'Play the track', ytmusic: 'Audio stream', bandcamp: 'Lossless download' };
const allLinks = prefix => Object.fromEntries(UPLINK_ORDER.map(k => [k, `${prefix}/${k}`]));

test('BENTO-18: uplink lists Spotify, Apple, YT Music, Bandcamp as primary, then Deezer, Tidal, Amazon, Pandora', () => {
  const list = uplink(platforms, { links: allLinks('https://album'), track: {} });
  assert.deepEqual(list.map(e => [e.key, e.primary]), [
    ['spotify', true], ['apple', true], ['ytmusic', true], ['bandcamp', true],
    ['deezer', false], ['tidal', false], ['amazon', false], ['pandora', false],
  ]);
  for (const e of list) {
    const p = platforms.find(x => x.key === e.key);
    assert.equal(e.name, p.name);
    assert.equal(e.icon, p.icon);
  }
});

test('BENTO-18 edge: a platform with no URL gets no entry', () => {
  const links = Object.assign(allLinks('https://album'), { pandora: null, bandcamp: null });
  assert.deepEqual(uplink(platforms, { links, track: {} }).map(e => e.key), ['spotify', 'apple', 'ytmusic', 'deezer', 'tidal', 'amazon']);
});

test('BENTO-19/20: each platform uses the listen URL; the sub label depends on whether it is the track URL', () => {
  for (const key of UPLINK_ORDER) {
    const p = platforms.find(x => x.key === key);
    const withTrack = uplink(platforms, { links: Object.assign(allLinks('https://album'), { [key]: 'https://track' }), track: { [key]: 'https://track' } })
      .find(e => e.key === key);
    assert.equal(withTrack.url, 'https://track', key);
    assert.equal(withTrack.sub, TRACK_SUB[key] || p.sub, key);
    const fallback = uplink(platforms, { links: allLinks('https://album'), track: {} }).find(e => e.key === key);
    assert.equal(fallback.url, `https://album/${key}`, key);
    assert.equal(fallback.sub, p.sub, key);
  }
});

test('BENTO-18/19: a built song carries its uplink from its listen links; without platforms it is empty', () => {
  const s = song(catalog({ platforms }), 'keep-away');
  assert.deepEqual(s.uplink.map(e => e.url), UPLINK_ORDER.map(k => s.listen.links[k]).filter(Boolean));
  assert.equal(s.uplink[0].sub, 'Play the track');
  assert.deepEqual(song(catalog(), 'keep-away').uplink, []);
});

test('BENTO-18: the Eleventy catalog data passes platforms.json in', () => {
  const data = require('../../_data/catalog.js')();
  assert.equal(data.songs.find(x => x.slug === 'keep-away').uplink[0].key, 'spotify');
});

// ── Song layout and LISTEN NOW (song-bento-no-video) ──

test('NOVID-01/03: songLayout is video with a video, else stack for instrumentals, else lyrics', () => {
  const video = { id: 'x' };
  assert.equal(songLayout({ video, instrumental: false }), 'video');
  assert.equal(songLayout({ video, instrumental: true }), 'video');
  assert.equal(songLayout({ video: null, instrumental: true }), 'stack');
  assert.equal(songLayout({ video: null, instrumental: false }), 'lyrics');
});

test('NOVID-01/03: built songs carry their layout; the 10 sung songs without a video use lyrics', () => {
  const c = catalog();
  assert.equal(song(c, 'keep-away').layout, 'video');
  assert.equal(song(c, 'faceless-demons').layout, 'lyrics');
  assert.equal(song(c, 'endless-path').layout, 'stack');
  assert.deepEqual(c.songs.filter(s => s.layout === 'lyrics').map(s => s.slug).sort(), [
    'age-of-lies', 'faceless-demons', 'faithless-breath', 'fallen-dreams', 'firstly-my-breakfast',
    'insane-driver', 'invisible-chains', 'make-decisions', 'tears-of-blood', 'the-edge-of-life',
    'the-sun-will-rise', 'waiting-for-you',
  ]);
  assert.deepEqual(c.songs.filter(s => s.layout === 'stack').map(s => s.slug).sort(), ['back-to-1994', 'endless-path']);
});

test('NOVID-12/13: listenUrl is the Spotify entry of the uplink, null without one', () => {
  const spotify = { key: 'spotify', url: 'https://open.spotify.com/track/abc', primary: true };
  const apple = { key: 'apple', url: 'https://music.apple.com/x', primary: true };
  assert.equal(listenUrl([apple, spotify]), 'https://open.spotify.com/track/abc');
  assert.equal(listenUrl([apple]), null);
  assert.equal(listenUrl([]), null);
});

test('NOVID-12: built songs carry the Spotify track URL as listenUrl', () => {
  const c = catalog({ platforms });
  assert.equal(song(c, 'faceless-demons').listenUrl, 'https://open.spotify.com/track/5N0rDJGWRcp3LsWSD82Flk');
  assert.equal(song(catalog(), 'faceless-demons').listenUrl, null);
});

// SLYR: a songs.json entry may belong to a single instead of an album.
const WFY = { slug: 'waiting-for-you', single: 'waiting-for-you', duration: 218, about: 'About Waiting for You.',
  links: { apple: 'https://music.apple.com/us/album/waiting-for-you/1793471043?i=1793471044' } };
const TSWR = { slug: 'the-sun-will-rise', single: 'the-sun-will-rise', duration: 281 };
const withSingles = (...extra) => Object.assign({}, songs, { songs: [...songs.songs.filter(s => !s.single), ...extra] });
const singleLyrics = (...slugs) => Object.assign(fakeLyrics(), Object.fromEntries(slugs.map(slug =>
  [`singles/${slug}`, `[Verse 1]\n${slug} one\n\n[Chorus]\n${slug} two\n`])));
const singlesCatalog = () => catalog({ songs: withSingles(WFY, TSWR), lyrics: singleLyrics('waiting-for-you', 'the-sun-will-rise') });
const wfySingle = discography.singles.find(s => s.slug === 'waiting-for-you');

test('SLYR-01: a song of a single lives at the single URL, with the single as its parent release', () => {
  const s = song(singlesCatalog(), 'waiting-for-you');
  assert.equal(s.url, '/discography/waiting-for-you/');
  assert.equal(s.single, true);
  assert.equal(s.title, 'Waiting for You');
  assert.equal(s.duration, 218);
  assert.deepEqual(s.album, { slug: 'waiting-for-you', title: 'Waiting for You', year: 2025,
    url: '/discography/waiting-for-you/', cover: 'waiting-for-you.jpg', links: wfySingle.links });
  assert.equal(song(singlesCatalog(), 'ghosts').single, false);
});

test('SLYR-02 data: a song of a single reads singles/<slug> lyrics into sections', () => {
  const s = song(singlesCatalog(), 'waiting-for-you');
  assert.deepEqual(s.sections.map(x => x.label), ['Verse 1', 'Chorus']);
  assert.equal(s.lyricsText, '[Verse 1]\nwaiting-for-you one\n\n[Chorus]\nwaiting-for-you two');
  assert.equal(s.layout, 'lyrics');
});

test('SLYR-03: a sung single song without a lyrics file fails the build', () => {
  const lyrics = fakeLyrics();
  delete lyrics['singles/waiting-for-you'];
  assert.throws(() => catalog({ songs: withSingles(WFY), lyrics }),
    { message: 'seo-discovery: waiting-for-you has no lyrics file and is not instrumental' });
});

test('SLYR-04: a song naming an unknown single fails the build', () => {
  assert.throws(() => catalog({ songs: withSingles({ slug: 'no-such-single', single: 'no-such-single', duration: 100 }),
    lyrics: singleLyrics('no-such-single') }),
  { message: 'seo-discovery: no-such-single references unknown single' });
});

test('SLYR-05: a single with its own song gets no release page and links to the song', () => {
  const c = catalog({ songs: withSingles(WFY), lyrics: singleLyrics('waiting-for-you') });
  assert.equal(c.releases.some(r => r.slug === 'waiting-for-you'), false);
  assert.equal(c.links['waiting-for-you'].page, '/discography/waiting-for-you/');
  assert.equal(c.songs.filter(s => s.url === '/discography/waiting-for-you/').length, 1);
  // A single without a song keeps its release page.
  assert.equal(c.releases.find(r => r.slug === 'the-sun-will-rise').url, '/discography/the-sun-will-rise/');
});

test('SLYR-08 data: a single song catalog code is the title initials plus -SINGLE', () => {
  const c = singlesCatalog();
  assert.equal(song(c, 'waiting-for-you').catalogCode, 'WFY-SINGLE');
  assert.equal(song(c, 'the-sun-will-rise').catalogCode, 'TSWR-SINGLE');
});

test('SLYR-09 data: a single song shows the single cover', () => {
  assert.deepEqual(song(singlesCatalog(), 'waiting-for-you').cover, { file: 'waiting-for-you.jpg', alt: 'Waiting for You single cover' });
});

test('SLYR-11 data: a single song listens on the single links, overridden by its own, under the single slug', () => {
  const s = song(singlesCatalog(), 'waiting-for-you');
  assert.equal(s.listen.slug, 'waiting-for-you');
  assert.equal(s.listen.links.apple, WFY.links.apple);
  assert.equal(s.listen.links.spotify, wfySingle.links.spotify);
  assert.deepEqual(s.listen.track, WFY.links);
});

test('SLYR-12 data: a single song has no previous or next track', () => {
  const c = singlesCatalog();
  for (const slug of ['waiting-for-you', 'the-sun-will-rise']) {
    assert.equal(song(c, slug).prev, null, slug);
    assert.equal(song(c, slug).next, null, slug);
  }
});
