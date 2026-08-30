/* ══════════════════════════════════════════════════════════════════════
   ATENDER — todo lo de una sesión, en un solo lugar

   Antes, atender a una persona eran diez pasos repartidos en tres
   pantallas: abrir la ficha, cargar la sesión, ir a la agenda a marcar
   que vino, ir a programas a ajustarle los ejercicios, volver a la
   agenda a darle el próximo turno.

   El kinesiólogo hace eso quince veces por día. Diez pasos por quince
   pacientes son ciento cincuenta navegaciones diarias.

   Acá es uno: se toca el turno y se hace todo en la misma pantalla, en
   el orden en que pasan las cosas de verdad. Al confirmar, en una sola
   acción se marca la asistencia, se descuenta el crédito, se cobra si
   corresponde, se asienta en la historia clínica y se deja el próximo
   turno reservado.
   ══════════════════════════════════════════════════════════════════════ */

var AT = null;

function atender(dia, hora){
  var t = null;
  (BASE.agenda[dia] || []).forEach(function(x){ if(x.h === hora) t = x; });
  if(!t) return;

  /* Turnos viejos guardados antes de que existiera el padron traen el
     dorsal pero no el id de paciente. Se busca por dorsal en vez de no
     hacer nada: el kinesiologo tocaba el turno y no pasaba NADA, sin
     ningun aviso, que es la peor forma de fallar. */
  if(!t.pid && t.dorsal){
    var pd = pacientePorDorsal(t.dorsal);
    if(pd) t.pid = pd.id;
  }
  if(!t.pid){
    alert('Este turno no tiene paciente asignado. Asignaselo desde la Agenda.');
    return;
  }

  var p = paciente(t.pid);
  var L = null;
  BASE.lesiones.forEach(function(x){
    if(x.pid === t.pid && x.estado === 'activa') L = x;
  });

  AT = {dia:dia, hora:hora, turno:t, p:p, L:L,
        vino:true, tipo:t.tipo || 'Tratamiento',
        pre:null, post:null, nota:'', proximo:null, paso:1};
  pintarAtender();
}

function pintarAtender(){
  cerrarAtender(true);
  var caja = document.createElement('div');
  caja.className = 'ayuda-fondo';
  caja.id = 'cajaAtender';
  caja.innerHTML = '<div class="ayuda-caja"><div id="cuerpoAtender"></div></div>';
  caja.addEventListener('click', function(e){ if(e.target === caja) cerrarAtender(); });
  document.body.appendChild(caja);
  document.body.style.overflow = 'hidden';
  cuerpoAtender();
}

function cuerpoAtender(){
  var p = AT.p, L = AT.L, pl = planDe(p), av = avisoCreditos(p);

  var libres = (BASE.agenda[proximoDia()] || []).filter(function(x){ return !x.pid && !x.dorsal; });

  document.getElementById('cuerpoAtender').innerHTML =
    '<button class="cerrar" onclick="cerrarAtender()" aria-label="Cerrar">&times;</button>'
    + '<span class="eti">' + AT.hora + ' · ' + fechaLarga(AT.dia) + '</span>'
    + '<h2>' + p.nombre + '</h2>'
    + '<p>' + (L ? L.diagnostico + ' · fase ' + L.fase + ', ' + FASES[L.fase-1].t.toLowerCase()
                 : 'Sin lesión abierta') + '</p>'

    /* 1. vino o no vino */
    + '<label class="campo"><span class="eti">¿Vino?</span>'
    + '<div class="pestanias" id="atVino" style="margin-bottom:0">'
    + '<button class="pest' + (AT.vino ? ' on' : '') + '" data-v="1">Sí, vino</button>'
    + '<button class="pest rojo' + (AT.vino ? '' : ' on') + '" data-v="0">Faltó</button>'
    + '</div></label>'

    + (AT.vino ? bloqueSesion() : bloqueAusente())

    /* estado del plan, siempre a la vista */
    + (av ? '<div class="nota ' + (av.nivel === 'reserva' ? 'reserva'
            : av.nivel === 'aviso' ? 'aviso' : 'bien') + '">' + av.txt
            + (pl.sesiones === 1 && pl.precio ? ' Paga por sesión: se cobra ' + plata(pl.precio) + '.' : '')
            + '</div>'
          : '')

    /* próximo turno, en la misma pantalla */
    + '<label class="campo"><span class="eti">Próximo turno — ' + fechaLarga(proximoDia()) + '</span>'
    + (libres.length
        ? '<div class="pestanias" id="atProx" style="margin-bottom:0">'
          + '<button class="pest' + (AT.proximo === null ? ' on' : '') + '" data-h="">Ahora no</button>'
          + libres.slice(0, 6).map(function(x){
              return '<button class="pest' + (AT.proximo === x.h ? ' on' : '') + '" data-h="'
                   + x.h + '">' + x.h + '</button>';
            }).join('') + '</div>'
        : '<p style="color:var(--tinta3);font-size:14px">No quedan horarios libres ese día.</p>')
    + '</label>'

    + '<div id="atAviso"></div>'
    + '<button class="bt ancho" onclick="confirmarAtencion()">' + textoBoton() + '</button>'
    + (L ? '<button class="bt neutro ancho" style="margin-top:8px" '
         + 'onclick="cerrarAtender();irA(\'programa.html?p=' + p.id + '\')">'
         + 'Cambiarle los ejercicios</button>' : '');

  document.querySelectorAll('#atVino .pest').forEach(function(b){
    b.onclick = function(){ AT.vino = b.dataset.v === '1'; cuerpoAtender(); };
  });
  document.querySelectorAll('#atProx .pest').forEach(function(b){
    b.onclick = function(){ AT.proximo = b.dataset.h || null; cuerpoAtender(); };
  });
  if(AT.vino){
    escala(document.getElementById('atPre'),  function(v){ AT.pre = v; }, AT.pre);
    escala(document.getElementById('atPost'), function(v){ AT.post = v; }, AT.post);
    var n = document.getElementById('atNota');
    if(n){ n.value = AT.nota; n.oninput = function(){ AT.nota = n.value; }; }
    document.querySelectorAll('#atTipo .pest').forEach(function(b){
      b.onclick = function(){
        document.querySelectorAll('#atTipo .pest').forEach(function(x){ x.classList.remove('on'); });
        b.classList.add('on'); AT.tipo = b.dataset.t;
      };
    });
  }
}

