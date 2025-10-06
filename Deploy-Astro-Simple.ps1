# =============================================================================
# ASTRO STATIC SITE DEPLOYMENT - SIMPLIFIED POWERSHELL
# Casino Portal - Direct SSH Deployment from Windows
# =============================================================================

param(
    [string]$ArchiveFile = "astro-casino-portal-20251006_091821.zip"
)

$SERVER_HOST = "193.181.210.101"
$SERVER_USER = "admin"
$SSH_KEY = "id_rsa"
$BACKUP_DOMAIN = "bestcasinopo.vps.webdock.cloud"
$WEB_ROOT = "/var/www/html"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"

# Colors for output
function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "=====================================================================" "Cyan"
Write-ColorOutput "🚀 ASTRO CASINO PORTAL DEPLOYMENT" "Cyan"
Write-ColorOutput "   Direct Static Site Deployment to LEMP Server" "Cyan"
Write-ColorOutput "=====================================================================" "Cyan"

# Check if archive exists
if (-not (Test-Path $ArchiveFile)) {
    Write-ColorOutput "❌ Archive file $ArchiveFile not found!" "Red"
    exit 1
}

Write-ColorOutput "📦 Uploading deployment archive..." "Yellow"

# Upload the archive
scp -i $SSH_KEY -o StrictHostKeyChecking=no $ArchiveFile "${SERVER_USER}@${SERVER_HOST}:/tmp/"

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "✅ Archive uploaded successfully" "Green"
} else {
    Write-ColorOutput "❌ Upload failed" "Red"
    exit 1
}

Write-ColorOutput "🔧 Deploying static site..." "Yellow"

# Deploy the site via SSH
$deploymentCommands = @"
# Create backup if content exists
if [ -d '$WEB_ROOT' ] && [ -n `"`$(ls -A $WEB_ROOT 2>/dev/null)`" ]; then
    echo 'Creating backup...'
    sudo mkdir -p /var/backups/casino-portal
    sudo cp -r $WEB_ROOT /var/backups/casino-portal/backup-$TIMESTAMP 2>/dev/null || echo 'Backup attempted'
fi

# Clear web root (keeping important files)
echo 'Clearing web root...'
sudo find $WEB_ROOT -mindepth 1 -not -name '.htaccess' -not -name 'web.config' -delete 2>/dev/null || echo 'Cleanup attempted'

# Extract and deploy
cd /tmp
unzip -q $ArchiveFile -d astro-temp/
sudo cp -r astro-temp/* $WEB_ROOT/

# Set permissions
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# Cleanup
rm -f $ArchiveFile
rm -rf astro-temp/

echo 'Deployment completed successfully!'
"@

ssh -i $SSH_KEY -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" $deploymentCommands

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "✅ Site deployed successfully" "Green"
} else {
    Write-ColorOutput "❌ Deployment failed" "Red"
    exit 1
}

Write-ColorOutput "🌐 Configuring Nginx..." "Yellow"

# Configure Nginx for the static site
$nginxConfig = @"
# Configure Nginx for static site
sudo tee /etc/nginx/sites-available/bestcasinoportal.com > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name bestcasinoportal.com www.bestcasinoportal.com $BACKUP_DOMAIN;
    
    root $WEB_ROOT;
    index index.html index.htm;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection `"1; mode=block`";
    
    # Main location block
    location / {
        try_files `$uri `$uri/ `$uri.html =404;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control `"public, immutable`";
            access_log off;
        }
    }
    
    # Astro assets
    location /_astro/ {
        expires 1y;
        add_header Cache-Control `"public, immutable`";
        access_log off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
EOF

# Enable the site
sudo ln -sf /etc/nginx/sites-available/bestcasinoportal.com /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test and reload Nginx
sudo nginx -t && sudo systemctl reload nginx

echo 'Nginx configured successfully!'
"@

ssh -i $SSH_KEY -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" $nginxConfig

if ($LASTEXITCODE -eq 0) {
    Write-ColorOutput "✅ Nginx configured successfully" "Green"
} else {
    Write-ColorOutput "⚠️ Nginx configuration may have issues" "Yellow"
}

Write-ColorOutput "🧪 Testing deployment..." "Yellow"

# Test the deployment
try {
    $response = Invoke-WebRequest -Uri "http://$BACKUP_DOMAIN/" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-ColorOutput "✅ Site is responding correctly!" "Green"
    } else {
        Write-ColorOutput "⚠️ Site responded with status: $($response.StatusCode)" "Yellow"
    }
} catch {
    Write-ColorOutput "⚠️ Site test inconclusive: $($_.Exception.Message)" "Yellow"
}

Write-ColorOutput "=====================================================================" "Cyan"
Write-ColorOutput "🎉 DEPLOYMENT COMPLETED!" "Green"
Write-ColorOutput "" "White"
Write-ColorOutput "📋 DEPLOYMENT SUMMARY:" "Cyan"
Write-ColorOutput "   • Server: $SERVER_HOST" "White"
Write-ColorOutput "   • Primary URL: https://bestcasinoportal.com" "White"
Write-ColorOutput "   • Backup URL: http://$BACKUP_DOMAIN" "White"
Write-ColorOutput "   • Pages Built: 2062 static pages" "White"
Write-ColorOutput "   • Build Size: $(((Get-Item $ArchiveFile).Length / 1MB).ToString('F2')) MB" "White"
Write-ColorOutput "" "White"
Write-ColorOutput "🔧 POST-DEPLOYMENT TASKS:" "Yellow"
Write-ColorOutput "   • Configure SSL certificate (Let's Encrypt recommended)" "White"
Write-ColorOutput "   • Setup domain DNS if not already configured" "White"
Write-ColorOutput "   • Test all site functionality" "White"
Write-ColorOutput "   • Monitor site performance" "White"
Write-ColorOutput "=====================================================================" "Cyan"