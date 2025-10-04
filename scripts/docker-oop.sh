#!/usr/bin/env bash

# OOP Architecture Docker Management Script
# Manages Docker containers with architecture compliance validation

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_NAME="casino-portal-oop"
VERSION="2.0.0"
ARCHITECTURE="oop-compliant"

echo -e "${BLUE}🏗️ Casino Portal OOP Architecture Docker Manager${NC}"
echo -e "${BLUE}Version: ${VERSION} | Architecture: ${ARCHITECTURE}${NC}"
echo ""

# Function to print status
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to validate architecture
validate_architecture() {
    echo -e "${BLUE}🔍 Validating OOP Architecture...${NC}"
    
    if npm run oop:validate; then
        print_status "Architecture validation passed"
        return 0
    else
        print_error "Architecture validation failed"
        return 1
    fi
}

# Function to clean up old containers
cleanup_old_containers() {
    echo -e "${BLUE}🧹 Cleaning up old containers...${NC}"
    
    # Stop and remove old containers
    docker stop casino-dev casino-preview casino-test 2>/dev/null || true
    docker rm casino-dev casino-preview casino-test 2>/dev/null || true
    
    # Remove old images
    docker rmi $(docker images -q --filter "label=architecture=legacy" 2>/dev/null) 2>/dev/null || true
    
    print_status "Cleanup complete"
}

# Function to build OOP-compliant images
build_oop_images() {
    echo -e "${BLUE}🏭 Building OOP-compliant Docker images...${NC}"
    
    # Build development image
    echo "Building development image..."
    docker build -t ${PROJECT_NAME}-dev:${VERSION} \
        --label "architecture=${ARCHITECTURE}" \
        --label "environment=development" \
        --label "version=${VERSION}" \
        -f Dockerfile .
    
    # Build production image
    echo "Building production image..."
    docker build -t ${PROJECT_NAME}-prod:${VERSION} \
        --label "architecture=${ARCHITECTURE}" \
        --label "environment=production" \
        --label "version=${VERSION}" \
        -f Dockerfile.oop .
    
    print_status "Images built successfully"
}

# Function to start development environment
start_dev() {
    echo -e "${BLUE}🚀 Starting OOP development environment...${NC}"
    
    docker-compose -f docker-compose.oop.yml up -d oop-dev
    
    echo "Waiting for development server to be ready..."
    sleep 10
    
    if docker ps | grep -q casino-oop-dev; then
        print_status "Development environment started"
        echo -e "${GREEN}🌐 Access your application at: http://localhost:3000${NC}"
        echo -e "${GREEN}📊 Architecture info: http://localhost:3000/architecture.txt${NC}"
    else
        print_error "Failed to start development environment"
        docker-compose -f docker-compose.oop.yml logs oop-dev
        return 1
    fi
}

# Function to start production environment
start_prod() {
    echo -e "${BLUE}🚀 Starting OOP production environment...${NC}"
    
    # Validate architecture first
    if ! validate_architecture; then
        print_error "Cannot start production with invalid architecture"
        return 1
    fi
    
    docker-compose -f docker-compose.oop.yml up -d oop-prod
    
    echo "Waiting for production server to be ready..."
    sleep 15
    
    if docker ps | grep -q casino-oop-prod; then
        print_status "Production environment started"
        echo -e "${GREEN}🌐 Access your application at: http://localhost:8080${NC}"
        echo -e "${GREEN}📊 Architecture info: http://localhost:8080/architecture.txt${NC}"
    else
        print_error "Failed to start production environment"
        docker-compose -f docker-compose.oop.yml logs oop-prod
        return 1
    fi
}

# Function to run architecture validation
run_validation() {
    echo -e "${BLUE}🔍 Running architecture compliance validation...${NC}"
    
    docker-compose -f docker-compose.oop.yml --profile validation up --abort-on-container-exit oop-validator
    
    if [ $? -eq 0 ]; then
        print_status "Architecture validation completed successfully"
    else
        print_error "Architecture validation failed"
        return 1
    fi
}

# Function to generate templates
generate_templates() {
    echo -e "${BLUE}🏭 Running template generation...${NC}"
    
    docker-compose -f docker-compose.oop.yml --profile generation up --abort-on-container-exit template-generator
    
    if [ $? -eq 0 ]; then
        print_status "Template generation completed"
    else
        print_error "Template generation failed"
        return 1
    fi
}

# Function to show architecture metrics
show_metrics() {
    echo -e "${BLUE}📊 Architecture Metrics${NC}"
    echo ""
    
    # File counts
    echo "📁 File Structure:"
    echo "  Templates: $(find src/templates -name "*.ts" 2>/dev/null | wc -l)"
    echo "  Factories: $(find src/factories -name "*.ts" 2>/dev/null | wc -l)"
    echo "  Managers: $(find src/managers -name "*.ts" 2>/dev/null | wc -l)"
    echo "  Providers: $(find src/providers -name "*.ts" 2>/dev/null | wc -l)"
    echo "  Total Core Files: $(find src -name "*.ts" -not -path "*/node_modules/*" | wc -l)"
    echo ""
    
    # Docker metrics
    echo "🐳 Docker Images:"
    docker images | grep ${PROJECT_NAME} | head -5
    echo ""
    
    # Container status
    echo "📦 Running Containers:"
    docker ps --filter "label=architecture=${ARCHITECTURE}" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
}

# Function to stop all services
stop_all() {
    echo -e "${BLUE}🛑 Stopping all OOP architecture services...${NC}"
    
    docker-compose -f docker-compose.oop.yml down --remove-orphans
    docker-compose -f docker-compose.yml down --remove-orphans 2>/dev/null || true
    
    print_status "All services stopped"
}

# Main command handling
case "${1:-help}" in
    "validate")
        validate_architecture
        ;;
    "cleanup")
        cleanup_old_containers
        ;;
    "build")
        validate_architecture && build_oop_images
        ;;
    "dev")
        start_dev
        ;;
    "prod")
        start_prod
        ;;
    "validation")
        run_validation
        ;;
    "generate")
        generate_templates
        ;;
    "metrics")
        show_metrics
        ;;
    "stop")
        stop_all
        ;;
    "full")
        echo -e "${BLUE}🚀 Full OOP Architecture Deployment${NC}"
        cleanup_old_containers
        validate_architecture
        build_oop_images
        start_prod
        show_metrics
        ;;
    "help"|*)
        echo -e "${BLUE}📖 Usage: $0 [command]${NC}"
        echo ""
        echo "Commands:"
        echo "  validate    - Validate OOP architecture compliance"
        echo "  cleanup     - Clean up old containers and images"
        echo "  build       - Build OOP-compliant Docker images"
        echo "  dev         - Start development environment"
        echo "  prod        - Start production environment"
        echo "  validation  - Run architecture validation tests"
        echo "  generate    - Generate template-based pages"
        echo "  metrics     - Show architecture metrics"
        echo "  stop        - Stop all services"
        echo "  full        - Complete deployment (cleanup, build, start)"
        echo "  help        - Show this help message"
        echo ""
        echo -e "${GREEN}Examples:${NC}"
        echo "  $0 dev      # Start development with hot reload"
        echo "  $0 prod     # Start production environment"
        echo "  $0 full     # Complete deployment pipeline"
        ;;
esac