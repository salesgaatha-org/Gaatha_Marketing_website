// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Calculate navbar height (20px top + navbar height + some extra space)
            const navbarHeight = 120; // Increased to ensure full visibility
            const targetPosition = target.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Handle cross-page navigation (e.g., from work.html to index.html#services)
// Use DOMContentLoaded for faster execution and avoid conflicts with other load handlers
let navigationProcessed = false;
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a hash in the URL and scroll to it
    if (window.location.hash && !navigationProcessed) {
        navigationProcessed = true;
        // Use requestAnimationFrame for smoother execution
        requestAnimationFrame(() => {
            const target = document.querySelector(window.location.hash);
            if (target) {
                const navbarHeight = 120;
                const targetPosition = target.offsetTop - navbarHeight;
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
});

// Story cards: expandable "Read more" with smooth toggle and analytics-friendly ARIA
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.story-more');
    if (!btn) return;
    const card = btn.closest('.story-card');
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    if (card) card.setAttribute('aria-expanded', String(!expanded));
    btn.textContent = expanded ? 'Read more' : 'Show less';
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all fade-in elements
document.querySelectorAll('.fade-in').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    observer.observe(el);
});

// Function to ensure videos are always visible and working
function initializeVideos() {
    document.querySelectorAll('.service-video').forEach(video => {
        video.style.opacity = '1';
        video.style.visibility = 'visible';
        video.style.display = 'block';
        
        // Ensure video attributes are set correctly
        video.setAttribute('autoplay', 'true');
        video.setAttribute('muted', 'true');
        video.setAttribute('loop', 'true');
        video.setAttribute('playsinline', 'true');
        
        // Force video to play
        video.play().catch(e => {
            // Video autoplay prevented
        });
    });
}

// Initialize videos on page load
initializeVideos();

// Make function globally available
window.initializeVideos = initializeVideos;

// Ensure the hero video uses the requested mobile clip
(function ensureMobileHeroVideo(){
    function setHeroVideoForMobile() {
        const hero = document.querySelector('.hero-video');
        if (!hero) return;
        if (window.innerWidth <= 768) {
            const preferredSrc = 'videos/fZLgOvdZUCAic1qy9qp0BOpO6I.mp4';
            const fallbackSrc = 'fZLgOvdZUCAic1qy9qp0BOpO6I.mp4'; // in case the file is at project root

            const applyPlayback = () => {
                hero.setAttribute('autoplay', 'true');
                hero.setAttribute('muted', 'true');
                hero.setAttribute('loop', 'true');
                hero.setAttribute('playsinline', 'true');
                hero.muted = true;
                hero.play().catch(()=>{});
            };

            const current = String(hero.getAttribute('src') || '');
            if (!current.includes('fZLgOvdZUCAic1qy9qp0BOpO6I.mp4')) {
                hero.onerror = function() {
                    if (!hero.src.includes(fallbackSrc)) {
                        hero.src = fallbackSrc;
                        applyPlayback();
                    }
                };
                hero.src = preferredSrc;
                applyPlayback();
            } else {
                applyPlayback();
            }
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setHeroVideoForMobile);
    } else {
        setHeroVideoForMobile();
    }

    let resizeTimer;
    window.addEventListener('resize', function(){
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setHeroVideoForMobile, 200);
    });
})();

// Reinitialize videos after any DOM changes
const videoObserver = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
            // Check if any service videos were added or modified
            const addedNodes = Array.from(mutation.addedNodes);
            const hasServiceVideos = addedNodes.some(node => 
                node.nodeType === 1 && (
                    node.classList?.contains('service-video') || 
                    node.querySelector?.('.service-video')
                )
            );
            
            if (hasServiceVideos) {
                setTimeout(initializeVideos, 100);
            }
        }
    });
});

// Observe the entire document for changes
videoObserver.observe(document.body, {
    childList: true,
    subtree: true
});

// Animate home work cards when in view
const workCards = document.querySelectorAll('.work-animate');
workCards.forEach(card => {
    card.style.transition = 'opacity .5s ease, transform .5s ease';
});

if (workCards.length) {
    const workObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.2 });
    workCards.forEach(card => workObs.observe(card));
}

