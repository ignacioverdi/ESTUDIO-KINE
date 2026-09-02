// ============================================================================
//  NÄFELS VOLEY — Sincronización con Firebase + Login
//  Base de datos propia de NÄFELS (creada 14/06/2026)
//
//  Mantiene la MISMA interfaz de siempre (fbSet, fbGet, fbPush, fbKey) y TODA
//  la capa de permisos por rol que ya existía, así que ninguna página cambia.
//  Lo nuevo: cada lectura y cada escritura viajan firmadas con la sesión del
//  usuario, y si no hay sesión aparece una pantalla de ingreso.
//
//  Se entra una vez por dispositivo; la sesión se renueva sola.
//  Sin internet, la app sigue andando con lo último que quedó guardado.
// ============================================================================

/* ══════════════════════════════════════════════════════════════════════
   AQUI VAN LOS DATOS DE TU BASE DE FIREBASE

   Estas tres lineas son lo UNICO que hay que completar. Se sacan de
   la consola de Firebase, en Configuracion del proyecto.

   La clave se llama "publica" a proposito: va a la vista en cualquier
   aplicacion web y no es un secreto. Lo que protege los datos son las
   REGLAS de la base, que estan al final de este archivo listas para
   copiar y pegar.

   Mientras estas lineas digan PONER_ACA, el portal funciona igual pero
   guardando en el propio navegador: cada aparato ve lo suyo y nada se
   comparte. Sirve para probar, no para trabajar.
   ══════════════════════════════════════════════════════════════════════ */

var FB_URL  = 'https://estudio-kine-default-rtdb.firebaseio.com';
var FB_KEY  = 'AIzaSyB45Ao5hGAi9GTy7CxXu8mUOV5K16Zt3BY';
var FB_DOM  = 'estudio.app'; // dominio interno de las cuentas de pacientes
var FB_CLUB = 'ESTUDIO';

/* Si no esta configurado, este archivo no hace NADA: no define fbSet ni
   fbGet, y datos.js sigue guardando en el navegador como hasta ahora.
   Es lo que permite que el portal ande antes de conectar la base. */
var FB_CONFIGURADO = (FB_URL.indexOf('PONER_ACA') < 0 && FB_KEY.indexOf('PONER_ACA') < 0);

function fbKey(path){
  return 'fb_' + path.replace(/[^a-zA-Z0-9]/g, '_');
}

// ── PERMISOS DE EDICIÓN POR ROL ───────────────────────────────
// El JUGADOR (vb_role='player') no puede modificar contenido del staff.
// El staff — entrenador ('coach'), asistente ('at') y preparador físico ('pf') —
// y quien no inició sesión, SÍ pueden editar (misma convención que el resto de la app).
// El JUGADOR (vb_role='player') SOLO puede modificar sus propios datos:
// pesos, RM, historial de pesos, wellness y sus comentarios de preparación física.
// TODO lo demás (calendario, horarios, rutinas, notas del staff, juegos, etc.) queda bloqueado.
/* Lo unico que un paciente puede escribir. Todo lo demas queda bloqueado
   aunque alguien abra la consola del navegador y lo intente a mano.
   La validacion de verdad esta en las reglas de Firebase; esto es la
   primera barrera. */
var VB_PLAYER_PATHS = ['kine/adherencia','kine/agenda/turnos','kine/wellness',
                       'kine/mensajes','kine/pacientes'];
function vbEsJugador(){
  try{ return (localStorage.getItem('vb_role')||'').toLowerCase() === 'player'; }catch(e){ return false; }
}
function vbEdicionBloqueada(path){
  if(!vbEsJugador()) return false;                  // staff o sin login → puede editar todo
  var p = String(path||'');
  for(var i=0;i<VB_PLAYER_PATHS.length;i++){
    var s = VB_PLAYER_PATHS[i];
    if(p === s || p.indexOf(s + '/') === 0) return false;  // dato propio del jugador → permitido
  }
  return true;                                      // cualquier otra cosa → bloqueada para el jugador
}

/* ── estado de la sesión ────────────────────────────────────────────────── */
var FB_SES = null;        // {idToken, refreshToken, vence, email, uid}
var FB_OFF = false;       // true = sin internet, trabajando con lo guardado
var _fbListo = null;      // promesa: resuelve cuando hay sesión (o modo sin conexión)

function _fbLeerSes(){
  try{ return JSON.parse(localStorage.getItem('nla_sesion') || 'null'); }catch(e){ return null; }
}
function _fbGuardarSes(s){
  FB_SES = s;
  try{ s ? localStorage.setItem('nla_sesion', JSON.stringify(s))
         : localStorage.removeItem('nla_sesion'); }catch(e){}
  _fbSincronizarRol(); _fbCategoriaJugador();
}
/* Si la cuenta es de jugador, el rol queda atado a la cuenta y no a lo que
   haya quedado guardado en el navegador. El staff conserva su rol del inicio. */

/* ── A QUE CATEGORIA PERTENECE EL JUGADOR ─────────────────────────────────
   El jugador ve SOLO su categoria. Cual es sale de jugador_cat, que se
   guarda cuando se le da el alta. Se pregunta al entrar y queda anotada,
   asi cada pantalla no tiene que volver a consultarla.

   Si no la tiene anotada —planteles cargados antes de que existieran las
   categorias— no se toca nada y ve la primera, como siempre. */
function _fbCategoriaJugador(){
  try{
    if(!FB_SES || !FB_SES.uid) return;
    if((localStorage.getItem('vb_role') || '') !== 'player') return;
    fbGet('jugador_cat/' + FB_SES.uid, function(c){
      try{
        if(c && typeof c === 'string'){
          localStorage.setItem('vb_player_cat', c);
          if(localStorage.getItem('vb_categoria') !== c){
            localStorage.setItem('vb_categoria', c);
          }
        }
      }catch(e){}
    });
  }catch(e){}
}

function _fbSincronizarRol(){
  try{
    if(!FB_SES || !FB_SES.email) return;
    var m = /^j(\d+)@/i.exec(FB_SES.email);
    if(m && FB_SES.email.indexOf('@'+FB_DOM) > 0){
      localStorage.setItem('vb_role','player');
      localStorage.setItem('vb_player_num', String(parseInt(m[1],10)));
    }
  }catch(e){}
}

