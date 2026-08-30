/* ══════════════════════════════════════════════════════════════════════
   DATOS — la única puerta a la base

   Ninguna pantalla habla con Firebase directo. Todas piden acá.
   Hoy devuelve los datos de ejemplo de abajo; el día que se enchufe
   Firebase se cambia el cuerpo de leer() y guardar() y no hay que
   tocar ninguna pantalla.

   Rutas reales (ver LEEME.md):
     kine/disponibilidad/<dorsal>
     kine/lesiones/<id>
     kine/agenda/turnos/<fecha>/<hora>
     kine/ejercicios/<id>
     kine/adherencia/<dorsal>/<fecha>
   ══════════════════════════════════════════════════════════════════════ */

var HOY = '2026-08-28';

/* ══════════════════════════════════════════════════════════════════════
   MODO DEMOSTRACION

   Todo lo que hay abajo es inventado: Marcela Ríos no existe.
   Sirve para mostrar el portal andando, pero es peligroso si se mezcla
   con pacientes de verdad: dentro de un mes nadie sabría cuál es cuál, y
   eso en una historia clínica no se puede permitir.

   Por eso mientras el modo demostración está encendido aparece un cartel
   arriba de todo, y hay un botón para vaciar todo y arrancar limpio.

   Al conectar Firebase esto se apaga solo: si la base trae pacientes de
   verdad, se usan esos y los inventados no se cargan nunca.
   ══════════════════════════════════════════════════════════════════════ */
function esDemo(){
  try{ return localStorage.getItem('estudio_vaciado') !== 'si'; }catch(e){ return true; }
}

/* Deja el portal en cero: sin pacientes, sin lesiones, sin turnos
   ocupados, sin caja. Conserva el horario, las plantillas de lesión y la
   biblioteca de ejercicios, que son la herramienta y no los datos. */
function vaciarTodo(){
  BASE.pacientes = [];
  BASE.lesiones = [];
  BASE.disponibilidad = {};
  BASE.programas = {};
  BASE.historia = {};
  BASE.accesos = [];
  BASE.caja = [];
  BASE.ejercicios = [];
  for(var d in BASE.agenda){
    BASE.agenda[d].forEach(function(t){
      delete t.pid; delete t.dorsal; delete t.tipo; delete t.estado;
    });
  }
  try{
    localStorage.setItem('estudio_vaciado', 'si');
    localStorage.removeItem('estudio_pid');
  }catch(e){}
  guardar('kine/_vaciado', {fecha: HOY, por: 'el estudio'});
}


