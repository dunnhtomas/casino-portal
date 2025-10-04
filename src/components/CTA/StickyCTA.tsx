import { getTopAffiliateOfferSync } from '../../lib/affiliate-manager-clean';
import OfferButton from './OfferButton';

interface StickyCTAProps {
  geo?: string;
  exclude?: string[];
}

export default function StickyCTA({ geo = 'GLOBAL', exclude = [] }: StickyCTAProps) {
  const topOffer = getTopAffiliateOfferSync({ geo, exclude });
  
  if (!topOffer) {
    return null; // Don't show if no top offer available
  }

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-bounce">
      <div className="bg-gray-800 p-3 rounded-full shadow-xl border border-gray-700 flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <div className="text-sm font-semibold text-white">
            🔥 {topOffer.casino} - {topOffer.bonus}
          </div>
        </div>
        <OfferButton
          label="Claim Now"
          casinoSlug={topOffer.slug}
          id={`sticky-${topOffer.slug}`}
          geo={geo}
          priority="affiliate"
        />
      </div>
    </div>
  );
}