(function () {
    var core = window.IDDisc;
    var root = document.querySelector('[data-disc]');
    if (!root || !core) { return; }

    var buttons = [].slice.call(root.querySelectorAll('[data-disc-preview-btn]'));

    // Slug of the album whose preview is open, or null. Only one iframe ever
    // lives in the DOM.
    var openSlug = null;

    function slotFor(slug) {
        return root.querySelector('[data-disc-preview="' + slug + '"]');
    }

    function buttonFor(slug) {
        return root.querySelector('[data-disc-preview-btn="' + slug + '"]');
    }

    function close(slug) {
        var slot = slotFor(slug);
        var button = buttonFor(slug);
        if (slot) { slot.innerHTML = ''; }
        if (button) { button.setAttribute('aria-expanded', 'false'); }
    }

    function open(slug, albumId) {
        var slot = slotFor(slug);
        var button = buttonFor(slug);
        var url = core.spotifyEmbedUrl(albumId);
        if (!slot || !url) { return; }

        var frame = document.createElement('iframe');
        frame.src = url;
        frame.width = '100%';
        frame.height = '352';
        frame.loading = 'lazy';
        frame.setAttribute('frameborder', '0');
        frame.setAttribute('allow', 'encrypted-media; clipboard-write; fullscreen; picture-in-picture');
        frame.setAttribute('title', 'Spotify preview');
        frame.setAttribute('data-disc-iframe', slug);
        slot.appendChild(frame);
        if (button) { button.setAttribute('aria-expanded', 'true'); }
    }

    // Click tracking: report the choice, never interfere with the navigation.
    root.addEventListener('click', function (event) {
        var anchor = event.target.closest ? event.target.closest('[data-disc-link]') : null;
        if (!anchor) { return; }
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(core.clickEvent(
            anchor.getAttribute('data-disc-link'),
            anchor.getAttribute('data-disc-slug')
        ));
    });

    buttons.forEach(function (button) {
        button.hidden = false;
        button.addEventListener('click', function () {
            var slug = button.getAttribute('data-disc-preview-btn');
            var next = core.nextPreviewState(openSlug, slug).open;
            if (openSlug) { close(openSlug); }
            if (next) { open(next, button.getAttribute('data-disc-spotify-id')); }
            openSlug = next;
        });
    });
}());
