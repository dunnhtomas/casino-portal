/**
 * Test Logo.dev with Casino Domains
 * Using simple format: https://img.logo.dev/{domain}
 */

async function testLogoDevWithCasinoDomains() {
  console.log('🧪 Testing Logo.dev with Casino Domains (Simple Format)...\n');
  
  const testDomains = [
    'spellwin.com',
    'winit.bet',
    'larabet.com',
    'google.com', // Known working
    'apple.com',  // Known working
    'bet365.com',
    'pokerstars.com'
  ];
  
  const results = [];
  
  for (const domain of testDomains) {
    try {
      const logoUrl = `https://img.logo.dev/${domain}`;
      console.log(`Testing: ${logoUrl}`);
      
      const response = await fetch(logoUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`✅ ${domain}: SUCCESS (${response.status})`);
        results.push({ domain, status: 'success', code: response.status });
      } else {
        console.log(`❌ ${domain}: FAILED (${response.status})`);
        results.push({ domain, status: 'failed', code: response.status });
      }
      
      await new Promise(resolve => setTimeout(resolve, 200));
      
    } catch (error) {
      console.log(`🚨 ${domain}: ERROR - ${error.message}`);
      results.push({ domain, status: 'error', error: error.message });
    }
  }
  
  console.log('\n📊 LOGO.DEV TEST RESULTS:');
  const successful = results.filter(r => r.status === 'success');
  const failed = results.filter(r => r.status !== 'success');
  
  console.log(`✅ Working domains: ${successful.length}`);
  console.log(`❌ Failed domains: ${failed.length}`);
  
  if (successful.length > 0) {
    console.log('\n✅ WORKING DOMAINS:');
    successful.forEach(r => console.log(`  ${r.domain} (${r.code})`));
  }
  
  if (failed.length > 0) {
    console.log('\n❌ FAILED DOMAINS:');
    failed.forEach(r => console.log(`  ${r.domain} (${r.code || r.error})`));
  }
  
  return results;
}

testLogoDevWithCasinoDomains()
  .then(() => {
    console.log('\n🎯 Logo.dev testing complete!');
  })
  .catch(error => {
    console.error('❌ Testing failed:', error);
  });