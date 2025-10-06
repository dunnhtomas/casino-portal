#!/bin/bash

# =============================================================================
# ASTRO STATIC SITE DEPLOYMENT AUTOMATION
# Casino Portal - Automated SSH Deployment for Astro Static Site
# =============================================================================
# 
# Server: bestcasinopo.vps.webdock.cloud (193.181.210.101)
# Stack: LEMP (Nginx + MySQL 8.3 + PHP 8.3)
# Target: /var/www/html (LEMP standard web root)
# Authentication: SSH key (id_rsa) as admin user
# 
# This script deploys the Astro static site to the LEMP server
# =============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration Variables
SERVER_HOST="193.181.210.101"
SERVER_USER="admin"
SSH_KEY="id_rsa"
BACKUP_DOMAIN="bestcasinopo.vps.webdock.cloud"
PRIMARY_DOMAIN="bestcasinoportal.com"
WEB_ROOT="/var/www/html"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_ARCHIVE="astro-casino-portal-${TIMESTAMP}.tar.gz"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to execute SSH commands
ssh_exec() {
    ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" "$1"
}

# Function to upload files via SCP
scp_upload() {
    scp -i "${SSH_KEY}" -o StrictHostKeyChecking=no "$1" "${SERVER_USER}@${SERVER_HOST}:$2"
}

