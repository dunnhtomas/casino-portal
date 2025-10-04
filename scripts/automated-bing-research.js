
// Automated Bing Search Script
// Run this after the sequential thinking MCP guides the search

const casinos = [
  {
    "slug": "spellwin",
    "brand": "SpellWin",
    "originalUrl": "https://www.spellwin.com",
    "currentDomain": "spellwin.com"
  },
  {
    "slug": "winitbet",
    "brand": "Winit.Bet",
    "originalUrl": "https://www.winit.bet",
    "currentDomain": "winit.bet"
  },
  {
    "slug": "unlimluck",
    "brand": "UnlimLuck",
    "originalUrl": "https://www.unlimluck.com",
    "currentDomain": "unlimluck.com"
  },
  {
    "slug": "mr-pacho",
    "brand": "Mr Pacho",
    "originalUrl": "https://www.mrpacho.com",
    "currentDomain": "mrpacho.com"
  },
  {
    "slug": "larabet",
    "brand": "Larabet",
    "originalUrl": "https://www.larabet.com",
    "currentDomain": "larabet.com"
  }
];

async function researchCasino(page, casino) {
  const query = `${casino.brand} casino official website`;
  
  // Type search query
  await page.fill('input[name="q"]', query);
  await page.press('input[name="q"]', 'Enter');
  await page.waitForLoadState('networkidle');
  
  // Extract top result
  const topResult = await page.locator('#b_results .b_algo').first();
  const link = await topResult.locator('h2 a').getAttribute('href');
  const title = await topResult.locator('h2 a').textContent();
  
  console.log(`${casino.brand}: ${link}`);
  
  return {
    ...casino,
    realDomain: new URL(link).hostname.replace('www.', ''),
    officialUrl: link,
    bingTopResult: title
  };
}

// Use with Playwright MCP
for (const casino of casinos) {
  const result = await researchCasino(page, casino);
  console.log(result);
}
