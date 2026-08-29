@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
title Crear la carpeta del estudio
echo.
echo  Creando la carpeta del portal desde cero...
echo.
python crear_estudio.py %1
echo.
pause
