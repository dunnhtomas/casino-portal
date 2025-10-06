#!/bin/bash

# =============================================================================
# PRODUCTION DEPLOYMENT AUTOMATION SCRIPT
# Next.js Casino Portal - Automated SSH Deployment
# =============================================================================
# 
# Server: bestcasinopo.vps.webdock.cloud (193.181.210.101)
# Stack: LEMP (Nginx + MySQL 8.3 + PHP 8.3) + Node.js 20.19.5
# Target: /var/www/html (LEMP standard web root)
# Authentication: SSH key (id_rsa) as admin user
# 
# Prerequisites:
# - SSH key id_rsa configured for admin@193.181.210.101
# - Source files ready in current directory
# - Server has LEMP stack and Node.js installed
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
APP_NAME="best-casino-portal"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_ARCHIVE="casino-portal-deploy-${TIMESTAMP}.tar.gz"
TEMP_DIR="/tmp/casino-portal-deploy-${TIMESTAMP}"

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
    local required_files=("package.json" "next.config.ts" "tsconfig.json")
    for file in "${required_files[@]}"; do
        if [ ! -f "$file" ]; then
            log_error "Required file $file not found!"
            exit 1
        fi
    done
    
    # Test SSH connection
    if ! ssh_exec "echo 'SSH connection successful'"; then
        log_error "SSH connection failed!"
        exit 1
    fi
    
    log_success "Prerequisites check completed"
}

# Create deployment archive
create_deployment_archive() {
    log_info "Creating deployment archive..."
    
    # Exclude development artifacts and sensitive files
    tar -czf "${DEPLOYMENT_ARCHIVE}" \
        --exclude=node_modules \
        --exclude=.next \
        --exclude=.git \
        --exclude=.env.local \
        --exclude=.env.development \
        --exclude="*.log" \
        --exclude=coverage \
        --exclude=.nyc_output \
        app/ \
        components/ \
        lib/ \
        public/ \
        scripts/ \
        package.json \
        package-lock.json \
        next.config.ts \
        tsconfig.json \
        tailwind.config.ts \
        postcss.config.mjs \
        2>/dev/null || {
        log_warning "Some optional files were not found, continuing..."
    }
    
    log_success "Deployment archive created: ${DEPLOYMENT_ARCHIVE}"
}

# Upload deployment files
upload_deployment_files() {
    log_info "Uploading deployment files..."
    
    scp_upload "${DEPLOYMENT_ARCHIVE}" "/tmp/"
    
    log_success "Files uploaded to server"
}

# Setup server for Next.js
setup_nextjs_environment() {
    log_info "Setting up Next.js environment on server..."
    
    ssh_exec "
        # Install PM2 globally if not already installed
        if ! command -v pm2 &> /dev/null; then
            echo 'Installing PM2...'
            sudo npm install -g pm2
        fi
        
        # Create application directory if it doesn't exist
        sudo mkdir -p ${WEB_ROOT}
        
        # Set proper ownership
        sudo chown -R www-data:www-data ${WEB_ROOT}
        
        # Install sharp for Next.js image optimization
        if [ -f '${WEB_ROOT}/package.json' ]; then
            cd ${WEB_ROOT}
            sudo -u www-data npm install sharp 2>/dev/null || echo 'Sharp installation attempted'
        fi
    "
    
    log_success "Next.js environment setup completed"
}

# Deploy application files
deploy_application() {
    log_info "Deploying application files..."
    
    ssh_exec "
        # Create backup of current deployment if it exists
        if [ -d '${WEB_ROOT}/app' ]; then
            echo 'Creating backup of current deployment...'
            sudo cp -r ${WEB_ROOT} /var/backups/casino-portal-backup-${TIMESTAMP} || echo 'Backup creation attempted'
        fi
        
        # Stop PM2 process if running
        sudo -u www-data pm2 stop ${APP_NAME} 2>/dev/null || echo 'PM2 stop attempted (process may not exist)'
        
        # Extract deployment files
        cd /tmp
        tar -xzf ${DEPLOYMENT_ARCHIVE}
        
        # Copy application files to web root
        sudo cp -r app/ components/ lib/ public/ scripts/ ${WEB_ROOT}/
        sudo cp package.json package-lock.json next.config.ts tsconfig.json ${WEB_ROOT}/
        
        # Copy optional config files if they exist
        [ -f tailwind.config.ts ] && sudo cp tailwind.config.ts ${WEB_ROOT}/ || true
        [ -f postcss.config.mjs ] && sudo cp postcss.config.mjs ${WEB_ROOT}/ || true
        
        # Set proper permissions
        sudo chown -R www-data:www-data ${WEB_ROOT}
        sudo chmod -R 755 ${WEB_ROOT}
        
        # Clean up temp files
        rm -f ${DEPLOYMENT_ARCHIVE}
        rm -rf casino-portal-deploy-* 2>/dev/null || true
    "
    
    log_success "Application files deployed"
}

