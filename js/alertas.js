/* ══════════════════════════════════════════════════════════════════════
   ALERTAS — que el kinesiologo se entere antes de que se lo cuenten

   El portal ya recoge tres cosas todos los dias: el dolor en cada sesion,
   si el paciente hizo o no sus ejercicios, y las cinco preguntas de como
   se siente. Hasta ahora nadie las cruzaba: quedaban en tres pantallas
   distintas y habia que acordarse de mirarlas.

   Esto las cruza y avisa solo. Es la diferencia entre una herramienta y
   una planilla de asistencia.

   Cada regla dice tambien QUE HACER, no solo que algo anda mal. Una
   alerta sin accion es ruido.
   ══════════════════════════════════════════════════════════════════════ */

function adherenciaDe(pid, dias){
  var reg = (BASE.adherencia || {})[pid] || {};
  var fechas = Object.keys(reg).sort().slice(-(dias || 7));
  if(!fechas.length) return null;
  var hechos = 0, total = 0;
  fechas.forEach(function(f){
    var d = reg[f];
    if(d && d.hechos){
      for(var k in d.hechos){ total++; if(d.hechos[k]) hechos++; }
    }
  });
  return total ? Math.round(hechos * 100 / total) : null;
}

function ultimoRegistro(pid){
  var reg = (BASE.adherencia || {})[pid] || {};
  var f = Object.keys(reg).sort();
  return f.length ? f[f.length - 1] : null;
}

function diasDesde(fecha){
  if(!fecha) return 999;
  return Math.max(0, Math.round((new Date(HOY) - new Date(fecha)) / 86400000));
}

/* ── LAS REGLAS ─────────────────────────────────────────────────────
   Cada una: cuando salta, que tan grave es, y que hacer.             */
function alertas(){
  var lista = [];

  sanearTodasLasLesiones().forEach(function(L){
    if(L.estado !== 'activa') return;
    var p = L.pid ? paciente(L.pid) : null;
    if(!p) return;
    var nom = p.nombre;

    /* 1. El dolor sube tres sesiones seguidas. Es la señal mas clara de
          que la carga esta mal puesta. */
    var s = (L.sesiones || []).slice(0, 3);
    if(s.length === 3 && s[0].post > s[1].post && s[1].post > s[2].post){
      lista.push({nivel:'alto', pid:p.id, quien:nom,
        que: 'El dolor le sube hace tres sesiones (' + s[2].post + ' → ' + s[1].post + ' → ' + s[0].post + ').',
        hacer: 'Bajarle la carga y revisar el programa antes de seguir.'});
    }

    /* 2. Termina peor de lo que llega, dos veces seguidas. La sesion le
          esta haciendo mal. */
    var peor = (L.sesiones || []).slice(0, 2).filter(function(x){ return x.post > x.pre; });
    if(peor.length === 2){
      lista.push({nivel:'alto', pid:p.id, quien:nom,
        que: 'Las últimas dos sesiones lo dejaron peor de como llegó.',
        hacer: 'Revisar qué se está haciendo en sesión: la carga es excesiva.'});
    }

    /* 3. No esta haciendo los ejercicios. Ahi se pierde la mitad de las
          recuperaciones, y no se ve en el consultorio. */
    var ad = adherenciaDe(p.id, 7);
    if(ad !== null && ad < 50){
      lista.push({nivel:'medio', pid:p.id, quien:nom,
        que: 'Hizo el ' + ad + '% de sus ejercicios esta semana.',
        hacer: 'Preguntarle por qué. Suele ser que son demasiados o que no entendió alguno.'});
    }

    /* 4. Dejo de registrar. Se esta soltando del tratamiento. */
    var ult = ultimoRegistro(p.id), d = diasDesde(ult);
    if(ult && d >= 5){
      lista.push({nivel:'medio', pid:p.id, quien:nom,
        que: 'Hace ' + d + ' días que no registra nada.',
        hacer: 'Escribirle antes de que abandone.'});
    }

    /* 5. Cumplio todos los criterios y sigue en la misma fase. */
    var faltan = (L.criterios || []).filter(function(c){ return !c.ok; }).length;
    if(L.criterios && L.criterios.length && faltan === 0 && L.fase < 5){
      lista.push({nivel:'bueno', pid:p.id, quien:nom,
        que: 'Cumplió todos los criterios de la fase ' + L.fase + '.',
        hacer: 'Pasarlo a la fase ' + (L.fase + 1) + '.'});
    }

    /* 6. Se paso de la fecha estimada de alta. */
    if(L.alta && new Date(HOY) > new Date(L.alta)){
      lista.push({nivel:'medio', pid:p.id, quien:nom,
        que: 'Pasó la fecha estimada de alta (' + fechaCorta(L.alta) + ') y sigue en fase ' + L.fase + '.',
        hacer: 'Reestimar la fecha y avisarle al entrenador.'});
    }
  });

  /* 7. Mensajes sin responder. */
  BASE.pacientes.forEach(function(p){
    var n = mensajes ? sinLeer(p.id) : 0;
    if(n) lista.push({nivel:'alto', pid:p.id, quien:p.nombre,
      que: 'Te escribió y no le respondiste (' + n + (n > 1 ? ' mensajes' : ' mensaje') + ').',
      hacer: 'Responderle: dijimos que se contesta antes del próximo turno.'});
  });

  /* 8. Se dio de alta y nadie lo atendio todavia. */
  BASE.pacientes.forEach(function(p){
    if(p.estado === 'pendiente' && diasDesde(p.alta) >= 2){
      lista.push({nivel:'medio', pid:p.id, quien:p.nombre,
        que: 'Se dio de alta hace ' + diasDesde(p.alta) + ' días y todavía no lo atendiste.',
        hacer: 'Darle un turno.'});
    }
  });

  /* 9. Se queda sin sesiones del plan. */
  BASE.pacientes.forEach(function(p){
    if(typeof avisoCreditos !== 'function') return;
    var a = avisoCreditos(p);
    if(a && a.nivel === 'reserva'){
      lista.push({nivel:'medio', pid:p.id, quien:p.nombre,
        que: 'Se quedó sin sesiones del plan.',
        hacer: 'Renovárselo antes del próximo turno.'});
    }
  });

  var orden = {alto:0, medio:1, bueno:2};
  return lista.sort(function(a, b){ return orden[a.nivel] - orden[b.nivel]; });
}

function alertasHTML(){
  var l = alertas();
  if(!l.length){
    return '<div class="vacio" style="padding:26px"><b>Nada que mirar hoy</b>'
      + 'Ningún paciente muestra señales que necesiten atención.</div>';
  }
  return l.map(function(a){
    var pin = a.nivel === 'alto' ? 'ausente' : a.nivel === 'medio' ? 'limitado' : 'atendido';
    return '<button class="fila" style="align-items:flex-start" '
      + 'onclick="irA(\'pacientes.html\')">'
      + '<span class="pin ' + pin + '" style="margin-top:2px">'
      + (a.nivel === 'alto' ? 'urgente' : a.nivel === 'medio' ? 'mirar' : 'bien') + '</span>'
      + '<span class="cu"><b>' + a.quien + '</b>'
      + '<small>' + a.que + '</small>'
      + '<small style="color:var(--acc-texto)">→ ' + a.hacer + '</small></span></button>';
  }).join('');
}
