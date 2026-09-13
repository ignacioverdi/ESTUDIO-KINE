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

   Las listas arrancan vacías: el portal está en uso real.
   Sirve para mostrar el portal andando, pero es peligroso si se mezcla
   con pacientes de verdad: dentro de un mes nadie sabría cuál es cuál, y
   eso en una historia clínica no se puede permitir.

   Por eso mientras el modo demostración está encendido aparece un cartel
   arriba de todo, y hay un botón para vaciar todo y arrancar limpio.

   Al conectar Firebase esto se apaga solo: si la base trae pacientes de
   verdad, se usan esos y los inventados no se cargan nunca.
   ══════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════
   VACIAR TIENE QUE VALER PARA TODOS

   Antes la marca de "ya vacié" vivia en el navegador de quien la toco.
   Resultado: el kinesiologo vaciaba en su computadora y vaciaba de
   verdad, pero desde otro aparato seguian apareciendo los seis pacientes
   inventados encima de los reales. Un desastre de confusion.

   Ahora la marca vive en la base, junto a los datos. Se vacia una vez y
   vale para todos los aparatos, siempre.
   ══════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════
   YA NO HAY DATOS DE DEMOSTRACION

   El portal traia pacientes inventados para que se viera funcionando
   antes de usarlo, con un cartel amarillo avisando que no eran reales.
   Ese cartel cumplio su funcion y ahora molesta: el estudio ya tiene
   pacientes de verdad.

   Se saco todo de raiz en vez de esconder el cartel. Un dato inventado
   escondido es peor que uno a la vista: aparece cuando nadie lo espera.

   Esta funcion queda devolviendo false para no romper lo que la llama.
   ══════════════════════════════════════════════════════════════════════ */
function esDemo(){
  return false;
}


/* Deja el portal en cero: sin pacientes, sin lesiones, sin turnos
   ocupados, sin caja. Conserva el horario, las plantillas de lesión y la
   biblioteca de ejercicios, que son la herramienta y no los datos. */
/* ══════════════════════════════════════════════════════════════════════
   VACIAR

   Estaba mal de dos formas, y entre las dos hicieron desaparecer un
   paciente cargado de verdad:

   1. Borraba ramas ENTERAS de la base (kine/pacientes de un saque). Las
      reglas dan permiso por paciente, no sobre la rama completa, asi que
      Firebase lo rechazaba y saltaba el cartel de "no se pudo guardar".

   2. Y eso corria en CADA carga de pantalla, no solo al apretar el
      boton: alcanzaba con abrir el portal para que intentara borrar
      todo otra vez y fallara otra vez.

   Ahora son dos cosas separadas. Limpiar la memoria no toca la base.
   Borrar de la base pasa SOLO cuando alguien aprieta el boton, y va
   paciente por paciente, que es como lo permiten las reglas.
   ══════════════════════════════════════════════════════════════════════ */

/* Solo la memoria de este aparato. No escribe nada. */
function vaciarLocal(){
  BASE.pacientes = [];
  BASE.lesiones = [];
  BASE.disponibilidad = {};
  BASE.programas = {};
  BASE.historia = {};
  BASE.accesos = [];
  BASE.caja = [];
  BASE.mensajes = [];
  BASE.estudios = {};
  BASE.adherencia = {};
  BASE.wellness = {};
  BASE.ejercicios = [];
  for(var d in BASE.agenda){
    (typeof turnosDe === 'function' ? turnosDe(d) : (BASE.agenda[d] || [])).forEach(function(t){
      delete t.pid; delete t.dorsal; delete t.tipo; delete t.estado; delete t.confirmado;
    });
  }
  BASE.vaciado = HOY;
  try{
    localStorage.setItem('estudio_vaciado', 'si');
    localStorage.removeItem('estudio_pid');
    localStorage.removeItem('estudio_datos');
  }catch(e){}
}

/* Borra de la base, hijo por hijo. Devuelve una promesa para poder
   avisar cuando termino de verdad y no antes. */
