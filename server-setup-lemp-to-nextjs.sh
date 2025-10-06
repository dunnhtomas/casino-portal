#!/bin/bash

# =============================================================================
# SERVER SETUP SCRIPT: LEMP TO NEXT.JS CONFIGURATION
# Prepares LEMP stack server for Next.js deployment
# =============================================================================
# 
# Server: bestcasinopo.vps.webdock.cloud (193.181.210.101)
# Current Stack: LEMP (Nginx + MySQL 8.3 + PHP 8.3)
# Target Stack: LEMP + Node.js 20.19.5 + PM2 + Next.js
# Authentication: SSH key (id_rsa) as admin user
# 
# This script prepares the server for Next.js deployment while maintaining
# the existing LEMP stack functionality.
# =============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration Variables
SERVER_HOST="193.181.210.101"
SERVER_USER="admin"
SSH_KEY="id_rsa"
WEB_ROOT="/var/www/html"
MYSQL_ROOT_PASSWORD="93r7ktFBbS7X"
MYSQL_DB="bestcasinopo"
MYSQL_USER="bestcasinopo"
MYSQL_PASSWORD="Wp4BTYb7kveH"

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

# Verify server connection and basic info
verify_server() {
    log_info "Verifying server connection and basic information..."
    
    ssh_exec "
        echo '=== SERVER INFORMATION ==='
        echo 'Hostname: \$(hostname)'
        echo 'OS: \$(lsb_release -d | cut -f2)'
        echo 'Kernel: \$(uname -r)'
        echo 'Architecture: \$(uname -m)'
        echo 'Uptime: \$(uptime -p)'
        echo ''
        echo '=== LEMP STACK STATUS ==='
        systemctl is-active nginx && echo 'Nginx: Active' || echo 'Nginx: Inactive'
        systemctl is-active mysql && echo 'MySQL: Active' || echo 'MySQL: Inactive'
        php -v | head -1 && echo 'PHP: Installed' || echo 'PHP: Not found'
        echo ''
        echo '=== NODE.JS STATUS ==='
        node --version 2>/dev/null && echo 'Node.js: Installed' || echo 'Node.js: Not installed'
        npm --version 2>/dev/null && echo 'NPM: Installed' || echo 'NPM: Not installed'
    "
    
    log_success "Server verification completed"
}

# Install and configure Node.js if needed
setup_nodejs() {
    log_info "Setting up Node.js environment..."
    
    ssh_exec "
        # Check if Node.js is already installed with correct version
        if command -v node &> /dev/null; then
            NODE_VERSION=\$(node --version)
            echo 'Current Node.js version: '\$NODE_VERSION
            if [[ \$NODE_VERSION == v20* ]]; then
                echo 'Node.js 20.x is already installed'
                exit 0
            fi
        fi
        
        echo 'Installing Node.js 20.x LTS...'
        
        # Remove old Node.js if present
        sudo apt-get remove -y nodejs npm 2>/dev/null || true
        
        # Install Node.js 20.x LTS via NodeSource repository
        curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
        sudo apt-get install -y nodejs
        
        # Verify installation
        echo 'Node.js version: '\$(node --version)
        echo 'NPM version: '\$(npm --version)
        
        # Install PM2 globally
        sudo npm install -g pm2
        echo 'PM2 version: '\$(pm2 --version)
        
        # Setup PM2 for www-data user
        sudo -u www-data pm2 startup || echo 'PM2 startup setup attempted'
    "
    
    log_success "Node.js environment setup completed"
}

# Configure MySQL for Next.js application
configure_mysql() {
    log_info "Configuring MySQL for Next.js application..."
    
    ssh_exec "
        # Verify MySQL is running
        if ! systemctl is-active --quiet mysql; then
            echo 'Starting MySQL service...'
            sudo systemctl start mysql
        fi
        
        # Test MySQL connection and verify database
        mysql -u root -p${MYSQL_ROOT_PASSWORD} -e \"
            SHOW DATABASES;
            USE ${MYSQL_DB};
            SHOW TABLES;
        \" 2>/dev/null && echo 'MySQL database ${MYSQL_DB} is accessible' || {
            echo 'Setting up MySQL database...'
            mysql -u root -p${MYSQL_ROOT_PASSWORD} -e \"
                CREATE DATABASE IF NOT EXISTS ${MYSQL_DB};
                GRANT ALL PRIVILEGES ON ${MYSQL_DB}.* TO '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}';
                FLUSH PRIVILEGES;
            \"
        }
        
        # Test application user connection
        mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e \"USE ${MYSQL_DB}; SELECT 'Connection successful' as status;\" && echo 'MySQL application user connection verified'
    "
    
    log_success "MySQL configuration completed"
}

