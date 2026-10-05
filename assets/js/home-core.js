(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.IDHome = factory();
    }
}(this, function () {

    var BOOT_KEY = 'id-home-booted';
    var LOADER_MIN = 1200;
    var LOADER_MAX = 3500;
    var LOADER_REPEAT = 400;
    var NAV_SOLID_AFTER = 40;

    // Newest releaseDate across albums and singles. Albums are scanned first
    // and only a strictly newer date replaces the pick, so an album wins a tie.
    function latestRelease(catalog) {
        if (!catalog) {
            return null;
        }
        var all = (catalog.albums || []).concat(catalog.singles || []);
        var best = null;
        for (var i = 0; i < all.length; i++) {
            if (!best || all[i].releaseDate > best.releaseDate) {
                best = all[i];
            }
        }
        return best;
    }

    // NOW::STREAMING shuffles the back catalog: every single except the one
    // the hero already features, newest first (the first one is the no-JS pick).
    function shufflePool(catalog, featured) {
        var singles = (catalog && catalog.singles) || [];
        var pool = [];
        for (var i = 0; i < singles.length; i++) {
            if (singles[i] !== featured) {
                pool.push(singles[i]);
            }
        }
        return pool.sort(function (a, b) {
            return a.releaseDate < b.releaseDate ? 1 : a.releaseDate > b.releaseDate ? -1 : 0;
        });
    }

    // random is a Math.random() value in [0, 1).
    function pickShuffle(pool, random) {
        return pool.length ? pool[Math.floor(random * pool.length)] : null;
    }

    function releaseTypeLabel(release) {
        if (release.type === 'DELUXE') {
            return 'DELUXE EDITION';
        }
        return release.type === 'ALBUM' ? 'ALBUM' : 'SINGLE';
    }

    // Singles carry spotifyId: null, but their Spotify link holds the album id.
    function spotifyAlbumId(release) {
        if (!release) {
            return null;
        }
        if (release.spotifyId) {
            return release.spotifyId;
        }
        var url = release.links && release.links.spotify;
        var match = url && /open\.spotify\.com\/album\/([A-Za-z0-9]+)/.exec(url);
        return match ? match[1] : null;
    }

    function spotifyEmbedUrl(albumId) {
        return albumId ? 'https://open.spotify.com/embed/album/' + albumId : null;
    }

    // First view: no sooner than 1.2s, as soon as ready after that, never
    // later than 3.5s. Repeat view in the same session: a 0.4s flash.
    function loaderDismissAt(opts) {
        var start = opts.startedAt;
        if (opts.repeat) {
            return start + LOADER_REPEAT;
        }
        var ready = opts.readyAt == null ? Infinity : opts.readyAt;
        return Math.min(start + LOADER_MAX, Math.max(start + LOADER_MIN, ready));
    }

    function isRepeatVisit(storage) {
        try {
            return !!storage && storage.getItem(BOOT_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function markVisited(storage) {
        try {
            if (storage) {
                storage.setItem(BOOT_KEY, '1');
            }
        } catch (e) { /* storage blocked: the next view boots in full */ }
    }

    function navIsSolid(scrollY) {
        return scrollY > NAV_SOLID_AFTER;
    }

    function releaseClickEvent(platform, slug, placement) {
        return { event: 'home_release_click', platform: platform, release: slug, placement: placement };
    }

    function teaserClickEvent(target, slug) {
        var event = { event: 'home_teaser_click', target: target };
        if (slug) {
            event.slug = slug;
        }
        return event;
    }

    function newsletterEvent() {
        return { event: 'home_newsletter_submit' };
    }

    function loaderSkipEvent() {
        return { event: 'home_loader_skip' };
    }

    return {
        LOADER_MAX: LOADER_MAX,
        latestRelease: latestRelease,
        shufflePool: shufflePool,
        pickShuffle: pickShuffle,
        releaseTypeLabel: releaseTypeLabel,
        spotifyAlbumId: spotifyAlbumId,
        spotifyEmbedUrl: spotifyEmbedUrl,
        loaderDismissAt: loaderDismissAt,
        isRepeatVisit: isRepeatVisit,
        markVisited: markVisited,
        navIsSolid: navIsSolid,
        releaseClickEvent: releaseClickEvent,
        teaserClickEvent: teaserClickEvent,
        newsletterEvent: newsletterEvent,
        loaderSkipEvent: loaderSkipEvent
    };
}));
