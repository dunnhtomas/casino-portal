/**
 * ContentManager
 * Single Responsibility: Coordinate content data from various providers
 */

import type { ExpertTeamMember, ExpertTeamDataProvider } from '../providers/data/ExpertTeamDataProvider';
import type { SupportChannel, SupportChannelsDataProvider } from '../providers/data/SupportChannelsDataProvider';
import type { FAQItem, FAQDataProvider } from '../providers/data/FAQDataProvider';
import type { AffiliateDisclosure, AffiliateDisclosureProvider } from '../providers/data/AffiliateDisclosureProvider';

export interface ContentData {
  expertTeam: ExpertTeamMember[];
  supportChannels: SupportChannel[];
  faqItems: FAQItem[];
  affiliateDisclosure: AffiliateDisclosure;
}

export class ContentManager {
  constructor(
    private expertTeamProvider: ExpertTeamDataProvider,
    private supportChannelsProvider: SupportChannelsDataProvider,
    private faqProvider: FAQDataProvider,
    private affiliateProvider: AffiliateDisclosureProvider
  ) {}

  async getContentData(): Promise<ContentData> {
    const [expertTeam, supportChannels, faqItems, affiliateDisclosure] = await Promise.all([
      Promise.resolve(this.expertTeamProvider.provide()),
      Promise.resolve(this.supportChannelsProvider.provide()),
      this.faqProvider.provide(),
      Promise.resolve(this.affiliateProvider.provide())
    ]);

    return {
      expertTeam,
      supportChannels,
      faqItems,
      affiliateDisclosure
    };
  }
}