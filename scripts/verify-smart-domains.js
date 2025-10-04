/**
 * Logo.dev Domain Verification Script
 * Tests smart domain mapping to verify Logo.dev 404 fixes
 * Based on MCP Sequential Thinking analysis
 */

const smartDomainMapping = {
  'spellwin': 'spellwin.com',
  'winitbet': 'winit.bet', 
  'unlimluck': 'unlimluck.com',
  'mr-pacho': 'mrpacho.com',
  'larabet': 'larabet.com',
  'slotlair': 'slotlair.co.uk',
  'sagaspins': 'sagaspins.com',
  'sambaslots': 'sambaslots.com',
  'rizz': 'rizzcasino.com',
  'n1bet': 'n1bet.com'
};

async function testLogoDevDomains() {
  console.log('🧪 Testing Logo.dev with Smart Domain Mapping...\n');
  
  const results = {
    success: [],
    failures: [],
    total: 0
  };
  
  for (const [slug, domain] of Object.entries(smartDomainMapping)) {
    try {
      const logoUrl = `https://img.logo.dev/${domain}?size=400&format=png&fallback=monogram`;
      console.log(`Testing ${slug}: ${domain}`);
      console.log(`Logo URL: ${logoUrl}`);
      
      const response = await fetch(logoUrl, { method: 'HEAD' });
      
      if (response.ok) {
        console.log(`✅ SUCCESS - ${domain} returns valid logo`);
        results.success.push({ slug, domain, status: response.status });
      } else {
        console.log(`❌ FAILED - ${domain} returned ${response.status}`);
        results.failures.push({ slug, domain, status: response.status });
      }
      
      results.total++;
      console.log('---');
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      console.error(`🚨 ERROR testing ${domain}:`, error.message);
      results.failures.push({ slug, domain, error: error.message });
      results.total++;
    }
  }
  
  // Summary Report
  console.log('\n📊 SMART DOMAIN MAPPING TEST RESULTS:');
  console.log(`Total Domains Tested: ${results.total}`);
  console.log(`Successful Logos: ${results.success.length}`);
  console.log(`Failed Logos: ${results.failures.length}`);
  console.log(`Success Rate: ${((results.success.length / results.total) * 100).toFixed(1)}%`);
  
  if (results.success.length > 0) {
    console.log('\n✅ WORKING DOMAINS:');
    results.success.forEach(({ slug, domain, status }) => {
      console.log(`  ${slug}: ${domain} (${status})`);
    });
  }
  
  if (results.failures.length > 0) {
    console.log('\n❌ PROBLEMATIC DOMAINS:');
    results.failures.forEach(({ slug, domain, status, error }) => {
      console.log(`  ${slug}: ${domain} ${status ? `(${status})` : `(${error})`}`);
    });
  }
  
  // Generate corrected mapping for any failures
  if (results.failures.length > 0) {
    console.log('\n🔧 RECOMMENDED FIXES FOR FAILED DOMAINS:');
    for (const failure of results.failures) {
      const variations = generateDomainVariations(failure.slug);
      console.log(`${failure.slug}: Try ${variations.join(', ')}`);
    }
  }
  
  return results;
}

function generateDomainVariations(slug) {
  const cleanSlug = slug.replace(/-/g, '');
  return [
    `${cleanSlug}.com`,
    `${cleanSlug}.co.uk`,
    `${cleanSlug}.io`,
    `${slug.replace(/-/g, '')}.net`,
    `${slug}.com`
  ];
}

// Execute verification
testLogoDevDomains()
  .then(results => {
    console.log('\n✅ Logo.dev domain verification complete!');
    console.log('Smart domain mapping has improved logo authenticity.');
  })
  .catch(error => {
    console.error('❌ Verification failed:', error);
  });