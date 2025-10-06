# 🚀 PRODUCTION DEPLOYMENT PLAN
## Next.js Casino Portal - Automated SSH Deployment

**Server:** bestcasinopo.vps.webdock.cloud (193.181.210.101)  
**Stack:** LEMP (Nginx + MySQL 8.3 + PHP 8.3) + Node.js 20.19.5 + PM2  
**Target:** `/var/www/html` (LEMP standard web root)  
**Authentication:** SSH key (`id_rsa`) as admin user  
**Date:** October 6, 2025  

---

## 📋 DEPLOYMENT OVERVIEW

This comprehensive deployment plan provides fully automated SSH-based deployment for the Next.js Casino Portal application onto a live LEMP stack server. The deployment process has been designed for reliability, with automatic backup creation, rollback capabilities, and comprehensive verification.

### **Current Server State:**
- ✅ **Running:** Ubuntu 24.04 LTS with LEMP stack
- ✅ **Active:** Nginx, MySQL 8.3, PHP 8.3
- ✅ **Network:** Accessible via SSH key authentication
- ✅ **Storage:** 96GB available (3% usage)
- ✅ **Resources:** 10 CPU cores, 9GB RAM

### **Deployment Goal:**
Transform the LEMP server to support Next.js while maintaining existing stack functionality, deploying the casino portal application with full production configuration.

---

## 🛠️ DEPLOYMENT TOOLKIT

The deployment automation consists of three powerful scripts:

### **1. Server Setup Script**
📁 `server-setup-lemp-to-nextjs.sh`  
🎯 **Purpose:** Prepares LEMP stack for Next.js deployment  
⏱️ **Duration:** ~10-15 minutes  

**Features:**
- Node.js 20.x LTS installation via NodeSource
- PM2 global installation and configuration
- MySQL database preparation and user verification
- Directory structure creation with proper permissions
- Additional dependencies for Next.js (image libraries)
- Environment template creation
- Firewall configuration
- Comprehensive readiness verification

### **2. Main Deployment Script**
📁 `production-deployment-ssh-automation.sh`  
🎯 **Purpose:** Fully automated application deployment  
⏱️ **Duration:** ~8-12 minutes  

**Features:**
- Prerequisites verification (SSH keys, files, connectivity)
- Source archive creation (excludes dev artifacts)
- Secure file upload via SCP
- Automated backup creation before deployment
- Application file deployment with proper permissions
- Dependency installation and production build
- PM2 process management configuration
- Nginx reverse proxy configuration
- Comprehensive deployment verification
- Automatic cleanup

### **3. Verification & Rollback Script**
📁 `deployment-verification-rollback.sh`  
🎯 **Purpose:** Post-deployment verification and emergency procedures  
⏱️ **Duration:** ~2-5 minutes per check  

**Features:**
- Interactive menu system
- Comprehensive system health checks
- PM2 process monitoring
- Next.js application functionality tests
- Nginx proxy configuration verification
- Database connectivity testing
- Functional endpoint testing
- Backup listing and management
- Emergency rollback capabilities
- Deployment report generation

---

## 🔐 SECURITY & CREDENTIALS

### **SSH Configuration:**
```bash
Host: 193.181.210.101
User: admin
Authentication: SSH key (id_rsa)
```

### **MySQL Credentials:**
```env
Root User: admin
Root Password: 93r7ktFBbS7X
Database: bestcasinopo
App User: bestcasinopo
App Password: Wp4BTYb7kveH
```

### **FTP/SFTP Access:**
```env
Username: bestcasinopo
Password: mYyLzu6VUVCE
```

### **System Access:**
```env
Sudo User: admin
Sudo Password: JbCQftukXun5
```

---

## 🚀 DEPLOYMENT EXECUTION

### **Phase 1: Pre-Deployment Setup**
⏱️ **Duration:** 10-15 minutes

```bash
# 1. Ensure SSH key is available
chmod 600 id_rsa

# 2. Run server setup script
chmod +x server-setup-lemp-to-nextjs.sh
./server-setup-lemp-to-nextjs.sh
```

**Expected Output:**
- ✅ Server connection verified
- ✅ Node.js 20.x installed
- ✅ PM2 installed globally
- ✅ MySQL configured for Next.js
- ✅ Directory structure created
- ✅ Additional dependencies installed
- ✅ Environment template created
- ✅ Server ready for deployment

