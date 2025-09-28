const { PlaywrightCrawler } = require('crawlee');
const fs = require('fs');
const https = require('https');

class SimpleGeoAwareLogoScraper {
    constructor() {
        this.casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));
        this.existingLogos = JSON.parse(fs.readFileSync('data/complete-logo-mapping.json', 'utf8'));
        this.existingMap = new Map(this.existingLogos.map(logo => [logo.casino, logo]));
        this.results = [];
    }

    getBestCountryForCasino(casino) {
        const restricted = casino.restrictedGeos || [];
        
        // Common allowed countries (prioritized by casino market friendliness)
        const allowedCountries = ['CA', 'AU', 'NZ', 'FI', 'NO', 'SE', 'DK', 'DE', 'AT', 'CH', 'JP', 'BR', 'MX', 'ZA'];
        const allowed = allowedCountries.filter(country => !restricted.includes(country));
        
        return allowed[0] || 'CA'; // Fallback to Canada
    }

    async scrapeWithSimpleGeoAwareness() {
        console.log('🌍 Starting simple geo-aware logo scraping...');
        console.log(`📋 Processing ${this.casinos.length} casinos`);

        const crawler = new PlaywrightCrawler({
            maxConcurrency: 2,
            requestHandlerTimeoutSecs: 30,
            launchContext: {
                launchOptions: {
                    headless: true,
                    args: ['--no-sandbox', '--disable-web-security']
                }
            },
            requestHandler: async ({ page, request, log }) => {
                try {
                    const casino = request.userData.casino;
                    const bestCountry = this.getBestCountryForCasino(casino);
                    
                    log.info(`🎰 Scraping ${casino.brand} (optimized for ${bestCountry})`);
                    
                    // Set headers to simulate allowed country access
                    const countryHeaders = this.getCountryHeaders(bestCountry);
                    await page.setExtraHTTPHeaders(countryHeaders);
                    
                    // Wait for page load
                    await page.waitForLoadState('domcontentloaded', { timeout: 25000 });
                    
                    // Check for geo-blocking
                    const title = await page.title();
                    const url = page.url();
                    
                    if (this.isGeoBlocked(title, url)) {
                        log.warn(`🚫 Potentially geo-blocked: ${casino.brand}`);
                        return;
                    }
                    
                    // Extract logo with brand-aware selectors
                    const logoData = await this.extractSmartLogo(page, casino);
                    
                    if (logoData && this.isValidLogo(logoData)) {
                        this.results.push({
                            casino: casino.slug,
                            brand: casino.brand,
                            logoUrl: logoData.src,
                            quality: logoData.quality,
                            source: 'geo-aware-smart',
                            country: bestCountry,
                            dimensions: `${logoData.width}x${logoData.height}`,
                            brandRelevance: logoData.brandScore || 0
                        });
                        
                        log.info(`✅ Found ${logoData.quality} logo for ${casino.brand}`);
                        
                        // Try to download and save the logo locally
                        await this.downloadLogo(logoData.src, casino.slug);
                        
                    } else {
                        log.info(`❌ No suitable logo found for ${casino.brand}`);
                    }
                    
                } catch (error) {
                    log.error(`❌ Error processing ${request.userData.casino.brand}: ${error.message}`);
                }
            }
        });

        // Create requests for all casinos
        const requests = this.casinos.map(casino => ({
            url: casino.url,
            userData: { casino: casino }
        }));

        await crawler.addRequests(requests);
        await crawler.run();
        
        this.generateResults();
    }

    getCountryHeaders(country) {
        const headers = {
            'CA': {
                'Accept-Language': 'en-CA,en;q=0.9,fr;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            'AU': {
                'Accept-Language': 'en-AU,en;q=0.9',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            },
            'FI': {
                'Accept-Language': 'fi-FI,fi;q=0.9,en;q=0.8',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15'
            },
            'DE': {
                'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        };
        
        return headers[country] || headers['CA'];
    }

    isGeoBlocked(title, url) {
        const blockedIndicators = [
            'blocked', 'restricted', 'unavailable', 'access denied',
            'geo', 'location', 'region', 'country', '403', '404'
        ];
        
        const titleLower = title.toLowerCase();
        const urlLower = url.toLowerCase();
        
        return blockedIndicators.some(indicator => 
            titleLower.includes(indicator) || urlLower.includes(indicator)
        );
    }

    async extractSmartLogo(page, casino) {
        try {
            // Smart logo extraction focusing on brand relevance
            const logoData = await page.evaluate((brandName) => {
                const brandLower = brandName.toLowerCase().replace(/\s+/g, '');
                
                // Priority selector strategy
                const strategies = [
                    // Strategy 1: Brand-specific searches
                    () => {
                        const selectors = [
                            `img[alt*="${brandName}" i]`,
                            `img[src*="${brandLower}" i]`,
                            `img[class*="${brandLower}" i]`
                        ];
                        
                        for (const sel of selectors) {
                            const imgs = document.querySelectorAll(sel);
                            for (const img of imgs) {
                                if (img.naturalWidth > 80 && img.naturalHeight > 30) {
                                    return { element: img, score: 15 };
                                }
                            }
                        }
                        return null;
                    },
                    
                    // Strategy 2: Header logos
                    () => {
                        const selectors = [
                            'header img[class*="logo"]',
                            '.header img[class*="logo"]',
                            '.navbar-brand img',
                            '.logo img:first-child'
                        ];
                        
                        for (const sel of selectors) {
                            const img = document.querySelector(sel);
                            if (img && img.naturalWidth > 60 && img.naturalHeight > 25) {
                                return { element: img, score: 10 };
                            }
                        }
                        return null;
                    },
                    
                    // Strategy 3: Main logo classes
                    () => {
                        const selectors = [
                            '.site-logo img',
                            '.main-logo img',
                            '.brand-logo img',
                            'img[class*="logo"]:not([class*="payment"])'
                        ];
                        
                        for (const sel of selectors) {
                            const img = document.querySelector(sel);
                            if (img && img.naturalWidth > 50 && img.naturalHeight > 20) {
                                return { element: img, score: 8 };
                            }
                        }
                        return null;
                    }
                ];
                
                // Try strategies in order
                for (const strategy of strategies) {
                    const result = strategy();
                    if (result) {
                        const img = result.element;
                        const src = img.src;
                        
                        // Skip unwanted images
                        if (src.toLowerCase().includes('payment') || 
                            src.toLowerCase().includes('provider') ||
                            src.toLowerCase().includes('game')) {
                            continue;
                        }
                        
                        // Determine quality
                        let quality = 'basic';
                        if (src.toLowerCase().includes('.svg')) quality = 'high';
                        else if (img.naturalWidth >= 150 && img.naturalHeight >= 60) quality = 'high';
                        else if (img.naturalWidth >= 100 && img.naturalHeight >= 40) quality = 'medium';
                        
                        return {
                            src: src,
                            alt: img.alt || '',
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                            quality: quality,
                            brandScore: result.score
                        };
                    }
                }
                
                return null;
            }, casino.brand);
            
            return logoData;
        } catch (error) {
            return null;
        }
    }

    isValidLogo(logoData) {
        if (!logoData || !logoData.src) return false;
        
        // Basic validation
        if (logoData.width < 40 || logoData.height < 15) return false;
        
        // URL validation
        const src = logoData.src.toLowerCase();
        if (src.includes('payment') || src.includes('provider') || src.includes('game')) return false;
        
        return true;
    }

    async downloadLogo(url, slug) {
        try {
            const filename = `${slug}-geo-logo.png`;
            const filepath = `public/images/casinos/${filename}`;
            
            await this.downloadImage(url, filepath);
            console.log(`💾 Downloaded: ${filename}`);
            return filename;
        } catch (error) {
            console.log(`❌ Download failed for ${slug}: ${error.message}`);
            return null;
        }
    }

    downloadImage(url, filepath) {
        return new Promise((resolve, reject) => {
            const file = fs.createWriteStream(filepath);
            
            const request = https.get(url, (response) => {
                if (response.statusCode === 200) {
                    response.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve();
                    });
                } else {
                    reject(new Error(`HTTP ${response.statusCode}`));
                }
            });
            
            request.on('error', reject);
            request.setTimeout(10000, () => {
                request.destroy();
                reject(new Error('Download timeout'));
            });
        });
    }

    generateResults() {
        console.log('\n🌍 SIMPLE GEO-AWARE RESULTS');
        console.log('=============================');
        console.log(`Total casinos processed: ${this.casinos.length}`);
        console.log(`New logos found: ${this.results.length}`);
        console.log(`Success rate: ${((this.results.length / this.casinos.length) * 100).toFixed(1)}%`);

        // Quality stats
        const byQuality = {};
        this.results.forEach(result => {
            byQuality[result.quality] = (byQuality[result.quality] || 0) + 1;
        });

        console.log('\n🏆 Quality Distribution:');
        Object.entries(byQuality).forEach(([quality, count]) => {
            console.log(`  ${quality}: ${count} logos`);
        });

        // Show top results
        console.log('\n🎯 Top Logo Discoveries:');
        this.results.slice(0, 10).forEach(result => {
            console.log(`  • ${result.brand}: ${result.quality} (relevance: ${result.brandRelevance})`);
        });

        // Save results
        fs.writeFileSync('data/simple-geo-logo-results.json', JSON.stringify(this.results, null, 2));
        console.log(`\n✅ Results saved to: data/simple-geo-logo-results.json`);
        
        if (this.results.length > 0) {
            console.log(`🎉 Successfully found ${this.results.length} new/improved casino logos!`);
        }
    }
}

// Run the simple geo-aware scraper
async function runSimpleGeoScraper() {
    const scraper = new SimpleGeoAwareLogoScraper();
    await scraper.scrapeWithSimpleGeoAwareness();
}

runSimpleGeoScraper().catch(console.error);