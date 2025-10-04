# Casino Portal Workspace Backup Script
# Creates a compressed backup with timestamp

param(
    [string]$BackupLocation = "C:\Users\tamir\Downloads",
    [string]$BackupName = ""
)

# Generate backup name with timestamp if not provided
if ([string]::IsNullOrEmpty($BackupName)) {
    $timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
    $BackupName = "cc23-workspace-backup-$timestamp"
}

$WorkspacePath = "C:\Users\tamir\Downloads\cc23"
$TempDir = Join-Path ([System.IO.Path]::GetTempPath()) $BackupName
$FinalBackupPath = Join-Path $BackupLocation "$BackupName.zip"

Write-Host "Starting Casino Portal Workspace Backup" -ForegroundColor Green
Write-Host "Source: $WorkspacePath" -ForegroundColor Yellow
Write-Host "Destination: $FinalBackupPath" -ForegroundColor Yellow

try {
    # Create backup location if it doesn't exist
    if (!(Test-Path $BackupLocation)) {
        New-Item -ItemType Directory -Path $BackupLocation -Force | Out-Null
        Write-Host "Created backup directory: $BackupLocation" -ForegroundColor Green
    }

    # Create temporary directory
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $TempDir -Force | Out-Null

    # Copy files using robocopy with exclusions
    Write-Host "Copying workspace files..." -ForegroundColor Cyan
    
    $excludeDirs = @(
        "node_modules",
        ".git",
        "test-results",
        "dist",
        "build",
        ".next",
        ".astro",
        ".cache",
        "coverage",
        "temp",
        "tmp"
    )
    
    $excludeFiles = @(
        "*.log",
        "*.tmp",
        ".DS_Store",
        "Thumbs.db",
        "*.cache"
    )
    
    # Build robocopy command
    $robocopyArgs = @(
        $WorkspacePath,
        $TempDir,
        "/E",
        "/R:1",
        "/W:1",
        "/NFL",
        "/NDL"
    )
    
    # Add exclusions
    if ($excludeDirs.Count -gt 0) {
        $robocopyArgs += "/XD"
        $robocopyArgs += $excludeDirs
    }
    
    if ($excludeFiles.Count -gt 0) {
        $robocopyArgs += "/XF"
        $robocopyArgs += $excludeFiles
    }
    
    # Execute robocopy
    $result = & robocopy @robocopyArgs
    
    # Robocopy exit codes 0-7 are success
    if ($LASTEXITCODE -le 7) {
        Write-Host "Files copied successfully" -ForegroundColor Green
    } else {
        throw "Robocopy failed with exit code: $LASTEXITCODE"
    }

    # Create manifest file
    Write-Host "Creating backup manifest..." -ForegroundColor Cyan
    $manifest = @{
        BackupName = $BackupName
        BackupDate = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        WorkspacePath = $WorkspacePath
        ComputerName = $env:COMPUTERNAME
        UserName = $env:USERNAME
        PowerShellVersion = $PSVersionTable.PSVersion.ToString()
        ExcludedDirs = $excludeDirs
        ExcludedFiles = $excludeFiles
    }
    
    $manifest | ConvertTo-Json -Depth 10 | Out-File -FilePath "$TempDir\backup-manifest.json" -Encoding UTF8

    # Create restore instructions
    Write-Host "Creating restore instructions..." -ForegroundColor Cyan
    $restoreText = @(
        "# Casino Portal Workspace Restore Instructions",
        "",
        "## Backup Information",
        "Created: $($manifest.BackupDate)",
        "Source: $($manifest.WorkspacePath)",
        "Computer: $($manifest.ComputerName)",
        "User: $($manifest.UserName)",
        "",
        "## How to Restore",
        "",
        "### 1. Extract the Backup",
        "Extract this ZIP file to your desired location",
        "",
        "### 2. Install Dependencies",
        "Navigate to the restored directory and install Node.js dependencies:",
        "npm install",
        "",
        "### 3. Install Playwright Browsers",
        "npx playwright install",
        "",
        "### 4. Setup Docker (if needed)",
        "docker-compose build",
        "",
        "### 5. Start Development Server",
        "npm run dev",
        "or with Docker: docker-compose up -d dev",
        "",
        "## Excluded from Backup",
        "The following were excluded and will need to be regenerated:",
        "* node_modules/ (restored with npm install)",
        "* .git/ (version control - use git clone if needed)",
        "* test-results/ (generated during testing)",
        "* Build artifacts and temporary files",
        "",
        "## Notes",
        "* Make sure Node.js 20+ is installed",
        "* Docker is required for containerized development",
        "* Run tests after restore to verify everything works: npm run test:smoke"
    )
    
    $restoreText -join "`n" | Out-File -FilePath "$TempDir\RESTORE_INSTRUCTIONS.md" -Encoding UTF8

    # Get file count and size information
    $fileCount = (Get-ChildItem $TempDir -Recurse -File | Measure-Object).Count
    $totalSize = (Get-ChildItem $TempDir -Recurse -File | Measure-Object -Property Length -Sum).Sum
    $sizeInMB = [math]::Round($totalSize / 1MB, 2)

    Write-Host "Backup contains $fileCount files ($sizeInMB MB)" -ForegroundColor Yellow

    # Create compressed archive
    Write-Host "Creating compressed archive..." -ForegroundColor Cyan
    Compress-Archive -Path "$TempDir\*" -DestinationPath $FinalBackupPath -Force

    # Verify backup was created
    if (Test-Path $FinalBackupPath) {
        $backupSize = [math]::Round((Get-Item $FinalBackupPath).Length / 1MB, 2)
        Write-Host "Backup created successfully!" -ForegroundColor Green
        Write-Host "Location: $FinalBackupPath" -ForegroundColor White
        Write-Host "Size: $backupSize MB" -ForegroundColor White
    } else {
        throw "Failed to create backup archive"
    }

    # Cleanup temporary directory
    Write-Host "Cleaning up temporary files..." -ForegroundColor Cyan
    Remove-Item $TempDir -Recurse -Force

    Write-Host ""
    Write-Host "Backup completed successfully!" -ForegroundColor Green
    Write-Host "Backup file: $FinalBackupPath" -ForegroundColor White

} catch {
    Write-Host ""
    Write-Host "Backup failed: $($_.Exception.Message)" -ForegroundColor Red
    
    # Cleanup on failure
    if (Test-Path $TempDir) {
        Remove-Item $TempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    exit 1
}