// Form submission handler
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    // Success message helper
    function showContactSuccessMessage(formEl, messageText) {
        try {
            // Inject styles once
            if (!document.getElementById('contact-success-styles')) {
                const s = document.createElement('style');
                s.id = 'contact-success-styles';
                s.textContent = `
                .contact-success-msg{margin-top:12px;padding:12px 14px;border-radius:10px;background:linear-gradient(135deg,#f5f1ea 0%,#e8dcc8 100%);color:#6b4a2a;border:1px solid rgba(139,111,71,.35);font-weight:600;box-shadow:0 6px 18px rgba(0,0,0,.06);text-align:center;z-index:2}
                .contact-success-msg.fadeout{opacity:0;transition:opacity .4s ease}
                `;
                document.head.appendChild(s);
            }
            // Find existing or create
            let msg = formEl.querySelector('.contact-success-msg');
            if (!msg) {
                msg = document.createElement('div');
                msg.className = 'contact-success-msg';
                // Place after submit button for visibility
                const submit = formEl.querySelector('.submit-btn');
                if (submit && submit.parentNode) {
                    submit.parentNode.appendChild(msg);
                } else {
                    formEl.appendChild(msg);
                }
            }
            msg.textContent = messageText || 'Thanks! Your message has been sent.';
            msg.classList.remove('fadeout');
            // Ensure visibility on small screens
            try {
                const isSmall = window.matchMedia('(max-width: 768px)').matches;
                if (isSmall && typeof msg.scrollIntoView === 'function') {
                    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            } catch (_) { /* no-op */ }
            // Auto dismiss after 4s
            setTimeout(() => { msg.classList.add('fadeout'); }, 3500);
            setTimeout(() => { if (msg && msg.parentNode) msg.parentNode.removeChild(msg); }, 4000);
        } catch (_) { /* no-op */ }
    }

    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form values
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const company = document.getElementById('company').value.trim();
        const budget = document.getElementById('budget').value.trim();
        const message = document.getElementById('message').value.trim();

        // Validate email and budget (> 0)
        const emailInput = document.getElementById('email');
        const budgetInput = document.getElementById('budget');
        const companyInput = document.getElementById('company');
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const budgetNumber = parseFloat(budget);
        let hasError = false;

        // Reset borders
        if (emailInput) emailInput.style.borderColor = 'rgba(139, 111, 71, 0.2)';
        if (budgetInput) budgetInput.style.borderColor = 'rgba(139, 111, 71, 0.2)';
        if (companyInput) companyInput.style.borderColor = 'rgba(139, 111, 71, 0.2)';

        if (!emailPattern.test(email)) {
            hasError = true;
            if (emailInput) emailInput.style.borderColor = '#ff6b6b';
        }
        if (!isFinite(budgetNumber) || budgetNumber <= 0) {
            hasError = true;
            if (budgetInput) budgetInput.style.borderColor = '#ff6b6b';
        }

        // Prevent email-like input in company field
        if (company && (company.includes('@') || emailPattern.test(company))) {
            hasError = true;
            if (companyInput) companyInput.style.borderColor = '#ff6b6b';
        }

        if (hasError) {
            alert('Please provide a valid email, budget > 0, and no email in company.');
            return;
        }
        
        // Show loading state
        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;
        
        try {
            // Save to Firebase database
            if (window.database) {
                const contactData = {
                    name: name,
                    email: email,
                    company: company || '',
                    budget: budget || '',
                    message: message,
                    createdAt: new Date().toISOString(),
                    status: 'new'
                };
                
                await window.database.ref('contactMessages').push(contactData);
                
                // Show success message
                submitBtn.textContent = 'Message Sent!';
                // In-page themed success banner
                showContactSuccessMessage(this, 'Thanks! Your message has been sent. We\'ll get back to you soon.');
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
                
                // Reset form
                this.reset();
            } else {
                alert('Sorry, there was an error sending your message. Please try again later.');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
            
        } catch (error) {
            alert('Sorry, there was an error sending your message. Please try again later.');
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

// Removed parallax to keep normal scrolling without background offset

// Add active state to navigation on scroll
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

window.addEventListener('scroll', () => {
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Smooth hover effect for cards
const cards = document.querySelectorAll('.service-card, .stat-card, .client-card, .testimonial-card');

cards.forEach(card => {
    card.addEventListener('mouseenter', function(e) {
        this.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Smooth page transitions - only apply to initial page load
window.addEventListener('load', () => {
    // Only apply transition if this is the initial page load, not navigation
    if (!window.location.hash) {
        document.body.style.transition = 'opacity 0.3s ease';
        document.body.style.opacity = '1';
    }
});

// Navbar scroll effect
// Navbar scroll effects removed to maintain consistent appearance across all pages

// Counter animation for stats (supports hero and old stat cards)
const statNumbers = document.querySelectorAll('.stat-card h2, .hero-stat-number:not([data-static="true"])');
const animateCounter = (element) => {
    const target = element.textContent;
    const number = parseInt(target.replace(/\D/g, ''));
    const suffix = target.replace(/[0-9]/g, '');
    const duration = 2000;
    const increment = number / (duration / 16);
    let current = 0;
    
    const updateCounter = () => {
        current += increment;
        if (current < number) {
            element.textContent = Math.floor(current) + suffix;
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = number + suffix;
        }
    };
    
    updateCounter();
};

// Observe stats for counter animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            entry.target.classList.add('counted');
            animateCounter(entry.target);
        }
    });
}, { threshold: 0.5 });

statNumbers.forEach(stat => {
    statsObserver.observe(stat);
});

// Add ripple effect to buttons
const buttons = document.querySelectorAll('.cta-btn, .btn-secondary');

buttons.forEach(button => {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.classList.add('ripple');
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Add CSS for ripple effect dynamically
const style = document.createElement('style');
style.textContent = `
    .cta-btn, .btn-secondary {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.6);
        transform: scale(0);
        animation: ripple-animation 0.6s ease-out;
        pointer-events: none;
    }
    
    @keyframes ripple-animation {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .nav-links a.active {
        color: #8B6F47;
    }
    
    .nav-links a.active::after {
        width: 100%;
    }
`;
document.head.appendChild(style);

// Form validation with better UX
const formInputs = document.querySelectorAll('.form-group input, .form-group textarea');

formInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.value.trim() === '' && this.hasAttribute('required')) {
            this.style.borderColor = '#ff6b6b';
        } else {
            this.style.borderColor = 'rgba(139, 111, 71, 0.2)';
        }
    });
    
    input.addEventListener('focus', function() {
        this.style.borderColor = '#8B6F47';
    });
});

// Lazy loading for better performance
if ('IntersectionObserver' in window) {
    const lazyElements = document.querySelectorAll('.service-card, .client-card');
    
    const lazyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.willChange = 'transform';
                setTimeout(() => {
                    entry.target.style.willChange = 'auto';
                }, 1000);
            }
        });
    });
    
    lazyElements.forEach(el => lazyObserver.observe(el));
}

// Smoothly center client rows and stop
function centerClientRows() {
    const container = document.querySelector('.client-rows-container');
    if (!container) return;
    const rows = container.querySelectorAll('.client-row');
    if (!rows.length) return;

    const containerWidth = container.getBoundingClientRect().width;

    rows.forEach(row => {
        // Cancel any CSS animations and ensure items keep hovering as before
        row.style.animation = 'none';
        row.classList.remove('animate-in', 'animate-to-center');

        // Prepare starting positions offscreen on respective sides
        const rowWidth = row.scrollWidth;
        const isLeft = row.classList.contains('client-row-left');
        row.style.transition = 'none';
        row.style.transform = `translate3d(${isLeft ? -rowWidth : containerWidth}px, 0, 0)`;
    });

    // Force reflow so the browser registers the starting transform
    void container.offsetHeight;

    rows.forEach(row => {
        const rowWidth = row.scrollWidth;
        const targetX = Math.round((containerWidth - rowWidth) / 2);
        row.style.transition = 'transform 1500ms ease-out';
        row.style.transform = `translate3d(${targetX}px, 0, 0)`;
        row.classList.add('paused-at-center');
    });
}

// Client section now static grid; no observer or animations needed

// Function to trigger client animations (called after clients are loaded)
function triggerClientAnimations() {
    const clientItems = document.querySelectorAll('.client-item');
    clientItems.forEach(item => item.classList.add('animate-in'));
    const rows = document.querySelectorAll('.client-row-left, .client-row-right');
    rows.forEach(row => row.classList.add('animate-in'));
}

// Expose function globally for Firebase data loader
window.triggerClientAnimations = triggerClientAnimations;

// Ensure non-admin also centers rows: fallback on load and on resize
// Removed automatic centering on load; marquee begins on intersection

// Removed re-centering on resize

// Keyboard navigation enhancement
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        // Close any open modals or reset focus
        document.activeElement.blur();
    }
});

// Smooth scroll to top on logo click ONLY on homepage; allow navigation elsewhere
const logo = document.querySelector('.logo');
if (logo) {
    logo.addEventListener('click', (e) => {
        // If we're not already on index.html (or site root), let the anchor navigate
        const path = String(window.location.pathname || '');
        const onHome = path.endsWith('/index.html') || path === '/' || path === '';
        if (!onHome) { return; }
        // On homepage, intercept and smooth-scroll to top
        const anchor = e.target.closest('a');
        if (anchor) {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

// Add cursor trail effect (optional - subtle) - COMMENTED OUT
/*
let cursorTrail = [];
const maxTrailLength = 10;

document.addEventListener('mousemove', (e) => {
    if (window.innerWidth > 768) {
        cursorTrail.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: Date.now()
        });
        
        if (cursorTrail.length > maxTrailLength) {
            cursorTrail.shift();
        }
    }
});
*/

// Speed up shine animation for section headers when they enter viewport
(() => {
    try {
        const headerSections = document.querySelectorAll('.services .section-header, .clients .section-header, .testimonials .section-header, .contact .section-header');
        if (!headerSections.length) return;
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                } else {
                    entry.target.classList.remove('in-view');
                }
            });
        }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
        headerSections.forEach(sec => io.observe(sec));
    } catch (_) {}
})();