### **Phase 2: Application Deployment**
⏱️ **Duration:** 8-12 minutes

```bash
# 1. Prepare deployment files
# Ensure these files are in current directory:
# - package.json
# - next.config.ts
# - tsconfig.json
# - app/ directory
# - components/ directory
# - lib/ directory
# - public/ directory

# 2. Run main deployment script
chmod +x production-deployment-ssh-automation.sh
./production-deployment-ssh-automation.sh
```

**Expected Output:**
- ✅ Prerequisites verified
- ✅ Deployment archive created
- ✅ Files uploaded to server
- ✅ Next.js environment configured
- ✅ Application files deployed
- ✅ Dependencies installed
- ✅ Production build completed
- ✅ PM2 process started
- ✅ Nginx configured as reverse proxy
- ✅ Deployment verified

### **Phase 3: Post-Deployment Verification**
⏱️ **Duration:** 2-5 minutes

```bash
# 1. Run verification script
chmod +x deployment-verification-rollback.sh
./deployment-verification-rollback.sh

# 2. Select option 1 for full verification
# or use command line mode:
./deployment-verification-rollback.sh full
```

**Expected Output:**
- ✅ System health check passed
- ✅ PM2 process running
- ✅ Next.js application responding
- ✅ Nginx proxy working
- ✅ Database connection verified
- ✅ All endpoints responding

---

## 🌐 NETWORK & DOMAIN CONFIGURATION

### **Primary Access URLs:**
- **Primary Domain:** https://bestcasinoportal.com *(requires DNS configuration)*
- **Backup URL:** http://bestcasinopo.vps.webdock.cloud *(immediate access)*
- **Direct IP:** http://193.181.210.101 *(immediate access)*

### **Internal Application:**
- **Next.js Server:** http://127.0.0.1:3000 *(server-side only)*
- **Nginx Proxy:** Port 80/443 → Port 3000

### **SSL Configuration:**
The deployment configures HTTP access initially. For HTTPS/SSL:

```bash
# After successful deployment, configure SSL:
ssh -i id_rsa admin@193.181.210.101

# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d bestcasinoportal.com -d www.bestcasinoportal.com

# Verify SSL renewal
sudo certbot renew --dry-run
```

---

## 📊 MONITORING & MAINTENANCE

### **Application Monitoring:**
```bash
# PM2 status
sudo -u www-data pm2 status

# Application logs
sudo -u www-data pm2 logs best-casino-portal

# System monitoring
htop
df -h
free -h
```

### **Service Management:**
```bash
# Restart application
sudo -u www-data pm2 restart best-casino-portal

# Restart Nginx
sudo systemctl restart nginx

# Restart MySQL
sudo systemctl restart mysql
```

### **Backup Management:**
```bash
# List available backups
ls -la /var/backups/casino-portal/

# Create manual backup
sudo cp -r /var/www/html /var/backups/casino-portal/manual-backup-$(date +%Y%m%d_%H%M%S)
```

---

## 🚨 EMERGENCY PROCEDURES

### **Application Not Responding:**
```bash
# 1. Check PM2 status
sudo -u www-data pm2 status

# 2. Restart application
sudo -u www-data pm2 restart best-casino-portal

# 3. Check logs for errors
sudo -u www-data pm2 logs best-casino-portal --lines 50
```

### **Emergency Rollback:**
```bash
# 1. Run verification script
./deployment-verification-rollback.sh

# 2. Select option 9 to list backups
# 3. Select option 10 for emergency rollback
# 4. Enter backup directory path when prompted

# Or use command line mode:
./deployment-verification-rollback.sh rollback /var/backups/casino-portal/backup-YYYYMMDD_HHMMSS
```

### **Server Connectivity Issues:**
```bash
# Test SSH connection
ssh -i id_rsa admin@193.181.210.101 'echo "Connection OK"'

# Check server status via web
curl -I http://193.181.210.101/

# Contact hosting provider if server is unreachable
# Provider: Webdock
# Server: kvm-x14-u10-r5 Europe / Denmark
```

---

## 📝 DEPLOYMENT CHECKLIST

- [ ] **Prerequisites Ready**
  - [ ] SSH key `id_rsa` available and properly configured
  - [ ] Source files in deployment directory
  - [ ] Server accessible via SSH
  - [ ] LEMP stack running on server

