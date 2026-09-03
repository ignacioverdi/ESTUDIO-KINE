#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""LOS DATOS LLEGAN TARDE — la prueba que faltaba.

Con internet de verdad, los datos de la base NO estan cuando la pantalla
se dibuja: llegan medio segundo despues. Todas las pruebas anteriores los
tenian al instante, y por eso nunca vieron este error:

    El paciente entraba, sus datos llegaban bien, y la pantalla le decia
    "Estás al día" como si no tuviera ninguna lesion. Sin ningun error a
    la vista: la pantalla mostraba lo que habia calculado ANTES de tener
    con que calcularlo.

Esta prueba demora las respuestas a proposito.

    python probar_demora.py
"""

from playwright.sync_api import sync_playwright
import http.server, socketserver, threading, os, json, time
os.chdir('/home/claude/kit')
class S(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),S)
threading.Thread(target=srv.serve_forever,daemon=True).start()
base='http://127.0.0.1:%d/' % srv.server_address[1]
UID='uid_pac'; HOY='2026-08-28'
f=[]
def ok(t,c,e=''):
    print('   %-50s %s %s' % (t,'ok' if c else 'FALLA', e))
    if not c: f.append(t)

BASEFB = {
 'kine/roles/uid_kine':'kine',
 'kine/pacientes/'+UID: {'id':UID,'nombre':'Lucia Test','doc':'35777888',
   'nacimiento':'1991-04-25','tel':'1','institucion':'Beyond','estado':'activo',
   'plan':'sesion','creditos':0,'alta':HOY,'tipo':'particular'},
 'kine/lesiones': {'LX1': {'id':'LX1','pid':UID,'zona':'Lumbar','lado':'—',
   'diagnostico':'Lumbalgia','mecanismo':'x','fecha':'2026-08-22','gravedad':1,'fase':2,
   'estado':'activa','alta':'2026-09-15','criterios':[{'t':'Sin dolor','ok':False}],'sesiones':[]}},
 'kine/programas': {'LX1': {'2': [{'n':'Perro-pájaro','series':3,'reps':'10','carga':'—'},
                                  {'n':'Puente','series':3,'reps':'15','carga':'—'},
                                  {'n':'Plancha','series':3,'reps':'30 seg','carga':'—'}]}},
 'kine/perfil': {'nombre':'Vero Ramírez'},
 'kine/horario': {'minutos':30,'semana':{'1':[{'abre':'08:30','cierra':'12:30'}]}},
}
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(**pw.devices['iPhone 14 Pro'])
    ctx.route('**identitytoolkit**', lambda r: r.fulfill(status=200,
        content_type='application/json', body=json.dumps({'idToken':'T','refreshToken':'R',
        'expiresIn':'3600','email':'35777888@estudio.app','localId':UID})))
    ctx.route('**securetoken**', lambda r: r.fulfill(status=200, content_type='application/json',
        body=json.dumps({'id_token':'T','refresh_token':'R','expires_in':'3600','user_id':UID})))
    def datos(route):
        ruta = route.request.url.split('.firebaseio.com/')[1].split('.json')[0]
        if route.request.method in ('PUT','DELETE'):
            route.fulfill(status=200, content_type='application/json', body='{}'); return
        if ruta == 'kine':
            route.fulfill(status=401, content_type='application/json', body='{}'); return
        # DEMORA A PROPOSITO: asi llegan DESPUES de que la pantalla dibujo,
        # que es exactamente lo que pasa con internet de verdad.
        time.sleep(0.6)
        d = BASEFB.get(ruta)
        if d is None:
            partes = ruta.split('/')
            for i in range(len(partes)-1, 0, -1):
                padre = BASEFB.get('/'.join(partes[:i]))
                if isinstance(padre, dict):
                    x = padre
                    for k in partes[i:]:
                        x = x.get(k) if isinstance(x, dict) else None
                        if x is None: break
                    if x is not None: d = x; break
        route.fulfill(status=200, content_type='application/json', body=json.dumps(d))
    ctx.route('**firebaseio.com**', datos)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))

    print('══ EL PACIENTE ENTRA Y LOS DATOS TARDAN ══')
    pg.goto(base+'index.html'); pg.wait_for_timeout(600)
    pg.evaluate("localStorage.clear()")
    pg.goto(base+'index.html'); pg.wait_for_timeout(900)
    pg.evaluate("""document.getElementById('pDoc').value='35777888';
                   document.getElementById('pNac').value='1991-04-25'; enviar();""")
    pg.wait_for_timeout(6000)
    ok('entra', 'mi.html' in pg.url)
    ok('VE SU LESION', pg.evaluate("(typeof L!=='undefined' && L) ? L.zona : 'ninguna'")=='Lumbar',
       '| ' + str(pg.evaluate("(typeof L!=='undefined' && L) ? L.zona : 'ninguna'")))
    ok('ve sus 3 ejercicios', pg.evaluate("(typeof L!=='undefined' && L) ? programaDe(L).length : 0")==3)
    ok('el titulo NO dice Estás al día',
       'Estás al día' not in pg.evaluate("(document.querySelector('h1.tit')||{}).textContent||''"))
    print('      titulo:', pg.evaluate("(document.querySelector('h1.tit')||{}).textContent||'-'"))
    print('      ejercicios:', pg.evaluate("(typeof L!=='undefined'&&L)?programaDe(L).map(function(e){return e.n}).join(', '):'-'"))
    ok('sin errores', not errs)
    if errs: print('      ', errs[:2])
    ctx.close(); b.close()
srv.shutdown()
print('\n'+'='*58); print('FALLAS:', len(f))
for x in f: print('  x', x)
