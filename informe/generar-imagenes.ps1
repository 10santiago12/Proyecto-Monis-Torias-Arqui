# Script para generar imágenes PNG de archivos PlantUML usando servicio online
# Requiere: PowerShell 5.1+ (Windows)

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📸 GENERADOR DE IMÁGENES PLANTUML" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan

# Función para codificar a PlantUML format
function Encode-PlantUML {
    param([string]$text)
    
    # Comprimir con deflate y codificar en base64 especial de PlantUML
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($text)
    $ms = New-Object System.IO.MemoryStream
    $deflate = New-Object System.IO.Compression.DeflateStream($ms, [System.IO.Compression.CompressionMode]::Compress)
    $deflate.Write($bytes, 0, $bytes.Length)
    $deflate.Close()
    $compressed = $ms.ToArray()
    
    # Codificación especial de PlantUML
    $encoded = ""
    $alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_"
    
    for ($i = 0; $i -lt $compressed.Length; $i += 3) {
        $b1 = $compressed[$i]
        $b2 = if ($i + 1 -lt $compressed.Length) { $compressed[$i + 1] } else { 0 }
        $b3 = if ($i + 2 -lt $compressed.Length) { $compressed[$i + 2] } else { 0 }
        
        $encoded += $alphabet[($b1 -shr 2) -band 0x3F]
        $encoded += $alphabet[(($b1 -band 0x3) -shl 4) -bor (($b2 -shr 4) -band 0xF)]
        $encoded += $alphabet[(($b2 -band 0xF) -shl 2) -bor (($b3 -shr 6) -band 0x3)]
        $encoded += $alphabet[$b3 -band 0x3F]
    }
    
    return $encoded
}

# Directorios
$baseDir = Split-Path -Parent $PSCommandPath
$dir4p1 = Join-Path $baseDir "diagramas-4+1"
$dirC4 = Join-Path $baseDir "diagramas-c4"

Write-Host "📂 Directorios:" -ForegroundColor Yellow
Write-Host "   Base: $baseDir" -ForegroundColor White
Write-Host "   4+1:  $dir4p1" -ForegroundColor White
Write-Host "   C4:   $dirC4`n" -ForegroundColor White

# Función para descargar imagen
function Download-PlantUMLImage {
    param(
        [string]$pumlFile,
        [string]$outputDir
    )
    
    $fileName = [System.IO.Path]::GetFileNameWithoutExtension($pumlFile)
    $pngFile = Join-Path $outputDir "$fileName.png"
    
    Write-Host "🔄 Procesando: $fileName.puml" -ForegroundColor Cyan
    
    try {
        # Leer archivo
        $content = Get-Content $pumlFile -Raw -Encoding UTF8
        
        # Usar servicio PlantUML online (más simple que encoding)
        # Alternativa: usar el servidor público
        $url = "http://www.plantuml.com/plantuml/png/"
        
        # Para archivos grandes, usar POST
        $boundary = [System.Guid]::NewGuid().ToString()
        $bodyLines = @(
            "--$boundary",
            'Content-Disposition: form-data; name="text"',
            '',
            $content,
            "--$boundary--"
        )
        $body = $bodyLines -join "`r`n"
        
        Write-Host "   ⏳ Descargando desde PlantUML server..." -ForegroundColor Gray
        
        # Descargar imagen
        Invoke-WebRequest -Uri $url -Method Post -Body $body -ContentType "multipart/form-data; boundary=$boundary" -OutFile $pngFile -UseBasicParsing
        
        Write-Host "   ✅ Guardado: $pngFile`n" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "   ❌ Error: $_`n" -ForegroundColor Red
        return $false
    }
}

# Procesar diagramas 4+1
Write-Host "`n=== DIAGRAMAS 4+1 ===" -ForegroundColor Yellow
$pumlFiles4p1 = Get-ChildItem -Path $dir4p1 -Filter "*.puml"
$success4p1 = 0

foreach ($file in $pumlFiles4p1) {
    if (Download-PlantUMLImage -pumlFile $file.FullName -outputDir $dir4p1) {
        $success4p1++
    }
    Start-Sleep -Milliseconds 500  # Rate limiting
}

# Procesar diagramas C4
Write-Host "`n=== DIAGRAMAS C4 ===" -ForegroundColor Yellow
$pumlFilesC4 = Get-ChildItem -Path $dirC4 -Filter "*.puml"
$successC4 = 0

foreach ($file in $pumlFilesC4) {
    if (Download-PlantUMLImage -pumlFile $file.FullName -outputDir $dirC4) {
        $successC4++
    }
    Start-Sleep -Milliseconds 500  # Rate limiting
}

# Resumen
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "📊 RESUMEN" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   4+1: $success4p1/$($pumlFiles4p1.Count) imágenes generadas" -ForegroundColor White
Write-Host "   C4:  $successC4/$($pumlFilesC4.Count) imágenes generadas" -ForegroundColor White
Write-Host "   TOTAL: $($success4p1 + $successC4)/$($pumlFiles4p1.Count + $pumlFilesC4.Count) ✅`n" -ForegroundColor Green

Write-Host "🎨 Imágenes PNG guardadas junto a archivos .puml" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan
