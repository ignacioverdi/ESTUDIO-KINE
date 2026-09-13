#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Pone la fecha y hora de HOY como version, en todas las pantallas.

POR QUE EXISTE
--------------
El navegador guarda copias de los archivos para no bajarlos cada vez. Si
el nombre no cambia, sigue usando la copia vieja aunque el sitio se haya
actualizado.

Eso hizo que el kinesiologo viera durante dias un cartel de datos de
prueba que ya no existia, y pacientes de ejemplo ya borrados. Y del otro
lado yo probaba en el sitio publicado y veia todo bien, porque mi
navegador si habia bajado lo nuevo.

Ahora cada archivo se pide con la version pegada: js/datos.js?v=... Al
cambiar la version, el navegador lo ve como un archivo distinto y lo baja.

Lo corre PUBLICAR.bat solo, antes de publicar. No hay que acordarse.
"""

import io
import re
import glob
import os
from datetime import datetime

RAIZ = os.path.dirname(os.path.abspath(__file__))
os.chdir(RAIZ)

VERSION = datetime.now().strftime('%Y-%m-%d-%H%M')


def main():
    # 1. la constante que se muestra en pantalla
    p = 'js/base.js'
    s = io.open(p, encoding='utf-8').read()
    nuevo = re.sub(r"var VERSION_PORTAL = '[^']*';",
                   "var VERSION_PORTAL = '%s';" % VERSION, s, count=1)
    if nuevo != s:
        io.open(p, 'w', encoding='utf-8').write(nuevo)

    # 2. cada archivo pedido con la version pegada
    tocadas = 0
    for f in sorted(glob.glob('*.html')):
        s = io.open(f, encoding='utf-8').read()
        o = s
        s = re.sub(r'(src="js/[\w.-]+\.js)(\?v=[^"]*)?"',
                   r'\1?v=' + VERSION + '"', s)
        s = re.sub(r'(href="css/[\w.-]+\.css)(\?v=[^"]*)?"',
                   r'\1?v=' + VERSION + '"', s)
        if s != o:
            io.open(f, 'w', encoding='utf-8').write(s)
            tocadas += 1

    print('  Version %s en %d pantallas.' % (VERSION, tocadas))
    print('  Los navegadores van a bajar todo de nuevo al abrir.')


if __name__ == '__main__':
    main()
