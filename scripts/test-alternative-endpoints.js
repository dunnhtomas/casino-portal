/**
 * Test Alternative Logo.dev API Endpoints
 * Based on Context7 documentation showing different endpoint formats
 */

async function testAlternativeEndpoints() {
  console.log('🔧 Testing Alternative Logo.dev API Endpoints...\n');
  
  const logoDevKey = 'pk_SJblPZ1hRMmjGGRoOmdviQ';
  
  const testDomains = ['google.com', 'apple.com', 'microsoft.com', 'shopify.com'];
  
  for (const domain of testDomains) {
    console.log(`Testing ${domain}:`);
    
    // Format 1: Current format we've been using
    const format1 = `https://img.logo.dev/${domain}?token=${logoDevKey}`;
    console.log(`  Format 1: ${format1}`);
    
    try {
      const response1 = await fetch(format1, { method: 'HEAD' });
      console.log(`    Status: ${response1.status} ${response1.statusText}`);
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
    
    // Format 2: Alternative format from Context7
    const format2 = `https://logo.dev/api/v1/logo/${domain}?token=${logoDevKey}`;
    console.log(`  Format 2: ${format2}`);
    
    try {
      const response2 = await fetch(format2, { method: 'HEAD' });
      console.log(`    Status: ${response2.status} ${response2.statusText}`);
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
    
    // Format 3: Without token (to see base behavior)
    const format3 = `https://img.logo.dev/${domain}`;
    console.log(`  Format 3 (no token): ${format3}`);
    
    try {
      const response3 = await fetch(format3, { method: 'HEAD' });
      console.log(`    Status: ${response3.status} ${response3.statusText}`);
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
    
    // Format 4: Test monogram fallback
    const format4 = `https://img.logo.dev/${domain}?token=${logoDevKey}&fallback=monogram`;
    console.log(`  Format 4 (with monogram): ${format4}`);
    
    try {
      const response4 = await fetch(format4, { method: 'HEAD' });
      console.log(`    Status: ${response4.status} ${response4.statusText}`);
      
      if (response4.ok) {
        // If we get a 200, try to get the actual response to see content type
        const fullResponse = await fetch(format4);
        const contentType = fullResponse.headers.get('content-type');
        const contentLength = fullResponse.headers.get('content-length');
        console.log(`    Content-Type: ${contentType}`);
        console.log(`    Content-Length: ${contentLength} bytes`);
        
        if (contentType && contentType.startsWith('image/')) {
          console.log(`    🎯 SUCCESS! Got actual image data!`);
        }
      }
    } catch (error) {
      console.log(`    Error: ${error.message}`);
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('📊 ENDPOINT TESTING COMPLETE');
  console.log('Looking for working endpoint formats...');
}

testAlternativeEndpoints()
  .catch(error => {
    console.error('❌ Test failed:', error);
  });