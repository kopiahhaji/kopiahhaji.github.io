// Digital Dakwah Platform Configuration
const CONFIG = {
    // Application Info
    APP_NAME: 'Digital Dakwah Platform',
    VERSION: '1.0.0',
    DESCRIPTION: 'Sabah Digital Islamic Education Platform',
    
    // Deployment Info
    DEPLOYMENT: {
        PLATFORM: 'Cloudflare Pages',
        GITHUB_REPO: 'kopiahhaji.github.io',
        DOMAIN: 'digital.zikirnurani.com',
        BACKUP_DOMAIN: 'kopiahhaji.github.io',
        CDN: 'Cloudflare'
    },
    
    // AI Configuration
    AI: {
        PROVIDER: 'Google Gemini',
        MODEL: 'gemini-1.5-pro',  // Updated to stable model
        MAX_TOKENS: 1000,        // Increased for better responses
        TEMPERATURE: 0.7,
        FALLBACK_ENABLED: true,
        RETRY_ATTEMPTS: 3,       // Added retry configuration
        RETRY_DELAY: 1000        // Added retry delay
    },
    
    // Platform Features
    FEATURES: {
        MARKETPLACE: {
            SECTIONS: ['Local Halal', 'Local Products', 'Sabahan Art'],
            TOTAL_PRODUCTS: 350,
            VENDORS: 125
        },
        COMMUNITY: {
            ACTIVE_MEMBERS: 2847,
            EVENTS_PER_MONTH: 156,
            PARTNER_MOSQUES: 43
        },
        USTAZ_AI: {
            QUESTIONS_ANSWERED: 1247,
            SATISFACTION_RATE: 89,
            TOPICS_COVERED: 156
        }
    },
    
    // Location Data
    SABAH_LOCATIONS: [
        'Kota Kinabalu',
        'Sandakan', 
        'Tawau',
        'Lahad Datu',
        'Keningau',
        'Papar',
        'Tuaran',
        'Beaufort',
        'Ranau',
        'Kudat',
        'Semporna'
    ],
    
    // Prayer Times (Default for KK)
    PRAYER_TIMES_DEFAULT: {
        LOCATION: 'Kota Kinabalu',
        FAJR: '5:45 AM',
        DHUHR: '12:30 PM',
        ASR: '3:45 PM',
        MAGHRIB: '6:55 PM',
        ISHA: '8:10 PM'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.CONFIG = CONFIG;
}
