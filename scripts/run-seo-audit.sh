#!/bin/bash
# DataForSEO SEO Audit Runner Script
# Performs comprehensive SEO audit using DataForSEO API v3

echo "🎰 DataForSEO Casino Portal SEO Audit Runner"
echo "=============================================="

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Python is not installed. Please install Python 3.7+ first."
    exit 1
fi

# Use python3 if available, otherwise python
PYTHON_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PYTHON_CMD="python"
fi

echo "✅ Using Python: $PYTHON_CMD"

# Install requirements
echo "📦 Installing required packages..."
$PYTHON_CMD -m pip install -r scripts/audit-requirements.txt

# Check for credentials
if [ -z "$DATAFORSEO_LOGIN" ] || [ -z "$DATAFORSEO_PASSWORD" ]; then
    echo ""
    echo "⚠️  DataForSEO API credentials not found in environment variables."
    echo ""
    echo "Options:"
    echo "1️⃣  Run demo audit (no credentials needed)"
    echo "2️⃣  Set credentials and run full audit"
    echo ""
    read -p "Choose option (1 or 2): " choice
    
    case $choice in
        1)
            echo "🚀 Running demo audit..."
            $PYTHON_CMD scripts/dataforseo-audit-demo.py
            ;;
        2)
            echo ""
            read -p "Enter DataForSEO login: " login
            read -s -p "Enter DataForSEO password: " password
            echo ""
            echo "🚀 Running full DataForSEO audit..."
            DATAFORSEO_LOGIN=$login DATAFORSEO_PASSWORD=$password $PYTHON_CMD scripts/dataforseo-audit.py
            ;;
        *)
            echo "❌ Invalid choice. Running demo audit..."
            $PYTHON_CMD scripts/dataforseo-audit-demo.py
            ;;
    esac
else
    echo "🚀 Running full DataForSEO audit with environment credentials..."
    $PYTHON_CMD scripts/dataforseo-audit.py
fi

echo ""
echo "🎉 Audit completed! Check the generated reports for detailed insights."
echo "📁 Reports are saved in the scripts/ directory"