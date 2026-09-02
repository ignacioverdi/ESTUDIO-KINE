/* ══════════════════════════════════════════════════════════════════════
   EL ASISTENTE — lo primero que ve el paciente al escribir

   QUE ES Y QUE NO ES
   -------------------
   No es un robot que conversa ni que adivina. Es un menu de las cosas
   que el paciente pregunta siempre: dónde queda, a qué hora, qué llevar,
   cómo cancelar, cuánto sale. Responde al instante, sin molestar a
   nadie, y esas respuestas las escribe el kinesiólogo una sola vez.

   LA REGLA QUE NO SE ROMPE
   ------------------------
   NO responde nada clínico. Ni "me duele acá", ni "puedo entrenar", ni
   "es normal esto". Todo eso va derecho al kinesiólogo.

   Un texto automatico que le dice a alguien que su dolor es normal
   puede hacer daño de verdad, y encima lo dice sin haber visto nada.
   Por eso el asistente contesta lo administrativo y NADA MAS: para lo
   demas abre el mensaje y avisa cuando se responde.

   Es la diferencia entre ahorrarle tiempo al kinesiólogo y reemplazarlo
   mal.
   ══════════════════════════════════════════════════════════════════════ */

/* Las respuestas, editables desde Mi perfil. Vienen con un texto de
   arranque para que sirva desde el primer dia. */
function preguntasFrecuentes(){
  if(!BASE.faq){
    var P = BASE.perfil || {};
    BASE.faq = [
      {p:'¿Dónde queda el estudio?',
       r: P.direccion ? 'En ' + P.direccion + '.' : 'Preguntale la dirección a tu kinesiólogo.'},
      {p:'¿Qué llevo a la sesión?',
       r:'Ropa cómoda para moverte, calzado deportivo, una toalla y agua. Si tenés estudios '
        + '(ecografía, resonancia), traelos o sacales una foto.'},
      {p:'¿Cómo cambio o cancelo mi turno?',
       r:'Entrá a "Mis turnos" y tocá "No puedo". El lugar queda libre para otra persona. '
        + 'Avisá con tiempo si podés.'},
      {p:'¿Qué pasa si falto?',
       r:'No se te descuenta la sesión del plan. Pero si avisás con tiempo, ese turno se lo '
        + 'podemos dar a otro.'},
      {p:'¿Cuánto sale?',
       r:'Depende del plan. Preguntale al kinesiólogo y te lo pasa.'},
      {p:'¿Cómo veo mis ejercicios?',
       r:'En "Mi recuperación". Cada ejercicio se abre con su video, y ahí anotás el peso que '
        + 'usaste y las repeticiones que te salieron.'},
      {p:'Olvidé cómo entrar',
       r:'Entrás con tu documento (sin puntos) y tu fecha de nacimiento. No hay contraseña. '
        + 'Si no te reconoce, avisale al kinesiólogo: puede que haya quedado un dato mal '
        + 'cargado y lo corrige en el momento.'}
    ];
  }
  return BASE.faq;
}

/* Lo que NUNCA contesta el asistente. Si el paciente escribe algo con
   estas palabras, se le ofrece hablar con el kinesiologo directamente en
   vez de mostrarle una respuesta enlatada. */
var PALABRAS_CLINICAS = ['duele','dolor','molesta','molestia','hinch','inflam','punzada',
                         'tir[oó]n','crujido','no puedo','empeor','peor','sangr','fiebre',
                         'entren','jugar','correr','volver','alta','puedo hacer','es normal'];

function pareceClinico(txt){
  var t = (txt || '').toLowerCase();
  for(var i = 0; i < PALABRAS_CLINICAS.length; i++){
    if(new RegExp(PALABRAS_CLINICAS[i]).test(t)) return true;
  }
  return false;
}


function abrirAsistente(){
  var caja = document.createElement('div');
  caja.className = 'ayuda-fondo';
  caja.id = 'cajaAsis';
  caja.innerHTML = '<div class="ayuda-caja"><div id="cuerpoAsis"></div></div>';
  caja.addEventListener('click', function(e){ if(e.target === caja) cerrarAsistente(); });
  document.body.appendChild(caja);
  document.body.style.overflow = 'hidden';
  pintarAsistente();
}

function pintarAsistente(abierta){
  var P = BASE.perfil || {};
  var quien = (P.nombre || 'tu kinesiólogo').split(' ')[0];

  document.getElementById('cuerpoAsis').innerHTML =
    '<button class="cerrar" onclick="cerrarAsistente()" aria-label="Cerrar">&times;</button>'
    + '<span class="eti">Consultas</span>'
    + '<h2>¿Qué necesitás?</h2>'
    + '<p>Estas las respondo al instante. Para cualquier otra cosa te paso con ' + quien + '.</p>'

    + '<div class="faq">'
    + preguntasFrecuentes().map(function(f, i){
        return '<div class="faq-item' + (abierta === i ? ' abierta' : '') + '">'
          + '<button class="faq-p" onclick="pintarAsistente(' + (abierta === i ? 'null' : i) + ')">'
          + f.p + '<span>' + (abierta === i ? '&minus;' : '+') + '</span></button>'
          + (abierta === i ? '<div class="faq-r">' + f.r + '</div>' : '')
          + '</div>';
      }).join('')
    + '</div>'

    /* La salida hacia una persona, siempre visible. Un asistente que no
       tiene salida es una pared. */
    + '<div class="nota info" style="margin-top:16px">'
    + '<b>¿Es algo de tu tratamiento?</b><br>'
    + 'Si te duele algo, no entendés un ejercicio o no sabés si podés hacer algo, '
    + 'eso te lo contesta ' + quien + ', no yo.</div>'
    + '<button class="bt ancho" onclick="pasarAlKine()">Escribirle a ' + quien + '</button>';
}

function pasarAlKine(){
  cerrarAsistente();
  if(typeof abrirConversacion === 'function') abrirConversacion(miPid());
}

function cerrarAsistente(){
  var c = document.getElementById('cajaAsis');
  if(c) c.remove();
  document.body.style.overflow = '';
}
