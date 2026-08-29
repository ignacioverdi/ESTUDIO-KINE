@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion
title ESTUDIO - empezar a trabajar
cd /d "%~dp0"
cls
echo.
echo  ═══════════════════════════════════════════════════════════
echo   ESTUDIO - Kinesiologia del club
echo  ═══════════════════════════════════════════════════════════
echo.
echo  Un solo clic. Esto revisa la maquina, prepara el proyecto
echo  y te abre el portal en el navegador.
echo.

echo  ── REVISANDO LA MAQUINA ───────────────────────────────────
python --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo   [ FRENA ]  No hay Python.
  echo.
  echo   Te abro la pagina de descarga.
  echo   AL INSTALAR, TILDA "Add python.exe to PATH".
  echo   Esta abajo de todo en la primera pantalla y es
  echo   facilisimo pasarla por alto. Sin eso no anda nada.
  echo.
  echo   Cuando termines, volve a hacer doble clic aca.
  echo.
  start "" https://www.python.org/downloads/
  pause
  exit /b 1
)
for /f "tokens=*" %%v in ('python --version 2^>^&1') do echo    ok  %%v

git --version >nul 2>&1
if errorlevel 1 (
  echo    aviso  Sin Git. El portal anda igual, pero no vas a poder publicar.
  echo           Bajalo de git-scm.com/download/win cuando puedas.
) else (
  for /f "tokens=*" %%v in ('git --version 2^>^&1') do echo    ok  %%v
  rem Git recien instalado no sabe quien sos y el primer commit falla
  rem con un error que no dice eso. Lo resolvemos aca, una sola vez.
  set NOMBRE=
  for /f "tokens=*" %%n in ('git config --global user.name 2^>nul') do set NOMBRE=%%n
  if "!NOMBRE!"=="" (
    echo.
    echo    Git todavia no sabe quien sos. Se configura una sola vez.
    set /p NN="   Tu nombre y apellido: "
    set /p EE="   Tu correo: "
    git config --global user.name "!NN!"
    git config --global user.email "!EE!"
    echo    ok  Listo, no te lo vuelve a preguntar.
  ) else (
    echo    ok  Git te conoce como !NOMBRE!
  )
)

echo.
echo  ── PREPARANDO EL PROYECTO ─────────────────────────────────
python preparar.py
set RESULTADO=%errorlevel%
if %RESULTADO% neq 0 (
  echo.
  echo  ═══════════════════════════════════════════════════════════
  echo   OJO: la auditoria encontro algo ROTO. Esta arriba.
  echo   El portal se abre igual, pero conviene arreglarlo antes
  echo   de publicar.
  echo  ═══════════════════════════════════════════════════════════
  echo.
  pause
)

echo.
echo  ── ABRIENDO EL PORTAL ─────────────────────────────────────
echo.
echo   http://localhost:8080
echo.
echo   Dejá esta ventana abierta mientras trabajas.
echo   Para cortar: Ctrl+C, o cerrá la ventana.
echo.
timeout /t 2 >nul
start "" http://localhost:8080/index.html
python -m http.server 8080
