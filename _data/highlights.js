module.exports = () => require('./photos.json').filter(photo => photo.featured).sort((a, b) => a.highlightOrder - b.highlightOrder);