var BASE = {

  club: 'Club Atlético — Estudio de kinesiología',

  plantel: [
    {d:1,  n:'Ferrari',  p:'Arquero'},   {d:4,  n:'Molina',  p:'Central'},
    {d:6,  n:'Acosta',   p:'Volante'},   {d:7,  n:'Duarte',  p:'Extremo'},
    {d:9,  n:'Suárez',   p:'Delantero'}, {d:10, n:'Peralta', p:'Enganche'},
    {d:11, n:'Godoy',    p:'Extremo'},   {d:12, n:'Ibarra',  p:'Lateral'},
    {d:14, n:'Ramos',    p:'Volante'},   {d:15, n:'Vera',    p:'Central'},
    {d:17, n:'Blanco',   p:'Lateral'},   {d:18, n:'Ojeda',   p:'Delantero'}
  ],

  /* ── EL PADRON ──────────────────────────────────────────────────
     Hasta acá la identidad era el dorsal, pero un paciente particular
     no tiene dorsal. Así que la clave pasa a ser un id propio, y el
     dorsal queda como un dato más de los que son del plantel.

     tipo: 'plantel'    juega en el club, tiene dorsal
           'particular' viene de afuera, paga por sesión

     estado: 'activo'    ya lo atendieron
             'pendiente' se dio de alta solo y el kine todavía no lo vio
     ──────────────────────────────────────────────────────────────── */
  pacientes: [
    {id:'P07', plan:'club', creditos:0, tipo:'plantel', dorsal:7,  nombre:'Tomás Duarte',
     nacimiento:'2003-04-12', doc:'44987123', tel:'11 5555 0107',
     email:'tduarte@mail.com', estado:'activo', alta:'2026-08-11',
     consentimiento:{aceptado:true, fecha:'2026-08-11'}},
    {id:'P12', plan:'club', creditos:0, tipo:'plantel', dorsal:12, nombre:'Nicolás Ibarra',
     nacimiento:'2001-09-30', doc:'43112876', tel:'11 5555 0112',
     email:'nibarra@mail.com', estado:'activo', alta:'2026-08-20',
     consentimiento:{aceptado:true, fecha:'2026-08-20'}},
    {id:'P15', plan:'club', creditos:0, tipo:'plantel', dorsal:15, nombre:'Julián Vera',
     nacimiento:'2004-01-18', doc:'45330091', tel:'11 5555 0115',
     email:'jvera@mail.com', estado:'activo', alta:'2026-08-24',
     consentimiento:{aceptado:true, fecha:'2026-08-24'}},

    {id:'P31', tipo:'particular', nombre:'Marcela Ríos',
     nacimiento:'1988-06-05', doc:'33772109', tel:'11 4444 8890',
     email:'mrios@mail.com', obra_social:'OSDE 210', estado:'activo',
     alta:'2026-08-19', motivo:'Dolor de hombro al nadar',
     ocupacion:'Arquitecta', deporte:'Natación', frecuencia:'3 veces por semana',
     antecedentes:'Cirugía de menisco izquierdo en 2019.',
     objetivos:'Volver a nadar 2000 metros sin dolor.',
     plan:'p10', creditos:6,
     consentimiento:{aceptado:true, fecha:'2026-08-19'}},
    {id:'P32', tipo:'particular', nombre:'Diego Sosa',
     nacimiento:'1975-11-22', doc:'24551038', tel:'11 3333 7712',
     email:'dsosa@mail.com', obra_social:'Swiss Medical', estado:'activo',
     alta:'2026-08-22', motivo:'Lumbalgia por trabajo de oficina',
     ocupacion:'Contador', deporte:'Ninguno', frecuencia:'Sedentario',
     antecedentes:'Hernia de disco L4-L5 diagnosticada en 2021, sin cirugía.',
     objetivos:'Trabajar ocho horas sentado sin dolor.',
     plan:'sesion', creditos:0,
     consentimiento:{aceptado:true, fecha:'2026-08-22'}},
    {id:'P33', tipo:'particular', nombre:'Camila Ferreyra',
     nacimiento:'2011-03-14', doc:'56920014', tel:'11 6666 2231',
     email:'flia.ferreyra@mail.com', obra_social:'Particular', estado:'pendiente',
     alta:'2026-08-28', motivo:'Esguince de rodilla jugando al hockey',
     ocupacion:'Estudiante', deporte:'Hockey', frecuencia:'4 veces por semana',
     antecedentes:'Sin antecedentes.', objetivos:'Volver a jugar el torneo de primavera.',
     plan:'p10', creditos:9,
     tutor:{nombre:'Laura Ferreyra', tel:'11 6666 2231', vinculo:'Madre'},
     consentimiento:{aceptado:true, fecha:'2026-08-28'}}
  ],

  /* Lo único que ve el cuerpo técnico. Sin diagnóstico: son datos de salud. */
  disponibilidad: {
    7:  {estado:'baja',     motivo:'tobillo', desde:'2026-08-11', hasta:'2026-09-15'},
    12: {estado:'limitado', motivo:'hombro',  desde:'2026-08-20', hasta:'2026-09-02'},
    15: {estado:'limitado', motivo:'lumbar',  desde:'2026-08-24', hasta:'2026-09-05'}
  },

  lesiones: [
    { id:'L1', pid:'P07', dorsal:7, zona:'Tobillo', lado:'derecho',
      diagnostico:'Esguince lateral grado II',
      mecanismo:'Caída tras disputa aérea, apoyo sobre el pie de un rival.',
      fecha:'2026-08-11', fase:2, estado:'activa', alta:'2026-09-15', kine:'Vero',
      criterios:[
        {t:'Dolor en reposo por debajo de 2 sobre 10', ok:true},
        {t:'Dorsiflexión igual a la del tobillo sano', ok:true},
        {t:'Apoyo en un pie 30 segundos sin dolor', ok:false},
        {t:'Fuerza de eversión al 80% del lado sano', ok:false}
      ],
      sesiones:[
        {f:'2026-08-26', t:'Tratamiento', pre:3, post:2, nota:'Movilidad articular e isométricos de eversión. Tolera bien.'},
        {f:'2026-08-24', t:'Tratamiento', pre:4, post:3, nota:'Bajó la inflamación. Sumamos carga en cadena cerrada.'},
        {f:'2026-08-21', t:'Tratamiento', pre:4, post:4, nota:'Sigue con edema. Drenaje y descarga.'},
        {f:'2026-08-12', t:'Evaluación',  pre:7, post:6, nota:'Esguince lateral grado II. Bota diez días.'}
      ]},

    { id:'L2', pid:'P12', dorsal:12, zona:'Hombro', lado:'derecho',
      diagnostico:'Tendinopatía del supraespinoso',
      mecanismo:'Sobrecarga por volumen de lanzamiento en la pretemporada.',
      fecha:'2026-08-20', fase:3, estado:'activa', alta:'2026-09-02', kine:'Vero',
      criterios:[
        {t:'Dolor al lanzar por debajo de 3 sobre 10', ok:true},
        {t:'Rotación externa sin déficit', ok:true},
        {t:'Tolera 30 lanzamientos al 70%', ok:true},
        {t:'Tolera una serie completa a máxima intensidad', ok:false}
      ],
      sesiones:[
        {f:'2026-08-27', t:'Gimnasio',    pre:2, post:2, nota:'Excéntricos de manguito rotador. Sin dolor.'},
        {f:'2026-08-25', t:'Tratamiento', pre:3, post:2, nota:'Liberación y trabajo escapular.'},
        {f:'2026-08-21', t:'Evaluación',  pre:5, post:4, nota:'Tendinopatía. Se corta el lanzamiento una semana.'}
      ]},

    { id:'L3', pid:'P15', dorsal:15, zona:'Lumbar', lado:'—',
      diagnostico:'Contractura paravertebral',
      mecanismo:'Carga acumulada: tres partidos en ocho días.',
      fecha:'2026-08-24', fase:4, estado:'activa', alta:'2026-09-05', kine:'Vero',
      criterios:[
        {t:'Sin dolor en flexión completa', ok:true},
        {t:'Trabajo de core sin compensar', ok:true},
        {t:'Entrenamiento completo sin molestia', ok:false}
      ],
      sesiones:[
        {f:'2026-08-27', t:'Campo',       pre:1, post:1, nota:'Entrenó parcial. Sin dolor.'},
        {f:'2026-08-25', t:'Tratamiento', pre:4, post:2, nota:'Descontracturante y activación de glúteo.'}
      ]}
  ],

  agenda: {
    '2026-08-28':[
      {h:'08:30', pid:'P07', dorsal:7,  tipo:'Tratamiento', estado:'atendido'},
      {h:'09:00', pid:'P12', dorsal:12, tipo:'Gimnasio',    estado:'atendido'},
      {h:'09:30', dorsal:null},
      {h:'10:00', pid:'P15', dorsal:15, tipo:'Campo',       estado:'reservado'},
      {h:'10:30', dorsal:null},
      {h:'11:00', pid:'P07', dorsal:7,  tipo:'Tratamiento', estado:'reservado'},
      {h:'11:30', dorsal:null},
      {h:'12:00', dorsal:null}
    ],
    '2026-08-31':[
      {h:'08:30', dorsal:null}, {h:'09:00', pid:'P12', dorsal:12, tipo:'Gimnasio', estado:'reservado'},
      {h:'09:30', dorsal:null}, {h:'10:00', dorsal:null},
      {h:'10:30', pid:'P15', dorsal:15, tipo:'Campo', estado:'reservado'},
      {h:'11:00', dorsal:null}, {h:'11:30', dorsal:null}, {h:'12:00', dorsal:null}
    ]
  },

  /* Programa domiciliario por lesión y por fase */
  programas: {
    'L1':{
      2:[ {n:'Movilidad de tobillo con banda', series:3, reps:'15', carga:'Banda verde', nota:'Rodilla adelante sin despegar el talón.', video:'https://www.youtube.com/watch?v=IODxDxX7oi4'},
          {n:'Eversión con banda',             series:3, reps:'12', carga:'Banda roja',  nota:'Volvé lento. Sin dolor.', video:'https://www.youtube.com/watch?v=IODxDxX7oi4'},
          {n:'Elevación de talones sentado',   series:3, reps:'20', carga:'5 kg',        nota:'Subí en 2 segundos, bajá en 4.'},
          {n:'Apoyo en un pie',                series:4, reps:'30 seg', carga:'Sin peso',nota:'Si te sale fácil, cerrá los ojos.', video:'https://www.youtube.com/watch?v=IODxDxX7oi4'} ],
      3:[ {n:'Elevación de talones de pie',    series:4, reps:'12', carga:'20 kg', nota:'Apoyo completo.'},
          {n:'Saltos en el lugar',             series:3, reps:'20', carga:'Peso corporal', nota:'Aterrizaje silencioso.'},
          {n:'Escalera de coordinación',       series:6, reps:'1 pasada', carga:'—', nota:'Contacto corto, mirada al frente.'} ]
    },
    'L2':{
      3:[ {n:'Rotación externa con banda',     series:4, reps:'12', carga:'Banda azul', nota:'Codo pegado al cuerpo.'},
          {n:'Remo con banda',                 series:3, reps:'15', carga:'Banda verde', nota:'Junto los omóplatos.'},
          {n:'Elevación en Y boca abajo',      series:3, reps:'10', carga:'1 kg', nota:'Sin subir el hombro a la oreja.'} ]
    },
    'L3':{
      4:[ {n:'Puente de glúteo',               series:3, reps:'15', carga:'Peso corporal', nota:'Apretar arriba 2 segundos.'},
          {n:'Plancha lateral',                series:3, reps:'30 seg', carga:'—', nota:'Cadera alineada.'},
          {n:'Bird dog',                       series:3, reps:'10 por lado', carga:'—', nota:'Sin mover la pelvis.'} ]
    }
  },

  /* Los circuitos armados en el pizarrón */
  ejercicios: [
    { id:'C1', nombre:'Circuito de reintegro — 4 postas',
      objetivo:'Tobillo · fase 4 · reintegro a la cancha',
      zona:'Tobillo', fase:4, cancha:'media' }
  ]
};

