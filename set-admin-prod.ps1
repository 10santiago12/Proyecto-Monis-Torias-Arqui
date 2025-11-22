# Script para asignar rol de admin usando el endpoint en producción
# Uso: .\set-admin-prod.ps1 "email@example.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email
)

$url = "https://us-central1-proyecto-arqui-2c418.cloudfunctions.net/api/users/bootstrap-admin"
$body = @{
    email = $Email
    secret = "temp-admin-2024"
} | ConvertTo-Json

Write-Host "`nAsignando rol de admin a: $Email" -ForegroundColor Cyan
Write-Host "Endpoint: $url`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "[OK] Roles asignados correctamente!" -ForegroundColor Green
    Write-Host "`nDetalles:" -ForegroundColor Cyan
    Write-Host "   UID: $($response.uid)" -ForegroundColor White
    Write-Host "   Mensaje: $($response.message)" -ForegroundColor White
    
    Write-Host "`n[!] IMPORTANTE: Debes hacer LOGOUT y LOGIN nuevamente en la aplicacion" -ForegroundColor Yellow
    Write-Host "    para que los nuevos roles surtan efecto.`n" -ForegroundColor Yellow
    
} catch {
    Write-Host "[ERROR] Error al asignar roles:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nAsegurate de que:" -ForegroundColor Yellow
    Write-Host "   1. El deploy de Firebase Functions haya terminado exitosamente" -ForegroundColor White
    Write-Host "   2. El email sea correcto y el usuario exista en Firebase Auth" -ForegroundColor White
    Write-Host "   3. Espera unos minutos y vuelve a intentar`n" -ForegroundColor White
}
