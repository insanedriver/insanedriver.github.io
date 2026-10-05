const core = require('../assets/js/home-core.js');

// The singles NOW::STREAMING shuffles through, trimmed to what the panel
// renders. The first entry is the no-JS pick; home.js draws from all of them.
function pool(catalog) {
    return core.shufflePool(catalog, core.latestRelease(catalog)).map(single => {
        const links = {};
        Object.keys(single.links || {}).forEach(key => {
            if (single.links[key]) {
                links[key] = single.links[key];
            }
        });
        return {
            slug: single.slug,
            title: single.title,
            releaseDate: single.releaseDate,
            cover: single.cover,
            coverWidth: single.coverWidth,
            coverHeight: single.coverHeight,
            embedId: core.spotifyAlbumId(single),
            links: links
        };
    });
}

// json is serialized here because Liquid 6's json filter cannot handle an
// array; "<" is escaped so no title can close the inline <script>.
function build(catalog) {
    const singles = pool(catalog);
    return { pool: singles, json: JSON.stringify(singles).replace(/</g, '\\u003c') };
}

module.exports = () => build(require('./discography.json'));
module.exports.build = build;
