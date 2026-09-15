(function () {
    'use strict';
    var root = document.querySelector('.pswp');
    var archive = document.querySelector('.photos-archive');
    if (!root || !archive || !window.PhotoSwipe || !window.PhotoSwipeUI_Default) return;
    var figures = Array.from(archive.querySelectorAll('figure[data-photo-id]'));
    var viewer = null;

    function openPhoto(id, trigger) {
        var index = figures.findIndex(function (figure) { return figure.dataset.photoId === id; });
        if (index < 0 || viewer) return false;
        var items = figures.map(function (figure) {
            var link = figure.querySelector('a');
            var image = link.querySelector('img');
            var size = link.dataset.size.split(/x/i).map(Number);
            return {
                src: link.getAttribute('href'), msrc: image.getAttribute('src'),
                w: size[0] || image.naturalWidth, h: size[1] || image.naturalHeight,
                title: figure.querySelector('figcaption').textContent, el: image
            };
        });
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var options = {
            index: index, history: false, returnFocus: false,
            showAnimationDuration: reduced ? 0 : 250,
            hideAnimationDuration: reduced ? 0 : 250,
            addCaptionHTMLFn: function (item, element) {
                element.children[0].textContent = item.title || '';
                return Boolean(item.title);
            }
        };
        viewer = new PhotoSwipe(root, PhotoSwipeUI_Default, items, options);
        root.setAttribute('aria-label', 'Photo viewer');
        root.setAttribute('aria-modal', 'true');
        viewer.listen('destroy', function () {
            viewer = null;
            root.removeAttribute('aria-modal');
            if (trigger && trigger.isConnected) trigger.focus({preventScroll: true});
        });
        viewer.init();
        return true;
    }
    window.openInsanePhoto = openPhoto;
    archive.addEventListener('click', function (event) {
        var link = event.target.closest('[data-photo-open]');
        if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (openPhoto(link.dataset.photoOpen, link)) event.preventDefault();
    });
}());