# Setup directory structure and permissions
setup_directory_structure() {
    log_info "Setting up directory structure and permissions..."
    
    ssh_exec "
        # Create necessary directories
        sudo mkdir -p ${WEB_ROOT}
        sudo mkdir -p /var/log/casino-portal
        sudo mkdir -p /var/backups/casino-portal
        
        # Set proper ownership
        sudo chown -R www-data:www-data ${WEB_ROOT}
        sudo chown -R www-data:www-data /var/log/casino-portal
        sudo chown -R www-data:www-data /var/backups/casino-portal
        
        # Set proper permissions
        sudo chmod -R 755 ${WEB_ROOT}
        sudo chmod -R 755 /var/log/casino-portal
        sudo chmod -R 755 /var/backups/casino-portal
        
        # Verify directory structure
        echo 'Directory structure:'
        ls -la /var/www/
        ls -la /var/log/casino-portal/
        ls -la /var/backups/casino-portal/
    "
    
    log_success "Directory structure setup completed"
}

# Install additional dependencies for Next.js
install_nextjs_dependencies() {
    log_info "Installing additional dependencies for Next.js..."
    
    ssh_exec "
        # Update package list
        sudo apt-get update
        
        # Install additional packages that might be needed
        sudo apt-get install -y \\
            build-essential \\
            python3 \\
            python3-pip \\
            git \\
            curl \\
            wget \\
            unzip \\
            software-properties-common \\
            ca-certificates \\
            gnupg \\
            lsb-release
        
        # Install image processing libraries for Next.js image optimization
        sudo apt-get install -y \\
            libjpeg-dev \\
            libpng-dev \\
            libwebp-dev \\
            libavif-dev
        
        echo 'Additional dependencies installed'
    "
    
    log_success "Additional dependencies installation completed"
}

# Configure firewall for Next.js
configure_firewall() {
    log_info "Configuring firewall for Next.js application..."
    
    ssh_exec "
        # Check if UFW is installed and active
        if command -v ufw &> /dev/null; then
            echo 'UFW firewall detected'
            
            # Allow SSH (should already be allowed)
            sudo ufw allow ssh
            
            # Allow HTTP and HTTPS
            sudo ufw allow 80/tcp
            sudo ufw allow 443/tcp
            
            # Allow MySQL (local only)
            sudo ufw allow from 127.0.0.1 to any port 3306
            
            # Do NOT allow external access to Node.js port 3000 (Nginx proxy only)
            # sudo ufw deny 3000/tcp
            
            echo 'Firewall rules configured'
            sudo ufw status numbered
        else
            echo 'UFW not installed - using iptables or no firewall'
        fi
    "
    
    log_success "Firewall configuration completed"
}

# Create environment template
create_environment_template() {
    log_info "Creating environment configuration template..."
    
    ssh_exec "
        # Create .env template in web root
        sudo -u www-data tee ${WEB_ROOT}/.env.template > /dev/null << 'EOF'
# Environment Configuration Template for Next.js Casino Portal
# Copy this to .env.production and fill in the values

# Application Environment
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Database Configuration
DATABASE_URL=mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:3306/${MYSQL_DB}

# NextAuth Configuration
NEXTAUTH_URL=https://bestcasinoportal.com
NEXTAUTH_SECRET=generate_32_character_secret_here

# Application URLs
NEXT_PUBLIC_SITE_URL=https://bestcasinoportal.com
NEXT_PUBLIC_API_URL=https://bestcasinoportal.com/api

# Optional: External API Keys
# DEEPSEEK_API_KEY=your_deepseek_api_key_here
# OPENAI_API_KEY=your_openai_api_key_here

# Optional: Analytics and Monitoring
# GOOGLE_ANALYTICS_ID=your_ga_id_here
# SENTRY_DSN=your_sentry_dsn_here

# Optional: Email Configuration
# EMAIL_SERVER_HOST=smtp.example.com
# EMAIL_SERVER_PORT=587
# EMAIL_SERVER_USER=your_email_user
# EMAIL_SERVER_PASSWORD=your_email_password
# EMAIL_FROM=noreply@bestcasinoportal.com
EOF
        
        echo 'Environment template created at ${WEB_ROOT}/.env.template'
    "
    
    log_success "Environment template creation completed"
}

