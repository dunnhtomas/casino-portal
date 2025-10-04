/**
 * Hybrid Logo Testing - Major vs Smaller Casinos
 * Tests Logo.dev with major casino brands vs Brandfetch for smaller ones
 */

const majorCasinoDomainsForLogoDev = {
  'bet365': 'bet365.com',
  'stake': 'stake.com', 
  'pokerstars': 'pokerstars.com',
  'betfair': 'betfair.com',
  'williamhill': 'williamhill.com',
  '888casino': '888casino.com',
  'ladbrokes': 'ladbrokes.com',
  'betway': 'betway.com'
};

const smallerCasinosForBrandfetch = {
  'spellwin': 'spellwin.com',
  'winitbet': 'winit.bet', 
  'unlimluck': 'unlimluck.com',
  'mr-pacho': 'mrpacho.com',
  'larabet': 'larabet.com'
};

async function testHybridApproach() {
  console.log('🔬 Testing Hybrid Logo Approach (Logo.dev + Brandfetch)...\n');
  
  // Test Logo.dev with major casinos
  console.log('🏆 Testing Logo.dev with MAJOR casino brands:');
  for (const [brand, domain] of Object.entries(majorCasinoDomainsForLogoDev)) {
    try {
      const logoUrl = `https://img.logo.dev/${domain}?size=400&format=png&fallback=monogram`;
      const response = await fetch(logoUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`✅ ${brand}: Logo.dev SUCCESS (${response.status})`);
      } else {
        console.log(`❌ ${brand}: Logo.dev failed (${response.status})`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`🚨 ${brand}: Error - ${error.message}`);
    }
  }
  
  console.log('\n🎰 Testing Brandfetch with SMALLER casino brands:');
  const BRANDFETCH_CLIENT_ID = 'c_tMIH5E-5PU-vgcmUd_6qrOHMG4lF'; // Your client ID
  
  for (const [brand, domain] of Object.entries(smallerCasinosForBrandfetch)) {
    try {
      const logoUrl = `https://asset.brandfetch.io/${domain}?c=${BRANDFETCH_CLIENT_ID}&fallback=transparent&w=400&h=200`;
      const response = await fetch(logoUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`✅ ${brand}: Brandfetch SUCCESS (${response.status})`);
      } else {
        console.log(`❌ ${brand}: Brandfetch failed (${response.status})`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (error) {
      console.log(`🚨 ${brand}: Error - ${error.message}`);
    }
  }
  
  console.log('\n💡 HYBRID STRATEGY RECOMMENDATIONS:');
  console.log('✅ Use Logo.dev for major casino brands (bet365, stake, pokerstars, etc.)');
  console.log('✅ Use Brandfetch for smaller/newer casino brands'); 
  console.log('✅ Use local fallback images when both APIs fail');
  console.log('✅ This approach maximizes logo authenticity across all casino types');
}

testHybridApproach()
  .then(() => {
    console.log('\n🎯 Hybrid logo strategy testing complete!');
  })
  .catch(error => {
    console.error('❌ Testing failed:', error);
  });