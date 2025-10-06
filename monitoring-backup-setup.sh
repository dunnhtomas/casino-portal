#!/bin/bash

# =============================================================================
# COMPREHENSIVE MONITORING AND BACKUP SETUP
# Casino Portal Production Server Monitoring & Backup Configuration
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

# Function to setup system monitoring
setup_system_monitoring() {
    log_info "Setting up system monitoring..."
    
    # Install monitoring tools
    sudo apt install -y htop iotop nethogs ncdu
    
    # Create system monitoring script
    sudo tee /usr/local/bin/system-monitor.sh > /dev/null << 'EOF'
#!/bin/bash

# System monitoring script
echo "=== SYSTEM MONITOR $(date) ==="

echo "--- System Uptime ---"
uptime

echo "--- Memory Usage ---"
free -h

echo "--- Disk Usage ---"
df -h

echo "--- CPU Usage ---"
top -bn1 | grep "Cpu(s)" | sed "s/.*, *\([0-9.]*\)%* id.*/\1/" | awk '{print "CPU Usage: " 100 - $1 "%"}'

echo "--- Load Average ---"
cat /proc/loadavg

echo "--- Network Connections ---"
ss -tuln | wc -l
echo "Active connections: $(ss -tuln | wc -l)"

echo "--- Nginx Status ---"
systemctl is-active nginx

echo "--- SSL Certificate Expiry ---"
echo | openssl s_client -servername bestcasinopo.vps.webdock.cloud -connect bestcasinopo.vps.webdock.cloud:443 2>/dev/null | openssl x509 -noout -dates

echo "--- Log File Sizes ---"
du -sh /var/log/nginx/
du -sh /var/log/

echo "=== END SYSTEM MONITOR ==="
EOF

    sudo chmod +x /usr/local/bin/system-monitor.sh
    
    log_success "System monitoring script created"
}

# Function to setup website monitoring
setup_website_monitoring() {
    log_info "Setting up website monitoring..."
    
    # Create website monitoring script
    sudo tee /usr/local/bin/website-monitor.sh > /dev/null << 'EOF'
#!/bin/bash

# Website monitoring script
DOMAIN="bestcasinopo.vps.webdock.cloud"
LOG_FILE="/var/log/website-monitor.log"

echo "=== WEBSITE MONITOR $(date) ===" >> $LOG_FILE

# Test HTTP
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" http://$DOMAIN)
echo "HTTP Status: $HTTP_STATUS" >> $LOG_FILE

# Test HTTPS
HTTPS_STATUS=$(curl -o /dev/null -s -w "%{http_code}\n" https://$DOMAIN)
echo "HTTPS Status: $HTTPS_STATUS" >> $LOG_FILE

# Test response time
RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}\n" https://$DOMAIN)
echo "Response Time: ${RESPONSE_TIME}s" >> $LOG_FILE

# Check if site is accessible
if [ "$HTTPS_STATUS" -eq 200 ]; then
    echo "✅ Website is accessible" >> $LOG_FILE
else
    echo "❌ Website is not accessible" >> $LOG_FILE
    # Optional: Send alert (email, webhook, etc.)
fi

echo "--- End Website Check ---" >> $LOG_FILE
EOF

    sudo chmod +x /usr/local/bin/website-monitor.sh
    
    log_success "Website monitoring script created"
}

# Function to setup backup system
setup_backup_system() {
    log_info "Setting up backup system..."
    
    # Create backup directories
    sudo mkdir -p /var/backups/casino-portal/{daily,weekly,monthly}
    sudo mkdir -p /var/backups/casino-portal/logs
    
    # Create website backup script
    sudo tee /usr/local/bin/backup-website.sh > /dev/null << 'EOF'
#!/bin/bash

# Website backup script
BACKUP_TYPE=$1  # daily, weekly, or monthly
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/casino-portal/${BACKUP_TYPE}"
WEB_ROOT="/var/www/html"
LOG_FILE="/var/log/backup.log"

echo "=== BACKUP START $(date) ===" >> $LOG_FILE
echo "Backup Type: $BACKUP_TYPE" >> $LOG_FILE

# Create backup
if [ -d "$WEB_ROOT" ]; then
    sudo tar -czf "${BACKUP_DIR}/website-${BACKUP_TYPE}-${TIMESTAMP}.tar.gz" -C "$WEB_ROOT" . >> $LOG_FILE 2>&1
    
    if [ $? -eq 0 ]; then
        echo "✅ Website backup completed: website-${BACKUP_TYPE}-${TIMESTAMP}.tar.gz" >> $LOG_FILE
        
        # Get backup size
        BACKUP_SIZE=$(du -h "${BACKUP_DIR}/website-${BACKUP_TYPE}-${TIMESTAMP}.tar.gz" | cut -f1)
        echo "Backup Size: $BACKUP_SIZE" >> $LOG_FILE
        
        # Clean old backups (keep last 7 daily, 4 weekly, 12 monthly)
        case $BACKUP_TYPE in
            daily)
                find $BACKUP_DIR -name "website-daily-*.tar.gz" -mtime +7 -delete
                ;;
            weekly)
                find $BACKUP_DIR -name "website-weekly-*.tar.gz" -mtime +28 -delete
                ;;
            monthly)
                find $BACKUP_DIR -name "website-monthly-*.tar.gz" -mtime +365 -delete
                ;;
        esac
        
    else
        echo "❌ Website backup failed" >> $LOG_FILE
    fi
