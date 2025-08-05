# Script para copiar el logo oficial
$sourcePath = "C:\Users\raulc\Documents\Proyecto YCC Extintores\Diseño\Paleta de colores\Logos\Countryclub-500x500px logo - icono blanco.png"
$destPath = "C:\Users\raulc\Documents\Proyecto YCC Extintores\fireguardian-app\frontend\src\assets\images\logo.png"

# Verificar si el archivo de origen existe
if (Test-Path $sourcePath) {
    # Copiar el archivo
    Copy-Item -Path $sourcePath -Destination $destPath -Force
    Write-Host "Logo copiado exitosamente"
} else {
    Write-Host "Error: No se encontró el archivo de origen"
}
