#!/bin/bash

# =============================================================================
# COMPREHENSIVE SECURITY HARDENING SCRIPT
# Post-deployment security configuration for Casino Portal
# =============================================================================

set -e  # Exit on error

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

# Function to configure UFW firewall
configure_firewall() {
    log_info "Configuring UFW firewall..."
    
    # Reset firewall to ensure clean state
    sudo ufw --force reset
    
    # Set default policies
    sudo ufw default deny incoming
    sudo ufw default allow outgoing
    
    # Allow SSH (port 22)
    sudo ufw allow ssh
    
    # Allow HTTP and HTTPS
    sudo ufw allow 'Nginx Full'
    
    # Allow specific ports if needed
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    
    # Enable firewall
    sudo ufw --force enable
    
    log_success "UFW firewall configured and enabled"
}

# Function to install and configure fail2ban
configure_fail2ban() {
    log_info "Installing and configuring fail2ban..."
    
    # Install fail2ban
    sudo apt update
    sudo apt install -y fail2ban
    
    # Create custom configuration
    sudo tee /etc/fail2ban/jail.local > /dev/null << 'EOF'
[DEFAULT]
# Ban IP for 1 hour (3600 seconds)
bantime = 3600

# Find time window (10 minutes)
findtime = 600

# Number of failures before ban
maxretry = 5

# Email notifications (optional)
# destemail = admin@bestcasinoportal.com
# sendername = Fail2Ban
# sender = fail2ban@bestcasinoportal.com

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 1800

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
port = http,https
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
filter = nginx-botsearch
port = http,https
logpath = /var/log/nginx/access.log
maxretry = 2
EOF

    # Create custom nginx filter for bot protection
    sudo tee /etc/fail2ban/filter.d/nginx-botsearch.conf > /dev/null << 'EOF'
[Definition]
failregex = <HOST> - .* "(GET|POST|HEAD)" ".*(?:select|union|insert|script|alert|drop|delete|update|exec|eval|iframe)" .*$
            <HOST> - .* "(GET|POST|HEAD)" ".*/(?:wp-admin|phpmyadmin|admin|manager|cgi-bin)" .*$
            <HOST> - .* "(?:GET|POST|HEAD)" ".*/(?:\.env|\.git|\.svn|config\.php)" .*$

ignoreregex = 
EOF

    # Start and enable fail2ban
    sudo systemctl enable fail2ban
    sudo systemctl start fail2ban
    
    log_success "Fail2ban installed and configured"
}

# Function to enhance SSH security
configure_ssh_security() {
    log_info "Enhancing SSH security..."
    
    # Backup original SSH config
    sudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup
    
    # Configure SSH security settings
    sudo tee -a /etc/ssh/sshd_config > /dev/null << 'EOF'

# Enhanced Security Settings
Protocol 2
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
MaxStartups 3:30:10
LoginGraceTime 60
AllowUsers admin
EOF

    # Test SSH configuration
    sudo sshd -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl reload ssh
        log_success "SSH security configuration applied"
    else
        log_error "SSH configuration test failed, restoring backup"
        sudo cp /etc/ssh/sshd_config.backup /etc/ssh/sshd_config
        return 1
    fi
}

# Function to configure additional security headers
configure_security_headers() {
    log_info "Configuring enhanced security headers..."
    
    # Create security headers configuration
    sudo tee /etc/nginx/conf.d/security-headers.conf > /dev/null << 'EOF'
# Enhanced Security Headers
add_header X-Content-Type-Options nosniff always;
add_header X-Frame-Options DENY always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;

# Content Security Policy (adjust as needed for your content)
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';" always;

# Hide Nginx version
server_tokens off;

# Rate limiting
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=static:10m rate=20r/s;
EOF

    # Test Nginx configuration
    sudo nginx -t
    
    if [ $? -eq 0 ]; then
        sudo systemctl reload nginx
        log_success "Security headers configured"
    else
        log_error "Nginx configuration test failed"
        return 1
    fi
}

# Function to disable unnecessary services
disable_unnecessary_services() {
    log_info "Disabling unnecessary services..."
    
    # List of services to disable (adjust based on your needs)
    local services_to_disable=(
        "bluetooth"
        "cups"
        "avahi-daemon"
        "whoopsie"
    )
    
    for service in "${services_to_disable[@]}"; do
        if systemctl is-enabled $service >/dev/null 2>&1; then
            sudo systemctl disable $service
            sudo systemctl stop $service
            log_info "Disabled service: $service"
        fi
    done
    
    log_success "Unnecessary services disabled"
}