else
    echo "❌ Web root directory not found: $WEB_ROOT" >> $LOG_FILE
fi

echo "=== BACKUP END $(date) ===" >> $LOG_FILE
echo "" >> $LOG_FILE
EOF

    sudo chmod +x /usr/local/bin/backup-website.sh
    
    # Create log backup script
    sudo tee /usr/local/bin/backup-logs.sh > /dev/null << 'EOF'
#!/bin/bash

# Log backup script
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/casino-portal/logs"
LOG_FILE="/var/log/backup.log"

echo "=== LOG BACKUP START $(date) ===" >> $LOG_FILE

# Backup nginx logs
sudo tar -czf "${BACKUP_DIR}/nginx-logs-${TIMESTAMP}.tar.gz" -C /var/log nginx/ >> $LOG_FILE 2>&1

# Backup system logs
sudo tar -czf "${BACKUP_DIR}/system-logs-${TIMESTAMP}.tar.gz" -C /var/log auth.log syslog kern.log >> $LOG_FILE 2>&1

# Clean old log backups (keep 30 days)
find $BACKUP_DIR -name "*.tar.gz" -mtime +30 -delete

echo "✅ Log backup completed" >> $LOG_FILE
echo "=== LOG BACKUP END $(date) ===" >> $LOG_FILE
EOF

    sudo chmod +x /usr/local/bin/backup-logs.sh
    
    log_success "Backup system configured"
}

# Function to setup SSL monitoring
setup_ssl_monitoring() {
    log_info "Setting up SSL certificate monitoring..."
    
    # Create SSL monitoring script
    sudo tee /usr/local/bin/ssl-monitor.sh > /dev/null << 'EOF'
#!/bin/bash

# SSL certificate monitoring script
DOMAIN="bestcasinopo.vps.webdock.cloud"
LOG_FILE="/var/log/ssl-monitor.log"
ALERT_DAYS=7  # Alert when certificate expires in 7 days

echo "=== SSL MONITOR $(date) ===" >> $LOG_FILE

# Get certificate expiry date
EXPIRY_DATE=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)

if [ -n "$EXPIRY_DATE" ]; then
    # Convert to timestamp
    EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
    CURRENT_TIMESTAMP=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))
    
    echo "Certificate expires: $EXPIRY_DATE" >> $LOG_FILE
    echo "Days until expiry: $DAYS_UNTIL_EXPIRY" >> $LOG_FILE
    
    if [ $DAYS_UNTIL_EXPIRY -le $ALERT_DAYS ]; then
        echo "⚠️ SSL Certificate expires in $DAYS_UNTIL_EXPIRY days!" >> $LOG_FILE
        # Optional: Send alert
    else
        echo "✅ SSL Certificate is valid" >> $LOG_FILE
    fi
else
    echo "❌ Could not retrieve SSL certificate information" >> $LOG_FILE
fi

echo "=== SSL MONITOR END ===" >> $LOG_FILE
EOF

    sudo chmod +x /usr/local/bin/ssl-monitor.sh
    
    log_success "SSL monitoring configured"
}

# Function to setup cron jobs
setup_cron_jobs() {
    log_info "Setting up automated monitoring and backup cron jobs..."
    
    # Create cron configuration
    sudo tee /etc/cron.d/casino-portal-monitoring > /dev/null << 'EOF'
# Casino Portal Monitoring and Backup Jobs

# System monitoring every 6 hours
0 */6 * * * root /usr/local/bin/system-monitor.sh >> /var/log/system-monitor.log 2>&1

# Website monitoring every 5 minutes
*/5 * * * * root /usr/local/bin/website-monitor.sh

# SSL monitoring daily at 8 AM
0 8 * * * root /usr/local/bin/ssl-monitor.sh

# Daily backup at 2 AM
0 2 * * * root /usr/local/bin/backup-website.sh daily

# Weekly backup on Sunday at 3 AM
0 3 * * 0 root /usr/local/bin/backup-website.sh weekly

# Monthly backup on 1st day at 4 AM
0 4 1 * * root /usr/local/bin/backup-website.sh monthly

# Log backup daily at 1 AM
0 1 * * * root /usr/local/bin/backup-logs.sh

# Cleanup old logs weekly
0 5 * * 0 root find /var/log -name "*.log" -mtime +30 -delete
0 5 * * 0 root find /var/log -name "*.gz" -mtime +90 -delete
EOF

    log_success "Cron jobs configured"
}

