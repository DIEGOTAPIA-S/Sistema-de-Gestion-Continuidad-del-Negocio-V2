# Script para iniciar el Backend (Django)
Write-Host "Iniciando servidor Django..." -ForegroundColor Green

# 1. Entrar a la carpeta del backend
cd backend

# 2. Activar el entorno virtual y ejecutar el servidor
# 2. Activar el entorno virtual y ejecutar el servidor
# ..\ significa "subir un nivel" porque venv está en la carpeta raiz, no dentro de backend
try {
    & "..\venv\Scripts\python.exe" manage.py runserver
}
catch {
    Write-Host "Error al iniciar Django. Revisa que el entorno virtual exista." -ForegroundColor Red
    Pause
}

# Nota: El servidor quedará corriendo en esta ventana. No la cierres.
