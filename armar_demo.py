#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Arma ESTUDIO.html: una sola pieza con todo el kit adentro.

Sirve para mostrar el portal sin descomprimir nada. El kit de varios
archivos sigue siendo el bueno para trabajar; esto se regenera con
  python3 armar_demo.py
cada vez que se toca una pantalla.
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
import io, os, re, json

KIT = '.'
# La lista NO se escribe a mano: se arma leyendo la carpeta. Escrita a
# mano, una pantalla nueva se olvida y el archivo unico queda sin ella.
# La clave de cada una sale de su data-pag, que es la misma que usan el
# menu y la ayuda.
import glob as _glob
PAGINAS = []
for _f in sorted(_glob.glob(os.path.join(KIT, '*.html'))):
    _n = os.path.basename(_f)
    if _n == 'ESTUDIO.html':
        continue
    _m = re.search(r'data-pag="([a-z]+)"', io.open(_f, encoding='utf-8').read())
    if _m:
        PAGINAS.append((_m.group(1), _n))

def leer(p):
    return io.open(os.path.join(KIT, p), encoding='utf-8').read()

def partir(html):
    """Devuelve (estilo propio de la pagina, cuerpo, script)."""
    estilo = '\n'.join(re.findall(r'<style>(.*?)</style>', html, re.S))
    cuerpo = re.search(r'<body[^>]*>(.*?)</body>', html, re.S).group(1)
    script = '\n'.join(re.findall(r'<script(?![^>]*\ssrc=)[^>]*>(.*?)</script>', cuerpo, re.S))
    cuerpo = re.sub(r'<script(?![^>]*\ssrc=)[^>]*>.*?</script>', '', cuerpo, flags=re.S).strip()
    return estilo, cuerpo, script

def adaptar(js):
    """Reemplaza lo que depende de tener una URL de verdad."""
    # cualquier parametro, no solo el 'f': escrito a mano se olvida uno
    js = re.sub(r"new URLSearchParams\(location\.search\)\.get\('(\w+)'\)",
                r"PARAM('\1')", js)
    js = re.sub(r"history\.replaceState\([^;]*\);", "PARAMSET('f', id);", js)
    js = re.sub(r"location\.href\s*=\s*'([a-z_]+\.html)'\s*;", r"irA('\1');", js)
    return js

paginas = {}
estilos_extra = []
for clave, arch in PAGINAS:
    est, cue, js = partir(leer(arch))
    if est:
        estilos_extra.append('/* %s */\n%s' % (arch, est))
    paginas[clave] = {'pag': clave, 'cuerpo': cue, 'js': adaptar(js)}

# del tema se saca solo el @import (va como <link>); el resto entra tal cual.
# Cortar por '*/' era fragil: un comentario interno se llevaba puestos los tokens.
tema = re.sub(r"@import url\([^)]*\);", '', leer('css/tema.css'))
_fuentes = re.findall(r"@import url\('([^']+)'\)", leer('css/tema.css'))
# los estilos propios de cada pantalla van AL FINAL, para que puedan
# pisar a los componentes cuando haga falta
css  = tema + '\n' + leer('css/estudio.css') + '\n' + '\n'.join(estilos_extra)
# Los archivos de js NO se nombran a mano: se leen todos los que haya.
# Escritos a mano, uno nuevo se olvida y el archivo unico queda roto sin
# que nada avise. Ya paso una vez con plantillas.js.
# El orden importa: datos define BASE y HOY, y el resto los usa.
ORDEN = ['datos.js', 'plantillas.js', 'base.js', 'ayuda.js']
_todos = sorted(os.path.basename(f) for f in _glob.glob(os.path.join(KIT, 'js', '*.js')))
_todos = [f for f in _todos if f != 'firebase.js']       # se copia del club, no va aca
_lista = [f for f in ORDEN if f in _todos] + [f for f in _todos if f not in ORDEN]

datos = leer('js/datos.js')
base  = '\n'.join(leer('js/' + f) for f in _lista if f != 'datos.js')
print('  js incluidos: ' + ', '.join(_lista))

# de base.js sacamos solo lo compartido; la cabecera la maneja el armazon
base = re.sub(r'function armarCabecera\(\)\{.*?\n\}\n', '', base, flags=re.S)
base = base.replace("document.addEventListener('DOMContentLoaded', armarCabecera);", '')
base = base.replace("function irA(url){ location.href = url; }", '')

