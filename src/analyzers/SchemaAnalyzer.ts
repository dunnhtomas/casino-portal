import puppeteer from 'puppeteer';

export class SchemaAnalyzer {
  async analyze(competitor: string) {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(`https://${competitor}`, { waitUntil: 'networkidle2' });
      const schemaData = await page.evaluate(() => {
        const schemas: any[] = [];
        document.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
          try {
            const data = JSON.parse(script.textContent || '');
            schemas.push(data);
          } catch (e) {
            // Invalid JSON
          }
        });
        return schemas;
      });
      return {
        schemaTypes: schemaData.map(s => s['@type']).filter(Boolean),
        schemaCount: schemaData.length,
        hasOrganization: schemaData.some(s => s['@type'] === 'Organization'),
        hasWebSite: schemaData.some(s => s['@type'] === 'WebSite'),
        hasArticle: schemaData.some(s => s['@type'] === 'Article'),
        hasReview: schemaData.some(s => s['@type'] === 'Review'),
        hasProduct: schemaData.some(s => s['@type'] === 'Product'),
        hasBreadcrumb: schemaData.some(s => s['@type'] === 'BreadcrumbList'),
        rawSchemas: schemaData
      };
    } finally {
      await browser.close();
    }
  }
}
