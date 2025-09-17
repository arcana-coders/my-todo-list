# Script para crear acceso directo sin consola
$escritorio = [Environment]::GetFolderPath('Desktop')
$rutaAccesoDirecto = Join-Path $escritorio "Mi Productividad (Sin Consola).lnk"
$rutaAplicacion = Join-Path $PSScriptRoot "Mi-Productividad-SinConsola.bat"

$shell = New-Object -ComObject WScript.Shell
$accesoDirecto = $shell.CreateShortcut($rutaAccesoDirecto)
$accesoDirecto.TargetPath = $rutaAplicacion
$accesoDirecto.WorkingDirectory = $PSScriptRoot
$accesoDirecto.Description = "Mi Productividad - Gestión de Tareas (Sin Consola)"
$accesoDirecto.WindowStyle = 7  # Minimizada
$accesoDirecto.Save()

Write-Host "Acceso directo creado en el escritorio: Mi Productividad (Sin Consola)" -ForegroundColor Green
Write-Host "Este acceso directo ejecutará la aplicación sin mostrar la consola." -ForegroundColor Green