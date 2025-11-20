# Script para iniciar el backend (Firebase Functions) localmente
# Ejecutar desde la raiz del proyecto con: .\start-backend.ps1

Write-Host "==> Iniciando Backend (Firebase Functions)..." -ForegroundColor Green
Write-Host ""

# Verificar que estamos en el directorio correcto
if (-Not (Test-Path ".\functions")) {
    Write-Host "[ERROR] Directorio 'functions' no encontrado." -ForegroundColor Red
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

# Verificar que Firebase CLI esta instalado
$firebaseVersion = firebase --version 2>$null
if (-Not $firebaseVersion) {
    Write-Host "[ERROR] Firebase CLI no esta instalado." -ForegroundColor Red
    Write-Host "   Instala con: npm install -g firebase-tools" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Firebase CLI instalado" -ForegroundColor Green
Write-Host ""

# Verificar si node_modules existe en functions
if (-Not (Test-Path ".\functions\node_modules")) {
    Write-Host "==> Instalando dependencias del backend..." -ForegroundColor Yellow
    Set-Location functions
    npm install
    Set-Location ..
    Write-Host "[OK] Dependencias instaladas" -ForegroundColor Green
    Write-Host ""
}

Write-Host "==> Iniciando Firebase Functions en modo local..." -ForegroundColor Cyan
Write-Host "   Backend disponible en: http://localhost:5001" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Para detener, presiona Ctrl+C" -ForegroundColor Yellow
Write-Host ""

# Iniciar Firebase Functions
Set-Location functions
npm run serve
