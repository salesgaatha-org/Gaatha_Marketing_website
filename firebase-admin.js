// Firebase Admin Functions for Portfolio Management

class FirebaseAdmin {
    constructor() {
        // Wait for Firebase to be available
        this.database = null;
        this.auth = null;
        this.initializeFirebase();
    }
    
    initializeFirebase() {
        // Check if Firebase is available
        if (window.database && window.auth) {
            this.database = window.database;
            this.auth = window.auth;
        } else {
            // Wait a bit and try again
            setTimeout(() => {
                this.initializeFirebase();
            }, 200);
        }
    }

    // Initialize default data structure
    async initializeDatabase() {
        try {
            if (!this.database) {
                return;
            }
            
            const defaultData = {
                websites: [
                    {
                        id: 1,
                        title: "E-commerce Platform",
                        company: "TechCorp",
                        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
                        link: "https://example.com",
                        views: "10,000+ views",
                        category: "websites"
                    },
                    {
                        id: 2,
                        title: "Corporate Website",
                        company: "Business Inc",
                        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop",
                        link: "https://example.com",
                        views: "5,000+ views",
                        category: "websites"
                    }
                ],
                reels: [
                    {
                        id: 1,
                        title: "Product Showcase",
                        company: "Brand Co",
                        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1200&auto=format&fit=crop",
                        link: "https://example.com",
                        views: "50,000+ views",
                        category: "reels"
                    }
                ],
                posts: [
                    {
                        id: 1,
                        title: "Social Media Post",
                        company: "Social Brand",
                        image: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop",
                        link: "https://example.com",
                        views: "2,000+ views",
                        category: "posts"
                    }
                ],
                logos: [
                    {
                        id: 1,
                        title: "Brand Logo",
                        company: "Logo Co",
                        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1200&auto=format&fit=crop",
                        link: "https://example.com",
                        views: "1,000+ views",
                        category: "logos"
                    }
                ],
                banners: [
                    {
                        id: 1,
                        title: "Promotional Banner",
                        company: "Banner Co",
                        image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1200&auto=format&fit=crop",
                        link: "https://example.com",
                        views: "3,000+ views",
                        category: "banners"
                    }
                ],
                clients: [
                    {
                        id: 1,
                        name: "Client 1",
                        logo: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1200&auto=format&fit=crop",
                        website: "https://example.com"
                    }
                ],
                testimonials: [
                    {
                        id: 1,
                        name: "John Doe",
                        company: "Tech Corp",
                        text: "Amazing work! Highly recommended.",
                        rating: 5,
                        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=1200&auto=format&fit=crop"
                    }
                ],
                services: [
                    {
                        id: 1,
                        title: "Web Development",
                        description: "Custom websites and web applications",
                        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
                        link: "#",
                        company: "Gaa-tha",
                        views: "Full-stack development, Responsive design, SEO optimization",
                        category: "services"
                    }
                ],
                whatwedo: [
                    {
                        id: 1,
                        title: "Digital Marketing",
                        description: "Complete digital marketing solutions",
                        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop",
                        link: "#",
                        company: "Gaa-tha",
                        views: "Social Media, SEO, Content Marketing",
                        category: "whatwedo"
                    }
                ]
            };

            // Set default data if database is empty
            const snapshot = await this.database.ref('portfolio').once('value');
            if (!snapshot.exists()) {
                await this.database.ref('portfolio').set(defaultData);
            }
        } catch (error) {
            // Error initializing database
        }
    }

    // Get all data for a specific type
    async getData(type) {
        try {
            if (!this.database) {
                return [];
            }
            const snapshot = await this.database.ref(`portfolio/${type}`).once('value');
            return snapshot.val() || [];
        } catch (error) {
            return [];
        }
    }

    // Add new item
    async addItem(type, item) {
        try {
            if (!this.database) {
                return false;
            }
            const newItem = {
                ...item,
                id: Date.now(), // Simple ID generation
                category: type
            };
            
            await this.database.ref(`portfolio/${type}`).push(newItem);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Update existing item
    async updateItem(type, itemId, updates) {
        try {
            if (!this.database) {
                return false;
            }
            await this.database.ref(`portfolio/${type}/${itemId}`).update(updates);
            return true;
        } catch (error) {
            return false;
        }
    }

    // Delete item
    async deleteItem(type, itemId) {
        try {
            if (!this.database) {
                return false;
            }
            await this.database.ref(`portfolio/${type}/${itemId}`).remove();
            return true;
        } catch (error) {
            return false;
        }
    }

    // Load all data and update UI
    async loadAllData() {
        try {
            // Wait for Firebase to be ready
            if (!this.database) {
                setTimeout(() => {
                    this.loadAllData();
                }, 500);
                return;
            }
            
            await this.initializeDatabase();
            
            // Load data for each type
            const types = ['websites', 'reels', 'posts', 'logos', 'banners', 'clients', 'testimonials', 'services', 'whatwedo'];
            
            for (const type of types) {
                const data = await this.getData(type);
                this.updateUI(type, data);
            }
        } catch (error) {
            // Error loading all data
        }
    }

    // Update UI with data
    updateUI(type, data) {
        const listElement = document.getElementById(`${type}-list`);
        if (!listElement) return;

        listElement.innerHTML = '';
        
        if (Array.isArray(data)) {
            data.forEach((item, index) => {
                const itemElement = this.createItemElement(type, item, index);
                listElement.appendChild(itemElement);
            });
        } else if (data && typeof data === 'object') {
            // Handle Firebase object format
            Object.keys(data).forEach((key, index) => {
                const item = data[key];
                const itemElement = this.createItemElement(type, item, index, key);
                listElement.appendChild(itemElement);
            });
        }
    }

    // Create item element for UI
    createItemElement(type, item, index, firebaseKey = null) {
        const div = document.createElement('div');
        div.className = 'item-card';
        div.innerHTML = `
            <div class="item-preview">
                <img src="${item.image || 'https://via.placeholder.com/100'}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div class="item-info">
                    <h4>${item.title || item.name || 'Untitled'}</h4>
                    <p>${item.company || item.text || 'No description'}</p>
                </div>
            </div>
            <div class="item-actions">
                <button onclick="editItem('${type}', '${firebaseKey || index}')" class="edit-btn">Edit</button>
                <button onclick="deleteItem('${type}', '${firebaseKey || index}')" class="delete-btn">Delete</button>
            </div>
        `;
        return div;
    }
}

// Initialize Firebase Admin
const firebaseAdmin = new FirebaseAdmin();

// Make it globally available
window.firebaseAdmin = firebaseAdmin;
