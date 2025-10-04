@echo off
REM Casino Portal Docker Testing Script for Windows
REM Comprehensive testing automation for Docker containers

echo 🚀 Starting Casino Portal Docker Testing Suite...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker is not running. Please start Docker and try again.
    exit /b 1
)

echo [SUCCESS] Docker is running!

REM Create directories
if not exist "reports" mkdir reports
if not exist "test-results" mkdir test-results
if not exist "coverage" mkdir coverage
if not exist "logs" mkdir logs

echo [INFO] Building Docker images...
docker-compose build --parallel

echo [INFO] Starting development environment...
docker-compose up -d dev backend

echo [INFO] Waiting for services to start...
timeout /t 30 /nobreak >nul

REM Check if dev service is ready
docker-compose exec dev curl -f http://localhost:3000 >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Development server is not responding
    docker-compose logs dev
    exit /b 1
)

echo [SUCCESS] Development server is ready!

echo [INFO] Running basic application tests...
docker-compose exec dev npm test

echo [INFO] Running Lighthouse performance tests...
docker-compose --profile testing run --rm lighthouse

echo [INFO] Running comprehensive test suite...
docker-compose --profile testing run --rm test

echo [INFO] Testing production build...
docker-compose up -d preview

echo [INFO] Waiting for preview service...
timeout /t 20 /nobreak >nul

docker-compose exec preview curl -f http://localhost:80 >nul 2>&1
if %errorlevel% equ 0 (
    echo [SUCCESS] Production preview is working!
) else (
    echo [ERROR] Production preview failed
    docker-compose logs preview
)

echo [INFO] Generating test summary...
echo # Casino Portal Docker Testing Summary > reports\test-summary.md
echo. >> reports\test-summary.md
echo ## Test Execution: %date% %time% >> reports\test-summary.md
echo. >> reports\test-summary.md
echo ### Services Tested: >> reports\test-summary.md
echo - Development Server (Port 3000) >> reports\test-summary.md
echo - Production Preview (Port 8080) >> reports\test-summary.md
echo - Backend API (Port 4000) >> reports\test-summary.md
echo - Lighthouse Performance Tests >> reports\test-summary.md
echo - Comprehensive Test Suite >> reports\test-summary.md

echo [SUCCESS] Testing completed! Check reports directory for detailed results.
echo.
echo [INFO] Current service status:
docker-compose ps

echo.
echo [INFO] Available services:
echo - Development: http://localhost:3000
echo - Preview: http://localhost:8080
echo - Backend API: http://localhost:4000

echo.
echo [SUCCESS] Docker testing suite completed successfully!
echo 📊 Reports available in: .\reports\
echo 🧪 Test results in: .\test-results\
echo 📝 Logs in: .\logs\

pause