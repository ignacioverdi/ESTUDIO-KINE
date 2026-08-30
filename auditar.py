#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
AUDITAR — revisa el proyecto y avisa qué está roto o quedó a medias.

COMPROBAR.bat mira la MÁQUINA (¿está Python? ¿está Git?).
Esto mira el PROYECTO (¿los enlaces van a algún lado? ¿falta algún archivo?).

    python3 auditar.py

Devuelve 0 si está todo bien, 1 si hay algo roto. Los avisos no cuentan
como error: son cosas pendientes, no cosas rotas.
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

import io, os, re, sys, glob

ROTO, AVISO = [], []

def leer(p):
    return io.open(p, encoding='utf-8').read()

PANTALLAS = sorted(p for p in glob.glob('*.html') if p != 'ESTUDIO.html')


def enlaces_rotos():
    """Cada href y cada irA() tiene que llevar a un archivo que existe."""
    for p in PANTALLAS + ['js/base.js']:
        s = leer(p)
        destinos = set(re.findall(r'href="([a-z_]+\.html)"', s))
        destinos |= set(re.findall(r"irA\('([a-z_]+\.html)", s))
        destinos |= set(re.findall(r"a:'([a-z_]+\.html)'", s))
        for d in destinos:
            if not os.path.exists(d):
                ROTO.append('%s enlaza a %s, que no existe' % (p, d))


def archivos_que_pide_cada_pantalla():
    """Los src y los link de cada HTML."""
    for p in PANTALLAS:
        s = leer(p)
        for a in re.findall(r'(?:src|href)="([^"#]+\.(?:css|js|json|png))"', s):
            if a.startswith('http'):
                continue
            if not os.path.exists(a):
                ROTO.append('%s pide %s, que no está' % (p, a))


def todas_cargan_lo_comun():
    """Sin base.js una pantalla queda sin encabezado ni menú.
       Ya pasó una vez con index.html."""
    for p in PANTALLAS:
        s = leer(p)
        # Una pantalla marcada como PANTALLA PUBLICA no lleva menú a propósito:
        # el que entra todavía no tiene cuenta ni rol (ej: alta.html).
        publica = 'PANTALLA PUBLICA' in s
        for req, porque in [('css/tema.css', 'se ve sin colores'),
                            ('css/estudio.css', 'se ve sin formato'),
                            ('js/datos.js', 'no tiene datos'),
                            ('js/plantillas.js', 'no sabe los criterios de cada lesión'),
                            ('js/qr.js', 'no puede dibujar el código QR'),
                            ('js/historia.js', 'no registra la historia clínica'),
                            ('js/dinero.js', 'no sabe de planes ni de caja'),
                            ('js/base.js', 'queda sin encabezado ni menú'),
                            ('js/ayuda.js', 'se queda sin el botón ?')]:
            if publica:          # una pagina suelta no carga nada a proposito
                continue
            if req not in s:
                ROTO.append('%s no carga %s: %s' % (p, req, porque))


def cada_pantalla_tiene_ayuda():
    """El botón ? solo aparece si hay entrada con la clave de data-pag."""
    claves = set(re.findall(r'^\s{2}([a-z]+):\s*\{', leer('js/ayuda.js'), re.M))
    for p in PANTALLAS:
        m = re.search(r'data-pag="([a-z]+)"', leer(p))
        if not m:
            ROTO.append('%s no declara data-pag' % p)
        elif m.group(1) not in claves:
            AVISO.append('%s no tiene texto de ayuda (clave "%s")' % (p, m.group(1)))


def componentes_sin_color_propio():
    """La regla del tema: si hay un color pegado al componente, falta un token."""
    for linea in leer('css/estudio.css').split('\n'):
        if re.search(r'#[0-9A-Fa-f]{3,6}', linea) and '@media print' not in linea:
            if 'background:#fff' in linea.replace(' ', '') or 'color:#000' in linea.replace(' ', ''):
                continue    # el bloque de impresión es la excepción
            ROTO.append('css/estudio.css tiene un color pegado: %s' % linea.strip()[:60])


def temas_completos():
    """Todos los temas tienen que definir los mismos tokens, o al cambiar
       de tema quedan huecos que se ven como texto invisible."""
    def tokens(f):
        return set(re.findall(r'(--[a-z0-9-]+)\s*:', leer(f)))
    base = tokens('css/tema-telemetria.css')
    for f in glob.glob('css/tema-*.css'):
        faltan = base - tokens(f)
        if faltan:
            ROTO.append('%s no define: %s' % (f, ', '.join(sorted(faltan))))
    usados = set(re.findall(r'var\((--[a-z0-9-]+)', leer('css/estudio.css')))
    huerfanos = usados - base
    if huerfanos:
        ROTO.append('los componentes usan tokens que ningún tema define: %s'
                    % ', '.join(sorted(huerfanos)))


def sobras():
    """Archivos viejos que quedaron dando vueltas.

    El zip agrega y reemplaza, pero no borra. Si el proyecto tiene
    archivos que ya no se usan, conviene avisar en vez de dejarlos."""
    try:
        import limpiar
    except Exception:
        return
    # El .ultimo_chequeo lo crea ABRIR.bat cada vez: no es una sobra.
    viejos = [n for n, _, _ in limpiar.SOBRAN
              if os.path.isfile(n) and not n.startswith('.ultimo')]
    if viejos:
        AVISO.append('sobran %d archivos viejos (%s...). Doble clic en LIMPIAR.bat'
                     % (len(viejos), ', '.join(viejos[:3])))


