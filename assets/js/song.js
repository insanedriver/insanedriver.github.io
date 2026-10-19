// SONG-13: the video facade becomes a youtube-nocookie player only when the visitor
// asks for it. Until then the page makes no request to YouTube (SONG-12); without
// JavaScript the facade stays a plain link to the watch page (SONG-14).
(function () {
    var EMBED_HOST = 'https://www.youtube-nocookie.com';

    [].forEach.call(document.querySelectorAll('[data-song-video]'), function (facade) {
        facade.addEventListener('click', function (event) {
            event.preventDefault();
            var frame = document.createElement('iframe');
            frame.src = EMBED_HOST + '/embed/' + encodeURIComponent(facade.getAttribute('data-video-id')) + '?autoplay=1';
            frame.title = facade.getAttribute('data-video-title');
            frame.className = 'song-video-frame';
            frame.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
            frame.setAttribute('allowfullscreen', '');
            facade.parentNode.replaceChild(frame, facade);
        });
    });
}());
