// REV-02/03: the press reviews grouped by album for /press/reviews/, in discography order
// (newest album first), newest review first, albums without reviews left out.
const { reviews } = require('./reviews.json');
const { albums } = require('./discography.json');

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// "2016-08-18" -> "Aug 18, 2016"; "2016-04" -> "Apr 2016"; "2016" -> "2016"
const dateLabel = iso => {
    const [year, month, day] = iso.split('-');
    if (!month) return year;
    const name = MONTHS[Number(month) - 1];
    return day ? `${name} ${Number(day)}, ${year}` : `${name} ${year}`;
};

module.exports = albums
    .map(album => ({
        slug: album.slug,
        title: album.title,
        year: album.year,
        reviews: reviews
            .filter(r => r.album === album.slug)
            .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
            .map(r => ({ ...r, dateLabel: dateLabel(r.date) })),
    }))
    .filter(group => group.reviews.length > 0);