/* ── Quién está mirando ───────────────────────────────────────────────
   En producción sale de firebase.js: el rol vive en la base, atado al UID.
   Acá se puede cambiar desde la pantalla de inicio para probar las dos
   vistas sin tener que crear cuentas.                                   */
function rol(){
  try{ return localStorage.getItem('estudio_rol') || 'kine'; }catch(e){ return 'kine'; }
}
function ponerRol(r){ try{ localStorage.setItem('estudio_rol', r); }catch(e){} }
function miDorsal(){
  try{ return +(localStorage.getItem('estudio_dorsal') || 7); }catch(e){ return 7; }
}
function ponerDorsal(d){ try{ localStorage.setItem('estudio_dorsal', d); }catch(e){} }

/* ── Consultas ─────────────────────────────────────────────────────── */
var FASES = [
  {n:1, t:'Protección',   d:'Bajamos el dolor y protegemos la zona.'},
  {n:2, t:'Rango',        d:'Recuperás movilidad y fuerza. Todavía sin cancha.'},
  {n:3, t:'Readaptación', d:'Fuerza específica y aterrizajes. Empezás gimnasio.'},
  {n:4, t:'Reintegro',    d:'Volvés a la cancha de a poco, con volumen controlado.'},
  {n:5, t:'Alta',         d:'A competir sin restricciones.'}
];