function bloqueSesion(){
  return '<label class="campo"><span class="eti">Qué tipo de sesión</span>'
    + '<div class="pestanias" id="atTipo" style="margin-bottom:0">'
    + ['Evaluación','Tratamiento','Gimnasio','Campo'].map(function(t){
        return '<button class="pest' + (t === AT.tipo ? ' on' : '') + '" data-t="' + t + '">' + t + '</button>';
      }).join('') + '</div></label>'
    + '<label class="campo"><span class="eti">Dolor al llegar</span><div id="atPre"></div></label>'
    + '<label class="campo"><span class="eti">Dolor al terminar</span><div id="atPost"></div></label>'
    + '<label class="campo"><span class="eti">Qué se hizo (opcional)</span>'
    + '<textarea id="atNota" placeholder="Movilidad articular, isométricos..."></textarea></label>';
}

function bloqueAusente(){
  return '<div class="nota aviso">No se le descuenta la sesión ni se cobra. '
    + 'Queda contado en el porcentaje de ausencias del mes.</div>';
}

function textoBoton(){
  if(!AT.vino) return 'Marcar que faltó';
  var n = 2 + (AT.proximo ? 1 : 0);
  return 'Confirmar (' + n + ' cosas de una)';
}

function proximoDia(){
  var d = Object.keys(BASE.agenda).filter(function(x){ return x > AT.dia; }).sort();
  return d.length ? d[0] : AT.dia;
}

function confirmarAtencion(){
  var t = AT.turno, p = AT.p, L = AT.L;

  if(!AT.vino){
    t.estado = 'ausente';
    guardar('kine/agenda/turnos/' + AT.dia + '/' + AT.hora + '/estado', 'ausente');
    asentar(p.id, 'turno', 'No se presentó al turno del ' + fechaLarga(AT.dia) + ' a las ' + AT.hora + '.');
    cerrarAtender(); recargarPantalla();
    return;
  }

  if(AT.pre === null || AT.post === null){
    document.getElementById('atAviso').innerHTML =
      '<div class="nota aviso">Marcá el dolor al llegar y al terminar. '
      + 'La diferencia entre los dos es el dato que sirve.</div>';
    return;
  }

  /* 1. la asistencia */
  t.estado = 'atendido';
  guardar('kine/agenda/turnos/' + AT.dia + '/' + AT.hora + '/estado', 'atendido');

  /* 2. la plata */
  var pl = planDe(p);
  consumirCredito(p.id);
  if(pl.sesiones === 1 && pl.precio > 0){
    anotarMovimiento({tipo:'ingreso', concepto:'Sesión — ' + p.nombre,
                      monto:pl.precio, pid:p.id, categoria:'sesiones'});
  }

  /* 3. la sesión en la ficha y en la historia clínica */
  var nota = (AT.nota || '').trim() || '—';
  if(L){
    L.sesiones.unshift({f:AT.dia, t:AT.tipo, pre:AT.pre, post:AT.post, nota:nota});
    guardar('kine/sesiones/' + L.id + '/' + AT.dia, {
      dorsal:p.dorsal, fecha:AT.dia, tipo:AT.tipo,
      dolor_pre:AT.pre, dolor_post:AT.post, notas:nota, fase:L.fase});
  }
  asentar(p.id, 'sesion', AT.tipo + '. Dolor al llegar ' + AT.pre + '/10, al terminar '
    + AT.post + '/10.' + (L ? ' Fase ' + L.fase + '.' : '') + ' ' + nota);

  if(p.estado === 'pendiente'){
    p.estado = 'activo';
    guardar('kine/pacientes/' + p.id + '/estado', 'activo');
  }

  /* 4. el próximo turno */
  if(AT.proximo){
    var d2 = proximoDia();
    (BASE.agenda[d2] || []).forEach(function(x){
      if(x.h === AT.proximo){
        x.pid = p.id; x.dorsal = p.dorsal || null;
        x.tipo = AT.tipo; x.estado = 'reservado';
        guardar('kine/agenda/turnos/' + d2 + '/' + x.h,
                {pid:p.id, dorsal:x.dorsal, tipo:x.tipo, estado:'reservado'});
        asentar(p.id, 'turno', 'Próximo turno para el ' + fechaLarga(d2) + ' a las ' + x.h + '.');
      }
    });
  }

  cerrarAtender();
  recargarPantalla();
}

function cerrarAtender(silencioso){
  var c = document.getElementById('cajaAtender');
  if(c) c.remove();
  if(!silencioso) document.body.style.overflow = '';
}

/* Cada pantalla define su propio pintar(); esto la refresca sin recargar. */
function recargarPantalla(){
  if(typeof pintar === 'function') pintar();
}