// Mobile hamburger toggle - Simple and direct approach
function initHamburgerMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (!toggle || !navLinks) {
        return;
    }
    
    // Remove any existing event listeners
    toggle.onclick = null;
    
    // Add click event to toggle button
    toggle.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Toggle the open class
        if (navLinks.classList.contains('open')) {
            navLinks.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        } else {
            navLinks.classList.add('open');
            toggle.setAttribute('aria-expanded', 'true');
        }
    };
    
    // Close menu on link click
    const navLinksArray = navLinks.querySelectorAll('a');
    navLinksArray.forEach(link => {
        link.onclick = function() {
            navLinks.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        };
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHamburgerMenu);
} else {
    initHamburgerMenu();
}

// Mobile: tap to show client social overlay above logo
function initClientOverlayTouch() {
    if (typeof window === 'undefined') return;
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;
    const items = document.querySelectorAll('.client-item');
    if (!items.length) return;
    // Remove previous bindings by cloning (prevents duplicate listeners)
    items.forEach((item) => {
        const clone = item.cloneNode(true);
        item.parentNode.replaceChild(clone, item);
    });
    const newItems = document.querySelectorAll('.client-item');
    const hideAll = () => newItems.forEach(i => i.classList.remove('show-overlay'));
    newItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            // If social icon tapped, let link work but keep overlay shown
            const wasOpen = item.classList.contains('show-overlay');
            hideAll();
            if (!wasOpen) item.classList.add('show-overlay');
            e.stopPropagation();
        });
    });
    // Tapping anywhere else hides overlays
    document.addEventListener('click', () => hideAll());
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClientOverlayTouch);
} else {
    initClientOverlayTouch();
}

// Testimonials data comes ONLY from Firebase
let testimonials = [];
// Expose and keep in sync with window for external access
window.testimonials = testimonials;
// Setter used by Firebase loader to inject fresh testimonials
window.setTestimonialsData = function(arr) {
    testimonials = Array.isArray(arr) ? arr : [];
    window.testimonials = testimonials;
    if (typeof window.reinitializeTestimonials === 'function') {
        window.reinitializeTestimonials();
    }
};

const cardEl = document.getElementById('testimonialCard');
const starsEl = document.getElementById('testimonialStars');
const quoteEl = document.getElementById('testimonialQuote');
const nameEl = document.getElementById('testimonialName');
const roleEl = document.getElementById('testimonialRole');
const prevBtn = document.getElementById('testimonialPrev');
const nextBtn = document.getElementById('testimonialNext');
const dotsEl = document.getElementById('testimonialDots');

let testiIndex = 0;
let testiTimer = null;
// Expose read-only getter for current testimonial index (used by admin controls)
window.getCurrentTestimonialIndex = function() { return testiIndex; };

// Helper: check if admin mode is active
function isAdminModeActive() {
    try {
        const ADMIN_KEY = 'gaatha_admin_2025_secret_key_xyz789';
        return (typeof localStorage !== 'undefined') && (localStorage.getItem('admin_secret') === ADMIN_KEY);
    } catch (_) { return false; }
}

function renderDots() {
    dotsEl.innerHTML = '';
    testimonials.forEach((_, i) => {
        const dot = document.createElement('span');
        dot.className = 'testimonial-dot' + (i === testiIndex ? ' active' : '');
        dot.addEventListener('click', () => goToTestimonial(i));
        dotsEl.appendChild(dot);
    });
}

function setTestimonial(i) {
    const t = testimonials[i];
    starsEl.textContent = t.stars;
    quoteEl.textContent = '"' + t.quote + '"';
    nameEl.textContent = t.name;
    roleEl.textContent = t.role;
    renderDots();
}

function getReadingTimeMs(text) {
    const words = String(text || '').split(/\s+/).filter(Boolean).length;
    const wpm = 180; // average reading speed
    const base = 1500; // base time for transition
    return Math.max(base, Math.round((words / wpm) * 60 * 1000));
}

function scheduleNext() {
    clearTimeout(testiTimer);
    // Do not auto-advance in admin mode
    if (isAdminModeActive()) {
        return;
    }
    const ms = getReadingTimeMs(testimonials[testiIndex].quote) + 1200; // small buffer
    testiTimer = setTimeout(() => {
        nextTestimonial();
    }, ms);
}

function goToTestimonial(i) {
    testiIndex = (i + testimonials.length) % testimonials.length;
    cardEl.style.opacity = '0';
    setTimeout(() => {
        setTestimonial(testiIndex);
        cardEl.style.transition = 'opacity 0.5s ease';
        cardEl.style.opacity = '1';
        if (!isAdminModeActive()) {
            scheduleNext();
        } else {
            clearTimeout(testiTimer);
        }
    }, 250);
}

function nextTestimonial() {
    goToTestimonial(testiIndex + 1);
}

function prevTestimonial() {
    goToTestimonial(testiIndex - 1);
}

// Make functions globally available for Firebase integration
window.goToTestimonial = goToTestimonial;
window.nextTestimonial = nextTestimonial;
window.prevTestimonial = prevTestimonial;

// Initialize testimonials
function initializeTestimonials() {
    if (cardEl && starsEl && quoteEl && nameEl && roleEl && testimonials.length > 0) {
        setTestimonial(testiIndex);
        renderDots();
        // Stop autoplay when admin mode is active
        const ADMIN_KEY = 'gaatha_admin_2025_secret_key_xyz789';
        const isAdminMode = (typeof localStorage !== 'undefined') && (localStorage.getItem('admin_secret') === ADMIN_KEY);
        if (!isAdminMode) {
            scheduleNext();
        } else {
            clearTimeout(testiTimer);
        }
    }
}

// Reinitialize testimonials when data changes
function reinitializeTestimonials() {
    if (cardEl && starsEl && quoteEl && nameEl && roleEl && testimonials.length > 0) {
        testiIndex = 0; // Reset to first testimonial
        setTestimonial(testiIndex);
        renderDots();
        const ADMIN_KEY = 'gaatha_admin_2025_secret_key_xyz789';
        const isAdminMode = (typeof localStorage !== 'undefined') && (localStorage.getItem('admin_secret') === ADMIN_KEY);
        if (!isAdminMode) {
            scheduleNext();
        } else {
            clearTimeout(testiTimer);
        }
    }
}

// Make reinitialize function globally available
window.reinitializeTestimonials = reinitializeTestimonials;

// Initialize on load
initializeTestimonials();

if (prevBtn) prevBtn.addEventListener('click', prevTestimonial);
if (nextBtn) nextBtn.addEventListener('click', nextTestimonial);

