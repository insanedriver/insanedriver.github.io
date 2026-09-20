(function () {
    'use strict';
    var carousel = document.querySelector('[data-photo-carousel]');
    if (!carousel) return;
    var slides = Array.from(carousel.querySelectorAll('[data-photo-slide]'));
    var thumbnails = Array.from(carousel.querySelectorAll('[data-photo-select]'));
    var stage = carousel.querySelector('[data-photo-stage]');
    var counter = carousel.querySelector('[data-photo-counter]');
    var selectedIndex = 0;
    var pointer = null;
    var suppressClickUntil = 0;

    function select(index) {
        var previousLink = slides[selectedIndex].querySelector('a');
        var moveFocus = document.activeElement === previousLink;
        selectedIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, i) { slide.hidden = i !== selectedIndex; });
        thumbnails.forEach(function (button, i) { button.setAttribute('aria-pressed', String(i === selectedIndex)); });
        counter.textContent = String(selectedIndex + 1).padStart(2, '0') + ' / ' + String(slides.length).padStart(2, '0');
        if (moveFocus) slides[selectedIndex].querySelector('a').focus({preventScroll: true});
    }
    carousel.querySelector('[data-photo-prev]').addEventListener('click', function () { select(selectedIndex - 1); });
    carousel.querySelector('[data-photo-next]').addEventListener('click', function () { select(selectedIndex + 1); });
    thumbnails.forEach(function (button, i) { button.addEventListener('click', function () { select(i); }); });
    carousel.addEventListener('keydown', function (event) {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
            event.preventDefault();
            select(selectedIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
    });
    stage.style.touchAction = 'pan-y pinch-zoom';
    stage.addEventListener('pointerdown', function (event) {
        if (!event.isPrimary || event.button !== 0 || event.target.closest('button')) return;
        pointer = {id: event.pointerId, x: event.clientX, y: event.clientY};
        suppressClickUntil = 0;
    });
    window.addEventListener('pointerup', function (event) {
        if (!pointer || event.pointerId !== pointer.id) return;
        var dx = event.clientX - pointer.x;
        var dy = event.clientY - pointer.y;
        pointer = null;
        if (Math.abs(dx) >= 40 && Math.abs(dx) > Math.abs(dy)) {
            suppressClickUntil = Date.now() + 500;
            select(selectedIndex + (dx < 0 ? 1 : -1));
        }
    });
    window.addEventListener('pointercancel', function () { pointer = null; });
    stage.addEventListener('click', function (event) {
        if (Date.now() < suppressClickUntil) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    }, true);
    stage.addEventListener('click', function (event) {
        var link = event.target.closest('[data-photo-open]');
        if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        if (window.openInsanePhoto && window.openInsanePhoto(link.dataset.photoOpen, link)) event.preventDefault();
    });

    function randomizeHighlights() {
        var archiveFigures = Array.from(document.querySelectorAll('.photos-archive figure[data-photo-id]'));
        var eligible = archiveFigures.filter(function (fig) {
            var cat = fig.getAttribute('data-category');
            return cat === 'PROMO' || cat === 'LIVE';
        });
        if (eligible.length < slides.length) return;

        var shuffled = eligible.slice();
        for (var i = shuffled.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = shuffled[i];
            shuffled[i] = shuffled[j];
            shuffled[j] = temp;
        }
        var chosen = shuffled.slice(0, slides.length);

        chosen.forEach(function (fig, idx) {
            var id = fig.getAttribute('data-photo-id');
            var category = fig.getAttribute('data-category') || 'PROMO';
            var captionEl = fig.querySelector('figcaption');
            var captionText = captionEl ? captionEl.textContent.trim() : '';
            var link = fig.querySelector('a');
            var src = link ? link.getAttribute('href') : '';
            var size = link && link.getAttribute('data-size') ? link.getAttribute('data-size').split(/x/i).map(Number) : [6000, 4000];
            var img = link ? link.querySelector('img') : null;
            var thumb = img ? img.getAttribute('src') : src;
            var alt = img ? img.getAttribute('alt') : '';

            var slide = slides[idx];
            if (slide) {
                slide.setAttribute('data-photo-id', id);
                var slideLink = slide.querySelector('a');
                if (slideLink) {
                    slideLink.setAttribute('href', src);
                    slideLink.setAttribute('data-photo-open', id);
                    slideLink.setAttribute('aria-label', 'Enlarge: ' + alt);
                    var slideImg = slideLink.querySelector('img');
                    if (slideImg) {
                        slideImg.setAttribute('src', src);
                        slideImg.setAttribute('width', String(size[0]));
                        slideImg.setAttribute('height', String(size[1]));
                        slideImg.setAttribute('alt', alt);
                    }
                }
                var slideCaption = slide.querySelector('.photos-slide-caption');
                if (slideCaption) {
                    var eyebrow = slideCaption.querySelector('.photos-eyebrow');
                    if (eyebrow) eyebrow.textContent = category;
                    var textSpan = slideCaption.querySelector('span:not(.photos-eyebrow)');
                    if (textSpan) textSpan.textContent = captionText;
                }
            }

            var thumbBtn = thumbnails[idx];
            if (thumbBtn) {
                thumbBtn.setAttribute('aria-label', 'Show highlight ' + (idx + 1) + ': ' + captionText);
                var thumbImg = thumbBtn.querySelector('img');
                if (thumbImg) {
                    thumbImg.setAttribute('src', thumb);
                    thumbImg.setAttribute('width', String(size[0]));
                    thumbImg.setAttribute('height', String(size[1]));
                }
            }
        });
    }
    randomizeHighlights();
    select(0);
    carousel.querySelectorAll('[data-photo-controls]').forEach(function (controls) { controls.hidden = false; });
}());
