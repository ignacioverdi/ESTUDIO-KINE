/* ══════════════════════════════════════════════════════════════════════
   ACCESO — dos puertas distintas para dos personas distintas

   EL KINESIOLOGO es el dueño. Ve todas las historias clinicas, la caja y
   los datos de todos. Entra con correo y contraseña, como corresponde.

   EL PACIENTE ve solo lo suyo. Si le pedimos crear una contraseña, la
   mitad no vuelve a entrar nunca: la olvida y no llama para recuperarla.
   Entra con su documento y su fecha de nacimiento.

   POR QUE DOCUMENTO MAS FECHA DE NACIMIENTO
   ------------------------------------------
   Son dos datos que la persona sabe siempre y nunca olvida. Y son dos,
   no uno: con el documento solo, cualquiera que lo tenga entra.

   SU LIMITE, DICHO CLARO
   ----------------------
   No es tan fuerte como una contraseña. Alguien que conozca el documento
   Y la fecha de nacimiento de un paciente podria ver su ficha. Es un
   canje deliberado: la alternativa real no es una contraseña fuerte, es
   que el paciente no entre nunca y el portal no sirva.

   Lo que se hace para compensar:
     · el paciente ve SOLO lo suyo, nunca la lista de pacientes
     · cada entrada queda registrada en la bitacora de accesos
     · el kinesiologo puede exigirle contraseña a quien quiera

   Si el estudio prefiere contraseña para todos, se cambia una linea:
   EXIGIR_CLAVE = true.
   ══════════════════════════════════════════════════════════════════════ */

var EXIGIR_CLAVE = false;

function sesion(){
  try{
    var t = localStorage.getItem('estudio_sesion');
    return t ? JSON.parse(t) : null;
  }catch(e){ return null; }
}

function guardarSesion(s){
  try{ localStorage.setItem('estudio_sesion', JSON.stringify(s)); }catch(e){}
  if(s && s.tipo === 'kine'){
    ponerRol('kine');
  }else if(s){
    ponerRol('jugador');
    try{ localStorage.setItem('estudio_pid', s.pid); }catch(e){}
    if(s.dorsal) ponerDorsal(s.dorsal);
  }
}

function salir(){
  try{
    localStorage.removeItem('estudio_sesion');
    localStorage.removeItem('estudio_pid');
  }catch(e){}
  if(typeof fbLogout === 'function'){ try{ fbLogout(); }catch(e){} }
  location.href = 'index.html';
}

/* ══════════════════════════════════════════════════════════════════════
   QUIEN ES, SE DECIDE ACA Y EN NINGUN OTRO LADO

   Varias pantallas preguntaban rol(), que no es quien entro: es lo que
   quedo guardado en ese navegador la ultima vez que alguien lo uso. Si
   el kinesiologo habia entrado antes en la computadora del consultorio,
   el paciente que entraba despues era tratado como kinesiologo.

   En la historia clinica eso decide QUIEN FIRMA cada asiento. Un asiento
   firmado por la persona equivocada en un documento legal es grave.
   ══════════════════════════════════════════════════════════════════════ */
function soyKine(){
  var s = sesion();
  return !!(s && s.tipo === 'kine');
}

function quienEntro(){
  var s = sesion();
  if(!s) return null;
  if(s.tipo === 'kine'){
    var P = (BASE.perfil || {});
    return {tipo:'kine', nombre: P.nombre || 'Kinesiólogo',
            ini: (P.nombre || 'K').split(' ').map(function(x){ return x[0]; }).join('').slice(0,2)};
  }
  var p = paciente(s.pid);
  return {tipo:'paciente', pid:s.pid, nombre: p ? p.nombre : 'Paciente',
          ini: p ? (p.dorsal ? '#' + p.dorsal : p.nombre[0]) : 'P'};
}


/* ── Normalizar el documento: la gente lo escribe con puntos ── */
function soloNumeros(t){ return String(t || '').replace(/\D/g, ''); }


