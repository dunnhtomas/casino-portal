import puppeteer from 'puppeteer';

export class MobileAnalyzer {
  async analyze(competitor: string) {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: 375,
        height: 667,
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 2
      });
      await page.goto(`https://${competitor}`, { waitUntil: 'networkidle2' });
      const mobileData = await page.evaluate(() => {
        return {
          hasViewportMeta: !!document.querySelector('meta[name="viewport"]'),
          touchTargets: document.querySelectorAll('button, a, input, [onclick]').length,
          textSize: window.getComputedStyle(document.body).fontSize,
          contentWidth: document.body.scrollWidth,
          viewportWidth: window.innerWidth,
          isResponsive: document.body.scrollWidth <= window.innerWidth + 10,
          hasHamburgerMenu: !!document.querySelector('[class*="hamburger"], [class*="menu-toggle"], [class*="nav-toggle"]'),
          hasMobileSpecificElements: !!document.querySelector('[class*="mobile"], [class*="touch"]')
        };
      });
      return mobileData;
    } finally {
      await browser.close();
    }
  }
}
