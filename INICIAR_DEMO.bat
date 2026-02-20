@echo off
cd /d "%~dp0"
echo 🚀 Lanzando Demo (Backend + Frontend + Ngrok)...
powershell -NoProfile -ExecutionPolicy Bypass -File "start_demo.ps1"
if %ERRORLEVEL% NEQ 0 (
    color 0C
    echo ❌ ERROR: El script de PowerShell falló.
    echo Revisa el mensaje de arriba.
)
pause
