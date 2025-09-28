const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

/**
 * Comprehensive Casino Website Research Script
 * Analyzes casino.ca and casino.guru for design patterns, components, and UX elements
 */
class CasinoResearcher {
  constructor() {
    this.results = {
      'casino.ca': {},
      'casino.guru': {}
    };
  }

  async init() {
    this.browser = await chromium.launch({ headless: false });
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
  }

  async researchSite(url, siteName) {
    console.log(`🔍 Researching ${siteName}: ${url}`);
    const page = await this.context.newPage();
    
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(3000); // Allow dynamic content to load

      // 1. Layout Structure Analysis
      const layoutStructure = await this.analyzeLayoutStructure(page);
      
      // 2. Color Palette Extraction
      const colorPalette = await this.extractColorPalette(page);
      
      // 3. Typography Analysis
      const typography = await this.analyzeTypography(page);
      
      // 4. Component Analysis
      const components = await this.analyzeComponents(page);
      
      // 5. Navigation Patterns
      const navigation = await this.analyzeNavigation(page);
      
      // 6. Casino Listing Analysis
      const casinoListings = await this.analyzeCasinoListings(page);
      
      // 7. Rating Systems
      const ratingSystems = await this.analyzeRatingSystems(page);

      // 8. Visual Elements
      const visualElements = await this.analyzeVisualElements(page);

      // Take screenshots
      await page.screenshot({ 
        path: `research/${siteName.replace('.', '_')}_fullpage.png`, 
        fullPage: true 
      });

      this.results[siteName] = {
        url,
        timestamp: new Date().toISOString(),
        layoutStructure,
        colorPalette,
        typography,
        components,
        navigation,
        casinoListings,
        ratingSystems,
        visualElements
      };

    } catch (error) {
      console.error(`❌ Error researching ${siteName}:`, error.message);
      this.results[siteName] = { error: error.message };
    } finally {
      await page.close();
    }
  }

  async analyzeLayoutStructure(page) {
    return await page.evaluate(() => {
      const structure = {};
      
      // Header analysis
      const header = document.querySelector('header, .header, [role="banner"]');
      if (header) {
        structure.header = {
          height: header.offsetHeight,
          position: window.getComputedStyle(header).position,
          backgroundColor: window.getComputedStyle(header).backgroundColor,
          hasLogo: !!header.querySelector('img, .logo, [alt*="logo"]'),
          hasNavigation: !!header.querySelector('nav, .nav, .menu')
        };
      }

      // Main content analysis
      const main = document.querySelector('main, .main, [role="main"]');
      if (main) {
        structure.main = {
          layout: window.getComputedStyle(main).display,
          maxWidth: window.getComputedStyle(main).maxWidth,
          padding: window.getComputedStyle(main).padding,
          margin: window.getComputedStyle(main).margin
        };
      }

      // Footer analysis
      const footer = document.querySelector('footer, .footer, [role="contentinfo"]');
      if (footer) {
        structure.footer = {
          height: footer.offsetHeight,
          backgroundColor: window.getComputedStyle(footer).backgroundColor,
          hasLinks: footer.querySelectorAll('a').length,
          sections: footer.querySelectorAll('section, .footer-section, .footer-column').length
        };
      }

      // Grid/Layout system detection
      structure.gridSystem = {
        hasCSGrid: !!document.querySelector('[style*="grid"], .grid'),
        hasFlexbox: !!document.querySelector('[style*="flex"], .flex'),
        hasBootstrap: !!document.querySelector('.container, .row, .col'),
        hasTailwind: !!document.querySelector('[class*="px-"], [class*="py-"], [class*="mt-"]')
      };

      return structure;
    });
  }

  async extractColorPalette(page) {
    return await page.evaluate(() => {
      const colors = new Set();
      const elements = document.querySelectorAll('*');
      
      elements.forEach(el => {
        const styles = window.getComputedStyle(el);
        
        // Extract background colors
        if (styles.backgroundColor && styles.backgroundColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(styles.backgroundColor);
        }
        
        // Extract text colors
        if (styles.color && styles.color !== 'rgba(0, 0, 0, 0)') {
          colors.add(styles.color);
        }
        
        // Extract border colors
        if (styles.borderColor && styles.borderColor !== 'rgba(0, 0, 0, 0)') {
          colors.add(styles.borderColor);
        }
      });

      return Array.from(colors).slice(0, 20); // Top 20 most used colors
    });
  }

  async analyzeTypography(page) {
    return await page.evaluate(() => {
      const typography = {
        headings: {},
        body: {},
        fontFamilies: new Set()
      };

      // Analyze headings
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].forEach(tag => {
        const heading = document.querySelector(tag);
        if (heading) {
          const styles = window.getComputedStyle(heading);
          typography.headings[tag] = {
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight,
            lineHeight: styles.lineHeight,
            fontFamily: styles.fontFamily,
            color: styles.color,
            marginTop: styles.marginTop,
            marginBottom: styles.marginBottom
          };
          typography.fontFamilies.add(styles.fontFamily);
        }
      });

      // Analyze body text
      const body = document.body;
      const bodyStyles = window.getComputedStyle(body);
      typography.body = {
        fontSize: bodyStyles.fontSize,
        fontFamily: bodyStyles.fontFamily,
        lineHeight: bodyStyles.lineHeight,
        color: bodyStyles.color
      };

      typography.fontFamilies = Array.from(typography.fontFamilies);
      return typography;
    });
  }

  async analyzeComponents(page) {
    return await page.evaluate(() => {
      const components = {};

      // Button analysis
      const buttons = document.querySelectorAll('button, .btn, [role="button"]');
      if (buttons.length > 0) {
        const sampleButton = buttons[0];
        const styles = window.getComputedStyle(sampleButton);
        components.buttons = {
          count: buttons.length,
          styles: {
            backgroundColor: styles.backgroundColor,
            color: styles.color,
            border: styles.border,
            borderRadius: styles.borderRadius,
            padding: styles.padding,
            fontSize: styles.fontSize,
            fontWeight: styles.fontWeight
          },
          variants: Array.from(buttons).slice(0, 5).map(btn => ({
            text: btn.textContent?.trim().substring(0, 30),
            className: btn.className,
            backgroundColor: window.getComputedStyle(btn).backgroundColor,
            color: window.getComputedStyle(btn).color
          }))
        };
      }

      // Card analysis
      const cards = document.querySelectorAll('.card, [class*="card"], .box, .panel');
      if (cards.length > 0) {
        const sampleCard = cards[0];
        const styles = window.getComputedStyle(sampleCard);
        components.cards = {
          count: cards.length,
          styles: {
            backgroundColor: styles.backgroundColor,
            border: styles.border,
            borderRadius: styles.borderRadius,
            padding: styles.padding,
            boxShadow: styles.boxShadow,
            margin: styles.margin
          }
        };
      }

      // Form elements
      const inputs = document.querySelectorAll('input, select, textarea');
      if (inputs.length > 0) {
        components.formElements = {
          count: inputs.length,
          types: Array.from(new Set(Array.from(inputs).map(input => input.type || input.tagName.toLowerCase())))
        };
      }

      return components;
    });
  }

  async analyzeNavigation(page) {
    return await page.evaluate(() => {
      const navigation = {};

      // Main navigation
      const mainNav = document.querySelector('nav, .nav, .navigation, .menu');
      if (mainNav) {
        const links = mainNav.querySelectorAll('a');
        navigation.main = {
          linkCount: links.length,
          structure: Array.from(links).slice(0, 10).map(link => ({
            text: link.textContent?.trim(),
            href: link.href,
            hasSubMenu: !!link.querySelector('ul, .submenu, .dropdown')
          })),
          hasDropdowns: !!mainNav.querySelector('.dropdown, .submenu'),
          isMobile: window.getComputedStyle(mainNav).display === 'none'
        };
      }

      // Breadcrumbs
      const breadcrumbs = document.querySelector('.breadcrumbs, .breadcrumb, [role="navigation"][aria-label*="breadcrumb"]');
      if (breadcrumbs) {
        navigation.breadcrumbs = {
          present: true,
          items: breadcrumbs.querySelectorAll('a, span').length
        };
      }

      return navigation;
    });
  }

  async analyzeCasinoListings(page) {
    return await page.evaluate(() => {
      const listings = {};

      // Look for casino cards or listings
      const casinoElements = document.querySelectorAll(
        '[class*="casino"], [class*="operator"], .listing, .review-card, [data-casino]'
      );

      if (casinoElements.length > 0) {
        listings.count = casinoElements.length;
        listings.structure = Array.from(casinoElements).slice(0, 3).map(element => ({
          className: element.className,
          hasLogo: !!element.querySelector('img'),
          hasRating: !!element.querySelector('[class*="rating"], [class*="star"], .score'),
          hasBonus: !!element.querySelector('[class*="bonus"], [class*="offer"]'),
          hasButton: !!element.querySelector('button, .btn, [class*="play"]'),
          textContent: element.textContent?.trim().substring(0, 100)
        }));
      }

      // Look for filtering options
      const filters = document.querySelectorAll(
        '.filter, [class*="filter"], .sort, [class*="sort"], .category'
      );
      if (filters.length > 0) {
        listings.filters = {
          count: filters.length,
          types: Array.from(filters).map(filter => filter.textContent?.trim()).slice(0, 10)
        };
      }

      return listings;
    });
  }

  async analyzeRatingSystems(page) {
    return await page.evaluate(() => {
      const ratings = {};

      // Star ratings
      const starRatings = document.querySelectorAll(
        '[class*="star"], .rating, .score, [class*="rating"]'
      );
      if (starRatings.length > 0) {
        ratings.stars = {
          count: starRatings.length,
          styles: Array.from(starRatings).slice(0, 3).map(rating => ({
            className: rating.className,
            innerHTML: rating.innerHTML.substring(0, 50),
            color: window.getComputedStyle(rating).color,
            fontSize: window.getComputedStyle(rating).fontSize
          }))
        };
      }

      // Numeric scores
      const scores = document.querySelectorAll(
        '[class*="score"], .rating-number, .grade'
      );
      if (scores.length > 0) {
        ratings.numeric = {
          count: scores.length,
          examples: Array.from(scores).slice(0, 5).map(score => score.textContent?.trim())
        };
      }

      return ratings;
    });
  }

  async analyzeVisualElements(page) {
    return await page.evaluate(() => {
      const visual = {};

      // Image analysis
      const images = document.querySelectorAll('img');
      visual.images = {
        count: images.length,
        logos: Array.from(images).filter(img => 
          img.alt?.toLowerCase().includes('logo') || 
          img.src?.toLowerCase().includes('logo')
        ).length,
        lazyLoading: Array.from(images).some(img => 
          img.hasAttribute('loading') || 
          img.hasAttribute('data-src')
        )
      };

      // Icon usage
      const icons = document.querySelectorAll(
        '[class*="icon"], .fa, .fas, .far, .fab, svg'
      );
      visual.icons = {
        count: icons.length,
        types: Array.from(new Set(Array.from(icons).map(icon => {
          if (icon.tagName === 'SVG') return 'svg';
          return icon.className && typeof icon.className === 'string' ? 
            icon.className.split(' ')[0] : 'unknown';
        }))).slice(0, 10)
      };

      // Animation/Transition detection
      visual.animations = {
        hasTransitions: Array.from(document.querySelectorAll('*')).some(el => 
          window.getComputedStyle(el).transition !== 'all 0s ease 0s'
        ),
        hasAnimations: Array.from(document.querySelectorAll('*')).some(el => 
          window.getComputedStyle(el).animation !== 'none 0s ease 0s 1 normal none running'
        )
      };

      return visual;
    });
  }

  async generateReport() {
    const reportPath = 'research/casino_research_report.json';
    const reportDir = path.dirname(reportPath);
    
    try {
      await fs.mkdir(reportDir, { recursive: true });
    } catch (error) {
      // Directory might already exist
    }

    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`📊 Research report saved to: ${reportPath}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Main execution
async function main() {
  const researcher = new CasinoResearcher();
  
  try {
    await researcher.init();
    
    // Research both sites
    await researcher.researchSite('https://casino.ca', 'casino.ca');
    await researcher.researchSite('https://casino.guru', 'casino.guru');
    
    await researcher.generateReport();
    
    console.log('🎉 Casino website research completed successfully!');
    console.log('📁 Check the research/ folder for screenshots and data');
    
  } catch (error) {
    console.error('❌ Research failed:', error);
  } finally {
    await researcher.close();
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { CasinoResearcher };