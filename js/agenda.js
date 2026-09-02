/* ══════════════════════════════════════════════════════════════════════
   AGENDA — los turnos de cualquier dia, para siempre

   Antes habia dos dias escritos a mano en los datos de ejemplo. Servia
   para mostrar como se veia, no para trabajar: no habia forma de dar un
   turno para el mes que viene.

   COMO FUNCIONA AHORA
   -------------------
   Los turnos NO se guardan todos. Se guarda solo lo que esta ocupado, y
   los horarios libres se calculan al momento a partir del horario del
   estudio.

   Eso importa: guardar cada horario libre de cada dia de cada año serian
   decenas de miles de registros vacios. Asi, un estudio con veinte turnos
   por semana guarda veinte cosas por semana.

   Consecuencia practica: se puede dar un turno para dentro de seis meses
   sin haber "creado" nada antes. La fecha existe siempre.
   ══════════════════════════════════════════════════════════════════════ */

var DIAS_NOMBRE  = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
var DIAS_CORTO   = ['do','lu','ma','mi','ju','vi','sá'];
var MESES_NOMBRE = ['enero','febrero','marzo','abril','mayo','junio',
                    'julio','agosto','septiembre','octubre','noviembre','diciembre'];

/* ── EL HORARIO, DIA POR DIA ────────────────────────────────────────
   Un solo horario para toda la semana no alcanza: un estudio atiende
   mañanas unos dias y tardes otros, o corta al mediodia. Cada dia tiene
   sus propias franjas, y pueden ser varias.

   franjas: [{abre:'08:30', cierra:'12:30'}, {abre:'16:00', cierra:'20:00'}]
   Un dia sin franjas es un dia que no se atiende.                     */
function horario(){
  if(!BASE.horario) BASE.horario = {};
  var h = BASE.horario;

  /* Los horarios viejos, de cuando era uno solo para toda la semana, se
     convierten sin perder nada. */
  if(h.abre && !h.semana){
    h.semana = {};
    [0,1,2,3,4,5,6].forEach(function(d){
      h.semana[d] = (h.dias || []).indexOf(d) >= 0
        ? [{abre:h.abre, cierra:h.cierra}] : [];
    });
  }
  if(!h.semana){
    h.semana = {
      0: [],
      1: [{abre:'08:30', cierra:'12:30'}, {abre:'16:00', cierra:'20:00'}],
      2: [{abre:'08:30', cierra:'12:30'}],
      3: [{abre:'08:30', cierra:'12:30'}, {abre:'16:00', cierra:'20:00'}],
      4: [{abre:'08:30', cierra:'12:30'}],
      5: [{abre:'08:30', cierra:'12:30'}, {abre:'16:00', cierra:'20:00'}],
      6: [],
      0: []
    };
  }
  if(!h.minutos) h.minutos = 30;
  if(!h.cerrado) h.cerrado = [];   /* feriados y vacaciones: 'AAAA-MM-DD' */
  return h;
}

function franjasDe(dia){
  return horario().semana[dia] || [];
}

function aMinutos(h){
  var p = String(h).split(':');
  return (+p[0]) * 60 + (+p[1] || 0);
}
function aHora(m){
  return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
}

function diaSemana(fecha){
  return new Date(fecha + 'T12:00:00').getDay();
}

function esDiaDeAtencion(fecha){
  var h = horario();
  if((h.cerrado || []).indexOf(fecha) >= 0) return false;
  return franjasDe(diaSemana(fecha)).length > 0;
}

/* Los horarios que existirian ese dia segun el horario del estudio. */
function horariosDe(fecha){
  if(!esDiaDeAtencion(fecha)) return [];
  var h = horario(), r = [];
  franjasDe(diaSemana(fecha)).forEach(function(f){
    for(var m = aMinutos(f.abre); m + h.minutos <= aMinutos(f.cierra); m += h.minutos){
      r.push(aHora(m));
    }
  });
  return r.sort();
}

/* Para separar mañana de tarde en la pantalla. */
function franjaDeHora(hora){
  return aMinutos(hora) < 13 * 60 ? 'Mañana' : 'Tarde';
}

/* ── LA AGENDA DE UN DIA ────────────────────────────────────────────
   Mezcla los horarios que existen con lo que ya esta reservado.
   Es la unica funcion que las pantallas deberian usar.              */
/* ══════════════════════════════════════════════════════════════════════
   LA AGENDA DE UN DIA, SIEMPRE COMO LISTA

   Firebase guarda las listas como objetos: lo que sale es
   {"0":{...},"1":{...}} y no [{...},{...}]. Un objeto no tiene forEach,
   asi que cualquier codigo que recorriera la agenda explotaba apenas los
   datos venian de la base en vez del archivo.

   Paso de verdad: el boton de borrar un paciente no abria NADA, y sin
   mirar la consola era imposible saber por que.

   Esta funcion devuelve siempre una lista, venga de donde venga. Todo el
   portal la usa en vez de tocar BASE.agenda directo.
   ══════════════════════════════════════════════════════════════════════ */
function turnosDe(fecha){
  var d = (BASE.agenda || {})[fecha];
  if(!d) return [];
  if(Array.isArray(d)) return d;
  return Object.keys(d).map(function(k){
    var t = d[k];
    if(t && typeof t === 'object' && !t.h) t.h = k;   /* la hora era la clave */
    return t;
  }).filter(Boolean).sort(function(a, b){ return a.h < b.h ? -1 : 1; });
}

