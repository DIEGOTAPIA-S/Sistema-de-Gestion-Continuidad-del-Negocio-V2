# Script de inicio — Backend + Frontend
# Asegurar que estamos en la carpeta del script
Set-Location $PSScriptRoot

Write-Host ">>> Iniciando Sistema de Continuidad..." -ForegroundColor Green
Write-Host ">>> Carpeta de trabajo: $PSScriptRoot" -ForegroundColor Gray

# 1. Iniciar Backend (Nueva Ventana)
$backendScript = "$PSScriptRoot\start_backend.ps1"
if (Test-Path $backendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", """$backendScript"""
    Write-Host "OK: Backend iniciado en http://127.0.0.1:8000/" -ForegroundColor Green
}
else {
    Write-Host "ERROR: No encuentro start_backend.ps1" -ForegroundColor Red
}

# 2. Iniciar Frontend (Nueva Ventana)
$frontendScript = "$PSScriptRoot\start_frontend.ps1"
if (Test-Path $frontendScript) {
    Start-Process powershell -ArgumentList "-NoExit", "-File", """$frontendScript"""
    Write-Host "OK: Frontend iniciado en http://localhost:5173/" -ForegroundColor Green
}
else {
    Write-Host "ERROR: No encuentro start_frontend.ps1" -ForegroundColor Red
}

Write-Host "`nOK: Sistema iniciado. Se abriran 2 ventanas de terminal." -ForegroundColor Cyan
Write-Host "    Backend  -> http://127.0.0.1:8000/" -ForegroundColor White
Write-Host "    Frontend -> http://localhost:5173/" -ForegroundColor White
Read-Host "`nPresione Enter para cerrar este lanzador..."
