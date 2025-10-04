export class ContentTypeBreakdownGenerator {
  generate() {
    return {
      casinoReviews: {
        count: 400,
        priority: 'High',
        topics: [
          'Individual casino reviews (300)',
          'Casino comparison pages (50)',
          'Category reviews (best slots casinos, live dealer, etc.) (50)'
        ],
        keywordTargets: [
          '{Casino Name} review',
          'Best {Casino Type} casino',
          '{Casino Name} bonus code',
          'Is {Casino Name} safe',
          '{Casino Name} Canada'
        ]
      },
      gameGuides: {
        count: 500,
        priority: 'High',
        topics: [
          'Slot game guides (200)',
          'Table game strategies (150)',
          'Live dealer guides (50)',
          'Poker tutorials (50)',
          'Game rules and variations (50)'
        ],
        keywordTargets: [
          'How to play {Game}',
          '{Game} strategy',
          'Best {Game} casinos',
          '{Game} rules',
          '{Game} tips'
        ]
      },
      regionalContent: {
        count: 300,
        priority: 'Medium-High',
        topics: [
          'Provincial guides (50)',
          'City-specific content (100)',
          'Legal information (50)',
          'Payment method guides (50)',
          'Local casino events (50)'
        ],
        keywordTargets: [
          'Online casino {Province}',
          'Casino {City}',
          'Gambling laws {Province}',
          '{Payment Method} casino Canada'
        ]
      },
      bonusGuides: {
        count: 200,
        priority: 'Medium',
        topics: [
          'Bonus type explanations (50)',
          'How to claim guides (50)',
          'Terms and conditions breakdowns (50)',
          'Bonus comparison pages (50)'
        ],
        keywordTargets: [
          '{Bonus Type} casino bonus',
          'How to claim casino bonus',
          'Best casino bonuses Canada',
          '{Bonus Type} terms and conditions'
        ]
      },
      newsArticles: {
        count: 400,
        priority: 'Medium',
        topics: [
          'Industry news (200)',
          'New casino launches (100)',
          'Regulatory updates (50)',
          'Game releases (50)'
        ],
        keywordTargets: [
          'Casino news {Year}',
          'New casino {Month}',
          'Online gambling news Canada',
          '{Topic} casino update'
        ]
      },
      landingPages: {
        count: 200,
        priority: 'High',
        topics: [
          'Category landing pages (50)',
          'Feature-based pages (50)',
          'Promotional pages (50)',
          'Tool/calculator pages (50)'
        ],
        keywordTargets: [
          'Best {Category} casino',
          'Casino with {Feature}',
          '{Tool} casino calculator'
        ]
      }
    };
  }
}
