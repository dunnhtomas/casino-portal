import { getAffiliateUrlSync } from '../../lib/affiliate-manager-clean';

interface OfferButtonProps {
  readonly href?: string;
  readonly label: string;
  readonly casinoSlug?: string;
  readonly id: string;
  readonly geo?: string;
  readonly priority?: 'affiliate' | 'casino';
}

export default function OfferButton({ 
  href, 
  label, 
  casinoSlug, 
  id, 
  geo = 'GLOBAL',
  priority = 'affiliate'
}: OfferButtonProps) {
  // Get the best URL (affiliate if available, fallback to casino URL)
  const finalUrl = getAffiliateUrlSync({
    casinoSlug,
    fallbackUrl: href,
    geo,
    priority,
    campaignId: id
  });
  
  // Add tracking parameters
  const url = new URL(finalUrl);
  
  // Only add UTM params if it's not already an affiliate link
  if (!url.hostname.includes('trk.bestcasinoportal.com')) {
    url.searchParams.set('utm_source', 'bcp');
    url.searchParams.set('utm_medium', 'rankings');
    url.searchParams.set('utm_campaign', 'sitewide');
    url.searchParams.set('a', id);
  }
  
  return (
    <a 
      href={url.toString()} 
      rel="nofollow sponsored" 
      target="_blank"
      className="inline-flex items-center px-4 py-2 rounded-2xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 focus:outline-none focus:ring transition-colors"
      data-casino={casinoSlug}
      data-campaign={id}
    >
      {label}
    </a>
  );
}