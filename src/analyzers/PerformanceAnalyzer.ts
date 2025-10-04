import { execSync } from 'child_process';
import { writeFileSync } from 'fs';

export class PerformanceAnalyzer {
  async analyze(urls: string[]) {
    try {
      const lighthouseConfig = {
        ci: {
          collect: {
            numberOfRuns: 3,
            settings: {
              preset: 'desktop',
              budgetPath: './analysis-results/performance/budget.json',
              extraHeaders: JSON.stringify({
                'User-Agent': 'Casino-Portal-SEO-Bot/1.0'
              })
            }
          },
          assert: {
            preset: 'lighthouse:recommended',
            assertions: {
              'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
              'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
              'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
              'total-blocking-time': ['warn', { maxNumericValue: 300 }],
              'speed-index': ['warn', { maxNumericValue: 3000 }],
              'interactive': ['warn', { maxNumericValue: 3500 }],
              'categories:performance': ['warn', { minScore: 0.8 }],
              'categories:seo': ['warn', { minScore: 0.9 }],
              'categories:accessibility': ['warn', { minScore: 0.85 }],
              'categories:best-practices': ['warn', { minScore: 0.9 }]
            }
          }
        }
      };
      writeFileSync('./lighthouserc.json', JSON.stringify(lighthouseConfig, null, 2));

      const performanceBudgets = [
        {
          path: '/*',
          timings: [
            { metric: 'first-contentful-paint', budget: 2000 },
            { metric: 'largest-contentful-paint', budget: 2500 },
            { metric: 'speed-index', budget: 3000 },
            { metric: 'interactive', budget: 3500 }
          ],
          resourceSizes: [
            { resourceType: 'document', budget: 50 },
            { resourceType: 'script', budget: 200 },
            { resourceType: 'stylesheet', budget: 100 },
            { resourceType: 'image', budget: 300 },
            { resourceType: 'font', budget: 100 },
            { resourceType: 'total', budget: 800 }
          ],
          resourceCounts: [
            { resourceType: 'third-party', budget: 10 },
            { resourceType: 'total', budget: 100 }
          ]
        }
      ];
      writeFileSync('./analysis-results/performance/budget.json', JSON.stringify(performanceBudgets, null, 2));

      for (const url of urls) {
        try {
          console.log(`📊 Analyzing ${url} with Lighthouse...`);
          const lighthouseCommand = `npx lighthouse ${url} --output=json --output=html --output-path=./analysis-results/lighthouse/${url.replace(/[^a-zA-Z0-9]/g, '_')} --chrome-flags="--headless --no-sandbox"`;
          execSync(lighthouseCommand, {
            encoding: 'utf8',
            timeout: 60000,
            cwd: process.cwd()
          });
          console.log(`✅ Lighthouse analysis complete for ${url}`);
        } catch (error) {
          console.log(`⚠️ Lighthouse analysis failed for ${url}: ${(error as Error).message}`);
        }
      }
      return 'Analysis complete - check ./analysis-results/lighthouse/';
    } catch (error) {
      console.log(`❌ Performance analysis error: ${(error as Error).message}`);
      return { error: (error as Error).message };
    }
  }
}
