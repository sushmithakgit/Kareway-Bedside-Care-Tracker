@echo off
rem ── Patient AAC App — packager (Windows) ─────────────────────────────────────
rem  Produces patient-aac-app.zip with node_modules, build output, secrets,
rem  and editor state stripped out. Re-run anytime you want a fresh zip.

setlocal enableextensions
cd /d "%~dp0"

set OUT=patient-aac-app.zip
set STAGE=%TEMP%\patient-aac-app-stage-%RANDOM%%RANDOM%

if exist "%OUT%" del /q "%OUT%"
if exist "%STAGE%" rmdir /s /q "%STAGE%"

echo.
echo Staging files (excluding node_modules, dist, secrets, editor state)...
robocopy "%CD%" "%STAGE%\patient-aac-app" /E ^
    /XD node_modules dist .vscode .idea .claude .git ^
    /XF "*.log" ".env" ".env.*" "serviceAccountKey.json" "%OUT%" ".DS_Store" ^
    /NFL /NDL /NJH /NJS /NP

rem robocopy exit codes: 0,1,2,3 = success (files copied / nothing to do / extras / mismatched)
if errorlevel 8 (
    echo.
    echo [ERROR] robocopy failed with exit code %errorlevel%.
    rmdir /s /q "%STAGE%" 2>nul
    pause
    exit /b 1
)

echo.
echo Compressing to %OUT% ...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Compress-Archive -Path '%STAGE%\patient-aac-app' -DestinationPath '%CD%\%OUT%' -Force"
if errorlevel 1 (
    echo [ERROR] Compress-Archive failed.
    rmdir /s /q "%STAGE%" 2>nul
    pause
    exit /b 1
)

rmdir /s /q "%STAGE%"

echo.
echo ============================================================
echo   Done.
echo ============================================================
for %%I in ("%OUT%") do echo   File: %%~fI    ^(%%~zI bytes^)
echo.
echo   Send this .zip to your recipient. They unzip it anywhere,
echo   install Node.js v20+ from https://nodejs.org/ once, then
echo   double-click start.bat (Windows) or run ./start.sh (Mac).
echo ============================================================
echo.
pause
endlocal
