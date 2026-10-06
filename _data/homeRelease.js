const core = require('../assets/js/home-core.js');

// The release the home features: the newest one in the catalog, with the
// type label the hero card shows.
function build(catalog) {
    const release = core.latestRelease(catalog);
    if (!release) {
        return null;
    }
    return Object.assign({}, release, {
        typeLabel: core.releaseTypeLabel(release)
    });
}

module.exports = () => build(require('./discography.json'));
module.exports.build = build;
