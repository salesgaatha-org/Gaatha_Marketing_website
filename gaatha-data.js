/* ==========================================================================
   gaa-tha — Live data layer
   Wires the editorial front-end to the existing Firebase Realtime Database.
   Philosophy: real data first, gracefully fall back to the designed
   placeholders if Firebase is empty or unreachable — the page is never broken.
   ========================================================================== */
(function () {
    'use strict';

    /* ----------------------------- Firebase init ----------------------------- */
    var firebaseConfig = {
        apiKey: "AIzaSyBQlBj179byUqKjjXGH1TmpqT36nlDhwaY",
        authDomain: "gaatha-b9ee5.firebaseapp.com",
        databaseURL: "https://gaatha-b9ee5-default-rtdb.asia-southeast1.firebasedatabase.app",
        projectId: "gaatha-b9ee5",
        storageBucket: "gaatha-b9ee5.firebasestorage.app",
        messagingSenderId: "661713784587",
        appId: "1:661713784587:web:2b7bbcb40b18e53c361c0e",
        measurementId: "G-75RTC8CXEE"
    };

    var db = null;
    try {
        if (typeof firebase !== 'undefined') {
            if (!firebase.apps || !firebase.apps.length) {
                firebase.initializeApp(firebaseConfig);
            }
            db = firebase.database();
            // Expose for the contact form + any admin tooling that expects it.
            window.database = db;
        }
    } catch (err) {
        db = null;
    }

    /* ------------------------------- Helpers --------------------------------- */
    function esc(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    }

    // Normalise a Firebase object map into a sorted array of records.
    function toArray(val) {
        if (!val) return [];
        return Object.keys(val)
            .map(function (k) { return Object.assign({ id: k }, val[k]); })
            .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
    }

    function ensureHttp(url) {
        if (!url) return '';
        url = String(url).trim();
        if (!url) return '';
        if (/^(https?:|mailto:|tel:|\/|#)/i.test(url)) return url;
        return 'https://' + url;
    }

    function isVideo(url) {
        return /\.(mp4|mov|webm|m4v)(\?|$)/i.test(String(url || ''));
    }

    function once(path) {
        if (!db) return Promise.resolve(null);
        return db.ref(path).once('value')
            .then(function (snap) { return snap.val(); })
            .catch(function () { return null; });
    }

    function onReady(fn) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', fn);
        } else {
            fn();
        }
    }

    /* Re-run the reveal/animation observers on freshly injected nodes. */
    function refreshReveals(scope) {
        try {
            if (typeof window.gaathaObserveReveals === 'function') {
                window.gaathaObserveReveals(scope || document);
            }
        } catch (e) { /* no-op */ }
    }

    /* ============================= HOMEPAGE ================================== */

    /* ---- Clients marquee --------------------------------------------------- */
    function renderClients(clients) {
        var vel = document.querySelector('.clients-vel');
        if (!vel || !clients.length) return; // keep designed fallback
        var tracks = vel.querySelectorAll('.cvel-track');
        if (!tracks.length) return;

        function itemHTML(c) {
            var name = esc(c.name || c.title || 'Client');
            var url = ensureHttp(c.websiteUrl || c.website || c.link || '');
            var inner = name + ' <span class="dot">·</span>';
            return url
                ? '<a class="cvel-item" href="' + esc(url) + '" target="_blank" rel="noopener">' + inner + '</a>'
                : '<span class="cvel-item">' + inner + '</span>';
        }

        // Build a comfortably long, seamless loop from however many clients exist.
        var names = clients.slice();
        var reversed = names.slice().reverse();
        function buildTrack(list) {
            var seq = list.slice();
            while (seq.length < 6) seq = seq.concat(list); // pad short lists
            var half = seq.map(itemHTML).join('');
            return half + half; // duplicate for the -50% scroll loop
        }
        if (tracks[0]) tracks[0].innerHTML = buildTrack(names);
        if (tracks[1]) tracks[1].innerHTML = buildTrack(reversed);
    }

    /* ---- Testimonials ------------------------------------------------------ */
    function renderTestimonials(items) {
        if (!items.length) return; // keep designed fallback
        var mapped = items.map(function (t) {
            return {
                q: t.description || t.quote || t.text || '',
                n: t.clientName || t.name || '',
                r: t.designation || t.role || t.company || '',
                rating: t.rating || 5
            };
        }).filter(function (t) { return t.q; });
        if (mapped.length && typeof window.setTestimonials === 'function') {
            window.setTestimonials(mapped);
        }
    }

    /* ---- Contact form ------------------------------------------------------ */
    function wireContactForm() {
        var form = document.querySelector('form.cform');
        if (!form) return;

        var btn = form.querySelector('button[type="submit"], .btn-primary');
        var defaultLabel = btn ? btn.innerHTML : '';

        function flash(msg, ok) {
            if (!btn) return;
            btn.innerHTML = msg;
            if (!ok) {
                setTimeout(function () { btn.innerHTML = defaultLabel; }, 2600);
            }
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var get = function (n) {
                var el = form.querySelector('[name="' + n + '"]');
                return el ? el.value.trim() : '';
            };
            var data = {
                name: get('name'),
                email: get('email'),
                company: get('company'),
                budget: get('budget'),
                message: get('message')
            };

            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email);
            if (!data.name || !emailOk || !data.message) {
                flash('Please add your name, a valid email & a message');
                return;
            }

            if (btn) { btn.disabled = true; btn.innerHTML = 'Sending…'; }

            var payload = Object.assign({}, data, {
                createdAt: new Date().toISOString(),
                status: 'new',
                source: 'website'
            });

            var save = db
                ? db.ref('contactMessages').push(payload)
                : Promise.reject(new Error('offline'));

            save.then(function () {
                form.reset();
                if (btn) { btn.disabled = false; }
                flash('Sent — talk soon ✦', true);
                setTimeout(function () { if (btn) btn.innerHTML = defaultLabel; }, 5000);
            }).catch(function () {
                if (btn) { btn.disabled = false; }
                // Fallback: open the user's mail client so the lead is never lost.
                var subject = encodeURIComponent('New project enquiry — ' + (data.company || data.name));
                var body = encodeURIComponent(
                    'Name: ' + data.name + '\nEmail: ' + data.email +
                    '\nCompany: ' + data.company + '\nBudget: ' + data.budget +
                    '\n\n' + data.message
                );
                window.location.href = 'mailto:digimarketing@gaa-tha.com?subject=' + subject + '&body=' + body;
                flash('Opening your email app…', true);
                setTimeout(function () { if (btn) btn.innerHTML = defaultLabel; }, 4000);
            });
        });
    }

    function initHome() {
        wireContactForm();
        if (!db) return;
        once('clients').then(function (v) { renderClients(toArray(v)); });
        once('testimonials').then(function (v) { renderTestimonials(toArray(v)); });
    }

    /* ============================== REELS =================================== */
    var REEL_BUCKET = {
        'ai-ads': 'ai', 'ai-clone': 'clone',
        'influencer-ads': 'ugc', 'ugc-reels': 'ugc',
        'reels': 'reels', 'shorts-ads': 'reels'
    };
    var REEL_LABEL = {
        'ai-ads': 'AI Ad', 'ai-clone': 'AI Clone',
        'influencer-ads': 'Influencer', 'ugc-reels': 'UGC',
        'reels': 'Reel', 'shorts-ads': 'Short'
    };

    function reelCardHTML(reel, i) {
        var cat = String(reel.category || 'reels').toLowerCase();
        var bucket = REEL_BUCKET[cat] || 'reels';
        var label = REEL_LABEL[cat] || 'Reel';
        var title = esc(reel.title || reel.company || 'gaa-tha reel');
        var views = esc(reel.views || '');
        var link = ensureHttp(reel.link || reel.instagramUrl || '');
        var media = ensureHttp(reel.video || reel.videoUrl || reel.image || reel.imageUrl || '');
        var g = 'g' + ((i % 4) + 1);

        var mediaHTML = '';
        if (media && isVideo(media)) {
            mediaHTML = '<video src="' + esc(media) + '" autoplay muted loop playsinline preload="metadata"></video>';
        } else if (media) {
            mediaHTML = '<img src="' + esc(media) + '" alt="' + title + '" loading="lazy">';
        }
        var posterClass = 'reel-poster ' + (mediaHTML ? 'has-media' : g);

        var inner =
            '<div class="' + posterClass + '">' +
                '<span class="reel-cat">' + esc(label) + '</span>' +
                '<div class="reel-play"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"></path></svg></div>' +
                '<div class="reel-meta"><span class="reel-label">' + title + '</span>' +
                (views ? '<span class="reel-views">' + views + '</span>' : '') +
                '</div>' +
            '</div>';

        var attrs = 'class="reel reveal" data-cat="' + bucket + '" data-cursor="Play"';
        return link
            ? '<a ' + attrs + ' href="' + esc(link) + '" target="_blank" rel="noopener">' + mediaHTML + inner + '</a>'
            : '<div ' + attrs + '>' + mediaHTML + inner + '</div>';
    }

    function initReels() {
        if (!db) return;
        var grid = document.getElementById('reelGrid');
        if (!grid) return;
        once('reels').then(function (v) {
            var reels = toArray(v);
            if (!reels.length) return; // keep designed fallback
            grid.innerHTML = reels.map(reelCardHTML).join('');
            refreshReveals(grid);
            if (typeof window.gaathaApplyReelFilter === 'function') {
                window.gaathaApplyReelFilter();
            }
        });
    }

    /* ============================= WEBSITES ================================= */
    function websiteCardHTML(site, i) {
        var title = esc(site.title || site.company || 'Project');
        var desc = esc(site.description || site.company || '');
        var tag = esc(site.category || site.views || 'Website');
        var link = ensureHttp(site.link || site.websiteUrl || '');
        var media = ensureHttp(site.image || site.imageUrl || site.video || '');
        var c = 'c' + ((i % 4) + 1);

        var shot;
        if (media && isVideo(media)) {
            shot = '<video src="' + esc(media) + '" autoplay muted loop playsinline preload="metadata" class="proj-fill"></video>';
        } else if (media) {
            shot = '<img src="' + esc(media) + '" alt="' + title + '" loading="lazy" class="proj-fill">';
        } else {
            shot = '<div class="proj-canvas ' + c + '"><span class="pc-word">' + title + '</span><span class="pc-line"></span><span class="pc-line sm"></span></div>';
        }

        var card =
            '<div class="proj-shot">' +
                '<div class="browser-bar"><i></i><i></i><i></i></div>' +
                shot +
            '</div>' +
            '<div class="proj-meta"><div><h3>' + title + '</h3>' +
            (desc ? '<p>' + desc + '</p>' : '') + '</div>' +
            '<span class="tag">' + tag + '</span></div>';

        return link
            ? '<a class="proj reveal" href="' + esc(link) + '" target="_blank" rel="noopener" data-cursor="Visit">' + card + '</a>'
            : '<div class="proj reveal" data-cursor="View">' + card + '</div>';
    }

    function initWebsites() {
        if (!db) return;
        var grid = document.getElementById('projGrid');
        if (!grid) return;
        once('websites').then(function (v) {
            var sites = toArray(v);
            if (!sites.length) return; // keep designed fallback
            grid.innerHTML = sites.map(websiteCardHTML).join('');
            refreshReveals(grid);
        });
    }

    /* ============================= BRANDING ================================= */
    var CREATIVE_CLASS = ['c-a', 'c-c', 'c-d', 'c-e', 'c-b', 'c-f'];

    function creativeCardHTML(item, i, kind) {
        var title = esc(item.title || item.company || 'Creative');
        var sub = esc(item.company || kind || '');
        var media = ensureHttp(item.image || item.imageUrl || '');
        var bucket = (kind || 'logos');

        if (media) {
            return '<div class="creative has-media reveal" data-cat="' + esc(bucket) + '" data-cursor="View" style="background-image:url(\'' + esc(media) + '\')">' +
                '<span class="submark">' + (title || sub) + '</span></div>';
        }
        var cls = CREATIVE_CLASS[i % CREATIVE_CLASS.length];
        return '<div class="creative ' + cls + ' reveal" data-cat="' + esc(bucket) + '" data-cursor="View">' +
            '<span class="mark it">' + title + '</span><span class="submark">' + (sub || 'Identity') + '</span></div>';
    }

    function initBranding() {
        if (!db) return;
        var grid = document.getElementById('brandGrid');
        if (!grid) return;
        Promise.all([once('logos'), once('posts'), once('banners')]).then(function (res) {
            var logos = toArray(res[0]).map(function (x) { return Object.assign({ _kind: 'logos' }, x); });
            var posts = toArray(res[1]).map(function (x) { return Object.assign({ _kind: 'posts' }, x); });
            var banners = toArray(res[2]).map(function (x) { return Object.assign({ _kind: 'banners' }, x); });
            var all = logos.concat(posts, banners);
            if (!all.length) return; // keep designed fallback
            grid.innerHTML = all.map(function (item, i) {
                return creativeCardHTML(item, i, item._kind);
            }).join('');
            refreshReveals(grid);
            // reveal filter tabs only when we actually have categorised data
            var filters = document.querySelector('.brand-filters');
            if (filters) {
                filters.hidden = false;
                if (typeof window.gaathaApplyBrandFilter === 'function') {
                    window.gaathaApplyBrandFilter();
                }
            }
        });
    }

    /* =============================== Boot =================================== */
    onReady(function () {
        var page = (document.body.getAttribute('data-page') || '').toLowerCase();
        if (page === 'home' || document.querySelector('form.cform')) initHome();
        if (page === 'reels' || document.getElementById('reelGrid')) initReels();
        if (page === 'websites' || document.getElementById('projGrid')) initWebsites();
        if (page === 'branding' || document.getElementById('brandGrid')) initBranding();
    });
})();
