const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class ComprehensiveAudit {
  constructor() {
    this.baseUrl = 'http://localhost:3008';
    this.results = {
      passed: [],
      failed: [],
      basicPages: [],
      casinoReviews: [],
      regionalPages: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        basicContent: 0,
        errors: []
      }
    };
  }

  // Extract all pages from dist directory
  async discoverAllPages() {
    const pages = [];
    
    try {
      // Add known structure pages
      const knownPages = [
        '/',
        '/best/',
        '/best/fast-withdrawals/',
        '/best/live-dealer/',
        '/best/mobile/',
        '/best/real-money/',
        '/bonus/',
        '/bonuses/',
        '/free-games/',
        '/games/',
        '/guides/',
        '/guides/how-we-rate/',
        '/guides/responsible-gambling/',
        '/legal/about/',
        '/legal/privacy/',
        '/legal/terms/',
        '/live-dealer/',
        '/mobile/',
        '/payments/',
        '/regions/alberta/',
        '/regions/british-columbia/',
        '/regions/ontario/',
        '/reviews/',
        '/slots/'
      ];
      
      pages.push(...knownPages);
      
      // Discover casino review pages from data
      const casinosData = require('../data/casinos.json');
      const casinoPages = casinosData.map(casino => `/reviews/${casino.slug}/`);
      pages.push(...casinoPages);
      
      console.log(`🔍 Discovered ${pages.length} pages to test`);
      console.log(`   - ${knownPages.length} structure pages`);
      console.log(`   - ${casinoPages.length} casino reviews`);
      
      return pages;
    } catch (error) {
      console.error('Error discovering pages:', error.message);
      return [];
    }
  }

  async checkPageContent(page, url) {
    const fullUrl = this.baseUrl + url;
    const pageResult = {
      url,
      fullUrl,
      status: null,
      loadTime: 0,
      errors: [],
      warnings: [],
      contentIssues: [],
      elements: {
        title: null,
        headings: 0,
        images: 0,
        links: 0,
        hasLayout: false,
        hasNavigation: false,
        hasFooter: false,
        hasStyling: false
      }
    };

    try {
      const startTime = Date.now();
      
      // Navigate with timeout
      const response = await page.goto(fullUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      pageResult.loadTime = Date.now() - startTime;
      pageResult.status = response.status();

      if (response.status() >= 400) {
        pageResult.errors.push(`HTTP ${response.status()}: Page not found or server error`);
        return pageResult;
      }

      // Wait for content
      await page.waitForTimeout(500);

      // Check basic elements
      pageResult.elements.title = await page.title();
      pageResult.elements.headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.length);
      pageResult.elements.images = await page.$$eval('img', els => els.length);
      pageResult.elements.links = await page.$$eval('a', els => els.length);

      // Check for proper layout components
      pageResult.elements.hasLayout = await page.$('main') !== null;
      pageResult.elements.hasNavigation = await page.$('nav, header') !== null;
      pageResult.elements.hasFooter = await page.$('footer') !== null;
      
      // Check for CSS styling (look for Tailwind classes)
      const hasStyledElements = await page.$$eval('*[class*="bg-"], *[class*="text-"], *[class*="p-"], *[class*="m-"], *[class*="rounded"], *[class*="shadow"]', 
        els => els.length > 5
      );
      pageResult.elements.hasStyling = hasStyledElements;

      // Content quality checks
      const bodyText = await page.$eval('body', el => el.textContent.trim());
      
      if (bodyText.length < 100) {
        pageResult.contentIssues.push('Very minimal content (< 100 characters)');
      }
      
      if (!pageResult.elements.title || pageResult.elements.title.includes('404')) {
        pageResult.errors.push('Missing or invalid page title');
      }
      
      if (pageResult.elements.headings === 0) {
        pageResult.contentIssues.push('No headings found');
      }
      
      if (!pageResult.elements.hasLayout) {
        pageResult.contentIssues.push('No <main> element - likely basic HTML structure');
      }
      
      if (!pageResult.elements.hasNavigation) {
        pageResult.contentIssues.push('No navigation found');
      }
      
      if (!pageResult.elements.hasStyling) {
        pageResult.contentIssues.push('No CSS styling detected - likely unstyled page');
      }

      // Check for basic HTML structure (indicates missing layout)
      const isBasicHTML = await page.$('html > head > title') !== null && 
                          await page.$('html > body > main') === null &&
                          !pageResult.elements.hasStyling;
      
      if (isBasicHTML) {
        pageResult.contentIssues.push('Basic HTML structure - needs layout enhancement');
      }

      // Categorize page type
      if (url.startsWith('/reviews/') && url !== '/reviews/') {
        this.results.casinoReviews.push(pageResult);
      } else if (url.startsWith('/regions/')) {
        this.results.regionalPages.push(pageResult);
      } else {
        this.results.basicPages.push(pageResult);
      }

    } catch (error) {
      pageResult.errors.push(`Failed to load: ${error.message}`);
    }

    return pageResult;
  }

  async runComprehensiveAudit() {
    console.log('🚀 Starting Comprehensive Website Audit...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    // Test connectivity
    try {
      const response = await page.goto(this.baseUrl, { timeout: 5000 });
      if (response.status() >= 400) {
        throw new Error(`Server not responding: HTTP ${response.status()}`);
      }
      console.log(`✅ Base URL accessible: ${this.baseUrl}\n`);
    } catch (error) {
      console.error(`❌ Cannot connect to ${this.baseUrl}: ${error.message}`);
      await browser.close();
      return;
    }

    // Discover all pages
    const allPages = await this.discoverAllPages();
    this.results.summary.total = allPages.length;

    console.log(`🔍 Testing ${allPages.length} pages...\n`);

    // Test all pages
    for (let i = 0; i < allPages.length; i++) {
      const pageUrl = allPages[i];
      const result = await this.checkPageContent(page, pageUrl);
      
      const status = result.errors.length === 0 ? '✅' : '❌';
      const contentWarning = result.contentIssues.length > 0 ? ' ⚠️' : '';
      console.log(`${status} (${i+1}/${allPages.length}) ${pageUrl} - ${result.status} (${result.loadTime}ms)${contentWarning}`);
      
      if (result.contentIssues.length > 0 && result.errors.length === 0) {
        console.log(`   └─ Issues: ${result.contentIssues.join(', ')}`);
      }
      
      if (result.errors.length > 0) {
        this.results.failed.push(result);
        this.results.summary.failed++;
      } else {
        this.results.passed.push(result);
        this.results.summary.passed++;
        
        if (result.contentIssues.length > 0) {
          this.results.summary.basicContent++;
        }
      }
    }

    await browser.close();
    
    await this.generateComprehensiveReport();
    this.printComprehensiveSummary();
  }

  async generateComprehensiveReport() {
    const reportPath = path.join(__dirname, '..', 'reports', 'comprehensive-audit.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    const htmlReport = this.generateComprehensiveHTMLReport();
    const htmlPath = path.join(__dirname, '..', 'reports', 'comprehensive-audit.html');
    await fs.writeFile(htmlPath, htmlReport);
  }

  generateComprehensiveHTMLReport() {
    const pagesNeedingFix = this.results.passed.filter(p => p.contentIssues.length > 0);
    
    return `<!DOCTYPE html>
<html>
<head>
    <title>Comprehensive Casino Portal Audit</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .passed { color: green; } .failed { color: red; } .warning { color: orange; }
        .section { margin: 20px 0; }
        .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 15px; }
        .page-card { border: 1px solid #ddd; border-radius: 8px; padding: 15px; }
        .page-card.failed { border-color: red; background: #fff5f5; }
        .page-card.warning { border-color: orange; background: #fff8f0; }
        .page-card.passed { border-color: green; background: #f5fff5; }
        .issues { margin-top: 10px; }
        .issue-item { background: #f9f9f9; padding: 5px; margin: 2px 0; border-radius: 4px; font-size: 0.9em; }
    </style>
</head>
<body>
    <h1>🎰 Comprehensive Casino Portal Audit</h1>
    
    <div class="summary">
        <h2>Executive Summary</h2>
        <p><strong>Total Pages:</strong> ${this.results.summary.total}</p>
        <p><strong class="passed">Working Pages:</strong> ${this.results.summary.passed} (${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%)</p>
        <p><strong class="failed">Failed Pages:</strong> ${this.results.summary.failed}</p>
        <p><strong class="warning">Pages Needing Enhancement:</strong> ${this.results.summary.basicContent}</p>
        
        <h3>Page Breakdown:</h3>
        <ul>
          <li>Structure Pages: ${this.results.basicPages.length}</li>
          <li>Casino Reviews: ${this.results.casinoReviews.length}</li>
          <li>Regional Pages: ${this.results.regionalPages.length}</li>
        </ul>
    </div>

    ${pagesNeedingFix.length > 0 ? `
    <div class="section">
        <h2>⚠️ Pages Needing Enhancement (${pagesNeedingFix.length})</h2>
        <div class="page-grid">
            ${pagesNeedingFix.slice(0, 20).map(page => `
                <div class="page-card warning">
                    <h4>${page.url}</h4>
                    <p><strong>Status:</strong> ${page.status} | <strong>Load:</strong> ${page.loadTime}ms</p>
                    <div class="issues">
                        ${page.contentIssues.map(issue => `<div class="issue-item">${issue}</div>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
        ${pagesNeedingFix.length > 20 ? `<p><em>... and ${pagesNeedingFix.length - 20} more pages</em></p>` : ''}
    </div>
    ` : ''}

    ${this.results.failed.length > 0 ? `
    <div class="section">
        <h2>❌ Failed Pages (${this.results.failed.length})</h2>
        <div class="page-grid">
            ${this.results.failed.map(page => `
                <div class="page-card failed">
                    <h4>${page.url}</h4>
                    <p><strong>Status:</strong> ${page.status || 'N/A'} | <strong>Load:</strong> ${page.loadTime}ms</p>
                    <div class="issues">
                        ${page.errors.map(error => `<div class="issue-item">${error}</div>`).join('')}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
    ` : ''}

    <div class="section">
        <h2>✅ Healthy Pages Sample</h2>
        <p>Showing ${Math.min(10, this.results.passed.filter(p => p.contentIssues.length === 0).length)} perfectly working pages:</p>
        <div class="page-grid">
            ${this.results.passed.filter(p => p.contentIssues.length === 0).slice(0, 10).map(page => `
                <div class="page-card passed">
                    <h4>${page.url}</h4>
                    <p><strong>Status:</strong> ${page.status} | <strong>Load:</strong> ${page.loadTime}ms</p>
                    <p><strong>Title:</strong> "${page.elements.title}"</p>
                </div>
            `).join('')}
        </div>
    </div>

</body>
</html>`;
  }

  printComprehensiveSummary() {
    console.log('\n' + '='.repeat(80));
    console.log('🎰 COMPREHENSIVE CASINO PORTAL AUDIT RESULTS');
    console.log('='.repeat(80));
    
    console.log(`📊 OVERVIEW:`);
    console.log(`   Total Pages Tested: ${this.results.summary.total}`);
    console.log(`   ✅ Working Pages: ${this.results.summary.passed} (${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Failed Pages: ${this.results.summary.failed}`);
    console.log(`   ⚠️  Pages Needing Enhancement: ${this.results.summary.basicContent}`);
    
    console.log(`\n📋 PAGE BREAKDOWN:`);
    console.log(`   Structure Pages: ${this.results.basicPages.length}`);
    console.log(`   Casino Reviews: ${this.results.casinoReviews.length}`);
    console.log(`   Regional Pages: ${this.results.regionalPages.length}`);
    
    const pagesNeedingFix = this.results.passed.filter(p => p.contentIssues.length > 0);
    
    if (pagesNeedingFix.length > 0) {
      console.log(`\n⚠️  PAGES NEEDING ENHANCEMENT (${pagesNeedingFix.length}):`);
      pagesNeedingFix.slice(0, 10).forEach(page => {
        console.log(`   📄 ${page.url}`);
        page.contentIssues.forEach(issue => console.log(`      └─ ${issue}`));
      });
      if (pagesNeedingFix.length > 10) {
        console.log(`   ... and ${pagesNeedingFix.length - 10} more pages`);
      }
    }
    
    if (this.results.failed.length > 0) {
      console.log(`\n❌ FAILED PAGES:`);
      this.results.failed.forEach(page => {
        console.log(`   💥 ${page.url}`);
        page.errors.forEach(error => console.log(`      └─ ${error}`));
      });
    }
    
    if (pagesNeedingFix.length === 0 && this.results.failed.length === 0) {
      console.log('\n🎉 ALL PAGES PERFECT! NO ISSUES FOUND!');
    } else {
      const totalIssues = pagesNeedingFix.length + this.results.failed.length;
      console.log(`\n🔧 NEXT STEPS: ${totalIssues} pages need attention`);
    }
    
    console.log('\n📊 Reports generated:');
    console.log('   JSON: reports/comprehensive-audit.json');
    console.log('   HTML: reports/comprehensive-audit.html');
    console.log('='.repeat(80));
  }
}

// Run comprehensive audit
(async () => {
  const audit = new ComprehensiveAudit();
  await audit.runComprehensiveAudit();
})().catch(console.error);