#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PREPARAR — deja el proyecto listo, sin que haya que acordarse de nada.

Hace tres cosas en orden:

  1. Sube el número de VERSION de sw.js SI Y SOLO SI cambió algún archivo.
     Este es el paso que más se olvida y el que más tiempo hace perder:
     sin subirlo, el navegador sigue mostrando la copia guardada y uno
     jura que el cambio no se aplicó. Ahora se hace solo.

  2. Regenera ESTUDIO.html, el archivo único.

  3. Corre la auditoría.

Lo llaman EMPEZAR.bat y PUBLICAR.bat. No hace falta correrlo a mano.
Devuelve 0 si está todo bien, 1 si la auditoría encontró algo roto.
"""

# ── Windows y los acentos ─────────────────────────────────────────────
# Cuando la salida va a un archivo en vez de a la pantalla, Windows usa
# una codificacion vieja (cp1252) que no sabe escribir acentos ni las
# lineas de los recuadros, y el script se cae con UnicodeEncodeError.
# Esto lo fuerza a UTF-8 siempre. Sin esto, ABRIR.bat falla en Windows.
import sys as _sys
for _f in (_sys.stdout, _sys.stderr):
    try:
        if _f and getattr(_f, 'encoding', '') and _f.encoding.lower() not in ('utf-8', 'utf8'):
            _f.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import hashlib, io, re, subprocess, sys, os


def actualizar_version():
    """Ya no hace falta.

    Antes esto subia un numero de version en sw.js cada vez que cambiaba
    un archivo, para obligar al navegador a soltar la copia guardada. El
    service worker ya no guarda nada, asi que no hay copia vieja posible:
    el navegador siempre trae lo ultimo.

    Era el paso que mas tiempo hacia perder de todo el proyecto.
    """
    print('  El portal no guarda copias: siempre se ve lo ultimo.')
    return False


def main():
    print('')
    print('  ── 1. VERSION ─────────────────────────────────────────────')
    actualizar_version()

    print('')
    print('  ── 2. ARCHIVO UNICO ───────────────────────────────────────')
    r = subprocess.run([sys.executable, 'armar_demo.py'], capture_output=True, text=True)
    if r.returncode:
        print('  FALLO al armar ESTUDIO.html:')
        print(r.stderr[-900:])
        return 1
    print('  ' + r.stdout.strip())

    print('')
    print('  ── 3. AUDITORIA ───────────────────────────────────────────')
    r = subprocess.run([sys.executable, 'auditar.py'], capture_output=True, text=True)
    print(r.stdout.rstrip())
    return r.returncode


if __name__ == '__main__':
    sys.exit(main())
