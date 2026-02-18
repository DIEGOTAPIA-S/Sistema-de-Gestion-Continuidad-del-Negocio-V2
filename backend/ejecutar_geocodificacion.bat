@echo off
cd /d "%~dp0"
title Asistente de Geocodificacion

echo ===================================================
echo   ASISTENTE DE GEOCODIFICACION AUTOMATICA
echo ===================================================
echo.

:: Verificar si existe el archivo de entrada
if not exist "colaboradores_rrhh.xlsx" (
    echo [ERROR] No encuentro el archivo 'colaboradores_rrhh.xlsx' en esta carpeta.
    echo.
    echo INSTRUCCIONES:
    echo 1. Copia tu Excel con las direcciones a esta misma carpeta.
    echo 2. Renombralo a 'colaboradores_rrhh.xlsx'.
    echo 3. Vuelve a dar doble clic en este archivo.
    echo.
    pause
    exit
)

echo Activando entorno virtual...
if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo [ADVERTENCIA] No encontre el entorno virtual en 'venv'.
    echo Intentando usar Python global...
)

echo.
echo Ejecutando script de geocodificacion...
echo Por favor espera, esto puede tardar dependiendo de la cantidad de registros...
echo.
python geocodificar_excel.py

echo.
echo ===================================================
echo   PROCESO FINALIZADO
echo ===================================================
echo Si todo salio bien, veras un archivo 'colaboradores_geocodificados.xlsx' aqui mismo.
echo.
pause
