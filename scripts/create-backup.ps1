#!/usr/bin/env pwsh
# Casino Portal Complete Backup & Restore Point Script
# Creates comprehensive compressed backup with timestamp

param(
    [string]$BackupPath = "C:\Users\tamir\Downloads\casino-backups",
    [string]$ProjectPath = "C:\Users\tamir\Downloads\cc23"
)

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupName = "casino-portal-backup-$timestamp"
$backupDir = Join-Path $BackupPath $backupName

Write-Host "🔄 Creating Complete Casino Portal Backup Restore Point" -ForegroundColor Cyan
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor Green
Write-Host "📁 Backup Location: $backupDir" -ForegroundColor Green

# Create backup directory
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
New-Item -ItemType Directory -Path "$backupDir\docker-images" -Force | Out-Null
New-Item -ItemType Directory -Path "$backupDir\project-files" -Force | Out-Null
New-Item -ItemType Directory -Path "$backupDir\logs" -Force | Out-Null

# 1. Backup Project Files (excluding node_modules and dist)
Write-Host "📦 Backing up project files..." -ForegroundColor Yellow
$excludeDirs = @("node_modules", "dist", ".git", ".astro", "playwright-report", "test-results")
$projectBackup = "$backupDir\project-files\casino-portal-source-$timestamp.zip"

# Create exclusion list for compression
$excludeItems = $excludeDirs | ForEach-Object { Join-Path $ProjectPath $_ }

# Use 7zip if available, otherwise use Compress-Archive
if (Get-Command "7z" -ErrorAction SilentlyContinue) {
    $excludeArgs = $excludeDirs | ForEach-Object { "-xr!$_" }
    & 7z a -tzip "$projectBackup" "$ProjectPath\*" $excludeArgs
} else {
    # Fallback to PowerShell compression (copy first, then compress)
    $tempDir = "$backupDir\temp-source"
    robocopy "$ProjectPath" "$tempDir" /E /XD $excludeDirs /XF "*.log" /R:1 /W:1 /NP | Out-Null
    Compress-Archive -Path "$tempDir\*" -DestinationPath $projectBackup -CompressionLevel Optimal
    Remove-Item $tempDir -Recurse -Force
}

# 2. Backup Docker Images
Write-Host "🐳 Backing up Docker images..." -ForegroundColor Yellow
$dockerImages = docker images --filter "reference=casino-portal*" --format "{{.Repository}}:{{.Tag}}"

foreach ($image in $dockerImages) {
    if ($image -and $image -ne "none:none") {
        $imageName = $image -replace ":", "_" -replace "/", "_"
        $imageBackup = "$backupDir\docker-images\$imageName-$timestamp.tar"
        Write-Host "  [SAVE] Saving: $image" -ForegroundColor Gray
        docker save -o "$imageBackup" $image
        
        # Compress the tar file
        if (Get-Command "7z" -ErrorAction SilentlyContinue) {
            & 7z a -tgzip "$imageBackup.gz" "$imageBackup"
            Remove-Item "$imageBackup" -Force
        }
    }
}

# 3. Export Docker Container Information
Write-Host "📋 Exporting container information..." -ForegroundColor Yellow
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}\t{{.CreatedAt}}" > "$backupDir\docker-containers-$timestamp.txt"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" > "$backupDir\docker-images-$timestamp.txt"

# 4. Backup Configuration Files
Write-Host "⚙️ Backing up configurations..." -ForegroundColor Yellow
$configFiles = @(
    "package.json",
    "astro.config.mjs", 
    "tailwind.config.cjs",
    "tsconfig.json",
    "Dockerfile*",
    "docker-compose*.yml",
    "*.md"
)

$configBackup = "$backupDir\configurations-$timestamp"
New-Item -ItemType Directory -Path $configBackup -Force | Out-Null

foreach ($pattern in $configFiles) {
    $files = Get-ChildItem -Path $ProjectPath -Filter $pattern -File
    foreach ($file in $files) {
        Copy-Item $file.FullName -Destination $configBackup
    }
}

# 5. Create System Information Snapshot
Write-Host "📊 Creating system snapshot..." -ForegroundColor Yellow
@"
Casino Portal Backup Restore Point
Created: $(Get-Date)
Timestamp: $timestamp
System: $env:COMPUTERNAME
User: $env:USERNAME
PowerShell Version: $($PSVersionTable.PSVersion)
Docker Version: $(docker --version)
Node Version: $(node --version)
NPM Version: $(npm --version)

Project Status:
- Location: $ProjectPath
- Last Build: $(if (Test-Path "$ProjectPath\dist") { (Get-Item "$ProjectPath\dist").LastWriteTime } else { "Not built" })
- Docker Containers: $((docker ps --filter "name=casino-portal*" --format "{{.Names}}" | Measure-Object).Count) running

Backup Contents:
- Project Source Code (excluding build artifacts)
- Docker Images (compressed)
- Configuration Files
- Container States
- System Information

Restore Instructions:
1. Extract project-files\casino-portal-source-$timestamp.zip to desired location
2. Load Docker images: docker load -i docker-images\[image-name].tar.gz
3. Restore configurations from configurations-$timestamp\
4. Run: npm install && npm run build
5. Start containers with saved configurations

"@ > "$backupDir\RESTORE_INSTRUCTIONS_$timestamp.txt"

# 6. Create Package Manifests
Write-Host "📝 Creating package manifests..." -ForegroundColor Yellow
if (Test-Path "$ProjectPath\package.json") {
    Copy-Item "$ProjectPath\package.json" -Destination "$backupDir\package-manifest-$timestamp.json"
}
if (Test-Path "$ProjectPath\package-lock.json") {
    Copy-Item "$ProjectPath\package-lock.json" -Destination "$backupDir\package-lock-manifest-$timestamp.json"
}

# 7. Collect Running Container Logs
Write-Host "📜 Collecting container logs..." -ForegroundColor Yellow
$runningContainers = docker ps --filter "name=casino-portal*" --format "{{.Names}}"
foreach ($container in $runningContainers) {
    if ($container) {
        docker logs $container > "$backupDir\logs\$container-$timestamp.log" 2>&1
    }
}

# 8. Create Master Archive
Write-Host "🗜️ Creating final compressed archive..." -ForegroundColor Yellow
$finalArchive = "$BackupPath\$backupName.zip"

if (Get-Command "7z" -ErrorAction SilentlyContinue) {
    & 7z a -tzip -mx=9 "$finalArchive" "$backupDir\*"
} else {
    Compress-Archive -Path "$backupDir\*" -DestinationPath $finalArchive -CompressionLevel Optimal
}

# Calculate sizes
$originalSize = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
$compressedSize = (Get-Item $finalArchive).Length
$compressionRatio = [math]::Round((($originalSize - $compressedSize) / $originalSize) * 100, 2)

# Cleanup temporary directory
Remove-Item $backupDir -Recurse -Force

# Final Report
Write-Host "`n✅ BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "📦 Archive: $finalArchive" -ForegroundColor Cyan
Write-Host "📊 Original Size: $([math]::Round($originalSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "📊 Compressed Size: $([math]::Round($compressedSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "📊 Compression Ratio: $compressionRatio%" -ForegroundColor White
Write-Host "📅 Timestamp: $timestamp" -ForegroundColor White
Write-Host "`n🔄 To restore: Extract $backupName.zip and follow RESTORE_INSTRUCTIONS_$timestamp.txt" -ForegroundColor Yellow