// Mobile menu: a click on [data-toggle="collapse"] shows or hides its data-target,
// using the Bootstrap 3 .collapse / .in classes. Standalone, so an error in a page
// script cannot stop it (PERF-09, PERF-10, PERF-12).
(function () {
    'use strict';

    document.addEventListener('click', function (e) {
        var button = e.target.closest ? e.target.closest('[data-toggle="collapse"]') : null;
        if (!button) { return; }
        var target = document.querySelector(button.getAttribute('data-target'));
        if (!target) { return; }
        var open = !target.classList.contains('in');
        if (open) {
            target.classList.add('in');
            button.classList.remove('collapsed');
        } else {
            target.classList.remove('in');
            button.classList.add('collapsed');
        }
        button.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
})();
