/* ══════════════════════════════════════════════════════════════════════
   AYUDA — el botón ? de cada pantalla

   El contenido vive todo acá, no repartido por los HTML. Una pantalla
   nueva se documenta agregando una entrada a AYUDA con la misma clave
   que su data-pag. Si no tiene entrada, el botón no aparece: mejor sin
   botón que con un botón que abre un cartel vacío.

   Cada entrada tiene:
     titulo  — qué es
     que_es  — una frase: para qué sirve
     pasos   — cómo se usa, en orden
     ojo     — la trampa, lo que nadie te dice hasta que la pisás
   ══════════════════════════════════════════════════════════════════════ */

var AYUDA = {

  inicio: {
    titulo: 'La puerta de entrada',
    que_es: 'Desde acá se entra al portal. El kinesiólogo ve el panel del estudio; el jugador ve solo lo suyo.',
    pasos: [
      ['Elegí cómo entrar', 'El kinesiólogo va al panel. El jugador va a su ficha, su turno y sus ejercicios.'],
      ['Si entrás como jugador, elegí cuál', 'Los tres primeros de la lista tienen una lesión abierta cargada.'],
      ['Los números de arriba', 'Cuántos están disponibles, limitados y de baja, en este momento.']
    ],
    ojo: 'Esta pantalla de elegir rol existe solo para probar. En el portal publicado el rol viene de la cuenta y nadie lo elige.'
  },

  panel: {
    titulo: 'El panel del estudio',
    que_es: 'Lo primero que abrís a la mañana: qué hay que resolver hoy y cómo está el plantel.',
    pasos: [
      ['Turnos de hoy', 'Los del día en orden. Tocá uno ocupado y se abre la ficha de esa persona.'],
      ['En tratamiento', 'Las lesiones abiertas, con la barra de fase y cuántos criterios lleva cumplidos.'],
      ['Parte médico', 'El plantel entero con su semáforo. Verde disponible, ámbar limitado, rojo de baja.']
    ],
    ojo: 'El parte médico es lo ÚNICO que ve el cuerpo técnico. El diagnóstico no aparece ahí a propósito: es un dato de salud y el entrenador no lo necesita para armar el equipo.'
  },

  ficha: {
    titulo: 'Las fichas de lesión',
    que_es: 'El corazón del portal. Cada lesión avanza por criterios cumplidos, no por días en el calendario.',
    pasos: [
      ['Abrí una ficha', 'De la lista, o tocando a alguien en el panel.'],
      ['Mirá la pista de fases', 'Cinco tramos. Los verdes ya pasaron, el marcado es donde está hoy.'],
      ['Tildá los criterios', 'A medida que se cumplen. El botón de avanzar se enciende solo cuando están todos.'],
      ['Al avanzar no escribís nada', 'Los criterios de la fase nueva aparecen solos, y el parte médico que ve el entrenador cambia con la fase.'],
      ['Cargá la sesión del día', 'Botón al final de la ficha. Elegís el tipo, tocás el dolor al llegar y al terminar, y la nota es opcional.']
    ],
    ojo: 'Los dos valores de dolor son obligatorios y la nota no: la diferencia entre el dolor al llegar y al terminar es el dato que muestra si la sesión sirvió. Al pasar de fase, los criterios se vacían y aparecen los de la fase nueva. Es a propósito: cada fase se gana de nuevo.'
  },

  agenda: {
    titulo: 'La agenda',
    que_es: 'Los turnos del estudio. La misma pantalla sirve para el kinesiólogo y para el jugador, pero cada uno ve cosas distintas.',
    pasos: [
      ['Elegí el día', 'Con las pestañas de arriba.'],
      ['Un turno ocupado', 'Si sos el kine, se abre la ficha. Si sos jugador, solo ves el tuyo.'],
      ['Un turno libre', 'El kine lo asigna a un dorsal. El jugador lo reserva para él.'],
      ['El horario del estudio', 'Abajo, solo para el kine. Cambia la grilla de toda la semana.']
    ],
    ojo: 'El jugador ve "ocupado" en los turnos de otros, nunca de quién son. No tiene por qué saber quién más se está tratando.'
  },

  mi: {
    titulo: 'Tu recuperación',
    que_es: 'Todo lo tuyo en una pantalla: en qué fase estás, cuándo es tu turno y qué te toca hacer hoy.',
    pasos: [
      ['Dónde estás', 'La barra de cinco tramos. Abajo dice exactamente qué te falta para pasar a la siguiente.'],
      ['Tu turno', 'El próximo que tenés reservado. Se cambia desde la agenda.'],
      ['Tus ejercicios', 'Tildá cada uno cuando lo hacés. Si no te acordás cómo era, tocá "ver video".'],
      ['Enviá al final', 'Marcá cuánto te dolió y qué tan exigente fue, y mandá.']
    ],
    ojo: 'Contestá con la verdad, aunque te haya dolido. Si decís que estuvo todo bien y no fue así, la carga de mañana se calcula mal y volvés para atrás.'
  },

  diario: {
    titulo: 'Cómo estás hoy',
    que_es: 'Cinco preguntas, medio minuto. Es la señal más temprana que tiene el kinesiólogo.',
    pasos: [
      ['Contestá las cinco', 'Sueño, cansancio, dolor muscular, ánimo y estrés.'],
      ['Después de entrenar, no antes', 'Si lo cargás antes, estás midiendo cómo amaneciste, no cómo te dejó el entrenamiento.'],
      ['Mirá tus últimos días', 'Abajo. Sirve para ver si venís mejorando o cayendo.']
    ],
    ojo: 'Si el dolor sube tres días seguidos, el kinesiólogo lo ve antes de que se lo cuentes. Por eso conviene cargarlo todos los días, no solo los malos.'
  },

  pizarron: {
    titulo: 'El pizarrón de circuitos',
    que_es: 'Para dibujar circuitos de readaptación en la cancha, con sus postas y sus consignas.',
    pasos: [
      ['Elegí la cancha', 'Entera, media, espacio reducido o gimnasio.'],
      ['Colocá elementos', 'Elegí uno de la izquierda y tocá la cancha. Cada casillero tiene el color de la superficie donde va.'],
      ['Movelos', 'Con "mover", arrastrás lo que ya está puesto.'],
      ['Dibujá los recorridos', 'Correr es flecha derecha, conducir es ondulada (con pelota), pase es punteada. Arrastrá de un punto a otro.'],
      ['Numerá las postas', 'Agregá una posta por estación y escribí qué se hace ahí.'],
      ['Guardá', 'Queda en la biblioteca y se puede sumar al programa de cualquier jugador.']
    ],
    ojo: 'El circuito se guarda como datos, no como imagen: posiciones, trazos y textos. Por eso después se puede animar, traducir o mostrar en el celular con el video al lado. Un PNG no permite nada de eso.'
  },

  alta: {
    titulo: 'Darse de alta',
    que_es: 'Se completa una sola vez. Después podés pedir turno y ver tus ejercicios desde el celular.',
    pasos: [
      ['Decí si sos del plantel', 'Si jugás en el club te pedimos el número de camiseta. Si venís por tu cuenta, la obra social.'],
      ['Tus datos', 'Nombre como figura en el documento, para que no queden dos fichas de la misma persona.'],
      ['Cómo ubicarte', 'El teléfono es el que importa: por ahí te llega el aviso del turno.'],
      ['Por qué venís', 'Contalo en tus palabras. El kinesiólogo lo lee antes de la primera sesión.'],
      ['Autorizá', 'Sin esa tilde no podemos guardar nada: es información de salud.']
    ],
    ojo: 'Si sos menor de edad te vamos a pedir los datos de un adulto responsable. No es un trámite: un menor no puede autorizar su propio tratamiento.'
  },

  pacientes: {
    titulo: 'El padrón',
    que_es: 'Todos los que pasaron por el estudio, del plantel y particulares. Se cargan solos.',
    pasos: [
      ['Repartí el enlace', 'Mandáselo por WhatsApp al paciente nuevo o dejalo en la recepción. Se completa en dos minutos.'],
      ['Mirá los que dicen "sin atender"', 'Son los que se dieron de alta y todavía no viste. Pasan a activo con la primera sesión.'],
      ['Buscá por nombre o documento', 'Con el buscador de arriba de la lista.'],
      ['Abrí una ficha', 'Tocá el paciente y desde ahí le abrís una lesión o le das turno.'],
      ['Abrir una lesión', 'Elegís zona, lado y gravedad. Los criterios de cada fase y la fecha estimada de alta se completan solos.']
    ],
    ojo: 'Vos no cargás datos a mano: los carga el paciente. Eso evita los errores de tipeo y te ahorra el trabajo administrativo, que es donde se va el tiempo del estudio.'
  },

  programa: {
    titulo: 'Cargar el programa',
    que_es: 'Los ejercicios que el paciente hace en casa, con series, repeticiones, carga y video.',
    pasos: [
      ['Elegí al paciente', 'Los que no tienen lesión abierta aparecen apagados: primero hay que abrirles una.'],
      ['Elegí la fase', 'Cada fase tiene su programa. Podés dejar armada la próxima antes de que llegue.'],
      ['Sumá de la biblioteca', 'Vienen con la dosis sugerida ya puesta. Los de la zona lesionada salen primero.'],
      ['Ajustá series, repeticiones y carga', 'Y pegá el enlace del video si lo tenés filmado.'],
      ['Guardá', 'En ese momento el paciente lo ve en el celular. No hay que avisarle nada.']
    ],
    ojo: 'Las repeticiones son texto libre a propósito: sirve tanto "12" como "30 seg" o "10 por lado". Forzar un número obligaría a inventar equivalencias falsas.'
  },

  perfil: {
    titulo: 'Tu perfil',
    que_es: 'Tu foto, el logo del estudio, tu matrícula y cómo te presentás. Es lo que ve el paciente.',
    pasos: [
      ['Subí tu foto', 'Se achica sola antes de guardarse, así no pesa.'],
      ['Subí el logo', 'Sale en el cartel del QR y en el encabezado.'],
      ['Completá la matrícula', 'Va impresa en la historia clínica: es un documento profesional.'],
      ['Contá quién sos', 'Escribilo como se lo contarías a alguien en la sala de espera, no como un currículum.']
    ],
    ojo: 'El teléfono que cargues acá es al que llegan los avisos de turno por WhatsApp. Si lo dejás vacío, ese botón no funciona.'
  },

  caja: {
    titulo: 'La caja del estudio',
    que_es: 'Lo que entra y lo que sale, los planes de cada paciente y el porcentaje de ausencias.',
    pasos: [
      ['Los cobros se anotan solos', 'Al asignar un plan y al marcar una sesión como atendida. Vos solo cargás los gastos.'],
      ['Asigná el plan', 'Sesión a sesión, plan de diez, mensual libre, asesoría online o premium. El de diez descuenta un crédito por sesión.'],
      ['Mirá quién se está quedando sin sesiones', 'Los que tienen dos o menos salen marcados en ámbar.'],
      ['El porcentaje de ausencias', 'Es el indicador que más plata mueve: cada hueco es una hora que no se recupera.']
    ],
    ojo: 'El crédito se descuenta cuando la sesión se marca como atendida, no cuando se reserva el turno. Si se descontara al reservar, una cancelación a tiempo le comería una sesión al paciente y terminarías discutiendo por WhatsApp.'
  },

  historia: {
    titulo: 'La historia clínica',
    que_es: 'El registro completo de todo lo que se hizo, en orden, numerado y firmado. Es un documento legal.',
    pasos: [
      ['Cada actuación es un asiento', 'Con número correlativo, fecha, hora y quién lo hizo. No se puede editar el pasado: corregir es agregar una rectificación.'],
      ['Verificá la integridad', 'El cartel de arriba dice si alguien tocó algo. Cada asiento guarda la huella del anterior, así que alterar uno se nota.'],
      ['Descargala en PDF', 'El paciente es el titular de su historia y puede pedir copia cuando quiera. Por ley hay 48 horas para dársela.'],
      ['Mirá quién la vio', 'Abajo está la lista de accesos. Restringir sin registrar deja la mitad del trabajo hecho.']
    ],
    ojo: 'La Ley 26.529 pide integridad, autenticidad, inalterabilidad, perdurabilidad y recuperabilidad. Un sistema que sobrescribe registros no cumple ninguna de las cinco. Por eso acá nunca se borra nada.'
  },

  cartel: {
    titulo: 'El cartel del estudio',
    que_es: 'Un cartel con código QR para pegar en la recepción. El paciente lo escanea y se carga solo.',
    pasos: [
      ['Imprimilo', 'Sale en blanco y negro, listo para una hoja A4. Pegalo donde entra la gente.'],
      ['O mandá el enlace', 'Con "compartir" en el celular, o directo por WhatsApp.'],
      ['Bajá el QR suelto', 'Si querés meterlo en un folleto o en una publicación.'],
      ['Después no hacés nada', 'El que se carga aparece en tu padrón marcado como "sin atender".']
    ],
    ojo: 'El código se genera dentro del portal, no en un sitio de afuera. Los generadores de QR de internet reciben la dirección que uno codifica: mandarles la del estudio es filtrar algo que no hace falta.'
  },

  ejercicios: {
    titulo: 'La biblioteca del estudio',
    que_es: 'Los circuitos dibujados y los ejercicios sueltos con su video. Se filma una vez y se reusa para siempre.',
    pasos: [
      ['Filtrá por zona', 'Con las pestañas: tobillo, rodilla, hombro, lumbar.'],
      ['Tocá un ejercicio', 'Se abre con su video, la dosis y a qué programa sumarlo.'],
      ['Dibujá uno nuevo', 'Desde el pizarrón. Aparece acá solo.']
    ],
    ojo: 'Los videos no se guardan en el portal: pesan demasiado. Van a un hosting de video y acá queda el enlace.'
  }
};


