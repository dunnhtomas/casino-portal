# Casino Portal Docker Testing Guide

## Quick Start

### Windows Users
```bash
.\test-docker.bat
```

### Linux/Mac Users
```bash
chmod +x test-docker.sh
./test-docker.sh
```

## Manual Testing Commands

### Development Environment
```bash
# Start development server
docker-compose up -d dev

# View logs
docker-compose logs -f dev

# Access development server
curl http://localhost:3000
```

### Production Testing
```bash
# Build and start production preview
docker-compose up -d preview

# Test production build
curl http://localhost:8080
```

### Comprehensive Testing
```bash
# Run all tests with testing profile
docker-compose --profile testing up

# Run specific test services
docker-compose --profile testing run --rm lighthouse
docker-compose --profile testing run --rm test
```

### Performance Testing
```bash
# Lighthouse desktop and mobile tests
docker-compose run --rm lighthouse

# Load testing (requires k6 scripts)
docker-compose --profile load-testing -f docker-compose.prod.yml up
```

## Available Services

| Service | Port | Purpose | Health Check |
|---------|------|---------|--------------|
| dev | 3000 | Development server | http://localhost:3000 |
| preview | 8080 | Production preview | http://localhost:8080 |
| backend | 4000 | API backend | http://localhost:4000/health |
| test | - | Test runner | Runs tests and exits |
| lighthouse | - | Performance testing | Generates reports |

## Docker Images

### Development (`Dockerfile`)
- Full development environment
- Hot reload support
- Testing tools included
- Debugging capabilities

### Production (`Dockerfile.prod`)
- Multi-stage build
- Optimized for performance
- Nginx serving static files
- Health checks included

### Testing (`Dockerfile.test`)
- Comprehensive testing environment
- Playwright, Lighthouse, and custom tests
- CI/CD ready
- Multiple browser support

### Lighthouse (`Dockerfile.lighthouse`)
- Performance testing specialist
- Multiple output formats
- Desktop and mobile testing
- Automated reporting

## Testing Profiles

### Default Profile
- `dev`: Development server
- `preview`: Production preview
- `backend`: API backend

### Testing Profile (`--profile testing`)
- `test`: Comprehensive test suite
- `lighthouse`: Performance testing
- `test-db`: Testing database
- `redis`: Caching layer

### Load Testing Profile (`--profile load-testing`)
- `load-test`: K6 load testing
- Production-like environment

## Environment Variables

```bash
# Development
NODE_ENV=development
ASTRO_TELEMETRY_DISABLED=1
DEBUG=1

# Testing
NODE_ENV=test
CI=true
HEADLESS=true
TEST_URL=http://dev:3000

# Production
NODE_ENV=production
NGINX_WORKER_PROCESSES=auto
SENTRY_DSN=your_sentry_dsn
```

## Volume Mounts

- `./reports`: Test reports and lighthouse results
- `./test-results`: Playwright and other test outputs
- `./coverage`: Code coverage reports
- `./logs`: Application and nginx logs

## Networking

All services run on the `casino-test-net` network with subnet `172.20.0.0/16` for isolated testing.

## Troubleshooting

### Service Not Starting
```bash
# Check service logs
docker-compose logs [service-name]

# Check service health
docker-compose ps

# Restart specific service
docker-compose restart [service-name]
```

### Port Conflicts
```bash
# Stop all services
docker-compose down

# Check what's using ports
netstat -tulpn | grep :3000
```

### Build Issues
```bash
# Clean rebuild
docker-compose build --no-cache

# Remove old images
docker system prune -a
```

### Test Failures
```bash
# Run tests with verbose output
docker-compose run --rm test npm test -- --verbose

# Run specific test
docker-compose exec dev npm run test:css
```

## Performance Optimization

### For Development
- Use volume mounts for hot reload
- Disable telemetry
- Use node_modules volume for faster installs

### For Production
- Multi-stage builds
- Nginx caching
- Health checks for reliability
- Optimized image sizes

## Security Considerations

- No root user in containers
- Minimal base images
- Health checks for monitoring
- Proper secret management
- Network isolation

## CI/CD Integration

The Docker setup is designed for CI/CD with:
- Automated testing
- Performance benchmarks
- Security scanning
- Multi-environment support

Example GitHub Actions integration:
```yaml
- name: Run Docker Tests
  run: |
    chmod +x test-docker.sh
    ./test-docker.sh
```

## Monitoring and Logging

- Health checks on all services
- Centralized logging to `./logs`
- Performance metrics via Lighthouse
- Error tracking with Sentry (when configured)