# Backup Verification and Listing Script
$backupDir = "C:\Users\tamir\Downloads\casino-backups"
$timestamp = "20250930_150812"

Write-Host "=== CASINO PORTAL BACKUP VERIFICATION ===" -ForegroundColor Cyan
Write-Host ""

# List all backups
Write-Host "Available Backups:" -ForegroundColor Yellow
Get-ChildItem $backupDir -Filter "*.zip" | ForEach-Object {
    $size = [math]::Round($_.Length / 1MB, 2)
    Write-Host "  $($_.Name) - $size MB - $($_.LastWriteTime)" -ForegroundColor White
}

# Verify latest backup contents (without extracting)
Write-Host ""
Write-Host "Latest Backup Contents:" -ForegroundColor Yellow
$latestBackup = Get-ChildItem $backupDir -Filter "*.zip" | Sort-Object LastWriteTime -Descending | Select-Object -First 1

if ($latestBackup) {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($latestBackup.FullName)
    
    Write-Host "Archive: $($latestBackup.Name)" -ForegroundColor Green
    Write-Host "Contents:" -ForegroundColor Gray
    
    $zip.Entries | ForEach-Object {
        $size = if ($_.Length -gt 0) { "$([math]::Round($_.Length / 1MB, 2)) MB" } else { "0 MB" }
        Write-Host "  $($_.FullName) - $size" -ForegroundColor White
    }
    
    $zip.Dispose()
}

Write-Host ""
Write-Host "=== CURRENT SYSTEM STATUS ===" -ForegroundColor Cyan

# Current Docker status
Write-Host ""
Write-Host "Running Docker Containers:" -ForegroundColor Yellow
docker ps --filter "name=casino-portal*" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "Available Docker Images:" -ForegroundColor Yellow  
docker images --filter "reference=casino-portal*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"

Write-Host ""
Write-Host "=== RESTORE COMMANDS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "To restore from backup:" -ForegroundColor Yellow
Write-Host "1. Extract: Expand-Archive '$($latestBackup.FullName)' -DestinationPath 'C:\restore-location'" -ForegroundColor White
Write-Host "2. Load Docker images from extracted docker/*.tar files" -ForegroundColor White
Write-Host "3. Follow instructions in RESTORE_INSTRUCTIONS_*.txt" -ForegroundColor White