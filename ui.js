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
       How We Roll → snap-scrolling service rail
       Every service is a rich card you swipe through — the centered card
       "ignites" (ink + gold), neighbors recede. Scroll-driven, no timers.
       Admin mode keeps the plain editable grid.
       ---------------------------------------------------------------------- */
    function buildRollRail() {
        if (isAdmin) return;
        var grid = document.querySelector('.what-we-do-grid');
        if (!grid) return;
        var cards = Array.prototype.slice.call(grid.querySelectorAll('.service-card'));
        if (!cards.length) return;

        // skip rebuilds that would produce the identical rail (the two data
        // renderers race each other on load)
        var sig = cards.map(function (c) {
            return ((c.querySelector('h3') || {}).textContent || '').trim();
        }).join('|');
        var oldRail = document.querySelector('.roll-rail');
        if (oldRail && oldRail.dataset.sig === sig) {
            grid.style.display = 'none';
            return;
        }
        if (oldRail) oldRail.remove();

        var rail = document.createElement('div');
        rail.className = 'roll-rail';
        rail.dataset.sig = sig;

        var controls = document.createElement('div');
        controls.className = 'rail-controls';
        var index = document.createElement('div');
        index.className = 'rail-index';
        index.innerHTML = '<em>01</em><span>/ ' + (cards.length < 10 ? '0' : '') + cards.length + '</span>';
        var hint = document.createElement('div');
        hint.className = 'rail-hint';
        hint.innerHTML = '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 12h13"/><path d="m17 8 4 4-4 4"/><path d="M3 12h.01"/></svg>swipe';
        var arrows = document.createElement('div');
        arrows.className = 'rail-arrows';
        var prev = document.createElement('button');
        prev.type = 'button';
        prev.className = 'rail-arrow rail-prev';
        prev.setAttribute('aria-label', 'Previous service');
        prev.textContent = '\u2190';
        var next = document.createElement('button');
        next.type = 'button';
        next.className = 'rail-arrow rail-next';
        next.setAttribute('aria-label', 'Next service');
        next.textContent = '\u2192';
        arrows.appendChild(prev);
        arrows.appendChild(next);
        controls.appendChild(index);
        controls.appendChild(hint);
        controls.appendChild(arrows);

        var track = document.createElement('div');
        track.className = 'roll-track';
        track.setAttribute('tabindex', '0');
        track.setAttribute('aria-label', 'Our services — scroll horizontally');

        cards.forEach(function (card, i) {
            var num = (i + 1 < 10 ? '0' : '') + (i + 1);
            card.classList.remove('fade-in');
            card.classList.add('rail-card');
            card.dataset.num = num;
            card.style.opacity = '';
            card.style.transform = '';
            card.style.animationDelay = '';
            Array.prototype.forEach.call(card.querySelectorAll('ul li'), function (el, j) {
                el.style.setProperty('--li', j);
            });
            track.appendChild(card);
        });

        var progress = document.createElement('div');
        progress.className = 'roll-progress';
        progress.innerHTML = '<i></i>';

        rail.appendChild(controls);
        rail.appendChild(track);
        rail.appendChild(progress);

        grid.style.display = 'none';
        grid.insertAdjacentElement('afterend', rail);

        var bar = progress.querySelector('i');
        var numEl = index.querySelector('em');
        var frontIdx = -1;

        function update() {
            // progress bar
            var max = track.scrollWidth - track.clientWidth;
            var p = max > 0 ? track.scrollLeft / max : 0;
            bar.style.transform = 'scaleX(' + Math.max(0.04, Math.min(1, p)) + ')';

            // card nearest the track centre becomes the front card
            var mid = track.getBoundingClientRect().left + track.clientWidth / 2;
            var best = 0, bestDist = Infinity;
            cards.forEach(function (card, i) {
                var r = card.getBoundingClientRect();
                var d = Math.abs(r.left + r.width / 2 - mid);
                if (d < bestDist) { bestDist = d; best = i; }
            });
            if (best !== frontIdx) {
                frontIdx = best;
                cards.forEach(function (card, i) { card.classList.toggle('is-front', i === best); });
                numEl.textContent = (best + 1 < 10 ? '0' : '') + (best + 1);
                prev.disabled = best === 0;
                next.disabled = best === cards.length - 1;
            }
        }

        var raf = null;
        track.addEventListener('scroll', function () {
            if (raf) return;
            raf = window.requestAnimationFrame(function () { raf = null; update(); });
        }, { passive: true });
        window.addEventListener('resize', update, { passive: true });

        function goTo(i) {
            i = Math.max(0, Math.min(cards.length - 1, i));
            var card = cards[i];
            track.scrollTo({
                left: card.offsetLeft - (track.clientWidth - card.offsetWidth) / 2,
                behavior: reduceMotion ? 'auto' : 'smooth'
            });
        }

        prev.addEventListener('click', function () { goTo(frontIdx - 1); });
        next.addEventListener('click', function () { goTo(frontIdx + 1); });

        track.addEventListener('keydown', function (e) {
            if (e.key === 'ArrowRight') { e.preventDefault(); goTo(frontIdx + 1); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(frontIdx - 1); }
        });

        // tap a resting card to bring it front (and let front-card links work);
        // a real drag must never count as a tap
        var dragMoved = 0;
        track.addEventListener('click', function (e) {
            if (dragMoved > 6) {
                dragMoved = 0;
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            var card = e.target.closest('.rail-card');
            if (!card) return;
            var i = cards.indexOf(card);
            if (i !== frontIdx) { e.preventDefault(); e.stopPropagation(); goTo(i); }
        }, true);

        // content is fully visible — suppress the legacy tap-modal
        track.addEventListener('click', function (e) {
            if (!e.target.closest('a, button')) e.stopPropagation();
        }, true);

        // desktop: drag-to-scroll
        if (window.matchMedia('(pointer: fine)').matches) {
            var dragging = false, startX = 0, startLeft = 0;
            track.addEventListener('pointerdown', function (e) {
                if (e.button !== 0) return;
                dragging = true; dragMoved = 0;
                startX = e.clientX; startLeft = track.scrollLeft;
                track.classList.add('dragging');
            });
            window.addEventListener('pointermove', function (e) {
                if (!dragging) return;
                var dx = e.clientX - startX;
                dragMoved = Math.max(dragMoved, Math.abs(dx));
                track.scrollLeft = startLeft - dx;
            });
            window.addEventListener('pointerup', function () {
                if (!dragging) return;
                dragging = false;
                track.classList.remove('dragging');
                if (dragMoved > 6) goTo(frontIdx); // settle on the nearest card
            });
        }

        // one-time swipe nudge when the rail first scrolls into view (mobile)
        if (!reduceMotion && 'IntersectionObserver' in window && window.matchMedia('(max-width: 900px)').matches) {
            var nudged = false;
            var io = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting && !nudged) {
                        nudged = true;
                        track.classList.add('nudge');
                        window.setTimeout(function () { track.classList.remove('nudge'); }, 1600);
                        io.disconnect();
                    }
                });
            }, { threshold: 0.35 });
            io.observe(track);
        }

        update();
    }

    ready(function () {
        var grid = document.querySelector('.what-we-do-grid');
        if (!grid) return;
        buildRollRail();
        if ('MutationObserver' in window) {
            var pending = null;
            var mo = new MutationObserver(function (muts) {
                var added = muts.some(function (m) { return m.addedNodes.length > 0; });
                if (!added) return;
                if (pending) window.clearTimeout(pending);
                pending = window.setTimeout(buildRollRail, 150);
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
