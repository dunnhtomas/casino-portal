const { chromium } = require('playwright');
const fs = require('fs').promises;
const path = require('path');

class PlaywrightAudit {
  constructor() {
    this.baseUrl = 'http://localhost:3008';
    this.results = {
      passed: [],
      failed: [],
      summary: {
        total: 0,
        passed: 0,
        failed: 0,
        errors: []
      }
    };
  }

  // All pages to test based on the build output
  getTestPages() {
    return [
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
      '/slots/',
      // Sample casino reviews
      '/reviews/spellwin/',
      '/reviews/mr-pacho/',
      '/reviews/lucky-hunter/',
      '/reviews/rizz-casino/'
    ];
  }

  async auditPage(page, url) {
    const fullUrl = this.baseUrl + url;
    const pageResult = {
      url,
      fullUrl,
      status: null,
      loadTime: 0,
      errors: [],
      warnings: [],
      elements: {
        title: null,
        headings: 0,
        images: 0,
        links: 0
      }
    };

    try {
      console.log(`🔍 Testing: ${fullUrl}`);
      
      const startTime = Date.now();
      
      // Navigate with timeout
      const response = await page.goto(fullUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: 10000 
      });
      
      pageResult.loadTime = Date.now() - startTime;
      pageResult.status = response.status();

      // Check if page loaded successfully
      if (response.status() >= 400) {
        pageResult.errors.push(`HTTP ${response.status()}: Page not found or server error`);
        return pageResult;
      }

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Check for console errors
      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });

      // Basic page health checks
      pageResult.elements.title = await page.title();
      
      if (!pageResult.elements.title || pageResult.elements.title.includes('404')) {
        pageResult.errors.push('Missing or invalid page title');
      }

      // Count elements
      pageResult.elements.headings = await page.$$eval('h1, h2, h3, h4, h5, h6', els => els.length);
      pageResult.elements.images = await page.$$eval('img', els => els.length);
      pageResult.elements.links = await page.$$eval('a', els => els.length);

      // Check for essential content
      const hasMainContent = await page.$('main') !== null;
      if (!hasMainContent) {
        pageResult.warnings.push('No <main> element found');
      }

      // Check for navigation
      const hasNavigation = await page.$('nav, header') !== null;
      if (!hasNavigation) {
        pageResult.warnings.push('No navigation found');
      }

      // Check for broken images
      const brokenImages = await page.$$eval('img', imgs => 
        imgs.filter(img => !img.complete || img.naturalHeight === 0).length
      );
      if (brokenImages > 0) {
        pageResult.warnings.push(`${brokenImages} broken images found`);
      }

      // Check for JavaScript errors
      if (consoleErrors.length > 0) {
        pageResult.warnings.push(`${consoleErrors.length} JavaScript errors`);
      }

      console.log(`✅ ${url} - ${response.status()} (${pageResult.loadTime}ms)`);
      
    } catch (error) {
      pageResult.errors.push(`Failed to load: ${error.message}`);
      console.log(`❌ ${url} - ${error.message}`);
    }

    return pageResult;
  }

  async runAudit() {
    console.log('🚀 Starting Playwright MCP Audit...\n');
    
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 720 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();
    
    // Test connectivity first
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

    const pages = this.getTestPages();
    this.results.summary.total = pages.length;

    // Test all pages
    for (const pageUrl of pages) {
      const result = await this.auditPage(page, pageUrl);
      
      if (result.errors.length > 0) {
        this.results.failed.push(result);
        this.results.summary.failed++;
      } else {
        this.results.passed.push(result);
        this.results.summary.passed++;
      }
    }

    await browser.close();
    
    // Generate report
    await this.generateReport();
    this.printSummary();
  }

  async generateReport() {
    const reportPath = path.join(__dirname, '..', 'reports', 'playwright-audit.json');
    await fs.mkdir(path.dirname(reportPath), { recursive: true });
    await fs.writeFile(reportPath, JSON.stringify(this.results, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLReport();
    const htmlPath = path.join(__dirname, '..', 'reports', 'audit-report.html');
    await fs.writeFile(htmlPath, htmlReport);
    
    console.log(`\n📊 Reports generated:`);
    console.log(`   JSON: ${reportPath}`);
    console.log(`   HTML: ${htmlPath}`);
  }

  generateHTMLReport() {
    return `<!DOCTYPE html>
<html>
<head>
    <title>Casino Portal Audit Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .passed { color: green; } .failed { color: red; } .warning { color: orange; }
        .page-result { margin: 10px 0; padding: 15px; border-left: 4px solid #ddd; }
        .page-result.failed { border-color: red; background: #fff5f5; }
        .page-result.passed { border-color: green; background: #f5fff5; }
        .errors { color: red; } .warnings { color: orange; }
    </style>
</head>
<body>
    <h1>🎰 Casino Portal Audit Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <p><strong>Total Pages:</strong> ${this.results.summary.total}</p>
        <p><strong class="passed">Passed:</strong> ${this.results.summary.passed}</p>
        <p><strong class="failed">Failed:</strong> ${this.results.summary.failed}</p>
        <p><strong>Success Rate:</strong> ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%</p>
    </div>

    <h2>Failed Pages</h2>
    ${this.results.failed.map(page => `
        <div class="page-result failed">
            <h3>${page.url}</h3>
            <p><strong>Status:</strong> ${page.status || 'N/A'} | <strong>Load Time:</strong> ${page.loadTime}ms</p>
            ${page.errors.length > 0 ? `<div class="errors"><strong>Errors:</strong><ul>${page.errors.map(e => `<li>${e}</li>`).join('')}</ul></div>` : ''}
            ${page.warnings.length > 0 ? `<div class="warnings"><strong>Warnings:</strong><ul>${page.warnings.map(w => `<li>${w}</li>`).join('')}</ul></div>` : ''}
        </div>
    `).join('')}

    <h2>Passed Pages</h2>
    ${this.results.passed.slice(0, 10).map(page => `
        <div class="page-result passed">
            <h4>${page.url}</h4>
            <p>Status: ${page.status} | Load Time: ${page.loadTime}ms | Title: "${page.elements.title}"</p>
        </div>
    `).join('')}
    ${this.results.passed.length > 10 ? `<p><em>... and ${this.results.passed.length - 10} more passed pages</em></p>` : ''}

</body>
</html>`;
  }

  printSummary() {
    console.log('\n' + '='.repeat(60));
    console.log('🎰 CASINO PORTAL AUDIT SUMMARY');
    console.log('='.repeat(60));
    console.log(`📊 Total Pages Tested: ${this.results.summary.total}`);
    console.log(`✅ Passed: ${this.results.summary.passed}`);
    console.log(`❌ Failed: ${this.results.summary.failed}`);
    console.log(`📈 Success Rate: ${((this.results.summary.passed / this.results.summary.total) * 100).toFixed(1)}%`);
    
    if (this.results.failed.length > 0) {
      console.log('\n🔥 CRITICAL ISSUES:');
      this.results.failed.forEach(page => {
        console.log(`   ❌ ${page.url}`);
        page.errors.forEach(error => console.log(`      └─ ${error}`));
      });
    }
    
    if (this.results.failed.length === 0) {
      console.log('\n🎉 ALL PAGES WORKING PERFECTLY!');
    } else {
      console.log(`\n🔧 ${this.results.failed.length} pages need attention`);
    }
    
    console.log('='.repeat(60));
  }
}

// Run the audit
(async () => {
  const audit = new PlaywrightAudit();
  await audit.runAudit();
})().catch(console.error);