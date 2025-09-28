# Real Casino Logo Fetching System

## 🎯 Overview
This system uses Google Cloud Custom Search API to fetch real logos from your partner casinos. Since these casinos are paying to be featured on your website, you have the right to use their branding materials.

## 🔧 Setup Process

### 1. Google Cloud API Setup
```bash
# Run the setup assistant
npm run setup:google-api
```

### 2. Get Google Cloud Credentials

#### A. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Custom Search API"

#### B. Create API Key
1. Go to **APIs & Services > Credentials**
2. Click **"Create Credentials" > "API Key"**
3. Copy your API key
4. Restrict it to "Custom Search API" for security

#### C. Create Custom Search Engine
1. Go to [Google Custom Search](https://cse.google.com/cse/)
2. Click **"Add"** to create new search engine
3. Configure:
   - **Sites to search**: `*.com` (or specific casino domains)
   - **Language**: English
   - **Search features**: Enable "Image search"
   - **SafeSearch**: Moderate
4. Copy the **Search Engine ID**

### 3. Configure Environment
Edit the `.env` file created by the setup:

```env
# Your Google Cloud API Key
GOOGLE_API_KEY=AIzaSyA...your_actual_api_key_here

# Your Custom Search Engine ID  
GOOGLE_SEARCH_ENGINE_ID=017576662512...your_search_engine_id
```

### 4. Fetch Real Logos
```bash
# Fetch all casino logos (this may take 10-15 minutes)
npm run fetch:logos

# Or run with build
npm run logos:fetch
```

## 📊 What It Does

### Logo Search Strategy
For each casino, the system tries multiple search queries:
- `"[Casino Name] casino logo"`
- `"[Casino Name] online casino brand logo"`
- `site:[casino-domain].com logo`
- `"[Casino Name]" casino logo png`

### Image Processing
Each successful logo gets optimized into:
- **PNG**: Original quality fallback (400x200px max)
- **WebP**: Modern format, 3 sizes (400w, 800w, 1200w)
- **AVIF**: Next-gen format, 3 sizes (400w, 800w, 1200w)
- **Responsive**: Perfect for responsive images

### Quality Filters
- Minimum size: 100x50px (avoids favicons)
- Image validation with Sharp.js
- Content-type verification
- Error handling for broken images

## 💰 Pricing & Limits

### Google Custom Search API
- **Free Tier**: 100 searches per day
- **Paid Tier**: $5 per 1,000 queries (up to 10K/day)
- **Your Usage**: ~79 casinos = ~150-200 queries total
- **Cost**: Approximately $1 for all logos

### Rate Limiting
- 10 requests per second maximum
- Built-in delays between searches
- Respects Google's terms of service

## 🚀 Usage

### Quick Start
```bash
# 1. Setup (one time only)
npm run setup:google-api

# 2. Edit .env with your credentials

# 3. Fetch real logos
npm run fetch:logos

# 4. Build with real logos
npm run build

# 5. Deploy with real logos
npm run deploy:with-real-logos
```

### Advanced Usage
```bash
# Setup only
npm run logos:setup

# Fetch and build in one command
npm run logos:fetch

# Build Docker with real logos
npm run deploy:with-real-logos
```

## 📁 Output Structure
```
public/images/casinos/
├── spellwin.png                 # Fallback PNG
├── spellwin-400w.png           # Responsive PNG
├── spellwin-800w.png
├── spellwin-1200w.png
├── spellwin-400w.webp          # Modern WebP
├── spellwin-800w.webp
├── spellwin-1200w.webp
├── spellwin-400w.avif          # Next-gen AVIF
├── spellwin-800w.avif
└── spellwin-1200w.avif
```

## 📈 Monitoring & Reports
- Detailed JSON reports saved to `logs/`
- Success/failure statistics
- API usage tracking
- Source URL documentation

## 🔍 Troubleshooting

### API Errors
- **Invalid API Key**: Check your Google Cloud credentials
- **Quota Exceeded**: Upgrade to paid tier or wait for reset
- **Search Engine Not Found**: Verify your Custom Search Engine ID

### Logo Quality Issues
- **Too Small**: System automatically filters out tiny images
- **Wrong Format**: Tries multiple image formats automatically
- **Broken Links**: Handles 404s and invalid images gracefully

### Performance Issues
- **Slow Fetching**: Normal for 79 casinos (10-15 minutes)
- **Memory Usage**: Sharp.js image processing is memory-intensive
- **Network Errors**: Built-in retries and error handling

## 🎯 Legal Compliance
- Partner casinos = Legal right to use logos
- Fair use for comparison website
- No trademark infringement (paid partnerships)
- Proper attribution in footer/legal pages

## 🔄 Updates
Re-run `npm run fetch:logos` to:
- Update existing logos with higher quality versions
- Fetch logos for newly added casinos
- Refresh logos that may have changed

This system ensures you get high-quality, real casino logos for your partner casinos while respecting API limits and legal requirements.