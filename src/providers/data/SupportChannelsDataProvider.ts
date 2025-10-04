/**
 * SupportChannelsDataProvider
 * Single Responsibility: Provide support channel information
 */

import type { IDataProvider } from '../../core/interfaces/DataProviderInterfaces';

export interface SupportChannel {
  icon: string;
  title: string;
  description: string;
  bgColor: string;
  availability?: string;
  responseTime?: string;
  contactMethod?: string;
}

export class SupportChannelsDataProvider implements IDataProvider<SupportChannel[]> {
  provide(): SupportChannel[] {
    return [
      {
        icon: '💬',
        title: 'Live Chat',
        description: 'Instant support available 24/7',
        bgColor: 'bg-green-100',
        availability: '24/7',
        responseTime: 'Instant',
        contactMethod: 'chat'
      },
      {
        icon: '📧',
        title: 'Email Support', 
        description: 'Detailed responses within hours',
        bgColor: 'bg-blue-100',
        availability: 'Business Hours',
        responseTime: '2-4 hours',
        contactMethod: 'email'
      },
      {
        icon: '📞',
        title: 'Phone Support',
        description: 'Speak directly with support agents', 
        bgColor: 'bg-purple-100',
        availability: '9 AM - 9 PM EST',
        responseTime: 'Immediate',
        contactMethod: 'phone'
      }
    ];
  }
}