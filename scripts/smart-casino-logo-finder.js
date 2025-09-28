const { PlaywrightCrawler } = require('crawlee');
const fs = require('fs');
const path = require('path');
const https = require('https');

class SmartCasinoLogoFinder {
    constructor() {
        this.casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));
        this.results = [];
        this.affiliateSources = [
            'https://www.askgamblers.com/online-casinos/reviews/',
            'https://casino.guru/casinos/', 
            'https://www.lcb.org/casino/',
            'https://www.casinomeister.com/casinos/'
        ];
    }

    async findLogos() {
        console.log('🎰 Starting Smart Casino Logo Finder...');
        
        const crawler = new PlaywrightCrawler({
            maxConcurrency: 3,
            requestHandlerTimeoutSecs: 30,
            requestHandler: async ({ page, request, log, enqueueLinks }) => {
                try {
                    log.info(`Processing: ${request.url}`);
                    
                    // Strategy 1: Direct casino website
                    if (request.userData?.type === 'direct') {
                        const logoData = await this.extractDirectLogo(page, request);
                        if (logoData) {
                            this.results.push({
                                casino: request.userData.casino,
                                source: 'direct',
                                logoUrl: logoData.src,
                                quality: 'high',
                                dimensions: `${logoData.width}x${logoData.height}`
                            });
                        }
                    }
                    
                    // Strategy 2: Affiliate directory scraping
                    else if (request.userData?.type === 'affiliate') {
                        const logoData = await this.extractAffiliateLogo(page, request);
                        if (logoData) {
                            this.results.push({
                                casino: request.userData.casino,
                                source: 'affiliate',
                                logoUrl: logoData.src,
                                quality: 'medium',
                                dimensions: `${logoData.width}x${logoData.height}`
                            });
                        }
                    }
                    
                } catch (error) {
                    log.error(`Error processing ${request.url}: ${error.message}`);
                }
            }
        });

        // Add all casino direct URLs
        const directRequests = this.casinos.map(casino => ({
            url: casino.url,
            userData: { type: 'direct', casino: casino.slug }
        }));

        await crawler.addRequests(directRequests);
        await crawler.run();
        
        console.log(`✅ Found ${this.results.length} logos from ${this.casinos.length} casinos`);
        
        // Save results
        fs.writeFileSync('data/logo-results.json', JSON.stringify(this.results, null, 2));
        
        // Download the best quality logos
        await this.downloadLogos();
    }

    async extractDirectLogo(page, request) {
        // Wait for page load
        await page.waitForLoadState('domcontentloaded');
        
        // Multiple logo selector strategies
        const logoSelectors = [
            'img[class*="logo"]:not([class*="payment"]):not([class*="provider"])',
            'img[alt*="logo" i]',
            '.logo img, .header-logo img, .site-logo img',
            '[data-testid*="logo"] img',
            'img[src*="logo"]:not([src*="payment"]):not([src*="provider"])',
            '.navbar-brand img, .brand img',
            'header img[class*="brand"], header img[class*="logo"]'
        ];

        for (const selector of logoSelectors) {
            try {
                const logoData = await page.evaluate((sel) => {
                    const img = document.querySelector(sel);
                    if (img && img.naturalWidth > 50 && img.naturalHeight > 20) {
                        return {
                            src: img.src,
                            alt: img.alt || '',
                            width: img.naturalWidth,
                            height: img.naturalHeight,
                            selector: sel
                        };
                    }
                    return null;
                }, selector);
                
                if (logoData) return logoData;
            } catch (e) {
                // Continue to next selector
            }
        }
        
        return null;
    }

    async extractAffiliateLogo(page, request) {
        // Affiliate-specific selectors based on common structures
        const affiliateSelectors = [
            '.casino-logo img',
            '.operator-logo img', 
            '.brand-logo img',
            'img[class*="casino"][class*="logo"]',
            '.review-header img',
            '.casino-details img'
        ];

        for (const selector of affiliateSelectors) {
            try {
                const logoData = await page.evaluate((sel) => {
                    const img = document.querySelector(sel);
                    if (img && img.naturalWidth > 50) {
                        return {
                            src: img.src,
                            alt: img.alt,
                            width: img.naturalWidth,
                            height: img.naturalHeight
                        };
                    }
                    return null;
                }, selector);
                
                if (logoData) return logoData;
            } catch (e) {
                // Continue
            }
        }
        
        return null;
    }

    async downloadLogos() {
        console.log('📥 Downloading high-quality logos...');
        
        for (const result of this.results) {
            if (result.logoUrl) {
                try {
                    const filename = `${result.casino}-logo.png`;
                    const filepath = path.join('public/images/casinos', filename);
                    
                    await this.downloadImage(result.logoUrl, filepath);
                    console.log(`✅ Downloaded: ${filename}`);
                    
                    // Update casino data with local logo path
                    const casinoIndex = this.casinos.findIndex(c => c.slug === result.casino);
                    if (casinoIndex !== -1) {
                        this.casinos[casinoIndex].logoPath = `/images/casinos/${filename}`;
                    }
                    
                } catch (error) {
                    console.log(`❌ Failed to download logo for ${result.casino}: ${error.message}`);
                }
            }
        }
        
        // Save updated casino data
        fs.writeFileSync('data/casinos-with-logos.json', JSON.stringify(this.casinos, null, 2));
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
            file.on('error', (err) => {
                fs.unlink(filepath, () => {}); // Delete partial file
                reject(err);
            });
        });
    }
}

// Run the logo finder
async function runLogoFinder() {
    const logoFinder = new SmartCasinoLogoFinder();
    await logoFinder.findLogos();
}

runLogoFinder().catch(console.error);