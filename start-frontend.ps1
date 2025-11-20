# Script para iniciar el frontend localmente
# Ejecutar desde la raiz del proyecto con: .\start-frontend.ps1

Write-Host "==> Iniciando Frontend..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-Not (Test-Path ".\frontend")) {
    Write-Host "[ERROR] Directorio 'frontend' no encontrado." -ForegroundColor Red
    Write-Host "   Ejecuta este script desde la raiz del proyecto." -ForegroundColor Yellow
    exit 1
}

# Verificar que Node esta instalado
$nodeVersion = node --version 2>$null
if (-Not $nodeVersion) {
    Write-Host "[ERROR] Node.js no esta instalado." -ForegroundColor Red
    Write-Host "   Descarga e instala Node.js desde https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Node.js version: $nodeVersion" -ForegroundColor Green

# Verificar si .env existe
if (-Not (Test-Path ".\frontend\.env")) {
    Write-Host "[WARN] Advertencia: Archivo .env no encontrado." -ForegroundColor Yellow
    Write-Host "   Crea un archivo .env en el directorio frontend/" -ForegroundColor Yellow
    Write-Host "   Copia .env.example como base" -ForegroundColor Yellow
    Write-Host ""
}

# Verificar si node_modules existe en frontend
if (-Not (Test-Path ".\frontend\node_modules")) {
    Write-Host "==> Instalando dependencias del frontend..." -ForegroundColor Yellow
    Set-Location frontend
    npm install
    Set-Location ..
    Write-Host "[OK] Dependencias instaladas" -ForegroundColor Green
    Write-Host ""
}

Write-Host "==> Iniciando Vite dev server..." -ForegroundColor Cyan
Write-Host "   Frontend disponible en: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Hot reload activado" -ForegroundColor Green
Write-Host "   Para detener, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Iniciar frontend
Set-Location frontend
npm run dev
