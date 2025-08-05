# Script para corregir TODAS las importaciones con alias
Write-Host "🔧 Corrigiendo todas las importaciones con alias..." -ForegroundColor Green

# Obtener todos los archivos TypeScript
$files = Get-ChildItem -Path "src" -Recurse -Filter "*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    Write-Host "📁 Procesando: $($file.FullName)" -ForegroundColor Yellow
    
    # Reemplazar todas las importaciones con alias
    $content = $content -replace "from '@/database/config'", "from '../database/config'"
    $content = $content -replace "from '@/models/", "from '../models/"
    $content = $content -replace "from '@/controllers/", "from '../controllers/"
    $content = $content -replace "from '@/middleware/", "from '../middleware/"
    $content = $content -replace "from '@/utils/", "from '../utils/"
    $content = $content -replace "from '@/types'", "from '../types'"
    $content = $content -replace "from '@/types/", "from '../types/"
    
    # Ajustar rutas relativas según la ubicación del archivo
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\src\", "").Replace("\", "/")
    $fileDir = Split-Path $relativePath -Parent
    
    if ($fileDir -ne "") {
        $levels = ($fileDir -split "/").Length
        $upLevels = "../" * $levels
        
        # Corregir rutas para archivos en subdirectorios
        if ($levels -eq 1) {
            # Archivos en controllers/, routes/, middleware/, etc.
            $content = $content -replace "from '\.\./database/config'", "from '../database/config'"
            $content = $content -replace "from '\.\./models/", "from '../models/"
            $content = $content -replace "from '\.\./controllers/", "from '../controllers/"
            $content = $content -replace "from '\.\./middleware/", "from '../middleware/"
            $content = $content -replace "from '\.\./utils/", "from '../utils/"
            $content = $content -replace "from '\.\./types'", "from '../types'"
        }
    }
    
    # Solo escribir si hubo cambios
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "  ✅ Actualizado" -ForegroundColor Green
    } else {
        Write-Host "  ➖ Sin cambios" -ForegroundColor Gray
    }
}

Write-Host "🎉 ¡Corrección completada!" -ForegroundColor Green
