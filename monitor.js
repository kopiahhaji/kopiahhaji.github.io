// Platform Status Monitor
// Use this in browser console to check platform health

class DakwahPlatformMonitor {
    constructor() {
        this.startTime = new Date();
        this.stats = {
            pageLoads: 0,
            aiQueries: 0,
            marketplaceViews: 0,
            errors: []
        };
        this.init();
    }

    init() {
        console.log('🌙 Digital Dakwah Platform Monitor Initialized');
        this.checkPlatformHealth();
        this.setupEventListeners();
    }

    checkPlatformHealth() {
        const health = {
            timestamp: new Date().toISOString(),
            domain: 'digital.zikirnurani.com',
            pages: this.checkPages(),
            ai: this.checkAI(),
            marketplace: this.checkMarketplace(),
            performance: this.checkPerformance()
        };

        console.log('📊 Platform Health Report:', health);
        return health;
    }

    checkPages() {
        const pages = ['index.html', 'marketplace.html', 'ustaz.html', 'mindmap.html'];
        const pageStatus = {};
        
        pages.forEach(page => {
            const pageExists = document.querySelector(`[href*="${page}"]`) !== null;
            pageStatus[page] = pageExists ? 'Active' : 'Check Required';
        });

        return pageStatus;
    }

    checkAI() {
        const aiStatus = {
            geminiLoaded: typeof GoogleGenerativeAI !== 'undefined',
            chatInterface: document.getElementById('chatMessages') !== null,
            apiConfigured: window.location.pathname.includes('ustaz') && 
                          document.querySelector('[data-api-key]') !== null
        };

        return aiStatus;
    }

    checkMarketplace() {
        const marketplaceStatus = {
            productsLoaded: document.querySelectorAll('.product-card').length > 0,
            categoriesActive: document.querySelectorAll('.category-filter').length > 0,
            searchFunctional: document.getElementById('searchInput') !== null
        };

        return marketplaceStatus;
    }

    checkPerformance() {
        if (performance && performance.timing) {
            const timing = performance.timing;
            const loadTime = timing.loadEventEnd - timing.navigationStart;
            
            return {
                loadTime: loadTime + 'ms',
                domReady: (timing.domContentLoadedEventEnd - timing.navigationStart) + 'ms',
                resourcesLoaded: document.querySelectorAll('img, link, script').length
            };
        }
        return { status: 'Performance API not available' };
    }

    setupEventListeners() {
        // Track page interactions
        document.addEventListener('click', (e) => {
            if (e.target.closest('.ai-chat-button')) {
                this.stats.aiQueries++;
            }
            if (e.target.closest('.product-card')) {
                this.stats.marketplaceViews++;
            }
        });

        // Track errors
        window.addEventListener('error', (e) => {
            this.stats.errors.push({
                message: e.message,
                source: e.filename,
                line: e.lineno,
                timestamp: new Date().toISOString()
            });
        });
    }

    getStats() {
        const uptime = new Date() - this.startTime;
        return {
            ...this.stats,
            uptime: Math.floor(uptime / 1000) + ' seconds',
            platform: 'Digital Dakwah Platform',
            version: '1.0.0'
        };
    }

    generateReport() {
        const report = {
            health: this.checkPlatformHealth(),
            stats: this.getStats(),
            recommendations: this.getRecommendations()
        };

        console.table(report.health);
        console.log('📈 Usage Statistics:', report.stats);
        console.log('💡 Recommendations:', report.recommendations);
        
        return report;
    }

    getRecommendations() {
        const recommendations = [];
        
        if (this.stats.errors.length > 0) {
            recommendations.push('🔧 Check and fix JavaScript errors');
        }
        
        if (this.stats.aiQueries > 50) {
            recommendations.push('⚡ Consider AI rate limiting');
        }
        
        if (this.stats.marketplaceViews > 100) {
            recommendations.push('📊 Analyze popular products for insights');
        }
        
        recommendations.push('✅ Platform is running smoothly');
        
        return recommendations;
    }
}

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
    window.dakwahMonitor = new DakwahPlatformMonitor();
    
    // Add console commands
    window.checkHealth = () => window.dakwahMonitor.checkPlatformHealth();
    window.getStats = () => window.dakwahMonitor.getStats();
    window.generateReport = () => window.dakwahMonitor.generateReport();
    
    console.log('🚀 Platform Monitor Commands Available:');
    console.log('  checkHealth() - Check platform status');
    console.log('  getStats() - View usage statistics');
    console.log('  generateReport() - Generate full report');
}

// Export for Node.js
if (typeof module !== 'undefined') {
    module.exports = DakwahPlatformMonitor;
}
