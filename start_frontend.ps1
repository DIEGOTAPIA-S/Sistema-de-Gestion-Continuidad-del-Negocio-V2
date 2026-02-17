# Script para iniciar el Frontend (React)
Write-Host "Iniciando servidor Frontend..." -ForegroundColor Cyan

# 1. Verificar si Node/NPM está instalado
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "Error crítico: No se encontró 'npm'. Asegúrate de tener Node.js instalado." -ForegroundColor Red
    Pause
    exit
}

# 2. Entrar a la carpeta del frontend
if (Test-Path "frontend-react") {
    cd frontend-react
}
else {
    Write-Host "Error: No se encuentra la carpeta 'frontend-react'." -ForegroundColor Red
    Pause
    exit
}

# 3. Iniciar el servidor de desarrollo
try {
    Write-Host "Ejecutando 'npm run dev'..." -ForegroundColor Green
    npm run dev
}
catch {
    Write-Host "Error al iniciar el frontend. Revisa los logs arriba." -ForegroundColor Red
    Pause
}
