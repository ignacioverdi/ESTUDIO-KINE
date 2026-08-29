@echo off
chcp 65001 >nul
setlocal
title ESTUDIO - acceso directo en el escritorio
cd /d "%~dp0"
cls
echo.
echo  ═══════════════════════════════════════════════════════════
echo   ACCESO DIRECTO PARA EL KINESIOLOGO
echo  ═══════════════════════════════════════════════════════════
echo.
echo  Esto le deja un icono en el escritorio que abre el portal
echo  publicado. El no necesita esta carpeta ni ningun .bat:
echo  solo el icono.
echo.
set /p SITIO="  Direccion del portal (enter para estudio-kine.vercel.app): "
if "%SITIO%"=="" set SITIO=https://estudio-kine.vercel.app
echo.
set ATAJO=%USERPROFILE%\Desktop\Estudio de Kinesiologia.url
(
echo [InternetShortcut]
echo URL=%SITIO%
echo IconIndex=0
) > "%ATAJO%"
echo  Listo. Icono creado en el escritorio.
echo.
echo  ── PARA QUE QUEDE COMO UNA APP DE VERDAD ──────────────────
echo.
echo  En la computadora:
echo    Abri el portal en Chrome, tocá los tres puntitos de
echo    arriba a la derecha, y elegi "Instalar".
echo.
echo  En Android:
echo    Aparece un cartel solo. Si no, menu y "Instalar app".
echo.
echo  En iPhone:
echo    Boton de Compartir y "Agregar a inicio".
echo.
echo  Instalado abre sin barra de navegador, entra desde el icono
echo  y funciona sin internet.
echo.
pause