function vaciarLaBase(){
  if(typeof FB_URL === 'undefined' || typeof FB_SES === 'undefined'
     || !FB_SES || !FB_SES.idToken){
    return Promise.resolve({sinBase: true});
  }
  var tok = encodeURIComponent(FB_SES.idToken);
  var ramas = ['pacientes','lesiones','disponibilidad','programas','historia',
               'accesos','caja','mensajes','adherencia','wellness','estudios',
               'agenda','avisados'];
  var borrados = 0, fallaron = [];

  return Promise.all(ramas.map(function(r){
    return fetch(FB_URL + '/kine/' + r + '.json?auth=' + tok)
      .then(function(x){ return x.ok ? x.json() : null; })
      .then(function(d){
        if(!d) return;
        var hijos = Object.keys(d);
        return Promise.all(hijos.map(function(h){
          return fetch(FB_URL + '/kine/' + r + '/' + h + '.json?auth=' + tok, {method:'DELETE'})
            .then(function(x){ x.ok ? borrados++ : fallaron.push(r + '/' + h); });
        }));
      })
      .catch(function(){ fallaron.push(r); });
  })).then(function(){
    return {borrados: borrados, fallaron: fallaron};
  });
}

/* Se deja el nombre viejo para no romper nada que lo llame. */
function vaciarTodo(){
  vaciarLocal();
}


var BASE = {

  club: '',

  /* Los datos del profesional. Se editan en Mi perfil. */
  /* Los datos del estudio. Se editan en Mi perfil y de acá los toma
     TODO el portal: el encabezado, el cartel del QR, los mensajes al
     paciente y la historia clínica. */
  perfil: {
    nombre: 'Guido Verdi',
    matricula: '',
    estudio: 'Centro de Kinesiología',
    club: 'Centro de Kinesiología',
    cartel: '',
    tel: '11 5555 0000',
    email: 'guidoverdi91@gmail.com',
    clave: 'estudio',
    direccion: 'Av. Siempreviva 742',
    presentacion: 'Kinesióloga con quince años de trabajo en deporte. Me formé en '
      + 'readaptación de lesiones deportivas y trabajo con el plantel del club desde 2019. '
      + 'Atiendo también consultas particulares, con o sin lesión deportiva.',
    foto: null, logo: null
  },

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
  pacientes: [],

  /* Lo único que ve el cuerpo técnico. Sin diagnóstico: son datos de salud. */
  disponibilidad: {},

  lesiones: [],

  /* ── DE DONDE VIENE CADA PACIENTE ──────────────────────────────────
     Reemplaza a la obra social, que no se usaba para nada. Con esto el
     estudio ve cuantos pacientes le manda cada institucion, que es el
     numero que importa para saber de que vive.

     La lista se edita en Horarios: si mañana entra otro club, se agrega
     sin tocar el codigo.

     "usa_dorsal" marca las que tienen numero de camiseta. Un particular
     no tiene, y por eso el portal nunca se lo pide.                    */
  instituciones: [
    {nombre:'Boca Juniors', usa_dorsal:true},
    {nombre:'Beyond',       usa_dorsal:true},
    {nombre:'Fénix',        usa_dorsal:true},
    {nombre:'Particulares', usa_dorsal:false}
  ],

  /* El horario del estudio. De aca salen todos los turnos de todos los
     dias: no hay fechas escritas a mano. */
  horario: {
    minutos: 30,
    cerrado: [],
    /* Cada dia con sus franjas. Un dia sin franjas no se atiende.
       Se puede tener mañana y tarde, o cortar al mediodia. */
    semana: {
      0: [],
      1: [{abre:'08:30', cierra:'12:30'}, {abre:'16:00', cierra:'20:00'}],
      2: [{abre:'08:30', cierra:'12:30'}],
      3: [{abre:'08:30', cierra:'12:30'}, {abre:'16:00', cierra:'20:00'}],
      4: [{abre:'08:30', cierra:'12:30'}],
      5: [{abre:'08:30', cierra:'12:30'}, {abre:'16:00', cierra:'20:00'}],
      6: []
    }
  },

  /* Solo lo OCUPADO. Los horarios libres se calculan al momento. */
  agenda: {},

  /* Programa domiciliario por lesión y por fase */
  programas: {},

  /* Los circuitos armados en el pizarrón */
  ejercicios: []
};

/* ── Quién está mirando ───────────────────────────────────────────────
   En producción sale de firebase.js: el rol vive en la base, atado al UID.
   Acá se puede cambiar desde la pantalla de inicio para probar las dos
   vistas sin tener que crear cuentas.                                   */
