@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
title ESTUDIO - limpiar lo que no se usa
cd /d "%~dp0"
cls
python --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo   Falta Python. Sin el no se puede limpiar solo.
  echo   Bajalo de python.org/downloads y tilda "Add python.exe to PATH".
  echo.
  pause
  exit /b 1
)
python limpiar.py
echo.
pause
