/* ══════════════════════════════════════════════════════════════════════
   SW — el que hace que el portal ande sin internet

   El estudio suele tener mala señal (subsuelo, gimnasio, vestuario).
   Sin esto, el kinesiólogo abre la app en el medio de una sesión y ve
   una pantalla en blanco.

   Estrategia: las pantallas y estilos se guardan al instalar y se sirven
   desde el teléfono. Firebase maneja sus propios datos aparte y ya sabe
   trabajar sin conexión.

   IMPORTANTE: cada vez que se toca una pantalla hay que subir el número
   de VERSION. Si no, el navegador sigue mostrando la copia vieja y vas a
   volverte loco preguntándote por qué no se ve el cambio.
   ══════════════════════════════════════════════════════════════════════ */

var VERSION = 'estudio-v35';

var ARCHIVOS = [
  'index.html',
  'panel.html',
  'agenda.html',
  'lesiones.html',
  'pizarron.html',
  'ejercicios.html',
  'mi.html',
  'diario.html',
  'pacientes.html',
  'alta.html',
  'cartel.html',
  'historia.html',
  'caja.html',
  'programa.html',
  'perfil.html',
  'css/tema.css',
  'css/estudio.css',
  'js/datos.js',
  'js/plantillas.js',
  'js/qr.js',
  'js/historia.js',
  'js/dinero.js',
  'js/atender.js',
  'js/base.js',
  'js/ayuda.js',
  'manifest.json',
  'img/icono-192.png',
  'img/icono-512.png'
];

/* Safari rechaza cualquier respuesta que el service worker devuelva si esa
   respuesta vino de una redirección: falla con "Response served by service
   worker has redirections" y la página no abre. Chrome lo tolera; Safari no.

   Por eso toda respuesta se vuelve a armar antes de guardarla o devolverla:
   mismo contenido, misma cabecera, sin la marca de redirección.            */
function limpiar(r){
  if(!r || !r.redirected) return Promise.resolve(r);
  return r.blob().then(function(b){
    return new Response(b, {status:r.status, statusText:r.statusText, headers:r.headers});
  });
}

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(VERSION).then(function(c){
      return Promise.all(ARCHIVOS.map(function(u){
        return fetch(u, {cache:'reload'})
          .then(limpiar)
          .then(function(r){ if(r && r.ok) return c.put(u, r); })
          .catch(function(){});          /* si uno falla, el resto se guarda igual */
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

/* Al activar una versión nueva se borran las viejas, para que no queden
   dos copias del portal peleándose. */
self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(claves){
      return Promise.all(claves.map(function(k){
        if(k !== VERSION) return caches.delete(k);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var url = e.request.url;

  /* Firebase y las tipografías se piden siempre a la red: los datos
     tienen que estar frescos y Firebase ya guarda lo suyo. */
  if(url.indexOf('firebaseio') > -1 || url.indexOf('googleapis') > -1
     || url.indexOf('gstatic') > -1 || e.request.method !== 'GET'){
    return;
  }

  e.respondWith(
    caches.match(e.request).then(function(guardado){
      if(guardado) return limpiar(guardado);
      return fetch(e.request).then(limpiar).catch(function(){
        return caches.match('index.html').then(limpiar);
      });
    })
  );
});

/* huella: 08adae199279 */
