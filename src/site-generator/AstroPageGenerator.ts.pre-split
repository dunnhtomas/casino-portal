export class AstroPageGenerator {
  constructor(private pageStructures: any) {}

  generate(pageType: string, data: any) {
    const structure = this.pageStructures[pageType];
    if (!structure) {
      throw new Error(`Unknown page type: ${pageType}`);
    }
    const imports = this.generateImports(structure, pageType);
    const frontmatter = this.generateFrontmatter(structure, data, pageType);
    const pageContent = this.generatePageContent(structure, data, pageType);
    return `---
${imports}

${frontmatter}
---

${pageContent}`;
  }

  private generateImports(structure: any, pageType: string) {
    let imports: string[] = [];
    if (structure.layout === 'PageLayout') {
      imports.push(`import PageLayout from '../components/Layout/PageLayout.astro';`);
    } else {
      imports.push(`import SimplePageLayout from '../components/Layout/SimplePageLayout.astro';`);
    }
    structure.sections.forEach((section: string) => {
      const sectionPath = this.getSectionImportPath(section);
      imports.push(`import ${section} from '${sectionPath}';`);
    });
    imports.push(`import { ${structure.viewModel} } from '../viewmodels/${this.getViewModelPath(structure.viewModel)}';`);
    if (pageType === 'review') {
      imports.push(`import casinos from '../../data/casinos.json';`);
    }
    imports.push(`import '../styles/main.css';`);
    return imports.join('\n');
  }

  private generateFrontmatter(structure: any, data: any, pageType: string) {
    let frontmatter: string[] = [];
    if (pageType === 'review') {
      frontmatter.push(`const { params } = Astro;`);
      frontmatter.push(`const slug = params.slug;`);
      frontmatter.push(``);
      frontmatter.push(`// Initialize ViewModel with slug`);
      frontmatter.push(`const viewModel = new ${structure.viewModel}();`);
      frontmatter.push(`let pageData;`);
      frontmatter.push(`let hasError = false;`);
      frontmatter.push(``);
      frontmatter.push(`try {`);
      frontmatter.push(`  viewModel.setSlug(slug);`);
      frontmatter.push(`  pageData = await viewModel.getPageData();`);
      frontmatter.push(`} catch (error) {`);
      frontmatter.push(`  hasError = true;`);
      frontmatter.push(`  pageData = viewModel.getNotFoundPageData();`);
      frontmatter.push(`}`);
      frontmatter.push(``);
      frontmatter.push(`export async function getStaticPaths() {`);
      frontmatter.push(`  return ${data.staticPaths || 'casinos.map(c=> ({ params: { slug: c.slug } }))'};`);
      frontmatter.push(`}`);
    } else {
      frontmatter.push(`// Initialize ViewModel and get all page data`);
      frontmatter.push(`const viewModel = new ${structure.viewModel}();`);
      if (data.slug) {
        frontmatter.push(`viewModel.setSlug('${data.slug}');`);
      }
      frontmatter.push(`const pageData = await viewModel.getPageData();`);
    }
    return frontmatter.join('\n');
  }

  private generatePageContent(structure: any, data: any, pageType: string) {
    let content: string[] = [];
    if (structure.layout === 'PageLayout') {
      content.push(`<PageLayout`);
      content.push(`  seoMetadata={pageData.seoMetadata}`);
      content.push(`  schemaMarkup={pageData.schemaMarkup}`);
      content.push(`  navigation={pageData.navigation}`);
      content.push(`  affiliateDisclosure={pageData.affiliateDisclosure || pageData.content.affiliateDisclosure}`);
      content.push(`>`);
      structure.sections.forEach((section: string) => {
        content.push(`  <!-- ${section} -->`);
        const sectionProps = this.getSectionProps(section, pageType);
        if (sectionProps) {
          content.push(`  <${section} ${sectionProps} />`);
        } else {
          content.push(`  <${section} />`);
        }
        content.push(``);
      });
      content.push(`</PageLayout>`);
    } else {
      content.push(`<SimplePageLayout`);
      content.push(`  title={pageData.metadata.title}`);
      content.push(`  description={pageData.metadata.description}`);
      content.push(`  breadcrumbs={pageData.navigation.breadcrumbs}`);
      content.push(`>`);
      if (pageType === 'review') {
        content.push(`  {pageData.schemaMarkup.review &&`);
        content.push(`    <script type="application/ld+json" set:html={JSON.stringify(pageData.schemaMarkup.review)} slot="head"></script>`);
        content.push(`  }`);
        content.push(``);
      }
      content.push(`  <main class="page-main">`);
      if (pageType === 'review') {
        content.push(`    {!hasError ? (`);
        content.push(`      <${structure.wrapper} class="${structure.containerClass}">`);
        structure.sections.forEach((section: string) => {
          content.push(`        <!-- ${section} -->`);
          const sectionProps = this.getSectionProps(section, pageType);
          if (sectionProps) {
            content.push(`        <${section} ${sectionProps} />`);
          } else {
            content.push(`        <${section} />`);
          }
          content.push(``);
        });
        content.push(`      </${structure.wrapper}>`);
        content.push(`    ) : (`);
        content.push(`      <div class="container mx-auto px-6 py-16 text-center">`);
        content.push(`        <div class="bg-white rounded-2xl shadow-xl p-8">`);
        content.push(`          <h1 class="text-3xl font-bold text-gray-800 mb-4">${data.notFoundTitle || 'Content Not Found'}</h1>`);
        content.push(`          <p class="text-gray-600 mb-6">${data.notFoundMessage || 'Sorry, we couldn\\'t find the content you\\'re looking for.'}</p>`);
        content.push(`          <a`);
        content.push(`            href="${data.backLink || '/'}"`);
        content.push(`            class="inline-block bg-amber-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-amber-600 transition-colors"`);
        content.push(`          >`);
        content.push(`            ${data.backLinkText || 'Go Back →'}`);
        content.push(`          </a>`);
        content.push(`        </div>`);
        content.push(`      </div>`);
        content.push(`    )}`);
      } else {
        content.push(`    <${structure.wrapper} class="${structure.containerClass}">`);
        structure.sections.forEach((section: string) => {
          content.push(`      <!-- ${section} -->`);
          const sectionProps = this.getSectionProps(section, pageType);
          if (sectionProps) {
            content.push(`      <${section} ${sectionProps} />`);
          } else {
            content.push(`      <${section} />`);
          }
          content.push(``);
        });
        content.push(`    </${structure.wrapper}>`);
      }
      content.push(`  </main>`);
      content.push(`</SimplePageLayout>`);
    }
    return content.join('\n');
  }

  private getSectionImportPath(section: string) {
    const sectionMappings: { [key: string]: string } = {
      'Hero': '../components/Sections/Hero.astro',
      'Benefits': '../components/Sections/Benefits.astro',
      'TopThree': '../components/Sections/TopThree.astro',
      'QuickFilters': '../components/Sections/QuickFilters.astro',
      'ComparisonTable': '../components/Sections/ComparisonTableSimple.astro',
      'CategoryTiles': '../components/Sections/CategoryTiles.astro',
      'WhyWeRecommend': '../components/Sections/WhyWeRecommend.astro',
      'FastPayoutSpotlight': '../components/Sections/FastPayoutSpotlight.astro',
      'RegionHubs': '../components/Sections/RegionHubs.astro',
      'PopularSlots': '../components/Sections/PopularSlots.astro',
      'BankingMethods': '../components/Sections/BankingMethods.astro',
      'ExpertTeamSection': '../components/Sections/ExpertTeamSection.astro',
      'SupportChannelsSection': '../components/Sections/SupportChannelsSection.astro',
      'FAQSection': '../components/Sections/FAQSection.astro',
      'ReviewHero': '../../components/Reviews/ReviewHero.astro',
      'ReviewQuickFacts': '../../components/Reviews/ReviewQuickFacts.astro',
      'ReviewContent': '../../components/Reviews/ReviewContent.astro',
      'ReviewRatings': '../../components/Reviews/ReviewRatings.astro',
      'ReviewCTA': '../../components/Reviews/ReviewCTA.astro',
      'CategoryHero': '../components/Categories/CategoryHero.astro',
      'CategoryFilters': '../components/Categories/CategoryFilters.astro',
      'CasinoGrid': '../components/Lists/CasinoGrid.astro',
      'CategoryFAQ': '../components/Categories/CategoryFAQ.astro',
      'RelatedCategories': '../components/Categories/RelatedCategories.astro',
      'GuideHero': '../components/Guides/GuideHero.astro',
      'GuideContent': '../components/Guides/GuideContent.astro',
      'GuideSteps': '../components/Guides/GuideSteps.astro',
      'RelatedGuides': '../components/Guides/RelatedGuides.astro',
      'GuideFAQ': '../components/Guides/GuideFAQ.astro',
      'RegionHero': '../components/Regions/RegionHero.astro',
      'RegionCasinos': '../components/Regions/RegionCasinos.astro',
      'RegionLaws': '../components/Regions/RegionLaws.astro',
      'RegionBanking': '../components/Regions/RegionBanking.astro',
      'RegionFAQ': '../components/Regions/RegionFAQ.astro'
    };
    return sectionMappings[section] || `../components/Sections/${section}.astro`;
  }

  private getViewModelPath(viewModelName: string) {
    const viewModelMappings: { [key: string]: string } = {
      'IndexPageViewModel': 'IndexPageViewModel',
      'ReviewPageViewModel': 'pages/ReviewPageViewModel',
      'CategoryPageViewModel': 'pages/CategoryPageViewModel',
      'GuidePageViewModel': 'pages/GuidePageViewModel',
      'RegionPageViewModel': 'pages/RegionPageViewModel'
    };
    return viewModelMappings[viewModelName] || `pages/${viewModelName}`;
  }

  private getSectionProps(section: string, pageType: string) {
    const propMappings: { [key: string]: string } = {
      'ExpertTeamSection': 'expertTeam={pageData.content.expertTeam}',
      'SupportChannelsSection': 'supportChannels={pageData.content.supportChannels}',
      'FAQSection': 'faqItems={pageData.content.faqItems}',
      'ReviewHero': 'heroData={pageData.content.hero}',
      'ReviewQuickFacts': 'quickFacts={pageData.content.quickFacts}',
      'ReviewContent': 'reviewContent={pageData.content.detailed}',
      'ReviewRatings': 'ratingsData={pageData.content.rating}',
      'ReviewCTA': 'ctaData={pageData.content.cta}',
      'CategoryHero': 'heroData={pageData.content.hero}',
      'CategoryFilters': 'filters={pageData.content.filters}',
      'CasinoGrid': 'casinos={pageData.content.casinos}',
      'CategoryFAQ': 'faqItems={pageData.content.faqItems}',
      'RelatedCategories': 'categories={pageData.content.relatedCategories}',
      'GuideHero': 'heroData={pageData.content.hero}',
      'GuideContent': 'content={pageData.content.body}',
      'GuideSteps': 'steps={pageData.content.steps}',
      'RelatedGuides': 'guides={pageData.content.relatedGuides}',
      'GuideFAQ': 'faqItems={pageData.content.faqItems}',
      'RegionHero': 'heroData={pageData.content.hero}',
      'RegionCasinos': 'casinos={pageData.content.casinos}',
      'RegionLaws': 'laws={pageData.content.laws}',
      'RegionBanking': 'banking={pageData.content.banking}',
      'RegionFAQ': 'faqItems={pageData.content.faqItems}'
    };
    return propMappings[section] || null;
  }
}
