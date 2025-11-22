# Script para asignar rol de admin a un usuario
# Uso: .\set-admin.ps1 "tu_email@example.com"

param(
    [Parameter(Mandatory=$true)]
    [string]$Email
)

$url = "http://127.0.0.1:5001/proyecto-arqui-2c418/us-central1/api/dev/set-admin-role"
$body = @{
    email = $Email
} | ConvertTo-Json

Write-Host "`nAsignando rol de admin a: $Email" -ForegroundColor Cyan
Write-Host "Endpoint: $url`n" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri $url -Method Post -Body $body -ContentType "application/json"
    
    Write-Host "[OK] Roles asignados correctamente!" -ForegroundColor Green
    Write-Host "`nDetalles:" -ForegroundColor Cyan
    Write-Host "   UID: $($response.user.uid)" -ForegroundColor White
    Write-Host "   Email: $($response.user.email)" -ForegroundColor White
    Write-Host "   Roles: manager, admin, tutor, student" -ForegroundColor White
    
    Write-Host "`n[!] IMPORTANTE: Debes hacer LOGOUT y LOGIN nuevamente en la aplicacion" -ForegroundColor Yellow
    Write-Host "    para que los nuevos roles surtan efecto.`n" -ForegroundColor Yellow
    
} catch {
    Write-Host "[ERROR] Error al asignar roles:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`nAsegurate de que:" -ForegroundColor Yellow
    Write-Host "   1. El emulador de Firebase este corriendo (npm run serve)" -ForegroundColor White
    Write-Host "   2. El email sea correcto y el usuario exista" -ForegroundColor White
    Write-Host "   3. La URL del emulador sea correcta`n" -ForegroundColor White
}
