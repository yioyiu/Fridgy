@echo off
echo Starting EAS Build with retry mechanism...
echo.

set /a attempt=1
set /a max_attempts=5

:retry
echo ========================================
echo Attempt %attempt% of %max_attempts%
echo ========================================
echo.

echo Testing network connection...
ping -n 3 storage.googleapis.com > nul
if %errorlevel% neq 0 (
    echo Network connection failed, waiting 60 seconds...
    timeout /t 60 /nobreak
    goto retry
)

echo Network OK, starting build...
eas build --platform ios --profile production --non-interactive

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo Build successful!
    echo ========================================
    goto end
) else (
    echo.
    echo Build failed (attempt %attempt%)
    if %attempt% lss %max_attempts% (
        echo Waiting 60 seconds before retry...
        timeout /t 60 /nobreak
        set /a attempt+=1
        goto retry
    ) else (
        echo.
        echo ========================================
        echo All attempts failed. Please try:
        echo 1. Use mobile hotspot
        echo 2. Use VPN
        echo 3. Try different time
        echo ========================================
    )
)

:end
echo.
echo Build process completed.
pause
