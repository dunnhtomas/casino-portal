const { PlaywrightCrawler } = require('crawlee');
const fs = require('fs');
const path = require('path');
const https = require('https');

class CleanBrandLogoScraper {
    constructor() {
        this.searchList = JSON.parse(fs.readFileSync('data/clean-casino-search-list.json', 'utf8'));
        this.existingLogos = JSON.parse(fs.readFileSync('data/complete-logo-mapping.json', 'utf8'));
        this.existingMap = new Map(this.existingLogos.map(logo => [logo.casino, logo]));
        this.newResults = [];
        this.improvements = [];
    }

    async findImprovedLogos() {
        console.log('🎯 Starting improved logo search with clean brand names...');
        console.log(`📋 Processing ${this.searchList.length} casinos`);

        const crawler = new PlaywrightCrawler({
            maxConcurrency: 2,
            requestHandlerTimeoutSecs: 30,
            requestHandler: async ({ page, request, log }) => {
                try {
                    const casinoData = request.userData.casino;
                    log.info(`🔍 Searching for: ${casinoData.brand}`);
                    
                    // Try direct website first
                    const directLogo = await this.extractDirectLogo(page, request);
                    if (directLogo && this.isImprovement(casinoData.slug, directLogo)) {
                        this.recordImprovement(casinoData.slug, directLogo, 'direct-improved');
                        return;
                    }

                    // Try Clearbit API with clean brand
                    const clearbitLogo = await this.tryClearbitAPI(casinoData);
                    if (clearbitLogo && this.isImprovement(casinoData.slug, clearbitLogo)) {
                        this.recordImprovement(casinoData.slug, clearbitLogo, 'clearbit-improved');
                        return;
                    }

                    log.info(`ℹ️ No improvement found for ${casinoData.brand}`);

                } catch (error) {
                    log.error(`❌ Error processing ${request.userData.casino.brand}: ${error.message}`);
                }
            }
        });

        // Process all casinos with direct website scraping
        const directRequests = this.searchList.map(casino => ({
            url: casino.url,
            userData: { type: 'direct', casino: casino }
        }));

        await crawler.addRequests(directRequests);
        await crawler.run();

        // Generate final report
        this.generateImprovementReport();
    }

