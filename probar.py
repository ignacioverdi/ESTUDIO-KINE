#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROBAR — las tres pruebas que encontraron errores de verdad.

Antes esto eran tres archivos sueltos y uno se olvidaba de correrlos.
Ahora es uno:

  1. PANTALLAS  abre el portal en celular y monitor. Busca cosas que se
                salen por el costado y botones de menos de 44px, que es
                el minimo con el que un dedo acierta.
  2. QR         genera codigos y los LEE con un lector. Un QR que se ve
                lindo pero no se lee es peor que no tener QR.
  3. CLICS      toca botones de verdad, no llama funciones. Asi se
                descubrio que ningun onclick funcionaba.

    python probar.py

Necesita:  pip install playwright opencv-python-headless
           playwright install chromium
"""

import sys as _sys
for _f in (_sys.stdout, _sys.stderr):
    try:
        if _f and getattr(_f, 'encoding', '') and _f.encoding.lower() not in ('utf-8', 'utf8'):
            _f.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

import http.server, socketserver, threading, os, pathlib, glob, re

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print('Falta playwright.  pip install playwright && playwright install chromium')
    _sys.exit(0)

RAIZ = pathlib.Path(__file__).parent.resolve()
os.chdir(RAIZ)

PANTALLAS = sorted(os.path.basename(f) for f in glob.glob('*.html'))
VISTAS = [('celular', 390, 844, True), ('monitor', 1400, 900, False)]

MEDIR = """(MIN) => {
  const r = [], ancho = document.documentElement.clientWidth;
  document.querySelectorAll('*').forEach(e => {
    const b = e.getBoundingClientRect();
    if (b.width > 0 && b.right > ancho + 2)
      r.push('se sale ' + Math.round(b.right - ancho) + 'px: ' + (e.className || e.tagName));
  });
  document.querySelectorAll('button,a,input,select,.pest').forEach(e => {
    // Si vive dentro de algo que ya se toca entero (una etiqueta o una
    // fila con accion), el area real es la del padre, no la suya. Marcarlo
    // igual es avisar de mentira, y un aviso falso hace que se dejen de leer.
    if (e.closest('label')) return;
    const p = e.closest('.fila,.at,.ej,button');
    if (p && p !== e && p.getBoundingClientRect().height >= MIN) return;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const b = e.getBoundingClientRect();
    if (b.width > 0 && b.height > 0 && b.height < MIN - 1)
      r.push('chico ' + Math.round(b.height) + 'px: "' + (e.textContent || '').trim().slice(0, 18) + '"');
  });
  return r;
}"""


def servidor():
    """Un servidor local: hace falta para que el navegador cargue los
       archivos hermanos como lo hace Vercel."""
    class Silencio(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.TCPServer.allow_reuse_address = True
    s = socketserver.TCPServer(('127.0.0.1', 0), Silencio)
    threading.Thread(target=s.serve_forever, daemon=True).start()
    return s, s.server_address[1]


def main():
    srv, puerto = servidor()
    base = 'http://127.0.0.1:%d/' % puerto
    problemas = []

    with sync_playwright() as pw:
        b = pw.chromium.launch()

        print('\n  1. PANTALLAS')
        for nom, w, h, tac in VISTAS:
            pg = b.new_page(viewport={'width': w, 'height': h}, has_touch=tac, is_mobile=tac)
            errs = []
            pg.on('pageerror', lambda e: errs.append(str(e)))
            hallazgos = set()
            for p in PANTALLAS:
                pg.goto(base + p)
                pg.wait_for_timeout(500)
                for x in pg.evaluate(MEDIR, 44 if tac else 30):
                    hallazgos.add(p + ' — ' + x)
            print('     %-8s %d pantallas, %d cosas para mirar, %d errores'
                  % (nom, len(PANTALLAS), len(hallazgos), len(errs)))
            for x in sorted(hallazgos)[:6]:
                print('        ' + x)
            if errs:
                problemas += ['%s: %s' % (nom, e) for e in errs[:3]]
            pg.close()

        print('\n  1b. EL MENU DEL CELULAR')
        pg = b.new_page(viewport={'width':390,'height':844}, has_touch=True, is_mobile=True)
        pg.goto(base + 'index.html'); pg.wait_for_timeout(700)
        pg.evaluate("ponerRol('kine')")
        pg.goto(base + 'panel.html'); pg.wait_for_timeout(1000)
        # No alcanza con que exista: tiene que verse SIN bajar la pagina.
        # Estuvo al final del documento y nadie se dio cuenta.
        y = pg.evaluate("(function(e){return e?Math.round(e.getBoundingClientRect().top):99999})"
                        "(document.querySelector('.menu-movil'))")
        arriba = y < 400
        print('     el menu se ve sin bajar   :', arriba, '(a %d px)' % y)
        if not arriba:
            problemas.append('el menu del celular no se ve sin bajar la pagina')
        pg.evaluate("if(typeof abrirMenu==='function') abrirMenu()"); pg.wait_for_timeout(400)
        n_sec = pg.evaluate("document.querySelectorAll('#menuLista a').length")
        print('     abre con                  :', n_sec, 'secciones')
        if n_sec < 5:
            problemas.append('el menu del celular no abre la lista')
        pg.close()

        print('\n  1c. CONFIGURACION DE IPHONE')
        import json as _json
        m = _json.loads(open('manifest.json', encoding='utf-8').read())
        tema = open('css/tema.css', encoding='utf-8').read()
        fondo = re.search(r'--fondo:\s*(#[0-9A-Fa-f]{6})', tema)
        fondo = fondo.group(1).upper() if fondo else '?'
        faltantes = []
        for p2 in PANTALLAS:
            h = open(p2, encoding='utf-8').read()
            if 'PANTALLA PUBLICA' in h:   # suelta a proposito, no lleva nada
                continue
            for etiqueta in ['apple-touch-icon', 'apple-mobile-web-app-capable',
                             'apple-mobile-web-app-title', 'viewport-fit=cover']:
                if etiqueta not in h:
                    faltantes.append('%s: falta %s' % (p2, etiqueta))
        print('     etiquetas de iOS          :', 'todas' if not faltantes else '%d faltan' % len(faltantes))
        # Si el manifiesto no coincide con el tema, al abrir la app instalada
        # parpadea una pantalla de otro color antes de cargar.
        coincide = m.get('background_color', '').upper() == fondo
        print('     el color de arranque      :', 'coincide con el tema' if coincide else 'NO coincide')
        if faltantes:
            problemas += faltantes[:3]
        if not coincide:
            problemas.append('manifest.json arranca en %s pero el tema es %s'
                             % (m.get('background_color'), fondo))

        print('\n  1d. USARLA CON EL DEDO')
        # Tocar de verdad, no llamar funciones. Asi se descubrio que el
        # turno del panel no abria nada y no avisaba: fallaba en silencio.
        for ap in ['iPhone SE', 'iPhone 14 Pro']:
            ctx = b.new_context(**pw.devices[ap])
            pg = ctx.new_page()
            e2 = []
            pg.on('pageerror', lambda x: e2.append(str(x)))
            pg.goto(base + 'index.html'); pg.wait_for_timeout(700)
            pg.evaluate("ponerRol('kine')")
            pg.goto(base + 'panel.html'); pg.wait_for_timeout(900)

            pg.tap('.menu-bt'); pg.wait_for_timeout(350)
            abre = pg.evaluate("!!document.querySelector('#menuLista.abierto')")
            pg.evaluate("abrirMenu()")

            try:
                pg.tap('#turnos button.fila[onclick*=atender]'); pg.wait_for_timeout(600)
                atiende = pg.evaluate("!!document.getElementById('cajaAtender')")
                entra = pg.evaluate("!document.getElementById('cajaAtender') || "
                    "document.querySelector('#cajaAtender .ayuda-caja').getBoundingClientRect().width "
                    "<= window.innerWidth")
                pg.evaluate("cerrarAtender()")
            except Exception:
                atiende, entra = False, False

            sale = pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
            print('     %-14s menu:%s  atender:%s  entra:%s  errores:%d'
                  % (ap, abre, atiende, entra, len(e2)))
            if not abre:    problemas.append('%s: el menu no abre' % ap)
            if not atiende: problemas.append('%s: tocar el turno no abre la atencion' % ap)
            if not entra:   problemas.append('%s: el formulario se sale de la pantalla' % ap)
            if sale:        problemas.append('%s: la pagina se desborda' % ap)
            problemas += ['%s: %s' % (ap, x) for x in e2[:2]]
            ctx.close()

        print('\n  1e. LO NUEVO: MENSAJES, TURNOS Y ALERTAS')
        ctx = b.new_context(**pw.devices['iPhone 14 Pro'])
        pg = ctx.new_page()
        e3 = []
        pg.on('pageerror', lambda x: e3.append(str(x)))
        pg.goto(base + 'index.html'); pg.wait_for_timeout(500)
        pg.evaluate("localStorage.clear()")      # arrancar limpio: el portal recuerda
        pg.goto(base + 'index.html'); pg.wait_for_timeout(500)
        pg.evaluate("ponerRol('jugador'); ponerDorsal(7); localStorage.setItem('estudio_pid','P07')")
        pg.goto(base + 'mi.html'); pg.wait_for_timeout(1000)

        pg.evaluate("consultar(1)"); pg.wait_for_timeout(500)
        cuerpo = pg.evaluate("(document.getElementById('cuerpoMsj')||{}).textContent||''")
        anclado = 'Sobre el ejercicio' in cuerpo
        guardia = 'no es una guardia' in cuerpo.lower()
        pg.evaluate("document.getElementById('txtMsj').value='me tira atras'; enviarMensaje('P07')")
        pg.wait_for_timeout(400)
        guardo = pg.evaluate("mensajesDe('P07').length") == 1
        pg.evaluate("cerrarConversacion()")

        pg.evaluate("confirmarTurno()"); pg.wait_for_timeout(400)
        confirmo = pg.evaluate("(function(){var r=false;Object.keys(BASE.agenda).forEach("
                               "function(d){BASE.agenda[d].forEach(function(t){"
                               "if(t.pid===miPid()&&t.confirmado)r=true;});});return r;})()")

        pg.evaluate("ponerRol('kine')")
        pg.goto(base + 'panel.html'); pg.wait_for_timeout(900)
        n_al = pg.evaluate("alertas().length")
        avisa = pg.evaluate("alertas().some(function(a){return a.que.indexOf('no le respondiste')>=0})")
        con_accion = pg.evaluate("alertas().every(function(a){return !!a.hacer})")
        # el portal tiene que recordar entre pantallas, si no nada de esto sirve
        recuerda = pg.evaluate("mensajesDe('P07').length") == 1

        print('     mensaje anclado al ejercicio :', anclado)
        print('     avisa que no es una guardia   :', guardia)
        print('     el mensaje se guarda          :', guardo)
        print('     recuerda al cambiar pantalla  :', recuerda)
        print('     el turno se puede confirmar   :', confirmo)
        print('     alertas en el panel           :', n_al, '(avisa del mensaje:', avisa, ')')
        for cond, txt in [(anclado,'el mensaje no queda anclado al ejercicio'),
                          (guardia,'falta el aviso de que no es una guardia'),
                          (guardo,'el mensaje no se guarda'),
                          (recuerda,'el portal no recuerda al cambiar de pantalla'),
                          (confirmo,'el turno no se puede confirmar'),
                          (n_al > 0,'el panel no muestra alertas'),
                          (avisa,'no avisa de los mensajes sin responder'),
                          (con_accion,'hay alertas que no dicen que hacer')]:
            if not cond: problemas.append(txt)
        problemas += e3[:2]
        ctx.close()

        print('\n  2. CODIGOS QR')
        try:
            import cv2
            pg = b.new_page(viewport={'width': 900, 'height': 900})
            pg.goto(base + 'cartel.html')
            pg.wait_for_timeout(1200)
            pg.locator('#cartel').screenshot(path='/tmp/_qr.png')
            leido, _, _ = cv2.QRCodeDetector().detectAndDecode(cv2.imread('/tmp/_qr.png'))
            esperado = pg.evaluate('URL_ALTA')
            ok = leido == esperado
            print('     %s  %s' % ('se lee bien' if ok else 'NO SE LEE', esperado))
            if not ok:
                problemas.append('el codigo QR del cartel no se lee')
            pg.close()
        except ImportError:
            print('     (salteado: falta opencv-python-headless)')

        print('\n  3. CLICS DE VERDAD')
        pg = b.new_page(viewport={'width': 1280, 'height': 1000})
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.goto(base + 'index.html')
        pg.wait_for_timeout(700)
        pg.evaluate("ponerRol('kine')")

        pg.goto(base + 'panel.html'); pg.wait_for_timeout(700)
        antes = pg.evaluate('BASE.lesiones[0].sesiones.length')
        pg.goto(base + 'lesiones.html?f=L1'); pg.wait_for_timeout(700)
        try:
            pg.get_by_role('button', name='Cargar sesión de hoy').click()
            pg.wait_for_timeout(500)
            abrio = pg.evaluate("!!document.getElementById('cajaSesion')")
        except Exception:
            abrio = False
        print('     el formulario de sesion abre :', abrio)
        if not abrio:
            problemas.append('el boton de cargar sesion no abre nada')

        pg.goto(base + 'pacientes.html'); pg.wait_for_timeout(700)
        try:
            pg.evaluate("abrir('P31')"); pg.wait_for_timeout(400)
            pg.get_by_role('button', name='Abrir una lesión').click()
            pg.wait_for_timeout(500)
            abrio2 = pg.evaluate("!!document.getElementById('cajaLesion')")
        except Exception:
            abrio2 = False
        print('     el alta de lesion abre       :', abrio2)
        if not abrio2:
            problemas.append('el boton de abrir lesion no abre nada')

        if errs:
            problemas += errs[:3]
        pg.close()
        b.close()
    srv.shutdown()

    print('\n  ' + '=' * 56)
    if problemas:
        print('  HAY %d PROBLEMAS:' % len(problemas))
        for x in problemas:
            print('    x ' + x)
    else:
        print('  Todo bien.')
    print('')
    return 1 if problemas else 0


if __name__ == '__main__':
    _sys.exit(main())
