#!/usr/bin/env node

/**
 * Google Cloud Custom Search Setup Assistant
 * Helps configure Google API for logo fetching
 */

const fs = require('fs').promises;
const path = require('path');

const ENV_FILE = path.join(__dirname, '..', '.env');

async function setupGoogleAPI() {
  console.log('🔧 Google Cloud Custom Search API Setup\n');
  
  console.log('📋 You need the following from Google Cloud Console:');
  console.log('1. 🔑 Google Cloud API Key');
  console.log('   - Go to: https://console.cloud.google.com/apis/credentials');
  console.log('   - Click "Create Credentials" > "API Key"');
  console.log('   - Enable "Custom Search API" for your project');
  console.log('');
  
  console.log('2. 🔍 Custom Search Engine ID');
  console.log('   - Go to: https://cse.google.com/cse/');
  console.log('   - Click "Add" to create a new search engine');
  console.log('   - Sites to search: *.com (or specific casino domains)');
  console.log('   - Search features: Image search enabled');
  console.log('   - Copy the "Search Engine ID"');
  console.log('');

  console.log('💡 API Limits & Pricing:');
  console.log('   - Free tier: 100 searches/day');
  console.log('   - Paid tier: $5 per 1,000 queries (up to 10k/day)');
  console.log('   - Perfect for 79 casinos = 79 queries');
  console.log('');

  // Check if .env file exists
  let envExists = false;
  try {
    await fs.access(ENV_FILE);
    envExists = true;
  } catch (error) {
    // File doesn't exist, that's OK
  }

  if (envExists) {
    const envContent = await fs.readFile(ENV_FILE, 'utf8');
    console.log('📁 Found existing .env file:');
    console.log(envContent);
    console.log('');
  }

  // Create sample .env file
  const sampleEnv = `# Google Cloud Custom Search API Configuration
# Get these from: https://console.cloud.google.com/

# Your Google Cloud API Key (enable Custom Search API)
GOOGLE_API_KEY=your_google_api_key_here

# Your Custom Search Engine ID from https://cse.google.com/cse/
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# Optional: Rate limiting (requests per second)
GOOGLE_API_RATE_LIMIT=10

# Optional: Max retries per casino
GOOGLE_API_MAX_RETRIES=3
`;

  if (!envExists) {
    await fs.writeFile(ENV_FILE, sampleEnv);
    console.log('✅ Created .env template file');
  } else {
    await fs.writeFile(path.join(__dirname, '..', '.env.example'), sampleEnv);
    console.log('✅ Created .env.example template file');
  }

  console.log('');
  console.log('🚀 Next Steps:');
  console.log('1. Edit .env file with your actual API credentials');
  console.log('2. Run: npm run fetch:logos');
  console.log('3. Wait for real casino logos to be downloaded');
  console.log('');

  // Test API connectivity
  if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_SEARCH_ENGINE_ID) {
    console.log('🧪 Testing API connection...');
    try {
      const testUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=test&num=1`;
      const response = await fetch(testUrl);
      const data = await response.json();
      
      if (data.error) {
        console.log('❌ API Test Failed:', data.error.message);
      } else {
        console.log('✅ API Connection Successful!');
        console.log(`📊 Quota Info: ${data.searchInformation?.totalResults || 'N/A'} results available`);
      }
    } catch (error) {
      console.log('❌ API Test Error:', error.message);
    }
    console.log('');
  }

  console.log('📚 Documentation:');
  console.log('- Custom Search API: https://developers.google.com/custom-search/v1/overview');
  console.log('- API Console: https://console.cloud.google.com/apis/api/customsearch.googleapis.com');
  console.log('- Search Engine Setup: https://cse.google.com/cse/');
}

if (require.main === module) {
  setupGoogleAPI().catch(error => {
    console.error('💥 Setup error:', error.message);
    process.exit(1);
  });
}

module.exports = { setupGoogleAPI };