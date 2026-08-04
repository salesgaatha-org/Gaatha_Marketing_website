/* ==========================================================================
   gaa-tha — minimal interaction layer
   Small, passive and dependency-free. Everything degrades to plain HTML.
   ========================================================================== */
(function () {
    'use strict';

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ---------------------------- Reveal on scroll --------------------------- */
    var io = null;
    if ('IntersectionObserver' in window && !reduce) {
        io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) {
                if (!e.isIntersecting) return;
                e.target.classList.add('in');
                io.unobserve(e.target);
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }

    function observe(scope) {
        var els = (scope || document).querySelectorAll('.reveal');
        for (var i = 0; i < els.length; i++) {
            if (els[i].classList.contains('in')) continue;
            if (io) io.observe(els[i]); else els[i].classList.add('in');
        }
    }

    /* Stagger children of any [data-stagger] group. */
    document.querySelectorAll('[data-stagger]').forEach(function (group) {
        var step = parseFloat(group.dataset.stagger) || 0.06;
        Array.prototype.forEach.call(group.children, function (c, i) {
            c.style.setProperty('--d', (i * step).toFixed(3) + 's');
        });
    });

    observe(document);
    /* Public hook used by the Firebase data layer for injected cards. */
    window.gaathaObserveReveals = observe;

    /* ------------------------------ Count-up -------------------------------- */
    function countUp(el) {
        var raw = el.dataset.count;
        var num = parseFloat(raw);
        var suffix = el.dataset.suffix || '';
        if (isNaN(num)) { el.textContent = raw + suffix; return; }
        var dur = 1500, start = 0;
        function tick(now) {
            if (!start) start = now;
            var t = Math.min((now - start) / dur, 1);
            var eased = 1 - Math.pow(1 - t, 3);
            var val = num >= 100 ? Math.round(num * eased)
                                 : Math.round(num * eased * 10) / 10;
            el.textContent = val + suffix;
            if (t < 1) requestAnimationFrame(tick);
            else el.textContent = raw + suffix;
        }
        requestAnimationFrame(tick);
    }

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length) {
        if (reduce || !('IntersectionObserver' in window)) {
            counters.forEach(function (el) { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
        } else {
            var cIO = new IntersectionObserver(function (entries) {
                entries.forEach(function (e) {
                    if (!e.isIntersecting) return;
                    countUp(e.target);
                    cIO.unobserve(e.target);
                });
            }, { threshold: 0.5 });
            counters.forEach(function (el) { cIO.observe(el); });
        }
    }

    /* --------------------- Nav border + scroll progress ---------------------- */
    var nav = document.querySelector('.nav');
    var bar = document.createElement('div');
    bar.className = 'scroll-progress';
    document.body.appendChild(bar);

    var ticking = false, shrunk = null;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            var y = window.scrollY;
            var shrink = y > 24;
            if (nav && shrink !== shrunk) { shrunk = shrink; nav.classList.toggle('shrink', shrink); }
            var max = document.documentElement.scrollHeight - window.innerHeight;
            bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, y / max) : 0) + ')';
            ticking = false;
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    /* ------------------------------ Mobile menu ------------------------------ */
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.querySelector('.mobile-menu');
    if (toggle && menu) {
        function openMenu() {
            menu.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
            var first = menu.querySelector('a, button');
            if (first) first.focus();
        }
        function closeMenu() {
            menu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
        toggle.addEventListener('click', openMenu);
        menu.addEventListener('click', function (e) {
            if (e.target.closest('a, .mm-close')) closeMenu();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && menu.classList.contains('open')) { closeMenu(); toggle.focus(); }
        });
    }

    /* ------------------------------ FAQ accordion ---------------------------- */
    document.querySelectorAll('.faq-q').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.closest('.faq-item');
            if (!item) return;
            var wasOpen = item.classList.contains('open');
            var list = item.closest('.faq-list') || document;
            list.querySelectorAll('.faq-item').forEach(function (x) {
                x.classList.remove('open');
                var b = x.querySelector('.faq-q');
                if (b) b.setAttribute('aria-expanded', 'false');
            });
            if (!wasOpen) {
                item.classList.add('open');
                btn.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ------------------------------ Back to top ------------------------------ */
    var toTop = document.querySelector('.to-top');
    if (toTop) {
        toTop.addEventListener('click', function (e) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
        });
    }

    /* ------------------------------- Misc ------------------------------------ */
    document.querySelectorAll('[data-year]').forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });
})();