/* ── llave de los datos ────────────────────────────────────────────────────
   Los archivos de datos del club estan cifrados en el servidor. La llave vive
   aca adentro y solo la recibe quien inicio sesion. La guardamos en el
   dispositivo para que las paginas puedan abrir los datos al arrancar. */
function _fbTraerLlave(){
  if(typeof guardarLlave !== 'function') return Promise.resolve();
  try{ if(localStorage.getItem('club_llave')) return Promise.resolve(); }catch(e){}
  return _fbSufijo().then(function(q){
    return fetch(FB_URL + '/' + (typeof fbRuta === 'function' ? fbRuta('llave') : 'llave') + '.json' + q)
      .then(function(r){ return r.json(); })
      .then(function(k){ if(typeof k === 'string' && k.length >= 32) guardarLlave(k); })
      .catch(function(){});
  });
}

/* El rol (coach / at / pf / player) vive en la base, atado al UID.
   Se lee al entrar, así no depende de lo que haya quedado en el navegador. */

/* ══════════════════════════════════════════════════════════════════════════
   CONTROL DE SESIONES
   --------------------------------------------------------------------------
   La sesión se abre UNA vez por dispositivo y se renueva sola para siempre.
   Eso es cómodo, pero significaba que si una sesión quedaba abierta en una
   máquina ajena no había forma de cerrarla salvo cambiarle la contraseña a
   la persona (y eso echa a todos sus dispositivos, incluidos los propios).

   Ahora cada sesión guarda CUÁNDO se creó, y en la base hay una "fecha de
   corte". Si la sesión es anterior al corte, el dispositivo se cierra solo la
   próxima vez que abre la app — y borra también la llave de los datos, que si
   no quedaba guardada y permitía seguir leyendo los archivos cifrados.

   En la base de datos:
     sesiones/corte                    -> cierra TODAS las sesiones del club
     sesiones/corte_uid/<uid>          -> cierra las de un usuario
     sesiones/corte_disp/<uid>/<disp>  -> cierra un dispositivo puntual
     sesiones/dispositivos/<uid>/<disp> -> qué hay conectado (para poder verlo)
   ══════════════════════════════════════════════════════════════════════════ */

/* Identificador del dispositivo. Se inventa una vez y queda guardado acá. */
function _fbDispId(){
  try{
    var d = localStorage.getItem('nla_disp');
    if(!d){
      d = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2,8);
      localStorage.setItem('nla_disp', d);
    }
    return d;
  }catch(e){ return 'd0'; }
}

/* Cierra la sesión en ESTE dispositivo y borra todo lo sensible. */
function fbCerrarSesionLocal(motivo){
  /* Cada app guarda la sesión con SU propio nombre (nla_sesion en NÄFELS,
     casla_sesion en CASLA). Por eso no borramos la clave a mano: usamos la
     función de la propia app, que sabe cuál es. Si se borra la equivocada,
     la sesión sobrevive y el aviso vuelve a salir en bucle. */
  try{ _fbGuardarSes(null); }catch(e){}
  try{
    localStorage.removeItem('nla_sesion');      /* por las dudas, las dos variantes */
    localStorage.removeItem('casla_sesion');
    localStorage.removeItem('club_llave');      /* la llave de los datos también */
    localStorage.removeItem('vb_role');
    localStorage.removeItem('vb_player_num');
  }catch(e){}
  FB_SES = null;
  if(motivo){ try{ alert(motivo); }catch(e){} }
  try{ location.reload(); }catch(e){}
}

/* Deja constancia de este dispositivo, para poder verlos y elegir cuál cerrar. */
function _fbRegistrarDisp(){
  if(!FB_SES || !FB_SES.uid) return Promise.resolve();
  var ua = '';
  try{ ua = navigator.userAgent || ''; }catch(e){}
  var tipo = /iPad|Tablet/i.test(ua) ? 'Tablet'
           : /Android|iPhone|Mobile/i.test(ua) ? 'Celular' : 'Computadora';
  return _fbSufijo().then(function(q){
    return fetch(FB_URL + '/sesiones/dispositivos/' + FB_SES.uid + '/' + _fbDispId() + '.json' + q, {
      method:'PATCH', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ tipo:tipo, mail:FB_SES.email||'',
                             desde:(FB_SES.emitido||Date.now()), ultimo:Date.now() })
    });
  }).catch(function(){});
}

/* Se corre en cada arranque: mira si esta sesión fue dada de baja. */

/* Deja registrado cada INGRESO (cuando alguien pone mail y clave).
   No se anota cada vez que abre la app —eso sería un diluvio—, sólo cuando
   se crea una sesión nueva. Para "¿quién entró y cuándo?" es lo que importa. */
function _fbRegistrarAcceso(){
  if(!FB_SES || !FB_SES.uid) return;
  var ua = ''; try{ ua = navigator.userAgent || ''; }catch(e){}
  var tipo = /iPad|Tablet/i.test(ua) ? 'Tablet'
           : /Android|iPhone|Mobile/i.test(ua) ? 'Celular' : 'Computadora';
  var id = 'a' + Date.now().toString(36) + Math.random().toString(36).slice(2,7);
  _fbSufijo().then(function(q){
    return fetch(FB_URL + '/sesiones/accesos/' + id + '.json' + q, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ uid:FB_SES.uid, mail:FB_SES.email||'',
                             cuando:Date.now(), tipo:tipo, disp:_fbDispId() })
    });
  }).catch(function(){});
}

function _fbControlSesion(){
  if(!FB_SES || !FB_SES.uid) return Promise.resolve();
  return _fbSufijo().then(function(q){
    return fetch(FB_URL + '/sesiones.json' + q).then(function(r){ return r.json(); });
  }).then(function(d){
    if(!d || d.error) return _fbRegistrarDisp();
    var emitido = FB_SES.emitido || 0;
    var disp    = _fbDispId();
    var corte   = parseInt(d.corte, 10) || 0;
    if(d.corte_uid && d.corte_uid[FB_SES.uid])
      corte = Math.max(corte, parseInt(d.corte_uid[FB_SES.uid], 10) || 0);
    if(d.corte_disp && d.corte_disp[FB_SES.uid] && d.corte_disp[FB_SES.uid][disp])
      corte = Math.max(corte, parseInt(d.corte_disp[FB_SES.uid][disp], 10) || 0);

    if(emitido < corte){
      fbCerrarSesionLocal('Tu sesión fue cerrada desde el club.\n\nVolvé a ingresar con tu usuario y tu clave.');
      return;
    }
    return _fbRegistrarDisp();
  }).catch(function(){});   /* sin internet no echamos a nadie */
}

