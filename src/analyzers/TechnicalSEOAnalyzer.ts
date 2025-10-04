import puppeteer from 'puppeteer';

export class TechnicalSEOAnalyzer {
  async analyze(competitor: string) {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    try {
      const page = await browser.newPage();
      await page.setRequestInterception(true);
      const requests: any[] = [];
      const responses: any[] = [];
      page.on('request', request => {
        requests.push({
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          resourceType: request.resourceType()
        });
        request.continue();
      });
      page.on('response', response => {
        responses.push({
          url: response.url(),
          status: response.status(),
          headers: response.headers(),
          size: response.headers()['content-length'] || 0
        });
      });
      await page.goto(`https://${competitor}`, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });
      const technicalData = await page.evaluate(() => {
        const extractMeta = () => {
          const meta: { [key: string]: string | null } = {};
          document.querySelectorAll('meta').forEach(tag => {
            const name = tag.getAttribute('name') || tag.getAttribute('property');
            if (name) meta[name] = tag.getAttribute('content');
          });
          return meta;
        };
        const extractHeaders = () => {
          const headers: { [key: string]: any[] } = {};
          for (let i = 1; i <= 6; i++) {
            headers[`h${i}`] = Array.from(document.querySelectorAll(`h${i}`))
              .map(h => ({ text: h.textContent?.trim(), id: h.id }));
          }
          return headers;
        };
        const extractLinks = () => {
            const links = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
          return {
            total: links.length,
            internal: links.filter(l => l.hostname === window.location.hostname).length,
            external: links.filter(l => l.hostname !== window.location.hostname).length,
            nofollow: links.filter(l => l.rel && l.rel.includes('nofollow')).length
          };
        };
        const extractImages = () => {
          const images = Array.from(document.querySelectorAll('img'));
          return {
            total: images.length,
            withAlt: images.filter(img => img.alt && img.alt.trim()).length,
            withoutAlt: images.filter(img => !img.alt || !img.alt.trim()).length,
            lazy: images.filter(img => img.loading === 'lazy').length,
            webp: images.filter(img => img.src && img.src.includes('.webp')).length
          };
        };
        const extractSchema = () => {
          const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
          return scripts.map(script => {
            try {
              return JSON.parse(script.textContent || '');
            } catch {
              return null;
            }
          }).filter(Boolean);
        };
        return {
          title: document.title,
          meta: extractMeta(),
          headers: extractHeaders(),
          links: extractLinks(),
          images: extractImages(),
          schema: extractSchema(),
          canonicalUrl: document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
          viewport: document.querySelector('meta[name="viewport"]')?.getAttribute('content'),
          charset: document.characterSet,
          doctype: document.doctype?.name || 'unknown',
          wordCount: document.body.innerText.split(/\\s+/).length
        };
      });
      const performanceMetrics = await page.metrics();
      return {
        ...technicalData,
        performance: performanceMetrics,
        requests: requests.length,
        responses: responses.length,
        networkErrors: responses.filter(r => r.status >= 400).length,
        timestamp: new Date().toISOString()
      };
    } finally {
      await browser.close();
    }
  }
}
