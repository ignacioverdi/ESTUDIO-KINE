/* ══════════════════════════════════════════════════════════════════════
   QR — el generador de códigos del estudio

   Está escrito acá, entero, a propósito. Los generadores de QR que se
   usan por internet reciben el enlace que uno quiere codificar: mandarles
   la dirección del portal del estudio es filtrar algo que no hace falta
   filtrar, y encima ata el portal a que ese servicio siga existiendo.

   Esto no depende de nada. Funciona sin internet y va a seguir andando
   dentro de diez años.

   Genera QR modelo 2, modo binario, corrección de errores nivel M
   (recupera hasta el 15% del código dañado, que es lo razonable para un
   cartel pegado en una pared que se ensucia). Versiones 1 a 10, que
   alcanzan para cualquier dirección web normal.
   ══════════════════════════════════════════════════════════════════════ */

/* Cuántos datos entran en cada versión, y cómo se reparten los bloques.
   ec = bytes de corrección por bloque. g1/g2 = grupos de bloques.       */
var QR_VER = {
  1:  {ec:10, g1:1, d1:16},
  2:  {ec:16, g1:1, d1:28},
  3:  {ec:26, g1:1, d1:44},
  4:  {ec:18, g1:2, d1:32},
  5:  {ec:24, g1:2, d1:43},
  6:  {ec:16, g1:4, d1:27},
  7:  {ec:18, g1:4, d1:31},
  8:  {ec:22, g1:2, d1:38, g2:2, d2:39},
  9:  {ec:22, g1:3, d1:36, g2:2, d2:37},
  10: {ec:26, g1:4, d1:43, g2:1, d2:44}
};

var QR_ALINEACION = {
  1:[], 2:[6,18], 3:[6,22], 4:[6,26], 5:[6,30],
  6:[6,34], 7:[6,22,38], 8:[6,24,42], 9:[6,26,46], 10:[6,28,50]
};

/* Los 15 bits de formato para nivel M y cada una de las 8 máscaras. */
var QR_FORMATO = [
  '101010000010010','101000100100101','101111001111100','101101101001011',
  '100010111111001','100000011001110','100111110010111','100101010100000'
];

/* Los 18 bits de versión, solo desde la 7 en adelante. */
var QR_VERSION_BITS = {
  7:'000111110010010100', 8:'001000010110111100',
  9:'001001101010011001', 10:'001010010011010011'
};

/* Aritmética en el campo de Galois 256, que es la que usa la corrección
   de errores Reed-Solomon. */
var QR_EXP = new Array(512), QR_LOG = new Array(256);
(function(){
  var x = 1;
  for(var i = 0; i < 255; i++){
    QR_EXP[i] = x;
    QR_LOG[x] = i;
    x <<= 1;
    if(x & 0x100) x ^= 0x11D;
  }
  for(var j = 255; j < 512; j++) QR_EXP[j] = QR_EXP[j - 255];
})();

function qrMul(a, b){
  if(a === 0 || b === 0) return 0;
  return QR_EXP[QR_LOG[a] + QR_LOG[b]];
}

/* El polinomio generador para n bytes de corrección. */
function qrGenerador(n){
  var p = [1];
  for(var i = 0; i < n; i++){
    var q = [];
    for(var j = 0; j <= p.length; j++){
      var v = 0;
      if(j < p.length) v ^= p[j];
      if(j > 0) v ^= qrMul(p[j-1], QR_EXP[i]);
      q[j] = v;
    }
    p = q;
  }
  return p;
}

function qrCorreccion(datos, n){
  var g = qrGenerador(n);
  var r = datos.slice().concat(new Array(n).fill(0));
  for(var i = 0; i < datos.length; i++){
    var c = r[i];
    if(c === 0) continue;
    for(var j = 0; j < g.length; j++) r[i+j] ^= qrMul(g[j], c);
  }
  return r.slice(datos.length);
}

/* ── Las ocho máscaras que se prueban para elegir la más legible ── */
var QR_MASCARAS = [
  function(f,c){ return (f + c) % 2 === 0; },
  function(f){   return f % 2 === 0; },
  function(f,c){ return c % 3 === 0; },
  function(f,c){ return (f + c) % 3 === 0; },
  function(f,c){ return (Math.floor(f/2) + Math.floor(c/3)) % 2 === 0; },
  function(f,c){ return (f*c) % 2 + (f*c) % 3 === 0; },
  function(f,c){ return ((f*c) % 2 + (f*c) % 3) % 2 === 0; },
  function(f,c){ return ((f+c) % 2 + (f*c) % 3) % 2 === 0; }
];

