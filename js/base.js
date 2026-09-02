/* ══════════════════════════════════════════════════════════════════════
   BASE — el encabezado y la navegación de todas las pantallas

   Cada página pone <body data-pag="panel"> y este archivo dibuja arriba
   la marca y abajo (en el celular) la barra. Así el menú se cambia en un
   solo lugar y no en nueve.
   ══════════════════════════════════════════════════════════════════════ */

/* ══════════════════════════════════════════════════════════════════
   LA VERSION, A LA VISTA

   Sin esto no habia forma de saber si lo que se publicaba llegaba al
   sitio o el navegador seguia mostrando algo viejo. Se pasaron horas
   arreglando a ciegas por no tener este numero en pantalla.

   Se cambia aca y en estado.html, y tiene que coincidir con lo que se
   ve arriba a la derecha del portal.
   ══════════════════════════════════════════════════════════════════ */
var VERSION_PORTAL = '2026-08-30-a';

var MENU = {
  kine: [
    {id:'panel',      t:'Panel',       ic:'▤', a:'panel.html'},
    {id:'agenda',     t:'Agenda',      ic:'▦', a:'agenda.html'},
    {id:'ficha',      t:'Lesiones',    ic:'✚', a:'lesiones.html'},
    {id:'pacientes',  t:'Pacientes',   ic:'◫', a:'pacientes.html'},
    {id:'historia',   t:'Historias',   ic:'▤', a:'historia.html'},
    {id:'programa',   t:'Programas',   ic:'≡', a:'programa.html'},
    {id:'caja',       t:'Caja',        ic:'◧', a:'caja.html'},
    {id:'configuracion', t:'Horarios',  ic:'◷', a:'configuracion.html'},
    {id:'perfil',     t:'Mi perfil',   ic:'◉', a:'perfil.html'},
    {id:'cartel',     t:'Cartel',      ic:'▧', a:'cartel.html'},
    {id:'pizarron',   t:'Pizarrón',    ic:'◈', a:'pizarron.html'},
    {id:'ejercicios', t:'Ejercicios',  ic:'☰', a:'ejercicios.html'}
  ],
  jugador: [
    {id:'mi',         t:'Mi recuperación', ic:'▤', a:'mi.html'},
    {id:'turnos',     t:'Mis turnos',      ic:'▦', a:'agenda.html'},
    {id:'diario',     t:'Cómo estoy',      ic:'◉', a:'diario.html'},
    {id:'historia',   t:'Mi historia',     ic:'▤', a:'historia.html'}
  ]
};

/* Si el estudio ya vació la demostración, los datos inventados no se
   vuelven a cargar nunca. Esto corre antes que cualquier pantalla.

   Con la base conectada la marca llega DESPUES, así que se vuelve a
   revisar cuando los datos bajan: sin eso, aparecían los inventados
   por un segundo y encima se mezclaban con los reales. */
function limpiarSiYaVacio(){
  if(typeof esDemo === 'function' && !esDemo() && typeof BASE !== 'undefined'){
    /* Se limpia la memoria, no la base: la base ya se vació una vez. */
    BASE.pacientes = BASE.pacientes || [];
    if(BASE.vaciado){
      ['lesiones','caja','accesos'].forEach(function(r){
        if(!Array.isArray(BASE[r])) BASE[r] = [];
      });
    }
  }
}
/* Si ya se vacio, se limpia la memoria de este aparato y NADA MAS.
   Antes esto llamaba al vaciado completo, que intentaba borrar ramas de
   la base en cada carga de pantalla: fallaba siempre y tapaba con un
   cartel rojo los avisos que si importaban. */
if(typeof esDemo === 'function' && !esDemo() && typeof vaciarLocal === 'function'){
  vaciarLocal();
}

/* Puerta cerrada: si no entro, no ve. Corre antes que nada.
   No se lanza un error para cortar: eso queda registrado como falla y
   ensucia la busqueda de errores de verdad. Se marca y se sale. */
var SIN_ENTRAR = false;
if(typeof exigirSesion === 'function'){
  if(!exigirSesion()) SIN_ENTRAR = true;
  else if(typeof exigirKine === 'function') exigirKine();
}

