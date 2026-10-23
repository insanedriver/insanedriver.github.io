// SONG-13: the video facade becomes a youtube-nocookie player only when the visitor
// asks for it. Until then the page makes no request to YouTube (SONG-12); without
// JavaScript the facade stays a plain link to the watch page (SONG-14).
(function () {
    var EMBED_HOST = 'https://www.youtube-nocookie.com';

    function activate(facade) {
        var frame = document.createElement('iframe');
        frame.src = EMBED_HOST + '/embed/' + encodeURIComponent(facade.getAttribute('data-video-id')) + '?autoplay=1';
        frame.title = facade.getAttribute('data-video-title');
        frame.className = 'song-video-frame';
        frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        frame.setAttribute('allowfullscreen', '');
        facade.parentNode.replaceChild(frame, facade);
    }

    [].forEach.call(document.querySelectorAll('[data-song-video]'), function (facade) {
        facade.addEventListener('click', function (event) {
            event.preventDefault();
            activate(facade);
        });
    });

    // BENTO-10..13: QUICK PLAY scrolls to Panel A and starts the video there, once.
    // Without JavaScript it stays an in-page link to #song-video.
    var quick = document.querySelector('[data-song-quickplay]');
    var panel = document.getElementById('song-video');
    if (!quick || !panel) { return; }

    quick.addEventListener('click', function (event) {
        event.preventDefault();
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({ event: 'song_quick_play', song: quick.getAttribute('data-song-quickplay') });
        var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        panel.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        var facade = panel.querySelector('[data-song-video]');
        if (facade) { activate(facade); }
    });
}());
