const { PlaywrightCrawler } = require('crawlee');
const fs = require('fs');
const https = require('https');

class GeoAwareLogoScraper {
    constructor() {
        this.casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));
        this.existingLogos = JSON.parse(fs.readFileSync('data/complete-logo-mapping.json', 'utf8'));
        this.existingMap = new Map(this.existingLogos.map(logo => [logo.casino, logo]));
        this.results = [];
        this.geoStrategies = this.buildGeoStrategies();
    }

    buildGeoStrategies() {
        // Common allowed countries for most casinos
        const commonAllowedCountries = [
            'CA', // Canada
            'AU', // Australia  
            'NZ', // New Zealand
            'NO', // Norway
            'FI', // Finland
            'SE', // Sweden
            'DK', // Denmark
            'DE', // Germany (for some)
            'AT', // Austria (for some)
            'CH', // Switzerland
            'JP', // Japan
            'BR', // Brazil
            'MX', // Mexico
            'ZA'  // South Africa
        ];

        return {
            // Strategy 1: Use different User-Agent strings to simulate different locations
            userAgents: {
                'CA': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Canadian
                'AU': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // Australian
                'DE': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', // German
                'FI': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15' // Finnish
            },

            // Strategy 2: Locale and language headers
            locales: {
                'CA': { locale: 'en-CA', language: 'en-CA,en;q=0.9' },
                'AU': { locale: 'en-AU', language: 'en-AU,en;q=0.9' },
                'DE': { locale: 'de-DE', language: 'de-DE,de;q=0.9,en;q=0.8' },
                'FI': { locale: 'fi-FI', language: 'fi-FI,fi;q=0.9,en;q=0.8' },
                'NO': { locale: 'nb-NO', language: 'nb-NO,nb;q=0.9,en;q=0.8' },
                'SE': { locale: 'sv-SE', language: 'sv-SE,sv;q=0.9,en;q=0.8' }
            },

            commonAllowed: commonAllowedCountries
        };
    }

    getBestCountryForCasino(casino) {
        const restricted = casino.restrictedGeos || [];
        const allowed = this.geoStrategies.commonAllowed.filter(country => !restricted.includes(country));
        
        // Prefer countries with good casino markets and less restrictions
        const preferredOrder = ['CA', 'AU', 'NZ', 'FI', 'NO', 'SE', 'DE', 'AT'];
        
        for (const preferred of preferredOrder) {
            if (allowed.includes(preferred)) {
                return preferred;
            }
        }
        
        // Fallback to first allowed country
        return allowed[0] || 'CA'; // Canada as ultimate fallback
    }

    async scrapeWithGeoAwareness() {
        console.log('🌍 Starting geo-aware logo scraping...');
        console.log(`📋 Processing ${this.casinos.length} casinos with geo-restrictions`);

        const crawler = new PlaywrightCrawler({
            maxConcurrency: 1, // Slower but more careful with geo-restrictions
            requestHandlerTimeoutSecs: 45,
            launchContext: {
                launchOptions: {
                    headless: true,
                    // Additional stealth options
                    args: [
                        '--no-sandbox',
                        '--disable-blink-features=AutomationControlled',
                        '--disable-features=VizDisplayCompositor',
                    ],
                }
            },
            preNavigationHooks: [
                async ({ request, page }) => {
                    const casino = request.userData.casino;
                    const bestCountry = this.getBestCountryForCasino(casino);
                    
                    console.log(`🌍 Accessing ${casino.brand} as ${bestCountry} visitor`);
                    
                    // Set geo-appropriate headers
                    const userAgent = this.geoStrategies.userAgents[bestCountry] || this.geoStrategies.userAgents['CA'];
                    const locale = this.geoStrategies.locales[bestCountry] || this.geoStrategies.locales['CA'];
                    
                    // Set user agent using the context method
                    await page.context().setUserAgent(userAgent);
                    
                    await page.setExtraHTTPHeaders({
                        'Accept-Language': locale.language,
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                        'Accept-Encoding': 'gzip, deflate, br',
                        'DNT': '1',
                        'Connection': 'keep-alive',
                        'Upgrade-Insecure-Requests': '1',
                        'Sec-Fetch-Dest': 'document',
                        'Sec-Fetch-Mode': 'navigate',
                        'Sec-Fetch-Site': 'none',
                        'Cache-Control': 'max-age=0'
                    });
                }
            ],
            requestHandler: async ({ page, request, log }) => {
                try {
                    const casino = request.userData.casino;
                    const bestCountry = this.getBestCountryForCasino(casino);
                    
                    log.info(`🎰 Scraping ${casino.brand} from ${bestCountry}`);
                    
                    // Try to access the site
                    await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
                    
                    // Check if we're blocked or redirected
                    const currentUrl = page.url();
                    const title = await page.title();
                    
                    if (title.toLowerCase().includes('blocked') || 
                        title.toLowerCase().includes('restricted') ||
                        currentUrl.includes('blocked') ||
                        currentUrl.includes('geo')) {
                        log.warn(`🚫 Geo-blocked: ${casino.brand} (${bestCountry})`);
                        return;
                    }
                    
                    // Look for logos with enhanced geo-aware selectors
                    const logoData = await this.extractLogoWithGeoContext(page, casino, bestCountry);
                    
                    if (logoData) {
                        this.results.push({
                            casino: casino.slug,
                            brand: casino.brand,
                            logoUrl: logoData.src,
                            quality: logoData.quality,
                            source: 'geo-aware-direct',
                            country: bestCountry,
                            dimensions: `${logoData.width}x${logoData.height}`,
                            brandScore: logoData.brandScore || 0
                        });
                        
                        log.info(`✅ Found logo for ${casino.brand}: ${logoData.quality} quality`);
                    } else {
                        log.info(`❌ No logo found for ${casino.brand}`);
                        
                        // Try alternative approach - look for favicon as fallback
                        const faviconUrl = await this.extractFavicon(page, casino);
                        if (faviconUrl) {
                            this.results.push({
                                casino: casino.slug,
                                brand: casino.brand,
                                logoUrl: faviconUrl,
                                quality: 'basic',
                                source: 'favicon-fallback',
                                country: bestCountry,
                                dimensions: '32x32'
                            });
                            log.info(`📌 Fallback favicon found for ${casino.brand}`);
                        }
                    }
                    
                } catch (error) {
                    log.error(`❌ Error processing ${request.userData.casino.brand}: ${error.message}`);
                }
            }
        });

        // Create requests with geo-awareness
        const requests = this.casinos.map(casino => {
            const bestCountry = this.getBestCountryForCasino(casino);
            
            return {
                url: casino.url,
                userData: { 
                    casino: casino,
                    targetCountry: bestCountry
                }
            };
        });

        await crawler.addRequests(requests);
        await crawler.run();
        
        this.generateGeoAwareReport();
    }

    async extractLogoWithGeoContext(page, casino, country) {
        try {
            // Enhanced selectors that work across different geo versions
            const logoSelectors = [
                // Primary brand logos
                'img[class*="logo"]:not([class*="payment"]):not([class*="provider"]):not([class*="game"]):not([class*="sponsor"])',
                'img[alt*="logo" i]:not([alt*="payment"]):not([alt*="provider"])',
                
                // Header logos (most common)
                'header img[class*="logo"], header img[class*="brand"]',
                '.header img[class*="logo"], .header img[class*="brand"]',
                '.navbar-brand img:first-child, .logo img:first-child',
                
                // Brand-specific searches
                `img[alt*="${casino.brand}" i]`,
                `img[src*="${casino.brand.toLowerCase().replace(/\s+/g, '')}" i]`,
                
                // Site logo patterns
                '.site-logo img, .main-logo img, .brand-logo img',
                '[data-testid*="logo"] img, [data-cy*="logo"] img',
                
                // Mobile-first logos (often cleaner)
                '.mobile-logo img, .mobile-header img[class*="logo"]',
                
                // SVG logos (highest quality)
                'svg[class*="logo"], svg[class*="brand"]'
            ];

            for (const selector of logoSelectors) {
                try {
                    const logoData = await page.evaluate((sel, brandName) => {
                        const elements = document.querySelectorAll(sel);
                        
                        for (const element of elements) {
                            let src, width, height;
                            
                            // Handle both IMG and SVG elements
                            if (element.tagName === 'IMG') {
                                src = element.src;
                                width = element.naturalWidth || element.offsetWidth;
                                height = element.naturalHeight || element.offsetHeight;
                            } else if (element.tagName === 'SVG') {
                                // For SVG, try to convert to data URL or find source
                                const svgData = new XMLSerializer().serializeToString(element);
                                src = `data:image/svg+xml;base64,${btoa(svgData)}`;
                                width = element.offsetWidth || 200;
                                height = element.offsetHeight || 100;
                            } else {
                                continue;
                            }
                            
                            // Skip tiny images
                            if (width < 50 || height < 20) continue;
                            
                            // Skip obvious non-logos
                            const srcLower = (src || '').toLowerCase();
                            const altLower = (element.alt || '').toLowerCase();
                            
                            if (srcLower.includes('payment') || srcLower.includes('provider') || 
                                srcLower.includes('game') || srcLower.includes('sponsor') ||
                                altLower.includes('payment') || altLower.includes('provider')) {
                                continue;
                            }
                            
                            // Calculate brand relevance
                            let brandScore = 0;
                            const brandLower = brandName.toLowerCase();
                            
                            if (srcLower.includes(brandLower.replace(/\s+/g, ''))) brandScore += 10;
                            if (altLower.includes(brandLower)) brandScore += 8;
                            if (element.className.toLowerCase().includes(brandLower.replace(/\s+/g, ''))) brandScore += 6;
                            
                            // Quality assessment
                            let quality = 'basic';
                            if (srcLower.includes('.svg') || element.tagName === 'SVG') quality = 'high';
                            else if (width >= 150 && height >= 60) quality = 'high';
                            else if (width >= 100 && height >= 40) quality = 'medium';
                            
                            return {
                                src: src,
                                alt: element.alt || '',
                                width: width,
                                height: height,
                                quality: quality,
                                brandScore: brandScore,
                                selector: sel,
                                tagName: element.tagName
                            };
                        }
                        
                        return null;
                    }, selector, casino.brand);
                    
                    if (logoData && logoData.src) {
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

    async extractFavicon(page, casino) {
        try {
            const favicon = await page.evaluate(() => {
                // Try multiple favicon selectors
                const selectors = [
                    'link[rel="icon"]',
                    'link[rel="shortcut icon"]',
                    'link[rel="apple-touch-icon"]',
                    'link[rel="apple-touch-icon-precomposed"]'
                ];
                
                for (const selector of selectors) {
                    const link = document.querySelector(selector);
                    if (link && link.href) {
                        return link.href;
                    }
                }
                
                // Fallback to default favicon
                return window.location.origin + '/favicon.ico';
            });
            
            // Test if favicon exists
            const exists = await this.testImageUrl(favicon);
            return exists ? favicon : null;
        } catch (error) {
            return null;
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

    generateGeoAwareReport() {
        console.log('\n🌍 GEO-AWARE LOGO SCRAPING RESULTS');
        console.log('===================================');
        console.log(`Total casinos processed: ${this.casinos.length}`);
        console.log(`Logos found: ${this.results.length}`);
        console.log(`Success rate: ${((this.results.length / this.casinos.length) * 100).toFixed(1)}%`);

        // Group by country
        const byCountry = {};
        this.results.forEach(result => {
            if (!byCountry[result.country]) byCountry[result.country] = [];
            byCountry[result.country].push(result);
        });

        console.log('\n📊 Results by Country:');
        Object.entries(byCountry).forEach(([country, results]) => {
            console.log(`  ${country}: ${results.length} logos`);
        });

        // Quality distribution
        const byQuality = {};
        this.results.forEach(result => {
            byQuality[result.quality] = (byQuality[result.quality] || 0) + 1;
        });

        console.log('\n🏆 Quality Distribution:');
        Object.entries(byQuality).forEach(([quality, count]) => {
            console.log(`  ${quality}: ${count} logos`);
        });

        // Save results
        fs.writeFileSync('data/geo-aware-logo-results.json', JSON.stringify(this.results, null, 2));
        
        // Update complete mapping with new findings
        const updatedMapping = [...this.existingLogos];
        
        this.results.forEach(result => {
            const existingIndex = updatedMapping.findIndex(logo => logo.casino === result.casino);
            
            if (existingIndex !== -1) {
                // Check if this is an improvement
                const existing = updatedMapping[existingIndex];
                const qualityRank = { 'high': 3, 'medium': 2, 'basic': 1 };
                
                if ((qualityRank[result.quality] || 1) > (qualityRank[existing.quality] || 1)) {
                    updatedMapping[existingIndex] = {
                        ...existing,
                        logoUrl: result.logoUrl,
                        quality: result.quality,
                        source: result.source,
                        geoAware: true
                    };
                    console.log(`🔄 Updated ${result.casino}: ${existing.quality} → ${result.quality}`);
                }
            } else {
                // New logo
                updatedMapping.push({
                    casino: result.casino,
                    logoUrl: result.logoUrl,
                    quality: result.quality,
                    source: result.source,
                    geoAware: true
                });
                console.log(`➕ New ${result.casino}: ${result.quality} quality`);
            }
        });

        fs.writeFileSync('data/complete-logo-mapping-geo-aware.json', JSON.stringify(updatedMapping, null, 2));
        
        console.log('\n✅ Geo-aware results saved!');
        console.log('📁 Results: data/geo-aware-logo-results.json');
        console.log('📁 Updated mapping: data/complete-logo-mapping-geo-aware.json');
    }
}

// Run the geo-aware scraper
async function runGeoAwareScraper() {
    const scraper = new GeoAwareLogoScraper();
    await scraper.scrapeWithGeoAwareness();
}

runGeoAwareScraper().catch(console.error);