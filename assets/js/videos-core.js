(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.IDTV = factory();
    }
}(this, function () {
    var PREFIX = 'Insane Driver - ';

    function shortTitle(title) {
        return title.indexOf(PREFIX) === 0 ? title.slice(PREFIX.length) : title;
    }

    function watchUrl(id) {
        return 'https://www.youtube.com/watch?v=' + id;
    }

    function posterUrl(id) {
        return 'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg';
    }

    function pad(n) {
        return (n < 10 ? '0' : '') + n;
    }

    function formatCounter(index, length) {
        return pad(index + 1) + ' / ' + pad(length);
    }

    function step(index, delta, length) {
        return (index + delta + length) % length;
    }

    function indexFromHash(hash, slugs) {
        var slug = String(hash || '').replace(/^#/, '');
        var found = slugs.indexOf(slug);
        return found === -1 ? 0 : found;
    }

    return {
        shortTitle: shortTitle,
        watchUrl: watchUrl,
        posterUrl: posterUrl,
        formatCounter: formatCounter,
        step: step,
        indexFromHash: indexFromHash
    };
}));
