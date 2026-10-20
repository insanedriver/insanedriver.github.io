// Gallery thumbnails (tn_*.jpg) are 285 px wide at the photo's aspect ratio.
const THUMB_WIDTH = 285;

module.exports = () => require('./photos.json').filter(photo => photo.featured).sort((a, b) => a.highlightOrder - b.highlightOrder)
    .map(photo => Object.assign({}, photo, {
        thumbnailWidth: THUMB_WIDTH,
        thumbnailHeight: Math.round(THUMB_WIDTH * photo.height / photo.width)
    }));