/* ── El botón y el panel ─────────────────────────────────────────── */

function botonAyuda(pag){
  if(!AYUDA[pag]) return '';
  return '<button class="ayuda-bt" onclick="abrirAyuda(\'' + pag + '\')" '
       + 'title="Cómo funciona esta pantalla" aria-label="Ayuda">?</button>';
}

function abrirAyuda(pag){
  var a = AYUDA[pag];
  if(!a) return;
  cerrarAyuda();

  var caja = document.createElement('div');
  caja.className = 'ayuda-fondo';
  caja.id = 'ayudaFondo';
  caja.setAttribute('role', 'dialog');
  caja.setAttribute('aria-modal', 'true');
  caja.innerHTML =
    '<div class="ayuda-caja">'
    + '<button class="cerrar" onclick="cerrarAyuda()" aria-label="Cerrar">&times;</button>'
    + '<span class="eti">Cómo funciona</span>'
    + '<h2>' + a.titulo + '</h2>'
    + '<p>' + a.que_es + '</p>'
    + a.pasos.map(function(p, i){
        return '<div class="ayuda-paso"><span class="nn">' + (i + 1) + '</span>'
             + '<div><b>' + p[0] + '</b><span>' + p[1] + '</span></div></div>';
      }).join('')
    + (a.ojo ? '<div class="nota aviso" style="margin:18px 0 0">' + a.ojo + '</div>' : '')
    + '<button class="bt ancho" style="margin-top:16px" onclick="cerrarAyuda()">Entendido</button>'
    + '</div>';

  /* cerrar tocando afuera, pero no adentro */
  caja.addEventListener('click', function(e){ if(e.target === caja) cerrarAyuda(); });
  document.body.appendChild(caja);
  document.body.style.overflow = 'hidden';
  var b = caja.querySelector('.cerrar'); if(b) b.focus();
}

function cerrarAyuda(){
  var v = document.getElementById('ayudaFondo');
  if(v) v.remove();
  document.body.style.overflow = '';
}

document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') cerrarAyuda();
});
