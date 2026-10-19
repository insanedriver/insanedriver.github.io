// Build-time join of discography.json, songs.json, the lyrics files and videos.json
// into the models of the release pages (/discography/<slug>/) and the song pages
// (/discography/<album>/<song>/). Pure: plain data in, plain data out.

const kebab = text => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// "Tide of Fears (Acoustic Version)" -> "tide-of-fears": versions of a song share its key.
function songKey(title) {
    return kebab(title.replace(/\s*\((Deluxe Version|Acoustic Version|Acoustic)\)\s*$/i, ''));
}

// "Today Is Sunday (Eder Franco)" -> "today-is-sunday": the song a distinct recording is a version of.
const baseKey = title => kebab(title.replace(/\s*\([^)]*\)\s*$/, ''));

const releaseUrl = slug => `/discography/${slug}/`;

// Lyrics text -> sections. A line like "[Chorus 1]" opens a labelled section; lines
// before the first label form an unlabelled one. Blank lines inside a section are kept.
function parseSections(text) {
    const sections = [];
    let current = null;
    for (const line of text.split('\n')) {
        const label = line.match(/^\[(.+)\]$/);
        if (label) {
            current = { label: label[1], lines: [] };
            sections.push(current);
        } else {
            if (!current) {
                current = { label: null, lines: [] };
                sections.push(current);
            }
            current.lines.push(line);
        }
    }
    for (const section of sections) {
        while (section.lines.length && section.lines[0].trim() === '') section.lines.shift();
        while (section.lines.length && section.lines[section.lines.length - 1].trim() === '') section.lines.pop();
    }
    return sections.filter(s => s.label !== null || s.lines.length);
}

function build({ discography, songs, lyrics, videos }) {
    const albums = new Map(discography.albums.map(a => [a.slug, a]));
    const copy = songs.releases || {};

    // Song shells, in the order of songs.json.
    const pages = songs.songs.map(song => {
        const album = albums.get(song.album);
        const track = album && album.tracks.find(t => songKey(t.title) === song.slug);
        if (!track) {
            throw new Error(`seo-discovery: ${song.slug} references unknown album/track`);
        }
        const text = lyrics[`${song.album}/${song.slug}`];
        if (!song.instrumental && typeof text !== 'string') {
            throw new Error(`seo-discovery: ${song.slug} has no lyrics file and is not instrumental`);
        }
        const lyricsText = song.instrumental ? '' : text.trim();
        return {
            slug: song.slug,
            title: track.title,
            url: `/discography/${album.slug}/${song.slug}/`,
            album: { slug: album.slug, title: album.title, year: album.year, url: releaseUrl(album.slug), cover: album.cover, links: album.links },
            position: track.position,
            duration: track.duration,
            instrumental: song.instrumental === true,
            sections: song.instrumental ? [] : parseSections(lyricsText),
            lyricsText,
            about: song.about || null,
            video: videos.find(v => v.slug === song.slug) || null,
            // SONG-07: the track's own platform URL where songs.json has one, else the album's.
            listen: { slug: album.slug, links: Object.assign({}, album.links, song.links), track: song.links || {} },
            sameAs: Object.values(song.links || {}),
            alsoReleasedAs: [],
            prev: null,
            next: null,
        };
    });
    const bySlug = new Map(pages.map(p => [p.slug, p]));

    for (const p of pages) {
        const siblings = pages.filter(o => o.album.slug === p.album.slug);
        const prev = siblings.find(o => o.position === p.position - 1);
        const next = siblings.find(o => o.position === p.position + 1);
        p.prev = prev ? { title: prev.title, url: prev.url } : null;
        p.next = next ? { title: next.title, url: next.url } : null;
    }

    const releases = [];
    const links = {};
    const alsoReleased = (song, release, url) => song.alsoReleasedAs.push({
        title: release.title, year: release.year, releaseDate: release.releaseDate, links: release.links, url,
    });

    const releasePage = (release, extra) => {
        const page = Object.assign({
            slug: release.slug,
            title: release.title,
            type: release.type,
            year: release.year,
            url: releaseUrl(release.slug),
            cover: release.cover,
            coverWidth: release.coverWidth,
            coverHeight: release.coverHeight,
            releaseDate: release.releaseDate,
            links: release.links,
            description: copy[release.slug] || `${release.title} is a ${release.year} single by Insane Driver.`,
            tracks: [],
            songUrl: null,
        }, extra);
        releases.push(page);
        return page;
    };

    // Every album gets a page; its tracks link to the songs (deluxe and acoustic versions included).
    for (const album of discography.albums) {
        const tracks = album.tracks.map(t => {
            const song = bySlug.get(songKey(t.title));
            if (!song) {
                throw new Error(`seo-discovery: ${album.slug} track "${t.title}" has no song`);
            }
            return { position: t.position, title: t.title, duration: t.duration, url: song.url };
        });
        const page = releasePage(album, { tracks });
        links[album.slug] = { page: page.url, tracks: Object.fromEntries(tracks.map(t => [t.position, t.url])) };
        // An edition that is not the song's own album lists under "Also released as".
        for (const song of new Set(tracks.map(t => bySlug.get(songKey(t.title))))) {
            if (song.album.slug !== album.slug) alsoReleased(song, album, page.url);
        }
    }

    // A single folds into the song it is a version of; any other single gets a page,
    // linked from the song it is a distinct recording of, when there is one.
    for (const single of discography.singles) {
        const folded = bySlug.get(songKey(single.title));
        if (folded) {
            alsoReleased(folded, single, null);
            links[single.slug] = { page: folded.url, tracks: {} };
            continue;
        }
        const original = bySlug.get(baseKey(single.title));
        const page = releasePage(single, { songUrl: original ? original.url : null });
        if (original) alsoReleased(original, single, page.url);
        links[single.slug] = { page: page.url, tracks: {} };
    }

    for (const p of pages) {
        p.alsoReleasedAs.sort((a, b) => (a.releaseDate < b.releaseDate ? -1 : a.releaseDate > b.releaseDate ? 1 : 0));
    }

    return { songs: pages, releases, links };
}

module.exports = { songKey, parseSections, build };
