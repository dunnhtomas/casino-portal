#!/bin/bash

# =============================================================================
# ASTRO STATIC SITE SERVER SETUP
# LEMP Stack Optimization for Astro Static Site Hosting
# =============================================================================
# 
# Server: bestcasinopo.vps.webdock.cloud (193.181.210.101)
# Purpose: Optimize LEMP stack for high-performance static site hosting
# Target: Astro-built static casino portal
# 
# This script optimizes the existing LEMP stack for static file serving
# =============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Server Configuration
SERVER_HOST="193.181.210.101"
SERVER_USER="admin"
SSH_KEY="id_rsa"
PRIMARY_DOMAIN="bestcasinoportal.com"
BACKUP_DOMAIN="bestcasinopo.vps.webdock.cloud"
WEB_ROOT="/var/www/html"

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

# Main server optimization function
optimize_server_for_static() {
    log_info "Optimizing LEMP stack for Astro static site..."
    
    ssh_exec "
        # Update system packages
        echo 'Updating system packages...'
        sudo apt update && sudo apt upgrade -y
        
        # Optimize Nginx for static file serving
        echo 'Optimizing Nginx configuration...'
        
        # Backup original nginx.conf
        sudo cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
        
        # Create optimized nginx.conf for static sites
        sudo tee /etc/nginx/nginx.conf > /dev/null << 'EOF'
user www-data;
worker_processes auto;
pid /run/nginx.pid;
include /etc/nginx/modules-enabled/*.conf;

events {
    worker_connections 2048;
    use epoll;
    multi_accept on;
}

http {
    # Basic Settings
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 30;
    keepalive_requests 100;
    types_hash_max_size 2048;
    server_tokens off;
    client_max_body_size 16M;
    
    # MIME Types
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    # Compression Settings (optimized for static sites)
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_types
        application/atom+xml
        application/geo+json
        application/javascript
        application/x-javascript
        application/json
        application/ld+json
        application/manifest+json
        application/rdf+xml
        application/rss+xml
        application/xhtml+xml
        application/xml
        font/eot
        font/otf
        font/ttf
        image/svg+xml
        text/css
        text/javascript
        text/plain
        text/xml;
    
    # Brotli Compression (if available)
    # brotli on;
    # brotli_comp_level 4;
    # brotli_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Open File Cache (for static files)
    open_file_cache max=10000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    
    # Logging Settings
    log_format main '\$remote_addr - \$remote_user [\$time_local] \"\$request\" '
                    '\$status \$body_bytes_sent \"\$http_referer\" '
                    '\"\$http_user_agent\" \"\$http_x_forwarded_for\"';
    
    access_log /var/log/nginx/access.log main;
    error_log /var/log/nginx/error.log warn;
    
    # Virtual Host Configs
    include /etc/nginx/conf.d/*.conf;
    include /etc/nginx/sites-enabled/*;
}
EOF
        
        # Create security headers configuration
        sudo tee /etc/nginx/conf.d/security-headers.conf > /dev/null << 'EOF'
# Security Headers for Static Sites
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection \"1; mode=block\" always;
add_header Referrer-Policy \"strict-origin-when-cross-origin\" always;
add_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';\" always;
EOF
        
        # Create static file caching configuration
        sudo tee /etc/nginx/conf.d/static-cache.conf > /dev/null << 'EOF'
# Static File Caching Configuration
location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|webp|avif|woff|woff2|ttf|eot|otf)\$ {
    expires 1y;
    add_header Cache-Control \"public, immutable\";
    add_header Vary \"Accept-Encoding\";
    access_log off;
    
    # Enable compression for static assets
    gzip_static on;
}

# Special handling for Astro assets
location /_astro/ {
    expires 1y;
    add_header Cache-Control \"public, immutable\";
    add_header Vary \"Accept-Encoding\";
    access_log off;
    gzip_static on;
}

# HTML files (shorter cache)
location ~* \.html\$ {
    expires 1h;
    add_header Cache-Control \"public, must-revalidate\";
    add_header Vary \"Accept-Encoding\";
}
EOF
        
        # Ensure web root exists with proper permissions
        echo 'Setting up web root directory...'
        sudo mkdir -p ${WEB_ROOT}
        sudo chown -R www-data:www-data ${WEB_ROOT}
        sudo chmod -R 755 ${WEB_ROOT}
        
        # Install additional useful packages for static hosting
        echo 'Installing additional packages...'
        sudo apt install -y curl wget unzip htop fail2ban ufw
        
        # Configure basic firewall
        echo 'Configuring basic firewall...'
        sudo ufw --force reset
        sudo ufw default deny incoming
        sudo ufw default allow outgoing
        sudo ufw allow ssh
        sudo ufw allow 'Nginx Full'
        sudo ufw --force enable
        
        # Configure fail2ban for basic security
        echo 'Configuring fail2ban...'
        sudo systemctl enable fail2ban
        sudo systemctl start fail2ban
        
        # Optimize system for static file serving
        echo 'Optimizing system parameters...'
        
        # Create sysctl optimizations
        sudo tee /etc/sysctl.d/99-nginx-static.conf > /dev/null << 'EOF'
# Network optimizations for static file serving
net.core.somaxconn = 65536
net.core.netdev_max_backlog = 5000
net.ipv4.tcp_max_syn_backlog = 65536
net.ipv4.tcp_fin_timeout = 10
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_intvl = 30
net.ipv4.tcp_keepalive_probes = 3
net.ipv4.ip_local_port_range = 1024 65000
net.ipv4.tcp_rmem = 4096 65536 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
EOF
        
        # Apply sysctl settings
        sudo sysctl -p /etc/sysctl.d/99-nginx-static.conf
        
        # Test Nginx configuration
        echo 'Testing Nginx configuration...'
        sudo nginx -t
        
        # Restart services
        echo 'Restarting services...'
        sudo systemctl restart nginx
        sudo systemctl enable nginx
        
        # Since we don't need Node.js for static site, we can optimize by disabling unnecessary services
        # But keeping them available in case needed later
        echo 'Optimizing system services...'
        
        # Create a simple index.html if none exists
        if [ ! -f '${WEB_ROOT}/index.html' ]; then
            sudo tee ${WEB_ROOT}/index.html > /dev/null << 'EOF'
<!DOCTYPE html>
<html lang=\"en\">
<head>
    <meta charset=\"UTF-8\">
    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">
    <title>Casino Portal - Deployment Ready</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            margin: 50px; 
            background: linear-gradient(135deg, #1e3c72, #2a5298);
            color: white;
        }
        .container { 
            max-width: 600px; 
            margin: 0 auto; 
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
        }
        h1 { color: #ffd700; margin-bottom: 20px; }
        .status { 
            background: rgba(76, 175, 80, 0.8); 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class=\"container\">
        <h1>🎰 Casino Portal</h1>
        <div class=\"status\">
            <h2>✅ Server Ready for Deployment</h2>
            <p>LEMP stack optimized for Astro static site hosting</p>
        </div>
        <p>Server: ${BACKUP_DOMAIN}</p>
        <p>Status: Ready for Astro deployment</p>
        <p>Optimized: Static file serving & caching</p>
    </div>
</body>
</html>
EOF
            sudo chown www-data:www-data ${WEB_ROOT}/index.html
        fi
        
        echo 'Server optimization completed successfully!'
    "
    
    log_success "LEMP stack optimized for Astro static site hosting"
}

# Verify server optimization
verify_optimization() {
    log_info "Verifying server optimization..."
    
    ssh_exec "
        echo '=== Nginx Status ==='
        sudo systemctl status nginx --no-pager -l
        
        echo -e '\n=== Nginx Configuration Test ==='
        sudo nginx -t
        
        echo -e '\n=== Web Root Permissions ==='
        ls -la ${WEB_ROOT}/
        
        echo -e '\n=== Firewall Status ==='
        sudo ufw status
        
        echo -e '\n=== System Resource Usage ==='
        free -h
        df -h /
        
        echo -e '\n=== Server Response Test ==='
        curl -I http://localhost/ 2>/dev/null | head -5 || echo 'Server response test completed'
    "
    
    log_success "Server optimization verification completed"
}

# Main execution
main() {
    echo "============================================================================="
    echo "🔧 ASTRO STATIC SITE SERVER OPTIMIZATION"
    echo "   LEMP Stack → Optimized for Static File Serving"
    echo "   Server: ${SERVER_HOST}"
    echo "============================================================================="
    
    optimize_server_for_static
    verify_optimization
    
    echo "============================================================================="
    log_success "🎉 SERVER OPTIMIZATION COMPLETED!"
    echo ""
    echo "📋 OPTIMIZATION SUMMARY:"
    echo "   • LEMP stack optimized for static file serving"
    echo "   • Nginx configured with advanced caching"
    echo "   • Security headers and firewall configured"
    echo "   • System parameters tuned for performance"
    echo "   • Ready for Astro static site deployment"
    echo ""
    echo "🚀 NEXT STEPS:"
    echo "   • Run astro-deployment-automation.sh to deploy your site"
    echo "   • Configure SSL certificate (Let's Encrypt recommended)"
    echo "   • Setup domain DNS pointing to ${SERVER_HOST}"
    echo "============================================================================="
}

# Execute if run directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi