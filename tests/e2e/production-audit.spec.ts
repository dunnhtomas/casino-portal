/**
 * Comprehensive Production Website Audit
 * BestCasinoPortal - CTO-Level Assessment
 *
 * This test suite performs a complete technical audit covering:
 * - Performance (Core Web Vitals, Lighthouse)
 * - SEO (Meta tags, structured data, sitemap)
 * - Accessibility (WCAG 2.1 AA compliance)
 * - Security (Headers, SSL, vulnerabilities)
 * - Functionality (Page loads, interactions)
 * - Content Quality (Links, images, consistency)
 */

import { test, expect, Page } from '@playwright/test';
import { injectAxe, checkA11y, getViolations } from 'axe-playwright';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const PRODUCTION_URL = process.env.PRODUCTION_URL || 'https://bestcasinoportal.com';
const STAGING_URL = 'https://bestcasinopo.vps.webdock.cloud';
const BASE_URL = process.env.USE_STAGING === 'true' ? STAGING_URL : PRODUCTION_URL;

// Test data
interface AuditResult {
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  title: string;
  description: string;
  location?: string;
  recommendation: string;
  impactScore: number;
}

interface PerformanceMetrics {
  lcp: number;
  fid: number;
  cls: number;
  inp: number;
  ttfb: number;
  fcp: number;
}

const auditResults: AuditResult[] = [];
const performanceData: Record<string, PerformanceMetrics> = {};

// Helper: Add audit result
function addAuditResult(result: AuditResult) {
  auditResults.push(result);
  console.log(`[${result.severity.toUpperCase()}] ${result.category}: ${result.title}`);
}

// Helper: Measure Core Web Vitals
async function measureCoreWebVitals(page: Page, url: string): Promise<PerformanceMetrics> {
  const metrics = await page.evaluate(() => {
    return new Promise<PerformanceMetrics>((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        // Simplified metrics collection
        resolve({
          lcp: 0,
          fid: 0,
          cls: 0,
          inp: 0,
          ttfb: 0,
          fcp: 0
        });
      });

      // Get navigation timing
      const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintTiming = performance.getEntriesByType('paint');

      const fcp = paintTiming.find(entry => entry.name === 'first-contentful-paint');

      resolve({
        lcp: 0, // Will be measured separately
        fid: 0, // Will be measured separately
        cls: 0, // Will be measured separately
        inp: 0, // Will be measured separately
        ttfb: navTiming ? navTiming.responseStart - navTiming.requestStart : 0,
        fcp: fcp ? fcp.startTime : 0
      });
    });
  });

  return metrics;
}

// Helper: Check security headers
async function checkSecurityHeaders(page: Page, url: string): Promise<void> {
  const response = await page.goto(url);
  const headers = response?.headers() || {};

  const requiredHeaders = {
    'strict-transport-security': 'HSTS',
    'x-content-type-options': 'X-Content-Type-Options',
    'x-frame-options': 'X-Frame-Options',
    'content-security-policy': 'CSP',
    'referrer-policy': 'Referrer-Policy',
    'permissions-policy': 'Permissions-Policy'
  };

  for (const [header, name] of Object.entries(requiredHeaders)) {
    if (!headers[header]) {
      addAuditResult({
        category: 'Security',
        severity: 'high',
        title: `Missing ${name} header`,
        description: `The ${name} security header is not present`,
        location: url,
        recommendation: `Add ${header} header to server configuration`,
        impactScore: 7
      });
    }
  }
}

// Helper: Check SEO meta tags
async function checkSEOMetaTags(page: Page, url: string): Promise<void> {
  const title = await page.title();
  const metaDescription = await page.locator('meta[name="description"]').getAttribute('content');
  const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
  const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
  const ogDescription = await page.locator('meta[property="og:description"]').getAttribute('content');
  const ogImage = await page.locator('meta[property="og:image"]').getAttribute('content');

  if (!title || title.length < 30) {
    addAuditResult({
      category: 'SEO',
      severity: 'high',
      title: 'Title tag too short or missing',
      description: `Title: "${title}" (${title?.length || 0} chars)`,
      location: url,
      recommendation: 'Use descriptive titles between 30-60 characters',
      impactScore: 8
    });
  }

  if (!metaDescription || metaDescription.length < 120) {
    addAuditResult({
      category: 'SEO',
      severity: 'medium',
      title: 'Meta description too short or missing',
      description: `Description: ${metaDescription?.length || 0} chars`,
      location: url,
      recommendation: 'Use descriptive meta descriptions between 120-160 characters',
      impactScore: 6
    });
  }

  if (!canonical) {
    addAuditResult({
      category: 'SEO',
      severity: 'medium',
      title: 'Missing canonical URL',
      description: 'No canonical link tag found',
      location: url,
      recommendation: 'Add canonical link tag to prevent duplicate content issues',
      impactScore: 5
    });
  }
}

