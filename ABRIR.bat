@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
title ESTUDIO
cd /d "%~dp0"
rem ══════════════════════════════════════════════════════════════════
rem  ABRIR — el de todos los dias.
rem  Revisa el proyecto, abre el portal y se cierra solo.
rem  Se queda abierto UNICAMENTE si encuentra algo roto.
rem ══════════════════════════════════════════════════════════════════
python --version >nul 2>&1
if errorlevel 1 (
  start "" "index.html"
  exit
)
python auditar.py > .ultimo_chequeo.txt 2>&1
if errorlevel 1 (
  cls
  echo.
  echo  ═══════════════════════════════════════════════════════════
  echo   OJO: hay algo ROTO. El portal se abre igual.
  echo  ═══════════════════════════════════════════════════════════
  type .ultimo_chequeo.txt
  start "" "index.html"
  pause
  exit
)
start "" "index.html"
exit
