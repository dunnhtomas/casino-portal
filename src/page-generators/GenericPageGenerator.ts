import * as fs from 'fs-extra';
import * as path from 'path';

export class GenericPageGenerator {
  constructor(private projectPath: string) {}

  async generate(page: { path: string, title: string }) {
    const pagePath = path.join(this.projectPath, 'src/pages', page.path);
    const pageContent = this.generateGenericPageContent(page.title, page.path);
    await fs.ensureDir(path.dirname(pagePath));
    await fs.writeFile(pagePath, pageContent);
  }

  private generateGenericPageContent(title: string, pagePath: string): string {
    const slug = pagePath.replace('/index.astro', '').replace('/', '');
    return `---
import PageLayout from '../../../components/Layout/PageLayout.astro';
import HeadMeta from '../../../components/Layout/HeadMeta.astro';
import { NavigationCoordinator } from '../../../coordinators/NavigationCoordinator';
import { SEOManager } from '../../../managers/SEOManager';

const navigationCoordinator = new NavigationCoordinator();
const seoManager = new SEOManager();

const seoData = seoManager.generateSEOData({
  title: '${title} | Casino Portal',
  description: \`Comprehensive guide to ${title.toLowerCase()}. Expert insights and recommendations.\`,
  keywords: ['${slug}', 'casino', 'gambling', 'online'],
  url: '/${slug}',
  type: 'website'
});

const breadcrumbs = navigationCoordinator.generateBreadcrumbs('/${slug}');
---

<PageLayout 
  title={seoData.title}
  description={seoData.description}
  breadcrumbs={breadcrumbs}
>
  <HeadMeta slot="head" {...seoData} />
  
  <main class="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
    <section class="bg-gradient-to-r from-gold-600 to-gold-400 text-white py-20">
      <div class="container mx-auto px-6 text-center">
        <h1 class="text-5xl font-bold mb-6">${title}</h1>
        <p class="text-xl text-gold-100 max-w-2xl mx-auto">
          Comprehensive guide and expert recommendations for ${title.toLowerCase()}.
        </p>
      </div>
    </section>

    <section class="container mx-auto px-6 py-16">
      <div class="max-w-4xl mx-auto">
        <div class="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 class="text-3xl font-bold mb-6">Coming Soon!</h2>
          <p class="text-lg text-gray-600 mb-4">
            We're working hard to bring you comprehensive information about ${title.toLowerCase()}.
          </p>
          <p class="text-gray-600">
            In the meantime, check out our other sections or browse our top-rated casinos.
          </p>
        </div>
        
        <div class="text-center">
          <a 
            href="/reviews" 
            class="inline-block bg-gold-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gold-600 transition-colors"
          >
            Browse Casino Reviews →
          </a>
        </div>
      </div>
    </section>
  </main>
</PageLayout>`;
  }
}