function _fbCargarRol(){
  if(!FB_SES || !FB_SES.uid) return Promise.resolve();
  return _fbSufijo().then(function(q){
    /* Rol (coach/at/pf/player) y numero de camiseta, los dos atados al UID.
       El numero lo necesitan la vista por jugador y los avisos personales. */
    var pRol = fetch(FB_URL + '/roles/' + FB_SES.uid + '.json' + q).then(function(r){ return r.json(); });
    var pNum = fetch(FB_URL + '/jugador_num/' + FB_SES.uid + '.json' + q).then(function(r){ return r.json(); });
    return Promise.all([pRol, pNum]).then(function(res){
      var rol = res[0], num = res[1];
      try{
        if(typeof rol === 'string' && rol) localStorage.setItem('vb_role', rol);
        if(num !== null && num !== undefined && String(num) !== '')
          localStorage.setItem('vb_player_num', String(num));
        else if(rol && rol !== 'player')
          localStorage.removeItem('vb_player_num');
      }catch(e){}
      try{ if(typeof window.VB_refrescarPermisos === 'function') window.VB_refrescarPermisos(); }catch(e){}
      /* avisar a quien dependa del numero (avisos personales, vista por jugador) */
      try{ window.dispatchEvent(new CustomEvent('vb-rol-listo', {detail:{rol:rol, num:num}})); }catch(e){}
    }).catch(function(){})
      .then(function(){ return _fbControlSesion(); });   /* ¿esta sesión sigue vigente? */
  });
}

function fbUser(){
  return FB_SES ? {email:FB_SES.email, uid:FB_SES.uid,
                   staff:(FB_SES.email||'').indexOf('@'+FB_DOM)<0} : null;
}
function fbLogout(){
  _fbGuardarSes(null);
  location.reload();
}

/* ── token: pide uno nuevo cuando está por vencer ───────────────────────── */
function _fbRefrescar(){
  if(!FB_SES || !FB_SES.refreshToken) return Promise.reject(new Error('sin sesion'));
  return fetch('https://securetoken.googleapis.com/v1/token?key=' + FB_KEY, {
      method:'POST',
      headers:{'Content-Type':'application/x-www-form-urlencoded'},
      body:'grant_type=refresh_token&refresh_token=' + encodeURIComponent(FB_SES.refreshToken)
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.id_token) throw new Error('sesion vencida');
      _fbGuardarSes({emitido:(FB_SES && FB_SES.emitido) || 0,   /* se conserva: NO se renueva al refrescar */ idToken:d.id_token, refreshToken:d.refresh_token,
                     vence:Date.now() + (parseInt(d.expires_in,10)||3600)*1000 - 60000,
                     email:FB_SES.email, uid:d.user_id || FB_SES.uid});
      return FB_SES.idToken;
    });
}
function _fbToken(){
  if(!FB_SES) return Promise.resolve('');
  if(FB_SES.idToken && Date.now() < (FB_SES.vence||0)) return Promise.resolve(FB_SES.idToken);
  return _fbRefrescar().catch(function(){ return ''; });
}
function _fbSufijo(){
  return _fbToken().then(function(t){ return t ? ('?auth=' + encodeURIComponent(t)) : ''; });
}

/* ── ingreso ────────────────────────────────────────────────────────────── */
function _fbEntrar(usuario, clave){
  var mail = (usuario||'').trim();
  if(mail.indexOf('@') < 0) mail = 'j' + mail.replace(/\D/g,'') + '@' + FB_DOM;   // jugador por número
  return fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + FB_KEY, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email:mail, password:clave, returnSecureToken:true})
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(!d || !d.idToken){
        var m = (d && d.error && d.error.message) || 'ERROR';
        if(m.indexOf('PASSWORD')>=0 || m.indexOf('EMAIL_NOT_FOUND')>=0 || m.indexOf('INVALID_LOGIN')>=0)
          throw new Error('Usuario o codigo incorrecto');
        if(m.indexOf('TOO_MANY')>=0) throw new Error('Demasiados intentos. Espera un rato.');
        throw new Error('No pude entrar (' + m + ')');
      }
      _fbGuardarSes({idToken:d.idToken, refreshToken:d.refreshToken,
                     vence:Date.now() + (parseInt(d.expiresIn,10)||3600)*1000 - 60000,
                     emitido:Date.now(),          /* cuándo se abrió: lo usa el control de sesiones */
                     email:mail, uid:d.localId});
      _fbRegistrarAcceso();   /* queda registrado quién entró y cuándo */
      return true;
    });
}

/* ── pantalla de ingreso ────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════
   LA PANTALLA DE ACCESO DEL CLUB, APAGADA

   El archivo del club trae su propio cartel de usuario y contraseña. El
   portal tiene el suyo, con dos puertas distintas para el paciente y el
   kinesiologo, asi que este se superpondria encima y taparia los botones.

   No se borra: se deja devolviendo una promesa que nunca resuelve. Asi,
   si algo intenta leer la base sin haber entrado, se queda esperando en
   vez de mostrar un cartel de golpe arriba de todo.
   ══════════════════════════════════════════════════════════════════════ */
function _fbPantalla(){
  return new Promise(function(){});   /* la entrada la maneja index.html */
}

