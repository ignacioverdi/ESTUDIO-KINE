@echo off
chcp 65001 >nul
set PYTHONIOENCODING=utf-8
set PYTHONUTF8=1
setlocal enabledelayedexpansion
title ESTUDIO - publicar
cd /d "%~dp0"
cls
echo.
echo  ═══════════════════════════════════════════════════════════
echo   PUBLICAR - sube los cambios y los deja en internet
echo  ═══════════════════════════════════════════════════════════

git --version >nul 2>&1
if errorlevel 1 (
  echo.
  echo   [ FRENA ]  Sin Git no se puede publicar.
  echo   Te abro la pagina de descarga.
  start "" https://git-scm.com/download/win
  pause
  exit /b 1
)

echo.
echo  ── PREPARANDO ─────────────────────────────────────────────
python auditar.py
if %errorlevel% neq 0 (
  echo.
  echo  ═══════════════════════════════════════════════════════════
  echo   FRENO: hay algo ROTO. Esta arriba de todo.
  echo   No conviene publicar asi. Arreglalo y volve a intentar.
  echo  ═══════════════════════════════════════════════════════════
  echo.
  pause
  exit /b 1
)

rem Primera vez: conectar con GitHub sin salir de aca
if not exist ".git" (
  echo.
  echo  ── PRIMERA VEZ: CONECTAR CON GITHUB ───────────────────────
  echo.
  echo   Antes de seguir, crea el repositorio en github.com:
  echo     New repository / nombre: ESTUDIO_KINE
  echo     Visibilidad: PRIVATE  ^(aca no hay discusion^)
  echo     NO tildes README ni .gitignore: el kit ya los trae.
  echo.
  set /p URL="   Pega la URL del repo (https://github.com/...): "
  if "!URL!"=="" (echo   Cancelado. & pause & exit /b 1)
  git init
  git branch -M main
  git remote add origin "!URL!"
  echo   ok  Conectado.
)

echo.
echo  ── ESTO ES LO QUE SE VA A SUBIR ───────────────────────────
echo.
git status --short
echo.
echo  ───────────────────────────────────────────────────────────
echo   MIRA LA LISTA CON ATENCION.
echo   Si aparece algo con nombre de paciente, diagnostico o
echo   cualquier dato clinico: CERRA ESTA VENTANA AHORA.
echo   Una vez subido no se puede borrar del historial.
echo  ───────────────────────────────────────────────────────────
echo.
set /p ok="   Esta todo bien? Escribi SI para subir: "
if /i not "!ok!"=="SI" (
  echo.
  echo   Cancelado. No se subio nada.
  pause
  exit /b
)

echo.
set /p msg="   Que cambiaste? (una linea): "
if "!msg!"=="" set msg=cambios
git add .
git commit -m "!msg!"
git push -u origin main
if errorlevel 1 (
  echo.
  echo   Fallo al subir. Lo mas comun:
  echo     - GitHub ya no acepta la contraseña normal: hace falta
  echo       un token. Ver INSTALAR.md, paso 7.
  echo     - El repo todavia no existe en github.com
  echo.
  pause
  exit /b 1
)

echo.
echo  ═══════════════════════════════════════════════════════════
echo   SUBIDO A GITHUB.
echo  ═══════════════════════════════════════════════════════════
echo.
echo   FALTA UN PASO Y ES IMPORTANTE.
echo.
echo   Que GitHub lo reciba NO significa que el sitio se actualice.
echo   Vercel puede rechazar la publicacion y seguir mostrando la
echo   version vieja sin avisar nada. Ya paso: cinco horas publicando
echo   sin que cambiara nada.
echo.
echo   Te abro la pagina donde se ve. Fijate el de arriba de todo:
echo.
echo     Ready  = listo, el sitio ya tiene lo nuevo
echo     Error  = NO se publico. Tocalo y mira el motivo.
echo.
timeout /t 3 >nul
start "" https://vercel.com/ignacio-verdi-s-projects/estudio-kine/deployments
echo.
pause
