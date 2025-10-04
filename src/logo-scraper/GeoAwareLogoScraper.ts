import { PlaywrightCrawler } from 'crawlee';
import * as fs from 'fs';
import { GeoStrategy } from './GeoStrategy';
import { LogoExtractor } from './LogoExtractor';
import { ReportGenerator } from './ReportGenerator';

class GeoAwareLogoScraper {
  private casinos: any[];
  private existingLogos: any[];
  private results: any[] = [];
  private geoStrategy = new GeoStrategy();
  private logoExtractor = new LogoExtractor();
  private reportGenerator = new ReportGenerator();

  constructor() {
    this.casinos = JSON.parse(fs.readFileSync('data/casinos.json', 'utf8'));
    this.existingLogos = JSON.parse(fs.readFileSync('data/complete-logo-mapping.json', 'utf8'));
  }

  async scrape() {
    console.log('🌍 Starting geo-aware logo scraping...');
    const crawler = new PlaywrightCrawler({
      maxConcurrency: 1,
      requestHandlerTimeoutSecs: 45,
      launchContext: {
        launchOptions: {
          headless: true,
          args: [
            '--no-sandbox',
            '--disable-blink-features=AutomationControlled',
            '--disable-features=VizDisplayCompositor',
          ],
        }
      },
      preNavigationHooks: [
        async ({ request, page }) => {
          const casino = request.userData.casino;
          const bestCountry = this.geoStrategy.getBestCountryForCasino(casino);
          console.log(`🌍 Accessing ${casino.brand} as ${bestCountry} visitor`);
          const headers = this.geoStrategy.getHeadersForCountry(bestCountry);
          await page.setExtraHTTPHeaders(headers);
        }
      ],
      requestHandler: async ({ page, request, log }) => {
        try {
          const casino = request.userData.casino;
          const bestCountry = this.geoStrategy.getBestCountryForCasino(casino);
          log.info(`🎰 Scraping ${casino.brand} from ${bestCountry}`);
          await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
          const currentUrl = page.url();
          const title = await page.title();
          if (title.toLowerCase().includes('blocked') ||
            title.toLowerCase().includes('restricted') ||
            currentUrl.includes('blocked') ||
            currentUrl.includes('geo')) {
            log.warning(`🚫 Geo-blocked: ${casino.brand} (${bestCountry})`);
            return;
          }
          const logoData = await this.logoExtractor.extract(page, casino);
          if (logoData) {
            this.results.push({
              casino: casino.slug,
              brand: casino.brand,
              logoUrl: logoData.src,
              quality: logoData.quality,
              source: 'geo-aware-direct',
              country: bestCountry,
              dimensions: `${logoData.width}x${logoData.height}`,
              brandScore: logoData.brandScore || 0
            });
            log.info(`✅ Found logo for ${casino.brand}: ${logoData.quality} quality`);
          } else {
            log.info(`❌ No logo found for ${casino.brand}`);
            const faviconUrl = await this.logoExtractor.extractFavicon(page);
            if (faviconUrl) {
              this.results.push({
                casino: casino.slug,
                brand: casino.brand,
                logoUrl: faviconUrl,
                quality: 'basic',
                source: 'favicon-fallback',
                country: bestCountry,
                dimensions: '32x32'
              });
              log.info(`📌 Fallback favicon found for ${casino.brand}`);
            }
          }
        } catch (error) {
          log.error(`❌ Error processing ${request.userData.casino.brand}: ${(error as Error).message}`);
        }
      }
    });

    const requests = this.casinos.map(casino => {
      return {
        url: casino.url,
        userData: {
          casino: casino
        }
      };
    });

    await crawler.addRequests(requests);
    await crawler.run();
    this.reportGenerator.generate(this.results, this.casinos, this.existingLogos);
  }
}

async function run() {
  const scraper = new GeoAwareLogoScraper();
  await scraper.scrape();
}

run().catch(console.error);
