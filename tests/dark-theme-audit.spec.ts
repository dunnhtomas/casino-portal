import { test, expect } from '@playwright/test';

test.describe('Dark Theme Font Color Audit', () => {
  test.beforeEach(async ({ page }) => {
    // Set dark theme
    await page.goto('http://localhost:3000');
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
  });

  test('Homepage - Check all text colors', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Take screenshot
    await page.screenshot({ path: 'reports/dark-theme-homepage.png', fullPage: true });
    
    // Check for problematic colors
    const elements = await page.locator('body *').all();
    const issues: string[] = [];
    
    for (const element of elements) {
      const color = await element.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const text = el.textContent?.trim() || '';
        if (text.length === 0) return null;
        
        return {
          color: computed.color,
          backgroundColor: computed.backgroundColor,
          text: text.substring(0, 50),
          classes: el.className
        };
      });
      
      if (color) {
        // Check for dark text on dark background
        const rgb = color.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgb) {
          const [_, r, g, b] = rgb.map(Number);
          const brightness = (r + g + b) / 3;
          
          // If text is dark (brightness < 128) on presumably dark background
          if (brightness < 128) {
            issues.push(`Dark text detected: "${color.text}" - color: ${color.color} - classes: ${color.classes}`);
          }
        }
      }
    }
    
    console.log('Font Color Issues Found:', issues.length);
    issues.slice(0, 20).forEach(issue => console.log(issue));
  });

  test('Casino Cards - Check contrast', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Check casino card text
    const cards = await page.locator('.casino-card, [class*="casino"]').all();
    console.log(`Found ${cards.length} casino elements`);
    
    for (let i = 0; i < Math.min(cards.length, 5); i++) {
      const card = cards[i];
      const styles = await card.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          bg: computed.backgroundColor,
          color: computed.color,
          html: el.innerHTML.substring(0, 200)
        };
      });
      console.log(`Card ${i}:`, styles);
    }
  });

  test('Check all headings', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    console.log(`Found ${headings.length} headings`);
    
    for (const heading of headings.slice(0, 10)) {
      const info = await heading.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 50),
          color: computed.color,
          classes: el.className
        };
      });
      console.log(info);
    }
  });

  test('Check all body text', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    const paragraphs = await page.locator('p, span, div').filter({ hasText: /.{10,}/ }).all();
    console.log(`Found ${paragraphs.length} text elements`);
    
    const darkTextElements: any[] = [];
    
    for (const p of paragraphs.slice(0, 30)) {
      const info = await p.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        const rgb = computed.color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (!rgb) return null;
        
        const [_, r, g, b] = rgb.map(Number);
        const brightness = (r + g + b) / 3;
        
        return {
          text: el.textContent?.trim().substring(0, 60),
          color: computed.color,
          brightness,
          classes: el.className,
          tagName: el.tagName
        };
      });
      
      if (info && info.brightness < 128) {
        darkTextElements.push(info);
      }
    }
    
    console.log(`Found ${darkTextElements.length} dark text elements:`);
    darkTextElements.forEach(el => console.log(el));
  });

  test('Visual regression check', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // Scroll through page to load all content
    await page.evaluate(async () => {
      await new Promise<void>((resolve) => {
        let totalHeight = 0;
        const distance = 100;
        const timer = setInterval(() => {
          window.scrollBy(0, distance);
          totalHeight += distance;
          
          if (totalHeight >= document.body.scrollHeight) {
            clearInterval(timer);
            window.scrollTo(0, 0);
            setTimeout(() => resolve(), 500);
          }
        }, 100);
      });
    });
    
    // Take full page screenshot
    await page.screenshot({ 
      path: 'reports/dark-theme-full-audit.png', 
      fullPage: true 
    });
  });
});
