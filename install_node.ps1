# Script de instalación automática de Node.js via Chocolatey

Write-Host "Instalando Chocolatey..."
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

Write-Host "Instalando Node.js v22.2.0..."
choco install nodejs --version="22.2.0" -y

Write-Host "Verificando instalacion..."
Refreshenv
node -v
npm -v

Write-Host "INSTALACION COMPLETA. REINICIA VS CODE AHORA."
