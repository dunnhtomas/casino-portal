# ✅ DEPLOYMENT CHECKLIST
**Next.js Casino Portal - Production Deployment**

**Server:** bestcasinopo.vps.webdock.cloud (193.181.210.101)  
**Date:** ________________  
**Operator:** ________________  
**Start Time:** ________________  

---

## 🔐 PRE-DEPLOYMENT VERIFICATION

### **Prerequisites Check**
- [ ] SSH key `id_rsa` available in current directory
- [ ] SSH key permissions set: `chmod 600 id_rsa`
- [ ] Source files present:
  - [ ] `package.json`
  - [ ] `next.config.ts`
  - [ ] `tsconfig.json`
  - [ ] `app/` directory
  - [ ] `components/` directory
  - [ ] `lib/` directory
  - [ ] `public/` directory

### **Server Connectivity**
- [ ] SSH connection test: `ssh -i id_rsa admin@193.181.210.101 'echo "Connection OK"'`
- [ ] Server responds to ping
- [ ] LEMP stack services running

### **Script Permissions**
- [ ] `chmod +x server-setup-lemp-to-nextjs.sh`
- [ ] `chmod +x production-deployment-ssh-automation.sh`
- [ ] `chmod +x deployment-verification-rollback.sh`

---

## 🔧 PHASE 1: SERVER SETUP

**Duration:** ~10-15 minutes  
**Command:** `./server-setup-lemp-to-nextjs.sh`

### **Setup Verification**
- [ ] Node.js 20.x installed: ________________
- [ ] PM2 installed globally: ________________
- [ ] MySQL configured for Next.js: ________________
- [ ] Directory structure created: ________________
- [ ] Dependencies installed: ________________
- [ ] Environment template created: ________________
- [ ] Server readiness confirmed: ________________

**Notes:** ________________________________________________

---

## 🚀 PHASE 2: APPLICATION DEPLOYMENT

**Duration:** ~8-12 minutes  
**Command:** `./production-deployment-ssh-automation.sh`

### **Deployment Steps**
- [ ] Prerequisites verification passed
- [ ] Deployment archive created: ________________
- [ ] Files uploaded to server: ________________
- [ ] Next.js environment configured: ________________
- [ ] Application files deployed: ________________
- [ ] Dependencies installed: ________________
- [ ] Production build completed: ________________
- [ ] PM2 process started: ________________
- [ ] Nginx configured: ________________
- [ ] Deployment verification passed: ________________

**Build Output:** ________________________________________________  
**PM2 Status:** ________________________________________________  
**Notes:** ________________________________________________

---

## 🔍 PHASE 3: POST-DEPLOYMENT VERIFICATION

**Duration:** ~2-5 minutes  
**Command:** `./deployment-verification-rollback.sh`

### **System Health Check**
- [ ] System resources normal
- [ ] Services active:
  - [ ] Nginx: ________________
  - [ ] MySQL: ________________
  - [ ] PM2: ________________
- [ ] Network connectivity working
- [ ] No critical processes errors

### **Application Tests**
- [ ] PM2 process running:
  - [ ] Status: ________________
  - [ ] Memory usage: ________________
  - [ ] Uptime: ________________
- [ ] Next.js application responding:
  - [ ] Local (port 3000): ________________
  - [ ] Health endpoint: ________________
  - [ ] No error logs: ________________

### **Nginx Proxy Tests**
- [ ] Nginx configuration valid
- [ ] Domain responding via Nginx:
  - [ ] HTTP Status: ________________
  - [ ] Response Time: ________________
- [ ] No Nginx errors in logs

### **Database Tests**
- [ ] MySQL connection successful
- [ ] Database accessible: ________________
- [ ] No connection errors

### **Functional Tests**
- [ ] Root endpoint (/): ________________
- [ ] Health endpoint (/api/health): ________________
- [ ] Static files (favicon.ico): ________________
- [ ] Robots.txt: ________________

---

## 🌐 DOMAIN & ACCESS VERIFICATION

### **URL Testing**
- [ ] Primary: https://bestcasinoportal.com *(if DNS configured)*
- [ ] Backup: http://bestcasinopo.vps.webdock.cloud
- [ ] Direct IP: http://193.181.210.101

**Working URLs:** ________________________________________________

### **SSL Configuration** *(Optional)*
- [ ] Let's Encrypt certificate installed
- [ ] HTTPS redirect working
- [ ] SSL certificate valid

---

## 📊 MONITORING SETUP

### **Application Monitoring**
- [ ] PM2 monitoring configured
- [ ] Log files accessible:
  - [ ] PM2 logs: `/var/log/casino-portal/`
  - [ ] Nginx logs: `/var/log/nginx/`
  - [ ] System logs: `/var/log/`

### **Backup Verification**
- [ ] Deployment backup created: ________________
- [ ] Backup location: `/var/backups/casino-portal/`
- [ ] Rollback procedure tested (if needed)

---

## 🚨 EMERGENCY PROCEDURES

### **Rollback Information**
- [ ] Latest backup location: ________________
- [ ] Rollback command ready: `./deployment-verification-rollback.sh rollback [backup-path]`
- [ ] Emergency contacts available

### **Critical Commands**
```bash
# Check PM2 status
sudo -u www-data pm2 status

# Restart application
sudo -u www-data pm2 restart best-casino-portal

# Check logs
sudo -u www-data pm2 logs best-casino-portal --lines 20

# Emergency rollback
./deployment-verification-rollback.sh rollback [backup-directory]
```

---

## 📝 POST-DEPLOYMENT TASKS

### **Immediate Tasks**
- [ ] Generate deployment report: `./deployment-verification-rollback.sh report`
- [ ] Save deployment report: ________________
- [ ] Update deployment documentation
- [ ] Notify stakeholders of successful deployment

### **Configuration Tasks** *(if needed)*
- [ ] Configure SSL certificate
- [ ] Update DNS records
- [ ] Configure monitoring alerts
- [ ] Setup automated backups
- [ ] Performance optimization

---

## ✅ DEPLOYMENT COMPLETION

### **Success Criteria** *(All must be checked)*
- [ ] All services running without errors
- [ ] Application accessible via backup URL
- [ ] Database connectivity confirmed
- [ ] No critical errors in logs
- [ ] Response times under 2 seconds
- [ ] Backup created and verified
- [ ] Rollback procedure available

### **Final Verification**
**End Time:** ________________  
**Total Duration:** ________________  
**Deployment Status:** ✅ SUCCESS / ❌ FAILED  

### **Sign-off**
**Operator Signature:** ________________________________  
**Date/Time:** ________________  

---

## 📞 SUPPORT INFORMATION

**Server Details:**
- Host: bestcasinopo.vps.webdock.cloud
- IP: 193.181.210.101
- Provider: Webdock (kvm-x14-u10-r5 Europe/Denmark)

**Key Directories:**
- Application: `/var/www/html`
- Logs: `/var/log/casino-portal/`
- Backups: `/var/backups/casino-portal/`

**Important Files:**
- PM2 Config: `/var/www/html/ecosystem.config.js`
- Nginx Config: `/etc/nginx/sites-available/bestcasinoportal.com`
- Environment: `/var/www/html/.env.production`

---

*Keep this checklist for deployment records and troubleshooting reference.*