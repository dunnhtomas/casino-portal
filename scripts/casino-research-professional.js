/**
 * Professional Casino Website Research Tool
 * Using Context7 Best Practices with Playwright
 * Implements enterprise-grade web analysis patterns
 */

const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class CasinoWebsiteAnalyzer {
  constructor() {
    this.browser = null;
    this.context = null;
    this.results = {
      timestamp: new Date().toISOString(),
      sites: {},
      designPatterns: {},
      recommendations: {}
    };
  }

  async initialize() {
    console.log('🎰 Initializing Professional Casino Research Tool');
    
    this.browser = await chromium.launch({ 
      headless: false,
      args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'],
      timeout: 60000
    });
    
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      timeout: 60000,
      ignoreHTTPSErrors: true,
      extraHTTPHeaders: {
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    // Ensure research directory exists
    await fs.mkdir('research', { recursive: true });
  }

  /**
   * Advanced site analysis using Context7 best practices
   */
  async analyzeSite(url, siteName) {
    console.log(`\n🔍 Analyzing ${siteName}: ${url}`);
    const page = await this.context.newPage();
    
    try {
      // Navigate with proper error handling
      await page.goto(url, { 
        waitUntil: 'domcontentloaded', 
        timeout: 30000 
      });
      
      // Wait for dynamic content
      await page.waitForTimeout(3000);
      
      // 1. Visual Screenshot Analysis
      await this.captureVisualAssets(page, siteName);
      
      // 2. Structural Analysis
      const structure = await this.analyzePageStructure(page);
      
      // 3. Design System Analysis
      const designSystem = await this.extractDesignSystem(page);
      
      // 4. Component Pattern Analysis
      const components = await this.analyzeComponentPatterns(page);
      
      // 5. Performance & Technical Analysis
      const technical = await this.analyzeTechnicalImplementation(page);
      
      // 6. Casino-Specific Features
      const casinoFeatures = await this.analyzeCasinoSpecificFeatures(page);

      this.results.sites[siteName] = {
        url,
        timestamp: new Date().toISOString(),
        structure,
        designSystem,
        components,
        technical,
        casinoFeatures,
        status: 'success'
      };

      console.log(`✅ Successfully analyzed ${siteName}`);
      
    } catch (error) {
      console.error(`❌ Error analyzing ${siteName}:`, error.message);
      this.results.sites[siteName] = {
        url,
        error: error.message,
        timestamp: new Date().toISOString(),
        status: 'error'
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Capture visual assets for design analysis
   */
  async captureVisualAssets(page, siteName) {
    const safeFileName = siteName.replace(/[^a-z0-9]/gi, '_');
    
    // Full page screenshot
    try {
      await page.screenshot({ 
        path: `research/${safeFileName}_fullpage.png`, 
        fullPage: true,
        timeout: 30000
      });
      console.log(`📸 Full page screenshot saved for ${siteName}`);
    } catch (error) {
      console.log(`⚠️  Screenshot failed for ${siteName}: ${error.message}`);
    }
    
    // Header screenshot
    try {
      const header = page.locator('header, .header, nav, .navbar').first();
      if (await header.isVisible()) {
        await header.screenshot({ 
          path: `research/${safeFileName}_header.png`,
          timeout: 15000
        });
      }
    } catch (error) {
      console.log(`⚠️  Header screenshot failed: ${error.message}`);
    }
    
    // Casino cards screenshot
    try {
      const casinoCard = page.locator('[class*="casino"], [class*="operator"], .card').first();
      if (await casinoCard.isVisible()) {
        await casinoCard.screenshot({ 
          path: `research/${safeFileName}_casino_card.png`,
          timeout: 15000
        });
      }
    } catch (error) {
      console.log(`⚠️  Casino card screenshot failed: ${error.message}`);
    }
  }

  /**
   * Analyze page structure and layout patterns
   */
  async analyzePageStructure(page) {
    return await page.evaluate(() => {
      const structure = {
        pageTitle: document.title,
        metaDescription: document.querySelector('meta[name="description"]')?.content || '',
        viewport: document.querySelector('meta[name="viewport"]')?.content || ''
      };

      // Header analysis
      const header = document.querySelector('header, .header, nav, .navbar');
      if (header) {
        structure.header = {
          tagName: header.tagName.toLowerCase(),
          height: header.offsetHeight,
          position: window.getComputedStyle(header).position,
          zIndex: window.getComputedStyle(header).zIndex,
          hasLogo: !!header.querySelector('img[alt*="logo"], .logo, .brand'),
          navigationItems: header.querySelectorAll('a, .nav-item').length,
          hasSearch: !!header.querySelector('input[type="search"], .search'),
          hasMobileMenu: !!header.querySelector('.hamburger, .menu-toggle, .mobile-menu')
        };
      }

      // Main content structure
      const main = document.querySelector('main, .main, #main') || document.body;
      structure.layout = {
        containerType: main.tagName.toLowerCase(),
        hasHero: !!main.querySelector('.hero, .banner, .jumbotron, [class*="hero"]'),
        hasSidebar: !!main.querySelector('.sidebar, aside, [role="complementary"]'),
        sectionsCount: main.querySelectorAll('section').length,
        gridLayout: window.getComputedStyle(main).display,
        maxWidth: window.getComputedStyle(main).maxWidth
      };

      // Footer analysis
      const footer = document.querySelector('footer, .footer');
      if (footer) {
        structure.footer = {
          height: footer.offsetHeight,
          columnsCount: footer.querySelectorAll('.col, .column, .footer-col').length,
          linksCount: footer.querySelectorAll('a').length,
          hasNewsletter: !!footer.querySelector('input[type="email"], .newsletter')
        };
      }

      return structure;
    });
  }

  /**
   * Extract design system tokens and patterns
   */
  async extractDesignSystem(page) {
    return await page.evaluate(() => {
      const designSystem = {
        colors: { primary: [], secondary: [], accent: [], background: [], text: [] },
        typography: { headings: {}, body: {}, fontFamilies: [] },
        spacing: { padding: [], margin: [] },
        borders: { radius: [], width: [] },
        shadows: []
      };

      // Color extraction from key elements
      const keyElements = [
        ...document.querySelectorAll('button, .btn'),
        ...document.querySelectorAll('.card, [class*="card"]'),
        ...document.querySelectorAll('header, .header'),
        ...document.querySelectorAll('.hero, .banner'),
        ...document.querySelectorAll('a[class*="primary"], .cta')
      ];

      keyElements.forEach(el => {
        const styles = window.getComputedStyle(el);
        const bgColor = styles.backgroundColor;
        const textColor = styles.color;
        const borderColor = styles.borderColor;
        
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)') {
          designSystem.colors.primary.push(bgColor);
        }
        if (textColor && textColor !== 'rgba(0, 0, 0, 0)') {
          designSystem.colors.text.push(textColor);
        }
        if (borderColor && borderColor !== 'rgba(0, 0, 0, 0)') {
          designSystem.colors.accent.push(borderColor);
        }
      });

      // Typography analysis
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        const element = document.querySelector(tag);
        if (element) {
          const styles = window.getComputedStyle(element);
          designSystem.typography.headings[tag] = {
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            fontFamily: styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim(),
            letterSpacing: styles.letterSpacing,
            textTransform: styles.textTransform
          };
          
          const fontFamily = styles.fontFamily.split(',')[0].replace(/['"]/g, '').trim();
          if (!designSystem.typography.fontFamilies.includes(fontFamily)) {
            designSystem.typography.fontFamilies.push(fontFamily);
          }
        }
      });

      // Body typography
      const bodyStyles = window.getComputedStyle(document.body);
      designSystem.typography.body = {
        fontSize: bodyStyles.fontSize,
        fontWeight: bodyStyles.fontWeight,
        lineHeight: bodyStyles.lineHeight,
        fontFamily: bodyStyles.fontFamily.split(',')[0].replace(/['"]/g, '').trim()
      };

      // Spacing analysis from buttons and cards
      [...document.querySelectorAll('button, .btn, .card')].forEach(el => {
        const styles = window.getComputedStyle(el);
        designSystem.spacing.padding.push(styles.padding);
        designSystem.spacing.margin.push(styles.margin);
        designSystem.borders.radius.push(styles.borderRadius);
        if (styles.boxShadow !== 'none') {
          designSystem.shadows.push(styles.boxShadow);
        }
      });

      // Remove duplicates and empty values
      Object.keys(designSystem.colors).forEach(key => {
        designSystem.colors[key] = [...new Set(designSystem.colors[key])].slice(0, 5);
      });
      
      designSystem.spacing.padding = [...new Set(designSystem.spacing.padding)].slice(0, 10);
      designSystem.spacing.margin = [...new Set(designSystem.spacing.margin)].slice(0, 10);
      designSystem.borders.radius = [...new Set(designSystem.borders.radius)].slice(0, 10);
      designSystem.shadows = [...new Set(designSystem.shadows)].slice(0, 5);

      return designSystem;
    });
  }

  /**
   * Analyze component patterns and UI elements
   */
  async analyzeComponentPatterns(page) {
    return await page.evaluate(() => {
      const components = {};

      // Button analysis
      const buttons = document.querySelectorAll('button, .btn, [role="button"], .cta');
      if (buttons.length > 0) {
        components.buttons = {
          total: buttons.length,
          variants: []
        };

        // Analyze first 5 unique button styles
        const buttonStyles = new Map();
        Array.from(buttons).slice(0, 10).forEach(btn => {
          const styles = window.getComputedStyle(btn);
          const key = `${styles.backgroundColor}-${styles.color}-${styles.borderRadius}`;
          
          if (!buttonStyles.has(key) && buttonStyles.size < 5) {
            buttonStyles.set(key, {
              text: btn.textContent?.trim().substring(0, 30) || '',
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              borderRadius: styles.borderRadius,
              padding: styles.padding,
              fontSize: styles.fontSize,
              fontWeight: styles.fontWeight,
              border: styles.border,
              className: btn.className
            });
          }
        });
        
        components.buttons.variants = Array.from(buttonStyles.values());
      }

      // Card component analysis
      const cards = document.querySelectorAll('.card, [class*="card"], .panel, .box');
      if (cards.length > 0) {
        const sampleCard = cards[0];
        const cardStyles = window.getComputedStyle(sampleCard);
        components.cards = {
          total: cards.length,
          commonStyles: {
            backgroundColor: cardStyles.backgroundColor,
            borderRadius: cardStyles.borderRadius,
            boxShadow: cardStyles.boxShadow,
            padding: cardStyles.padding,
            border: cardStyles.border
          },
          hasImages: Array.from(cards).filter(card => card.querySelector('img')).length,
          hasButtons: Array.from(cards).filter(card => card.querySelector('button, .btn')).length
        };
      }

      // Navigation components
      const navigation = document.querySelector('nav, .nav, .navigation');
      if (navigation) {
        const navLinks = navigation.querySelectorAll('a');
        components.navigation = {
          type: navigation.tagName.toLowerCase(),
          itemsCount: navLinks.length,
          hasDropdowns: !!navigation.querySelector('.dropdown, .submenu, ul ul'),
          isHorizontal: window.getComputedStyle(navigation).flexDirection !== 'column',
          linkStyles: navLinks.length > 0 ? {
            color: window.getComputedStyle(navLinks[0]).color,
            fontSize: window.getComputedStyle(navLinks[0]).fontSize,
            fontWeight: window.getComputedStyle(navLinks[0]).fontWeight,
            textDecoration: window.getComputedStyle(navLinks[0]).textDecoration
          } : {}
        };
      }

      return components;
    });
  }

  /**
   * Analyze technical implementation details
   */
  async analyzeTechnicalImplementation(page) {
    return await page.evaluate(() => {
      const technical = {
        framework: 'unknown',
        cssFramework: 'unknown',
        performance: {},
        accessibility: {},
        seo: {}
      };

      // Framework detection
      if (window.React) technical.framework = 'React';
      else if (window.Vue) technical.framework = 'Vue.js';
      else if (window.angular) technical.framework = 'Angular';
      else if (document.querySelector('[data-astro]')) technical.framework = 'Astro';
      else if (document.querySelector('script[src*="next"]')) technical.framework = 'Next.js';

      // CSS Framework detection
      if (document.querySelector('.container, .row, .col')) technical.cssFramework = 'Bootstrap';
      else if (document.querySelector('[class*="px-"], [class*="py-"], [class*="mt-"]')) technical.cssFramework = 'Tailwind CSS';
      else if (document.querySelector('.mdl-')) technical.cssFramework = 'Material Design Lite';

      // Performance metrics
      technical.performance = {
        totalImages: document.querySelectorAll('img').length,
        lazyImages: document.querySelectorAll('img[loading="lazy"], img[data-src]').length,
        inlineStyles: document.querySelectorAll('[style]').length,
        externalStylesheets: document.querySelectorAll('link[rel="stylesheet"]').length,
        externalScripts: document.querySelectorAll('script[src]').length
      };

      // Accessibility analysis
      technical.accessibility = {
        altTextMissing: Array.from(document.querySelectorAll('img')).filter(img => !img.alt).length,
        ariaLabels: document.querySelectorAll('[aria-label]').length,
        headingStructure: {
          h1: document.querySelectorAll('h1').length,
          h2: document.querySelectorAll('h2').length,
          h3: document.querySelectorAll('h3').length,
          h4: document.querySelectorAll('h4').length,
          h5: document.querySelectorAll('h5').length,
          h6: document.querySelectorAll('h6').length
        },
        landmarks: {
          nav: document.querySelectorAll('nav, [role="navigation"]').length,
          main: document.querySelectorAll('main, [role="main"]').length,
          header: document.querySelectorAll('header, [role="banner"]').length,
          footer: document.querySelectorAll('footer, [role="contentinfo"]').length
        }
      };

      // SEO analysis
      const metaTags = Array.from(document.querySelectorAll('meta')).reduce((acc, meta) => {
        const name = meta.name || meta.property;
        if (name) acc[name] = meta.content;
        return acc;
      }, {});

      technical.seo = {
        title: document.title,
        metaDescription: metaTags['description'] || '',
        ogTitle: metaTags['og:title'] || '',
        ogDescription: metaTags['og:description'] || '',
        canonicalUrl: document.querySelector('link[rel="canonical"]')?.href || '',
        structuredData: document.querySelectorAll('script[type="application/ld+json"]').length,
        headingHierarchy: Array.from(document.querySelectorAll('h1,h2,h3,h4,h5,h6')).map(h => ({
          level: h.tagName,
          text: h.textContent?.trim().substring(0, 50) || ''
        })).slice(0, 10)
      };

      return technical;
    });
  }

  /**
   * Analyze casino-specific features and patterns
   */
  async analyzeCasinoSpecificFeatures(page) {
    return await page.evaluate(() => {
      const casino = {
        listings: {},
        ratings: {},
        bonuses: {},
        filters: {},
        cta: {}
      };

      // Casino listing analysis
      const casinoElements = document.querySelectorAll(
        '[class*="casino"], [class*="operator"], [class*="review"], .listing'
      );
      
      if (casinoElements.length > 0) {
        casino.listings = {
          total: casinoElements.length,
          layout: 'grid', // or 'list'
          hasLogos: Array.from(casinoElements).filter(el => el.querySelector('img')).length,
          hasRatings: Array.from(casinoElements).filter(el => 
            el.querySelector('[class*="rating"], [class*="star"], .score')).length,
          hasBonuses: Array.from(casinoElements).filter(el => 
            el.querySelector('[class*="bonus"], [class*="offer"]')).length
        };

        // Analyze first casino card structure
        if (casinoElements.length > 0) {
          const firstCard = casinoElements[0];
          casino.listings.cardStructure = {
            hasLogo: !!firstCard.querySelector('img'),
            hasTitle: !!firstCard.querySelector('h1,h2,h3,h4,h5,h6'),
            hasRating: !!firstCard.querySelector('[class*="rating"], [class*="star"]'),
            hasBonus: !!firstCard.querySelector('[class*="bonus"], [class*="offer"]'),
            hasButton: !!firstCard.querySelector('button, .btn, .cta'),
            hasFeatures: !!firstCard.querySelector('.features, .highlights, ul, ol')
          };
        }
      }

      // Rating system analysis
      const ratingElements = document.querySelectorAll(
        '[class*="rating"], [class*="star"], .score, [class*="grade"]'
      );
      
      if (ratingElements.length > 0) {
        casino.ratings = {
          total: ratingElements.length,
          types: []
        };

        // Identify rating types
        ratingElements.forEach(el => {
          if (el.textContent?.match(/\d+(\.\d+)?\/\d+/)) {
            casino.ratings.types.push('fractional');
          } else if (el.textContent?.match(/\d+(\.\d+)?%/)) {
            casino.ratings.types.push('percentage');
          } else if (el.querySelector('*[class*="star"]') || el.textContent?.includes('★')) {
            casino.ratings.types.push('stars');
          } else if (el.textContent?.match(/\d+(\.\d+)?$/)) {
            casino.ratings.types.push('numeric');
          }
        });

        casino.ratings.types = [...new Set(casino.ratings.types)];
      }

      // Bonus/offer analysis
      const bonusElements = document.querySelectorAll(
        '[class*="bonus"], [class*="offer"], [class*="promo"], [class*="welcome"]'
      );
      
      casino.bonuses = {
        total: bonusElements.length,
        hasWelcomeBonus: Array.from(bonusElements).some(el => 
          el.textContent?.toLowerCase().includes('welcome')),
        hasNoDeposit: Array.from(bonusElements).some(el => 
          el.textContent?.toLowerCase().includes('no deposit')),
        hasFreeSpins: Array.from(bonusElements).some(el => 
          el.textContent?.toLowerCase().includes('free spin'))
      };

      // Filter/sort analysis
      const filterElements = document.querySelectorAll(
        '[class*="filter"], [class*="sort"], .dropdown, select'
      );
      
      casino.filters = {
        total: filterElements.length,
        hasCategories: !!document.querySelector('[class*="category"], [class*="type"]'),
        hasProviders: !!document.querySelector('[class*="provider"], [class*="software"]'),
        hasPaymentMethods: !!document.querySelector('[class*="payment"], [class*="method"]')
      };

      // Call-to-action analysis
      const ctaElements = document.querySelectorAll(
        '.cta, [class*="play"], [class*="join"], [class*="register"], [class*="signup"]'
      );
      
      casino.cta = {
        total: ctaElements.length,
        primaryActions: Array.from(ctaElements).slice(0, 5).map(cta => ({
          text: cta.textContent?.trim().substring(0, 30) || '',
          className: cta.className,
          backgroundColor: window.getComputedStyle(cta).backgroundColor,
          color: window.getComputedStyle(cta).color
        }))
      };

      return casino;
    });
  }

  /**
   * Generate comprehensive enhancement recommendations
   */
  generateRecommendations() {
    const sites = this.results.sites;
    const recommendations = {
      layout: [],
      components: [],
      designSystem: [],
      casinoSpecific: [],
      technical: []
    };

    // Analyze patterns across sites
    Object.values(sites).forEach(site => {
      if (site.status === 'success') {
        // Layout recommendations
        if (site.structure?.header?.hasMobileMenu) {
          recommendations.layout.push({
            category: 'Mobile Navigation',
            recommendation: 'Implement hamburger menu for mobile responsiveness',
            priority: 'high',
            source: site.url
          });
        }

        // Component recommendations
        if (site.components?.buttons?.variants?.length > 1) {
          recommendations.components.push({
            category: 'Button System',
            recommendation: 'Implement consistent button variant system with primary/secondary styles',
            priority: 'medium',
            source: site.url,
            details: site.components.buttons.variants
          });
        }

        // Casino-specific recommendations
        if (site.casinoFeatures?.ratings?.types?.includes('stars')) {
          recommendations.casinoSpecific.push({
            category: 'Rating Display',
            recommendation: 'Implement star rating system for visual appeal',
            priority: 'high',
            source: site.url
          });
        }

        if (site.casinoFeatures?.bonuses?.hasWelcomeBonus) {
          recommendations.casinoSpecific.push({
            category: 'Bonus Display',
            recommendation: 'Prominently feature welcome bonus information',
            priority: 'high',
            source: site.url
          });
        }
      }
    });

    this.results.recommendations = recommendations;
  }

  /**
   * Save comprehensive research report
   */
  async saveReport() {
    const reportPath = 'research/casino_comprehensive_analysis.json';
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    console.log(`\n📊 Comprehensive research report saved: ${reportPath}`);
    console.log(`📁 Screenshots and assets saved in: research/`);
    
    // Generate summary report
    await this.generateSummaryReport();
  }

  /**
   * Generate human-readable summary report
   */
  async generateSummaryReport() {
    let summary = `# Casino Website Analysis Report
Generated: ${this.results.timestamp}

## Executive Summary
This comprehensive analysis examined leading casino comparison websites to extract design patterns, component structures, and user experience best practices for enhancing our professional casino portal.

## Sites Analyzed
`;

    Object.entries(this.results.sites).forEach(([siteName, data]) => {
      if (data.status === 'success') {
        summary += `
### ${siteName}
- **URL**: ${data.url}
- **Framework**: ${data.technical?.framework || 'Unknown'}
- **CSS Framework**: ${data.technical?.cssFramework || 'Unknown'}
- **Casino Listings**: ${data.casinoFeatures?.listings?.total || 0}
- **Rating System**: ${data.casinoFeatures?.ratings?.types?.join(', ') || 'None detected'}

#### Key Design Elements
- **Primary Colors**: ${data.designSystem?.colors?.primary?.slice(0, 3).join(', ') || 'Not extracted'}
- **Typography**: ${data.designSystem?.typography?.fontFamilies?.join(', ') || 'Standard fonts'}
- **Button Variants**: ${data.components?.buttons?.variants?.length || 0}
- **Card Components**: ${data.components?.cards?.total || 0}

#### Casino-Specific Features
- **Bonus Displays**: ${data.casinoFeatures?.bonuses?.total || 0}
- **Filter Options**: ${data.casinoFeatures?.filters?.total || 0}
- **CTA Elements**: ${data.casinoFeatures?.cta?.total || 0}
`;
      } else {
        summary += `
### ${siteName} ❌
- **Error**: ${data.error}
- **URL**: ${data.url}
`;
      }
    });

    summary += `
## Enhancement Recommendations

### High Priority
`;
    this.results.recommendations?.casinoSpecific?.filter(r => r.priority === 'high').forEach(rec => {
      summary += `- **${rec.category}**: ${rec.recommendation}\n`;
    });

    summary += `
### Component Improvements
`;
    this.results.recommendations?.components?.forEach(rec => {
      summary += `- **${rec.category}**: ${rec.recommendation}\n`;
    });

    await fs.writeFile('research/CASINO_ANALYSIS_SUMMARY.md', summary);
    console.log('📋 Summary report saved: research/CASINO_ANALYSIS_SUMMARY.md');
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const analyzer = new CasinoWebsiteAnalyzer();
  
  try {
    await analyzer.initialize();
    
    // Analyze target websites
    const sites = [
      { url: 'https://casino.ca', name: 'casino.ca' },
      { url: 'https://casino.guru', name: 'casino.guru' }
    ];
    
    for (const site of sites) {
      await analyzer.analyzeSite(site.url, site.name);
      // Wait between analyses to be respectful
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    analyzer.generateRecommendations();
    await analyzer.saveReport();
    
    console.log('\n🎉 Professional casino website analysis completed!');
    console.log('📁 Check the research/ folder for comprehensive results');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error);
  } finally {
    await analyzer.close();
  }
}

if (require.main === module) {
  main();
}

module.exports = { CasinoWebsiteAnalyzer };