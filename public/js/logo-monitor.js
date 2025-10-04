/**
 * Client-side logo monitoring script
 * Add this to help monitor and debug logo loading issues
 */

(function() {
  'use strict';
  
  let failedImages = [];
  
  // Monitor all image load failures
  document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
      const img = e.target;
      
      // Only track external casino logos
      if (img.src.includes('google.com') || img.src.includes('gstatic.com')) {
        failedImages.push({
          src: img.src,
          alt: img.alt,
          timestamp: new Date().toISOString()
        });
        
        console.warn('🖼️ Failed to load casino logo:', {
          src: img.src,
          alt: img.alt,
          element: img
        });
      }
    }
  }, true);
  
  // Provide a way to check failed images in console
  window.getFailedLogos = function() {
    console.table(failedImages);
    return failedImages;
  };
  
  // Log summary after page load
  window.addEventListener('load', function() {
    setTimeout(function() {
      if (failedImages.length > 0) {
        console.warn(`🚨 Found ${failedImages.length} failed casino logo(s). Run getFailedLogos() for details.`);
      } else {
        console.log('✅ All casino logos loaded successfully');
      }
    }, 2000);
  });
  
})();