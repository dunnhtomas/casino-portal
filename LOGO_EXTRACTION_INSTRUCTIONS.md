
🎰 CASINO LOGO EXTRACTION INSTRUCTIONS
=====================================

## STEP 1: Manual Playwright Logo Extraction
Use these MCP commands to extract logos from casino homepages:


1. SpellWin (https://www.spellwin.com)
   Command: mcp_playwright_browser_navigate
   URL: "https://www.spellwin.com"
   Look for: Logo in header/navigation area
   Expected: spellwin.png

2. Winit (https://www.winit.bet)
   Command: mcp_playwright_browser_navigate
   URL: "https://www.winit.bet"
   Look for: Logo in header/navigation area
   Expected: winitbet.png

3. UnlimLuck (https://www.unlimluck.com)
   Command: mcp_playwright_browser_navigate
   URL: "https://www.unlimluck.com"
   Look for: Logo in header/navigation area
   Expected: unlimluck-hb-v2.png

4. Mr Pacho (https://www.mrpacho.com)
   Command: mcp_playwright_browser_navigate
   URL: "https://www.mrpacho.com"
   Look for: Logo in header/navigation area
   Expected: mr-pacho.png

5. Larabet (https://www.larabet.com)
   Command: mcp_playwright_browser_navigate
   URL: "https://www.larabet.com"
   Look for: Logo in header/navigation area
   Expected: larabet.png


## STEP 2: Batch Logo Download
Use image downloader MCP with the generated download list:

Total URLs to try: 50
Download file: logo-download-batch.json

## STEP 3: Verify Results
Check downloaded logos for:
- ✅ Correct casino branding
- ✅ High quality (min 200x100px)
- ✅ Proper format (PNG preferred)
- ✅ Transparent background when possible

## NEXT ACTIONS:
1. Execute Playwright commands to find logos on casino homepages
2. Use image downloader MCP to download potential logo URLs
3. Review and select best quality logos for each casino
4. Rename files to match casino slugs
