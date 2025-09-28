#!/usr/bin/env node

/**
 * CSS Overflow Fix Generator
 * Creates additional CSS to fix horizontal scroll issues
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Generating CSS overflow fixes...');

const overflowFixCSS = `/* Critical CSS to prevent horizontal overflow */
* {
  box-sizing: border-box;
}

html {
  overflow-x: hidden !important;
  max-width: 100vw !important;
}

body {
  overflow-x: hidden !important;
  max-width: 100vw !important;
  position: relative;
}

main {
  overflow-x: hidden;
  max-width: 100vw;
}

/* Fix container overflow issues */
.max-w-6xl, .max-w-7xl {
  max-width: calc(100vw - 2rem) !important;
}

/* Table responsive fixes */
.overflow-x-auto {
  max-width: 100% !important;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
}

table {
  min-width: 600px;
  max-width: none !important;
}

/* Mobile-specific fixes */
@media (max-width: 768px) {
  .max-w-6xl, .max-w-7xl {
    max-width: calc(100vw - 1rem) !important;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
  
  .px-6 {
    padding-left: 1rem !important;
    padding-right: 1rem !important;
  }
  
  /* Ensure grid doesn't overflow */
  .grid {
    max-width: 100% !important;
  }
  
  /* Fix benefit cards */
  .flex.items-center.gap-3 {
    flex-wrap: wrap;
    max-width: 100% !important;
  }
}

/* Prevent any element from being wider than viewport */
* {
  max-width: 100vw;
}

/* Exception for specifically allowed overflow containers */
.overflow-x-auto * {
  max-width: none;
}
`;

try {
  // Write the overflow fix CSS to the styles directory
  const cssPath = path.join(__dirname, '..', 'src', 'styles', 'overflow-fix.css');
  fs.writeFileSync(cssPath, overflowFixCSS);
  
  console.log('✅ CSS overflow fixes generated');
  console.log(`   📄 File: ${cssPath}`);
  console.log('   🎯 Fixes: Box-sizing, viewport limits, table responsive behavior');
  
} catch (error) {
  console.error('❌ Error generating CSS fixes:', error.message);
  process.exit(1);
}