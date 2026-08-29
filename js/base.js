/* ══════════════════════════════════════════════════════════════════════
   BASE — el encabezado y la navegación de todas las pantallas

   Cada página pone <body data-pag="panel"> y este archivo dibuja arriba
   la marca y abajo (en el celular) la barra. Así el menú se cambia en un
   solo lugar y no en nueve.
   ══════════════════════════════════════════════════════════════════════ */

var MENU = {
  kine: [
    {id:'panel',      t:'Panel',       ic:'▤', a:'panel.html'},
    {id:'agenda',     t:'Agenda',      ic:'▦', a:'agenda.html'},
    {id:'ficha',      t:'Lesiones',    ic:'✚', a:'lesiones.html'},
    {id:'pacientes',  t:'Pacientes',   ic:'◫', a:'pacientes.html'},
    {id:'historia',   t:'Historias',   ic:'▤', a:'historia.html'},
    {id:'programa',   t:'Programas',   ic:'≡', a:'programa.html'},
    {id:'caja',       t:'Caja',        ic:'◧', a:'caja.html'},
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

function armarCabecera(){
  var pag = document.body.dataset.pag || '';
  var r   = rol();
  var items = MENU[r === 'kine' ? 'kine' : 'jugador'];
  var quien = r === 'kine'
      ? {ini:'VR', txt:'Vero · kinesióloga'}
      : {ini:'#' + miDorsal(), txt:nombre(miDorsal())};

  var top = document.createElement('div');
  top.className = 'top';
  top.innerHTML =
    '<div class="top-in">'
    + '<a class="marca" href="index.html"><span class="sig"></span>'
    + '<span><b>ESTUDIO</b><span>Kinesiología del club</span></span></a>'
    + '<div class="quien"><span class="av">' + quien.ini + '</span>' + quien.txt + '</div>'
    + '<div class="quien" style="margin-left:0">' + botonAyuda(pag) + '</div>'
    + '</div>';

  var nav = document.createElement('div');
  nav.className = 'nav';
  nav.innerHTML = '<div class="nav-in">' + items.map(function(i){
      return '<a href="' + i.a + '"' + (i.id === pag ? ' class="on"' : '') + '>' + i.t + '</a>';
    }).join('') + '</div>';

  var abajo = document.createElement('nav');
  abajo.className = 'barra-abajo';
  abajo.innerHTML = items.map(function(i){
      return '<a href="' + i.a + '"' + (i.id === pag ? ' class="on"' : '') + '>'
           + '<span class="ic">' + i.ic + '</span>' + i.t + '</a>';
    }).join('');

  document.body.insertBefore(nav, document.body.firstChild);
  document.body.insertBefore(top, document.body.firstChild);
  document.body.appendChild(abajo);
}

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
document.addEventListener('DOMContentLoaded', armarCabecera);
