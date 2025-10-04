# 🐋 Docker Quick Start - Casino Portal v2.0.0

## ⚡ Quick Commands

### Development
```bash
# Start development server
docker-compose up dev

# Start with rebuild
docker-compose up --build dev

# View logs
docker logs casino-dev -f

# Stop
docker-compose down
```

### Production Preview
```bash
# Build and preview production
docker-compose up preview

# Access at http://localhost:8080
```

### Testing
```bash
# Architecture validation
docker-compose --profile testing up arch-test

# Full test suite
docker-compose --profile testing up test
```

### Cleanup
```bash
# Stop and remove everything
docker-compose down -v

# Remove old images
docker image prune -a

# Complete reset
docker system prune -a --volumes
```

---

## 📁 Files (Single Source of Truth)

### ✅ Active Files
- **Dockerfile** - Unified multi-stage (dev + prod)
- **docker-compose.yml** - All services

### ❌ Removed Duplicates
- Dockerfile.{prod,oop,clean,simple,test,debug,fast,lighthouse}
- docker-compose.{prod,oop,test}.yml

---

## 🎯 Access Points

| Service | Port | URL |
|---------|------|-----|
| Development | 3000 | http://localhost:3000 |
| Production Preview | 8080 | http://localhost:8080 |
| Backend API | 4000 | http://localhost:4000 |

---

## 🏗️ Build Targets

```bash
# Development (default)
docker build -t casino-dev .

# Production
docker build --target production -t casino-prod .

# Specific target
docker build --target development -t casino-dev .
```

---

## 📊 Current Status

**Container:** `casino-dev` (✅ RUNNING)  
**Image:** `casino-portal-dev:2.0.0`  
**Network:** `casino-network`  
**Architecture:** OOP-compliant validated

---

## 🔍 Troubleshooting

**Port 3000 in use:**
```bash
docker stop casino-dev
docker rm casino-dev
docker-compose up dev
```

**Build issues:**
```bash
docker-compose build --no-cache dev
```

**Network conflicts:**
```bash
docker network prune
docker-compose down
docker-compose up
```

---

**Documentation:** See `DOCKER_UNIFIED.md` for complete details
