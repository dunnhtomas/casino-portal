#!/usr/bin/env node

/**
 * Casino Data Transformation Script
 * Converts campaigns-enhanced-complete.json to the expected casino data format
 */

const fs = require('fs');
const path = require('path');

// Load source data
const sourceDataPath = path.join(__dirname, '..', 'campaigns-enhanced-complete.json');
const targetDataPath = path.join(__dirname, '..', 'data', 'casinos.json');

console.log('🎰 Starting casino data transformation...');

// Helper function to extract payout speed in hours
function extractPayoutSpeed(withdrawalTime) {
  if (!withdrawalTime) return 48;
  
  // Parse common patterns like "24-72 hours", "1-3 business days", "instant"
  const timeStr = withdrawalTime.toLowerCase();
  
  if (timeStr.includes('instant')) return 0;
  if (timeStr.includes('12-24')) return 18;  // Average
  if (timeStr.includes('24-48')) return 36;  // Average
  if (timeStr.includes('24-72')) return 48;  // Average
  if (timeStr.includes('1-3') && timeStr.includes('day')) return 48;  // 2 days average
  if (timeStr.includes('3-5') && timeStr.includes('day')) return 96;  // 4 days average
  if (timeStr.includes('3-7') && timeStr.includes('day')) return 120; // 5 days average
  if (timeStr.includes('1-5') && timeStr.includes('day')) return 72;  // 3 days average
  
  // Extract first number found
  const match = timeStr.match(/(\d+)/);
  if (match) {
    const num = parseInt(match[1]);
    if (timeStr.includes('day')) return num * 24;
    if (timeStr.includes('hour')) return num;
  }
  
  return 48; // Default fallback
}

// Helper function to derive ratings from available data
function deriveRatings(casino) {
  const baseScore = casino.ratings.overall_rating || 4.0;
  const trustScore = casino.ratings.trust_score || 7.0;
  
  // Use available numeric ratings or derive from overall and trust scores
  return {
    security: Math.min(10, trustScore + 1.0),
    fairness: casino.security.rng_certified ? Math.min(10, baseScore * 2.2) : baseScore * 2.0,
    payout: extractPayoutSpeed(casino.payments.withdrawal_time) <= 24 ? 9.5 : 
            extractPayoutSpeed(casino.payments.withdrawal_time) <= 48 ? 8.5 : 7.5,
    bonusValue: casino.bonus.welcome_amount ? Math.min(9.0, baseScore * 2.1) : 6.0,
    games: Math.min(10, (casino.games.total_count / 500) + baseScore + 2.0),
    support: casino.features.live_chat === '24/7' ? Math.min(9.0, baseScore * 2.2) : baseScore * 1.8,
    reputation: Math.min(10, trustScore + 0.5)
  };
}

// Helper function to generate topTags based on casino features
function generateTopTags(casino) {
  const tags = [];
  
  // Payout speed tags
  const payoutHours = extractPayoutSpeed(casino.payments.withdrawal_time);
  if (payoutHours <= 1) tags.push('Instant payouts');
  else if (payoutHours <= 24) tags.push('Fast payouts');
  else if (payoutHours <= 48) tags.push('Quick withdrawals');
  
  // License quality
  if (casino.basic_info.license_authority.includes('Malta') || 
      casino.basic_info.license_authority.includes('UKGC') ||
      casino.basic_info.license_authority.includes('UK Gambling')) {
    tags.push('Premium license');
  }
  
  // Game variety
  if (casino.games.total_count > 3000) tags.push('Massive game selection');
  else if (casino.games.total_count > 2000) tags.push('Great game variety');
  
  // Live dealer
  if (casino.games.live_dealer > 200) tags.push('Excellent live casino');
  else if (casino.games.live_dealer > 100) tags.push('Live dealer games');
  
  // Crypto support
  if (casino.payments.deposit_methods.some(method => 
    method.toLowerCase().includes('bitcoin') || 
    method.toLowerCase().includes('crypto') ||
    method.toLowerCase().includes('ethereum'))) {
    tags.push('Crypto-friendly');
  }
  
  // Mobile optimized
  if (casino.platform.mobile_app) tags.push('Mobile app');
  else if (casino.platform.mobile_optimized) tags.push('Mobile-optimized');
  
  // VIP program
  if (casino.features.vip_program) tags.push('VIP program');
  
  // High bonuses
  const bonusAmount = casino.bonus.welcome_amount;
  if (bonusAmount && (bonusAmount.includes('1000') || bonusAmount.includes('500'))) {
    tags.push('High bonuses');
  }
  
  return tags.slice(0, 3); // Return top 3 tags
}

