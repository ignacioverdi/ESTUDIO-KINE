#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROBAR QR — genera codigos y los LEE con un lector independiente.

Un QR que se ve lindo pero no se lee es peor que no tener QR: el
paciente lo intenta, no pasa nada, y no vuelve a intentar. Por eso
no alcanza con mirarlo: hay que decodificarlo.

Necesita:  pip install playwright opencv-python-headless
           playwright install chromium
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
from playwright.sync_api import sync_playwright
import pathlib, cv2, io as _io

PRUEBAS = [
 'https://estudio-kine.vercel.app/alta.html',
 'https://estudio-kine.vercel.app/alta.html?ref=cartel',
 'https://estudio.club-atletico.com.ar/alta.html',
 'HOLA',
 'https://ejemplo.com/una/direccion/bastante/mas/larga/para/forzar/una/version/mayor/del/codigo.html',
]
qr = _io.open('js/qr.js', encoding='utf-8').read()

with sync_playwright() as pw:
    b = pw.chromium.launch(); pg = b.new_page(viewport={'width':900,'height':900})
    pg.set_content('<body style="margin:0;background:#fff"><div id="x"></div></body>')
    pg.add_script_tag(content=qr)
    det = cv2.QRCodeDetector()
    ok = 0
    for t in PRUEBAS:
        pg.evaluate("t => document.getElementById('x').innerHTML = "
                    "'<div style=\"width:800px;padding:20px;background:#fff\">' + qrSVG(t) + '</div>'", t)
        pg.wait_for_timeout(250)
        pg.locator('#x').screenshot(path='/tmp/qr.png')
        img = cv2.imread('/tmp/qr.png')
        leido, _, _ = det.detectAndDecode(img)
        bien = (leido == t)
        ok += bien
        print(('  LEE OK ' if bien else '  FALLA  '), t[:52].ljust(54),
              '' if bien else '-> leyo: ' + repr(leido)[:40])
    print('\n%d de %d' % (ok, len(PRUEBAS)))
    b.close()