function _fbPantallaDelClub(){
  return new Promise(function(resolve){
    var d = document.createElement('div');
    d.id = 'fb-login';
    d.setAttribute('data-notr','');          /* que el traductor no lo toque */
    d.innerHTML =
      '<style>'
      + '#fb-login{position:fixed;inset:0;z-index:2147483000;background:#080810;display:flex;'
      + 'align-items:center;justify-content:center;padding:18px;'
      + 'font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#eeeef5}'
      + '#fb-login .c{width:100%;max-width:360px}'
      + '#fb-login h1{font-size:22px;font-weight:800;margin:0 0 4px;letter-spacing:.5px}'
      + '#fb-login p{color:#6b6b84;font-size:13px;margin:0 0 20px;line-height:1.5}'
      + '#fb-login label{display:block;font-size:11px;letter-spacing:1.4px;text-transform:uppercase;'
      + 'color:#6b6b84;margin:0 0 6px}'
      + '#fb-login input{width:100%;box-sizing:border-box;background:#13131f;color:#fff;'
      + 'border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:13px 14px;font-size:16px;'
      + 'outline:none;margin-bottom:14px}'
      + '#fb-login input:focus{border-color:#e8192c}'
      + '#fb-login button{width:100%;background:#e8192c;color:#fff;border:0;border-radius:10px;'
      + 'padding:14px;font-size:16px;font-weight:800;cursor:pointer;letter-spacing:.5px}'
      + '#fb-login button:disabled{opacity:.55;cursor:default}'
      + '#fb-login .err{color:#f87171;font-size:13px;min-height:19px;margin:10px 0 0;text-align:center}'
      + '#fb-login .ay{color:#4b4b60;font-size:11.5px;margin-top:16px;text-align:center;line-height:1.6}'
      + '</style>'
      + '<div class="c">'
      + '<h1>' + FB_CLUB + '</h1>'
      + '<p>Entra una sola vez en este dispositivo. Despues queda abierto.</p>'
      + '<label for="fb-u">Tu numero o tu mail</label>'
      + '<input id="fb-u" autocomplete="username" placeholder="Ej: 7   -   coach@club.com">'
      + '<label for="fb-p">Codigo</label>'
      + '<input id="fb-p" type="password" autocomplete="current-password" placeholder="......">'
      + '<button id="fb-b">Entrar</button>'
      + '<div class="err" id="fb-e"></div>'
      + '<div class="ay">Los jugadores entran con su numero de camiseta.<br>'
      + 'Si no tenes codigo, pediselo al cuerpo tecnico.</div>'
      + '</div>';
    document.documentElement.appendChild(d);

    var u=d.querySelector('#fb-u'), p=d.querySelector('#fb-p'),
        b=d.querySelector('#fb-b'), e=d.querySelector('#fb-e');
    setTimeout(function(){ u.focus(); }, 80);

    function go(){
      var usuario=u.value.trim(), clave=p.value;
      if(!usuario || !clave){ e.textContent='Completa los dos campos'; return; }
      b.disabled=true; b.textContent='Entrando...'; e.textContent='';
      _fbEntrar(usuario, clave)
        .then(function(){ d.remove(); resolve(true); })
        .catch(function(err){
          b.disabled=false; b.textContent='Entrar';
          e.textContent = (err && err.message) ? err.message : 'No pude entrar';
          p.value=''; p.focus();
        });
    }
    b.addEventListener('click', go);
    [u,p].forEach(function(x){ x.addEventListener('keydown', function(ev){ if(ev.key==='Enter') go(); }); });
  });
}

/* ── arranque: recupera la sesion guardada o pide ingresar ──────────────── */
/* Este dispositivo, alguna vez, entro con usuario y clave. */
function _fbHayLlaveGuardada(){
  try{ return !!localStorage.getItem('club_llave'); }catch(e){ return false; }
}

function _fbArrancar(){
  if(_fbListo) return _fbListo;
  FB_SES = _fbLeerSes();
  _fbSincronizarRol(); _fbCategoriaJugador();
  _fbListo = new Promise(function(resolve){
    function pedir(){
      if(document.readyState === 'loading')
        document.addEventListener('DOMContentLoaded', function(){
          _fbPantalla().then(function(){ return _fbCargarRol(); })
        .then(function(){ return _fbTraerLlave(); }).then(resolve);
        });
      else _fbPantalla().then(function(){ return _fbCargarRol(); })
        .then(function(){ return _fbTraerLlave(); }).then(resolve);
    }
    if(FB_SES && FB_SES.refreshToken){
      _fbRefrescar()
        .then(function(){ return _fbCargarRol(); })
        .then(function(){ return _fbTraerLlave(); })
        .then(function(){ resolve(true); })
        .catch(function(){
          if(!navigator.onLine && _fbHayLlaveGuardada()){ FB_OFF = true; resolve(true); }   /* sin internet, pero este equipo ya habia entrado */
          else { _fbGuardarSes(null); pedir(); }                   /* sesion vencida: pedimos ingresar */
        });
    } else if(!navigator.onLine && _fbHayLlaveGuardada()){
      /* Sin internet SOLO se sigue de largo si este dispositivo ya habia
         entrado antes: la llave de los datos quedo guardada de una sesion
         valida. Es lo que permite scoutear en un club sin senal.

         Antes alcanzaba con estar sin conexion, sin importar si el dispositivo
         habia entrado alguna vez. Cualquiera podia apagar el wifi, abrir la
         direccion y saltearse la pantalla de ingreso. No veia datos —sin llave
         los archivos son ilegibles— pero entraba al sistema, y eso no puede
         pasar en algo que se vende. */
      FB_OFF = true; resolve(true);
    } else {
      pedir();
    }
  });
  return _fbListo;
}
/* No se arranca sola al abrir cualquier pantalla: si no hay sesion, la
   puerta de index.html se encarga. Arrancar aca haria que cada pantalla
   intentara autenticar por su cuenta. */
if(FB_CONFIGURADO && typeof sesion === 'function' && sesion()) _fbArrancar();

/* ── API de siempre, ahora firmada (y con los permisos por rol intactos) ── */
/* ══════════════════════════════════════════════════════════════════════
   SI NO SE GUARDA, HAY QUE DECIRLO

   Antes, una escritura rechazada se perdia en silencio: el portal
   guardaba una copia en el navegador, la volvia a leer de ahi, y todo
   parecia funcionar. En una historia clinica eso es grave: se cree que
   quedo asentada una sesion que no existe en ningun lado.

   Casi me lo trago en la verificacion: escribi un dato de prueba, lo
   lei de vuelta, y me lo devolvio la copia local. Solo me di cuenta al
   intentar borrarlo.

   Ahora una escritura fallida muestra un cartel rojo arriba de todo,
   que no se va hasta recargar.
   ══════════════════════════════════════════════════════════════════════ */
function _fbAvisarFalloGuardado(path, motivo){
  try{
    if(document.getElementById('fb-fallo')) return;   /* uno alcanza */
    var d = document.createElement('div');
    d.id = 'fb-fallo';
    d.className = 'cartel-demo';
    d.style.background = 'var(--rojo-suave)';
    d.style.color = 'var(--rojo)';
    d.style.borderBottomColor = 'var(--rojo-borde)';
    d.innerHTML = '<span><b>No se pudo guardar.</b> Lo último que cargaste NO quedó '
      + 'registrado. Revisá tu conexión y volvé a hacerlo.</span>'
      + '<a href="#" onclick="location.reload();return false">Recargar</a>';
    if(document.body) document.body.insertBefore(d, document.body.firstChild);
    console.error('[guardar] fallo en', path, motivo);
  }catch(e){}
}

