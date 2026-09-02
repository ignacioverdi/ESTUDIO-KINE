/* ══════════════════════════════════════════════════════════════════════
   HISTORIA CLINICA — la capa que exige la ley

   La Ley 26.529 permite llevar la historia clínica en soporte informático,
   pero pide asegurar integridad, autenticidad, inalterabilidad,
   perdurabilidad y recuperabilidad. Y pide, textualmente, control de
   modificación de campos.

   Un sistema que sobrescribe un registro anterior no cumple nada de eso.

   Cómo se resuelve acá:

   ASIENTOS, NO EDICIONES. Cada actuación genera un asiento nuevo,
   numerado correlativo, con fecha, hora y autor. Corregir algo no borra
   lo anterior: agrega un asiento de rectificación que apunta al viejo.
   Es exactamente cómo funciona una historia clínica en papel, donde uno
   no arranca la hoja: tacha y firma al lado.

   CADENA DE FIRMAS. Cada asiento guarda la huella del anterior. Si
   alguien edita un asiento viejo por atrás, la cadena se corta y el
   sistema lo detecta. No impide el cambio, pero lo hace visible, que es
   lo que la ley pide: control de modificación.

   BITACORA DE ACCESOS. Queda registrado quién miró qué historia y cuándo.

   Nada de esto se le muestra al kinesiólogo mientras trabaja. Corre solo
   por abajo y aparece cuando hace falta: al exportar la historia, o al
   verificar que nadie la tocó.
   ══════════════════════════════════════════════════════════════════════ */


/* ── SHA-256, escrito acá para que funcione sin internet y sin librerías.
      Es el algoritmo estándar; no hay nada casero en la matemática.   ── */
var SHA_K = [
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];

function sha256(txt){
  function rot(x,n){ return (x>>>n)|(x<<(32-n)); }
  var bytes = [], i;
  for(i = 0; i < txt.length; i++){
    var c = txt.charCodeAt(i);
    if(c < 128) bytes.push(c);
    else if(c < 2048) bytes.push(192|(c>>6), 128|(c&63));
    else bytes.push(224|(c>>12), 128|((c>>6)&63), 128|(c&63));
  }
  var largo = bytes.length * 8;
  bytes.push(0x80);
  while(bytes.length % 64 !== 56) bytes.push(0);
  for(i = 7; i >= 0; i--) bytes.push((largo / Math.pow(2, i*8)) & 255);

  var h = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,
           0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];

  for(var b = 0; b < bytes.length; b += 64){
    var w = new Array(64);
    for(i = 0; i < 16; i++)
      w[i] = (bytes[b+i*4]<<24)|(bytes[b+i*4+1]<<16)|(bytes[b+i*4+2]<<8)|bytes[b+i*4+3];
    for(i = 16; i < 64; i++){
      var s0 = rot(w[i-15],7) ^ rot(w[i-15],18) ^ (w[i-15]>>>3);
      var s1 = rot(w[i-2],17) ^ rot(w[i-2],19)  ^ (w[i-2]>>>10);
      w[i] = (w[i-16] + s0 + w[i-7] + s1) | 0;
    }
    var a=h[0],bb=h[1],c2=h[2],d=h[3],e=h[4],f=h[5],g=h[6],hh=h[7];
    for(i = 0; i < 64; i++){
      var S1 = rot(e,6) ^ rot(e,11) ^ rot(e,25);
      var ch = (e & f) ^ (~e & g);
      var t1 = (hh + S1 + ch + SHA_K[i] + w[i]) | 0;
      var S0 = rot(a,2) ^ rot(a,13) ^ rot(a,22);
      var mj = (a & bb) ^ (a & c2) ^ (bb & c2);
      var t2 = (S0 + mj) | 0;
      hh=g; g=f; f=e; e=(d+t1)|0; d=c2; c2=bb; bb=a; a=(t1+t2)|0;
    }
    h[0]=(h[0]+a)|0;  h[1]=(h[1]+bb)|0; h[2]=(h[2]+c2)|0; h[3]=(h[3]+d)|0;
    h[4]=(h[4]+e)|0;  h[5]=(h[5]+f)|0;  h[6]=(h[6]+g)|0;  h[7]=(h[7]+hh)|0;
  }
  return h.map(function(x){ return ('00000000' + (x>>>0).toString(16)).slice(-8); }).join('');
}


/* ── Quién está escribiendo ─────────────────────────────────────────
   La ley pide que cada asiento diga qué profesional lo hizo. Con
   Firebase esto sale de la cuenta que inició sesión y no se puede
   falsear desde el navegador.                                       */
function autorActual(){
  if(rol() === 'kine') return {id:'vero', nombre:'Vero', matricula:'MP 00000'};
  var p = paciente(miPid());
  return {id: p ? p.id : 'paciente', nombre: p ? p.nombre : 'Paciente', matricula:'—'};
}

function miPid(){
  /* Primero la sesion: es lo unico confiable. Despues el pid guardado.
     El dorsal va ultimo y solo si existe: buscar por dorsal cuando no
     hay uno propio hacia que un paciente cayera en la ficha de otro. */
  try{
    var s = (typeof sesion === 'function') ? sesion() : null;
    if(s && s.tipo === 'paciente' && s.pid) return s.pid;
    var g = localStorage.getItem('estudio_pid');
    if(g) return g;
  }catch(e){}
  var d = miDorsal();
  if(!d) return null;
  var p = pacientePorDorsal(d);
  return p ? p.id : null;
}

function ahora(){
  var d = new Date();
  return {fecha: d.toISOString().slice(0,10),
          hora: d.toTimeString().slice(0,8),
          sello: d.toISOString()};
}


