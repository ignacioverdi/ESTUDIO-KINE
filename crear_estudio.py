#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CREAR_ESTUDIO — arma la carpeta del portal desde cero.

Crea la estructura completa con archivos vacíos pero comentados: cada uno
explica qué va adentro y por qué existe. Sirve para entender la anatomía,
para arrancar un estudio nuevo, o para comparar contra lo que ya tenés.

    python3 crear_estudio.py                → carpeta ESTUDIO_NUEVO
    python3 crear_estudio.py MI_ESTUDIO     → carpeta MI_ESTUDIO

NO pisa nada: si la carpeta existe, avisa y corta.
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

import io, os, sys

DESTINO = sys.argv[1] if len(sys.argv) > 1 else 'ESTUDIO_NUEVO'

# ══════════════════════════════════════════════════════════════════════
# EL INVENTARIO
# (ruta, para qué sirve, si es obligatorio para que ande)
# ══════════════════════════════════════════════════════════════════════
INVENTARIO = [

    # ── 1. LAS PANTALLAS ──────────────────────────────────────────────
    ('index.html',      'Puerta de entrada. Manda al panel o a la vista del jugador según el rol.', True),
    ('panel.html',      'El día del kinesiólogo: turnos de hoy, lesiones activas, semáforo del plantel.', True),
    ('lesiones.html',   'Las fichas. Fases, criterios de pase, sesiones y programa. El corazón del portal.', True),
    ('agenda.html',     'Turnos. La misma pantalla sirve para el kine (asigna) y el jugador (reserva).', True),
    ('mi.html',         'Lo que ve el lesionado: en qué fase está, su turno, sus ejercicios de hoy.', True),
    ('diario.html',     'Las cinco preguntas diarias de cómo se siente. Índice de Hooper.', False),
    ('pacientes.html',  'El padrón: plantel y particulares. Se cargan solos.', True),
    ('alta.html',       'PUBLICA: el paciente se da de alta solo. No lleva menú ni sesión.', True),
    ('cartel.html',     'El cartel con el QR para pegar en la recepción.', False),
    ('historia.html',   'La historia clínica: lectura, verificacion de integridad y exportacion.', True),
    ('caja.html',       'Ingresos, egresos, planes y creditos de cada paciente.', False),
    ('programa.html',   'El editor: cargar ejercicios con series, repeticiones, carga y video.', True),
    ('perfil.html',     'El perfil del profesional: logo, foto, matricula y presentacion.', False),
    ('pizarron.html',   'Dibuja circuitos en la cancha con postas. Se guarda como datos, no como imagen.', False),
    ('ejercicios.html', 'La biblioteca del estudio: circuitos y ejercicios sueltos con su video.', False),

    # ── 2. LO COMPARTIDO ──────────────────────────────────────────────
    ('css/estudio.css', 'Los COMPONENTES: formas, tamaños, espacios. Ni un color propio.', True),
    ('css/tema.css',     'El tema en uso. Es una copia de uno de los tema-*.css de abajo.', True),
    ('css/tema-telemetria.css', 'Aspecto: consola de datos. Casi negro, retícula, cian eléctrico.', False),
    ('css/tema-suizo.css',      'Aspecto: grafito, títulos enormes, verde ácido. Sobrio, sin brillos.', False),
    ('css/tema-papel.css',      'Aspecto: ficha clínica clara. El que mejor imprime.', False),
    ('js/datos.js',     'La única puerta a la base. Ninguna pantalla habla con Firebase directo.', True),
    ('js/plantillas.js','Lo que el sistema sabe de cada lesión: criterios y plazos por zona.', True),
    ('js/historia.js',  'La capa que exige la ley: asientos encadenados, inalterables, con bitacora.', True),
    ('js/dinero.js',    'Planes, creditos, caja y porcentaje de ausencias.', False),
    ('js/atender.js',   'Todo lo de una sesion en una sola pantalla: de 10 pasos a 1.', False),
    ('js/qr.js',        'Genera el código QR acá adentro, sin mandarle el enlace a nadie.', False)
    ('js/base.js',      'Encabezado, menú según rol, la pista de fases, las escalas 0 a 10.', True),
    ('js/ayuda.js',     'El contenido del botón ? de cada pantalla. Una entrada por data-pag.', False),
    ('js/firebase.js',  'NO SE ESCRIBE: se copia de la app del club. Trae sesión, roles y modo sin internet.', False),

    # ── 3. QUE SE INSTALE COMO APP ────────────────────────────────────
    ('manifest.json',   'Nombre, iconos y colores para que se instale en el celular.', False),
    ('sw.js',           'Hace que ande sin internet. Subir VERSION cada vez que se toca una pantalla.', False),
    ('img/icono-192.png', 'Icono chico.', False),
    ('img/icono-512.png', 'Icono grande y enmascarable.', False),
    ('img/logo.png',    'El escudo del club, si lo hay.', False),

    # ── 4. CONFIGURACIÓN Y PUBLICACIÓN ────────────────────────────────
    ('config.json',     'La identidad del estudio: nombre, horario, kinesiólogos. Lo único que cambia entre clubes.', False),
    ('vercel.json',     'Publicación: URLs limpias y cabeceras de seguridad.', False),
    ('.gitignore',      'QUÉ NO SUBE. Lo más importante: ningún dato de paciente.', True),

    # ── 5. DOCUMENTACIÓN Y HERRAMIENTAS ───────────────────────────────
    ('LEEME.md',        'El manual: modelo de datos, permisos, fases, qué falta.', True),
    ('armar_demo.py',   'Junta todo en un ESTUDIO.html de un solo archivo para mostrarlo.', False),
    ('INSTALAR.md',     'Paso a paso: instalar, publicar en GitHub y en Vercel, conectar Firebase.', False),
    ('INVESTIGACION.md','Que le falta al portal: obligaciones legales, evidencia clinica y competencia.', False),
    ('INSTALAR_DESDE_CERO.pdf','La guia imprimible para una PC en blanco. Se genera con armar_pdf.py.', False),
    ('armar_pdf.py',    'Genera la guia en PDF para instalar desde cero.', False),
    ('ABRIR.bat',       'EL DE TODOS LOS DIAS. Prepara, abre el portal y se cierra solo.', False),
    ('PROBAR_COMO_APP.bat','Solo para probar sin internet y la instalacion como app.', False),
    ('CREAR_ACCESO_DIRECTO.bat','Deja el icono del portal en el escritorio del kinesiologo.', False),
    ('PUBLICAR.bat',    'EL OTRO BOTON. Prepara, audita, muestra que sube y publica.', False),
    ('preparar.py',     'El motor de los dos botones: sube la version de sw.js sola, arma y audita.', False),
    ('auditar.py',      'Revisa el PROYECTO: enlaces rotos, archivos que faltan, claves expuestas.', False),
    ('medir_pantallas.py','Revisa el portal en celular, tablet y monitor: desbordes y botones chicos.', False),
    ('probar_qr.py',    'Genera codigos QR y los LEE con un lector, para probar que sirven.', False),

    ('videos/LEEME.txt','Los videos NO van al repo: pesan. Van a un hosting y acá queda el enlace.', False),
    ('ARMAR_DESDE_CERO.md', 'Esta guía: qué tiene que haber, en qué orden y qué no subir nunca.', False),
    ('crear_estudio.py', 'Genera este esqueleto vacío y comentado. El que estás corriendo.', False),
    ('CREAR_ESTUDIO.bat', 'Lo mismo con doble clic, para Windows.', False),
    ('ESTUDIO.html', 'Se GENERA con armar_demo.py. No se edita a mano: todo adentro, para mostrar.', False),
]


