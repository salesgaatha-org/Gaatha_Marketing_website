/* ==========================================================================
   gaa-tha — CMS runtime layer
   Applies admin-managed images, metrics and quotes from Firebase (cms/…) on
   top of the static HTML, so an upload in /content-admin.html shows up on the
   live page immediately. The build bakes the same data into the HTML on the
   next publish, so nothing here is needed for crawlers — it is a preview
   and freshness layer only. Every failure path leaves the page untouched.
   ========================================================================== */
(function () {
    'use strict';

    var DB_URL = 'https://gaatha-b9ee5-default-rtdb.asia-southeast1.firebasedatabase.app';

    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }
    function isFilled(v) { return v != null && String(v).trim() !== '' && !/^TODO-/i.test(String(v).trim()); }

    function getJSON(path) {
        return fetch(DB_URL + '/' + path + '.json', { cache: 'no-store' })
            .then(function (r) { return r.ok ? r.json() : null; })
            .catch(function () { return null; });
    }
    function getAt(obj, keyPath) {
        var parts = String(keyPath).split('/');
        var cur = obj;
        for (var i = 0; i < parts.length; i++) {
            if (cur == null) return null;
            cur = cur[parts[i]];
        }
        return cur;
    }

    /* Resolve a media id (or a bare URL) against cms/media. */
    function resolveImage(ref, media) {
        if (!ref) return null;
        if (typeof ref === 'object') return ref.url ? ref : null;
        var m = media && media[ref];
        if (m && m.url) return m;
        if (/^(https?:)?\//.test(ref)) return { url: ref, alt: '' };
        return null;
    }

    function applySlot(el, img) {
        if (!img || el.classList.contains('has-img')) return;
        var image = document.createElement('img');
        image.src = img.url;
        image.alt = img.alt || el.getAttribute('data-alt') || '';
        if (img.width && img.height) { image.width = img.width; image.height = img.height; }
        if (img.variants) {
            image.srcset = Object.keys(img.variants).map(function (w) { return img.variants[w] + ' ' + w + 'w'; }).join(', ');
            image.sizes = '(max-width: 960px) 100vw, 50vw';
        }
        image.loading = 'lazy';
        image.decoding = 'async';
        el.insertBefore(image, el.firstChild);
        el.classList.add('has-img');
    }

    function run() {
        var slots = document.querySelectorAll('.ph[data-ref]');
        var metricBlocks = document.querySelectorAll('[data-cms-metrics]');
        var quoteBlocks = document.querySelectorAll('[data-cms-quote]');
        if (!slots.length && !metricBlocks.length && !quoteBlocks.length) return;

        // Collect the record paths this page needs (services/<slug>, caseStudies/<slug>, blog/<slug>).
        var refs = {};
        slots.forEach(function (el) { var r = el.getAttribute('data-ref'); if (r) refs[r] = true; });
        metricBlocks.forEach(function (el) { refs['caseStudies/' + el.getAttribute('data-cms-metrics')] = true; });
        quoteBlocks.forEach(function (el) { refs['caseStudies/' + el.getAttribute('data-cms-quote')] = true; });

        var paths = Object.keys(refs);
        Promise.all([getJSON('cms/media')].concat(paths.map(function (p) { return getJSON('cms/' + p); })))
            .then(function (res) {
                var media = res[0] || {};
                var records = {};
                paths.forEach(function (p, i) { records[p] = res[i + 1]; });

                slots.forEach(function (el) {
                    var rec = records[el.getAttribute('data-ref')];
                    if (!rec || !rec.images) return;
                    var ref = getAt(rec.images, el.getAttribute('data-key'));
                    applySlot(el, resolveImage(ref, media));
                });

                metricBlocks.forEach(function (block) {
                    var rec = records['caseStudies/' + block.getAttribute('data-cms-metrics')];
                    if (!rec || !Array.isArray(rec.metrics)) return;
                    var filled = rec.metrics.filter(function (m) { return m && isFilled(m.value) && isFilled(m.label); });
                    if (!filled.length) return;
                    var grid = block.querySelector('.stats');
                    if (!grid) return;
                    grid.innerHTML = filled.slice(0, 4).map(function (m) {
                        return '<div class="stat"><div class="stat-num">' + esc(m.value) + '</div><div class="stat-label">' + esc(m.label) + '</div></div>';
                    }).join('');
                    block.hidden = false;
                    if (typeof window.gaathaObserveReveals === 'function') window.gaathaObserveReveals(block);
                });

                quoteBlocks.forEach(function (block) {
                    var rec = records['caseStudies/' + block.getAttribute('data-cms-quote')];
                    var q = rec && rec.quote;
                    if (!q || !isFilled(q.text) || !isFilled(q.name)) return;
                    var t = block.querySelector('[data-q]'), n = block.querySelector('[data-n]'), r = block.querySelector('[data-r]');
                    if (t) t.textContent = q.text;
                    if (n) n.textContent = q.name;
                    if (r) r.textContent = q.role || '';
                    block.hidden = false;
                    if (typeof window.gaathaObserveReveals === 'function') window.gaathaObserveReveals(block);
                });
            });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
    else run();
})();
