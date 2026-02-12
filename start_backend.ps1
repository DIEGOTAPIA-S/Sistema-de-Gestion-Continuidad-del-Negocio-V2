# Script para iniciar el Backend (Django)
Write-Host "Iniciando servidor Django..." -ForegroundColor Green

# 1. Entrar a la carpeta del backend
cd backend

# 2. Activar el entorno virtual y ejecutar el servidor
& ".\venv\Scripts\python.exe" manage.py runserver

# Nota: El servidor quedará corriendo en esta ventana. No la cierres.
