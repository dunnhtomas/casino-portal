// Lighthouse configuration for comprehensive testing
module.exports = {
  extends: 'lighthouse:default',
  settings: {
    onlyAudits: [
      'first-contentful-paint',
      'largest-contentful-paint',
      'speed-index',
      'cumulative-layout-shift',
      'total-blocking-time',
      'first-meaningful-paint',
      'interactive',
      'metrics',
      'performance-budget',
      'resource-summary',
      'third-party-summary',
      'accessibility',
      'best-practices',
      'seo',
      'pwa'
    ],
    budgets: [
      {
        resourceTypes: ['script'],
        budget: [{ resourceType: 'script', budget: 400 }]
      },
      {
        resourceTypes: ['image'],
        budget: [{ resourceType: 'image', budget: 200 }]
      },
      {
        resourceTypes: ['stylesheet'],
        budget: [{ resourceType: 'stylesheet', budget: 100 }]
      }
    ]
  },
  audits: [
    'metrics/first-contentful-paint',
    'metrics/largest-contentful-paint',
    'metrics/cumulative-layout-shift',
    'metrics/total-blocking-time'
  ],
  categories: {
    performance: {
      title: 'Performance',
      supportedModes: ['navigation'],
      auditRefs: [
        { id: 'first-contentful-paint', weight: 10, group: 'metrics' },
        { id: 'largest-contentful-paint', weight: 25, group: 'metrics' },
        { id: 'cumulative-layout-shift', weight: 25, group: 'metrics' },
        { id: 'total-blocking-time', weight: 30, group: 'metrics' },
        { id: 'speed-index', weight: 10, group: 'metrics' }
      ]
    }
  }
};