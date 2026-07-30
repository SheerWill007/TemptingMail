@echo off
REM Temp-Mail Backend Setup Script for Windows
REM This script helps you create a .env file interactively

echo ==========================================
echo    Temp-Mail Backend Configuration
echo ==========================================
echo.

REM Check if .env already exists
if exist .env (
    echo WARNING: .env file already exists!
    set /p overwrite="Do you want to overwrite it? (y/n): "
    if /i not "%overwrite%"=="y" (
        echo Setup cancelled.
        exit /b 0
    )
    del .env
)

echo Let's configure your backend environment...
echo.

REM Database URL
echo DATABASE CONFIGURATION
echo -------------------------------------------
echo Example: postgresql://user:password@localhost:5432/tempmail
set /p database_url="Enter your PostgreSQL DATABASE_URL: "
echo.

REM Domain Configuration
echo DOMAIN CONFIGURATION
echo -------------------------------------------
set /p smtp_domain="Enter your email domain (e.g., temp.yourdomain.com): "
echo.

REM Frontend URL
echo FRONTEND CONFIGURATION
echo -------------------------------------------
echo Enter your frontend URL(s) separated by commas
echo Example: https://temp.yourdomain.com,https://temp-app.vercel.app
set /p cors_origin="Frontend URL(s): "
echo.

REM Server Ports
echo SERVER PORTS
echo -------------------------------------------
set /p api_port="API Port (press Enter for default 3001): "
if "%api_port%"=="" set api_port=3001

set /p smtp_port="SMTP Port (25 for production, 2525 for testing, press Enter for 25): "
if "%smtp_port%"=="" set smtp_port=25
echo.

REM Environment
echo ENVIRONMENT
echo -------------------------------------------
set /p node_env="Environment (production/development, press Enter for production): "
if "%node_env%"=="" set node_env=production
echo.

REM Cleanup Configuration
echo CLEANUP SERVICE
echo -------------------------------------------
set /p cleanup_enabled="Enable automatic cleanup? (true/false, press Enter for true): "
if "%cleanup_enabled%"=="" set cleanup_enabled=true

set /p cleanup_leader="Is this the cleanup leader? (true/false, press Enter for true): "
if "%cleanup_leader%"=="" set cleanup_leader=true
echo.

REM Optional: PostHog Analytics
echo ANALYTICS (Optional)
echo -------------------------------------------
set /p posthog_key="PostHog API Key (leave empty to skip): "
echo.

REM Create .env file
(
echo # Database Configuration
echo DATABASE_URL=%database_url%
echo.
echo # Server Configuration
echo API_PORT=%api_port%
echo SMTP_PORT=%smtp_port%
echo.
echo # Domain Configuration
echo SMTP_DOMAIN=%smtp_domain%
echo MAIL_DOMAIN=%smtp_domain%
echo.
echo # CORS Configuration
echo CORS_ORIGIN=%cors_origin%
) > .env

REM Extract first URL from cors_origin for FRONTEND_URL
for /f "tokens=1 delims=," %%a in ("%cors_origin%") do (
    echo FRONTEND_URL=%%a >> .env
)

(
echo.
echo # Environment
echo NODE_ENV=%node_env%
echo.
echo # Cleanup Service
echo CLEANUP_ENABLED=%cleanup_enabled%
echo CLEANUP_LEADER=%cleanup_leader%
) >> .env

REM Add PostHog if provided
if not "%posthog_key%"=="" (
    (
    echo.
    echo # Analytics
    echo POSTHOG_KEY=%posthog_key%
    echo POSTHOG_HOST=https://app.posthog.com
    ) >> .env
)

echo.
echo ✓ .env file created successfully!
echo.
echo Your configuration:
echo -------------------------------------------
type .env
echo -------------------------------------------
echo.
echo Next steps:
echo 1. Review the .env file: type .env
echo 2. Generate Prisma client: pnpm prisma:generate
echo 3. Run migrations: pnpm prisma migrate deploy
echo 4. Build the application: pnpm build
echo 5. Start the server: pnpm start
echo.
echo For development mode: pnpm dev
echo.
pause
