// Rating Bar Dynamic Width Script
// This script handles the dynamic width calculation for rating bars
// to replace inline styles with CSS custom properties

document.addEventListener('DOMContentLoaded', function() {
  // Handle rating bars
  const ratingBars = document.querySelectorAll('.rating-bar[data-score]');
  
  ratingBars.forEach(bar => {
    const score = parseFloat(bar.getAttribute('data-score')) || 0;
    const maxScore = parseFloat(bar.getAttribute('data-max-score')) || 10;
    const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
    
    // Set the width using CSS custom property
    bar.style.setProperty('--rating-width', `${percentage}%`);
    bar.style.width = `var(--rating-width)`;
    
    // Add accessibility attributes
    bar.setAttribute('role', 'progressbar');
    bar.setAttribute('aria-valuenow', score.toString());
    bar.setAttribute('aria-valuemin', '0');
    bar.setAttribute('aria-valuemax', maxScore.toString());
    bar.setAttribute('aria-label', `Rating: ${score} out of ${maxScore}`);
  });
  
  // Handle smooth scroll containers
  const scrollContainers = document.querySelectorAll('.smooth-scroll');
  scrollContainers.forEach(container => {
    // Add keyboard navigation support
    container.setAttribute('tabindex', '0');
    container.setAttribute('role', 'region');
    container.setAttribute('aria-label', 'Scrollable content');
    
    // Handle keyboard navigation
    container.addEventListener('keydown', function(e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        container.scrollLeft -= 100;
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        container.scrollLeft += 100;
      }
    });
  });
  
  // Enhanced focus management for FAQ items
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const summary = item.querySelector('summary');
    if (summary) {
      // Add ARIA attributes
      summary.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');
      
      // Update aria-expanded when toggled
      item.addEventListener('toggle', function() {
        summary.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');
      });
      
      // Add keyboard support for better accessibility
      summary.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          item.hasAttribute('open') ? item.removeAttribute('open') : item.setAttribute('open', '');
          summary.setAttribute('aria-expanded', item.hasAttribute('open') ? 'true' : 'false');
        }
      });
    }
  });
});

// Color contrast validation function
function validateColorContrast(foreground, background) {
  // Convert hex to RGB
  function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }
  
  // Calculate relative luminance
  function getLuminance(rgb) {
    const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(c => {
      c = c / 255;
      return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  
  // Calculate contrast ratio
  const fgRgb = hexToRgb(foreground);
  const bgRgb = hexToRgb(background);
  
  if (!fgRgb || !bgRgb) return null;
  
  const fgLum = getLuminance(fgRgb);
  const bgLum = getLuminance(bgRgb);
  
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  
  return (lighter + 0.05) / (darker + 0.05);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { validateColorContrast };
}