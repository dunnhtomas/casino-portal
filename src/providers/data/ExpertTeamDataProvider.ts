/**
 * ExpertTeamDataProvider
 * Single Responsibility: Provide expert team data for any component that needs it
 */

import type { IDataProvider } from '../../core/interfaces/DataProviderInterfaces';

export interface ExpertTeamMember {
  name: string;
  role: string;
  experience: string;
  focus: string;
  avatar?: string;
  bio?: string;
  credentials?: string[];
}

export class ExpertTeamDataProvider implements IDataProvider<ExpertTeamMember[]> {
  provide(): ExpertTeamMember[] {
    return [
      { 
        name: 'Sarah Johnson', 
        role: 'Senior Casino Analyst', 
        experience: '8 years', 
        focus: 'Bonus terms & game analysis',
        credentials: ['Certified Gaming Analyst', 'MBA Finance']
      },
      { 
        name: 'Michael Chen', 
        role: 'Payment Systems Expert', 
        experience: '12 years', 
        focus: 'Banking & security verification',
        credentials: ['PCI DSS Certified', 'Fintech Security Expert']
      },
      { 
        name: 'Emma Rodriguez', 
        role: 'Compliance Specialist', 
        experience: '10 years', 
        focus: 'Licensing & regulatory compliance',
        credentials: ['Legal Gaming Consultant', 'Regulatory Affairs Certified']
      }
    ];
  }
}