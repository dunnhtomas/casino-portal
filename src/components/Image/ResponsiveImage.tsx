import { useState } from 'react';

interface CasinoLogo {
  url: string;
  source: string;
  domain?: string;
  fallbackChain?: Array<{
    url: string;
    source: string;
    description: string;
  }>;
}

interface ResponsiveImageProps {
  readonly src: string | CasinoLogo;
  readonly alt: string;
  readonly className?: string;
  readonly sizes?: string;
  readonly width?: number;
  readonly height?: number;
  readonly loading?: 'lazy' | 'eager';
}

export default function ResponsiveImage({
  src, 
  alt, 
  className = '', 
  sizes = '(max-width: 640px) 100vw, 50vw',
  width,
  height,
  loading = 'lazy'
}: ResponsiveImageProps) {
  const [currentSrcIndex, setCurrentSrcIndex] = useState(0);
  const [hasErrored, setHasErrored] = useState(false);
  
  // Handle both string URLs and casino logo objects
  const logoObj = typeof src === 'string' ? { url: src, source: 'direct' } : src;
  const imageUrl = logoObj.url;
  
  // Get fallback chain for casino logos
  const fallbackChain = logoObj.fallbackChain || [];
  const currentUrl = currentSrcIndex < fallbackChain.length 
    ? fallbackChain[currentSrcIndex].url 
    : imageUrl;

  // Check if this is an external URL (like Brandfetch API or other external sources)
  const isExternalUrl = currentUrl.startsWith('http://') || currentUrl.startsWith('https://');
  
  // Handle image load errors with fallback chain
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    
    // Log the failed image for debugging (only in development)
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      const currentSource = currentSrcIndex < fallbackChain.length 
        ? fallbackChain[currentSrcIndex].source 
        : logoObj.source;
      console.warn(`Failed to load image from ${currentSource}: ${currentUrl}`);
    }
    
    // Try next fallback in chain
    if (currentSrcIndex < fallbackChain.length - 1) {
      setCurrentSrcIndex(prev => prev + 1);
      return;
    }
    
    // If all fallbacks failed, use final generic fallback
    if (!hasErrored) {
      setHasErrored(true);
      target.src = '/images/casinos/default-casino.svg';
      
      // If that also fails, use a simple SVG placeholder
      target.onerror = () => {
        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjY0IiB2aWV3Qm94PSIwIDAgMTI4IDY0IiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iNjQiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI2NCIgeT0iMzIiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+Q2FzaW5vPC90ZXh0Pjwvc3ZnPg==';
      };
    }
  };

  // For external URLs (Brandfetch API, CloudFront, etc.), use simple img tag with fallback handling
  if (isExternalUrl) {
    return (
      <img 
        src={currentUrl}
        alt={alt}
        className={`${className} rounded-lg border border-gray-200`}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        onError={handleImageError}
        onLoad={() => {
          // Log successful load from Brandfetch API for monitoring
          if (typeof window !== 'undefined' && window.location.hostname === 'localhost' && logoObj.source === 'brandfetch-api') {
            console.log(`✅ Brandfetch logo loaded: ${logoObj.domain}`);
          }
        }}
      />
    );
  }
  
  // Check if this is a local casino logo (has specific path structure)
  const isCasinoLogo = currentUrl.includes('/images/casinos/') && currentUrl.endsWith('.png');
  
  if (isCasinoLogo) {
    // For casino logos, use simple img tag since we have single PNG files
    // No responsive variants for newly extracted logos
    return (
      <img 
        src={currentUrl}
        alt={alt}
        className={`${className} rounded-lg border border-gray-200`}
        width={width || 400}
        height={height || 200}
        loading={loading}
        decoding="async"
        onError={handleImageError}
      />
    );
  }

  // For other images, use the original logic with error handling
  const avif = currentUrl.replace(/\.(png|jpg|jpeg|svg)$/i, '.avif');
  const webp = currentUrl.replace(/\.(png|jpg|jpeg|svg)$/i, '.webp');
  const srcSetAvif = `${avif} 800w, ${avif} 1600w`;
  const srcSetWebp = `${webp} 800w, ${webp} 1600w`;
  const imgSrcSet = `${currentUrl} 800w, ${currentUrl} 1600w`;
  
  return (
    <picture>
      <source type="image/avif" srcSet={srcSetAvif} sizes={sizes} />
      <source type="image/webp" srcSet={srcSetWebp} sizes={sizes} />
      <img 
        src={currentUrl} 
        srcSet={imgSrcSet} 
        sizes={sizes} 
        alt={alt} 
        className={className} 
        width={width}
        height={height}
        loading={loading} 
        decoding="async"
        onError={handleImageError}
      />
    </picture>
  );
}
