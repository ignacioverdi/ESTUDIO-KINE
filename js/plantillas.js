/* ══════════════════════════════════════════════════════════════════════
   PLANTILLAS — lo que el sistema sabe de cada lesión

   Cuando el kinesiólogo abre una lesión nueva, no escribe los criterios
   de cada fase a mano: elige la zona y la gravedad, y el resto se llena
   solo. Después puede tocar lo que quiera.

   Esto es lo que convierte el portal en una herramienta y no en una
   planilla: el conocimiento vive acá, no en la cabeza de una persona.

   dias  — plazo estimado por grado de gravedad (1 leve, 4 grave)
   fases — los criterios que hay que cumplir para pasar de cada fase

   El plazo es una estimación para avisarle al entrenador, no una
   promesa. Quien manda es el criterio cumplido, no el calendario.
   ══════════════════════════════════════════════════════════════════════ */

var PLANTILLAS = {

  Tobillo: {
    diagnosticos: ['Esguince lateral grado I', 'Esguince lateral grado II',
                   'Esguince lateral grado III', 'Tendinopatía peroneos',
                   'Fractura por estrés', 'Otro'],
    dias: {1: 10, 2: 21, 3: 42, 4: 90},
    fases: {
      1: ['Dolor en reposo por debajo de 2 sobre 10',
          'Sin edema visible al comparar con el otro tobillo',
          'Camina sin cojear'],
      2: ['Dorsiflexión igual a la del lado sano',
          'Apoyo en un pie 30 segundos sin dolor',
          'Fuerza de eversión al 80% del lado sano'],
      3: ['Trote continuo 10 minutos sin dolor',
          'Salto en un pie sin dolor ni pérdida de equilibrio',
          'Aterrizaje silencioso y sin que la rodilla se meta hacia adentro'],
      4: ['Cambios de dirección a máxima velocidad',
          'Entrenamiento completo sin molestia al otro día',
          'Confía en el tobillo: sin miedo a apoyar']
    }
  },

  Rodilla: {
    diagnosticos: ['Esguince de ligamento lateral interno', 'Lesión meniscal',
                   'Rotura de ligamento cruzado anterior', 'Tendinopatía rotuliana',
                   'Síndrome femoropatelar', 'Otro'],
    dias: {1: 14, 2: 35, 3: 120, 4: 270},
    fases: {
      1: ['Dolor en reposo por debajo de 2 sobre 10',
          'Extensión completa de rodilla',
          'Contracción de cuádriceps sin retraso'],
      2: ['Flexión igual a la del lado sano',
          'Sentadilla a 60 grados sin dolor',
          'Fuerza de cuádriceps al 75% del lado sano'],
      3: ['Fuerza de cuádriceps al 90% del lado sano',
          'Salto horizontal al 90% de la pierna sana',
          'Aterrizaje sin que la rodilla se meta hacia adentro',
          'Trote continuo 20 minutos sin dolor'],
      4: ['Salto vertical al 95% de la pierna sana',
          'Cambios de dirección y frenadas a máxima velocidad',
          'Dos semanas de entrenamiento completo sin síntomas',
          'Sin miedo al gesto que lo lesionó']
    }
  },

  Hombro: {
    diagnosticos: ['Tendinopatía del supraespinoso', 'Inestabilidad anterior',
                   'Lesión del labrum', 'Bursitis subacromial',
                   'Pinzamiento subacromial', 'Otro'],
    dias: {1: 12, 2: 28, 3: 60, 4: 120},
    fases: {
      1: ['Dolor en reposo por debajo de 2 sobre 10',
          'Duerme sin despertarse por el hombro',
          'Movilidad pasiva sin dolor'],
      2: ['Rotación externa sin déficit',
          'Elevación completa sin encogerse de hombros',
          'Fuerza de manguito rotador al 80%'],
      3: ['Tolera trabajo de fuerza por encima de la cabeza',
          'Control de la escápula en todo el recorrido',
          'Tolera 30 repeticiones del gesto al 70%'],
      4: ['Tolera una serie completa a máxima intensidad',
          'Sin dolor al día siguiente',
          'Volumen completo dos entrenamientos seguidos']
    }
  },

  Muslo: {
    diagnosticos: ['Desgarro de isquiotibiales', 'Desgarro de cuádriceps',
                   'Desgarro de aductores', 'Contractura', 'Otro'],
    dias: {1: 10, 2: 24, 3: 45, 4: 80},
    fases: {
      1: ['Camina sin dolor',
          'Sin dolor al palpar la zona',
          'Contracción isométrica suave sin dolor'],
      2: ['Rango de movimiento igual al lado sano',
          'Fuerza isométrica al 80% sin dolor',
          'Trote suave sin molestia'],
      3: ['Trabajo excéntrico a carga completa',
          'Carrera al 80% sin molestia',
          'Fuerza al 90% del lado sano'],
      4: ['Sprint a máxima velocidad sin molestia',
          'Sin dolor al día siguiente',
          'Entrenamiento completo dos veces seguidas']
    }
  },

  Lumbar: {
    diagnosticos: ['Contractura paravertebral', 'Lumbalgia mecánica',
                   'Hernia discal', 'Espondilólisis', 'Otro'],
    dias: {1: 7, 2: 18, 3: 40, 4: 90},
    fases: {
      1: ['Dolor en reposo por debajo de 2 sobre 10',
          'Se levanta de la cama sin ayuda',
          'Sin dolor irradiado a la pierna'],
      2: ['Sin dolor en flexión completa',
          'Trabajo de core sin compensar',
          'Sentarse una hora sin molestia'],
      3: ['Tolera carga axial progresiva',
          'Control lumbopélvico bajo fatiga',
          'Trote continuo sin molestia'],
      4: ['Entrenamiento completo sin molestia',
          'Sin dolor al día siguiente',
          'Gestos de rotación y extensión sin miedo']
    }
  },

  Otra: {
    diagnosticos: ['Otro'],
    dias: {1: 10, 2: 21, 3: 45, 4: 90},
    fases: {
      1: ['Dolor en reposo por debajo de 2 sobre 10', 'Sin signos de inflamación'],
      2: ['Rango de movimiento igual al lado sano', 'Fuerza al 80% del lado sano'],
      3: ['Tolera carga específica del deporte', 'Sin dolor durante el trabajo'],
      4: ['Entrenamiento completo sin molestia', 'Sin dolor al día siguiente']
    }
  }
};

