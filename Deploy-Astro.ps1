# =============================================================================
# ASTRO DEPLOYMENT AUTOMATION - WINDOWS POWERSHELL WRAPPER
# Casino Portal - Automated Deployment from Windows to LEMP Server
# =============================================================================
# 
# This PowerShell script executes the Astro deployment automation
# from Windows environment using WSL or Git Bash for SSH functionality
# 
# =============================================================================

param(
    [switch]$OptimizeServer,
    [switch]$DeployOnly,
    [switch]$FullDeployment,
    [switch]$Help
)

# Configuration
$CONFIG = @{
    ServerHost = "193.181.210.101"
    ServerUser = "admin"
    SSHKey = "id_rsa"
    PrimaryDomain = "bestcasinoportal.com"
    BackupDomain = "bestcasinopo.vps.webdock.cloud"
    ProjectPath = Get-Location
    LogFile = "deployment-$(Get-Date -Format 'yyyyMMdd_HHmmss').log"
}

# Colors for PowerShell output
$Colors = @{
    Info = "Cyan"
    Success = "Green"
    Warning = "Yellow"
    Error = "Red"
    Header = "Magenta"
}

function Write-Log {
    param(
        [string]$Message,
        [string]$Level = "Info"
    )
    
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logEntry = "[$timestamp] [$Level] $Message"
    
    # Console output with colors
    switch ($Level) {
        "Info" { Write-Host $logEntry -ForegroundColor $Colors.Info }
        "Success" { Write-Host $logEntry -ForegroundColor $Colors.Success }
        "Warning" { Write-Host $logEntry -ForegroundColor $Colors.Warning }
        "Error" { Write-Host $logEntry -ForegroundColor $Colors.Error }
        "Header" { Write-Host $logEntry -ForegroundColor $Colors.Header }
    }
    
    # File logging
    Add-Content -Path $CONFIG.LogFile -Value $logEntry
}

function Test-Prerequisites {
    Write-Log "Checking deployment prerequisites..." "Info"
    
    $errors = @()
    
    # Check SSH key
    if (-not (Test-Path $CONFIG.SSHKey)) {
        $errors += "SSH key '$($CONFIG.SSHKey)' not found"
    }
    
    # Check essential Astro files
    $requiredFiles = @("package.json", "astro.config.mjs", "tsconfig.json")
    foreach ($file in $requiredFiles) {
        if (-not (Test-Path $file)) {
            $errors += "Required file '$file' not found"
        }
    }
    
    # Check source directory
    if (-not (Test-Path "src")) {
        $errors += "Astro 'src' directory not found"
    }
    
    # Check for WSL or Git Bash (needed for SSH)
    $hasWSL = Get-Command wsl -ErrorAction SilentlyContinue
    $hasGitBash = Test-Path "C:\Program Files\Git\bin\bash.exe"
    
    if (-not $hasWSL -and -not $hasGitBash) {
        $errors += "Neither WSL nor Git Bash found. SSH deployment requires one of these."
    }
    
    if ($errors.Count -gt 0) {
        Write-Log "Prerequisites check failed:" "Error"
        foreach ($error in $errors) {
            Write-Log "  - $error" "Error"
        }
        return $false
    }
    
    Write-Log "Prerequisites check passed ✓" "Success"
    return $true
}

function Invoke-SSHCommand {
    param(
        [string]$ScriptPath,
        [string]$Description
    )
    
    Write-Log "Executing: $Description" "Info"
    
    # Try WSL first, then Git Bash
    $command = ""
    if (Get-Command wsl -ErrorAction SilentlyContinue) {
        Write-Log "Using WSL for SSH execution" "Info"
        $command = "wsl bash $ScriptPath"
    }
    elseif (Test-Path "C:\Program Files\Git\bin\bash.exe") {
        Write-Log "Using Git Bash for SSH execution" "Info"
        $bashPath = "C:\Program Files\Git\bin\bash.exe"
        $command = "& '$bashPath' '$ScriptPath'"
    }
    else {
        Write-Log "No SSH-capable environment found" "Error"
        return $false
    }
    
    try {
        # Execute the command
        $result = Invoke-Expression $command
        
        if ($LASTEXITCODE -eq 0) {
            Write-Log "$Description completed successfully" "Success"
            return $true
        }
        else {
            Write-Log "$Description failed with exit code $LASTEXITCODE" "Error"
            return $false
        }
    }
    catch {
        Write-Log "Error executing $Description : $($_.Exception.Message)" "Error"
        return $false
    }
}

function Build-AstroSite {
    Write-Log "Building Astro static site..." "Info"
    
    try {
        # Install dependencies if needed
        if (-not (Test-Path "node_modules")) {
            Write-Log "Installing dependencies..." "Info"
            npm ci
            if ($LASTEXITCODE -ne 0) {
                throw "npm ci failed"
            }
        }
        
        # Build the site
        Write-Log "Building static site..." "Info"
        npm run build
        if ($LASTEXITCODE -ne 0) {
            throw "npm run build failed"
        }
        
        # Verify build output
        if (-not (Test-Path "dist")) {
            throw "Build failed - dist directory not found"
        }
        
        Write-Log "Astro static site built successfully ✓" "Success"
        return $true
    }
    catch {
        Write-Log "Build failed: $($_.Exception.Message)" "Error"
        return $false
    }
}

