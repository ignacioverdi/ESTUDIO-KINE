/* ══════════════════════════════════════════════════════════════════════
   DINERO — los planes, los créditos y la caja del estudio

   Es la parte que no existía y sin la cual el portal no sirve para vivir
   de esto. Tres cosas:

   PLANES     cómo paga cada paciente
   CREDITOS   las sesiones que le quedan, que se descuentan solas
   CAJA       lo que entra y lo que sale

   La decisión importante: el crédito se descuenta cuando la sesión se
   marca como ATENDIDA, no cuando se reserva el turno. Si se descontara al
   reservar, una cancelación a tiempo le comería una sesión al paciente y
   el estudio quedaría discutiendo por WhatsApp.
   ══════════════════════════════════════════════════════════════════════ */

var PLANES = {
  club:   {nombre:'Plantel del club', sesiones:0,  precio:0,
           detalle:'Lo cubre el club. No se factura por sesión.'},
  sesion: {nombre:'Sesión a sesión',  sesiones:1,  precio:18000,
           detalle:'Paga cada vez que viene.'},
  p10:    {nombre:'Plan de 10',       sesiones:10, precio:150000,
           detalle:'Diez sesiones. Sale más barato que sueltas.'},
  mensual:{nombre:'Mensual libre',    sesiones:99, precio:210000,
           detalle:'Todas las sesiones del mes.'},
  online: {nombre:'Asesoría online',  sesiones:0,  precio:60000,
           detalle:'Rutinas y seguimiento por la app, sin sesiones presenciales.'},
  premium:{nombre:'Premium',          sesiones:99, precio:320000,
           detalle:'App, sesiones libres y atención personalizada.'}
};

function planDe(p){
  return PLANES[p && p.plan ? p.plan : 'sesion'] || PLANES.sesion;
}

function precioSesion(p){
  var pl = planDe(p);
  if(pl.sesiones === 0) return pl.precio;
  return Math.round(pl.precio / pl.sesiones);
}


/* ── LA CAJA ─────────────────────────────────────────────────────── */
function movimientos(){
  if(!BASE.caja) BASE.caja = [];
  return BASE.caja;
}

function anotarMovimiento(m){
  var t = (typeof ahora === 'function') ? ahora() : {fecha:HOY, sello:HOY};
  var mov = {
    id: 'M' + (movimientos().length + 1) + String(Date.now()).slice(-4),
    fecha: m.fecha || t.fecha,
    tipo: m.tipo,                 /* 'ingreso' o 'egreso' */
    concepto: m.concepto,
    monto: Math.round(m.monto),
    pid: m.pid || null,
    metodo: m.metodo || 'efectivo',
    categoria: m.categoria || (m.tipo === 'ingreso' ? 'sesiones' : 'gastos')
  };
  movimientos().push(mov);
  guardar('kine/caja/' + mov.id, mov);
  return mov;
}

function delMes(mes){
  mes = mes || HOY.slice(0, 7);
  return movimientos().filter(function(m){ return m.fecha.slice(0, 7) === mes; });
}

function resumenMes(mes){
  var m = delMes(mes), ing = 0, egr = 0;
  m.forEach(function(x){
    if(x.tipo === 'ingreso') ing += x.monto; else egr += x.monto;
  });
  return {ingresos: ing, egresos: egr, saldo: ing - egr, movimientos: m.length};
}


/* ── CREDITOS ────────────────────────────────────────────────────────
   Se descuenta al ATENDER, no al reservar. Ver la nota de arriba.     */
function venderPlan(pid, clave){
  var p = paciente(pid), pl = PLANES[clave];
  if(!p || !pl) return null;
  p.plan = clave;
  p.creditos = (p.creditos || 0) + pl.sesiones;
  guardar('kine/pacientes/' + pid + '/plan', clave);
  guardar('kine/pacientes/' + pid + '/creditos', p.creditos);
  if(pl.precio > 0){
    anotarMovimiento({tipo:'ingreso', concepto:pl.nombre + ' — ' + p.nombre,
                      monto:pl.precio, pid:pid, categoria:'planes'});
  }
  if(typeof asentar === 'function'){
    asentar(pid, 'nota', 'Se le asignó el plan "' + pl.nombre + '"'
      + (pl.sesiones ? ' con ' + pl.sesiones + ' sesiones.' : '.'));
  }
  return p;
}

function consumirCredito(pid){
  var p = paciente(pid);
  if(!p) return null;
  var pl = planDe(p);
  if(pl.sesiones === 0 || pl.precio === 0) return p;   /* club u online */
  if(pl.sesiones >= 99) return p;                      /* libre: no descuenta */
  p.creditos = Math.max(0, (p.creditos || 0) - 1);
  guardar('kine/pacientes/' + pid + '/creditos', p.creditos);
  return p;
}

function avisoCreditos(p){
  var pl = planDe(p);
  if(pl.sesiones === 0 || pl.sesiones >= 99) return null;
  var c = p.creditos || 0;
  if(c === 0) return {nivel:'reserva', txt:'Sin sesiones. Hay que renovarle el plan.'};
  if(c <= 2)  return {nivel:'aviso',   txt:'Le quedan ' + c + ' sesiones. Conviene avisarle.'};
  return {nivel:'bien', txt:'Le quedan ' + c + ' sesiones.'};
}


/* ── CANCELACIONES ───────────────────────────────────────────────────
   El porcentaje de ausencias es el indicador que más plata mueve en un
   estudio: cada hueco es una hora que no se recupera. Los estudios de
   kinesiología ambulatoria manejan entre 8% y 25%, más alto que otras
   especialidades porque el tratamiento exige sostenerse semanas.      */
function estadisticaTurnos(mes){
  mes = mes || HOY.slice(0, 7);
  var total = 0, atendidos = 0, ausentes = 0, cancelados = 0;
  for(var d in BASE.agenda){
    if(d.slice(0, 7) !== mes) continue;
    BASE.agenda[d].forEach(function(t){
      if(!t.dorsal && !t.pid) return;
      total++;
      if(t.estado === 'atendido')  atendidos++;
      if(t.estado === 'ausente')   ausentes++;
      if(t.estado === 'cancelado') cancelados++;
    });
  }
  return {
    total: total, atendidos: atendidos, ausentes: ausentes, cancelados: cancelados,
    pendientes: total - atendidos - ausentes - cancelados,
    porcentajeAusencia: total ? Math.round((ausentes + cancelados) * 100 / total) : 0
  };
}

function plata(n){
  return '$' + Math.round(n).toLocaleString('es-AR');
}
