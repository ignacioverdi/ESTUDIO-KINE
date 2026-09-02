/* ══════════════════════════════════════════════════════════════════════
   ESTUDIOS COMPLEMENTARIOS

   La ecografia, la resonancia, la radiografia. Van pegados a la historia
   clinica del paciente, que es donde corresponde: son parte de la
   actuacion profesional y la ley los cuenta como tal.

   EL PROBLEMA DEL PESO, Y COMO SE RESUELVE
   -----------------------------------------
   Una resonancia en PDF pesa entre 5 y 60 megas. Guardar eso adentro de
   la base es un problema serio: la base cobra por lo que se guarda y por
   lo que se transfiere, y cada vez que alguien abre la ficha se lo baja
   entero. Con veinte pacientes el portal se vuelve lento y caro.

   Por eso hay tres caminos, y el portal elige el mejor solo:

   1. FOTO DEL ESTUDIO (lo mas comun y lo mejor)
      Se saca una foto con el celular o se recorta la imagen que importa.
      Se achica a 1600 pixeles y queda en unos 300 kilos. Se guarda
      adentro y se ve al instante, sin depender de nada.

   2. PDF CHICO (menos de 2 megas)
      Se guarda igual. Sirve para informes de texto, que pesan poco.

   3. PDF GRANDE
      No se guarda: se avisa y se ofrece pegar un enlace. El archivo vive
      donde ya esta (el sitio del centro de imagenes, un Drive) y el
      portal guarda la direccion.

   La foto suele ser MEJOR que el PDF: el kinesiologo mira una o dos
   imagenes concretas, no las trescientas cortes de la resonancia.
   ══════════════════════════════════════════════════════════════════════ */

var TOPE_PDF = 2 * 1024 * 1024;      /* 2 megas */
var LADO_IMAGEN = 1600;              /* suficiente para leer una ecografia */

var TIPOS_ESTUDIO = ['Ecografía', 'Resonancia', 'Radiografía', 'Tomografía',
                     'Informe médico', 'Otro'];

function estudiosDe(pid){
  if(!BASE.estudios) BASE.estudios = {};
  return BASE.estudios[pid] || [];
}

function guardarEstudio(pid, est){
  if(!BASE.estudios) BASE.estudios = {};
  if(!BASE.estudios[pid]) BASE.estudios[pid] = [];
  est.id = 'E' + String(Date.now()).slice(-8) + BASE.estudios[pid].length;
  est.cargado = HOY;
  est.por = (rol() === 'kine') ? 'el kinesiólogo' : 'el paciente';
  BASE.estudios[pid].push(est);
  guardar('kine/estudios/' + pid + '/' + est.id, est);

  /* Queda asentado en la historia clinica: es parte de la actuacion. */
  if(typeof asentar === 'function'){
    asentar(pid, 'nota', 'Se incorporó un estudio complementario: ' + est.tipo
      + (est.fecha ? ' del ' + fechaLarga(est.fecha) : '')
      + (est.nota ? '. ' + est.nota : '.'));
  }
  return est;
}

function borrarEstudio(pid, id){
  if(!BASE.estudios || !BASE.estudios[pid]) return;
  var quitado = null;
  BASE.estudios[pid] = BASE.estudios[pid].filter(function(e){
    if(e.id === id){ quitado = e; return false; }
    return true;
  });
  guardar('kine/estudios/' + pid + '/' + id, null);
  if(quitado && typeof asentar === 'function'){
    /* No se borra el asiento anterior: se agrega uno nuevo. La historia
       clinica no se edita hacia atras. */
    asentar(pid, 'rectificacion', 'Se quitó el estudio "' + quitado.tipo
      + '" cargado el ' + fechaLarga(quitado.cargado) + '.');
  }
}

function pesoLegible(bytes){
  if(!bytes) return '';
  if(bytes < 1024 * 1024) return Math.round(bytes / 1024) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}


/* ── Preparar el archivo ──────────────────────────────────────────────
   Devuelve, por la funcion de respuesta, un objeto listo para guardar o
   un motivo por el que no se puede.                                    */
