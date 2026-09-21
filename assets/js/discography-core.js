(function (root, factory) {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.IDDisc = factory();
    }
}(this, function () {

    function spotifyEmbedUrl(albumId) {
        if (!albumId) {
            return null;
        }
        return 'https://open.spotify.com/embed/album/' + albumId;
    }

    function clickEvent(platform, slug) {
        return { event: 'release_click', platform: platform, release: slug };
    }

    // One preview open at a time: requesting the open one closes it, any other
    // switches to it.
    function nextPreviewState(current, requested) {
        if (!requested) {
            return { open: current };
        }
        return { open: current === requested ? null : requested };
    }

    return {
        spotifyEmbedUrl: spotifyEmbedUrl,
        clickEvent: clickEvent,
        nextPreviewState: nextPreviewState
    };
}));
