# Script para iniciar el Backend (Django)
Write-Host "Iniciando servidor Django..." -ForegroundColor Green

# 1. Entrar a la carpeta del backend
cd backend

# 2. Buscar el entorno virtual correcto
# El usuario indica "venv dentro de venv", así que probaremos primero el local (backend/venv)
# y luego el del padre (root/venv)

if (Test-Path "venv\Scripts\python.exe") {
    Write-Host "Usando entorno virtual local (backend/venv)..." -ForegroundColor Cyan
    & "venv\Scripts\python.exe" manage.py runserver
}
elseif (Test-Path "..\venv\Scripts\python.exe") {
    Write-Host "Usando entorno virtual raíz (backend/../venv)..." -ForegroundColor Cyan
    & "..\venv\Scripts\python.exe" manage.py runserver
}
else {
    Write-Host "No se encontró entorno virtual en 'backend\venv' ni en '..\venv'." -ForegroundColor Global
    Write-Host "Intentando con python global..." -ForegroundColor Yellow
    try {
        python manage.py runserver
    }
    catch {
        Write-Host "Error crítico: No se pudo iniciar Django. Verifica tu instalación de Python/Venv." -ForegroundColor Red
        Pause
    }
}

# No cerrar ventana inmediatamente si hay error
if ($LASTEXITCODE -ne 0) {
    Pause
}