def archivos_huerfanos():
    """Archivos que nadie usa.

    Antes esto se controlaba contra una lista escrita a mano en otro
    archivo, y mantener esa lista al dia era trabajo puro: cada vez que
    agregaba una pantalla, el auditor se quejaba de la lista, no del
    codigo. Ahora se deduce mirando quien referencia a quien.
    """
    # Windows devuelve js\base.js y el HTML dice js/base.js: sin unificar
    # las barras no coinciden nunca y el auditor avisa de todo por las dudas.
    # Solo se notaba en Windows, no en la maquina donde programo.
    def barras(x):
        return x.replace('\\', '/').lstrip('./')

    usados = set()
    for p in PANTALLAS + glob.glob('js/*.js') + glob.glob('css/*.css'):
        if not os.path.exists(p):
            continue
        s2 = leer(p)
        for a in re.findall(r'["\'(]([\w./\\-]+\.(?:css|js|png|html|json))["\')]', s2):
            usados.add(barras(a))
    for f in glob.glob('js/*.js') + glob.glob('css/*.css'):
        if barras(f) not in usados and 'tema-' not in f and 'firebase' not in f:
            AVISO.append('%s no lo usa ninguna pantalla' % barras(f))


def config_de_vercel():
    """vercel.json no acepta propiedades que no conoce.

    Un comentario explicativo adentro de ese archivo hizo que TODAS las
    publicaciones fallaran durante cinco horas. Vercel las rechazaba y
    seguia sirviendo la version vieja, sin nada visible: uno publicaba,
    decia LISTO, y el sitio no cambiaba.

    Lo mas barato es no tener el archivo: sin vercel.json, Vercel usa lo
    que viene por defecto, que es exactamente lo que este portal necesita.
    """
    if not os.path.exists('vercel.json'):
        return
    permitidas = {
        'buildCommand', 'cleanUrls', 'devCommand', 'framework', 'functions',
        'headers', 'ignoreCommand', 'images', 'installCommand', 'outputDirectory',
        'public', 'redirects', 'regions', 'rewrites', 'trailingSlash', 'crons',
        'git', 'github', 'installCommand', '$schema'
    }
    try:
        import json
        cfg = json.loads(leer('vercel.json'))
    except Exception as e:
        ROTO.append('vercel.json no es JSON valido: %s. Vercel va a rechazar la publicacion.' % e)
        return
    for k in cfg:
        if k not in permitidas:
            ROTO.append('vercel.json tiene "%s", que Vercel no acepta. '
                        'La publicacion va a fallar y el sitio se queda en la version vieja.' % k)
    if cfg.get('cleanUrls'):
        ROTO.append('vercel.json tiene cleanUrls activado: redirige y rompe Safari.')


def secretos_a_la_vista():
    """Lo más caro de equivocarse."""
    sospechoso = re.compile(r'(apiKey|api_key|password|secret|token)\s*[:=]\s*["\'][^"\']{12,}', re.I)
    for p in glob.glob('*.html') + glob.glob('js/*.js') + glob.glob('*.json'):
        for n, linea in enumerate(leer(p).split('\n'), 1):
            if sospechoso.search(linea):
                ROTO.append('POSIBLE CLAVE EXPUESTA en %s línea %d' % (p, n))
    if not os.path.exists('.gitignore'):
        ROTO.append('no hay .gitignore: cualquier dato de paciente se sube')
    else:
        g = leer('.gitignore')
        for regla in ['pacientes/', '.env', 'videos/*']:
            if regla not in g:
                ROTO.append('.gitignore no bloquea %s' % regla)


def js_balanceado():
    for p in PANTALLAS + glob.glob('js/*.js'):
        s = leer(p)
        if p.endswith('.html'):
            s = ''.join(re.findall(r'<script(?![^>]*\ssrc)[^>]*>(.*?)</script>', s, re.S))
        for a, c in [('{', '}'), ('(', ')'), ('[', ']')]:
            if s.count(a) != s.count(c):
                ROTO.append('%s: %s%s desbalanceado (%d vs %d)'
                            % (p, a, c, s.count(a), s.count(c)))


def lo_que_falta_hacer():
    """No son errores: es la lista de lo que todavía no está."""
    for p in PANTALLAS:
        for n, linea in enumerate(leer(p).split('\n'), 1):
            m = re.search(r"alert\(\\?'(Acá[^'\\]{10,70})", linea)
            if m:
                AVISO.append('PENDIENTE %s:%d — %s...' % (p, n, m.group(1)[:52]))
            if 'prompt(' in linea:
                AVISO.append('PENDIENTE %s:%d — usa prompt(), conviene un formulario' % (p, n))


def main():
    for f in [enlaces_rotos, archivos_que_pide_cada_pantalla, todas_cargan_lo_comun,
              cada_pantalla_tiene_ayuda, componentes_sin_color_propio, temas_completos,
              archivos_huerfanos, sobras, config_de_vercel, secretos_a_la_vista, js_balanceado,
              lo_que_falta_hacer]:
        f()

    print('')
    print('  AUDITORIA DEL PROYECTO — %d pantallas' % len(PANTALLAS))
    print('  ' + '=' * 62)
    if ROTO:
        print('\n  ROTO (%d) — hay que arreglarlo:\n' % len(ROTO))
        for x in ROTO:
            print('    x  ' + x)
    else:
        print('\n  Nada roto.')
    if AVISO:
        print('\n  PENDIENTE (%d) — no rompe, falta hacerlo:\n' % len(AVISO))
        for x in AVISO:
            print('    -  ' + x)
    print('')
    return 1 if ROTO else 0


if __name__ == '__main__':
    sys.exit(main())