CABECERAS = {
    '.html': u'''<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>__TITULO__ · Estudio</title>
<link rel="manifest" href="manifest.json"><meta name="theme-color" content="#1D3E6E">
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="css/estudio.css">
<script src="js/firebase.js" onerror="void 0"></script>
<script src="js/datos.js"></script><script src="js/base.js"></script>
</head>
<body data-pag="__PAG__">

<!-- ══════════════════════════════════════════════════════════════════
     __QUE_ES__

     El encabezado y el menú los pone base.js solo, mirando data-pag
     y el rol. No los escribas acá.
     ══════════════════════════════════════════════════════════════════ -->

<div class="hoja">
  <h1 class="tit">__TITULO__</h1>
  <p class="bajada">Una línea que explique para qué sirve esta pantalla.</p>

  <div class="tarjeta">
    <div class="tarjeta-cab"><h2 class="sub">Sección</h2>
      <span class="eti">Etiqueta</span></div>
    <div id="contenido"></div>
  </div>
</div>

<script>
/* Los datos salen de datos.js: BASE, lesionDe(), estadoDe(), FASES...
   Para escribir, guardar('kine/loquesea', valor). Nunca fbSet directo. */
</script>
</body></html>
''',
    '.css': u'/* __QUE_ES__ */\n',
    '.js':  u'/* __QUE_ES__ */\n',
    '.json': None,
    '.md':  u'# __TITULO__\n\n__QUE_ES__\n',
    '.txt': u'__QUE_ES__\n',
    '.py':  u'#!/usr/bin/env python3\n# -*- coding: utf-8 -*-\n"""__QUE_ES__"""\n',
}


