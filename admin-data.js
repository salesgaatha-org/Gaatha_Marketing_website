// Admin Data Management System
// This file handles the data storage and retrieval for the admin system

class AdminDataManager {
    constructor() {
        this.initializeDefaultData();
    }

    // Initialize default data if none exists
    initializeDefaultData() {
        // Default data initialization removed - data now managed by Firebase
    }

    // Set default data for each category
    setDefaultData(type) {
        let defaultData = [];
        
        switch(type) {
            case 'websites':
                defaultData = [
                    {
                        id: 1,
                        title: 'E-Commerce Platform',
                        description: 'Advanced e-commerce solution with seamless checkout experience',
                        image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://techflow.com',
                        company: 'TechFlow',
                        views: '250% increase in conversions',
                        category: 'websites'
                    },
                    {
                        id: 2,
                        title: 'Fashion Marketplace',
                        description: 'Trendy fashion platform connecting brands with style-conscious consumers',
                        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://urbanstyle.com',
                        company: 'UrbanStyle',
                        views: '1M+ monthly visitors',
                        category: 'websites'
                    },
                    {
                        id: 3,
                        title: 'Food Delivery App',
                        description: 'Fast and reliable food delivery service with real-time tracking',
                        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://foodbites.com',
                        company: 'FoodBites',
                        views: '50K+ downloads',
                        category: 'websites'
                    },
                    {
                        id: 4,
                        title: 'SaaS Platform',
                        description: 'Cloud-based software solution for modern businesses',
                        image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://cloudnext.com',
                        company: 'CloudNext',
                        views: '$2M ARR in year 1',
                        category: 'websites'
                    },
                    {
                        id: 5,
                        title: 'Fitness Booking Platform',
                        description: 'Revolutionary fitness booking system with real-time availability',
                        image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://repro.com',
                        company: 'RePro',
                        views: '10K+ active users',
                        category: 'websites'
                    },
                    {
                        id: 6,
                        title: 'Learning Management System',
                        description: 'Comprehensive educational platform for online learning',
                        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://edutech.com',
                        company: 'EduTech',
                        views: '100K+ students',
                        category: 'websites'
                    }
                ];
                break;
                
            case 'reels':
                defaultData = [
                    {
                        id: 1,
                        title: 'Product Launch Reel',
                        description: '2.5M views',
                        image: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://instagram.com/pureglow',
                        company: 'PureGlow',
                        views: '2.5M views',
                        category: 'reels'
                    },
                    {
                        id: 2,
                        title: 'Transformation Story',
                        description: '1.8M views',
                        image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://instagram.com/urbanfit',
                        company: 'UrbanFit',
                        views: '1.8M views',
                        category: 'reels'
                    },
                    {
                        id: 3,
                        title: 'Fashion Week Highlights',
                        description: '1.2M views',
                        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://instagram.com/trendstyle',
                        company: 'TrendStyle',
                        views: '1.2M views',
                        category: 'reels'
                    },
                    {
                        id: 4,
                        title: 'Recipe Tutorial',
                        description: '1.5M views',
                        image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://instagram.com/foodiehub',
                        company: 'FoodieHub',
                        views: '1.5M views',
                        category: 'reels'
                    },
                    {
                        id: 5,
                        title: 'Destination Showcase',
                        description: '2M views',
                        image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://instagram.com/travelvibe',
                        company: 'TravelVibe',
                        views: '2M views',
                        category: 'reels'
                    },
                    {
                        id: 6,
                        title: 'Product Unboxing',
                        description: '1.2M views',
                        image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://instagram.com/techgear',
                        company: 'TechGear',
                        views: '1.2M views',
                        category: 'reels'
                    }
                ];
                break;
                
            case 'posts':
                defaultData = [
                    {
                        id: 1,
                        title: 'Brand Identity Post',
                        description: 'Scroll-stopping social content',
                        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://instagram.com/gaatha',
                        company: 'Gaa-tha',
                        views: '50K+ likes',
                        category: 'posts'
                    }
                ];
                break;
                
            case 'logos':
                defaultData = [
                    {
                        id: 1,
                        title: 'Modern Tech Logo',
                        description: 'Clean and professional design',
                        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://gaatha.com',
                        company: 'TechFlow',
                        views: 'Memorable brand identity',
                        category: 'logos'
                    }
                ];
                break;
                
            case 'banners':
                defaultData = [
                    {
                        id: 1,
                        title: 'High-Impact Display Ad',
                        description: 'Conversion-optimized design',
                        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop',
                        link: 'https://gaatha.com',
                        company: 'Gaa-tha',
                        views: 'High CTR performance',
                        category: 'banners'
                    }
                ];
                break;
                
            case 'clients':
                defaultData = [
                    {
                        id: 1,
                        title: 'TechFlow',
                        description: 'E-commerce platform client',
                        image: 'images/cds.webp',
                        link: 'https://techflow.com',
                        company: 'TechFlow',
                        views: '250% conversion increase',
                        category: 'clients'
                    },
                    {
                        id: 2,
                        title: 'EcoStyle',
                        description: 'Sustainable fashion brand',
                        image: 'images/hpmg.png',
                        link: 'https://ecostyle.com',
                        company: 'EcoStyle',
                        views: '1M+ monthly visitors',
                        category: 'clients'
                    }
                ];
                break;
                
            case 'services':
                defaultData = [
                    {
                        id: 1,
                        title: 'Social Media Marketing',
                        description: 'Create thumb-stopping content and build engaged communities across all platforms.',
                        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop',
                        link: '#',
                        company: 'Gaa-tha',
                        views: 'Content Strategy & Calendar, Community Management, Platform-Specific Campaigns',
                        category: 'services'
                    },
                    {
                        id: 2,
                        title: 'Performance Marketing',
                        description: 'ROI-focused campaigns that turn ad spend into measurable business growth.',
                        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
                        link: '#',
                        company: 'Gaa-tha',
                        views: 'Meta & Google Ads, Conversion Optimization, Analytics & Reporting',
                        category: 'services'
                    },
                    {
                        id: 3,
                        title: 'Branding & Design',
                        description: 'Build a memorable identity that resonates and stands the test of time.',
                        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
                        link: '#',
                        company: 'Gaa-tha',
                        views: 'Brand Identity & Guidelines, Visual Design Systems, Packaging & Collateral',
                        category: 'services'
                    }
                ];
                break;
                
            case 'testimonials':
                defaultData = [
                    {
                        id: 1,
                        title: 'Sarah Chen',
                        description: 'Gaa-tha transformed our brand completely. Their creative approach combined with data-driven strategy delivered results beyond our expectations.',
                        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?q=80&w=1200&auto=format&fit=crop',
                        link: '#',
                        company: 'TechFlow',
                        views: '⭐⭐⭐⭐⭐',
                        category: 'testimonials'
                    },
                    {
                        id: 2,
                        title: 'Michael Rodriguez',
                        description: 'The team at Gaa-tha understood our vision and brought it to life with incredible attention to detail.',
                        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1200&auto=format&fit=crop',
                        link: '#',
                        company: 'UrbanStyle',
                        views: '⭐⭐⭐⭐⭐',
                        category: 'testimonials'
                    }
                ];
                break;
                
            case 'whatwedo':
                defaultData = [
                    {
                        id: 1,
                        title: 'Social Media Marketing',
                        description: 'Create thumb-stopping content and build engaged communities across all platforms.',
                        image: 'https://images.unsplash.com/photo-1611162616475-46b635cb6868?q=80&w=1200&auto=format&fit=crop',
                        link: '#',
                        company: 'Gaa-tha',
                        views: 'Content Strategy & Calendar, Community Management, Platform-Specific Campaigns',
                        category: 'whatwedo'
                    },
                    {
                        id: 2,
                        title: 'Performance Marketing',
                        description: 'ROI-focused campaigns that turn ad spend into measurable business growth.',
                        image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
                        link: '#',
                        company: 'Gaa-tha',
                        views: 'Meta & Google Ads, Conversion Optimization, Analytics & Reporting',
                        category: 'whatwedo'
                    },
                    {
                        id: 3,
                        title: 'Branding & Design',
                        description: 'Build a memorable identity that resonates and stands the test of time.',
                        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop',
                        link: '#',
                        company: 'Gaa-tha',
                        views: 'Brand Identity & Guidelines, Visual Design Systems, Packaging & Collateral',
                        category: 'whatwedo'
                    }
                ];
                break;
        }
        
        // localStorage removed - data now managed by Firebase
    }

    // Get data for a specific category
    getData(type) {
        // localStorage removed - data now managed by Firebase
        return [];
    }

    // Save data for a specific category
    saveData(type, data) {
        // localStorage removed - data now managed by Firebase
    }

    // Add new item
    addItem(type, item) {
        // localStorage removed - data now managed by Firebase
        item.id = Date.now();
        item.category = type;
        return item;
    }

    // Update existing item
    updateItem(type, id, updatedItem) {
        // localStorage removed - data now managed by Firebase
        return null;
    }

    // Delete item
    deleteItem(type, id) {
        // localStorage removed - data now managed by Firebase
        return [];
    }

    // Get item by ID
    getItem(type, id) {
        // localStorage removed - data now managed by Firebase
        return null;
    }
}

// Initialize the data manager
const adminDataManager = new AdminDataManager();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminDataManager;
}