    async extractDirectLogo(page, request) {
        const casinoData = request.userData.casino;
        
        try {
            // Wait for page load
            await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
            
            // Enhanced logo selectors focusing on main brand logos
            const logoSelectors = [
                // Primary logo selectors
                'img[class*="logo"]:not([class*="payment"]):not([class*="provider"]):not([class*="game"])',
                'img[alt*="logo" i]:not([alt*="payment"]):not([alt*="provider"])',
                '.logo img:first-child, .header-logo img:first-child, .site-logo img:first-child',
                '[data-testid*="logo"] img, [data-cy*="logo"] img',
                
                // Brand-specific selectors using clean brand name
                `img[alt*="${casinoData.brand}" i]`,
                `img[src*="${casinoData.brand.toLowerCase().replace(/\s+/g, '')}" i]`,
                `img[class*="${casinoData.brand.toLowerCase().replace(/\s+/g, '')}" i]`,
                
                // Header and navigation logos
                'header img[class*="brand"], header img[class*="logo"]',
                '.navbar-brand img, .brand img, .main-logo img',
                
                // High-quality logo patterns
                'img[src*="logo"]:not([src*="payment"]):not([src*="provider"]):not([src*="game"])',
                '.header .logo img, .top-bar .logo img',
            ];

            for (const selector of logoSelectors) {
                try {
                    const logoData = await page.evaluate((sel, brandName) => {
                        const images = document.querySelectorAll(sel);
                        
                        for (const img of images) {
                            // Skip if too small (likely icons)
                            if (img.naturalWidth < 60 || img.naturalHeight < 20) continue;
                            
                            // Skip payment/provider logos
                            const src = img.src?.toLowerCase() || '';
                            const alt = img.alt?.toLowerCase() || '';
                            const className = img.className?.toLowerCase() || '';
                            
                            if (src.includes('payment') || src.includes('provider') || 
                                alt.includes('payment') || alt.includes('provider') ||
                                className.includes('payment') || className.includes('provider')) {
                                continue;
                            }

                            // Prefer images with brand name in attributes
                            const brandScore = this.calculateBrandRelevance(img, brandName);
                            
                            return {
                                src: img.src,
                                alt: img.alt || '',
                                width: img.naturalWidth,
                                height: img.naturalHeight,
                                selector: sel,
                                brandScore: brandScore,
                                quality: this.assessImageQuality(img)
                            };
                        }
                        return null;
                    }, selector, casinoData.brand);
                    
                    if (logoData && logoData.brandScore > 0) {
                        return logoData;
                    }
                } catch (e) {
                    // Continue to next selector
                }
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }

    async tryClearbitAPI(casinoData) {
        try {
            const domain = this.extractDomain(casinoData.url);
            const clearbitUrl = `https://logo.clearbit.com/${domain}`;
            
            // Test if the API returns a valid logo
            const isValid = await this.testImageUrl(clearbitUrl);
            if (isValid) {
                return {
                    src: clearbitUrl,
                    alt: `${casinoData.brand} logo`,
                    width: 128,
                    height: 128,
                    quality: 'medium',
                    brandScore: 10 // API logos are highly relevant
                };
            }
        } catch (error) {
            // Clearbit failed, continue
        }
        return null;
    }

    isImprovement(slug, newLogo) {
        const existing = this.existingMap.get(slug);
        if (!existing) return true; // New logo is always an improvement over none

        // Quality hierarchy: high > medium > basic
        const qualityRank = { 'high': 3, 'medium': 2, 'basic': 1, 'low': 1 };
        const existingQuality = qualityRank[existing.quality] || 1;
        const newQuality = qualityRank[newLogo.quality] || 1;

        // Improvement if:
        // 1. Better quality
        // 2. Same quality but higher brand relevance score
        // 3. Direct logo vs API logo of same quality
        if (newQuality > existingQuality) return true;
        if (newQuality === existingQuality && (newLogo.brandScore || 0) > 5) return true;

        return false;
    }

    recordImprovement(slug, logoData, method) {
        const existing = this.existingMap.get(slug);
        const improvement = {
            casino: slug,
            method: method,
            oldLogo: existing ? existing.logoUrl : 'none',
            oldQuality: existing ? existing.quality : 'none',
            newLogo: logoData.src,
            newQuality: logoData.quality,
            improvement: this.getImprovementType(existing, logoData)
        };
        
        this.improvements.push(improvement);
        console.log(`✅ Improvement found for ${slug}: ${improvement.improvement}`);
    }

    getImprovementType(existing, newLogo) {
        if (!existing) return 'New logo found';
        
        const qualityRank = { 'high': 3, 'medium': 2, 'basic': 1, 'low': 1 };
        const existingQuality = qualityRank[existing.quality] || 1;
        const newQuality = qualityRank[newLogo.quality] || 1;
        
        if (newQuality > existingQuality) {
            return `Quality upgrade: ${existing.quality} → ${newLogo.quality}`;
        }
        
        return `Better brand relevance (score: ${newLogo.brandScore})`;
    }

    calculateBrandRelevance(img, brandName) {
        let score = 0;
        const lowerBrand = brandName.toLowerCase();
        const src = (img.src || '').toLowerCase();
        const alt = (img.alt || '').toLowerCase();
        const className = (img.className || '').toLowerCase();
        
        // Brand name in URL path
        if (src.includes(lowerBrand.replace(/\s+/g, ''))) score += 10;
        if (src.includes(lowerBrand.replace(/\s+/g, '-'))) score += 8;
        
        // Brand name in alt text
        if (alt.includes(lowerBrand)) score += 8;
        
        // Brand name in class
        if (className.includes(lowerBrand.replace(/\s+/g, ''))) score += 6;
        
        // Logo-related terms
        if (src.includes('logo') && src.includes('brand')) score += 5;
        if (alt.includes('logo') || alt.includes('brand')) score += 3;
        
        return score;
    }

    assessImageQuality(img) {
        const width = img.naturalWidth;
        const height = img.naturalHeight;
        const src = img.src.toLowerCase();
        
        // Vector formats are highest quality
        if (src.includes('.svg')) return 'high';
        
        // High resolution images
        if (width >= 200 && height >= 80) return 'high';
        
        // Medium resolution
        if (width >= 100 && height >= 40) return 'medium';
        
        // Basic/small logos
        return 'basic';
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

    generateImprovementReport() {
        console.log('\n🎯 LOGO IMPROVEMENT RESULTS');
        console.log('============================');
        console.log(`Total casinos processed: ${this.searchList.length}`);
        console.log(`Improvements found: ${this.improvements.length}`);
        console.log(`Success rate: ${((this.improvements.length / this.searchList.length) * 100).toFixed(1)}%`);

        if (this.improvements.length > 0) {
            // Save improvement details
            fs.writeFileSync('data/logo-improvements.json', JSON.stringify(this.improvements, null, 2));
            
            // Update the complete logo mapping with improvements
            const updatedMapping = [...this.existingLogos];
            
            this.improvements.forEach(improvement => {
                const index = updatedMapping.findIndex(logo => logo.casino === improvement.casino);
                if (index !== -1) {
                    updatedMapping[index] = {
                        ...updatedMapping[index],
                        logoUrl: improvement.newLogo,
                        quality: improvement.newQuality,
                        source: improvement.method,
                        improved: true
                    };
                } else {
                    updatedMapping.push({
                        casino: improvement.casino,
                        logoUrl: improvement.newLogo,
                        quality: improvement.newQuality,
                        source: improvement.method,
                        improved: true
                    });
                }
            });
            
            fs.writeFileSync('data/complete-logo-mapping-improved.json', JSON.stringify(updatedMapping, null, 2));
            
            console.log('\n🏆 TOP IMPROVEMENTS:');
            this.improvements.slice(0, 10).forEach(improvement => {
                console.log(`  • ${improvement.casino}: ${improvement.improvement}`);
            });
            
            console.log(`\n✅ Updated logo mapping saved: data/complete-logo-mapping-improved.json`);
            console.log(`📋 Improvement details saved: data/logo-improvements.json`);
        } else {
            console.log('\n😊 All logos are already at optimal quality!');
        }
    }
}

// Run the improved logo scraper
async function runImprovedLogoScraper() {
    const scraper = new CleanBrandLogoScraper();
    await scraper.findImprovedLogos();
}

runImprovedLogoScraper().catch(console.error);