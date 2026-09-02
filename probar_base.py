#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PROBAR CON LA BASE — el caso que fallo de verdad.

El kinesiologo vacio los datos de ejemplo, cargo un paciente real, y el
paciente NO aparecia en ningun lado. Dos causas:

  1. Firebase devuelve los pacientes como lista con nombre ({P34:{...}})
     y el portal esperaba una fila ([{...}]). Al recibir el formato
     equivocado los ignoraba.

  2. La marca de "ya vacie" vivia en el navegador de quien la toco, asi
     que desde otro aparato volvian a aparecer los seis inventados.

Esto levanta una base de mentira con esos datos exactos y comprueba que
el paciente real aparezca y los inventados no.

    python probar_base.py
"""

import sys as _sys
for _f in (_sys.stdout, _sys.stderr):
    try:
        if _f and getattr(_f, 'encoding', '') and _f.encoding.lower() not in ('utf-8', 'utf8'):
            _f.reconfigure(encoding='utf-8', errors='replace')
    except Exception:
        pass

from playwright.sync_api import sync_playwright
import http.server, socketserver, threading, os, json
os.chdir('/home/claude/kit')
class S(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
socketserver.TCPServer.allow_reuse_address=True
srv=socketserver.TCPServer(('127.0.0.1',0),S)
threading.Thread(target=srv.serve_forever,daemon=True).start()
base='http://127.0.0.1:%d/' % srv.server_address[1]
UID='uid_kine'
f=[]
def ok(t,c):
    print('   %-52s %s' % (t,'ok' if c else 'FALLA'))
    if not c: f.append(t)

# La base tal como quedo en el caso real: vaciada y con UN paciente
BASEFB = {
  'kine/vaciado': '2026-08-28',
  'kine/pacientes': {
     'P34': {'id':'P34','nombre':'Paciente Real','doc':'30111222','nacimiento':'1985-06-01',
             'tel':'11 1111 1111','institucion':'Fénix','estado':'pendiente',
             'alta':'2026-08-28','plan':'sesion','creditos':0,'tipo':'plantel'}
  }
}
with sync_playwright() as pw:
    b=pw.chromium.launch(); ctx=b.new_context(**pw.devices['iPhone 14 Pro'])
    ctx.route('**identitytoolkit**', lambda r: r.fulfill(status=200, content_type='application/json',
        body=json.dumps({'idToken':'T','refreshToken':'R','expiresIn':'3600','localId':UID,'email':'k@x'})))
    ctx.route('**securetoken**', lambda r: r.fulfill(status=200, content_type='application/json',
        body=json.dumps({'id_token':'T','refresh_token':'R','expires_in':'3600','user_id':UID})))
    def datos(route):
        u=route.request.url; m=route.request.method
        ruta=u.split('.firebaseio.com/')[1].split('.json')[0]
        if m=='PUT':
            BASEFB[ruta]=json.loads(route.request.post_data or 'null')
            route.fulfill(status=200, content_type='application/json', body=route.request.post_data or '{}')
        elif '/kine/roles/' in u:
            route.fulfill(status=200, content_type='application/json', body='"kine"')
        elif ruta=='kine':
            armado={}
            for k,v in BASEFB.items():
                if k.startswith('kine/') and v is not None:
                    armado[k.split('/',1)[1]]=v
            route.fulfill(status=200, content_type='application/json', body=json.dumps(armado))
        else:
            route.fulfill(status=200, content_type='application/json', body=json.dumps(BASEFB.get(ruta)))
    ctx.route('**firebaseio.com**', datos)
    pg=ctx.new_page(); errs=[]; pg.on('pageerror', lambda e: errs.append(str(e)))

    print('══ EL CASO REAL: vacio, cargo uno, y no aparece ══')
    pg.goto(base+'index.html'); pg.wait_for_timeout(500)
    pg.evaluate("localStorage.clear()")       # otro aparato: nunca vacio aca
    pg.goto(base+'index.html'); pg.wait_for_timeout(400)
    pg.evaluate("guardarSesion({tipo:'kine', desde:HOY, uid:'"+UID+"'})")
    pg.evaluate("""try{localStorage.setItem('nla_sesion', JSON.stringify(
        {idToken:'T', refreshToken:'R', vence: Date.now()+3600000, email:'k@x', uid:'"""+UID+"""'}));}catch(e){}""")
    pg.goto(base+'pacientes.html'); pg.wait_for_timeout(3000)

    t = pg.evaluate("document.documentElement.textContent")
    ok('APARECE el paciente real', 'Paciente Real' in t)
    ok('NO aparecen los de ejemplo', 'Tomás Duarte' not in t and 'Marcela Ríos' not in t)
    print('      pacientes que ve:', pg.evaluate("BASE.pacientes.map(function(p){return p.nombre}).join(', ') || '(ninguno)'"))
    ok('la lista es recorrible', pg.evaluate("Array.isArray(BASE.pacientes)"))
    ok('lo cuenta en el padron', pg.evaluate("document.getElementById('kTotal').textContent")=='1')
    ok('lo cuenta en su institucion', pg.evaluate("porInstitucion()['Fénix']")==1)
    ok('sin cartel de demostracion', not pg.evaluate("!!document.querySelector('.cartel-demo')"))
    ok('sin errores', not errs)
    if errs: print('      ', errs[:3])
    ctx.close(); b.close()
srv.shutdown()
print('\n'+'='*60); print('FALLAS:', len(f))
for x in f: print('  x', x)
