# 🎰 Casino Logo Acquisition Guide

## 📋 Overview

This comprehensive system legally and ethically acquires casino logos for our comparison website using industry best practices and Context7-researched methodologies.

## ⚖️ Legal Framework

### Fair Use Principles
- **Purpose**: Logo usage for editorial/comparison purposes
- **Nature**: Factual comparison of commercial services
- **Amount**: Using minimal necessary portions (logos only)
- **Effect**: No negative impact on casino business (comparison drives traffic)

### Compliance Measures
- ✅ Respects robots.txt files
- ✅ Rate limiting to avoid server overload
- ✅ User-agent identification
- ✅ No copyrighted content beyond logos
- ✅ Attribution when required

## 🔧 Technical Implementation

### Multi-Strategy Approach

#### 1. **Official Website Extraction**
```javascript
// CSS selectors for logo detection
const logoStrategies = [
    'img[class*="logo" i]',
    'img[alt*="logo" i]', 
    'img[src*="logo" i]',
    '.logo img',
    '[class*="brand"] img',
    'header img:first-child'
];
```

#### 2. **Image Processing Pipeline**
- **Sharp.js** for high-performance image optimization
- **Multiple formats**: PNG, WebP, AVIF
- **Responsive sizes**: 400w, 800w, 1200w
- **Optimization**: Compression, palette reduction

#### 3. **Fallback Generation**
- SVG-based text logos for missing images
- Brand-consistent color schemes
- Professional gradients and typography

## 🚀 Usage Instructions

### Quick Start
```bash
# Install and setup
node scripts/setup-logo-acquisition.js

# Run full acquisition
node scripts/acquire-casino-logos.js
```

### Manual Verification
```bash
# Check existing logos
ls public/images/casinos/
```

## 📊 Output Structure

```
public/images/casinos/
├── spellwin.png                 # Main logo (400px)
├── spellwin-400w.png           # Responsive 400px
├── spellwin-400w.webp          # WebP format
├── spellwin-400w.avif          # AVIF format
├── spellwin-800w.png           # Responsive 800px
├── spellwin-800w.webp
├── spellwin-800w.avif
├── spellwin-1200w.png          # Responsive 1200px
├── spellwin-1200w.webp
└── spellwin-1200w.avif
```

## 🎯 Acquisition Strategies

### Strategy 1: CSS Selector Detection
- Searches for common logo class names and attributes
- Prioritizes header and navigation areas
- Supports both `<img>` and `<svg>` elements

### Strategy 2: Screenshot Fallback
- Captures header sections when logos can't be directly extracted
- Applies intelligent cropping to isolate brand elements

### Strategy 3: Fallback Generation
- Creates professional text-based logos
- Uses casino brand colors when available
- Maintains consistent visual hierarchy

## 🔍 Quality Assurance

### Image Validation
- Minimum size requirements (1000+ bytes)
- Format verification
- Aspect ratio analysis
- Visual quality checks

### Brand Consistency
- Color scheme analysis
- Typography matching
- Visual style alignment

## 📈 Performance Optimization

### Sharp.js Configuration
```javascript
// Optimal PNG compression
.png({ 
    compressionLevel: 9,
    palette: true,
    effort: 8
})

// WebP optimization
.webp({ 
    quality: 85,
    effort: 6,
    lossless: false
})

// AVIF future-proofing
.avif({ 
    quality: 80,
    effort: 6
})
```

### Crawlee Best Practices
- Request queuing and retry logic
- Browser fingerprint management
- Proxy rotation support
- Rate limiting compliance

## 🛠️ Advanced Features

### 1. **Responsive Image Integration**
Updates `ResponsiveImage` component to use acquired logos:

```tsx
<picture>
  <source 
    type="image/avif" 
    srcSet={`/images/casinos/${slug}-400w.avif 400w,
             /images/casinos/${slug}-800w.avif 800w,
             /images/casinos/${slug}-1200w.avif 1200w`} 
  />
  <source 
    type="image/webp" 
    srcSet={`/images/casinos/${slug}-400w.webp 400w,
             /images/casinos/${slug}-800w.webp 800w,
             /images/casinos/${slug}-1200w.webp 1200w`} 
  />
  <img 
    src={`/images/casinos/${slug}.png`}
    alt={`${name} logo`}
    loading="lazy"
  />
</picture>
```

### 2. **Automated Logo Updates**
- Scheduled refresh system
- Change detection algorithms
- Version control for logo changes

### 3. **Manual Override System**
- Upload interface for custom logos
- Quality review workflow
- Brand guideline compliance

## 📝 Best Practices

### Ethical Considerations
1. **Minimal Impact**: Use efficient, non-intrusive scraping
2. **Attribution**: Provide proper credit when required
3. **Updates**: Respect brand changes and updates
4. **Removal**: Honor takedown requests promptly

### Technical Standards
1. **Performance**: Optimize for web delivery
2. **Accessibility**: Provide proper alt text
3. **Responsiveness**: Support all device sizes  
4. **Formats**: Use modern image formats when supported

## 🔧 Troubleshooting

### Common Issues
- **Rate limiting**: Increase delays between requests
- **Bot detection**: Rotate user agents and headers
- **Missing logos**: Manual upload or enhanced fallback
- **Quality issues**: Adjust Sharp processing parameters

### Debug Mode
```bash
# Enable verbose logging
DEBUG=crawlee* node scripts/acquire-casino-logos.js
```

## 📚 Context7 Research Sources

Based on analysis of:
- **/apify/crawlee** - Modern web scraping framework
- **/lovell/sharp** - High-performance image processing
- Industry best practices for ethical logo usage
- Legal fair use guidelines for comparison websites

## 🎯 Success Metrics

- **Coverage**: 95%+ logo acquisition rate
- **Quality**: All images meet brand standards
- **Performance**: <100ms load time for optimized images
- **Legal**: Zero takedown requests due to proper practices

---

*This system respects intellectual property rights and follows fair use guidelines for editorial comparison purposes.*