function prepararEstudio(archivo, listo){
  if(!archivo) return listo(null, 'No se eligió ningún archivo.');

  var esImagen = /^image\//.test(archivo.type);
  var esPDF = archivo.type === 'application/pdf' || /\.pdf$/i.test(archivo.name);

  if(esImagen){
    var lector = new FileReader();
    lector.onload = function(ev){
      var img = new Image();
      img.onload = function(){
        var esc = Math.min(1, LADO_IMAGEN / Math.max(img.width, img.height));
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * esc);
        c.height = Math.round(img.height * esc);
        var x = c.getContext('2d');
        /* Fondo negro: las ecografias y resonancias vienen sobre negro y
           si el archivo tiene transparencia queda blanco y no se ve. */
        x.fillStyle = '#000';
        x.fillRect(0, 0, c.width, c.height);
        x.drawImage(img, 0, 0, c.width, c.height);
        var dato = c.toDataURL('image/jpeg', 0.85);
        listo({formato:'imagen', dato:dato, nombre:archivo.name,
               peso: Math.round(dato.length * 0.75)});
      };
      img.onerror = function(){ listo(null, 'No se pudo leer esa imagen.'); };
      img.src = ev.target.result;
    };
    lector.onerror = function(){ listo(null, 'No se pudo leer el archivo.'); };
    lector.readAsDataURL(archivo);
    return;
  }

  if(esPDF){
    if(archivo.size > TOPE_PDF){
      return listo(null, 'PESADO:' + pesoLegible(archivo.size));
    }
    var l2 = new FileReader();
    l2.onload = function(ev){
      listo({formato:'pdf', dato:ev.target.result, nombre:archivo.name,
             peso:archivo.size});
    };
    l2.onerror = function(){ listo(null, 'No se pudo leer el archivo.'); };
    l2.readAsDataURL(archivo);
    return;
  }

  listo(null, 'Ese tipo de archivo no se puede cargar. Sirven imágenes (foto del '
    + 'estudio) o archivos PDF.');
}


/* ── Verlo ────────────────────────────────────────────────────────── */
function abrirEstudio(pid, id){
  var e = null;
  estudiosDe(pid).forEach(function(x){ if(x.id === id) e = x; });
  if(!e) return;

  var visor;
  if(e.formato === 'imagen'){
    visor = '<img src="' + e.dato + '" alt="' + e.tipo + '" '
          + 'style="width:100%;border-radius:var(--r);background:var(--negro);display:block">';
  }else if(e.formato === 'pdf'){
    visor = '<iframe src="' + e.dato + '" style="width:100%;height:60vh;border:0;'
          + 'border-radius:var(--r);background:#fff"></iframe>';
  }else{
    visor = '<a class="bt ancho" href="' + e.enlace + '" target="_blank" rel="noopener" '
          + 'style="text-decoration:none;text-align:center">Abrir el estudio</a>'
          + '<p style="font-size:13px;color:var(--tinta3);margin-top:10px;overflow-wrap:anywhere">'
          + e.enlace + '</p>';
  }

  var caja = document.createElement('div');
  caja.className = 'ayuda-fondo';
  caja.id = 'cajaEstudio';
  caja.innerHTML = '<div class="ayuda-caja">'
    + '<button class="cerrar" onclick="cerrarEstudio()" aria-label="Cerrar">&times;</button>'
    + '<span class="eti">Estudio complementario</span>'
    + '<h2>' + e.tipo + '</h2>'
    + '<p>' + (e.fecha ? 'Del ' + fechaLarga(e.fecha) + '. ' : '')
    + 'Cargado el ' + fechaCorta(e.cargado) + ' por ' + e.por + '.</p>'
    + visor
    + (e.nota ? '<div class="nota info" style="margin-top:14px">' + e.nota + '</div>' : '')
    + (e.formato !== 'enlace'
        ? '<a class="bt hueco ancho" style="margin-top:12px" download="'
          + (e.nombre || e.tipo) + '" href="' + e.dato + '">Descargar</a>' : '')
    + '<button class="bt neutro ancho" style="margin-top:8px" onclick="cerrarEstudio()">Cerrar</button>'
    + '</div>';
  caja.addEventListener('click', function(ev){ if(ev.target === caja) cerrarEstudio(); });
  document.body.appendChild(caja);
  document.body.style.overflow = 'hidden';
}

function cerrarEstudio(){
  var c = document.getElementById('cajaEstudio');
  if(c) c.remove();
  document.body.style.overflow = '';
}
