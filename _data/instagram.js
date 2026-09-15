const path = require('node:path');
const {readSnapshot} = require('../scripts/sync-instagram.cjs');
module.exports = function () {
    return readSnapshot(path.join(__dirname, '../assets/instagram')) || {posts: []};
};
