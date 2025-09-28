/**
 * Casino Logo Acquisition System
 * 
 * This script legally acquires casino logos using multiple approaches:
 * 1. Official casino websites (public domain/fair use)
 * 2. Logo optimization and processing
 * 3. Multiple format generation (PNG, WebP, AVIF)
 * 4. Responsive image generation
 * 
 * Based on Context7 research for legal logo scraping
 */

const { PlaywrightCrawler, ProxyConfiguration } = require('crawlee');
const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

class CasinoLogoAcquisition {
    constructor() {
        this.outputDir = path.join(__dirname, '..', 'public', 'images', 'casinos');
        this.logoSizes = [400, 800, 1200]; // For responsive images
        this.formats = ['png', 'webp', 'avif'];
        
        this.crawler = new PlaywrightCrawler({
            // Use realistic browser settings to avoid detection
            launchContext: {
                launchOptions: {
                    headless: true,
                    args: [
                        '--no-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-web-security'
                    ]
                }
            },
            requestHandler: this.handleRequest.bind(this),
            failedRequestHandler: this.handleFailedRequest.bind(this),
            maxRequestRetries: 3,
            requestHandlerTimeoutSecs: 60
        });
        
        this.logoStrategies = [
            // Strategy 1: Look for obvious logo selectors
            'img[class*="logo" i]',
            'img[alt*="logo" i]',
            'img[src*="logo" i]',
            '.logo img',
            '[class*="brand"] img',
            'header img',
            '.header img',
            'nav img:first-child',
            
            // Strategy 2: Look for brand/company images
            'img[alt*="brand" i]',
            'img[class*="brand" i]',
            'img[src*="brand" i]',
            
            // Strategy 3: Look for typical header/navigation logos
            'header img:first-child',
            '.navbar img:first-child',
            '.navigation img:first-child',
            
            // Strategy 4: SVG logos
            'svg[class*="logo" i]',
            'svg[aria-label*="logo" i]'
        ];
    }

    async initialize() {
        // Ensure output directories exist
        await fs.mkdir(this.outputDir, { recursive: true });
        console.log(`📁 Created output directory: ${this.outputDir}`);
    }

    async handleRequest({ page, request, log }) {
        const casino = request.userData.casino;
        log.info(`🎰 Processing ${casino.brand} - ${request.url}`);

        try {
            // Wait for page to load completely
            await page.waitForLoadState('networkidle');
            await page.waitForTimeout(2000);

            // Try multiple logo acquisition strategies
            const logoData = await this.findLogoWithStrategies(page, casino, log);
            
            if (logoData) {
                await this.processAndSaveLogo(logoData, casino, log);
                log.info(`✅ Successfully acquired logo for ${casino.brand}`);
            } else {
                log.warn(`❌ No logo found for ${casino.brand}`);
                await this.createFallbackLogo(casino, log);
            }

        } catch (error) {
            log.error(`Error processing ${casino.brand}: ${error.message}`);
            await this.createFallbackLogo(casino, log);
        }
    }

    async findLogoWithStrategies(page, casino, log) {
        // Strategy 1: Try CSS selectors for logo images
        for (const selector of this.logoStrategies) {
            try {
                const elements = await page.locator(selector);
                const count = await elements.count();
                
                if (count > 0) {
                    const element = elements.first();
                    const tagName = await element.evaluate(el => el.tagName);
                    
                    if (tagName === 'IMG') {
                        const src = await element.getAttribute('src');
                        const alt = await element.getAttribute('alt');
                        
                        if (src) {
                            // Convert relative URLs to absolute
                            const absoluteUrl = new URL(src, page.url()).href;
                            log.info(`🎯 Found image logo: ${absoluteUrl}`);
                            
                            // Download the image
                            const imageBuffer = await this.downloadImage(page, absoluteUrl);
                            if (imageBuffer && imageBuffer.length > 1000) { // Ensure it's not a tiny image
                                return {
                                    buffer: imageBuffer,
                                    url: absoluteUrl,
                                    alt: alt || casino.brand
                                };
                            }
                        }
                    } else if (tagName === 'SVG') {
                        log.info(`🎯 Found SVG logo`);
                        const svgContent = await element.innerHTML();
                        const svgBuffer = await this.convertSvgToImage(svgContent, casino);
                        
                        if (svgBuffer) {
                            return {
                                buffer: svgBuffer,
                                url: 'svg-generated',
                                alt: casino.brand
                            };
                        }
                    }
                }
            } catch (error) {
                // Continue to next strategy
                continue;
            }
        }

        // Strategy 2: Screenshot approach - take a screenshot of the header area
        log.info(`📸 Attempting screenshot approach for ${casino.brand}`);
        try {
            const headerElement = await page.locator('header, .header, nav, .nav, .navbar').first();
            if (await headerElement.isVisible()) {
                const screenshot = await headerElement.screenshot({ type: 'png' });
                return {
                    buffer: screenshot,
                    url: 'screenshot-generated',
                    alt: casino.brand
                };
            }
        } catch (error) {
            log.warn(`Screenshot approach failed: ${error.message}`);
        }

        return null;
    }

    async downloadImage(page, imageUrl) {
        try {
            const response = await page.evaluate(async (url) => {
                const response = await fetch(url);
                if (!response.ok) return null;
                
                const arrayBuffer = await response.arrayBuffer();
                return Array.from(new Uint8Array(arrayBuffer));
            }, imageUrl);

            return response ? Buffer.from(response) : null;
        } catch (error) {
            console.error(`Failed to download image ${imageUrl}: ${error.message}`);
            return null;
        }
    }