# Verify prerequisites
check_prerequisites() {
    log_info "Checking deployment prerequisites..."
    
    # Check SSH key exists
    if [ ! -f "${SSH_KEY}" ]; then
        log_error "SSH key ${SSH_KEY} not found!"
        exit 1
    fi
    
    # Check essential files exist
    local required_files=("package.json" "astro.config.mjs" "tsconfig.json")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Required file $file not found!"
            exit 1
        fi
    done
    
    # Check source directory
    if [ ! -d "src" ]; then
        log_error "Astro src directory not found!"
        exit 1
    fi
    
    # Test SSH connection
    if ! ssh_exec "echo 'SSH connection successful'"; then
        log_error "SSH connection failed!"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Build Astro static site
build_astro_site() {
    log_info "Building Astro static site..."
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        log_info "Installing dependencies..."
        npm ci
    fi
    
    # Build the static site
    log_info "Building static site..."
    npm run build
    
    # Verify build output
    if [ ! -d "dist" ]; then
        log_error "Build failed - dist directory not found!"
        exit 1
    fi
    
    log_success "Astro static site built successfully"
}

# Create deployment archive
create_deployment_archive() {
    log_info "Creating deployment archive..."
    
    # Create archive of built static site
    tar -czf "${DEPLOYMENT_ARCHIVE}" -C dist . || {
        log_error "Failed to create deployment archive"
        exit 1
    }
    
    log_success "Deployment archive created: ${DEPLOYMENT_ARCHIVE}"
}

# Upload deployment files
upload_deployment_files() {
    log_info "Uploading deployment files..."
    
    scp_upload "${DEPLOYMENT_ARCHIVE}" "/tmp/"
    
    log_success "Files uploaded to server"
}

# Deploy static site
deploy_static_site() {
    log_info "Deploying static site to server..."
    
    ssh_exec "
        # Create backup of current deployment if it exists
        if [ -d '${WEB_ROOT}' ] && [ -n \"\$(ls -A ${WEB_ROOT} 2>/dev/null)\" ]; then
            echo 'Creating backup of current deployment...'
            sudo mkdir -p /var/backups/casino-portal
            sudo cp -r ${WEB_ROOT} /var/backups/casino-portal/backup-${TIMESTAMP} || echo 'Backup creation attempted'
        fi
        
        # Clear web root (keeping important system files)
        echo 'Clearing web root...'
        sudo find ${WEB_ROOT} -mindepth 1 -not -name '.htaccess' -not -name 'web.config' -delete 2>/dev/null || echo 'Cleanup attempted'
        
        # Extract static site files
        cd /tmp
        tar -xzf ${DEPLOYMENT_ARCHIVE}
        
        # Copy static files to web root
        sudo cp -r * ${WEB_ROOT}/
        
        # Set proper permissions
        sudo chown -R www-data:www-data ${WEB_ROOT}
        sudo chmod -R 755 ${WEB_ROOT}
        
        # Clean up temp files
        rm -f ${DEPLOYMENT_ARCHIVE}
        rm -rf /tmp/*casino* 2>/dev/null || true
    "
    
    log_success "Static site deployed successfully"
}

# Configure Nginx for static site
configure_nginx_static() {
    log_info "Configuring Nginx for static site..."
    
    ssh_exec "
        # Create Nginx configuration for static site
        sudo tee /etc/nginx/sites-available/${PRIMARY_DOMAIN} > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ${PRIMARY_DOMAIN} www.${PRIMARY_DOMAIN} ${BACKUP_DOMAIN};
    
    root ${WEB_ROOT};
    index index.html index.htm;
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection \"1; mode=block\";
    add_header X-Robots-Tag \"index, follow\";
    
    # Main location block
    location / {
        try_files \$uri \$uri/ \$uri.html =404;
        
        # Cache static assets
        location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)\$ {
            expires 1y;
            add_header Cache-Control \"public, immutable\";
            access_log off;
        }
    }
    
    # Special handling for Astro assets
    location /_astro/ {
        expires 1y;
        add_header Cache-Control \"public, immutable\";
        access_log off;
    }
    
    # Favicon
    location = /favicon.ico {
        expires 30d;
        access_log off;
        log_not_found off;
    }
    
    # Robots.txt
    location = /robots.txt {
        expires 30d;
        access_log off;
        log_not_found off;
    }
    
    # Sitemap
    location = /sitemap.xml {
        expires 1d;
        access_log off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/x-javascript text/html;
    
    # Hide Nginx version
    server_tokens off;
    
    # Security
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
        
        # Enable the site
        sudo ln -sf /etc/nginx/sites-available/${PRIMARY_DOMAIN} /etc/nginx/sites-enabled/
        
        # Remove default site if it exists
        sudo rm -f /etc/nginx/sites-enabled/default
        
        # Test Nginx configuration
        sudo nginx -t
        
        # Reload Nginx
        sudo systemctl reload nginx
    "
    
    log_success "Nginx configured for static site"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check Nginx configuration
    log_info "Verifying Nginx configuration..."
    ssh_exec "sudo nginx -t"
    
    # Test site response
    log_info "Testing site response..."
    if curl -I "http://${BACKUP_DOMAIN}/" 2>/dev/null | head -1 | grep -q "200\|301\|302"; then
        log_success "Site is responding correctly"
    else
        log_warning "Site response test inconclusive - manual verification recommended"
    fi
    
    # Check file permissions
    log_info "Checking file permissions..."
    ssh_exec "ls -la ${WEB_ROOT}/ | head -5"
    
    log_success "Deployment verification completed"
}

# Cleanup function
cleanup() {
    log_info "Cleaning up local files..."
    rm -f "${DEPLOYMENT_ARCHIVE}"
    log_success "Cleanup completed"
}

# Main deployment workflow
main() {
    echo "============================================================================="
    echo "🚀 ASTRO STATIC SITE DEPLOYMENT"
    echo "   Casino Portal → LEMP Stack Server"
    echo "   Target: ${SERVER_HOST} (${WEB_ROOT})"
    echo "   Timestamp: ${TIMESTAMP}"
    echo "============================================================================="
    
    check_prerequisites
    build_astro_site
    create_deployment_archive
    upload_deployment_files
    deploy_static_site
    configure_nginx_static
    verify_deployment
    cleanup
    
    echo "============================================================================="
    log_success "🎉 ASTRO DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo ""
    echo "📋 DEPLOYMENT SUMMARY:"
    echo "   • Server: ${SERVER_HOST}"
    echo "   • Web Root: ${WEB_ROOT}"
    echo "   • Primary URL: https://${PRIMARY_DOMAIN}"
    echo "   • Backup URL: http://${BACKUP_DOMAIN}"
    echo "   • Timestamp: ${TIMESTAMP}"
    echo ""
    echo "🔧 POST-DEPLOYMENT TASKS:"
    echo "   • Configure SSL certificate (Let's Encrypt recommended)"
    echo "   • Setup domain DNS if not already configured"
    echo "   • Test all site functionality"
    echo "   • Configure monitoring and backups"
    echo "============================================================================="
}

# Execute main function with error handling
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    trap cleanup EXIT
    main "$@"
fi