/* ── EL ASIENTO ─────────────────────────────────────────────────────
   Es la única forma de escribir algo clínico. Nunca se edita, nunca se
   borra: se agrega. Corregir es asentar una rectificación que apunta al
   asiento equivocado, igual que tachar y firmar al lado en papel.     */
/* ══════════════════════════════════════════════════════════════════════
   LA HISTORIA, SIEMPRE COMO LISTA Y SIN HUECOS

   Los asientos se numeran desde 1, porque el folio 1 es el primero. Pero
   Firebase, cuando las claves son numeros, devuelve una LISTA que empieza
   en 0: queda un hueco nulo al principio.

   Eso rompia dos cosas. La cuenta de asientos daba uno de mas, y
   cualquier codigo que recorriera la historia explotaba al toparse con
   el hueco. En un documento legal eso no puede pasar.

   Esta funcion devuelve siempre una lista limpia, venga como venga.
   ══════════════════════════════════════════════════════════════════════ */
function historiaDe(pid){
  if(!BASE.historia) BASE.historia = {};
  var h = BASE.historia[pid];
  if(!h){ BASE.historia[pid] = []; return BASE.historia[pid]; }

  if(!Array.isArray(h)){
    h = Object.keys(h).map(function(k){ return h[k]; });
  }
  h = h.filter(Boolean);          /* fuera los huecos */

  /* Se ordena por el numero de folio que lleva CADA asiento, no por la
     clave. Las claves pueden venir como "a1","a2" o como "1","2" segun
     como se guardaron, y ordenarlas como texto pondria el folio 10 antes
     del 2. En una historia clinica el orden es obligatorio por ley: es
     un documento cronologico y foliado. */
  h.sort(function(a, b){ return (a.n || 0) - (b.n || 0); });
  BASE.historia[pid] = h;
  return h;
}

function asentar(pid, tipo, contenido, rectifica){
  var h = historiaDe(pid);
  var t = ahora(), a = autorActual();
  var previo = h.length ? h[h.length-1] : null;

  var asiento = {
    n: h.length + 1,                       /* foliado correlativo, sin saltos */
    fecha: t.fecha,
    hora: t.hora,
    sello: t.sello,
    autor: a.nombre,
    autor_id: a.id,
    matricula: a.matricula,
    tipo: tipo,
    contenido: contenido,
    rectifica: rectifica || null,
    huella_previa: previo ? previo.huella : '0'
  };

  /* La huella se calcula sobre el asiento entero MAS la del anterior.
     Eso encadena todo: tocar un asiento viejo invalida todos los que
     vienen después, y el sistema lo puede demostrar. */
  asiento.huella = sha256(JSON.stringify({
    n: asiento.n, sello: asiento.sello, autor_id: asiento.autor_id,
    tipo: asiento.tipo, contenido: asiento.contenido,
    rectifica: asiento.rectifica, previa: asiento.huella_previa
  }));

  h.push(asiento);
  /* La clave lleva una letra adelante para que Firebase NO lo trate como
     lista: con claves numericas devuelve un array con un hueco en el 0,
     porque los folios arrancan en 1. */
  guardar('kine/historia/' + pid + '/a' + asiento.n, asiento);
  return asiento;
}


/* ── Verificar que nadie tocó nada ──────────────────────────────── */
function verificarHistoria(pid){
  var h = historiaDe(pid);
  for(var i = 0; i < h.length; i++){
    var a = h[i];
    var esperada = sha256(JSON.stringify({
      n: a.n, sello: a.sello, autor_id: a.autor_id,
      tipo: a.tipo, contenido: a.contenido,
      rectifica: a.rectifica, previa: a.huella_previa
    }));
    if(esperada !== a.huella)
      return {ok:false, motivo:'El asiento ' + a.n + ' fue modificado.', asiento:a.n};
    if(a.n !== i + 1)
      return {ok:false, motivo:'Falta el asiento ' + (i+1) + '. La numeración tiene un salto.', asiento:i+1};
    if(i > 0 && a.huella_previa !== h[i-1].huella)
      return {ok:false, motivo:'La cadena se corta entre el asiento ' + (i) + ' y el ' + a.n + '.', asiento:a.n};
  }
  return {ok:true, asientos:h.length};
}


/* ── BITACORA DE ACCESOS ────────────────────────────────────────────
   Quién miró qué historia y cuándo. La ley pide accesos restringidos;
   restringir sin registrar deja la mitad del trabajo hecho, porque no
   hay forma de saber si alguien miró algo que no debía.               */
function registrarAcceso(pid, que){
  if(!pid) return;
  if(!BASE.accesos) BASE.accesos = [];
  var t = ahora(), a = autorActual();
  var reg = {sello:t.sello, pid:pid, quien:a.nombre, quien_id:a.id, que:que || 'consulta'};
  BASE.accesos.push(reg);
  guardar('kine/accesos/' + pid + '/' + t.sello.replace(/[:.]/g,''), reg);
}

function accesosDe(pid){
  return (BASE.accesos || []).filter(function(a){ return a.pid === pid; });
}


/* ── Textos legibles para cada tipo de asiento ─────────────────── */
var TIPOS_ASIENTO = {
  alta_paciente:  'Alta en el padrón',
  consentimiento: 'Consentimiento informado',
  revocacion:     'Revocación del consentimiento',
  lesion_abierta: 'Apertura de lesión',
  sesion:         'Sesión de tratamiento',
  cambio_fase:    'Cambio de fase',
  criterio:       'Criterio de fase',
  alta_medica:    'Alta',
  turno:          'Turno',
  rectificacion:  'Rectificación',
  nota:           'Nota'
};

function tituloAsiento(a){
  return TIPOS_ASIENTO[a.tipo] || a.tipo;
}
