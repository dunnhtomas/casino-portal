/**
 * Logo API Testing & Debugging
 * Tests various logo APIs and authentication methods
 */

async function testLogoAPIs() {
  console.log('🔍 Testing Logo APIs & Authentication...\n');
  
  // Test 1: Logo.dev without authentication
  console.log('📊 Test 1: Logo.dev (No Auth)');
  try {
    const logoDevUrl = 'https://img.logo.dev/google.com?size=200';
    console.log(`Testing: ${logoDevUrl}`);
    const response = await fetch(logoDevUrl, { method: 'HEAD' });
    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('✅ Logo.dev works without authentication');
    } else {
      console.log('❌ Logo.dev failed without authentication');
    }
  } catch (error) {
    console.log(`❌ Logo.dev error: ${error.message}`);
  }
  
  console.log('\n📊 Test 2: Brandfetch (With Client ID)');
  try {
    const brandfetchUrl = 'https://asset.brandfetch.io/google.com?c=c_tMIH5E-5PU-vgcmUd_6qrOHMG4lF&w=200';
    console.log(`Testing: ${brandfetchUrl}`);
    const response = await fetch(brandfetchUrl, { method: 'HEAD' });
    console.log(`Status: ${response.status} ${response.statusText}`);
    if (response.ok) {
      console.log('✅ Brandfetch works with client ID');
    } else {
      console.log('❌ Brandfetch failed with client ID');
    }
  } catch (error) {
    console.log(`❌ Brandfetch error: ${error.message}`);
  }
  
  console.log('\n📊 Test 3: Simple Logo URLs');
  const testDomains = ['google.com', 'microsoft.com', 'apple.com'];
  
  for (const domain of testDomains) {
    console.log(`\nTesting domain: ${domain}`);
    
    // Test Logo.dev
    try {
      const logoDevUrl = `https://img.logo.dev/${domain}`;
      const logoDevResponse = await fetch(logoDevUrl, { method: 'HEAD' });
      console.log(`  Logo.dev: ${logoDevResponse.status} ${logoDevResponse.statusText}`);
    } catch (error) {
      console.log(`  Logo.dev: Error - ${error.message}`);
    }
    
    // Test Brandfetch
    try {
      const brandfetchUrl = `https://asset.brandfetch.io/${domain}?c=c_tMIH5E-5PU-vgcmUd_6qrOHMG4lF`;
      const brandfetchResponse = await fetch(brandfetchUrl, { method: 'HEAD' });
      console.log(`  Brandfetch: ${brandfetchResponse.status} ${brandfetchResponse.statusText}`);
    } catch (error) {
      console.log(`  Brandfetch: Error - ${error.message}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log('\n💡 AUTHENTICATION DIAGNOSIS:');
  console.log('- Logo.dev may require authentication or have rate limits');
  console.log('- Brandfetch client ID may be invalid or expired'); 
  console.log('- Both APIs may have CORS restrictions for browser requests');
  console.log('- Server-side requests might work better than client-side');
}

testLogoAPIs()
  .then(() => {
    console.log('\n✅ Logo API testing complete!');
  })
  .catch(error => {
    console.error('❌ Testing failed:', error);
  });