/* ── ENTRAR COMO PACIENTE ─────────────────────────────────────────── */
function entrarPaciente(doc, nacimiento, clave){
  var d = soloNumeros(doc);
  if(!d) return {ok:false, motivo:'Escribí tu número de documento.'};
  if(!nacimiento) return {ok:false, motivo:'Elegí tu fecha de nacimiento.'};

  /* Con la base conectada, quien comprueba es Firebase. El portal no
     puede leer la lista de pacientes antes de que alguien entre: las
     reglas lo prohiben, y con razon. */
  if(typeof fbEntrarPaciente === 'function'){
    return fbEntrarPaciente(d, nacimiento).then(function(r){
      if(r.ok) guardarSesion({tipo:'paciente', pid:r.pid, desde:HOY});
      if(r.ok && typeof registrarAcceso === 'function')
        registrarAcceso(r.pid, 'ingreso del paciente');
      return r;
    });
  }

  var enc = null;
  BASE.pacientes.forEach(function(p){
    if(soloNumeros(p.doc) === d) enc = p;
  });

  /* Se contesta lo mismo si el documento no existe o si la fecha no
     coincide. Si dijeramos "ese documento no esta", cualquiera podria
     averiguar quien es paciente del estudio probando documentos. */
  if(!enc || enc.nacimiento !== nacimiento){
    return {ok:false, motivo:'No encontramos a nadie con esos datos. '
      + 'Revisá el documento y la fecha. Si nunca te diste de alta, hacelo primero.'};
  }

  if((EXIGIR_CLAVE || enc.clave) && enc.clave !== clave){
    return {ok:false, motivo:'La contraseña no coincide.'};
  }

  if(enc.consentimiento && enc.consentimiento.aceptado === false){
    return {ok:false, motivo:'Revocaste el consentimiento, así que el estudio no puede '
      + 'seguir mostrando tus datos. Hablalo con tu kinesiólogo.'};
  }

  guardarSesion({tipo:'paciente', pid:enc.id, dorsal:enc.dorsal || null, desde:HOY});
  if(typeof registrarAcceso === 'function') registrarAcceso(enc.id, 'ingreso del paciente');
  return {ok:true, destino:'mi.html', nombre:enc.nombre};
}


/* ── ENTRAR COMO KINESIOLOGO ──────────────────────────────────────── */
function entrarKine(usuario, clave){
  usuario = (usuario || '').trim().toLowerCase();
  if(!usuario || !clave) return {ok:false, motivo:'Completá el correo y la contraseña.'};

  /* Con Firebase conectado manda Firebase: la contraseña vive alla y
     este archivo no la ve nunca. */
  if(typeof fbEntrarKine === 'function'){
    return fbEntrarKine(usuario, clave);
  }

  var P = BASE.perfil || {};
  var correo = (P.email || 'vero@estudiokine.com').toLowerCase();
  var esperada = P.clave || 'estudio';

  if(usuario !== correo || clave !== esperada){
    return {ok:false, motivo:'El correo o la contraseña no coinciden.'};
  }
  guardarSesion({tipo:'kine', desde:HOY});
  return {ok:true, destino:'panel.html', nombre: P.nombre || 'Kinesiólogo'};
}


/* ── LA PUERTA CERRADA ────────────────────────────────────────────────
   Las pantallas publicas se marcan con PANTALLA PUBLICA en el HTML y no
   pasan por aca: el alta, el estado del portal y la propia entrada.    */
var PANTALLAS_LIBRES = ['index.html', 'alta.html', 'estado.html', ''];

function exigirSesion(){
  var actual = location.pathname.split('/').pop();
  if(PANTALLAS_LIBRES.indexOf(actual) >= 0) return true;
  if(sesion()) return true;
  location.replace('index.html?volver=' + encodeURIComponent(actual));
  return false;
}

/* Que un paciente no pueda entrar a una pantalla del kinesiologo
   escribiendo la direccion a mano. */
var PANTALLAS_DEL_KINE = ['panel.html','pacientes.html','caja.html','perfil.html',
                          'programa.html','cartel.html','pizarron.html','ejercicios.html',
                          'configuracion.html'];

function exigirKine(){
  var actual = location.pathname.split('/').pop();
  if(PANTALLAS_DEL_KINE.indexOf(actual) < 0) return true;
  var s = sesion();
  if(s && s.tipo === 'kine') return true;
  location.replace('mi.html');
  return false;
}
