# Script para corregir las importaciones con alias en el backend
$backendPath = "src"

Write-Host "Corrigiendo importaciones con alias..." -ForegroundColor Green

# Función para obtener la ruta relativa correcta
function Get-RelativePath {
    param($fromFile, $toPath)
    
    $fromDir = Split-Path $fromFile -Parent
    $levels = ($fromDir -split "\\").Length - 1
    
    if ($levels -eq 0) {
        return "./$toPath"
    } else {
        $upLevels = "../" * $levels
        return "$upLevels$toPath"
    }
}

# Obtener todos los archivos TypeScript
$files = Get-ChildItem -Path $backendPath -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    Write-Host "Procesando: $($file.Name)" -ForegroundColor Yellow
    
    # Calcular rutas relativas basadas en la ubicación del archivo
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\src\", "").Replace("\", "/")
    $fileDir = Split-Path $relativePath -Parent
    
    if ($fileDir -eq "") {
        $levelsUp = ""
    } else {
        $levels = ($fileDir -split "/").Length
        $levelsUp = "../" * $levels
    }
    
    # Reemplazar alias comunes
    $content = $content -replace "from '@/database/config'", "from '${levelsUp}database/config'"
    $content = $content -replace "from '@/models/", "from '${levelsUp}models/"
    $content = $content -replace "from '@/controllers/", "from '${levelsUp}controllers/"
    $content = $content -replace "from '@/middleware/", "from '${levelsUp}middleware/"
    $content = $content -replace "from '@/utils/", "from '${levelsUp}utils/"
    $content = $content -replace "from '@/types'", "from '${levelsUp}types'"
    $content = $content -replace "from '@/types/", "from '${levelsUp}types/"
    
    # Solo escribir si hubo cambios
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✓ Actualizado" -ForegroundColor Green
    } else {
        Write-Host "  - Sin cambios" -ForegroundColor Gray
    }
}

Write-Host "¡Corrección completada!" -ForegroundColor Green