function qrGenerar(texto){
  var bytes = [];
  for(var i = 0; i < texto.length; i++){
    var c = texto.charCodeAt(i);
    if(c < 128) bytes.push(c);
    else if(c < 2048){ bytes.push(192 | (c >> 6), 128 | (c & 63)); }
    else { bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63)); }
  }

  /* La versión más chica en la que entra el texto. */
  var ver = 0;
  for(var v = 1; v <= 10; v++){
    var d = QR_VER[v];
    var cap = d.g1 * d.d1 + (d.g2 || 0) * (d.d2 || 0);
    var cabecera = 4 + (v < 10 ? 8 : 16);
    if(bytes.length + Math.ceil(cabecera/8) <= cap){ ver = v; break; }
  }
  if(!ver) return null;

  var info = QR_VER[ver];
  var totalDatos = info.g1 * info.d1 + (info.g2 || 0) * (info.d2 || 0);

  /* Modo binario (0100), longitud, datos, y relleno hasta llenar. */
  var bits = '0100';
  var largoBits = ver < 10 ? 8 : 16;
  bits += bytes.length.toString(2).padStart(largoBits, '0');
  bytes.forEach(function(b){ bits += b.toString(2).padStart(8, '0'); });
  bits += '0000';
  bits = bits.slice(0, totalDatos * 8);
  while(bits.length % 8) bits += '0';

  var cw = [];
  for(var k = 0; k < bits.length; k += 8) cw.push(parseInt(bits.substr(k, 8), 2));
  var relleno = [236, 17], r = 0;
  while(cw.length < totalDatos) cw.push(relleno[r++ % 2]);

  /* Partir en bloques, calcular corrección, y entrelazar. */
  var bloques = [], ecs = [], pos = 0;
  for(var g = 0; g < info.g1; g++){
    var b = cw.slice(pos, pos + info.d1); pos += info.d1;
    bloques.push(b); ecs.push(qrCorreccion(b, info.ec));
  }
  for(var g2 = 0; g2 < (info.g2 || 0); g2++){
    var b2 = cw.slice(pos, pos + info.d2); pos += info.d2;
    bloques.push(b2); ecs.push(qrCorreccion(b2, info.ec));
  }

  var final = [];
  var maxD = Math.max.apply(null, bloques.map(function(b){ return b.length; }));
  for(var i2 = 0; i2 < maxD; i2++)
    bloques.forEach(function(b){ if(i2 < b.length) final.push(b[i2]); });
  for(var i3 = 0; i3 < info.ec; i3++)
    ecs.forEach(function(e){ final.push(e[i3]); });

  /* ── Armar la matriz ── */
  var n = 17 + ver * 4;
  var m = [], res = [];
  for(var f = 0; f < n; f++){
    m.push(new Array(n).fill(0));
    res.push(new Array(n).fill(false));
  }

  function poner(f, c, v2b){ m[f][c] = v2b ? 1 : 0; res[f][c] = true; }

  /* Los tres cuadrados de las esquinas, con su margen. */
  [[0,0],[0,n-7],[n-7,0]].forEach(function(p){
    for(var f = -1; f <= 7; f++) for(var c = -1; c <= 7; c++){
      var ff = p[0]+f, cc = p[1]+c;
      if(ff < 0 || cc < 0 || ff >= n || cc >= n) continue;
      var borde = (f >= 0 && f <= 6 && (c === 0 || c === 6))
               || (c >= 0 && c <= 6 && (f === 0 || f === 6));
      var centro = f >= 2 && f <= 4 && c >= 2 && c <= 4;
      poner(ff, cc, borde || centro);
    }
  });

  /* Las líneas de sincronismo. */
  for(var i4 = 8; i4 < n - 8; i4++){
    poner(6, i4, i4 % 2 === 0);
    poner(i4, 6, i4 % 2 === 0);
  }

  /* Los cuadraditos de alineación. */
  var al = QR_ALINEACION[ver];
  al.forEach(function(a){
    al.forEach(function(b){
      if((a === 6 && b === 6) || (a === 6 && b === n-7) || (a === n-7 && b === 6)) return;
      for(var f2 = -2; f2 <= 2; f2++) for(var c2 = -2; c2 <= 2; c2++)
        poner(a+f2, b+c2, Math.max(Math.abs(f2), Math.abs(c2)) !== 1);
    });
  });

  poner(n-8, 8, true);                       /* módulo siempre negro */
  for(var i5 = 0; i5 < 9; i5++){             /* reservar el formato */
    if(i5 !== 6){ res[8][i5] = true; res[i5][8] = true; }
  }
  res[8][6] = true; res[6][8] = true;
  for(var i6 = 0; i6 < 8; i6++){ res[8][n-1-i6] = true; res[n-1-i6][8] = true; }
  if(ver >= 7){
    for(var f3 = 0; f3 < 6; f3++) for(var c3 = 0; c3 < 3; c3++){
      res[f3][n-11+c3] = true; res[n-11+c3][f3] = true;
    }
  }

  /* Volcar los datos en zigzag, de abajo a la derecha hacia arriba. */
  var bitsFinal = '';
  final.forEach(function(b){ bitsFinal += b.toString(2).padStart(8, '0'); });
  var idx = 0, arriba = true;
  for(var col = n - 1; col > 0; col -= 2){
    if(col === 6) col--;
    for(var paso = 0; paso < n; paso++){
      var fila = arriba ? n - 1 - paso : paso;
      for(var d2 = 0; d2 < 2; d2++){
        var cc2 = col - d2;
        if(res[fila][cc2]) continue;
        m[fila][cc2] = (idx < bitsFinal.length && bitsFinal[idx] === '1') ? 1 : 0;
        idx++;
      }
    }
    arriba = !arriba;
  }

  /* Probar las ocho máscaras y quedarse con la que menos penaliza. */
  var mejor = null, mejorP = Infinity;
  for(var mk = 0; mk < 8; mk++){
    var t = m.map(function(f4){ return f4.slice(); });
    for(var f5 = 0; f5 < n; f5++) for(var c5 = 0; c5 < n; c5++)
      if(!res[f5][c5] && QR_MASCARAS[mk](f5, c5)) t[f5][c5] ^= 1;

    var fmt = QR_FORMATO[mk];
    for(var i7 = 0; i7 < 15; i7++){
      var bit = fmt[i7] === '1' ? 1 : 0;
      if(i7 < 6) t[8][i7] = bit;
      else if(i7 === 6) t[8][7] = bit;
      else if(i7 === 7) t[8][8] = bit;
      else if(i7 === 8) t[7][8] = bit;
      else t[14 - i7][8] = bit;

      if(i7 < 8) t[n-1-i7][8] = bit;
      else t[8][n-15+i7] = bit;
    }
    if(ver >= 7){
      var vb = QR_VERSION_BITS[ver];
      for(var i8 = 0; i8 < 18; i8++){
        var b3 = vb[17-i8] === '1' ? 1 : 0;
        t[Math.floor(i8/3)][n-11+(i8%3)] = b3;
        t[n-11+(i8%3)][Math.floor(i8/3)] = b3;
      }
    }
    var p = qrPenalizacion(t, n);
    if(p < mejorP){ mejorP = p; mejor = t; }
  }
  return mejor;
}

