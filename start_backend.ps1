# Script para iniciar el Backend (Django)
Write-Host "Iniciando servidor Django..." -ForegroundColor Green

# 1. Entrar a la carpeta del backend
Set-Location backend

# 2. Iniciar con el entorno virtual de la raíz
if (Test-Path "..\venv\Scripts\python.exe") {
    Write-Host "Usando entorno virtual del proyecto (root/venv)..." -ForegroundColor Cyan
    & "..\venv\Scripts\python.exe" manage.py runserver
}
else {
    Write-Host "No se encontró el entorno virtual 'venv' en la raíz." -ForegroundColor Red
    Write-Host "Intentando con python global..." -ForegroundColor Yellow
    try {
        python manage.py runserver
    }
    catch {
        Write-Host "Error crítico: No se pudo iniciar Django." -ForegroundColor Red
        Pause
    }
}

# No cerrar ventana inmediatamente si hay error
if ($LASTEXITCODE -ne 0) {
    Pause
}