def titulo_de(ruta):
    nombre = os.path.basename(ruta).rsplit('.', 1)[0]
    return {'index': 'Inicio', 'panel': 'Panel', 'lesiones': 'Lesiones',
            'agenda': 'Agenda', 'mi': 'Mi recuperación', 'diario': 'Cómo estoy',
            'pizarron': 'Pizarrón', 'ejercicios': 'Ejercicios'}.get(nombre, nombre)


def clave_pag(ruta):
    nombre = os.path.basename(ruta).rsplit('.', 1)[0]
    return {'index': 'inicio', 'lesiones': 'ficha'}.get(nombre, nombre)


def crear():
    if os.path.exists(DESTINO):
        print('La carpeta "%s" ya existe. No toco nada.' % DESTINO)
        print('Borrala o pasá otro nombre:  python3 crear_estudio.py OTRO_NOMBRE')
        return 1

    obligatorios = 0
    for ruta, que_es, obligatorio in INVENTARIO:
        entero = os.path.join(DESTINO, ruta)
        carpeta = os.path.dirname(entero)
        if carpeta and not os.path.isdir(carpeta):
            os.makedirs(carpeta)

        ext = os.path.splitext(ruta)[1]

        if ext == '.png':
            io.open(entero, 'wb').write(b'')          # el icono se genera aparte
        elif ext == '.json':
            io.open(entero, 'w', encoding='utf-8').write(
                u'{\n  "_": "%s"\n}\n' % que_es)
        else:
            plantilla = CABECERAS.get(ext, u'/* __QUE_ES__ */\n')
            texto = (plantilla.replace('__QUE_ES__', que_es)
                              .replace('__TITULO__', titulo_de(ruta))
                              .replace('__PAG__', clave_pag(ruta)))
            io.open(entero, 'w', encoding='utf-8').write(texto)

        if obligatorio:
            obligatorios += 1
        print('  %s %-22s %s' % ('*' if obligatorio else ' ', ruta, que_es[:52]))

    print('')
    print('Carpeta "%s" lista: %d archivos, %d marcados con * (sin esos no arranca).'
          % (DESTINO, len(INVENTARIO), obligatorios))
    print('')
    print('Para trabajar hay DOS archivos de doble clic:')
    print('  ABRIR.bat      prepara y abre el portal. No deja ventanas.')
    print('  PUBLICAR.bat   prepara, audita y sube a GitHub. Se cierra solo.')
    print('')
    print('El kinesiologo no toca ninguno: usa el portal publicado.')
    print('')
    print('Orden sugerido para llenar los archivos:')
    print('  1. css/estudio.css   primero el aspecto, si no no ves nada')
    print('  2. js/datos.js       los datos de ejemplo, para tener con qué probar')
    print('  3. js/base.js        el encabezado y el menú')
    print('  4. index + panel     ya tenés algo que mostrar')
    print('  5. lesiones          el corazón: fases y criterios')
    print('  6. el resto')
    return 0


if __name__ == '__main__':
    sys.exit(crear())
