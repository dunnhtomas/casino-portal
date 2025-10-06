#!/bin/bash

# =============================================================================
# DEPLOYMENT VERIFICATION AND ROLLBACK SCRIPT
# Post-deployment verification and emergency rollback procedures
# =============================================================================
# 
# Server: bestcasinopo.vps.webdock.cloud (193.181.210.101)
# Application: Next.js Casino Portal
# Web Root: /var/www/html
# Authentication: SSH key (id_rsa) as admin user
# 
# This script provides comprehensive deployment verification and emergency
# rollback capabilities for production deployments.
# =============================================================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration Variables
SERVER_HOST="193.181.210.101"
SERVER_USER="admin"
SSH_KEY="id_rsa"
WEB_ROOT="/var/www/html"
APP_NAME="best-casino-portal"
PRIMARY_DOMAIN="bestcasinoportal.com"
BACKUP_DOMAIN="bestcasinopo.vps.webdock.cloud"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
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

log_debug() {
    echo -e "${PURPLE}[DEBUG]${NC} $1"
}

# Function to execute SSH commands
ssh_exec() {
    ssh -i "${SSH_KEY}" -o StrictHostKeyChecking=no "${SERVER_USER}@${SERVER_HOST}" "$1"
}

# Comprehensive system health check
check_system_health() {
    log_info "Performing comprehensive system health check..."
    
    ssh_exec "
        echo '=== SYSTEM HEALTH CHECK ==='
        
        # System resources
        echo 'System Load:'
        uptime
        echo ''
        
        echo 'Memory Usage:'
        free -h
        echo ''
        
        echo 'Disk Usage:'
        df -h /var/www /var/log /var/backups /tmp
        echo ''
        
        # Service status
        echo 'Service Status:'
        systemctl is-active nginx && echo '✓ Nginx: Active' || echo '✗ Nginx: Inactive'
        systemctl is-active mysql && echo '✓ MySQL: Active' || echo '✗ MySQL: Inactive'
        systemctl is-enabled nginx && echo '✓ Nginx: Enabled' || echo '✗ Nginx: Disabled'
        systemctl is-enabled mysql && echo '✓ MySQL: Enabled' || echo '✗ MySQL: Disabled'
        echo ''
        
        # Network connectivity
        echo 'Network Connectivity:'
        curl -s --max-time 5 -o /dev/null -w 'DNS Resolution: %{http_code}\n' http://google.com || echo 'DNS Resolution: Failed'
        echo ''
        
        # Process information
        echo 'Critical Processes:'
        pgrep -f nginx | head -3 | wc -l | xargs echo 'Nginx processes:'
        pgrep -f mysql | head -3 | wc -l | xargs echo 'MySQL processes:'
        pgrep -f node | head -3 | wc -l | xargs echo 'Node.js processes:'
        echo ''
        
        echo '=== SYSTEM HEALTH CHECK COMPLETED ==='
    "
    
    log_success "System health check completed"
}

# Verify PM2 process status
check_pm2_status() {
    log_info "Checking PM2 process status..."
    
    ssh_exec "
        echo '=== PM2 STATUS CHECK ==='
        
        if command -v pm2 &> /dev/null; then
            echo 'PM2 Global Status:'
            sudo -u www-data pm2 status || echo 'PM2 status check failed'
            echo ''
            
            echo 'PM2 Process Details:'
            sudo -u www-data pm2 show ${APP_NAME} || echo 'Application process not found'
            echo ''
            
            echo 'PM2 Logs (last 10 lines):'
            sudo -u www-data pm2 logs ${APP_NAME} --lines 10 --nostream || echo 'No logs available'
            echo ''
        else
            echo '✗ PM2 not installed'
        fi
        
        echo '=== PM2 STATUS CHECK COMPLETED ==='
    "
    
    log_success "PM2 status check completed"
}

