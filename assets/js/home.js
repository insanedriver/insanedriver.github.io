(function () {
    var core = window.IDHome;
    if (!core) { return; }

    var html = document.documentElement;

    function now() {
        return window.performance && performance.now ? performance.now() : Date.now();
    }

    function push(event) {
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(event);
    }

    function sessionStore() {
        try {
            return window.sessionStorage;
        } catch (e) {
            return null;
        }
    }

    // Boot loader: shown by the gate script in <head>; this decides when it
    // leaves (see core.loaderDismissAt) and lets the visitor skip it.
    function loader() {
        var el = document.getElementById('home-loader');
        if (!el || !html.classList.contains('home-loading')) { return; }

        var page = document.querySelector('[data-home-page]');
        var bar = el.querySelector('[data-home-loader-bar]');
        var pct = el.querySelector('[data-home-loader-pct]');
        var img = document.querySelector('[data-home-hero-img]');
        var storage = sessionStore();
        var repeat = core.isRepeatVisit(storage);
        var startedAt = typeof window.IDHomeBootAt === 'number' ? window.IDHomeBootAt : now();
        var readyAt = null;
        var done = false;
        var timer = null;
        var frame = null;

        core.markVisited(storage);
        if (page) { page.inert = true; }
        if (bar) { bar.style.animation = 'none'; }

        function setProgress(value) {
            var v = Math.max(0, Math.min(100, Math.round(value)));
            if (bar) { bar.style.width = v + '%'; }
            if (pct) { pct.textContent = (v < 10 ? '0' : '') + v + '%'; }
        }

        function tick() {
            var target = core.loaderDismissAt({ startedAt: startedAt, readyAt: readyAt, repeat: repeat });
            setProgress((now() - startedAt) / (target - startedAt) * 100);
            frame = window.requestAnimationFrame(tick);
        }

        function dismiss(skipped) {
            if (done) { return; }
            done = true;
            window.clearTimeout(timer);
            window.clearTimeout(cap);
            window.cancelAnimationFrame(frame);
            setProgress(100);
            el.classList.add('is-done');
            el.setAttribute('aria-hidden', 'true');
            if (page) { page.inert = false; }
            if (skipped) { push(core.loaderSkipEvent()); }
            // Let the exit transition play, then drop the gate for good.
            window.setTimeout(function () {
                html.classList.remove('home-loading');
            }, 450);
        }

        function schedule() {
            window.clearTimeout(timer);
            var at = core.loaderDismissAt({ startedAt: startedAt, readyAt: readyAt, repeat: repeat });
            timer = window.setTimeout(function () { dismiss(false); }, Math.max(0, at - now()));
        }

        // Hard cap, independent of whatever the ready promise does.
        var cap = window.setTimeout(function () { dismiss(false); }, Math.max(0, startedAt + core.LOADER_MAX - now()));

        var imageReady = new Promise(function (resolve) {
            if (!img || img.complete) { resolve(); return; }
            img.addEventListener('load', resolve);
            img.addEventListener('error', resolve);
        });
        var fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready.catch(function () {}) : Promise.resolve();

        Promise.all([imageReady, fontsReady]).then(function () {
            readyAt = now();
            if (!done) { schedule(); }
        });

        schedule();
        tick();

        el.addEventListener('click', function () { dismiss(true); });
        document.addEventListener('keydown', function (e) {
            if (!done && (e.key === 'Escape' || e.key === 'Esc')) { dismiss(true); }
        });
    }

    // Navbar: transparent over the hero, solid once the page scrolls past
    // core.navIsSolid's threshold. Checked on load too, for restored scroll.
    function navbar() {
        var nav = document.querySelector('nav.navbar');
        if (!nav) { return; }

        var pending = false;

        function update() {
            pending = false;
            nav.classList.toggle('is-solid', core.navIsSolid(window.pageYOffset));
        }

        window.addEventListener('scroll', function () {
            if (pending) { return; }
            pending = true;
            window.requestAnimationFrame(update);
        }, { passive: true });
        window.addEventListener('load', update);
        update();
    }

    // Spotify preview: the button ships hidden and only shows once JS can
    // honour it. One iframe at most, created on demand, removed on close.
    function preview() {
        var button = document.querySelector('[data-home-preview-btn]');
        var slot = document.querySelector('[data-home-preview]');
        var url = button && core.spotifyEmbedUrl(button.getAttribute('data-home-preview-btn'));
        if (!slot || !url) { return; }

        button.hidden = false;
        button.addEventListener('click', function () {
            if (slot.querySelector('iframe')) {
                slot.innerHTML = '';
                button.setAttribute('aria-expanded', 'false');
                return;
            }
            var frame = document.createElement('iframe');
            frame.src = url;
            frame.width = '100%';
            frame.height = '352';
            frame.loading = 'lazy';
            frame.setAttribute('frameborder', '0');
            frame.setAttribute('allow', 'encrypted-media; clipboard-write; fullscreen; picture-in-picture');
            frame.setAttribute('title', 'Spotify preview');
            slot.appendChild(frame);
            button.setAttribute('aria-expanded', 'true');
        });
    }

    // Tracking: report platform, teaser and newsletter actions. Never touches
    // the navigation or the form post itself.
    function tracking() {
        var card = document.querySelector('[data-home-release]');
        var release = card ? card.getAttribute('data-home-release') : null;

        document.addEventListener('click', function (event) {
            var anchor = event.target.closest ? event.target.closest('[data-home-link], [data-home-teaser]') : null;
            if (!anchor) { return; }
            if (anchor.hasAttribute('data-home-link')) {
                push(core.releaseClickEvent(
                    anchor.getAttribute('data-home-link'),
                    release,
                    anchor.getAttribute('data-home-placement')
                ));
            } else {
                push(core.teaserClickEvent(
                    anchor.getAttribute('data-home-teaser'),
                    anchor.getAttribute('data-home-slug')
                ));
            }
        });

        var form = document.querySelector('[data-home-newsletter]');
        if (form) {
            form.addEventListener('submit', function () { push(core.newsletterEvent()); });
        }
    }

    loader();
    navbar();
    preview();
    tracking();
}());
