# Script para ejecutar Mi Productividad sin consola
$electronPath = Join-Path $PSScriptRoot "node_modules\.bin\electron.cmd"
$mainPath = Join-Path $PSScriptRoot "electron-main.js"

# Ejecutar Electron sin mostrar ventana de consola
Start-Process -WindowStyle Hidden -FilePath $electronPath -ArgumentList $mainPath