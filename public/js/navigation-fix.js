/**
 * Navigation Port Fix - Professional Edition
 * Ensures navigation links preserve the current port and origin in all environments
 * Handles development, Docker, and production deployments seamlessly
 */

(function() {
  'use strict';
  
  // Configuration
  const DEBUG = false; // Set to true for debugging
  
  // Helper function for logging
  function log(...args) {
    if (DEBUG) {
      console.log('[NavigationFix]', ...args);
    }
  }
  
  // Check if we need to fix navigation
  function needsNavigationFix() {
    const currentPort = window.location.port;
    const protocol = window.location.protocol;
    
    // Fix needed if:
    // 1. Non-standard HTTP port (not 80)
    // 2. Non-standard HTTPS port (not 443)
    // 3. Local development (localhost, 127.0.0.1)
    // 4. Docker containers (typically non-standard ports)
    
    const isNonStandardPort = (
      (protocol === 'http:' && currentPort && currentPort !== '80') ||
      (protocol === 'https:' && currentPort && currentPort !== '443')
    );
    
    const isLocalDevelopment = (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local')
    );
    
    return isNonStandardPort || isLocalDevelopment;
  }
  
  // Fix a single link
  function fixLink(link) {
    const originalHref = link.getAttribute('href');
    
    if (!originalHref) return;
    
    // Only fix internal relative links that start with /
    if (originalHref.startsWith('/') && !originalHref.startsWith('//')) {
      const newHref = window.location.origin + originalHref;
      link.setAttribute('href', newHref);
      link.setAttribute('data-navigation-fixed', 'true');
      log('Fixed link:', originalHref, '->', newHref);
    }
  }
  
  // Fix all navigation links
  function fixAllNavigationLinks() {
    // Find all internal navigation links that haven't been fixed yet
    const internalLinks = document.querySelectorAll('a[href^="/"]:not([href^="//"]):not([data-navigation-fixed])');
    
    log('Found', internalLinks.length, 'links to fix');
    
    internalLinks.forEach(fixLink);
  }
  
  // Set up mutation observer for dynamic content
  function setupMutationObserver() {
    const observer = new MutationObserver(function(mutations) {
      let needsUpdate = false;
      
      mutations.forEach(function(mutation) {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node;
            
            // Check if the added node is a link or contains links
            if (element.tagName === 'A' && element.getAttribute('href')?.startsWith('/')) {
              fixLink(element);
              needsUpdate = true;
            } else {
              const newLinks = element.querySelectorAll('a[href^="/"]:not([href^="//"]):not([data-navigation-fixed])');
              if (newLinks.length > 0) {
                newLinks.forEach(fixLink);
                needsUpdate = true;
              }
            }
          }
        });
      });
      
      if (needsUpdate) {
        log('Fixed dynamically added links');
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    return observer;
  }
  
  // Initialize the navigation fix
  function init() {
    if (!needsNavigationFix()) {
      log('Navigation fix not needed for this environment');
      return;
    }
    
    log('Initializing navigation fix for', window.location.origin);
    
    // Fix existing links immediately
    fixAllNavigationLinks();
    
    // Set up observer for dynamic content
    setupMutationObserver();
    
    log('Navigation fix initialized successfully');
  }
  
  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  
  // Also expose globally for debugging
  if (DEBUG) {
    window.NavigationFix = {
      init,
      fixAllNavigationLinks,
      needsNavigationFix: needsNavigationFix()
    };
  }
  
})();