function rol(){
  try{ return localStorage.getItem('estudio_rol') || 'kine'; }catch(e){ return 'kine'; }
}
function ponerRol(r){ try{ localStorage.setItem('estudio_rol', r); }catch(e){} }
/* ══════════════════════════════════════════════════════════════════════
   NUNCA DEVOLVER UN DORSAL QUE NO ES

   Esto devolvia 7 cuando el paciente no tenia dorsal propio. Y 7 es un
   jugador de verdad: un paciente particular entraba y veia la lesion de
   OTRA PERSONA, con su diagnostico.

   Era el peor error posible en este portal. Ahora, si no hay dorsal, se
   devuelve null y cada pantalla decide que mostrar; ninguna adivina.
   ══════════════════════════════════════════════════════════════════════ */
function miDorsal(){
  try{
    var d = localStorage.getItem('estudio_dorsal');
    return d ? +d : null;
  }catch(e){ return null; }
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
  var Ls = lista(BASE.lesiones);
  for(var i=0;i<Ls.length;i++) if(Ls[i].id===id) return sanearLesion(Ls[i]);
  return null;
}
/* Cada lesion se limpia UNA vez, al leerla. Asi todo el portal puede
   usar L.criterios y L.sesiones sin preguntarse de donde vinieron.
   Corregirlo en los treinta lugares que las usan seria pedir que nadie
   se olvide nunca; esto lo arregla en el origen. */
function sanearLesion(L){
  if(!L) return L;
  if(!Array.isArray(L.criterios)) L.criterios = lista(L.criterios);
  else L.criterios = L.criterios.filter(Boolean);
  if(!Array.isArray(L.sesiones)) L.sesiones = lista(L.sesiones);
  else L.sesiones = L.sesiones.filter(Boolean);
  return L;
}

function sanearTodasLasLesiones(){
  BASE.lesiones = lista(BASE.lesiones).map(sanearLesion);
  return BASE.lesiones;
}

function lesionDe(d){
  if(d === null || d === undefined) return null;   /* sin dorsal no se adivina */
  for(var i=0;i<BASE.lesiones.length;i++)
    if(BASE.lesiones[i].dorsal===d && BASE.lesiones[i].estado==='activa')
      return sanearLesion(BASE.lesiones[i]);
  return null;
}

/* La forma correcta de buscar la lesion de alguien: por su ficha, que es
   lo unico que identifica a todos. El dorsal solo lo tienen los del
   plantel, y ahi empezo el problema. */