# Test Next.js application functionality
test_nextjs_app() {
    log_info "Testing Next.js application functionality..."
    
    ssh_exec "
        echo '=== NEXT.JS APPLICATION TEST ==='
        
        # Test local application response
        echo 'Testing local application (port 3000):'
        if curl -s --max-time 10 -o /dev/null -w 'HTTP Status: %{http_code}, Response Time: %{time_total}s\n' http://127.0.0.1:3000/; then
            echo '✓ Local application responding'
        else
            echo '✗ Local application not responding'
        fi
        echo ''
        
        # Test application health endpoint if available
        echo 'Testing application health:'
        curl -s --max-time 5 http://127.0.0.1:3000/api/health 2>/dev/null | head -3 || echo 'Health endpoint not available or not responding'
        echo ''
        
        # Check application logs
        echo 'Application Error Logs (last 5 lines):'
        sudo tail -5 /var/log/casino-portal/pm2-error.log 2>/dev/null || echo 'No error logs found'
        echo ''
        
        echo 'Application Output Logs (last 5 lines):'
        sudo tail -5 /var/log/casino-portal/pm2-out.log 2>/dev/null || echo 'No output logs found'
        echo ''
        
        echo '=== NEXT.JS APPLICATION TEST COMPLETED ==='
    "
    
    log_success "Next.js application test completed"
}

# Test Nginx configuration and proxy
test_nginx_proxy() {
    log_info "Testing Nginx configuration and proxy..."
    
    ssh_exec "
        echo '=== NGINX PROXY TEST ==='
        
        # Test Nginx configuration
        echo 'Testing Nginx configuration:'
        if sudo nginx -t; then
            echo '✓ Nginx configuration valid'
        else
            echo '✗ Nginx configuration invalid'
        fi
        echo ''
        
        # Test domain response
        echo 'Testing domain response:'
        if curl -s --max-time 10 -o /dev/null -w 'HTTP Status: %{http_code}, Response Time: %{time_total}s\n' http://${BACKUP_DOMAIN}/; then
            echo '✓ Domain responding via Nginx'
        else
            echo '✗ Domain not responding'
        fi
        echo ''
        
        # Check Nginx access logs
        echo 'Nginx Access Logs (last 3 lines):'
        sudo tail -3 /var/log/nginx/access.log 2>/dev/null || echo 'No access logs found'
        echo ''
        
        # Check Nginx error logs
        echo 'Nginx Error Logs (last 3 lines):'
        sudo tail -3 /var/log/nginx/error.log 2>/dev/null || echo 'No error logs found'
        echo ''
        
        echo '=== NGINX PROXY TEST COMPLETED ==='
    "
    
    log_success "Nginx proxy test completed"
}

# Test database connectivity
test_database_connection() {
    log_info "Testing database connectivity..."
    
    ssh_exec "
        echo '=== DATABASE CONNECTION TEST ==='
        
        # Test MySQL connection
        echo 'Testing MySQL connection:'
        if mysql -u bestcasinopo -pWp4BTYb7kveH -e 'SELECT \"Database connection successful\" as status; SHOW TABLES;' bestcasinopo 2>/dev/null; then
            echo '✓ Database connection successful'
        else
            echo '✗ Database connection failed'
        fi
        echo ''
        
        # Check MySQL status
        echo 'MySQL Status:'
        sudo systemctl status mysql --no-pager -l | head -10
        echo ''
        
        echo '=== DATABASE CONNECTION TEST COMPLETED ==='
    "
    
    log_success "Database connection test completed"
}

# Comprehensive functional testing
run_functional_tests() {
    log_info "Running comprehensive functional tests..."
    
    # Test different endpoints
    local endpoints=(
        "/"
        "/api/health"
        "/favicon.ico"
        "/robots.txt"
    )
    
    for endpoint in "${endpoints[@]}"; do
        log_debug "Testing endpoint: ${endpoint}"
        if curl -s --max-time 5 -o /dev/null -w "%{http_code}" "http://${BACKUP_DOMAIN}${endpoint}" | grep -q "200\|301\|302\|404"; then
            log_success "Endpoint ${endpoint}: Responding"
        else
            log_warning "Endpoint ${endpoint}: Not responding properly"
        fi
    done
    
    log_success "Functional tests completed"
}

# List available backups for rollback
list_available_backups() {
    log_info "Listing available backups..."
    
    ssh_exec "
        echo '=== AVAILABLE BACKUPS ==='
        
        if [ -d '/var/backups/casino-portal' ]; then
            echo 'Casino Portal Backups:'
            ls -la /var/backups/casino-portal/ 2>/dev/null || echo 'No casino portal backups found'
            echo ''
        fi
        
        if [ -d '/var/backups/bestcasinoportal' ]; then
            echo 'Legacy Backups:'
            ls -la /var/backups/bestcasinoportal/ 2>/dev/null || echo 'No legacy backups found'
            echo ''
        fi
        
        echo 'System Backups:'
        ls -la /var/backups/ | grep casino 2>/dev/null || echo 'No system backups found'
        echo ''
        
        echo '=== BACKUP LISTING COMPLETED ==='
    "
    
    log_success "Backup listing completed"
}

