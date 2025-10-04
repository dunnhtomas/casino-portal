import * as path from 'path';
import { AstroPageGenerator } from './AstroPageGenerator';
import { ViewModelGenerator } from './ViewModelGenerator';
import { CasinoReviewPageGenerator } from './CasinoReviewPageGenerator';
import { CategoryPageGenerator } from './CategoryPageGenerator';
import { RegionalPageGenerator } from './RegionalPageGenerator';
import { GameGuidePageGenerator } from './GameGuidePageGenerator';
import { BonusGuidePageGenerator } from './BonusGuidePageGenerator';
import { NewsPageGenerator } from './NewsPageGenerator';
import { LandingPageGenerator } from './LandingPageGenerator';
import { LegalPageGenerator } from './LegalPageGenerator';

class StructureAwarePageGenerator {
  private astroPageGenerator: AstroPageGenerator;
  private viewModelGenerator: ViewModelGenerator;
  private casinoReviewPageGenerator: CasinoReviewPageGenerator;
  private categoryPageGenerator: CategoryPageGenerator;
  private regionalPageGenerator: RegionalPageGenerator;
  private gameGuidePageGenerator: GameGuidePageGenerator;
  private bonusGuidePageGenerator: BonusGuidePageGenerator;
  private newsPageGenerator: NewsPageGenerator;
  private landingPageGenerator: LandingPageGenerator;
  private legalPageGenerator: LegalPageGenerator;

  constructor(private baseDir: string, private pageStructures: any, private data: any) {
    this.astroPageGenerator = new AstroPageGenerator(this.pageStructures);
    this.viewModelGenerator = new ViewModelGenerator();
    const pagesDir = path.join(this.baseDir, 'src', 'pages');
    const viewmodelsDir = path.join(this.baseDir, 'src', 'viewmodels');
    this.casinoReviewPageGenerator = new CasinoReviewPageGenerator(this.astroPageGenerator, this.viewModelGenerator, pagesDir, viewmodelsDir, this.data.casinos);
    this.categoryPageGenerator = new CategoryPageGenerator(this.astroPageGenerator, this.viewModelGenerator, pagesDir, viewmodelsDir);
    this.regionalPageGenerator = new RegionalPageGenerator(this.astroPageGenerator, this.viewModelGenerator, pagesDir, viewmodelsDir);
    this.gameGuidePageGenerator = new GameGuidePageGenerator(this.astroPageGenerator, this.viewModelGenerator, pagesDir, viewmodelsDir);
    this.bonusGuidePageGenerator = new BonusGuidePageGenerator(this.astroPageGenerator, this.viewModelGenerator, pagesDir, viewmodelsDir);
    this.newsPageGenerator = new NewsPageGenerator(this.astroPageGenerator, this.viewModelGenerator, pagesDir, viewmodelsDir);
    this.landingPageGenerator = new LandingPageGenerator(this.astroPageGenerator, this.viewModelGenerator, pagesDir, viewmodelsDir);
    this.legalPageGenerator = new LegalPageGenerator(this.astroPageGenerator, this.viewModelGenerator, pagesDir, viewmodelsDir);
  }

  async executeFullGeneration() {
    console.log('🚀 STRUCTURE-AWARE PAGE GENERATOR - Starting Full Execution');
    this.casinoReviewPageGenerator.generate();
    this.categoryPageGenerator.generate();
    this.regionalPageGenerator.generate();
    this.gameGuidePageGenerator.generate();
    this.bonusGuidePageGenerator.generate();
    this.newsPageGenerator.generate();
    this.landingPageGenerator.generate();
    this.legalPageGenerator.generate();
    console.log('\n✅ GENERATION COMPLETE!');
  }
}

// Example usage:
async function runGenerator() {
  const pageStructures = { /* ... your page structures ... */ };
  const data = {
    casinos: (await import('../../data/casinos.json')).default,
    categories: (await import('../../data/categories.json')).default,
    regions: (await import('../../data/regions.json')).default,
    faqs: (await import('../../data/faqs.json')).default
  };
  const generator = new StructureAwarePageGenerator(path.join(__dirname, '../..'), pageStructures, data);
  await generator.executeFullGeneration();
}

runGenerator().catch(console.error);