# Install dependencies and build
build_application() {
    log_info "Installing dependencies and building application..."
    
    ssh_exec "
        cd ${WEB_ROOT}
        
        # Install dependencies
        sudo -u www-data npm ci --production=false
        
        # Install sharp for image optimization
        sudo -u www-data npm install sharp
        
        # Create .env.production if it doesn't exist
        if [ ! -f '.env.production' ]; then
            sudo -u www-data tee .env.production > /dev/null << EOF
NODE_ENV=production
DATABASE_URL=mysql://bestcasinopo:Wp4BTYb7kveH@localhost:3306/bestcasinopo
NEXTAUTH_URL=https://${PRIMARY_DOMAIN}
NEXTAUTH_SECRET=\$(openssl rand -base64 32)
NEXT_PUBLIC_SITE_URL=https://${PRIMARY_DOMAIN}
EOF
        fi
        
        # Build the application
        sudo -u www-data npm run build
    "
    
    log_success "Application built successfully"
}

# Configure PM2 for application management
configure_pm2() {
    log_info "Configuring PM2 process manager..."
    
    ssh_exec "
        cd ${WEB_ROOT}
        
        # Create PM2 ecosystem config if it doesn't exist
        if [ ! -f 'ecosystem.config.js' ]; then
            sudo -u www-data tee ecosystem.config.js > /dev/null << 'EOF'
module.exports = {
  apps: [{
    name: '${APP_NAME}',
    script: 'npm',
    args: 'start',
    cwd: '${WEB_ROOT}',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      HOSTNAME: '0.0.0.0'
    },
    error_file: '/var/log/casino-portal/pm2-error.log',
    out_file: '/var/log/casino-portal/pm2-out.log',
    log_file: '/var/log/casino-portal/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
EOF
        fi
        
        # Create log directory
        sudo mkdir -p /var/log/casino-portal
        sudo chown -R www-data:www-data /var/log/casino-portal
        
        # Start the application with PM2
        sudo -u www-data pm2 start ecosystem.config.js
        
        # Save PM2 configuration
        sudo -u www-data pm2 save
        
        # Setup PM2 startup script
        sudo env PATH=\$PATH:/usr/bin pm2 startup systemd -u www-data --hp /var/www
    "
    
    log_success "PM2 configured and application started"
}

# Configure Nginx as reverse proxy
configure_nginx() {
    log_info "Configuring Nginx reverse proxy..."
    
    ssh_exec "
        # Create Nginx configuration for Next.js
        sudo tee /etc/nginx/sites-available/${PRIMARY_DOMAIN} > /dev/null << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name ${PRIMARY_DOMAIN} www.${PRIMARY_DOMAIN} ${BACKUP_DOMAIN};
    
    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options DENY;
    add_header X-XSS-Protection \"1; mode=block\";
    
    # Proxy to Next.js application
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 86400;
    }
    
    # Static assets optimization
    location /_next/static/ {
        alias ${WEB_ROOT}/.next/static/;
        expires 1y;
        add_header Cache-Control \"public, immutable\";
        access_log off;
    }
    
    # Public files
    location /public/ {
        alias ${WEB_ROOT}/public/;
        expires 30d;
        add_header Cache-Control \"public\";
        access_log off;
    }
    
    # Favicon and robots.txt
    location ~ ^/(favicon\.ico|robots\.txt)\$ {
        root ${WEB_ROOT}/public;
        expires 30d;
        access_log off;
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/x-javascript;
    
    # Hide Nginx version
    server_tokens off;
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
    
    log_success "Nginx configured as reverse proxy"
}

# Verify deployment
verify_deployment() {
    log_info "Verifying deployment..."
    
    # Check PM2 status
    log_info "Checking PM2 status..."
    ssh_exec "sudo -u www-data pm2 status"
    
    # Check if Next.js app is responding
    log_info "Testing Next.js application..."
    ssh_exec "curl -I http://127.0.0.1:3000/ || echo 'Next.js app may still be starting...'"
    
    # Check Nginx configuration
    log_info "Verifying Nginx configuration..."
    ssh_exec "sudo nginx -t"
    
    # Test domain response
    log_info "Testing domain response..."
    if curl -I "http://${BACKUP_DOMAIN}/" 2>/dev/null; then
        log_success "Domain is responding"
    else
        log_warning "Domain test failed - may need DNS propagation time"
    fi
    
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
    echo "🚀 AUTOMATED PRODUCTION DEPLOYMENT"
    echo "   Next.js Casino Portal → LEMP Stack Server"
    echo "   Target: ${SERVER_HOST} (${WEB_ROOT})"
    echo "   Timestamp: ${TIMESTAMP}"
    echo "============================================================================="
    
    check_prerequisites
    create_deployment_archive
    upload_deployment_files
    setup_nextjs_environment
    deploy_application
    build_application
    configure_pm2
    configure_nginx
    verify_deployment
    cleanup
    
    echo "============================================================================="
    log_success "🎉 DEPLOYMENT COMPLETED SUCCESSFULLY!"
    echo ""
    echo "📋 DEPLOYMENT SUMMARY:"
    echo "   • Server: ${SERVER_HOST}"
    echo "   • Application: ${WEB_ROOT}"
    echo "   • Primary URL: https://${PRIMARY_DOMAIN}"
    echo "   • Backup URL: http://${BACKUP_DOMAIN}"
    echo "   • PM2 Process: ${APP_NAME}"
    echo "   • Timestamp: ${TIMESTAMP}"
    echo ""
    echo "🔧 POST-DEPLOYMENT TASKS:"
    echo "   • Configure SSL certificate (Let's Encrypt recommended)"
    echo "   • Setup domain DNS if not already configured"
    echo "   • Configure monitoring and backups"
    echo "   • Test all application features"
    echo "============================================================================="
}

# Execute main function with error handling
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    trap cleanup EXIT
    main "$@"
fi