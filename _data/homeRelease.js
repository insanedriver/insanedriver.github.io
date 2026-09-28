const core = require('../assets/js/home-core.js');

// The release the home features: the newest one in the catalog, with the
// fields the hero card and the NOW::STREAMING panel need precomputed.
function build(catalog) {
    const release = core.latestRelease(catalog);
    if (!release) {
        return null;
    }
    const isSingle = release.type === 'SINGLE';
    return Object.assign({}, release, {
        typeLabel: core.releaseTypeLabel(release),
        embedId: core.spotifyAlbumId(release),
        detailUrl: isSingle ? '/discography/' : '/discography/#' + release.slug
    });
}

module.exports = () => build(require('./discography.json'));
module.exports.build = build;
