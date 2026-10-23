const fs = require('fs');
const path = require('path');
const { build } = require('../lib/catalog.js');

// English lyrics only: "<album>/<song>.txt". The "<song>.pt.txt" translations are stored, never read.
function readLyrics(dir) {
    const lyrics = {};
    for (const album of fs.readdirSync(dir)) {
        for (const file of fs.readdirSync(path.join(dir, album))) {
            if (file.endsWith('.txt') && !file.endsWith('.pt.txt')) {
                lyrics[`${album}/${file.slice(0, -'.txt'.length)}`] = fs.readFileSync(path.join(dir, album, file), 'utf8');
            }
        }
    }
    return lyrics;
}

module.exports = () => build({
    discography: require('./discography.json'),
    songs: require('./songs.json'),
    lyrics: readLyrics(path.join(__dirname, 'lyrics')),
    videos: require('./videos.json'),
    platforms: require('./platforms.json'),
});
module.exports.build = build;
module.exports.readLyrics = readLyrics;
