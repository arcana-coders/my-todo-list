$WshShell = New-Object -comObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut("$env:USERPROFILE\Desktop\Mi Productividad.lnk")
$Shortcut.TargetPath = "d:\tecnomata-apps\todolist2\Mi-Productividad.bat"
$Shortcut.WorkingDirectory = "d:\tecnomata-apps\todolist2"
$Shortcut.Save()