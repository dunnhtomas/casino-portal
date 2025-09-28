interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes?: string;
  width?: number;
  height?: number;
  loading?: 'lazy' | 'eager';
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
  // Check if this is an external URL (like casino logos from APIs)
  const isExternalUrl = src.startsWith('http://') || src.startsWith('https://');
  
  // For external URLs, use simple img tag
  if (isExternalUrl) {
    return (
      <img 
        src={src}
        alt={alt}
        className={`${className} rounded-lg border border-gray-200`}
        width={width}
        height={height}
        loading={loading}
        decoding="async"
        onError={(e) => {
          // Fallback to a default casino logo if external image fails
          (e.target as HTMLImageElement).src = '/images/casino-default-logo.svg';
        }}
      />
    );
  }
  
  // Check if this is a local casino logo (has specific path structure)
  const isCasinoLogo = src.includes('/images/casinos/') && src.endsWith('.png');
  
  if (isCasinoLogo) {
    // For casino logos, use our optimized responsive images
    const basePath = src.replace('.png', '');
    
    return (
      <picture>
        <source 
          type="image/avif" 
          srcSet={`${basePath}-400w.avif 400w, ${basePath}-800w.avif 800w, ${basePath}-1200w.avif 1200w`}
          sizes={sizes}
        />
        <source 
          type="image/webp" 
          srcSet={`${basePath}-400w.webp 400w, ${basePath}-800w.webp 800w, ${basePath}-1200w.webp 1200w`}
          sizes={sizes}
        />
        <img 
          src={src}
          srcSet={`${basePath}-400w.png 400w, ${basePath}-800w.png 800w, ${basePath}-1200w.png 1200w`}
          sizes={sizes}
          alt={alt}
          className={`${className} rounded-lg border border-gray-200`}
          width={width}
          height={height}
          loading={loading}
          decoding="async"
        />
      </picture>
    );
  }

  // For other images, use the original logic
  const avif = src.replace(/\.(png|jpg|jpeg|svg)$/i, '.avif');
  const webp = src.replace(/\.(png|jpg|jpeg|svg)$/i, '.webp');
  const srcSetAvif = `${avif} 800w, ${avif} 1600w`;
  const srcSetWebp = `${webp} 800w, ${webp} 1600w`;
  const imgSrcSet = `${src} 800w, ${src} 1600w`;
  
  return (
    <picture>
      <source type="image/avif" srcSet={srcSetAvif} sizes={sizes} />
      <source type="image/webp" srcSet={srcSetWebp} sizes={sizes} />
      <img 
        src={src} 
        srcSet={imgSrcSet} 
        sizes={sizes} 
        alt={alt} 
        className={className} 
        width={width}
        height={height}
        loading={loading} 
        decoding="async" 
      />
    </picture>
  );
}
