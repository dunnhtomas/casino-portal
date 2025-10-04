/**
 * Simple Logo Download Test
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDownload() {
  console.log('🧪 Testing logo download...');
  
  const OUTPUT_DIR = path.join(__dirname, '../public/images/casinos');
  console.log('Output directory:', OUTPUT_DIR);
  
  // Ensure directory exists
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  console.log('✅ Directory ready');
  
  // Test download from Logo.dev
  try {
    console.log('⬇️  Downloading test logo...');
    const testUrl = 'https://img.logo.dev/google.com';
    const response = await fetch(testUrl);
    
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const buffer = await response.arrayBuffer();
      const outputPath = path.join(OUTPUT_DIR, 'test-logo.png');
      await fs.writeFile(outputPath, Buffer.from(buffer));
      
      const stats = await fs.stat(outputPath);
      console.log(`✅ Downloaded: test-logo.png (${stats.size} bytes)`);
    } else {
      console.log('❌ Download failed:', response.status);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
  
  console.log('🎯 Test complete');
}

testDownload();