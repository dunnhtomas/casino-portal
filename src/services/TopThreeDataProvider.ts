/**
 * TopThree Data Provider
 * Single Responsibility: Load and provide casino data
 * Optimized for static generation - data loaded at build time
 */

// Import data synchronously at build time
import casinosData from '../../data/casinos.json';
import contentData from '../../data/content.json';

export class TopThreeDataProvider {
  private casinos: any = casinosData;
  private content: any = contentData;

  // No async initialization needed - data already loaded
  getCasinos(): any {
    return this.casinos;
  }

  getContent(): any {
    return this.content;
  }

  getTop3Reasons(): any {
    return this.content?.top3Reasons || {};
  }
}
