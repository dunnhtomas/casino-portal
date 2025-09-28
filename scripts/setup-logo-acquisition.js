/**
 * Logo Acquisition Setup and Runner
 * Installs dependencies and runs the logo acquisition system
 */

const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function checkAndInstallDependencies() {
    console.log('🔧 Checking dependencies...');
    
    try {
        // Check if package.json has required dependencies
        const packagePath = path.join(__dirname, '..', 'package.json');
        const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
        
        const requiredDeps = {
            'crawlee': '^3.0.0',
            'sharp': '^0.32.0',
            'playwright': '^1.40.0'
        };
        
        const missingDeps = [];
        const currentDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
        
        for (const [dep, version] of Object.entries(requiredDeps)) {
            if (!currentDeps[dep]) {
                missingDeps.push(`${dep}@${version}`);
            }
        }
        
        if (missingDeps.length > 0) {
            console.log(`📦 Installing missing dependencies: ${missingDeps.join(', ')}`);
            
            return new Promise((resolve, reject) => {
                const installCmd = `npm install ${missingDeps.join(' ')}`;
                exec(installCmd, { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
                    if (error) {
                        console.error('❌ Failed to install dependencies:', error.message);
                        reject(error);
                    } else {
                        console.log('✅ Dependencies installed successfully');
                        resolve();
                    }
                });
            });
        } else {
            console.log('✅ All dependencies are already installed');
        }
        
    } catch (error) {
        console.error('❌ Error checking dependencies:', error.message);
        throw error;
    }
}

async function installPlaywrightBrowsers() {
    console.log('🌐 Installing Playwright browsers...');
    
    return new Promise((resolve, reject) => {
        exec('npx playwright install', { cwd: path.join(__dirname, '..') }, (error, stdout, stderr) => {
            if (error) {
                console.warn('⚠️ Playwright browser installation failed:', error.message);
                console.log('📝 You may need to run "npx playwright install" manually');
                resolve(); // Don't fail, just warn
            } else {
                console.log('✅ Playwright browsers installed');
                resolve();
            }
        });
    });
}

async function main() {
    console.log('🎰 Casino Logo Acquisition Setup');
    console.log('=================================\\n');
    
    try {
        // Step 1: Install dependencies
        await checkAndInstallDependencies();
        
        // Step 2: Install Playwright browsers
        await installPlaywrightBrowsers();
        
        // Step 3: Run the logo acquisition
        console.log('\\n🚀 Starting logo acquisition...');
        const { CasinoLogoAcquisition } = require('./acquire-casino-logos.js');
        
        const logoAcquisition = new CasinoLogoAcquisition();
        await logoAcquisition.initialize();
        
        // Check existing logos first
        const existing = await logoAcquisition.checkExistingLogos();
        console.log(`📊 Found ${existing.length} existing logos`);
        
        // Ask user if they want to proceed
        console.log('\\n❓ This will attempt to acquire logos from casino websites.');
        console.log('📝 This process respects robots.txt and uses ethical scraping practices.');
        console.log('⚖️ Logos are acquired under fair use for comparison purposes.');
        
        // For now, let's create a few sample logos to demonstrate the system
        await createSampleLogos(logoAcquisition);
        
    } catch (error) {
        console.error('❌ Setup failed:', error.message);
        process.exit(1);
    }
}

async function createSampleLogos(logoAcquisition) {
    console.log('\\n🎨 Creating sample logos for demonstration...');
    
    // Load first few casinos for demo
    const casinosPath = path.join(__dirname, '..', 'data', 'casinos.json');
    const casinos = JSON.parse(await fs.readFile(casinosPath, 'utf8'));
    const sampleCasinos = casinos.slice(0, 5); // First 5 casinos
    
    for (const casino of sampleCasinos) {
        await logoAcquisition.createFallbackLogo(casino, {
            info: (msg) => console.log(`ℹ️ ${msg}`),
            warn: (msg) => console.log(`⚠️ ${msg}`),
            error: (msg) => console.log(`❌ ${msg}`)
        });
    }
    
    console.log(`\\n✅ Created sample logos for ${sampleCasinos.length} casinos`);
    console.log('🔍 To acquire real logos, run: node scripts/acquire-casino-logos.js');
}

if (require.main === module) {
    main();
}