/* ══════════════════════════════════════════════════════════════════════
   MENSAJES — la vuelta que faltaba

   Hasta ahora el portal era de una sola direccion: el kinesiologo manda
   y el paciente cumple. Si al paciente le duele algo en el ejercicio 3,
   no tenia donde decirlo.

   DOS DECISIONES QUE HACEN LA DIFERENCIA
   ---------------------------------------
   1. Cada mensaje va ANCLADO a algo: a un ejercicio, a una sesion o a
      la lesion. "Esto me duele aca" colgado del ejercicio concreto vale
      diez veces mas que el mismo mensaje suelto en un chat.

   2. Se dice cuando se responde. Un chat sin expectativa es una trampa:
      el paciente escribe a las 3 de la mañana creyendo que alguien lo
      lee. Aca dice, en pantalla, que se responde antes del proximo turno
      y que para una urgencia hay que llamar por telefono.

   Todo mensaje queda en la historia clinica: es parte de la actuacion
   profesional, no una charla aparte.
   ══════════════════════════════════════════════════════════════════════ */

function mensajes(){
  if(!BASE.mensajes) BASE.mensajes = [];
  return BASE.mensajes;
}

function mensajesDe(pid){
  return mensajes().filter(function(m){ return m.pid === pid; })
                   .sort(function(a, b){ return a.sello < b.sello ? -1 : 1; });
}

function sinLeer(pid){
  return mensajes().filter(function(m){
    return (!pid || m.pid === pid) && m.de === 'paciente' && !m.leido;
  }).length;
}

function sinLeerPaciente(pid){
  return mensajes().filter(function(m){
    return m.pid === pid && m.de === 'kine' && !m.leido;
  }).length;
}

/* contexto: {tipo:'ejercicio'|'sesion'|'general', detalle:'Eversión con banda'} */
function escribirMensaje(pid, texto, contexto){
  texto = (texto || '').trim();
  if(!texto) return null;
  var t = (typeof ahora === 'function') ? ahora() : {sello:HOY, fecha:HOY, hora:''};
  var quien = soyKine() ? 'kine' : 'paciente';
  var m = {
    id: 'M' + String(Date.now()).slice(-8) + mensajes().length,
    pid: pid, de: quien, texto: texto,
    contexto: contexto || {tipo:'general', detalle:''},
    sello: t.sello, fecha: t.fecha, hora: t.hora, leido: false
  };
  mensajes().push(m);
  guardar('kine/mensajes/' + pid + '/' + m.id, m);

  if(typeof asentar === 'function'){
    asentar(pid, 'nota', 'Mensaje ' + (quien === 'kine' ? 'del kinesiólogo' : 'del paciente')
      + (m.contexto.detalle ? ' sobre "' + m.contexto.detalle + '"' : '')
      + ': ' + texto);
  }
  return m;
}

function marcarLeidos(pid, de){
  mensajes().forEach(function(m){
    if(m.pid === pid && m.de === de && !m.leido){
      m.leido = true;
      guardar('kine/mensajes/' + pid + '/' + m.id + '/leido', true);
    }
  });
}

function iconoContexto(c){
  if(!c) return '';
  if(c.tipo === 'ejercicio') return 'Sobre el ejercicio: ' + c.detalle;
  if(c.tipo === 'sesion')    return 'Sobre la sesión del ' + c.detalle;
  return '';
}


/* ── La conversación, dibujada ──────────────────────────────────── */
function abrirConversacion(pid, contexto){
  var p = paciente(pid);
  if(!p) return;
  var esKine = soyKine();
  marcarLeidos(pid, esKine ? 'paciente' : 'kine');

  var caja = document.createElement('div');
  caja.className = 'ayuda-fondo';
  caja.id = 'cajaMensajes';
  caja.innerHTML = '<div class="ayuda-caja"><div id="cuerpoMsj"></div></div>';
  caja.addEventListener('click', function(e){ if(e.target === caja) cerrarConversacion(); });
  document.body.appendChild(caja);
  document.body.style.overflow = 'hidden';
  window._ctxMsj = contexto || {tipo:'general', detalle:''};
  pintarConversacion(pid);
}

function pintarConversacion(pid){
  var p = paciente(pid), esKine = soyKine();
  var lista = mensajesDe(pid);
  var ctx = window._ctxMsj || {tipo:'general', detalle:''};

  document.getElementById('cuerpoMsj').innerHTML =
    '<button class="cerrar" onclick="cerrarConversacion()" aria-label="Cerrar">&times;</button>'
    + '<span class="eti">Mensajes</span>'
    + '<h2>' + (esKine ? p.nombre : 'Consultarle a Vero') + '</h2>'

    + (ctx.tipo !== 'general'
        ? '<div class="nota info">' + iconoContexto(ctx) + '</div>'
        : '')

    + '<div class="charla">'
    + (lista.length
        ? lista.map(function(m){
            var mio = (esKine && m.de === 'kine') || (!esKine && m.de === 'paciente');
            return '<div class="msj ' + (mio ? 'mio' : 'suyo') + '">'
              + (m.contexto && m.contexto.tipo !== 'general'
                  ? '<span class="ancla">' + iconoContexto(m.contexto) + '</span>' : '')
              + '<p>' + m.texto + '</p>'
              + '<span class="cuando">' + fechaCorta(m.fecha) + ' · ' + (m.hora || '').slice(0,5)
              + ' · ' + (m.de === 'kine' ? 'Vero' : p.nombre.split(' ')[0]) + '</span></div>';
          }).join('')
        : '<div class="vacio" style="padding:24px"><b>Todavía no hay mensajes</b>'
          + (esKine ? 'Escribile si querés.' : 'Escribí lo que quieras preguntar.') + '</div>')
    + '</div>'

    + '<label class="campo" style="margin-top:14px">'
    + '<span class="eti">' + (esKine ? 'Responder' : 'Tu consulta') + '</span>'
    + '<textarea id="txtMsj" placeholder="' + (esKine
        ? 'Probá con menos carga y contame cómo te fue.'
        : 'En el segundo ejercicio siento un tirón en la parte de atrás...') + '"></textarea></label>'
    + '<div id="avisoMsj"></div>'
    + '<button class="bt ancho" onclick="enviarMensaje(\'' + pid + '\')">Enviar</button>'

    /* Sin esto un chat es una trampa: el paciente escribe de madrugada
       creyendo que alguien lo lee. */
    + (esKine ? ''
        : '<div class="nota aviso" style="margin-top:14px">'
          + 'Vero responde antes de tu próximo turno. <b>Esto no es una guardia:</b> '
          + 'si te pasa algo urgente, llamá por teléfono.</div>');
}

function enviarMensaje(pid){
  var t = (document.getElementById('txtMsj').value || '').trim();
  if(t.length < 3){
    document.getElementById('avisoMsj').innerHTML =
      '<div class="nota aviso">Escribí algo antes de enviar.</div>';
    return;
  }
  escribirMensaje(pid, t, window._ctxMsj);
  window._ctxMsj = {tipo:'general', detalle:''};
  pintarConversacion(pid);
  var c = document.querySelector('.charla');
  if(c) c.scrollTop = c.scrollHeight;
}

function cerrarConversacion(){
  var c = document.getElementById('cajaMensajes');
  if(c) c.remove();
  document.body.style.overflow = '';
  if(typeof pintar === 'function') pintar();
}
