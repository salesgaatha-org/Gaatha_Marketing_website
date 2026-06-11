/* ==========================================================================
   gaa-tha · ui.js — interaction layer for the revamped UI
   (cursor, page transitions, hero reveal, marquees, nav state, reveals)
   ========================================================================== */
(function () {
    'use strict';

    var docEl = document.documentElement;
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function ready(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    /* ----------------------------------------------------------------------
       Preloader (index only) — full intro once per session, hidden after
       ---------------------------------------------------------------------- */
    ready(function () {
        var pre = document.getElementById('gt-preloader');
        if (!pre) return;
        var seen = false;
        try { seen = sessionStorage.getItem('gt_intro') === '1'; } catch (e) {}
        if (seen || reduceMotion) {
            pre.remove();
            return;
        }
        try { sessionStorage.setItem('gt_intro', '1'); } catch (e) {}
        window.setTimeout(function () {
            pre.classList.add('done');
            window.setTimeout(function () { pre.remove(); }, 900);
        }, 1250);
    });

    /* ----------------------------------------------------------------------
       Page-leave transition (internal links)
       ---------------------------------------------------------------------- */
    document.addEventListener('click', function (e) {
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        var a = e.target.closest('a');
        if (!a) return;
        var href = a.getAttribute('href') || '';
        if (!href || href.charAt(0) === '#' || a.target === '_blank' || a.hasAttribute('download')) return;
        if (/^(https?:)?\/\//i.test(href) && a.origin !== window.location.origin) return;
        if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
        // same page (possibly with hash) → let default behaviour run
        var samePage = a.pathname === window.location.pathname && a.hash;
        if (samePage) return;

        e.preventDefault();
        docEl.classList.add('is-leaving');
        window.setTimeout(function () { window.location.href = href; }, reduceMotion ? 0 : 340);
    }, true);

    // restore state when navigating back from bfcache
    window.addEventListener('pageshow', function (e) {
        if (e.persisted) docEl.classList.remove('is-leaving');
    });

    /* ----------------------------------------------------------------------
       Custom cursor (fine pointers only)
       ---------------------------------------------------------------------- */
    ready(function () {
        if (reduceMotion) return;
        if (!window.matchMedia('(pointer: fine)').matches || window.innerWidth <= 900) return;

        var dot = document.createElement('div');
        var ring = document.createElement('div');
        dot.className = 'cursor-dot';
        ring.className = 'cursor-ring';
        document.body.appendChild(dot);
        document.body.appendChild(ring);

        var mx = -100, my = -100, rx = -100, ry = -100, shown = false;

        document.addEventListener('mousemove', function (e) {
            mx = e.clientX; my = e.clientY;
            if (!shown) {
                shown = true;
                rx = mx; ry = my; // ring spawns under the pointer, no fly-in
                docEl.classList.add('cursor-on');
            }
            // the dot tracks instantly — zero lag
            dot.style.transform = 'translate(' + mx + 'px,' + my + 'px) translate(-50%,-50%)';
        }, { passive: true });

        document.addEventListener('mouseleave', function () { docEl.classList.remove('cursor-on'); shown = false; });
        document.addEventListener('mousedown', function () { docEl.classList.add('cursor-press'); });
        document.addEventListener('mouseup', function () { docEl.classList.remove('cursor-press'); });

        var HOVER_SEL = 'a, button, label, .client-item, .service-card, .work-card, .testimonial-dot, .reel-card, .website-card, .logo-card, .banner-card, .static-post-card, .brochure-card, .manifesto-row';
        var NATIVE_SEL = 'input, textarea, select';
        document.addEventListener('mouseover', function (e) {
            if (e.target.closest(HOVER_SEL)) docEl.classList.add('cursor-hover');
            if (e.target.closest(NATIVE_SEL)) docEl.classList.add('cursor-native');
        }, { passive: true });
        document.addEventListener('mouseout', function (e) {
            if (e.target.closest(HOVER_SEL)) docEl.classList.remove('cursor-hover');
            if (e.target.closest(NATIVE_SEL)) docEl.classList.remove('cursor-native');
        }, { passive: true });

        // the halo ring follows with a tight, springy ease
        (function follow() {
            rx += (mx - rx) * 0.32;
            ry += (my - ry) * 0.32;
            ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px) translate(-50%,-50%)';
            window.requestAnimationFrame(follow);
        })();
    });

    /* ----------------------------------------------------------------------
       Nav scroll state
       ---------------------------------------------------------------------- */
    (function () {
        var last = false;
        function onScroll() {
            var scrolled = window.scrollY > 50;
            if (scrolled !== last) {
                last = scrolled;
                docEl.classList.toggle('nav-scrolled', scrolled);
            }
        }
        window.addEventListener('scroll', onScroll, { passive: true });
        ready(onScroll);
    })();

    /* ----------------------------------------------------------------------
       Hero title word-split reveal  ([data-split])
       ---------------------------------------------------------------------- */
    ready(function () {
        document.querySelectorAll('[data-split]').forEach(function (el) {
            if (reduceMotion) return;
            var wi = 0;
            function splitNode(node) {
                var frag = document.createDocumentFragment();
                Array.prototype.slice.call(node.childNodes).forEach(function (child) {
                    if (child.nodeType === 3) {
                        var parts = child.textContent.split(/(\s+)/);
                        parts.forEach(function (part) {
                            if (!part) return;
                            if (/^\s+$/.test(part)) {
                                frag.appendChild(document.createTextNode(' '));
                            } else {
                                var line = document.createElement('span');
                                line.className = 'split-line';
                                var word = document.createElement('span');
                                word.className = 'split-word';
                                word.style.setProperty('--wi', wi++);
                                word.textContent = part;
                                line.appendChild(word);
                                frag.appendChild(line);
                            }
                        });
                    } else if (child.nodeType === 1 && child.tagName !== 'BR') {
                        var line = document.createElement('span');
                        line.className = 'split-line';
                        var word = document.createElement('span');
                        word.className = 'split-word';
                        word.style.setProperty('--wi', wi++);
                        word.appendChild(child.cloneNode(true));
                        line.appendChild(word);
                        frag.appendChild(line);
                    } else {
                        frag.appendChild(child.cloneNode(true));
                    }
                });
                return frag;
            }
            var content = splitNode(el);
            el.innerHTML = '';
            el.appendChild(content);
        });
    });

    /* ----------------------------------------------------------------------
       Reveal-on-scroll (.reveal)
       ---------------------------------------------------------------------- */
    ready(function () {
        var items = document.querySelectorAll('.reveal');
        if (!items.length) return;
        if (!('IntersectionObserver' in window) || reduceMotion) {
            items.forEach(function (el) { el.classList.add('in'); });
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
        items.forEach(function (el) { io.observe(el); });
    });

    /* ----------------------------------------------------------------------
       Marquee helper — duplicates content for a seamless loop
       ---------------------------------------------------------------------- */
    function buildMarquee(track, pxPerSecond) {
        if (!track || track.dataset.marqueeReady === '1') return;
        var setWidth = track.scrollWidth;
        if (!setWidth) return;
        var need = Math.max(2, Math.ceil((window.innerWidth * 1.4) / setWidth) * 2);
        var original = Array.prototype.slice.call(track.children);
        for (var c = 1; c < need; c++) {
            original.forEach(function (node) {
                var clone = node.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                track.appendChild(clone);
            });
        }
        var total = track.scrollWidth;
        track.style.setProperty('--marquee-dur', (total / 2 / pxPerSecond).toFixed(2) + 's');
        track.dataset.marqueeReady = '1';
    }

    /* Ticker strip */
    ready(function () {
        document.querySelectorAll('.ticker-track').forEach(function (track) {
            buildMarquee(track, 80);
        });
    });

    /* ----------------------------------------------------------------------
       Clients → infinite logo marquee (skipped in admin mode)
       ---------------------------------------------------------------------- */
    var isAdmin = false;
    try { isAdmin = localStorage.getItem('admin_secret') === 'gaatha_admin_2025_secret_key_xyz789'; } catch (e) {}

    function marqueeifyClients() {
        if (isAdmin || reduceMotion) return;
        var container = document.querySelector('.client-rows-container');
        if (!container) return;
        // fold tiny remainder rows (e.g. a single logo) into the previous row
        var rawRows = Array.prototype.slice.call(container.querySelectorAll('.client-row:not(.as-marquee)'));
        rawRows.forEach(function (row, i) {
            if (i === 0) return;
            if (row.children.length < 4) {
                var prev = rawRows[i - 1];
                if (prev && !prev.classList.contains('as-marquee')) {
                    while (row.firstChild) prev.appendChild(row.firstChild);
                    row.remove();
                }
            }
        });
        container.querySelectorAll('.client-row').forEach(function (row, i) {
            if (row.classList.contains('as-marquee')) return;
            var items = Array.prototype.slice.call(row.children);
            if (!items.length) return;
            var track = document.createElement('div');
            track.className = 'marquee-track';
            items.forEach(function (item) { track.appendChild(item); });
            row.appendChild(track);
            row.classList.add('as-marquee');
            if (i % 2 === 1) row.classList.add('row-reverse');
            row.style.transform = 'none';
            row.style.animation = 'none';
            buildMarquee(track, 42 + (i % 2) * 10);
        });
    }

    /* ----------------------------------------------------------------------
       How We Roll → interactive dossier deck
       Desktop: numbered menu drives a sticky dark panel (auto-cycles).
       Mobile: collapses into an accordion. Admin mode keeps the plain grid.
       ---------------------------------------------------------------------- */
    var rollDesktop = window.matchMedia('(min-width: 901px)');

    function buildRollDeck() {
        if (isAdmin) return;
        var grid = document.querySelector('.what-we-do-grid');
        if (!grid) return;
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.service-card'));
        if (!cards.length) return;

        // skip rebuilds that would produce the identical deck (the two data
        // renderers race each other on load)
        var sig = cards.map(function (c) {
            return ((c.querySelector('h3') || {}).textContent || '').trim();
        }).join('|');
        var oldDeck = document.querySelector('.roll-deck');
        if (oldDeck && oldDeck.dataset.sig === sig) {
            grid.style.display = 'none';
            return;
        }
        if (oldDeck) oldDeck.remove();

        var deck = document.createElement('div');
        deck.className = 'roll-deck';
        var list = document.createElement('div');
        list.className = 'roll-items';
        deck.appendChild(list);

        var heads = [], rows = [];

        cards.forEach(function (card, i) {
            var num = (i + 1 < 10 ? '0' : '') + (i + 1);
            card.classList.remove('fade-in');
            card.classList.add('roll-card');
            card.dataset.num = num;
            card.style.opacity = '';
            card.style.transform = '';
            card.style.animationDelay = '';
            Array.prototype.forEach.call(card.querySelectorAll('ul li'), function (el, j) {
                el.style.setProperty('--li', j);
            });

            var item = document.createElement('div');
            item.className = 'roll-item';

            var head = document.createElement('button');
            head.type = 'button';
            head.className = 'roll-head';
            head.setAttribute('aria-expanded', 'false');
            var numEl = document.createElement('span');
            numEl.className = 'roll-num';
            numEl.textContent = num;
            var nameEl = document.createElement('span');
            nameEl.className = 'roll-name';
            nameEl.textContent = ((card.querySelector('h3') || {}).textContent || 'Service ' + num).trim();
            var plusEl = document.createElement('span');
            plusEl.className = 'roll-plus';
            plusEl.setAttribute('aria-hidden', 'true');
            head.appendChild(numEl);
            head.appendChild(nameEl);
            head.appendChild(plusEl);

            var panel = document.createElement('div');
            panel.className = 'roll-panel';
            panel.appendChild(card);

            item.appendChild(head);
            item.appendChild(panel);
            list.appendChild(item);
            heads.push(head);
            rows.push(item);
        });

        deck.dataset.sig = sig;
        grid.style.display = 'none';
        grid.insertAdjacentElement('afterend', deck);

        var current = -1, timer = null, auto = !reduceMotion;

        function setActive(i) {
            rows.forEach(function (r, j) {
                r.classList.toggle('active', j === i);
                heads[j].setAttribute('aria-expanded', j === i ? 'true' : 'false');
            });
            current = i;
        }

        function schedule() {
            window.clearTimeout(timer);
            if (!auto || !rollDesktop.matches) return;
            timer = window.setTimeout(function () {
                setActive((current + 1) % rows.length);
                schedule();
            }, 4600);
        }

        heads.forEach(function (head, i) {
            head.addEventListener('click', function () {
                auto = false;
                deck.classList.add('no-auto');
                window.clearTimeout(timer);
                if (!rollDesktop.matches && i === current) {
                    // accordion: tapping the open row closes it
                    rows[i].classList.remove('active');
                    head.setAttribute('aria-expanded', 'false');
                    current = -1;
                    return;
                }
                setActive(i);
            });
        });

        deck.addEventListener('mouseenter', function () {
            deck.classList.add('paused');
            window.clearTimeout(timer);
        });
        deck.addEventListener('mouseleave', function () {
            deck.classList.remove('paused');
            if (auto && rollDesktop.matches && current >= 0) {
                // restart the cycle (and its progress bar) cleanly
                var c = current;
                rows[c].classList.remove('active');
                void rows[c].offsetWidth;
                rows[c].classList.add('active');
            }
            schedule();
        });

        // panels already show full content — suppress the legacy tap-modal
        deck.addEventListener('click', function (e) {
            if (e.target.closest('.roll-panel') && !e.target.closest('a, button')) {
                e.stopPropagation();
            }
        }, true);

        setActive(0);
        schedule();
    }

    ready(function () {
        var grid = document.querySelector('.what-we-do-grid');
        if (!grid) return;
        buildRollDeck();
        if ('MutationObserver' in window) {
            var pending = null;
            var mo = new MutationObserver(function (muts) {
                // ignore the mutation caused by our own card removal
                var added = muts.some(function (m) { return m.addedNodes.length > 0; });
                if (!added) return;
                if (pending) window.clearTimeout(pending);
                pending = window.setTimeout(buildRollDeck, 150);
            });
            mo.observe(grid, { childList: true });
        }
    });

    ready(function () {
        var container = document.querySelector('.client-rows-container');
        if (!container) return;
        marqueeifyClients();
        if ('MutationObserver' in window) {
            var pending = null;
            var mo = new MutationObserver(function () {
                if (pending) window.clearTimeout(pending);
                pending = window.setTimeout(marqueeifyClients, 120);
            });
            mo.observe(container, { childList: true });
        }
        // touch: tap a logo chip to reveal its social overlay
        if (window.matchMedia('(pointer: coarse)').matches) {
            document.addEventListener('click', function (e) {
                var item = e.target.closest('.client-item');
                var all = document.querySelectorAll('.client-item.show-overlay');
                if (!item) {
                    all.forEach(function (el) { el.classList.remove('show-overlay'); });
                    return;
                }
                var wasOpen = item.classList.contains('show-overlay');
                all.forEach(function (el) { el.classList.remove('show-overlay'); });
                if (!wasOpen) item.classList.add('show-overlay');
            });
        }
    });

    /* ----------------------------------------------------------------------
       Magnetic buttons
       ---------------------------------------------------------------------- */
    ready(function () {
        if (reduceMotion || !window.matchMedia('(pointer: fine)').matches) return;
        document.querySelectorAll('.cta-btn, .ghost-btn, .footer-cta-arrow, .testimonial-nav').forEach(function (btn) {
            var strength = 14;
            btn.addEventListener('mousemove', function (e) {
                var r = btn.getBoundingClientRect();
                var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
                var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
                btn.style.translate = (x * strength) + 'px ' + (y * strength * 0.7) + 'px';
            });
            btn.addEventListener('mouseleave', function () {
                btn.style.translate = '0px 0px';
            });
        });
    });

    /* ----------------------------------------------------------------------
       Footer: back-to-top + current year
       ---------------------------------------------------------------------- */
    ready(function () {
        var top = document.querySelector('.to-top');
        if (top) {
            top.addEventListener('click', function () {
                window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
            });
        }
        var year = document.querySelector('[data-year]');
        if (year) year.textContent = String(new Date().getFullYear());
    });

    /* ----------------------------------------------------------------------
       Mobile menu: lock scroll while open (script.js toggles .open)
       ---------------------------------------------------------------------- */
    ready(function () {
        var toggle = document.querySelector('.menu-toggle');
        var links = document.querySelector('.nav-links');
        if (!toggle || !links) return;
        var watcher = new MutationObserver(function () {
            document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
        });
        watcher.observe(links, { attributes: true, attributeFilter: ['class'] });
    });
})();
