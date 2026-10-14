@echo off
rem ── Patient AAC App launcher (Windows) ───────────────────────────────────────
rem  Double-click this file. Backend + frontend run in this single window;
rem  press Ctrl+C to stop both.

cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js is not installed.
    echo.
    echo Please install Node.js v20 or newer from:
    echo   https://nodejs.org/
    echo.
    echo After installing, close this window and run start.bat again.
    echo.
    pause
    exit /b 1
)

node "%~dp0launch.js"
set EXIT_CODE=%ERRORLEVEL%

if not "%EXIT_CODE%"=="0" (
    echo.
    echo The launcher exited with code %EXIT_CODE%.
    pause
)
exit /b %EXIT_CODE%