// Mobile services scroll functionality
(() => {
    const servicesGrid = document.querySelector('.services-glance-grid');
    if (!servicesGrid) return;
    
    let currentIndex = 0;
    const cards = servicesGrid.querySelectorAll('.service-card');
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Auto-scroll functionality
    function scrollToCard(index) {
        if (index < 0 || index >= totalCards) return;
        
        const card = cards[index];
        const cardWidth = window.innerWidth; // Full viewport width
        const scrollPosition = index * cardWidth;
        
        servicesGrid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        
        currentIndex = index;
    }
    
    // Removed auto-scroll timer - user only scrolls manually
    
    // Handle scroll events to update current index
    let scrollTimeout;
    servicesGrid.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollLeft = servicesGrid.scrollLeft;
            const cardWidth = window.innerWidth;
            const newIndex = Math.round(scrollLeft / cardWidth);
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalCards) {
                currentIndex = newIndex;
            }
        }, 100);
    });
    
    // Do not auto-scroll; keep initial position so scroll hint remains visible
})();

// Mobile websites scroll functionality
(() => {
    const websitesGrid = document.querySelector('.websites-grid');
    if (!websitesGrid) return;
    
    let currentIndex = 0;
    const cards = websitesGrid.querySelectorAll('.website-card');
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Auto-scroll functionality
    function scrollToCard(index) {
        if (index < 0 || index >= totalCards) return;
        
        const card = cards[index];
        const cardWidth = window.innerWidth; // Full viewport width
        const scrollPosition = index * cardWidth;
        
        websitesGrid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        
        currentIndex = index;
    }
    
    // Handle scroll events to update current index
    let scrollTimeout;
    websitesGrid.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollLeft = websitesGrid.scrollLeft;
            const cardWidth = window.innerWidth;
            const newIndex = Math.round(scrollLeft / cardWidth);
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalCards) {
                currentIndex = newIndex;
            }
        }, 100);
        
        // Keep scroll indicator visible at all times on mobile
    });
    
    // Do not auto-scroll; maintain initial position
})();

// Mobile static posts scroll functionality
(() => {
    const staticPostsGrid = document.querySelector('.static-posts-grid');
    if (!staticPostsGrid) return;
    
    let currentIndex = 0;
    const cards = staticPostsGrid.querySelectorAll('.static-post-card');
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Auto-scroll functionality
    function scrollToCard(index) {
        if (index < 0 || index >= totalCards) return;
        
        const card = cards[index];
        const cardWidth = window.innerWidth; // Full viewport width
        const scrollPosition = index * cardWidth;
        
        staticPostsGrid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        
        currentIndex = index;
    }
    
    // Handle scroll events to update current index
    let scrollTimeout;
    staticPostsGrid.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollLeft = staticPostsGrid.scrollLeft;
            const cardWidth = window.innerWidth;
            const newIndex = Math.round(scrollLeft / cardWidth);
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalCards) {
                currentIndex = newIndex;
            }
        }, 100);
        
        // Keep scroll indicator visible at all times on mobile
    });
    
    // Do not auto-scroll; maintain initial position
})();

// Mobile reels scroll functionality (category-wise horizontal like websites)
(() => {
    const reelsGrid = document.querySelector('.reels-grid');
    if (!reelsGrid) return;
    
    let currentIndex = 0;
    const cards = reelsGrid.querySelectorAll('.reel-card');
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Auto-scroll functionality
    function scrollToCard(index) {
        if (index < 0 || index >= totalCards) return;
        
        const card = cards[index];
        const cardWidth = window.innerWidth; // Full viewport width
        const scrollPosition = index * cardWidth;
        
        reelsGrid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        
        currentIndex = index;
    }
    
    // Handle scroll events to update current index
    let scrollTimeout;
    reelsGrid.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollLeft = reelsGrid.scrollLeft;
            const cardWidth = window.innerWidth;
            const newIndex = Math.round(scrollLeft / cardWidth);
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalCards) {
                currentIndex = newIndex;
            }
        }, 100);
        
        // Keep scroll indicator visible at all times on mobile
    });
    
    // Do not auto-scroll; maintain initial position
})();

// Mobile logo design scroll functionality
(() => {
    const logoDesignGrid = document.querySelector('.logo-design-grid');
    if (!logoDesignGrid) return;
    
    let currentIndex = 0;
    const cards = logoDesignGrid.querySelectorAll('.logo-card');
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Auto-scroll functionality
    function scrollToCard(index) {
        if (index < 0 || index >= totalCards) return;
        
        const card = cards[index];
        const cardWidth = window.innerWidth; // Full viewport width
        const scrollPosition = index * cardWidth;
        
        logoDesignGrid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        
        currentIndex = index;
    }
    
    // Handle scroll events to update current index
    let scrollTimeout;
    logoDesignGrid.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollLeft = logoDesignGrid.scrollLeft;
            const cardWidth = window.innerWidth;
            const newIndex = Math.round(scrollLeft / cardWidth);
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalCards) {
                currentIndex = newIndex;
            }
        }, 100);
        
        // Keep scroll indicator visible at all times on mobile
    });
    
    // Do not auto-scroll; maintain initial position
})();

// Mobile banner design scroll functionality
(() => {
    const bannerDesignGrid = document.querySelector('.banner-design-grid');
    if (!bannerDesignGrid) return;
    
    let currentIndex = 0;
    const cards = bannerDesignGrid.querySelectorAll('.banner-card');
    const totalCards = cards.length;
    
    if (totalCards === 0) return;
    
    // Auto-scroll functionality
    function scrollToCard(index) {
        if (index < 0 || index >= totalCards) return;
        
        const card = cards[index];
        const cardWidth = window.innerWidth; // Full viewport width
        const scrollPosition = index * cardWidth;
        
        bannerDesignGrid.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        
        currentIndex = index;
    }
    
    // Handle scroll events to update current index
    let scrollTimeout;
    bannerDesignGrid.addEventListener('scroll', () => {
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            const scrollLeft = bannerDesignGrid.scrollLeft;
            const cardWidth = window.innerWidth;
            const newIndex = Math.round(scrollLeft / cardWidth);
            
            if (newIndex !== currentIndex && newIndex >= 0 && newIndex < totalCards) {
                currentIndex = newIndex;
            }
        }, 100);
        
        // Keep scroll indicator visible at all times on mobile
    });
    
    // Do not auto-scroll; maintain initial position
})();

// Mobile "What we do" cards click functionality
function attachCardClickHandlers() {
    const whatWeDoCards = document.querySelectorAll('.what-we-do-grid .service-card');
    
    whatWeDoCards.forEach(card => {
        // Remove any existing event listeners to avoid duplicates
        card.replaceWith(card.cloneNode(true));
    });
    
    // Re-select the cards after cloning
    const newCards = document.querySelectorAll('.what-we-do-grid .service-card');
    
    newCards.forEach(card => {
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on the work button or view work link
            if (e.target.classList.contains('work-button') || e.target.closest('.work-button') ||
                e.target.classList.contains('view-work-link') || e.target.closest('.view-work-link')) {
                // Let the work button/link handle its own navigation
                return;
            }
            
            // Check if admin mode is active - if so, don't show modal on mobile
            const ADMIN_KEY = 'gaatha_admin_2025_secret_key_xyz789';
            const isAdminMode = localStorage.getItem('admin_secret') === ADMIN_KEY;
            const isMobile = window.innerWidth <= 768;
            
            if (isAdminMode && isMobile) {
                return;
            }
            
            // Show details modal (mobile users)
            newCards.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            showCardDetails(this);
        });
    });

    // After cards are re-created, re-bind Work button navigation (desktop only)
    if (window.innerWidth > 768) {
        if (typeof window.bindWorkButtonClicks === 'function') {
            window.bindWorkButtonClicks();
        }
    }
}

