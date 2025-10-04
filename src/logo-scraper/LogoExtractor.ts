import { Page } from 'playwright';
import * as https from 'https';

export class LogoExtractor {
  async extract(page: Page, casino: any) {
    const logoSelectors = [
      'img[class*="logo"]:not([class*="payment"]):not([class*="provider"]):not([class*="game"]):not([class*="sponsor"])',
      'img[alt*="logo" i]:not([alt*="payment"]):not([alt*="provider"])',
      'header img[class*="logo"], header img[class*="brand"]',
      '.header img[class*="logo"], .header img[class*="brand"]',
      '.navbar-brand img:first-child, .logo img:first-child',
      `img[alt*="${casino.brand}" i]`,
      `img[src*="${casino.brand.toLowerCase().replace(/\s+/g, '')}" i]`,
      '.site-logo img, .main-logo img, .brand-logo img',
      '[data-testid*="logo"] img, [data-cy*="logo"] img',
      '.mobile-logo img, .mobile-header img[class*="logo"]',
      'svg[class*="logo"], svg[class*="brand"]'
    ];

    for (const selector of logoSelectors) {
      try {
        const logoData = await page.evaluate(({ selector, brandName }) => {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            let src, width, height;
            if (element.tagName === 'IMG') {
              src = (element as HTMLImageElement).src;
              width = (element as HTMLImageElement).naturalWidth || (element as HTMLElement).offsetWidth;
              height = (element as HTMLImageElement).naturalHeight || (element as HTMLElement).offsetHeight;
            } else if (element.tagName === 'SVG') {
              const svgData = new XMLSerializer().serializeToString(element);
              src = `data:image/svg+xml;base64,${btoa(svgData)}`;
              width = (element as HTMLElement).offsetWidth || 200;
              height = (element as HTMLElement).offsetHeight || 100;
            } else {
              continue;
            }
            if (width < 50 || height < 20) continue;
            const srcLower = (src || '').toLowerCase();
            const altLower = ((element as HTMLImageElement).alt || '').toLowerCase();
            if (srcLower.includes('payment') || srcLower.includes('provider') ||
              srcLower.includes('game') || srcLower.includes('sponsor') ||
              altLower.includes('payment') || altLower.includes('provider')) {
              continue;
            }
            let brandScore = 0;
            const brandLower = brandName.toLowerCase();
            if (srcLower.includes(brandLower.replace(/\s+/g, ''))) brandScore += 10;
            if (altLower.includes(brandLower)) brandScore += 8;
            if (element.className.toLowerCase().includes(brandLower.replace(/\s+/g, ''))) brandScore += 6;
            let quality = 'basic';
            if (srcLower.includes('.svg') || element.tagName === 'SVG') quality = 'high';
            else if (width >= 150 && height >= 60) quality = 'high';
            else if (width >= 100 && height >= 40) quality = 'medium';
            return {
              src: src,
              alt: (element as HTMLImageElement).alt || '',
              width: width,
              height: height,
              quality: quality,
              brandScore: brandScore,
              selector: selector,
              tagName: element.tagName
            };
          }
          return null;
        }, { selector, brandName: casino.brand });
        if (logoData && logoData.src) {
          return logoData;
        }
      } catch (e) {
        // Continue to next selector
      }
    }
    return null;
  }

  async extractFavicon(page: Page) {
    try {
      const favicon = await page.evaluate(() => {
        const selectors = [
          'link[rel="icon"]',
          'link[rel="shortcut icon"]',
          'link[rel="apple-touch-icon"]',
          'link[rel="apple-touch-icon-precomposed"]'
        ];
        for (const selector of selectors) {
          const link = document.querySelector(selector) as HTMLLinkElement;
          if (link && link.href) {
            return link.href;
          }
        }
        return window.location.origin + '/favicon.ico';
      });
      const exists = await this.testImageUrl(favicon);
      return exists ? favicon : null;
    } catch (error) {
      return null;
    }
  }

  private testImageUrl(url: string) {
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
}
