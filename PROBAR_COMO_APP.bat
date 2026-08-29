@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
title ESTUDIO - probar como app instalada
cd /d "%~dp0"
cls
echo.
echo  ═══════════════════════════════════════════════════════════
echo   PROBAR COMO APP
echo  ═══════════════════════════════════════════════════════════
echo.
echo  Esto NO hace falta para trabajar. Para eso alcanza con
echo  ABRIR.bat, que no deja ninguna ventana abierta.
echo.
echo  Esto sirve solo para probar tres cosas que el navegador no
echo  permite abriendo el archivo directo:
echo.
echo    - que funcione sin internet
echo    - que se pueda instalar como app en el celular
echo    - los avisos push
echo.
echo  Mientras esta ventana este abierta, el portal vive en
echo  http://localhost:8080
echo.
echo  Para cortar: Ctrl+C o cerra la ventana.
echo.
python preparar.py
echo.
timeout /t 2 >nul
start "" http://localhost:8080/index.html
python -m http.server 8080