// Attach handlers on page load
document.addEventListener('DOMContentLoaded', () => {
    attachCardClickHandlers();
});

// Make function globally available for Firebase data loader
window.attachCardClickHandlers = attachCardClickHandlers;

// Bind Work button navigation (safe to call multiple times)
function bindWorkButtonClicks() {
    // Desktop only per request (mobile has separate modal flow and CSS hides button)
    if (window.innerWidth <= 768) return;
    const workButtons = document.querySelectorAll('.work-button');
    workButtons.forEach(btn => {
        // Remove previous listeners by cloning
        const clone = btn.cloneNode(true);
        btn.parentNode.replaceChild(clone, btn);
        clone.addEventListener('click', function(e) {
            e.stopPropagation();
            const card = this.closest('.service-card');
            const titleEl = card ? card.querySelector('h3') : null;
            const serviceTitle = titleEl ? titleEl.textContent : '';
            let target = 'work.html';
            if (serviceTitle === 'Web & App Development' || serviceTitle === 'E‑Commerce Solutions') {
                target = 'websites.html';
            } else if (serviceTitle === 'Branding & Design') {
                target = 'logo-design.html';
            } else if (serviceTitle === 'Performance Marketing' || serviceTitle === 'SEO/AEO/GEO') {
                target = 'websites.html';
            } else if (serviceTitle === 'Influencer & UGC Marketing') {
                target = 'reels.html#influencer-ads-grid';
            } else if (serviceTitle === 'AI‑Based Ads') {
                target = 'reels.html#ai-ads-grid';
            } else if (serviceTitle === 'AI Cloning') {
                target = 'reels.html#ai-clone-grid';
            } else if (serviceTitle === 'Social Media Marketing') {
                target = 'reels.html';
            }
            window.location.href = target;
        });
    });
}
window.bindWorkButtonClicks = bindWorkButtonClicks;