function fbSet(path, value){
  if(vbEdicionBloqueada(path)){ try{ console.warn('[permisos] escritura bloqueada para jugador:', path); }catch(e){} return; }
  try{ localStorage.setItem(fbKey(path), JSON.stringify(value)); }catch(e){}
  _fbArrancar().then(_fbSufijo).then(function(q){
    if(FB_OFF) return;
    return fetch(FB_URL + '/' + path + '.json' + q, {
      method:'PUT', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(value)
    }).then(function(r){
      /* Firebase contesta 200 al guardar. Cualquier otra cosa es un
         rechazo, y hay que mostrarlo. */
      if(!r.ok) _fbAvisarFalloGuardado(path, 'la base respondió ' + r.status);
    });
  }).catch(function(e){
    _fbAvisarFalloGuardado(path, (e && e.message) || 'sin conexión');
  });
}

function fbGet(path, callback){
  function local(){
    try{
      var v = localStorage.getItem(fbKey(path));
      callback(v ? JSON.parse(v) : null);
    }catch(e){ callback(null); }
  }
  _fbArrancar().then(_fbSufijo).then(function(q){
    if(FB_OFF) return local();
    fetch(FB_URL + '/' + path + '.json' + q)
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data !== null && data !== undefined && !(data && data.error)){
          try{ localStorage.setItem(fbKey(path), JSON.stringify(data)); }catch(e){}
          callback(data);
        } else local();
      })
      .catch(local);
  }).catch(local);
}

function fbPush(path, value){
  if(vbEdicionBloqueada(path)){ try{ console.warn('[permisos] escritura bloqueada para jugador:', path); }catch(e){} return; }
  try{
    var arr = JSON.parse(localStorage.getItem(fbKey(path)) || '[]');
    arr.push(value);
    localStorage.setItem(fbKey(path), JSON.stringify(arr));
  }catch(e){}
  _fbArrancar().then(_fbSufijo).then(function(q){
    if(FB_OFF) return;
    fetch(FB_URL + '/' + path + '.json' + q, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(value)
    }).catch(function(){});
  });
}

/* © 2025-2026 Ignacio Verdi · NAFELS VOLEY · Software propietario - Todos los derechos reservados */



/* ══════════════════════════════════════════════════════════════════════
   EL PUENTE CON LA ENTRADA DEL PORTAL

   Sin esto, la pantalla de entrada validaria la contraseña contra el
   archivo de datos en vez de contra Firebase: cualquiera que mire el
   codigo la vería. La contraseña de verdad vive en Firebase y este
   portal no la conoce nunca.

   Devuelve lo mismo que la version sin Firebase, para que la pantalla
   de entrada no tenga que saber cual de las dos esta usando.
   ══════════════════════════════════════════════════════════════════════ */
/* fbGet avisa por una funcion de respuesta, no devuelve el dato. Pedirle
   el rol como si devolviera algo daba SIEMPRE "nada", y nada no es
   "kine": por eso rechazaba a la cuenta correcta. Se lo envuelve. */
function fbLeer(ruta){
  return new Promise(function(listo){
    fbGet(ruta, function(v){ listo(v); });
  });
}

function fbEntrarKine(usuario, clave){
  return _fbEntrar(usuario, clave)
    .then(function(){
      /* El rol NO se decide acá: se lee de la base, donde el paciente no
         puede escribir. Si se decidiera acá, cualquiera con una cuenta
         entraria como kinesiologo.

         Se consulta DIRECTO con la llave recien emitida. Antes se pasaba
         por el arranque general, que lo primero que hace es renovar la
         sesion... la misma que se acababa de crear. Si esa renovacion
         fallaba, quedaba esperando para siempre y la pantalla se colgaba
         en "Entrando". */
      var uid = FB_SES && FB_SES.uid;
      var tok = FB_SES && FB_SES.idToken;
      if(!uid || !tok) throw new Error('No se pudo abrir la sesión.');

      /* La sesion ya es valida: se marca lista para que el resto del
         portal no la vuelva a pedir. */
      _fbListo = Promise.resolve(true);

      return fetch(FB_URL + '/kine/roles/' + uid + '.json?auth=' + encodeURIComponent(tok))
        .then(function(r){
          if(r.status === 401) throw new Error('LAS_REGLAS');
          return r.json();
        });
    })
    .then(function(rol){
      if(rol !== 'kine'){
        var uid = (FB_SES && FB_SES.uid) || '(sin identificar)';
        /* Se cierra la sesion SIN recargar: fbLogout recarga la pagina y
           se lleva puesto el mensaje, dejando la pantalla en blanco sin
           que nadie sepa que paso. */
        try{
          _fbGuardarSes(null);
          _fbListo = null;
        }catch(e){}
        /* Se muestra el identificador: sin el, no hay forma de saber si
           el problema es que falta cargarlo o que se cargo otro. */
        return {ok:false, motivo:'La contraseña estaba bien, pero esta cuenta no figura '
          + 'como kinesiólogo en la base.<br><br>Cargá esto en Firebase, en Realtime '
          + 'Database:<br><b>kine / roles / ' + uid + '</b> con el valor <b>kine</b>'};
      }
      guardarSesion({tipo:'kine', desde:HOY, uid:FB_SES.uid, email:FB_SES.email});
      return {ok:true, destino:'panel.html',
              nombre:((BASE.perfil || {}).nombre) || 'Kinesiólogo'};
    })
    .catch(function(e){
      var m = (e && e.message) || '';
      /* "Failed to fetch" no le dice nada a nadie. Se traduce a lo que
         de verdad pasa, que es que no hay internet o el servicio no
         responde. */
      if(m === 'LAS_REGLAS'){
        return {ok:false, motivo:'La base rechazó la consulta. Revisá que las reglas '
          + 'estén publicadas en Firebase, en Realtime Database, pestaña Reglas.'};
      }
      if(m.indexOf('Failed to fetch') >= 0 || m.indexOf('NetworkError') >= 0){
        return {ok:false, motivo:'No hay conexión con el servidor. '
          + 'Revisá tu internet y volvé a intentar.'};
      }
      return {ok:false, motivo: m || 'No se pudo entrar.'};
    });
}