function paciente(id){
  for(var i=0;i<BASE.pacientes.length;i++) if(BASE.pacientes[i].id===id) return BASE.pacientes[i];
  return null;
}
function pacientePorDorsal(d){
  for(var i=0;i<BASE.pacientes.length;i++)
    if(BASE.pacientes[i].dorsal===d) return BASE.pacientes[i];
  return null;
}
function nombrePaciente(L){
  var p = L.pid ? paciente(L.pid) : null;
  return p ? p.nombre : (L.dorsal ? nombre(L.dorsal) : 'Sin nombre');
}
function edad(nac){
  if(!nac) return null;
  var h = new Date(HOY), n = new Date(nac);
  var a = h.getFullYear() - n.getFullYear();
  var m = h.getMonth() - n.getMonth();
  if(m < 0 || (m === 0 && h.getDate() < n.getDate())) a--;
  return a;
}
function esMenor(nac){ var e = edad(nac); return e !== null && e < 18; }

/* Un id nuevo para cada alta. En producción lo da Firebase con push(),
   que garantiza que no se repita ni con dos altas al mismo tiempo. */
function nuevoIdPaciente(){
  var n = 34;
  BASE.pacientes.forEach(function(p){
    var x = parseInt(String(p.id).replace(/\D/g,''), 10);
    if(x >= n) n = x + 1;
  });
  return 'P' + n;
}

