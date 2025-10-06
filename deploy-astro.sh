#!/bin/bash

# Astro Static Site Deployment Script
ARCHIVE_FILE="astro-casino-portal-20251006_091821.zip"
WEB_ROOT="/var/www/html"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

echo "Starting deployment process..."

# Create backup if content exists
if [ -d "$WEB_ROOT" ] && [ -n "$(ls -A $WEB_ROOT 2>/dev/null)" ]; then
    echo "Creating backup..."
    sudo mkdir -p /var/backups/casino-portal
    sudo cp -r $WEB_ROOT /var/backups/casino-portal/backup-$TIMESTAMP 2>/dev/null || echo "Backup attempted"
fi

# Clear web root (keeping important files)
echo "Clearing web root..."
sudo find $WEB_ROOT -mindepth 1 -not -name '.htaccess' -not -name 'web.config' -delete 2>/dev/null || echo "Cleanup attempted"

# Extract and deploy
echo "Extracting archive..."
cd /tmp
unzip -q $ARCHIVE_FILE -d astro-temp/

echo "Copying files to web root..."
sudo cp -r astro-temp/* $WEB_ROOT/

# Set permissions
echo "Setting permissions..."
sudo chown -R www-data:www-data $WEB_ROOT
sudo chmod -R 755 $WEB_ROOT

# Cleanup
echo "Cleaning up temporary files..."
rm -f $ARCHIVE_FILE
rm -rf astro-temp/

echo "Deployment completed successfully!"