# Emergency rollback function
emergency_rollback() {
    local backup_dir="$1"
    
    if [ -z "$backup_dir" ]; then
        log_error "Backup directory must be specified for rollback"
        echo "Usage: emergency_rollback <backup_directory>"
        echo "Available backups:"
        list_available_backups
        return 1
    fi
    
    log_warning "INITIATING EMERGENCY ROLLBACK to $backup_dir"
    read -p "Are you sure you want to rollback? This will overwrite current deployment. [y/N]: " -n 1 -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Rollback cancelled by user"
        return 0
    fi
    
    ssh_exec "
        echo '=== EMERGENCY ROLLBACK INITIATED ==='
        
        # Stop current application
        echo 'Stopping current application...'
        sudo -u www-data pm2 stop ${APP_NAME} || echo 'PM2 stop attempted'
        
        # Create rollback backup of current state
        ROLLBACK_BACKUP='/var/backups/casino-portal/rollback-backup-\$(date +%Y%m%d_%H%M%S)'
        echo \"Creating rollback backup: \$ROLLBACK_BACKUP\"
        sudo cp -r ${WEB_ROOT} \"\$ROLLBACK_BACKUP\" || echo 'Rollback backup attempted'
        
        # Restore from specified backup
        if [ -d \"$backup_dir\" ]; then
            echo 'Restoring from backup: $backup_dir'
            sudo rm -rf ${WEB_ROOT}/*
            sudo cp -r \"$backup_dir\"/* ${WEB_ROOT}/
            sudo chown -R www-data:www-data ${WEB_ROOT}
            sudo chmod -R 755 ${WEB_ROOT}
            
            # Restart application
            cd ${WEB_ROOT}
            sudo -u www-data pm2 start ${APP_NAME} || sudo -u www-data pm2 start npm --name '${APP_NAME}' -- start
            
            echo '✓ Rollback completed'
        else
            echo '✗ Backup directory not found: $backup_dir'
            exit 1
        fi
        
        echo '=== EMERGENCY ROLLBACK COMPLETED ==='
    "
    
    log_success "Emergency rollback completed"
}

# Quick health check (minimal output)
quick_health_check() {
    log_info "Performing quick health check..."
    
    local status=0
    
    # Check if we can connect to server
    if ! ssh_exec "echo 'Connection OK'" > /dev/null 2>&1; then
        log_error "SSH connection failed"
        return 1
    fi
    
    # Check critical services
    if ! ssh_exec "systemctl is-active nginx mysql" > /dev/null 2>&1; then
        log_warning "Some critical services are not active"
        status=1
    fi
    
    # Check if application is responding
    if ! curl -s --max-time 5 -o /dev/null "http://${BACKUP_DOMAIN}/" 2>/dev/null; then
        log_warning "Application not responding via HTTP"
        status=1
    fi
    
    if [ $status -eq 0 ]; then
        log_success "Quick health check: All systems operational"
    else
        log_warning "Quick health check: Some issues detected"
    fi
    
    return $status
}

# Generate deployment report
generate_deployment_report() {
    log_info "Generating deployment report..."
    
    local report_file="deployment-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "============================================================================="
        echo "DEPLOYMENT VERIFICATION REPORT"
        echo "Generated: $(date)"
        echo "Server: ${SERVER_HOST}"
        echo "Application: ${APP_NAME}"
        echo "============================================================================="
        echo ""
        
        # System information
        ssh_exec "
            echo 'SYSTEM INFORMATION:'
            echo 'Hostname: \$(hostname)'
            echo 'OS: \$(lsb_release -d | cut -f2)'
            echo 'Uptime: \$(uptime -p)'
            echo 'Load: \$(uptime | awk -F'load average:' '{print \$2}')'
            echo ''
        "
        
        # Service status
        ssh_exec "
            echo 'SERVICE STATUS:'
            systemctl is-active nginx && echo 'Nginx: Active' || echo 'Nginx: Inactive'
            systemctl is-active mysql && echo 'MySQL: Active' || echo 'MySQL: Inactive'
            echo ''
        "
        
        # Application status
        ssh_exec "
            echo 'APPLICATION STATUS:'
            sudo -u www-data pm2 status | grep ${APP_NAME} || echo 'PM2 process not found'
            echo ''
        "
        
        # HTTP response test
        echo "HTTP RESPONSE TEST:"
        if curl -s --max-time 10 -o /dev/null -w "Status: %{http_code}, Time: %{time_total}s\n" "http://${BACKUP_DOMAIN}/"; then
            echo "✓ HTTP response: OK"
        else
            echo "✗ HTTP response: Failed"
        fi
        echo ""
        
        # Disk usage
        ssh_exec "
            echo 'DISK USAGE:'
            df -h /var/www /var/log /var/backups
            echo ''
        "
        
        echo "============================================================================="
        echo "REPORT COMPLETED"
        echo "============================================================================="
        
    } > "$report_file"
    
    log_success "Deployment report saved to: $report_file"
}

# Main function - show menu
show_menu() {
    echo "============================================================================="
    echo "🔍 DEPLOYMENT VERIFICATION AND ROLLBACK TOOL"
    echo "   Server: ${SERVER_HOST}"
    echo "   Application: ${APP_NAME}"
    echo "============================================================================="
    echo ""
    echo "Available Commands:"
    echo "  1) Full verification    - Complete deployment verification"
    echo "  2) Quick health check   - Fast status check"
    echo "  3) System health        - Detailed system information"
    echo "  4) PM2 status          - Process manager status"
    echo "  5) Test application    - Next.js application tests"
    echo "  6) Test Nginx proxy    - Nginx configuration and proxy tests"
    echo "  7) Test database       - Database connectivity tests"
    echo "  8) Functional tests    - Endpoint response tests"
    echo "  9) List backups        - Show available backups"
    echo " 10) Emergency rollback  - Rollback to previous version"
    echo " 11) Generate report     - Create deployment report"
    echo "  0) Exit"
    echo ""
    echo "============================================================================="
}

# Main execution logic
main() {
    if [ $# -eq 0 ]; then
        # Interactive mode
        while true; do
            show_menu
            read -p "Select option [0-11]: " choice
            echo ""
            
            case $choice in
                1)
                    echo "🔍 Running full verification..."
                    check_system_health
                    check_pm2_status
                    test_nextjs_app
                    test_nginx_proxy
                    test_database_connection
                    run_functional_tests
                    log_success "Full verification completed"
                    ;;
                2)
                    quick_health_check
                    ;;
                3)
                    check_system_health
                    ;;
                4)
                    check_pm2_status
                    ;;
                5)
                    test_nextjs_app
                    ;;
                6)
                    test_nginx_proxy
                    ;;
                7)
                    test_database_connection
                    ;;
                8)
                    run_functional_tests
                    ;;
                9)
                    list_available_backups
                    ;;
                10)
                    list_available_backups
                    echo ""
                    read -p "Enter backup directory path: " backup_path
                    emergency_rollback "$backup_path"
                    ;;
                11)
                    generate_deployment_report
                    ;;
                0)
                    echo "Exiting..."
                    break
                    ;;
                *)
                    log_error "Invalid option. Please select 0-11."
                    ;;
            esac
            
            echo ""
            read -p "Press Enter to continue..."
            echo ""
        done
    else
        # Command line mode
        case "$1" in
            "health")
                quick_health_check
                ;;
            "full")
                check_system_health
                check_pm2_status
                test_nextjs_app
                test_nginx_proxy
                test_database_connection
                run_functional_tests
                ;;
            "system")
                check_system_health
                ;;
            "pm2")
                check_pm2_status
                ;;
            "app")
                test_nextjs_app
                ;;
            "nginx")
                test_nginx_proxy
                ;;
            "database")
                test_database_connection
                ;;
            "functional")
                run_functional_tests
                ;;
            "backups")
                list_available_backups
                ;;
            "rollback")
                if [ -n "${2:-}" ]; then
                    emergency_rollback "$2"
                else
                    log_error "Backup directory required for rollback"
                    list_available_backups
                fi
                ;;
            "report")
                generate_deployment_report
                ;;
            *)
                echo "Usage: $0 [health|full|system|pm2|app|nginx|database|functional|backups|rollback <dir>|report]"
                echo "Run without arguments for interactive mode"
                exit 1
                ;;
        esac
    fi
}

# Execute main function
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi