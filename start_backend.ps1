# Script para iniciar el Backend (Django)
Write-Host "Iniciando servidor Django..." -ForegroundColor Green

# 1. Entrar a la carpeta del backend
Set-Location backend

# 2. Intentar con el venv del proyecto primero, luego con python global
$venvPython = "..\venv\Scripts\python.exe"
$venvHasDjango = $false

if (Test-Path $venvPython) {
    $djangoCheck = & $venvPython -c "import django" 2>&1
    if ($LASTEXITCODE -eq 0) {
        $venvHasDjango = $true
        Write-Host "Usando entorno virtual del proyecto (root/venv)..." -ForegroundColor Cyan
        & $venvPython manage.py runserver
    }
}

if (-not $venvHasDjango) {
    Write-Host "El venv no tiene Django. Usando Python global..." -ForegroundColor Yellow
    python manage.py runserver
}

# No cerrar ventana inmediatamente si hay error
if ($LASTEXITCODE -ne 0) {
    Pause
}
