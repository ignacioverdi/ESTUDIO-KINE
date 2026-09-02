/* ══════════════════════════════════════════════════════════════════════
   LA PANTALLA DE UN EJERCICIO

   Antes los ejercicios eran una lista con una casilla al lado: se tildaba
   "hecho" y listo. Servia para saber si lo hizo, no para saber COMO le
   fue.

   Ahora cada ejercicio se abre entero: el video arriba con su nombre, y
   debajo una fila por serie donde el paciente anota el peso que uso de
   verdad y las repeticiones que le salieron.

   POR QUE POR SERIE Y NO UNA SOLA VEZ
   ------------------------------------
   Tres series de 12 con 8 kilos no es lo mismo que 12 con 10, 12 con 8
   y 8 con 6. La segunda dice que se quedo sin fuerza en la ultima, y eso
   le dice al kinesiologo que la carga esta al limite. Con un solo numero
   esa informacion se pierde.

   EL DESCANSO ENTRE SERIES
   ------------------------
   Un boton de cuenta regresiva entre serie y serie. Sin eso la gente
   descansa lo que le parece, que suele ser menos de lo indicado, y el
   ejercicio deja de ser el que se le mando.
   ══════════════════════════════════════════════════════════════════════ */

var EJ = null;

function verEjercicioCompleto(indice){
  var prog = programaDe(L);
  var e = prog[indice];
  if(!e) return;
  EJ = {i: indice, e: e, series: +(e.series || 3), descanso: null, restante: 0};

  var caja = document.createElement('div');
  caja.className = 'ayuda-fondo';
  caja.id = 'cajaEj';
  caja.innerHTML = '<div class="ayuda-caja ej-caja"><div id="cuerpoEj"></div></div>';
  caja.addEventListener('click', function(ev){ if(ev.target === caja) cerrarEjercicio(); });
  document.body.appendChild(caja);
  document.body.style.overflow = 'hidden';
  pintarEjercicio();
}

function pintarEjercicio(){
  var e = EJ.e, pid = miPid();
  var hechas = seriesDe(pid, HOY, e.n) || {};
  var antes = ultimaVezQueLoHizo(pid, e.n);
  var v = (typeof videoIncrustado === 'function') ? videoIncrustado(e.video) : null;

  var cabecera;
  if(v && v.tipo === 'iframe'){
    cabecera = '<div class="ej-video"><iframe src="' + v.src + '" allowfullscreen '
      + 'allow="accelerometer;autoplay;encrypted-media;picture-in-picture"></iframe></div>';
  }else if(v && v.tipo === 'archivo'){
    cabecera = '<div class="ej-video"><video src="' + v.src + '" controls playsinline></video></div>';
  }else{
    cabecera = '<div class="ej-video ej-sinvideo"><span>Sin video</span></div>';
  }

  document.getElementById('cuerpoEj').innerHTML =
    '<button class="cerrar" onclick="cerrarEjercicio()" aria-label="Cerrar">&times;</button>'

    + cabecera
    + '<h2 class="ej-nombre">' + e.n + '</h2>'
    + '<p class="ej-dosis">' + dosis(e) + '</p>'
    + (e.nota ? '<div class="nota info" style="margin-bottom:14px">' + e.nota + '</div>' : '')
    + (antes
        ? '<div class="nota bien" style="margin-bottom:14px">La última vez ('
          + fechaCorta(antes.fecha) + ') usaste ' + antes.pesos.join(', ') + '.</div>'
        : '')

    /* La tabla: una fila por serie, con el descanso en el medio. */
    + '<div class="ej-tabla">'
    + '<div class="ej-cab"><span>Serie</span><span>Peso</span><span>Reps</span></div>'
    + filas(hechas)
    + '</div>'

    + '<div id="avisoEj"></div>'
    + '<button class="bt ancho" style="margin-top:16px" onclick="cerrarEjercicio()">Listo</button>';
}

function filas(hechas){
  var e = EJ.e, out = '';
  for(var i = 1; i <= EJ.series; i++){
    var h = hechas[i] || {};
    var completa = h.peso || h.reps;
    out += '<div class="ej-fila' + (completa ? ' hecha' : '') + '">'
      + '<span class="ej-n">' + i + '</span>'
      + '<input type="text" inputmode="decimal" value="' + (h.peso || '') + '" '
      + 'placeholder="' + (e.carga && e.carga !== '—' ? e.carga : 'kg') + '" '
      + 'onchange="anotar(' + i + ',\'peso\',this.value)">'
      + '<input type="text" inputmode="numeric" value="' + (h.reps || '') + '" '
      + 'placeholder="' + (e.reps || '') + '" '
      + 'onchange="anotar(' + i + ',\'reps\',this.value)">'
      + '</div>';

    if(i < EJ.series){
      out += '<button class="ej-descanso" id="desc' + i + '" onclick="descansar(' + i + ')">'
           + '&#9201; Descanso (60 s)</button>';
    }
  }
  return out;
}

function anotar(nro, campo, valor){
  anotarSerie(miPid(), HOY, EJ.e.n, nro, campo, (valor || '').trim());
  /* Al completar una serie se marca hecho el ejercicio, sin que tenga
     que tildar nada aparte. */
  var pid = miPid();
  if(!BASE.adherencia[pid][HOY].hechos) BASE.adherencia[pid][HOY].hechos = {};
  BASE.adherencia[pid][HOY].hechos[EJ.i] = true;
  guardar('kine/adherencia/' + pid + '/' + HOY + '/hechos/' + EJ.i, true);
  pintarEjercicio();
}

/* ── El descanso ──────────────────────────────────────────────────── */
function descansar(nro){
  if(EJ.descanso){ clearInterval(EJ.descanso); EJ.descanso = null; }
  EJ.restante = 60;
  var b = document.getElementById('desc' + nro);
  if(!b) return;
  b.classList.add('corriendo');
  function mostrar(){
    b.innerHTML = EJ.restante > 0
      ? '&#9201; ' + EJ.restante + ' s'
      : '&#10003; Dale con la siguiente';
  }
  mostrar();
  EJ.descanso = setInterval(function(){
    EJ.restante--;
    mostrar();
    if(EJ.restante <= 0){
      clearInterval(EJ.descanso); EJ.descanso = null;
      b.classList.remove('corriendo');
      b.classList.add('listo');
      /* Una vibracion corta: en el gimnasio nadie mira la pantalla
         esperando. Si el aparato no vibra, no pasa nada. */
      try{ if(navigator.vibrate) navigator.vibrate([120, 60, 120]); }catch(e){}
    }
  }, 1000);
}

function cerrarEjercicio(){
  if(EJ && EJ.descanso){ clearInterval(EJ.descanso); EJ.descanso = null; }
  var c = document.getElementById('cajaEj');
  if(c) c.remove();
  document.body.style.overflow = '';
  EJ = null;
  if(typeof pintar === 'function') pintar();
}
