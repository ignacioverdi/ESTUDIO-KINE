/* ══════════════════════════════════════════════════════════════════════
   TEMPORADA, PARTIDOS Y MINUTOS

   LA DECISION QUE MANDA SOBRE TODAS LAS DEMAS
   --------------------------------------------
   El dia del partido el kinesiologo esta mirando el partido. No puede
   estar tipeando. Si cargar un cambio lleva mas de dos toques, no se
   carga, y a la semana el sistema esta vacio.

   Por eso:

   · Los minutos NO se escriben. Se calculan de las entradas y salidas,
     que es como funciona un partido de verdad. El que arranca y termina
     jugo 90; el que entro a los 65 jugo 25. Nadie hace esa cuenta.

   · El minuto NO se escribe. Sale de un reloj que corre solo desde que
     empieza el partido. Tocar "Cambio" ya sabe en que minuto pasa.

   · La lesion en partido queda pegada al minuto exacto, sin preguntarlo.
     Ese es el dato que casi nadie tiene: no cuantas lesiones hubo, sino
     EN QUE MOMENTO del partido aparecen. Si se concentran despues del
     minuto 70, el problema es la condicion fisica, no la mala suerte.

   NO SE INVENTA UNA LISTA DE JUGADORES APARTE
   --------------------------------------------
   El plantel se arma eligiendo del padron que ya existe. Un jugador es
   un paciente mas: si se lesiona, su ficha ya esta ahi con su historia.
   Dos listas de las mismas personas terminan siempre desincronizadas.
   ══════════════════════════════════════════════════════════════════════ */

function temporadas(){
  if(!BASE.temporadas) BASE.temporadas = [];
  return lista(BASE.temporadas);
}

function temporadaActiva(){
  var t = temporadas().filter(function(x){ return x.activa; });
  return t.length ? t[0] : (temporadas()[0] || null);
}

function crearTemporada(nombre, institucion){
  var t = {
    id: 'T' + String(Date.now()).slice(-8),
    nombre: nombre || 'Temporada ' + new Date(HOY).getFullYear(),
    institucion: institucion || (instituciones()[0] || {}).nombre || '—',
    desde: HOY,
    plantel: [],          /* ids de pacientes */
    activa: true
  };
  temporadas().forEach(function(x){ x.activa = false; });
  BASE.temporadas.push(t);
  guardar('kine/temporadas/' + t.id, t);
  return t;
}

function planteDe(T){
  if(!T) return [];
  return lista(T.plantel).map(function(pid){ return paciente(pid); }).filter(Boolean);
}


/* ── PARTIDOS ───────────────────────────────────────────────────── */
function partidos(temporadaId){
  if(!BASE.partidos) BASE.partidos = [];
  return lista(BASE.partidos)
    .filter(function(p){ return !temporadaId || p.temporada === temporadaId; })
    .sort(function(a, b){ return a.fecha < b.fecha ? -1 : 1; });
}

function partidoPorId(id){
  var r = null;
  partidos().forEach(function(p){ if(p.id === id) r = p; });
  return r;
}

function crearPartido(datos){
  if(!BASE.partidos) BASE.partidos = [];
  var p = {
    id: 'PT' + String(Date.now()).slice(-8) + partidos().length,
    temporada: datos.temporada,
    fecha: datos.fecha,
    rival: datos.rival || 'A definir',
    condicion: datos.condicion || 'local',       /* local | visitante */
    competencia: datos.competencia || 'Liga',
    duracion: +datos.duracion || 90,
    estado: 'programado',                        /* programado | jugado */
    citados: [],
    minutos: {},        /* pid -> {titular, entra, sale} */
    goles_a_favor: null,
    goles_en_contra: null
  };
  BASE.partidos.push(p);
  guardar('kine/partidos/' + p.id, p);
  return p;
}

function proximoPartido(temporadaId){
  var r = null;
  partidos(temporadaId).forEach(function(p){
    if(!r && p.fecha >= HOY && p.estado !== 'jugado') r = p;
  });
  return r;
}