/* Las cuatro reglas de penalización del estándar. Sirven para elegir la
   máscara que produce el dibujo más fácil de leer para una cámara. */
function qrPenalizacion(m, n){
  var p = 0, i, j, k;
  for(i = 0; i < n; i++){
    for(var dir = 0; dir < 2; dir++){
      var run = 1;
      for(j = 1; j < n; j++){
        var a = dir ? m[j][i] : m[i][j];
        var b = dir ? m[j-1][i] : m[i][j-1];
        if(a === b) run++;
        else { if(run >= 5) p += 3 + (run - 5); run = 1; }
      }
      if(run >= 5) p += 3 + (run - 5);
    }
  }
  for(i = 0; i < n-1; i++) for(j = 0; j < n-1; j++){
    var v = m[i][j];
    if(v === m[i][j+1] && v === m[i+1][j] && v === m[i+1][j+1]) p += 3;
  }
  var patron = [1,0,1,1,1,0,1,0,0,0,0];
  for(i = 0; i < n; i++) for(j = 0; j <= n - 11; j++){
    var okF = true, okC = true;
    for(k = 0; k < 11; k++){
      if(m[i][j+k] !== patron[k]) okF = false;
      if(m[j+k][i] !== patron[k]) okC = false;
    }
    if(okF) p += 40;
    if(okC) p += 40;
  }
  var negros = 0;
  for(i = 0; i < n; i++) for(j = 0; j < n; j++) negros += m[i][j];
  p += Math.floor(Math.abs(negros * 100 / (n*n) - 50) / 5) * 10;
  return p;
}

/* Dibuja el QR como SVG. El margen blanco alrededor no es decoración:
   sin él muchas cámaras no encuentran el código. */
function qrSVG(texto, opciones){
  var o = opciones || {};
  var m = qrGenerar(texto);
  if(!m) return '<p>El texto es demasiado largo para un código QR.</p>';

  var n = m.length, borde = o.borde === undefined ? 4 : o.borde;
  var total = n + borde * 2;
  var fondo = o.fondo || '#FFFFFF';
  var tinta = o.tinta || '#000000';

  var d = '';
  for(var f = 0; f < n; f++) for(var c = 0; c < n; c++)
    if(m[f][c]) d += 'M' + (c + borde) + ',' + (f + borde) + 'h1v1h-1z';

  return '<svg viewBox="0 0 ' + total + ' ' + total + '" xmlns="http://www.w3.org/2000/svg" '
       + 'style="width:100%;height:auto;display:block;shape-rendering:crispEdges" '
       + 'role="img" aria-label="Código QR">'
       + '<rect width="' + total + '" height="' + total + '" fill="' + fondo + '"/>'
       + '<path d="' + d + '" fill="' + tinta + '"/></svg>';
}