    async convertSvgToImage(svgContent, casino) {
        try {
            // Create a complete SVG document
            const fullSvg = svgContent.startsWith('<svg') 
                ? svgContent 
                : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">${svgContent}</svg>`;

            const buffer = await sharp(Buffer.from(fullSvg))
                .png()
                .resize(400, 120, { 
                    fit: 'contain', 
                    background: { r: 255, g: 255, b: 255, alpha: 0 }
                })
                .toBuffer();

            return buffer;
        } catch (error) {
            console.error(`Failed to convert SVG for ${casino.brand}: ${error.message}`);
            return null;
        }
    }

    async processAndSaveLogo(logoData, casino, log) {
        try {
            // Get image metadata
            const metadata = await sharp(logoData.buffer).metadata();
            log.info(`📊 Image metadata - Format: ${metadata.format}, Size: ${metadata.width}x${metadata.height}`);

            // Generate responsive images in multiple formats
            for (const size of this.logoSizes) {
                for (const format of this.formats) {
                    const outputPath = path.join(
                        this.outputDir, 
                        `${casino.slug}-${size}w.${format}`
                    );

                    let sharpInstance = sharp(logoData.buffer)
                        .resize(size, null, { 
                            fit: 'contain',
                            background: { r: 255, g: 255, b: 255, alpha: 0 },
                            withoutEnlargement: true
                        });

                    // Apply format-specific optimizations
                    switch (format) {
                        case 'png':
                            sharpInstance = sharpInstance.png({ 
                                compressionLevel: 9,
                                palette: true,
                                effort: 8
                            });
                            break;
                        case 'webp':
                            sharpInstance = sharpInstance.webp({ 
                                quality: 85,
                                effort: 6,
                                lossless: false
                            });
                            break;
                        case 'avif':
                            sharpInstance = sharpInstance.avif({ 
                                quality: 80,
                                effort: 6
                            });
                            break;
                    }

                    await sharpInstance.toFile(outputPath);
                    log.info(`💾 Saved: ${outputPath}`);
                }
            }

            // Create the main PNG file (backwards compatibility)
            const mainPath = path.join(this.outputDir, `${casino.slug}.png`);
            await sharp(logoData.buffer)
                .resize(400, null, { 
                    fit: 'contain',
                    background: { r: 255, g: 255, b: 255, alpha: 0 },
                    withoutEnlargement: true
                })
                .png({ compressionLevel: 9, palette: true, effort: 8 })
                .toFile(mainPath);
            
            log.info(`✅ Main logo saved: ${mainPath}`);

        } catch (error) {
            log.error(`Failed to process logo for ${casino.brand}: ${error.message}`);
            throw error;
        }
    }

    async createFallbackLogo(casino, log) {
        try {
            log.info(`🎨 Creating fallback logo for ${casino.brand}`);
            
            // Create a simple text-based logo
            const svg = `
                <svg width="400" height="120" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
                            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
                        </linearGradient>
                    </defs>
                    <rect width="400" height="120" fill="url(#grad1)" rx="8" ry="8"/>
                    <text x="200" y="70" text-anchor="middle" fill="white" 
                          font-family="Arial, sans-serif" font-size="24" font-weight="bold">
                        ${casino.brand}
                    </text>
                </svg>
            `;

            const logoBuffer = await sharp(Buffer.from(svg))
                .png({ palette: true, effort: 8 })
                .toBuffer();

            await this.processAndSaveLogo({ 
                buffer: logoBuffer, 
                url: 'fallback-generated',
                alt: casino.brand 
            }, casino, log);

        } catch (error) {
            log.error(`Failed to create fallback logo for ${casino.brand}: ${error.message}`);
        }
    }

    async handleFailedRequest({ request, error, log }) {
        const casino = request.userData.casino;
        log.error(`❌ Failed to process ${casino.brand}: ${error.message}`);
        
        // Create fallback logo for failed requests
        await this.createFallbackLogo(casino, { 
            info: console.log, 
            warn: console.warn, 
            error: console.error 
        });
    }

    async acquireAllLogos() {
        // Load casino data
        const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
        const casinos = JSON.parse(await fs.readFile(casinosPath, 'utf8'));
        
        console.log(`🚀 Starting logo acquisition for ${casinos.length} casinos`);
        
        // Prepare requests
        const requests = casinos.map(casino => ({
            url: casino.url || `https://${casino.slug}.com`, // Fallback URL
            userData: { casino }
        }));

        // Run the crawler
        await this.crawler.run(requests);
        
        console.log(`✅ Logo acquisition completed!`);
        console.log(`📁 Check logos in: ${this.outputDir}`);
    }

    // Utility method to check existing logos
    async checkExistingLogos() {
        try {
            const files = await fs.readdir(this.outputDir);
            const mainLogos = files.filter(f => f.endsWith('.png') && !f.includes('-'));
            
            console.log(`📊 Existing logos: ${mainLogos.length}`);
            console.log(`📁 Directory: ${this.outputDir}`);
            
            return mainLogos.map(f => f.replace('.png', ''));
        } catch (error) {
            console.log(`📁 No existing logos directory`);
            return [];
        }
    }
}

// Main execution
async function main() {
    console.log('🎰 Casino Logo Acquisition System v2.0');
    console.log('=====================================');
    
    const logoAcquisition = new CasinoLogoAcquisition();
    
    try {
        await logoAcquisition.initialize();
        
        // Check what we already have
        const existing = await logoAcquisition.checkExistingLogos();
        console.log(`📊 Found ${existing.length} existing logos`);
        
        // Acquire all logos
        await logoAcquisition.acquireAllLogos();
        
    } catch (error) {
        console.error('❌ Error in logo acquisition:', error);
        process.exit(1);
    }
}

// Export for use in other scripts
module.exports = { CasinoLogoAcquisition };

// Run if called directly
if (require.main === module) {
    main();
}