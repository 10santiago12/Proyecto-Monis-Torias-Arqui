# Script para verificar roles del usuario actual logueado
# Uso: .\check-my-roles.ps1

Write-Host "`n=== VERIFICADOR DE ROLES ===" -ForegroundColor Cyan
Write-Host "Este script verifica los roles del usuario logueado actualmente`n" -ForegroundColor Gray

# Pedir el token de Firebase Auth
Write-Host "Instrucciones:" -ForegroundColor Yellow
Write-Host "1. Abre la consola del navegador (F12)" -ForegroundColor White
Write-Host "2. Ve a Application > Local Storage > http://localhost:5173" -ForegroundColor White
Write-Host "3. Busca la clave que empieza con 'firebase:authUser:'" -ForegroundColor White
Write-Host "4. Copia el valor completo y pegalo aqui`n" -ForegroundColor White

$authData = Read-Host "Pega el valor completo de firebase:authUser"

try {
    $auth = $authData | ConvertFrom-Json
    $token = $auth.stsTokenManager.accessToken
    
    Write-Host "`n[INFO] Token encontrado. Verificando roles..." -ForegroundColor Cyan
    
    $url = "http://127.0.0.1:5001/proyecto-arqui-2c418/us-central1/api/users/debug-roles"
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers
    
    Write-Host "`n[OK] Informacion del usuario:" -ForegroundColor Green
    Write-Host "   UID: $($response.uid)" -ForegroundColor White
    Write-Host "   Email: $($response.email)" -ForegroundColor White
    
    Write-Host "`n[ROLES] Custom Claims (en token):" -ForegroundColor Cyan
    if ($response.customClaims -and $response.customClaims.roles) {
        $response.customClaims.roles | ConvertTo-Json -Depth 10
    } else {
        Write-Host "   [!] No hay custom claims" -ForegroundColor Yellow
    }
    
    Write-Host "`n[ROLES] En token actual:" -ForegroundColor Cyan
    if ($response.tokenRoles) {
        $response.tokenRoles | ConvertTo-Json -Depth 10
    } else {
        Write-Host "   [!] No hay roles en el token" -ForegroundColor Yellow
    }
    
    Write-Host "`n[ROLES] En Firestore:" -ForegroundColor Cyan
    if ($response.firestoreRoles) {
        $response.firestoreRoles | ConvertTo-Json -Depth 10
    } else {
        Write-Host "   [!] No hay documento en user_roles" -ForegroundColor Yellow
    }
    
    Write-Host "`n[RECOMENDACION]" -ForegroundColor Magenta
    Write-Host "   $($response.recommendation)`n" -ForegroundColor White
    
} catch {
    Write-Host "`n[ERROR] No se pudo verificar los roles:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nAsegurate de que:" -ForegroundColor Yellow
    Write-Host "   1. El backend este corriendo (npm run serve)" -ForegroundColor White
    Write-Host "   2. Hayas copiado correctamente el valor completo de localStorage" -ForegroundColor White
    Write-Host "   3. Estes logueado en la aplicacion`n" -ForegroundColor White
}