function Start-ServerOptimization {
    Write-Log "Starting server optimization for Astro static hosting..." "Header"
    
    if (-not (Invoke-SSHCommand "./astro-server-optimization.sh" "Server optimization")) {
        Write-Log "Server optimization failed" "Error"
        return $false
    }
    
    Write-Log "Server optimization completed ✓" "Success"
    return $true
}

function Start-Deployment {
    Write-Log "Starting Astro site deployment..." "Header"
    
    if (-not (Invoke-SSHCommand "./astro-deployment-automation.sh" "Site deployment")) {
        Write-Log "Site deployment failed" "Error"
        return $false
    }
    
    Write-Log "Site deployment completed ✓" "Success"
    return $true
}

function Test-DeploymentResult {
    Write-Log "Testing deployment result..." "Info"
    
    try {
        # Test backup domain
        $response = Invoke-WebRequest -Uri "http://$($CONFIG.BackupDomain)/" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Log "Site is responding correctly on backup domain ✓" "Success"
        }
        else {
            Write-Log "Site response test inconclusive (Status: $($response.StatusCode))" "Warning"
        }
    }
    catch {
        Write-Log "Site response test failed: $($_.Exception.Message)" "Warning"
        Write-Log "Manual verification recommended" "Warning"
    }
}

function Show-Help {
    $helpText = @"
🚀 ASTRO DEPLOYMENT AUTOMATION - POWERSHELL WRAPPER

USAGE:
    .\Deploy-Astro.ps1 [OPTIONS]

OPTIONS:
    -OptimizeServer    : Optimize LEMP server for static hosting only
    -DeployOnly        : Deploy Astro site only (assumes server is ready)
    -FullDeployment    : Full deployment (optimize server + deploy site)
    -Help              : Show this help message

EXAMPLES:
    .\Deploy-Astro.ps1 -FullDeployment      # Complete deployment process
    .\Deploy-Astro.ps1 -OptimizeServer      # Optimize server only
    .\Deploy-Astro.ps1 -DeployOnly          # Deploy site only

REQUIREMENTS:
    • SSH key (id_rsa) in current directory
    • WSL or Git Bash for SSH functionality
    • Node.js and npm for building Astro site
    • Valid Astro project structure

SERVER DETAILS:
    • Host: $($CONFIG.ServerHost)
    • User: $($CONFIG.ServerUser)
    • Primary Domain: $($CONFIG.PrimaryDomain)
    • Backup Domain: $($CONFIG.BackupDomain)

"@
    
    Write-Host $helpText -ForegroundColor $Colors.Info
}

function Show-DeploymentSummary {
    Write-Log "=================== DEPLOYMENT SUMMARY ===================" "Header"
    Write-Log "Project: Casino Portal (Astro Static Site)" "Info"
    Write-Log "Server: $($CONFIG.ServerHost)" "Info"
    Write-Log "Primary URL: https://$($CONFIG.PrimaryDomain)" "Info"
    Write-Log "Backup URL: http://$($CONFIG.BackupDomain)" "Info"
    Write-Log "Log File: $($CONFIG.LogFile)" "Info"
    Write-Log "" "Info"
    Write-Log "🔧 POST-DEPLOYMENT TASKS:" "Warning"
    Write-Log "  • Configure SSL certificate (Let's Encrypt recommended)" "Warning"
    Write-Log "  • Setup domain DNS if not already configured" "Warning"
    Write-Log "  • Test all site functionality" "Warning"
    Write-Log "  • Configure monitoring and backups" "Warning"
    Write-Log "=========================================================" "Header"
}

# Main execution logic
function Main {
    $startTime = Get-Date
    
    Write-Host "=============================================================================" -ForegroundColor $Colors.Header
    Write-Host "🎰 ASTRO CASINO PORTAL - AUTOMATED DEPLOYMENT" -ForegroundColor $Colors.Header
    Write-Host "   Windows PowerShell → LEMP Server Deployment" -ForegroundColor $Colors.Header
    Write-Host "=============================================================================" -ForegroundColor $Colors.Header
    
    if ($Help) {
        Show-Help
        return
    }
    
    # Default to full deployment if no specific option
    if (-not $OptimizeServer -and -not $DeployOnly) {
        $FullDeployment = $true
    }
    
    # Prerequisites check
    if (-not (Test-Prerequisites)) {
        Write-Log "Prerequisites check failed. Deployment aborted." "Error"
        return
    }
    
    $success = $true
    
    try {
        # Server optimization phase
        if ($OptimizeServer -or $FullDeployment) {
            if (-not (Start-ServerOptimization)) {
                $success = $false
            }
        }
        
        # Deployment phase
        if (($DeployOnly -or $FullDeployment) -and $success) {
            # Build site locally
            if (-not (Build-AstroSite)) {
                $success = $false
            }
            
            # Deploy to server
            if ($success -and -not (Start-Deployment)) {
                $success = $false
            }
            
            # Test deployment
            if ($success) {
                Test-DeploymentResult
            }
        }
        
        # Summary
        $endTime = Get-Date
        $duration = $endTime - $startTime
        
        if ($success) {
            Write-Log "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!" "Success"
            Write-Log "Total Duration: $($duration.ToString('mm\:ss'))" "Success"
            Show-DeploymentSummary
        }
        else {
            Write-Log "❌ DEPLOYMENT FAILED" "Error"
            Write-Log "Check log file for details: $($CONFIG.LogFile)" "Error"
        }
    }
    catch {
        Write-Log "Unexpected error: $($_.Exception.Message)" "Error"
        Write-Log "❌ DEPLOYMENT FAILED" "Error"
    }
}

# Execute main function
Main