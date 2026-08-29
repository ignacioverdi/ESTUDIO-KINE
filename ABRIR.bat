@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
title ESTUDIO
cd /d "%~dp0"
rem ══════════════════════════════════════════════════════════════════
rem  ABRIR — el de todos los dias.
rem
rem  Prepara el proyecto, abre el portal y se cierra solo.
rem  Si algo esta ROTO, y solo entonces, se queda abierto para avisarte.
rem  Si no hay Python, abre igual: el portal no lo necesita para andar.
rem ══════════════════════════════════════════════════════════════════

python --version >nul 2>&1
if errorlevel 1 (
  start "" "index.html"
  exit
)

python preparar.py > .ultimo_chequeo.txt 2>&1
if errorlevel 1 (
  cls
  echo.
  echo  ═══════════════════════════════════════════════════════════
  echo   OJO: hay algo ROTO. El portal se abre igual, pero conviene
  echo   arreglarlo antes de publicar.
  echo  ═══════════════════════════════════════════════════════════
  echo.
  type .ultimo_chequeo.txt
  echo.
  start "" "index.html"
  pause
  exit
)

start "" "index.html"
exit
