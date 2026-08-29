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

  /* Lo único que ve el cuerpo técnico. Sin diagnóstico: son datos de salud. */
  disponibilidad: {
    7:  {estado:'baja',     motivo:'tobillo', desde:'2026-08-11', hasta:'2026-09-15'},
    12: {estado:'limitado', motivo:'hombro',  desde:'2026-08-20', hasta:'2026-09-02'},
    15: {estado:'limitado', motivo:'lumbar',  desde:'2026-08-24', hasta:'2026-09-05'}
  },

  lesiones: [
    { id:'L1', dorsal:7, zona:'Tobillo', lado:'derecho',
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

    { id:'L2', dorsal:12, zona:'Hombro', lado:'derecho',
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

    { id:'L3', dorsal:15, zona:'Lumbar', lado:'—',
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
      {h:'08:30', dorsal:7,  tipo:'Tratamiento', estado:'atendido'},
      {h:'09:00', dorsal:12, tipo:'Gimnasio',    estado:'atendido'},
      {h:'09:30', dorsal:null},
      {h:'10:00', dorsal:15, tipo:'Campo',       estado:'reservado'},
      {h:'10:30', dorsal:null},
      {h:'11:00', dorsal:7,  tipo:'Tratamiento', estado:'reservado'},
      {h:'11:30', dorsal:null},
      {h:'12:00', dorsal:null}
    ],
    '2026-08-31':[
      {h:'08:30', dorsal:null}, {h:'09:00', dorsal:12, tipo:'Gimnasio', estado:'reservado'},
      {h:'09:30', dorsal:null}, {h:'10:00', dorsal:null},
      {h:'10:30', dorsal:15, tipo:'Campo', estado:'reservado'},
      {h:'11:00', dorsal:null}, {h:'11:30', dorsal:null}, {h:'12:00', dorsal:null}
    ]
  },

  /* Programa domiciliario por lesión y por fase */
  programas: {
    'L1':{
      2:[ {n:'Movilidad de tobillo con banda', d:'3 series · 15 repeticiones', nota:'Rodilla adelante sin despegar el talón.'},
          {n:'Eversión con banda',             d:'3 series · 12 repeticiones', nota:'Volvé lento. Sin dolor.'},
          {n:'Elevación de talones sentado',   d:'3 series · 20 repeticiones', nota:'Subí en 2 segundos, bajá en 4.'},
          {n:'Apoyo en un pie',                d:'4 series · 30 segundos',     nota:'Si te sale fácil, cerrá los ojos.'} ],
      3:[ {n:'Elevación de talones de pie',    d:'4 series · 12 repeticiones', nota:'Con peso, apoyo completo.'},
          {n:'Saltos en el lugar',             d:'3 series · 20 saltos',       nota:'Aterrizaje silencioso.'},
          {n:'Escalera de coordinación',       d:'6 pasadas',                  nota:'Contacto corto, mirada al frente.'} ]
    },
    'L2':{
      3:[ {n:'Rotación externa con banda',     d:'4 series · 12 repeticiones', nota:'Codo pegado al cuerpo.'},
          {n:'Remo con banda',                 d:'3 series · 15 repeticiones', nota:'Junto los omóplatos.'},
          {n:'Elevación en Y boca abajo',      d:'3 series · 10 repeticiones', nota:'Sin subir el hombro a la oreja.'} ]
    },
    'L3':{
      4:[ {n:'Puente de glúteo',               d:'3 series · 15 repeticiones', nota:'Apretar arriba 2 segundos.'},
          {n:'Plancha lateral',                d:'3 series · 30 segundos',     nota:'Cadera alineada.'},
          {n:'Bird dog',                       d:'3 series · 10 por lado',     nota:'Sin mover la pelvis.'} ]
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
