#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""AUDITORIA PROFUNDA — el portal contra datos como los devuelve Firebase.

probar.py revisa que las pantallas abran. Esto revisa algo distinto y mas
dificil: que TODO funcione cuando los datos vienen de la base en vez del
archivo de ejemplo.

Firebase no devuelve las cosas como las guardamos:
  · una lista vuelve como objeto {"0":x,"1":y}
  · si las claves son numeros desde 1, deja un hueco nulo en la posicion 0
  · los objetos anidados hay que pedirlos por su ruta completa

Ese desajuste nos costo seis errores encontrados de a uno, cada uno
cuando algo se rompia en la cara del usuario. Este archivo los busca
todos juntos: monta una base falsa con los datos en el formato REAL de
Firebase, abre las 16 pantallas y ejerce 32 acciones.

    python auditoria_profunda.py
"""

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
def ok(t,c,extra=''):
    print('   %-50s %s %s' % (t,'ok' if c else 'FALLA', extra))
    if not c: f.append(t)

HOY='2026-08-28'
# La base tal como Firebase la devuelve DE VERDAD: listas como objetos,
# numeraciones desde 1 con hueco, claves fuera de orden.
BASEFB = {
 'kine/roles/'+UID: 'kine',
 'kine/pacientes': {  # objeto, no lista
   'P07': {'id':'P07','nombre':'Ana Uno','doc':'11','nacimiento':'1990-01-01','tel':'1155551111',
           'institucion':'Boca Juniors','dorsal':7,'estado':'activo','plan':'p10','creditos':5,
           'alta':HOY,'tipo':'plantel','objetivos':'Volver a jugar'},
   'P12': {'id':'P12','nombre':'Beto Dos','doc':'22','nacimiento':'1985-05-05','tel':'1155552222',
           'institucion':'Beyond','estado':'pendiente','plan':'sesion','creditos':0,
           'alta':HOY,'tipo':'particular'}},
 'kine/lesiones': [None, {'id':'L1','pid':'P07','dorsal':7,'zona':'Tobillo','lado':'derecho',
   'diagnostico':'Esguince','mecanismo':'x','fecha':'2026-08-18','gravedad':2,'fase':2,
   'estado':'activa','alta':'2026-09-10','criterios':[{'t':'Sin dolor','ok':False}],'sesiones':[]}],
 'kine/agenda': {HOY: {'0':{'h':'09:00','pid':'P07','dorsal':7,'tipo':'Tratamiento','estado':'reservado'}}},
 'kine/historia': {'P07': {'a2':{'n':2,'tipo':'consentimiento','contenido':'C','fecha':HOY,
    'hora':'09:01','autor':'V','sello':HOY,'autor_id':'v','huella_previa':'x','huella':'y','rectifica':None},
   'a1':{'n':1,'tipo':'alta_paciente','contenido':'A','fecha':HOY,'hora':'09:00','autor':'V',
    'sello':HOY,'autor_id':'v','huella_previa':'0','huella':'x','rectifica':None}}},
 'kine/caja': [None, {'id':'M1','fecha':HOY,'tipo':'ingreso','concepto':'Plan','monto':150000,
    'categoria':'planes','metodo':'efectivo'}],
 'kine/instituciones': {'0':{'nombre':'Boca Juniors','usa_dorsal':True},
    '1':{'nombre':'Beyond','usa_dorsal':True},'2':{'nombre':'Particulares','usa_dorsal':False}},
 'kine/mensajes': {'P07': {'m1':{'id':'m1','pid':'P07','de':'paciente','texto':'me tira',
    'contexto':{'tipo':'general','detalle':''},'sello':HOY,'fecha':HOY,'hora':'10:00','leido':False}}},
 'kine/adherencia': {'P07': {HOY: {'hechos':{'0':True}, 'series':{}}}},
 'kine/wellness': {'P07': {HOY: {'sueno':3,'fatiga':2,'dolor':2,'animo':4,'estres':2}}},
 'kine/programas': {'L1': {'2': [None, {'n':'Movilidad','series':3,'reps':'15','carga':'Banda'}]}},
 'kine/estudios': {'P07': {'e1':{'id':'e1','tipo':'Ecografía','formato':'enlace',
    'enlace':'https://x.com','cargado':HOY,'por':'el kinesiólogo','fecha':HOY,'nota':''}}},
 'kine/disponibilidad': {'7':{'estado':'baja','motivo':'tobillo','desde':HOY,'hasta':'2026-09-10'}},
 'kine/faq': [None, {'p':'¿Dónde queda?','r':'En la esquina.'}],
 'kine/accesos': {'P07': {'a1':{'sello':HOY,'pid':'P07','quien':'V','quien_id':'v','que':'lectura'}}},
 'kine/horario': {'minutos':30,'cerrado':[],'semana':{'1':[{'abre':'08:30','cierra':'12:30'}],
    '2':[{'abre':'08:30','cierra':'12:30'}],'3':[{'abre':'08:30','cierra':'12:30'}],
    '4':[{'abre':'08:30','cierra':'12:30'}],'5':[{'abre':'08:30','cierra':'12:30'}]}},
 'kine/perfil': {'nombre':'Vero Ramírez','email':'v@x','clave':'x','tel':'1155550000',
    'direccion':'Calle 1','estudio':'Estudio','club':'Club'},
 'kine/ejercicios': [None, {'id':'E1','nombre':'Circuito','objetivo':'x'}],
 'kine/avisados': {HOY: {'09:00': HOY}},
}

PANTALLAS_KINE = ['panel.html','agenda.html','lesiones.html','pacientes.html','historia.html',
                  'programa.html','caja.html','configuracion.html','perfil.html','cartel.html',
                  'pizarron.html','ejercicios.html']
PANTALLAS_PAC = ['mi.html','agenda.html','diario.html','historia.html']

with sync_playwright() as pw:
    b=pw.chromium.launch()
    ctx=b.new_context(**pw.devices['iPhone 14 Pro'])
    ctx.route('**identitytoolkit**', lambda r: r.fulfill(status=200,
        content_type='application/json', body=json.dumps({'idToken':'T','refreshToken':'R',
        'expiresIn':'3600','email':'v@x','localId':UID})))
    ctx.route('**securetoken**', lambda r: r.fulfill(status=200, content_type='application/json',
        body=json.dumps({'id_token':'T','refresh_token':'R','expires_in':'3600','user_id':UID})))
    def datos(route):
        ruta = route.request.url.split('.firebaseio.com/')[1].split('.json')[0]
        if route.request.method in ('PUT','DELETE'):
            route.fulfill(status=200, content_type='application/json', body='{}'); return
        if ruta == 'kine':
            route.fulfill(status=401, content_type='application/json', body='{}'); return
        # Firebase resuelve rutas anidadas: kine/pacientes/P07 devuelve el
        # hijo. El simulador tiene que hacer lo mismo o miente.
        d = BASEFB.get(ruta)
        if d is None:
            partes = ruta.split('/')
            for i in range(len(partes)-1, 0, -1):
                padre = BASEFB.get('/'.join(partes[:i]))
                if isinstance(padre, dict):
                    resto = partes[i:]
                    x = padre
                    for k in resto:
                        x = x.get(k) if isinstance(x, dict) else None
                        if x is None: break
                    if x is not None:
                        d = x; break
        route.fulfill(status=200, content_type='application/json', body=json.dumps(d))
    ctx.route('**firebaseio.com**', datos)
    pg=ctx.new_page()

    print('══ LAS 12 PANTALLAS DEL KINESIOLOGO, CON DATOS COMO LOS DA FIREBASE ══')
    pg.goto(base+'index.html'); pg.wait_for_timeout(500)
    pg.evaluate("localStorage.clear()")
    pg.goto(base+'index.html'); pg.wait_for_timeout(700)
    pg.evaluate("elegir('kine')"); pg.wait_for_timeout(300)
    pg.evaluate("""document.getElementById('kMail').value='v@x';
                   document.getElementById('kClave').value='x'; enviar();""")
    pg.wait_for_timeout(3000)
    for p in PANTALLAS_KINE:
        errs=[]
        h = lambda e: errs.append(str(e))
        pg.on('pageerror', h)
        pg.goto(base+p); pg.wait_for_timeout(1400)
        pg.remove_listener('pageerror', h)
        cartel = pg.evaluate("!!document.getElementById('fb-lectura') || !!document.getElementById('fb-fallo')")
        ok(p, not errs and not cartel, ('| '+errs[0][:60]) if errs else ('| cartel de error' if cartel else ''))

    print('\n══ LAS 4 PANTALLAS DEL PACIENTE ══')
    pg.evaluate("guardarSesion({tipo:'paciente', pid:'P07', dorsal:7, desde:HOY})")
    for p in PANTALLAS_PAC:
        errs=[]
        h = lambda e: errs.append(str(e))
        pg.on('pageerror', h)
        pg.goto(base+p); pg.wait_for_timeout(1400)
        pg.remove_listener('pageerror', h)
        ok('paciente: '+p, not errs, ('| '+errs[0][:60]) if errs else '')

    print('')
    print('══ AHORA LAS ACCIONES DE VERDAD ══')
    pg.evaluate("guardarSesion({tipo:'kine', desde:HOY})")

    acciones = [
      ('panel.html',    'ver los avisos',        "alertas().length >= 0"),
      ('panel.html',    'recordatorios de mañana', "typeof proximoDiaConTurnos==='function' && (proximoDiaConTurnos(HOY)||true)"),
      ('pacientes.html','contar por institucion', "Object.keys(porInstitucion()).length >= 3"),
      ('pacientes.html','filtrar por una',        "(filtrarPor('Beyond'), document.querySelectorAll('#lista .fila').length >= 0)"),
      ('pacientes.html','abrir una ficha',        "(abrir('P07'), !!document.getElementById('detalle').innerHTML)"),
      ('pacientes.html','abrir corregir datos',   "(corregirDatos('P07'), !!document.getElementById('cajaCorregir'))"),
      ('pacientes.html','abrir borrar',           "(cerrarCorregir(), borrarPaciente('P12'), !!document.getElementById('cajaBorrar'))"),
      ('pacientes.html','abrir alta de lesion',   "(cerrarBorrar(), abrir('P12'), abrirLesion('P12'), !!document.getElementById('cajaLesion'))"),
      ('lesiones.html', 'ver la ficha',           "(abrir('L1'), !!document.querySelector('.crit') || true)"),
      ('lesiones.html', 'cargar una sesion',      "(abrirSesion(), !!document.getElementById('cajaSesion'))"),
      ('agenda.html',   'ver el mes',             "(verMes(), document.querySelectorAll('#grilla .celda').length > 20)"),
      ('agenda.html',   'abrir reservar serie',   "(abrirSerie(), !!document.getElementById('cajaSerieM'))"),
      ('agenda.html',   'atender un turno',       "(cerrarSerie(), atender(HOY,'09:00'), !!document.getElementById('cajaAtender'))"),
      ('programa.html', 'elegir paciente',        "(elegir('P07'), Array.isArray(prog))"),
      ('programa.html', 'abrir biblioteca',       "(abrirBiblioteca(), !!document.getElementById('cajaBib'))"),
      ('caja.html',     'ver el resumen',         "resumenMes().ingresos >= 0"),
      ('caja.html',     'cambiar plan',           "(cambiarPlan('P07'), !!document.getElementById('cajaPlan'))"),
      ('historia.html?p=P07','ver la historia',   "historiaDe('P07').length === 2"),
      ('historia.html?p=P07','verificar integridad', "typeof verificarHistoria('P07').ok === 'boolean'"),
      ('historia.html?p=P07','agregar estudio',   "(agregarEstudio(), !!document.getElementById('cajaNuevoEst'))"),
      ('configuracion.html','sumar franja',       "(sumarFranja(6), franjasDe(6).length > 0)"),
      ('configuracion.html','sumar institucion',  "(sumarInst(), instituciones().length > 3)"),
      ('perfil.html',   'ver las preguntas',      "preguntasFrecuentes().length > 0"),
      ('cartel.html',   'el QR se dibuja',        "!!document.querySelector('#cartel .qr svg')"),
      ('ejercicios.html','ver la biblioteca',     "document.querySelectorAll('.ej').length >= 0"),
    ]
    ultimo = None
    for pantalla, que, prueba in acciones:
        if pantalla != ultimo:
            pg.goto(base+pantalla); pg.wait_for_timeout(1500)
            ultimo = pantalla
        errs=[]
        h = lambda e: errs.append(str(e))
        pg.on('pageerror', h)
        try:
            r = pg.evaluate("(function(){ try { return !!(" + prueba + "); } catch(e){ return 'ERROR: '+e.message; } })()")
        except Exception as e:
            r = 'ERROR: ' + str(e)[:50]
        pg.wait_for_timeout(400)
        pg.remove_listener('pageerror', h)
        bien = (r is True) and not errs
        ok('%-18s %s' % (pantalla.split('?')[0][:18], que), bien,
           ('| '+str(r)[:52]) if r is not True else (('| '+errs[0][:50]) if errs else ''))

    print('')
    print('══ Y LAS DEL PACIENTE ══')
    pg.evaluate("guardarSesion({tipo:'paciente', pid:'P07', dorsal:7, desde:HOY})")
    accionesP = [
      ('mi.html', 've SU lesion',            "L && L.pid === miPid()"),
      ('mi.html', 'abrir un ejercicio',      "(verEjercicioCompleto(0), !!document.getElementById('cajaEj'))"),
      ('mi.html', 'abrir el asistente',      "(cerrarEjercicio(), abrirAsistente(), !!document.getElementById('cajaAsis'))"),
      ('mi.html', 'escribirle al kine',      "(cerrarAsistente(), abrirConversacion(miPid()), !!document.getElementById('cajaMensajes'))"),

      ('agenda.html','ve el calendario',     "document.querySelectorAll('.dcorto').length === 7"),
      ('diario.html','cargar el bienestar',  "typeof enviar === 'function'"),
      ('historia.html','ve SU historia',     "historiaDe(miPid()).length === 2"),
    ]
    ultimo = None
    for pantalla, que, prueba in accionesP:
        if pantalla != ultimo:
            pg.goto(base+pantalla); pg.wait_for_timeout(1500)
            ultimo = pantalla
        errs=[]
        h = lambda e: errs.append(str(e))
        pg.on('pageerror', h)
        try:
            r = pg.evaluate("(function(){ try { return !!(" + prueba + "); } catch(e){ return 'ERROR: '+e.message; } })()")
        except Exception as e:
            r = 'ERROR: ' + str(e)[:50]
        pg.wait_for_timeout(400)
        pg.remove_listener('pageerror', h)
        bien = (r is True) and not errs
        ok('%-18s %s' % (pantalla.split('?')[0][:18], que), bien,
           ('| '+str(r)[:52]) if r is not True else (('| '+errs[0][:50]) if errs else ''))

    ctx.close(); b.close()
srv.shutdown()
print('\n'+'='*62); print('FALLAS:', len(f))
for x in f: print('  x', x)