// Initial bind on load for desktop
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindWorkButtonClicks);
} else {
    bindWorkButtonClicks();
}
    
    function showCardDetails(card) {
        // Check if we're on mobile (when cards become small)
        const isMobile = window.innerWidth <= 768;
        
        if (!isMobile) {
            return;
        }
        
        const title = card.querySelector('h3').textContent;
        const icon = card.querySelector('.service-icon').innerHTML;
        
        // Get the actual content from the desktop version of the card
        const allCards = document.querySelectorAll('.service-card');
        let originalCard = null;
        
        // Find the original card with the same title
        allCards.forEach(c => {
            if (c.querySelector('h3') && c.querySelector('h3').textContent === title) {
                originalCard = c;
            }
        });
        
        let description = '';
        let bulletPoints = '';
        
        // Get description and bullet points from the original card
        if (originalCard) {
            const descriptionEl = originalCard.querySelector('p');
            const bulletList = originalCard.querySelector('ul');
            
            if (descriptionEl) {
                description = descriptionEl.textContent;
            }
            
            if (bulletList) {
                const bullets = Array.from(bulletList.querySelectorAll('li')).map(li => li.textContent);
                bulletPoints = bullets.map(bullet => `<li>${bullet}</li>`).join('');
            }
        }
        
        // Fallback content for specific services if not found in original card
        if (!description) {
            if (title === 'Social Media Marketing') {
                description = '';
                bulletPoints = `
                    <li>Content Strategy & Calendar</li>
                    <li>Community Management</li>
                    <li>Platform-Specific Campaigns</li>
                `;
            } else if (title === 'Performance Marketing') {
                description = '';
                bulletPoints = `
                    <li>Meta & Google Ads</li>
                    <li>Conversion Optimization</li>
                    <li>Analytics & Reporting</li>
                `;
            } else if (title === 'Branding & Design') {
                description = '';
                bulletPoints = `
                    <li>Brand Identity & Guidelines</li>
                    <li>Visual Design Systems</li>
                    <li>Packaging & Collateral</li>
                `;
            } else if (title === 'Influencer & UGC Marketing') {
                description = '';
                bulletPoints = `
                    <li>Influencer Partnerships</li>
                    <li>UGC Campaign Management</li>
                    <li>Creator Network Access</li>
                `;
            } else if (title === 'Web & App Development') {
                description = '';
                bulletPoints = `
                    <li>Custom Web Development</li>
                    <li>Mobile App Solutions</li>
                    <li>E‑Commerce Platforms</li>
                `;
            } else if (title === 'SEO/AEO/GEO') {
                description = '';
                bulletPoints = `
                    <li>Technical SEO Optimization</li>
                    <li>AI Engine Optimization (AEO)</li>
                    <li>Generative Engine Optimization (GEO)</li>
                `;
            } else if (title === 'E‑Commerce Solutions') {
                description = '';
                bulletPoints = `
                    <li>Store Setup & Design</li>
                    <li>Product Photography & Listings</li>
                    <li>Conversion Rate Optimization</li>
                `;
            } else if (title === 'AI‑Based Ads') {
                description = '';
                bulletPoints = `
                    <li>AI‑Powered Creative Generation</li>
                    <li>Automated A/B Testing</li>
                    <li>Predictive Performance Analytics</li>
                `;
            } else if (title === 'AI Cloning') {
                description = '';
                bulletPoints = `
                    <li>Voice & Style Cloning</li>
                    <li>Automated Content Generation</li>
                    <li>Multi‑Channel Deployment</li>
                `;
            }
        }
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'mobile-card-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-icon">${icon}</div>
                    <h3>${title}</h3>
                    
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    <ul>${bulletPoints}</ul>
                    <a class="modal-view-work-link view-work-link" href="#">view work</a>
                </div>
            </div>
        `;
        
        // Add modal styles
        const modalStyles = document.createElement('style');
        modalStyles.textContent = `
            .mobile-card-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                box-sizing: border-box;
            }
            
            .modal-content {
                background: white;
                border-radius: 20px;
                max-width: 90%;
                max-height: 80%;
                overflow: hidden;
                animation: modalSlideIn 0.3s ease;
                display: flex;
                flex-direction: column;
            }
            
            .modal-header {
                padding: 15px 20px;
                border-bottom: 1px solid #eee;
                display: flex;
                align-items: center;
                gap: 12px;
                flex-shrink: 0;
            }
            
            .modal-icon {
                width: 40px;
                height: 40px;
                background: linear-gradient(135deg, #7a571e 0%, #d4af37 100%);
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                flex-shrink: 0;
            }
            
            .modal-header h3 {
                flex: 1;
                margin: 0;
                font-size: 1rem;
                line-height: 1.2;
                word-wrap: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
            }
            
            /* Text-style View more link aligned to bottom-right */
            .modal-view-work-link {
                align-self: flex-end;
                margin-top: 10px;
                margin-bottom: 4px;
                text-decoration: none;
                font-weight: 600;
                color: #6b4a2a;
                position: relative;
                padding-bottom: 2px;
            }
            .modal-view-work-link::after {
                content: '';
                position: absolute;
                left: 0; bottom: 0; height: 2px; width: 100%;
                background: linear-gradient(90deg, #8B6F47 0%, #D4AF37 100%);
                transform: scaleX(0.6);
                transform-origin: left;
                transition: transform 0.25s ease;
            }
            .modal-view-work-link:hover::after { transform: scaleX(1); }
            
            .modal-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                flex-shrink: 0;
            }
            
            .modal-body {
                padding: 15px 20px;
                flex: 1;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
            
            .modal-body p {
                margin: 0 0 12px 0;
                font-size: 0.9rem;
                line-height: 1.4;
            }
            
            .modal-body ul {
                list-style: none;
                padding: 0;
                margin: 0;
                flex: 1;
                overflow: hidden;
            }
            
            .modal-body li {
                padding: 6px 0;
                border-bottom: 1px solid #f0f0f0;
                font-size: 0.85rem;
                line-height: 1.3;
            }
            
            .modal-body li:before {
                content: '•';
                color: #8B6F47;
                margin-right: 8px;
            }
            
            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
        `;
        
        document.head.appendChild(modalStyles);
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.modal-close');
        closeBtn.addEventListener('click', () => {
            modal.remove();
            modalStyles.remove();
        });
        
        // View more link functionality
        const workLink = modal.querySelector('.modal-view-work-link');
        workLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate based on service type
            let target = 'work.html'; // Default fallback

            if (title === 'Web & App Development' || title === 'E‑Commerce Solutions') {
                target = 'websites.html';
            } else if (title === 'Branding & Design') {
                // Keep consistent with updated branding route
                target = 'branding.html';
            } else if (title === 'Performance Marketing' || title === 'SEO/AEO/GEO') {
                target = 'websites.html';
            } else if (title === 'Influencer & UGC Marketing') {
                target = 'reels.html#influencer-ads-grid';
            } else if (title === 'AI‑Based Ads') {
                target = 'reels.html#ai-ads-grid';
            } else if (title === 'AI Cloning') {
                target = 'reels.html#ai-clone-grid';
            } else if (title === 'Social Media Marketing') {
                target = 'reels.html';
            }

            window.location.href = target;
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
                modalStyles.remove();
            }
        });
    }

// Client Management Functions - Following the same pattern as "What we do" section

// Show/hide client actions based on admin authentication
function toggleClientActions() {
    const secretKey = localStorage.getItem('admin_secret');
    const expectedKey = 'gaatha_admin_2025_secret_key_xyz789';
    const isAdmin = secretKey === expectedKey;
    
    const clientItems = document.querySelectorAll('.client-item');
    const clientActions = document.querySelectorAll('.client-actions');
    const addClientBtn = document.getElementById('addClientBtn');
    
    // Add admin mode data attribute to client items
    clientItems.forEach(item => {
        item.setAttribute('data-admin-mode', isAdmin);
    });
    
    clientActions.forEach(action => {
        action.style.display = isAdmin ? 'flex' : 'none';
    });
    
    if (addClientBtn) {
        addClientBtn.style.display = isAdmin ? 'flex' : 'none';
    }
}

// Check admin authentication
function checkAdminAuth() {
    const secretKey = localStorage.getItem('admin_secret');
    const expectedKey = 'gaatha_admin_2025_secret_key_xyz789';
    return secretKey === expectedKey;
}

// Get Firebase Realtime Database instance safely
function getDatabase() {
    try {
        if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
            return firebase.database();
        }
    } catch (_) {}
    // Fallback: try to reuse global 'database' if present (defined in index.html admin block)
    try {
        if (typeof window !== 'undefined' && window.database) return window.database;
    } catch (_) {}
    return null;
}

// Client image upload helper (match websites.html behavior) — namespaced to avoid global collisions
;(function(){
    if (!window.__gaathaClientUpload__) {
        // R2 Configuration
        const R2_PRESIGN_ENDPOINT = 'https://r2-presign.moxshang.workers.dev';
        const R2_CUSTOM_DOMAIN = 'https://media.gaa-tha.com';
        
        // Upload image to R2
        async function uploadImageToR2(file, folder) {
            const timestamp = Date.now();
            const randomStr = Math.random().toString(36).substring(2, 15);
            const fileExt = file.name.split('.').pop() || 'jpg';
            const fileName = `${folder}/${timestamp}-${randomStr}.${fileExt}`;
            
            const uploadUrl = `${R2_PRESIGN_ENDPOINT}?fileName=${encodeURIComponent(fileName)}`;
            const uploadResponse = await fetch(uploadUrl, {
                method: 'POST',
                body: file,
                headers: { 'Content-Type': file.type || 'image/jpeg' }
            });
            
            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json().catch(() => ({}));
                throw new Error(errorData.error || 'Failed to upload to R2');
            }
            
            const { publicUrl } = await uploadResponse.json();
            let finalUrl = publicUrl || `${R2_CUSTOM_DOMAIN}/${fileName}`;
            if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                finalUrl = `https://${finalUrl}`;
            }
            return finalUrl;
        }
        
        window.__gaathaClientUpload__ = {
            // Cloudinary config - COMMENTED OUT: Using R2 only
            // cloudName: 'dofqquzrx',
            // unsignedPreset: 'Gaatha_Portoflio',
            async upload(file, folder = 'clients') {
                // Upload to R2 only (Cloudinary commented out)
                return await uploadImageToR2(file, folder);
                // Cloudinary fallback code - COMMENTED OUT
                // const useR2 = localStorage.getItem('USE_R2') === 'true';
                // try {
                //     if (useR2) {
                //         return await uploadImageToR2(file, folder);
                //     } else {
                //         const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
                //         const fd = new FormData();
                //         fd.append('file', file);
                //         fd.append('upload_preset', (localStorage.getItem('cloudinary_preset') || this.unsignedPreset));
                //         fd.append('folder', folder);
                //         const res = await fetch(url, { method: 'POST', body: fd });
                //         const data = await res.json().catch(()=>({}));
                //         if (!res.ok) throw new Error(data?.error?.message || 'Cloudinary upload failed');
                //         return data.secure_url;
                //     }
                // } catch (error) {
                //     if (useR2) {
                //         const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
                //         const fd = new FormData();
                //         fd.append('file', file);
                //         fd.append('upload_preset', (localStorage.getItem('cloudinary_preset') || this.unsignedPreset));
                //         fd.append('folder', folder);
                //         const res = await fetch(url, { method: 'POST', body: fd });
                //         const data = await res.json().catch(()=>({}));
                //         if (!res.ok) throw new Error(data?.error?.message || 'Cloudinary upload failed');
                //         return data.secure_url;
                //     }
                //     throw error;
                // }
            }
        };
    }
})();

// Edit client modal (prefilled like testimonials) and update + immediate refresh
function editClient(clientId) {
    if (!checkAdminAuth()) {
        showNotification('Admin access required', 'error');
        return;
    }
    const db = getDatabase();
    if (!db) { return; }
    db.ref('clients/' + clientId).once('value')
        .then(function(snapshot) {
            const client = snapshot.val();
            if (!client) return;

            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            const nameVal = client.name || '';
            const imgVal = client.imageUrl || client.image || '';
            modal.innerHTML = `
                <div class="modal-content" style="position:relative;">
                    <div class="modal-header"><h3 class="modal-title">Edit Client</h3></div>
                    <form id="editClientForm">
                        <div class="modal-form-group"><label for="editClientName">Client Name</label><input id="editClientName" value="${nameVal}" required></div>
                        <div class="modal-form-group"><label for="editClientImageFile">Upload Image</label><input type="file" id="editClientImageFile" accept="image/*"></div>
                        <div class="modal-form-group"><small>Current Image:</small><div style="margin-top:8px"><img src="${imgVal}" alt="Current" style="max-width:180px;max-height:80px;object-fit:contain;border-radius:8px"></div></div>
                        <div class="modal-form-actions"><button type="submit" id="editClientSaveBtn" class="modal-btn-save">Update</button><button type="button" class="modal-btn-cancel" onclick="closeModal()">Cancel</button></div>
                    </form>
                    <div class="modal-saving-overlay" id="editClientLoading" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.45); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); z-index:1001; align-items:center; justify-content:center;">
                        <div style="display:flex; align-items:center; gap:10px; color:#fff; font-weight:600; padding:12px 16px; border-radius:12px;">
                            <svg viewBox="0 0 50 50" width="26" height="26" style="animation:spin 1s linear infinite"><circle cx="25" cy="25" r="20" stroke="#D4AF37" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4"></circle></svg>
                            <span id="editClientProgress">Saving...</span>
                        </div>
                    </div>
                    <style>@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }</style>
                </div>`;

            document.body.appendChild(modal);

            document.getElementById('editClientForm').addEventListener('submit', async (e) => {
                e.preventDefault();
                const payload = {
                    name: document.getElementById('editClientName').value
                };
                const file = document.getElementById('editClientImageFile').files[0];
                let imageUrlToUse = imgVal;
                try {
                    const loadingEl = document.getElementById('editClientLoading');
                    const progressEl = document.getElementById('editClientProgress');
                    const saveBtn = document.getElementById('editClientSaveBtn');
                    if (file) {
                        if (loadingEl) loadingEl.style.display = 'flex';
                        if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Updating...'; }
                        // Upload to R2
                        imageUrlToUse = await window.__gaathaClientUpload__.upload(file, 'clients');
                        if (progressEl) progressEl.textContent = 'Processing...';
                    }
                } catch (uploadErr) {
                    // Error uploading client image
                } finally {
                    const loadingEl = document.getElementById('editClientLoading');
                    const saveBtn = document.getElementById('editClientSaveBtn');
                    if (loadingEl) loadingEl.style.display = 'none';
                    if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Update'; }
                }
                payload.imageUrl = imageUrlToUse;
                payload.image = imageUrlToUse;

                db.ref('clients/' + clientId).update(payload)
                    .then(() => {
                        if (window.firebaseDataLoader && window.firebaseDataLoader.loadClients) {
                            return window.firebaseDataLoader.loadClients();
                        }
                    })
                    .then(() => {
                        if (window.firebaseDataLoader && window.firebaseDataLoader.renderClientRows) {
                            window.firebaseDataLoader.renderClientRows();
                        }
                        closeModal();
                    })
                    .catch((error) => {
                        // Error updating client
                    });
        });
    })
    .catch((error) => {
        // Error loading client
    });
}


// Delete client function - following the same pattern as deleteWhatWeDo
function deleteClient(clientId) {
    if (!checkAdminAuth()) {
        showNotification('Admin access required', 'error');
        return;
    }
    // Custom confirmation modal styled like websites.html
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Delete Client</h3>
            </div>
            <div style="text-align:center; color:#2c2c2c; margin-bottom:1rem;">Are you sure you want to delete this client?</div>
            <div class="modal-form-actions">
                <button type="button" class="modal-btn-save" id="confirmDeleteClientBtn">Delete</button>
                <button type="button" class="modal-btn-cancel" id="cancelDeleteClientBtn">Cancel</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    try {
        if (window.innerWidth <= 768) {
            const navEl = document.querySelector('nav');
            if (navEl) { navEl.dataset.prevDisplay = navEl.style.display || ''; navEl.style.display = 'none'; }
            document.body.dataset.prevOverflow = document.body.style.overflow || '';
            document.body.style.overflow = 'hidden';
        }
    } catch (_) {}
    const cancelBtn = document.getElementById('cancelDeleteClientBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);
    const confirmBtn = document.getElementById('confirmDeleteClientBtn');
    if (confirmBtn) {
        confirmBtn.addEventListener('click', function(){
            const db = getDatabase();
            if (!db) { return; }
            db.ref('clients/' + clientId).remove()
                .then(() => { if (window.firebaseDataLoader && window.firebaseDataLoader.loadClients) { window.firebaseDataLoader.loadClients(); } closeModal(); })
                .catch((error) => { });
        });
    }
}

// Add new client function - following the same pattern as showAddWhatWeDoModal
function showAddClientModal() {
    if (!checkAdminAuth()) {
        showNotification('Admin access required', 'error');
        return;
    }
    
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content" style="position:relative;">
            <div class="modal-header">
                <h3 class="modal-title">Add New Client</h3>
            </div>
            <form id="addClientForm">
                <div class="modal-form-group">
                    <label for="clientName">Client Name</label>
                    <input type="text" id="clientName" placeholder="Enter client name" required>
                </div>
                
                <div class="modal-form-group">
                    <label for="clientImageFile">Upload Image</label>
                    <input type="file" id="clientImageFile" accept="image/*" required>
                </div>
                <div class="modal-form-actions">
                    <button type="submit" id="addClientSaveBtn" class="modal-btn-save">Add Client</button>
                    <button type="button" class="modal-btn-cancel" onclick="closeModal()">Cancel</button>
                </div>
            </form>
            <div class="modal-saving-overlay" id="addClientLoading" style="display:none; position:absolute; inset:0; background:rgba(0,0,0,0.45); backdrop-filter: blur(2px); -webkit-backdrop-filter: blur(2px); z-index:1001; align-items:center; justify-content:center;">
                <div style="display:flex; align-items:center; gap:10px; color:#fff; font-weight:600; padding:12px 16px; border-radius:12px;">
                    <svg viewBox="0 0 50 50" width="26" height="26" style="animation:spin 1s linear infinite"><circle cx="25" cy="25" r="20" stroke="#D4AF37" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="31.4 31.4"></circle></svg>
                    <span id="addClientProgress">Saving...</span>
                </div>
            </div>
            <style>@keyframes spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }</style>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Handle form submission
    document.getElementById('addClientForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const nameVal = document.getElementById('clientName').value;
        const file = document.getElementById('clientImageFile').files[0];
        if (!file) { return; }
        let uploadedUrl = '';
        try {
            const loadingEl = document.getElementById('addClientLoading');
            const progressEl = document.getElementById('addClientProgress');
            const saveBtn = document.getElementById('addClientSaveBtn');
            if (loadingEl) loadingEl.style.display = 'flex';
            if (saveBtn) { saveBtn.disabled = true; saveBtn.textContent = 'Adding...'; }
            // Upload to R2
            uploadedUrl = await window.__gaathaClientUpload__.upload(file, 'clients');
            if (progressEl) progressEl.textContent = 'Processing...';
        } catch (uploadErr) {
            return;
        } finally {
            const loadingEl = document.getElementById('addClientLoading');
            const saveBtn = document.getElementById('addClientSaveBtn');
            if (loadingEl) loadingEl.style.display = 'none';
            if (saveBtn) { saveBtn.disabled = false; saveBtn.textContent = 'Add Client'; }
        }
        // Build payload without empty optional fields
        const newClient = {
            name: nameVal,
            imageUrl: uploadedUrl,
            image: uploadedUrl,
            order: Date.now(),
            createdAt: new Date().toISOString()
        };
        
        const db = getDatabase();
        if (!db) { return; }
        // Compute next order sequentially (max(order)+1) to keep row layout stable
        db.ref('clients').once('value').then((snap) => {
            const data = snap.val() || {};
            const orders = Object.keys(data).map(k => Number(data[k]?.order || 0)).filter(n => isFinite(n) && n > 0 && n < 100000);
            const nextOrder = (orders.length ? Math.max.apply(null, orders) : 0) + 1;
            newClient.order = nextOrder;
            return db.ref('clients').push(newClient);
        }).then(() => {
            if (window.firebaseDataLoader && window.firebaseDataLoader.loadClients) {
                window.firebaseDataLoader.loadClients();
            }
            closeModal();
        }).catch((error) => {
            // Error adding client
        });
    });
}


// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Add notification styles
    const notificationStyles = document.createElement('style');
    notificationStyles.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            animation: slideInRight 0.3s ease;
        }
        
        .notification-success {
            background: #4CAF50;
        }
        
        .notification-error {
            background: #f44336;
        }
        
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    
    document.head.appendChild(notificationStyles);
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.remove();
        notificationStyles.remove();
    }, 3000);
}

// Initialize client management
document.addEventListener('DOMContentLoaded', function() {
    // Toggle client actions
    toggleClientActions();
    
    // Check for admin authentication changes
    window.addEventListener('storage', function(e) {
        if (e.key === 'admin_secret') {
            toggleClientActions();
        }
    });
    
    // Also check for admin mode changes on focus (when returning from admin page)
    window.addEventListener('focus', function() {
        toggleClientActions();
    });
});

// To test admin functionality:
// 1. Go to admin/index.html and login with passcode: 123456
// 2. Or manually set: localStorage.setItem('admin_secret', 'gaatha_admin_2025_secret_key_xyz789')
// 3. Refresh the page to see edit/delete buttons and "Add Client" button

// Cursor Sprinkler Effect - COMMENTED OUT
/*
let sprinkleTimeout;
let isMouseMoving = false;

function createSprinkle(x, y) {
    const sprinkle = document.createElement('div');
    sprinkle.className = 'sprinkle';
    
    // Add more spread for multiple sprinkles
    const randomOffsetX = (Math.random() - 0.5) * 25;
    const randomOffsetY = (Math.random() - 0.5) * 10;
    sprinkle.style.left = (x + randomOffsetX) + 'px';
    sprinkle.style.top = (y + randomOffsetY) + 'px';
    
    // Add random size variation
    const size = 2 + Math.random() * 5; // Random size between 2px and 7px
    sprinkle.style.width = size + 'px';
    sprinkle.style.height = size + 'px';
    
    // Add slight random delay for staggered effect
    const delay = Math.random() * 0.3;
    sprinkle.style.animationDelay = delay + 's';
    
    // Add slight random rotation for more dynamic effect
    const rotation = Math.random() * 360;
    sprinkle.style.transform = `rotate(${rotation}deg)`;
    
    document.body.appendChild(sprinkle);
    
    // Remove sprinkle after animation completes
    setTimeout(() => {
        if (sprinkle.parentNode) {
            sprinkle.parentNode.removeChild(sprinkle);
        }
    }, 2000);
}

function handleMouseMove(e) {
    if (!isMouseMoving) {
        isMouseMoving = true;
        sprinkleTimeout = setTimeout(() => {
            isMouseMoving = false;
        }, 100); // Increased throttling for lower intensity
    }
    
    // Create sprinkles with lower intensity
    if (Math.random() < 0.4) { // 40% chance to create sprinkles (reduced from 90%)
        // Create 1-2 sprinkles per mouse movement (reduced from 2-4)
        const sprinkleCount = 1 + Math.floor(Math.random() * 2);
        for (let i = 0; i < sprinkleCount; i++) {
            createSprinkle(e.clientX, e.clientY);
        }
    }
}

// Add mouse move listener for cursor sprinkler effect
document.addEventListener('mousemove', handleMouseMove);
*/

// Click Burst Effect - COMMENTED OUT
/*
function createClickBurst(x, y) {
    const particleCount = 12; // Number of circular particles
    const shardCount = 8; // Number of geometric shards
    
    // Create circular particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'click-burst-particle';
        
        // Random size between 4px and 8px
        const size = 4 + Math.random() * 4;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // Random direction and distance
        const angle = (i / particleCount) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 60 + Math.random() * 40; // 60-100px distance
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        // Position at click point
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        
        // Add movement animation
        particle.style.setProperty('--start-x', x + 'px');
        particle.style.setProperty('--start-y', y + 'px');
        particle.style.setProperty('--end-x', endX + 'px');
        particle.style.setProperty('--end-y', endY + 'px');
        
        document.body.appendChild(particle);
        
        // Remove after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 1200);
    }
    
    // Create geometric shards
    for (let i = 0; i < shardCount; i++) {
        const shard = document.createElement('div');
        shard.className = 'click-burst-shard';
        
        // Random size and shape
        const width = 3 + Math.random() * 4; // 3-7px width
        const height = 8 + Math.random() * 6; // 8-14px height
        shard.style.width = width + 'px';
        shard.style.height = height + 'px';
        shard.style.borderRadius = Math.random() > 0.5 ? '2px' : '0px'; // Some rounded, some sharp
        
        // Random direction and distance
        const angle = (i / shardCount) * Math.PI * 2 + Math.random() * 0.8;
        const distance = 80 + Math.random() * 60; // 80-140px distance
        const endX = x + Math.cos(angle) * distance;
        const endY = y + Math.sin(angle) * distance;
        
        // Position at click point
        shard.style.left = x + 'px';
        shard.style.top = y + 'px';
        
        // Add movement animation
        shard.style.setProperty('--start-x', x + 'px');
        shard.style.setProperty('--start-y', y + 'px');
        shard.style.setProperty('--end-x', endX + 'px');
        shard.style.setProperty('--end-y', endY + 'px');
        
        document.body.appendChild(shard);
        
        // Remove after animation
        setTimeout(() => {
            if (shard.parentNode) {
                shard.parentNode.removeChild(shard);
            }
        }, 1200);
    }
}

// Add click listener for burst effect
document.addEventListener('click', function(e) {
    createClickBurst(e.clientX, e.clientY);
});
*/