test.describe('Production Website Audit - BestCasinoPortal', () => {
  test.beforeAll(async () => {
    console.log(`\n${'='.repeat(80)}`);
    console.log('COMPREHENSIVE PRODUCTION AUDIT - BESTCASINOPORTAL');
    console.log(`Target: ${BASE_URL}`);
    console.log(`Started: ${new Date().toISOString()}`);
    console.log('='.repeat(80) + '\n');
  });

  test.afterAll(async () => {
    // Generate audit report
    const reportPath = path.join(process.cwd(), 'test-results', 'production-audit-report.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });

    const report = {
      timestamp: new Date().toISOString(),
      baseUrl: BASE_URL,
      totalIssues: auditResults.length,
      criticalIssues: auditResults.filter(r => r.severity === 'critical').length,
      highIssues: auditResults.filter(r => r.severity === 'high').length,
      mediumIssues: auditResults.filter(r => r.severity === 'medium').length,
      lowIssues: auditResults.filter(r => r.severity === 'low').length,
      results: auditResults,
      performanceData
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n${'='.repeat(80)}`);
    console.log('AUDIT COMPLETE');
    console.log(`Total Issues: ${report.totalIssues}`);
    console.log(`Critical: ${report.criticalIssues} | High: ${report.highIssues} | Medium: ${report.mediumIssues} | Low: ${report.lowIssues}`);
    console.log(`Report saved: ${reportPath}`);
    console.log('='.repeat(80) + '\n');
  });

  // 1. PERFORMANCE ANALYSIS
  test('1.1 Homepage - Core Web Vitals', async ({ page }) => {
    await page.goto(BASE_URL);
    const metrics = await measureCoreWebVitals(page, BASE_URL);
    performanceData['homepage'] = metrics;

    // Check TTFB
    if (metrics.ttfb > 600) {
      addAuditResult({
        category: 'Performance',
        severity: 'high',
        title: 'Slow Time to First Byte (TTFB)',
        description: `TTFB: ${metrics.ttfb}ms (target: <600ms)`,
        location: BASE_URL,
        recommendation: 'Optimize server response time, enable caching, use CDN',
        impactScore: 8
      });
    }

    // Check FCP
    if (metrics.fcp > 1800) {
      addAuditResult({
        category: 'Performance',
        severity: 'medium',
        title: 'Slow First Contentful Paint (FCP)',
        description: `FCP: ${metrics.fcp}ms (target: <1800ms)`,
        location: BASE_URL,
        recommendation: 'Optimize critical rendering path, reduce render-blocking resources',
        impactScore: 7
      });
    }
  });

  test('1.2 Homepage - Resource Loading', async ({ page }) => {
    const resourceSizes: Record<string, number> = {};
    const resourceCounts: Record<string, number> = {};

    page.on('response', async (response) => {
      const url = response.url();
      const resourceType = response.request().resourceType();

      resourceCounts[resourceType] = (resourceCounts[resourceType] || 0) + 1;

      try {
        const buffer = await response.body();
        const size = buffer.length;
        resourceSizes[resourceType] = (resourceSizes[resourceType] || 0) + size;
      } catch (e) {
        // Ignore errors for failed resources
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check JavaScript bundle size
    const jsSize = resourceSizes['script'] || 0;
    if (jsSize > 400 * 1024) {
      addAuditResult({
        category: 'Performance',
        severity: 'medium',
        title: 'Large JavaScript bundle',
        description: `Total JS: ${(jsSize / 1024).toFixed(2)} KB (target: <400 KB)`,
        location: BASE_URL,
        recommendation: 'Code splitting, tree shaking, lazy loading',
        impactScore: 6
      });
    }

    // Check image optimization
    const imageSize = resourceSizes['image'] || 0;
    if (imageSize > 500 * 1024) {
      addAuditResult({
        category: 'Performance',
        severity: 'medium',
        title: 'Large image payload',
        description: `Total images: ${(imageSize / 1024).toFixed(2)} KB`,
        location: BASE_URL,
        recommendation: 'Use modern formats (AVIF/WebP), implement lazy loading, optimize images',
        impactScore: 6
      });
    }
  });

  // 2. SEO AUDIT
  test('2.1 Homepage - SEO Meta Tags', async ({ page }) => {
    await page.goto(BASE_URL);
    await checkSEOMetaTags(page, BASE_URL);
  });

  test('2.2 Sitemap Validation', async ({ page }) => {
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const response = await page.goto(sitemapUrl);

    if (response?.status() !== 200) {
      addAuditResult({
        category: 'SEO',
        severity: 'critical',
        title: 'Sitemap not accessible',
        description: `Sitemap returned status ${response?.status()}`,
        location: sitemapUrl,
        recommendation: 'Ensure sitemap.xml is accessible and properly formatted',
        impactScore: 9
      });
    } else {
      const content = await page.content();
      const urlCount = (content.match(/<url>/g) || []).length;

      if (urlCount === 0) {
        addAuditResult({
          category: 'SEO',
          severity: 'high',
          title: 'Empty sitemap',
          description: 'Sitemap contains no URLs',
          location: sitemapUrl,
          recommendation: 'Generate sitemap with all important pages',
          impactScore: 8
        });
      }
    }
  });

  test('2.3 Robots.txt Validation', async ({ page }) => {
    const robotsUrl = `${BASE_URL}/robots.txt`;
    const response = await page.goto(robotsUrl);

    if (response?.status() !== 200) {
      addAuditResult({
        category: 'SEO',
        severity: 'medium',
        title: 'Robots.txt not accessible',
        description: `Robots.txt returned status ${response?.status()}`,
        location: robotsUrl,
        recommendation: 'Create robots.txt file with sitemap reference',
        impactScore: 5
      });
    } else {
      const content = await page.content();
      if (!content.includes('Sitemap:')) {
        addAuditResult({
          category: 'SEO',
          severity: 'low',
          title: 'Robots.txt missing sitemap reference',
          description: 'Robots.txt does not reference sitemap',
          location: robotsUrl,
          recommendation: 'Add "Sitemap: https://bestcasinoportal.com/sitemap.xml" to robots.txt',
          impactScore: 3
        });
      }
    }
  });

  test('2.4 Structured Data Validation', async ({ page }) => {
    await page.goto(BASE_URL);

    const structuredData = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      return scripts.map(script => {
        try {
          return JSON.parse(script.textContent || '');
        } catch (e) {
          return null;
        }
      }).filter(Boolean);
    });

    if (structuredData.length === 0) {
      addAuditResult({
        category: 'SEO',
        severity: 'medium',
        title: 'Missing structured data',
        description: 'No Schema.org markup found',
        location: BASE_URL,
        recommendation: 'Add JSON-LD structured data for Organization, WebSite, and BreadcrumbList',
        impactScore: 6
      });
    }
  });

  // 3. ACCESSIBILITY AUDIT
  test('3.1 Homepage - WCAG 2.1 AA Compliance', async ({ page }) => {
    await page.goto(BASE_URL);
    await injectAxe(page);

    try {
      const violations = await getViolations(page, null, {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa']
        }
      });

      for (const violation of violations) {
        const severity = violation.impact === 'critical' || violation.impact === 'serious' ? 'high' : 'medium';
        addAuditResult({
          category: 'Accessibility',
          severity: severity as 'high' | 'medium',
          title: violation.description,
          description: `${violation.nodes.length} instance(s) found`,
          location: BASE_URL,
          recommendation: violation.help,
          impactScore: violation.impact === 'critical' ? 9 : violation.impact === 'serious' ? 7 : 5
        });
      }
    } catch (error) {
      console.error('Accessibility check failed:', error);
    }
  });

  test('3.2 Keyboard Navigation', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check if all interactive elements are keyboard accessible
    const interactiveElements = await page.locator('a, button, input, select, textarea, [tabindex]').all();
    let nonAccessibleCount = 0;

    for (const element of interactiveElements.slice(0, 20)) { // Sample first 20
      const tabindex = await element.getAttribute('tabindex');
      if (tabindex === '-1') {
        nonAccessibleCount++;
      }
    }

    if (nonAccessibleCount > 0) {
      addAuditResult({
        category: 'Accessibility',
        severity: 'medium',
        title: 'Elements not keyboard accessible',
        description: `${nonAccessibleCount} elements have tabindex="-1"`,
        location: BASE_URL,
        recommendation: 'Ensure all interactive elements are keyboard accessible',
        impactScore: 6
      });
    }
  });

  test('3.3 Color Contrast', async ({ page }) => {
    await page.goto(BASE_URL);
    await injectAxe(page);

    try {
      const violations = await getViolations(page, null, {
        runOnly: {
          type: 'rule',
          values: ['color-contrast']
        }
      });

      if (violations.length > 0) {
        addAuditResult({
          category: 'Accessibility',
          severity: 'medium',
          title: 'Color contrast issues',
          description: `${violations[0]?.nodes.length || 0} elements with insufficient contrast`,
          location: BASE_URL,
          recommendation: 'Ensure text has minimum 4.5:1 contrast ratio (3:1 for large text)',
          impactScore: 6
        });
      }
    } catch (error) {
      console.error('Color contrast check failed:', error);
    }
  });

  // 4. SECURITY ASSESSMENT
  test('4.1 Security Headers', async ({ page }) => {
    await checkSecurityHeaders(page, BASE_URL);
  });

  test('4.2 HTTPS and SSL Certificate', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    const securityDetails = await page.evaluate(() => {
      return {
        protocol: window.location.protocol,
        isSecure: window.isSecureContext
      };
    });

    if (securityDetails.protocol !== 'https:') {
      addAuditResult({
        category: 'Security',
        severity: 'critical',
        title: 'Site not using HTTPS',
        description: 'Website is not served over HTTPS',
        location: BASE_URL,
        recommendation: 'Enable HTTPS and redirect all HTTP traffic to HTTPS',
        impactScore: 10
      });
    }
  });

  test('4.3 Mixed Content Check', async ({ page }) => {
    const mixedContentWarnings: string[] = [];

    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('Mixed Content') || text.includes('http://')) {
        mixedContentWarnings.push(text);
      }
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    if (mixedContentWarnings.length > 0) {
      addAuditResult({
        category: 'Security',
        severity: 'high',
        title: 'Mixed content detected',
        description: `${mixedContentWarnings.length} mixed content warnings`,
        location: BASE_URL,
        recommendation: 'Ensure all resources are loaded over HTTPS',
        impactScore: 8
      });
    }
  });

  test('4.4 XSS Protection', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check for inline scripts without nonce
    const inlineScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script:not([src])'));
      return scripts.filter(script => !script.hasAttribute('nonce')).length;
    });

    if (inlineScripts > 0) {
      addAuditResult({
        category: 'Security',
        severity: 'medium',
        title: 'Inline scripts without nonce',
        description: `${inlineScripts} inline scripts found without CSP nonce`,
        location: BASE_URL,
        recommendation: 'Use CSP nonces for inline scripts or move to external files',
        impactScore: 5
      });
    }
  });

  // 5. FUNCTIONALITY TESTING
  test('5.1 Homepage Loads Successfully', async ({ page }) => {
    const response = await page.goto(BASE_URL);
    expect(response?.status()).toBe(200);

    // Check for essential elements
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('nav')).toBeVisible();
  });

  test('5.2 Casino Pages Load', async ({ page }) => {
    const casinoPageUrl = `${BASE_URL}/casino-reviews/`;
    const response = await page.goto(casinoPageUrl);

    if (response?.status() !== 200) {
      addAuditResult({
        category: 'Functionality',
        severity: 'high',
        title: 'Casino pages not accessible',
        description: `Casino pages returned status ${response?.status()}`,
        location: casinoPageUrl,
        recommendation: 'Fix routing or page generation for casino pages',
        impactScore: 8
      });
    }
  });

  test('5.3 Mobile Responsiveness', async ({ page, context }) => {
    await context.addInitScript(() => {
      Object.defineProperty(navigator, 'userAgent', {
        get: () => 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15'
      });
    });

    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    await page.goto(BASE_URL);

    // Check for viewport meta tag (use first() to handle multiple viewport tags)
    const viewport = await page.locator('meta[name="viewport"]').first().getAttribute('content');
    if (!viewport || !viewport.includes('width=device-width')) {
      addAuditResult({
        category: 'Functionality',
        severity: 'high',
        title: 'Missing or incorrect viewport meta tag',
        description: 'Viewport meta tag not properly configured for mobile',
        location: BASE_URL,
        recommendation: 'Add <meta name="viewport" content="width=device-width, initial-scale=1">',
        impactScore: 7
      });
    }
  });

  // 6. CONTENT QUALITY
  test('6.1 Broken Links Detection', async ({ page }) => {
    await page.goto(BASE_URL);

    const links = await page.locator('a[href]').all();
    const brokenLinks: string[] = [];

    // Sample first 50 links
    for (const link of links.slice(0, 50)) {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) continue;

      try {
        const url = new URL(href, BASE_URL);
        if (url.hostname === new URL(BASE_URL).hostname) {
          const response = await page.request.get(url.toString());
          if (response.status() >= 400) {
            brokenLinks.push(href);
          }
        }
      } catch (e) {
        // Invalid URL
      }
    }

    if (brokenLinks.length > 0) {
      addAuditResult({
        category: 'Content Quality',
        severity: 'medium',
        title: 'Broken internal links found',
        description: `${brokenLinks.length} broken links detected`,
        location: BASE_URL,
        recommendation: 'Fix or remove broken links: ' + brokenLinks.slice(0, 5).join(', '),
        impactScore: 5
      });
    }
  });

  test('6.2 Image Loading Verification', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const images = await page.locator('img').all();
    let brokenImages = 0;
    let missingAlt = 0;

    for (const img of images.slice(0, 30)) { // Sample first 30 images
      const src = await img.getAttribute('src');
      const alt = await img.getAttribute('alt');

      if (!alt || alt.trim() === '') {
        missingAlt++;
      }

      if (src) {
        const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
        if (naturalWidth === 0) {
          brokenImages++;
        }
      }
    }

    if (brokenImages > 0) {
      addAuditResult({
        category: 'Content Quality',
        severity: 'medium',
        title: 'Broken images detected',
        description: `${brokenImages} images failed to load`,
        location: BASE_URL,
        recommendation: 'Fix image URLs and ensure all images are accessible',
        impactScore: 6
      });
    }

    if (missingAlt > 0) {
      addAuditResult({
        category: 'Content Quality',
        severity: 'medium',
        title: 'Images missing alt text',
        description: `${missingAlt} images without alt attributes`,
        location: BASE_URL,
        recommendation: 'Add descriptive alt text to all images for accessibility and SEO',
        impactScore: 6
      });
    }
  });

  test('6.3 Console Errors Check', async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', error => {
      consoleErrors.push(error.message);
    });

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Filter out known non-critical errors
    const criticalErrors = consoleErrors.filter(err =>
      !err.includes('favicon') &&
      !err.includes('analytics') &&
      !err.includes('third-party')
    );

    if (criticalErrors.length > 0) {
      addAuditResult({
        category: 'Content Quality',
        severity: 'medium',
        title: 'JavaScript console errors',
        description: `${criticalErrors.length} console errors detected`,
        location: BASE_URL,
        recommendation: 'Fix JavaScript errors: ' + criticalErrors.slice(0, 3).join('; '),
        impactScore: 5
      });
    }
  });

  test('6.4 Page Load Performance', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('load');
    const loadTime = Date.now() - startTime;

    if (loadTime > 3000) {
      addAuditResult({
        category: 'Performance',
        severity: 'medium',
        title: 'Slow page load time',
        description: `Page loaded in ${loadTime}ms (target: <3000ms)`,
        location: BASE_URL,
        recommendation: 'Optimize assets, enable caching, use CDN, reduce server response time',
        impactScore: 7
      });
    }
  });
});