/* El paciente entra sin Firebase: sus datos ya estan en la base y se
   comparan contra la ficha. No tiene cuenta propia, y es a proposito:
   crear una cuenta por paciente es una barrera que no vuelve a cruzar. */


/* ══════════════════════════════════════════════════════════════════════
   LA CUENTA DEL PACIENTE

   EL PROBLEMA QUE RESUELVE
   ------------------------
   Las reglas exigen haber entrado para leer la lista de pacientes. Pero
   la pantalla de entrada necesita comprobar el documento y la fecha de
   nacimiento ANTES de dejar entrar. Circulo cerrado: con datos locales
   funcionaba, con la base no.

   COMO SE RESUELVE
   ----------------
   Que valide Firebase, no el portal. Al darse de alta se le crea una
   cuenta invisible:

       usuario  = <documento>@estudio.app
       clave    = su fecha de nacimiento, sin guiones

   El paciente nunca ve eso: sigue escribiendo su documento y su fecha.
   Pero ahora quien comprueba es Firebase, que para eso esta, y nadie
   necesita leer la lista de nadie.

   Ademas, la ficha se guarda con el identificador de esa cuenta como
   clave. Asi las reglas pueden decir "cada uno lee lo suyo" sin ninguna
   tabla de equivalencias que alguien tenga que cargar a mano.
   ══════════════════════════════════════════════════════════════════════ */
function correoDe(doc){
  return String(doc || '').replace(/\D/g, '') + '@' + FB_DOM;
}

function claveDe(nacimiento){
  return String(nacimiento || '').replace(/-/g, '');   /* 8 digitos: alcanza */
}

/* Crea la cuenta al darse de alta. Devuelve el identificador. */
function fbCrearPaciente(doc, nacimiento){
  return fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + FB_KEY, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({email:correoDe(doc), password:claveDe(nacimiento),
                            returnSecureToken:true})
    })
    .then(function(r){ return r.json(); })
    .then(function(d){
      if(d && d.idToken){
        _fbGuardarSes({idToken:d.idToken, refreshToken:d.refreshToken,
                       vence: Date.now() + (+d.expiresIn - 60) * 1000,
                       email:d.email, uid:d.localId});
        _fbListo = Promise.resolve(true);
        return d.localId;
      }
      var m = (d && d.error && d.error.message) || '';
      if(m.indexOf('EMAIL_EXISTS') >= 0){
        throw new Error('YA_EXISTE');
      }
      throw new Error(m || 'No se pudo crear la cuenta.');
    });
}

/* Entra con documento y fecha de nacimiento. */
function fbEntrarPaciente(doc, nacimiento){
  return _fbEntrar(correoDe(doc), claveDe(nacimiento))
    .then(function(){
      var uid = FB_SES && FB_SES.uid;
      _fbListo = Promise.resolve(true);
      return fetch(FB_URL + '/kine/pacientes/' + uid + '.json?auth='
                   + encodeURIComponent(FB_SES.idToken))
        .then(function(r){ return r.json(); })
        .then(function(ficha){
          if(!ficha) throw new Error('SIN_FICHA');
          if(!BASE.pacientes.some(function(x){ return x.id === uid; })){
            BASE.pacientes.push(ficha);
          }
          return {ok:true, destino:'mi.html', nombre:ficha.nombre, pid:uid};
        });
    })
    .catch(function(e){
      var m = (e && e.message) || '';
      if(m === 'SIN_FICHA'){
        return {ok:false, motivo:'Tu cuenta existe pero no encontramos tu ficha. '
          + 'Avisale al kinesiólogo.'};
      }
      if(m.indexOf('incorrecto') >= 0 || m.indexOf('INVALID') >= 0){
        return {ok:false, motivo:'No encontramos a nadie con esos datos. Revisá el documento '
          + 'y la fecha. Si nunca te diste de alta, hacelo primero.'};
      }
      if(m.indexOf('Failed to fetch') >= 0){
        return {ok:false, motivo:'No hay conexión. Revisá tu internet y volvé a intentar.'};
      }
      return {ok:false, motivo:m || 'No se pudo entrar.'};
    });
}


/* ══════════════════════════════════════════════════════════════════════
   SIN CONFIGURAR, ESTE ARCHIVO NO EXISTE

   Las funciones de arriba quedan definidas igual por como funciona
   JavaScript. Si no se borran, datos.js cree que hay base conectada y
   deja de guardar en el navegador: el portal parece roto.
   ══════════════════════════════════════════════════════════════════════ */
if(!FB_CONFIGURADO){
  try{
    window.fbSet = undefined;
    window.fbGet = undefined;
    window.fbPush = undefined;
    window.fbCrearPaciente = undefined;
    window.fbEntrarPaciente = undefined;
  }catch(e){}
}


/* ══════════════════════════════════════════════════════════════════════
   TRAER TODO AL ABRIR

   El portal trabaja con un objeto BASE en memoria. Con Firebase, esa
   copia tiene que llegar de la base y no del navegador, o cada aparato
   sigue viendo lo suyo.

   Se pide una sola vez toda la rama kine/, se vuelca sobre BASE, y se
   vuelve a dibujar la pantalla. Es una sola consulta por pantalla, no
   una por dato.
   ══════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════
   FIREBASE NO GUARDA FILAS, GUARDA LISTAS CON NOMBRE

   El portal trabaja con BASE.pacientes como una fila: se recorre, se
   cuenta, se filtra. Pero al guardar cada paciente en su propia rama
   (kine/pacientes/P34), Firebase lo devuelve como una lista con nombre:

       {P34:{...}, P35:{...}}   en vez de   [{...}, {...}]

   Volcarlo tal cual dejaba el portal sin poder recorrerlo: el paciente
   estaba guardado y no aparecía en ningún lado. Paso de verdad, con un
   paciente real.

   Esto lo convierte de vuelta a fila cuando corresponde.
   ══════════════════════════════════════════════════════════════════════ */
var RAMAS_FILA = ['pacientes', 'lesiones', 'caja', 'accesos', 'instituciones', 'faq', 'ejercicios'];