/* ── LOS MINUTOS, CALCULADOS ────────────────────────────────────────
   entra: minuto en que empezo a jugar (0 si es titular)
   sale:  minuto en que salio (null si termino el partido)          */
function minutosEnPartido(P, pid){
  if(!P || !P.minutos || !P.minutos[pid]) return 0;
  var m = P.minutos[pid];
  if(m.entra === null || m.entra === undefined) return 0;   /* no jugo */
  var fin = (m.sale === null || m.sale === undefined) ? (P.duracion || 90) : m.sale;
  return Math.max(0, fin - m.entra);
}

function jugo(P, pid){
  return minutosEnPartido(P, pid) > 0
      || (P.minutos && P.minutos[pid] && P.minutos[pid].entra === 0);
}

function enCancha(P, pid){
  if(!P.minutos || !P.minutos[pid]) return false;
  var m = P.minutos[pid];
  return (m.entra !== null && m.entra !== undefined)
      && (m.sale === null || m.sale === undefined);
}

function titulares(P){
  return lista(P.citados).filter(function(pid){
    return P.minutos && P.minutos[pid] && P.minutos[pid].titular;
  });
}


/* ── EL ACUMULADO DE CADA JUGADOR ───────────────────────────────────
   Nunca se guarda: se calcula. Un acumulado guardado se desincroniza el
   dia que se corrige un partido viejo, y nadie se entera.            */
function acumuladoDe(pid, temporadaId){
  var r = {minutos:0, partidos:0, titular:0, suplente:0, citado:0,
           lesiones:0, promedio:0, ultimos:[]};
  partidos(temporadaId).forEach(function(P){
    if(P.estado !== 'jugado') return;
    if(lista(P.citados).indexOf(pid) >= 0) r.citado++;
    var m = minutosEnPartido(P, pid);
    if(m > 0 || (P.minutos[pid] && P.minutos[pid].entra === 0)){
      r.partidos++;
      r.minutos += m;
      if(P.minutos[pid].titular) r.titular++; else r.suplente++;
      r.ultimos.push({fecha:P.fecha, rival:P.rival, minutos:m});
    }
    lista(P.lesiones).forEach(function(L){ if(L.pid === pid) r.lesiones++; });
  });
  r.promedio = r.partidos ? Math.round(r.minutos / r.partidos) : 0;
  r.ultimos = r.ultimos.slice(-5).reverse();
  return r;
}


/* ── EN QUE MINUTO SE LESIONAN ──────────────────────────────────────
   El dato que casi ningun club tiene. Si las lesiones se concentran en
   el ultimo cuarto, el problema es la condicion fisica y se puede
   trabajar. Si estan repartidas, es otra cosa.                      */
function lesionesDeTemporada(temporadaId){
  var r = [];
  partidos(temporadaId).forEach(function(P){
    lista(P.lesiones).forEach(function(L){
      r.push({partido:P.id, fecha:P.fecha, rival:P.rival, minuto:L.minuto,
              pid:L.pid, zona:L.zona, nota:L.nota, lesion_id:L.lesion_id});
    });
  });
  return r.sort(function(a, b){ return a.fecha < b.fecha ? -1 : 1; });
}

function lesionesPorTramo(temporadaId){
  var tramos = [{de:0, a:15, n:0}, {de:15, a:30, n:0}, {de:30, a:45, n:0},
                {de:45, a:60, n:0}, {de:60, a:75, n:0}, {de:75, a:90, n:0}];
  lesionesDeTemporada(temporadaId).forEach(function(L){
    for(var i = 0; i < tramos.length; i++){
      if(L.minuto >= tramos[i].de && L.minuto < tramos[i].a){ tramos[i].n++; break; }
      if(i === tramos.length - 1 && L.minuto >= 90) tramos[i].n++;
    }
  });
  return tramos;
}

/* Cuanto carga lleva el plantel: sirve para ver quien esta al limite. */
function cargaDelPlantel(T){
  if(!T) return [];
  return planteDe(T).map(function(p){
    var a = acumuladoDe(p.id, T.id);
    return {p:p, a:a};
  }).sort(function(x, y){ return y.a.minutos - x.a.minutos; });
}
