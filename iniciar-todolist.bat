@echo off
cd /d "d:\tecnomata-apps\todolist2"
echo Iniciando TodoList...
echo Abriendo en http://localhost:3000
start http://localhost:3000
python -m http.server 3000
pause