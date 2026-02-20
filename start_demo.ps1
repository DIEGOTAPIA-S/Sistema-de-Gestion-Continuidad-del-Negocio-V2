# Script de Demo Remota (Todo en Uno)
# Asegurar que estamos en la carpeta del script
Set-Location $PSScriptRoot

Write-Host ">>> Iniciando Modo Demo..." -ForegroundColor Green
Write-Host ">>> Carpeta de trabajo: $PSScriptRoot" -ForegroundColor Gray

# 1. Iniciar Backend (Nueva Ventana)
$backendScript = "$PSScriptRoot\start_backend.ps1"
if (Test-Path $backendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", """$backendScript"""
    Write-Host "OK: Backend iniciado" -ForegroundColor Green
}
else {
    Write-Host "ERROR: No encuentro start_backend.ps1" -ForegroundColor Red
}

# 2. Iniciar Frontend (Nueva Ventana)
$frontendScript = "$PSScriptRoot\start_frontend.ps1"
if (Test-Path $frontendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", """$frontendScript"""
    Write-Host "OK: Frontend iniciado" -ForegroundColor Green
}
else {
    Write-Host "ERROR: No encuentro start_frontend.ps1" -ForegroundColor Red
}

# 3. Configuracion de Ngrok (Automatica)
Write-Host "`n>>> CONFIGURACION DE ACCESO REMOTO" -ForegroundColor Yellow

# Buscar Ngrok (LOCAL - Descargado manualmente)
$ngrokPath = "$PSScriptRoot\ngrok.exe"

if (-not (Test-Path $ngrokPath)) {
    Write-Host "ERROR: No encuentro 'ngrok.exe' en la carpeta del script." -ForegroundColor Red
    Write-Host "Asegurate de que se descargo y descomprimio correctamente."
    Read-Host "Presiona Enter para salir..."
    exit
}

Write-Host "OK: Ngrok LOCAL detectado en: $ngrokPath" -ForegroundColor Gray

# Configurar Token Automaticamente
$token = "39ui5Xmxt6DHxxdL2LB5sM3zbf2_3Df5xCiw1hwa3etishZWP"
& $ngrokPath config add-authtoken $token
Write-Host "OK: Token configurado automaticamente." -ForegroundColor Green

# 4. Iniciar el Tunel (Nueva Ventana)
Write-Host "`n>>> LANZANDO TUNEL..." -ForegroundColor Green
Write-Host "Se abrira una nueva ventana negra con Ngrok." -ForegroundColor yellow
Write-Host "Busca alli el enlace que dice 'Forwarding'." -ForegroundColor yellow

$ngrokCmd = "cd '$PSScriptRoot'; .\ngrok.exe http 5173 --host-header=localhost:5173"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $ngrokCmd

Write-Host "`nOK: Todo iniciado. Busca las 3 ventanas nuevas en tu barra de tareas." -ForegroundColor Cyan
Read-Host "Presione Enter para cerrar este lanzador..."
