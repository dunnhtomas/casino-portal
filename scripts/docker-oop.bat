@echo off
REM OOP Architecture Docker Management Script for Windows
REM Manages Docker containers with architecture compliance validation

setlocal enabledelayedexpansion

set PROJECT_NAME=casino-portal-oop
set VERSION=2.0.0
set ARCHITECTURE=oop-compliant

echo.
echo 🏗️ Casino Portal OOP Architecture Docker Manager
echo Version: %VERSION% ^| Architecture: %ARCHITECTURE%
echo.

if "%1"=="" goto help
if "%1"=="help" goto help
if "%1"=="validate" goto validate
if "%1"=="cleanup" goto cleanup
if "%1"=="build" goto build
if "%1"=="dev" goto dev
if "%1"=="prod" goto prod
if "%1"=="validation" goto validation
if "%1"=="generate" goto generate
if "%1"=="metrics" goto metrics
if "%1"=="stop" goto stop
if "%1"=="full" goto full

goto help

:validate
echo 🔍 Validating OOP Architecture...
npm run oop:validate
if %errorlevel% equ 0 (
    echo ✅ Architecture validation passed
) else (
    echo ❌ Architecture validation failed
    exit /b 1
)
goto end

:cleanup
echo 🧹 Cleaning up old containers...
docker stop casino-dev casino-preview casino-test 2>nul
docker rm casino-dev casino-preview casino-test 2>nul
for /f "tokens=*" %%i in ('docker images -q --filter "label=architecture=legacy" 2^>nul') do docker rmi %%i 2>nul
echo ✅ Cleanup complete
goto end

:build
echo 🏭 Building OOP-compliant Docker images...
call :validate
if %errorlevel% neq 0 exit /b 1

echo Building development image...
docker build -t %PROJECT_NAME%-dev:%VERSION% --label "architecture=%ARCHITECTURE%" --label "environment=development" --label "version=%VERSION%" -f Dockerfile .

echo Building production image...
docker build -t %PROJECT_NAME%-prod:%VERSION% --label "architecture=%ARCHITECTURE%" --label "environment=production" --label "version=%VERSION%" -f Dockerfile.oop .

echo ✅ Images built successfully
goto end

:dev
echo 🚀 Starting OOP development environment...
docker-compose -f docker-compose.oop.yml up -d oop-dev

echo Waiting for development server to be ready...
timeout /t 10 /nobreak >nul

docker ps | findstr casino-oop-dev >nul
if %errorlevel% equ 0 (
    echo ✅ Development environment started
    echo 🌐 Access your application at: http://localhost:3000
    echo 📊 Architecture info: http://localhost:3000/architecture.txt
) else (
    echo ❌ Failed to start development environment
    docker-compose -f docker-compose.oop.yml logs oop-dev
    exit /b 1
)
goto end

:prod
echo 🚀 Starting OOP production environment...
call :validate
if %errorlevel% neq 0 (
    echo ❌ Cannot start production with invalid architecture
    exit /b 1
)

docker-compose -f docker-compose.oop.yml up -d oop-prod

echo Waiting for production server to be ready...
timeout /t 15 /nobreak >nul

docker ps | findstr casino-oop-prod >nul
if %errorlevel% equ 0 (
    echo ✅ Production environment started
    echo 🌐 Access your application at: http://localhost:8080
    echo 📊 Architecture info: http://localhost:8080/architecture.txt
) else (
    echo ❌ Failed to start production environment
    docker-compose -f docker-compose.oop.yml logs oop-prod
    exit /b 1
)
goto end

:validation
echo 🔍 Running architecture compliance validation...
docker-compose -f docker-compose.oop.yml --profile validation up --abort-on-container-exit oop-validator
if %errorlevel% equ 0 (
    echo ✅ Architecture validation completed successfully
) else (
    echo ❌ Architecture validation failed
    exit /b 1
)
goto end

:generate
echo 🏭 Running template generation...
docker-compose -f docker-compose.oop.yml --profile generation up --abort-on-container-exit template-generator
if %errorlevel% equ 0 (
    echo ✅ Template generation completed
) else (
    echo ❌ Template generation failed
    exit /b 1
)
goto end

:metrics
echo 📊 Architecture Metrics
echo.

echo 📁 File Structure:
for /f %%i in ('dir /s /b src\templates\*.ts 2^>nul ^| find /c /v ""') do set template_count=%%i
for /f %%i in ('dir /s /b src\factories\*.ts 2^>nul ^| find /c /v ""') do set factory_count=%%i
for /f %%i in ('dir /s /b src\managers\*.ts 2^>nul ^| find /c /v ""') do set manager_count=%%i
for /f %%i in ('dir /s /b src\providers\*.ts 2^>nul ^| find /c /v ""') do set provider_count=%%i
for /f %%i in ('dir /s /b src\*.ts 2^>nul ^| find /c /v ""') do set total_count=%%i

echo   Templates: %template_count%
echo   Factories: %factory_count%
echo   Managers: %manager_count%
echo   Providers: %provider_count%
echo   Total Core Files: %total_count%
echo.

echo 🐳 Docker Images:
docker images | findstr %PROJECT_NAME%
echo.

echo 📦 Running Containers:
docker ps --filter "label=architecture=%ARCHITECTURE%" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
goto end

:stop
echo 🛑 Stopping all OOP architecture services...
docker-compose -f docker-compose.oop.yml down --remove-orphans
docker-compose -f docker-compose.yml down --remove-orphans 2>nul
echo ✅ All services stopped
goto end

:full
echo 🚀 Full OOP Architecture Deployment
call :cleanup
call :validate
if %errorlevel% neq 0 exit /b 1
call :build
if %errorlevel% neq 0 exit /b 1
call :prod
if %errorlevel% neq 0 exit /b 1
call :metrics
goto end

:help
echo 📖 Usage: %0 [command]
echo.
echo Commands:
echo   validate    - Validate OOP architecture compliance
echo   cleanup     - Clean up old containers and images
echo   build       - Build OOP-compliant Docker images
echo   dev         - Start development environment
echo   prod        - Start production environment
echo   validation  - Run architecture validation tests
echo   generate    - Generate template-based pages
echo   metrics     - Show architecture metrics
echo   stop        - Stop all services
echo   full        - Complete deployment (cleanup, build, start)
echo   help        - Show this help message
echo.
echo Examples:
echo   %0 dev      # Start development with hot reload
echo   %0 prod     # Start production environment
echo   %0 full     # Complete deployment pipeline

:end
endlocal