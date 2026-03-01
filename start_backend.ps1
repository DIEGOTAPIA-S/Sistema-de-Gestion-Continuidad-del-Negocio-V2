# Script para iniciar el Backend (Django)
Write-Host "Iniciando servidor Django..." -ForegroundColor Green

# Entrar a la carpeta del backend
Set-Location "$PSScriptRoot\backend"

# Ruta del entorno virtual real del proyecto
# NOTA: el venv está en "continuidad -  app" (sin triple p) por cómo fue creado originalmente
$venvActivate = "C:\Users\Santiago Castañeda\OneDrive\Escritorio\continuidad -  app\venv\Scripts\python.exe"

if (Test-Path $venvActivate) {
    Write-Host "Usando entorno virtual del proyecto..." -ForegroundColor Cyan
    & $venvActivate manage.py runserver
}
else {
    Write-Host "Venv no encontrado. Usando Python global (asegurate de tener las dependencias instaladas)..." -ForegroundColor Yellow
    python manage.py runserver
}

# No cerrar ventana inmediatamente si hay error
if ($LASTEXITCODE -ne 0) {
    Write-Host "El servidor tuvo un error. Revisa los mensajes anteriores." -ForegroundColor Red
    Pause
}