function agendaDe(fecha){
  if(!BASE.agenda) BASE.agenda = {};
  var guardados = {};
  turnosDe(fecha).forEach(function(t){
    if(t.pid || t.dorsal || t.estado) guardados[t.h] = t;
  });

  var lista = horariosDe(fecha).map(function(h){
    return guardados[h] || {h: h};
  });

  /* Un turno guardado a una hora que ya no existe (porque cambio el
     horario del estudio) no se pierde: se muestra igual, marcado. */
  Object.keys(guardados).forEach(function(h){
    if(horariosDe(fecha).indexOf(h) < 0){
      var t = guardados[h];
      t.fuera_de_horario = true;
      lista.push(t);
    }
  });

  lista.sort(function(a, b){ return a.h < b.h ? -1 : 1; });
  BASE.agenda[fecha] = lista;
  return lista;
}

function ocupacionDe(fecha){
  var l = agendaDe(fecha);
  var ocupados = l.filter(function(t){ return t.pid || t.dorsal; }).length;
  return {total: l.length, ocupados: ocupados, libres: l.length - ocupados};
}

/* Antes de guardar se tiran los dias que quedaron sin nada: son
   horarios generados, no informacion. */
function podarAgenda(){
  if(!BASE.agenda) return;
  Object.keys(BASE.agenda).forEach(function(f){
    var hay = turnosDe(f).some(function(t){ return t.pid || t.dorsal || t.estado; });
    if(!hay) delete BASE.agenda[f];
  });
}

/* ── FECHAS ─────────────────────────────────────────────────────── */
function hoyISO(){ return HOY; }

function sumarDias(fecha, n){
  var d = new Date(fecha + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function mesDe(fecha){ return fecha.slice(0, 7); }

function nombreMes(mes){
  var p = mes.split('-');
  return MESES_NOMBRE[+p[1] - 1] + ' de ' + p[0];
}

function sumarMeses(mes, n){
  var p = mes.split('-'), m = (+p[1] - 1) + n, a = +p[0];
  a += Math.floor(m / 12); m = ((m % 12) + 12) % 12;
  return a + '-' + ('0' + (m + 1)).slice(-2);
}

/* La grilla del mes, empezando en lunes, con los huecos del principio
   y del final para que las columnas queden derechas. */
function grillaDelMes(mes){
  var p = mes.split('-'), a = +p[0], m = +p[1];
  var primero = new Date(a, m - 1, 1);
  var cuantos = new Date(a, m, 0).getDate();
  var arranque = (primero.getDay() + 6) % 7;      /* lunes = 0 */
  var celdas = [];
  for(var i = 0; i < arranque; i++) celdas.push(null);
  for(var d = 1; d <= cuantos; d++){
    celdas.push(mes + '-' + ('0' + d).slice(-2));
  }
  while(celdas.length % 7) celdas.push(null);
  return celdas;
}

function fechaLegible(f){
  var d = new Date(f + 'T12:00:00');
  return DIAS_NOMBRE[d.getDay()] + ' ' + d.getDate() + ' de ' + MESES_NOMBRE[d.getMonth()];
}


/* ── RESERVAR VARIAS SESIONES DE UNA ─────────────────────────────────
   Alguien que compra un plan de diez no quiere pedir turno diez veces:
   quiere dejar arreglado los martes y jueves a las diez.

   Busca hacia adelante los dias que correspondan, saltea los ocupados
   y los que el estudio no atiende, y reserva hasta juntar la cantidad.
   Devuelve lo que reservo y lo que no pudo, sin inventar nada.       */
function reservarSerie(pid, diasSemana, hora, cuantas, desde){
  var p = paciente(pid);
  if(!p) return {puestos: [], salteados: []};
  var puestos = [], salteados = [];
  var f = desde || sumarDias(HOY, 1);
  var vueltas = 0;

  while(puestos.length < cuantas && vueltas < 400){
    vueltas++;
    if(diasSemana.indexOf(diaSemana(f)) >= 0 && esDiaDeAtencion(f)){
      var lista = agendaDe(f);
      var libre = null;
      lista.forEach(function(t){ if(t.h === hora && !t.pid && !t.dorsal) libre = t; });
      if(libre){
        libre.pid = pid;
        libre.dorsal = p.dorsal || null;
        libre.tipo = 'Tratamiento';
        libre.estado = 'reservado';
        guardar('kine/agenda/turnos/' + f + '/' + hora,
                {pid: pid, dorsal: libre.dorsal, tipo: 'Tratamiento', estado: 'reservado'});
        puestos.push(f);
      }else{
        salteados.push(f);
      }
    }
    f = sumarDias(f, 1);
  }

  if(puestos.length && typeof asentar === 'function'){
    asentar(pid, 'turno', 'Se le reservaron ' + puestos.length + ' sesiones a las ' + hora
      + ', del ' + fechaCorta(puestos[0]) + ' al ' + fechaCorta(puestos[puestos.length - 1]) + '.');
  }
  return {puestos: puestos, salteados: salteados};
}

/* Los turnos de UNA persona. Ojo con el nombre parecido a turnosDe(fecha):
   este pide un paciente, aquel una fecha. */
function turnosDePaciente(pid, desdeHoy){
  var r = [];
  Object.keys(BASE.agenda || {}).sort().forEach(function(f){
    if(desdeHoy && f < HOY) return;
    turnosDe(f).forEach(function(t){
      if(t.pid === pid && t.estado === 'reservado') r.push({fecha: f, turno: t});
    });
  });
  return r;
}