SALIDA = u'''<!DOCTYPE html>
<html lang="es"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Estudio · Kinesiología del club</title>
<meta name="theme-color" content="#1D3E6E">
__FUENTES__
<style>
__CSS__
</style>
</head>
<body data-pag="inicio">

<div id="armazon"></div>
<div id="vista"></div>

<script>
__DATOS__
</script>
<script>
__BASE__
</script>
<script>
/* ══════════════════════════════════════════════════════════════════
   ARMAZÓN — solo existe en esta versión de un archivo.
   En el kit de varios archivos cada pantalla es un HTML propio y el
   navegador hace de router. Acá lo hacemos a mano.
   ══════════════════════════════════════════════════════════════════ */
var PAGINAS = __PAGINAS__;
var MAPA = __MAPA__;
var _params = {};
function PARAM(k){ return _params[k] || null; }
function PARAMSET(k, v){ if(v){ _params[k] = v; } else { delete _params[k]; } }

function irA(url){
  var p = String(url).split('?');
  var clave = MAPA[p[0]];
  if(!clave) return;
  _params = {};
  if(p[1]) p[1].split('&').forEach(function(x){ var y = x.split('='); _params[y[0]] = y[1]; });
  mostrar(clave);
}

function cabecera(pag){
  var r = rol();
  var items = MENU[r === 'kine' ? 'kine' : 'jugador'];
  var quien = r === 'kine' ? {ini:'VR', txt:'Vero · kinesióloga'}
                           : {ini:'#' + miDorsal(), txt:nombre(miDorsal())};
  document.getElementById('armazon').innerHTML =
    '<div class="top"><div class="top-in">'
    + '<a class="marca" href="#" onclick="irA(\\'index.html\\');return false"><span class="sig"></span>'
    + '<span><b>ESTUDIO</b><span>Kinesiología del club</span></span></a>'
    + '<div class="quien">'
    + '<span class="av">' + quien.ini + '</span>' + quien.txt
    + '&nbsp;' + botonAyuda(pag) + '</div>'
    + '</div></div>'
    + '<div class="nav"><div class="nav-in">' + items.map(function(i){
        return '<a href="#" onclick="irA(\\'' + i.a + '\\');return false"'
             + (i.id === pag ? ' class="on"' : '') + '>' + i.t + '</a>';
      }).join('') + '</div></div>';

  if(typeof esDemo === 'function' && esDemo() && !document.querySelector('.cartel-demo'))
    document.body.insertBefore(cartelDemo(), document.body.firstChild);

  var vieja = document.querySelector('.barra-abajo');
  if(vieja) vieja.remove();
  var ab = document.createElement('nav');
  ab.className = 'barra-abajo';
  ab.innerHTML = items.map(function(i){
      return '<a href="#" onclick="irA(\\'' + i.a + '\\');return false"'
           + (i.id === pag ? ' class="on"' : '') + '>'
           + '<span class="ic">' + i.ic + '</span>' + i.t + '</a>';
    }).join('');
  document.body.appendChild(ab);
}

function mostrar(clave){
  var p = PAGINAS[clave];
  if(!p) return;
  document.body.dataset.pag = p.pag;
  cabecera(p.pag);
  var v = document.getElementById('vista');
  v.innerHTML = p.cuerpo;
  /* La pantalla corre en el ámbito global, NO en una burbuja.
     Tiene que ser así: los botones usan onclick="miFuncion()" y eso se
     busca siempre en el ámbito global. Metido en una burbuja, ningún
     botón de ninguna pantalla funciona.
     Que dos pantallas tengan una función pintar() no molesta: solo hay
     una pantalla viva por vez y el código se vuelve a correr entero en
     cada navegación. */
  var sc = document.createElement('script');
  sc.textContent = p.js;
  document.getElementById('vista').appendChild(sc);
  scrollTo(0, 0);
}

/* los enlaces sueltos que quedaron dentro de las pantallas */
document.addEventListener('click', function(e){
  var a = e.target.closest('a[href$=".html"]');
  if(a){ e.preventDefault(); irA(a.getAttribute('href')); }
});

mostrar('inicio');
</script>
</body></html>
'''

SALIDA = SALIDA.replace('__FUENTES__', ''.join('<link href="%s" rel="stylesheet">' % u for u in dict.fromkeys(_fuentes)))
SALIDA = (SALIDA.replace('__CSS__', css)
                .replace('__DATOS__', datos)
                .replace('__BASE__', base)
                .replace('__PAGINAS__', json.dumps(paginas, ensure_ascii=False))
                .replace('__MAPA__', json.dumps({a: c for c, a in PAGINAS})))

io.open('ESTUDIO.html', 'w', encoding='utf-8').write(SALIDA)
print('ESTUDIO.html — %d KB, %d pantallas' % (len(SALIDA) / 1024, len(paginas)))