- [ ] **Phase 1: Server Setup**
  - [ ] Run `server-setup-lemp-to-nextjs.sh`
  - [ ] Verify Node.js 20.x installation
  - [ ] Verify PM2 installation
  - [ ] Verify MySQL configuration
  - [ ] Verify directory structure

- [ ] **Phase 2: Deployment**
  - [ ] Run `production-deployment-ssh-automation.sh`
  - [ ] Verify archive creation
  - [ ] Verify file upload
  - [ ] Verify build completion
  - [ ] Verify PM2 startup
  - [ ] Verify Nginx configuration

- [ ] **Phase 3: Verification**
  - [ ] Run `deployment-verification-rollback.sh`
  - [ ] Verify system health
  - [ ] Verify application response
  - [ ] Verify database connectivity
  - [ ] Test all critical endpoints

- [ ] **Post-Deployment**
  - [ ] Configure SSL certificate (if needed)
  - [ ] Update DNS records (if needed)
  - [ ] Configure monitoring
  - [ ] Set up backup schedule
  - [ ] Document any custom configurations

---

## 🔧 TROUBLESHOOTING

### **Common Issues & Solutions:**

#### **1. SSH Connection Failed**
```bash
# Check SSH key permissions
chmod 600 id_rsa

# Test connection manually
ssh -i id_rsa -v admin@193.181.210.101
```

#### **2. PM2 Process Not Starting**
```bash
# Check Node.js installation
node --version
npm --version

# Check PM2 installation
pm2 --version

# Start process manually
cd /var/www/html
sudo -u www-data pm2 start npm --name "best-casino-portal" -- start
```

#### **3. Next.js Build Errors**
```bash
# Check build logs
sudo -u www-data npm run build

# Check dependencies
sudo -u www-data npm ci

# Check environment variables
cat /var/www/html/.env.production
```

#### **4. Nginx 502 Bad Gateway**
```bash
# Check if Next.js is running
curl -I http://127.0.0.1:3000/

# Check Nginx configuration
sudo nginx -t

# Check Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

#### **5. Database Connection Issues**
```bash
# Test MySQL connection
mysql -u bestcasinopo -pWp4BTYb7kveH -e "SELECT 1;" bestcasinopo

# Check MySQL status
sudo systemctl status mysql

# Check MySQL error logs
sudo tail -f /var/log/mysql/error.log
```

---

## 📞 SUPPORT CONTACTS

### **Hosting Provider:**
- **Provider:** Webdock
- **Server Node:** kvm-x14-u10-r5 Europe / Denmark
- **IP Address:** 193.181.210.101

### **Domain Management:**
- **Primary Domain:** bestcasinoportal.com
- **Backup Domain:** bestcasinopo.vps.webdock.cloud

### **Technical Support:**
- **Application Logs:** `/var/log/casino-portal/`
- **System Logs:** `/var/log/`
- **Backup Location:** `/var/backups/casino-portal/`

---

## ✅ SUCCESS CRITERIA

Deployment is considered successful when:

1. ✅ **Server Health:** All services (Nginx, MySQL, PM2) running
2. ✅ **Application Response:** Next.js app responding on port 3000
3. ✅ **Proxy Working:** Nginx successfully proxying to Next.js
4. ✅ **Database Connected:** MySQL connection established
5. ✅ **Domain Accessible:** Application accessible via backup domain
6. ✅ **No Errors:** No critical errors in logs
7. ✅ **Performance:** Response times under 2 seconds
8. ✅ **Backup Created:** Deployment backup available for rollback

---

## 🎯 NEXT STEPS AFTER DEPLOYMENT

1. **SSL Configuration:** Set up Let's Encrypt certificate for HTTPS
2. **DNS Configuration:** Point primary domain to server IP
3. **Monitoring Setup:** Configure system and application monitoring
4. **Backup Automation:** Set up automated daily backups
5. **Performance Optimization:** Tune Nginx and PM2 settings
6. **Security Hardening:** Configure fail2ban and additional security measures
7. **CDN Setup:** Consider Cloudflare for additional performance and security

---

*This deployment plan ensures a robust, automated, and maintainable production deployment with comprehensive error handling and rollback capabilities.*