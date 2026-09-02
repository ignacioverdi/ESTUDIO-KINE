/* ══════════════════════════════════════════════════════════════════════
   RECORDATORIOS DEL DIA SIGUIENTE

   POR QUE NO SON AUTOMATICOS, DICHO CLARO
   ----------------------------------------
   El portal son archivos que corren en el navegador de cada persona. No
   hay nada encendido a las ocho de la noche que pueda mandar un mensaje
   solo. Para eso haria falta un servidor propio y la API de WhatsApp
   Business, que cuesta y necesita aprobacion de Meta.

   LO QUE SI RESUELVE ESTO
   -----------------------
   Junta los turnos de mañana, arma el mensaje de cada uno y los manda de
   a uno con un toque. Treinta segundos para el dia entero, una vez.

   Y ademas lleva la cuenta: a quien ya le mandaste y quien confirmo. Sin
   eso, a la tercera persona uno ya no se acuerda por donde iba.

   MEJOR QUE AUTOMATICO, EN UN PUNTO
   ---------------------------------
   El mensaje sale del telefono del estudio, no de un numero desconocido.
   La gente lo lee y contesta ahi mismo, que es lo que uno quiere.
   ══════════════════════════════════════════════════════════════════════ */

function proximoDiaConTurnos(desde){
  var f = sumarDias(desde || HOY, 1), v = 0;
  while(v < 60){
    if(esDiaDeAtencion(f)){
      var hay = agendaDe(f).some(function(t){ return t.pid && t.estado === 'reservado'; });
      if(hay) return f;
    }
    f = sumarDias(f, 1); v++;
  }
  return null;
}

function turnosDelDia(fecha){
  return agendaDe(fecha).filter(function(t){
    return t.pid && t.estado === 'reservado';
  });
}

function yaAvisado(fecha, hora){
  if(!BASE.avisados) BASE.avisados = {};
  return !!(BASE.avisados[fecha] && BASE.avisados[fecha][hora]);
}

function marcarAvisado(fecha, hora){
  if(!BASE.avisados) BASE.avisados = {};
  if(!BASE.avisados[fecha]) BASE.avisados[fecha] = {};
  BASE.avisados[fecha][hora] = HOY;
  guardar('kine/avisados/' + fecha + '/' + hora, HOY);
}

/* El texto. Corto, con lo que la persona necesita y una sola cosa que
   hacer: avisar si no puede. Un recordatorio largo no se lee. */
function textoRecordatorio(p, fecha, hora){
  var P = BASE.perfil || {};
  return 'Hola ' + p.nombre.split(' ')[0] + '. Te recuerdo tu turno de kinesiología: '
    + fechaLegible(fecha) + ' a las ' + hora + '.'
    + (P.direccion ? ' En ' + P.direccion + '.' : '')
    + ' Si no vas a poder venir, avisame con tiempo así se lo doy a otra persona. Gracias.';
}

function abrirWhatsapp(p, fecha, hora){
  var tel = String(p.tel || '').replace(/\D/g, '');
  if(!tel) return false;
  /* Los numeros argentinos se escriben de mil formas. Si no tiene el
     codigo de pais, se le agrega: sin eso WhatsApp no abre el chat. */
  if(tel.length <= 11 && tel.indexOf('54') !== 0) tel = '54' + tel;
  window.open('https://wa.me/' + tel + '?text='
              + encodeURIComponent(textoRecordatorio(p, fecha, hora)), '_blank');
  marcarAvisado(fecha, hora);
  return true;
}
