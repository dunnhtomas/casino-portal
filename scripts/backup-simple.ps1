#!/usr/bin/env pwsh
# Casino Portal Complete Backup Script - Simplified

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupName = "casino-portal-backup-$timestamp"
$backupPath = "C:\Users\tamir\Downloads\casino-backups"
$projectPath = "C:\Users\tamir\Downloads\cc23"
$backupDir = Join-Path $backupPath $backupName

Write-Host "Creating Complete Casino Portal Backup Restore Point" -ForegroundColor Cyan
Write-Host "Timestamp: $timestamp" -ForegroundColor Green

# Create backup directory structure
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
New-Item -ItemType Directory -Path "$backupDir\project" -Force | Out-Null
New-Item -ItemType Directory -Path "$backupDir\docker" -Force | Out-Null

# 1. Backup project files (exclude large directories)
Write-Host "Backing up project files..." -ForegroundColor Yellow
$tempProjectDir = "$backupDir\temp-project"
robocopy "$projectPath" "$tempProjectDir" /E /XD node_modules dist .git .astro playwright-report test-results /XF "*.log" /R:1 /W:1 /NP | Out-Null

if (Test-Path $tempProjectDir) {
    Compress-Archive -Path "$tempProjectDir\*" -DestinationPath "$backupDir\project\casino-portal-source-$timestamp.zip" -CompressionLevel Optimal
    Remove-Item $tempProjectDir -Recurse -Force
}

# 2. Export Docker images list and save key images
Write-Host "Backing up Docker information..." -ForegroundColor Yellow
docker images --filter "reference=casino-portal*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}\t{{.CreatedAt}}" > "$backupDir\docker\docker-images-$timestamp.txt"
docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" > "$backupDir\docker\docker-containers-$timestamp.txt"

# Save the two main production images
$imagesToSave = @("casino-portal-static:latest", "casino-portal-production:latest")
foreach ($image in $imagesToSave) {
    $imageExists = docker images $image --format "{{.Repository}}:{{.Tag}}" | Select-String $image
    if ($imageExists) {
        $imageName = $image -replace ":", "_"
        Write-Host "Saving Docker image: $image" -ForegroundColor Gray
        docker save -o "$backupDir\docker\$imageName-$timestamp.tar" $image
    }
}

# 3. Create system snapshot
Write-Host "Creating system snapshot..." -ForegroundColor Yellow
$systemInfo = @"
Casino Portal Backup Restore Point
Created: $(Get-Date)
Timestamp: $timestamp
System: $env:COMPUTERNAME
User: $env:USERNAME

Project Information:
- Location: $projectPath
- Docker Images: $(docker images --filter "reference=casino-portal*" --format "{{.Repository}}:{{.Tag}}" | Measure-Object | Select-Object -ExpandProperty Count)
- Running Containers: $(docker ps --filter "name=casino-portal*" --format "{{.Names}}" | Measure-Object | Select-Object -ExpandProperty Count)

Backup Contents:
1. project/casino-portal-source-$timestamp.zip - Complete source code
2. docker/casino-portal-*-$timestamp.tar - Key Docker images
3. docker/docker-images-$timestamp.txt - Image inventory
4. docker/docker-containers-$timestamp.txt - Container states

Restore Instructions:
1. Extract project/casino-portal-source-$timestamp.zip to desired location
2. Load Docker images: docker load -i docker/[image-name].tar
3. Install dependencies: npm install
4. Build project: npm run build
5. Start containers: docker run commands from container list
"@

$systemInfo | Out-File -FilePath "$backupDir\RESTORE_INSTRUCTIONS_$timestamp.txt" -Encoding UTF8

# 4. Copy key configuration files
Write-Host "Copying configurations..." -ForegroundColor Yellow
$configFiles = @("package.json", "astro.config.mjs", "tailwind.config.cjs", "Dockerfile", "Dockerfile.simple", "docker-compose.yml")
foreach ($file in $configFiles) {
    $sourcePath = Join-Path $projectPath $file
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath -Destination "$backupDir\$file"
    }
}

# 5. Create final compressed archive
Write-Host "Creating final archive..." -ForegroundColor Yellow
$finalArchive = "$backupPath\$backupName.zip"
Compress-Archive -Path "$backupDir\*" -DestinationPath $finalArchive -CompressionLevel Optimal

# Calculate sizes
$originalSize = (Get-ChildItem $backupDir -Recurse | Measure-Object -Property Length -Sum).Sum
$compressedSize = (Get-Item $finalArchive).Length
$compressionRatio = [math]::Round((($originalSize - $compressedSize) / $originalSize) * 100, 2)

# Cleanup
Remove-Item $backupDir -Recurse -Force

# Report
Write-Host ""
Write-Host "BACKUP COMPLETED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "Archive: $finalArchive" -ForegroundColor Cyan
Write-Host "Original Size: $([math]::Round($originalSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "Compressed Size: $([math]::Round($compressedSize / 1MB, 2)) MB" -ForegroundColor White
Write-Host "Compression Ratio: $compressionRatio%" -ForegroundColor White
Write-Host "Timestamp: $timestamp" -ForegroundColor White
Write-Host ""
Write-Host "To restore: Extract $backupName.zip and follow RESTORE_INSTRUCTIONS_$timestamp.txt" -ForegroundColor Yellow