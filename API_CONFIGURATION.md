# API Configuration Guide

This file explains how to configure the API keys needed for the casino portal project.

## Required APIs

### 1. Google Custom Search API
Used for automated casino logo fetching.

**Setup:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Custom Search JSON API"
4. Create credentials (API key)
5. Go to [Custom Search Engine](https://cse.google.com/cse/)
6. Create a new search engine
7. Copy the search engine ID

**Environment Variables:**
```env
GOOGLE_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

### 2. OpenAI API
Used for content generation and image creation.

**Setup:**
1. Go to [OpenAI Platform](https://platform.openai.com/)
2. Create an account or log in
3. Navigate to API Keys
4. Create a new secret key

**Environment Variable:**
```env
OPENAI_API_KEY=sk-your_openai_api_key_here
```

### 3. DeepSeek API
Used for specialized casino content generation.

**Setup:**
1. Go to [DeepSeek Platform](https://platform.deepseek.com/)
2. Create an account or log in
3. Navigate to API Keys
4. Create a new API key

**Environment Variable:**
```env
DEEPSEEK_API_KEY=sk-your_deepseek_api_key_here
```

## Configuration Steps

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your actual API keys in the `.env` file

3. Never commit `.env` files to version control

## Usage

The scripts will automatically read from environment variables:

```javascript
// Example usage in scripts
const googleApiKey = process.env.GOOGLE_API_KEY;
const openaiKey = process.env.OPENAI_API_KEY;
```

## Security Notes

- Keep your API keys secure and never expose them publicly
- Use environment variables for all sensitive configuration
- The `.env` file is excluded from git via `.gitignore`
- Consider using additional security measures in production