function acomodar(rama, valor){
  if(RAMAS_FILA.indexOf(rama) < 0) return valor;      /* esa va como esta */
  if(Array.isArray(valor)) return valor;
  if(!valor || typeof valor !== 'object') return [];
  /* Se recorre por clave y se arma la fila. La clave es el id, asi que
     si el objeto no lo trae adentro, se le pone. */
  return Object.keys(valor).map(function(k){
    var x = valor[k];
    if(x && typeof x === 'object' && x.id === undefined) x.id = k;
    return x;
  }).filter(function(x){ return x; });
}

var RAMAS_ESTUDIO = ['vaciado', 'pacientes','lesiones','disponibilidad','programas','agenda',
                     'historia','accesos','caja','mensajes','adherencia','perfil',
                     'ejercicios','wellness'];

function fbCargarTodo(){
  if(!FB_CONFIGURADO || typeof BASE === 'undefined') return;
  var ses = (typeof sesion === 'function') ? sesion() : null;
  if(!ses) return;                       /* sin entrar no hay nada que traer */

  /* Hay que ESPERAR a que la sesion este lista. Antes se leia FB_SES en
     el momento, y como todavia estaba vacia la funcion se iba sin pedir
     nada: el kinesiologo veia siempre los datos de ejemplo. */
  _fbArrancar().then(function(){
    /* Si el paciente cerro y volvio a abrir, su sesion de Firebase pudo
       vencer. Sin token no puede leer ni lo suyo, y la pantalla le queda
       con datos que no son de el. En ese caso se lo manda a entrar de
       nuevo en vez de mostrarle cualquier cosa. */
    if(!(FB_SES && FB_SES.idToken)){
      if(ses.tipo === 'paciente' && typeof salir === 'function') salir();
      return;
    }
    _fbTraerRamas(ses);
  }).catch(function(){});
}

/* ══════════════════════════════════════════════════════════════════════
   NORMALIZAR LO QUE VUELVE DE LA BASE

   Firebase no devuelve las cosas como las guardamos, y ese desajuste nos
   costo cuatro errores seguidos, encontrados de a uno cuando algo se
   rompia:

     · Una lista guardada vuelve como objeto: {"0":x,"1":y}. Un objeto no
       tiene forEach, asi que el codigo explota.
     · Si las claves son numeros que arrancan en 1, devuelve una lista con
       un HUECO nulo en la posicion 0.
     · Y si los numeros no son seguidos, mezcla las dos formas.

   En vez de acordarse rama por rama, se arregla UNA VEZ acá: todo lo que
   entra pasa por esta funcion. Las ramas que el portal usa como lista
   salen siempre como lista, sin huecos y en orden.
   ══════════════════════════════════════════════════════════════════════ */
var RAMAS_LISTA = ['pacientes','lesiones','caja','accesos','instituciones',
                   'faq','ejercicios','mensajes','plantel'];

function _fbNormalizar(rama, d){
  if(d === null || d === undefined) return d;

  if(RAMAS_LISTA.indexOf(rama) < 0) return d;   /* es un objeto y esta bien */

  var lista;
  if(Array.isArray(d)){
    lista = d.filter(function(x){ return x !== null && x !== undefined; });
  }else{
    lista = Object.keys(d).map(function(k){
      var v = d[k];
      /* La clave suele ser el identificador: se le devuelve al objeto si
         lo perdio, porque el portal busca por id. */
      if(v && typeof v === 'object' && !Array.isArray(v) && !v.id) v.id = k;
      return v;
    }).filter(Boolean);
  }

  /* Orden estable: por id si lo tienen, para que la lista no baile entre
     una carga y otra. */
  lista.sort(function(a, b){
    var x = (a && a.id) || '', y = (b && b.id) || '';
    return x < y ? -1 : (x > y ? 1 : 0);
  });
  return lista;
}

function _fbTraerRamas(ses){
  var tok = (FB_SES && FB_SES.idToken) || '';
  if(!tok) return;

  /* ══════════════════════════════════════════════════════════════════
     EL IDENTIFICADOR TIENE QUE SER EL DEL PACIENTE, NO EL DE FB_SES

     FB_SES es la ultima sesion de Firebase abierta en ese navegador. Si
     el kinesiologo habia entrado antes en la computadora del estudio, un
     paciente que entra despues pedia SUS PROPIOS DATOS con el
     identificador del kinesiologo: le pedia a la base
     "pacientes/<uid del kine>" y no encontraba nada.

     Resultado: el paciente entraba y veia su pantalla vacia, sin
     ejercicios, sin turno y sin historia. Sin error visible.

     El identificador correcto es el de la sesion del portal.
     ══════════════════════════════════════════════════════════════════ */
  var uid = (ses && ses.tipo === 'paciente' && ses.pid)
              ? ses.pid
              : ((FB_SES && FB_SES.uid) || '');
  if(!uid) return;

  /* ══════════════════════════════════════════════════════════════════
     LOS DATOS DE EJEMPLO NO CONVIVEN CON LOS REALES

     Con la base conectada, lo unico valido es lo que esta en la base.
     Si ademas se dejan los pacientes de ejemplo del archivo, quedan los
     dos mezclados y nadie sabe cual es cual: Marcela Rios inventada al
     lado de un paciente de verdad, en la misma lista.

     En una historia clinica eso no se puede permitir. Se vacian antes de
     pedir. Si la consulta falla, la pantalla queda vacia y aparece el
     cartel rojo: mejor vacia y avisando que llena de mentiras.
     ══════════════════════════════════════════════════════════════════ */
  BASE.pacientes = [];
  BASE.lesiones = [];
  BASE.disponibilidad = {};
  BASE.historia = {};
  BASE.mensajes = [];
  BASE.caja = [];
  BASE.estudios = {};
  BASE.adherencia = {};
  BASE.wellness = {};
  BASE.programas = {};

  /* ══════════════════════════════════════════════════════════════════
     RAMA POR RAMA, NO TODO DE UNA

     Antes esto pedia /kine.json, o sea la rama entera de un saque.
     Firebase exige permiso sobre EXACTAMENTE lo que se pide, y las
     reglas dan permiso rama por rama: pacientes, lesiones, caja. Sobre
     "kine" entero no hay ninguna, asi que rechazaba la consulta y no
     cargaba NADA.

     Resultado: el kinesiologo cargaba un paciente, se guardaba bien en
     la base, y en la pantalla seguia viendo los datos de ejemplo. El
     paciente "desaparecia".

     Ahora se pide cada rama por separado. Si uno falla, los demas
     llegan igual.
     ══════════════════════════════════════════════════════════════════ */
  var esKine = ses.tipo === 'kine';

  /* El paciente solo puede leer lo suyo: pedirle la lista completa le
     daria un rechazo en cada pantalla. */
  var ramas = esKine
    ? ['pacientes','lesiones','disponibilidad','programas','agenda','historia',
       'caja','mensajes','adherencia','wellness','estudios','perfil','horario',
       'instituciones','faq','avisados','accesos','ejercicios']
    : ['lesiones','programas','agenda','perfil','horario','instituciones','faq',
       'pacientes/' + uid, 'historia/' + uid, 'mensajes/' + uid,
       'adherencia/' + uid, 'wellness/' + uid, 'estudios/' + uid];

  var pendientes = ramas.length, fallaron = [];
  try{ window._ramasPedidas = ramas.slice(); }catch(e){}

  ramas.forEach(function(r){
    fetch(FB_URL + '/kine/' + r + '.json?auth=' + encodeURIComponent(tok))
      .then(function(resp){
        if(!resp.ok) throw new Error(resp.status);
        return resp.json();
      })
      .then(function(d){
        if(d === null || d === undefined) return;
        var partes = r.split('/');
        d = _fbNormalizar(partes[0], d);
        if(partes.length === 2){
          /* Una rama propia del paciente: se mete en su lugar. */
          if(partes[0] === 'pacientes'){
            if(!BASE.pacientes.some(function(x){ return x.id === partes[1]; })){
              d.id = partes[1];
              BASE.pacientes.push(d);
            }
          }else{
            if(!BASE[partes[0]]) BASE[partes[0]] = {};
            BASE[partes[0]][partes[1]] = d;
          }
        }else{
          BASE[r] = d;   /* ya viene normalizado */
        }
      })
      .catch(function(e){ fallaron.push(r + ' (' + e.message + ')'); })
      .then(function(){
        if(--pendientes > 0) return;
        /* Antes de dibujar: lo que llego puede venir como objeto o con
           huecos, y todas las pantallas asumen listas limpias. */
        if(typeof sanearBase === 'function'){ try{ sanearBase(); }catch(e){} }
        if(typeof pintar === 'function'){ try{ pintar(); }catch(e){} }
        if(fallaron.length) _fbAvisarLectura(fallaron);
      });
  });
}

