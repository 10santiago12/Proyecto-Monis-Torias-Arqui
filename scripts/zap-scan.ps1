# PowerShell script para ejecutar OWASP ZAP scan
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('baseline', 'full')]
    [string]$ScanType = 'baseline',
    
    [Parameter(Mandatory=$false)]
    [string]$TargetUrl = 'http://localhost:5173',
    
    [Parameter(Mandatory=$false)]
    [string]$OutputDir = '.\security'
)

# Colores para output
$ErrorColor = 'Red'
$SuccessColor = 'Green'
$InfoColor = 'Cyan'

Write-Host "========================================" -ForegroundColor $InfoColor
Write-Host " OWASP ZAP Security Scanner" -ForegroundColor $InfoColor
Write-Host "========================================" -ForegroundColor $InfoColor
Write-Host ""

# Verificar si Docker está instalado
try {
    $dockerVersion = docker --version
    Write-Host "✓ Docker encontrado: $dockerVersion" -ForegroundColor $SuccessColor
} catch {
    Write-Host "✗ Error: Docker no está instalado o no está en el PATH" -ForegroundColor $ErrorColor
    Write-Host "  Instala Docker Desktop: https://www.docker.com/products/docker-desktop" -ForegroundColor $InfoColor
    exit 1
}

# Crear directorio de salida si no existe
if (!(Test-Path -Path $OutputDir)) {
    Write-Host "Creando directorio de salida: $OutputDir" -ForegroundColor $InfoColor
    New-Item -ItemType Directory -Path $OutputDir | Out-Null
}

# Convertir ruta de Windows a formato compatible con Docker
$OutputDirAbsolute = (Resolve-Path $OutputDir).Path
$OutputDirDocker = $OutputDirAbsolute -replace '\\', '/' -replace '^([A-Z]):', '//$1'

Write-Host ""
Write-Host "Configuración:" -ForegroundColor $InfoColor
Write-Host "  Tipo de escaneo: $ScanType" -ForegroundColor $InfoColor
Write-Host "  URL objetivo: $TargetUrl" -ForegroundColor $InfoColor
Write-Host "  Directorio de salida: $OutputDir" -ForegroundColor $InfoColor
Write-Host ""

# Verificar que la aplicación está corriendo
Write-Host "Verificando que la aplicación está accesible..." -ForegroundColor $InfoColor
try {
    $response = Invoke-WebRequest -Uri $TargetUrl -Method Get -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Aplicación accesible (Status: $($response.StatusCode))" -ForegroundColor $SuccessColor
} catch {
    Write-Host "✗ Error: No se puede acceder a $TargetUrl" -ForegroundColor $ErrorColor
    Write-Host "  Asegúrate de que la aplicación está corriendo:" -ForegroundColor $InfoColor
    Write-Host "    cd frontend && npm run dev" -ForegroundColor $InfoColor
    exit 1
}

Write-Host ""
Write-Host "Iniciando escaneo ZAP..." -ForegroundColor $InfoColor
Write-Host "Esto puede tomar varios minutos. Por favor espera..." -ForegroundColor $InfoColor
Write-Host ""

# Configurar comando ZAP según el tipo de escaneo
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"

if ($ScanType -eq 'baseline') {
    $reportName = "zap-baseline-report-$timestamp"
    $zapCommand = "zap-baseline.py"
    $zapArgs = @(
        "-t", $TargetUrl,
        "-r", "/zap/wrk/$reportName.html",
        "-J", "/zap/wrk/$reportName.json",
        "-w", "/zap/wrk/$reportName.md",
        "-l", "WARN"
    )
} else {
    $reportName = "zap-full-report-$timestamp"
    $zapCommand = "zap-full-scan.py"
    $zapArgs = @(
        "-t", $TargetUrl,
        "-r", "/zap/wrk/$reportName.html",
        "-J", "/zap/wrk/$reportName.json",
        "-w", "/zap/wrk/$reportName.md"
    )
}

# Ejecutar Docker con ZAP
$dockerArgs = @(
    "run",
    "--rm",
    "-v", "${OutputDirDocker}:/zap/wrk/",
    "softwaresecurityproject/zap-stable",
    $zapCommand
) + $zapArgs

Write-Host "Ejecutando: docker $($dockerArgs -join ' ')" -ForegroundColor $InfoColor
Write-Host ""

try {
    & docker @dockerArgs
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "========================================" -ForegroundColor $SuccessColor
        Write-Host " ✓ Escaneo completado exitosamente" -ForegroundColor $SuccessColor
        Write-Host "========================================" -ForegroundColor $SuccessColor
        Write-Host ""
        Write-Host "Reportes generados:" -ForegroundColor $InfoColor
        Write-Host "  HTML: $OutputDir\$reportName.html" -ForegroundColor $SuccessColor
        Write-Host "  JSON: $OutputDir\$reportName.json" -ForegroundColor $SuccessColor
        Write-Host "  Markdown: $OutputDir\$reportName.md" -ForegroundColor $SuccessColor
        Write-Host ""
        
        # Abrir reporte HTML automáticamente
        $htmlReport = Join-Path $OutputDir "$reportName.html"
        if (Test-Path $htmlReport) {
            Write-Host "Abriendo reporte HTML..." -ForegroundColor $InfoColor
            Start-Process $htmlReport
        }
    } elseif ($LASTEXITCODE -eq 2) {
        Write-Host ""
        Write-Host "⚠ Advertencia: Se encontraron WARN level alerts" -ForegroundColor 'Yellow'
        Write-Host "  Revisa el reporte HTML para más detalles" -ForegroundColor $InfoColor
    } elseif ($LASTEXITCODE -eq 1) {
        Write-Host ""
        Write-Host "✗ Error: Se encontraron FAIL level alerts (vulnerabilidades críticas)" -ForegroundColor $ErrorColor
        Write-Host "  Revisa el reporte HTML para más detalles" -ForegroundColor $InfoColor
    } else {
        Write-Host ""
        Write-Host "✗ Error: El escaneo falló con código de salida $LASTEXITCODE" -ForegroundColor $ErrorColor
    }
} catch {
    Write-Host ""
    Write-Host "✗ Error ejecutando ZAP: $($_.Exception.Message)" -ForegroundColor $ErrorColor
    exit 1
}
