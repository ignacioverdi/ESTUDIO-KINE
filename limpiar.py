#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
LIMPIAR — borra los archivos del proyecto que quedaron sin uso.

Cuando algo se reemplaza, el archivo viejo sigue en la carpeta: el zip
agrega y reemplaza, pero no borra. Con el tiempo quedan archivos que ya
no hacen nada y confunden.

COMO ESTA HECHO PARA QUE NO ROMPA NADA
--------------------------------------
No adivina. Tiene la lista escrita abajo, uno por uno, con el motivo por
el que ya no sirve y por que se reemplazo. Si un archivo no esta en esa
lista, no se toca ni aunque parezca sobrar.

Nunca toca: pantallas, estilos, codigo, datos, la carpeta .git, ni nada
que este dentro de css, js, img o videos.

Muestra la lista y espera confirmacion antes de borrar.
"""

import sys as _sys
for _f in (_sys.stdout, _sys.stderr):
    try:
        if _f and getattr(_f, 'encoding', '') and _f.encoding.lower() not in ('utf-8', 'utf8'):
            _f.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import os

# ══════════════════════════════════════════════════════════════════════
#  LO QUE SOBRA, Y POR QUE
#  Cada vez que algo se reemplaza, se suma una linea aca.
# ══════════════════════════════════════════════════════════════════════
SOBRAN = [
    ('ESTUDIO.html',
     'El archivo unico. Era una segunda aplicacion y de ahi salieron cinco errores.',
     'Se usa el portal publicado.'),
    ('armar_demo.py',
     'Generaba el archivo unico.',
     'No hay mas archivo unico.'),
    ('preparar.py',
     'Subia el numero de version del guardado sin internet y armaba el archivo unico.',
     'auditar.py'),
    ('EMPEZAR.bat',
     'Dejaba una ventana negra abierta todo el tiempo con un servidor local.',
     'ABRIR.bat, que se cierra solo.'),
    ('VER.bat',
     'Levantaba el servidor local.',
     'ABRIR.bat'),
    ('ARMAR.bat',
     'Regeneraba el archivo unico.',
     'No hace falta.'),
    ('AUDITAR.bat',
     'Corria el auditor por separado.',
     'Lo corren ABRIR.bat y PUBLICAR.bat solos.'),
    ('COMPROBAR.bat',
     'Revisaba si la maquina tenia Python y Git.',
     'ABRIR.bat lo revisa y avisa.'),
    ('PROBAR_COMO_APP.bat',
     'Servia para probar el guardado sin internet.',
     'Ya no hay guardado sin internet.'),
    ('CREAR_ESTUDIO.bat',
     'Generaba una carpeta vacia de ejemplo.',
     'No se uso nunca.'),
    ('crear_estudio.py',
     'Mantenia a mano la lista de todos los archivos del proyecto.',
     'auditar.py la deduce leyendo la carpeta.'),
    ('medir_pantallas.py',
     'Media el portal en celular y monitor.',
     'probar.py'),
    ('probar_qr.py',
     'Probaba que los codigos QR se leyeran.',
     'probar.py'),
    ('probar_sw.py',
     'Probaba el guardado sin internet contra redirecciones.',
     'Ya no hay guardado sin internet.'),
    ('ARMAR_DESDE_CERO.md',
     'Explicaba como armar la carpeta con crear_estudio.py.',
     'INSTALAR.md y LECCIONES.md'),
    ('.ultimo_chequeo.txt',
     'Archivo temporal que deja ABRIR.bat.',
     'Se vuelve a crear solo.'),
]

# Nunca, bajo ninguna circunstancia.
INTOCABLES = {'index.html', 'sw.js', 'manifest.json', 'config.json', 'vercel.json',
              '.gitattributes', '.gitignore',
              'auditar.py', 'probar.py', 'armar_pdf.py', 'manual_pdf.py', 'limpiar.py',
              'ABRIR.bat', 'PUBLICAR.bat', 'CREAR_ACCESO_DIRECTO.bat', 'LIMPIAR.bat'}


def main():
    aqui = os.path.dirname(os.path.abspath(__file__))
    os.chdir(aqui)

    hay = [(n, p, r) for n, p, r in SOBRAN
           if os.path.isfile(n) and n not in INTOCABLES]

    print('')
    print('  LIMPIAR EL PROYECTO')
    print('  ' + '=' * 62)
    print('')
    print('  Carpeta revisada:')
    print('     %s' % aqui)
    print('')

    # Un vistazo a lo que hay, para saber si esta es la carpeta correcta.
    import glob
    pantallas = len(glob.glob('*.html'))
    codigo    = len(glob.glob('js/*.js'))
    estilos   = len(glob.glob('css/*.css'))
    print('  Lo que hay adentro:')
    print('     %2d pantallas (.html)   %s' % (pantallas, 'OK' if pantallas >= 10 else '<-- POCAS'))
    print('     %2d archivos de codigo  %s' % (codigo, 'OK' if codigo >= 5 else '<-- POCOS'))
    print('     %2d hojas de estilo     %s' % (estilos, 'OK' if estilos >= 2 else '<-- POCAS'))
    print('')

    if pantallas < 10:
        print('  ' + '-' * 62)
        print('  OJO: esta carpeta no parece la del portal.')
        print('  Fijate si los archivos quedaron dentro de una subcarpeta,')
        print('  o si el proyecto de verdad esta en otro lado.')
        print('  ' + '-' * 62)
        print('')
        return 0

    if not hay:
        print('  No sobra nada: la carpeta esta limpia.')
        print('')
        print('  Si esperabas que borrara archivos viejos y no lo hizo, puede')
        print('  ser que el proyecto que usas este en OTRA carpeta. Comparala')
        print('  con la ruta de arriba.')
        print('')
        return 0

    print('')
    print('  Se van a borrar %d archivos. Ninguno se usa:' % len(hay))
    print('')
    for n, porque, reemplazo in hay:
        print('    %s' % n)
        print('       %s' % porque)
        print('       Ahora: %s' % reemplazo)
        print('')

    print('  ' + '-' * 62)
    print('  NO se tocan las pantallas, los estilos, el codigo, los datos,')
    print('  ni las carpetas css, js, img y videos.')
    print('  ' + '-' * 62)
    print('')

    try:
        r = input('  Escribi SI para borrarlos: ').strip().upper()
    except (EOFError, KeyboardInterrupt):
        r = ''
    if r != 'SI':
        print('')
        print('  Cancelado. No se borro nada.')
        print('')
        return 0

    print('')
    borrados = 0
    for n, _, _ in hay:
        try:
            os.remove(n)
            print('    borrado  %s' % n)
            borrados += 1
        except Exception as e:
            print('    NO se pudo borrar %s: %s' % (n, e))

    print('')
    print('  Listo: %d archivos menos.' % borrados)
    print('')
    print('  Si el proyecto esta en GitHub, corré PUBLICAR.bat para que')
    print('  tambien desaparezcan de ahi.')
    print('')
    return 0


if __name__ == '__main__':
    _sys.exit(main())
