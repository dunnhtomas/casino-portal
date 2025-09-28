const fs = require('fs');
const https = require('https');
const path = require('path');

class RemainingLogosFallback {
    constructor() {
        this.casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));
        this.foundLogos = JSON.parse(fs.readFileSync('data/logo-results.json', 'utf8'));
        this.foundCasinos = new Set(this.foundLogos.map(logo => logo.casino));
        this.remainingCasinos = this.casinos.filter(casino => !this.foundCasinos.has(casino.slug));
        this.results = [];
    }

    async findRemainingLogos() {
        console.log(`🔍 Finding logos for ${this.remainingCasinos.length} remaining casinos...`);

        // Strategy 1: API-based logo services (fastest)
        await this.tryAPIServices();
        
        // Strategy 2: Common logo path patterns
        await this.tryCommonLogoPaths();
        
        // Strategy 3: Google Favicon service (backup)
        await this.tryGoogleFavicons();

        // Generate final report
        this.generateReport();
    }

    async tryAPIServices() {
        console.log('📡 Trying API-based logo services...');
        
        for (const casino of this.remainingCasinos) {
            const domain = this.extractDomain(casino.url);
            
            // Clearbit Logo API (free tier)
            const clearbitUrl = `https://logo.clearbit.com/${domain}`;
            if (await this.testImageUrl(clearbitUrl)) {
                this.results.push({
                    casino: casino.slug,
                    method: 'clearbit-api',
                    logoUrl: clearbitUrl,
                    quality: 'medium',
                    confidence: 'high'
                });
                continue;
            }

            // Google Favicon API (higher resolution)
            const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
            if (await this.testImageUrl(googleUrl)) {
                this.results.push({
                    casino: casino.slug,
                    method: 'google-favicon',
                    logoUrl: googleUrl,
                    quality: 'low',
                    confidence: 'medium'
                });
            }
        }
    }

    async tryCommonLogoPaths() {
        console.log('🎯 Trying common logo path patterns...');
        
        const commonLogoPaths = [
            '/wp-content/uploads/logo.png',
            '/wp-content/uploads/logo.svg', 
            '/wp-content/themes/*/logo.png',
            '/images/logo.png',
            '/images/logo.svg',
            '/assets/logo.png',
            '/assets/logo.svg',
            '/static/logo.png',
            '/static/logo.svg',
            '/logo.png',
            '/logo.svg',
            '/brand/logo.png',
            '/media/logo.png'
        ];

        for (const casino of this.remainingCasinos) {
            if (this.results.find(r => r.casino === casino.slug)) continue;

            for (const logoPath of commonLogoPaths) {
                const logoUrl = casino.url.replace(/\/$/, '') + logoPath;
                
                if (await this.testImageUrl(logoUrl)) {
                    this.results.push({
                        casino: casino.slug,
                        method: 'direct-path',
                        logoUrl: logoUrl,
                        quality: 'high',
                        confidence: 'high'
                    });
                    break;
                }
            }
        }
    }

    async tryGoogleFavicons() {
        console.log('🌐 Using Google Favicon service for remaining casinos...');
        
        for (const casino of this.remainingCasinos) {
            if (this.results.find(r => r.casino === casino.slug)) continue;

            const domain = this.extractDomain(casino.url);
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            
            this.results.push({
                casino: casino.slug,
                method: 'google-favicon-fallback',
                logoUrl: faviconUrl,
                quality: 'basic',
                confidence: 'low'
            });
        }
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname.replace('www.', '');
        } catch {
            return url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
        }
    }

    testImageUrl(url) {
        return new Promise((resolve) => {
            const request = https.get(url, { timeout: 5000 }, (response) => {
                resolve(response.statusCode === 200 && 
                       response.headers['content-type']?.startsWith('image/'));
            });
            
            request.on('error', () => resolve(false));
            request.on('timeout', () => {
                request.destroy();
                resolve(false);
            });
        });
    }

    generateReport() {
        console.log('\n📊 FALLBACK LOGO FINDER RESULTS');
        console.log('================================');
        console.log(`Total remaining casinos: ${this.remainingCasinos.length}`);
        console.log(`Logos found: ${this.results.length}`);
        console.log(`Success rate: ${((this.results.length / this.remainingCasinos.length) * 100).toFixed(1)}%`);
        
        // Breakdown by method
        const methodStats = {};
        this.results.forEach(result => {
            methodStats[result.method] = (methodStats[result.method] || 0) + 1;
        });
        
        console.log('\nBy Method:');
        Object.entries(methodStats).forEach(([method, count]) => {
            console.log(`  ${method}: ${count} logos`);
        });

        // Save results
        fs.writeFileSync('data/fallback-logo-results.json', JSON.stringify(this.results, null, 2));
        
        // Create comprehensive logo mapping
        const allLogos = [
            ...this.foundLogos,
            ...this.results.map(r => ({
                casino: r.casino,
                source: r.method,
                logoUrl: r.logoUrl,
                quality: r.quality,
                confidence: r.confidence
            }))
        ];

        fs.writeFileSync('data/complete-logo-mapping.json', JSON.stringify(allLogos, null, 2));
        console.log('\n✅ Complete logo mapping saved to: data/complete-logo-mapping.json');
    }
}

// Execute the fallback logo finder
async function runFallbackFinder() {
    const finder = new RemainingLogosFallback();
    await finder.findRemainingLogos();
}

runFallbackFinder().catch(console.error);