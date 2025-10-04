/**
 * AffiliateDisclosureProvider
 * Single Responsibility: Provide affiliate disclosure text and compliance information
 */

import type { IDataProvider } from '../../core/interfaces/DataProviderInterfaces';

export interface AffiliateDisclosure {
  text: string;
  shortText: string;
  legalCompliance: boolean;
  lastUpdated: string;
}

export class AffiliateDisclosureProvider implements IDataProvider<AffiliateDisclosure> {
  provide(): AffiliateDisclosure {
    return {
      text: "We may receive compensation when you click links to casinos. This doesn't affect our reviews or rankings, which are based solely on our expert analysis.",
      shortText: "Affiliate disclosure: We may earn commission from casino links.",
      legalCompliance: true,
      lastUpdated: new Date().toISOString().split('T')[0]
    };
  }
}