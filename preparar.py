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


def huella_actual(archivos, extra=''):
    """Una sola firma de todo lo que el sw entrega, mas la logica del
       propio sw. Si cambia un byte de cualquiera, cambia la firma."""
    h = hashlib.sha1()
    for a in sorted(archivos):
        if os.path.exists(a):
            h.update(io.open(a, 'rb').read())
    h.update(extra.encode('utf-8'))
    return h.hexdigest()[:12]


def actualizar_version():
    sw = io.open('sw.js', encoding='utf-8').read()

    archivos = re.findall(r"^\s*'([^']+)',?\s*$", sw, re.M)

    # El propio sw.js tambien cuenta. Si cambia SU LOGICA (no solo los
    # archivos que guarda), la version tiene que subir igual: si no, el
    # navegador se queda con el service worker viejo para siempre.
    # Ya paso una vez: un sw roto dejaba el portal sin abrir en iPhone.
    # Se le sacan las lineas de VERSION y de huella para no morderse la cola.
    propio = re.sub(r"var VERSION = '[^']*';", '', sw)
    propio = re.sub(r'/\* huella: [a-f0-9]+ \*/', '', propio)

    nueva = huella_actual(archivos, propio)

    m = re.search(r'/\* huella: ([a-f0-9]+) \*/', sw)
    vieja = m.group(1) if m else None

    if vieja == nueva:
        print('  Nada cambió. sw.js queda como está.')
        return False

    mv = re.search(r"var VERSION = 'estudio-v(\d+)';", sw)
    n = int(mv.group(1)) + 1
    sw = sw.replace(mv.group(0), "var VERSION = 'estudio-v%d';" % n)

    marca = '/* huella: %s */' % nueva
    sw = re.sub(r'/\* huella: [a-f0-9]+ \*/', marca, sw) if m else sw.rstrip() + '\n\n' + marca + '\n'

    io.open('sw.js', 'w', encoding='utf-8').write(sw)
    print('  Cambiaron archivos. sw.js pasa a la version %d.' % n)
    print('  (esto es lo que hace que el navegador muestre lo nuevo)')
    return True


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
