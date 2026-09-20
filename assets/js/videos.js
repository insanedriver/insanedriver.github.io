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

    var state = { index: 0 };

    // Align the card to the feed start so the scroll target matches its scroll-snap point
    // (a target between snap points would snap back and leave the card cut off).
    function scrollCardIntoView(card) {
        var feedBox = feed.getBoundingClientRect();
        var cardBox = card.getBoundingClientRect();
        if (cardBox.left < feedBox.left || cardBox.right > feedBox.right) {
            feed.scrollTo({ left: feed.scrollLeft + (cardBox.left - feedBox.left) - 4, behavior: 'smooth' });
        }
    }

    function select(index) {
        var card = cards[index];
        if (index === state.index && card.getAttribute('aria-current') === 'true') { return; }
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

    cards.forEach(function (card, i) {
        card.addEventListener('click', function (event) {
            if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) { return; }
            event.preventDefault();
            select(i);
        });
    });

    playButton.hidden = false;
    watchLink.hidden = true;
}());
