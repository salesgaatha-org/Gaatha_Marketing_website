/* gaa-tha — Living Gazette · premium interactions */
(function () {
    'use strict';
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches && window.innerWidth > 860;

    /* ============ Intro loader (decorative, self-healing) ============ */
    function runIntro() {
        if (reduce || document.hidden || sessionStorage.getItem('gt_intro') === '1') return;
        sessionStorage.setItem('gt_intro', '1');
        const el = document.createElement('div');
        el.className = 'gt-loader';
        el.innerHTML = '<div class="gt-loader-row"><span class="gt-loader-word">gaa-tha</span><span class="gt-loader-pct">0</span></div><div class="gt-loader-bar"><i></i></div>';
        document.body.appendChild(el);
        if (lenis) lenis.stop();
        const pct = el.querySelector('.gt-loader-pct');
        const bar = el.querySelector('.gt-loader-bar i');
        let done = false;
        function finish() {
            if (done) return; done = true;
            el.classList.add('lift');
            if (lenis) lenis.start();
            setTimeout(() => el.remove(), 1100);
        }
        let p = 0;
        const t = setInterval(() => {
            p = Math.min(100, p + Math.random() * 16 + 7);
            if (pct) pct.textContent = Math.round(p);
            if (bar) bar.style.transform = 'scaleX(' + (p / 100) + ')';
            if (p >= 100) { clearInterval(t); setTimeout(finish, 280); }
        }, 120);
        // safety net: never trap the user
        setTimeout(finish, 2600);
        el.addEventListener('click', finish);
    }

    /* ============ Reveal / kinetic ============ */
    let io;
    function initReveals() {
        io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.isIntersecting) {
                    e.target.classList.add('in');
                    if (e.target.dataset.once !== 'false') io.unobserve(e.target);
                }
            });
        }, { threshold: 0.16, rootMargin: '0px 0px -7% 0px' });
        document.querySelectorAll('.reveal, .kin, .word-rise').forEach((el) => io.observe(el));
        initWords();
        initCounts();
    }

    /* Allow the data layer to register cards injected after first paint. */
    window.gaathaObserveReveals = function (scope) {
        if (!io) return;
        (scope || document).querySelectorAll('.reveal').forEach((el) => {
            if (!el.classList.contains('in')) io.observe(el);
        });
    };

    document.querySelectorAll('[data-stagger]').forEach((group) => {
        const step = parseFloat(group.dataset.stagger) || 0.08;
        [...group.children].forEach((c, i) => c.style.setProperty('--d', (i * step) + 's'));
    });
    document.querySelectorAll('.kin').forEach((k) => {
        k.querySelectorAll('.kin-line > span').forEach((s, i) => s.style.setProperty('--i', i));
    });

    function initWords() {
        document.querySelectorAll('[data-words]').forEach((el) => {
            if (el.dataset.split) return; el.dataset.split = '1';
            const frag = document.createElement('div');
            frag.innerHTML = el.innerHTML;
            let idx = 0;
            const walk = (node) => {
                [...node.childNodes].forEach((n) => {
                    if (n.nodeType === 3) {
                        const parts = n.textContent.split(/(\s+)/);
                        const out = document.createDocumentFragment();
                        parts.forEach((p) => {
                            if (/^\s+$/.test(p) || p === '') out.appendChild(document.createTextNode(p));
                            else { const w = document.createElement('span'); w.className = 'word'; w.textContent = p; w.style.setProperty('--i', idx++); out.appendChild(w); }
                        });
                        n.replaceWith(out);
                    } else if (n.nodeType === 1) { n.classList && n.classList.add('word'); n.style && n.style.setProperty('--i', idx++); }
                });
            };
            walk(frag);
            el.innerHTML = frag.innerHTML;
            el.classList.add('word-rise');
            io.observe(el);
        });
    }

    function initCounts() {
        const cIO = new IntersectionObserver((entries) => {
            entries.forEach((e) => { if (e.isIntersecting) { countUp(e.target); cIO.unobserve(e.target); } });
        }, { threshold: 0.6 });
        document.querySelectorAll('[data-count]').forEach((el) => {
            if (reduce) el.textContent = el.dataset.count + (el.dataset.suffix || '');
            else cIO.observe(el);
        });
    }
    function countUp(el) {
        const raw = el.dataset.count, num = parseFloat(raw), suffix = el.dataset.suffix || '', dur = 1700, start = performance.now();
        function tick(now) {
            const t = Math.min((now - start) / dur, 1), eased = 1 - Math.pow(1 - t, 3);
            let val = num >= 100 ? Math.round(num * eased) : Math.round(num * eased * 10) / 10;
            el.textContent = val + suffix;
            if (t < 1) requestAnimationFrame(tick); else el.textContent = raw + suffix;
        }
        requestAnimationFrame(tick);
    }

    /* ============ Smooth scroll (Lenis) + velocity ============ */
    let lenis = null, vel = 0;
    function initScroll() {
        if (!reduce && window.Lenis) {
            lenis = new window.Lenis({ lerp: 0.14, wheelMultiplier: 1.05, smoothWheel: true });
            function raf(t) { lenis.raf(t); requestAnimationFrame(raf); }
            requestAnimationFrame(raf);
            lenis.on('scroll', (e) => { vel = e.velocity || 0; onScroll(); applyVelocity(); });
            // anchor links
            document.querySelectorAll('a[href^="#"]').forEach((a) => {
                a.addEventListener('click', (ev) => {
                    const id = a.getAttribute('href'); if (id.length < 2) return;
                    const t = document.querySelector(id); if (!t) return;
                    ev.preventDefault(); lenis.scrollTo(t, { offset: -70, duration: 0.9 });
                });
            });
        } else {
            window.addEventListener('scroll', onScroll, { passive: true });
        }
        onScroll();
    }
    const skewEls = [...document.querySelectorAll('.marquee, .cvel')];
    const skewSoft = [...document.querySelectorAll('.skew-on-scroll')];
    let lastSk = 99;
    function applyVelocity() {
        if (reduce || (!skewEls.length && !skewSoft.length)) return;
        const sk = Math.max(-7, Math.min(7, vel * 0.4));
        if (Math.abs(sk - lastSk) < 0.12) return; // skip imperceptible updates
        lastSk = sk;
        for (const el of skewEls) el.style.setProperty('--skew', sk + 'deg');
        for (const el of skewSoft) el.style.setProperty('--skew', (sk * 0.6) + 'deg');
    }

    /* ============ Nav + scene (rAF-throttled, cached) ============ */
    const nav = document.querySelector('.nav');
    const scenes = [...document.querySelectorAll('[data-scene]')];
    const parallaxEls = [...document.querySelectorAll('[data-parallax]')];
    let lastShrink = null, lastDark = null, ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const y = window.scrollY || (lenis ? lenis.scroll : 0);
            const shrink = y > 40;
            if (shrink !== lastShrink) { lastShrink = shrink; if (nav) nav.classList.toggle('shrink', shrink); }
            let dark = false; const probe = 70;
            for (const s of scenes) { const r = s.getBoundingClientRect(); if (r.top <= probe && r.bottom >= probe) dark = s.dataset.scene === 'dark'; }
            if (dark !== lastDark) { lastDark = dark; document.documentElement.classList.toggle('scene-dark', dark); }
            if (!reduce) for (const el of parallaxEls) el.style.transform = 'translateY(' + (y * (parseFloat(el.dataset.parallax) || 0.1)) + 'px)';
            ticking = false;
        });
    }

    /* ============ Custom cursor + labels ============ */
    function initCursor() {
        if (reduce || !fine) return;
        const dot = document.createElement('div'); dot.className = 'cursor-dot';
        const ring = document.createElement('div'); ring.className = 'cursor-ring';
        const label = document.createElement('span'); label.className = 'cursor-label'; ring.appendChild(label);
        document.body.append(dot, ring);
        let rx = 0, ry = 0, mx = innerWidth / 2, my = innerHeight / 2;
        window.addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`; });
        (function loop() { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`; requestAnimationFrame(loop); })();
        document.addEventListener('mouseover', (e) => {
            const t = e.target.closest('[data-cursor]');
            if (t) { ring.classList.add('has-label'); label.textContent = t.dataset.cursor; }
            else if (e.target.closest('a, button, .magnetic')) ring.classList.add('hot');
        });
        document.addEventListener('mouseout', (e) => {
            if (e.target.closest('[data-cursor]')) { ring.classList.remove('has-label'); label.textContent = ''; }
            if (e.target.closest('a, button, .magnetic')) ring.classList.remove('hot');
        });
    }

    /* ============ Magnetic ============ */
    if (!reduce && window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.magnetic').forEach((el) => {
            el.addEventListener('mousemove', (e) => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.3}px)`; });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    /* ============ Hover preview (floating thumb) ============ */
    function initPreview() {
        const hosts = document.querySelectorAll('[data-thumb]');
        if (!hosts.length || !fine || reduce) return;
        const prev = document.createElement('div'); prev.className = 'hover-preview'; document.body.appendChild(prev);
        let tx = 0, ty = 0, cx = 0, cy = 0, active = false;
        hosts.forEach((h) => {
            h.addEventListener('mouseenter', () => { active = true; prev.style.background = h.dataset.thumb; prev.innerHTML = '<span>' + (h.dataset.thumbLabel || '') + '</span>'; prev.classList.add('show'); });
            h.addEventListener('mouseleave', () => { active = false; prev.classList.remove('show'); });
            h.addEventListener('mousemove', (e) => { tx = e.clientX; ty = e.clientY; });
        });
        (function loop() { cx += (tx - cx) * 0.14; cy += (ty - cy) * 0.14; if (active) prev.style.transform = `translate(${cx}px,${cy}px) translate(-50%,-50%) rotate(-4deg)`; requestAnimationFrame(loop); })();
    }

    /* ============ Mobile menu / misc ============ */
    const toggle = document.querySelector('.menu-toggle'), menu = document.querySelector('.mobile-menu');
    if (toggle && menu) { toggle.addEventListener('click', () => menu.classList.add('open')); menu.addEventListener('click', (e) => { if (e.target.closest('a, .mm-close')) menu.classList.remove('open'); }); }
    const toTop = document.querySelector('.to-top');
    if (toTop) toTop.addEventListener('click', () => lenis ? lenis.scrollTo(0, { duration: 1.2 }) : window.scrollTo({ top: 0, behavior: 'smooth' }));
    document.querySelectorAll('[data-year]').forEach((el) => el.textContent = new Date().getFullYear());

    /* ============ Boot ============ */
    initReveals();
    initScroll();
    /* Custom cursor disabled — standard OS pointer is used. */
    initPreview();
    /* Intro loader intentionally disabled — it added artificial load delay. */
})();
