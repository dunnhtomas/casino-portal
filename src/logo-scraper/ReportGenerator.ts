import * as fs from 'fs';

export class ReportGenerator {
  generate(results: any[], casinos: any[], existingLogos: any[]) {
    console.log('\n🌍 GEO-AWARE LOGO SCRAPING RESULTS');
    console.log('===================================');
    console.log(`Total casinos processed: ${casinos.length}`);
    console.log(`Logos found: ${results.length}`);
    console.log(`Success rate: ${((results.length / casinos.length) * 100).toFixed(1)}%`);

    const byCountry: { [key: string]: any[] } = {};
    results.forEach(result => {
      if (!byCountry[result.country]) byCountry[result.country] = [];
      byCountry[result.country].push(result);
    });

    console.log('\n📊 Results by Country:');
    Object.entries(byCountry).forEach(([country, countryResults]) => {
      console.log(`  ${country}: ${countryResults.length} logos`);
    });

    const byQuality: { [key: string]: number } = {};
    results.forEach(result => {
      byQuality[result.quality] = (byQuality[result.quality] || 0) + 1;
    });

    console.log('\n🏆 Quality Distribution:');
    Object.entries(byQuality).forEach(([quality, count]) => {
      console.log(`  ${quality}: ${count} logos`);
    });

    fs.writeFileSync('data/geo-aware-logo-results.json', JSON.stringify(results, null, 2));

    const updatedMapping = [...existingLogos];
    results.forEach(result => {
      const existingIndex = updatedMapping.findIndex(logo => logo.casino === result.casino);
      if (existingIndex !== -1) {
        const existing = updatedMapping[existingIndex];
        const qualityRank = { 'high': 3, 'medium': 2, 'basic': 1 };
        if ((qualityRank[result.quality] || 1) > (qualityRank[existing.quality] || 1)) {
          updatedMapping[existingIndex] = {
            ...existing,
            logoUrl: result.logoUrl,
            quality: result.quality,
            source: result.source,
            geoAware: true
          };
          console.log(`🔄 Updated ${result.casino}: ${existing.quality} → ${result.quality}`);
        }
      } else {
        updatedMapping.push({
          casino: result.casino,
          logoUrl: result.logoUrl,
          quality: result.quality,
          source: result.source,
          geoAware: true
        });
        console.log(`➕ New ${result.casino}: ${result.quality} quality`);
      }
    });

    fs.writeFileSync('data/complete-logo-mapping-geo-aware.json', JSON.stringify(updatedMapping, null, 2));
    console.log('\n✅ Geo-aware results saved!');
    console.log('📁 Results: data/geo-aware-logo-results.json');
    console.log('📁 Updated mapping: data/complete-logo-mapping-geo-aware.json');
  }
}
