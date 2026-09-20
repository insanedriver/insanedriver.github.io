(function () {
    var core = window.IDTV;
    var root = document.querySelector('[data-idtv]');
    if (!root || !core) { return; }

    var cards = [].slice.call(root.querySelectorAll('[data-idtv-card]'));
    var feed = root.querySelector('[data-idtv-feed]');
    var posterImg = root.querySelector('[data-idtv-poster-img]');
    var playButton = root.querySelector('[data-idtv-play]');
    var watchLink = root.querySelector('[data-idtv-watch]');
    var nowTitle = root.querySelector('[data-idtv-now]');
    var counter = root.querySelector('[data-idtv-counter]');
    var poster = root.querySelector('[data-idtv-poster]');
    var screen = root.querySelector('[data-idtv-screen]');
    var controls = root.querySelector('[data-idtv-controls]');
    var prevButton = root.querySelector('[data-idtv-prev]');
    var nextButton = root.querySelector('[data-idtv-next]');
    var autoButton = root.querySelector('[data-idtv-auto]');

    var API_URL = 'https://www.youtube.com/iframe_api';
    var EMBED_HOST = 'https://www.youtube-nocookie.com';

    // api: idle -> loading -> ready. One YT.Player is created on the first play and reused;
    // loadedId is the video the player was last told to load.
    var state = { index: 0, auto: true, started: false, api: 'idle', player: null, playerReady: false, loadedId: null };

    function currentId() {
        return cards[state.index].getAttribute('data-video-id');
    }

    // Player methods only exist after onReady, so selections made before then are applied on ready.
    function syncPlayer() {
        if (!state.playerReady || state.loadedId === currentId()) { return; }
        state.loadedId = currentId();
        state.player.loadVideoById(state.loadedId);
    }

    function createPlayer() {
        var holder = document.createElement('div');
        holder.setAttribute('data-idtv-player', '');
        screen.appendChild(holder);
        state.loadedId = currentId();
        state.player = new window.YT.Player(holder, {
            host: EMBED_HOST,
            videoId: state.loadedId,
            playerVars: { autoplay: 1, rel: 0, playsinline: 1 },
            events: {
                onReady: function () {
                    state.playerReady = true;
                    syncPlayer();
                },
                onStateChange: function (event) {
                    if (event.data === window.YT.PlayerState.ENDED && state.auto) {
                        select(core.step(state.index, 1, cards.length), { play: true });
                    }
                }
            }
        });
    }

    function loadApi() {
        state.api = 'loading';
        window.onYouTubeIframeAPIReady = function () {
            state.api = 'ready';
            ensurePlaying();
        };
        var tag = document.createElement('script');
        tag.src = API_URL;
        document.head.appendChild(tag);
    }

    function ensurePlaying() {
        if (!state.started) { return; }
        if (state.api === 'idle') { loadApi(); return; }
        if (state.api !== 'ready') { return; }
        poster.hidden = true;
        if (!state.player) { createPlayer(); } else { syncPlayer(); }
    }

    function play() {
        state.started = true;
        ensurePlaying();
    }

    // Align the card to the feed start so the scroll target matches its scroll-snap point
    // (a target between snap points would snap back and leave the card cut off).
    function scrollCardIntoView(card) {
        var feedBox = feed.getBoundingClientRect();
        var cardBox = card.getBoundingClientRect();
        if (cardBox.left < feedBox.left || cardBox.right > feedBox.right) {
            feed.scrollTo({ left: feed.scrollLeft + (cardBox.left - feedBox.left) - 4, behavior: 'smooth' });
        }
    }

    function select(index, opts) {
        var previous = state.index;
        if (index !== state.index) {
            var card = cards[index];
            state.index = index;
            cards.forEach(function (c, i) {
                if (i === index) { c.setAttribute('aria-current', 'true'); } else { c.removeAttribute('aria-current'); }
            });
            var id = card.getAttribute('data-video-id');
            posterImg.src = core.posterUrl(id);
            watchLink.href = core.watchUrl(id);
            nowTitle.textContent = core.shortTitle(card.getAttribute('data-title'));
            counter.textContent = core.formatCounter(index, cards.length);
            scrollCardIntoView(card);
        }
        if (index !== previous && !(opts && opts.silent)) {
            history.replaceState(null, '', '#' + cards[index].getAttribute('data-slug'));
        }
        if (opts && opts.play) { play(); } else { ensurePlaying(); }
    }

    cards.forEach(function (card, i) {
        card.addEventListener('click', function (event) {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { return; }
            event.preventDefault();
            select(i, { play: true });
        });
    });

    prevButton.addEventListener('click', function () { select(core.step(state.index, -1, cards.length), { play: true }); });
    nextButton.addEventListener('click', function () { select(core.step(state.index, 1, cards.length), { play: true }); });
    autoButton.addEventListener('click', function () {
        state.auto = !state.auto;
        autoButton.setAttribute('aria-pressed', String(state.auto));
    });
    controls.hidden = false;
    root.addEventListener('keydown', function (event) {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) { return; }
        if (event.target.tagName === 'IFRAME') { return; }
        if (event.key === 'ArrowRight') {
            event.preventDefault();
            select(core.step(state.index, 1, cards.length), { play: true });
        } else if (event.key === 'ArrowLeft') {
            event.preventDefault();
            select(core.step(state.index, -1, cards.length), { play: true });
        }
    });

    select(core.indexFromHash(window.location.hash, cards.map(function (c) { return c.getAttribute('data-slug'); })), { silent: true });

    playButton.addEventListener('click', play);
    playButton.hidden = false;
    watchLink.hidden = true;
}());