function armarCabecera(){
  var pag = document.body.dataset.pag || '';
  var q   = (typeof quienEntro === 'function') ? quienEntro() : null;
  var r   = q ? (q.tipo === 'kine' ? 'kine' : 'jugador') : rol();
  var items = MENU[r === 'kine' ? 'kine' : 'jugador'];
  var quien = q ? {ini:q.ini, txt:q.nombre}
                : {ini:'?', txt:'sin identificar'};

  var top = document.createElement('div');
  top.className = 'top';
  top.innerHTML =
    '<div class="top-in">'
    + '<a class="marca" href="index.html"><span class="sig"></span>'
    + '<span><b>ESTUDIO</b><span>Kinesiología del club</span></span></a>'
    + '<div class="quien"><a class="version" href="estado.html" '
    + 'title="Versión ' + VERSION_PORTAL + ' — estado del portal">v'
    + VERSION_PORTAL.slice(5) + '</a>'
    + '<span class="av">' + quien.ini + '</span>' + quien.txt + '</div>'
    + '<div class="quien" style="margin-left:0">' + botonAyuda(pag) + '</div>'
    + '</div>';

  var nav = document.createElement('div');
  nav.className = 'nav';
  nav.innerHTML = '<div class="nav-in">' + items.map(function(i){
      return '<a href="' + i.a + '"' + (i.id === pag ? ' class="on"' : '') + '>' + i.t + '</a>';
    }).join('')
    + '<a href="#" onclick="salir();return false" class="salir">Salir</a></div>';

  /* En el celular la fila de once secciones no entra: hay que barrer de
     costado para encontrar las del final. Se reemplaza por un boton que
     abre la lista entera. En la computadora la fila se ve bien y queda. */
  var actual = items.filter(function(i){ return i.id === pag; })[0] || items[0];
  var abajo = document.createElement('div');
  abajo.className = 'menu-movil';
  abajo.innerHTML =
    '<button class="menu-bt" onclick="abrirMenu()" aria-label="Menu">'
    + '<span class="hamburguesa"><i></i><i></i><i></i></span>'
    + '<span class="menu-actual">' + actual.t + '</span>'
    + '<span class="menu-flecha">&#9662;</span></button>'
    + '<div class="menu-lista" id="menuLista">'
    + items.map(function(i){
        return '<a href="' + i.a + '"' + (i.id === pag ? ' class="on"' : '') + '>'
             + '<span class="ic">' + i.ic + '</span>' + i.t
             + (i.id === pag ? '<span class="tilde">&#10003;</span>' : '') + '</a>';
      }).join('')
    /* Salir vive acá, no arriba: al lado del "?" eran dos círculos
       iguales y nadie distinguía cuál era cuál. */
    + '<a href="#" onclick="salir();return false" class="salir">'
    + '<span class="ic">&#8629;</span>Salir</a>'
    + '</div>';

  /* El orden importa y se arma de atras para adelante, porque cada uno
     se mete ANTES del anterior:

        cartel de demostracion
        marca y boton de ayuda
        fila de secciones        (solo en monitor)
        menu desplegable         (solo en celular)
        ...el contenido

     El desplegable iba con appendChild, o sea al FINAL de la pagina,
     debajo de todo el contenido: existia pero habia que bajar hasta el
     fondo para encontrarlo. Antes era una barra fija abajo y daba igual
     donde se insertara; al cambiarla por un desplegable, dejo de dar
     igual y no me di cuenta. */
  document.body.insertBefore(abajo, document.body.firstChild);
  document.body.insertBefore(nav, document.body.firstChild);
  document.body.insertBefore(top, document.body.firstChild);
  if(typeof esDemo === 'function' && esDemo())
    document.body.insertBefore(cartelDemo(), document.body.firstChild);
}

function cartelDemo(){
  var d = document.createElement('div');
  d.className = 'cartel-demo';
  d.innerHTML = '<span><b>Datos de demostración.</b> Marcela Ríos, Diego Sosa y los demás '
    + 'son inventados. Antes de cargar el primer paciente de verdad, vaciá todo.</span>'
    + '<a href="perfil.html">Vaciar y empezar</a>';
  return d;
}

function abrirMenu(){
  var l = document.getElementById('menuLista');
  if(l) l.classList.toggle('abierto');
}
/* Tocar fuera del menu lo cierra: si no, queda tapando la pantalla. */
document.addEventListener('click', function(e){
  var l = document.getElementById('menuLista');
  if(l && l.classList.contains('abierto') && !e.target.closest('.menu-movil'))
    l.classList.remove('abierto');
});

/* ── La pista de recuperación ──────────────────────────────────────
   El elemento firma del portal. Se usa igual en el panel, en la ficha
   y en la pantalla del jugador: una sola lectura para todos.        */
function pista(fase, conNombres){
  var vias = FASES.map(function(f){
    return '<i class="' + (f.n < fase ? 'hecho' : (f.n === fase ? 'ahora' : '')) + '"></i>';
  }).join('');
  var noms = conNombres === false ? '' :
    '<div class="pista-nom">' + FASES.map(function(f){
      return '<span class="' + (f.n === fase ? 'ahora' : '') + '">' + f.t + '</span>';
    }).join('') + '</div>';
  var solo = conNombres === false ? '' :
    '<div class="pista-solo">Fase ' + fase + ' de 5 · ' + FASES[fase-1].t + '</div>';
  return '<div class="pista"><div class="pista-vias">' + vias + '</div>' + noms + solo + '</div>';
}

/* ── Escala 0 a 10 ─────────────────────────────────────────────── */
function escala(caja, alElegir, valor){
  var h = '';
  for(var i = 0; i <= 10; i++)
    h += '<button type="button" data-v="' + i + '"' + (valor === i ? ' class="on"' : '') + '>' + i + '</button>';
  caja.className = 'escala';
  caja.innerHTML = h;
  caja.querySelectorAll('button').forEach(function(b){
    b.onclick = function(){
      caja.querySelectorAll('button').forEach(function(x){ x.classList.remove('on'); });
      b.classList.add('on');
      alElegir(+b.dataset.v);
    };
  });
}

/* ── Pestañas ───────────────────────────────────────────────────── */
function pestanias(alCambiar){
  document.querySelectorAll('.pest[data-p]').forEach(function(t){
    t.onclick = function(){
      document.querySelectorAll('.pest[data-p]').forEach(function(x){ x.classList.remove('on'); });
      document.querySelectorAll('.panel').forEach(function(x){ x.classList.remove('on'); });
      t.classList.add('on');
      var p = document.getElementById('p-' + t.dataset.p);
      if(p) p.classList.add('on');
      if(alCambiar) alCambiar(t.dataset.p);
    };
  });
}

function irA(url){ location.href = url; }
/* La entrada y el alta no llevan encabezado ni menu: quien las abre
   todavia no entro, o no es paciente todavia. Ponerle el menu del
   kinesiologo a la pantalla de login es raro y confunde. */
var SIN_CABECERA = ['index.html', 'alta.html', ''];
function llevaCabecera(){
  return SIN_CABECERA.indexOf(location.pathname.split('/').pop()) < 0;
}
if(!SIN_ENTRAR && llevaCabecera())
  document.addEventListener('DOMContentLoaded', armarCabecera);
