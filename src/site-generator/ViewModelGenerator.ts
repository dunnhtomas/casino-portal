export class ViewModelGenerator {
  generate(viewModelName: string, data: any): string {
    const template = `import { SEOManager, type SEOMetadata } from '../managers/SEOManager';
import { SchemaMarkupManager } from '../managers/SchemaMarkupManager';
import { NavigationCoordinator } from '../coordinators/NavigationCoordinator';

/**
 * ${viewModelName} - Handles all data transformation and business logic
 * Single Responsibility: ${data.purpose || 'Page data preparation and state management'}
 */
export class ${viewModelName} {
  private seoManager = new SEOManager();
  private schemaManager = new SchemaMarkupManager();
  private navigationCoordinator = new NavigationCoordinator();
  ${data.hasSlug ? '\n  private slug: string = \'\';' : ''}

  ${data.hasSlug ? `setSlug(slug: string) {
    this.slug = slug;
  }

  ` : ''}async getPageData() {
    ${data.dataImports ? data.dataImports.map((imp: any) => `const [${imp.name}] = await Promise.all([
      import('${imp.path}').then(module => module.default)
    ]);`).join('\n    ') : ''}

    return {
      seoMetadata: this.seoManager.generate${data.seoMethod || 'PageMetadata'}(${data.hasSlug ? 'this.slug' : ''}),
      schemaMarkup: ${JSON.stringify(data.schemaMarkup, null, 8).replace(/"/g, '').replace(/,\n/g, ',\n      ')},
      navigation: {
        main: this.navigationCoordinator.generateMainNavigation(),
        footer: this.navigationCoordinator.generateFooterSections(),${data.hasBreadcrumbs ? `\n        breadcrumbs: this.navigationCoordinator.generateBreadcrumbs('${data.breadcrumbType || 'page'}', ${data.hasSlug ? 'this.slug' : 'undefined'})` : ''}
      },
      ${data.metadata ? `metadata: ${JSON.stringify(data.metadata, null, 8).replace(/"/g, '\'')},` : ''}
      content: ${JSON.stringify(data.content, null, 8).replace(/"/g, '\'').replace(/'this\./g, 'this.')}${data.hasAffiliateDisclosure ? `,
      affiliateDisclosure: this.getAffiliateDisclosureText()` : ''}
    };
  }

  ${data.hasNotFound ? `getNotFoundPageData() {
    return {
      seoMetadata: this.seoManager.generateNotFoundMetadata(),
      schemaMarkup: {},
      navigation: {
        main: this.navigationCoordinator.generateMainNavigation(),
        footer: this.navigationCoordinator.generateFooterSections(),
        breadcrumbs: []
      },
      metadata: {
        title: '${data.notFoundTitle || 'Page Not Found'}',
        description: '${data.notFoundDescription || 'The page you are looking for could not be found.'}'
      },
      content: {}
    };
  }

  ` : ''}${data.hasAffiliateDisclosure ? `private getAffiliateDisclosureText(): string {
    return "${data.affiliateText || 'We may receive compensation when you click links to casinos. This doesn\\'t affect our reviews or rankings, which are based solely on our expert analysis.'}";
  }

  ` : ''}${data.helperMethods ? data.helperMethods.map((method: any) => method.code).join('\n\n  ') : ''}
}`;
    return template;
  }