# Function to create monitoring dashboard script
create_monitoring_dashboard() {
    log_info "Creating monitoring dashboard..."
    
    sudo tee /usr/local/bin/dashboard.sh > /dev/null << 'EOF'
#!/bin/bash

# Casino Portal Monitoring Dashboard
clear

echo "=========================================================================="
echo "🎰 CASINO PORTAL - PRODUCTION MONITORING DASHBOARD"
echo "   Server: bestcasinopo.vps.webdock.cloud"
echo "   Generated: $(date)"
echo "=========================================================================="

echo ""
echo "🖥️  SYSTEM STATUS:"
echo "   Uptime: $(uptime -p)"
echo "   Load: $(cat /proc/loadavg | awk '{print $1, $2, $3}')"
echo "   Memory: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
echo "   Disk: $(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3, $2, $5}')"

echo ""
echo "🌐 WEBSITE STATUS:"
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" http://bestcasinopo.vps.webdock.cloud || echo "Error")
HTTPS_STATUS=$(curl -o /dev/null -s -w "%{http_code}" https://bestcasinopo.vps.webdock.cloud || echo "Error")
echo "   HTTP Status: $HTTP_STATUS"
echo "   HTTPS Status: $HTTPS_STATUS"

echo ""
echo "🔒 SECURITY STATUS:"
echo "   Firewall: $(sudo ufw status | grep Status | awk '{print $2}')"
echo "   Fail2ban: $(sudo systemctl is-active fail2ban)"
echo "   SSL Certificate: $(echo | openssl s_client -servername bestcasinopo.vps.webdock.cloud -connect bestcasinopo.vps.webdock.cloud:443 2>/dev/null | openssl x509 -noout -enddate | cut -d= -f2)"

echo ""
echo "📊 SERVICES STATUS:"
echo "   Nginx: $(systemctl is-active nginx)"
echo "   SSH: $(systemctl is-active ssh)"

echo ""
echo "📈 RECENT ACTIVITY:"
echo "   Active Connections: $(ss -tuln | wc -l)"
echo "   Failed Login Attempts (24h): $(grep "Failed password" /var/log/auth.log | grep "$(date '+%b %d')" | wc -l 2>/dev/null || echo 0)"

echo ""
echo "💾 BACKUP STATUS:"
if [ -d "/var/backups/casino-portal/daily" ]; then
    LATEST_BACKUP=$(ls -t /var/backups/casino-portal/daily/ | head -1)
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_DATE=$(stat -c %y "/var/backups/casino-portal/daily/$LATEST_BACKUP" | cut -d' ' -f1)
        echo "   Latest Backup: $BACKUP_DATE"
    else
        echo "   Latest Backup: No backups found"
    fi
else
    echo "   Latest Backup: Backup directory not found"
fi

echo ""
echo "🔧 QUICK COMMANDS:"
echo "   View System Monitor: sudo /usr/local/bin/system-monitor.sh"
echo "   Check Security: sudo /usr/local/bin/security-check.sh"
echo "   Manual Backup: sudo /usr/local/bin/backup-website.sh daily"
echo "   View Logs: tail -f /var/log/nginx/access.log"
echo "=========================================================================="
EOF

    sudo chmod +x /usr/local/bin/dashboard.sh
    
    log_success "Monitoring dashboard created"
}

# Main execution function
main() {
    echo "============================================================================="
    echo "📊 COMPREHENSIVE MONITORING AND BACKUP SETUP"
    echo "   Casino Portal Production Server"
    echo "   $(date)"
    echo "============================================================================="
    
    setup_system_monitoring
    setup_website_monitoring
    setup_backup_system
    setup_ssl_monitoring
    setup_cron_jobs
    create_monitoring_dashboard
    
    echo "============================================================================="
    log_success "🎉 MONITORING AND BACKUP SETUP COMPLETED!"
    echo ""
    echo "📋 MONITORING SUMMARY:"
    echo "   ✅ System monitoring configured"
    echo "   ✅ Website monitoring configured"
    echo "   ✅ SSL certificate monitoring configured"
    echo "   ✅ Automated backup system configured"
    echo "   ✅ Cron jobs scheduled"
    echo "   ✅ Monitoring dashboard created"
    echo ""
    echo "📊 MONITORING SCHEDULE:"
    echo "   • System check: Every 6 hours"
    echo "   • Website check: Every 5 minutes"
    echo "   • SSL check: Daily at 8 AM"
    echo "   • Daily backup: 2 AM"
    echo "   • Weekly backup: Sunday 3 AM"
    echo "   • Monthly backup: 1st day 4 AM"
    echo ""
    echo "🔧 MONITORING COMMANDS:"
    echo "   • Dashboard: sudo /usr/local/bin/dashboard.sh"
    echo "   • System status: sudo /usr/local/bin/system-monitor.sh"
    echo "   • Website status: sudo /usr/local/bin/website-monitor.sh"
    echo "   • SSL status: sudo /usr/local/bin/ssl-monitor.sh"
    echo "   • Manual backup: sudo /usr/local/bin/backup-website.sh daily"
    echo ""
    echo "📁 LOG LOCATIONS:"
    echo "   • System monitor: /var/log/system-monitor.log"
    echo "   • Website monitor: /var/log/website-monitor.log"
    echo "   • SSL monitor: /var/log/ssl-monitor.log"
    echo "   • Backup logs: /var/log/backup.log"
    echo "   • Backups: /var/backups/casino-portal/"
    echo "============================================================================="
}

# Execute if run directly
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi