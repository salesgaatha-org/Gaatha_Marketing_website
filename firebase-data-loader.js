// Firebase Data Loader for Client Implementation
// This file handles loading client data from Firebase and creating animated rows

class FirebaseDataLoader {
    constructor() {
        this.database = null;
        this.clients = [];
        this.services = [];
        this.whatwedo = [];
        this.testimonials = [];
        this.websites = [];
        this.reels = [];
        this.posts = [];
        this.logos = [];
        this.banners = [];
        this.app = null;
        this.init();
    }

    async init() {
        // Wait for Firebase to be available
        if (typeof firebase !== 'undefined') {
            try {
                // Initialize Firebase with your config
                this.app = firebase.initializeApp({
                    apiKey: "AIzaSyBQlBj179byUqKjjXGH1TmpqT36nlDhwaY",
                    authDomain: "gaatha-b9ee5.firebaseapp.com",
                    databaseURL: "https://gaatha-b9ee5-default-rtdb.asia-southeast1.firebasedatabase.app",
                    projectId: "gaatha-b9ee5",
                    storageBucket: "gaatha-b9ee5.firebasestorage.app",
                    messagingSenderId: "661713784587",
                    appId: "1:661713784587:web:2b7bbcb40b18e53c361c0e",
                    measurementId: "G-75RTC8CXEE"
                });
                
                this.database = firebase.database();
                window.database = this.database; // Make database globally available for contact form
                this.loadAllData();
            } catch (error) {
                this.renderFallbackClients();
            }
        } else {
            // Retry after a short delay
            setTimeout(() => this.init(), 100);
        }
    }

    async loadAllData() {
        // Only load clients for now to avoid overriding static content
        await this.loadClients();
        
        // Load other data but don't render if empty
        await Promise.all([
            this.loadServices(),
            this.loadWhatWeDo(),
            this.loadTestimonials(),
            this.loadWebsites(),
            this.loadReels(),
            this.loadPosts(),
            this.loadLogos(),
            this.loadBanners()
        ]);
        
        this.logDataSummary();
    }

