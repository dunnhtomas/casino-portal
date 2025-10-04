/**
 * Color Validation Utility
 * Validates dark theme colors and readability standards
 */

import { Locator } from '@playwright/test';

export interface ColorIssue {
  element: string;
  issue: string;
  currentValue: string;
  recommendation: string;
}

/**
 * Extract RGB values from various color formats
 */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  // Handle rgb/rgba format
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    return {
      r: parseInt(rgbMatch[1]),
      g: parseInt(rgbMatch[2]),
      b: parseInt(rgbMatch[3])
    };
  }
  
  // Handle hex format
  const hexMatch = color.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
  if (hexMatch) {
    return {
      r: parseInt(hexMatch[1], 16),
      g: parseInt(hexMatch[2], 16),
      b: parseInt(hexMatch[3], 16)
    };
  }
  
  return null;
}

/**
 * Calculate relative luminance
 */
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const c1 = parseColor(color1);
  const c2 = parseColor(color2);
  
  if (!c1 || !c2) return 0;
  
  const l1 = getLuminance(c1.r, c1.g, c1.b);
  const l2 = getLuminance(c2.r, c2.g, c2.b);
  
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color is dark (for dark theme backgrounds)
 */
export function isDarkColor(color: string): boolean {
  const parsed = parseColor(color);
  if (!parsed) return false;
  
  const luminance = getLuminance(parsed.r, parsed.g, parsed.b);
  return luminance < 0.2; // Dark if luminance below 0.2
}

/**
 * Check if color is light (for text on dark backgrounds)
 */
export function isLightColor(color: string): boolean {
  const parsed = parseColor(color);
  if (!parsed) return false;
  
  const luminance = getLuminance(parsed.r, parsed.g, parsed.b);
  return luminance > 0.5; // Light if luminance above 0.5
}

/**
 * Validate background color is dark theme compliant
 */
export async function validateBackgroundColor(
  element: Locator,
  elementDescription: string
): Promise<ColorIssue | null> {
  const bgColor = await element.evaluate(el => {
    return window.getComputedStyle(el).backgroundColor;
  });
  
  if (!isDarkColor(bgColor) && !bgColor.includes('gradient')) {
    return {
      element: elementDescription,
      issue: 'Background color is not dark theme compliant',
      currentValue: bgColor,
      recommendation: 'Use bg-gray-800, bg-gray-900, or dark gradients'
    };
  }
  
  return null;
}

/**
 * Validate text color is readable on dark background
 */
export async function validateTextColor(
  element: Locator,
  elementDescription: string,
  expectedLight: boolean = true
): Promise<ColorIssue | null> {
  const color = await element.evaluate(el => {
    return window.getComputedStyle(el).color;
  });
  
  const bgColor = await element.evaluate(el => {
    let current = el;
    while (current && current !== document.body) {
      const bg = window.getComputedStyle(current).backgroundColor;
      if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
        return bg;
      }
      current = current.parentElement!;
    }
    return 'rgb(31, 41, 55)'; // Default to gray-800
  });
  
  const contrastRatio = getContrastRatio(color, bgColor);
  
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  if (contrastRatio < 4.5) {
    return {
      element: elementDescription,
      issue: `Poor contrast ratio: ${contrastRatio.toFixed(2)}:1 (needs 4.5:1 minimum)`,
      currentValue: color,
      recommendation: 'Use text-white, text-gray-200, or text-gray-300 for better contrast'
    };
  }
  
  if (expectedLight && !isLightColor(color)) {
    return {
      element: elementDescription,
      issue: 'Text color is too dark for dark theme background',
      currentValue: color,
      recommendation: 'Use text-white (rgb(255, 255, 255)) or text-gray-200/300'
    };
  }
  
  return null;
}

/**
 * Check for problematic color classes in HTML
 */
export async function checkForBadClasses(element: Locator): Promise<string[]> {
  const badClasses = await element.evaluate(el => {
    const classes = el.className;
    const problematic: string[] = [];
    
    // Check for dark text colors on dark backgrounds
    if (classes.includes('text-gray-900') || 
        classes.includes('text-gray-800') ||
        classes.includes('text-gray-700') ||
        classes.includes('text-black')) {
      problematic.push('Dark text color found (text-gray-900/800/700 or text-black)');
    }
    
    // Check for light backgrounds
    if (classes.includes('bg-white') || 
        classes.includes('bg-gray-100') ||
        classes.includes('bg-gray-200')) {
      problematic.push('Light background color found (bg-white/gray-100/200)');
    }
    
    return problematic;
  });
  
  return badClasses;
}

/**
 * Comprehensive color validation for a section
 */
export async function validateSectionColors(
  section: Locator,
  sectionName: string
): Promise<ColorIssue[]> {
  const issues: ColorIssue[] = [];
  
  // Check section background
  const bgIssue = await validateBackgroundColor(section, `${sectionName} background`);
  if (bgIssue) issues.push(bgIssue);
  
  // Check all text elements
  const textElements = await section.locator('h1, h2, h3, h4, h5, h6, p, span, a, li').all();
  
  for (let i = 0; i < Math.min(textElements.length, 10); i++) {
    const el = textElements[i];
    const tagName = await el.evaluate(e => e.tagName.toLowerCase());
    const textIssue = await validateTextColor(el, `${sectionName} ${tagName} #${i + 1}`);
    if (textIssue) issues.push(textIssue);
  }
  
  // Check for bad classes
  const badClasses = await checkForBadClasses(section);
  badClasses.forEach(issue => {
    issues.push({
      element: sectionName,
      issue,
      currentValue: 'Class attribute',
      recommendation: 'Remove dark text colors and light backgrounds'
    });
  });
  
  return issues;
}
