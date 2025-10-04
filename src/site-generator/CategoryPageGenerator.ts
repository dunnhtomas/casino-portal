import * as fs from 'fs';
import * as path from 'path';
import { AstroPageGenerator } from './AstroPageGenerator';
import { ViewModelGenerator } from './ViewModelGenerator';

export class CategoryPageGenerator {
  constructor(
    private astroPageGenerator: AstroPageGenerator,
    private viewModelGenerator: ViewModelGenerator,
    private pagesDir: string,
    private viewmodelsDir: string
  ) {}

  generate() {
    console.log('📂 Generating Category Pages...');
    const bestDir = path.join(this.pagesDir, 'best');
    this.ensureDirectoryExists(bestDir);

    const categoryTypes = [
      'fast-withdrawals', 'mobile', 'live-dealer', 'real-money', 'high-roller',
      'low-deposit', 'no-deposit', 'free-spins', 'welcome-bonus', 'reload-bonus',
      'cashback', 'vip-program', 'bitcoin', 'paypal', 'visa', 'mastercard',
      'slots', 'blackjack', 'roulette', 'poker', 'baccarat', 'craps',
      'new-casinos', 'trusted-casinos', 'licensed-casinos', 'safe-casinos'
    ];

    for (const category of categoryTypes) {
      const categoryPageData = {
        slug: category
      };
      const categoryPageContent = this.astroPageGenerator.generate('category', categoryPageData);
      fs.writeFileSync(path.join(bestDir, `${category}.astro`), categoryPageContent);
    }

    const categoryViewModelData = {
      purpose: 'Category page data preparation and casino filtering',
      hasSlug: true,
      seoMethod: 'CategoryMetadata',
      schemaMarkup: {
        webpage: 'this.schemaManager.generateWebPageSchema(this.slug)',
        faq: 'this.schemaManager.generateFAQSchema(this.getCategoryFAQData())',
        breadcrumb: 'this.schemaManager.generateBreadcrumbSchema(this.navigationCoordinator.generateBreadcrumbs(\'category\', this.slug).map(item => ({ name: item.label, url: item.href })))'
      },
      hasBreadcrumbs: true,
      breadcrumbType: 'category',
      hasAffiliateDisclosure: true,
      content: {
        hero: 'this.getHeroData()',
        filters: 'this.getFiltersData()',
        casinos: 'this.getFilteredCasinos()',
        faqItems: 'this.getCategoryFAQData()',
        relatedCategories: 'this.getRelatedCategoriesData()'
      }
    };

    const categoryViewModelContent = this.viewModelGenerator.generate('CategoryPageViewModel', categoryViewModelData);
    const viewModelPath = path.join(this.viewmodelsDir, 'pages', 'CategoryPageViewModel.ts');
    fs.writeFileSync(viewModelPath, categoryViewModelContent);

    console.log(`✅ Generated ${categoryTypes.length} category pages`);
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
