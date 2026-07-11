@echo off
setlocal enabledelayedexpansion

:: Get the server directory (parent of scripts folder)
set SERVER_DIR=%~dp0..

echo ============================================
echo  ONBOARD NEW COMPANY - Database Setup
echo ============================================
echo.

set /p COMPANY_NAME="Company Name: "
set /p COMPANY_SLUG="Company Slug (lowercase, hyphens allowed): "

:: Generate database name from slug
set DB_NAME=warranty_%COMPANY_SLUG:-=_%

echo.
echo --------------------------------------------
echo  Company: %COMPANY_NAME%
echo  Slug: %COMPANY_SLUG%
echo  Database: %DB_NAME%
echo --------------------------------------------
echo.

:: Step 1: Create database
echo [1/3] Creating database: %DB_NAME% ...
docker exec -it postgreSQL createdb -h localhost -p 5433 -U postgres %DB_NAME%

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database!
    pause
    exit /b 1
)
echo       Database created successfully!
echo.

:: Step 2: Push schema (run from server directory)
echo [2/3] Pushing Prisma schema to %DB_NAME% ...
cd /d "%SERVER_DIR%"
cmd /c "set DATABASE_URL=postgresql://postgres:postgres@localhost:5433/%DB_NAME%?schema=public && npx prisma db push --schema=prisma/schema"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to push schema!
    pause
    exit /b 1
)
echo       Schema pushed successfully!
echo.

:: Step 3: Verify tables
echo [3/3] Verifying tables ...
docker exec -it postgreSQL psql -h localhost -p 5433 -U postgres -d %DB_NAME% -c "\dt"

echo.
echo ============================================
echo  DATABASE SETUP COMPLETE!
echo ============================================
echo.
echo Database Name: %DB_NAME%
echo.
echo --------------------------------------------
echo  NEXT STEP - Call this API:
echo --------------------------------------------
echo.
echo POST /api/admin/organizations
echo Content-Type: application/json
echo.
echo {
echo   "name": "%COMPANY_NAME%",
echo   "slug": "%COMPANY_SLUG%",
echo   "companyName": "%COMPANY_NAME%"
echo }
echo.
echo ============================================

pause