var ZONAS = ['Tobillo', 'Rodilla', 'Hombro', 'Muslo', 'Lumbar', 'Otra'];

var GRAVEDAD = [
  {n:1, t:'Leve',     d:'Molestia, entrena con cuidado'},
  {n:2, t:'Moderada', d:'Sale una o dos semanas'},
  {n:3, t:'Seria',    d:'Sale más de un mes'},
  {n:4, t:'Grave',    d:'Temporada comprometida'}
];

/* La fecha estimada de alta sale de la zona y la gravedad. Es lo primero
   que pregunta el entrenador y lo último que quiere calcular el kine. */
function altaEstimada(zona, gravedad, desde){
  var pl = PLANTILLAS[zona] || PLANTILLAS.Otra;
  var d = new Date(desde || HOY);
  d.setDate(d.getDate() + (pl.dias[gravedad] || 21));
  return d.toISOString().slice(0, 10);
}

/* Los criterios de la fase que toque, listos para tildar. */
function criteriosDe(zona, fase){
  var pl = PLANTILLAS[zona] || PLANTILLAS.Otra;
  return (pl.fases[fase] || pl.fases[1] || []).map(function(t){
    return {t: t, ok: false};
  });
}

/* La disponibilidad que ve el cuerpo técnico se deduce de la fase.
   Nadie la carga a mano: si el kine mueve la fase, el parte médico
   cambia solo y el entrenador se entera sin preguntar. */