function lesionDePid(pid){
  if(!pid) return null;
  for(var i=0;i<BASE.lesiones.length;i++)
    if(BASE.lesiones[i].pid===pid && BASE.lesiones[i].estado==='activa')
      return sanearLesion(BASE.lesiones[i]);
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
/* ── EL PESO QUE LEVANTO DE VERDAD ───────────────────────────────────
   El kinesiologo indica una carga; el paciente levanta la que puede. Esa
   diferencia es la que muestra si progresa, y hasta ahora no se anotaba
   en ningun lado.

   Se guarda por serie, no una sola por ejercicio: hacer 3 series de 12
   con 8 kilos no es lo mismo que hacer 12 con 10, 12 con 8 y 8 con 6.
   La segunda dice que se quedo sin fuerza, y eso importa.
   ─────────────────────────────────────────────────────────────────── */
function seriesDe(pid, fecha, ejercicio){
  var r = (BASE.adherencia || {})[pid];
  if(!r || !r[fecha] || !r[fecha].series) return null;
  return r[fecha].series[ejercicio] || null;
}

function anotarSerie(pid, fecha, ejercicio, nro, campo, valor){
  if(!BASE.adherencia) BASE.adherencia = {};
  if(!BASE.adherencia[pid]) BASE.adherencia[pid] = {};
  if(!BASE.adherencia[pid][fecha]) BASE.adherencia[pid][fecha] = {hechos:{}, series:{}};
  var d = BASE.adherencia[pid][fecha];
  if(!d.series) d.series = {};
  if(!d.series[ejercicio]) d.series[ejercicio] = {};
  if(!d.series[ejercicio][nro]) d.series[ejercicio][nro] = {};
  d.series[ejercicio][nro][campo] = valor;
  guardar('kine/adherencia/' + pid + '/' + fecha + '/series/' + ejercicio + '/' + nro, 
          d.series[ejercicio][nro]);
}

/* Lo que hizo la ultima vez, para que no tenga que acordarse. */
function ultimaVezQueLoHizo(pid, ejercicio){
  var r = (BASE.adherencia || {})[pid] || {};
  var fechas = Object.keys(r).sort().reverse();
  for(var i = 0; i < fechas.length; i++){
    if(fechas[i] === HOY) continue;
    var s = r[fechas[i]].series && r[fechas[i]].series[ejercicio];
    if(s){
      var pesos = Object.keys(s).map(function(k){ return s[k].peso; })
                    .filter(function(x){ return x; });
      if(pesos.length) return {fecha: fechas[i], pesos: pesos};
    }
  }
  return null;
}

function dosis(e){
  if(e.d) return e.d;                       /* ejercicios viejos */
  var p = [];
  if(e.series) p.push(e.series + (e.series === 1 ? ' serie' : ' series'));
  if(e.reps)   p.push(e.reps);
  if(e.carga && e.carga !== '—') p.push(e.carga);
  return p.join(' · ');
}
/* ── LOS DOS RELOJES DE UNA LESION ──────────────────────────────────
   No es lo mismo el tiempo desde que se lesiono que el tiempo que lleva
   tratandose, y el segundo es el que dice si el tratamiento avanza.

   Alguien que se rompio hace 90 dias pero empezo la rehabilitacion hace
   10 no esta atrasado: recien empieza. Con un solo numero eso no se ve,
   y es la diferencia entre apurar a un paciente o entenderlo.

   Si hubo cirugia, el reloj de la lesion cuenta desde la cirugia: es la
   fecha que usa toda la literatura de retorno al juego.               */
function diasDeLesion(L){
  if(!L) return 0;
  return dias(L.cirugia || L.fecha);
}

function inicioRehab(L){
  if(!L) return null;
  if(L.inicio_rehab) return L.inicio_rehab;
  var s = L.sesiones || [];
  if(!s.length) return null;
  return s.map(function(x){ return x.f; }).sort()[0];   /* la primera sesion */
}

function diasDeRehab(L){
  var i = inicioRehab(L);
  return i ? dias(i) : 0;
}

/* La espera entre la lesion y el comienzo del tratamiento. Cuando es
   larga vale la pena verla: explica por que alguien va lento. */
function diasDeEspera(L){
  var i = inicioRehab(L);
  if(!i) return null;
  return Math.max(0, Math.round((new Date(i) - new Date(L.cirugia || L.fecha)) / 86400000));
}

/* ── INSTITUCIONES ──────────────────────────────────────────────── */
function instituciones(){
  if(!BASE.instituciones || !BASE.instituciones.length){
    BASE.instituciones = [{nombre:'Particulares', usa_dorsal:false}];
  }
  return BASE.instituciones;
}

function institucionDe(p){
  if(!p) return 'Particulares';
  if(p.institucion) return p.institucion;
  /* Fichas viejas: las del plantel eran del club, el resto particulares. */
  return p.tipo === 'plantel' ? (instituciones()[0] || {}).nombre || 'Particulares'
                              : 'Particulares';
}

function usaDorsal(nombre){
  var r = false;
  instituciones().forEach(function(i){ if(i.nombre === nombre) r = !!i.usa_dorsal; });
  return r;
}

/* Cuantos pacientes tiene cada una. Es el numero que dice de que vive
   el estudio y de quien depende. */
function porInstitucion(){
  var cuenta = {};
  instituciones().forEach(function(i){ cuenta[i.nombre] = 0; });
  BASE.pacientes.forEach(function(p){
    var n = institucionDe(p);
    if(cuenta[n] === undefined) cuenta[n] = 0;
    cuenta[n]++;
  });
  return cuenta;
}

/* ══════════════════════════════════════════════════════════════════════
   TODA LISTA QUE VENGA DE LA BASE PASA POR ACA

   Firebase devuelve las listas como objetos, y si las claves son numeros
   que arrancan en 1 mete un hueco nulo en la posicion 0. Eso hizo que el
   programa de ejercicios, los criterios de fase y las sesiones
   explotaran apenas los datos venian de la base y no del archivo.

   En vez de acordarse en cada lugar, se limpia acá.
   ══════════════════════════════════════════════════════════════════════ */
function lista(x){
  if(!x) return [];
  if(Array.isArray(x)) return x.filter(function(v){ return v !== null && v !== undefined; });
  return Object.keys(x).map(function(k){ return x[k]; })
           .filter(function(v){ return v !== null && v !== undefined; });
}

/* ══════════════════════════════════════════════════════════════════════
   EL NOMBRE DEL ESTUDIO SALE DE UN SOLO LUGAR

   Estaba escrito a mano en diecisiete lugares: "Vero", "Club Atlético",
   "Kinesiología del club". El kinesiologo cargaba sus datos en Mi perfil
   y la mitad del portal seguia diciendo el nombre inventado.

   Ahora todo sale de estas tres funciones, que leen el perfil. Se cambia
   una vez y cambia en todas las pantallas.
   ══════════════════════════════════════════════════════════════════════ */
function nombreDelKine(){
  var P = BASE.perfil || {};
  return (P.nombre || '').trim() || 'tu kinesiólogo';
}

/* Solo el nombre de pila: es como le habla el paciente. */
function nombreCorto(){
  var n = nombreDelKine();
  return n === 'tu kinesiólogo' ? n : n.split(' ')[0];
}

function nombreDelEstudio(){
  var P = BASE.perfil || {};
  return (P.estudio || '').trim() || 'ESTUDIO';
}

/* La bajada del encabezado. Es el campo libre del perfil. */
function bajadaDelEstudio(){
  var P = BASE.perfil || {};
  if((P.club || '').trim()) return P.club.trim();
  if((P.nombre || '').trim()) return P.nombre.trim() + ' — Kinesiología';
  return 'Kinesiología';
}

/* ══════════════════════════════════════════════════════════════════════
   EL TITULO DEL CARTEL ES OTRA COSA

   El cartel se imprime y se pega en la pared del estudio. Tiene que
   decir QUIEN ATIENDE, no en que club juega el paciente.

   Usaba el mismo campo que el encabezado, y como ahi decia "Boca
   Juniors" el cartel salia con el nombre del club. Un paciente
   particular lo lee y no entiende adonde llegó.
   ══════════════════════════════════════════════════════════════════════ */
function tituloDelCartel(){
  var P = BASE.perfil || {};
  if((P.cartel || '').trim()) return P.cartel.trim();      /* si lo escribió a mano */
  var n = (P.nombre || '').trim();
  var e = (P.estudio || '').trim();
  if(n && e) return n + ' — ' + e;
  return n || e || 'Centro de Kinesiología';
}

function programaDe(L){
  if(!L) return [];
  var p = BASE.programas ? BASE.programas[L.id] : null;
  return lista(p ? p[L.fase] : null);
}

function criteriosDeLesion(L){
  return lista(L ? L.criterios : null);
}

function sesionesDe(L){
  return lista(L ? L.sesiones : null);
}

function criteriosListos(L){
  var n = 0;
  criteriosDeLesion(L).forEach(function(c){ if(c.ok) n++; });
  return n;
}

/* ── ESCRITURA Y PERSISTENCIA ───────────────────────────────────────

   Con Firebase conectado, guardar() escribe en la base y listo.

   Sin Firebase, el portal perdia TODO al cambiar de pantalla: cargabas
   un paciente, tocabas otra seccion y habia desaparecido. Para probarlo
   de verdad eso no sirve: parece que nada funciona.

   Por eso, mientras no haya Firebase, se guarda en el propio navegador.
   Es lo mismo que hace una libreta: queda en ese aparato y no se
   comparte. Alcanza de sobra para evaluar el portal antes de conectarlo.
   ─────────────────────────────────────────────────────────────────── */
var CLAVE_LOCAL = 'estudio_datos';

/* Lo que cambia con el uso. El resto (plantillas, planes, textos) es la
   herramienta y no hace falta guardarlo. */
var RAMAS = ['pacientes', 'lesiones', 'disponibilidad', 'programas', 'agenda', 'horario',
             'instituciones', 'faq', 'avisados',
             'temporadas', 'partidos', 'vaciado',
             'historia', 'accesos', 'caja', 'mensajes', 'adherencia', 'perfil',
             'ejercicios'];

function persistir(){
  if(typeof fbSet === 'function') return;      /* manda Firebase */
  if(typeof podarAgenda === 'function') podarAgenda();   /* no guardar dias vacios */
  try{
    var d = {};
    RAMAS.forEach(function(r){ if(BASE[r] !== undefined) d[r] = BASE[r]; });
    localStorage.setItem(CLAVE_LOCAL, JSON.stringify(d));
  }catch(e){}
}

function recuperar(){
  if(typeof fbSet === 'function') return;
  try{
    var t = localStorage.getItem(CLAVE_LOCAL);
    if(!t) return;
    var d = JSON.parse(t);
    RAMAS.forEach(function(r){ if(d[r] !== undefined) BASE[r] = d[r]; });
  }catch(e){}
}

function guardar(ruta, valor){
  if(typeof fbSet === 'function'){
    try{ fbSet(ruta, valor); }catch(e){}
    return;
  }
  persistir();
}

/* ══════════════════════════════════════════════════════════════════════
   BASE SIEMPRE SANA

   Veinticinco lugares del portal recorren listas de BASE. Corregirlos uno
   por uno seria pedir que nadie se olvide nunca, y ya fallamos cuatro
   veces asi: alcanza con que UNO quede sin arreglar para que la pantalla
   explote y el usuario vea un boton que "no hace nada".

   Se garantiza acá: lo que tiene que ser lista, es lista. Sin huecos.
   Se llama al arrancar y cada vez que llegan datos de la base.
   ══════════════════════════════════════════════════════════════════════ */
function sanearBase(){
  ['pacientes','lesiones','caja','accesos','instituciones','faq',
   'ejercicios','mensajes','plantel','temporadas','partidos'].forEach(function(r){
    if(BASE[r] !== undefined) BASE[r] = lista(BASE[r]);
  });

  /* Las de adentro tambien: cada lesion con sus criterios y sesiones. */
  BASE.lesiones.forEach(function(L){
    if(!L) return;
    L.criterios = lista(L.criterios);
    L.sesiones = lista(L.sesiones);
  });

  /* Los programas: una lista de ejercicios por lesion y fase. */
  Object.keys(BASE.programas || {}).forEach(function(id){
    Object.keys(BASE.programas[id] || {}).forEach(function(fase){
      BASE.programas[id][fase] = lista(BASE.programas[id][fase]);
    });
  });

  /* La historia, en orden de folio y sin huecos. */
  Object.keys(BASE.historia || {}).forEach(function(pid){
    var h = lista(BASE.historia[pid]);
    h.sort(function(a, b){ return (a.n || 0) - (b.n || 0); });
    BASE.historia[pid] = h;
  });

  /* Los estudios de cada paciente. */
  Object.keys(BASE.estudios || {}).forEach(function(pid){
    BASE.estudios[pid] = lista(BASE.estudios[pid]);
  });

  /* Los turnos de cada dia. */
  Object.keys(BASE.agenda || {}).forEach(function(f){
    var l = BASE.agenda[f];
    if(!Array.isArray(l)){
      l = Object.keys(l || {}).map(function(k){
        var t = l[k];
        if(t && typeof t === 'object' && !t.h) t.h = k;
        return t;
      });
    }
    BASE.agenda[f] = l.filter(Boolean).sort(function(a, b){ return a.h < b.h ? -1 : 1; });
  });

  /* Los partidos: cada uno con sus citados y sus lesiones. */
  lista(BASE.partidos).forEach(function(P){
    if(!P) return;
    P.citados = lista(P.citados);
    P.lesiones = lista(P.lesiones);
  });
  lista(BASE.temporadas).forEach(function(T){
    if(!T) return;
    T.plantel = lista(T.plantel);
  });

  /* Y las franjas horarias de cada dia de la semana. */
  if(BASE.horario && BASE.horario.semana){
    Object.keys(BASE.horario.semana).forEach(function(d){
      BASE.horario.semana[d] = lista(BASE.horario.semana[d]);
    });
  }
}

/* Se recupera apenas se carga, antes de que ninguna pantalla dibuje. */
recuperar();
sanearBase();
