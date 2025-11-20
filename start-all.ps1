# Script para iniciar Backend + Frontend simultaneamente
# Ejecutar desde la raiz del proyecto con: .\start-all.ps1

Write-Host "==> Iniciando Monis-Torias en modo desarrollo..." -ForegroundColor Green
Write-Host ""

# Verificar directorios
if (-Not ((Test-Path ".\frontend") -and (Test-Path ".\functions"))) {
    Write-Host "[ERROR] Directorios 'frontend' o 'functions' no encontrados." -ForegroundColor Red
    exit 1
}

Write-Host "Este script abrira 2 terminales:" -ForegroundColor Cyan
Write-Host "   [1] Backend (Firebase Functions) - Puerto 5001" -ForegroundColor Yellow
Write-Host "   [2] Frontend (Vite) - Puerto 5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Presiona Enter para continuar..." -ForegroundColor White
Read-Host

# Iniciar Backend en nueva terminal
Write-Host "==> Abriendo terminal para Backend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-backend.ps1"

# Esperar 3 segundos para que el backend se inicie primero
Start-Sleep -Seconds 3

# Iniciar Frontend en nueva terminal
Write-Host "==> Abriendo terminal para Frontend..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; .\start-frontend.ps1"

Write-Host ""
Write-Host "[OK] Ambos servicios se estan iniciando..." -ForegroundColor Green
Write-Host ""
Write-Host "URLs:" -ForegroundColor White
Write-Host "   Backend:  http://localhost:5001/proyecto-arqui-2c418/us-central1/api" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "TIP: Usa Ctrl+C en cada terminal para detener los servicios" -ForegroundColor Yellow
Write-Host ""
Write-Host "Puedes cerrar esta ventana ahora" -ForegroundColor Green