    async loadClients() {
        if (!this.database) {
            setTimeout(() => this.loadClients(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('clients').once('value');
            const clientsData = snapshot.val();
            
            if (clientsData) {
                this.clients = Object.keys(clientsData).map(key => ({
                    id: key,
                    ...clientsData[key]
                })).sort((a, b) => (a.order || 0) - (b.order || 0));
                
                this.renderClientRows();
            } else {
                await this.createSampleClients();
                // Try loading again after creating sample data
                setTimeout(() => this.loadClients(), 1000);
            }
        } catch (error) {
            this.renderFallbackClients();
        }
    }

    async loadServices() {
        if (!this.database) {
            setTimeout(() => this.loadServices(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('services').once('value');
            const servicesData = snapshot.val();
            
            if (servicesData) {
                this.services = Object.keys(servicesData).map(key => ({
                    id: key,
                    ...servicesData[key]
                })).sort((a, b) => (a.order || 0) - (b.order || 0));
                
                this.renderServices();
            }
        } catch (error) {
            // Error loading services
        }
    }

    async loadWhatWeDo() {
        if (!this.database) {
            setTimeout(() => this.loadWhatWeDo(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('whatwedo').once('value');
            const whatwedoData = snapshot.val();
            
            if (whatwedoData) {
                this.whatwedo = Object.keys(whatwedoData).map(key => ({
                    id: key,
                    ...whatwedoData[key]
                })).sort((a, b) => (a.order || 0) - (b.order || 0));
                
                this.renderWhatWeDo();
            }
        } catch (error) {
            // Error loading what we do
        }
    }

    async loadTestimonials() {
        if (!this.database) {
            setTimeout(() => this.loadTestimonials(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('testimonials').once('value');
            const testimonialsData = snapshot.val();
            
            if (testimonialsData) {
                // Normalize to unified DB model: clientName, designation, description, rating, order
                this.testimonials = Object.keys(testimonialsData).map(key => {
                    const raw = testimonialsData[key] || {};
                    return {
                        id: key,
                        clientName: raw.clientName || raw.name || '',
                        designation: raw.designation || raw.role || '',
                        description: raw.description || raw.quote || raw.text || '',
                        rating: raw.rating || 5,
                        order: raw.order || 0,
                        createdAt: raw.createdAt || null
                    };
                }).sort((a, b) => (a.order || 0) - (b.order || 0));
                
                this.renderTestimonials();
                // Push full list into the carousel structure (no static fallback)
                try {
                    const mapped = this.testimonials.map(t => ({
                        stars: '⭐'.repeat(t.rating || 5),
                        quote: t.description || '',
                        name: t.clientName || '',
                        role: t.designation || ''
                    }));
                    if (typeof window.setTestimonialsData === 'function') {
                        window.setTestimonialsData(mapped);
                    }
                } catch (e) { }
            } else {
                if (typeof window.setTestimonialsData === 'function') {
                    window.setTestimonialsData([]);
                }
            }
        } catch (error) {
            // Error loading testimonials
        }
    }

    async loadWebsites() {
        if (!this.database) {
            setTimeout(() => this.loadWebsites(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('websites').once('value');
            const websitesData = snapshot.val();
            
            if (websitesData) {
                this.websites = Object.keys(websitesData).map(key => ({
                    id: key,
                    ...websitesData[key]
                })).sort((a, b) => (a.order || 0) - (b.order || 0));
            }
        } catch (error) {
            // Error loading websites
        }
    }

    async loadReels() {
        if (!this.database) {
            setTimeout(() => this.loadReels(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('reels').once('value');
            const reelsData = snapshot.val();
            
            if (reelsData) {
                this.reels = Object.keys(reelsData).map(key => ({
                    id: key,
                    ...reelsData[key]
                })).sort((a, b) => (a.order || 0) - (b.order || 0));
            }
        } catch (error) {
            // Error loading reels
        }
    }

    async loadPosts() {
        if (!this.database) {
            setTimeout(() => this.loadPosts(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('posts').once('value');
            const postsData = snapshot.val();
            
            if (postsData) {
                this.posts = Object.keys(postsData).map(key => ({
                    id: key,
                    ...postsData[key]
                })).sort((a, b) => (a.order || 0) - (b.order || 0));
            }
        } catch (error) {
            // Error loading posts
        }
    }

    async loadLogos() {
        if (!this.database) {
            setTimeout(() => this.loadLogos(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('logos').once('value');
            const logosData = snapshot.val();
            
            if (logosData) {
                this.logos = Object.keys(logosData).map(key => ({
                    id: key,
                    ...logosData[key]
                })).sort((a, b) => (a.order || 0) - (b.order || 0));
            }
        } catch (error) {
            // Error loading logos
        }
    }

    async loadBanners() {
        if (!this.database) {
            setTimeout(() => this.loadBanners(), 500);
            return;
        }

        try {
            const snapshot = await this.database.ref('banners').once('value');
            const bannersData = snapshot.val();
            
            if (bannersData) {
                this.banners = Object.keys(bannersData).map(key => ({
                    id: key,
                    ...bannersData[key]
                })).sort((a, b) => (a.order || 0) - (b.order || 0));
            }
        } catch (error) {
            // Error loading banners
        }
    }

    logDataSummary() {
        // Data summary logging disabled
    }

    renderClientRows() {
        const clientsSection = document.querySelector('.clients');
        if (!clientsSection) return;

        // Reuse existing rows container if present; remove any duplicates
        const existingContainers = clientsSection.querySelectorAll('.client-rows-container');
        let rowsContainer = existingContainers[0];
        if (!rowsContainer) {
            rowsContainer = document.createElement('div');
            rowsContainer.className = 'client-rows-container';
            const sectionHeader = clientsSection.querySelector('.section-header');
            if (sectionHeader) {
                sectionHeader.insertAdjacentElement('afterend', rowsContainer);
            } else {
                clientsSection.appendChild(rowsContainer);
            }
        }
        // Remove extra containers beyond the first (cleanup if any)
        if (existingContainers.length > 1) {
            Array.from(existingContainers).slice(1).forEach(el => el.remove());
        }
        // Clear rows before re-render
        rowsContainer.innerHTML = '';

        // Group clients into rows of max 5; alternate row direction classes
        const MAX_PER_ROW = 5;
        for (let i = 0; i < this.clients.length; i += MAX_PER_ROW) {
            const chunk = this.clients.slice(i, i + MAX_PER_ROW);
            const directionClass = (Math.floor(i / MAX_PER_ROW) % 2 === 0) ? 'client-row-left' : 'client-row-right';
            const rowEl = this.createClientRow(chunk, directionClass);
            rowsContainer.appendChild(rowEl);
        }

        // Immediately show rows in centered (paused) state, no entrance animation
        const builtRows = rowsContainer.querySelectorAll('.client-row');
        builtRows.forEach(row => {
            row.classList.remove('animate-in', 'animate-to-center');
            row.classList.add('paused-at-center');
        });
        
        // Reinitialize videos after content changes
        if (window.initializeVideos) {
            window.initializeVideos();
        }

        // Ensure admin action icons are visible immediately after render
        try {
            if (typeof window.toggleClientActions === 'function') {
                window.toggleClientActions();
            } else {
                // Fallback: directly set data-admin-mode on items if admin
                const isAdmin = (localStorage.getItem('admin_secret') === 'gaatha_admin_2025_secret_key_xyz789');
                if (isAdmin) {
                    rowsContainer.querySelectorAll('.client-item').forEach(el => el.setAttribute('data-admin-mode', 'true'));
                }
            }
        } catch (_) {}
    }

    renderServices() {
        const servicesSection = document.querySelector('.services');
        if (!servicesSection || this.services.length === 0) return;

        // Find the services glance grid
        const servicesGlanceGrid = servicesSection.querySelector('.services-glance-grid');
        if (servicesGlanceGrid && this.services.length > 0) {
            // Replace static cards with Firebase data to ensure dynamic-only content
            servicesGlanceGrid.innerHTML = '';
            this.services.forEach((svc, index) => {
                const card = document.createElement('div');
                card.className = 'service-card glass fade-in';
                card.style.animationDelay = (index * 0.06) + 's';

                const iconDiv = document.createElement('div');
                iconDiv.className = 'service-icon';
                // simple generic icon; could be extended by type
                iconDiv.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="7" width="18" height="10" rx="2"></rect><circle cx="8.5" cy="12" r="1.5"></circle><circle cx="15.5" cy="12" r="1.5"></circle><path d="M12 7V4"></path></svg>';

                const title = document.createElement('h3');
                title.textContent = svc.title || svc.name || 'Service';

                const desc = document.createElement('p');
                desc.textContent = svc.description || svc.text || '';

                card.appendChild(iconDiv);
                card.appendChild(title);
                card.appendChild(desc);

                // Optional media if provided
                const mediaSrc = svc.videoUrl || svc.video;
                if (mediaSrc) {
                    const mediaWrap = document.createElement('div');
                    mediaWrap.className = 'service-card-media';
                    mediaWrap.innerHTML = `<video class="service-video" src="${mediaSrc}" autoplay muted loop playsinline></video>`;
                    card.appendChild(mediaWrap);
                }

                // Make card clickable to navigate based on title
                card.style.cursor = 'pointer';
                card.addEventListener('click', () => {
                    const t = (svc.title || svc.name || '').trim();
                    if (typeof window.navigateToWorkFromCard === 'function') {
                        window.navigateToWorkFromCard(t);
                    } else {
                        // Fallback direct routing for key services
                        const lower = t.toLowerCase();
                        if (lower.includes('ai cloning')) {
                            window.location.href = 'reels.html#ai-clone-grid';
                        } else if (lower.includes('ai') && lower.includes('ads')) {
                            window.location.href = 'reels.html#ai-ads-grid';
                        } else if (lower.includes('branding')) {
                            window.location.href = 'branding.html';
                        }
                    }
                });

                servicesGlanceGrid.appendChild(card);
            });
        }
    }

    renderWhatWeDo() {
        const servicesSection = document.querySelector('.services');
        if (!servicesSection || this.whatwedo.length === 0) return;

        // Find the what we do grid
        const whatwedoGrid = servicesSection.querySelector('.what-we-do-grid');
        if (whatwedoGrid && this.whatwedo.length > 0) {
            // Replace static content with Firebase data
            whatwedoGrid.innerHTML = '';
            this.whatwedo.forEach((item, index) => {
                const card = document.createElement('div');
                card.className = 'service-card glass fade-in';
                card.style.animationDelay = (index * 0.1) + 's';
                const bullets = Array.isArray(item.bulletPoints) ? item.bulletPoints
                               : Array.isArray(item.features) ? item.features : [];
                const bulletHTML = bullets.map(b => `<li>${b}</li>`).join('');
                card.innerHTML = `
                    <div class="service-icon-container">
                        <div class="service-icon">${this.getWhatWeDoIcon(item.title || item.name)}</div>
                        <h3>${item.title || item.name || 'Service'}</h3>
                        <button class="work-button">Work</button>
                    </div>
                    <p>${item.description || item.text || ''}</p>
                    ${bulletHTML ? `<ul>${bulletHTML}</ul>` : ''}
                `;
                whatwedoGrid.appendChild(card);
            });
        }
    }

    // Return consistent SVG icons for What We Do titles
    getWhatWeDoIcon(title = '') {
        const t = String(title).toLowerCase();
        const icons = {
            'social media marketing': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3 1.5-4A4 4 0 0 1 1 14V7a4 4 0 0 1 4-4h12a4 4 0 0 1 4 4z"/></svg>',
            'performance marketing': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><path d="M22 2l-6 6"/><path d="M15 3h6v6"/></svg>',
            'branding & design': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22l4-10 4-4-4-4-4 4-10 4 10 10z"/><circle cx="12" cy="12" r="1"/></svg>',
            'influencer & ugc marketing': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11v2a4 4 0 0 0 4 4h1l3 3v-7l7-4V6l-7-4H9a4 4 0 0 0-4 4v1"/></svg>',
            'web & app development': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 8l-4 4 4 4"/><path d="M16 8l4 4-4 4"/></svg>',
            'seo/aeo/geo': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/><path d="M8 11h6"/><path d="M11 8v6"/></svg>',
            'e‑commerce solutions': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2l1 4h10l1-4"/><path d="M3 6h18l-1 14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2L3 6z"/><path d="M9 10a3 3 0 0 0 6 0"/></svg>',
            'ai-based ads': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="8" width="16" height="8" rx="3"/><rect x="11" y="6" width="2" height="3" rx="1"/><circle cx="8" cy="12" r="1.5"/><circle cx="16" cy="12" r="1.5"/></svg>',
            'ai cloning': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="7" width="10" height="10" rx="2"/><rect x="3" y="3" width="10" height="10" rx="2"/></svg>'
        };
        // Fallback generic icon
        const generic = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/></svg>';
        // Try exact match, else find by partial include
        const key = Object.keys(icons).find(k => t === k || t.includes(k));
        return icons[key] || generic;
    }

    renderTestimonials() {
        const testimonialsSection = document.querySelector('.testimonials');
        if (!testimonialsSection || this.testimonials.length === 0) return;

        // Update testimonial content
        const testimonialCard = testimonialsSection.querySelector('#testimonialCard');
        if (testimonialCard && this.testimonials.length > 0) {
            // If carousel exists, let it handle rendering via setTestimonialsData
            // Otherwise, populate the static card with the first item for backwards compatibility
            const first = this.testimonials[0];
            const stars = testimonialCard.querySelector('#testimonialStars');
            const quote = testimonialCard.querySelector('#testimonialQuote');
            const name = testimonialCard.querySelector('#testimonialName');
            const role = testimonialCard.querySelector('#testimonialRole');
            if (stars) stars.textContent = '⭐'.repeat(first?.rating || 5);
            if (quote) quote.textContent = first?.description || '';
            if (name) name.textContent = first?.clientName || '';
            if (role) role.textContent = first?.designation || '';
        }
    }

    createServiceCard(service) {
        const card = document.createElement('div');
        card.className = 'service-card glass fade-in';
        
        // Create service icon (you can customize this based on your data structure)
        const iconDiv = document.createElement('div');
        iconDiv.className = 'service-icon';
        iconDiv.innerHTML = service.icon || '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle></svg>';
        
        // Create service title
        const title = document.createElement('h3');
        title.textContent = service.title || service.name;
        
        // Create service description
        const description = document.createElement('p');
        description.textContent = service.description || service.text;
        
        // Create service list if available (handle both features and bulletPoints)
        const listItems = service.features || service.bulletPoints || [];
        if (listItems && Array.isArray(listItems) && listItems.length > 0) {
            const list = document.createElement('ul');
            listItems.forEach(item => {
                const listItem = document.createElement('li');
                listItem.textContent = item;
                list.appendChild(listItem);
            });
            card.appendChild(list);
        }
        
        card.appendChild(iconDiv);
        card.appendChild(title);
        card.appendChild(description);
        
        return card;
    }

    createClientRow(clients, rowClass) {
        const row = document.createElement('div');
        row.className = `client-row ${rowClass}`;
        
        clients.forEach(client => {
            const clientItem = this.createClientItem(client);
            row.appendChild(clientItem);
        });

        return row;
    }

    createClientItem(client) {
        const item = document.createElement('div');
        item.className = 'client-item';
        item.setAttribute('data-client-id', client.id);
        // Set admin-mode attribute early so icons show on first paint
        try {
            const isAdmin = (localStorage.getItem('admin_secret') === 'gaatha_admin_2025_secret_key_xyz789');
            item.setAttribute('data-admin-mode', isAdmin);
        } catch (_) {}
        
        // Create client logo - prioritize imageUrl, then image, then fallback
        const logo = document.createElement('img');
        logo.className = 'client-logo-img';
        
        // Use the correct image field based on your Firebase structure
        const imageSrc = client.imageUrl || client.image || '';
        logo.src = imageSrc;
        logo.alt = client.name || 'Client Logo';
        
        logo.onerror = () => {
            // Fallback to text if image fails to load
            logo.style.display = 'none';
            const textFallback = document.createElement('div');
            textFallback.className = 'client-text-fallback';
            textFallback.textContent = client.name || 'Client';
            item.appendChild(textFallback);
        };
        
        item.appendChild(logo);

        // Create social overlay (always show 4 icons; disable missing links)
        const socialOverlay = document.createElement('div');
        socialOverlay.className = 'social-overlay';
        
        // Use the correct field names from your Firebase data structure
        const instagramUrl = client.instagramUrl || client.instagram;
        const linkedinUrl = client.linkedinUrl || client.linkedin;
        const facebookUrl = client.facebookUrl || client.facebook;
        const websiteUrl = client.websiteUrl || client.website;

        // Instagram (visible even if missing, disabled style)
        {
            const instagramLink = document.createElement('a');
            instagramLink.className = 'social-icon' + (instagramUrl ? '' : ' disabled');
            if (instagramUrl) { instagramLink.href = instagramUrl; instagramLink.target = '_blank'; instagramLink.rel = 'noopener'; }
            instagramLink.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <circle cx="17.5" cy="6.5" r="1.5"></circle>
                </svg>
            `;
            socialOverlay.appendChild(instagramLink);
        }

        // LinkedIn
        {
            const linkedinLink = document.createElement('a');
            linkedinLink.className = 'social-icon' + (linkedinUrl ? '' : ' disabled');
            if (linkedinUrl) { linkedinLink.href = linkedinUrl; linkedinLink.target = '_blank'; linkedinLink.rel = 'noopener'; }
            linkedinLink.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="9" width="4" height="12"></rect>
                    <circle cx="4" cy="4" r="2"></circle>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-14h4v2"></path>
                </svg>
            `;
            socialOverlay.appendChild(linkedinLink);
        }

        // Facebook
        {
            const facebookLink = document.createElement('a');
            facebookLink.className = 'social-icon' + (facebookUrl ? '' : ' disabled');
            if (facebookUrl) { facebookLink.href = facebookUrl; facebookLink.target = '_blank'; facebookLink.rel = 'noopener'; }
            facebookLink.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
            `;
            socialOverlay.appendChild(facebookLink);
        }

        // Website
        {
            const websiteLink = document.createElement('a');
            websiteLink.className = 'social-icon' + (websiteUrl ? '' : ' disabled');
            if (websiteUrl) { websiteLink.href = websiteUrl; websiteLink.target = '_blank'; websiteLink.rel = 'noopener'; }
            websiteLink.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M2 12h20"></path>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                </svg>
            `;
            socialOverlay.appendChild(websiteLink);
        }

        item.appendChild(socialOverlay);

        // Add admin actions if in admin mode
        this.addAdminActions(item, client);

        return item;
    }

    addAdminActions(item, client) {
        const actions = document.createElement('div');
        actions.className = 'client-actions';
        
        const editBtn = document.createElement('button');
        editBtn.className = 'client-edit-btn';
        editBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        `;
        editBtn.title = 'Edit Client';
        editBtn.onclick = () => editClient(client.id);
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'client-delete-btn';
        deleteBtn.innerHTML = `
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3,6 5,6 21,6"></polyline>
                <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
        `;
        deleteBtn.title = 'Delete Client';
        deleteBtn.onclick = () => deleteClient(client.id);
        
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);
        item.appendChild(actions);
    }

    async createSampleClients() {
        try {
            const sampleClients = {
                'client1': {
                    name: 'Amazon',
                    imageUrl: 'https://via.placeholder.com/200x80/FF9900/FFFFFF?text=Amazon',
                    websiteUrl: 'https://www.amazon.com',
                    instagramUrl: 'https://instagram.com/amazon',
                    linkedinUrl: 'https://www.linkedin.com/company/amazon',
                    order: 1,
                    createdAt: new Date().toISOString()
                },
                'client2': {
                    name: 'Uber',
                    imageUrl: 'https://via.placeholder.com/200x80/000000/FFFFFF?text=Uber',
                    websiteUrl: 'https://www.uber.com',
                    instagramUrl: 'https://instagram.com/uber',
                    linkedinUrl: 'https://www.linkedin.com/company/uber-com',
                    order: 2,
                    createdAt: new Date().toISOString()
                },
                'client3': {
                    name: 'Spotify',
                    imageUrl: 'https://via.placeholder.com/200x80/1DB954/FFFFFF?text=Spotify',
                    websiteUrl: 'https://www.spotify.com',
                    instagramUrl: 'https://instagram.com/spotify',
                    linkedinUrl: 'https://www.linkedin.com/company/spotify',
                    order: 3,
                    createdAt: new Date().toISOString()
                },
                'client4': {
                    name: 'Netflix',
                    imageUrl: 'https://via.placeholder.com/200x80/E50914/FFFFFF?text=Netflix',
                    websiteUrl: 'https://www.netflix.com',
                    instagramUrl: 'https://instagram.com/netflix',
                    linkedinUrl: 'https://www.linkedin.com/company/netflix',
                    order: 4,
                    createdAt: new Date().toISOString()
                },
                'client5': {
                    name: 'Airbnb',
                    imageUrl: 'https://via.placeholder.com/200x80/FF5A5F/FFFFFF?text=Airbnb',
                    websiteUrl: 'https://www.airbnb.com',
                    instagramUrl: 'https://instagram.com/airbnb',
                    linkedinUrl: 'https://www.linkedin.com/company/airbnb',
                    order: 5,
                    createdAt: new Date().toISOString()
                },
                'client6': {
                    name: 'Tesla',
                    imageUrl: 'https://via.placeholder.com/200x80/CC0000/FFFFFF?text=Tesla',
                    websiteUrl: 'https://www.tesla.com',
                    instagramUrl: 'https://instagram.com/tesla',
                    linkedinUrl: 'https://www.linkedin.com/company/tesla-motors',
                    order: 6,
                    createdAt: new Date().toISOString()
                }
            };

            await this.database.ref('clients').set(sampleClients);
        } catch (error) {
            // Error creating sample clients
        }
    }

    renderFallbackClients() {
        // Fallback clients for when Firebase is not available
        const fallbackClients = [
            { name: 'Amazon', imageUrl: 'https://via.placeholder.com/200x80/FF9900/FFFFFF?text=Amazon' },
            { name: 'Uber', imageUrl: 'https://via.placeholder.com/200x80/000000/FFFFFF?text=Uber' },
            { name: 'Spotify', imageUrl: 'https://via.placeholder.com/200x80/1DB954/FFFFFF?text=Spotify' },
            { name: 'Netflix', imageUrl: 'https://via.placeholder.com/200x80/E50914/FFFFFF?text=Netflix' },
            { name: 'Airbnb', imageUrl: 'https://via.placeholder.com/200x80/FF5A5F/FFFFFF?text=Airbnb' },
            { name: 'Tesla', imageUrl: 'https://via.placeholder.com/200x80/CC0000/FFFFFF?text=Tesla' }
        ];

        this.clients = fallbackClients;
        this.renderClientRows();
    }

    initializeAnimations() {
        // Use the existing animation trigger from script.js
        const clientsSection = document.querySelector('.clients');
        if (clientsSection && 'IntersectionObserver' in window) {
            const clientsObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setTimeout(() => {
                            const clientRows = entry.target.querySelectorAll('.client-row');
                            const clientItems = entry.target.querySelectorAll('.client-item');
                            
                            clientRows.forEach(row => {
                                // Remove any existing animation classes
                                row.classList.remove('animate-in', 'paused-at-center');
                                // Add the new animation class that moves to center
                                row.classList.add('animate-to-center');
                            });
                            
                            clientItems.forEach(item => {
                                item.classList.add('animate-in');
                            });
                            
                            // Set up animation end listeners to pause at center
                            clientRows.forEach(row => {
                                const handleAnimationEnd = () => {
                                    row.classList.remove('animate-to-center');
                                    row.classList.add('paused-at-center');
                                    // Remove the event listener after use
                                    row.removeEventListener('animationend', handleAnimationEnd);
                                };
                                row.addEventListener('animationend', handleAnimationEnd);
                            });
                        }, 200);
                        
                        clientsObserver.unobserve(entry.target);
                    }
                });
            }, { 
                threshold: 0.3,
                rootMargin: '0px 0px -100px 0px'
            });
            
            clientsObserver.observe(clientsSection);
        }
    }
}

// Initialize the data loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.firebaseDataLoader = new FirebaseDataLoader();
});

// Make functions globally available
window.loadClients = () => {
    if (window.firebaseDataLoader) {
        window.firebaseDataLoader.loadClients();
    }
};