function jugador(d){
  for(var i=0;i<BASE.plantel.length;i++) if(BASE.plantel[i].d===d) return BASE.plantel[i];
  return {d:d, n:'#'+d, p:''};
}
function nombre(d){ return jugador(d).n; }
function lesionPorId(id){
  for(var i=0;i<BASE.lesiones.length;i++) if(BASE.lesiones[i].id===id) return BASE.lesiones[i];
  return null;
}
function lesionDe(d){
  for(var i=0;i<BASE.lesiones.length;i++)
    if(BASE.lesiones[i].dorsal===d && BASE.lesiones[i].estado==='activa') return BASE.lesiones[i];
  return null;
}
function estadoDe(d){ return (BASE.disponibilidad[d] || {estado:'ok'}); }
function dias(desde){ return Math.max(0, Math.round((new Date(HOY) - new Date(desde)) / 86400000)); }
function faltan(hasta){ return Math.max(0, Math.round((new Date(hasta) - new Date(HOY)) / 86400000)); }
function fechaCorta(f){
  var M = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  var p = String(f).split('-');
  return p[2].replace(/^0/,'') + ' ' + M[+p[1]-1];
}
/* Con año. En un documento clínico la fecha corta no alcanza: hay que
   poder leer un asiento cinco años después y saber de cuándo es. */
function fechaLarga(f){
  var M = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  var p = String(f).split('-');
  return p[2].replace(/^0/,'') + ' ' + M[+p[1]-1] + ' ' + p[0];
}
/* La dosis escrita en una línea, a partir de las tres partes. Antes era
   un texto suelto; separado se puede editar, filtrar y comparar. */
function dosis(e){
  if(e.d) return e.d;                       /* ejercicios viejos */
  var p = [];
  if(e.series) p.push(e.series + (e.series === 1 ? ' serie' : ' series'));
  if(e.reps)   p.push(e.reps);
  if(e.carga && e.carga !== '—') p.push(e.carga);
  return p.join(' · ');
}
function programaDe(L){
  var p = BASE.programas[L.id];
  return (p && p[L.fase]) ? p[L.fase] : [];
}
function criteriosListos(L){
  var n = 0; L.criterios.forEach(function(c){ if(c.ok) n++; }); return n;
}

/* ── Escritura ─────────────────────────────────────────────────────
   Hoy solo cambia lo que está en memoria. En producción es un fbSet
   a la ruta que devuelve rutaDe().                                  */
function guardar(ruta, valor){
  if(typeof fbSet === 'function'){ try{ fbSet(ruta, valor); }catch(e){} }
  try{ console.log('[guardar]', ruta, valor); }catch(e){}
}
