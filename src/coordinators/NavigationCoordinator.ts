import type { INavigationService } from '../interfaces/ServiceInterfaces';

/**
 * NavigationCoordinator - Handles navigation flow and state management  
 * Single Responsibility: Navigation logic and page flow coordination
 */
export interface NavigationItem {
  label: string;
  href: string;
  isExternal?: boolean;
  children?: NavigationItem[];
  badge?: string;
  description?: string;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

export interface FooterSection {
  title: string;
  links: NavigationItem[];
}

export class NavigationCoordinator implements INavigationService {
  private readonly baseUrl = 'https://bestcasinoportal.com';

  generateMainNavigation(): NavigationItem[] {
    return [
      { 
        label: 'Reviews', 
        href: '/reviews',
        children: [
          { label: 'All Casino Reviews', href: '/reviews' },
          { label: 'Top Rated Casinos', href: '/reviews?filter=top-rated' },
          { label: 'New Casino Reviews', href: '/reviews?filter=new' },
          { label: 'Mobile Casinos', href: '/reviews?filter=mobile' }
        ]
      },
      { 
        label: 'Best Casinos', 
        href: '/best',
        children: [
          { label: 'Best Overall', href: '/best' },
          { label: 'Real Money', href: '/best/real-money' },
          { label: 'Fast Withdrawals', href: '/best/fast-withdrawals' },
          { label: 'Mobile Casino', href: '/best/mobile' },
          { label: 'Live Dealer', href: '/best/live-dealer' }
        ]
      },
      { 
        label: 'Bonuses', 
        href: '/bonuses',
        badge: 'Hot',
        children: [
          { label: 'All Bonuses', href: '/bonuses' },
          { label: 'Welcome Bonuses', href: '/bonuses?type=welcome' },
          { label: 'No Deposit Bonuses', href: '/bonuses?type=no-deposit' },
          { label: 'Free Spins', href: '/bonuses?type=free-spins' },
          { label: 'Bonus Codes', href: '/bonus' }
        ]
      },
      { 
        label: 'Games', 
        href: '/games',
        children: [
          { label: 'All Games', href: '/games' },
          { label: 'Slots', href: '/slots' },
          { label: 'Free Games', href: '/free-games' },
          { label: 'Live Dealer', href: '/live-dealer' },
          { label: 'Table Games', href: '/games?category=table' }
        ]
      },
      { 
        label: 'Guides', 
        href: '/guides',
        children: [
          { label: 'All Guides', href: '/guides' },
          { label: 'How We Rate', href: '/guides/how-we-rate' },
          { label: 'Responsible Gambling', href: '/guides/responsible-gambling' },
          { label: 'Payment Methods', href: '/payments' },
          { label: 'Mobile Gaming', href: '/mobile' }
        ]
      },
      { 
        label: 'Regions', 
        href: '/regions',
        children: [
          { label: 'All Regions', href: '/regions' },
          { label: 'Ontario', href: '/regions/ontario' },
          { label: 'Alberta', href: '/regions/alberta' },
          { label: 'British Columbia', href: '/regions/british-columbia' }
        ]
      }
    ];
  }

  generateFooterSections(): FooterSection[] {
    return [
      {
        title: 'Best Casinos',
        links: [
          { label: 'All Best Casinos', href: '/best' },
          { label: 'Real Money Casinos', href: '/best/real-money' },
          { label: 'Fast Withdrawal Casinos', href: '/best/fast-withdrawals' },
          { label: 'Mobile Casinos', href: '/best/mobile' },
          { label: 'Live Dealer Casinos', href: '/best/live-dealer' }
        ]
      },
      {
        title: 'Games & Bonuses',
        links: [
          { label: 'Casino Games', href: '/games' },
          { label: 'Slots', href: '/slots' },
          { label: 'Free Games', href: '/free-games' },
          { label: 'Casino Bonuses', href: '/bonuses' },
          { label: 'Bonus Codes', href: '/bonus' },
          { label: 'Live Dealer Games', href: '/live-dealer' }
        ]
      },
      {
        title: 'Reviews & Guides',
        links: [
          { label: 'Casino Reviews', href: '/reviews' },
          { label: 'Casino Guides', href: '/guides' },
          { label: 'How We Rate Casinos', href: '/guides/how-we-rate' },
          { label: 'Payment Methods', href: '/payments' },
          { label: 'Mobile Gaming Guide', href: '/mobile' }
        ]
      },
      {
        title: 'Regions',
        links: [
          { label: 'All Regions', href: '/regions' },
          { label: 'Ontario Casinos', href: '/regions/ontario' },
          { label: 'Alberta Casinos', href: '/regions/alberta' },
          { label: 'BC Casinos', href: '/regions/british-columbia' }
        ]
      },
      {
        title: 'Legal & Support',
        links: [
          { label: 'Terms of Service', href: '/legal/terms' },
          { label: 'Privacy Policy', href: '/legal/privacy' },
          { label: 'About Us', href: '/legal/about' },
          { label: 'Responsible Gambling', href: '/guides/responsible-gambling' }
        ]
      }
    ];
  }

  generateBreadcrumbs(currentPath: string): BreadcrumbItem[] {
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    const pathSegments = currentPath.split('/').filter(segment => segment);
    let currentHref = '';

    const pathLabels: Record<string, string> = {
      'reviews': 'Casino Reviews',
      'best': 'Best Casinos',
      'bonuses': 'Casino Bonuses',
      'bonus': 'Bonus Codes',
      'games': 'Casino Games',
      'slots': 'Slot Games',
      'free-games': 'Free Games',
      'live-dealer': 'Live Dealer',
      'guides': 'Casino Guides',
      'regions': 'Regional Casinos',
      'payments': 'Payment Methods',
      'mobile': 'Mobile Casinos',
      'legal': 'Legal Information',
      'real-money': 'Real Money Casinos',
      'fast-withdrawals': 'Fast Withdrawal Casinos',
      'how-we-rate': 'How We Rate Casinos',
      'responsible-gambling': 'Responsible Gambling',
      'ontario': 'Ontario Casinos',
      'alberta': 'Alberta Casinos',
      'british-columbia': 'British Columbia Casinos',
      'terms': 'Terms of Service',
      'privacy': 'Privacy Policy',
      'about': 'About Us'
    };

    pathSegments.forEach((segment, index) => {
      currentHref += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      breadcrumbs.push({
        label: pathLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentHref,
        isActive: isLast
      });
    });

    return breadcrumbs;
  }

  isActiveLink(href: string, currentPath: string): boolean {
    if (href === '/' && currentPath === '/') return true;
    if (href !== '/' && currentPath.startsWith(href)) return true;
    return false;
  }
}