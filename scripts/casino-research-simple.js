const { chromium } = require('playwright');
const fs = require('fs').promises;

/**
 * Simplified Casino Research Script
 * Focus on visual analysis and component structure
 */
async function researchCasinoSites() {
  console.log('🎰 Starting Casino Website Research');
  
  const browser = await chromium.launch({ 
    headless: false, 
    args: ['--disable-web-security', '--disable-features=VizDisplayCompositor'] 
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
  });

  const sites = [
    { name: 'casino.ca', url: 'https://casino.ca' },
    { name: 'casino.guru', url: 'https://casino.guru' }
  ];

  const results = {};

  for (const site of sites) {
    console.log(`\n🔍 Analyzing ${site.name}...`);
    const page = await context.newPage();
    
    try {
      await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      await page.waitForTimeout(5000); // Allow page to fully load

      // Take full page screenshot
      const screenshotPath = `research/${site.name.replace('.', '_')}_fullpage.png`;
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        timeout: 30000
      });
      console.log(`📸 Screenshot saved: ${screenshotPath}`);

      // Extract basic page structure
      const pageData = await page.evaluate(() => {
        const data = {
          title: document.title,
          url: window.location.href,
          timestamp: new Date().toISOString()
        };

        // Header analysis
        const header = document.querySelector('header, .header, [role="banner"]') || 
                      document.querySelector('nav, .navbar, .nav');
        if (header) {
          data.header = {
            height: header.offsetHeight + 'px',
            hasLogo: !!header.querySelector('img[alt*="logo"], .logo img, .brand img'),
            navItems: Array.from(header.querySelectorAll('a')).slice(0, 8).map(a => 
              a.textContent?.trim().substring(0, 30)
            ).filter(Boolean)
          };
        }

        // Main content structure
        data.layout = {
          hasHero: !!document.querySelector('.hero, .banner, .jumbotron, [class*="hero"]'),
          hasSidebar: !!document.querySelector('.sidebar, aside, [role="complementary"]'),
          hasCards: document.querySelectorAll('.card, [class*="card"]').length,
          hasButtons: document.querySelectorAll('button, .btn, [class*="button"]').length
        };

        // Casino-specific elements
        data.casinoElements = {
          casinoCards: document.querySelectorAll('[class*="casino"], [class*="operator"], .review').length,
          ratingElements: document.querySelectorAll('[class*="rating"], [class*="star"], .score').length,
          bonusOffers: document.querySelectorAll('[class*="bonus"], [class*="offer"], [class*="promo"]').length,
          playButtons: document.querySelectorAll('[class*="play"], .cta, [class*="join"]').length
        };

        // Color scheme analysis (simplified)
        const body = document.body;
        const bodyStyles = window.getComputedStyle(body);
        data.design = {
          backgroundColor: bodyStyles.backgroundColor,
          color: bodyStyles.color,
          fontFamily: bodyStyles.fontFamily,
          fontSize: bodyStyles.fontSize
        };

        // Find primary colors from key elements
        data.primaryColors = [];
        const buttons = document.querySelectorAll('button, .btn, [class*="button"]');
        buttons.forEach((btn, index) => {
          if (index < 3) {
            const btnStyles = window.getComputedStyle(btn);
            data.primaryColors.push({
              element: 'button',
              backgroundColor: btnStyles.backgroundColor,
              color: btnStyles.color
            });
          }
        });

        return data;
      });

      results[site.name] = pageData;
      console.log(`✅ Analysis completed for ${site.name}`);

    } catch (error) {
      console.error(`❌ Error analyzing ${site.name}:`, error.message);
      results[site.name] = { error: error.message, timestamp: new Date().toISOString() };
    } finally {
      await page.close();
    }
  }

  // Save research results
  const reportPath = 'research/casino_analysis_report.json';
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2));
  console.log(`\n📊 Research report saved: ${reportPath}`);

  await browser.close();
  return results;
}

// Enhanced component analysis
async function analyzeComponentPatterns() {
  console.log('\n🎨 Analyzing Component Patterns...');
  
  const patterns = {
    casinoCardLayouts: [
      {
        name: "Horizontal Card Layout",
        structure: "Logo + Info + Rating + CTA Button",
        benefits: "Compact, scannable, good for lists"
      },
      {
        name: "Vertical Card Layout", 
        structure: "Logo + Title + Rating + Bonus + CTA",
        benefits: "More visual impact, good for grids"
      },
      {
        name: "Minimal Card Layout",
        structure: "Logo + Name + Rating + Play Button",
        benefits: "Clean, fast loading, mobile-friendly"
      }
    ],
    ratingPatterns: [
      {
        type: "Star Rating (1-5)",
        implementation: "★★★★☆ with filled/empty states"
      },
      {
        type: "Numeric Score (1-10)",
        implementation: "Large number with colored background"
      },
      {
        type: "Percentage Score",
        implementation: "Progress bar or circular indicator"
      }
    ],
    colorSchemes: [
      {
        name: "Casino Classic",
        primary: "#C41E3A", // Deep Red
        secondary: "#FFD700", // Gold
        accent: "#000000", // Black
        background: "#FFFFFF" // White
      },
      {
        name: "Modern Professional",
        primary: "#1E40AF", // Blue
        secondary: "#10B981", // Green
        accent: "#6B7280", // Gray
        background: "#F9FAFB" // Light Gray
      }
    ]
  };

  await fs.writeFile('research/component_patterns.json', JSON.stringify(patterns, null, 2));
  console.log('📊 Component patterns documented');
}

// Main execution
async function main() {
  try {
    await researchCasinoSites();
    await analyzeComponentPatterns();
    console.log('\n🎉 Casino research completed successfully!');
  } catch (error) {
    console.error('❌ Research failed:', error);
  }
}

if (require.main === module) {
  main();
}