function estadoPorFase(fase){
  if(fase >= 5) return 'ok';
  if(fase >= 4) return 'limitado';
  return 'baja';
}

/* ══════════════════════════════════════════════════════════════════════
   VIDEO — el reproductor del estudio

   Los videos NO viven en el portal: pesan demasiado y el repositorio se
   vuelve inmanejable. Viven en un servicio de video y acá se guarda solo
   el enlace, en kine/ejercicios/<id>/video.

   Acepta los tres caminos posibles, así la decisión de dónde alojarlos
   no frena el desarrollo y se puede cambiar sin tocar el código:

     YouTube oculto  gratis e ilimitado. El video no aparece en
                     búsquedas, pero quien tenga el enlace lo ve.
     Vimeo           pago. Permite que el video solo se reproduzca
                     desde el dominio del portal y en ningún otro lado.
     Archivo directo cualquier .mp4 accesible por enlace.

   Para arrancar conviene YouTube oculto con los primeros ejercicios:
   se valida que el kine y los pacientes realmente los usen, y recién
   ahí se paga por algo que ya se sabe que tiene uso.
   ══════════════════════════════════════════════════════════════════════ */

function videoIncrustado(url){
  if(!url) return null;
  var m;

  m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/);
  if(m) return {tipo:'iframe', src:'https://www.youtube-nocookie.com/embed/' + m[1] + '?rel=0'};

  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if(m) return {tipo:'iframe', src:'https://player.vimeo.com/video/' + m[1]};

  if(/\.(mp4|webm|mov)(\?|$)/i.test(url)) return {tipo:'archivo', src:url};

  return {tipo:'enlace', src:url};
}

function abrirVideo(nombre, url, nota){
  var v = videoIncrustado(url);
  var caja = document.createElement('div');
  caja.className = 'ayuda-fondo';
  caja.id = 'cajaVideo';

  var reproductor;
  if(!v){
    reproductor = '<div class="vacio"><b>Todavía sin video</b>'
      + 'Este ejercicio no tiene video cargado. Pedíselo al kinesiólogo '
      + 'o seguí la descripción de abajo.</div>';
  }else if(v.tipo === 'iframe'){
    reproductor = '<div style="position:relative;padding-top:56.25%;border-radius:var(--r);overflow:hidden">'
      + '<iframe src="' + v.src + '" style="position:absolute;inset:0;width:100%;height:100%;border:0" '
      + 'allow="accelerometer;autoplay;encrypted-media;picture-in-picture" allowfullscreen></iframe></div>';
  }else if(v.tipo === 'archivo'){
    reproductor = '<video src="' + v.src + '" controls playsinline preload="metadata" '
      + 'style="width:100%;border-radius:var(--r);background:#000"></video>';
  }else{
    reproductor = '<a class="bt ancho" href="' + v.src + '" target="_blank" rel="noopener" '
      + 'style="text-decoration:none;text-align:center">Abrir el video</a>';
  }

  caja.innerHTML =
    '<div class="ayuda-caja">'
    + '<button class="cerrar" onclick="cerrarVideo()" aria-label="Cerrar">&times;</button>'
    + '<span class="eti">Cómo se hace</span>'
    + '<h2>' + nombre + '</h2>'
    + reproductor
    + (nota ? '<div class="nota info" style="margin-top:16px">' + nota + '</div>' : '')
    + '<button class="bt ancho" style="margin-top:14px" onclick="cerrarVideo()">Listo</button>'
    + '</div>';

  caja.addEventListener('click', function(e){ if(e.target === caja) cerrarVideo(); });
  document.body.appendChild(caja);
  document.body.style.overflow = 'hidden';
}

function cerrarVideo(){
  var c = document.getElementById('cajaVideo');
  if(c) c.remove();               /* al sacarlo del documento el video se detiene */
  document.body.style.overflow = '';
}
