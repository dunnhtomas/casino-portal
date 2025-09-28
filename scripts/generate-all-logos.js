/**
 * Quick Logo Generator for All Casinos
 * Creates fallback logos for all casinos in the database
 */

const { CasinoLogoAcquisition } = require('./acquire-casino-logos.js');
const fs = require('fs').promises;
const path = require('path');

async function generateAllLogos() {
    console.log('🎰 Generating logos for all casinos...');
    
    const logoAcquisition = new CasinoLogoAcquisition();
    await logoAcquisition.initialize();
    
    // Load casino data
    const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
    const casinos = JSON.parse(await fs.readFile(casinosPath, 'utf8'));
    
    console.log(`📊 Processing ${casinos.length} casinos...`);
    
    let processed = 0;
    for (const casino of casinos) {
        try {
            await logoAcquisition.createFallbackLogo(casino, {
                info: () => {}, // Silent processing
                warn: () => {},
                error: (msg) => console.log(`❌ ${casino.brand}: ${msg}`)
            });
            processed++;
            
            // Show progress every 10 casinos
            if (processed % 10 === 0) {
                console.log(`📈 Progress: ${processed}/${casinos.length} (${Math.round(processed/casinos.length*100)}%)`);
            }
        } catch (error) {
            console.error(`❌ Failed to create logo for ${casino.brand}: ${error.message}`);
        }
    }
    
    console.log(`✅ Generated logos for ${processed}/${casinos.length} casinos`);
    console.log(`📁 Check: public/images/casinos/`);
}

if (require.main === module) {
    generateAllLogos().catch(console.error);
}

module.exports = { generateAllLogos };