# Verify server readiness for Next.js deployment
verify_readiness() {
    log_info "Verifying server readiness for Next.js deployment..."
    
    ssh_exec "
        echo '=== DEPLOYMENT READINESS CHECK ==='
        
        # Check services
        echo 'Service Status:'
        systemctl is-active nginx && echo '✓ Nginx: Running' || echo '✗ Nginx: Not running'
        systemctl is-active mysql && echo '✓ MySQL: Running' || echo '✗ MySQL: Not running'
        
        # Check Node.js
        if command -v node &> /dev/null; then
            echo '✓ Node.js: '\$(node --version)
        else
            echo '✗ Node.js: Not installed'
        fi
        
        # Check PM2
        if command -v pm2 &> /dev/null; then
            echo '✓ PM2: '\$(pm2 --version)
        else
            echo '✗ PM2: Not installed'
        fi
        
        # Check directories
        [ -d '${WEB_ROOT}' ] && echo '✓ Web root directory: ${WEB_ROOT}' || echo '✗ Web root directory missing'
        [ -d '/var/log/casino-portal' ] && echo '✓ Log directory: /var/log/casino-portal' || echo '✗ Log directory missing'
        [ -d '/var/backups/casino-portal' ] && echo '✓ Backup directory: /var/backups/casino-portal' || echo '✗ Backup directory missing'
        
        # Check MySQL connection
        mysql -u ${MYSQL_USER} -p${MYSQL_PASSWORD} -e 'SELECT 1' &>/dev/null && echo '✓ MySQL connection: Working' || echo '✗ MySQL connection: Failed'
        
        # Check permissions
        [ -w '${WEB_ROOT}' ] && echo '✓ Web root writable: Yes' || echo '✗ Web root writable: No'
        
        # Check disk space
        echo 'Disk space:'
        df -h /var/www /var/log /var/backups
        
        # Check memory
        echo 'Memory usage:'
        free -h
        
        echo '=== READINESS CHECK COMPLETED ==='
    "
    
    log_success "Server readiness verification completed"
}

# Main setup workflow
main() {
    echo "============================================================================="
    echo "🔧 SERVER SETUP: LEMP TO NEXT.JS CONFIGURATION"
    echo "   Target: ${SERVER_HOST}"
    echo "   Stack: LEMP + Node.js + PM2 + Next.js"
    echo "   Web Root: ${WEB_ROOT}"
    echo "============================================================================="
    
    verify_server
    setup_nodejs
    configure_mysql
    setup_directory_structure
    install_nextjs_dependencies
    configure_firewall
    create_environment_template
    verify_readiness
    
    echo "============================================================================="
    log_success "🎉 SERVER SETUP COMPLETED SUCCESSFULLY!"
    echo ""
    echo "📋 SETUP SUMMARY:"
    echo "   • LEMP stack: Maintained and running"
    echo "   • Node.js 20.x: Installed and configured"
    echo "   • PM2: Installed globally"
    echo "   • MySQL: Configured for Next.js app"
    echo "   • Directories: Created with proper permissions"
    echo "   • Environment: Template created"
    echo ""
    echo "🚀 NEXT STEPS:"
    echo "   • Run the deployment script: ./production-deployment-ssh-automation.sh"
    echo "   • Configure environment variables in .env.production"
    echo "   • Setup SSL certificate (Let's Encrypt)"
    echo "   • Configure domain DNS"
    echo "============================================================================="
}

# Execute main function with error handling
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi