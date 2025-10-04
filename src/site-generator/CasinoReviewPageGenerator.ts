import * as fs from 'fs';
import * as path from 'path';
import { AstroPageGenerator } from './AstroPageGenerator';
import { ViewModelGenerator } from './ViewModelGenerator';

export class CasinoReviewPageGenerator {
  constructor(
    private astroPageGenerator: AstroPageGenerator,
    private viewModelGenerator: ViewModelGenerator,
    private pagesDir: string,
    private viewmodelsDir: string,
    private casinos: any[]
  ) {}

  generate() {
    console.log('🎰 Generating Casino Review Pages...');
    const reviewsDir = path.join(this.pagesDir, 'reviews');
    this.ensureDirectoryExists(reviewsDir);

    const reviewPageData = {
      staticPaths: 'this.casinos.map(c=> ({ params: { slug: c.slug } }))',
      notFoundTitle: 'Casino Review Not Found',
      notFoundMessage: 'Sorry, we couldn\\\'t find the casino review you\\\'re looking for.',
      backLink: '/reviews',
      backLinkText: 'Browse All Casino Reviews →'
    };

    const reviewPageContent = this.astroPageGenerator.generate('review', reviewPageData);
    fs.writeFileSync(path.join(reviewsDir, '[slug].astro'), reviewPageContent);

    const reviewViewModelData = {
      purpose: 'Casino review page data preparation and state management',
      hasSlug: true,
      seoMethod: 'CasinoReviewMetadata',
      schemaMarkup: {
        review: 'this.schemaManager.generateReviewSchema(this.slug)',
        breadcrumb: 'this.schemaManager.generateBreadcrumbSchema(this.navigationCoordinator.generateBreadcrumbs(\'review\', this.slug).map(item => ({ name: item.label, url: item.href })))'
      },
      hasBreadcrumbs: true,
      breadcrumbType: 'review',
      hasNotFound: true,
      notFoundTitle: 'Casino Review Not Found',
      notFoundDescription: 'The casino review you are looking for could not be found.',
      content: {
        hero: 'this.getHeroData()',
        quickFacts: 'this.getQuickFactsData()',
        detailed: 'this.getDetailedReviewContent()',
        rating: 'this.getRatingData()',
        cta: 'this.getCTAData()'
      },
      helperMethods: [
        {
          code: `private getHeroData() {
    const casino = this.casinos.find(c => c.slug === this.slug);
    if (!casino) return null;
    
    return {
      brand: casino.brand,
      logo: \`/images/casinos/\${casino.slug}-logo.png\`,
      rating: casino.ratings.overall,
      bonus: casino.bonuses.welcome.headline,
      licenses: casino.licences,
      playNowUrl: casino.url
    };
  }`
        },
        {
          code: `private getQuickFactsData() {
    const casino = this.casinos.find(c => c.slug === this.slug);
    if (!casino) return [];
    
    return [
      { label: 'Payout Speed', value: \`\${casino.payoutSpeedHours} hours\`, icon: '⚡' },
      { label: 'Game Providers', value: \`\${casino.providers.length}+ providers\`, icon: '🎮' },
      { label: 'License', value: casino.licences.join(', '), icon: '🛡️' },
      { label: 'Banking Methods', value: \`\${casino.banking.length}+ methods\`, icon: '💳' }
    ];
  }`
        }
      ]
    };

    const reviewViewModelContent = this.viewModelGenerator.generate('ReviewPageViewModel', reviewViewModelData);
    const viewModelPath = path.join(this.viewmodelsDir, 'pages', 'ReviewPageViewModel.ts');
    this.ensureDirectoryExists(path.dirname(viewModelPath));
    fs.writeFileSync(viewModelPath, reviewViewModelContent);

    console.log(`✅ Generated ${this.casinos.length} casino review pages`);
  }

  private ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }
}
