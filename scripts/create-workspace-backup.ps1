# Casino Portal Workspace Backup Script
# Creates a compressed backup of the entire workspace with timestamp
# Excludes unnecessary files and folders for efficient backup

param(
    [string]$BackupLocation = "C:\Users\tamir\Downloads\Backups",
    [string]$WorkspacePath = "C:\Users\tamir\Downloads\cc23"
)

# Generate timestamp for unique backup filename
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupName = "casino-portal-backup-$timestamp"
$tempDir = "$env:TEMP\$backupName"
$finalBackupPath = "$BackupLocation\$backupName.zip"

Write-Host "🚀 Starting Casino Portal Workspace Backup" -ForegroundColor Green
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Yellow
Write-Host "📂 Source: $WorkspacePath" -ForegroundColor Yellow
Write-Host "💾 Destination: $finalBackupPath" -ForegroundColor Yellow

# Create backup directory if it doesn't exist
if (!(Test-Path $BackupLocation)) {
    New-Item -ItemType Directory -Path $BackupLocation -Force | Out-Null
    Write-Host "📁 Created backup directory: $BackupLocation" -ForegroundColor Blue
}

# Create temporary staging directory
Write-Host "`n🔄 Creating temporary staging directory..." -ForegroundColor Cyan
if (Test-Path $tempDir) {
    Remove-Item $tempDir -Recurse -Force
}
New-Item -ItemType Directory -Path $tempDir -Force | Out-Null

try {
    # Use robocopy to copy files with exclusions
    Write-Host "📋 Copying workspace files (excluding unnecessary folders)..." -ForegroundColor Cyan
    
    $excludeDirs = @(
        "node_modules",
        ".git", 
        "test-results",
        ".next",
        ".nuxt",
        "dist",
        "build",
        "target",
        ".vscode",
        ".idea",
        "logs",
        "temp",
        "tmp",
        ".docker",
        "coverage",
        ".nyc_output",
        "playwright-report"
    )
    
    $excludeFiles = @(
        "*.log",
        "*.tmp",
        ".env.local",
        "*.lock",
        "Thumbs.db",
        ".DS_Store"
    )
    
    # Build robocopy command
    $robocopyArgs = @(
        $WorkspacePath,
        $tempDir,
        "/E",  # Copy subdirectories including empty ones
        "/R:2", # Retry 2 times on failed copies
        "/W:1", # Wait 1 second between retries
        "/MT:8", # Multi-threaded copy (8 threads)
        "/XD"   # Exclude directories
    )
    $robocopyArgs += $excludeDirs
    $robocopyArgs += "/XF"  # Exclude files
    $robocopyArgs += $excludeFiles
    
    $robocopyResult = & robocopy @robocopyArgs
    
    # Check robocopy exit code (0-7 are success, 8+ are errors)
    if ($LASTEXITCODE -ge 8) {
        throw "Robocopy failed with exit code: $LASTEXITCODE"
    }
    
    Write-Host "✅ File copy completed successfully" -ForegroundColor Green
    
    # Create backup manifest
    Write-Host "📄 Creating backup manifest..." -ForegroundColor Cyan
    $manifest = @{
        BackupDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        WorkspacePath = $WorkspacePath
        BackupVersion = "1.0"
        ExcludedDirectories = $excludeDirs
        ExcludedFiles = $excludeFiles
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        ComputerName = $env:COMPUTERNAME
        UserName = $env:USERNAME
    }
    
    $manifestJson = $manifest | ConvertTo-Json -Depth 3
    $manifestJson | Out-File -FilePath "$tempDir\BACKUP_MANIFEST.json" -Encoding UTF8
    
    # Create restore instructions
    Write-Host "📖 Creating restore instructions..." -ForegroundColor Cyan
    $restoreContent = @"
# Casino Portal Workspace Restore Instructions

## Backup Information
Created: $($manifest.BackupDate)
Source: $($manifest.WorkspacePath)
Computer: $($manifest.ComputerName)
User: $($manifest.UserName)

## How to Restore

### 1. Extract the Backup
Extract this ZIP file to your desired location

### 2. Install Dependencies
Navigate to the restored directory and install Node.js dependencies:
npm install

### 3. Install Playwright Browsers
npx playwright install

### 4. Setup Docker (if needed)
docker-compose build

### 5. Start Development Server
npm run dev
or with Docker: docker-compose up -d dev

## Excluded from Backup
The following were excluded and will need to be regenerated:
* node_modules/ (restored with npm install)
* .git/ (version control - use git clone if needed)
* test-results/ (generated during testing)
* Build artifacts and temporary files

## Notes
* Make sure Node.js 20+ is installed
* Docker is required for containerized development
* Run tests after restore to verify everything works: npm run test:smoke
"@
    
    $restoreContent | Out-File -FilePath "$tempDir\RESTORE_INSTRUCTIONS.md" -Encoding UTF8
    
    # Get file count and size information
    $fileCount = (Get-ChildItem $tempDir -Recurse -File | Measure-Object).Count
    $totalSize = (Get-ChildItem $tempDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $sizeInMB = [math]::Round($totalSize / 1MB, 2)
    
    Write-Host "📊 Backup contains $fileCount files ($sizeInMB MB)" -ForegroundColor Yellow
    
    # Create compressed archive
    Write-Host "🗜️ Creating compressed archive..." -ForegroundColor Cyan
    Compress-Archive -Path "$tempDir\*" -DestinationPath $finalBackupPath -CompressionLevel Optimal -Force
    
    # Verify backup was created
    if (Test-Path $finalBackupPath) {
        $backupInfo = Get-Item $finalBackupPath
        $backupSizeMB = [math]::Round($backupInfo.Length / 1MB, 2)
        
        Write-Host "`n✅ Backup completed successfully!" -ForegroundColor Green
        Write-Host "📦 Backup file: $finalBackupPath" -ForegroundColor White
        Write-Host "📏 Compressed size: $backupSizeMB MB" -ForegroundColor White
        Write-Host "💾 Original size: $sizeInMB MB" -ForegroundColor White
        Write-Host "🗜️ Compression ratio: $([math]::Round((1 - $backupInfo.Length / $totalSize) * 100, 1))%" -ForegroundColor White
        
        # Cleanup
        Write-Host "`n🧹 Cleaning up temporary files..." -ForegroundColor Cyan
        Remove-Item $tempDir -Recurse -Force
        
        Write-Host "`n🎉 Backup process completed successfully!" -ForegroundColor Green
        Write-Host "📍 Your backup is ready at: $finalBackupPath" -ForegroundColor Yellow
        
        return $finalBackupPath
    } else {
        throw "Failed to create backup archive"
    }
    
} catch {
    Write-Host "`n❌ Backup failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Cleanup on failure
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force
    }
    
    throw $_
} finally {
    # Ensure cleanup
    if (Test-Path $tempDir) {
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}