/* Si alguna rama no llega, hay que decirlo: mostrar datos viejos como si
   fueran actuales es peligroso en una historia clinica. */
function _fbAvisarLectura(fallaron){
  try{
    console.warn('[base] no se pudieron leer:', fallaron.join(', '));
    if(document.getElementById('fb-lectura')) return;
    var d = document.createElement('div');
    d.id = 'fb-lectura';
    d.className = 'cartel-demo';
    d.style.background = 'var(--rojo-suave)';
    d.style.color = 'var(--rojo)';
    d.innerHTML = '<span><b>No se pudieron traer todos los datos.</b> Lo que ves puede estar '
      + 'incompleto. Revisá tu conexión y recargá.</span>'
      + '<a href="#" onclick="location.reload();return false">Recargar</a>';
    if(document.body) document.body.insertBefore(d, document.body.firstChild);
  }catch(e){}
}

if(FB_CONFIGURADO){
  if(document.readyState !== 'loading') setTimeout(fbCargarTodo, 0);
  else document.addEventListener('DOMContentLoaded', fbCargarTodo);
}


/* ══════════════════════════════════════════════════════════════════════
   LAS REGLAS DE LA BASE — copiar y pegar en Firebase

   Van en la consola de Firebase, en Realtime Database, pestaña Reglas.
   Son lo unico que protege los datos: la clave de arriba es publica.

   Lo importante en una linea: cada paciente lee y escribe SOLO su propia
   ficha, porque la ficha se guarda con el identificador de su cuenta
   como clave. No hace falta ninguna tabla de equivalencias.

{
  "rules": {
    "kine": {
      "roles": { ".read": "auth != null", ".write": false },

      "pacientes": {
        ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
        "$pid": {
          ".read":  "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')",
          ".write": "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')"
        }
      },

      "disponibilidad": {
        ".read": "auth != null",
        ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'"
      },

      "lesiones": {
        ".read":  "auth != null",
        ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'"
      },

      "historia": {
        ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
        "$pid": {
          ".read":  "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')",
          ".write": "auth != null"
        }
      },

      "estudios": {
        ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
        "$pid": {
          ".read":  "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')",
          ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'"
        }
      },

      "mensajes": {
        ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
        "$pid": {
          ".read":  "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')",
          ".write": "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')"
        }
      },

      "adherencia": {
        ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
        "$pid": {
          ".read":  "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')",
          ".write": "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')"
        }
      },

      "wellness": {
        ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
        "$pid": {
          ".read":  "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')",
          ".write": "auth != null && ($pid == auth.uid || root.child('kine/roles/' + auth.uid).val() == 'kine')"
        }
      },

      "sesiones":      { ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
                         ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },
      "vaciado":       { ".read": "auth != null", ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },
      "instituciones": { ".read": "auth != null", ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },
      "faq":           { ".read": "auth != null", ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },
      "avisados":      { ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
                         ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },

      "agenda":     { ".read": "auth != null", ".write": "auth != null" },
      "accesos":    { ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'", ".write": "auth != null" },
      "caja":       { ".read": "root.child('kine/roles/' + auth.uid).val() == 'kine'",
                      ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },
      "programas":  { ".read": "auth != null", ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },
      "ejercicios": { ".read": "auth != null", ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },
      "horario":    { ".read": "auth != null", ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" },
      "perfil":     { ".read": "auth != null", ".write": "root.child('kine/roles/' + auth.uid).val() == 'kine'" }
    }
  }
}

   LO UNICO QUE HAY QUE CARGAR A MANO, UNA SOLA VEZ:

     kine/roles/<uid del kinesiologo>  =  "kine"

   Que ".write" sea false ahi no es un olvido: si un paciente pudiera
   escribir en roles, se haria kinesiologo solo y veria todas las
   historias clinicas.

   Los pacientes NO se cargan a mano: al darse de alta con el codigo QR
   se crean su cuenta solos y su ficha queda con ese identificador.
   ══════════════════════════════════════════════════════════════════════ */
