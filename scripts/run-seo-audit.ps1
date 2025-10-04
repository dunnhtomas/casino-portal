# DataForSEO SEO Audit Runner Script (PowerShell)
# Performs comprehensive SEO audit using DataForSEO API v3

Write-Host "🎰 DataForSEO Casino Portal SEO Audit Runner" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Check if Python is available
$pythonCmd = $null
if (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCmd = "python3"
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCmd = "python"
} else {
    Write-Host "❌ Python is not installed. Please install Python 3.7+ first." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Using Python: $pythonCmd" -ForegroundColor Green

# Install requirements
Write-Host "📦 Installing required packages..." -ForegroundColor Yellow
& $pythonCmd -m pip install -r scripts/audit-requirements.txt

# Check for credentials
if (-not $env:DATAFORSEO_LOGIN -or -not $env:DATAFORSEO_PASSWORD) {
    Write-Host ""
    Write-Host "⚠️  DataForSEO API credentials not found in environment variables." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Cyan
    Write-Host "1️⃣  Run demo audit (no credentials needed)" -ForegroundColor Cyan
    Write-Host "2️⃣  Set credentials and run full audit" -ForegroundColor Cyan
    Write-Host ""
    
    $choice = Read-Host "Choose option (1 or 2)"
    
    switch ($choice) {
        "1" {
            Write-Host "🚀 Running demo audit..." -ForegroundColor Green
            & $pythonCmd scripts/dataforseo-audit-demo.py
        }
        "2" {
            Write-Host ""
            $login = Read-Host "Enter DataForSEO login"
            $password = Read-Host "Enter DataForSEO password" -AsSecureString
            $passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))
            
            Write-Host "🚀 Running full DataForSEO audit..." -ForegroundColor Green
            $env:DATAFORSEO_LOGIN = $login
            $env:DATAFORSEO_PASSWORD = $passwordPlain
            & $pythonCmd scripts/dataforseo-audit.py
        }
        default {
            Write-Host "❌ Invalid choice. Running demo audit..." -ForegroundColor Red
            & $pythonCmd scripts/dataforseo-audit-demo.py
        }
    }
} else {
    Write-Host "🚀 Running full DataForSEO audit with environment credentials..." -ForegroundColor Green
    & $pythonCmd scripts/dataforseo-audit.py
}

Write-Host ""
Write-Host "🎉 Audit completed! Check the generated reports for detailed insights." -ForegroundColor Green
Write-Host "📁 Reports are saved in the scripts/ directory" -ForegroundColor Cyan