// Helper function to extract safety information
function extractSafety(casino) {
  const established = casino.basic_info.established;
  const currentYear = new Date().getFullYear();
  const yearsOnline = established ? currentYear - established : 2;
  
  // Derive metrics based on available data
  return {
    yearsOnline,
    complaintRatio: casino.ratings.trust_score > 8 ? 0.01 : 
                   casino.ratings.trust_score > 7 ? 0.02 : 0.03,
    resolvedComplaints: casino.ratings.trust_score > 8 ? 90 :
                       casino.ratings.trust_score > 7 ? 80 : 70,
    termsFlags: casino.features.responsible_gaming ? [] : ["Check T&Cs carefully"]
  };
}

// Main transformation function
function transformCasino(casino) {
  return {
    slug: casino.slug,
    brand: casino.casino_name,
    url: casino.basic_info.website,
    licences: [casino.basic_info.license_authority.replace(/eGaming|Gaming Authority|Gambling Commission/, '').trim()],
    restrictedGeos: casino.geography.restricted_countries?.slice(0, 5) || [],
    providers: casino.games.providers?.slice(0, 8) || [],
    payoutSpeedHours: extractPayoutSpeed(casino.payments.withdrawal_time),
    banking: [
      ...new Set([
        ...casino.payments.deposit_methods?.slice(0, 6) || [],
        ...casino.payments.withdrawal_methods?.slice(0, 4) || []
      ])
    ].slice(0, 8),
    bonuses: {
      welcome: {
        headline: casino.bonus.welcome_amount || "Welcome bonus available",
        wagering: casino.bonus.wagering || "35x",
        maxCashout: casino.bonus.max_bonus ? parseInt(casino.bonus.max_bonus.replace(/[€$£]/g, '')) : null
      }
    },
    safety: extractSafety(casino),
    ratings: deriveRatings(casino),
    topTags: generateTopTags(casino)
  };
}

try {
  // Load and parse source data
  console.log(`📖 Loading source data from: ${sourceDataPath}`);
  const rawData = fs.readFileSync(sourceDataPath, 'utf8');
  const sourceCasinos = JSON.parse(rawData);
  
  console.log(`✅ Found ${sourceCasinos.length} casinos in source data`);
  
  // Transform all casinos
  const transformedCasinos = sourceCasinos
    .filter(casino => casino.slug && casino.casino_name) // Only include valid entries
    .map(transformCasino);
  
  console.log(`🔄 Transformed ${transformedCasinos.length} casinos`);
  
  // Sort by overall rating (derived)
  transformedCasinos.sort((a, b) => {
    const scoreA = (a.ratings.security + a.ratings.fairness + a.ratings.payout + 
                   a.ratings.bonusValue + a.ratings.games + a.ratings.support + 
                   a.ratings.reputation) / 7;
    const scoreB = (b.ratings.security + b.ratings.fairness + b.ratings.payout + 
                   b.ratings.bonusValue + b.ratings.games + b.ratings.support + 
                   b.ratings.reputation) / 7;
    return scoreB - scoreA;
  });
  
  // Write transformed data
  console.log(`💾 Writing transformed data to: ${targetDataPath}`);
  fs.writeFileSync(targetDataPath, JSON.stringify(transformedCasinos, null, 2));
  
  // Log some statistics
  const topCasino = transformedCasinos[0];
  const avgRating = transformedCasinos.reduce((sum, casino) => {
    return sum + (casino.ratings.security + casino.ratings.fairness + casino.ratings.payout + 
                 casino.ratings.bonusValue + casino.ratings.games + casino.ratings.support + 
                 casino.ratings.reputation) / 7;
  }, 0) / transformedCasinos.length;
  
  console.log('\n📊 Transformation Statistics:');
  console.log(`   Total casinos: ${transformedCasinos.length}`);
  console.log(`   Top rated: ${topCasino.brand} (${topCasino.slug})`);
  console.log(`   Average rating: ${avgRating.toFixed(2)}/10`);
  console.log(`   License types: ${[...new Set(transformedCasinos.flatMap(c => c.licences))].length}`);
  console.log(`   Total game providers: ${[...new Set(transformedCasinos.flatMap(c => c.providers))].length}`);
  
  console.log('\n🎉 Casino data transformation completed successfully!');
  
} catch (error) {
  console.error('❌ Error during transformation:', error.message);
  process.exit(1);
}