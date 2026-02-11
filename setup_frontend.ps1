# setup_frontend.ps1
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")

Write-Host "🚀 Iniciando configuración de Frontend React..."

if (Test-Path "frontend-react") {
    Write-Host "⚠️ La carpeta 'frontend-react' ya existe. Eliminándola para empezar de cero..."
    Remove-Item -Path "frontend-react" -Recurse -Force
}

Write-Host "📦 Creando proyecto Vite..."
# Usamos cmd /c para asegurar compatibilidad con npx/npm en algunos entornos
cmd /c "npm create vite@latest frontend-react -- --template react"

if (-not (Test-Path "frontend-react")) {
    Write-Host "❌ Error: La carpeta frontend-react no se creó."
    exit 1
}

Set-Location "frontend-react"

Write-Host "📥 Instalando dependencias base..."
cmd /c "npm install"

Write-Host "📥 Instalando librerías adicionales (Router, Axios, Leaflet, Charts)..."
cmd /c "npm install axios react-router-dom leaflet react-leaflet recharts @turf/turf users"

Write-Host "✅ Configuración completada exitosamente."
