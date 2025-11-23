# Script simplificado para generar URLs de PlantUML
# Las URLs se pueden abrir en navegador para descargar las imágenes

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔗 GENERADOR DE URLS PLANTUML" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "INSTRUCCIONES:" -ForegroundColor Yellow
Write-Host "1. Abre cada URL en tu navegador" -ForegroundColor White
Write-Host "2. Clic derecho en la imagen → 'Guardar imagen como...'" -ForegroundColor White
Write-Host "3. Guarda con el mismo nombre que el archivo .puml`n" -ForegroundColor White

# Directorios
$baseDir = "c:\Users\limao\Desktop\U SABANA\SEXTO SEMESTRE\ARQUITECTURA DE SOFTWARE\Proyecto-Monis-Torias-Arqui\informe"
$dir4p1 = Join-Path $baseDir "diagramas-4+1"
$dirC4 = Join-Path $baseDir "diagramas-c4"

# Crear archivo de URLs
$urlsFile = Join-Path $baseDir "URLS-PLANTUML.txt"
$urls = @()

Write-Host "=== DIAGRAMAS 4+1 ===`n" -ForegroundColor Yellow

$files4p1 = @(
    "vista-logica.puml",
    "vista-procesos.puml", 
    "vista-desarrollo.puml",
    "vista-fisica.puml",
    "vista-escenarios.puml"
)

foreach ($file in $files4p1) {
    $fullPath = Join-Path $dir4p1 $file
    if (Test-Path $fullPath) {
        $url = "http://www.plantuml.com/plantuml/png/~1$file"
        Write-Host "📄 $file" -ForegroundColor Cyan
        Write-Host "   $url`n" -ForegroundColor Gray
        $urls += "=== 4+1: $file ==="
        $urls += $url
        $urls += ""
    }
}

Write-Host "=== DIAGRAMAS C4 ===`n" -ForegroundColor Yellow

$filesC4 = @(
    "level-1-context.puml",
    "level-2-containers.puml",
    "level-3-components.puml",
    "level-4-code-sessions.puml"
)

foreach ($file in $filesC4) {
    $fullPath = Join-Path $dirC4 $file
    if (Test-Path $fullPath) {
        $url = "http://www.plantuml.com/plantuml/png/~1$file"
        Write-Host "📄 $file" -ForegroundColor Cyan
        Write-Host "   $url`n" -ForegroundColor Gray
        $urls += "=== C4: $file ==="
        $urls += $url
        $urls += ""
    }
}

# Guardar URLs en archivo
$urls | Out-File -FilePath $urlsFile -Encoding UTF8

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "✅ URLs guardadas en: URLS-PLANTUML.txt" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "⚠️  NOTA: El método de URL simple no funcionará." -ForegroundColor Yellow
Write-Host "    Usa la opción alternativa (PlantUML Online)`n" -ForegroundColor Yellow