# Function to configure automatic security updates
configure_auto_updates() {
    log_info "Configuring automatic security updates..."
    
    # Install unattended-upgrades
    sudo apt install -y unattended-upgrades
    
    # Configure automatic updates
    sudo tee /etc/apt/apt.conf.d/50unattended-upgrades > /dev/null << 'EOF'
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
    "${distro_id} ESMApps:${distro_codename}-apps-security";
    "${distro_id} ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";

Unattended-Upgrade::Mail "admin@bestcasinoportal.com";
Unattended-Upgrade::MailOnlyOnError "true";
EOF

    # Enable automatic updates
    sudo tee /etc/apt/apt.conf.d/20auto-upgrades > /dev/null << 'EOF'
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Unattended-Upgrade "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
EOF

    log_success "Automatic security updates configured"
}

# Function to set up log rotation
configure_log_rotation() {
    log_info "Configuring log rotation..."
    
    # Configure logrotate for nginx
    sudo tee /etc/logrotate.d/nginx > /dev/null << 'EOF'
/var/log/nginx/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data adm
    sharedscripts
    postrotate
        if [ -f /var/run/nginx.pid ]; then
            kill -USR1 `cat /var/run/nginx.pid`
        fi
    endscript
}
EOF

    # Configure logrotate for fail2ban
    sudo tee /etc/logrotate.d/fail2ban > /dev/null << 'EOF'
/var/log/fail2ban.log {
    weekly
    rotate 4
    missingok
    notifempty
    compress
    copytruncate
}
EOF

    log_success "Log rotation configured"
}

# Function to install security monitoring tools
install_monitoring_tools() {
    log_info "Installing security monitoring tools..."
    
    # Install useful security tools
    sudo apt install -y \
        htop \
        iotop \
        netstat-nat \
        tcpdump \
        nmap \
        aide \
        rkhunter \
        chkrootkit
    
    # Configure AIDE (Advanced Intrusion Detection Environment)
    sudo aideinit
    
    log_success "Security monitoring tools installed"
}

# Function to create security check script
create_security_check_script() {
    log_info "Creating security check script..."
    
    sudo tee /usr/local/bin/security-check.sh > /dev/null << 'EOF'
#!/bin/bash

# Daily security check script
echo "=== DAILY SECURITY CHECK $(date) ==="

echo "--- UFW Status ---"
sudo ufw status

echo "--- Fail2ban Status ---"
sudo fail2ban-client status

echo "--- Active SSH Connections ---"
who

echo "--- Failed Login Attempts (last 24h) ---"
grep "Failed password" /var/log/auth.log | grep "$(date '+%b %d')" | wc -l

echo "--- Disk Usage ---"
df -h

echo "--- Memory Usage ---"
free -h

echo "--- Load Average ---"
uptime

echo "--- Top Processes ---"
ps aux --sort=-%cpu | head -10

echo "--- Network Connections ---"
ss -tuln

echo "--- SSL Certificate Status ---"
echo | openssl s_client -servername bestcasinopo.vps.webdock.cloud -connect bestcasinopo.vps.webdock.cloud:443 2>/dev/null | openssl x509 -noout -dates

echo "=== END SECURITY CHECK ==="
EOF

    sudo chmod +x /usr/local/bin/security-check.sh
    
    # Create daily cron job
    sudo tee /etc/cron.d/security-check > /dev/null << 'EOF'
# Daily security check
0 6 * * * root /usr/local/bin/security-check.sh >> /var/log/security-check.log 2>&1
EOF

    log_success "Security check script created"
}

# Main execution function
main() {
    echo "============================================================================="
    echo "🔒 COMPREHENSIVE SECURITY HARDENING"
    echo "   Casino Portal Production Server"
    echo "   $(date)"
    echo "============================================================================="
    
    configure_firewall
    configure_fail2ban
    configure_ssh_security
    configure_security_headers
    disable_unnecessary_services
    configure_auto_updates
    configure_log_rotation
    install_monitoring_tools
    create_security_check_script
    
    echo "============================================================================="
    log_success "🎉 SECURITY HARDENING COMPLETED!"
    echo ""
    echo "📋 SECURITY SUMMARY:"
    echo "   ✅ UFW firewall configured and enabled"
    echo "   ✅ Fail2ban installed with custom rules"
    echo "   ✅ SSH security enhanced"
    echo "   ✅ Enhanced security headers configured"
    echo "   ✅ Unnecessary services disabled"
    echo "   ✅ Automatic security updates enabled"
    echo "   ✅ Log rotation configured"
    echo "   ✅ Security monitoring tools installed"
    echo "   ✅ Daily security check script created"
    echo ""
    echo "🔧 SECURITY STATUS:"
    echo "   • Firewall: Active"
    echo "   • Fail2ban: Active"
    echo "   • SSL: Enabled (Let's Encrypt)"
    echo "   • Security Headers: Enhanced"
    echo "   • Auto Updates: Enabled"
    echo ""
    echo "📊 MONITORING:"
    echo "   • Daily security checks: /var/log/security-check.log"
    echo "   • Manual security check: sudo /usr/local/bin/security-check.sh"
    echo "   • Fail2ban status: sudo fail2ban-client status"
    echo "   • Firewall status: sudo ufw status"
    echo "============================================================================="
}

# Execute if run directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi