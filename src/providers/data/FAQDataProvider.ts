/**
 * FAQDataProvider
 * Single Responsibility: Handle FAQ data loading and transformation
 */

import type { IAsyncDataProvider } from '../../core/interfaces/DataProviderInterfaces';

export interface FAQItem {
  question: string;
  answer: string;
  category?: string;
  priority?: number;
}

export class FAQDataProvider implements IAsyncDataProvider<FAQItem[]> {
  async provide(): Promise<FAQItem[]> {
    try {
      const faqData = await import('../../../data/faqs.json');
      return this.transformFAQData(faqData.default.homepage || []);
    } catch (error) {
      console.warn('FAQ data not found, returning empty array');
      return [];
    }
  }

  private transformFAQData(faqItems: any[]): FAQItem[] {
    return faqItems.map(item => ({
      question: item.question || item.title,
      answer: item.answer || item.content,
      category: item.category || 'general',
      priority: item.priority || 0
    }));
  }
}